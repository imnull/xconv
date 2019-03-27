const {
    NODE_TYPES
} = require('./parser-config');

const isValidNode = (node) => {
    if(node.type === NODE_TYPES.NODE
        // || node.type === NODE_TYPES.COMMENT
        ){
        return true;
    } else if(node.type === NODE_TYPES.TEXT){
        return /[^\s]+/.test(node.content);
    } else {
        return false;
    }
}

module.exports = isValidNode;