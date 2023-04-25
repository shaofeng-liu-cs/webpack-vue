import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

export function deleteProject(param) {
  const url = 'im/project/dropProjectManagement/v1';
  return fish.post({
    url,
    data: param,
    success: restSuccess,
    error: restError(url),
  });
}
