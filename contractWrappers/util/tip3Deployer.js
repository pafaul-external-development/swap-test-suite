const freeton = require('../../src');

class TIP3Deployer {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.tip3Deployer = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.tip3Deployer = await freeton.requireContract(this.tonInstance, 'TIP3TokenDeployer');
    }

    /**
     * 
     * @returns {String} get contract address
     */
    getAddress() {
        return this.tip3Deployer.address;
    }

    /**
     * Calculate future address
     */
    async getFutureAddress() {
        if (!this.tip3Deployer)
            await this.loadContract();
        return await this.tip3Deployer.getFutureAddress({
            constructorParams: {},
            initParams: {},
            keyPair: this.keyPair
        });
    }

    /**
     * Deploy contract and set initial data
     * @param {String} rootContractCode
     * @param {String} walletContractCode
     */
    async deployContract(rootContractCode, walletContractCode) {
        let futureAddress = await this.getFutureAddress();
        let walletExists = await this.tonInstance.ton.net.query_collection({
            collection: 'accounts',
            filter: {
                id: { eq: futureAddress }
            },
            result: 'acc_type balance'
        });

        console.log(walletExists);
        if (walletExists.result.length == 0) {
            await this.tip3Deployer.deploy({
                constructorParams: {},
                initParams: {},
                initialBalance: freeton.utils.convertCrystal('10', 'nano'),
                _randomNonce: false,
                keyPair: this.keyPair,
            });
            await this.tip3Deployer.run('setTIP3RootContractCode', {
                rootContractCode_: rootContractCode
            }, this.keyPair);
            await this.tip3Deployer.run('setTIP3WalletContractCode', {
                walletContractCode_: walletContractCode
            }, this.keyPair);
        }
        this.tip3Deployer.address = futureAddress;
        return futureAddress;
    }
}

module.exports = TIP3Deployer;