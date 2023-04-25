import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询订单资源
 * @param {String} orderId
 * @return {*}
 */
export function queryTaskRes(orderId) {
  const url = `edesign/constructionTask/${orderId}/queryTaskRes/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function queryTaskProgress(taskId, functionName) {
  const url = `edesign/trace/query?taskId=${taskId}&functionName=${functionName}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
