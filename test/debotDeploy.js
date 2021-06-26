const freeton = require('../src');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

/**
 * Isis  used to encode text parameters
 * @param {String} str 
 */
function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * 
 * @param {Array<String>} text 
 */
function arrayStringToArrayHex(text) {
    let output = [];
    for (let string of text)
        output.push(toHex(string));
    return output;
}

/**
 * 
 * @param {freeton.ContractWrapper} debot 
 * @param {Array<String>} hexInfo 
 * @param {Number} offset 
 */
async function setStringInfo(debot, hexInfo, offset) {
    for (let i = 0; i < hexInfo.length; i++) {
        console.log(`Setting string #${i+offset}`);
        await debot.run('setStringInfo', {
            'input': hexInfo.slice(i, i + 1),
            'offset': offset + i,
            'length': 1
        }, ton.keys[0]);
        console.log(`String #${i+offset} set`);
    }
}

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    try {
        await ton.setup(1);
        ton.debug = true;
        let debot = await freeton.requireContract(ton, 'SwapPairExplorer');
        await debot.deploy({
            constructorParams: {},
            initParams: {},
            initialBalance: freeton.utils.convertCrystal(5, 'nano'),
            _randomNonce: false,
            keyPair: ton.keys[0],
        });

        console.log(debot.address);

        await debot.run('setABI', {
            'dabi': toHex(JSON.stringify(debot.abi))
        }, ton.keys[0]);

        await debot.run('setRootAddress', {
            'rootSwapPairAddress': '0:3dc2f941650dbb757e47363109841a943c04a4824a6652b8be7377b945603137'
        }, ton.keys[0]);

        console.log(await debot.address);
        console.log(ton.keys[0]);
        process.exit(0);
    } catch (err) {
        console.log(err);
    }
}

main();