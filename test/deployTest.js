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
    // freeton.requireContract(ton, 'TestContract').then(console.log).catch(console.log);
    let testC = await freeton.requireContract(ton, 'TestContract', '0:18ef223498dfcffbe7b194988b02ac37dee15e315f34343adc37e9a77033da00');
    // console.log(await testC.deploy({
    //     constructorParams: {},
    //     initParams: {},
    //     initialBalance: freeton.utils.convertCrystal('1', 'nano'),
    //     _randomNonce: false,
    //     keyPair: ton.keys[1]
    // }));
    // process.exit(0);
    //.then(console.log).catch(console.log);
    console.log(ton.keys[1]);

    //testC.run('setTestAddress', { ta: ZERO_ADDRESS }, ton.keys[1]).then(console.log).catch(console.log);
    console.log(await testC.runLocal('checkIfAddressesAreEqual', { ta: ZERO_ADDRESS }, ton.keys[1]));
}

main();