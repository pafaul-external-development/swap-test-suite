const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS } = require('../config/general/constants');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

let pairsConfig = require('../config/contracts/walletsForSwap');

/**
 * Is used to encode text parameters
 * @param {String} str 
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

let giverSC = new freeton.ContractWrapper(
    ton,
    giverConfig.abi,
    null,
    giverConfig.address,
);

async function main() {
    await ton.setup(1);
    let lilbot = await freeton.requireContract(ton, 'debot');
    await lilbot.deploy({
        constructorParams: {
            swapDebotAbi: toHex(JSON.stringify(lilbot.abi))
        },
        initParams: {},
        initialBalance: freeton.utils.convertCrystal(10, 'nano'),
        _randomNonce: true,
        keyPair: ton.keys[0],
    });

    console.log(await lilbot.address);
    console.log(ton.keys[0]);
    process.exit(0);
}

main();