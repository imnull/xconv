const XReader = require('../reader/x-reader');
const XDocument = require('./x-document');

const parse_node = (n, doc) => {
    let node = null;
    let { sub = [] } = n;
    sub = sub.slice(0);
    let nameSub = sub.shift();
    if(nameSub.status === 'node$close'){
        nameSub = sub.shift();
        node = doc.createElement(nameSub.text);
        return { node, closure: true };
    }
    let alone = false;
    node = doc.createElement(nameSub.text);
    let _nn = null;
    let name = null;
    sub.forEach(nn => {
        switch(nn.status){
            case 'attr$name':
                if(name){
                    node.setAttribute(name);
                }
                name = nn.text;
                if(_nn){
                    node.attributes.addSpliter(_nn.text);
                    _nn = null;
                }
                break;
            case 'attr$equal':
                if(name){
                    // node.setAttribute(name);
                }
                break;
            case 'attr$value':
                if(name){
                    let attr = doc.createAttributeBinder(name, nn.text, nn.quote, node);
                    node.attributes.append(attr);
                    // node.setAttribute(name, nn.text);
                }
                name = null;
                break;
            case 'node$close':
                alone = true;
                break;
            case 'quote':
                if(name){
                    let attr = doc.createAttributeBinder(name, nn.text, nn.quote, node);
                    node.attributes.append(attr);
                } else {
                    node.setAttribute(nn.text);
                }
                name = null;
                break;
            case 'plain':
                _nn = nn;
                break;
            default:
                console.log(nn)
                break;
        }
    });
    if(name){
        node.setAttribute(name);
        name = null;
    }
    if(_nn){
        node.attributes.addSpliter(_nn.text);
    }
    node.alone = alone;
    return { node, alone };
}

const parse = (s, option = {}) => {
    option = { ...option };
    let doc = new XDocument(option);
    let reader = new XReader(s);
    let nodes = reader.read();
    let N = doc;
    nodes.forEach(n => {
        switch(n.status){
            case 'node':
                let { alone = false, closure = false, node } = parse_node(n, doc);
                if(alone){
                    N.appendChild(node);
                } else {
                    if(closure){
                        N = N.parent || doc;
                    } else {
                        N.appendChild(node);
                        N = node;
                    }
                }
                break;
            case 'comment':
                let comment = n.text.replace(/^<!\-{2,}\s*([\w\W]*)\s*\-{2,}>$/, '$1');
                comment = comment.replace(/^\s+|\s+$/g, '');
                N.appendChild(doc.createComment(comment));
                break;
            case 'binder':
                N.appendChild(doc.createBinder(n.text));
                break;
            default:
                N.appendChild(doc.createText(n.text));
                break;
        }
    });

    return doc;
}

module.exports = {
    parse,
    parseFile: (path, option = {}, fsOption = { encoding: 'utf-8' }) => {
        const fs = require('fs');
        let s = fs.readFileSync(path, fsOption);
        return parse(s, option);
    }
};