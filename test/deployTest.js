const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('../config/general/constants');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let pairsConfig = require('../config/contracts/walletsForSwap');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(2);
    ton.debug = true;
    let testC = await freeton.requireContract(ton, 'test');
    testC.deploy({
        constructorParams: {},
        initParams: {},
        initialBalance: freeton.utils.convertCrystal('1', 'nano'),
        _randomNonce: true,
        keyPair: ton.keys[1]
    }).then(console.log).catch(console.log);
}

main();