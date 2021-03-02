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

let giverSC = new freeton.ContractWrapper(
    ton,
    giverConfig.abi,
    null,
    giverConfig.address,
);

async function main() {
    await ton.setup(2);
    // freeton.requireContract(ton, 'testSetCode').then(console.log).catch(console.log);
    let testC = await freeton.requireContract(ton, 'GiverContract');
    console.log(await testC.deploy({
        constructorParams: {},
        initParams: {},
        initialBalance: -1,
        _randomNonce: false,
        keyPair: ton.keys[1]
    }));
    console.log(ton.keys[1]);
    process.exit(0);
}

main();