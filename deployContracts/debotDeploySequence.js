const freeton = require('../src');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

const fs = require('fs');

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

let rootSwapPairAddress = process.argv[2];

async function main() {
    let noAddressProvided = false;

    if (rootSwapPairAddress == '') {
        noAddressProvided = true;
        if (fs.existsSync('./deployedSwapPairContracts.json')) {
            let fileContent = JSON.parse(fs.readFileSync('./deployedSwapPairContracts.js'));
            rootSwapPairAddress = fileContent['rootSwapPairContract'];
            if (rootSwapPairAddress == undefined) {
                noAddressProvided = true;
            } else {
                noAddressProvided = false
            }

        }
    }

    if (noAddressProvided) {
        console.log('No root swap pair address provided');
        process.exit(1);
    }

    try {
        await ton.setup(1);
        ton.debug = true;
        console.log('Deploying debots');
        let debotNames = ['SwapPairExplorer', 'TonSwapDebot', 'TonLiquidityDebot', 'TonLiquidityOneDebot', 'TonLiquidityWithdrawingDebot', 'TonLiquidityWithdrawingOneDebot'];
        let debotAddresses = {};
        for (let debotName of debotNames) {
            let debot = await freeton.requireContract(ton, debotName);
            try {
                await debot.deploy({
                    constructorParams: {
                        dabi: toHex(JSON.stringify(debot.abi))
                    },
                    initParams: {},
                    initialBalance: freeton.utils.convertCrystal(5, 'nano'),
                    _randomNonce: false,
                    keyPair: ton.keys[0],
                });

                await debot.run('setABI', {
                    'dabi': toHex(JSON.stringify(debot.abi))
                }, ton.keys[0]);
            } catch (err) {
                console.log(`debot ${debotName} is already deployed. Not repeating deploy process`);
            }
            debotAddresses[debotName] = debot.address;
            console.log(`${debotName} -> ${debot.address}`);
            if (debotName == 'SwapPairExplorer') {
                await debot.run('setRootAddress', {
                    'rootSwapPairAddress': rootSwapPairAddress
                }, ton.keys[0]);
            }
        }

        debotAddresses.keys = ton.keys[0];

        fs.writeFileSync('./debotAddresses.json', JSON.stringify(debotAddresses, null, '\t'));

        process.exit(0);
    } catch (err) {
        console.log(err);
    }
}

main();