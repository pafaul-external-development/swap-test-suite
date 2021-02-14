let exampleWalletConfig = require('./walletParameters');
let exampleRootConfig = require('./rootContractParameters');

/**
 * Is used to encode text parameters
 * @param {String} str 
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

let walletsDeployParameters = {
    pairs: [{
        wallet1: {
            config: exampleWalletConfig,
            keys: {},
        },
        wallet2: {
            config: exampleWalletConfig,
            keys: {},
        },
        root: {
            config: exampleRootConfig,
            keys: {},
        },
        tokensAmount: {
            user: 300,
            swap: 300
        },
        callbackAddress: '',
    }, {
        wallet1: {
            config: exampleWalletConfig,
            keys: {},
        },
        wallet2: {
            config: exampleWalletConfig,
            keys: {},
        },
        root: {
            config: exampleRootConfig,
            keys: {},
        },
        tokensAmount: {
            user: 300,
            swap: 300
        },
        callbackAddress: '',
    }]
}

walletsDeployParameters.pair[0].root.config.initParams.name = toHex('rsc1');
walletsDeployParameters.pair[1].root.config.initParams.name = toHex('rsc2');

module.exports = walletsDeployParameters;