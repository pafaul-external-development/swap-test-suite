const freeton = require('../../src');
const Giver = require('../giverContract');

class GiverContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = {
            public: 'c29089f9d734ee23fafc8938f8c2f0ced7b47e6ea625511ce837cdba2a3289c8',
            secret: '60db8ac5bb9fb0e3d0f1e127c32e5af022596906c10af6d3c8e2031bb58a1cdc'
        };
        this.address = '0:8748d82ad85a2122343d1ab0f954173242f0926333b3385869f973e40fc0136a';
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