// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/ui-itf/dashboard/index.html',
  'css!oss_core/edesign/view/dashboard.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
], template => {
  const { fish } = window;
  return fish.View.extend({
    template,
    initialize: () => {},
    afterRender: () => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/view/dashboard.js'], ({ main }) => {
        this.main = main();
      });
    },
    cleanup: () => {
      // do something
      this.main.$destroy();
    },
  });
});
