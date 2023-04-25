/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-08-18 15:19:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\base\utils\util.js
 */

import { isObject } from '@/oss_core/base/utils/types';

// const objHasOwnProperty = Object.prototype.hasOwnProperty;

export function merge(dest = [], origin) {
  const merged = [];
  origin.forEach(item => {
    let mergeItem = item;
    for (let i = 0; i < dest.length; i += 1) {
      const destItem = dest[i];
      if (destItem.id === item.id) {
        mergeItem = Object.assign({}, item, destItem);
        dest.splice(i, 1);
        break;
      }
    }
    merged.push(mergeItem);
  });
  return merged.concat(dest);
}

// export function abstract() {
//   return (function() {
//     throw new Error('Unimplemented abstract method.');
//   })();
// }

// 字符串保留小数点后几位
export function strTofix(value, num) {
  if (value && num) {
    const index = value.indexOf('.');
    return value.substring(0, num + index + 1);
  }
  return '';
}

// 数组去重公有方法(不支持多维数组，单独处理)
export function removeRepeatDataForList(arrayList, repeatKey) {
  let resultArray = [];
  if (arrayList && arrayList.length > 0) {
    const isObjectA = isObject(arrayList[0]);
    if (isObjectA) {
      const ids = [];
      arrayList.forEach(arr => {
        if (ids.indexOf(arr[repeatKey]) === -1) {
          ids.push(arr[repeatKey]);
          resultArray.push(arr);
        }
      });
    } else if (typeof arrayList[0] === 'string') {
      const ids = [];
      arrayList.forEach(arr => {
        if (ids.indexOf(arr) === -1) {
          ids.push(arr);
          resultArray.push(arr);
        }
      });
    }
  } else {
    resultArray = arrayList;
  }
  return resultArray;
}

export function formatDateTime(date) {
  const y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? `0${m}` : m;
  let d = date.getDate();
  d = d < 10 ? `0${d}` : d;
  let h = date.getHours();
  h = h < 10 ? `0${h}` : h;
  let minute = date.getMinutes();
  minute = minute < 10 ? `0${minute}` : minute;
  let second = date.getSeconds();
  second = second < 10 ? `0${second}` : second;
  return `${y}-${m}-${d}-${h}-${minute}-${second}`;
}

// 下划线转驼峰方法
// export function toHump(name) {
//   return name.replace(/\_(\w)/g, function(all, letter) {
//     return letter.toUpperCase();
//   });
// }

export function isLine(resType) {
  return ['F_CABLE', 'C_CABLE', 'PIPELINE_G', 'PIPELINE_B', 'AIR_WIRE', 'DITCH', 'JUMP'].indexOf(resType) > -1;
}

export function isPipelineNetwork(resType) {
  return ['BUILDING', 'MANHOLE', 'POLE', 'PIPELINE_G', 'PIPELINE_B', 'AIR_WIRE'].indexOf(resType) > -1;
}

export function isHardware(resType) {
  return ['SHELF', 'MOD_SPLICE', 'MOD_SPLT', 'CHASSIS', 'CARD', 'PANEL'].indexOf(resType) > -1;
}

export function isCard(resType) {
  return ['FAN_CARD', 'FUNC_CARD', 'PWR_CARD'].indexOf(resType) > -1;
}

export function isPanel(resType) {
  return ['MOD_SPLICE', 'MOD_SPLT', 'PANEL'].indexOf(resType) > -1;
}

/**
 * @description: 排序 设施-设备-设施段-光缆,铜缆 这个顺序
 * @param {*} resList 资源数组
 * @return {*} 无
 */
export function sortByResType(resList) {
  if (resList.length > 1) {
    resList.forEach(res => {
      if (res.resType === 'MANHOLE' || res.resType === 'POLE') {
        res.order = 2;
      } else if (
        res.resType === 'ODF' ||
        res.resType === 'OCC' ||
        res.resType === 'ODB' ||
        res.resType === 'F_CLOSURE' ||
        res.resType === 'SPLITTER' ||
        res.resType === 'OLT' ||
        res.resType === 'ONU' ||
        res.resType === 'MDF' ||
        res.resType === 'DB' ||
        res.resType === 'CC'
      ) {
        res.order = 3;
      } else if (res.resType === 'PIPELINE_B' || res.resType === 'PIPELINE_G' || res.resType === 'AIR_WIRE') {
        res.order = 4;
      } else if (res.resType === 'F_CABLE') {
        res.order = 5;
      } else if (res.resType === 'C_CABLE') {
        res.order = 6;
      } else {
        res.order = 7;
      }
    });
    resList.sort((a, b) => a.order - b.order);
  }
}

