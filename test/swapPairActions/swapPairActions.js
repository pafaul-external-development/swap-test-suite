const SwapPairContract = require("../../contractWrappers/swap/swapPairContract");
const User = require("../actors/user");
const SwapPairSimulatorWrapper = require("../simulation/SwapPairSimulatorWrapper");
const { checkAll } = require("../utils/balanceChecks");
const operationIds = require("./swapActionIds");

/**
 * @typedef ProvideLiquidityScenario
 * @type {Object}
 * 
 * @property {BigInt} token1Amount
 * @property {BigInt} token2Amount
 */

/**
 * @typedef WithdrawLiquidityScenario
 * @type {Object}
 * 
 * @property {BigInt} withdrawLPAmount
 */

/**
 * @typedef SwapScenario
 * @type {Object}
 * 
 * @property {String} tokenAddress
 * @property {BigInt} swapAmount
 */

/**
 * @typedef ProvideLiquidityOneTokenScenario
 * @type {Object}
 * 
 * @property {String} tokenAddress
 * @property {BigInt} tokenAmount
 */

/**
 * @typedef WithdrawLiquidityOneTokenScenario
 * @type {Object}
 * 
 * @property {BigInt} withdrawLPAmount
 * @property {String} tokenAddress
 */

/**
 * @typedef WalletDeltas
 * @type {Object}
 * 
 * @property {Record<String, BigInt>}
 */

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim
 * @param {User} user
 * @param {ProvideLiquidityScenario} provideScenario
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function provideLiquidity(swapPairContract, swapPairSim, user, provideScenario) {
    let provideStateChange = await user.provideLiquidity(
        swapPairContract,
        provideScenario.token1Amount.toString(),
        provideScenario.token2Amount.toString()
    );
    let simProvideResult = swapPairSim.provide(provideScenario.token1Amount, provideScenario.token2Amount);

    return await checkAll(swapPairContract, swapPairSim, provideStateChange, simProvideResult);
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim
 * @param {User} user
 * @param {WithdrawLiquidityScenario} withdrawScenario
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function withdrawLiquidity(swapPairContract, swapPairSim, user, withdrawScenario) {
    let withdrawStateChange = await user.withdrawTokens(
        swapPairContract,
        withdrawScenario.withdrawLPAmount.toString()
    );
    let simWithdrawResult = swapPairSim.withdraw(withdrawScenario.withdrawLPAmount);

    return await checkAll(swapPairContract, swapPairSim, withdrawStateChange, simWithdrawResult);
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim
 * @param {User} user
 * @param {SwapScenario} swapScenario
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function swap(swapPairContract, swapPairSim, user, swapScenario) {
    let swapStateChange = await user.swapTokens(
        swapPairContract,
        swapScenario.tokenAddress,
        swapScenario.swapAmount.toString()
    );
    let simSwapResult = swapPairSim.swap(swapScenario.tokenAddress, swapScenario.swapAmount);

    return await checkAll(swapPairContract, swapPairSim, swapStateChange, simSwapResult)
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim
 * @param {User} user
 * @param {ProvideLiquidityOneTokenScenario} provideScenario
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function provideLiquidityOneToken(swapPairContract, swapPairSim, user, provideScenario) {
    let provideStateChange = await user.provideLiquidityOneToken(
        swapPairContract,
        provideScenario.tokenAddress,
        provideScenario.tokenAmount.toString()
    );
    let simProvideResult = swapPairSim.provideOneToken(provideScenario.tokenAddress, provideScenario.tokenAmount);

    return await checkAll(swapPairContract, swapPairSim, provideStateChange, simProvideResult);
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim
 * @param {User} user
 * @param {WithdrawLiquidityOneTokenScenario} withdrawScenario
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function withdrawLiquidityOneToken(swapPairContract, swapPairSim, user, withdrawScenario) {
    let withdrawStateChange = await user.withdrawLiquidityOneToken(
        swapPairContract,
        withdrawScenario.tokenAddress,
        withdrawScenario.withdrawLPAmount.toString()
    );
    let simWithdrawResult = swapPairSim.withdrawOneToken(withdrawScenario.tokenAddress, withdrawScenario.withdrawLPAmount);

    return await checkAll(swapPairContract, swapPairSim, withdrawStateChange, simWithdrawResult);
}

/**
 * 
 * @param {SwapPairContract} swapPairContract 
 * @param {SwapPairSimulatorWrapper} swapPairSim 
 * @param {User.WalletsStatesChanging} operationDelta 
 * @param {Number} operationId 
 * @param {ProvideLiquidityScenario | WithdrawLiquidityScenario | SwapScenario | ProvideLiquidityOneTokenScenario | WithdrawLiquidityOneTokenScenario} operationParams 
 * @returns {Promise<import("../utils/balanceChecks").OperationResult>}
 */
async function checkIfOperationIsCorrect(swapPairContract, swapPairSim, operationDelta, operationId, operationParams) {
    /**
     * @type {import("../utils/balanceChecks").OperationResult}
     */
    let resultOfCheck = undefined;
    let simResult = undefined;
    switch (operationId) {
        case operationIds.provide:
            simResult = swapPairSim.provide(operationParams.token1Amount, operationParams.token2Amount);
            break;

        case operationIds.provideOne:
            simResult = swapPairSim.provideOneToken(operationParams.tokenAddress, operationParams.tokenAmount);
            break;

        case operationIds.swap:
            simResult = swapPairSim.swap(operationParams.tokenAddress, operationParams.swapAmount);
            break;

        case operationIds.withdraw:
            simResult = swapPairSim.withdraw(operationParams.withdrawLPAmount);
            break;

        case operationIds.withdrawOne:
            simResult = swapPairSim.withdrawOneToken(operationParams.tokenAddress, operationParams.withdrawLPAmount);
            break;
    }

    resultOfCheck = await checkAll(swapPairContract, swapPairSim, operationDelta, simResult)
    return resultOfCheck;
}

module.exports = {
    provideLiquidity,
    withdrawLiquidity,
    swap,
    provideLiquidityOneToken,
    withdrawLiquidityOneToken,
    checkIfOperationIsCorrect
};