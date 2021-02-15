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

var pairsConfig = require('../config/contracts/walletsForSwap');
var swapConfig = require('../config/contracts/swapPairContractsConfig');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

var rootSwapContract;
var swapPairContract;
var pair1;
var pair2;


var giverSC = new freeton.ContractWrapper(
    ton,
    giverConfig.abi,
    null,
    giverConfig.address,
);

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} walletConfig 
 * @param {String} callbackAddress
 */
function initialTokenSetup(tonInstance, walletConfig, callbackAddress) {
    let i = 0;
    for (let pair of walletConfig.pairs) {
        pair.wallet1.keys = tonInstance.keys[i * 3 + 0];
        pair.wallet1.config.initParams.wallet_public_key = tonInstance.keys[i * 3 + 0].public;
        pair.wallet2.keys = tonInstance.keys[i * 3 + 1];
        pair.wallet2.config.initParams.wallet_public_key = tonInstance.keys[i * 3 + 1].public;
        pair.root.keys = tonInstance.keys[i * 3 + 2];

        pair.callbackAddress = callbackAddress;
        i += 1;
    }
    return walletConfig;
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} walletConfig 
 */
function setupSwapKeys(tonInstance, swapConfig) {
    swapConfig.root.keys = tonInstance.keys[0];
    swapConfig.pair.keys = tonInstance.keys[1];
    return swapConfig;
}

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
    pairsConfig
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

describe('Test of swap pairs', async function() {
    it('Initial setup', async function() {
        logger.log('#####################################');
        logger.log('Setting up ton instance');
        await ton.setup(10);
        swapConfig = setupSwapKeys(tonInstance, swapConfig);
        logger.success('TON instance set up');
    });

    it('Load swap pair contract', async function() {
        logger.log('#####################################');
        logger.log('Loading swap pair contract and configuring configs')
        swapPairContract = new SwapPairContract(ton, swapConfig.pair, swapConfig.pair.keys);
        await swapPairContract.loadContract();

        let futureSwapPairAddress = await swapPairContract.deployContract(true);

        swapConfig.root.initParams.swapPairCode = swapPairContract.swapPairContract.code;
        swapConfig.root.initParams.swapPairCodeVersion = {
            contractCodeVersion: 1
        };

        pairsConfig = initialTokenSetup(tonInstance, pairsConfig, futureSwapPairAddress);
        logger.success('Swap pair loaded');
    });

    it('Load root swap pair contract', async function() {
        logger.log('#####################################');
        logger.log('Loading root swap pair contract');
        rootSwapContract = new RootSwapPairContarct(tonInstance, swapConfig.root, swapConfig.root.keys);
        await rootSwapContract.loadContract();
        logger.success('Contract loaded');
    });

    it('Deploying TIP-3 pairs', async function() {
        logger.log('#####################################');
        logger.log('Creating TIP-3 tokens');
        pair1 = await deployTIP3(ton, pairsConfig.pairs[0], giverSC);
        pair2 = await deployTIP3(ton, pairsConfig.pairs[1], giverSC);
        logger.success('TIP-3 tokens created successfully');
    });

    it(`Checking root function 'getServiceInformation'`, async function() {
        logger.log('#####################################');
        logger.log('Getting service information');
        let serviceInfo = await rootSwapContract.getServiceInformation();
        logger.log(JSON.stringify(serviceInfo, null, '\t'));
        logger.success('Service information received');
    })

    it(`Checking root function 'checkIfPairExists'`, async function() {
        logger.log('#####################################');
        let pe1 = await rootSwapContract.checkIfPairExists(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        let pe2 = await rootSwapContract.checkIfPairExists(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.log(JSON.stringify(pe1, null, '\t'));
        logger.success('check for checkIfPairExists finished');
    });

    it('Deploying pair', async function() {
        logger.log('#####################################');
        logger.log('Deploying swap pair from root contract');
        await rootSwapContract.deploySwapPair(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        logger.success('Pair deployed');
    });

    it('Trying to deploy already deployed pair', async function() {
        logger.log('#####################################');
        logger.log('This must fail :)');
        await rootSwapContract.deploySwapPair(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
    });

    it('Check if pair exists after deploy', async function() {
        logger.log('#####################################');
        let pe1 = await rootSwapContract.checkIfPairExists(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        await rootSwapContract.checkIfPairExists(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.log(JSON.stringify(pe1, null, '\t'));
        logger.success('Hooray!')
    });

    it('Get information about pair', async function() {
        logger.log('#####################################');
        let pi1 = await rootSwapContract.getPairInfo(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        await rootSwapContract.getPairInfo(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.log(JSON.stringify(pi1, null, '\t'));
        logger.success('fckn finally');
    });
})