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
            wallet: {
                config: copyJSON(wallet),
                keys: {},
            },
            root: {
                config: copyJSON(rootParameters),
                keys: {},
            },
            walletsAmount: 1,
            // 1134274556403128300000000000000000
            tokensAmount: 11340,
            callbackAddress: '',
        }, {
            wallet: {
                config: copyJSON(wallet),
                keys: {},
            },
            root: {
                config: copyJSON(rootParameters),
                keys: {},
            },
            walletsAmount: 1,
            tokensAmount: 11340,
            callbackAddress: '',
        },
        /* {
                wallet: {
                    config: copyJSON(wallet),
                    keys: {},
                },
                root: {
                    config: copyJSON(rootParameters),
                    keys: {},
                },
                walletsAmount: 1,
                tokensAmount: 30000000,
                callbackAddress: '',
            }*/
    ]
};

walletsDeployParameters.pairs[0].root.config.initParams.name = toHex('NeSlavaCoin');
walletsDeployParameters.pairs[1].root.config.initParams.name = toHex('DevTeamCoin');
//walletsDeployParameters.pairs[2].root.config.initParams.name = toHex('MyCoin');

module.exports = walletsDeployParameters;