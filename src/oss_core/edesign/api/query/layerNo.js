/*
 * @Author: your name
 * @Date: 2021-05-19 10:15:40
 * @LastEditTime: 2023-03-30 09:14:25
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\layerNo.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 根据layerNo和functionType查询功能按钮详情信息
 * @param {*} layerNo:资源类型;functionType:功能类型
 * @return {*}
 */
export function queryFunctionInfo(params) {
  const url = `edesign/gis/config/resource/${params.layerNo}/${params.functionType}/functions/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据layerNo查询标记的风格样式
 */
export function queryMakerStyle(applyType) {
  const url = `edesign/markstyle/config/v1/?applyType=${applyType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
