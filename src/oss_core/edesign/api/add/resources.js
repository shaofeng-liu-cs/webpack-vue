/*
 * @Author: your name
 * @Date: 2021-03-04 17:48:21
 * @LastEditTime: 2021-03-23 14:46:03
 * @LastEditors: Please set LastEditors
 * @Description: 新增资源
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\add\resources.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //新增资源（选型）
 * @param {*} 资源详细信息
 * @return {*}
 */

export function batchAddResources(params) {
  const url = 'edesign/rivt/batch/resource/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

export function addHardware(params) {
  const url = 'edesign/hardware/info/inner/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

export function checkAddHardware(params) {
  const url = 'edesign/hardware/info/inspection/v1';
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

export function addNewHLDTemplateInfo(params) {
  const url = 'edesign/hldtemplate/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
