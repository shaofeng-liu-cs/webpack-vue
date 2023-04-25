/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-03-09 11:36:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\home.js
 */
import Vue from 'vue';
import * as map from 'map';
import ElementUI from 'element-ui';
import ProjectHome from './ProjectHome.vue';
import components from '@/components';
import i18n from '@/oss_core/base/locale/locale.js';

// import '@/oss_core/base/css/src/index.scss'; //引入饿了么UI的字体库 样式文件多了120KB
import 'photoviewer/dist/photoviewer.css';

// Vue.component('downloadExcel', JsonExcel);
Vue.use(components);
ElementUI.install(Vue, { size: 'mini' });
Vue.prototype.$map = map;
// ht.Default.baseZIndex = 1000; //层级
export function main(options) {
  return new Vue({
    el: '#osp', // vue不再挂载到此节点上而是找到改节点后直接替换此节点的位置
    i18n,
    components: {},
    render: h => h(ProjectHome),
    provide: () => ({
      initData: options.data ? options.data : {},
      getMenuList: options.getMenuList,
      themeList: options.themeList,
      defaultStyle: options.style,
    }),
  });
}
