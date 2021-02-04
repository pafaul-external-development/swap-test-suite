const giverConfig = require('./test/config/giverConfig');
const networkConfig = require('./test/config/networkConfig');
const seedPhraseConfig = require('./test/config/seedPhraseConfig');

const freeton = require('./src');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhraseConfig
});

futureAddress = process.argv[2];

async function main() {

    await ton.setup(1);

    await ton.ton.network.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: futureAddress },
        },
        result: 'balance'
    }).then(console.log);

    await ton.ton.network.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: futureAddress },
        },
        result: 'acc_type'
    }).then(console.log);

    process.exit(0);
}

main();