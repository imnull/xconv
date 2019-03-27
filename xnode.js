const {
    appendChild,
    removeChild,
    insertBefore,
    querySelector,
    querySelectorAll,
    appendTo,
    remove,
    getPath,
    getTop,
    getDepth,
} = require('./node-resolver');

const {
    NODE_TYPES
} = require('./parser-config');

const isValidNode = require('./valid-node');

const trim = s => s.replace(/^\s+|\s+$/g, '');

const node2str = (node, option = {}) => {

    let {
        depthOffset = 0,
        ns = 'wx:',
        attrNamesNS = ['if', 'for', 'key', 'for-index'],
        attrNameParser = n => n,
        validNodeOnly = true,
        includeChildren = true,
    } = option;

    if(validNodeOnly && !isValidNode(node)){
        return '';
    }

    let { name, attrs = [], childNodes = [], depth = 0, type } = node;
    depth = Math.max(0, depth + depthOffset);

    let prefix = '\n' + '\t'.repeat(depth + 1);
    if(attrs.length < 4){
        prefix = '';
    }

    let attrStr = attrs.map(attr => {
        let { name, value, quote = '' } = attr;
        if(typeof(attrNameParser) === 'function'){
            name = attrNameParser(name);
        }
        if(attrNamesNS.indexOf(name) > -1){
            name = `${ns}${name}`;
        }
        if(typeof(value) === 'undefined'){
            return prefix + name;
        } else {
            return `${prefix}${name}=${quote}${value}${quote}`;
        }
    });

    if(attrStr.length > 0){
        attrStr = ' ' + attrStr.join(' ')
    } else {
        attrStr = ''
    }

    prefix = '\n' + '\t'.repeat(depth);
    if(!includeChildren || childNodes.length < 1){
        switch(type){
            case NODE_TYPES.NODE:
                return '\n' + '\t'.repeat(depth) + `<${name}${attrStr} />`;
            case NODE_TYPES.TEXT:
                return '\n' + '\t'.repeat(depth) + node.content;
            case NODE_TYPES.COMMENT:
                return `<!-- ${node.content} -->`;
            default:
                return '';
        }
        
    } else {
        return (
            '\n' + '\t'.repeat(depth) + `<${name}${attrStr}>` +
            childNodes.map(n => node2str(n, option)).join('') +
            '\n' + '\t'.repeat(depth) + `</${name}>`
        )
    }
}

const toStr = (node, option = {}) => {
    let s;
    if(node.type === 9){
        s = node.childNodes.map(n => node2str(n, {
            ...option,
            depthOffset: -1
        })).join('');
    } else {
        s = node2str(node, {
            ...option,
            depthOffset: -node.depth
        });
    }
    s = trim(s);
    return s;
};

class XNode {
    constructor(raw){
        Object.assign(this, raw);
        Object.defineProperties(this, {
            'path': { get: () => getPath(this) },
            'top': { get: () => getTop(this) },
            'depth': { get: () => getDepth(this) }
        })
    }

    attr(...args){
        if(args.length < 1){
            return this.attrs.slice(0);
        } else if(args.length === 1){
            let attr = this.attrs.find(a => a.name === args[0]);
            return attr ? attr.value : null;
        } else if(args.length > 1){
            let attr = this.attrs.find(a => a.name === args[0]);
            if(!attr){
                attr = { name: args[0], ns: '', quote: '"' };
                this.attrs.push(attr);
            }
            attr.value = args[1];
            if(args.length > 2){
                attr.ns = args[2];
            }
            if(args.length > 3){
                attr.quote = args[3];
            }
            return this;
        }
    }

    appendChild(node){
        return appendChild(this, node);
    }

    removeChild(node){
        return removeChild(this, node);
    }

    insertBefore(node, beforeNode){
        return insertBefore(this, node, beforeNode)
    }

    querySelector(fn){
        return querySelector(this, fn);
    }

    querySelectorAll(fn){
        return querySelectorAll(this, fn);
    }

    appendTo(parentNode){
        return appendTo(this, parentNode)
    }

    remove(){
        return remove(this, this.parentNode);
    }

    toString(option = {}){
        return toStr(this, option);
    }
};

module.exports = XNode;