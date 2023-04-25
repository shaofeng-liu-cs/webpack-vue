/*
 * @Author: HongAnDing
 * @Date: 2022-07-12 15:33:19
 * @LastEditors: HongAnDing
 * @LastEditTime: 2022-07-16 22:54:35
 * @Description: file content
 */
// eslint-disable-next-line no-undef
define(() => {
  const { fish } = window;
  return {
    // 查询属性动作列表
    qryLayerAction: success => {
      const option = {
        url: 'edesign/config/attraction/list/v1',
        async: false,
        success: data => {
          success(data.attrActionList);
        },
      };
      fish.post(option);
    },
    // 新增属性动作列表
    addLayerAction: (params, success) => {
      const option = {
        url: 'edesign/config/attraction/add/v1',
        async: false,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        data: params,
        success: data => {
          success(data);
        },
      };
      fish.post(option);
    },
    // 编辑属性动作列表
    editLayerAction: (params, success) => {
      const option = {
        url: 'edesign/config/attraction/edit/v1',
        async: false,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        data: params,
        success: data => {
          success(data.resultCode);
        },
      };
      fish.post(option);
    },
    // 删除属性动作列表
    delLayerAction: (params, success) => {
      const option = {
        url: 'edesign/config/attraction/deconste/v1',
        async: false,
        data: params,
        contentType: 'application/json',
        success: data => {
          success(data.resultCode);
        },
      };
      fish.post(option);
    },
    // 查询属性动作子项列表
    qryLayerActionItem: (params, success) => {
      const option = {
        url: 'edesign/config/attractionitem/list/v1',
        async: true,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        data: params,
        success: data => {
          success(data.attrActionItemList);
        },
      };
      fish.post(option);
    },
    // 新增属性动作子项列表
    addLayerActionItem: (params, success) => {
      const option = {
        url: 'edesign/config/attractionitem/add/v1',
        async: false,
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data.resultCode);
        },
      };
      fish.post(option);
    },
    // 编辑属性动作子项列表
    editLayerActionItem: (params, success) => {
      const option = {
        url: 'edesign/config/attractionitem/edit/v1',
        async: false,
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data.resultCode);
        },
      };
      fish.post(option);
    },
    // 删除属性动作子项列表
    delLayerActionItem: (params, success) => {
      const option = {
        url: 'edesign/config/attractionitem/deconste/v1',
        async: false,
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data.resultCode);
        },
      };
      fish.post(option);
    },
    // 查询restype
    qryLayerRestypeList: success => {
      const option = {
        url: 'edesign/schema/restyperela/OPT/defaultrestypelist/v1',
        async: false,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        success: data => {
          success(data.resultList);
        },
      };
      fish.get(option);
    },
    // 查询地貌类型
    qryAllSurfaceLayers: success => {
      const option = {
        url: 'edesign/gis/surface/allsurfaces/v1',
        async: false,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        success: data => {
          success(data.resultList);
        },
      };
      fish.get(option);
    },
    //
    qryAllAttr: (params, success) => {
      const option = {
        url: `edesign/gis/config/restype/${params}/attrinfo/v1`,
        async: false,
        contentType: 'application/json',
        // data: JSON.stringify(params),
        success: data => {
          success(data);
        },
      };
      fish.get(option);
    },
  };
});
