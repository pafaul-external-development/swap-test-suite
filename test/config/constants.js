const freeton = require('../../src');
CRYSTAL_AMOUNT = freeton.utils.convertCrystal('5', 'nano');
DEFAULT_TIMEOUT = 5 * 60 * 1000;
ZERO_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000';

module.exports = { CRYSTAL_AMOUNT, DEFAULT_TIMEOUT, ZERO_ADDRESS };