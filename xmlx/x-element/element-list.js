const List = require('./list');

class ElementList extends List {

    findByName(name){
        return this.find(node => node.name === name);
    }

    toString(){
        return this.list.map(el => `${el}`).join('\n');
    }
}

module.exports = ElementList;