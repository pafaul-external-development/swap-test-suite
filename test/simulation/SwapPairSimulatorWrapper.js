const SwapPairSimulatorLight = require('./SwapPairSimulatorLight');


/**
 *  NOTE:
 *      Функции возвращают ожидаемые изменения балансов пользовательских кошельков!
 */

class SwapPairSimulatorWrapper extends SwapPairSimulatorLight {
    /**
     * 
     * @param {String} firstTokenAddress 
     * @param {String} secondTokenAddress 
     * @param {String} lpTokenAddress 
     */
    constructor(firstTokenAddress, secondTokenAddress, lpTokenAddress) {
        if (!firstTokenAddress || !secondTokenAddress || !lpTokenAddress)
            throw Error('SwapPairSimulatorWrapper: invalid addresses in constructor');

        super();
        this._token1 = firstTokenAddress;
        this._token2 = secondTokenAddress;
        this._lpToken = lpTokenAddress;
    }
<<<<<<< HEAD
=======
    
>>>>>>> origin

    /**
     * @param {String} tokenAddress
     * @param {BigInt} amount 
     * 
     * @returns {Record<String, BigInt>}
     */
    swap(tokenAddress, amount) {
        amount = BigInt(amount);
        const pos = this._getPosition(tokenAddress);
        const res = super.swap(pos, amount);
        if (pos)
            return this._createMapping(-1n * amount, res, 0);
        else 
            return this._createMapping(res, -1n * amount, 0);
    }


    /**
     * @param {BigInt} amount1 
     * @param {BigInt} amount2 
     * 
     * @returns {Record<String, BigInt>} 
     */
    provide(amount1, amount2) {
        const res = super.provide(amount1, amount2);
        return this._createMapping(-1n*res.p1, -1n*res.p2, res.minted);
    }


    /**
     * @param {BigInt} lpTokensAmount 
     * @returns {Record<String, BigInt>}
     */
    withdraw(lpTokensAmount) {
        const res = super.withdraw(lpTokensAmount);
        return this._createMapping(res.w1, res.w2, -1n*res.burned);
    }


    /**
     * @param {String} tokenAddress
     * @param {BigInt} amount 
     * 
     * @returns {Record<String, BigInt>} 
     */
    provideOneToken(tokenAddress, amount) {
        amount = BigInt(amount);
        const pos = this._getPosition(tokenAddress);
        const res = super.provideOneToken(pos, amount);
        
        const provided = amount - res.inputRemainder;

        if(pos)
            return this._createMapping(-1n*provided, 0, res.minted);
        else
            return this._createMapping(0, -1n*provided, res.minted);
    }


    /**
     * @param {String} receivingTokenAddress 
     * @param {BigInt} lpTokensAmount 
     * 
     * @returns {BigInt}
     */
    withdrawOneToken(receivingTokenAddress, lpTokensAmount) 
    {   
        lpTokensAmount = BigInt(lpTokensAmount);
        const pos = this._getPosition(receivingTokenAddress);
        const res = super.withdrawOneToken(pos, lpTokensAmount);
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
}



module.exports = SwapPairSimulatorWrapper;