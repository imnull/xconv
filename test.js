const { parse } = require('./parser');

const r = parse(`

<!-- 基础提示弹框 -->
<include src="temai_components/toast/toast.swan" />

<!-- 网络异常 -->
<include src="temai_components/netError/netError.swan" />

<!-- 上拉加载 -->
<scroll-view class="scrollW" scroll-y bindscroll="scroll" bindscrolltolower="lowerToday" scroll-top="{= scrollTop =}" page="{{ bBrandInfo.page }}">

  <!--search-->
  <search></search>

  <!-- banner -->
  
  <banner s-if='temaiCmsData.tm_banner_pic.tag.length>0' imgHost='{{imgHost}}' data='{{temaiCmsData.tm_banner_pic.tag}}'></banner>

  <!--券-->
  <swipe-coupon s-if='temaiCmsData.tm_quan_quan.tag.length>0' imgHost='{{imgHost}}' data='{{temaiCmsData.tm_quan_quan}}' data1='{{temaiCmsData.tm_quan_title}}'></swipe-coupon>

  <!--中通-->
  <zhongtong s-if="temaiCmsData.tm_ztgg.tag.length>0" imgHost="{{imgHost}}" data="{{temaiCmsData.tm_ztgg}}"></zhongtong>

  <!--爆款推荐单品-->
  <bk-tuijian-single-pd s-if='temaiCmsData.tm_hot_goodsFlag && temaiCmsData.alltm_hot_goods.length>0' imgHost='{{imgHost}}' data="{{temaiCmsData.alltm_hot_goods}}"></bk-tuijian-single-pd>


  <!--今日上新-->
  <today-new-goods id='news' s-if='bBrandInfo.blists.length' imgHost='{{imgHost}}' data='{{bBrandInfo}}' data1='{{temaiCmsData.tm_today_title}}' data2="{{bBrandInfo.bLoadingShow}}" data3="{{bBrandInfo.bLoadingMsg}}"></today-new-goods>

</scroll-view>

<!-- 手机弹框 -->
<include src="temai_components/phoneModal/phoneModal.swan" />

<!-- 回到顶部 -->
<include src="temai_components/toTop/toTop.swan" />

<!-- 滑动验证码 -->
<include src="temai_components/slideVerify/slideVerify.swan" />

<!-- 短信验证码 -->
<include src="temai_components/msgVerify/msgVerify.swan" />

`, {
    validNodeOnly: false
});

console.log(r)