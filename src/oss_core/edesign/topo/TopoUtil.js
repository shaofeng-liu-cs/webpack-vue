// export default class TopoUtil {
//     listToTree = oldArr => {
//       oldArr.forEach(element => {
//         const parentId = parseInt(element.parentId, 10);
//         if (parentId !== 0) {
//           oldArr.forEach(ele => {
//             if (parseInt(ele.hardwareId, 10) === parentId) {
//               // 当内层循环的ID== 外层循环的parendId时，（说明有children），需要往该内层id里建个children并push对应的数组；
//               if (!ele.children) {
//                 ele.children = [];
//               }
//               ele.children.push(element);
//             }
//           });
//         }
//       });
//       // console.log(oldArr) //此时的数组是在原基础上补充了children;
//       const newArr = oldArr.filter(ele => parseInt(ele.parentId, 10) === 0); // 这一步是过滤，按树展开，将多余的数组剔除；
//       // console.log(oldArr)
//       return newArr;
//     };
// }

/**
 *
 * @param {*} data :数组
 * @param {*} key :关键字 默认为id
 */
export function listToTree(data, key) {
  const result = [];
  // let keyCode = "id";
  if (!Array.isArray(data)) {
    return result;
  }
  // if(key){
  //     keyCode = key;
  // }
  data.forEach(item => {
    delete item.children;
  });
  const map = {};
  if (key === 'hardwareId') {
    data.forEach(item => {
      map[item.hardwareId] = item;
    });
  } else if (key === 'unitId') {
    data.forEach(item => {
      map[item.unitId] = item;
    });
  }

  data.forEach(item => {
    const parent = map[item.parentId];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      result.push(item);
    }
  });
  return result;
}

export function createNode(dm, type, name, parent) {
  let node = null;
  if (type === 'Node') {
    node = new window.ht.Node();
  } else if (type === 'Group') {
    node = new window.ht.Group();
  }
  node.movable = true;
  if (name) {
    node.setName(name);
  }
  if (parent) {
    node.setParent(parent);
  }
  // dm.add(node);
  dm.push(node);
  return node;
}
// data = ['a','b','c'];
// index = 0
// group = [];

// export function getGroup(data, index, group) {
//   const needApply = [];
//   needApply.push(data[index]);
//   for (let i = 0; i < group.length; i += 1) {
//     if (group[i].indexOf('_') < 0) {
//       needApply.push(`${group[i]}_${data[index]}`);
//     }
//   }
//   group.push.apply(group, needApply);
//   if (index + 1 >= data.length) {
//     return group;
//   }
//   return this.getGroup(data, index + 1, group);
// }

export function saveTopoBak(schemaId, topoId, dataModel) {
  const topoData = {};
  dataModel.getDatas().each(data => {
    if (data.movable) {
      topoData[data.getAttr('resId')] = {
        x: data.getPosition().x,
        y: data.getPosition().y,
      };
    }
  });
  if (Object.keys(topoData).length !== 0) {
    window.fish.post({
      url: 'edesign/topo/data/v1',
      data: {
        schemaId,
        topoId,
        topoDataString: JSON.stringify(topoData),
      },
    });
  }
}

export function saveTopo(schemaId, topoId, dataModel) {
  return new Promise(allResove => {
    const topoData = {};
    dataModel.getDatas().each(data => {
      if (data.movable) {
        topoData[data.getAttr('resId')] = {
          x: data.getPosition().x,
          y: data.getPosition().y,
        };
      }
    });
    if (Object.keys(topoData).length !== 0) {
      window.fish.post({
        url: 'edesign/topo/data/v1',
        data: {
          schemaId,
          topoId,
          topoDataString: JSON.stringify(topoData),
        },
        success: result => {
          allResove(result);
        },
      });
    }
  });
}

export function loadTopoData(topoId) {
  return new Promise((resolve, reject) => {
    window.fish.get({
      url: `edesign/topo/data/${topoId}/v1`,
      success: result => {
        let data = {};
        if (result && result.topoDataString) {
          data = JSON.parse(result.topoDataString);
        }
        resolve(data);
      },
      error: reject,
    });
  });
}

export function getGisGraphic(resType, resIds, mapNo, schemaId) {
  return new Promise((resolve, reject) => {
    window.fish.get({
      url: 'edesign/gismap/graphic/v1',
      data: { resType, resIds, mapNo, schemaId },
      success: result => {
        if (result && result.length) {
          resolve(result[0]);
        }
        resolve(null);
      },
      error: reject,
    });
  });
}
