import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //查询工程类型
 * @param {*}
 * @return {*}
 */

export function qryProjectType(parentType) {
  const url = 'im/project/qryProjectTypeByParentType/v1';
  return fish.post({
    url, // 更换接口:im/project/qryProjectType/v1
    data: {
      parentType: parentType || '',
    },
    success: restSuccess,
    error: restError(url),
  });
}

export function qryProjectRegion() {
  const url = 'im/rivt/device/getDeviceCity/v1';
  return fish.post({
    url,
    data: { SERVICE_NAME: 'QIM_DEV_CITY_QUERY' },
    success: restSuccess,
    error: restError(url),
  });
}

export function queryProjectSurveyData(PROJECT_ID) {
  const url = `im/project/queryProjectSurveyData/v1?PROJECT_ID=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectConStructionData(PROJECT_ID) {
  const url = `im/project/queryProjectConStructionData/v1?PROJECT_ID=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectComPletionData(PROJECT_ID) {
  const url = `im/project/queryProjectComPletionData/v1?PROJECT_ID=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectList(data) {
  const url = 'edesign/project/list/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectType(data) {
  const url = 'im/project/qryProjectType/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectDocData(data) {
  const url = 'im/project/queryProjectDocData/v1';
  return fish.get({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询MapFlow的任务单状态
 * @param {*}
 * @return {*}
 */

export function queryMapFlowState(projectId) {
  const url = `edesign/mapflow/queryMapFlowTask/${projectId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

export function queryProjectDetail(projectId) {
  const url = `edesign/project/project/detail/v1?projectId=${projectId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryFlowList(projectType) {
  const url = `edesign/project/flow/list/v1?projectType=${projectType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryDictList(dictId) {
  const url = `edesign/link/qryDictValueList/v1?dictId=${dictId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryMapNoByProjectId(projectId) {
  const url = `edesign/project/query/mapNo/v1?projectId=${projectId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询用户信息
 * @param {*}
 * @return {*}
 */
export function queryUsers(param) {
  const url = 'edesign/project/users/v1';
  return fish.get({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryProjectTask(PROJECT_ID) {
  const url = `im/project/queryProjectTask/v1?PROJECT_ID=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}

/**
 * @description: //查询订单ext属性
 * @param {*}
 * @return {*}
 */
export function queryOrderMode(orderId) {
  const url = `edesign/project/order/ext/v1?orderId=${orderId}&attrCode=HLD_MODE`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询验收任务类型列表
export function queryTaskStatistics(projectId) {
  const url = 'edesign/acceptanceTask/resource/statistics/v1';
  return fish.post({
    url,
    data: { projectId },
    success: restSuccess,
    error: restError(url),
  });
}
// 查询任务类型
export function queryTaskComboxdata(projectId) {
  const url = 'edesign/acceptanceTask/resource/comboxdata/v1';
  return fish.post({
    url,
    data: { projectId },
    success: restSuccess,
    error: restError(url),
  });
}
// 查询任务清单列表
export function queryAcceptanceTaskTaskList(data) {
  const url = 'edesign/acceptanceTask/resource/tasklist/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询任务清单详情
export function queryAcceptanceTaskDetail(data) {
  const url = 'edesign/acceptanceTask/resource/taskaccepdetail/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}

// 查询施工进度
export function queryConsSuppliecBomByProjectId(PROJECT_ID) {
  const url = `edesign/bom/selectConsSuppliecBom/v1?projectId=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工进度概览
export function queryConstructionGrogress(PROJECT_ID) {
  const url = `edesign/bom/selectConstructionGrogress/v1?projectId=${PROJECT_ID}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询施工项明细
export function queryConsItemResList(data) {
  const url = 'edesign/bom/selectConsItemResList/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询物料明细
export function querySuppliecBom(data) {
  const url = 'edesign/bom/selectSuppliecBom/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询物料Material
export function queryMaterialBom(data) {
  const url = 'edesign/bom/count/res/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询BOM比对设计元素
export function queryBomCompare(projectId) {
  const url = `edesign/bom/project/compare/v1?projectId=${projectId}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询系统参数
export function qrySystemParamInfo(PARAM_CODE) {
  const url = 'im/comm/qrySystemParamInfo/v1';
  return fish.post({
    url,
    data: {
      PARAM_CODE,
    },
    success: restSuccess,
    error: restError(url),
  });
}

// 查询BOM比对
export function selectSuppliecBomByProject(projectId, suppType) {
  const url = `edesign/bom/selectSuppliecBomByProject/v1?projectId=${projectId}&suppType=${suppType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询已安装总量表
export function queryPrjcapability(data) {
  const url = 'edesign/acceptanceTask/resource/prjcapability/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询已工程进度表
export function queryProjectTablePro(projectId) {
  const url = `edesign/project/progress/${projectId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询材料明细表
export function queryPrjconstitemsupp(data) {
  const url = 'edesign/acceptanceTask/resource/prjconstitemsupp/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询工程验收表
export function queryPrjAccepreport(data) {
  const url = 'edesign/acceptanceTask/resource/accepreport/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
// 查询工程详情-进展情况
export function queryPrjNetworklevel(projectId) {
  const url = `edesign/bom/networklevel/${projectId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
