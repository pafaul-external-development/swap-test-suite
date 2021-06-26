/**
 * Following contracts will be deployed:
 * 1. TIP-3 deployer
 * 2. RootSwapPairContract
 */

const freeton = require('../src');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

const fs = require('fs');
const { deployTIP3Deployer, deployRootSwapPairContract } = require('../test/deployContracts/deployContracts');
const TIP3Deployer = require('../contractWrappers/util/tip3Deployer');
const RootSwapPairContract = require('../contractWrappers/swap/rootSwapPairContract');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    let contractAddresses = {};

    /**
     * @type {TIP3Deployer}
     */
    let tip3Deployer = undefined;
    try {
        tip3Deployer = await deployTIP3Deployer(ton);
    } catch (err) {
        console.log(`TIP-3 deployer already deployed. To update TIP-3 codes use updateTIP3DeployerCodes.js`);
        tip3Deployer.tip3Deployer.address = await tip3Deployer.getFutureAddress();
    }

    /**
     * @type {RootSwapPairContract}
     */
    let rootSwapPairContract = undefined;
    try {
        rootSwapPairContract = await deployRootSwapPairContract(ton, tip3Deployer);
    } catch (err) {
        console.log(`Root swap pair contract already deployed.`);
        rootSwapPairContract.rootSwapPairContract.address = await rootSwapPairContract.getFutureAddress();
    }

    contractAddresses['rootSwapPairContract'] = rootSwapPairContract.getAddress();
    contractAddresses['tip3Deployer'] = rootSwapPairContract.getAddress();
    contractAddresses['seedPhrase'] = seedPhrase;
    contractAddresses['keyPair'] = rootSwapPairContract.keyPair;

    fs.writeFileSync('./deployedSwapPairContracts.json', JSON.stringify(contractAddresses, null, '\t'));
    console.log('Root swap pair contracts deployed');
    process.exit(0);
}

main();