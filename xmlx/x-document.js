const { Document } = require('oop-node');
const AttributeBinder = require('./attribute-binder');
const ElementBinder = require('./element-binder');

class XDocument extends Document {
    createBinder(value){
        return new ElementBinder({ document: this, value });
    }

    createAttributeBinder(name, value, quote, parent){
        return new AttributeBinder({ document: this, name, value, quote, parent });
    }

    get documentElement(){
        return this.root;
    }

    get childNodes(){
        return this.documentElement.childNodes;
    }
}

module.exports = XDocument;