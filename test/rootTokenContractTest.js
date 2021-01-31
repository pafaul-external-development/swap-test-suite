const freeton = require('./../src');
const { expect } = require('chai');
const logger = require('mocha-logger');

const ton = new freeton.TonWrapper({
    giverConfig: {},
    network: 'http://localhost',
    seed: "some seed"
});

let rootTokenContract;
let wallet1;
let wallet2;
let callbackSC;

describe('Test for TIP-3 token', async function() {
    describe('Root token contract', async function() {
        it('Setup', async function() {
            /*
                1 - root
                2 - wallet1
                3 - wallet2
                4 - callback SC
            */
            await ton.setup(4);

            expect(ton.keys).to.have.lengthOf(4, 'Wrong keys amount');
        });

        it('Load Root Token contract', async function() {
            RootTokenContract = await freeton.requireContract(ton, 'RootTokenContract');
            wallet1 = await freeton.requireContract(ton, 'TONTokenWallet');
            wallet2 = await freeton.requireContract(ton, 'TONTokenWallet');
            callbackSC = await freeton.requireContract(ton, 'CallbackTestContract');


            expect(RootTokenContract.address).to.equal(undefined, 'Address should be undefined');
            expect(RootTokenContract.code).not.to.equal(undefined, 'Code should be available');
            expect(RootTokenContract.abi).not.to.equal(undefined, 'ABI should be available');
        });

        it('Get future address of root token contract', async function() {
            const address = await RootTokenContract.deploy({}, {
                name_: 'Test',
                symbol_: 'T',
                decimals_: 9,
                root_public_key_:
            })
        });

    });
})