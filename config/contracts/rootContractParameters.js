const { ZERO_ADDRESS } = require('../general/constants');

/**
 * @typedef RootTIP3Config
 * @type {Object}
 * 
 * @property {RootTIP3ConfigInitParams} initParams
 * @property {RootTIP3ConfigConstructorParams} constructorParams
 */

/**
 * @typedef RootTIP3ConfigInitParams
 * @type {Object}
 * 
 * @property {String} name
 * @property {String} symbol
 * @property {Number} decimals
 * @property {String} wallet_code
 * @property {Number} _randomNonce
 */

/**
 * @typedef RootTIP3ConfigConstructorParams
 * @type {Object}
 * 
 * @property {String} root_public_key_
 * @property {String} root_owner_address_
 */

/**
 * Is used to encode text parameters
 * @param {String} str 
 * @returns {String}
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

let rootParameters = {
    // Root contract utilises only initial parameters
    initParams: {
        name: toHex('TestRootContract'),
        symbol: toHex('TRC'),
        decimals: 9,
        wallet_code: "", // Wallet code is added in tokenTest.js after loading wallet
        _randomNonce: 7 // This is changed during deploy stage
    },
    constructorParams: {
        root_public_key_: "pubkey",
        root_owner_address_: ZERO_ADDRESS,
    }
}

module.exports = rootParameters;