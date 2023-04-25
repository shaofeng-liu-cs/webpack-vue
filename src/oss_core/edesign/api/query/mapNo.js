import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 根据mapNo查询资源所有的图层详情信息
 * @param {*} mapNo:地图编码
 * @return {*}
 */
export function queryAllrestypelist(mapNo) {
  const url = `edesign/schema/restyperela/${mapNo}/allrestypelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 筛选掉grid类型的资源类型
export function queryAllrestypelistNew() {
  const url = 'edesign/designschema/config/restypelist/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据mapNo查询资源所有的图层详情信息
 * @param {*} mapNo:地图编码
 * @return {*}
 */
export function queryDefaultrestypelist(params) {
  const url = `edesign/schema/restyperela/${params.schemaType}/${params.mapNo}/defaultrestypelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
