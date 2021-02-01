const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

class Giver {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} giverParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, giverParameters, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = giverParameters.initParams;
        this.constructorParams = giverParameters.constructorParams;
        this.giverContract = undefined;
    }

    async loadContract() {
        this.giverContract = await freeton.requireContract(this.tonInstance, 'GiverContract');
    }

    /**
     * Send grams (10^-9 ton) to dest
     * @param {Number} dest 
     * @param {String} grams 
     */
    async sendGrams(dest, grams) {
        await this.giverContract.run(
            functionName = 'sendGrams',
            input = {
                dest = dest,
                amount = grams
            },
            keyPair = this.keyPair
        )
    }
}

module.exports = Giver;