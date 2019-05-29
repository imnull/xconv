const Reader = require('./index');
const { LnCol } = require('../utils');

const config_style = {
    escape: '\\',
    status: [
        { name: 'quote', test: /["']/ },
        { name: 'nest', test: /[\{\[\(]/ },
        // { name: 'comma', test: ',' },
        // { name: 'colon', test: ':' },
        // { name: 'semicolon', test: ';' },
        { name: 'comment', test: '//' },
        { name: 'comment', test: '/*' },
        { name: 'import', test: '@import' },
        { name: 'var', test:/^\@[^:;]+:[^;]*;/, size: -1 },
        { name: 'rule', test: /^[^\s:;}"'`]+\s*:/, nest: '{', size: -1 },
    ],
    statusCallback: null,
    nests: { '{': '}', '[': ']', '(': ')' }
};

class StyleReader extends Reader {
    constructor(s){
        super(s, config_style)
    }

    read_rule(i, sub){
        let s = this.substr(i);
        let m = s.match(/([^\s\;\:\}]+)\s*\:\s*/);
        // console.log('----', m)
        let _i = i;
        i += m.index + m[0].length;

        let key = m[1];
        let offset = 0, _sub = [];
        let j = this.readTo(i, s => {
            if(s === '}'){
                offset = 1;
                return true;
            } else {
                return s === ';';
            }
        }, _sub);
        // console.log('----', this.substr(j))

        let value = this.substr(i, j - i).replace(/^\s+|\s+$/g, '');

        // i = this.readTo(s => s === ';', i + m[0].length);
        // i += 1;

        // console.log(this.substr(_i, j - _i), '#####')
        // console.log(this.substr(_i, i - _i), _i, j, 111111)
        sub.push(this.seg(_i, j - _i + (1 - offset), { key, value, sub: _sub }, 'rule'));
        
        s = this.substr(i);

        return this.position = j - offset;
    }

    read_comment(i, sub){
        let head = this.substr(i, 2);
        let idx, offset = 0;
        if(head === '//'){
            idx = this.indexOf('\n', i);
        } else {
            idx = this.indexOf('*/', i);
            offset = 2;
        }
        if(idx < 0){
            let [ln, col] = LnCol(this.s, i);
            let err = `Comment is not closed at Ln ${ln} Col ${col}`;
            throw err;
        };
        idx += offset
        sub.push(this.seg(i, idx - i));
        return this.position = idx - 1;
    }

    read_import(i, sub){
        let _i = i;
        let s = this.substr(i);
        let m = s.match(/@import\s+url\s*/);
        i += m[0].length;
        this.position = i;
        if(this.status() === 'nest'){
            let _sub = [];
            i = this.read_nest(this.position, _sub) + 1;
            s = this.substr(i);
            m = s.match(/\s*;*/);
            i += m[0].length;
            sub.push(this.seg(_i, i - _i, { url: _sub[0].sub[0].text }, 'import'));
            return this.position = i - 1;
        } else {
            let [ln, col] = LnCol(this.s, i);
            let err = `Import url error at Ln ${ln} Col ${col}`;
            throw err;
        }
    }

    read_var(i, sub){
        let s = this.substr(i);
        let m = s.match(/^\@([^:;]+):([^;]*);/);
        let name = m[1].replace(/^\s+|\s+$/g, '');
        let value = m[2].replace(/^\s+|\s+$/g, '');
        sub.push(this.seg(i, m[0].length, { name, value }, 'var'));
        return this.position = i + m[0].length - 1;
    }
}

module.exports = StyleReader;