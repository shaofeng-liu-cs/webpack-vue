/*
 * @Author: your name
 * @Date: 2021-03-23 14:37:48
 * @LastEditTime: 2021-07-23 15:38:04
 * @LastEditors: Please set LastEditors
 * @Description: 根据资源ID查询接口
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\resId.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 查询链接信息
 * @param {*} deviceId
 * @return {*}
 */
export function queryDevicInfoById(deviceId) {
  const url = `edesign/rivt/link/link/${deviceId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 何涛
 * @param {*} params 对象，resId资源ID，resType资源类型，queryCable当为Y时查询除了设备其他查询需要带出cable信息，当为N时不查
 * @return {*} promise
 */
export function queryPointRelaResInfo(params) {
  const { resId, resType, queryCable, mapNo, schemaId } = params;
  const url = `edesign/topo/crossPointRelaResInfo/v1?resId=${resId}&resType=${resType}&queryCableFlag=${queryCable}&mapNo=${mapNo}&schemaId=${schemaId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询盘留信息
 * @param {*} resId,resType
 * @return {*}
 */
export function getCableStretchByResId(parmas) {
  const url = `edesign/cable/query/${parmas.resType}/${parmas.resId}/cableStretch/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询盘留信息
 * @param {*} resId,resType
 * @return {*}
 */
export function getRefDetailByResId(parmas) {
  const url = `edesign/schema/refdetail/v1/${parmas.resId}/${parmas.resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //根据node（光接头盒）的ID查询下面可以发的单信息
 * @param {String} schemaId， resIdList
 * @return {*}
 */

export function querySplicePointList(param) {
  const url = 'edesign/constructionTask/querySplicePointList/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
