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
 * Send grams to address
 * @param {freeton.ContractWrapper} giver 
 * @param {String} address 
 * @param {Number} amount 
 */
async function sendGrams(giver, address, amount) {
    await giver.run(
        'sendGrams', {
            dest: address,
            amount: amount
        }, null
    );
}

/**
 * 
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} walletConfig 
 * @param {String} callbackAddress
 */
function initialTokenSetup(tonInstance, walletConfig, callbackAddress) {
    let i = 0;
    let updatedConfig = {
        pairs: []
    };

    for (let pair of walletConfig.pairs) {
        pair.wallet1.keys = tonInstance.keys[i * 3 + 0];
        pair.wallet1.config.initParams.wallet_public_key = '0x' + pair.wallet1.keys.public;
        pair.wallet2.keys = tonInstance.keys[i * 3 + 1];
        pair.wallet2.config.initParams.wallet_public_key = '0x' + pair.wallet2.keys.public;
        pair.root.keys = tonInstance.keys[i * 3 + 2];
        pair.root.config.initParams.root_public_key = '0x' + pair.root.keys.public;

        pair.callbackAddress = callbackAddress;
        i += 1;

        updatedConfig.pairs.push(pair);
    }

    return updatedConfig;
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
    let wallet2 = new Wallet(tonInstance, pairConfig.wallet2.config, pairConfig.wallet2.keys);
    let rootSC = new RootContract(tonInstance, pairConfig.root.config, pairConfig.root.keys);
    let dw = new WalletDeployer(tonInstance, { initParams: {}, constructorParams: {} }, pairConfig.root.keys);

    logger.log('Loading wallet contracts');
    await wallet1.loadContract();
    await wallet2.loadContract();

    logger.log('Loading root contract');
    pairConfig.root.config.initParams.wallet_code = wallet1.walletContract.code;
    rootSC.setConfig(pairConfig.root.config);
    await rootSC.loadContract();

    logger.log('Deploying root contract');

    await rootSC.deployContract();

    logger.log('Load proxy contract');

    await dw.loadContract();

    logger.log('Deploy proxy contract');

    await dw.deployContract(rootSC.rootContract.address);
    logger.success(`DW address: ${dw.walletDeployContract.address}`);

    logger.log('Deploying wallets');

    await dw.deployWallet(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
    await dw.deployWallet(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);
    logger.success('Wallets deployed');

    logger.log('Calculating future wallet addresses');

    let w1address = await rootSC.calculateFutureWalletAddress(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
    let w2address = await rootSC.calculateFutureWalletAddress(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);

    wallet1.walletContract.address = w1address;
    wallet2.walletContract.address = w2address;

    logger.log('Distributing tons');

    await sendGrams(giverSC, wallet1.walletContract.address, CRYSTAL_AMOUNT);
    await sendGrams(giverSC, wallet2.walletContract.address, CRYSTAL_AMOUNT);
    await sendGrams(giverSC, rootSC.rootContract.address, CRYSTAL_AMOUNT);
    logger.success('tonInstance crystal distribution finished');

    logger.log('Setting callback address');
    await wallet1.setCallbackAddress(pairConfig.callbackAddress);
    await wallet2.setCallbackAddress(pairConfig.callbackAddress);

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
        swapConfig = setupSwapKeys(ton, swapConfig);
        logger.success('TON instance set up');
    });

    it('Load swap pair contract', async function() {
        logger.log('#####################################');
        logger.log('Loading swap pair contract and configuring configs')
        swapPairContract = new SwapPairContract(ton, swapConfig.pair, swapConfig.pair.keys);
        await swapPairContract.loadContract();

        let futureSwapPairAddress = await swapPairContract.deployContract(true);

        pairsConfig = initialTokenSetup(ton, pairsConfig, futureSwapPairAddress);
        logger.success('Swap pair loaded');
    });

    it('Load root swap pair contract', async function() {
        logger.log('#####################################');
        logger.log('Loading root swap pair contract');
        swapConfig.root.initParams.swapPairCode = swapPairContract.swapPairContract.code;
        swapConfig.root.initParams.swapPairCodeVersion = {
            contractCodeVersion: 1
        };
        swapConfig.root.initParams.ownerPubkey = '0x' + ton.keys[0].public;
        rootSwapContract = new RootSwapPairContarct(ton, swapConfig.root, swapConfig.root.keys);
        await rootSwapContract.loadContract();
        logger.success('Contract loaded');
    });

    it('Deploy root swap pair contract', async function() {
        logger.log('#####################################');
        this.timeout(DEFAULT_TIMEOUT);
        await rootSwapContract.deployContract();
        logger.log(`Contract address: ${rootSwapContract.rootSwapPairContract.address}`)
        logger.success('Contract deployed')
    })

    it('Deploying TIP-3 pairs', async function() {
        logger.log('#####################################');
        logger.log('Creating TIP-3 tokens');
        this.timeout(DEFAULT_TIMEOUT);
        pair1 = await deployTIP3(ton, pairsConfig.pairs[0], giverSC);
        pair2 = await deployTIP3(ton, pairsConfig.pairs[1], giverSC);
        logger.success('TIP-3 tokens created successfully');
    });

    it(`Checking root function 'getServiceInformation'`, async function() {
        logger.log('#####################################');
        logger.log('Getting service information');
        this.timeout(DEFAULT_TIMEOUT);
        let serviceInfo = await rootSwapContract.getServiceInformation();
        logger.success('Service information received');
    })

    it(`Checking root function 'checkIfPairExists'`, async function() {
        logger.log('#####################################');
        this.timeout(DEFAULT_TIMEOUT);
        let pe1 = await rootSwapContract.checkIfPairExists(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        let pe2 = await rootSwapContract.checkIfPairExists(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.log(JSON.stringify(pe1, null, '\t'));
        logger.success('check for checkIfPairExists finished');
    });

    it('Deploying pair', async function() {
        logger.log('#####################################');
        logger.log('Deploying swap pair from root contract');
        this.timeout(DEFAULT_TIMEOUT);
        await rootSwapContract.deploySwapPair(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        logger.success('Pair deployed');
    });

    it('Get XOR', async function() {
        logger.log('#####################################');
        logger.log('Getting XOR');
        this.timeout(DEFAULT_TIMEOUT);
        logger.log(await rootSwapContract.getXOR(pair1.rc.rootContract.address, pair2.rc.rootContract.address));
        logger.log(await rootSwapContract.getXOR(pair1.rc.rootContract.address, pair2.rc.rootContract.address));
        logger.success('asdf');
    })

    it('Trying to deploy already deployed pair', async function() {
        logger.log('#####################################');
        logger.log('This must fail :)');
        this.timeout(DEFAULT_TIMEOUT);
        try {
            await rootSwapContract.deploySwapPair(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
            throw new Error('Contract finished successfully, but had to fail');
        } catch (e) {
            logger.success('Task successfully failed');
        }
    });

    it('Check if pair exists after deploy', async function() {
        logger.log('#####################################');
        this.timeout(DEFAULT_TIMEOUT);
        let pe1 = await rootSwapContract.checkIfPairExists(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        await rootSwapContract.checkIfPairExists(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.success('Hooray!')
    });

    it('Get information about pair', async function() {
        logger.log('#####################################');
        this.timeout(DEFAULT_TIMEOUT);
        let pi1 = await rootSwapContract.getPairInfo(pair1.rc.rootContract.address, pair2.rc.rootContract.address);
        await rootSwapContract.getPairInfo(pair2.rc.rootContract.address, pair1.rc.rootContract.address);
        logger.success('Got pair info');
    });
})