const freeton = require('../../src');
const logger = require('mocha-logger');

const RootContract = require('../../contractWrappers/tip3/rootContract');
const { sleep } = require('../../src/utils');

/**
 * String to hex
 * @param {String} str 
 * @returns {String}
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * Copy JSON
 * @param {JSON} json 
 * @returns {Object}
 */
function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}

/**
 * Send grams to address
 * @param {freeton.ContractWrapper} giver 
 * @param {String} address 
 * @param {Promise<Number>} amount 
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
 * @param {import('../../config/contracts/rootContractParameters').RootTIP3Config} config 
 * @returns {import('../../config/contracts/rootContractParameters').RootTIP3Config}
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
 * @param {import('../../config/contracts/rootContractParameters').RootTIP3Config} rootConfig
 */
async function deployTIP3Root(tonInstance, rootConfig) {
    let rootSC;

    logger.log('#####################################');
    logger.log('Initial stage');

    rootSC = new RootContract(tonInstance, rootConfig.root.config, rootConfig.root.keys);
    await rootSC.loadContract();

    logger.log('Deploying root contract');
    await rootSC.deployContract();

    return rootSC;
}

/**
 * create config for root swap pair contract
 * @param {import('../../config/contracts/swapPairContractsConfig').SwapPairConfig} config 
 * @param {String} tip3DeployerAddress
 * @param {freeton.TonWrapper} tonInstance 
 * @returns {Promise<import('../../config/contracts/swapPairContractsConfig').SwapPairConfig>}
 */
async function createRootSwapPairConfig(config, tip3DeployerAddress, tonInstance) {
    config.root.keyPair = tonInstance.keys[0];
    config.root.initParams.ownerPubkey = '0x' + tonInstance.keys[0].public;
    config.root.constructorParams.tip3Deployer_ = tip3DeployerAddress;

    return config.root;
}

/**
 * create config for tip3 root contract
 * @param {freeton.TonWrapper} tonInstance 
 * @param {import('../../config/contracts/rootContractParameters').RootTIP3Config} config 
 * @returns {Promise<import('../../config/contracts/rootContractParameters').RootTIP3Config>}
 */
async function initialTokenSetup(tonInstance, config) {
    let rootConfig = copyJSON(config);

    rootConfig.root.keys = tonInstance.keys[0];
    rootConfig.root.config.constructorParams.root_public_key_ = '0x' + tonInstance.keys[0].public;

    let wallet = await freeton.requireContract(tonInstance, 'TONTokenWallet');
    rootConfig.root.config.initParams.wallet_code = wallet.code;

    return rootConfig;
}

/**
 * Get codes of tip3 contracts
 * @param {freeton.TonWrapper} tonInstance
 * @returns {Promise<{wallet: String, root: String}>} output with Root and wallet codes
 */
async function getTIP3Codes(tonInstance) {
    let wallet = await freeton.requireContract(tonInstance, 'TONTokenWallet');
    let root = await freeton.requireContract(tonInstance, 'RootTokenContract');
    return {
        wallet: wallet.code,
        root: root.code
    }
}

/**
 * Wait until contract is deployed
 * @param {String} contractAddress 
 * @param {freeton.TonWrapper} tonInstance
 */
async function awaitForContractDeployment(contractAddress, tonInstance) {
    res = {
        result: []
    };
    while (res.result.length == 0) {
        res = await tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: contractAddress }
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
    deployTIP3Root,
    createRootSwapPairConfig,
    awaitForContractDeployment,
    getTIP3Codes
}