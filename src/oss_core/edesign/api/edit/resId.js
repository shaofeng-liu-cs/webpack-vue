/*
 * @Author: your name
 * @Date: 2021-03-12 17:49:51
 * @LastEditTime: 2023-01-13 15:33:44
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\edit\resource.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 修改单个资源
 * @param {*} params: 单个资源的详细信息
 * @return {*}
 */
export function editResource(params) {
  const url = 'edesign/rivt/single/resource/v1';
  return fish.put({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 修改设备在其他资源上的位置（比如是人井内还是人井外）何涛提供
 * @param {*} params deviceId：移动的设备id, deviceResType：设备类型,placeResId：目标ID,placeResType:目标类型,schemaId：所在的任务单ID,action：A为移入D为移出
 * @return {*}
 */
export function editDevicePlace(params) {
  const url = 'edesign/rivt/device/placeposition/v1';
  return fish.put({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

export function editHardware(params) {
  const url = 'edesign/hardware/info/inner/v1';
  return fish.put({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 将光缆移入管道 何涛提供
 * @param {*} params.cableList {cableId, cableId2}
 * @return {*}
 */
export function removeCableInDuct(params) {
  const url = `edesign/rivt/facilitysection/innercable/${params.sprintId}/${params.pipelineId}/v1`;
  return fish.post({
    url,
    data: params.cableList,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 修改盘留信息
 * @param {*}
 * @return {*}
 */
export function operateCableStretch(param) {
  const url = 'edesign/rivt/cable/operateCableStretch/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 修改设计设置参数
 * @param {*}
 * @return {*}
 */
export function applyDesignSetting(param) {
  const url = 'edesign/schema/setting/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/*
 * 同时移动gis和资源数据
 * */
export function moveAllGraphic(param) {
  const url = 'edesign/rivt/single/resource/move/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
