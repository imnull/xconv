const NameValueList = require('./name-value-list');
const ElementList = require('./element-list');

class Element {

    constructor(name, parent = null, nodeType = 0, originText = ''){
        this.name = name;
        this.parent = parent;
        this.nodeType = nodeType;
        this.originText = originText;
        this.attributes = new NameValueList();
        this.children = new ElementList();
    }

    get depth(){
        if(!this.parent){
            return 0;
        } else {
            return this.parent.depth + 1;
        }
    }

    create(name, nodeType = 0, originText = ''){
        let el = new Element(name, this, nodeType, originText);
        this.children.append(el);
        return el;
    }

    createText(text){
        return this.create('#text', 3, text)
    }

    append(el){
        if(this.nodeType !== 0){
            throw 'This element can not append'
        }
        el.parent = this;
        this.children.append(el);
        return this;
    }

    removeAt(index){
        let el = this.children.removeAt(index);
        if(el){
            el.parent = null;
        }
        return this;
    }

    remove(el){
        let el = this.children.remove(el);
        if(el){
            el.parent = null;
        }
        return this;
    }

    resetChildren(){
        this.children.clear();
        return this;
    }
    resetAttributes(){
        this.attributes.clear();
        return this;
    }

    reset(){
        this.children.clear();
        this.attributes.clear();
        return this;
    }

    attr(name, value){
        let attr = this.attributes.findByName(name);
        if(!attr){
            this.attributes.create(name, value);
        } else {
            attr.value(value);
        }
        return this;
    }

    toString(){
        let { name, attributes, children, depth, nodeType, originText } = this;
        let prefix = '  '.repeat(depth);
        if(nodeType === 0){
            let body = name;
            if(attributes.length > 0){
                body += ` ${attributes}`;
            }
            if(children.length < 1){
                body = `${prefix}<${body} />`
            } else {
                body = `${prefix}<${body}>\n${children}\n${prefix}</${name}>`
            }
            return body;
        } else if(nodeType === 3) {
            return `${prefix}${originText}`;
        } else if(nodeType === 8) {
            return `${prefix}${originText}`;
        } else {
            return originText;
        }

        
    }
}
module.exports = Element;