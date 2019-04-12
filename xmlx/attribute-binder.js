const { Attribute, elementUtiles: { resolveNS, invalidValue } } = require('oop-node');
const { binderTest, getBinders, binderToString } = require('./utils');

class AttributeBinder extends Attribute {

    constructor(option){
        option = { ...option };
        super(option);
        let { quote = '"', value = '' } = option;
        this.quote = quote;
        if(binderTest.test(value)){
            this.type = 102;
            this.binders = getBinders(value);
            console.log(this.binders)
        }
    }

    toString(option){
        let { name, value = '', quote = '"' } = this;
        if(!invalidValue(name)){
            if(this.type === 102){
                name = resolveNS(this, option);
                return `${name}=${quote}${binderToString(this.value, this.binders)}${quote}`;
            } else {
                return super.toString(option);
            }
        }
        return ''
    }
}

module.exports = AttributeBinder;