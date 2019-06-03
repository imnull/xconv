const { jsonx, xmlx, Reader, StyleReader } = require('./index');

// console.log(JSON.stringify(jsonx.parse(`callback({
//   a: 1,
//   b: [
//       { c: 1 }, null, 1, 2
//       '123',
//       "{}}}([[[]]]]]])",
//   ],
// });
// `), null, '    '))

console.log(xmlx.parse(`
<image a="1{{{a:1}}}aaa{{{a:2}}}123" src="asdfas{{imgHost}}/uimg/ZR/share_order/{{item.url}}_400x400.jpg"></image>
s-for="item, index in block.sugGoods"
<text disabled a=1 b=2 data-city='abc-{{ 123 }}-abc-1234-{{ util.cal("a",1) }}'>
<!-- comment -->
<aabb>
  ¥
  {{couponInfo.parValue('abc', 1)}}
</aabb>
<button disabled /><view>{{couponInfo.parValue('abc', 1)}}</view>
</text>
`, {
    NSGlobal: 'wx',
    NSSpliter: ':',
    format: true,
    indent: '    ',
    formatIgnore: [3,101],
    aloneElements: ['button', 'input']
}).toString({ NSGlobal: 's', NSSpliter: '-' }));

// let r = new StyleReader(`
// body {
//   background-color : #f2f2f2;
//   background-image: url("http://aaa.bbb.cc");
// }
// // index.css
// // @orange: #f60;
// @orange: #ff5500;

// @import url("../a/b.css");
// // @import url("../../c.wxss");

// .flex{
//   display: flex;
// }

// `);

// let rrr = r.read()
// console.log(rrr)