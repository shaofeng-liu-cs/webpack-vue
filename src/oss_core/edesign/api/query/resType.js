/*
 * @Author: your name
 * @Date: 2021-03-03 15:56:16
 * @LastEditTime: 2023-03-08 17:23:43
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 根据资源类型resType查询资源相关的数据接口
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\resType.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询相应资源的详细数据（表单）
 * @param {*} schemaId:任务单ID，resType：资源类型
 * @return {*}
 */
export function queryResTypeInfo(schemaId, resType) {
  const url = `edesign/layout/formlayout/v1?schemaId=${schemaId}&resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询相应资源的模板数据
 * @param {*} sprintId:大任务单ID，resType：资源类型
 * @return {*}
 */
export function queryTemplateInfo(sprintId, resType) {
  const url = `edesign/sprint/${sprintId}/${resType}/schematemplat/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //gis和form关联数据attrDTOS数据
 * @param {*} resType：资源类型
 * @return {*}
 */

export function queryAttrDtosInfo(resType) {
  const url = `edesign/gis/config/restype/${resType}/attrinfo/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据类型自动命名
 * @param {*} resTyep
 * @return {*}
 */
export function getObjNaming(resTyep) {
  const url = `edesign/rivt/name/${resTyep}/naming/v1`;
  return fish.get({
    url,
    contentType: 'application/json',
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据resId和resType查询gis详情信息
 * @param {*} resId:资源ID;resType:资源类型
 * @return {*}
 */
export function queryResourceInfo(param) {
  const url = 'edesign/resource/query/resourceinfo/v1';
  return fish.get({
    url,
    data: {
      resId: param.resId,
      resType: param.resType,
    },
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据resType查询导入数据的图层详情信息
 * @param {*}resType:资源类型
 * @return {*}
 */
export function queryImportDataInfo(resType) {
  const url = `edesign/hld/import/selectNokiaLayerByResType?resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据resType查询资源属性信息
 * @param {*}resType:资源类型
 * @return {*}
 */
export function queryAttrsInfo(resType) {
  const url = `edesign/feature/manager/resFeatureAttr/v1?resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
