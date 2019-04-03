const jsonx = require('./jsonx');

console.log(jsonx.parse(`callback([1, {
  '  
    123456    ':1234,
  1234567:'JSONP here',
  "12345678":"1123456",
},null]);
`))

const XReader = require('./reader/x-reader');
let reader = new XReader(`
<text a=1 b=2>{{couponInfo.parValue}}</text>
`);
console.log(reader.read())