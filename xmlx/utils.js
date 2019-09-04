const { readQuote, readBinders } = require('../utils/read-binder');

const binderTest = /\{\{([\w\W]+?)\}\}([^\}]|$)/;
const matchAll = (str, start, reg, fn) => {
    // console.log(str.substr(start))
    let m = str.substr(start).match(reg);
    if(!m){
        return;
    }
    m[0] = m[0].substr(0, m[0].length - m[2].length);
    fn(m, start);
    matchAll(str, start + m.index + m[0].length, reg, fn);
};

module.exports = {
    binderTest,
    matchAll,
    readQuote,
    readBinders,
    getBinders: (input, left = '{{', right = '}}') => {
        const r = readBinders(input, left, right).filter(it => it.type === 'binder').map(({ value, pos }) => ({
            index: pos[0],
            size: pos[1] - pos[0],
            origin: value,
            script: value.substring(left.length, value.length - right.length),
            input
        }));
        // console.log(r, input)
        return r;
    },
    binderToString: (str, binders) => {
        let r = [], A = 0, B = A;
        binders.forEach(binder => {
            let { index, size, script, newScript = script } = binder;
            if(index > B){
                r.push(str.substring(B, index));
            }
            r.push(`{{${newScript}}}`);
            A = index, B = A + size;
        });
        if(B < str.length - 1){
            r.push(str.substr(B));
        }
        return r.join('');
    }
};

// const test = '123{{"abc"aa + C.sum(0 + "}}")}}abc{{{12}}}';

// console.log(readBinders(test))
// console.log(aaa(test))