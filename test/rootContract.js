const freeton = require('../src');
const { expect } = require('chai');
const logger = require('mocha-logger');
const Wallet = require('./walletContract');

class RootContract {
    /**
     * 
     * @param {freeton.TonWrapper} tonInstance 
     * @param {JSON} rootParameters 
     * @param {JSON} keyPair 
     */
    constructor(tonInstance, rootParameters, keyPair) {
        this.tonInstance = tonInstance;
        this.keyPair = keyPair;
        this.initParams = rootParameters.initParams;
        this.constructorParams = rootParameters.constructorParams;
        this.rootContract = undefined;
    }

    setConfig(newConfig) {
        this.initParams = newConfig.initParams;
        this.constructorParams = newConfig.constructorParams;
    }

    /**
     * Deploy root contract or just get the address
     * @dev For internal use only
     * @param {Boolean} onlyAddress 
     * @returns {Promise<String>}
     */
    async _deployRoot(onlyAddress) {
        return await this.rootContract.deploy(
            this.constructorParams,
            this.initParams,
            freeton.utils.convertCrystal('4', 'nano'),
            true,
            this.keyPair,
            onlyAddress
        );
    }

    /**
     * Deploy wallet contract from root contract
     * @dev For internal use only
     * @param {Wallet} walletObject 
     * @returns {Promise<String>}
     */
    async _deployWallet(walletObject) {
        return (await this.rootContract.run(
            'deployWallet',
            walletObject.initParams,
            this.keyPair
        )).decoded.output.value0;
    }

    /**
     * Mint tokens to specified wallet
     * @dev Fails with Error if balance test fails
     * @dev For internal use only
     * @param {Wallet} walletObject
     * @param {Number} tokensAmount
     */
    async _mintToWallet(walletObject, tokensAmount) {
        await this.rootContract.run(
            'mint', {
                tokens: tokensAmount,
                to: walletObject.walletContract.address
            },
            this.keyPair
        );

        let balance = (await walletObject.walletContract.run(
            'getDetails', {},
            walletObject.keyPair
        )).decoded.output.value0;
        console.log(balance);
        return balance;
    }

    /**
     * Load root contract from local file system
     */
    async loadContract() {
        this.rootContract = await freeton.requireContract(this.tonInstance, 'RootTokenContract');

        expect(this.rootContract.address).to.equal(undefined, 'Address should be undefined');
        expect(this.rootContract.code).not.to.equal(undefined, 'Code should be available');
        expect(this.rootContract.abi).not.to.equal(undefined, 'ABI should be available');
    }

    /**
     * Get future address of root contract
     */
    async getFutureAddress() {
        await this._deployRoot(true);

        expect(this.rootContract.address).to.be.a('string').and.satisfy(s => s.startsWith('0:'), 'Bad address');
    }

    /**
     * Deploy root contract
     */
    async deployContract() {
        await this._deployRoot(false);

        expect(this.rootContract.address).to.be.a('string').and.satisfy(s => s.startsWith('0:'), 'Bad address');

        logger.success(`Contract address: ${this.rootContract.address}`);
    }

    /**
     * Check initial parameters for correctness
     */
    async checkParameters() {
        // let name_ = (await this.rootContract.run('getName', {}, this.keyPair)).decoded.output.value0;
        // let symbol_ = (await this.rootContract.run('getSymbol', {}, this.keyPair)).decoded.output.value0;
        // let decimals_ = (await this.rootContract.run('getDecimals', {}, this.keyPair)).decoded.output.value0;
        // let root_public_key_ = (await this.rootContract.run('getRootPublicKey', {}, this.keyPair)).decoded.output.value0;

        // expect(name_).to.be.a('String').and.satisfy(s => s === this.initParams.name_,
        //     `Invalid name_ parameter. expected: ${this.initParams.name_}, got: ${name_}`);
        // expect(symbol_).to.be.a('String').and.satisfy(s => s === this.initParams.symbol_,
        //     `Invalid symbol_ parameter. expected: ${this.initParams.symbol_}, got: ${symbol_}`);
        // expect(decimals_).to.be.a('String').and.satisfy(s => s === String(this.initParams.decimals_),
        //     `Invalid decimals_ parameter. expected: ${this.initParams.decimals_}, got: ${decimals_}`);
        // expect(root_public_key_).to.be.a('String').and.satisfy(s => s === this.initParams.root_public_key_,
        //     `Invalid root_public_key_ paramter. expected: ${this.initParams.root_public_key_}`);
        // logger.success(`received valid name_, symbol_, decimals_, root_public_key_`);
    }

    /**
     * Deploy empty wallets with 0 token balance
     * Wallet object has these fields:
     *  initParams - JSON with initial parameters
     *  constructorParams - JSON with parameters which will be passed to constructor
     *  keyPair - JSON with pulic key and private key 
     * @param {Wallet} userWallet 
     * @param {Wallet} swapPairWallet
     * @returns {Promise<JSON>} JSON with 'user' and 'swap' properties with wallets
     */
    async deployWallets(userWallet, swapPairWallet) {
        let userWalletAddress = await this._deployWallet(userWallet);
        let swapPairAddress = await this._deployWallet(swapPairWallet);

        expect(userWalletAddress).to.be.a('String').and.satisfy(s => s.startsWith('0:'),
            `Cannot deploy user wallet for token: ${this.initParams.name_}`);
        expect(swapPairAddress).to.be.a('String').and.satisfy(s => s.startsWith('0:'),
            `Cannot deploy swap pair wallet for token: ${this.initParams.name_}`);

        userWallet.setWalletAddress(userWalletAddress);
        swapPairWallet.setWalletAddress(swapPairAddress);

        logger.success(`User wallet deployed successfully. Address: ${userWalletAddress}`);
        logger.success(`Swap pair wallet deployed successfully. Address: ${swapPairAddress}`);

        return {
            user: userWalletAddress,
            swap: swapPairAddress
        }
    }

    /**
     * Mint tokens to specified addresses
     * @param {Wallet} userWallet Wallet of user 
     * @param {Wallet} swapPairWallet Wallet of swap pair
     * @param {JSON} initialTokens Initial tokens distribution
     */
    async mintTokensToWallets(userWallet, swapPairWallet, initialTokens) {
        let balance = await this._mintToWallet(userWallet, initialTokens.user);
        expect(balance).to.be.a('Number').and.equal(initialTokens.user);
        balance = await this._mintToWallet(swapPairWallet, initialTokens.swap);
        expect(balance).to.be.a('Number').and.equal(initialTokens.swap);
        logger.success(`Tokens minted successfully`);
    }

    /**
     * 
     * @param {String} pubkey 
     * @param {String} address 
     */
    async calculateFutureWalletAddress(pubkey, address) {
        return (await this.rootContract.runLocal('getWalletAddress', {
            wallet_public_key_: pubkey,
            owner_address_: address
        }));
    }
}

module.exports = RootContract;