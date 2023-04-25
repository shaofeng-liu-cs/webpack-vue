/*
 * @Author: your name
 * @Date: 2021-03-12 17:49:51
 * @LastEditTime: 2022-08-15 11:47:26
 * @LastEditors: HongAnDing
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\edit\resource.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 将光缆移出管道 何涛提供
 * @param {*} params [{cableId:123, pipelineId:1 },{cableId:456, pipelineId:1 }]
 * @return {*}
 */
export function removeCableOutDuct(params) {
  const url = 'edesign/rivt/facilitysection/innercable/v1';
  return fish.remove({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
