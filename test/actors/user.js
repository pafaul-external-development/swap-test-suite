const freeton = require('../../src');
const RootContract = require("../../contractWrappers/tip3/rootContract");
const MultisigWallet = require('../../contractWrappers/util/MultiSigWallet');
const Wallet = require('../../contractWrappers/tip3/walletContract');
const { sleep } = require('../../src/utils');
const { rootTIP3TokenAbi } = require('../../config/contracts/abis');
const { abiContract, signerNone } = require('@tonclient/core');
const {
    ZERO_ADDRESS,
    ZERO_PUBKEY,
    MSIG_RECOMMENDED_BALANCE,
    TIP3_RECOMMENDED_BALANCE,
    TOKENS_TO_MINT,
    TWO_CRYSTALS,
    ONE_CRYSTAL,
    HALF_CRYSTAL
} = require('../../config/general/constants');




/**
 * @typedef WalletState
 * @type {Object}
 * 
 * @property {Number} balance
 * @property {Number} tonBalance
 * @property {String} address
 */


/**
 * @typedef WalletsStatesChanging
 * @type {Object}
 * 
 * @property {Record<String, WalletState>} start  Mapping: walletAddress -> WalletState
 * @property {Record<String, WalletState>} finish Mapping: walletAddress -> WalletState
 */




//TODO: Паша: Привести все `tokenAmount` к одному типу (String или Number)

class User {
    /**
     * 
     * @param {Object} keyPair
     * @param {freeton.TonWrapper} tonInstance
     */
    constructor(keyPair, tonInstance) {

        /**
         * @type {Record<String, WalletState>} Mapping: walletAddress -> WalletState
         */
        this.wallets = {};

        this.msig = undefined;
        this.keyPair = keyPair;
        this.pubkey = '0x' + keyPair.public;
        this.tonInstance = tonInstance;
        this.giverContract = new freeton.ContractWrapper(
            this.tonInstance,
            this.tonInstance.giverConfig.abi,
            null,
            this.tonInstance.giverConfig.address,
        );
    }

    /**
     * Create multisig for user
     */
    async createMultisigWallet() {
        this.msig = new MultisigWallet(this.tonInstance, {
            intiParams: {},
            constructorParams: {
                owners: [this.pubkey],
                reqConfirms: 1
            }
        }, this.keyPair);
        await this.msig.deployContract();
    }

    /**
     * Create tip3 wallet for given tip3 token
     * @param {RootContract} tip3Token 
     * @param {String} tokenAmount 
     * 
     * @returns {Promise<WalletState>}
     */
    async createWallet(tip3Token, tokenAmount) {
        let rootTokenAddress = tip3Token.getAddress();
        if (!this.wallets[rootTokenAddress]) {
            console.log('Wallet does not exist');
            let futureAddress = await tip3Token.calculateFutureWalletAddress(
                ZERO_PUBKEY, this.msig.getAddress()
            );
            let walletExists = await this.checkIfAccountExists(futureAddress);
            console.log('Future address calculated');
            this.wallets[rootTokenAddress] = new Wallet(this.tonInstance, {}, this.keyPair);
            this.wallets[rootTokenAddress].setWalletAddress(futureAddress);
            if (!walletExists) {
                console.log('Wallet does not exist');
                let payload = await this.tonInstance.ton.abi.encode_message_body({
                    abi: abiContract(rootTIP3TokenAbi),
                    call_set: {
                        function_name: 'deployEmptyWallet',
                        input: {
                            deploy_grams: freeton.utils.convertCrystal('0.5', 'nano'),
                            wallet_public_key_: ZERO_PUBKEY,
                            owner_address_: this.msig.getAddress(),
                            gas_back_address: ZERO_ADDRESS
                        }
                    },
                    is_internal: true,
                    signer: signerNone()
                });

                await this.msig.transferTo(
                    rootTokenAddress,
                    freeton.utils.convertCrystal('1', 'nano'),
                    payload.body
                );

                while (!walletExists) {
                    walletExists = await this.checkIfAccountExists(futureAddress);
                    await sleep(1000);
                }
                await tip3Token.mintTokensToWallet(
                    this.wallets[rootTokenAddress],
                    tokenAmount
                );
            }
        }
        return this._getWalletState(this.wallets[rootTokenAddress]);
    }

