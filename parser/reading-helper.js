const trim = s => s.replace(/^\s+|\s+$/g, '');

const readTo = (s, bingo, startIndex = 0) => {
    for(let i = startIndex, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(bingo(ch)){
            return i;
        }
    }
    return -1;
};

/* 平面文本解析 START */

const isNestStart = (ch, dic) => ch in dic;
const isQuoteStart = (ch, dic) => ch in dic;
const isNodeStart = (ch, nodeLeft) => ch === nodeLeft;

const readToNestEnd = (s, left, leftIndex, dic, escape_char) => {
    let right = dic[left];
    for(let i = leftIndex + 1, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(ch === escape_char){
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

const readToQuoteEnd = (s, quote, nest_dic, startIndex, escape_char) => {
    for(let i = startIndex + 1, len = s.length; i < len; i++){
        let ch = s.charAt(i);
        if(ch === escape_char){
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

const readToNodeEnd = (s, quote_dic, nest_dic, startIndex, node_right_ch) => {
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
        } else if(ch === node_right_ch){
            return i;
        }
    }
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

const isBlankChar = (ch) => /^\s+$/.test(ch);
const readToBlankStart = (s, startIndex = 0) => readTo(s, isBlankChar, startIndex);
const readToBlankEnd = (s, startIndex = 0) => readTo(s, (ch) => !isBlankChar(ch), startIndex);

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