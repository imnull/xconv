const { Document, ElementBase, Attribute } = require('oop-node');

class ElementBinder extends ElementBase {
    constructor(option){
        option = { ...option, name: '#binder' };
        super(option);
        let { value = '' } = option;
        if(/\{\{([\w\W]*)\}\}/.test(value)){
            this.type = 101;
            this.value = RegExp.$1.replace(/^\s+|\s+$/g, '');
        } else {
            this.value = value;
        }
        // let script = value.replace(/^\{\{\s*([\w\W]*)\s*\}\}$/, '$1');
    }

    toString(depthOffset = 0, option){
        let { value } = this;
        let { format } = this.document;
        let prefix = '';
        if(format){
            prefix = this.getFormatPrefix(depthOffset, option);
        }
        if(this.type === 101){
            return `${prefix}{{ ${value} }}`;
        } else {
            return super.toString();
        }
    }
}

module.exports = ElementBinder;