/*
 * @Author: your name
 * @Date: 2021-08-20 16:09:10
 * @LastEditTime: 2023-03-25 12:20:54
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \design-web\src\oss_core\edesign\api\query\spri.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询设计参数
 * @param {*} sprintId:任务单ID
 * @return {*}
 */
export function queryCheckInfo(sprintId) {
  const url = `edesign/policy/check/v1?sprintId=${sprintId}`;
  return fish.get({
    // url: `edesign/policy/sprint/check/v1?sprintId=${sprintId}`,
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //保存设计参数
 * @param {*} 查询到的list
 * @return {*}
 */

export function saveCheckInfo(params) {
  const url = 'edesign/policy/save/level/v1';
  return fish.put({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询设计配置参数
 * @param {*} sprintId
 * @return {*}
 */

export function queryGisSet(sprintId, params) {
  const url = `edesign/sprint/settings/${sprintId}/gisSetting/v1`;
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //保存设计配置参数
 * @param {*} 查询到的list
 * @return {*}
 */

export function saveGisSet(params) {
  const url = 'edesign/sprint/settings/modify/gisSetting/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询图层样式
 * @param {*} sprintId
 * @return {*}
 */

export function getStyleConfig(params) {
  const url = 'edesign/sprint/selectEdnSprintStyle/v1';
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询新建资源树
 * @param {*} sprintId
 * @return {*}
 */

export function getNewResInfo(params) {
  const url = 'edesign/hldtemplate/templateRes/v1';
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询schema配置列表
 * @param {*} sprintId
 * @return {*}
 */

export function getSchemaList(sprintId) {
  const url = `edesign/designSchema/v1?sprintId=${sprintId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询设计约束数据
 * @param {*} sprintId
 * @return {*}
 */

export function getKMLSettings(sprintId) {
  const url = `edesign/schema/settings/queryKMLSettings/${sprintId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询设计绘图
 * @param {*} sprintId
 * @return {*}
 */

export function getDrawingSettings(sprintId) {
  const url = `edesign/design/preparation/drawings/${sprintId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询设计任务单
 * @param {*} projectId  taskType currentFlag true则查询详情
 * @return {*}
 */

export function getSchemaInfo(param) {
  const url = 'edesign/project/task/list/bytype/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询设计任务单
 * @param {*} pageIndex  pageSize pageFlag  projectId
 * @return {*}
 */
export function getBuildTaskList(param) {
  const url = 'edesign/constructionTask/buildtask/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询资源列表
 * @param {*} sprintId
 * @return {*}
 */
export function getRestypeList(sprintId) {
  const url = `edesign/schema/restyperela/${sprintId}/restypelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询built物料
 * @param {*} projectId
 * @return {*}
 */
export function queryBuiltBomList(projectId) {
  const url = `edesign/bom/built/v1?projectId=${projectId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
