const freeton = require('../../src');
const { sleep } = require('../../src/utils');

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
        if (!deployRequired)
            return await this.rootSwapPairContract.getFutureAddress({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                keyPair: this.keyPair
            })
        else {
            let futureAddress = await this.deployContract(false);
            let exists = await ton.ton.net.query_collection({
                collection: 'accounts',
                filter: {
                    id: { eq: futureAddress }
                },
                result: 'acc_type'
            });
            if (exists.acc_type == 0) {
                return await this.rootSwapPairContract.deploy({
                    constructorParams: this.constructorParams,
                    initParams: this.initParams,
                    initialBalance: freeton.utils.convertCrystal('200', 'nano'),
                    _randomNonce: true,
                    keyPair: this.keyPair,
                });
            }
            return futureAddress;
        }
    }

    //========================Getters========================//

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
     * @returns {JSON}
     */
    async awaitSwapPairInitialization(rootContract1, rootContract2) {
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
            res = getPairInfo(rootContract1, rootContract2);
            sleep(1000);
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
     * @param {*} newPairCode 
     * @param {*} newCodeVersion 
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