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
        this.giverContract = undefined;
    }

    async loadContract() {
        this.giverContract = await freeton.requireContract(this.tonInstance, 'CallbackTestContract');
    }

    async deployContract() {
        return await this.giverContract.deploy(
            this.constructorParams,
            this.initParams,
            3 * Math.pow(10, 9),
            true,
            this.keyPair
        );
    }

    /**
     * Get result of callback call
     */
    async getResult() {
        let result = await this.giverContract.run(
            'getResult', {},
            this.keyPair
        );
        return result;
    }
}

module.exports = CallbackContract;