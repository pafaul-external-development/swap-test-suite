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
    ton.debug = true;
    // freeton.requireContract(ton, 'TestContract').then(console.log).catch(console.log);
    let testC = await freeton.requireContract(ton, 'RootSwapPairContract'); //, '0:260113554a966f69573a83a47c8b53325eca7729e7a34988ccec044747600279');
    testC.deploy({
        constructorParams: {
            spCode: '',
            spCodeVersion: 1,
            minMsgValue: 0,
            contractSP: 0
        },
        initParams: {
            ownerPubkey: '0x' + ton.keys[1].public,
        },
        initialBalance: freeton.utils.convertCrystal('1', 'nano'),
        _randomNonce: true,
        keyPair: ton.keys[1]
    }).then(console.log).catch(console.log);
    // console.log(ton.keys[1]);

    // //testC.run('setTestAddress', { ta: ZERO_ADDRESS }, ton.keys[1]).then(console.log).catch(console.log);
    // //createMapping
    // //console.log(await testC.runLocal('createMapping', { с: '0:5ab52a7856d40a2c73023ed409ff3288906b967b2b5c1ddbc694167d13950b72', a: 23 }, ton.keys[1]));
    // testC.run('getMessages', {}, {}).then(console.log).catch(console.log);
}

main();