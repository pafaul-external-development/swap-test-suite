const freeton = require('../../src');
const giverConfig = require('../../config/contracts/giverConfig');

class GiverContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config
     * @param {import('@tonclient/core').KeyPair} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = giverConfig.keyPair;
        this.address = giverConfig.address;
        this.giverContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.giverContract = await freeton.requireContract(this.tonInstance, 'GiverContract', this.address);
    }

    /**
     * Set pubkeys that can get tokens from giver
     * @param {Array} keyPairs 
     */
    async setAllowedPubkeys(keyPairs) {
        for (let pubId = 0; pubId < keyPairs.length; pubId++) {
            await this.giverContract.run(
                'addAllowedPubkey', {
                    pubkey: '0x' + keyPairs[pubId].public
                },
                this.keyPair
            )
        }
    }

    /**
     * Remove pubkeys from allowance
     * @param {Array} keyPairs 
     */
    async removeAllowedPubkeys(keyPairs) {
        for (let pubId = 0; pubId < keyPairs.length; pubId++) {
            if (pubkey[pubId] != this.keyPair.public) {
                await this.giverContract.run(
                    'removeAllowedPubkey', {
                        pubkey: '0x' + keyPairs[pubId].public
                    },
                    this.keyPair
                )
            }
        }
    }

    /**
     * Send grams
     * @param {Number} dest 
     * @param {String} amount 
     * @param {JSON} keyPair
     */
    async sendGrams(dest, amount, keyPair) {
        await this.giverContract.run(
            'sendGrams', {
                dest: dest,
                amount: amount
            },
            keyPair ? keyPair : keyPair //this.keyPair
        )
    }
}

module.exports = GiverContract;