const { jsonx, xmlx } = require('./index');

console.log(JSON.stringify(jsonx.parse(`callback({
  a: 1,
  b: [
      { c: 1 }, null, 1, 2
      '123',
      "{}}}([[[]]]]]])",
  ],
});
`), null, '    '))

console.log(xmlx.parse(`
s-for="item, index in block.sugGoods"
<text disabled a=1 b=2 data-city='abc-{{ 123 }}-abc-1234-{{ util.cal("a",1) }}'>
<!-- comment -->
<aabb>s-for="item, index in block.sugGoods"</aabb>
fdasfasdadf{{couponInfo.parValue('abc', 1)}}<button disabled /><view>{{couponInfo.parValue('abc', 1)}}</view>
</text>
`, {
    NSGlobal: 'wx',
    NSSpliter: ':',
    format: true,
    indent: '    ',
    elementAlone: true
}).toString({ NSGlobal: 's', NSSpliter: '-' }));