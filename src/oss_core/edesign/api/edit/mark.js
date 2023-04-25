import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function updateMarkstyle(param) {
  const url = 'edesign/markstyle/config/v1';
  return fish.put({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
