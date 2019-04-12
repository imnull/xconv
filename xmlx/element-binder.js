const { ElementBase } = require('oop-node');
const { binderTest, getBinders, binderToString } = require('./utils');

class ElementBinder extends ElementBase {
    constructor(option){
        option = { ...option, name: '#binder' };
        super(option);
        let { value = '' } = option;
        this.value = value;

        if(binderTest.test(value)){
            this.type = 101;
            this.binders = getBinders(value);
        }
    }

    toString(depthOffset = 0, option){
        if(this.type === 101){
            return `${this.getFormatPrefix(depthOffset, option)}${binderToString(this.value, this.binders)}`;
        } else {
            return super.toString(depthOffset, option);
        }
    }
}

module.exports = ElementBinder;