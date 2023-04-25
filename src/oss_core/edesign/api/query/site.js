/*
 * @Author: your name
 * @Date: 2021-03-05 10:08:49
 * @LastEditTime: 2021-03-05 11:14:35
 * @LastEditors: Please set LastEditors
 * @Description: 根据站点查询
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\site.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 根据站点查询站点下机房信息
 * @param {*} siteIds:站点ID数组
 * @return {*} promise
 */
export function getRoomInfosBySites(siteIds) {
  const url = 'edesign/rivt/place/nameAndId/info/v1';
  return fish.post({
    url,
    contentType: 'application/json',
    data: siteIds,
    success: restSuccess,
    error: restError(url),
  });
}
