const freeton = require('../../src');
const RootContract = require("../../contractWrappers/tip3/rootContract");
const MultisigWallet = require('../../contractWrappers/util/MultiSigWallet');
const {
    ZERO_ADDRESS,
    ZERO_PUBKEY,
    MSIG_RECOMMENDED_BALANCE,
    TIP3_RECOMMENDED_BALANCE,
    TOKENS_TO_MINT,
    TWO_CRYSTALS,
    ONE_CRYSTAL,
    HALF_CRYSTAL,
    QUATER_CRYSTAL
} = require('../../config/general/constants');
const Wallet = require('../../contractWrappers/tip3/walletContract');
const { sleep } = require('../../src/utils');

class User {
    /**
     * 
     * @param {String} public
     * @param {String} private
     * @param {freeton.TonWrapper} tonInstance
     */
    constructor({ public, private }, tonInstance) {
        this.tonWallet = undefined;
        this.wallets = {};
        this.keyPair = {
            public: public,
            private: private
        };
        this.pubkey = '0x' + public;
        this.tonInstance = tonInstance;
        this.giverContract = new ContractWrapper(
            this.tonWrapper,
            this.tonWrapper.giverConfig.abi,
            null,
            this.tonWrapper.giverConfig.address,
        );
    }

    /**
     * Create multisig for user
     */
    async createMultisigWallet() {
        this.tonWallet = new MultisigWallet(this.tonInstance, {
            intiParams: {},
            constructorParams: {
                owners: [this.pubkey],
                reqConfirms: 1
            }
        }, this.keyPair);
        await msig.deployContract();
    }

    /**
     * Create tip3 wallet for given tip3 token
     * @param {RootContract} tip3Token 
     * @param {String} tokenAmount 
     */
    async createWallet(tip3Token, tokenAmount) {
        let rootTokenAddress = tip3Token.rootContract.address;
        if (!this.wallets[rootTokenAddress]) {
            let futureAddress = await tip3Token.calculateFutureWalletAddress(
                ZERO_PUBKEY, this.msig.msigContract.address
            );
            let walletExists = await this.checkIfAccountExists(futureAddress);
            if (!walletExists) {
                // TODO: проверить а это вообще работает или нет
                let payload = await this.tonInstance.ton.abi.encode_message_body({
                    abi: tip3Token.rootContract.abi,
                    call_set: {
                        function_name: 'deployEmptyWallet',
                        input: {
                            deployGrams: freeton.utils.convertCrystal('0.5', 'nano'),
                            wallet_public_key: ZERO_PUBKEY,
                            owner_address_: this.msig.msigContract.address,
                            gas_back_address: ZERO_ADDRESS
                        }
                    },
                    is_internal: true,
                    signer: {
                        type: 'Keys',
                        keys: this.keyPair
                    }
                });
                await this.msig.transferTo(
                    tip3Token,
                    freeton.utils.convertCrystal('1', 'nano'),
                    payload
                );

                while (!walletExists) {
                    walletExists = await this.checkIfAccountExists(futureAddress);
                    await sleep(1000);
                }
                this.wallets[rootTokenAddress] = futureAddress;
                await tip3Token.mintTokensToWallet(
                    this.wallets[rootTokenAddress],
                    tokenAmount
                );
            }
            this.wallets[rootTokenAddress] = new Wallet(this.tonInstance, {}, this.keyPair);
            this.wallets[rootTokenAddress].setWalletAddress(futureAddress);
        }
        return this._getWalletState(wallets[rootTokenAddress].walletContract.address);
    }

    /**
     * Check tip3 wallet balance
     * @param {String} rootTokenAddress 
     * @returns {Number} balance of tip3 wallet
     */
    async checkWalletBalance(rootTokenAddress) {
        return await this.wallets[rootTokenAddress].getBalance();
    }

    /**
     * Get wallet state: balance, tonBalance, address
     * @param {Wallet} wallet 
     * @returns {JSON}
     */
    async _getWalletState(wallet) {
        let state = {};
        state['balance'] = await wallet.getBalance();
        state['tonBalance'] = await this.checkAccountBalance(wallet.walletContract.address);
        state['address'] = wallet.walletContract.address;
        return state;
    }

