import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zh from './zh-CN/zh';
import en from './en-US/en';

Vue.use(VueI18n); // 通过插件的形式挂载

const i18n = new VueI18n({
  locale: window.fish.language, // 语言标识
  // this.$i18n.locale // 通过切换locale的值来实现语言切换
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  messages: {
    zh, // 中文语言包
    en, // 英文语言包
  },
});
// console.log(i18n);
export default i18n;
