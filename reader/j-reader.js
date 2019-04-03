const Reader = require('./index');

const config_jsonx = {
    escape: '\\',
    status: [
        { name: 'quote', test: /["']/ },
        { name: 'nest', test: /[\{\[\(]/ },
        { name: 'comma', test: ',' },
        { name: 'colon', test: ':' },
    ],
    statusCallback: null,
    nests: { '{': '}', '[': ']', '(': ')' }
};

class JReader extends Reader {
    constructor(s){
        super(s, config_jsonx)
    }
}

module.exports = JReader;