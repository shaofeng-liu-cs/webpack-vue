/*
 * @Author: your name
 * @Date: 2020-07-27 11:43:43
 * @LastEditTime: 2023-04-07 17:19:17
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 和任务单、图层相关接口
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\api\query\schema.js
 */
import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function getLayerConfig(schemaId) {
  const url = `edesign/schema/restyperela/${schemaId}/schemalayer/v1`;
  // 获取任务单图层控制的设置信息
  return fish.get({
    // url `edesign/schema/restyperela/${schemaId}/schemalayervisible/v1`,
    // url `edesign/schema/restyperela/${schemaId}/schemaconfig/v1`,
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getLayerConfigBySprintId(sprintId) {
  const url = `edesign/sprint/restyperela/${sprintId}/sprintconfig/v1`;
  // 获取任务单图层控制的设置信息 sprint
  return fish.get({
    // url `edesign/sprint/restyperela/${schemaId}/schemalayervisible/v1`,
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getResTypeConfig(sprintId) {
  const url = `edesign/schema/restyperela/${sprintId}/restypelist/v1`;
  // 获取任务单资源类型列表
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getSurfaceLayers() {
  const url = 'edesign/gis/surface/allsurfacelayers/v1';
  // 获取地貌图层列表
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getTaskDetail(schemaId) {
  const url = `edesign/schema/${schemaId}/schemadetail/v1`;
  // 获取任务单详情信息
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getTaskStatistic(schemaId) {
  const url = `edesign/schema/${schemaId}/designstatistic/v1`;
  // 获取任务单统计信息
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function getConfigExtend() {
  const url = 'edesign/pub/properties/value/v1';
  // 获取任务单统计信息
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询任务单下面的站点信息
 * @param {*} schemaId
 * @return {*} promise
 */
export function querySiteBySchemaId(schemaId) {
  const url = `edesign/schema/${schemaId}/site/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询BOM资源类型
 * @param {*} schemaId
 * @return {*} promise
 */
export function queryBomTypeBySchemaId(param) {
  const url = 'edesign/bom/catalog/restypetree/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询BOM资源类型
 * @param {*} schemaId
 * @return {*} promise
 */
export function queryBomInfoBySchemaId(param) {
  const url = 'edesign/bom/schema/resbills/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询HLDBOM资源类型
 * @param {*} schemaId
 * @return {*} promise
 */
export function queryHldBomInfoBySchemaId(schemaId) {
  const url = `edesign/bom/count/${schemaId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询设计设置数据
 * @param {String} schemaId
 * @return {Promise} promise
 */
export function getSchemaSetting(param) {
  const url = 'edesign/schema/setting/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询资源类型的信息
 * @param {String} schemaId resId资源ID，resType资源类型，
 * @return {Promise} promise
 */
export function getNodeInfo(schemaId, resId, resType) {
  const url = `edesign/resource/query/topodesign/resdetail/v1?schemaId=${schemaId}&resId=${resId}&resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询配置信息
 * @param {String} schemaId
 * @return {Promise} promise
 */
export function getConfigureInfo() {
  const url = 'edesign/pub/properties/value/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询线资源
 * @param {String} schemaId
 * @return {Promise} promise
 */
export function getLineResType(param) {
  const url = 'edesign/gis/config/restype/line/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询点资源
 * @param {String} schemaId
 * @return {Promise} promise
 */
export function getPointResType(param) {
  const url = 'edesign/gis/config/restype/point/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询所有属性及子项动作列表
 * @param {*}
 * @return {*}
 */

export function queryAttrActionList() {
  const url = 'edesign/config/attraction/allList/v1';
  return fish.post({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询子工程所有的Build工单
 * @param {String} schemaId
 * @return {*}
 */

export function queryBuildTask(param) {
  const url = 'edesign/constructionTask/queryBuildTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询子工程所有的PM工单
 * @param {String} schemaId
 * @return {*}
 */
export function queryPmTask(schemaId) {
  const url = `edesign/constructionTask/${schemaId}/queryPmTask/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询子工程所有的Splice工单
 * @param {String} schemaId
 * @return {*}
 */
export function querySpliceTask(param) {
  const url = 'edesign/constructionTask/querySpliceTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询子工程所有的Publish工单
 * @param {String} schemaId
 * @return {*}
 */
export function queryPublishTask(param) {
  const url = 'edesign/constructionTask/queryPublishTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //统计子工程同步资源详情
 * @param {String} schemaId
 * @return {*}
 */
export function queryPublishStatisticsRes(param, schemaId) {
  const url = `edesign/constructionTask/${schemaId}/statisticsRes/v1`;
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询publish单的splice列表
 * @param {String} schemaId
 * @return {*}
 */
export function querySyncTask(param) {
  const url = 'edesign/constructionTask/querySyncTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

export function addSurface(projectId, param) {
  const url = `edesign/surveyTask/add/surface/${projectId}/v1`;
  return fish.post({
    url,
    data: param,
    showError: false,
    success: restSuccess,
    error: restError(url),
  });
}
export function getSurfaceTaskList(schemaId) {
  const url = `edesign/surveyTask/${schemaId}/queryTask/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryRestypeList(projectId, params) {
  const url = `edesign/project/res/restype/${projectId}/v1`;
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryResourceData(projectId, params) {
  const url = `edesign/project/res/list/${projectId}/v1`;
  return fish.get({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
export function closeSurfaceExcel(params) {
  const url = `edesign/surveyTask/close/surfaceExcel/v1?orderId=${params.orderId}`;
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
export function getProResourceList(params) {
  const url = `edesign/project/res/list/${params.projectId}/${params.orderId}/v1?resType=${params.resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 能力模版查询列表
export function getHldtemplateList(params) {
  const url = 'edesign/hldtemplate/list/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 根据ResType查询能力模版列表
export function getDesignHldtemplateList(resType) {
  const url = `edesign/designschema/config/hldtemplate/v1?resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 根据ResType查询选型列表
export function getDesignModelList(resType) {
  const url = `edesign/designschema/config/modelList/v1?resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询已选择的能力模版列表
export function getSelectedEleList(projectSchemaId) {
  const url = `edesign/designschema/config/designelement/v1?projectSchemaId=${projectSchemaId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询能力模版属性列表
export function getHldAttrList(projectSchemaId, hldTemplateId) {
  const url = `edesign/designschema/config/hldtemplateattrs/v1?projectSchemaId=${projectSchemaId}&hldTemplateId=${hldTemplateId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 基于工程查询所有资源类型
export function getSchemaResTypeList(sprintId) {
  const url = `edesign/schema/restyperela/list/${sprintId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 保存能力模版
export function saveSprintHldTemplate(params) {
  const url = 'edesign/hldtemplate/addSprintHldTemplate/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 保存选择资源类型
export function saveTreeSelected(params) {
  const url = 'edesign/schema/restyperela/schemarestypelist/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 获取查询能力、资源模版关系
export function getModelTemplateList(params) {
  const url = `edesign/hld/tempTempRelas/${params.sprintId}/${params.hldTemplateId}/v1?resType=${params.resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 保存能力、资源模版关系
export function saveModelSelected(params) {
  const url = `edesign/hld/tempTempRelas/${params.sprintId}/${params.hldTemplateId}/v1`;
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 保存方案
export function saveDesignScheme(params) {
  const url = 'edesign/designSchema/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询方案
export function getDesignScheme(sprintId) {
  const url = `edesign/designSchema/v1?sprintId=${sprintId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 加载方案
export function loadDesignScheme(projectSchemaId, sprintId) {
  const url = `edesign/designSchema/${projectSchemaId}/v1?sprintId=${sprintId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 获取批量能力模版的可选资源模版列表
export function getHldToTemList(sprintId, params) {
  const url = `edesign/hld/tempTempRelas/${sprintId}/v1`;
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

// 批量选型保存选择的资源模版
export function updateIsDefultHld(params) {
  const url = 'edesign/hld/sprintTempRela/v1';
  return fish.patch({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 添加工程文件
export function prjdocsAdd(params) {
  const url = 'im/project/prjdocs/v1';
  return fish.postBasic({
    url,
    showMask: true,
    processData: false,
    contentType: false,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}

// 保存默认地图设置
export function mapDefSetting(params) {
  const url = 'edesign/sprint/settings/v1';
  return fish.post({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询默认地图设置
export function getMapDefSetting(sprintId) {
  const url = `edesign/sprint/settings/${sprintId}/BASE_MAP/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询可工勘的
export function checkSurface(projectId, data) {
  const url = `edesign/surveyTask/check/surface/${projectId}/v1`;
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
export function saveHldBom(data) {
  const url = 'edesign/bom/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
export function getEdsignConfig() {
  const url = 'gis-plat/open-api/config/app/edesign/config';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function querySchemeFoldList() {
  const url = 'edesign/designschema/fold/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function queryDesignrules(projectSchemaId) {
  const url = `edesign/designschema/config/designrules/v1?projectSchemaId=${projectSchemaId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryBenchModellist(benchTemplateId) {
  const url = `edesign/designschema/config/benchtemplate/modellist/v1?benchTemplateId=${benchTemplateId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryResourcelist(taskId) {
  const url = `edesign/resource/query/resourcelist/${taskId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 根据任务单ID查询版本列表
 * @param {*} parentTaskId：schemaId  currentFlag true则查询详情 false查询列表
 * @return {*} promise
 */
export function queryVersion(param) {
  const url = 'edesign/project/task/version/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询版本所有bom信息
 * @param {*} [schemaId ]
 * @return {*} promise
 */
export function queryBomList(param) {
  const url = 'edesign/bom/tasklist/count/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: 查询版本所有bom信息
 * @param {String} suppType":"M", "taskIdList":
 * @return {*}
 */

export function qrySuppliecBom(param) {
  const url = 'edesign/bom/selectSuppliecBom/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询施工方案列表
export function queryConstructList() {
  const url = 'edesign/construct/config/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工方案详情
export function queryConstructDetail(constSchemeId) {
  const url = `edesign/construct/config/detail/v1?constSchemeId=${constSchemeId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询方案变量列表
export function queryResattrList(resType) {
  const url = `edesign/construct/config/resattr/v1?resType=${resType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryConstitemList(constSchemeId) {
  const url = `edesign/construct/config/constitem/list/v1?constSchemeId=${constSchemeId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询施工项已配置物料规格id清单
 * @param {String} itemSpecId
 * @return {*}
 */
export function getSuppIdsUsedById(param) {
  const url = 'edesign/config/constitemsupp/getSuppIdsUsed';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询施工项物料配置
 * @param {String} itemSpecId
 * @return {*}
 */
export function qryMaterialList(param) {
  const url = 'edesign/config/constitemsupp/list';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询物料规格列表
 * @param {String} itemSpecId
 * @return {*}
 */
export function qrySupplieslist(param) {
  const url = 'edesign/config/constitemsupp/supplieslist';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询任务单图片
export function queryPhotoList(taskId) {
  const url = `edesign/task/common/photo/list/v1?taskId=${taskId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询路由链的任务单
 * @param {String} schemaId
 * @return {*}
 */

export function qryDeviceTask(param) {
  const url = 'edesign/constructionTask/devicetask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

export function queryComplexsupp(itemSpecId) {
  const url = `edesign/construct/config/complexsupp/list/v1?itemSpecId=${itemSpecId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询设计方案下的施工方案
export function queryCesignschemaConstscheme(projectSchemaId) {
  const url = `edesign/designschema/config/constscheme/list/v1?projectSchemaId=${projectSchemaId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询工程下的施工方案
export function queryProjectConstscheme(sprintId) {
  const url = `edesign/design/preparation/const/${sprintId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询资源列表
 * @param {String} projectSchemaId
 * @return {*}
 */
export function getRestypelistBySchema(projectSchemaId) {
  const url = `edesign/projectschema/kml/${projectSchemaId}/restypelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询KML的任务单结构
 * @param {String} schemaId
 * @return {*}
 */
export function getStructurelist(schemaId) {
  const url = `edesign/schema/kml/${schemaId}/structurelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询KML的任务单结构
 * @param {String} projectSchemaId
 * @return {*}
 */
export function getStructurelistBySchema(projectSchemaId) {
  const url = `edesign/projectschema/kml/${projectSchemaId}/structurelist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询属性映射列表
 * @param {String} projectSchemaId
 * @return {*}
 */
export function getAttrmappinglist(projectSchemaId) {
  const url = `edesign/projectschema/kml/${projectSchemaId}/attrmappinglist/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询节点的properties
 * @return {*}
 */

export function getAllexportattrs() {
  const url = 'edesign/gis/config/restype/allexportattrs/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询KML的任务单默认配置
 * @return {*}
 */

export function getDefaultStructure() {
  const url = 'edesign/schema/kml/default/structure/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询KML的任务单默认配置
 * @return {*}
 */
export function getAllDefaultAttrmappings() {
  const url = 'edesign/gis/config/restype/alldefaultattrmappings/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询施工方案分类列表
export function queryConstructCate() {
  const url = 'edesign/construct/config/constcat/list/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工方案与任务类型关系-列表
export function queryTasktypelefttree() {
  const url = 'edesign/tasktype/const/lefttree/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工方案与任务类型关系-可选列表
export function queryTasktypeDatasource() {
  const url = 'edesign/tasktype/const/datasource/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工方案与任务类型关系-已配置
export function queryTasktypeSetting(taskType) {
  const url = `edesign/tasktype/const/${taskType}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// featureAttr查询资源树
export function qryPlanResType() {
  const url = 'edesign/feature/manager/allResType/v1';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询build和blow单
export function qryBuildTask(param) {
  const url = 'edesign/constructionTask/res/buildtask/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询splice和OTDR单
export function qrySplicetask(param) {
  const url = 'edesign/constructionTask/res/splicetask/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