    /**
     * Claim wallet if it exists
     * @param {String} rootTokenAddress address of token root contracts
     */
    async claimWallet(rootTokenAddress, tokensToCheck) {
        let rootTokenContract = await freeton.requireContract(this.tonInstance, 'RootTokenContract', rootTokenAddress);
        let futureAddress = await rootTokenContract.runLocal(
            'getWalletAddress', {
                _answer_id: 0,
                wallet_public_key_: ZERO_PUBKEY,
                owner_address_: this.msig.getAddress()
            }, this.keyPair
        );
        let walletExists = await this.checkIfAccountExists(futureAddress);
        while (!walletExists) {
            await sleep(1000);
            walletExists = await this.checkIfAccountExists(futureAddress);
        }
        this.wallets[rootTokenAddress] = new Wallet(this.tonInstance, {}, this.keyPair);
        this.wallets[rootTokenAddress].setWalletAddress(futureAddress);
    }

    /**
     * Check tip3 wallet balance
     * @param {String} rootTokenAddress 
     * @returns {Promise<Number>} balance of tip3 wallet
     */
    async checkWalletBalance(rootTokenAddress) {
        return await this.wallets[rootTokenAddress].getBalance();
    }

    /**
     * Get wallet state: balance, tonBalance, address
     * @param {Wallet} wallet 
     * @returns {Promise<WalletState>}
     */
    async _getWalletState(wallet) {
        let state = {};
        state['balance'] = await wallet.getBalance();
        state['tonBalance'] = await this.checkAccountBalance(wallet.walletContract.address);
        state['address'] = wallet.walletContract.address;
        return state;
    }


    /**
     * @param {Array<String>} rootAddresses 
     * @returns {Promise< Record<String, WalletState> >}
     */
    async getWalletsStates(rootAddresses) {
        let state = {};
        for (let address of rootAddresses) {
            const st = this.wallets[address] && await this._getWalletState(this.wallets[address]);
            state[address] = st || { balance: 0, tonBalance: 0, address: ZERO_ADDRESS };
        }
        return state;
    }

    /**
     * Check ton balances and deposit tons
     */
    async checkWalletTONBalances() {
        let msigAddress = this.msig.msigContract.address;
        if (await this.checkAccountBalance(msigAddress) < MSIG_RECOMMENDED_BALANCE) {
            await this.sendGiverGrams(msigAddress, MSIG_RECOMMENDED_BALANCE);
        }

        for (let rootContract in this.wallets) {
            let walletAddress = this.wallets[rootContract];
            if (await this.checkAccountBalance(walletAddress) < TIP3_RECOMMENDED_BALANCE) {
                await this.msig.transferTo(
                    walletAddress,
                    TIP3_RECOMMENDED_BALANCE,
                    ''
                );
            }
        }
    }

    /**
     * provide liquidity for swap pair
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} token1Amount
     * @param {Number} token2Amount
     * 
     * @returns {Promise<WalletsStatesChanging>}
     */
    async provideLiquidity(swapPairInstance, token1Amount, token2Amount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2, res.lpTokenRoot];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let provideLiquidityPayload = await swapPairInstance.createProvideLiquidityPayload(initialBalances[res.lpTokenRoot].address);

