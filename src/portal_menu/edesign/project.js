// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/project.html',
  'oss_core/edesign/assets/config/edesign/themeConfig.js',
  'oss_core/edesign/assets/config/edesign/menuConfig.js',
  'oss_core/edesign/assets/config/edesign/styleConfig.js',
  'css!gis-plat/gis-sdk/gis/map.css',
  'css!frm/fish-desktop/third-party/webupload/css/webuploader.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
  'css!oss_core/edesign/view/new-osp-design.css',
  'css!oss_core/edesign/view/plan.css',
  'css!oss_core/edesign/view/project.css',
  'css!oss_core/edesign/lib/element-ui/index.css',
], (template, theme, menu, style) => {
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
      require(['oss_core/edesign/view/project'], ({ main }) => {
        const options = Object.assign({ data: this.menuParam }, theme, menu, style);
        this.main = main(options);
        if (this.menuParam.openMenuMode === 'inner') {
          fish.on('projcetUpdateOption', this.updateOption, this);
        }
        // this.updateOption('test', '111111');

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
      });
    },

    // 更新入参
    updateOption: (key, value) => {
      // const menuUtils = this.parentView.MenuUtils
      const currentMenu = portal.appGlobal.get('currentMenu');
      const containerId = `#PORTAL_DIV_MENU_${currentMenu.menuId}`;
      const oldView = this.parentView.getView(containerId);
      if (oldView.options && oldView.options.data) {
        oldView.options.data[key] = value;
        this.parentView.setView(containerId, oldView);
      }
    },
    cleanup: () => {
      // do something
      // console.log(this.main);
      portal.closeMenuFlag = true;
      fish.off('projcetUpdateOption', this.updateOption, this);
      if (this.main) {
        this.main.$destroy();
      }
    },
  });
});
