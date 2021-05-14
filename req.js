const giverConfig = require('./config/contracts/giverConfig');
const networkConfig = require('./config/general/networkConfig');
const seedPhraseConfig = require('./config/general/seedPhraseConfig');
const { abiContract } = require("@tonclient/core");
const freeton = require('./src');
const { address, abi } = require('./config/contracts/giverConfig');

const fs = require('fs');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhraseConfig
});

aa = process.argv[2];
accountType = process.argv[3];
isInternal = process.argv[4] == '1' ? true : false;
incomingMessage = process.argv[5] == '1' ? 'dst' : 'src';
dirWithAbi = process.argv[6] ? process.argv[6] : './build/';

function loadAbi(type) {
    if (type == 'w')
        return JSON.parse(fs.readFileSync('build/TONTokenWallet.abi.json'));
    if (type == 'p')
        return JSON.parse(fs.readFileSync('build/SwapPairContract.abi.json'));
    if (type == 'rpc')
        return JSON.parse(fs.readFileSync('build/RootSwapPairContract.abi.json'));
    if (type == 'tr')
        return JSON.parse(fs.readFileSync('build/RootTokenContract.abi.json'));
    if (type == 'wd')
        return JSON.parse(fs.readFileSync('build/TONTokenWallet.abi.json'));
    if (type == 'td')
        return JSON.parse(fs.readFileSync('build/TIP3TokenDeployer.abi.json'));
}

async function main() {

    await ton.setup(1);

    await ton.ton.net.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: aa }
        },
        result: 'balance acc_type'
    }).then(console.log).catch(console.log);

    abiA = loadAbi(accountType);

    filter = {}
    filter[incomingMessage] = { eq: aa };

    try {
        await ton.ton.net.query_collection({
            collection: 'messages',
            filter: filter,
            order: [{
                path: 'created_lt',
                direction: 'ASC'
            }],
            result: "id created_lt msg_type status src dst value boc body" // "account_addr aborted total_fees" //  
        }).then(async s => s.result.forEach(async(el) => {
            await ton.ton.abi.decode_message_body({
                body: el.body,
                is_internal: isInternal,
                abi: abiContract(abiA)
            }).then(k => {
                console.log('################################################');
                console.log(`source: ${el.src}`);
                console.log(`destination: ${el.dst}`);
                console.log(`value: ${el.value}`);
                console.log(`status: ${el.status}`);
                console.log(k);
            }).catch(k => {
                console.log('################################################');
                console.log(`source: ${el.src}`);
                console.log(`destination: ${el.dst}`);
                console.log(`value: ${el.value}`);
                console.log(`status: ${el.status}`);
                console.log(`Cannot decode`);
            });
        })).catch(console.log);
    } catch (err) {
        console.log(err);
    }

    //process.exit(0);
}

main();