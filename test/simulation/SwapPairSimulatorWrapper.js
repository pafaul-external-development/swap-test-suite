const SwapPairSimulatorLight = require('./SwapPairSimulatorLight');


class SwapPairSimulatorWrapper extends SwapPairSimulatorLight {
    constructor(firstTokenAddress, secondTokenAddress) {
        super();
        this._token1 = firstTokenAddress;
        this._token2 = secondTokenAddress;
    }

    /**
     * @property
     * @returns {Record<String, BigInt>}
     */
    get poolsInfo() {
        return this._createMapping(super._pools.true, super._pools.false);
    }
    

    /**
     * @param {String} tokenAddress
     * @param {BigInt} amount 
     * 
     * @returns {BigInt} amount after swap
     */
    swap(tokenAddress, amount) {
        return super.swap(this._getPosition(tokenAddress), amount);
    }


    /**
     * @param {BigInt} amount1 
     * @param {BigInt} amount2 
     * 
     * @returns {{provided: Record<String, BigInt> , minted: BigInt}} 
     */
    provide(amount1, amount2) {
        const res = super.provide(amount1, amount2);
        return {
            provided: this._createMapping(res.p1, res.p2),
            minted: res.minted,
        };
    }


    /**
     * @param {BigInt} lpTokensAmount 
     * @returns {{withdrawed: Record<String, BigInt>, burned: BigInt}}
     */
    withdraw(lpTokensAmount) {
        const res = super.withdraw(lpTokensAmount);
        return { 
            withdrawed: this._createMapping(res.w1, res.w2),
            burned: res.burned,
         };
    }


    /**
     * @param {String} tokenAddress
     * @param {BigInt} amount 
     * 
     * @returns {{provided: Record<String, BigInt> , minted: BigInt}} 
     */
     provideOneToken(tokenAddress, amount) {
        const res = super.provideOneToken(this._getPosition(tokenAddress), amount)
        return {
            provided: this._createMapping(res.p1, res.p2),
            minted: res.minted,
        };
    }


    /**
     * @param {String} receivingTokenAddress 
     * @param {BigInt} lpTokensAmount 
     * 
     * @returns {BigInt}
     */
     withdrawOneToken(receivingTokenAddress, lpTokensAmount) {
        return super.withdrawOneToken(this._getPosition(receivingTokenAddress), lpTokensAmount);
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
     * @returns {Record<String, T>}
     */
    _createMapping(val1, val2) {
        const obj = {};
        obj[this._token1] = val1;
        obj[this._token2] = val2;

        return obj;
    }
}



module.exports = SwapPairSimulatorWrapper;