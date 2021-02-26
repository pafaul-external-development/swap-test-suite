const freeton = require('../src');

class SwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} rootParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, swapPairParameters, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = swapPairParameters.initParams;
        this.constructorParams = swapPairParameters.constructorParams;
        this.swapPairContract = undefined;
    }

    setConfig(newConfig) {
        this.initParams = newConfig.initParams;
        this.constructorParams = newConfig.constructorParams;
    }

    /**
     * Deploy root contract or just get the address
     * @dev For internal use only
     * @param {Boolean} onlyAddress 
     * @returns {Promise<String>}
     */
    async _deployRoot(onlyAddress) {
        if (onlyAddress)
            return await this.swapPairContract.getFutureAddress({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                keyPair: this.keyPair
            })
        else
            return await this.swapPairContract.deploy({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                initialBalance: freeton.utils.convertCrystal('60', 'nano'),
                _randomNonce: true,
                keyPair: this.keyPair
            });
    }
}

module.exports = SwapPairContract;