// 饿了么方法
// function extend(to, _from) {
//   for (let key in _from) {
//     to[key] = _from[key];
//   }
//   return to;
// }

// export function toObject(arr) {
//   const res = {};
//   for (let i = 0; i < arr.length; i += 1) {
//     if (arr[i]) {
//       extend(res, arr[i]);
//     }
//   }
//   return res;
// }

// export const getValueByPath = function(object, prop) {
//   prop = prop || '';
//   const paths = prop.split('.');
//   let current = object;
//   let result = null;
//   for (let i = 0, j = paths.length; i < j; i++) {
//     const path = paths[i];
//     if (!current) break;

//     if (i === j - 1) {
//       result = current[path];
//       break;
//     }
//     current = current[path];
//   }
//   return result;
// };

// export function getPropByPath(obj, path, strict) {
//   let tempObj = obj;
//   path = path.replace(/\[(\w+)\]/g, '.$1');
//   path = path.replace(/^\./, '');

//   let keyArr = path.split('.');
//   let i = 0;
//   for (let len = keyArr.length; i < len - 1; ++i) {
//     if (!tempObj && !strict) break;
//     let key = keyArr[i];
//     if (key in tempObj) {
//       tempObj = tempObj[key];
//     } else {
//       if (strict) {
//         throw new Error('please transfer a valid prop path to form item!');
//       }
//       break;
//     }
//   }
//   return {
//     o: tempObj,
//     k: keyArr[i],
//     v: tempObj ? tempObj[keyArr[i]] : null,
//   };
// }

// export const generateId = function() {
//   return Math.floor(Math.random() * 10000);
// };

// export const valueEquals = (a, b) => {
//   // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
//   if (a === b) return true;
//   if (!(a instanceof Array)) return false;
//   if (!(b instanceof Array)) return false;
//   if (a.length !== b.length) return false;
//   for (let i = 0; i !== a.length; ++i) {
//     if (a[i] !== b[i]) return false;
//   }
//   return true;
// };

// export const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

// TODO: use native Array.find, Array.findIndex when IE support is dropped
// export const arrayFindIndex = function(arr, pred) {
//   for (let i = 0; i !== arr.length; ++i) {
//     if (pred(arr[i])) {
//       return i;
//     }
//   }
//   return -1;
// };

// export const arrayFind = function(arr, pred) {
//   const idx = arrayFindIndex(arr, pred);
//   return idx !== -1 ? arr[idx] : undefined;
// };

// // coerce truthy value to array
// export const coerceTruthyValueToArray = function(val) {
//   if (Array.isArray(val)) {
//     return val;
//   } else if (val) {
//     return [val];
//   } else {
//     return [];
//   }
// };

// export const isIE = function() {
//   return !Vue.prototype.$isServer && !isNaN(Number(document.documentMode));
// };

// export const isEdge = function() {
//   return !Vue.prototype.$isServer && navigator.userAgent.indexOf('Edge') > -1;
// };

// export const isFirefox = function() {
//   return !Vue.prototype.$isServer && !!window.navigator.userAgent.match(/firefox/i);
// };

// export const autoprefixer = function(style) {
//   if (typeof style !== 'object') return style;
//   const rules = ['transform', 'transition', 'animation'];
//   const prefixes = ['ms-', 'webkit-'];
//   rules.forEach(rule => {
//     const value = style[rule];
//     if (rule && value) {
//       prefixes.forEach(prefix => {
//         style[prefix + rule] = value;
//       });
//     }
//   });
//   return style;
// };

// export const kebabCase = function(str) {
//   const hyphenateRE = /([^-])([A-Z])/g;
//   return str
//     .replace(hyphenateRE, '$1-$2')
//     .replace(hyphenateRE, '$1-$2')
//     .toLowerCase();
// };

// export const capitalize = function(str) {
//   if (!isString(str)) return str;
//   return str.charAt(0).toUpperCase() + str.slice(1);
// };

// export const looseEqual = function(a, b) {
//   const isObjectA = isObject(a);
//   const isObjectB = isObject(b);
//   if (isObjectA && isObjectB) {
//     return JSON.stringify(a) === JSON.stringify(b);
//   } else if (!isObjectA && !isObjectB) {
//     return String(a) === String(b);
//   } else {
//     return false;
//   }
// };

// export const arrayEquals = function(arrayA, arrayB) {
//   arrayA = arrayA || [];
//   arrayB = arrayB || [];

