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
<text disabled a=1 b=2 data-city='{{util.cal("a", 1)}}'>
<!-- comment -->
<aabb>s-for="item, index in block.sugGoods"</aabb>
fdasfasdadf{{couponInfo.parValue('abc', 1)}}<button disabled />
</text>
`, { format: true, indent: '    ' }).toString());