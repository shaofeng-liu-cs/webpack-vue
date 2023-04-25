// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/new-osp-design.html',
  'oss_core/edesign/assets/config/edesign/themeConfig.js',
  'oss_core/edesign/assets/config/edesign/menuConfig.js',
  'oss_core/edesign/assets/config/edesign/styleConfig.js',
  'oss_core/edesign/assets/config/edesign/parameterSetConfig.js',
  'css!gis-plat/gis-sdk/gis/map.css',
  'css!frm/fish-desktop/third-party/webupload/css/webuploader.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
  'css!oss_core/edesign/view/new-osp-design.css',
  'css!oss_core/edesign/lib/element-ui/index.css',
], (template, theme, menu, style, parameterSet) => {
  const { fish, portal } = window;
  return fish.View.extend({
    template,
    initialize: opts => {
      portal.closeMenuFlag = false;
      this.menuParam = {};
      // opts.openMenuMode = 'inner'表示是业务菜单内部新开页签
      if (opts.openMenuMode === 'inner') {
        this.menuParam = opts;
      } else {
        // portal框架新开页签(此时可能会存在privCode值)
        this.menuParam.choose = this.menuParam.choose ? this.menuParam.choose : opts.privCode;
      }
      this.main = null;
    },
    afterRender: () => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/view/new-osp-design'], ({ main }) => {
        const options = Object.assign({ data: this.menuParam }, { parameterSet }, theme, menu, style);
        this.main = main(options);
      });

      const themeCss = document.querySelector('#ednThemeCss');
      if (!themeCss) {
        console.log('加载主题css');
        document.body.id = 'edn-theme-body';
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'ednThemeCss';
        const themeVal = localStorage.getItem('edn-theme');
        if (themeVal === 'black') {
          link.href = 'oss_core/edesign/assets/css/theme_black.css';
        } else {
          link.href = 'oss_core/edesign/assets/css/theme_white.css';
        }
        let link2 = document.createElement('link');
        link2.rel = 'stylesheet';
        link2.href = 'oss_core/edesign/assets/css/theme_class.css';
        document.head.append(link2);
        document.head.append(link);
      }
    },
    cleanup: () => {
      // do something
      // console.log(this.main);
      portal.closeMenuFlag = true;
      if (this.main) {
        this.main.$destroy();
      }
    },
  });
});
