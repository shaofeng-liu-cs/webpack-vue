import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function addMarkstyle(data) {
  const url = 'edesign/markstyle/config/v1';
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
