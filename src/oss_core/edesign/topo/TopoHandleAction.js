/** success,
 * @description: 根据资源类型查询信息；
 * @param {*}  resId:资源ID，resSpecId:资源类型
 * @return {*} promise
 */

const { fish } = window;
export function queryResInfo(resSpecId, resId, success, error) {
  return fish.get({
    url: `edesign/resource/query/resourceinfo/v1?resType=${resSpecId}&resId=${resId}`,
    data: null,
    success,
    error,
  });
}

/**
 * @description: 根据资源类型查询信息；
 * @param {*}  resId:资源ID，resSpecId:资源类型
 * @return {*} promise
 */
export function autoLink(resId, schemaId, success, error) {
  return fish.post({
    url: `edesign/auto/connect/from/olt/v1?resId=${resId}&schemaId=${schemaId}`,
    // data: { resId, schemaId },
    showError: false,
    success,
    error,
  });
}

/**
 * @description: 内部设计根据资源类型查询信息；
 * @param {*}  resId:资源ID，resType:资源类型，schemaId
 * @return {*} promise
 */
export function queryDesignResInfo(params, success, error) {
  return fish.get({
    url: 'edesign/resource/query/topodesign/resinfo/v1',
    data: params,
    success,
    error,
  });
}

/**
 * @description: 设备内部删除硬件
 * @param {*} params hardwareId:硬件ID，resType:资源类型
 *      [{resType:'',resId:''}...]
 * @return {*} promise
 */
export function deleteHardware(params, success, error) {
  return fish.remove({
    url: `edesign/hardware/info/top/v1?hardwareId=${params.hardwareId}&resType=${params.resSpecId}&schemaId=${params.schemaId}`,
    data: params,
    success,
    error,
  });
}

/**
 * @description: 批量删除资源
 * @param {*} paramList 数组，resId:资源ID，resType:资源类型
 *      [{resType:'',resId:''}...]
 * @return {*} promise
 */
export function deleteResInfo(paramList, success, error) {
  return fish.delete({
    url: 'edesign/rivt/batch/resource/v1',
    data: paramList,
    success,
    error,
  });
}

/**
 * @description:  修改光缆AZ端
 * @param {*} param
 *  endFlag: A/Z
 *  resType:设备类型
 *  resId：设备ID
 *  cableId：光缆ID
 *  schemaId:schemaId
 * @return {*} success
 * @return {*} error
 */
export function bindCableToDevice(param, success, error) {
  return fish.put({
    url: 'edesign/rivt/cable/rebindAOrZEnd/v1',
    data: param,
    success,
    error,
  });
}

/**
 * 解除光缆AZ端
 * @param {*} param
 * endFlag: A/Z
 * resType:设备类型
 * resId：设备ID
 * cableId：光缆ID
 * schemaId:schemaId
 * @param {*} success
 * @param {*} error
 */
export function rebindCableToDevice(param, success, error) {
  return fish.put({
    url: 'edesign/rivt/cable/unbindAOrZEnd/v1',
    data: param,
    success,
    error,
  });
}

/**
 * 修改设备机房
 * @param {*} param
 * @param {*} success
 * @param {*} error
 */
export function rebindDeviceToRoom(param, success, error) {
  return fish.put({
    url: 'edesign/rivt/device/device/v1',
    data: param,
    success,
    error,
  });
}

/**
 * @description: 查询Topo模板数据
 * @param {*} templateId:模板ID，resType资源类型
 * @return {*} promise
 */
export function loadTemplateInfo(resType, templateId, success, error) {
  const datas = {
    templateId,
  };
  let url = '';
  if (resType === 'F_CABLE') {
    url = 'edesign/template/query/cabletemplate/v1';
  } else if (resType === 'PIPELINE_G') {
    url = 'edesign/template/query/pipelinetemplate/v1';
  } else if (resType === 'MANHOLE') {
    url = 'edesign/template/query/manholetemplate/v1';
  } else if (resType === 'POLE') {
    url = 'edesign/template/query/poletemplate/v1';
  } else if (resType === 'DEVICE') {
    url = 'edesign/template/query/devtemplate/v1';
  }
  return fish.get({
    url,
    data: datas,
    success,
    error,
  });
}

