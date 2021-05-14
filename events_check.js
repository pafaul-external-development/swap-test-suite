const giverConfig = require('./config/contracts/giverConfig');
const networkConfig = require('./config/general/networkConfig');
const seedPhraseConfig = require('./config/general/seedPhraseConfig');
const { abiContract, TonClient } = require("@tonclient/core");
const freeton = require('./src');

const fs = require('fs');

aa = process.argv[2];
accountType = process.argv[3];

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhraseConfig
});

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
    filter['src'] = { eq: aa };
    filter['msg_type'] = { eq: 2 };

    let trContract = {
        abi: abiA,
        tvc: fs.readFileSync('./build/SwapPairContract.abi.json').toString('base64')
    }



    let qc = await ton.ton.net.query_collection({
        collection: 'messages',
        filter: filter,
        order: [{
            path: 'created_lt',
            direction: 'ASC'
        }],
        result: "id msg_type src boc body"
    });
    console.log(qc);
    qc = qc.result[0];
    console.log(qc);

    try {
        await ton.ton.net.query_collection({
            collection: 'messages',
            filter: filter,
            order: [{
                path: 'created_lt',
                direction: 'ASC'
            }],
            result: "id msg_type src boc body" // "account_addr aborted total_fees" //  
        }).then(async s => s.result.forEach(async(el) => {
            try {
                console.log(await ton.ton.abi.decode_message({
                    abi: abiContract(abiA),
                    message: el.boc
                }));
            } catch (err) {
                console.log(err);
            }
        })).catch(console.log);
    } catch (err) {
        console.log(err);
    }

    // process.exit(0);
}

main();