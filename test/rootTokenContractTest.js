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


    });
})