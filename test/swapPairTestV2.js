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
const wallet = require('../config/contracts/walletParameters');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

var rootSwapContract;
var swapPairContract;
var tip3Tokens;
var tip3TokensConfig;

var keysRequired = 0;
var transferAmount = [];

var giverSC = new freeton.ContractWrapper(
    ton,
    giverConfig.abi,
    null,
    giverConfig.address,
);

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

    tokenConfig.root.keys = ton.keys[0];
    tokenConfig.root.config.initParams.root_public_key = '0x' + tonInstance.keys[0].public;

    for (let i = 0; i < walletConfig.walletsAmount; i++) {
        let walletConfig = copyJSON(config.wallet);
        walletConfig.keys = ton.keys[i];
        walletConfig.config.initParams.wallet_public_key = '0x' + tonInstance.keys[i].public;
        tokenConfig.walletsConfig.push(walletConfig);
    }

    return config;
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

    config.pair.keyPair = tonInstance.keys[1];
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
function deployTIP3(tonInstance, tokenConfig, giverSC) {
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
        await rootSC.mintTokensToWallet(wallets[contractId], tokenConfig.tokensAmount);
    }

    return {
        wallets: wallets,
        root: rootSC
    }
}

describe('Test of swap pairs', async function() {
    it('Preinit stage', async function() {
        for (let i = 0; i < pairsConfig.pairs.length; i++)
            if (pairsConfig.pairs[i].walletsAmount > keysRequired)
                keysRequired = pairsConfig.pairs[i].walletsAmount;
    })

    it('Initial stage', async function() {
        logger.log('#####################################');
        logger.log('Setting up ton instance');
        await ton.setup(keysRequired);
        for (let tokenId = 0; tokenId < pairsConfig.pairs.length; tokenId++)
            tip3TokensConfig.push(initialTokenSetup(ton, pairsConfig.pairs[tokenId]));
    })

    it('Deploying TIP-3', async function() {
        logger.log('#####################################');
        try {
            for (let tokenId = 0; tokenId < tip3TokensConfig.length; tokenId++) {
                logger.log(`Deploying ${tokenId} TIP-3 token`);
                tip3Tokens.push(await deployTIP3(ton, tip3TokensConfig[tokenId], giverSC));
            }
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Initial config of swap contracts', async function() {
        logger.log('#####################################');
        swapConfig = initialSwapSetup(ton, swapConfig, tip3Tokens);
    })

    it('Loading contracts', async function() {
        logger.log('#####################################');

        try {
            logger.log('Loading swap pair contract');
            swapPairContract = new SwapPairContract(ton, swapConfig.pair, swapConfig.pair.keyPair);
            await swapPairContract.loadContract();

            logger.log('Loading root swap pair contract');
            swapConfig.root.initParams.swapPairCode = swapPairContract.swapPairContract.code;
            rootSwapContract = new RootSwapPairContarct(ton, swapConfig.root, swapConfig.root.keyPair);
            await rootSwapContract.loadContract();
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Deploying root contract', async function() {
        logger.log('#####################################');

        try {
            await rootSwapContract.deployContract(true);
            logger.success(`Root swap pair address: ${rootSwapContract.rootSwapPairContract.address}`);
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Get root swap pait contract information', async function() {
        logger.log('#####################################');

        try {
            let rootSwapPairInfo = await rootSwapContract.getServiceInformation();
            // TODO: здесь должны быть нормальные проверки на полученную информацию
            logger.log(`Owner pubkey: ${rootSwapPairInfo.ownerPubkey}`);
            logger.log(`Expected pubkey: ${rootSwapContract.keyPair.public}`);
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Deploy swap pair contract from root contract', async function() {
        logger.log('#####################################');

        try {
            // TODO: нормально распарсить вывод вызова функции контракта
            await rootSwapContract.deploySwapPair(
                swapConfig.pair.initParams.token1,
                swapConfig.pair.initParams.token2
            );

        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Getting information about deployed pair', async function() {
        logger.log('#####################################');

        try {
            let output = await rootSwapContract.getPairInfo(
                swapConfig.pair.initParams.token1,
                swapConfig.pair.initParams.token2
            );

            if (!a.swapPairAddress) {
                throw new Error(`Strange output of getPairInfo function: ${JSON.stringify(output)}`)
            }

            expect(output.tokenRoot1).equal(swapConfig.pair.initParams.token1);
            expect(output.tokenRoot2).equal(swapConfig.pair.initParams.token2);
            expect(output.rootContract).equal(rootSwapContract.rootSwapPairContract.address);

            swapPairContract.swapPairContract.address = output.swapPairAddress;

            logger.success('Information check passed');

        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Getting information about swap pair from swap pair', async function() {
        logger.log('#####################################');

        try {
            let output = swapPairContract.getPairInfo();

            expect(output.tokenRoot1).equal(swapConfig.pair.initParams.token1);
            expect(output.tokenRoot2).equal(swapConfig.pair.initParams.token2);
            expect(output.rootContract).equal(rootSwapContract.rootSwapPairContract.address);

            swapPairContract.tokenWallets.push(output.tokenWallet1, output.tokenWallet2);

            logger.success('Information check passed');
        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    })

    it('Transferring tokens to swap pair wallet', async function() {
        logger.log('#####################################');

        try {
            transferAmount = [];
            for (let tokenId = 0; tokenId < tip3TokensConfig.pairs.length; tokenId++)
                transferAmount.push(tip3TokensConfig.pairs[tokenId].tokensAmount);

            for (let tokenId = 0; tokenId < tip3Tokens.length; tokenId++) {
                logger.log(`Transferring ${tokenId} tokens to swap pair wallet`);
                for (let walletId = 0; walletId < tip3Tokens[tokenId].wallets.length; walletId++) {
                    logger.log(`transferring tokens from № ${walletId} wallet`)
                    await tip3Tokens[tokenId].wallets[walletId].transfer(
                        swapPairContract.tokenWallets[tokenId],
                        transferAmount[tokenId]
                    )
                }
            }

            logger.success('Transfer finished');

        } catch (err) {
            logger.error(err);
            process.exit(1);
        }
    });

    it('Checking if all tokens are credited to virtual balance', async function() {

    })
})