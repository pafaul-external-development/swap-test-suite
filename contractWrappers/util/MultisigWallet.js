const freeton = require('../../src');

class MultisigWallet {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} msigParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, msigParameters, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = msigParameters.initParams;
        this.constructorParams = msigParameters.constructorParams;
        this.msigContract = undefined;
    }

    /**
     * Loads contract files from file system
     */
    async loadContract() {
        this.msigContract = await freeton.requireContract(this.tonInstance, 'SafeMultisigWallet');
    }

    /**
     * 
     * @returns {String} get contract address
     */
    getAddress() {
        return this.msigContract.address;
    }

    /**
     * Calculate future address
     */
    async getFutureAddress() {
        if (!this.msigContract)
            await this.loadContract();
        return await this.msigContract.getFutureAddress({
            constructorParams: this.constructorParams,
            initParams: this.initParams,
            keyPair: this.keyPair
        });
    }

    /**
     * Deploy multisig to net
     */
    async deployContract() {
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
            await this.msigContract.deploy({
                constructorParams: this.constructorParams,
                initParams: this.initParams,
                initialBalance: freeton.utils.convertCrystal('200', 'nano'),
                _randomNonce: false,
                keyPair: this.keyPair,
            });
        }
        this.msigContract.address = futureAddress;
        return futureAddress;
    }

    /**
     * Transfer tokens to address
     * @param {String} to Address to transfer tokens to
     * @param {String} value How much tokens to transfer
     * @param {String} payload Transfer payload
     */
    async transferTo(to, value, payload) {
        return await this.msigContract.run(
            'sendTransaction', {
                dest: to,
                value: value,
                bounce: true,
                flags: 1,
                payload: payload
            }, this.keyPair
        );
    }
}

module.exports = MultisigWallet;