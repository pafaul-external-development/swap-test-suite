const freeton = require('../../src');

class SwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = config.initParams;
        this.constructorParams = config.constructorParams;
        this.swapPairContract = undefined;

        this.tokenWallets = [];
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.swapPairContract = await freeton.requireContract(this.tonInstance, 'SwapPairContract');
    }

    //========================Getters========================//

    /**
     * Get pair service information 
     */
    async getPairInfo() {
        return await this.swapPairContract.runLocal(
            'getPairInfo', {}, {}
        )
    }

    /**
     * get exchange rate if amount is exchanged
     * @param {String} rootToken address of token root
     * @param {Number} amount amount of tokens to swap
     * @param {JSON} keyPair user's keypair
     */
    async getExchangeRate(rootToken, amount, keyPair) {
        return await this.swapPairContract.runLocal(
            'getExchangeRate', {
                swappableTokenRoot: rootToken,
                swappableTokenAmount: amount
            },
            keyPair
        );
    }
}

module.exports = SwapPairContract;