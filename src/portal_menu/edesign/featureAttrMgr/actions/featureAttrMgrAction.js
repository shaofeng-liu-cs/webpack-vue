// eslint-disable-next-line no-undef
define(() => {
  const { fish } = window;
  return {
    qryPlanResType: (params, success) => {
      const option = {
        url: 'edesign/feature/manager/allResType/v1',
        async: true,
        success: data => {
          success(data.resultList);
        },
      };
      fish.get(option);
    },

    qryAttribute: (params, success) => {
      const option = {
        url: 'edesign/feature/manager/resFeatureAttr/v1',
        data: params,
        async: true,
        success: data => {
          success(data.resultList);
        },
      };
      fish.get(option);
    },

    qryStructure: (params, success) => {
      const option = {
        url: 'edesign/feature/manager/featureStructure/v1',
        data: params,
        async: true,
        success: data => {
          success(data.resultList);
        },
      };
      fish.get(option);
    },

    addAttribute: (params, success) => {
      fish.post({
        url: 'edesign/feature/manager/resFeatureAttr/v1',
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data.resultList);
        },
      });
    },

    delAttribute: (params, success) => {
      fish.remove({
        url: `edesign/feature/manager/resFeatureAttr/v1?attrId=${params.attrId}`,
        async: false,
        success: data => {
          success(data.resultList);
        },
      });
    },

    modAttribute: (params, success) => {
      fish.put({
        url: 'edesign/feature/manager/resFeatureAttr/v1',
        contentType: 'application/json',
        data: params,
        success: data => {
          success(data.resultList);
        },
      });
    },
  };
});
