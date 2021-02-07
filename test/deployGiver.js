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
    ton.setup(1);

    let giverContract = await freeton.requireContract(ton, 'GiverContract');
    giverContract.deploy({}, {}, 0, false, ton.keys[0], true).then(console.log);
}

main();