module.exports.parse = (v) => {
    if(typeof(v) === 'string'){
        return v;
    } else if(typeof(v) === 'number'){
        return isNaN(v) ? '' : v.toString();
    } else if(!v){
        return '';
    } else {
        return v.toString();
    }
};

module.exports.trim = (s) => {

};