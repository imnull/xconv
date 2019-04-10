const { Document, ElementBase, Attribute } = require('oop-node');

class AttributeBinder extends Attribute {

    constructor(option){
        option = { ...option };
        super(option);
        let { quote = '"', value = '' } = option;
        this.quote = quote;
        if(/\{\{([\w\W]*)\}\}/.test(value)){
            this.type = 102;
            this.value = RegExp.$1.replace(/^\s+|\s+$/g, '');
        } else {
            this.value = value;
        }
    }

    toString(){
        let { name, value = '', quote = '"' } = this;
        if(this.type === 102){
            return `${name}=${quote}{{ ${value} }}${quote}`;
        } else {
            return super.toString();
        }
    }
}

module.exports = AttributeBinder;