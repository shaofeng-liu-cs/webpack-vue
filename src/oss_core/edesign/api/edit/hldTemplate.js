import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function editGISAttributeInfo(data) {
  const url = `edesign/hldtemplate/attr/v1`;
  return fish.patch({
    url,
    data,
    success: restSuccess,
    error: restError(url),
  });
}

export function updateNewHLDTemplateInfo(params) {
  const url = 'edesign/hldtemplate/v1';
  return fish.patch({
    url,
    data: params,
    success: restSuccess,
    error: restError(url),
  });
}
