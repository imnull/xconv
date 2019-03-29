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

const toStr = require('./node-tostr');

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