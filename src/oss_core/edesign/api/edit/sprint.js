import { restSuccess, restError } from '../RestResult.js';

const { fish } = window;

/**
 * @description: //更新sprintId上schemaId的信息
 * @param {*} schemaId sprintId
 * @return {*}
 */
export function editSchemaInfo(param) {
  const url = `edesign/design/preparation/designschema/${param.schemaId}/v1?sprintId=${param.sprintId}`;
  return fish.post({
    url,
    success: restSuccess,
    error: restError(url),
  });
}
