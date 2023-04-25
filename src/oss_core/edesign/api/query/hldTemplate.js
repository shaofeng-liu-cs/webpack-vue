import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function queryHldResType() {
  const url = `edesign/feature/manager/hldResType/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryHldtemplateList(data) {
  const url = `edesign/hldtemplate/list/v1`;
  return fish.post({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}
export function queryHldtemplateAttrs(resType, templateId) {
  const url = `edesign/hldtemplate/attrs/${resType}/${templateId}/v1`;
  return fish.get({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
