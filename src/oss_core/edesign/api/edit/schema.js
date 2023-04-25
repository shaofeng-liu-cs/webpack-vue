import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

// 修改目录
export function updateFold(param) {
  const url = 'edesign/designschema/fold/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改目录
export function updateDesignSchema(projectSchemaId, param) {
  const url = `edesign/designschema/config/${projectSchemaId}/v1`;
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改设计约束
export function updateDesignRules(param) {
  const url = 'edesign/designschema/config/designrules/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改设计方案
export function updateDesignelement(param) {
  const url = 'edesign/designschema/config/designelement/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改施工方案
export function updateConstruct(param) {
  const url = 'edesign/construct/config/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改施工项
export function updateConstitem(param) {
  const url = 'edesign/construct/config/constitem/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改施工项顺序
export function updateConstitemseq(param) {
  const url = 'edesign/construct/config/constitemseq/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //修改版本的图片地址
 * @param {Object}  taskId imgPath
 * @return {*}
 */
export function editVersionImg(param) {
  const url = 'im/project/task/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //版本确认
 * @param {Object}  taskId
 * @return {*}
 */
export function versionConfirm(param) {
  const url = 'im/project/task/version/confirm/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //编辑物料配置
 * @param {String} itemSpecId
 * @return {*}
 */

export function editConstitemSupp(param) {
  const url = 'edesign/config/constitemsupp/edit';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 修改公式
export function editPubstat(param) {
  const url = 'edesign/construct/config/pubstat/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 修改任务类型与施工项关系
export function editTasktypeWork(taskType, param) {
  const url = `edesign/tasktype/const/${taskType}/v1`;
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
