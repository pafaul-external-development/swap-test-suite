const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

class RootSwapPairContract {
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initialParams = config.initialParams;
        this.constructorParams = config.constructorParams;
        this.rootSwapPairContract = undefined;
    }

    async loadContract() {
        this.rootSwapPairContract = await freeton.requireContract(this.tonInstance, 'RootSwapPairContract');
    }

    async deployContract() {
        return await this.rootSwapPairContract.deploy(
            this.constructorParams,
            this.initialParams,
            freeton.utils.convertCrystal('4', 'nano'),
            true,
            this.keyPair,
            false
        );
    }
}

module.exports = RootSwapPairContract;