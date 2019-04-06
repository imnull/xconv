const { Document, ElementBase, Attribute } = require('oop-node');

class AttributeBinder extends Attribute {

    constructor(option){
        option = { ...option, type: 102 };
        super(option);
        let { quote = '"' } = option;
        this.quote = quote;
    }

    toString(){
        let { name, value = '', quote = '"' } = this;
        if(/^\{\{[\w\W]*\}\}$/.test(value)){
            return `${name}=${quote}${value}${quote}`;
        } else {
            return super.toString();
        }
    }
}

module.exports = AttributeBinder;