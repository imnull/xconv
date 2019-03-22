const readTo = (s, bingo, startIndex = 0) => {
    for(let i = startIndex, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(bingo(ch)){
            return i;
        }
    }
    return -1;
};

const NEST_DIC = {
    '{': '}',
    '[': ']',
    '(': ')'
};

const QUOTE_DIC = {
    '"': '"',
    "'": "'",
    '`': '`'
};

const SCRIPT_NAMES = [
    'wxs', 'filter'
];

const NODE_LEFT = '<';
const NODE_RIGHT = '>';
const ESCAPE_CHAR = '\\';

/* 平面文本解析 START */

const isNestStart = (ch, dic) => ch in dic;
const isQuoteStart = (ch, dic) => ch in dic;
const isNodeStart = (ch, nodeLeft = NODE_LEFT) => ch === nodeLeft;

const readToNestEnd = (s, left, leftIndex, dic) => {
    let right = dic[left];
    for(let i = leftIndex + 1, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(ch === ESCAPE_CHAR){
            i += 1;
            continue;
        }
        if(ch in dic){
            i = readToNestEnd(s, ch, i, dic);
            if(i < 0){
                return -1;
            }
        } else if(ch === right){
            return i;
        }
    }
    return -1;
};

const readToQuoteEnd = (s, quote, nest_dic, startIndex = 0) => {
    for(let i = startIndex + 1, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(ch === ESCAPE_CHAR){
            i += 1;
            continue;
        }
        if(isNestStart(ch, nest_dic)){
            let _i = readToNestEnd(s, ch, i, nest_dic);
            if(_i < 0){
                return -1;
            }
            i = _i;
        } else if(ch === quote){
            return i;
        }
    }
    return -1;
}

const readToNodeEnd = (s, quote_dic, nest_dic, startIndex = 0) => {
    for(let i = startIndex + 1, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(isQuoteStart(ch, quote_dic)){
            i = readToQuoteEnd(s, ch, nest_dic, i);
            if(i < 0){
                return -1;
            }
            continue;
        } else if(isNestStart(ch, nest_dic)){
            i = readToNestEnd(s, ch, i, nest_dic);
            if(i < 0){
                return -1;
            }
            continue;
        } else if(ch === NODE_RIGHT){
            return i;
        }
    }
}

// console.log(readToQuoteEnd('a"ab\\"c"aaa', '"', 1))
// console.log(readTo(SAMPLE, c => c === '<'))

const getQuickNode = (s) => {
    s = trim(s + '');
    let name = /^<(\/?)([^\s\/<>\!]+)/.test(s) ? RegExp.$2 : '';
    let status;
    if(RegExp.$1){
        status = 1;
    } else if(/\/>$/.test(s)){
        status = 2;
    } else {
        status = 0;
    }
    return { name, status };
    // return /^<(\/?)([^\s<>\!]+)/.test(s + '') ? { name: RegExp.$2, isEnd: !!RegExp.$1, match: true } : { match: false };
}

const blockPairs = [
    { left: '<!--', right: '-->', closure: true }
];

const readNodeSegments = (s, quote_dic, nest_dic, script_names, startIndex = 0, segs = []) => {
    let nodeStartIndex;
    nodeStartIndex = readTo(s, isNodeStart, startIndex);
    if(nodeStartIndex > -1){
        if(nodeStartIndex > startIndex){
            segs.push(s.substring(startIndex, nodeStartIndex));
        }

        let endIndex;

        let block = blockPairs.find(pair => s.indexOf(pair.left, nodeStartIndex) === nodeStartIndex);
        if(block){
            endIndex = readToBlock(s, block.right, nodeStartIndex);
            if(endIndex < 0){
                segs.push(s.substr(nodeStartIndex))
            } else {
                if(block.closure){
                    endIndex += block.right.length;
                }
                segs.push(s.substring(nodeStartIndex, endIndex));
                readNodeSegments(s, quote_dic, nest_dic, script_names, endIndex, segs);
            }
        } else {
            endIndex = readToNodeEnd(s, quote_dic, nest_dic, nodeStartIndex) + 1;
            if(endIndex > nodeStartIndex){
                let nodeStr = s.substring(nodeStartIndex, endIndex);
                segs.push(nodeStr);
                if(endIndex < s.length - 1){
                    let quickNode = getQuickNode(nodeStr);

                    // 处理内嵌脚本。脚本标签名称在script_names中配置。
                    if(quickNode.status === 0 && !!~script_names.indexOf(quickNode.name.toLowerCase())){
                        nodeStartIndex = endIndex;
                        // endIndex = readToScriptNodeEnd(s, quickNode.name, endIndex);
                        endIndex = readToBlock(s, `</${quickNode.name}`, endIndex);
                        if(endIndex > -1){
                            if(endIndex > nodeStartIndex){
                                let script = s.substring(nodeStartIndex, endIndex);
                                segs.push(script);
                            }
                            readNodeSegments(s, quote_dic, nest_dic, script_names, endIndex, segs);
                        } else {
                            segs.push(s.substr(nodeStartIndex))
                        }
                    } else {
                        readNodeSegments(s, quote_dic, nest_dic, script_names, endIndex, segs);
                    }
                }
            } else {
                segs.push(s.substr(nodeStartIndex))
            }
        }

        
    } else {
        segs.push(s.substr(startIndex))
    }
    return segs;
};

