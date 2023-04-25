import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //新增PM工单
 * @param {String} schemaId
 * @return {*}
 */

export function addPmTask(param) {
  const url = 'edesign/constructionTask/addPmTask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 新增目录
export function addFold(param) {
  const url = 'edesign/designschema/fold/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
// 新增方案
export function addDesignSchema(param) {
  const url = 'edesign/designschema/config/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //zip文件导入
 * @param {String} schemaId
 * @return {*}
 */
export function addZip(param) {
  const url = 'edesign/hld/import/hldFile';
  return fish.postBasic({
    url,
    showMask: true,
    processData: false,
    contentType: false,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //kml文件导入
 * @param {String} schemaId
 * @return {*}
 */
export function addKmlFile(param) {
  const url = 'edesign/kml/analysis/v1';
  return fish.postBasic({
    url,
    showMask: true,
    processData: false,
    contentType: false,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //zip文件导入
 * @return {*}
 */
export function addZipFile(param) {
  const url = 'gis-plat/open-api/file-processing/analysis-shapefile/3857';
  return fish.postBasic({
    url,
    showMask: true,
    processData: false,
    contentType: false,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //任务单版本生产
 * @param {String}parentTaskId: schemaId , createMode: 1--file 2--interface 3--manul
 * @return {*}
 */
export function addVersion(param) {
  const url = 'im/project/task/version/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 新增施工方案
export function addConstruct(param) {
  const url = 'edesign/construct/config/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 新增施工项
export function addConstitem(param) {
  const url = 'edesign/construct/config/constitem/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增物料配置
 * @param {String} itemSpecId
 * @return {*}
 */
export function addMaterialConfig(param) {
  const url = 'edesign/config/constitemsupp/add';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //新增物料配置-新
 * @return {*}
 */
export function saveMaterialConfig(param) {
  const url = 'edesign/config/constitemsupp/save';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

// 设计方案下配置施工方案
export function addDesignschemaConstscheme(param) {
  const url = 'edesign/designschema/config/constscheme/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //保存kml结构
 * @param {String} projectSchemaId
 * @return {*}
 */
export function addKMLStructure(param) {
  const url = 'edesign/projectschema/kml/structure/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //保存属性映射
 * @param {String} projectSchemaId
 * @return {*}
 */
export function addAttrmappinglist(param, projectSchemaId) {
  const url = `edesign/projectschema/kml/${projectSchemaId}/attrmappinglist/v1`;
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
