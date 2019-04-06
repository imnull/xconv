const { Document, ElementBase, Attribute } = require('oop-node');

class ElementBinder extends ElementBase {
    constructor(option){
        option = { ...option, type: 101, name: '#binder' };
        super(option);
        let { value = '' } = option;
        let script = value.replace(/^\{\{\s*([\w\W]*)\s*\}\}$/, '$1');
        this.script = script;
    }

    toString(){
        let { script } = this;
        let { format } = this.document;
        let prefix = '';
        if(format){
            prefix = this.getFormatPrefix();
        }
        return `${prefix}{{ ${script} }}`;
    }
}

module.exports = ElementBinder;