const readToBlock = (s, strBlock, startIndex = 0) => {
    return s.indexOf(strBlock, startIndex);
    // let reg = new RegExp(regString);
    // let m = s.substr(startIndex).match(reg);
    // if(m){
    //     return startIndex + m.index;
    // } else {
    //     return -1;
    // }
};



/* 平面文本解析 END */

/* Node树结构构造 START */

const NODE_TYPES = {
    NODE: 1,
    TEXT: 3,
    COMMENT: 5
};

const NODE_STATUS = {
    START: 0,
    END: 1,
    SINGLE: 2
};

const isBlankChar = (ch) => /^\s+$/.test(ch);
const readToBlankStart = (s, startIndex = 0) => readTo(s, isBlankChar, startIndex);
const readToBlankEnd = (s, startIndex = 0) => readTo(s, (ch) => !isBlankChar(ch), startIndex);
const trim = s => s.replace(/^\s+|\s+$/g, '');
const trimLeft = s => s.replace(/^\s+/, '');

const getNodeType = (s) => {
    if(s.charAt(0) === NODE_LEFT){
        if(/^<\!\-+/.test(s)){
            return NODE_TYPES.COMMENT; 
        } else {
            return NODE_TYPES.NODE;
        }
    } else {
        return NODE_TYPES.TEXT;
    }
}

const getNodeStatus = (s, type) => {
    switch(type){
        case NODE_TYPES.NODE:
            if(/^<\//.test(s)){
                return NODE_STATUS.END;
            } else if(/\/>$/.test(s)){
                return NODE_STATUS.SINGLE;
            } else {
                return NODE_STATUS.START;
            }
            break;
        default:
            return NODE_STATUS.SINGLE;
    }
}

const parseNode = (s) => {
    let type = getNodeType(s);
    let status = getNodeStatus(s, type);
    let content;
    let scripts = null;
    switch(type){
        case NODE_TYPES.NODE:
            content = s.replace(/^<\/?|\s*\/?>$/g, '');
            break;
        case NODE_TYPES.COMMENT:
            content = s.replace(/^<\!\-+\s*|\s*\-+>$/g, '');
            break;
        default:
            content = s;
            content = content.replace(/(\r?\n|\n\r?)$/, '');
            content = trim(content);
            scripts = getMiniScript(content);
            break;
    }
    return { type, status, content, scripts, raw: s };
}

const readToAttrNameEnd = (s, startIndex = 0) => {
    let equalIndex = readTo(s, ch => ch === '=', startIndex);
    let blankIndex = readToBlankStart(s, startIndex);
    if(equalIndex > -1 && blankIndex > -1){
        if(blankIndex < equalIndex){
            let betweenStr = s.substring(blankIndex, equalIndex);
            if(/^\s+$/.test(betweenStr)){
                return equalIndex;
            } else {
                return blankIndex;
            }
        } else {
            return equalIndex;
        }
    } else if(equalIndex > -1 && blankIndex < 0) {
        return equalIndex;
    } else if(equalIndex < 0 && blankIndex > -1) {
        return blankIndex;
    } else {
        return -1;
    }
};

