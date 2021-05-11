const d = 1000;
const n = 997;


class SwapPairSimulatorLight {
    constructor() {
        this._pools = {
            true: 0, // 1
            false: 0 // 2
        }

        this._minted = 0;
    }


    /**
     * @property
     * @returns {{lp1: Number, lp2: Number, minted: Number}}
     */
    get poolsInfo() {
        return {
            lp1: this._pools.true,
            lp2: this._pools.false,
            minted: this._minted
        }
    }

    /**
     * @param {Boolean} lpFromKey
     * @param {Number} amount 
     * 
     * @returns {Number} amount after swap
     */
    swap(lpFromKey, amount) {
        let a = amount;
        let f = this._pools[lpFromKey];
        let t = this._pools[!lpFromKey];

        let fn = f + a;
        let tn = Math.floor((f * t) / (fn - a * (Math.floor((d - n) / d))));

        this._pools[lpFromKey] = fn;
        this._pools[!lpFromKey] = tn;

        return t - tn;
    }


    /**
     * @param {Number} amount1 
     * @param {Number} amount2 
     * 
     * @returns {{p1: Number, p2: Number, minted: Number}} minted lp tokens
     */
    provide(amount1, amount2) {
        let provided1 = 0,
            provided2 = 0,
            minted = 0;

        const p1 = this._pools.true;
        const p2 = this._pools.false
        const m = this._minted;


        if (!this.isLiquidityProvided) {
            provided1 = amount1;
            provided2 = amount2;
            minted = provided1 * provided2;
        } else {
            let maxToProvide1 = amount2 > 0 ? Math.floor(amount2 * p1 / p2) : 0;
            let maxToProvide2 = amount1 > 0 ? Math.floor(amount1 * p2 / p1) : 0;

            if (maxToProvide1 <= amount1) {
                provided1 = maxToProvide1;
                provided2 = amount2;
                minted = Math.floor(provided2 * m / p2);
            } else {
                provided1 = amount1;
                provided2 = maxToProvide2;
                minted = Math.floor(provided1 * m / p1);
            }
        }

        this._pools[true] += provided1;
        this._pools[false] += provided2;
        this._minted += minted;

        return { p1: provided1, p2: provided2, minted: minted }
    }


    /**
     * @param {Number} lpTokensAmount 
     * @returns {{w1: Number, w2: Number, burned: Number}} burned
     */
    withdraw(lpTokensAmount) {
        let w1 = 0,
            w2 = 0,
            burned = 0;
        const m = this._minted;
        const a = lpTokensAmount;
        const p1 = this._pools.true;
        const p2 = this._pools.false;

        if (m > 0 && a > 0) {
            w1 = Math.floor(p1 * a / m);
            w2 = Math.floor(p2 * a / m);
            burned = a;
        }

        this._pools.true -= w1;
        this._pools.false -= w2;
        this._minted -= burned;

        return { w1: w1, w2: w2, burned: burned };
    }


    /**
     * @param {Boolean} lpFromKey 
     * @param {Number} amount 
     * 
     * @returns {Number} lp tokens minted
     */
    provideOneToken(lpFromKey, amount) {
        const needToSwap = this._calculateNeedToSwap(lpFromKey, amount);
        const afterSwap = this.swap(needToSwap);
        const p1 = lpFromKey ? amount - needToSwap : afterSwap;
        const p2 = lpFromKey ? afterSwap : amount - needToSwap;

        return this.provide(p1, p2);
    }

    /**
     * 
     * @param {Boolean} wannaGetKey 
     * @param {Number} lpTokensAmount 
     */
    withdrawOneToken(wannaGetKey, lpTokensAmount) {
        const w = this.withdraw(lpTokensAmount);
        const afterSwap = this.swap(!wannaGetKey, wannaGetKey ? w.w2 : w.w1);

        return afterSwap + (wannaGetKey ? w.w1 : w.w2);
    }


    /**
     * @param {Boolean} lpFromKey 
     * @param {Number} providingAmount
     * @returns {Number}
     */
    _calculateNeedToSwap(lpFromKey, providingAmount) {
        const f = this._pools[lpFromKey];
        const p = providingAmount;

        const b = -1 * f * (n + d);
        const x = ((n + d) * (n + d) + Math.floor(4 * d * p * n / f));
        const y = this._sqrt(x); //можно попробовать всегда приводить к числу между 1е13 и 1е12. Это должно обеспечить нормальную точность и скорость сходимости
        const v = Math.floor((y * f));

        // console.log('---->', x, y);

        return Math.floor((b + v) / (2 * n));
    }


    _sqrt(x) {
        let counter = 1;
        let z = Math.floor((x + 1) / 2)
        let res = x;
        while (z < res) {
            counter++;
            res = z;
            z = Math.floor((Math.floor(x / z) + z) / 2);
        }
        // console.log(res);
        console.log('sqrt counter = ', counter);
        return res;
    }


    get isLiquidityProvided() {
        return this._pools.true > 0 && this._pools.false > 0;
    }

}


module.exports = SwapPairSimulatorLight;