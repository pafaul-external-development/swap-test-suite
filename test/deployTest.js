const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('../config/general/constants');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let pairsConfig = require('../config/contracts/walletsForSwap');
const { sleep } = require('../src/utils');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(2);
    ton.debug = true;
    let testB = await freeton.requireContract(ton, 'testB');
    let testC = await freeton.requireContract(ton, 'testC');
    await testC.deploy({
        constructorParams: {},
        initParams: {},
        initialBalance: freeton.utils.convertCrystal('1', 'nano'),
        _randomNonce: false,
        keyPair: ton.keys[0]
    }); //.then(console.log).catch(console.log);

    await testB.deploy({
        constructorParams: {},
        initParams: {},
        initialBalance: freeton.utils.convertCrystal('1', 'nano'),
        _randomNonce: false,
        keyPair: ton.keys[0]
    });

    console.log(await testC.run('call', { a: testB.address }, ton.keys[0]));
    while (true) {
        console.log(await testC.runLocal('getS', {}, ton.keys[0]));
        sleep(3000);
    }

}

main();