/**
 * @description: 查询站点机房
 * @param {*} siteId :站点ID
 * @return {*} promise
 */
export function loadSiteRoom(param, success, error) {
  return fish.get({
    url: `edesign/rivt/place/query/sitetree/v1/${param.siteId}`,
    data: param,
    success,
    error,
  });
}

/**
 * @description: 根据规则查询可穿光缆管孔
 * @param {*} param
 * cableId  ：光缆ID
 * selectedRule：穿缆的规则
 *  1：Pipe hole with low occupancy first;
 *  2：Pipe hole with smaller number first;
 *  3：Pipe hole with larger number first;
 * pipelineIds ：["管道段Id1","管道段Id2"...]
 *
 * @param {*} success
 * @param {*} error
 */
export function loadAutoCableThreading(param, success, error) {
  return fish.post({
    url: 'edesign/cable/cross/autoselectpipeline/v1',
    data: param,
    success,
    error,
  });
}

/**
 *
 * @param {*} param
 * @param {*} success
 * @param {*} error
 */
export function saveCrossCable(param, success, error) {
  return fish.post({
    url: 'edesign/cable/cross/crossCable/v1',
    data: param,
    success,
    error,
  });
}

/**
 * @description: 查询光缆信息
 * @param {*} cableId
 * @param {*} success
 * @param {*} error
 */
export function loadCableTopoInfo(param, cableId, success, error) {
  return fish.get({
    url: `edesign/cable/query/${cableId}/topo/v1`,
    data: param,
    success,
    error,
  });
}

/**
 * @description: 查询管道组内光缆信息；
 * @param {*} params
 * ["管道段Id1","管道段Id2"...]
 * @param {*} success
 * @param {*} error
 */
export function loadCableByPipeline(params, success, error) {
  return fish.post({
    url: 'edesign/rivt/facilitysection/query/cablebypipelineids/v1',
    data: params,
    success,
    error,
  });
}

/**
 * @description: 查询管道组占有率；
 * @param {*} params
 * ["管道段Id1","管道段Id2"...]
 * @param {*} success
 * @param {*} error
 */
export function loadPipelineRate(params, success, error) {
  return fish.post({
    url: 'edesign/rivt/facilitysection/query/facilitybypipelineids/v1',
    data: params,
    success,
    error,
  });
}

export function getSprintSetting(params, success, error) {
  return fish.get({
    url: `edesign/sprint/settings/${params.sprintId}/${params.paramNo}/v1`,
    data: params,
    success,
    error,
  });
}

/**
 * @description: 查询管道组、管道块、管道孔;
 * @param {*} params
 * ["管道段Id1","管道段Id2"...]
 * @param {*} success
 * @param {*} error
 */
