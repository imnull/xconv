const { Attribute, elementUtiles: { resolveNS, invalidValue } } = require('oop-node');
const { binderTest } = require('./utils');

class AttributeBinder extends Attribute {

    constructor(option){
        option = { ...option };
        super(option);
        let { quote = '"', value = '' } = option;
        this.quote = quote;
        if(binderTest.test(value)){
            this.type = 102;
        }
        this.binders = this.value.match(binderTest) || [];
    }

    toString(option){
        let { name, value = '', quote = '"' } = this;
        if(!invalidValue(name)){
            if(this.type === 102){
                name = resolveNS(this, option);
                return `${name}=${quote}${value}${quote}`;
            } else {
                return super.toString(option);
            }
        }
        return ''
    }
}

module.exports = AttributeBinder;