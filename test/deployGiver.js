const freeton = require('../src');

const giverConfig = require('./config/giverConfig');
const networkConfig = require('./config/networkConfig');
const seedPhrase = require('./config/seedPhraseConfig');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(1);

    let giverContract = await freeton.requireContract(ton, 'GiverContract');
    // let deployParams = [
    //     giverContract.imageBase64,
    //     {},
    //     {},
    //     ton.keys[0]
    // ];
    // let deployMessage = await giverContract.createDeployMessage(...deployParams);
    // giverContract.waitForRunTransaction(deployMessage).then(console.log).catch(console.log);
    giverContract.deploy({}, {}, 0, false, ton.keys[0], false, false).then(console.log);
    //process.exit(0);
}

main();