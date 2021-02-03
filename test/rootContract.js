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

    /**
     * Deploy root contract or just get the address
     * @dev For internal use only
     * @param {Boolean} onlyAddress 
     * @returns {Promise<String>}
     */
    async _deployRoot(onlyAddress) {
        let that = this;
        return await this.rootContract.deploy(
            constructorParams = that.constructorParams,
            initParams = that.initParams,
            initialBalance = 3 * Math.pow(10, 9),
            _randomNonce = true,
            keyPair = keyPair,
            onlyDeriveAddress = onlyAddress
        );
    }

    /**
     * Deploy wallet contract from root contract
     * @dev For internal use only
     * @param {Wallet} walletObject 
     * @returns {Promise<String>}
     */
    async _deployWallet(walletObject) {
        return await this.rootContract.run(
            functionName = 'deployEmptyWallet',
            input = walletObject.initParams,
            _keyPair = walletObject.keyPair
        )
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
            functionName = 'mint',
            input = {
                tokens: tokensAmount,
                to: walletObject.walletContract.address
            }
        );

        let balance = await walletObject.walletContract.run(
            functionName = 'getBalance',
            input = {},
            _keyPair = walletObject.keyPair
        );

        expect(balance).to.be.a('Number').and.equal(tokensAmount);
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
        let name_ = await this.rootContract.run(functionName = 'getName', input = {}, _keyPair = this.keyPair);
        let symbol_ = await this.rootContract.run(functionName = 'getSymbol', input = {}, _keyPair = this.keyPair);
        let decimals_ = await this.rootContract.run(functionName = 'getDecimals', input = {}, _keyPair = this.keyPair);
        let root_public_key_ = await this.rootContract.run(functionName = 'getRootPublicKey', input = {}, _keyPair = this.keyPair);

        expect(name_).to.be.a('String').and.satisfy(s => s.equal(this.initParams.name_),
            `Invalid name_ parameter. expected: ${this.initParams.name_}, got: ${name_}`);
        expect(symbol_).to.be.a('String').and.satisfy(s => s.equal(this.initParams.symbol_),
            `Invalid symbol_ parameter. expected: ${this.initParams.symbol_}, got: ${symbol_}`);
        expect(decimals_).to.be.a('Number').and.satisfy(s => s.equal(this.initParams.decimals_),
            `Invalid decimals_ parameter. expected: ${this.initParams.decimals_}, got: ${decimals_}`);
        expect(root_public_key_).to.be.a('String').and.satisfy(s => s.equal(this.initParams.root_public_key_),
            `Invalid root_public_key_ paramter. expected: ${this.initParams.root_public_key_}`);
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

        expect(userWalletAddress).to.be.a('String').and.satisfy(s => startsWith('0:'),
            `Cannot deploy user wallet for token: ${this.initParams.name_}`);
        expect(swapPairAddress).to.be.a('String').and.satisfy(s => startsWith('0:'),
            `Cannot deploy swap pair wallet for token: ${this.initParams.name_}`);

        userWallet.address = userWalletAddress;
        swapPairWallet.address = swapPairAddress;

        logger.success(`User wallet deployed successfully. Address: ${userWalletAddress}`);
        logger.success(`Swap pair wallet deployed successfully. Address: ${swapPairWallet}`);

        return {
            user: userWallet,
            swap: swapPairWallet
        }
    }

    /**
     * Mint tokens to specified addresses
     * @param {Wallet} userWallet Wallet of user 
     * @param {Wallet} swapPairWallet Wallet of swap pair
     * @param {JSON} initialTokens Initial tokens distribution
     */
    async mintTokensToWallets(userWallet, swapPairWallet, initialTokens) {
        await this._mintToWallet(userWallet, initialTokens.user);
        await this._mintToWallet(swapPairWallet, initialTokens.swap);
    }
}

module.exports = RootContract;