const freeton = require('../src');

const fs = require('fs');

const giverConfig = require('../config/contracts/giverConfig');
const networkConfig = require('../config/general/networkConfig');
const seedPhrase = require('../config/general/seedPhraseConfig');

const RootSwapPairContract = require('../contractWrappers/swap/rootSwapPairContract');
const TIP3Deployer = require('../contractWrappers/util/tip3Deployer');

const { deployRootSwapPairContract, deployTIP3Deployer } = require('../test/deployContracts/deployContracts');
const SwapPairContract = require('../contractWrappers/swap/swapPairContract');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhrase
});

async function main() {
    await ton.setup(1);

    let updateInformation = {};

    try {
        /**
         * @type {TIP3Deployer}
         */
        let tip3Deployer = await deployTIP3Deployer(ton);

        /**
         * @type {RootSwapPairContract}
         */
        let rootSwapPairContract = await deployRootSwapPairContract(ton, tip3Deployer);
        let codeVersion = Number((await rootSwapPairContract.getPairInfo()).swapPairCodeVersion);
        codeVersion = codeVersion + 1;


        /**
         * @type {SwapPairContract}
         */
        let swapPairContract = new SwapPairContract();
        await swapPairContract.loadContract();

        await rootSwapPairContract.setSwapPairCode(
            swapPairContract.swapPairContract.code,
            codeVersion
        )

        console.log(`Swap pair code updated. New code version: ${codeVersion}`);
        updateInformation['codeVersion'] = codeVersion;
        updateInformation['swapPairCode'] = swapPairContract.swapPairContract.code;
        updateInformation['rootSwapPairContract'] = rootSwapPairContract.getAddress();
        updateInformation['tip3Deployer'] = tip3Deployer.getAddress();
        updateInformation['seedPhrase'] = seedPhrase;
        updateInformation['keyPair'] = rootSwapPairContract.keyPair;

        fs.writeFileSync('./updateInformation.json', JSON.stringify(updateInformation, null, '\t'));
    } catch (err) {
        console.log(err);
        console.log('Update of swap pair code failed');
    }

    process.exit(0);
}

main();