//   if (arrayA.length !== arrayB.length) {
//     return false;
//   }

//   for (let i = 0; i < arrayA.length; i++) {
//     if (!looseEqual(arrayA[i], arrayB[i])) {
//       return false;
//     }
//   }

//   return true;
// };

// export const isEqual = function(value1, value2) {
//   if (Array.isArray(value1) && Array.isArray(value2)) {
//     return arrayEquals(value1, value2);
//   }
//   return looseEqual(value1, value2);
// };

// export const isEmpty = function(val) {
//   // null or undefined
//   if (val == null) return true;

//   if (typeof val === 'boolean') return false;

//   if (typeof val === 'number') return !val;

//   if (val instanceof Error) return val.message === '';

//   switch (Object.prototype.toString.call(val)) {
//     // String or Array
//     case '[object String]':
//     case '[object Array]':
//       return !val.length;

//     // Map or Set or File
//     case '[object File]':
//     case '[object Map]':
//     case '[object Set]': {
//       return !val.size;
//     }
//     // Plain Object
//     case '[object Object]': {
//       return !Object.keys(val).length;
//     }
//   }

//   return false;
// };

// export function rafThrottle(fn) {
//   let locked = false;
//   return function(...args) {
//     if (locked) return;
//     locked = true;
//     window.requestAnimationFrame(_ => {
//       fn.apply(this, args);
//       locked = false;
//     });
//   };
// }

// export function objToArray(obj) {
//   if (Array.isArray(obj)) {
//     return obj;
//   }
//   return isEmpty(obj) ? [] : [obj];
// }
export function strReplace(str) {
  const newstr = str.replace(/([A-Z])/g, '_$1');
  return newstr.toUpperCase();
}
// 对象key驼峰转下划线大写
export function ObjectKeys2UpperCase(obj) {
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    newObj[strReplace(key)] = value;
  });
  return newObj;
}

// 字符串截取
export function splitStr(longStr, shortStr, arr) {
  const index = longStr.toUpperCase().indexOf(shortStr.toUpperCase());
  if (index > -1) {
    if (longStr.substring(0, index)) {
      arr.push(longStr.substring(0, index));
    }
    arr.push(longStr.substring(index, index + shortStr.length));
    if (longStr.substring(index + shortStr.length)) {
      this.splitStr(longStr.substring(index + shortStr.length), shortStr, arr);
    }
  } else {
    arr.push(longStr);
  }
}

// attr校验
export function checkAttr(attrVal, attrDTOS) {
  let result = true;
  const attrName = attrDTOS.attrDesc;
  const { dataType, precision, maxVal, minVal } = attrDTOS;
  const len = attrDTOS.dataLen;
  // 判断整数
  if (dataType === 'I' && attrVal % 1 !== 0) {
    window.fish.toast('warn', `The ${attrName} must be an integer!`);
    result = false;
  }

  // 判断数字
  if (dataType === 'N' && Number.isNaN(attrVal)) {
    window.fish.toast('warn', `The ${attrName} must be an numbers!`);
    result = false;
  }

  if (dataType === 'S' && len && attrVal.length > parseInt(len, 10)) {
    window.fish.toast('warn', `The ${attrName} length can't longer than ${len} !`);
    result = false;
  }
  if (dataType === 'N' && precision) {
    const newAttrVal = attrVal.replace(/[-]/g, '');
    const decimal = newAttrVal.split('.')[1] || '';
    const { length } = decimal;
    if (length > parseInt(precision, 10)) {
      window.fish.toast('warn', `The ${attrName} decimal can't longer than ${precision} !`);
      result = false;
    }
  }
  if (dataType === 'N' && len) {
    const newAttrVal = attrVal.replace(/[-]/g, '');
    const integer = newAttrVal.split('.')[0];
    const decimal = newAttrVal.split('.')[1] || '';
    const length = integer.length + decimal.length;
    if (length > parseInt(len, 10)) {
      window.fish.toast('warn', `The ${attrName} length can't longer than ${len} !`);
      result = false;
    }
  }
  if (dataType === 'I' || dataType === 'N') {
    if (minVal && parseFloat(attrVal) < parseFloat(minVal)) {
      window.fish.toast('warn', `The ${attrName} can't less than ${minVal} !`);
      result = false;
    }

    if (maxVal && parseFloat(attrVal) > parseFloat(maxVal)) {
      window.fish.toast('warn', `The ${attrName} can't greater than ${maxVal} !`);
      result = false;
    }
  }
  return result;
}
