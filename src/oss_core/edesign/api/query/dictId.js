/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-03-07 10:15:18
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-09 11:30:01
 * @FilePath: \code\design-web\src\oss_core\edesign\api\query\dictId.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询物料分类
 * @param {String} dictId
 * @return {*}
 */
export function queryMaterialClassify(dictId) {
  const url = `edesign/opbdict/v1?dictId=${dictId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
