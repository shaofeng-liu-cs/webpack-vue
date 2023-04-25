import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function queryMarkstyleList(applyType) {
  const url = `edesign/markstyle/config/v1?applyType=${applyType}`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryMarkstyleIcons() {
  const url = 'edesign/markstyle/config/markicon/v1?moduleName=edn/markicon';
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
