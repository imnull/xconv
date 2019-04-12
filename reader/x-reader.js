const Reader = require('./index');
const { LnCol } = require('../utils');

const config_xml = {
    escape: '\\',
    status: [
        { name: 'quote', test: /["']/, nest: '<' },
        { name: 'quote', test: /["']/, nest: '{' },
        { name: 'quote', test: /["']/, nest: '[' },
        { name: 'quote', test: /["']/, nest: '(' },
        { name: 'nest', test: /[\{\[\(]/ },
        { name: 'binder', test: '{{', weight: 100 },
        { name: 'comment', test: '<!--' },
        { name: 'nest', test: /^<\/?[a-z]+/i, size: 3, rename: 'node', nest: '<', out: true },
        { name: 'node$name', test: /<\/?[a-z]+/i, nest: '<', offset: -1, size: 3 },
        { name: 'node$close', test: '/', nest: '<', weight: 100 },
        { name: 'attr$name', test: /^[^\s\=>]+\s*\=?/, nest: '<' },
        { name: 'attr$equal', test: '=', nest: '<' },
        { name: 'attr$value', test: /^=\s*[^\s]+/, nest: '<', offset: 0, size: -1, weight: 50 },
    ],
    statusCallback: null,
    nests: { '{': '}', '[': ']', '(': ')', '<': '>' }
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

    read_binder(i, sub){
        let _i = i;
        i += 2;
        let _sub = [];
        for(; i < this.length; i++){
            let c = this.charAt(i);
            if(this.status() === 'quote'){
                i = this.read_quote(i, _sub);
            } else if(c === '}' && this.substr(i, 2) === '}}'){
                i += 1;
                sub.push(this.seg(_i, i - _i + 1))
                return i;
            }
        }
        let [ln, col] = LnCol(this.s, _i);
        let err = `Binder is not closed. '{{' at Ln ${ln} Col ${col}`;
        throw err;
    }

    read_attr$equal(i, sub){
        return this._read_one_char(i, sub);
    }

    read_node$close(i, sub){
        return this._read_one_char(i, sub);
    }

    read_attr$name(i, sub){
        return this._read_regexp(i, sub, /([^\s\=>]+)\s*\=?/, 1)
    }

    read_node$name(i, sub){
        return this._read_regexp(i, sub, /\/?[a-z][\w\-\_]*/, 0)
    }

    read_attr$value(i, sub){
        i = this._read_blank(i + 1);
        let st = this.status();
        if(st === 'quote'){
            let _i = i;
            let quote = this.charAt(i);
            i = this._read_blank(i + 1);
            if(this.substr(i, 2) === '{{'){
                return this.read_to_str(`}}${quote}`, _i + 1, sub, 'attr$value', -1, { quote })
            } else {
                return this.read_quote(_i, sub);
            }
        } else {
            return this._read_regexp(i, sub, /[^\s"'=><]+/, 0, 'attr$value')
        }
    }
};

module.exports = XReader;
