const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('./config/constants');

async function deployTIP3(tonInstance, rootParameters, walletParameters) {

    logger.log('#####################################');
    logger.log('Initial stage');

    wallet1 = new Wallet(tonInstance, walletParameters.pair1.wallet1.config, walletParameters.pair1.wallet1.keys);
    wallet2 = new Wallet(tonInstance, walletParameters.pair1.wallet2.config, walletParameters.pair1.wallet1.keys);
    rootSC = new RootContract(tonInstance, rootParameters, rootParameters.keys);
    giverCS = new Giver(tonInstance, giverConfig.keyPair);
    dw = new WalletDeployer(tonInstance, { initParams: {}, constructorParams: {} }, rootParameters.keys);

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
    await wallet1.setCallbackAddress(walletParameters.pair1.callbackAddress);
    await wallet2.setCallbackAddress(walletParameters.pair1.callbackAddress);

    logger.log('#####################################');
    logger.log('Minting tokens');

    await rootSC.mintTokensToWallets(wallet1, wallet2, testScenario.pair1.tokensAmount);
    logger.success(`Tokens minted successfully`);

    return {
        w1: wallet1,
        w2: wallet2,
        rc: rootSC
    }
}