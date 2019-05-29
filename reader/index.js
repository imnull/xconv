const { LnCol, Str: { trim } } = require('../utils');
const {
    Type: {
        isFunction, isString, isArray, isRegExp
    }
} = require('../utils')

const run_test = (s, i, tester, stack) => {
    let {
        test, nest = null,
        size = 1, offset = 0, out = false
    } = tester;

    // 如果存在嵌套断言
    if(nest){
        // 应在指定嵌套外
        if(out && stack.length > 0 && stack[stack.length - 1].left === nest){
            return false;
        }
        // 应在指定嵌套内
        if(!out && (stack.length < 1 || stack[stack.length - 1].left !== nest)){
            return false;
        }
    }
    if(isString(test)){
        return s.substr(i, test.length) === test;
    } else if(isFunction(test)){
        return test(s, i, stack);
    } else if(isRegExp(test)){
        i = Math.max(i + offset, 0);
        return test.test(s.substr(i, size < 0 ? s.length : size));
    } else if(isArray(test)){
        return test.some(t => run_test(s, i, t, stack))
    }
    return false;
}

class Reader {

    constructor(s, config){
        this.s = s;
        this.config = config;
        this.position = 0;
        this.stack = [];

        this._init_reading_();
    }

    _init_reading_(){
        let target = this;
        this.config.status.forEach(({ name, test }) => {
            if(isString(test)){
                let method_name = `read_${name}`;
                if(!(method_name in target)){
                    let len = test.length;
                    target[method_name] = function(i, sub){
                        sub.push(this.seg(i, len));
                        return this.position = i + len - 1;
                    };
                }
            }
        })
    }

    get length(){
        return this.s.length;
    }

    statusMatch(i = this.position){
        let { status } = this.config;
        let matches = status
            .filter(s => run_test(this.s, i, s, this.stack))
            .sort((a, b) => {
                let { weight: A = 0 } = a;
                let { weight: B = 0 } = b;
                return B - A
            })
            ;
        if(matches.length < 1){
            return null;
        } else {
            return matches[0];
        }
    }

    readTo(i, fn, sub){
        let j = i, len = this.length;
        for(; i < len; i++){
            let c = this.charAt(i);
            let st = `read_${this.status()}`;
            // console.log(i, c, this.substr(i, 4), st, '-======')
            if(st in this){
                i = this[st](i, sub);
                if(i < 0){
                    this.position = j;
                    return -1;
                }
            } else {
                if(fn(c, i, this.s)){
                    this.position = i;
                    return i;
                }
            }
        }
        this.position = j;
        return -1;
    }

    status(){
        let m = this.statusMatch();
        return m ? m.name : 'plain';
    }

    seek(offset){
        this.position = Math.max(0, Math.min(this.length, this.position + offset));
        return this.position;
    }

    charAt(i, seek = true){
        if(seek) this.position = i;
        return this.s.charAt(i);
    }

    peek(size = 1){
        return this.substr(this.position, size);
    }

    substr(...args){
        return this.s.substr(...args);
    }

    substring(...args){
        return this.s.substring(...args);
    }

    indexOf(...args){
        return this.s.indexOf(...args);
    }

    seg(index, size, ext = {}, status = null){
        this.position = index;
        if(!status){
            let m = this.statusMatch();
            if(!m){
                status = 'plain';
            } else {
                let { name, rename = name } = m;
                status = rename;
            }
        }
        let text = this.substr(index, size);
        switch(status){
            case 'quote':
                text = text.substr(1, text.length - 2);
                break;
            case 'plain':
                text = trim(text)
                break;
        }
        return { status, text, ...ext };
    }

    read_to_str(str, i, sub, status, offset = 0, ext = {}){
        let idx = this.indexOf(str, i);
        if(i < 0){
            let [ln, col] = LnCol(this.s, i);
            let err = `Can not find "${str}" from position ${i}. Ln ${ln} Col ${col}`;
            throw err;
        }
        idx += str.length
        sub.push(this.seg(i, idx - i + offset, ext, status));
        return this.position = idx - 1;
    }

    read_quote(_i, sub){
        let i = _i, len = this.length, q = this.charAt(i++), c;
        for(; i < len; i++){
            c = this.charAt(i);
            if(c === this.config.escape){
                i += 1;
            } else if(c === q){
                sub.push(this.seg(_i, i - _i + 1, { quote: q }))
                return i;
            }
        }
        let [ln, col] = LnCol(this.s, _i);
        let err = `Quote is not closed. [${q}] at Ln ${ln} Col ${col}`;
        throw err;
    }

    read_nest(_i, _sub) {
        let i = _i, left = this.charAt(i++), right = this.config.nests[left], c, st;
        let j = i;
        let sub = [];
        this.stack.push({ left, right })
        for(; i < this.length; i++){
            c = this.charAt(i);
            st = `read_${this.status()}`;
            if(st in this){
                if(i > j){
                    sub.push(this.seg(j, i - j))
                }
                i = this[st](i, sub);
                j = i + 1;
            } else if(c === right){
                let depth = this.stack.length;
                this.stack.pop();
                if(i > j){
                    sub.push(this.seg(j, i - j))
                }
                sub = sub.filter(n => n.status !== 'plain' || !/^\s*$/.test(n.text));
                _sub.push(this.seg(_i, i - _i + 1, { left, sub, depth }));
                return i;
            }
        }
        let [ln, col] = LnCol(this.s, _i);
        let err = `Nest is not closed. "${left}" at Ln ${ln} Col ${col}`;
        throw err;
    }

    _read_blank(i){
        let blankReg = /^\s/;
        for(; i < this.length; i++){
            if(!blankReg.test(this.charAt(i))){
                break;
            }
        }
        return this.position = i;
    }

    _read_one_char(i, sub){
        sub.push(this.seg(i, 1));
        return this.position = i;
    }

    _read_regexp(i, sub, regexp, group = 0, status = null, ext = {}){
        let m = this.substr(i).match(regexp);
        let size = m.index + m[group].length;
        sub.push(this.seg(i, size, ext, status));
        return this.position = i + size - 1;
    }

    // read_comma(i, sub){
    //     return this._read_one_char(i, sub);
    // }

    // read_colon(i, sub){
    //     return this._read_one_char(i, sub);
    // }

    _read(i, sub = []){
        let j = i, len = this.length;
        for(; i < len; i++){
            let c = this.charAt(i);
            let st = `read_${this.status()}`;
            if(st in this){
                if(j < i){
                    sub.push(this.seg(j, i - j))
                }
                i = this[st](i, sub);
                j = i + 1;
            }
        }
        if(j < i){
            sub.push(this.seg(j, i - j))
        }
        return i;
    }

    read(i = 0){
        let r = [];
        this._read(i, r);
        r = r.filter(n => n.status !== 'plain' || !/^\s*$/.test(n.text))
        return r;
    }

};

module.exports = Reader;