/*
 * @Author: your name
 * @Date: 2021-02-22 09:19:44
 * @LastEditTime: 2022-11-02 17:48:46
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\portal_menu\edesign\home\home.js
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/designerHome/templates/designerHome.html',
  'i18n!oss_core/edesign/designerHome/i18n/designerHome',
  'css!oss_core/edesign/designerHome/css/designerHome.css',
  'css!oss_core/edesign/assets/iconfont/iconfont.css',
], (template, i18nObject) => {
  const { fish, $, portal } = window;
  return fish.View.extend({
    i18nData: fish.extend({}, i18nObject),
    template,
    events: {
      'click  .js-open': 'open',
    },
    initialize: opts => {
      this.options = opts;
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      return this;
    },
    afterRender: () => {
      $(`#${this.options.domId}`).addClass('edesign-v9-designer-home-content');
    },
    open: () => {
      // 2021-07-13-lp 此处修改目的是为了保证designHome打开的菜单ID和点击左侧portal菜单列表打开的菜单ID为同一个，
      // 不然会出现分别点击左侧portal菜单列表和designHome会出现两个同样内容的页签
      // 此处逻辑调用MenuView.js的qryMenuList方法
      const currentPortalId = portal.appGlobal.get('portalId');
      fish.get(`users/portals/${currentPortalId}/dirmenus`, result => {
        if (result && result.length > 0) {
          const findRes = result.find(res => res.url === 'oss_core/edesign/osp-design');
          if (findRes) {
            portal.openMenu(`${findRes.partyId}`, 'oss_core/edesign/osp-design', 'S', 'Design Task Management (Designer)', { privCode: 'DESIGNER' });
          }
        }
      });
    },
    cleanup: () => {},
  });
});
