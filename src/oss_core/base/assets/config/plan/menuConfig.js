/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-12-15 10:07:52
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 右侧菜单栏静态配置文件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\toolbar\menuConfig.js
 */
// eslint-disable-next-line import/no-amd, no-undef
define(['i18n!oss_core/edesign/assets/config/edesign/i18n/menu'], i18n => ({
  getMenuList() {
    return [
      {
        name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_PLANNING_AREA, // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
        code: 'NewResourcePlan', // 组件名，vue中注册的组件名称
        seq: 1, // 排序
        icon: 'icon_osp icon_ospMaintenance', // 图标
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
        code: 'LayerControlPlan',
        seq: 2,
        icon: 'icon_osp icon_ospLayerControl',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
        code: 'StreetViewPlan',
        seq: 15,
        icon: 'icon_osp icon_ospjiejing',
        keepAlive: 'Y', // 是否缓存
      },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
      //     code: 'LayerControl',
      //     seq: 2,
      //     icon: 'icon_osp icon_ospLayerControl',
      //     keepAlive: 'Y', //是否缓存
      // },
    ];
  },
}));
