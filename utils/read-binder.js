const readQuote = (s, i, q, esc = '\\') => {
    let l = s.length, ch;
    while(i < l){
        ch = s.charAt(i);
        if(ch === q){
            return i;
        } else if(ch === esc){
            i += 2;
            continue;
        }
        i++;
    }
    return -1;
}

const readBinders = (s, left = '{{', right = '}}') => {
    let r = [], i = 0, l = s.length, ch, _i, st = 0, L = left.charAt(0), R = right.charAt(0);
    while(i < l){
        ch = s.charAt(i);
        switch(ch){
            case '"':
            case "'":
            case "`":
                _i = i;
                i = readQuote(s, _i + 1, ch);
                if(i < 0) return r;
                break;
            case L:
                if(s.substr(i, left.length) === left){
                    if(st < i){
                        r.push({
                            type: 'text',
                            value: s.substring(st, i),
                            pos: [st, i]
                        });
                    }
                    st = i;
                    i += 2;
                    continue;
                }
                break;
            case R:
                if(s.substr(i, right.length) === right && s.substr(i + 1, right.length) !== right){
                    i += 2;
                    r.push({
                        type: 'binder',
                        value: s.substring(st, i),
                        pos: [st, i]
                    });
                    st = i;
                    continue;
                }
                break;
        }
        i++;
    }
    if(st < i){
        r.push({
            type: 'text',
            value: s.substring(st, i),
            pos: [st, i]
        });
    }

    return r;
}

const readBinderEndIndex = (s, i, right = '}}') => {
    let l = s.length, ch, R = right.charAt(0);
    while(i < l){
        ch = s.charAt(i);
        switch(ch){
            case '"':
            case "'":
            case "`":
                i = readQuote(s, i + 1, ch);
                if(i < 0) return i;
                break;
            case R:
                if(s.substr(i, right.length) === right && s.substr(i + 1, right.length) !== right){
                    i += right.length;
                    return i;
                }
                break;
        }
        i++;
    }
    return -1;
}

module.exports = {
    readBinders,
    readQuote,
    readBinderEndIndex,
};