const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS, RETRIES, USERS_OF_TONSWAP } = require('../config/general/constants');

const RootContract = require('../contractWrappers/tip3/rootContract');
const Wallet = require('../contractWrappers/tip3/walletContract');
const Giver = require('../contractWrappers/giverContract');
const WalletDeployer = require('../contractWrappers/tip3/walletDeployer');
const RootSwapPairContarct = require('../contractWrappers/swap/rootSwapPairContract');
const SwapPairContract = require('../contractWrappers/swap/swapPairContract');
const TONStorage = require('../contractWrappers/util/tonStorage');
const User = require('./actors/user');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

var pairsConfig = require('../config/contracts/walletsForSwap');
var swapConfig = require('../config/contracts/swapPairContractsConfig');
const wallet = require('../config/contracts/walletParameters');
const { root } = require('../config/contracts/swapPairContractsConfig');
const { sleep } = require('../src/utils');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

users = [];

describe('Test of swap pairs', async function() {
    it('Preinit stage', async function() {
        await ton.setup(USERS_OF_TONSWAP);
        ton.debug = true;
        for (let i = 0; i < USERS_OF_TONSWAP; i++) {
            users.push(new User(ton.keys[i], ton));
        }
    })

    it('Creating multisig wallets', async function() {
        // TODO: создание мультисиг кошельков
    })

    it('Deploying TIP3 root contracts', async function() {
        // TODO: деплой тип-3 рут контрактов
    })

    it('Deploying TIP3 wallets', async function() {
        // TODO: деплой тип-3 кошельков 
    })

    it('Deploying of Swap Pair root contract', async function() {
        // TODO: деплой рут контракта свап пары
    })

    it('Deploying swap pair', async function() {
        // TODO: деплой свап пары для созданных тип3 токенов
    })

    it('Providing liquidity for swap pair', async function() {
        // TODO: предоставление ликвидности свап паре
    })

    it('Providing liquidity using one token', async function() {
        // TODO: предоставление ликвидности свап паре с помощью одного токена
    })

    it('Token swap', async function() {
        // TODO: обмен одних токенов на другие токены 
    })

    it('Withdrawing liquidity', async function() {
        // TODO: вывод ликвидности из пары
    })

    it('Withdrawing liquidity by using one token', async function() {
        // TODO: вывод ликвидности из пары с помощью одного токена
    })
})