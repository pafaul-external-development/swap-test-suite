const math = require('./math');


function _sqrt(x) {
    let counter = 1;
    let z = Math.floor((x + 1) / 2)
    let res = x;
    while(z < res) {
        counter++;
        res = z;
        z = Math.floor((Math.floor(x/z) + z) / 2);
    }
    // console.log('sqrt counter = ', counter);
    return res;
}


const uint128 = (x) => Math.abs(Math.floor(Number(x)));
const uint256 = uint128;


const T1 = 0;
const T2 = 1;


// STATIC
/**
 * @param {Number} amount1 
 * @param {Number} amount2 
 * @returns {Boolean}
 */
function notZeroLiquidity(amount1, amount2) {
    return amount1 > amount2
}







class _SwapInfoInternal {
    /**
     * @constructor
     * @param {0 | 1} fromK 
     * @param {0 | 1} toK 
     * @param {Number} newFromPool 
     * @param {Number} newToPool 
     * @param {Number} targetTokenAmount 
     * @param {Number} fee 
     */
    constructor(fromK, toK, newFromPool, newToPool, targetTokenAmount, fee) {
        this.fromKey = fromK;
        this.toKey = toK;
        this.newFromPool = newFromPool;
        this.newToPool = newToPool;
        this.targetTokenAmount = targetTokenAmount;
        this.fee = fee;
    }
}

class SwapInfo {
    /**
     * @param {Number} swappableTokenAmount 
     * @param {Number} targetTokenAmount 
     * @param {Number} fee 
     */
    constructor(swappableTokenAmount, targetTokenAmount, fee) {
        this.swappableTokenAmount = swappableTokenAmount;
        this.targetTokenAmount = targetTokenAmount;
        this.fee = fee;
    }
}


/**
 * @typedef ProvidingInfo
 * @type {Object}
 * 
 * @property
 */




class SwapPairSimulator {
    feeNominator = 997;
    feeDenominator = 1000;
    liquidityTokensMinted 
    tokenWallets = [];
    lps = [0, 0];


    constructor() {

    }

    /////////////   Cahnges states  
    _swap() {
        
    }

    _provide() {

    }

    _provideOneToken() {

    }

    _withdraw() {

    }

    _withdrawOneToken() {

    }



    /////////////   Doesn't changes states    /////////////////////////////////////////////

    /**
     * @private
     * @param {Number} maxFirstTokenAmount 
     * @param {Number} maxSecondTokenAmount 
     * 
     * @returns {{provided1: Number, provided2: Number, toMint: Number}}
     */
    _calculateProvidingLiquidityInfo(maxFirstTokenAmount, maxSecondTokenAmount) {
        let provided1 = 0, provided2 = 0, minted = 0;

        if (this.isLiquidityProvided) {
            provided1 = maxFirstTokenAmount;
            provided2 = maxSecondTokenAmount;
            minted = uint256(provided1) * uint256(provided2);
        }
        else {
            let maxToProvide1 = maxSecondTokenAmount != 0 ?  math.muldiv(maxSecondTokenAmount, this.lps[T1], this.lps[T2]) : 0;
            let maxToProvide2 = maxFirstTokenAmount  != 0 ?  math.muldiv(maxFirstTokenAmount,  this.lps[T2], this.lps[T1]) : 0;

            if (maxToProvide1 <= maxFirstTokenAmount ) {
                provided1 = maxToProvide1;
                provided2 = maxSecondTokenAmount;
                minted =  math.muldiv(uint256(provided2), this.liquidityTokensMinted, uint256(this.lps[T2]) );
            } else {
                provided1 = maxFirstTokenAmount;
                provided2 = maxToProvide2;
                minted =  math.muldiv(uint256(provided1), this.liquidityTokensMinted, uint256(this.lps[T1]) );
            }
        }

        return {provided1: provided1, provided2: provided2, toMint: minted}
    }



    /**
     * @private
     * @param {Number} liquidityTokensAmount 
     * @returns {{withdrawed1: Number, withdrawed2: Number, toBurn: Number}}
     */
    _calculateWithdrawingLiquidityInfo(liquidityTokensAmount)
    {   
        let withdrawed1 = 0, withdrawed2 = 0, _burned = 0;
        if (this.liquidityTokensMinted <= 0 || liquidityTokensAmount <= 0) {
            // do nothing
        }
        else {
            withdrawed1 = uint128(math.muldiv(uint256(this.lps[T1]), liquidityTokensAmount, this.liquidityTokensMinted));
            withdrawed2 = uint128(math.muldiv(uint256(this.lps[T2]), liquidityTokensAmount, this.liquidityTokensMinted));
            _burned = liquidityTokensAmount;
        }

        return {withdrawed1: withdrawed1, withdrawed2: withdrawed2, toBurn: _burned}
    }


