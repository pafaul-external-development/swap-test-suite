const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('../config/general/constants');

const RootContract = require('../contractWrappers/rootContract');
const Wallet = require('../contractWrappers/walletContract');
const Giver = require('../contractWrappers/giverContract');
const WalletDeployer = require('../contractWrappers/walletDeployer');
const RootSwapPairContarct = require('../contractWrappers/rootSwapPairContract');
const SwapPairContract = require('../contractWrappers/swapPairContract');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let pairsConfig = require('../config/contracts/walletsForSwap');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

let giverSC = new freeton.ContractWrapper(
    ton,
    giverConfig.abi,
    null,
    giverConfig.address,
);

/**
 * deploy TIP-3 token and 2 wallets
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} pairConfig 
 * @param {Giver} giverSC 
 */
async function deployTIP3(tonInstance, pairConfig, giverSC) {

    logger.log('#####################################');
    logger.log('Initial stage');

    let wallet1 = new Wallet(tonInstance, pairConfig.wallet1.config, pairConfig.wallet1.keys);
    let wallet2 = new Wallet(tonInstance, pairConfig.wallet2.config, pairConfig.wallet1.keys);
    let rootSC = new RootContract(tonInstance, pairConfig.rootParameters, pairConfig.rootParameters.keys);
    let dw = new WalletDeployer(tonInstance, { initParams: {}, constructorParams: {} }, pairConfig.rootParameters.keys);

    logger.log('#####################################');
    logger.log('Loading wallet contracts');
    await wallet1.loadContract();
    await wallet2.loadContract();

    logger.log('#####################################');
    logger.log('Loading root contract');
    rootContractParameters.initParams.root_public_key = '0x' + tonInstance.keys[0].public;
    rootContractParameters.initParams.wallet_code = wallet1.walletContract.code;
    rootSC.setConfig(rootContractParameters);
    await rootSC.loadContract();

    logger.log('#####################################');
    logger.log('Deploying root contract');

    await rootSC.deployContract();
    logger.log('Root balance: ', await tonInstance.getBalance(rootSC.rootContract.address));

    logger.log('#####################################');
    logger.log('Loading proxy contract');

    await dw.loadContract();

    logger.log('#####################################');
    logger.log('Deploy proxy contract');

    await dw.deployContract(rootSC.rootContract.address);
    logger.success(`DW address: ${dw.walletDeployContract.address}`);

    logger.log('#####################################');
    logger.log('Deploying wallets');

    await dw.deployWallet(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
    await dw.deployWallet(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);
    logger.success('Wallets deployed');

    logger.log('#####################################');
    logger.log('Calculating future wallet addresses');

    let w1address = await rootSC.calculateFutureWalletAddress(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
    let w2address = await rootSC.calculateFutureWalletAddress(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);

    wallet1.walletContract.address = w1address;
    wallet2.walletContract.address = w2address;

    logger.log('#####################################');
    logger.log('Distributing tons');

    await sendGrams(giverSC, wallet1.walletContract.address, CRYSTAL_AMOUNT);
    await sendGrams(giverSC, wallet2.walletContract.address, CRYSTAL_AMOUNT);
    await sendGrams(giverSC, rootSC.rootContract.address, CRYSTAL_AMOUNT);
    logger.success('tonInstance crystal distribution finished');

    logger.log('#####################################');
    logger.log('Setting callback address');
    await wallet1.setCallbackAddress(pairConfig.callbackAddress);
    await wallet2.setCallbackAddress(pairConfig.callbackAddress);

    logger.log('#####################################');
    logger.log('Minting tokens');

    await rootSC.mintTokensToWallets(wallet1, wallet2, pairConfig.tokensAmount);
    logger.success(`Tokens minted successfully`);

    return {
        w1: wallet1,
        w2: wallet2,
        rc: rootSC
    }
}

async function main() {
    logger.log('#####################################');
    logger.log('Creating TIP-3 tokens');
    let pair1 = await deployTIP3(ton, pairsConfig.pairs[0], giverSC);
    let pair2 = await deployTIP3(ton, pairsConfig.pairs[1], giverSC);
    logger.success('TIP-3 tokens created successfully');

    let rootSwapContract = new RootSwapPairContarct()
}