const SwapPairContract = require("../../contractWrappers/swap/swapPairContract");
const SwapPairSimulatorWrapper = require("../simulation/SwapPairSimulatorWrapper");

/**
 * @typedef PoolsState
 * @type {Object}
 * 
 * @property {Boolean} general
 * @property {Boolean} lp1
 * @property {Boolean} lp2
 * @property {Boolean} minted
 */

/**
 * @typedef OperationResult
 * @type {Object}
 * 
 * @property {PoolsState} tokenDeltaChecks
 * @property {PoolsState} poolsState
 * @property {Boolean} totalResult
 */

/**
 * 
 * @param {Record<String, WalletState>} walletState 
 * @param {Record<String, WalletState>} deltas 
 * @param {String[]} addresses
 * @returns {PoolsState}
 */
function checkBalanceDeltas(walletsDeltas, expectedDeltas, firstTIP3Address, secondTIP3Address, lpTokenRoot) {
    let lp1 = walletsDeltas[firstTIP3Address] == expectedDeltas[firstTIP3Address];
    let lp2 = walletsDeltas[secondTIP3Address] == expectedDeltas[secondTIP3Address];
    let minted = walletsDeltas[lpTokenRoot] == expectedDeltas[lpTokenRoot];
    return {
        general: lp1 && lp2 && minted,
        lp1: lp1,
        lp2: lp2,
        minted: minted
    }
}

/**
 * 
 * @param {SwapPairContract} swapPairInstance 
 * @param {SwapPairSimulatorWrapper} swapPairSimulator 
 * @returns {PoolsState}
 */
async function checkPoolEquality(swapPairInstance, swapPairSimulator) {
    let swapPairLP = await swapPairInstance.getCurrentExchangeRate();
    let swapPairSimLP = swapPairSimulator.poolsInfo;
    let flagLP1 = swapPairLP.lp1 == swapPairSimLP.lp1;
    let flagLP2 = swapPairLP.lp2 == swapPairSimLP.lp2;
    let flagMinted = swapPairLP.lpTokensMinted == swapPairSimLP.minted;
    return {
        general: flagLP1 && flagLP2 && flagMinted,
        lp1: flagLP1,
        lp2: flagLP2,
        minted: flagMinted
    }
}

/**
 * 
 * @param {import("../actors/user").WalletsStatesChanging} state 
 * @param {String[]} addresses
 * @returns {WalletDeltas}
 */
function calculateDelta(state, firstTIP3Address, secondTIP3Address, lpTokenRoot) {
    let res = {};
    res[firstTIP3Address] = BigInt(state.finish[firstTIP3Address].balance - state.start[firstTIP3Address].balance);
    res[secondTIP3Address] = BigInt(state.finish[secondTIP3Address].balance - state.start[secondTIP3Address].balance);
    res[lpTokenRoot] = BigInt(state.finish[lpTokenRoot].balance - state.start[lpTokenRoot].balance);
    return res;
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim 
 * @param {import("../actors/user").WalletsStatesChanging} contractRes 
 * @param {Record<String, BigInt>} simRes 
 * @returns 
 */
async function checkAll(swapPairContract, swapPairSim, contractRes, simRes) {
    let firstTIP3Address = swapPairContract.info.tokenRoot1;
    let secondTIP3Address = swapPairContract.info.tokenRoot2;
    let lpTokenRoot = swapPairContract.info.lpTokenRoot;
    let balanceDeltas = calculateDelta(contractRes, firstTIP3Address, secondTIP3Address, lpTokenRoot);
    let checkTokensResult = checkBalanceDeltas(balanceDeltas, simRes, firstTIP3Address, secondTIP3Address, lpTokenRoot);

    let poolsEqual = await checkPoolEquality(swapPairContract, swapPairSim);
    let general = checkTokensResult.general && poolsEqual.general;
    return {
        tokenDeltaChecks: checkTokensResult,
        poolsState: poolsEqual,
        totalResult: general
    }
}


module.exports = {
    checkBalanceDeltas,
    checkPoolEquality,
    calculateDelta,
    checkAll
};