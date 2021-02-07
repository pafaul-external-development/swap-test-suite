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
    constructor(tonInstance, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.giverContract = undefined;
    }

    async loadContract() {
        this.giverContract = await freeton.requireContract(this.tonInstance, 'GiverContract');
    }

    /**
     * Send grams (10^-9 ton) to dest
     * @param {Number} dest 
     * @param {String} crystals 
     */
    async sendGrams(dest, crystals) {
        await this.giverContract.run(
            'sendGrams', {
                dest: dest,
                amount: crystals * Math.pow(10, 9)
            },
            this.keyPair
        )
    }
}

module.exports = Giver;