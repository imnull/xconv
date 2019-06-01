const JReader = require('../reader/j-reader');
const parser = {
    '[': n => n.sub.filter(n => n.status !== 'comma').map(n => value(n)),
    '{': n => {
        let r = {};
        let i = 0, sub = n.sub.filter(n => n.status !== 'comma'), len = Math.floor(sub.length / 3) * 3;
        for(; i < len; i += 3){
            if(sub[i + 1].status !== 'colon'){
                return r;
            }
            r[sub[i + 0].text] = value(sub[i + 2]);
        }
        return r;
    }
};

const value = n => {
    switch(n.status){
        case 'plain':
            return JSON.parse(n.text);
        case  'nest':
            return n.left in parser ? parser[n.left](n) : n.text;
        default:
            return n.text;
    }
};

const jsonx = {
    parse: (s) => {
        let result = new JReader(s).read();
        let [$1, $2] = result;
        let r;
        if($2 && $2.status === 'nest' && $1.status === 'plain'){ // JSONP
            r = $2.sub[0];
        } else {	// JSON
            r = $1;
        }
        return value(r);
    },
    parseFile: (path, encoding = 'utf-8') => {
        const fs = require('fs');
        let s = fs.readFileSync(path, { encoding });
        return jsonx.parse(s);
    }
};

module.exports = jsonx;
