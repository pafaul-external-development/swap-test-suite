const freeton = require('../../src');

/**
 * @typedef SwapPairInfo
 * @type {Object}
 * 
 * @property {String} rootContract
 * @property {String} tokenRoot1
 * @property {String} tokenRoot2
 * @property {String} lpTokenRoot
 * @property {String} tokenWallet1
 * @property {String} tokenWallet2
 * @property {String} lpTokenWallet
 * @property {BigInt} deployTimestamp
 * @property {String} swapPairAddress
 * @property {BigInt} uniqueId   
 * @property {Number} swapPairCodeVersion
 */

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

        /**
         * @type {SwapPairInfo}
         */
        this.info = {};
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

    /**
     * Get pair info and set it
     */
    async getSetPairInfo() {
        this.info = await this.getPairInfo();
    }

    //========================Getters========================//

    /**
     * Get pair service information 
     */
    async getPairInfo() {
        return await this.swapPairContract.runLocal(
            'getPairInfo', {
                _answer_id: 0
            }, {}
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

    /**
     * Create provide liquidity payload
     * @param {String} tip3UserAddress 
     * @returns {Promise<String>}
     */
    async createProvideLiquidityPayload(tip3UserAddress) {
        return await this.swapPairContract.runLocal('createProvideLiquidityPayload', {
            tip3Address: tip3UserAddress
        }, {});
    }

    /**
     * Create swap payload
     * @param {String} tip3UserAddress 
     * @returns {Promise<String>}
     */
    async createSwapPayload(tip3UserAddress) {
        return await this.swapPairContract.runLocal('createSwapPayload', {
            sendTokensTo: tip3UserAddress
        }, {});
    }

    /**
     * Create withdraw payload
     * @param {String} tr1 
     * @param {String} tw1 
     * @param {String} tr2 
     * @param {String} tw2 
     * @returns {Promise<String>}
     */
    async createWithdrawLiquidityPayload(tr1, tw1, tr2, tw2) {
        return await swapPairInstance.swapPairContract.runLocal('createWithdrawLiquidityPayload', {
            tokenRoot1: tr1,
            tokenWallet1: tw1,
            tokenRoot2: tr2,
            tokenWallet2: tw2
        });
    }

    /**
     * Create provide liquidity payload one token
     * @param {String} tip3UserAddress 
     * @returns {Promise<String>}
     */
    async createProvideLiquidityOneTokenPayload(tip3UserAddress) {
        return await this.swapPairContract.runLocal('createProvideLiquidityOneTokenPayload', {
            tip3Address: tip3UserAddress
        }, {});
    }

    /**
     * Create payload for withdrawing liquidity one token
     * @param {String} tr 
     * @param {String} tw
     * @returns {Promise<String>}
     */
    async createWithdrawLiquidityPayload(tr, tw) {
        return await swapPairInstance.swapPairContract.runLocal('createWithdrawLiquidityOneTokenPayload', {
            tokenRoot: tr,
            userWallet: tw
        });
    }
}

module.exports = SwapPairContract;