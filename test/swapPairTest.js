const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { USERS_OF_TONSWAP, DEFAULT_TIMEOUT } = require('../config/general/constants');

const RootContract = require('../contractWrappers/tip3/rootContract');
const RootSwapPairContract = require('../contractWrappers/swap/rootSwapPairContract');
const SwapPairContract = require('../contractWrappers/swap/swapPairContract');
const TIP3Deployer = require('../contractWrappers/util/tip3Deployer');
const User = require('./actors/user');
const SwapPairSimulatorWrapper = require('./simulation/SwapPairSimulatorWrapper');

const {
    deployMultisigForUsers,
    deployTIP3Tokens,
    deployTIP3Wallets,
    deployTIP3Deployer,
    deployRootSwapPairContract,
    deploySwapPair
} = require('./deployContracts/deployContracts');
const { provideLiquidity, swap, withdrawLiquidity, provideLiquidityOneToken, withdrawLiquidityOneToken } = require('./swapPairActions/swapPairActions');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');
const testScenario = require('../config/general/testScenario');


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
 * @type {SwapPairSimulatorWrapper}
 */
let swapPairSimulator = undefined;

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
            swapPairSimulator = new SwapPairSimulatorWrapper(
                swapPairContract.info.tokenRoot1,
                swapPairContract.info.tokenRoot2,
                swapPairContract.info.lpTokenRoot
            );
        })

        it('Providing liquidity for swap pair', async function() {
            this.timeout(DEFAULT_TIMEOUT);

            let token1Amount = testScenario[0] / 4;
            let token2Amount = testScenario[1] / 4;

            let res = await provideLiquidity(swapPairContract, swapPairSimulator, users[0], {
                token1Amount: BigInt(token1Amount),
                token2Amount: BigInt(token2Amount)
            });
            expect(res.totalResult).to.equal(true, 'Invalid providing liquidity result');
        })

        it('Providing liquidity using one token', async function() {
            let tokenAmount = testScenario[0] / 8;
            let res = await provideLiquidityOneToken(swapPairContract, swapPairSimulator, users[0], {
                tokenAddress: firstTIP3Address,
                tokenAmount: tokenAmount
            })
            expect(res.totalResult).to.equal(true, 'Invalid providing liquidity one token result');
        })

        it('Token swap', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            let tokenAmountForSwap = testScenario[0] / 100;

            let res = await swap(swapPairContract, swapPairSimulator, users[0], {
                tokenAddress: firstTIP3Address,
                swapAmount: BigInt(tokenAmountForSwap)
            });
            expect(res.totalResult).to.equal(true, 'Invalid swap result');
        })

        it('Withdrawing liquidity', async function() {
            this.timeout(DEFAULT_TIMEOUT);
            let lpTokenAmount = await users[0].checkWalletBalance(lpTokenRootAddress);

            let res = await withdrawLiquidity(swapPairContract, swapPairSimulator, users[0], {
                withdrawLPAmount: BigInt(lpTokenAmount / 2)
            });
            expect(res.totalResult).to.equal(true, 'Invalid withdraw liquidity result');
        })

        it('Withdrawing liquidity by using one token', async function() {
            let lpTokenAmount = await users[0].checkWalletBalance(lpTokenRootAddress);
            let tokenAmount = BigInt(Math.floor(lpTokenAmount / 2));
            let res = await withdrawLiquidityOneToken(swapPairContract, swapPairSimulator, users[0], {
                tokenAddress: firstTIP3Address,
                withdrawLPAmount: tokenAmount
            });
            expect(res.totalResult).to.equal(true, 'Invalid withdraw one token result');
        })
    })
} catch (error) {
    console.log(JSON.stringify(error));
}