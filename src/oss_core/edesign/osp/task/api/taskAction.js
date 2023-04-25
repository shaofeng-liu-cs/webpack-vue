const { fish } = window;

// sprint流转
export function sprint2Next(sprintId) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/sprint/operator/${sprintId}/process/v1`,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 加载sprint列表数据
export function loadSprintList(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/sprint/sprintlist/v1',
      contentType: 'application/json',
      async: false, // 同步查询构造dashboard
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 加载单个sprint列表数据
export function loadSingleSprintList(sprintId) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/sprint/${sprintId}/sprintdetail/v1`,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 查询所有流程
export function queryAllSprintFlow() {
  return new Promise((resolve, reject) => {
    fish.get({
      url: 'edesign/schema/flowstatuslist/v1',
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 加载sprint下面的所有schema列表
export function loadSchemaListBySprintId(sprintId) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/schema/list/${sprintId}/schema/v1`,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 查询可以转派的用户列表
export function queryAssignUserListByFlow(flowState) {
  return new Promise((resolve, reject) => {
    fish.get({
      url: `edesign/flow/${flowState}/nextflowstatusandusers/v1`,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 获取wfs图层样式配置
export function getStyleConfig() {
  return new Promise(resolve => {
    fish.get({
      url: 'edesign/gis/config/restype/resTypeStyle/v1',
      success: data => resolve(data),
    });
  });
}

// 根据条件修改工程信息
export function updateSprintInfo(param) {
  return new Promise(resolve => {
    fish.put({
      url: 'edesign/sprint/operator/workorder/v1',
      contentType: 'application/json',
      data: param,
      success: data => resolve(data),
    });
  });
}

// 根据条件修改任务单信息
export function updateSchemaInfo(param) {
  return new Promise((resolve, reject) => {
    fish.put({
      url: 'edesign/schema/workorder/v1',
      showError: false,
      contentType: 'application/json',
      data: param,
      success: data => resolve(data),
      error: data => {
        if (data && data.responseJSON && data.responseJSON.message) {
          fish.warn(data.responseJSON.message);
        } else {
          fish.warn(this.$t('AJAX_ERROR'));
        }
        reject(data);
      },
    });
  });
}

// 转派
// export function reAssign(param) {
//     return new Promise( (resolve, reject) => {
//         fish.ajax({
//             url: "edesign/flow/reAssign/v1",
//             type: "POST",
//             contentType: 'application/json',
//             showError: false,
//             data:JSON.stringify(param),
//             success: data => resolve(data),
//             error: data => {
//                 if (data && data.responseJSON && data.responseJSON.message) {
//                     fish.warn(data.responseJSON.message);
//                 } else {
//                     fish.warn(this.$t('AJAX_ERROR'));
//                 }
//                 reject(data);
//             }
//         });
//     });
// }

// 删除任务单
export function deleteSchemaById(schemaId) {
  return new Promise(resolve => {
    fish.remove({
      url: 'edesign/schema/workorder/v1',
      contentType: 'application/json',
      data: { schemaId },
      success: data => resolve(data),
    });
  });
}

// 查询工程列表
export function queryProjectList(param) {
  return new Promise(resolve => {
    fish.post({
      url: 'edesign/project/projectlist/v1',
      contentType: 'application/json',
      async: false,
      data: param || {},
      success: data => resolve(data),
    });
  });
}

// 查询设计任务单列表
export function qryProjectTaskList(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/project/task/list/v2',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// re-Assign
export function reAssign(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'im/project/updatePrjTask/v1',
      contentType: 'application/json',
      data: param,
      success: data => resolve(data),
      error: data => {
        if (data && data.responseJSON && data.responseJSON.message) {
          fish.warn(data.responseJSON.message);
        } else {
          fish.warn(this.$t('AJAX_ERROR'));
        }
        reject(data);
      },
    });
  });
}

// 查询设计工程列表
export function qryProjectList(param) {
  return new Promise(resolve => {
    fish.post({
      url: 'edesign/project/project/list/v1',
      contentType: 'application/json',
      async: false,
      data: param || {},
      success: data => resolve(data),
    });
  });
}

// 查询子工程列表
export function qrySubProjectList(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/project/subproject/list/v1',
      contentType: 'application/json',
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 新增子工程
export function addSubProject(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/project/subproject/add/v1',
      contentType: 'application/json',
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 删除子工程
export function delSubProject(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/project/subproject/delete/v1',
      contentType: 'application/json',
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 修改子工程
export function editSubProject(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'im/project/modifySubProject/v1',
      contentType: 'application/json',
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 查询设计订单列表
export function qryProjectOrderList(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/project/order/list/v1',
      contentType: 'application/json',
      data: param || {},
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 新建设计订单
export function addProjectOrder(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'im/project/addProOrd/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 修改设计订单
export function editProjectOrder(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'im/project/modifyProOrd/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}
// 删除设计订单
export function delProjectOrder(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'im/project/cancelProOrd/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
      error: er => {
        reject(er);
      },
    });
  });
}

// 查询city列表
export function queryCityList() {
  return new Promise(resolve => {
    fish.get({
      url: 'edesign/area/query/C/regionlist/v1',
      success: data => resolve(data),
    });
  });
}

// 查询方案-sprint类型
export function queryTaskType() {
  return new Promise(resolve => {
    fish.get({
      url: 'edesign/sprint/schematypelist/v1',
      contentType: 'application/json',
      async: false,
      success: data => resolve(data),
    });
  });
}

// 查询地图列表
export function queryMapNoList(appName) {
  return new Promise(resolve => {
    fish.get({
      url: `edesign/sprint/mapTypelist/${appName}/v1`, // appName先写死为edesign
      success: data => resolve(data),
    });
  });
}

// 任务单流转
// currentState:row.flowState,
// schemaId:row.schemaId,
// acceptUserId:designTo,
// comments:comments,
export function flowToNext(param) {
  return new Promise(resolve => {
    fish.post({
      url: 'edesign/flow/flowdown/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
    });
  });
}

// 工程单流转
// "sprintId": "210325194100009825",
// "curSprintState": "I"
export function sprintFlowToNext(param) {
  return new Promise((resolve, reject) => {
    fish.post({
      url: 'edesign/sprint/operator/nextstep/v1',
      contentType: 'application/json',
      showError: false,
      data: param,
      success: data => {
        resolve(data);
      },
      error: data => {
        if (data && data.responseJSON && data.responseJSON.message) {
          fish.warn(data.responseJSON.message);
        } else {
          fish.warn(this.$t('AJAX_ERROR'));
        }
        reject(data);
      },
    });
  });
}

// 查询任务单对应类型的数量
export function queryTaskCounts(param) {
  return new Promise(resolve => {
    fish.post({
      url: 'edesign/project/task/count/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
    });
  });
}
// 查询任务单列表
export function queryTaskList(param) {
  return new Promise(resolve => {
    fish.post({
      url: 'edesign/project/task/query/v1',
      contentType: 'application/json',
      data: param,
      success: data => {
        resolve(data);
      },
    });
  });
}

// 查询任务单详情
export function getTaskDetail(taskId) {
  return new Promise(resolve => {
    fish.get({
      url: `edesign/project/task/detail/v1?taskId=${taskId}`,
      success: data => {
        resolve(data);
      },
    });
  });
}

// 查询任务单类型
export function queryTaskTypeList() {
  return new Promise(resolve => {
    fish.get({
      url: 'edesign/project/tasktype/list/v1',
      success: data => {
        resolve(data);
      },
    });
  });
}

// 查询任务单订单信息
export function queryTaskOrderInfo(orderId) {
  return new Promise(resolve => {
    fish.get({
      url: `edesign/project/order/${orderId}/v1`,
      success: data => {
        resolve(data);
      },
    });
  });
}

// 查询任务单订单信息
export function queryTaskProjectInfo(projectId) {
  return new Promise(resolve => {
    fish.get({
      url: `edesign/project/project/${projectId}/v1`,
      success: data => {
        resolve(data);
      },
    });
  });
}

// 拆分设计任务
export function splitTask(params) {
  return new Promise(resolve => {
    fish.post({
      url: 'im/project/task/split/v1',
      contentType: 'application/json',
      data: params,
      success: data => {
        resolve(data);
      },
    });
  });
}
