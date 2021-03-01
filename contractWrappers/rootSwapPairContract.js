const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

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
     * @param {Boolean} onlyAddress
     */
    async deployContract(onlyAddress = false) {
        if (onlyAddress)
            return await this.rootSwapPairContract.getFutureAddress({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                keyPair: this.keyPair
            })
        else
            return await this.rootSwapPairContract.deploy({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                initialBalance: freeton.utils.convertCrystal('30', 'nano'),
                _randomNonce: true,
                keyPair: this.keyPair,
            });
    }

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