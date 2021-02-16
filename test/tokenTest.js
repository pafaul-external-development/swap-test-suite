const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('./config/constants');

const testScenario = require('../config/general/testScenario');
const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let rootContractParameters = require('../config/contracts/rootContractParameters');
let walletParameters = require('../config/contracts/walletParameters');

const RootContract = require('../contractWrappers/rootContract');
const Wallet = require('../contractWrappers/walletContract');
const Giver = require('../contractWrappers/giverContract');
const CallbackContract = require('../contractWrappers/callbackContract');
const WalletDeployer = require('../contractWrappers/walletDeployer');

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

let rootSC;
let wallet1;
let wallet2;
let callbackSC;
let dw;

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

async function sendGrams(giver, address, amount) {
    await giver.run(
        'sendGrams', {
            dest: address,
            amount: amount
        }, null
    );
}

async function tokenTest() {

}

describe('Test for TIP-3 token', async function() {
    it('Setup', async function() {
        await ton.setup(4);

        expect(ton.keys).to.have.lengthOf(4, 'Wrong keys amount');
    });

    it('Initial stage', async function() {
        logger.log('#####################################');
        logger.log('Initial stage');
        // Setting initial wallet parameters
        walletParameters.initParams.grams = freeton.utils.convertCrystal('2', 'nano');
        wallet1Config = clone(walletParameters); // user wallet
        wallet2Config = clone(walletParameters); // swap pair wallet
        wallet1Config.initParams.wallet_public_key = '0x' + ton.keys[1].public;
        wallet2Config.initParams.wallet_public_key = '0x' + ton.keys[2].public;
        wallet1Config.initParams.owner_address = ZERO_ADDRESS;
        wallet2Config.initParams.owner_address = ZERO_ADDRESS;
        wallet1 = new Wallet(ton, wallet1Config, ton.keys[1]);
        wallet2 = new Wallet(ton, wallet2Config, ton.keys[2]);

        rootSC = new RootContract(ton, rootContractParameters, ton.keys[0]);

        giverCS = new Giver(ton, giverConfig.keyPair);
        callbackSC = new CallbackContract(ton, CallbackContract, ton.keys[0]);

        dw = new WalletDeployer(ton, { initParams: {}, constructorParams: {} }, ton.keys[0]);
    });

    it('Load wallet contracts', async function() {
        logger.log('#####################################');
        logger.log('Loading wallet contracts');
        await wallet1.loadContract();
        await wallet2.loadContract();
    })

    it('Load root contract', async function() {
        logger.log('#####################################');
        logger.log('Loading root contract');
        rootContractParameters.initParams.root_public_key = '0x' + ton.keys[0].public;
        rootContractParameters.initParams.wallet_code = wallet1.walletContract.code;
        rootSC.setConfig(rootContractParameters);
        await rootSC.loadContract();
    });

    it('Load callback contract', async function() {
        logger.log('#####################################');
        logger.log('Loading callback contract');
        this.timeout(DEFAULT_TIMEOUT);
        await callbackSC.loadContract();
    });

    it('Callback contract deploy', async function() {
        logger.log('#####################################');
        logger.log('Deploying callback contract');
        this.timeout(DEFAULT_TIMEOUT);
        await callbackSC.deployContract();
        logger.success(`callback SC address: ${callbackSC.callbackContract.address}`);
    });

    it('Deploy of root contract', async function() {
        logger.log('#####################################');
        logger.log('Deploying root contract');
        this.timeout(DEFAULT_TIMEOUT);
        await rootSC.deployContract();
        logger.log('Root balance: ', await ton.getBalance(rootSC.rootContract.address));
    });

    it('Root contract basic checks', async function() {
        logger.log('#####################################');
        logger.log('Running basic checks');
        this.timeout(DEFAULT_TIMEOUT);
    });

    it('Load deploy wallet contract', async function() {
        logger.log('#####################################');
        logger.log('Loading wallet deploy contract');
        this.timeout(DEFAULT_TIMEOUT);
        await dw.loadContract();
    });

    it('Deploy contract', async function() {
        logger.log('#####################################');
        logger.log('Deploy proxy contract');
        this.timeout(DEFAULT_TIMEOUT);
        await dw.deployContract(rootSC.rootContract.address);
        logger.success(`DW address: ${dw.walletDeployContract.address}`);
    });

    it('Wallet contracts deploy', async function() {
        logger.log('#####################################');
        logger.log('Deploying wallets');
        this.timeout(DEFAULT_TIMEOUT);
        await dw.deployWallet(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
        await dw.deployWallet(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);
        logger.success('Wallets deployed');
    });

    it('Calculate future wallet addresses', async function() {
        logger.log('#####################################');
        logger.log('Calculating future wallet addresses');
        this.timeout(DEFAULT_TIMEOUT);
        let w1address = await rootSC.calculateFutureWalletAddress(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
        let w2address = await rootSC.calculateFutureWalletAddress(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);

        wallet1.walletContract.address = w1address;
        wallet2.walletContract.address = w2address;

        logger.log(`wallet1 address: ${w1address}`);
        logger.log(`wallet2 address: ${w2address}`);
    });

    it('Ton crystal distribution', async function() {
        logger.log('#####################################');
        logger.log('Distributing tons');
        this.timeout(DEFAULT_TIMEOUT);
        await sendGrams(giverSC, callbackSC.callbackContract.address, CRYSTAL_AMOUNT);
        await sendGrams(giverSC, wallet1.walletContract.address, CRYSTAL_AMOUNT);
        await sendGrams(giverSC, wallet2.walletContract.address, CRYSTAL_AMOUNT);
        await sendGrams(giverSC, rootSC.rootContract.address, CRYSTAL_AMOUNT);
        logger.success('Ton crystal distribution finished');
    });

    it('Minting tokens to contracts', async function() {
        logger.log('#####################################');
        logger.log('Minting tokens');
        this.timeout(DEFAULT_TIMEOUT);
        await rootSC.mintTokensToWallets(wallet1, wallet2, testScenario.pair1.tokensAmount);
        logger.success(`Tokens minted successfully`);
    });

    it('Setting up smart contracts for callback testing', async function() {
        logger.log('#####################################');
        logger.log('Setting callback address');
        this.timeout(DEFAULT_TIMEOUT);
        await wallet1.setCallbackAddress(callbackSC.callbackContract.address);
        await wallet2.setCallbackAddress(callbackSC.callbackContract.address);
        logger.success('Callback address set');
    })

    it('Transactions with callback test', async function() {
        logger.log('#####################################');
        logger.log('Transactions test');
        this.timeout(DEFAULT_TIMEOUT);

        await wallet1.setCallbackAddress(callbackSC.callbackContract.address);
        await wallet1.transferWithNotify(wallet2.walletContract.address, 30);
        let balance1 = (await wallet1.walletContract.runLocal(
            'getDetails', {},
            wallet1.keyPair
        )).balance.toNumber();
        let balance2 = (await wallet2.walletContract.runLocal(
            'getDetails', {},
            wallet2.keyPair
        )).balance.toNumber();
        let res = (await callbackSC.getResult());
        let balanceDelta = res.amount.toNumber();
        expect(balance1).to.be.a('Number').and.equal(testScenario.pair1.tokensAmount.user - 30);
        expect(balance2).to.be.a('Number').and.equal(testScenario.pair1.tokensAmount.swap + 30);
        expect(balanceDelta).to.be.a('Number').and.equal(30);
        logger.success(`Transaction check completed.`);
    });
});