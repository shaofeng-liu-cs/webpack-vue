/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-22 16:55:34
 * @LastEditors: Please set LastEditors
 * @Description: 全局组件注册
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\siderBarComponents.js
 */
import NewResource from './newResource/NewResource.vue';
import LayerControl from './layerControl/LayerControl.vue';
import StreetView from './streetView/StreetView.vue';

const components = [NewResource, LayerControl, StreetView];

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
};

export default {
  install,
};
