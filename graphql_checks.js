const giverConfig = require('./test/config/giverConfig');
const networkConfig = require('./test/config/networkConfig');
const seedPhraseConfig = require('./test/config/seedPhraseConfig');

const freeton = require('./src');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhraseConfig
});

futureAddress = '';

ton.ton.network.query_collection({
    collection: 'accounts',
    filter: {
        id: { eq: futureAddress },
    },
    result: 'balance'
});

ton.ton.network.query_collection({
    collection: 'accounts',
    filter: {
        id: { eq: futureAddress },
    },
    result: 'acc_type'
});