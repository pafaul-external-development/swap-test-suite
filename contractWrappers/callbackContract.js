const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

class CallbackContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} giverParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, callbackContractParams, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = callbackContractParams.initParams;
        this.constructorParams = callbackContractParams.constructorParams;
        this.callbackContract = undefined;
    }

    /**
     * Load contract files from file system
     */
    async loadContract() {
        this.callbackContract = await freeton.requireContract(this.tonInstance, 'CallbackTestContract');
    }

    async deployContract() {
        return await this.callbackContract.deploy(
            this.constructorParams,
            this.initParams,
            freeton.utils.convertCrystal('4', 'nano'),
            true,
            this.keyPair
        );
    }

    /**
     * Get result of callback call
     */
    async getResult() {
        return await this.callbackContract.runLocal(
            'getResult', {},
            this.keyPair
        );
    }
}

module.exports = CallbackContract;