const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS, RETRIES, USERS_OF_TONSWAP } = require('../config/general/constants');

const RootContract = require('../contractWrappers/tip3/rootContract');
const Wallet = require('../contractWrappers/tip3/walletContract');
const Giver = require('../contractWrappers/giverContract');
const WalletDeployer = require('../contractWrappers/tip3/walletDeployer');
const RootSwapPairContract = require('../contractWrappers/swap/rootSwapPairContract');
const SwapPairContract = require('../contractWrappers/swap/swapPairContract');
const TONStorage = require('../contractWrappers/util/tonStorage');
const User = require('./actors/user');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

var pairsConfig = require('../config/contracts/walletsForSwap');
const testScenario = require('../config/general/testScenario');
var swapConfig = require('../config/contracts/swapPairContractsConfig');
const wallet = require('../config/contracts/walletParameters');
const { root } = require('../config/contracts/swapPairContractsConfig');
const { sleep } = require('../src/utils');
const { deployTIP3Root, initialTokenSetup, createRootSwapPairConfig, awaitForContractDeployment } = require('./util');
const { keyPair } = require('../config/contracts/giverConfig');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

/**
 * @name users
 * @type {User[]}
 */
users = [];

/**
 * @name tip3RootContracts
 * @type {RootContract[]}
 */
tip3RootContracts = [];

/**
 * @name rootSwapPairContract
 * @type {RootSwapPairContract}
 */
rootSwapPairContract = undefined;

/**
 * @name swapPairContract
 * @type {SwapPairContract}
 */
swapPairContract = undefined;

describe('Test of swap pairs', async function() {
    it('Preinit stage', async function() {
        await ton.setup(USERS_OF_TONSWAP);
        ton.debug = true;
        for (let i = 0; i < USERS_OF_TONSWAP; i++) {
            users.push(new User(ton.keys[i], ton));
        }
    })

    it('Creating multisig wallets', async function() {
        // TODO: Паша: создание мультисиг кошельков
        /**
         * @name user
         * @type {User}
         */
        let user;
        for (user of users) {
            await user.createMultisigWallet();
        }
    })

    it('Deploying TIP3 root contracts', async function() {
        // TODO: Паша: деплой тип-3 рут контрактов
        for (let tip3Index = 0; tip3Index < 2; tip3Index++)
            tip3RootContracts(await deployTIP3Root(ton, initialTokenSetup(pairsConfig.pairs[tip3Index])));
    })

    it('Deploying TIP3 wallets', async function() {
        // TODO: Паша: деплой тип-3 кошельков 
        /**
         * @name user
         * @type User
         */
        let user;
        for (let tip3Index = 0; tip3Index < 2; tip3Index++)
            for (user of users)
                await user.createWallet(tip3RootContracts[tip3Index], testScenario[tip3Index]);
    })

    it('Deploying of Swap Pair root contract', async function() {
        // TODO: Паша: деплой рут контракта свап пары
        /**
         * @name rootSwapPairConfig
         * @type {JSON}
         */
        rootSwapPairConfig = createRootSwapPairConfig(swapConfig, ton);
        rootSwapPairContract = new RootSwapPairContract(ton, rootSwapPairConfig, ton.keys[0]);
        await rootSwapPairContract.loadContract();
        await rootSwapPairContract.deployContract(true);
    })

    it('Deploying swap pair', async function() {
        // TODO: Паша: деплой свап пары для созданных тип3 токенов
        await rootSwapPairContract.deploySwapPair(tip3RootContracts[0], tip3RootContracts[1]);
        swapPairContract = new SwapPairContract(ton, ton.keys[0]);
        await swapPairContract.loadContract();
        swapPairContract.setContractAddress(
            await rootSwapPairContract.getFutureSwapPairAddress(tip3RootContracts[0], tip3RootContracts[1])
        );
        await awaitForContractDeployment(swapPairContract.getAddress());
        swapPairContract.info = await rootSwapPairContract.awaitSwapPairInitialization(tip3RootContracts[0], tip3RootContracts[1]);
    })

    it('Providing liquidity for swap pair', async function() {
        // TODO: Паша, Антон: предоставление ликвидности свап паре
    })

    it('Providing liquidity using one token', async function() {
        // TODO: Паша, Антон: предоставление ликвидности свап паре с помощью одного токена
    })

    it('Token swap', async function() {
        // TODO: Паша, Антон: обмен одних токенов на другие токены 
    })

    it('Withdrawing liquidity', async function() {
        // TODO: Паша, Антон: вывод ликвидности из пары
    })

    it('Withdrawing liquidity by using one token', async function() {
        // TODO: Паша, Антон: вывод ликвидности из пары с помощью одного токена
    })
})