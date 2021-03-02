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
    ton.debug = true;
    let gc = new GiverContract(ton, {}, {});
    await gc.loadContract();
    await gc.setAllowedPubkeys(ton.keys);
    console.log(await gc.sendGrams('0:5ab52a7856d40a2c73023ed409ff3288906b967b2b5c1ddbc694167d13950b72', freeton.utils.convertCrystal('50', 'nano'), ton.keys[0]));
    //process.exit(0);
}

main();