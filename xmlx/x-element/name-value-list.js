const NameValue = require('./name-value');
const List = require('./list');

class NameValueList extends List {

    create(name, value){
        let nv = new NameValue(name, value);
        this.append(nv);
        return nv;
    }

    add(name, value){
        this.create(name, value);
        return this;
    }

    containsName(name){
        return this.contains(nv => nv.n === name);
    }

    containsValue(value){
        return this.contains(nv => nv.v === value);
    }

    findNameIndex(name){
        return this.findIndex(nv => nv.n === name);
    }
    findValueIndex(value){
        return this.findIndex(nv => nv.v === value);
    }

    findByName(name){
        return this.find(nv => nv.n === name);
    }

    findByValue(value){
        return this.find(nv => nv.v === value);
    }

    toString(){
        return this.list.map(nv => nv.toString()).join(' ');
    }

    toObject(){
        return Object.assign({}, ...this.list.map(nv => nv.toObject()))
    }
}

module.exports = NameValueList;