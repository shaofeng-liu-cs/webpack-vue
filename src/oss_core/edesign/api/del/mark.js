import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function deleteMarkstyle(markId) {
  const url = `edesign/markstyle/config/${markId}/v1`;
  return fish.remove({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
