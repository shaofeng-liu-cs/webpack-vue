import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function modifyProjectManagementData(param) {
  const url = 'im/project/modify/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
export function acceptask(param) {
  const url = 'edesign/acceptanceTask/resource/acceptask/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
