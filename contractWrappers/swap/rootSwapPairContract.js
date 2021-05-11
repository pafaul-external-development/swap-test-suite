const freeton = require('../../src');
const { sleep } = require('../../src/utils');
const SwapPairContract = require('./swapPairContract');

class RootSwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config 
     * @param {JSON} config.initParams
     * @param {JSON} config.constructorParams
     * @param {JSON} keyPair 
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

    /**
     * Set new config if it is updated
     * @param {JSON} config 
     * @param {JSON} config.initParams
     * @param {JSON} config.constructorParams 
     */
    setConfig(config) {
        this.initParams = config.initParams;
        this.constructorParams = config.constructorParams;
    }

    /**
     * Deploy root contract to net
     * @param {Boolean} deployRequired true -> deploy, false -> only get address
     */
    async deployContract(deployRequired = false) {
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
                await this.setSwapPairCode(swapPairCode, 1);
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
     * @returns {JSON}
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
     * @param {String} pairID 
     */
    async upgradeSwapPair(pairID) {
        return await this.rootSwapPairContract.run(
            'upgradeSwapPair', {
                uniqueID: pairID
            },
            this.keyPair
        )
    }
}

module.exports = RootSwapPairContract;