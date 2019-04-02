const Reader = require('./index');
const LnCol = require('../utils/ln-col');

const config_xml = {
    escape: '\\',
    status: {
        '"': 'quote',
        "'": 'quote',
        '{': 'nest',
        '[': 'nest',
        '(': 'nest',
        '<': (c, idx, s) => {
          let ss = s.substr(idx);
          if(/^<\!--/.test(ss)){
            return 'comment';
          } else if(/^<\/?[a-z]/i.test(ss)){
            return 'node';
          } else {
            return 'plain'
          }
        },
    },
    statusCallback: null,
    nests: { '{': '}', '[': ']', '(': ')' }
};

class XReader extends Reader {

    constructor(s){
        super(s, config_xml)
    }

    read_comment(i, sub){
        let tail = '-->';
        let idx = this.indexOf(tail, i);
        if(idx < 0){
        let [ln, col] = LnCol(this.s, i);
        let err = `Comment is not closed at Ln ${ln} Col ${col}`;
        throw err;
        }
        idx += tail.length
        sub.push(this.seg(i, idx - i));
        return this.position = idx - 1;
    }

    read_node(_i, _sub) {
        let i = _i, left = this.charAt(i++), right = '>', c, st;
        let j = i;
        let sub = [];
        for(; i < this.length; i++){
            c = this.charAt(i);
            st = `read_${this.status(c)}`;
            if(st in this){
                i = this[st](i, sub);
                j = i + 1;
            } else if(c === right){
                _sub.push(this.seg(_i, i - _i + 1, { left }));
                return i;
            }
        }
        let [ln, col] = LnCol(this.s, _i);
        let err = `Node is not closed. "${left}" at Ln ${ln} Col ${col}`;
        throw err;
    }
};

module.exports = XReader;
