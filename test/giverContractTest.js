const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('../config/general/constants');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let GiverContract = require('../contractWrappers/util/giverContract');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(1);
    let gc = new GiverContract(ton, {}, {});
    await gc.loadContract();
    await gc.setAllowedPubkeys(ton.keys);
    console.log(await gc.sendGrams('0:817673ee4ed2fb5c5406d9425bfa9dd209e92a3086d115253ba7f62c9070ddc1', freeton.utils.convertCrystal('0.1', 'nano'), ton.keys[0]));
    //process.exit(0);
}

main();