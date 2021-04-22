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

let rootTIP3Params = [{
    root: {
        config: copyJSON(rootParameters),
        keys: {},
    }
}, {
    root: {
        config: copyJSON(rootParameters),
        keys: {},
    }
}];

rootTIP3Params[0].root.config.initParams.name = toHex('The One And Only');
rootTIP3Params[0].root.config.initParams.symbol = toHex('TOAO');
rootTIP3Params[1].root.config.initParams.name = toHex('The Second and The Last');
rootTIP3Params[1].root.config.initParams.symbol = toHex('TSATL');

module.exports = rootTIP3Params;