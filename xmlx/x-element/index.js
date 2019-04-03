const Element = require('./element');


let el = new Element('view');
for(let i = 0; i < 5; i++){
    let ee = el.create('text-' + i).attr('no', i).attr('time', Date.now());
    for(let j = 0; j < 3; j++){
        ee.create('image').attr('no', `${i}-${j}`)
    }
}

console.log(el.toString());
console.log(el.attr(11,2).attr(33,4).attr(55).toString());
console.log(el.removeAt(1).removeAt(1).removeAt(1).toString());
console.log(el.resetAttributes().toString());
console.log(el.resetChildren().toString());
el.createText('This is a TextNode')
console.log(el.toString());

