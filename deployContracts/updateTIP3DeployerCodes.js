const freeton = require('../src');

const fs = require('fs');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');
const TIP3Deployer = require('../contractWrappers/util/tip3Deployer');
const { deployTIP3Deployer } = require('../test/deployContracts/deployContracts');
const { getTIP3Codes } = require('../test/utils/util');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});


async function main() {
    await ton.setup(1);

    let updateInformation = {};

    /**
     * @type {TIP3Deployer}
     */
    let tip3Deployer = undefined;

    try {
        tip3Deployer = await deployTIP3Deployer(ton);
        let tip3Codes = await getTIP3Codes(tonInstance);
        await tip3Deployer.setTIP3Codes(tip3Codes.root, tip3Codes.wallet);

        console.log('Update of tip-3 codes completed.');

        updateInformation['tip3Deployer'] = tip3Deployer.getAddress();
        updateInformation['rootTIP3'] = tip3Codes.root;
        updateInformation['walletTIP3'] = tip3Codes.wallet;
        updateInformation['keyPair'] = tip3Deployer.keyPair;
        updateInformation['seedPhrase'] = seedPhrase;

        fs.writeFileSync('./updateTIP3Information.json', JSON.stringify(updateInformation, null, '\t'));
    } catch (err) {
        console.log(err);
        console.log('Update failed.');
    }

    process.exit(0);
}

main();