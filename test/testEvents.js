const freeton = require('../src');
const { USERS_OF_TONSWAP } = require('../config/general/constants');
const { abiContract } = require("@tonclient/core");

const fs = require('fs');

const {
    deployTIP3Tokens,
    deployTIP3Deployer,
    deployRootSwapPairContract,
    deploySwapPair
} = require('./deployContracts/deployContracts');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let abiA = JSON.parse(fs.readFileSync('build/RootSwapPairContract.abi.json'));

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function deployManySwapPairs() {
    for (i = 0; i < 10; i++) {
        let deployResult = await deployTIP3Tokens(ton);
        let tip3RootContracts = deployResult.tokens;
        let tip3Deployer = await deployTIP3Deployer(ton);
        let rootSwapPairContract = await deployRootSwapPairContract(ton, tip3Deployer);
        deployResult = await deploySwapPair(ton, rootSwapPairContract, tip3RootContracts);
    }
}

/**
 * 
 * @param {Any} params 
 * @param {Number} responseType 
 */
async function agaEventProizoshel(params, responseType) {
    try {
        let decoded = await ton.ton.abi.decode_message({
            abi: abiContract(abiA),
            message: params.result.boc
        });
        if (decoded.body_type == 'Event')
            console.log(`${decoded.name}\n${JSON.stringify(decoded.value, null, '\t')}`);
    } catch (err) {
        console.log(err);
    }
}

async function main() {
    await ton.setup(USERS_OF_TONSWAP);
    ton.debug = true;
    deployManySwapPairs(ton);

    filter = {}
    filter['src'] = { eq: '0:0daaca36b1d25699eaa0f40276830d2b263d9db41dfe590c2eb13a145a3caf6a' };
    filter['msg_type'] = { eq: 2 };

    const subToRSP = (await ton.ton.net.subscribe_collection({
        collection: "messages",
        filter: filter,
        result: "boc"
    }, agaEventProizoshel));
}

main();