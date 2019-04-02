const jsonx = require('./json');

console.log(jsonx(`callback([1, {
  '  
    123456    ':1234,
  1234567:'JSONP here',
  "12345678":"1123456",
},null]);
`))

const XReader = require('./reader/x-reader');

let reader = new XReader(`<view class="couponUseRule">
    {{couponInfo.actDesc}}
<!-- </view> -->
<view class="orderLimit">
    {{couponInfo.shopName}}
</view>
<view class="timeLimit">
    领券时间:{{couponInfo.startTime}}至{{couponInfo.endTime}}
</view>
</view>`);
console.log(reader.read())