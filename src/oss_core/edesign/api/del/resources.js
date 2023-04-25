/*
 * @Author: your name
 * @Date: 2021-03-04 17:48:21
 * @LastEditTime: 2021-03-23 14:46:03
 * @LastEditors: Please set LastEditors
 * @Description: 删除资源
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\del\resources.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //删除资源
 * @param {*} 资源详细信息
 * @return {*}
 */
export function batchDelResources(params) {
  const url = 'edesign/rivt/batch/resource/v1';
  return fish.remove({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
