module.exports = {
    muldiv:  (a, b, c) => Math.floor((a*b)/c),
    muldivc: (a, b, c) => Math.ceil((a*b)/c),
    muldivr: (a, b, c) => Math.round((a*b)/c),
}