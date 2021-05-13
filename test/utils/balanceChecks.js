const SwapPairContract = require("../../contractWrappers/swap/swapPairContract");
const SwapPairSimulatorLight = require("../simulation/SwapPairSimulatorLight");

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
 * 
 * @param {import("../actors/user").WalletsStatesChanging} walletState 
 * @param {import("../actors/user").WalletsState} deltas 
 * @param {String[]} addresses
 * @returns {Boolean}
 */
function checkBalanceDeltas(walletState, deltas, addresses) {
    let flag = true;
    for (let address of addresses) {
        flag = flag && (walletState.start[address].balance - walletState.finish[address].balance == deltas[address]);
    }
    return flag;
}

/**
 * 
 * @param {SwapPairContract} swapPairInstance 
 * @param {SwapPairSimulatorLight} swapPairSimulator 
 * @returns {PoolsState}
 */
async function checkPoolEquality(swapPairInstance, swapPairSimulator) {
    let swapPairLP = await swapPairInstance.getCurrentExchangeRate();
    let swapPairSimLP = swapPairSimulator.poolsInfo;
    let flagLP1 = swapPairLP.lp1 == swapPairSimLP.lp1;
    let flagLP2 = swapPairLP.lp2 == swapPairSimLP.lp2;
    let flagMinted = swapPairLP.lpTokensMinted == swapPairSimLP.minted;
    return {
        genaral: flagLP1 && flagLP2 && flagMinted,
        lp1: flagLP1,
        lp2: flagLP2,
        minted: flagMinted
    }

}



module.exports = {
    checkBalanceDeltas,
    checkPoolEquality
};