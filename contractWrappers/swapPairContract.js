const freeton = require('../src');

class SwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} config 
     * @param {JSON} config.initialParams
     * @param {JSON} config.constructorParams
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, config, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initialParams = config.initialParams;
        this.constructorParams = config.constructorParams;
        this.swapPairContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.swapPairContract = await freeton.requireContract(this.tonInstance, 'RootSwapPairContract');
    }

    /**
     * Deploy root contract to net
     * @param {Boolean} onlyAddress
     */
    async deployContract(onlyAddress = false) {
        if (onlyAddress)
            return await this.swapPairContract.getFutureAddress({
                constructorParams: this.constructorParams,
                initParams: this.initialParams,
                keyPair: this.keyPair
            });
        else
            return await this.swapPairContract.deploy({
                constructorParams: this.constructorParams,
                initParams: this.initialParams,
                initialBalance: freeton.utils.convertCrystal('4', 'nano'),
                _randomNonce: false,
                keyPair: this.keyPair,
            });
    }
}

module.exports = SwapPairContract;