    /**
     * @private
     * @param {0 | 1} tokenRoot 
     * @param {Number} tokenAmount 
     * 
     * @returns {Number}
     */
    _calculateOneTokenProvidingAmount(tokenRoot, tokenAmount)
    {   
        const fromK = tokenRoot;
        const f = uint256(lps[fromK]);
        const k = feeNominator+feeDenominator;
        const b = f*k;
        const v = f * _sqrt( k*k + math.muldiv(4*feeDenominator*feeNominator, tokenAmount, f));

        return uint128((v-b)/(feeNominator+feeNominator));
    }


    /**
     * @private
     * @param {0 | 1} swappableTokenRoot
     * @param {Number} swappableTokenAmount
     * @returns {_SwapInfoInternal}
     */
    _calculateSwapInfo(swappableTokenRoot, swappableTokenAmount) 
    {
        const fromK = swappableTokenRoot;
        const toK = fromK == T1 ? T2 : T1;

        const fee = swappableTokenAmount - math.muldivc(swappableTokenAmount, this.feeNominator, this.feeDenominator);
        const newFromPool = this.lps[fromK] + swappableTokenAmount;
        const newToPool = uint128( math.divc(uint256(this.lps[0]) * uint256(this.lps[1]), newFromPool - fee) );

        const targetTokenAmount = this.lps[toK] - newToPool;

        const result = new _SwapInfoInternal(fromK, toK, newFromPool, newToPool, targetTokenAmount, fee);

        return result;
    }









    
    /**
     * @private
     * @param {0 | 1} swappableTokenRoot 
     * @param {Number} swappableTokenAmount
     * 
     * @returns {SwapInfo}
     */
    _swap(swappableTokenRoot, swappableTokenAmount)
    {
        const _si = this._calculateSwapInfo(swappableTokenRoot, swappableTokenAmount);

        if (!notZeroLiquidity(swappableTokenAmount, _si.targetTokenAmount)) {
            return SwapInfo(0, 0, 0);
        }

        this.lps[_si.fromKey] = _si.newFromPool;
        this.lps[_si.toKey] = _si.newToPool;

        return SwapInfo(swappableTokenAmount, _si.targetTokenAmount, _si.fee);
    }

    /**
     * @private
     * @param {*} tokenRoot 
     * @param {*} tokenAmount 
     * @param {*} senderPubkey 
     * @param {*} senderAddress 
     * @param {*} lpWallet 
     */
    _provideLiquidityOneToken(tokenRoot, tokenAmount, senderPubkey, senderAddress, lpWallet)  
    tokenExistsInPair(tokenRoot)
    returns (uint128 provided1, uint128 provided2, uint256 toMint, uint128 inputTokenRemainder)
    {
        const amount = _calculateOneTokenProvidingAmount(tokenRoot, tokenAmount);

        if (amount <= 0) 
            return (0, 0, 0, 0);

        SwapInfo si = _swap(tokenRoot, amount);

        uint128 amount1 = 0;
        uint128 amount2 = 0;

        bool isT1 = (tokenRoot == token1);
        if ( isT1 ) {
            amount1 = tokenAmount - si.swappableTokenAmount;
            amount2 = si.targetTokenAmount;
        } else {
            amount1 = si.targetTokenAmount;
            amount2 = tokenAmount - si.swappableTokenAmount;
        }

        (provided1, provided2, toMint) = _provideLiquidity(amount1, amount2, senderPubkey, senderAddress, lpWallet);
        inputTokenRemainder = isT1 ? (amount1 - provided1) : (amount2 - provided2);
    }


    /**
     * Internal function for liquidity providing using both tokens
     * @notice This function changes LP volumes
     * @param amount1 Amount of first token provided by user
     * @param amount2 Amount of second token provided by user
     * @param senderPubkey Public key of user that provides liquidity
     * @param senderAddress Address of TON wallet of user 
     * @param lpWallet Address of user's LP wallet
     */
    _provideLiquidity(uint128 amount1, uint128 amount2, uint256 senderPubkey, address senderAddress, address lpWallet)
         private
         returns (uint128 provided1, uint128 provided2, uint256 toMint)
     {
         (provided1, provided2, toMint) = _calculateProvidingLiquidityInfo(amount1, amount2);
         lps[T1] += provided1;
         lps[T2] += provided2;
         liquidityTokensMinted += toMint;
 
         /*
             If user doesn't have wallet for LP tokens - we create one for user
         */
         if (lpWallet.value == 0) {
             IRootTokenContract(lpTokenRootAddress).deployWallet{
                 value: msg.value/2,
                 flag: 0
             }(uint128(toMint), msg.value/4, senderPubkey, senderAddress, senderAddress);
         } else {
             IRootTokenContract(lpTokenRootAddress).mint(uint128(toMint), lpWallet);
         }
     }





    /**
     * @property
     * @returns {Boolean}
     */
    get isLiquidityProvided() {
        return this.lp1 > 0 && this.lp2 > 0;
    }
}