const {
    NODE_TYPES,
    ATTR_NAME_NS,
} = require('./parser-config');

const isValidNode = require('./valid-node');

const trim = s => s.replace(/^\s+|\s+$/g, '');

const node2str = (node, option = {}) => {

    let {
        depthOffset = 0,
        ns = 'wx:',
        attrNamesNS = ATTR_NAME_NS,
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
        if(ns && attrNamesNS.indexOf(name) > -1){
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

module.exports = (node, option = {}) => {
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