const getMiniScript = (s) => {
    s = trim(s);
    let scripts = s.match(/(["'])\{\{[\s\S]+?\}\}\1|{\{[\s\S]+?\}\}/g);
    // console.log(scripts)
    return scripts;
}

const isValidNode = (node) => {
    if(node.type === NODE_TYPES.NODE){
        return true;
    } else if(node.type === NODE_TYPES.TEXT){
        return /[^\s]+/.test(node.content);
    } else {
        return false;
    }
}

const rebuildAttrs = (attrs, quote_dic, attr_ns) => attrs.forEach(attr => {
    let { name, value } = attr;
    let ns = attr_ns, n = name;
    if(ns && n.indexOf(ns) === 0){
        n = n.substr(ns.length);
    }
    if(ns && n){
        attr.name = n;
        attr.ns = ns;
    }

    if(value){
        value = trim(value);
        if(isQuoteStart(value.charAt(0), quote_dic)){
            attr.quote = value.charAt(0);
            value = value.substring(1, value.length - 1);
        }
        attr.value = value;
        attr.scripts = getMiniScript(value);
    }
})

const buildNode = (node, quote_dic, nest_dic, attr_ns) => {
    if((
        node.status === NODE_STATUS.START
        || node.status === NODE_STATUS.SINGLE
    ) && node.type === NODE_TYPES.NODE){
        let { content } = node;
        let startIndex = 0;
        let idx = readToBlankStart(content);

        if(idx < 0){
            node.name = trim(content);
            node.attrs = [];
            return;
        }
        let nodeName = content.substring(startIndex, idx);
        let attrs = [];

        idx = readToBlankEnd(content, idx);
        startIndex = idx;

        let c = 20;
        // 循环读取attrs
        while(idx > -1){
            let attrKey;
            idx = readToAttrNameEnd(content, idx);
            if(idx < 0){
                attrKey = content.substr(startIndex);
                if(attrKey.length > 0){
                    attrs.push({ name: attrKey })
                }
                break;
            } else if(content.charAt(idx) === '='){
                attrKey = content.substring(startIndex, idx);
                idx += 1;

                let valStartSign = content.charAt(idx);
                if(isBlankChar(valStartSign)){
                    idx = readToBlankEnd(content, idx);
                    valStartSign = content.charAt(idx);
                }

                startIndex = idx;
                if(isQuoteStart(valStartSign, quote_dic)){
                    idx = readToQuoteEnd(content, valStartSign, nest_dic, idx);
                } else if(isNestStart(valStartSign, nest_dic)){
                    idx = readToNestEnd(content, valStartSign, idx, nest_dic);
                } else {
                    idx = readToBlankStart(content, idx);
                }

                let attrVal;
                if(idx < 0){
                    attrVal = content.substr(startIndex);
                } else {
                    idx += 1;
                    attrVal = content.substring(startIndex, idx);
                    idx = readToBlankStart(content, idx);
                    startIndex = idx;
                }

                attrKey = trim(attrKey);
                attrVal = trim(attrVal);

                attrs.push({ name: attrKey, value: attrVal })
            } else {
                attrKey = content.substring(startIndex, idx);
                if(attrKey.length > 0){
                    attrs.push({ name: attrKey });
                }
                idx = readToBlankStart(content, idx);
                if(idx > -1){
                    idx = readToBlankEnd(content, idx);
                }
                startIndex = idx;
            }
            
            if(c-- < 0){
                break;
            }
        }

        rebuildAttrs(attrs, quote_dic, attr_ns);
        node.name = nodeName;
        node.attrs = attrs;
    } else {
        switch(node.type){
            case 3:
                node.name = `#text`;
                break;
            case 5:
                node.name = '#comment';
                break;
        }
    }
};

const buildNodeTree = (nodes, quote_dic, nest_dic, attr_ns) => {
    let root = { type: 9, name: '#document', childNodes: [], attrs: [], parentNode: null, depth: 0, path: '' };
    let runtimeNode = root;
    nodes.forEach(node => {
        buildNode(node, quote_dic, nest_dic, attr_ns);
        switch(node.status){
            case NODE_STATUS.SINGLE:
                node.parentNode = runtimeNode;
                node.childNodes = [];
                node.depth = node.parentNode.depth + 1;
                node.path = `${node.parentNode.path}/${node.name}`;
                runtimeNode.childNodes.push(node);
                break;
            case NODE_STATUS.START:
                node.parentNode = runtimeNode;
                node.childNodes = [];
                node.depth = node.parentNode.depth + 1;
                node.path = `${node.parentNode.path}/${node.name}`;
                runtimeNode.childNodes.push(node);
                runtimeNode = node;
                break;
            case NODE_STATUS.END:
                runtimeNode = runtimeNode.parentNode || root;
                break;
        }

        // delete node.status;
    });
    return root;
}


// SAMPLE = `
// <wxs module="util" src="../../utils/util.wxs">
//     {{1 > 0}}
// </wxs>
// <view class="ad" wx:if="{{adTitle && (adOne[0] || adTwo.length > 1)}}" data-aaa='{aaa:"{{data[0]}}",bbb:"{{data[1]}}"}' />
// `;

const parse = (s, option = {}) => {
    if(!option || typeof(option) != 'object'){
        option = {};
    }
    let { quote = QUOTE_DIC, nest = NEST_DIC, scripts = SCRIPT_NAMES, validNodeOnly = true, ns = 'wx:' } = option;
    let queue = readNodeSegments(s, quote, nest, scripts).map(s => parseNode(s));
    if(validNodeOnly){
        queue = queue.filter(n => isValidNode(n));
    }
    let root = buildNodeTree(queue, quote, nest, ns);
    return { root, queue };
};


const node2str = (node, option = {}) => {

    let {
        depthOffset = 0,
        ns = 'wx:',
        attrNamesNS = ['if', 'for', 'key', 'for-index'],
        attrNameParser = n => n
    } = option;

    let { name, attrs = [], childNodes = [], depth = 0, type } = node;
    depth = Math.max(0, depth + depthOffset);

    let prefix = '\n' + '\t'.repeat(depth + 1);

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
    }).join(' ');

    prefix = '\n' + '\t'.repeat(depth);
    if(childNodes.length < 1){
        switch(type){
            case NODE_TYPES.NODE:
                return '\n' + '\t'.repeat(depth) + `<${name} ${attrStr}/>`;
            case NODE_TYPES.TEXT:
                return '\n' + '\t'.repeat(depth) + node.content;
            case NODE_TYPES.COMMENT:
                return `<!-- ${node.content} -->`;
            default:
                return '';
        }
        
    } else {
        return (
            '\n' + '\t'.repeat(depth) + `<${name} ${attrStr}>` +
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
        s = node2str(n, {
            ...option,
            depthOffset: -n.depth
        });
    }
    s = trim(s);
    return s;
};

const fillChildNodes = (n, tester, nodes = []) => {
    if(!n || !Array.isArray(n.childNodes) || n.childNodes.length < 1){
        return;
    }
    if(typeof(tester) !== 'function'){
        tester = () => true;
    }
    n.childNodes.forEach(nn => {
        nodes.push(nn);
        fillChildNodes(nn, tester, nodes);
    })
};

module.exports = {
    parse,
    toStr,
    utils: {
        isNestStart: (ch, dic = NEST_DIC) => isNestStart(ch, dic),
        isQuoteStart: (ch, dic = QUOTE_DIC) => isQuoteStart(ch, dic),
        readNest: (s, left, leftIndex, dic = NEST_DIC) => {
            let start = leftIndex;
            let end = readToNestEnd(s, left, start, dic) + 1;
            if(end < start){
                return null
            }
            return {
                start, end, text: s.substring(start, end)
            }
        },
        split: (s, ch, quote_dic = QUOTE_DIC, nest_dic = NEST_DIC) => {
            let startIndex = 0, r = [];
            for(let i = 0, len = s.length; i < len; i++){
                let c = s.charAt(i);
                if(isQuoteStart(c, quote_dic)){
                    i = readToQuoteEnd(s, c, nest_dic, i);
                    if(i < 0){
                        r.push(trim(s.substr(startIndex)));
                        break;
                    }
                } else if(isNestStart(c, nest_dic)){
                    i = readToNestEnd(s, c, i, nest_dic);
                    if(i < 0){
                        r.push(trim(s.substr(startIndex)));
                        break;
                    }
                } else if(c === ch){
                    r.push(trim(s.substring(startIndex, i)));
                    startIndex = i + 1;
                }
            }
            r.push(trim(s.substr(startIndex)));
            r = r.filter(s => s.length > 0);
            return r;
        },
        getChildNodes: (n, tester) => {
            let r = [];
            fillChildNodes(n, tester, r);
            return r;
        },
    },
    getMiniScript,
    NODE_TYPES,
};