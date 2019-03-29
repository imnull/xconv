const NEST_DIC = {
    '{': '}',
    '[': ']',
    '(': ')'
};

const QUOTE_DIC = {
    '"': '"',
    "'": "'",
    '`': '`'
};

const SCRIPT_NAMES = [
    'wxs', 'filter'
];

const NODE_LEFT = '<';
const NODE_RIGHT = '>';
const ESCAPE_CHAR = '\\';

const NODE_TYPES = {
    NODE: 1,
    TEXT: 3,
    COMMENT: 5
};

const NODE_STATUS = {
    START: 0,
    END: 1,
    SINGLE: 2
};

const ATTR_NAME_NS = [
    'if', 'for', 'key', 'for-index'
];

const BLOCK_PAIRS = [
    { left: '<!--', right: '-->', closure: true }
];

module.exports = {
    NEST_DIC,
    QUOTE_DIC,
    SCRIPT_NAMES,
    NODE_LEFT,
    NODE_RIGHT,
    ESCAPE_CHAR,
    NODE_TYPES,
    NODE_STATUS,
    ATTR_NAME_NS,
    BLOCK_PAIRS,
};