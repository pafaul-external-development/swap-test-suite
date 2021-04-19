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
     * @param {String} address 
     * @param {freeton.TonWrapper} tonInstance
     */
    constructor({ public, private }, address, tonInstance) {
        this.tonWallet = undefined;
        this.wallets = {};
        this.keyPair = {
            public: public,
            private: private
        };
        this.pubkey = '0x' + public;
        this.address = address;
        this.tonInstance = tonInstance;
        this.giverContract = new ContractWrapper(
            this.tonWrapper,
            this.tonWrapper.giverConfig.abi,
            null,
            this.tonWrapper.giverConfig.address,
        );
    }

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
     * 
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
        return this.wallets[rootTokenAddress];
    }

    /**
     * 
     * @param {String} rootTokenAddress 
     * @returns {Number} balance of tip3 wallet
     */
    async checkWalletBalance(rootTokenAddress) {
        return Number((await this.wallets[rootTokenAddress].getDetails()).balance);
    }

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
     * 
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} token1Amount
     * @param {Number} token2Amount
     */
    async provideLiquidity(swapPairInstance, token1Amount, token2Amount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);

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
    }

    /**
     * 
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     */
    async swapTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);

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
    }

    /**
     * 
     * @param {SwapPairContract} swapPairInstance 
     * @param {Number} tokenAmount 
     */
    async withdrawTokens(swapPairInstance, tokenAmount) {
        let res = await this.checkIfAllWalletsExist(swapPairInstance);

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