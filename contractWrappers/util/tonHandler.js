const freeton = require('../../src');

class TONHandler {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.tonHandlerContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.tonHandlerContract = await freeton.requireContract(this.tonInstance, 'TonHandler', this.address);
    }

    /**
     * Deploy contract
     */
    async deploy() {
        return await this.tonHandlerContract.deploy({
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
        await this.tonHandlerContract.run(
            'sendTONTo', {
                dest: address,
                amount: amount
            },
            this.keyPair
        )
    }
}

module.exports = TONHandler;