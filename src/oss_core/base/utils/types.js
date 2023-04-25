/*
 * @Author: your name
 * @Date: 2021-08-18 15:19:17
 * @LastEditTime: 2021-08-18 15:19:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design-web\src\oss_core\base\utils\types.js
 */
export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isHtmlElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

export const isUndefined = val => val === undefined;

export const isDefined = val => val !== undefined && val !== null;
