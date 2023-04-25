import Vue from 'vue';
import echarts from 'echarts';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);

Vue.prototype.$echarts = echarts;

export function main() {
  return new Vue({
    render: h => h(App),
  }).$mount('#dashboard');
}
