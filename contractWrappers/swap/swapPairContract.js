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

/**
 * @typedef SwapInfo
 * @type {Object}
 * 
 * @property {BigInt} swappableTokenAmount
 * @property {BigInt} targetTokenAmount
 * @property {BigInt} fee
 */

/**
 * @typedef LiquidityPoolsInfo
 * @type {Object}
 * 
 * @property {BigInt} lp1
 * @property {BigInt} lp2
 * @property {BigInt} lpTokensMinted
 */

class SwapPairContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance
     * @param {import('@tonclient/core').KeyPair} keyPair 
     */
    // TODO: рефакторинг:  добавить свойство `info` и его инициализацию
    constructor(tonInstance, keyPair) {
        /**
         * @type {freeton.TonWrapper}
         */
        this.tonInstance = tonInstance;
        /**
         * @type {import('@tonclient/core').KeyPair}
         */
        this.keyPair = keyPair;
        /**
         * @type {freeton.TonWrapper}
         */
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
     * @returns {String} swap pair contract address
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
     * @returns {Promise<SwapPairInfo>}
     */
    async getPairInfo() {
        return await this.swapPairContract.runLocal(
            'getPairInfo', {
                _answer_id: 0
            }, {}
        )
    }

    /**
     * Get current liquidity pools volumes
     * @returns {Promise<LiquidityPoolsInfo>}
     */
    async getCurrentExchangeRate() {
        return await this.swapPairContract.runLocal(
            'getCurrentExchangeRate', {
                _answer_id: 0
            }, {}
        );
    }

    /**
     * get exchange rate if amount is exchanged
     * @param {String} rootToken address of token root
     * @param {Number} amount amount of tokens to swap
     * @param {import('@tonclient/core').KeyPair} keyPair user's keypair
     * @returns {Promise<SwapInfo>}
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
        return await this.swapPairContract.runLocal('createWithdrawLiquidityOneTokenPayload', {
            tokenRoot: tr,
            userWallet: tw
        });
    }
}

module.exports = SwapPairContract;