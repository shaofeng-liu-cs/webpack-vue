/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-12-15 10:12:04
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 右侧菜单栏静态配置文件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\toolbar\menuConfig.js
 */
import i18n from '@/oss_core/base/locale/locale.js';

export default function getMenuList(type, flag, sourceFlag) {
  if (flag === 'sprint') {
    if (sourceFlag === 'manager-map') {
      return [
        {
          name: i18n.t('MAP_TOOLBAR_CONFIG_LAYER_CONTROL'),
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
        },
        {
          name: i18n.t('MAP_TOOLBAR_CONFIG_STREET_VIEW'),
          code: 'StreetView',
          seq: 7,
          icon: 'icon_osp icon_ospjiejing',
        },
      ];
    }
    return [
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_DIVIDING_DESIGN_UNITS'), // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
        code: 'NewResource', // 组件名，vue中注册的组件名称
        seq: 1, // 排序
        icon: 'icon_osp icon_ospMaintenance', // 图标
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_LAYER_CONTROL'),
        code: 'LayerControl',
        seq: 2,
        icon: 'icon_osp icon_ospLayerControl',
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_STREET_VIEW'),
        code: 'StreetView',
        seq: 7,
        icon: 'icon_osp icon_ospjiejing',
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_TASK_LIST'),
        code: 'TaskList',
        seq: 8,
        icon: 'icon_osp icon_ospBasicFunction',
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_SURROUND_SEARCH'),
        code: 'SurroundSearch',
        seq: 9,
        icon: 'icon_osp icon_ospCircle',
      },
    ];
  }
  if (type === 'OS1') {
    return [
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_NEW_RESOURCE'), // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
        code: 'NewResource', // 组件名，vue中注册的组件名称
        seq: 1, // 排序
        icon: 'icon_osp icon_ospMaintenance', // 图标
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_LAYER_CONTROL'),
        code: 'LayerControl',
        seq: 2,
        icon: 'icon_osp icon_ospLayerControl',
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_STREET_VIEW'),
        code: 'StreetView',
        seq: 7,
        icon: 'icon_osp icon_ospjiejing',
      },
    ];
  }
  if (sourceFlag === 'designer-map') {
    return [
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_LAYER_CONTROL'),
        code: 'LayerControl',
        seq: 2,
        icon: 'icon_osp icon_ospLayerControl',
      },
      {
        name: i18n.t('MAP_TOOLBAR_CONFIG_STREET_VIEW'),
        code: 'StreetView',
        seq: 8,
        icon: 'icon_osp icon_ospjiejing',
      },
    ]; // 菜单列表;
  }

  return [
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_NEW_RESOURCE'), // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
      code: 'NewResource', // 组件名，vue中注册的组件名称
      seq: 1, // 排序
      icon: 'icon_osp icon_ospMaintenance', // 图标
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_LAYER_CONTROL'),
      code: 'LayerControl',
      seq: 2,
      icon: 'icon_osp icon_ospLayerControl',
    },
    // {
    //     name: i18n.t('MAP_TOOLBAR_CONFIG_RESOURCE'),
    //     code: 'Resource',
    //     seq: 4,
    //     icon: 'icon_osp icon_ospResourceQuery'
    // },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_DESIGN_CHECK'),
      code: 'DesignCheck',
      seq: 5,
      icon: 'icon_osp icon_ospDesignCheck',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_DESIGN_EXPORT'),
      code: 'DesignExport',
      seq: 6,
      icon: 'icon_osp icon_ospDesignExport',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_DESIGN_IMPORT'),
      code: 'DesignImport',
      seq: 7,
      icon: 'icon_osp icon_ospimport',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_STREET_VIEW'),
      code: 'StreetView',
      seq: 8,
      icon: 'icon_osp icon_ospjiejing',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_RESOURCE_TREE'),
      code: 'ResourceTree',
      seq: 9,
      icon: 'icon_osp icon_ospBasicFunction',
    },
    // {
    //     name: i18n.t('MAP_TOOLBAR_CONFIG_SCHEMA_TOPO'),
    //     code: 'SchemaTopo',
    //     seq: 10,
    //     icon: 'icon_osp icon_ospshuchuwuguanli'
    // },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_DEMAND_POINT'),
      code: 'DemandPoint',
      seq: 11,
      icon: 'icon_osp icon_ospjianzhu',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_OPTICAL_ATTENUATION'),
      code: 'OpticalAttenuation',
      seq: 12,
      icon: 'icon_osp icon_ospshuxing',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_LAYING_CABLE'),
      code: 'CableLaying',
      seq: 13,
      icon: 'icon_osp icon_ospLayingCable',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_BATCH_REFERENCE'),
      code: 'BatchReference',
      seq: 14,
      icon: 'icon_osp icon_osphebingxian',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_DESIGN_SETTINGS'),
      code: 'DesignSettings',
      seq: 15,
      icon: 'icon_osp icon_ospshezhi',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_SURROUND_SEARCH'),
      code: 'SurroundSearch',
      seq: 16,
      icon: 'icon_osp icon_ospschool_fuzhi',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_COPY_GEO'),
      code: 'CopyGeo',
      seq: 17,
      icon: 'icon_osp icon_ospCopyMove-1',
    },
    {
      name: i18n.t('MAP_TOOLBAR_CONFIG_AUTO_LLD'),
      code: 'AutoLLD',
      seq: 18,
      icon: 'icon_osp icon_ospEditMode',
    },
  ]; // 菜单列表;
}
