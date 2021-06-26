const User = require("../actors/user");
const RootContract = require("../../contractWrappers/tip3/rootContract");
const TIP3Deployer = require("../../contractWrappers/util/tip3Deployer");
const RootSwapPairContract = require("../../contractWrappers/swap/rootSwapPairContract");
const SwapPairContract = require("../../contractWrappers/swap/swapPairContract");

const freeton = require('../../src');

const rootTIP3Params = require('../../config/contracts/rootTIP3Config');
const swapConfig = require('../../config/contracts/swapPairContractsConfig');
const testScenario = require('../../config/general/testScenario');

const { deployTIP3Root, initialTokenSetup, getTIP3Codes, createRootSwapPairConfig, awaitForContractDeployment } = require("../utils/util");
/**
 * 
 * @param {User[]} users 
 * @returns {User[]}
 */
async function deployMultisigForUsers(users) {
    for (let user of users) {
        await user.createMultisigWallet();
    }

    return users;
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance
 * @returns {{tokens: RootContract[], firstTIP3Address: String, secondTIP3Address: String}}
 */
async function deployTIP3Tokens(tonInstance) {
    /**
     * @type {RootContract[]}
     */
    let tip3RootContracts = [];

    for (let tip3Index = 0; tip3Index < rootTIP3Params.length; tip3Index++)
        tip3RootContracts.push(await deployTIP3Root(tonInstance, await initialTokenSetup(tonInstance, rootTIP3Params[tip3Index])));

    let firstTIP3Address = tip3RootContracts[0].getAddress();
    let secondTIP3Address = tip3RootContracts[1].getAddress();

    return {
        tokens: tip3RootContracts,
        firstTIP3Address: firstTIP3Address,
        secondTIP3Address: secondTIP3Address
    }
}

/**
 * 
 * @param {User[]} users 
 * @param {RootContract[]} tip3RootContracts
 * @returns {User[]}
 */
async function deployTIP3Wallets(users, tip3RootContracts) {
    /**
     * @name user
     * @type User
     */
    let user;
    for (let tip3Index = 0; tip3Index < rootTIP3Params.length; tip3Index++)
        for (user of users)
            await user.createWallet(tip3RootContracts[tip3Index], testScenario[tip3Index]);
    return users;
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @returns {TIP3Deployer}
 */
async function deployTIP3Deployer(tonInstance) {
    let tip3Deployer = new TIP3Deployer(tonInstance, tonInstance.keys[0]);
    let tip3Codes = await getTIP3Codes(tonInstance);
    await tip3Deployer.deployContract(tip3Codes.root, tip3Codes.wallet);
    return tip3Deployer;
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @param {TIP3Deployer} tip3Deployer
 * @param {Number} spCodeVersion
 * @returns {RootSwapPairContract}
 */
async function deployRootSwapPairContract(tonInstance, tip3Deployer, spCodeVersion = 1) {
    let rootSwapPairConfig = await createRootSwapPairConfig(swapConfig, tip3Deployer.getAddress(), tonInstance);
    let rootSwapPairContract = new RootSwapPairContract(tonInstance, rootSwapPairConfig, tonInstance.keys[0]);
    await rootSwapPairContract.loadContract();
    await rootSwapPairContract.deployContract(true, spCodeVersion);
    return rootSwapPairContract;
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @param {RootSwapPairContract} rootSwapPairContract 
 * @param {RootContract[]} tip3Tokens 
 * @returns {{swapPairContract: SwapPairContract, lpTokenRootAddress: String}}
 */
async function deploySwapPair(tonInstance, rootSwapPairContract, tip3Tokens) {
    let firstTIP3Address = tip3Tokens[0].getAddress();
    let secondTIP3Address = tip3Tokens[1].getAddress();
    await rootSwapPairContract.deploySwapPair(firstTIP3Address, secondTIP3Address);
    let swapPairContract = new SwapPairContract(tonInstance, tonInstance.keys[0]);
    await swapPairContract.loadContract();
    swapPairContract.setContractAddress(
        await rootSwapPairContract.getFutureSwapPairAddress(firstTIP3Address, secondTIP3Address)
    );
    await awaitForContractDeployment(swapPairContract.getAddress(), tonInstance);
    await rootSwapPairContract.awaitSwapPairInitialization(firstTIP3Address, secondTIP3Address, swapPairContract);
    await swapPairContract.getSetPairInfo();
    return {
        swapPairContract: swapPairContract,
        lpTokenRootAddress: swapPairContract.info.lpTokenRoot
    }
}


module.exports = {
    deployMultisigForUsers,
    deployTIP3Tokens,
    deployTIP3Wallets,
    deployTIP3Deployer,
    deployRootSwapPairContract,
    deploySwapPair
}