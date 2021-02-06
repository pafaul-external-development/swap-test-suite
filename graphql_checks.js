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
time = process.argv[3];

async function main() {

    await ton.setup(1);

    // if (!time) {
    //     time = Number(futureAddress);
    //     filter = {
    //         // in_message: {
    //         //     value: { ge: '0x0' }
    //         // }
    //     }
    // } else {
    //     filter = {
    //         id: { eq: futureAddress },
    //     }
    // }

    // if (time != futureAddress) {
    //     await ton.ton.net.query_collection({
    //         collection: 'accounts',
    //         filter: filter,
    //         result: 'balance'
    //     }).then(console.log).catch(console.log);

    //     await ton.ton.net.query_collection({
    //         collection: 'accounts',
    //         filter: filter,
    //         result: 'acc_type'
    //     }).then(console.log).catch(console.log);
    // }

    await ton.ton.net.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: '0:542c363a006ffb9e03546c3b8e26d783a5a31e5bc5ab0588d2a8ed1b1b64c690' }
        },
        result: 'balance acc_type'
    }).then(console.log).catch(console.log);

    await ton.ton.net.query_collection({
        collection: 'messages',
        filter: {
            src: { eq: '0:542c363a006ffb9e03546c3b8e26d783a5a31e5bc5ab0588d2a8ed1b1b64c690' }
            //id: { eq: futureAddress },
            //now: { gt: Number(time) }
        },
        result: "msg_type status src dst value"
    }).then(s => console.log(JSON.stringify(s, null, '\t'))).catch(console.log);

    process.exit(0);
}

main();