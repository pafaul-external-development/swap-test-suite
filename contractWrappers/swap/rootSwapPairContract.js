const freeton = require('../../src');
const { sleep } = require('../../src/utils');
const SwapPairContract = require('./swapPairContract');

/**
 * @typedef RootServiceInfo
 * @type {Object}
 * 
 * @property {String} ownerPubkey
 * @property {BigInt} contractBalance
 * @property {BigInt} creationTimestamp
 * @property {BigInt} codeVersion
 * @property {String} swapPairCode
 */
class RootSwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {import('../../config/contracts/swapPairContractsConfig').RootSwapPairConfig} config
     * @param {import('@tonclient/core').KeyPair} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = config.initParams;
        this.constructorParams = config.constructorParams;
        this.rootSwapPairContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.rootSwapPairContract = await freeton.requireContract(this.tonInstance, 'RootSwapPairContract');
    }

    getAddress() {
        return this.rootSwapPairContract.address;
    }

    /**
     * Set new config if it is updated
     * @param {import('../../config/contracts/swapPairContractsConfig').RootSwapPairConfig} config
     */
    setConfig(config) {
        this.initParams = config.initParams;
        this.constructorParams = config.constructorParams;
    }

    /**
     * Deploy root contract to net
     * @param {Boolean} deployRequired true -> deploy, false -> only get address
     * @param {Number} spCodeVersion
     * @returns {Promise<String>}
     */
    async deployContract(deployRequired = false, spCodeVersion = 1) {
        if (!deployRequired) {
            if (!this.rootSwapPairContract)
                await this.loadContract();
            return await this.rootSwapPairContract.getFutureAddress({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                keyPair: this.keyPair
            })
        } else {
            let futureAddress = await this.deployContract(false);
            let exists = await this.tonInstance.ton.net.query_collection({
                collection: 'accounts',
                filter: {
                    id: { eq: futureAddress }
                },
                result: 'acc_type balance'
            });
            if (exists.result.length == 0 || exists.result[0].acc_type != 1) {
                await this.rootSwapPairContract.deploy({
                    constructorParams: this.constructorParams,
                    initParams: this.initParams,
                    initialBalance: freeton.utils.convertCrystal('200', 'nano'),
                    _randomNonce: false,
                    keyPair: this.keyPair,
                });
                let swapPairCode = await freeton.requireContract(this.tonInstance, 'SwapPairContract');
                swapPairCode = swapPairCode.code;
                await this.setSwapPairCode(swapPairCode, spCodeVersion);
            } else {
                if (Number(exists.result[0].balance) < Number(freeton.utils.convertCrystal('100', 'nano'))) {
                    const giverContract = new freeton.ContractWrapper(
                        this.tonInstance.giverConfig,
                        this.tonInstance.giverConfig.abi,
                        null,
                        this.tonInstance.giverConfig.keyPair,
                    );

                    try {
                        await giverContract.run('sendGrams', {
                                dest: futureAddress,
                                amount: freeton.utils.convertCrystal('100', 'nano'),
                            },
                            this.tonInstance.giverConfig.keyPair
                        );
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
            this.rootSwapPairContract.address = futureAddress;
            return futureAddress;
        }
    }

    //========================Getters========================//
    /**
     * 
     * @param {String} rootContract1 
     * @param {String} rootContract2 
     * @returns 
     */
    async getXOR(rootContract1, rootContract2) {
        return await this.rootSwapPairContract.runLocal(
            'getXOR', {
                tokenRootContract1: rootContract1,
                tokenRootContract2: rootContract2
            },
            this.keyPair
        );
    }

    /**
     * Get info about deployed pair
     * @param {String} rootContract1 
     * @param {String} rootContract2 
     * @returns {import('./swapPairContract').SwapPairInfo}
     */
    async getPairInfo(rootContract1, rootContract2) {
        return await this.rootSwapPairContract.runLocal(
            'getPairInfo', {
                tokenRootContract1: rootContract1,
                tokenRootContract2: rootContract2
            },
            this.keyPair
        );
    }

    /**
     * Get information about deployed root contract
     * @returns {Promise<RootServiceInfo>} 
     */
    async getServiceInformation() {
        return await this.rootSwapPairContract.runLocal(
            'getServiceInformation', {},
            this.keyPair
        )
    }

    /**
     * Check if swap pair already deployed
     * @param {String} rootContract1 
     * @param {String} rootContract2 
     * @returns {Promise<Boolean>}
     */
    async checkIfPairExists(rootContract1, rootContract2) {
        return await this.rootSwapPairContract.runLocal(
            'checkIfPairExists', {
                tokenRootContract1: rootContract1,
                tokenRootContract2: rootContract2
            },
            this.keyPair
        )
    }

    /**
     * Get future address of swap pair
     * @param {String} rootContract1 
     * @param {String} rootContract2 
     * @returns {Promise<String>}
     */
    async getFutureSwapPairAddress(rootContract1, rootContract2) {
        return await this.rootSwapPairContract.runLocal(
            'getFutureSwapPairAddress', {
                tokenRootContract1: rootContract1,
                tokenRootContract2: rootContract2
            },
            this.keyPair
        );
    }

    //========================Misc========================//

    /**
     * Await while swap pair will be initialized
     * @param {String} rootContract1 
     * @param {String} rootContract2 
     * @param {SwapPairContract} swapPairContract
     * @returns {Promise<import('./swapPairContract').SwapPairInfo>}
     */
    async awaitSwapPairInitialization(rootContract1, rootContract2, swapPairContract) {
        let res = {
            tokenWallet1: ZERO_ADDRESS,
            tokenWallet2: ZERO_ADDRESS,
            lpTokenWallet: ZERO_ADDRESS
        }

        while (
            res.tokenWallet1 == ZERO_ADDRESS ||
            res.tokenWallet2 == ZERO_ADDRESS ||
            res.lpTokenWallet == ZERO_ADDRESS
        ) {
            res = await this.getPairInfo(rootContract1, rootContract2);
            await sleep(1000);
        }

        return res;
    }

    //========================Actual Functions========================//

    /**
     * Deploy swap pair with known root contract addresses
     * @param {String} rootContract1 
     * @param {String} rootContract2
     * @returns {Promise<String>}
     */
    async deploySwapPair(rootContract1, rootContract2) {
        return await this.rootSwapPairContract.run(
            'deploySwapPair', {
                tokenRootContract1: rootContract1,
                tokenRootContract2: rootContract2
            },
            this.keyPair
        );
    }

    /**
     * Set new swap pair code ??? Probably will be done using SC
     * @param {String} newPairCode 
     * @param {String} newCodeVersion 
     */
    async setSwapPairCode(newPairCode, newCodeVersion) {
        return await this.rootSwapPairContract.run(
            'setSwapPairCode', {
                code: newPairCode,
                codeVersion: newCodeVersion
            },
            this.keyPair
        )
    }

    /**
     * Upgrade code of smart contract pair ID
     * @param {String} tokenRootContract1
     * @param {String} tokenRootContract2 
     */
    async upgradeSwapPair(tokenRootContract1, tokenRootContract2) {
        return await this.rootSwapPairContract.run(
            'upgradeSwapPair', {
                tokenRootContract1: tokenRootContract1,
                tokenRootContract2: tokenRootContract2
            },
            this.keyPair
        )
    }
}

module.exports = RootSwapPairContract;