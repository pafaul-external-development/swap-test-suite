const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

class Wallet {
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
     * Set wallet address
     * @param {String} walletAddress 
     */
    setWalletAddress(walletAddress) {
        this.walletContract.address = walletAddress;
    }

    /**
     * Set wallet address to send tokens to
     * @param {String} walletAddress 
     */
    setTransactionAddress(walletAddress) {
        this.transactionAddress = walletAddress;
    }

    async setCallbackAddress(address) {
        return await this.walletContract.run('setReceiveCallback', { receive_callback_: address }, this.keyPair);
    }

    async loadContract() {
        this.walletContract = await freeton.requireContract(this.tonInstance, 'TONTokenWallet');

        expect(this.walletContract.address).to.equal(undefined, 'Address should be undefined');
        expect(this.walletContract.code).not.to.equal(undefined, 'Code should be available');
        expect(this.walletContract.abi).not.to.equal(undefined, 'ABI should be available');
    }

    /**
     * Transfer tokens
     * @param {String} address
     * @param {Number} tokenAmount 
     */
    async transfer(address, tokenAmount) {
        await this.walletContract.run(
            'transfer', {
                to: address,
                tokens: tokenAmount,
                grams: freeton.utils.convertCrystal('0.2', 'nano')
            },
            this.keyPair
        );
    }
}

module.exports = Wallet;