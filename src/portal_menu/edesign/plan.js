// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/plan.html',
  'oss_core/edesign/assets/config/edesign/themeConfig.js',
  'oss_core/edesign/assets/config/plan/menuConfig.js',
  'oss_core/edesign/assets/config/edesign/styleConfig.js',
  'css!gis-plat/gis-sdk/gis/map.css',
  'css!frm/fish-desktop/third-party/webupload/css/webuploader.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
  'css!oss_core/edesign/view/plan.css',
], (template, theme, menu, style) => {
  const { fish, portal } = window;
  return fish.View.extend({
    template,
    initialize: opts => {
      this.modalConfig = opts.modalConfig;
    },
    afterRender: () => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/view/plan'], ({ main }) => {
        const options = Object.assign(theme, menu, style, { modalConfig: this.modalConfig });
        this.main = main(options);
      });
    },
    cleanup: () => {
      // do something
      portal.closeMenuFlag = true;
      if (this.main) {
        this.main.$destroy();
      }
    },
  });
});
