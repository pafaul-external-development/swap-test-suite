const freeton = require('../../src');

class TONStorage {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.tonStorageContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.tonStorageContract = await freeton.requireContract(this.tonInstance, 'TONStorage', this.address);
    }

    /**
     * Deploy contract
     */
    async deploy() {
        return await this.tonStorageContract.deploy({
            constructorParams: {},
            initParams: {},
            initialBalance: freeton.utils.convertCrystal('2', 'nano'),
            _randomNonce: true,
            keyPair: this.keyPair
        })
    }

    /**
     * Transfer tons to specified contract
     * @param {String} address
     * @param {Number} amount 
     */
    async sendTONTo(address, amount) {
        await this.tonStorageContract.run(
            'sendTONTo', {
                dest: address,
                amount: amount
            },
            this.keyPair
        )
    }
}

module.exports = TONStorage;