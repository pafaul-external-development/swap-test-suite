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
     * Get creation timestamp of pair
     */
    async getCreationTimestamp() {
        return await this.swapPairContract.runLocal(
            'getCreationTimestamp', {}, {}
        )
    }

    /**
     * Get pair service information 
     */
    async getPairInfo() {
        return await this.swapPairContract.runLocal(
            'getPairInfo', {}, {}
        )
    }

    /**
     * get user token balance
     * @param {JSON} userKeys 
     */
    async getUserBalance(userKeys) {
        return await this.swapPairContract.runLocal(
            'getUserBalance', {}, userKeys
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

    //========================Actual Functions========================//

    /**
     * withdraw tokens from pair
     * @param {String} rootToken address of token root
     * @param {String} wallet address of wallet to send tokens to
     * @param {Number} amount amount of tokens to withdraw
     * @param {JSON} keyPair user's keypair
     */
    async withdrawToken(rootToken, wallet, amount, keyPair) {
        return await this.swapPairContract.run(
            'withdrawToken', {
                withdrawalTokenRoot: rootToken,
                receiveTokenWallet: wallet,
                amount: amount
            },
            keyPair
        )
    }

    /**
     * swap amount of tokens
     * @param {String} rootToken address of token root
     * @param {Number} amount amount of tokens to swap
     * @param {JSON} keyPair user's keypair
     */
    async swap(rootToken, amount, keyPair) {
        return await this.swapPairContract.run(
            'swap', {
                swappableTokenRoot: rootToken,
                swappableTokenAmount: amount
            },
            keyPair
        )
    }

    /**
     * Add tokens to liquidity pool from user's virtual balance
     * @param {Number} amount1 token1 amount to add to liquidity pool
     * @param {Number} amount2 token2 amount to add to liquidity pool
     * @param {JSON} keyPair user's keypair
     */
    async addLiquidity(amount1, amount2, keyPair) {
        return await this.swapPairContract.run(
            'addLiquidity', {
                firstTokenAmount: amount1,
                secondTokenAmount: amount2
            },
            this.keyPair
        )
    }
}

module.exports = SwapPairContract;