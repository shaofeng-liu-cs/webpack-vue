/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-02-18 14:57:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\index.js
 */
import Vue from 'vue';
import * as map from 'map';
import echart from 'echarts';
import DesignerMap from './designerMap.vue';
import components from '@/components';
import siderBarComponents from '../../../osp/sidebar/siderBarComponents.js';
import i18n from '@/oss_core/base/locale/locale.js';
import themeList from '@/oss_core/base/config/edesign/themeConfig.js'; // 热地图配置,
import getMenuList from '@/oss_core/base/config/edesign/menuConfig.js'; // 菜单列表,

Vue.use(components);
Vue.use(siderBarComponents);
Vue.prototype.$map = map;
Vue.prototype.$echarts = echart;
window.ht.Default.baseZIndex = 1000; // 层级
// Vue.prototype.$rip = RippleAnimation.install
// new ht.DataModel();
export function main(data) {
  return new Vue({
    el: '#osp', // vue不再挂载到此节点上而是找到改节点后直接替换此节点的位置
    i18n,
    components: {},
    render: h => h(DesignerMap),
    provide: () => ({
      getMenuList,
      initData: data || {},
      getThemeList: () => themeList,
    }),
  });
}
