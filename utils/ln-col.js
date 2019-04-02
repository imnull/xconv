module.exports = (str, i) => {
    let lns = str.substr(0, i + 1).split('\n');
    return [lns.length, lns.pop().length];
}