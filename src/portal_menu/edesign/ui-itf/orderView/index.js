// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/ui-itf/orderView/index.html',
  'css!gis-plat/gis-sdk/gis/map.css',
  'css!frm/fish-desktop/third-party/webupload/css/webuploader.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
  'css!oss_core/edesign/view/designer-map.css',
], template => {
  const { fish } = window;
  return fish.View.extend({
    template,
    initialize: opts => {
      this.schemaId = opts.orderId || '';
      this.main = null;
    },
    afterRender: () => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/view/designer-map.js'], ({ main }) => {
        this.main = main({ orderId: this.schemaId });
      });
    },
    cleanup: () => {
      // do something
      if (this.main) {
        this.main.$destroy();
      }
    },
  });
});
