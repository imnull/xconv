const getPath = (node) => {
    let path = [node.name];
    while(node.parentNode && node.parentNode.type != 9){
        node = node.parentNode;
        path.unshift(node.name);
    }
    return '/' + path.join('/');
};

const getTop = (node) => {
    while(node.parentNode && node.parentNode.type != 9){
        node = node.parentNode;
    }
    return node;
};

const getDepth = (node) => {
    let depth = 1;
    while(node.parentNode && node.parentNode.type != 9){
        node = node.parentNode;
        depth += 1;
    }
    return depth;
}

const appendChild = (parentNode, childNode) => {
    if(childNode.parentNode){
        removeChild(childNode.parentNode, childNode);
    }
    parentNode.childNodes.push(childNode);
    childNode.parentNode = parentNode;
    return childNode;
};

const removeChild = (parentNode, childNode) => {
    let idx = parentNode.childNodes.indexOf(childNode);
    if(idx > -1){
        delete childNode.parentNode;
        parentNode.childNodes.splice(idx, 1);
        return true;
    } else {
        return false;
    }
};

const insertBefore = (parentNode, childNode, beforeNode) => {
    let idx = parentNode.childNodes.indexOf(beforeNode);
    if(idx < 0) {
        return false;
    } else {
        parentNode.childNodes.splice(idx, 0, childNode);
        return true;
    }
}

const appendTo = (childNode, parentNode) => {
    return appendChild(parentNode, childNode);
};

const remove = (childNode, parentNode) => {
    return removeChild(parentNode, childNode);
};

const query = (nodes, fn) => {
    for(let i = 0, len = nodes.length; i < len; i++){
        let node = nodes[i];
        if(fn(node)){
            return node;
        }
        node = query(node.childNodes, fn);
        if(node){
            return node;
        }
    }
    return null;
};

const queryAll = (nodes, fn) => {
    let all = [];
    for(let i = 0, len = nodes.length; i < len; i++){
        let node = nodes[i];
        if(fn(node)){
            all.push(node);
        }
        let ns = queryAll(node.childNodes, fn);
        all = all.concat(ns);
    }
    return all;
}

const querySelector = (node, fn) => {
    return query(node.childNodes, fn);
};

const querySelectorAll = (node, fn) => {
    return queryAll(node.childNodes, fn);
}

module.exports = {
    getPath,
    getTop,
    getDepth,
    appendChild,
    removeChild,
    insertBefore,
    appendTo,
    remove,
    querySelector,
    querySelectorAll,
};