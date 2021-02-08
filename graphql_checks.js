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


    await ton.ton.net.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: futureAddress }
        },
        result: 'balance acc_type'
    }).then(console.log).catch(console.log);

    await ton.ton.net.query_collection({
        collection: 'messages',
        filter: {
            dst: { eq: futureAddress }
        },
        result: "msg_type status src dst value"
    }).then(s => console.log(JSON.stringify(s, null, '\t'))).catch(console.log);

    process.exit(0);
}

main();