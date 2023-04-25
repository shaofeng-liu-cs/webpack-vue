/*
 * @Author: your name
 * @Date: 2020-07-27 11:43:43
 * @LastEditTime: 2023-03-09 11:32:56
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 和任务单、图层相关接口
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\del\schema.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

// 删除方案
export function deleteDesignScheme(projectSchemaId) {
  const url = `edesign/designschema/config/${projectSchemaId}/v1`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

// 删除目录
export function deleteFold(folderId) {
  const url = `edesign/designschema/fold/${folderId}/v1`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 删除施工方案
export function deleteConstruct(constSchemeId) {
  const url = `edesign/construct/config/v1?constSchemeId=${constSchemeId}`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 删除施工项
export function deleteConstitem(itemSpecId) {
  const url = `edesign/construct/config/constitem/v1?itemSpecId=${itemSpecId}`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //删除物料配置
 * @param {String} itemSpecId
 * @return {*}
 */
export function deleteConstitemSupp(param) {
  const url = 'edesign/config/constitemsupp/delete';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 删除物料配置-新
export function deleteConstitemSuppNew(param) {
  const url = 'edesign/config/constitemsupp/deleteBySupp';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
export function deleteDesignschemaConstscheme(primaryId) {
  const url = `edesign/designschema/config/constscheme/v1?primaryId=${primaryId}`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
