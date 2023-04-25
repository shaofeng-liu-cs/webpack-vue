import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //新增build工单
 * @param {String} schemaId, resIdList
 * @return {*}
 */

export function addBuildTask(param) {
  const url = 'edesign/constructionTask/addBuildTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增splice工单
 * @param {String} schemaId, splicetree
 * @return {*}
 */

export function addSpliceTask(param) {
  const url = 'edesign/constructionTask/addSpliceTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增Publish工单
 * @param {String}schemaId, taskIdList (无需施工则不传)
 * @return {*}
 */

export function addPublishTask(param) {
  const url = 'edesign/constructionTask/addPublishTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
