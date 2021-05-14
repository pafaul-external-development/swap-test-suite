const { ZERO_ADDRESS } = require('../general/constants');

/**
 * @typedef RootSwapPairConfig
 * @type {Object}
 * 
 * @property {RootSwapPairConfigInitParams} initParams
 * @property {RootSwapPairConfigContructParams} constructorParams
 * @property {KeyPair} keyPair
 */

/**
 * @typedef RootSwapPairConfigInitParams
 * @type {Object}
 * 
 * @property {String} ownerPubkey  Owner of root swap pair contract public key
 * @property {Number} _randomNonce used to get new address for deploy
 */

/**
 * @typedef RootSwapPairConfigContructParams
 * @type {Object}
 * 
 * @property {Number} minMsgValue   Minimal msg.value
 * @property {Number} contractSP    How much will be charged in favor of contract
 * @property {String} tip3Deployer_ Address of TIP-3 deployer contract
 */

/**
 * @typedef SwapPairConfig
 * @type {Object}
 * 
 * @property {SwapPairConfigInitParams} initParams
 * @property {SwapPairConfigConstructParams} constructorParams
 * @property {import("@tonclient/core").KeyPair} keyPair
 */

/**
 * @typedef SwapPairConfigInitParams
 * @type {Object}
 * 
 * @property {String} token1
 * @property {String} token2
 * @property {String} swapPairRootContract
 * @property {String} swapPairID
 */

/**
 * @typedef SwapPairConfigConstructParams
 * @type {Object}
 */

let swapPairConfig = {
    root: {
        initParams: {
            ownerPubkey: '',
            _randomNonce: 119 // increment after new fix
        },
        constructorParams: {
            minMsgValue: 0, // Minimal msg.value
            contractSP: 0, // How much will be charged in favor of contract
            tip3Deployer_: ZERO_ADDRESS
        },
        keyPair: {}
    },
    pair: {
        initParams: {
            token1: '', // address of token1
            token2: '', // address of token2
            swapPairRootContract: '', // root contract that deployed swap pair
            swapPairID: '',
        },
        constructorParams: {},
        keyPair: {}
    }
}

module.exports = swapPairConfig;