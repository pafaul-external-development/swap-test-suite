const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

class TestAutoBalance {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} giverParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, contractParams, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = {};
        this.constructorParams = {};
        this.testAutoBalance = undefined;
    }

    /**
     * Load contract files from file system
     */
    async loadContract() {
        this.testAutoBalance = await freeton.requireContract(this.tonInstance, 'TestAutoBalance');
    }

    async deployContract() {
        return await this.testAutoBalance.deploy({
            constructorParams: {},
            initParams: {},
            initialBalance: freeton.utils.convertCrystal('100', 'nano'),
            _randomNonce: true,
            keyPair: this.keyPair
        });
    }

    async heavyFunction() {
        return await this.testAutoBalance.run(
            'heavyFunction', {},
            this.keyPair
        );
    }

    /**
     * Get result of callback call
     */
    async getBalance() {
        return await this.testAutoBalance.runLocal(
            'getBalance', {},
            this.keyPair
        );
    }
}

module.exports = TestAutoBalance;