const { fish } = window;

export function queryEnumValue(attrId) {
  // DEV.IS_VIRTUAL
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: `edesign/meta/attr/${attrId}/objectattrvalues/v1`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

export function queryPolicyData(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/policy/check/v1',
      type: 'GET',
      data: param,
      showError: false,
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function querySprintPolicyData(sprintId) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/policy/sprint/check/v1',
      type: 'GET',
      data: { sprintId },
      showError: false,
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function savePolicyData(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/policy/levelandparam/v1',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(param),
      showError: false,
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function checkPolicyData(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/policy/asyn/check/v1',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(param),
      showError: false,
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function repairLngData(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/policy/longitude/v1',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(param),
      showError: false,
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function queryBuildingStructure(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/rivt/building/info/v1',
      type: 'GET',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

export function addBuildingStructure(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/rivt/building/info/v1',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(param),
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

export function editBuildingStructure(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/rivt/building/info/v1',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(param),
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

export function removeBuildingStructure(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/rivt/building/info/v1',
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify(param),
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

export function querySupportRoute(param) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: 'edesign/cableLaying/querySupportRoute/v1',
      data: param,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

export function getCommonConfigData(sprintId, paramNo) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/sprint/settings/${sprintId}/${paramNo}/v1`,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

export function queryCableByAandZ(resType, aDeviceId, zDeviceId) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/resource/query/queryCableByAZ/v1?aDeviceId=${aDeviceId}&zDeviceId=${zDeviceId}&resType=${resType}`,
      success: result => {
        if (result.resultCode === '0') {
          resolve(result.resultList);
        } else {
          reject(result.resultDesc);
        }
      },
      error: reject,
    });
  });
}

export function addGeometryToMap(params) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/gismap/geometry/v1',
      data: params,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

export function modifyGeometry(param) {
  return new Promise((resolve, reject) => {
    fish.put({
      url: 'edesign/gismap/geometry/v1',
      data: param,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

export function qryPipelineListByPointList(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/resource/query/pipelinelistbypointlist/v1',
      data: param,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}
export function getFormDataBySchemaIdAndType(schemaId, resType) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/layout/formlayout/v1?schemaId=${schemaId}&resType=${resType}`,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

// ignoreFishWarning是否忽略fish.warn的报错提示，用于批量调用接口时，业务外部统一处理报错
export function deleteReference(param, ignoreFishWarning) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/schema/ref/v1',
      type: 'DELETE',
      contentType: 'application/json',
      showError: false,
      data: JSON.stringify(param),
      success: result => {
        resolve(result);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message && !ignoreFishWarning) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

// ignoreFishWarning是否忽略fish.warn的报错提示，用于批量调用接口时，业务外部统一处理报错
export function addReference(param, ignoreFishWarning) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/schema/ref/v1',
      type: 'POST',
      contentType: 'application/json',
      showError: false,
      data: JSON.stringify(param),
      success: result => {
        resolve(result);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message && !ignoreFishWarning) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function getAllSchema() {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/schema/schemalist/v1',
      type: 'POST',
      showError: false,
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}

export function analyseAutoLLD(schemaId) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/auto/connect/analyse/from/spliter/v1?schemaId=${schemaId}`,
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}

export function applyAutoLLD(param) {
  return new Promise((resolve, reject) => {
    fish.ajax({
      url: 'edesign/auto/connect/analyse/result/v1',
      type: 'POST',
      showError: false,
      contentType: 'application/json',
      data: JSON.stringify(param),
      success: data => {
        resolve(data);
      },
      error: response => {
        if (response && response.responseJSON && response.responseJSON.message) {
          fish.warn(response.responseJSON.message);
        }
        reject(response);
      },
    });
  });
}
