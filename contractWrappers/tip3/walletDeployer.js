const freeton = require('../../src');
const { expect } = require('chai');

class WalletDeployer {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} rootParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, walletParams, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = walletParams.initParams;
        this.constructorParams = walletParams.constructorParams;
        this.walletDeployContract = undefined
    }

    /**
     * Load contract files from file system
     */
    async loadContract() {
        this.walletDeployContract = await freeton.requireContract(this.tonInstance, 'DeployEmptyWalletFor');

        expect(this.walletDeployContract.address).to.equal(undefined, 'Address should be undefined');
        expect(this.walletDeployContract.code).not.to.equal(undefined, 'Code should be available');
        expect(this.walletDeployContract.abi).not.to.equal(undefined, 'ABI should be available');
    }

    /**
     * Transfer tokens
     * @param {Number} tokenAmount 
     * @param {String} callbackAddress Address to send callback to
     */
    async deployWallet(pubkey, addr) {
        await this.walletDeployContract.run(
            'deployEmptyWalletFor', {
                pubkey: pubkey,
                addr: addr
            },
            this.keyPair
        );
    }

    /**
     * Deploy contract
     * @param {String} rootAddress Address of wallet's root contract
     */
    async deployContract(rootAddress) {
        return await this.walletDeployContract.deploy({
            constructorParams: {},
            initParams: {
                root: rootAddress,
            },
            initialBalance: freeton.utils.convertCrystal('15', 'nano'),
            _randomNonce: true,
            keyPair: this.keyPair,
        });
    }
}

module.exports = WalletDeployer;