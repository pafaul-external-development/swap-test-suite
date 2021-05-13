const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { USERS_OF_TONSWAP, DEFAULT_TIMEOUT } = require('../config/general/constants');

const RootContract = require('../contractWrappers/tip3/rootContract');
const RootSwapPairContract = require('../contractWrappers/swap/rootSwapPairContract');
const SwapPairContract = require('../contractWrappers/swap/swapPairContract');
const TIP3Deployer = require('../contractWrappers/util/tip3Deployer');
const User = require('./actors/user');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

const testScenario = require('../config/general/testScenario');
const { deployMultisigForUsers, deployTIP3Tokens, deployTIP3Wallets, deployTIP3Deployer, deployRootSwapPairContract, deploySwapPair } = require('./deployContracts/deployContracts');
const { checkBalanceDeltas, checkPoolEquality } = require('./utils/balanceChecks');
const SwapPairSimulatorLight = require('./simulation/SwapPairSimulatorLight');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

/**
 * @name users
 * @type {User[]}
 */
let users = [];

/**
 * @name tip3RootContracts
 * @type {RootContract[]}
 */
let tip3RootContracts = [];

/**
 * @name rootSwapPairContract
 * @type {RootSwapPairContract}
 */
let rootSwapPairContract = undefined;

/**
 * @name swapPairContract
 * @type {SwapPairContract}
 */
let swapPairContract = undefined;

/**
 * @name swapPairSimulator
 * @type {SwapPairSimulatorLight}
 */
let swapPairSimulator = new SwapPairSimulatorLight();

/**
 * @name tip3Deployer
 * @type {TIP3Deployer}
 */
let tip3Deployer = undefined;

/**
 * @name firstTIP3Address
 * @type {String}
 */
let firstTIP3Address = undefined;

/**
 * @name secondTIP3Address
 * @type {String}
 */
let secondTIP3Address = undefined;

/**
 * @name lpTokenRootAddress
 * @type {String}
 */
let lpTokenRootAddress = undefined;

try {
    describe('Test of swap pairs', async function() {
        it('Preinit stage', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            await ton.setup(USERS_OF_TONSWAP);
            ton.debug = true;
            for (let i = 0; i < USERS_OF_TONSWAP; i++) {
                users.push(new User(ton.keys[i], ton));
            }
        })

        it('Creating multisig wallets', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            users = await deployMultisigForUsers(users);
        })

        it('Deploying TIP3 root contracts', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            let deployResult = await deployTIP3Tokens(ton);
            tip3RootContracts = deployResult.tokens;
            firstTIP3Address = deployResult.firstTIP3Address;
            secondTIP3Address = deployResult.secondTIP3Address;
        })

        it('Deploying TIP3 wallets', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            users = await deployTIP3Wallets(users, tip3RootContracts);
        })

        it('Deploying tip3 deployer for contracts', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            tip3Deployer = await deployTIP3Deployer(ton);
        })

        it('Deploying Swap Pair Root Contract', async function() {
            this.timeout(DEFAULT_TIMEOUT);

            rootSwapPairContract = await deployRootSwapPairContract(ton, tip3Deployer);
        })

        it('Deploying Swap Pair', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            let deployResult = await deploySwapPair(ton, rootSwapPairContract, tip3RootContracts);
            swapPairContract = deployResult.swapPairContract;
            lpTokenRootAddress = deployResult.lpTokenRootAddress;
        })

        it('Providing liquidity for swap pair', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            // TODO: Паша, Антон: предоставление ликвидности свап паре

            let token1Amount = testScenario[0] / 4;
            let token2Amount = testScenario[1] / 4;
            let expectedLPTokenAmount = token1Amount * token2Amount;
            /**
             * @name user
             * @type {User}
             */
            let user;

            /**
             * @name userStateChange
             * @type {import ('./actors/user').WalletsStatesChanging[]}
             */
            let userStateChange = [];

            /**
             * @name state
             * @type {import('./actors/user').WalletsStatesChanging}
             */
            let state;

            for (user of users)
                userStateChange.push(await user.provideLiquidity(swapPairContract, token1Amount, token2Amount));

            for (state of userStateChange) {
                let token1State = token1Amount == (state.start[firstTIP3Address].balance - state.finish[firstTIP3Address].balance);
                let token2State = token2Amount == (state.start[secondTIP3Address].balance - state.finish[secondTIP3Address].balance);
                let lpTokenState = expectedLPTokenAmount == (state.finish[lpTokenRootAddress].balance - state.start[lpTokenRootAddress].balance);
                let resState = token1State && token2State && lpTokenState;
            }
        })

        it('Providing liquidity using one token', async function() {
            // TODO: Паша, Антон: предоставление ликвидности свап паре с помощью одного токена
        })

        it('Token swap', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            // TODO: Паша, Антон: обмен одних токенов на другие токены
            let tokenAmountForSwap = testScenario[0] / 100;

            /**
             * @name userStateChange
             * @type {import ('./actors/user').WalletsStatesChanging;[]}
             */
            let userStateChange = [];

            /**
             * @name state
             * @type {import('./actors/user').WalletsStatesChanging}
             */
            let state;

            /**
             * @name user
             * @type {User}
             */
            let user;
            for (user of users) {
                userStateChange.push(await user.swapTokens(swapPairContract, tokenAmountForSwap));
            }

            for (state of userStateChange) {
                let token1State = tokenAmountForSwap == (state.start[firstTIP3Address] - state.finish[firstTIP3Address]);
                let token2State = (state.start[secondTIP3Address] < state.finish[secondTIP3Address]);
                let resState = token1State && token2State;
            }
        })

        it('Withdrawing liquidity', async function() {
            // TODO: Паша, Антон: вывод ликвидности из пары
            this.timeout(DEFAULT_TIMEOUT);
            /**
             * @name user
             * @type {User}
             */
            let user;

            /**
             * @name userStateChange
             * @type {import('./actors/user').WalletsStatesChanging[]}
             */
            let userStateChange = [];

            /**
             * @name state
             * @type {import('./actors/user').WalletsStatesChanging}
             */
            let state;

            for (user of users) {
                let lpTokenAmount = await user.checkWalletBalance(lpTokenRootAddress);
                userStateChange.push(await user.withdrawTokens(swapPairContract, lpTokenAmount / 2));
            }

            for (state of userStateChange) {
                let token1State = (state.finish[firstTIP3Address] > state.start[firstTIP3Address]);
                let token2State = (state.finish[secondTIP3Address] > state.start[secondTIP3Address]);
                let resState = token1State && token2State;
            }
        })

        it('Withdrawing liquidity by using one token', async function() {
            // TODO: Паша, Антон: вывод ликвидности из пары с помощью одного токена
        })
    })
} catch (error) {
    console.log(JSON.stringify(error));
}