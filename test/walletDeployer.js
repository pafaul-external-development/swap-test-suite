const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

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
        this.walletContract = undefined
    }

    /**
     * Root token address
     * @param {String} walletAddress 
     */
    setRootAddress(rootAddress) {
        this.rootAddress = rootAddress;
    }

    async loadContract() {
        this.walletContract = await freeton.requireContract(this.tonInstance, 'DeployEmptyWalletFor');

        expect(this.walletContract.address).to.equal(undefined, 'Address should be undefined');
        expect(this.walletContract.code).not.to.equal(undefined, 'Code should be available');
        expect(this.walletContract.abi).not.to.equal(undefined, 'ABI should be available');
    }

    /**
     * Transfer tokens
     * @param {Number} tokenAmount 
     * @param {String} callbackAddress Address to send callback to
     */
    async deployWallet(pubkey, addr) {
        await this.walletContract.run(
            'deployEmptyWalletFor', {
                pubkey: pubkey,
                addr: addr
            },
            this.keyPair
        );
    }

    async deployContract() {
        return await this.rootContract.deploy(
            this.constructorParams,
            this.initParams,
            freeton.utils.convertCrystal('10', 'nano'),
            true,
            this.keyPair,
            onlyAddress
        );
    }
}

module.exports = WalletDeployer;