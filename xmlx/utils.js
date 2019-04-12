const binderTest = /\{\{([\w\W]*?)\}\}/;
const matchAll = (str, start, reg, fn) => {
    let m = str.substr(start).match(reg);
    if(!m){
        return;
    }
    fn(m, start);
    matchAll(str, start + m[0].length, reg, fn);
};
module.exports = {
    binderTest,
    matchAll,
    getBinders: (input) => {
        let r = [];
        matchAll(input, 0, binderTest, (m, start) => {
            let [origin, script] = m, size = origin.length;
            let { index } = m;
            index += start;
            script = script.replace(/^\s+|\s+$/g, '');
            r.push({ index, size, origin, script, input });
        });
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