const SwapPairSimulatorLight = require('./SwapPairSimulatorLight');


/**
 *  NOTE:
 *      Функции возвращают ожидаемые изменения балансов пользовательских кошельков!
 */

class SwapPairSimulatorWrapper {
    /**
     * 
     * @param {String} firstTokenAddress 
     * @param {String} secondTokenAddress 
     * @param {String} lpTokenAddress 
     */
    constructor(firstTokenAddress, secondTokenAddress, lpTokenAddress) {
        if (!firstTokenAddress || !secondTokenAddress || !lpTokenAddress)
            throw Error('SwapPairSimulatorWrapper: invalid addresses in constructor');

        this._simulator = new SwapPairSimulatorLight();
        this._token1 = firstTokenAddress;
        this._token2 = secondTokenAddress;
        this._lpToken = lpTokenAddress;
    }
    
    /**
     * @property
     * @returns {{lp1: BigInt, lp2: BigInt, minted: BigInt}}
     */
    get poolsInfo() {
        return this._simulator.poolsInfo;
    }

    /**
     * @param {BigInt | Number} amount1 
     * @param {BigInt | Number} amount2 
     */
    setPools(amount1, amount2) {
        return this._simulator.setPools(amount1, amount2);
    }


    /**
     * @param {String} tokenAddress
     * @param {BigInt | Number} amount 
     * 
     * @returns {Record<String, BigInt>}
     */
    swap(tokenAddress, amount) {
        this._checkIsLiquidityProvided();

        amount = BigInt(amount);
        const pos = this._getPosition(tokenAddress);
        const res = this._simulator.swap(pos, amount);
        if (pos)
            return this._createMapping(-1n * amount, res, 0);
        else 
            return this._createMapping(res, -1n * amount, 0);
    }


    /**
     * @param {BigInt | Number} amount1 
     * @param {BigInt | Number} amount2 
     * 
     * @returns {Record<String, BigInt>} 
     */
    provide(amount1, amount2) {
        const res = this._simulator.provide(amount1, amount2);
        return this._createMapping(-1n*res.p1, -1n*res.p2, res.minted);
    }


    /**
     * @param {BigInt | Number} lpTokensAmount 
     * @returns {Record<String, BigInt>}
     */
    withdraw(lpTokensAmount) {
        this._checkIsLiquidityProvided();

        const res = this._simulator.withdraw(lpTokensAmount);
        return this._createMapping(res.w1, res.w2, -1n*res.burned);
    }


    /**
     * @param {String} tokenAddress
     * @param {BigInt | Number} amount 
     * 
     * @returns {Record<String, BigInt>} 
     */
    provideOneToken(tokenAddress, amount) {
        amount = BigInt(amount);
        const pos = this._getPosition(tokenAddress);
        const res = this._simulator.provideOneToken(pos, amount);
        
        const provided = amount - res.inputRemainder;

        if(pos)
            return this._createMapping(-1n*provided, 0, res.minted);
        else
            return this._createMapping(0, -1n*provided, res.minted);
    }


    /**
     * @param {String} receivingTokenAddress 
     * @param {BigInt | Number} lpTokensAmount 
     * 
     * @returns {BigInt}
     */
    withdrawOneToken(receivingTokenAddress, lpTokensAmount) {
        this._checkIsLiquidityProvided();
        
        lpTokensAmount = BigInt(lpTokensAmount);
        const pos = this._getPosition(receivingTokenAddress);
        const res = this._simulator.withdrawOneToken(pos, lpTokensAmount);
        if (pos)
            return this._createMapping(res, 0, -1n*lpTokensAmount);
        else
            return this._createMapping(0, res, -1n*lpTokensAmount);
    }
 

    /**@private */
    _getPosition(token) {
        if (this._token1 === token)
            return true;
        if (this._token2 === token)
            return false;
        throw Error('SwapPairSimulatorWrapper: unknown token address');
    }


    /**
     * @private
     * @param {T} val1 
     * @param {T} val2 
     * @param {T} valLP
     * @returns {Record<String, T>}
     */
    _createMapping(val1, val2, valLP) {
        const obj = {};
        obj[this._token1] = val1;
        obj[this._token2] = val2;
        obj[this._lpToken] = valLP;

        return obj;
    }

    _checkIsLiquidityProvided() {
        if (this._simulator._pools.true <= 0 || this._simulator._pools.false <= 0)
            throw Error('SwapPairSimulatorWrapper: Liquidity pools are empty');
        return true
    }
}

if (require.main === module) {
    const x = new SwapPairSimulatorWrapper('x', 'y', 'z');
    const p = (z) => console.log(z);

    const xPool = 10000000000n

    x.setPools(xPool, 1000000000n);

    p(x.poolsInfo);
    p(x.swap('x', xPool / 1000000000n));
    // p(x.poolsInfo);
    // p(x.provide(10000000000000n, 10000000000000n));
    // p(x.withdraw(10000000000000000000n));
    // p(x.provideOneToken('y', 10000000000n));
    // p(x.withdrawOneToken('x', 1000000000000000n));

}


module.exports = SwapPairSimulatorWrapper;