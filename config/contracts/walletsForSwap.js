let wallet = require('./walletParameters');
let rootParameters = require('./rootContractParameters');

/**
 * Is used to encode text parameters
 * @param {String} str 
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

function copyJSON(json) {
    return JSON.parse(JSON.stringify(json));
}

let walletsDeployParameters = {
    pairs: [{
        wallet1: {
            config: copyJSON(wallet),
            keys: {},
        },
        wallet2: {
            config: copyJSON(wallet),
            keys: {},
        },
        root: {
            config: copyJSON(rootParameters),
            keys: {},
        },
        tokensAmount: {
            user: 300,
            swap: 300
        },
        callbackAddress: '',
    }, {
        wallet1: {
            config: copyJSON(wallet),
            keys: {},
        },
        wallet2: {
            config: copyJSON(wallet),
            keys: {},
        },
        root: {
            config: copyJSON(rootParameters),
            keys: {},
        },
        tokensAmount: {
            user: 300,
            swap: 300
        },
        callbackAddress: '',
    }]
};

walletsDeployParameters.pairs[0].root.config.initParams.name = toHex('rsc1');
walletsDeployParameters.pairs[1].root.config.initParams.name = toHex('rsc2');

module.exports = walletsDeployParameters;