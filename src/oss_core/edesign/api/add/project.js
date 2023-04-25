/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2022-10-26 16:56:38
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-20 16:23:24
 * @FilePath: \code\design-web\src\oss_core\edesign\api\add\project.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //新增工程
 * @param {*}
 * @return {*}
 */
export function insertProjectManagementData(param) {
  const url = 'im/project/newProjectMgtInfo/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增导入数据
 * @param {*}
 * @return {*}
 */
export function ImportData(param) {
  const url = 'edesign/hld/import/copyNokiaData';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //MapFlow自动识别建筑物道路
 * @param {*}
 * @return {*}
 */
export function mapFlowIdentify(param) {
  const url = 'edesign/mapflow/addMapFlowProcessing/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //关闭当前单
 * @param {Object}  taskId
 * @return {*}
 */
export function addDesignTask(param) {
  const url = 'im/project/task/close/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //关闭当前单
 * @param {Object}  projectId  taskId
 * @return {*}
 */
export function addLldTask(param) {
  const url = 'edesign/hld/import/decomposeHLDToLLD';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //上传文件
 * @param {Object}  FormData
 * @return {*}
 */
export function uploadFileEdn(param) {
  const url = 'edesign/file/upload?moduleName=edn&date=true&temporary=true';
  return fish.postBasic({
    url,
    processData: false,
    contentType: false,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增订单设计模式参数
 * @param {Object}  orderId
 * @return {*}
 */
export function addOrderMode(param) {
  const url = 'im/project/order/ext/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
