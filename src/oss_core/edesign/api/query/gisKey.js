/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-02-06 19:40:59
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-02-21 15:10:23
 * @FilePath: \code\design-web\src\oss_core\edesign\api\query\gisKey.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询资源工勘照片
 * @param {String} gisKey
 * @return {*}
 */
export function querySurveyPhotos(gisKey) {
  const url = `edesign/flow/task/gis/attach/v1?gisKey=${gisKey}`;
  return fish.get({
    url,
    data: gisKey,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询资源是否已经进行过工勘
 * @param {String} gisKey
 * @return {*}
 */

export function queryIsSurvey(gisKey) {
  const url = `edesign/surveyTask/surface/${gisKey}/ordercnt/v1`;
  return fish.get({
    url,
    data: gisKey,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询资源链路
 * @param {String} projectId layerNo gisKey
 * @return {*}
 */

export function queryRoute(param) {
  const url = 'edesign/taskTrace/findConstructionLink/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
