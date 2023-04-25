import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function deleteHLDTemplate(templateId) {
  const url = `edesign/hldtemplate/${templateId}/v1`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
