const Reader = require('./index');

const config_jsonx = {
    escape: '\\',
    status: {
        '"': 'quote',
        "'": 'quote',
        ',': 'comma',
        ':': 'colon',
        '{': 'nest',
        '[': 'nest',
        '(': 'nest',
    },
    statusCallback: null,
    nests: { '{': '}', '[': ']', '(': ')' }
};

class JReader extends Reader {
    constructor(s){
        super(s, config_jsonx)
    }
}

module.exports = JReader;