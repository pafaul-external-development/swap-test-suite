const freeton = require('../src');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT } = require('../config/general/constants');

const RootContract = require('../contractWrappers/tip3/rootContract');
const Wallet = require('../contractWrappers/tip3/walletContract');
const WalletDeployer = require('../contractWrappers/tip3/walletDeployer');
const { sleep } = require('../src/utils');

/**
 * String to hex
 * @param {String} str 
 * @returns 
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * Copy JSON
 * @param {JSON} json 
 */
function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}

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
 * Initial token config creation
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} config 
 */
function initialTokenSetup(tonInstance, config) {
    let tokenConfig = copyJSON(config);
    tokenConfig.walletsConfig = [];

    tokenConfig.root.keys = tonInstance.keys[0];
    tokenConfig.root.config.constructorParams.root_public_key_ = '0x' + tonInstance.keys[0].public;

    for (let i = 0; i < config.walletsAmount; i++) {
        let walletConfig = copyJSON(config.wallet);
        walletConfig.keys = tonInstance.keys[i];
        walletConfig.config.initParams.wallet_public_key = '0x' + tonInstance.keys[i].public;
        tokenConfig.walletsConfig.push(walletConfig);
    }

    return tokenConfig;
}

/**
 * Initial swap config
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} config 
 * @param {Array} tokens
 */
function initialSwapSetup(tonInstance, config, tokens) {
    config.root.keyPair = tonInstance.keys[0];
    config.root.initParams.ownerPubkey = '0x' + tonInstance.keys[0].public;

    config.pair.keyPair = tonInstance.keys[0];
    config.pair.initParams.token1 = tokens[0].root.rootContract.address;
    config.pair.initParams.token2 = tokens[1].root.rootContract.address;

    return config;
}

/**
 * Deploy TIP-3 token root contract and wallets
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} tokenConfig 
 * @param {freeton.ContractWrapper} giverSC
 */
async function deployTIP3(tonInstance, tokenConfig, giverSC) {
    let rootSC;
    let proxyContract;
    let wallets = [];

    logger.log('#####################################');
    logger.log('Initial stage');

    for (let contractId = 0; contractId < tokenConfig.walletsAmount; contractId++) {
        let walletConfig = tokenConfig.walletsConfig[contractId];
        wallets.push(new Wallet(tonInstance, walletConfig.config, walletConfig.keys));
        await wallets[contractId].loadContract();
    }

    tokenConfig.root.config.initParams.wallet_code = wallets[0].walletContract.code;
    rootSC = new RootContract(tonInstance, tokenConfig.root.config, tokenConfig.root.keys);
    await rootSC.loadContract();

    logger.log('Deploying root contract');
    await rootSC.deployContract();

    logger.log('Loading and deploying proxy contract');
    proxyContract = new WalletDeployer(tonInstance, {
        initParams: {},
        constructorParams: {}
    }, tokenConfig.root.keys);
    await proxyContract.loadContract();
    await proxyContract.deployContract(rootSC.rootContract.address);
    logger.log(`Proxy contract address: ${proxyContract.walletDeployContract.address}`);

    logger.log('Deploying wallet contracts and sending them tons');
    for (let contractId = 0; contractId < wallets.length; contractId++) {
        let walletConfig = wallets[contractId].initParams;
        await proxyContract.deployWallet(walletConfig.wallet_public_key, walletConfig.owner_address);

        let calculatedAddress = await rootSC.calculateFutureWalletAddress(walletConfig.wallet_public_key, walletConfig.owner_address);
        wallets[contractId].walletContract.address = calculatedAddress;

        await sendGrams(giverSC, calculatedAddress, CRYSTAL_AMOUNT);
    }

    logger.log('Minting tokens to wallets');
    for (let contractId = 0; contractId < wallets.length; contractId++) {
        await rootSC.mintTokensToWallet(wallets[contractId], (tokenConfig.tokensAmount).toLocaleString('en').replace(/,/g, ''));
    }

    return {
        wallets: wallets,
        root: rootSC
    }
}

// _______   ________  __       __   ______   _______   __    __ 
// /       \ /        |/  |  _  /  | /      \ /       \ /  |  /  |
// $$$$$$$  |$$$$$$$$/ $$ | / \ $$ |/$$$$$$  |$$$$$$$  |$$ | /$$/ 
// $$ |__$$ |$$ |__    $$ |/$  \$$ |$$ |  $$ |$$ |__$$ |$$ |/$$/  
// $$    $$< $$    |   $$ /$$$  $$ |$$ |  $$ |$$    $$< $$  $$<   
// $$$$$$$  |$$$$$/    $$ $$/$$ $$ |$$ |  $$ |$$$$$$$  |$$$$$  \  
// $$ |  $$ |$$ |_____ $$$$/  $$$$ |$$ \__$$ |$$ |  $$ |$$ |$$  \ 
// $$ |  $$ |$$       |$$$/    $$$ |$$    $$/ $$ |  $$ |$$ | $$  |
// $$/   $$/ $$$$$$$$/ $$/      $$/  $$$$$$/  $$/   $$/ $$/   $$/ 

/**
 * Deploy TIP-3 token root contract and wallets
 * @param {freeton.TonWrapper} tonInstance 
 * @param {JSON} tokenConfig
 */
async function deployTIP3Root(tonInstance, tokenConfig) {
    let rootSC;

    logger.log('#####################################');
    logger.log('Initial stage');

    let wallet = new Wallet(tonInstance);
    await wallet.loadContract();

    tokenConfig.root.config.initParams.wallet_code = wallet.walletContract.code;
    rootSC = new RootContract(tonInstance, tokenConfig.root.config, tokenConfig.root.keys);
    await rootSC.loadContract();

    logger.log('Deploying root contract');
    await rootSC.deployContract();

    return rootSC;
}

/**
 * create config for root swap pair contract
 * @param {JSON} config 
 * @param {freeton.TonWrapper} tonInstance 
 * @returns 
 */
function createRootSwapPairConfig(config, tonInstance) {
    config.root.keyPair = tonInstance.keys[0];
    config.root.initParams.ownerPubkey = '0x' + tonInstance.keys[0].public;

    return config;
}

/**
 * Wait until contract is deployed
 * @param {String} contractAddress 
 */
async function awaitForContractDeployment(contractAddress) {
    res = {
        acc_type: 0
    };
    while (res.acc_type == 0) {
        res = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: address }
            },
            result: 'acc_type'
        });
        sleep(1000);
    }
}

module.exports = {
    toHex,
    copyJSON,
    sendGrams,
    initialTokenSetup,
    initialSwapSetup,
    deployTIP3,
    deployTIP3Root,
    createRootSwapPairConfig,
    awaitForContractDeployment
}