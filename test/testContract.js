const freeton = require('../src');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');
const TestAutoBalance = require('../contractWrappers/testAutoBalance');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(2);
    ton.debug = false;
    let testC = new TestAutoBalance(ton, {}, );
    await testC.loadContract();
    await testC.deployContract();

    while (true) {
        await testC.heavyFunction();
        console.log(`Cost of execution: ${(await testC.getBalance()).toNumber()}`);
    }

    // console.log(ton.keys[1]);

    // //testC.run('setTestAddress', { ta: ZERO_ADDRESS }, ton.keys[1]).then(console.log).catch(console.log);
    // //createMapping
    // //console.log(await testC.runLocal('createMapping', { с: '0:5ab52a7856d40a2c73023ed409ff3288906b967b2b5c1ddbc694167d13950b72', a: 23 }, ton.keys[1]));
    // testC.run('getMessages', {}, {}).then(console.log).catch(console.log);
}

main();