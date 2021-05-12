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

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    try {
        await ton.setup(1);
        let debot = await freeton.requireContract(ton, 'TIP3Deployer');
        await debot.deploy({
            constructorParams: {
                dabi: toHex(JSON.stringify(debot.abi))
            },
            initParams: {},
            initialBalance: freeton.utils.convertCrystal(10, 'nano'),
            _randomNonce: false,
            keyPair: ton.keys[0],
        });

        console.log(debot.address);

        await debot.run('setTIP3DeployerAddress', {
            'newTip3Deployer': '0:cd326f453ae7d6e857319efd3f655ff17aa98dab5558124088009f6c9f8bbb42'
        }, ton.keys[0]);

        console.log(await debot.address);
        console.log(ton.keys[0]);
        process.exit(0);
    } catch (err) {
        console.log(err);
    }
}

main();