    /**
     * 
     * @param {Array<String>} rootAddresses 
     * @returns {JSON}
     */
    async getWalletsStates(rootAddresses) {
        let state = {};
        for (let address of rootAddresses) {
            state[address] = this.wallets[address] !== undefined ?
                await this.getWalletState(this.wallets[address]) : {
                    balance: 0,
                    tonBalance: 0,
                    address: ZERO_ADDRESS
                };
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
     * @returns {JSON}
     */
    async provideLiquidity(swapPairInstance, token1Amount, token2Amount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2, res.lpTokenRoot];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let provideLiquidityPayload = await swapPairInstance.runLocal('createProvideLiquidityPayload', {}, {});

        await this.msig.transferTo(
            this.wallets[res.tokenRoot1].getAddress(),
            ONE_CRYSTAL,
            await createPayloadForTIP3Wallet(
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
            await createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot2].getAbi(),
                res.tokenWallet2,
                token2Amount,
                HALF_CRYSTAL,
                provideLiquidityPayload
            )
        );

        await sleep(2000);

        await this.createWallet(res.lpTokenRoot);

        finalBalances = await this.getWalletsStates(tokensToCheck);

        return {
            start: initialBalances,
            end: finalBalances
        };
    }

    /**
     * swap tokens with given root contract
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     * @returns {JSON}
     */
    async swapTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let swapPayload = await swapPairInstance.runLocal('createProvideLiquidityPayload', {
            sendTokensTo: this.wallets[res.tokenRoot2]
        }, {});

        await this.msig.transferTo(
            this.wallets[res.tokenRoot1].getAddress(),
            ONE_CRYSTAL,
            await createPayloadForTIP3Wallet(
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
            end: finalBalances
        };
    }

    /**
     * withdraw tip3 tokens from swap pair
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     */
    async withdrawTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);
        let tokensToCheck = [res.tokenRoot1, res.tokenRoot2, res.lpTokenRoot];
        let initialBalances = await this.getWalletsStates(tokensToCheck);
        let finalBalances = {};

        let withdrawPayload = await swapPairInstance.runLocal('createWithdrawLiquidityPayload', {
            tokenRoot1: res.tokenRoot1,
            tokenWallet1: this.wallets[res.tokenRoot1].getAddress(),
            tokenRoot2: res.tokenRoot2,
            tokenWallet2: this.wallets[res.tokenRoot2].getAddress()
        });

        await this.msig.transferTo(
            this.wallets[res.lpTokenRoot].getAddress,
            TWO_CRYSTALS,
            await createPayloadForTIP3Wallet(
                this.wallets[res.tokenRoot1].getAbi(),
                res.lpTokenWallet,
                tokenAmount,
                HALF_CRYSTAL,
                withdrawPayload
            )
        );

        await sleep(2000);

        finalBalances = await this.getWalletsStates(tokensToCheck);

        return {
            start: initialBalances,
            end: finalBalances
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
     * @param {String} address 
     */
    async checkIfAccountExists(address) {
        let res = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: address }
            },
            result: 'acc_type'
        });
        return res.acc_type == 0;
    }

    async checkAccountBalance(address) {
        let res = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: address }
            },
            result: 'balance'
        });
        return Number(res.balance);
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
     * @param {JSON} walletAbi 
     * @param {String} tokenWallet 
     * @param {Number} amount 
     * @param {Number} grams
     * @param {String} payload
     * @returns {String} payload for swap operation
     */
    async createPayloadForTIP3Wallet(walletAbi, tokenWallet, amount, grams, payload) {
        return await this.tonInstance.ton.abi.encode_message_body({
            abi: walletAbi,
            call_set: {
                function_name: 'transfer',
                input: {
                    to: tokenWallet,
                    tokens: amount,
                    grams: grams,
                    send_gas_to: ZERO_ADDRESS,
                    notify_receiver: true,
                    payload: payload
                }
            },
            is_internal: true,
            signer: {
                type: 'Keys',
                keys: this.keyPair
            }
        });
    }

}

module.exports = User;