let rootParameters = require('./rootContractParameters');
const freeton = require('../../src');

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
let name1 = `Coin_${freeton.utils.getRandomNonce()}_1`;
let name2 = name1 + '_2';
console.log(name1);
console.log(name2);
rootTIP3Params[0].root.config.initParams.name = toHex(name1);
rootTIP3Params[0].root.config.initParams.symbol = toHex(name1);
rootTIP3Params[1].root.config.initParams.name = toHex(name2);
rootTIP3Params[1].root.config.initParams.symbol = toHex(name2);
module.exports = rootTIP3Params;