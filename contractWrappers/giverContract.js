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

    /**
     * Load contract files from file system
     */
    async loadContract() {
        this.giverContract = await freeton.requireContract(this.tonInstance, 'GiverContract');
    }

    /**
     * Send grams to dest
     * @param {Number} dest 
     * @param {String} amount 
     */
    async sendGrams(dest, amount) {
        await this.giverContract.run(
            'sendGrams', {
                dest: dest,
                amount: amount * Math.pow(10, 9)
            },
            this.keyPair
        )
    }
}

module.exports = Giver;