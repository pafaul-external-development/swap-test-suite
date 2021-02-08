const { ZERO_ADDRESS } = require('./constants');

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
        root_public_key: "pubkey",
        root_owner_address: ZERO_ADDRESS,
        _randomNonce: 0 // This is changed during deploy stage
    },
    constructorParams: {}
}

module.exports = rootParameters;