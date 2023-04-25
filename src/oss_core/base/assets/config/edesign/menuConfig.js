/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2023-04-10 11:25:46
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 右侧菜单栏静态配置文件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\toolbar\menuConfig.js
 */
// eslint-disable-next-line import/no-amd, no-undef
define(['i18n!oss_core/edesign/assets/config/edesign/i18n/menu'], i18n => ({
  getMenuList(type, flag, sourceFlag, construction, viewType, networkLevel) {
    if (flag === 'sprint') {
      if (sourceFlag === 'manager-map') {
        return [
          {
            name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
            code: 'LayerControl',
            seq: 2,
            icon: 'icon_osp icon_ospLayerControl',
          },
          {
            name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
            code: 'StreetView',
            seq: 7,
            icon: 'icon_osp icon_ospjiejing',
          },
        ];
      }
      return [
        // {
        //   name: i18n.MAP_TOOLBAR_CONFIG_DIVIDING_DESIGN_UNITS, // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
        //   code: 'NewResource', // 组件名，vue中注册的组件名称
        //   seq: 1, // 排序
        //   icon: 'icon_osp icon_ospMaintenance', // 图标
        // },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_INITIATE_SURVEY,
          code: 'InitialSurvey',
          seq: 3,
          icon: 'icon_osp icon_ospInitiateSurvey',
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
          code: 'StreetView',
          seq: 7,
          icon: 'icon_osp icon_ospjiejing',
        },
        // {
        //   name: i18n.MAP_TOOLBAR_CONFIG_TASK_LIST,
        //   code: 'TaskList',
        //   seq: 8,
        //   icon: 'icon_osp icon_ospBasicFunction',
        // },
        // {
        //   name: i18n.MAP_TOOLBAR_CONFIG_SURROUND_SEARCH,
        //   code: 'SurroundSearch',
        //   seq: 9,
        //   icon: 'icon_osp icon_ospschool_fuzhi',
        // },
        {
          name: i18n.MAP_TOOLBAR_SURFACE_MANAGEMENT,
          code: 'DemandPoint',
          seq: 16,
          icon: 'icon_osp icon_ospjianzhu',
          keepAlive: 'Y', // 是否缓存
        },
      ];
    }
    if (type === 'OS1') {
      return [
        {
          name: i18n.MAP_TOOLBAR_CONFIG_NEW_RESOURCE, // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
          code: 'NewResource', // 组件名，vue中注册的组件名称
          seq: 1, // 排序
          icon: 'icon_osp icon_ospMaintenance', // 图标
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
          code: 'StreetView',
          seq: 7,
          icon: 'icon_osp icon_ospjiejing',
        },
      ];
    }
    if (sourceFlag === 'designer-map') {
      return [
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
          code: 'StreetView',
          seq: 8,
          icon: 'icon_osp icon_ospjiejing',
        },
      ]; // 菜单列表;
    }
    if (viewType === 'view') {
      return [
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_RESOURCE_TREE,
          code: 'ResourceTree',
          seq: 3,
          icon: 'icon_osp icon_ospBasicFunction',
          keepAlive: 'N', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_EXPORT,
          code: 'DesignExport',
          seq: 13,
          icon: 'icon_osp icon_ospDesignExport',
          keepAlive: 'Y', // 是否缓存
        },
        // {
        //   name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
        //   code: 'StreetView',
        //   seq: 15,
        //   icon: 'icon_osp icon_ospjiejing',
        //   keepAlive: 'Y', //是否缓存
        // },
      ]; // 菜单列表;
    }
    if (construction === 'N' || networkLevel === 'CO') {
      return [
        {
          name: i18n.MAP_TOOLBAR_CONFIG_NEW_RESOURCE, // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
          code: 'NewResource', // 组件名，vue中注册的组件名称
          seq: 1, // 排序
          icon: 'icon_osp icon_ospMaintenance', // 图标
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
          code: 'LayerControl',
          seq: 2,
          icon: 'icon_osp icon_ospLayerControl',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_RESOURCE_TREE,
          code: 'ResourceTree',
          seq: 3,
          icon: 'icon_osp icon_ospBasicFunction',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_LAYING_CABLE,
          code: 'CableLaying',
          seq: 4,
          icon: 'icon_osp icon_ospLayingCable',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_BATCH_REFERENCE,
          code: 'BatchReference',
          seq: 5,
          icon: 'icon_osp icon_osphebingxian',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_COPY_GEO,
          code: 'CopyGeo',
          seq: 6,
          icon: 'icon_osp icon_ospCopyMove-1',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_INITIATE_SURVEY,
          code: 'InitialSurvey',
          seq: 7,
          icon: 'icon_osp icon_ospInitiateSurvey',
        },
        {
          name: i18n.MAP_TOOLBAR_NODE_NETWORK,
          code: 'NodeNetwork',
          seq: 8,
          icon: 'icon_osp icon_ospLayingCable',
          keepAlive: 'N', // 是否缓存
        },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_CONSTRUCTION_MANAGEMENT,
        //     code: 'ConstructionManagement',
        //     seq: 8,
        //     icon: 'icon_osp icon_ospPM',
        //     keepAlive: 'N', //是否缓存
        // },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_PM_TASK,
        //     code: 'PmTask',
        //     seq: 8,
        //     icon: 'icon_osp icon_ospPM',
        // },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_CONSTRUCTION_TASK,
        //     code: 'ConstructionTask',
        //     seq: 9,
        //     icon: 'icon_osp icon_ospBuild',
        // },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_SPLICE_TASK,
        //     code: 'SpliceTask',
        //     seq: 10,
        //     icon: 'icon_osp icon_ospSplice',
        // },
        {
          name: i18n.MAP_TOOLBAR_BATCH_SELECT_MODEL,
          code: 'BatchSelectModel',
          seq: 20,
          icon: 'icon_osp icon_ospLayerControl',
          keepAlive: 'N', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_PUBLISH_TASK,
          code: 'PublishTask',
          seq: 11,
          icon: 'icon_osp icon_ospPublish',
          keepAlive: 'N', // 是否缓存
        },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_RESOURCE,
        //     code: 'Resource',
        //     seq: 4,
        //     icon: 'icon_osp icon_ospResourceQuery'
        // },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_CHECK,
        //     code: 'DesignCheck',
        //     seq: 12,
        //     icon: 'icon_osp icon_ospDesignCheck',
        //     keepAlive: 'Y', //是否缓存
        // },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_EXPORT,
          code: 'DesignExport',
          seq: 13,
          icon: 'icon_osp icon_ospDesignExport',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_IMPORT,
          code: 'DesignImport',
          seq: 14,
          icon: 'icon_osp icon_ospimport',
          keepAlive: 'Y', // 是否缓存
        },
        // {
        //   name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
        //   code: 'StreetView',
        //   seq: 15,
        //   icon: 'icon_osp icon_ospjiejing',
        //   keepAlive: 'Y', //是否缓存
        // },

        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_SCHEMA_TOPO,
        //     code: 'SchemaTopo',
        //     seq: 10,
        //     icon: 'icon_osp icon_ospshuchuwuguanli'
        // },

        {
          name: i18n.MAP_TOOLBAR_CONFIG_OPTICAL_ATTENUATION,
          code: 'OpticalAttenuation',
          seq: 17,
          icon: 'icon_osp icon_ospshuxing',
          keepAlive: 'Y', // 是否缓存
        },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_SETTINGS,
          code: 'DesignSettings',
          seq: 18,
          icon: 'icon_osp icon_ospshezhi',
          keepAlive: 'Y', // 是否缓存
        },
        // {
        //     name: i18n.MAP_TOOLBAR_CONFIG_SURROUND_SEARCH,
        //     code: 'SurroundSearch',
        //     seq: 16,
        //     icon: 'icon_osp icon_ospschool_fuzhi',
        // },
        {
          name: i18n.MAP_TOOLBAR_CONFIG_AUTO_LLD,
          code: 'AutoLLD',
          seq: 19,
          icon: 'icon_osp icon_ospEditMode',
          keepAlive: 'Y', // 是否缓存
        },
      ]; // 菜单列表;
    }
    return [
      {
        name: i18n.MAP_TOOLBAR_CONFIG_NEW_RESOURCE, // 组件显示的名字，去除空格为组件名，vue中注册的组件名称
        code: 'NewResource', // 组件名，vue中注册的组件名称
        seq: 1, // 排序
        icon: 'icon_osp icon_ospMaintenance', // 图标
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_LAYER_CONTROL,
        code: 'LayerControl',
        seq: 2,
        icon: 'icon_osp icon_ospLayerControl',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_RESOURCE_TREE,
        code: 'ResourceTree',
        seq: 3,
        icon: 'icon_osp icon_ospBasicFunction',
        keepAlive: 'N', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_LAYING_CABLE,
        code: 'CableLaying',
        seq: 4,
        icon: 'icon_osp icon_ospLayingCable',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_BATCH_SELECT_MODEL,
        code: 'BatchSelectModel',
        seq: 20,
        icon: 'icon_osp icon_ospLayerControl',
        keepAlive: 'N', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_BATCH_REFERENCE,
        code: 'BatchReference',
        seq: 5,
        icon: 'icon_osp icon_osphebingxian',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_COPY_GEO,
        code: 'CopyGeo',
        seq: 6,
        icon: 'icon_osp icon_ospCopyMove-1',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_INITIATE_SURVEY,
        code: 'InitialSurvey',
        seq: 7,
        icon: 'icon_osp icon_ospInitiateSurvey',
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_CONSTRUCTION_MANAGEMENT,
        code: 'ConstructionManagement',
        seq: 8,
        icon: 'icon_osp icon_ospPM',
        keepAlive: 'N', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_NODE_NETWORK,
        code: 'NodeNetwork',
        seq: 9,
        icon: 'icon_osp icon_ospLayingCable',
        keepAlive: 'N', // 是否缓存
      },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_PM_TASK,
      //     code: 'PmTask',
      //     seq: 8,
      //     icon: 'icon_osp icon_ospPM',
      // },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_CONSTRUCTION_TASK,
      //     code: 'ConstructionTask',
      //     seq: 9,
      //     icon: 'icon_osp icon_ospBuild',
      // },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_SPLICE_TASK,
      //     code: 'SpliceTask',
      //     seq: 10,
      //     icon: 'icon_osp icon_ospSplice',
      // },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_PUBLISH_TASK,
        code: 'PublishTask',
        seq: 11,
        icon: 'icon_osp icon_ospPublish',
        keepAlive: 'N', // 是否缓存
      },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_RESOURCE,
      //     code: 'Resource',
      //     seq: 4,
      //     icon: 'icon_osp icon_ospResourceQuery'
      // },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_CHECK,
      //     code: 'DesignCheck',
      //     seq: 12,
      //     icon: 'icon_osp icon_ospDesignCheck',
      //     keepAlive: 'Y', //是否缓存
      // },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_EXPORT,
        code: 'DesignExport',
        seq: 13,
        icon: 'icon_osp icon_ospDesignExport',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_IMPORT,
        code: 'DesignImport',
        seq: 14,
        icon: 'icon_osp icon_ospimport',
        keepAlive: 'Y', // 是否缓存
      },
      // {
      //   name: i18n.MAP_TOOLBAR_CONFIG_STREET_VIEW,
      //   code: 'StreetView',
      //   seq: 15,
      //   icon: 'icon_osp icon_ospjiejing',
      //   keepAlive: 'Y', //是否缓存
      // },

      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_SCHEMA_TOPO,
      //     code: 'SchemaTopo',
      //     seq: 10,
      //     icon: 'icon_osp icon_ospshuchuwuguanli'
      // },

      {
        name: i18n.MAP_TOOLBAR_CONFIG_OPTICAL_ATTENUATION,
        code: 'OpticalAttenuation',
        seq: 17,
        icon: 'icon_osp icon_ospshuxing',
        keepAlive: 'Y', // 是否缓存
      },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_DESIGN_SETTINGS,
        code: 'DesignSettings',
        seq: 18,
        icon: 'icon_osp icon_ospshezhi',
        keepAlive: 'Y', // 是否缓存
      },
      // {
      //     name: i18n.MAP_TOOLBAR_CONFIG_SURROUND_SEARCH,
      //     code: 'SurroundSearch',
      //     seq: 16,
      //     icon: 'icon_osp icon_ospschool_fuzhi',
      // },
      {
        name: i18n.MAP_TOOLBAR_CONFIG_AUTO_LLD,
        code: 'AutoLLD',
        seq: 19,
        icon: 'icon_osp icon_ospEditMode',
        keepAlive: 'Y', // 是否缓存
      },
    ]; // 菜单列表;
  },
}));
