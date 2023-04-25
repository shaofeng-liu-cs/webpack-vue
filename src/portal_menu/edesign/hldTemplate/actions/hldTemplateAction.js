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
    // 查询素材类型列表
    qryResourceType: success => {
      const option = {
        url: '/oss/edesign/feature/manager/hldResType/v1',
        async: false,
        success: data => {
          success(data);
        },
      };
      fish.get(option);
    },

    // 查询当前素材类型下的所有能力模板列表
    qryAllHLDTemplateList: (params, success) => {
      const option = {
        url: '/oss/edesign/hldtemplate/list/v1',
        async: false,
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data);
        },
      };
      fish.post(option);
    },

    // 编辑HLD模板信息
    editHLDTemplateInfo: (params, success) => {
      const option = {
        url: '/oss/edesign/hldtemplate/v1',
        async: true,
        contentType: 'application/json',
        data: params,
        success,
      };
      return fish.patch(option);
    },

    // 新增HLD模板信息
    addNewHLDTemplateInfo: (params, success) => {
      const option = {
        url: '/oss/edesign/hldtemplate/v1',
        async: true,
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data);
        },
      };
      return fish.post(option);
    },

    // 删除HLD模板信息
    deleteHLDTemplate: (templateId, success) => {
      const option = {
        url: `/oss/edesign/hldtemplate/${templateId}/v1`,
        async: true,
        contentType: 'application/json',
        success: data => {
          success(data);
        },
      };
      return fish.remove(option);
    },

    // 查询GIS的属性列表
    qryGISAttributeList: (resType, templateId, success) => {
      const option = {
        url: `/oss/edesign/hldtemplate/attrs/${resType}/${templateId}/v1`,
        async: false,
        contentType: 'application/json',
        success: data => {
          success(data);
        },
      };
      fish.get(option);
    },

    // 编辑GIS属性
    editGISAttributeInfo: (params, success) => {
      const option = {
        url: '/oss/edesign/hldtemplate/attr/v1',
        async: true,
        contentType: 'application/json',
        data: params,
        success,
      };
      return fish.patch(option);
    },

    // 新增GIS属性
    // addNewGISAttributeInfo: function (params, success) {
    //     let option = {
    //         url: '/oss/edesign/hldtemplate/attr/v1',
    //         async: true,
    //         contentType: 'application/json',
    //         data: params,
    //         success: function (data) {
    //             success(data);
    //         },
    //     };
    //     return fish.post(option);
    // },

    // 新增GIS属性
    deleteGISAttribute: (attrId, templateId, success) => {
      const option = {
        url: `/oss/edesign/hldtemplate/attr/${attrId}/${templateId}/v1`,
        async: true,
        contentType: 'application/json',
        success: data => {
          success(data);
        },
      };
      return fish.remove(option);
    },
  };
});
