import Vue from 'vue';
import * as map from 'map';
import Plan from './plan.vue';
import components from '@/components';
import siderBarComponents from './sidebar/siderBarComponents.js';
import i18n from '@/oss_core/base/locale/locale.js';
// import '@/oss_core/base/css/src/index.scss'; //引入饿了么UI的字体库 样式文件多了120KB

Vue.use(components);
Vue.use(siderBarComponents);
Vue.prototype.$map = map;

export function main(options) {
  return new Vue({
    el: '.plan-container', // vue不再挂载到此节点上而是找到改节点后直接替换此节点的位置
    i18n,
    components: {},
    render: h => h(Plan),
    provide: () => ({
      getMenuList: options.getMenuList,
      themeList: options.themeList,
      defaultStyle: options.style,
      modalConfig: options.modalConfig,
    }),
  });
}
