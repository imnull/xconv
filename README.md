# xconv
标记语言转换器

NPM: https://www.npmjs.com/package/xconv

## 使用
    npm i xconv

```js
const { jsonx, xmlx } = require('xconv');

console.log(JSON.stringify(jsonx.parse(`callback({
  a: 1,
  b: [
      { c: 1 }, null, 1, 2
      '123',
      "{}}}([[[]]]]]])",
  ],
});
`), null, '    '))

console.log(
    xmlx.parse(`
<text disabled a=1 b=2 data-city='{{util.cal("a", 1)}}'>
<!-- comment -->
fdasfasdadf{{couponInfo.parValue('abc', 1)}}<button disabled />
</text>
`, { format: true, indent: '    ' }
).root.toString());
```

输出：
```js
{
    "a": 1,
    "b": [
        {
            "c": 1
        },
        null,
        1,
        2,
        "123",
        "{}}}([[[]]]]]])"
    ]
}
```
```html
<root>
    <text disabled a="1" b="2" data-city='{{util.cal("a", 1)}}'>
        <!-- comment -->
        fdasfasdadf
        {{ couponInfo.parValue('abc', 1) }}
        <button disabled/>
    </text>
</root>
```

## Generic-JSON
泛JSON类型，包含 `JSON`、`JSONP`、`JS-Object` 等多种标准嵌套封闭的文本格式。

### 对`QUOTE`不敏感
对 双引号(**"**)、单引号(**'**)、撇号(**`**) 等可识别。

### 对`JSONP`可识别

```
callback({
    a: 1,
    b: [
        { c: 1 }, null, 1, 2
        '123',
        "{}}}([[[]]]]]])",
    ],
});
```
转换结果

```js
{
    "a": 1,
    "b": [
        {
            "c": 1
        },
        null,
        1,
        2,
        "123",
        "{}}}([[[]]]]]])"
    ]
}
```

## Generic-XML
对`XML`的标签识别，主要依赖对`<`和`>`的成对标记解析。

### 松散的属性分析
标签内属性基本遵循`HTML`的松散原则，对引号("')和独立标记属性（`disabled`、`checked` 等等）可识别。

### 基于`oop-node`的DOM树构建
https://www.npmjs.com/package/oop-node

### 格式化输出
对缩进和换行的格式化

```js
const { jsonx, xmlx } = require('./index');
console.log(xmlx.parse(`
<text disabled a=1 b=2 data-city='{{util.cal("a", 1)}}'>
<!-- comment -->
fdasfasdadf{{couponInfo.parValue('abc', 1)}}<button disabled />
</text>
`, { format: true, indent: '    ' }).root.toString());
```

输出结果

```html
<root>
    <text disabled a="1" b="2" data-city='{{util.cal("a", 1)}}'>
        <!-- comment -->
        fdasfasdadf
        {{ couponInfo.parValue('abc', 1) }}
        <button disabled/>
    </text>
</root>
```

*注意：当节点属性被识别为数据绑定时，会保留原始的属性包围引号。`...data-city='{{util.cal("a", 1)}}'...`*

## Readers

`Readers`是解析器的依赖。对应不同的文档。`JReader`和`XReader`继承自`Reader`。

```js
const {
    Reader,
    JReader,
    XReader
} = require('xconv');
```
### Reader
读取一般的引号封闭与语法嵌套

### JReader
对应`jsonx`，读取`Generic-JSON`文本。

### XReader
对应`xmlx`，读取`Generic-XML`文本。
