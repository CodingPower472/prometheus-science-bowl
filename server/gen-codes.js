
function genJoinCode() {
    let res = '';
    const pickFrom = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        res += pickFrom.charAt(Math.floor(Math.random() * pickFrom.length));
    }
    return res;
}

function genSessionToken() {
    let res = '';
    const pickFrom = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        res += pickFrom.charAt(Math.floor(Math.random() * pickFrom.length));
    }
    return res;
}

module.exports = {
    genJoinCode,
    genSessionToken
};
