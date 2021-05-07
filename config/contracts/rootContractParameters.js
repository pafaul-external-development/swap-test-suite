const { ZERO_ADDRESS } = require('../general/constants');

/**
 * Is used to encode text parameters
 * @param {String} str 
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
        _randomNonce: 3 // This is changed during deploy stage
    },
    constructorParams: {
        root_public_key_: "pubkey",
        root_owner_address_: ZERO_ADDRESS,
    }
}

module.exports = rootParameters;