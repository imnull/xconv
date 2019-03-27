const { parse } = require('./parser');
const { getPath, querySelector, querySelectorAll } = require('./node-resolver');

const r = parse(`

<a><c /></a>
`, {
    validNodeOnly: false
});

// r.root.querySelector(n => n.name === 'a').appendChild(r.root.querySelector(n => n.name === 'c')).appendChild(r.root.querySelector(n => n.name === 'b'));
// r.root.querySelector(n => n.name === 'a')
//   .attr('aaa', 'bbb')
//   // .attr('c', 'd')
//   // .attr('bindtap', 'handleTap', 'wx', '\'')

// console.log(r.root.toString({ validNodeOnly: true, includeChildren: true }));

// console.log(querySelectorAll(r.root, (node) => node.name === 'include' || node.name === 'scroll-view').map(n => ({ path: n.path, name: n.name })))

r.root.querySelector(n => n.name === 'a')
  .attr('aa', 1)
  .attr('bb', 2)
  .attr('if', '1 > 2')
  ;

  console.log(r.root.toString({ validNodeOnly: true, includeChildren: true, ns: 'wx:' }));