        await this.msig.transferTo(
            this.wallets[res.tokenRoot1].getAddress(),
            ONE_CRYSTAL,
            await this.createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot1].getAbi(),
                res.tokenWallet1,
                token1Amount,
                HALF_CRYSTAL,
                provideLiquidityPayload
            )
        );

        await this.msig.transferTo(
            this.wallets[res.tokenRoot2].getAddress(),
            ONE_CRYSTAL,
            await this.createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot2].getAbi(),
                res.tokenWallet2,
                token2Amount,
                HALF_CRYSTAL,
                provideLiquidityPayload
            )
        );

        await sleep(2000);

        await this.claimWallet(res.lpTokenRoot, tokensToCheck);

        finalBalances = await this.getWalletsStates(tokensToCheck);

        return {
            start: initialBalances,
            finish: finalBalances
        };
    }

    /**
     * swap tokens with given root contract
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     * @returns {Promise<WalletsStatesChanging>}
     */
    async swapTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let swapPayload = await swapPairInstance.createSwapPayload(this.wallets[res.tokenRoot2].getAddress());

        await this.msig.transferTo(
            this.wallets[res.tokenRoot1].getAddress(),
            ONE_CRYSTAL,
            await this.createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot1].getAbi(),
                res.tokenWallet1,
                tokenAmount,
                HALF_CRYSTAL,
                swapPayload
            )
        );

        await sleep(2000);

        finalBalances = await this.getWalletsStates(tokensToCheck);

        return {
            start: initialBalances,
            finish: finalBalances
        };
    }

    /**
     * withdraw tip3 tokens from swap pair
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     * 
     * @returns {Promise<WalletsStatesChanging>}
     */
    async withdrawTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2, res.lpTokenRoot];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let withdrawPayload = await swapPairInstance.createWithdrawLiquidityPayload(
            res.tokenRoot1, this.wallets[res.tokenRoot1].getAddress(),
            res.tokenRoot2, this.wallets[res.tokenRoot2].getAddress()
        );

        await this.msig.transferTo(
            this.wallets[res.lpTokenRoot].getAddress(),
            TWO_CRYSTALS,
            await this.createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot1].getAbi(),
                res.lpTokenWallet,
                tokenAmount,
                HALF_CRYSTAL,
                withdrawPayload
            )
        );

        await sleep(5000);

        finalBalances = await this.getWalletsStates(tokensToCheck);

        return {
            start: initialBalances,
            finish: finalBalances
        };
    }

    /**
     * Service function to check that user has both wallets of swap pair
     * @param {SwapPairContract} swapPairInstance 
     */
    async checkIfAllWalletsExist(swapPairInstance) {
        let res = await swapPairInstance.getPairInfo();
        if (!this.wallets[res.tokenRoot1] && this.wallets[res.tokenRoot2]) {
            let roots = [res.tokenRoot1, res.tokenRoot2];
            for (let root of roots) {
                await this.createWallet(root, TOKENS_TO_MINT);
            }
        }
        return res;
    }

    /**
     * 
     * @param {Promise<String>} address 
     * @returns {Promise<Boolean>}
     */
    async checkIfAccountExists(address) {
        let res = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: address }
            },
            result: 'acc_type balance'
        });
        return Boolean(res.result[0]) && res.result[0].acc_type != 0;
    }

    /**
     * @param {String} address 
     * @returns {Promise<Number>}
     */
    async checkAccountBalance(address) {
        let res = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: address }
            },
            result: 'acc_type balance'
        });
        return Number(res.result[0].balance);
    }

    async sendGiverGrams(address, amount) {
        return await this.giverContract.run('sendGrams', {
                dest: address,
                amount: amount,
            },
            this.tonWrapper.giverConfig.keyPair
        );
    }

    /**
     * 
     * @param {Object} walletAbi 
     * @param {String} tokenWallet 
     * @param {Number} amount 
     * @param {Number} grams
     * @param {String} payload
     * @returns {Promise<String>} payload for swap operation
     */
    async createPayloadForTIP3Wallet(walletAbi, tokenWallet, amount, grams, payload) {
        const callSet = {
            function_name: 'transfer',
            input: {
                to: tokenWallet,
                tokens: amount,
                grams: grams,
                send_gas_to: ZERO_ADDRESS,
                notify_receiver: true,
                payload: payload
            }
        }
        const encoded_msg = await this.tonInstance.ton.abi.encode_message_body({
            abi: abiContract(walletAbi),
            call_set: callSet,
            is_internal: true,
            signer: {
                type: 'None'
            }
        });
        return encoded_msg.body;
    }

}


module.exports = User;