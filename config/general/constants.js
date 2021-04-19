const freeton = require('../../src');
CRYSTAL_AMOUNT = freeton.utils.convertCrystal('4', 'nano');
DEFAULT_TIMEOUT = 15 * 60 * 1000;
ZERO_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000';
ZERO_PUBKEY = '0000000000000000000000000000000000000000000000000000000000000000';
MSIG_RECOMMENDED_BALANCE = freeton.utils.convertCrystal('4', 'nano');
TIP3_RECOMMENDED_BALANCE = freeton.utils.convertCrystal('0.5', 'nano');
TWO_CRYSTALS = freeton.utils.convertCrystal('2', 'nano');
ONE_CRYSTAL = freeton.utils.convertCrystal('1', 'nano');
HALF_CRYSTAL = freeton.utils.convertCrystal('0.5', 'nano');
QUATER_CRYSTAL = freeton.utils.convertCrystal('0.25', 'nano');
TOKENS_TO_MINT = 10e+12;
RETRIES = 25;

module.exports = {
    CRYSTAL_AMOUNT,
    DEFAULT_TIMEOUT,
    ZERO_ADDRESS,
    ZERO_PUBKEY,
    RETRIES,
    MSIG_RECOMMENDED_BALANCE,
    TIP3_RECOMMENDED_BALANCE,
    TOKENS_TO_MINT,
    TWO_CRYSTALS,
    ONE_CRYSTAL,
    HALF_CRYSTAL,
    QUATER_CRYSTAL
};