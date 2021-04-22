const freeton = require('../../src');

class SwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.swapPairContract = undefined;

        this.tokenWallets = [];
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.swapPairContract = await freeton.requireContract(this.tonInstance, 'SwapPairContract');
    }

    /**
     * Get swap pair contract address
     * @returns swap pair contract address
     */
    getAddress() {
        return this.swapPairContract.address;
    }

    /**
     * Set contract address
     * @param {String} spAddress 
     */
    setContractAddress(spAddress) {
        this.swapPairContract.address = spAddress;
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