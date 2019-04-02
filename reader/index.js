const LnCol = require('../utils/ln-col');
const trim = s => s.replace(/^\s+|\s+$/g, '');

class Reader {

    constructor(s, config){
        this.s = s;
        this.config = config;
        this.position = 0;
    }

    get length(){
        return this.s.length;
    }

    status(){
        let { status, statusCallback } = this.config;
        let c = this.charAt(this.position);
        if(c in status){
            let st = status[c];
            if(typeof(st) === 'function'){
                st = st(c, this.position, this.s);
            }
            return st;
        } else if(typeof(statusCallback) === 'function'){
            return statusCallback(c, this.position, this.s);
        } else {
            return 'plain';
        }
    }

    seek(offset){
        this.position = Math.max(0, Math.min(this.length, this.position + offset));
        return this.position;
    }

    charAt(i){
        this.position = i;
        return this.s.charAt(i);
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


    seg(index, size, ext = {}){
        let status = this.status(this.charAt(index));
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
        for(; i < this.length; i++){
            c = this.charAt(i);
            st = `read_${this.status(c)}`;
            if(st in this){
                if(i > j){
                    sub.push(this.seg(j, i - j))
                }
                i = this[st](i, sub);
                j = i + 1;
            } else if(c === right){
                if(i > j){
                    sub.push(this.seg(j, i - j))
                }
                sub = sub.filter(n => n.status !== 'plain' || !/^\s*$/.test(n.text));
                _sub.push(this.seg(_i, i - _i + 1, { left, sub }));
                return i;
            }
        }
        let [ln, col] = LnCol(this.s, _i);
        let err = `Nest is not closed. "${left}" at Ln ${ln} Col ${col}`;
        throw err;
    }

    read_comma(i, sub){
        sub.push(this.seg(i, 1));
        return this.position = i;
    }

    read_colon(i, sub){
        sub.push(this.seg(i, 1));
        return i;
    }

    read(i = 0, r = []){
        let j = i, len = this.length;
        for(; i < len; i++){
            let c = this.charAt(i);
            let st = `read_${this.status(c)}`;
            if(st in this){
                if(j < i){
                    r.push(this.seg(j, i - j))
                }
                i = this[st](i, r);
                if(i < 0){
                    return r;
                }
                j = i + 1;
            }
        }
        if(j < i){
            r.push(this.seg(j, i - j))
        }
        return r;
    }

};

module.exports = Reader;