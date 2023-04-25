/*
 * @Author: your name
 * @Date: 2021-05-14 17:10:39
 * @LastEditTime: 2021-05-24 16:58:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\region.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: 根据上级区域查询下级区域
 * @param {*} params,parentId上级区域ID，areaLevel区域等级
 * @return {*}
 */
export function querySubarea({ parentId, areaLevel }) {
  const url = `edesign/area/query/subarea/v1?parentId=${parentId}&areaLevel=${areaLevel}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据areaId查询area的详细信息
 * @param {*} areaId
 * @return {*}
 */
export function getAreaById(areaId) {
  const url = `edesign/area/query/${areaId}/areacentrepoint/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/*
 * 获取city
 * */
// export function getUserCity() {
//   const param = {
//     ACT_CODE: 'RES_QRY',
//     SERVICE_NAME: 'MIM_API_GET_USER_CITY_PRIV',
//   };
//   const url = 'im/api/getUserCity/v1';
//   fish.post({
//     url,
//     data: param,
//     success: restSuccess,
//     error: restError(url),
//   });
// }
