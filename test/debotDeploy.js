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
        let debot = await freeton.requireContract(ton, 'TonLiquidityWithdrawingOneDebot');
        await debot.deploy({
            constructorParams: {},
            initParams: {},
            initialBalance: freeton.utils.convertCrystal(10, 'nano'),
            _randomNonce: false,
            keyPair: ton.keys[0],
        });

        console.log(debot.address);

        await debot.run('setABI', {
            'dabi': toHex(JSON.stringify(debot.abi))
        }, ton.keys[0]);

        // let info = ['TONSwap debot', '0.1.0', 'SVOI.dev', 'TONSwap debot from SVOI.dev team', 'SVOI.dev', 'Hello this is debot for TONSwap from SVOI.dev team'];
        // let hexInfo = arrayStringToArrayHex(info);

        // await setStringInfo(debot, hexInfo, 0);

        // let menuInfo = [
        //     "TONSwap", "Interactions with swap pairs",
        //     "Your TIP-3 wallets", "Add your TIP-3 wallets to interact with swap pair",
        //     "About Svoi dev", "Information about our other projects",
        //     "TONSwap explorer", "Explore existing swap pairs",
        //     "What would you like to do?", "Chose an option"
        // ]

        // hexInfo = arrayStringToArrayHex(menuInfo);

        // await setStringInfo(debot, hexInfo, 10);

        // let swapInfo = [
        //     "Swap tokens", "Swap tokens of chosen swap pair",
        //     "Provide liquidity", "Provide liquidity to swap pair using two tokens",
        //     "Provide liquidity with one token", "Provide liquidity to swap pair using one token",
        //     "Withdraw liquidity", "Withdraw liquidity from swap pair using two tokens",
        //     "Withdraw liquidity with one tokne", "Withdraw liquidity from swap pair using one token",
        //     "Return to main menu", "Exit current menu",
        //     "Chose action:", "Choose what to do",
        //     "Add wallet for the first token to use this swap pair", "Add wallet for the second token to use this swap pair",
        //     "Select token to use for swap", "Input amount:",
        //     "Swap operation completed"
        // ]

        // hexInfo = arrayStringToArrayHex(swapInfo);

        // await setStringInfo(debot, hexInfo, 20);

        // let liquidityProvideInfo = [
        //     "Input token amounts to provide:",
        //     "Input first token amount:", "Input second token amount:"
        // ]

        // hexInfo = arrayStringToArrayHex(liquidityProvideInfo);

        // await setStringInfo(debot, hexInfo, 40);

        // let explorerInfo = [
        //     "Return to main menu", "Choose an option"
        // ]

        // hexInfo = arrayStringToArrayHex(explorerInfo);
        // await setStringInfo(debot, hexInfo, 200);

        // await debot.run('setRootAddress', {
        //     'rootSwapPairAddress': '0:0daaca36b1d25699eaa0f40276830d2b263d9db41dfe590c2eb13a145a3caf6a'
        // }, ton.keys[0]);

        console.log(await debot.address);
        console.log(ton.keys[0]);
        process.exit(0);
    } catch (err) {
        console.log(err);
    }
}

main();