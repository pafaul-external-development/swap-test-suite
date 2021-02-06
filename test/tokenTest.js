const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('./config/constants');

const testScenario = require('./config/testScenario');
const giverConfig = require('./config/giverConfig');
const networkConfig = require('./config/networkConfig');
const seedPhrase = require('./config/seedPhraseConfig');

let rootContractParameters = require('./config/rootContractParameters');
let walletParameters = require('./config/walletParameters');

const RootContract = require('./rootContract');
const Wallet = require('./walletContract');
const Giver = require('./giverContract');
const CallbackContract = require('./callbackContract');
const WalletDeployer = require('./walletDeployer');

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

describe('Test for TIP-3 token', async function() {
    describe('Root token contract', async function() {
        it('Setup', async function() {
            await ton.setup(4);

            expect(ton.keys).to.have.lengthOf(4, 'Wrong keys amount');
        });

        it('Initial stage', async function() {
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
            await wallet1.loadContract();
            await wallet2.loadContract();
        })

        it('Load root contract', async function() {
            rootContractParameters.initParams.root_public_key = '0x' + ton.keys[0].public;
            rootContractParameters.initParams.wallet_code = wallet1.walletContract.imageBase64;
            rootSC.setConfig(rootContractParameters);
            await rootSC.loadContract();
        });

        it('Load callback contract', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await callbackSC.loadContract();
        });

        it('Callback contract deploy', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await callbackSC.deployContract();
            logger.success(`callback SC address: ${callbackSC.callbackContract.address}`);
        });

        it('Deploy of root contract', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await rootSC.deployContract();
            logger.log('Root balance: ', await ton.getBalance(rootSC.rootContract.address));
        });

        it('Root contract basic checks', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await rootSC.checkParameters();
        });

        it('Load deploy wallet contract', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await dw.loadContract();
        });

        it('Deploy contract', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await dw.deployContract(rootSC.rootContract.address);
            logger.success(`DW address: ${dw.walletContract.address}`);
        });

        it('Wallet contracts deploy', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            logger.log(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);
            //await dw.deployWallet(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
            await dw.deployWallet(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);
            logger.log('Root balance: ', await ton.getBalance(rootSC.rootContract.address));
            logger.log('Root address: ', (await dw.walletContract.run('getRoot', {})).decoded.output.value0);
            logger.log('pub: ', (await dw.walletContract.run('getLatestPublicKey', {})).decoded.output.value0, (await dw.walletContract.run('getLatestAddr', {})).decoded.output.value0)
        });

        it('Calculate future wallet addresses', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            let w1address = await rootSC.calculateFutureWalletAddress(wallet1.initParams.wallet_public_key, wallet1.initParams.owner_address);
            let w2address = await rootSC.calculateFutureWalletAddress(wallet2.initParams.wallet_public_key, wallet2.initParams.owner_address);

            wallet1.walletContract.address = w1address;
            wallet2.walletContract.address = w2address;

            wallet1.setTransactionAddress(w2address);
            wallet2.setTransactionAddress(w1address);

            logger.log(`wallet1 address: ${w1address}`);
            logger.log(`wallet2 address: ${w2address}`);
        });

        //     it('Ton crystal distribution', async function() {
        //         this.timeout(DEFAULT_TIMEOUT);
        //         await sendGrams(giverSC, callbackSC.callbackContract.address, CRYSTAL_AMOUNT);
        //     });

        //     it('Minting tokens to contracts', async function() {
        //         this.timeout(DEFAULT_TIMEOUT);
        //         await rootSC.mintTokensToWallets(wallet1, wallet2, testScenario.pair1.tokensAmount);
        //     });

        //     it('Transactions with callback test', async function() {
        //         this.timeout(DEFAULT_TIMEOUT);
        //         wallet1.setTransactionAddress(wallet2.address);
        //         wallet2.setTransactionAddress(wallet1.address);
        //         await wallet1.transfer(10, callbackSC.address);
        //         let result = await callbackSC.getResult();
        //         let expectedResult = {
        //             sender: wallet1.address,
        //             receiver: wallet2.address,
        //             amount: 10,
        //             timestamp: result.timestamp
        //         };
        //         expect(result).to.deep.equal(expectedResult, `Error of transfer. Expected: ${expectedResult}, got: ${result}`);
        //         await wallet2.transfer(10, callbackSC.address);
        //         result = await callbackSC.getResult();
        //         expectedResult = {
        //             sender: wallet2.address,
        //             receiver: wallet1.address,
        //             amount: 10,
        //             timestamp: result.timestamp
        //         };
        //         expect(result).to.deep.equal(expectedResult, `Error of transfer. Expected: ${expectedResult}, got: ${result}`);
        //     });
    });
});