export function loadPipelineData(params, success, error) {
  return fish.post({
    url: 'edesign/rivt/facilitysection/query/pipelinebyids/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 从管道孔移出缆线
 * @param {*} params
 * [{
        "holeId": "",管孔id
        "cableId": "",光缆id
    }]
 * @param {*} success
 * @param {*} error
 * @returns
 */
export function removeCableInPipeline(params, success, error) {
  return fish.remove({
    url: 'edesign/rivt/facilitysection/innercable/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 查询建筑物结构
 * @param {*} params
 *  buildingId:
 * @param {*} success
 * @param {*} error
 */
export function loadStructure(params, success, error) {
  return fish.get({
    url: 'edesign/rivt/building/info/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 查询掏接Topo
 * @param {*} params
 * {schemaId:任务单ID,
 * resId：光缆ID,
 * resType:资源类型}
 * @param {*} success
 * @param {*} error
 */
export function loadCutCable(params, success, error) {
  return fish.get({
    url: `edesign/topo/cabletopo/v1?schemaId=${params.schemaId}&resId=${params.resId}&resType=${params.resType}`,
    data: null,
    success,
    error,
  });
}

/**
 * 查询管道子管的分歧点路由
 * @param params
 * @param success
 * @param error
 * @returns {*}
 */
export function loadPipeLineRoute(params, success, error) {
  return fish.get({
    url: `edesign/topo/pipeLinetopo/v1?schemaId=${params.schemaId}&resId=${params.resId}&resType=${params.resType}`,
    data: null,
    success,
    error,
  });
}

/**
 * 查询同一建筑物下的其他设备
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadBuildingDevice(params, success, error) {
  return fish.get({
    url: `edesign/rivt/building/devlistbydev/v1?deviceId=${params.resId}&resType=${params.resType}&cableId=${params.cableId}`,
    data: null,
    success,
    error,
  });
}

/**
 * 查询光缆线单元
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadCableUnits(params, success, error) {
  return fish.get({
    url: `edesign/cable/unitrangebycable/v1?cableId=${params.resId}&cableSpec=${params.resType}`,
    data: null,
    success,
    error,
  });
}

/**
 * 查询资源服务状态
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadResStatue(params, success, error) {
  return fish.get({
    url: `edesign/sprint/resstate/v1?resSpecId=${params.resSpecId}&type=${params.type}&state=${params.state}`,
    data: null,
    success,
    error,
  });
}

/**
 * 增加掏接
 * @param {*} params
 * {DEVICE_ID: 设备ID,
 * CABLE_ID: 光缆ID,
 * RES_SPEC_ID: 资源类型,
 * CABLE_LIST:[{name:''},{name:''}],
 * UNIT_LIST:[{START_UNIT:'1', END_UNIT:'3'}]};
 * @param {*} success
 * @param {*} error
 */
export function addCutCable(params, success, error) {
  return fish.post({
    url: 'edesign/cable/cut/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 删除掏接点
 * @param {*} params
 * {cutPoint：设备ID,
 * aLogicCableId:'',
 * zLogicCableId:'',
 * phyCableId:''}
 * @param {*} success
 * @param {*} error
 */
export function deleteCutCable(params, success, error) {
  return fish.remove({
    url: 'edesign/cable/cut/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 新增掏接标记
 * @param params
 * @param success
 * @param error
 * @returns {*}
 */
export function addMidSpan(params, success, error) {
  return fish.post({
    url: 'edesign/cable/addMidspan/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 删除掏接标记
 * @param params
 * @param success
 * @param error
 * @returns {*}
 */
export function deleteMidSpan(params, success, error) {
  return fish.post({
    url: 'edesign/cable/cancelMidspan/v1',
    data: params,
    success,
    error,
  });
}

/**
 * 查询资源
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadSchemaResource(params, success, error) {
  return fish.get({
    url: `edesign/topo/schematopo/v1?schemaId=${params.schemaId}&type=${params.type}&mapNo=${params.mapNo}`,
    data: null,
    success,
    error,
  });
}

/**
 *
 * @param {*} params
 * @param {*} success
 * @param {*} error
 * @returns
 */

export function loadSchemaOlt(params, success, error) {
  return fish.get({
    url: `edesign/schema/${params.schemaId}/olt/v1`,
    data: null,
    success,
    error,
  });
}

/**
 * 查询端口分光器及二级分光器
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadSplitterByPort(params, schemaId, success, error) {
  return fish.post({
    url: `edesign/link/oltportroute/v1?schemaId=${schemaId}`,
    data: params,
    success,
    error,
  });
}

/**
 * 查询设备面板端口Core Assignment 展示设备连接图
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadPanelPortByDevice(params, success, error) {
  return fish.get({
    url: `edesign/device/info/querydevicepanel/v1/${params.deviceId}`,
    data: params,
    success,
    error,
  });
}

/**
 * 查询设备光缆纤芯 Core Assignment 展示设备连接图
 * @param {*} params
 * @param {*} success
 * @param {*} error
 */
export function loadTuneCoreByDevice(params, success, error) {
  return fish.get({
    url: `edesign/cable/query/cableunit/infolist/v1?deviceId=${params.resId}`,
    data: params,
    success,
    error,
  });
}

/**
 * 查询设备连接 Core Assignment 展示设备连接图
 * @param {*} params
 * @param {*} success
 * @param {*} error
 * @since wanjf 2021-09-09 修改url
 */
export function loadAllLinkByDevice(params, success, error) {
  return fish.get({
    // url: `edesign/rivt/device/query/${params.resId}/linklist/v1`,
    url: 'edesign/device/linklist/v1',
    data: params,
    success,
    error,
  });
}
