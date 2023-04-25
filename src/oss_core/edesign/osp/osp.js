/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-03-09 11:36:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\home.js
 */
import moment from 'moment';
import ElementUI from 'element-ui';
import Vue from 'vue';
import * as map from 'map';
import OspDesign from './Osp.vue';
import components from '@/components';
import siderBarComponents from './sidebar/siderBarComponents.js';
import i18n from '@/oss_core/base/locale/locale.js';

// import RippleAnimation from '@/components/rippleAnimation/rippleAnimation.js'
// import echart from 'echarts';
// import themeList from '@/oss_core/base/config/edesign/themeConfig.js'; // 热地图配置,
// import getMenuList from '@/oss_core/base/config/edesign/menuConfig.js'; // 菜单列表,
// import JsonExcel from 'vue-json-excel';
// import '@/oss_core/base/css/src/index.scss'; // 引入饿了么UI的字体库 样式文件多了120KB
import 'photoviewer/dist/photoviewer.css';

// Vue.component('downloadExcel', JsonExcel);
Vue.use(components);
Vue.use(siderBarComponents);
ElementUI.install(Vue, { size: 'mini' });
Vue.prototype.$map = map;
Vue.prototype.$moment = moment;
// Vue.prototype.$echarts = echart;
window.ht.Default.baseZIndex = 1000; // 层级
// Vue.prototype.$rip = RippleAnimation.install
// new ht.DataModel();
export function main(options) {
  // console.log(options);
  return new Vue({
    el: '.osp-container', // vue不再挂载到此节点上而是找到改节点后直接替换此节点的位置
    i18n,
    components: {},
    render: h => h(OspDesign),
    provide: () => ({
      getInitData: () => (options.data ? options.data : {}),
      getMenuList: options.getMenuList,
      themeList: options.themeList,
      parameterSet: options.parameterSet,
      defaultStyle: options.style,
    }),
  });
}
