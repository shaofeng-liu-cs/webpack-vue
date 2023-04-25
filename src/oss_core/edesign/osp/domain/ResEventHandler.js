import * as map from 'map';
// import BindBZ from '../../views/oss_core/edesign/map-control/clickRight/bindAZ/bindAZ.js'
import * as Color from '../design/drawStyle.js';
// import i18n from '@/oss_core/base/locale/locale.js';
// import { BLACK, blackText, polygonLine } from '@/oss_core/base/map-style/default-styles';
import { getBaseResAttr } from '@/oss_core/base/utils/ResourcesConfig.js';
import { batchDelResources } from '@/oss_core/edesign/api/del/resources.js';
// import { mapFlowIdentify } from '@/oss_core/edesign/api/add/project.js';

const pointRestypes = ['CC', 'F_CLOSURE', 'DB', 'MDF', 'CLOSURE', 'OCC', 'ODB', 'ODF', 'OLT', 'ONU', 'SITE', 'MANHOLE', 'POLE', 'A5'];
const lineLayerNos = ['F_CABLE-C', 'PIPELINE_G-C', 'AIR_WIRE-C'];
const { fish, $ } = window;
let HLDObj = null;
// 引入HLD界面的信息
export function setHLDObj(vm) {
  HLDObj = vm;
}
// 存储打断线或者合并线新增的要素的giskey
let gisKeyList = [];

export function modifyPromise(mapContainer, modified, old, moveType) {
  return () =>
    new Promise(resolve => {
      map.updateGeometryById(modified.layerNo, modified.toJSON()).then(() => {
        mapContainer.refreshLayer(modified.layerNo);
        if (moveType === 'move') {
          mapContainer.clear();
          mapContainer.setSelected([modified]);
          // vm.$parent.refreshTree();
        }
        resolve(modifyPromise(mapContainer, old, modified, moveType));
      });
    });
}

function editNodeFunction(vm, oldGra) {
  const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
  vm.$root.$emit('clickMap2RefreshLayer', oldGra.layerNo);
  vm.mapContainer.editGraphicVertices(oldGra, event => {
    const newGra = event[0];
    if (newGra && newGra.layerNo && newGra.layerNo !== 'demandBuilding') {
      map.updateGeometryById(newGra.layerNo, newGra.toJSON()).then(() => {
        // vm.mapContainer.refreshLayer(oldGra.layerNo);
        // vm.$parent.initSelectEvent(false);
        vm.mapContainer.addUndo(modifyPromise(vm.mapContainer, vm.oldGra, newGra, 'edit'), stackDepth);
        // vm.mapContainer.deactiveSelect();
        vm.mapContainer.setSelected([newGra]);
        vm.$root.$emit('changeUnDoCount', 'undo');
        vm.$root.$emit('afterEditNode');
        // let oldGeo = newGra.geometry.clone();
        // let oldGraphic = new vm.$map.Graphic(newGra.id, newGra.layerNo, oldGeo, newGra.symbol, newGra.attributes);
        // vm.oldGra = newGra;
      });
    }
    editNodeFunction(vm, newGra);
  });
}

/**
 * 编辑节点
 * mapContainer, graphic,   layerState
 * */
export function EditNode(vm) {
  const graph = vm.graphic[0];
  // let oldGeo = graph.geometry.clone();
  // let oldGra = new vm.$map.Graphic(graph.id, graph.layerNo, oldGeo, graph.symbol, graph.attributes);
  // vm.$EventBus.$emit('preventAll', true);
  vm.oldGra = vm.graphic[0];
  // 如果是临时图层demandBuilding而且是已有的建筑物编辑，将其放进编辑数组保存
  if (graph.layerNo === 'demandBuilding' && graph.attributes.gisKey) {
    // if (graph.resType === 'A0') {
    //   vm.$parent.$refs.tools.$refs.surfaceDraw.editRoadList.push(graph.id);
    // } else if (graph.resType === 'A1') {
    //   vm.$parent.$refs.tools.$refs.surfaceDraw.editBuildingList.push(graph.id);
    // }
    vm.$parent.$refs.toolbar.$refs.InitialSurvey.$refs.RemoteSurvey.editRoadList.push(graph.id);
  }
  editNodeFunction(vm, graph);
}

function checkBuildingExtend(attributes, pointGeometry) {
  return new Promise(resolve => {
    if (!attributes.buildingLayerNo && !attributes.buildingGisId) {
      resolve('ignoreCheck');
      return;
    }
    const filter = map.Filter.equalTo({ propertyName: 'gisKey', expression: attributes.buildingGisId });
    const feature = {
      layerNo: attributes.buildingLayerNo,
      filter,
    };
    map.getByFeatureLayer(feature).then(result => {
      if (result && result.length === 1) {
        // 如果是分离的（没相交），返回true，否则返回false
        const disJoinFlag = map.GeometryUtils.disJoint(result[0].geometry, pointGeometry);
        resolve(!disJoinFlag);
      }
    });
  });
}

function moveStart(vm, graph, resType) {
  vm.mapContainer.editGraphicMove(graph, event => {
    if (event.length === 0) {
      return;
    }
    let [point] = event;
    // let transferred = map.CoordTransfer.transferProjection(point.geometry.spatialReference.wkid, map.SupportSpatialReferences.WGS84, [point.geometry.x, point.geometry.y]);
    const WGSGeo = point.geometry.clone().transferProjection(map.SupportSpatialReferences.WGS84);
    const attribute = Object.assign({}, point.attributes);
    attribute.longitude = WGSGeo.x;
    attribute.latitude = WGSGeo.y;
    point = new map.Graphic(point.id, point.layerNo, point.geometry, point.symbol, attribute);
    checkBuildingExtend(attribute, point.geometry).then(extendValidFlag => {
      if (!extendValidFlag && extendValidFlag !== 'ignoreCheck') {
        fish.warn('Cannot move out of the building.');
        return;
      }
      vm.$root.$emit('resourceMoveComplete', {
        longitude: attribute.longitude.toFixed(6), // 经度
        latitude: attribute.latitude.toFixed(6), // 纬度
      });
      // let stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
      // vm.mapContainer.addUndo(modifyPromise(vm, vm.mapContainer, graph, point, 'move'), stackDepth)
      moveStart(vm, event[0], resType);
    });
  });
}

/**
 * 移动（点）
 * */
export function move(vm) {
  const [graph] = vm.graphic;
  vm.mapContainer.deactiveSelect();
  const { resType } = graph;
  moveStart(vm, graph, resType);
}

function findLineByGisKey(flag, gisKeys, mapObj, projectinfo) {
  return new Promise(resolve => {
    let filter;
    const filterIn = [];
    gisKeys.forEach(gisKey => {
      const equalFilter = mapObj.Filter.and(
        mapObj.Filter.equalTo({
          propertyName: flag,
          expression: gisKey,
          matchCase: true,
        }),
        mapObj.Filter.equalTo({
          propertyName: 'schemaId',
          expression: projectinfo.schemaId,
        }),
        mapObj.Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }),
      );
      filterIn.push(equalFilter);
    });
    if (filterIn && filterIn.length > 1) {
      filter = mapObj.Filter.or(...filterIn);
    } else if (filterIn.length === 1) {
      filter = filterIn[0];
    }
    if (filter) {
      const featureLike = [];
      lineLayerNos.forEach(layerNo => {
        featureLike.push({
          layerNo,
          filter,
        });
      });
      mapObj.getByFeatureLayers(featureLike).then(lines => {
        let countNum = 0;
        if (lines && lines.length > 0) {
          lines.forEach(res => {
            if (flag === 'aGisKey') {
              res.attributes = {
                aGisKey: '',
                aLayerNo: '',
              };
            } else {
              res.attributes = {
                zGisKey: '',
                zLayerNo: '',
              };
            }
            mapObj.editAttributeById(res.layerNo, res).then(() => {
              countNum += 1;
              if (countNum === lines.length) {
                resolve();
              }
            });
          });
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

function doDeleteAction(vm, allResove) {
  $.blockUI({ message: 'loading' }); // loading
  let promise = [];
  const resList = vm.graphic;
  let projectinfo = vm.projectInfo ? vm.projectInfo : {};
  if (typeof vm.getProjectInfo === 'function') {
    projectinfo = vm.getProjectInfo();
  }
  // if (projectinfo.grid) {
  //     let findRes = resList.find(res => res.attributes.gisKey === projectinfo.grid);
  //     if (findRes) {
  //         $.unblockUI(); //  loading
  //         fish.warn(vm.$t('RIGHT_MENU_CANNOT_DELETE'));
  //         return;
  //     }
  // }
  const delAllList = [];
  const delGisList = [];
  resList.forEach(item => {
    const singleObj = item.attributes ? item.attributes : item;
    if (singleObj.resId) {
      delAllList.push({
        // gisKey: singleObj.gisKey,
        resType: item.resType,
        resId: singleObj.resId,
        resFlag: 'BOTH',
        mapNo: projectinfo.mapNo,
        schemaId: singleObj.schemaId, // 删除资源时，需传入schemaId
        sprintId: singleObj.sprintId,
      });
    } else {
      delGisList.push(item);
    }
  });
  if (delGisList.length > 0) {
    const pointList = delGisList.filter(res => pointRestypes.indexOf(res.resType) > -1);
    promise.push(map.batchDeleteGeometry(delGisList));
    const updateAgisKeyPromise = [];
    const updateZgisKeyPromise = [];
    if (pointList && pointList.length > 0) {
      const gisKeys = pointList.map(res => res.gisKey);
      updateAgisKeyPromise.push(findLineByGisKey('aGisKey', gisKeys, map, projectinfo));
      updateZgisKeyPromise.push(findLineByGisKey('zGisKey', gisKeys, map, projectinfo));
    }

    promise = promise.concat(updateAgisKeyPromise);
    promise = promise.concat(updateZgisKeyPromise);
  }
  if (delAllList.length > 0) {
    const delDPList = delAllList.filter(res => res.resType === 'A5');
    const delValidList = delAllList.filter(res => res.resType !== 'A5');
    if (delDPList && delDPList.length > 0) {
      fish.warn('The demand points that have been selected will not be deleted.');
    }
    if (delValidList && delValidList.length > 0) {
      promise.push(batchDelResources(delValidList));
    } else {
      $.unblockUI(); //  loading
      return;
    }
  }
  Promise.all(promise).then(
    () => {
      if (HLDObj) {
        const { mapBox } = HLDObj;
        if (mapBox) {
          mapBox.refresh();
        }
      }
      allResove();
      $.unblockUI(); //  loading
    },
    () => {
      if (HLDObj) {
        const { mapBox } = HLDObj;
        if (mapBox) {
          mapBox.refresh();
        }
      }
      allResove();
      $.unblockUI(); //  loading
    },
  );
}

/**
 * 删除要素
 * */
export function deleteGraphic(vm) {
  return new Promise((allResove, allReject) => {
    const resList = vm.graphic;
    const hasResIdList = resList.filter(res => {
      const singleObj = res.attributes ? res.attributes : res;
      if (singleObj && singleObj.resId) {
        return true;
      }
      return false;
    });
    if (hasResIdList && hasResIdList.length > 0) {
      fish.confirm('Relative resources and connections will be deleted too, continue?', () => {
        doDeleteAction(vm, allResove, allReject);
      });
    } else {
      doDeleteAction(vm, allResove, allReject);
    }
  });
}

// function revertDelete(vm, grahics) {
//   return () =>
//     new Promise(resolve => {
//       const mapBox = vm.projectInfo ? vm.mapBox : vm.mapContainer;
//       const promises = [];
//       grahics.forEach(item => {
//         promises.push(
//           new Promise(childResolve => {
//             const graph = item.toJSON();
//             map.deleteGeometry(graph.layerNo, graph.attributes.gisKey).then(() => {
//               mapBox.refreshLayer(graph.layerNo);
//               childResolve();
//             });
//           }),
//         );
//       });
//       Promise.all(promises).then(() => {
//         mapBox.clear();
//         if (vm.projectInfo) {
//           vm.refreshTree();
//         } else {
//           vm.$parent.refreshTree();
//         }
//         resolve(revert(vm, grahics));
//       });
//     });
// }

// function revert(vm, grahics) {
//   return () =>
//     new Promise(resolve => {
//       const mapBox = vm.projectInfo ? vm.mapBox : vm.mapContainer;
//       const promises = [];
//       grahics.forEach(graphic => {
//         promises.push(
//           new Promise(childResolve => {
//             const graphicLike = graphic.toJSON();
//             delete graphicLike.attributes.objectid;
//             map.addGeometry(graphicLike.layerNo, graphicLike).then(res => {
//               mapBox.refreshLayer(graphicLike.layerNo);
//               childResolve(res);
//             });
//           }),
//         );
//       });
//       Promise.all(promises).then(result => {
//         mapBox.clear();
//         if (vm.projectInfo) {
//           vm.refreshTree();
//         } else {
//           vm.$parent.refreshTree();
//         }
//         resolve(revertDelete(vm, result));
//       });
//     });
// }

/**
 * 显示属性
 * */
export function showProperty(vm) {
  const [graph] = vm.graphic;
  map.getByLayerAndId(graph.layerNo, graph.attributes.gisKey).then(() => {
    // console.log(res);
  });
}

/**
 * 选型
 * */
export function selectMode() {
  // fish.toast('info', vm.$t('SAVE'));
}

/**
 * 定长布点
 * */
export function loadFormatPoint() {}

/**
 * 居中显示
 * @param {*} vm
 */
export function centerGeometry(vm) {
  const geos = vm.graphic.map(gra => gra.geometry);
  if (geos) {
    vm.mapContainer.centerGeometries(geos);
  }
}

function bindAction(graphlike, vm) {
  return new Promise(resolve => {
    map.editAttributeById(graphlike.layerNo, graphlike).then(() => {
      map.updateGeometryById(graphlike.layerNo, graphlike).then(() => {
        vm.mapContainer.refreshLayer(graphlike.layerNo);
        resolve();
      });
    });
  });
}

function bindAttrUpdate(aPoint, zPoint, graph, coordinates, promiseList, vm) {
  coordinates[0] = [aPoint.geometry.x, aPoint.geometry.y, 0];
  coordinates.push([zPoint.geometry.x, zPoint.geometry.y, 0]);
  graph.geometry.setPaths([coordinates]);
  graph.attributes = {
    aGisKey: aPoint.attributes.gisKey || '',
    zGisKey: zPoint.attributes.gisKey || '',
    aLayerNo: aPoint.layerNo || '',
    zLayerNo: zPoint.layerNo || '',
  };
  promiseList.push(bindAction(graph, vm));
}

// 判断数组元素是否属于同一个图层，只要一个和首个元素图层不同则数组属于多图层数组返回false
export function isAllEqual(array) {
  if (array.length > 0) {
    return !array.some(value => value.layerNo !== array[0].layerNo);
  }
  return true;
}

//  是否自动绑定AZ
function isAutoBindAZ(Alist, Zlist, graph, vm) {
  const { autoBind, autoBindSameLayer, autoBindMultiLayer, multiLayerExtVal } = vm.schemaConfigs;
  let selectedLayer;
  let multiLayerExtVals;
  if (multiLayerExtVal) {
    selectedLayer = multiLayerExtVal.split(':')[0];
    multiLayerExtVals = multiLayerExtVal.substring(multiLayerExtVal.indexOf(':') + 1, multiLayerExtVal.length).split(',');
  }
  const aPoint = [];
  const zPoint = [];
  let AZList = [];
  if (autoBind === 'Y') {
    if ((autoBindSameLayer === 'Y' && isAllEqual(Alist)) || Alist.length === 1) {
      aPoint.push(Alist[0]);
    }
    if ((autoBindSameLayer === 'Y' && isAllEqual(Zlist)) || Zlist.length === 1) {
      zPoint.push(Zlist[0]);
    }
    if (autoBindMultiLayer === 'Y') {
      const a = [];
      const b = [];
      const allList = vm.resourceList.concat(vm.surfaceLayerList);
      Alist.forEach(item => {
        allList.some(res => {
          if (res.layerNo === item.layerNo) {
            item.resType = res.resType;
            return true;
          }
          return false;
        });
      });
      Zlist.forEach(item => {
        allList.some(res => {
          if (res.layerNo === item.layerNo) {
            item.resType = res.resType;
            return true;
          }
          return false;
        });
      });
      if (!isAllEqual(Alist) && selectedLayer === graph.resType && multiLayerExtVals.length > 0) {
        multiLayerExtVals.forEach(item => {
          if (Alist.find(res => res.resType === item)) {
            a.push(Alist.find(res => res.resType === item));
          }
        });
      } else if (!isAllEqual(Alist)) {
        a.push(Alist[0]);
      }
      if (!isAllEqual(Zlist) && selectedLayer === graph.resType && multiLayerExtVals.length > 0) {
        multiLayerExtVals.forEach(item => {
          if (Zlist.find(res => res.resType === item)) {
            b.push(Zlist.find(res => res.resType === item));
          }
        });
      } else if (!isAllEqual(Zlist)) {
        b.push(Zlist[0]);
      }
      if (a.length > 0) aPoint.push(a[0]);
      if (b.length > 0) zPoint.push(b[0]);
    }
  }
  AZList = [aPoint, zPoint];
  return AZList;
}

/**
 * 绑定A/Z
 * */
export function bindAz(vm) {
  // 容限设为0时还是给一个很小的半径，不然查不到
  const bindTolerance = vm.schemaConfigs.bindTolerance === 0 ? 0.5 : vm.schemaConfigs.bindTolerance;
  if (vm.autoBind === undefined) {
    vm.$parent.$refs.search.hideSelect();
  }
  const graList = vm.graphic || HLDObj.chooseGraphic;
  // console.log('链接线之后做绑定操作', graList);

  if (graList && graList.length > 0) {
    const manualGraphics = [];
    const manualAListS = [];
    const manualZListS = [];
    const errorGraphics = [];
    const errorAListS = [];
    const errorZListS = [];
    const promiseList = [];
    const allGraphicList = [];
    graList.forEach(graph => {
      const [coordinates] = graph.geometry.getPaths();
      const startCoord = coordinates[0];
      const endCoord = coordinates.pop();
      const startPoint = new map.Point(startCoord[0], startCoord[1], graph.geometry.spatialReference);
      const endPoint = new map.Point(endCoord[0], endCoord[1], graph.geometry.spatialReference);
      const startCircle = new map.Circle(startPoint, bindTolerance);
      const endCircle = new map.Circle(endPoint, bindTolerance);
      const mapBox = vm.getMapBox();
      const selectableLayers = [];
      vm.mapContainer.getLayers().forEach(l => {
        if (l.selectable && l.geometryType === 'geometryPoint') {
          HLDObj.resourceList.forEach(item => {
            if (item.layerNo === l.id && item.layerType === 'C') {
              selectableLayers.push(item);
            }
          });
        }
      });
      // let Alist = vm.mapContainer.getFeatureByGeometry(startCircle, selectableLayers.layerNo);
      // let Zlist = vm.mapContainer.getFeatureByGeometry(endCircle, selectableLayers.layerNo);
      const newAGeo = mapBox.createPolygonGeometry([startCircle.getRings()]);
      const newZGeo = mapBox.createPolygonGeometry([endCircle.getRings()]);
      const filterAParam = {
        geometryName: 'geom',
        geometry: newAGeo,
        spatialReference: map.SupportSpatialReferences.WEB_MERCATOR,
      };
      let finalAFilter = map.Filter.intersects(filterAParam);
      finalAFilter = map.Filter.and(finalAFilter, map.Filter.equalTo({ propertyName: 'schemaId', expression: HLDObj.projectInfo.schemaId }));

      const filterZParam = {
        geometryName: 'geom',
        geometry: newZGeo,
        spatialReference: map.SupportSpatialReferences.WEB_MERCATOR,
      };
      let finalZFilter = map.Filter.intersects(filterZParam);
      finalZFilter = map.Filter.and(finalZFilter, map.Filter.equalTo({ propertyName: 'schemaId', expression: HLDObj.projectInfo.schemaId }));
      const featureALikes = [];
      const featureZLikes = [];
      selectableLayers.forEach(item => {
        featureALikes.push({
          layerNo: item.layerNo,
          filter: finalAFilter,
        });
        featureZLikes.push({
          layerNo: item.layerNo,
          filter: finalZFilter,
        });
      });

      let Alist;
      let Zlist;
      const singleGraphic = new Promise(resolve => {
        vm.$map.getByFeatureLayers(featureALikes).then(data => {
          Alist = data;
          vm.$map.getByFeatureLayers(featureZLikes).then(res => {
            Zlist = res;
            if (Alist.length > 1 || Zlist.length > 1) {
              const AZList = isAutoBindAZ(Alist, Zlist, graph, vm);
              if (AZList[0].length > 0 && AZList[1].length > 0) {
                bindAttrUpdate(AZList[0][0], AZList[1][0], graph, coordinates, promiseList, vm);
              } else {
                manualAListS.push(Alist);
                manualZListS.push(Zlist);
                manualGraphics.push(graph);
              }
            } else if (Alist.length === 1 && Zlist.length === 1) {
              const [[aPoint], [zPoint]] = [Alist, Zlist];
              bindAttrUpdate(aPoint, zPoint, graph, coordinates, promiseList, vm);
            } else {
              errorAListS.push([]);
              errorZListS.push([]);
              errorGraphics.push(graph);
            }
            resolve();
          });
        });
      });
      allGraphicList.push(singleGraphic);
    });
    Promise.all(allGraphicList).then(() => {
      if (manualAListS.concat(errorAListS).length > 0 && vm.autoBind === undefined) {
        vm.mapContainer.setSelected(manualGraphics.concat(errorGraphics));
        vm.$parent.chooseGraphic = manualGraphics.concat(errorGraphics);
        vm.showBindAZ(manualAListS.concat(errorAListS), manualZListS.concat(errorZListS));
      }
      if (promiseList.length > 0) {
        Promise.all(promiseList).then(() => {
          fish.toast('success', vm.$t('BIND_SUCCESS'));
          vm.$root.$emit('afterBindAZ');
        });
      }
    });
  }
}

/**
 * 取消绑定
 * */
export function unBind(vm) {
  const graList = vm.graphic;
  if (graList && graList.length > 0) {
    let countNum = 0;
    graList.forEach(graph => {
      const graphLike = graph.toJSON();
      const clone = new map.Graphic(graph.id, graph.layerNo, graph.geometry, graph.symbol, Object.assign({}, graph.attributes));
      graphLike.attributes.aGisKey = '';
      graphLike.attributes.zGisKey = '';
      graphLike.attributes.aLayerNo = '';
      graphLike.attributes.zLayerNo = '';
      map.editAttributeById(graphLike.layerNo, graphLike).then(() => {
        countNum += 1;
        if (countNum === graList.length) {
          fish.toast('info', vm.$t('SAVE_SUCCESS'));
        }
        vm.mapContainer.refreshLayer(graph.layerNo);
        vm.mapContainer.refreshLayer(graphLike.layerNo);
        const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
        vm.mapContainer.addUndo(
          modifyPromise(
            vm,
            vm.mapContainer,
            clone,
            new map.Graphic(graph.id, graph.attributes.layerNo, graph.geometry, graph.symbol, graphLike.attributes),
          ),
          stackDepth,
        );
      });
    });
  }
}

function editAttributeById(layerNo, resTypeName, graphic, vm) {
  return new Promise(resolve => {
    const graph = graphic.toJSON();
    graph.attributes.resName = `${resTypeName}_${graph.attributes.objectid}`;
    graph.attributes.resNo = '';
    map.editAttributeById(layerNo, graph).then(() => {
      vm.$parent.refreshTree();
      vm.mapContainer.refreshLayer(layerNo);
      resolve();
    });
  });
}

function batchProcess(adds, deletes, vm, mapContainer, breakFlag) {
  return new Promise(resolve => {
    const promises = [];
    adds.forEach(g => {
      promises.push(
        new Promise(childResolve => {
          map.addGeometry(g.layerNo, g).then(res => {
            // 如果是打断线和合并线的情况，将新增的gisKey存储
            if (breakFlag) {
              gisKeyList.push(res.attributes.gisKey);
            }
            editAttributeById(g.layerNo, g.resTypeName, res, vm).then(() => {
              vm.$emit('showTips', res);
              mapContainer.refreshLayer(g.layerNo);
              const graphLike = res.toJSON();
              graphLike.resTypeName = g.resTypeName;
              graphLike.layerNo = g.layerNo;
              childResolve({ add: graphLike });
            });
          });
        }),
      );
    });
    deletes.forEach(g => {
      promises.push(
        new Promise(childResolve => {
          map.deleteGeometry(g.layerNo, g.attributes.gisKey).then(() => {
            vm.$emit('showTips', g, 'del');
            mapContainer.refreshLayer(g.layerNo);
            childResolve({ delete: g });
          });
        }),
      );
    });
    Promise.all(promises).then(result => {
      const revertDelete = [];
      const revertAdd = [];
      result.forEach(obj => {
        if (obj.delete) {
          revertDelete.push(obj.delete);
        } else {
          revertAdd.push(obj.add);
        }
      });
      if (result.length === 3 && revertDelete.length === 1) {
        vm.$emit('splitGrid', result);
        // 拆分网格
      }
      resolve(batchProcess(revertDelete, revertAdd, vm, mapContainer));
    });
  });
}

/**
 * 合并线或者打断线以后的az绑
 * */
function bindAzAfterBreak(adds, vm) {
  const promiseList = [];
  const graphics = [];
  // 先拿到打断后或者合并后的线，再选中后进行AZ绑定
  gisKeyList.forEach(res => {
    promiseList.push(map.getByLayerAndId(adds[0].layerNo, res));
  });
  Promise.all(promiseList).then(promiseResult => {
    promiseResult.forEach(res => {
      graphics.push(res);
    });
    HLDObj.mapSelection(graphics);
    bindAz(vm);
    gisKeyList = [];
  });
}

/**
 * 打断线
 * */
export function breakLine(vm) {
  $.blockUI({ message: 'loading' }); // loading
  // let [graph] = vm.graphic;
  const adds = [];
  const deletes = [];
  const errList = [];
  vm.graphic.forEach(graph => {
    const feature = vm.mapContainer.getFeatureByGeometry(graph.geometry);
    const pointGraphics = feature.filter(item => item.geometry instanceof map.Point);
    const points = pointGraphics.map(item => item.geometry);
    const result = map.GeometryUtils.lineSplit(points, graph.geometry);
    if (result.length === 1) {
      errList.push(graph.__.values_.resName);
      return;
    }
    result.forEach(item => {
      const paths = item.getPaths()[0];
      const length = paths.reduce(
        (total, currentValue, currentIndex, arr) =>
          currentIndex === 0 ? 0 : vm.mapContainer.calculateLength(arr[currentIndex - 1], currentValue) + total,
        0,
      );
      const attributes = Object.assign({}, graph.attributes, {
        resStatus: 'C',
        gisLen: length,
      });
      delete attributes.aGisKey;
      delete attributes.zGisKey;
      delete attributes.aLayerNo;
      delete attributes.zLayerNo;
      delete attributes.resName;
      delete attributes.resNo;
      delete attributes.beRefFlag;
      delete attributes.sourceFlag;
      delete attributes.objectid;
      delete attributes.gisKey;
      adds.push({
        geometry: item,
        attributes,

        layerNo: graph.layerNo,
        resTypeName: graph.resTypeName,
      });
    });
    const graphicLike = graph.toJSON();
    graphicLike.resTypeName = graph.resTypeName;
    deletes.push(graphicLike);
  });
  if (adds.length === 0 && errList.length) {
    fish.toast('info', vm.$t('RIGHT_MENU_BREAK_LINE_NONE_POINT'));
  }
  if (adds.length > 0) {
    batchProcess(adds, deletes, vm, vm.mapContainer, true)().then(undo => {
      $.unblockUI(); //  loading
      fish.toast('info', vm.$t('SAVE_SUCCESS'));
      const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
      vm.mapContainer.addUndo(undo, stackDepth);
      bindAzAfterBreak(adds, vm);
    });
  } else {
    $.unblockUI();
  }
}

function combineLine(lines) {
  let newLine;
  lines.forEach((line, index) => {
    if (index === 0) {
      newLine = line.geometry;
    } else {
      newLine = map.GeometryUtils.combineLine(newLine, line.geometry);
    }
  });
  return newLine;
}

/**
 * 合并线
 * */
export function mergeLine(vm) {
  const lines = combineLine(vm.graphic);
  const attrs = vm.graphic[0].attributes;
  const paths = lines.getPaths()[0];
  const length = paths.reduce(
    (total, currentValue, currentIndex, arr) =>
      currentIndex === 0 ? 0 : vm.mapContainer.calculateLength(arr[currentIndex - 1], currentValue) + total,
    0,
  );
  const adds = [
    {
      geometry: lines,
      attributes: {
        resStatus: 'C',
        projectId: attrs.projectId,
        schemaId: attrs.schemaId,
        sprintId: attrs.sprintId,
        gisLen: length,
      },
      layerNo: vm.graphic[0].layerNo,
      resTypeName: vm.graphic[0].resTypeName,
    },
  ];
  let mergeActionList = [];
  const mergeAction = vm.attrActionConfig.attrActionList.find(action => action.actionType === 'M' && action.srcType === vm.graphic[0].resType);
  if (mergeAction) {
    mergeActionList = vm.attrActionConfig.attrActionItemList.filter(actionItem => actionItem.actionId === mergeAction.actionId);
  }
  mergeActionList.length > 0 &&
    mergeActionList.forEach(margeActionItem => {
      adds[0].attributes[margeActionItem.srcAttrName] = '';
      vm.graphic.forEach(line => {
        if (adds[0].attributes[margeActionItem.srcAttrName] === '') {
          adds[0].attributes[margeActionItem.srcAttrName] = line.attributes[margeActionItem.srcAttrName];
        } else {
          adds[0].attributes[margeActionItem.srcAttrName] = `${adds[0].attributes[margeActionItem.srcAttrName]},${
            line.attributes[margeActionItem.srcAttrName]
          }`;
        }
      });
    });
  const deletes = vm.graphic.map(g => {
    const gLike = g.toJSON();
    gLike.resTypeName = g.resTypeName;
    return gLike;
  });
  batchProcess(adds, deletes, vm, vm.mapContainer, true)().then(undo => {
    fish.toast('info', vm.$t('SAVE_SUCCESS'));
    const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
    vm.mapContainer.addUndo(undo, stackDepth);
    bindAzAfterBreak(adds, vm);
  });
}

/**
 * 复制资源的属性列表
 * */
export function copyActionList(actConfig, srcResType, dstResType) {
  // 筛选 源类型 和 目标类型 匹配的动作
  let copyActionListResult;
  const copyAction = actConfig.attrActionList.find(
    action => action.actionType === 'C' && action.srcType === srcResType && action.dstType === dstResType,
  );
  if (copyAction) {
    // 筛选该动作具体要复制的属性列表
    copyActionListResult = actConfig.attrActionItemList.filter(actionItem => actionItem.actionId === copyAction.actionId);
  }
  return copyActionListResult;
}

/**
 * 复制资源
 * */
export function copyResource(copyActions, srcAttr, dstAttr) {
  copyActions.forEach(copyActionItem => {
    if (copyActionItem.srcAttrName) {
      dstAttr[copyActionItem.dstAttrName] = srcAttr[copyActionItem.srcAttrName];
    } else if (copyActionItem.srcVal) {
      dstAttr[copyActionItem.dstAttrName] = copyActionItem.srcVal;
    }
  });
  return dstAttr;
}

export function splitPolygon(vm) {
  // let [graph] = vm.graphic;
  const graphicList = vm.graphic;
  vm.mapContainer.deactiveSelect();
  vm.mapContainer.getDrawTool().lineSymbol = new map.CompositeSymbol(
    [
      {
        style: Color.mouseStyle,
        geometry: geo => {
          if (geo.geometry.geometryType === map.GeometryType.POINT) {
            return geo.geometry;
          }
          return null;
        },
      },
      {
        style: Color.defalutLine,
      },
    ],
    3857,
  );
  vm.mapContainer.drawLine(evt => {
    graphicList.forEach(graph => {
      const baseAttr = getBaseResAttr(graph.geometry, vm.getProjectInfo());
      if (vm.getProjectInfo().markFlag === 'sprint') {
        baseAttr.schemaId = '';
      }
      map.areaSplit(graph.geometry, evt.geometry).then(data => {
        const splitArea = data;
        if (splitArea.length === 1) {
          fish.toast('info', vm.$t('RIGHT_MENU_SPLIT_AREA_NOT_INTERSECT'));
          return;
        }
        const adds = splitArea.map(item => ({
          geometry: item,
          attributes: Object.assign({}, baseAttr, {
            gisArea: vm.mapContainer.calculateArea(item.rings[0]),
            isSprintGrid: vm.getProjectInfo().markFlag === 'sprint' ? 'Y' : 'N',
          }),
          layerNo: graph.layerNo,
          resTypeName: graph.resTypeName,
        }));
        const graphicLike = graph.toJSON();
        graphicLike.resTypeName = graph.resTypeName;
        const deletes = [graphicLike];
        batchProcess(adds, deletes, vm, vm.mapContainer)().then(undo => {
          fish.toast('info', vm.$t('SAVE_SUCCESS'));
          HLDObj.prevent = false;
          const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
          vm.mapContainer.addUndo(undo, stackDepth);
          vm.mapContainer.refresh();
          vm.mapContainer.activeSelect();
        });
      });
    });
  });
}

export function splitLowGrid(vm) {
  const graphicList = vm.graphic;
  vm.mapContainer.deactiveSelect();
  vm.mapContainer.getDrawTool().lineSymbol = new map.CompositeSymbol(
    [
      {
        style: Color.mouseStyle,
        geometry: geo => {
          if (geo.geometry.geometryType === map.GeometryType.POINT) {
            return geo.geometry;
          }
          return null;
        },
      },
      {
        style: Color.defalutLine,
      },
    ],
    3857,
  );
  vm.mapContainer.drawLine(evt => {
    graphicList.forEach(graph => {
      const baseAttr = getBaseResAttr(graph.geometry, vm.getProjectInfo());
      if (vm.getProjectInfo().markFlag === 'sprint') {
        baseAttr.schemaId = '';
      }
      map.areaSplit(graph.geometry, evt.geometry).then(data => {
        const splitArea = data;
        if (splitArea.length === 1) {
          fish.toast('info', vm.$t('RIGHT_MENU_BREAK_LINE_NONE_POINT'));
          return;
        }

        let layerNo;
        let resTypeName;
        if (graph.layerNo === 'OLT_GRID-C') {
          layerNo = 'OCC_GRID-C';
          resTypeName = 'ODC-P Grid';
        } else {
          layerNo = 'ODB_GRID-C';
          resTypeName = 'ODP Grid';
        }

        const adds = splitArea.map(item => ({
          geometry: item,
          attributes: Object.assign({}, baseAttr, {
            gisArea: vm.mapContainer.calculateArea(item.rings[0]),
            isSprintGrid: vm.getProjectInfo().markFlag === 'sprint' ? 'Y' : 'N',
          }),
          layerNo,
          resTypeName,
        }));
        // console.log(adds);
        const graphicLike = graph.toJSON();
        graphicLike.resTypeName = graph.resTypeName;
        const deletes = [graphicLike];
        batchProcess(adds, deletes, vm, vm.mapContainer)().then(undo => {
          fish.toast('info', vm.$t('SAVE_SUCCESS'));
          const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
          vm.mapContainer.addUndo(undo, stackDepth);
          vm.mapContainer.refresh();
          vm.mapContainer.activeSelect();
        });
      });
    });
  });
}

function mergePolygon(areas) {
  let newArea;
  areas.forEach((area, index) => {
    if (index === 0) {
      newArea = area.geometry;
    } else {
      newArea = map.GeometryUtils.combineArea(newArea, area.geometry);
    }
  });
  return newArea;
}

export function combineArea(vm) {
  // console.log(vm.graphic);
  const newArea = mergePolygon(vm.graphic);
  if (!newArea) {
    fish.toast('info', vm.$t('RIGHT_MENU_COMBINE_AREA_NONE_INTERSECT'));
  }
  const baseAttr = getBaseResAttr(vm.graphic[0].geometry, vm.getProjectInfo());
  if (vm.getProjectInfo().markFlag === 'sprint') {
    baseAttr.schemaId = '';
  }
  // let attrs = vm.graphic[0].attributes;
  const adds = [
    {
      geometry: newArea,
      attributes: Object.assign({}, baseAttr, {
        gisArea: vm.mapContainer.calculateArea(newArea.getRings()[0]),
        isSprintGrid: vm.getProjectInfo().markFlag === 'sprint' ? 'Y' : 'N',
      }),
      // attributes: {
      //     resStatus: 'C',
      //     projectId: attrs.projectId,
      //     schemaId: attrs.schemaId,
      //     gisArea: vm.mapContainer.calculateArea(newArea.getRings()[0]),
      // },
      layerNo: vm.graphic[0].layerNo,
      resTypeName: vm.graphic[0].resTypeName,
    },
  ];
  const deletes = vm.graphic.map(g => {
    const gLike = g.toJSON();
    gLike.resTypeName = g.resTypeName;
    return gLike;
  });
  batchProcess(adds, deletes, vm, vm.mapContainer)().then(undo => {
    fish.toast('info', vm.$t('SAVE_SUCCESS'));
    const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
    vm.mapContainer.addUndo(undo, stackDepth);
  });
}

export function combineParentArea(vm) {
  // console.log(vm.graphic);
  const newArea = mergePolygon(vm.graphic);
  if (!newArea) {
    fish.toast('info', vm.$t('RIGHT_MENU_COMBINE_AREA_NONE_INTERSECT'));
  }
  const baseAttr = getBaseResAttr(vm.graphic[0].geometry, vm.getProjectInfo());
  if (vm.getProjectInfo().markFlag === 'sprint') {
    baseAttr.schemaId = '';
  }
  // let attrs = vm.graphic[0].attributes;
  const layerNo = vm.graphic[0].layerNo === 'ODB_GRID-C' ? 'OCC_GRID-C' : 'OLT_GRID-C';
  const resTypeName = vm.graphic[0].layerNo === 'ODB_GRID-C' ? 'ODC-P Grid' : 'OLT Grid';
  const adds = [
    {
      geometry: newArea,
      attributes: Object.assign({}, baseAttr, {
        gisArea: vm.mapContainer.calculateArea(newArea.getRings()[0]),
        isSprintGrid: vm.getProjectInfo().markFlag === 'sprint' ? 'Y' : 'N',
      }),
      // attributes: {
      //     resStatus: 'C',
      //     projectId: attrs.projectId,
      //     schemaId: attrs.schemaId,
      //     gisArea: vm.mapContainer.calculateArea(newArea.getRings()[0]),
      // },
      layerNo,
      resTypeName,
    },
  ];
  // console.log(newArea.getRings()[0]);
  const deletes = vm.graphic.map(g => {
    const gLike = g.toJSON();
    gLike.resTypeName = g.resTypeName;
    return gLike;
  });
  batchProcess(adds, deletes, vm, vm.mapContainer)().then(undo => {
    fish.toast('info', vm.$t('SAVE_SUCCESS'));
    const stackDepth = vm.schemaConfigs.stackDepth ? Number(vm.schemaConfigs.stackDepth) : 15;
    vm.mapContainer.addUndo(undo, stackDepth);
  });
}

export function initRouteObj(projectInfo) {
  return {
    hasTemplate: 'N',
    layerName: 'Route',
    layerNo: 'ROUTE-C',
    layerType: 'C',
    localName: '光缆网',
    resGroup: 'Fiber Network',
    resStatus: 'C',
    resType: 'ROUTE',
    resTypeName: 'Route',
    schemaId: projectInfo.schemaId,
    sprintId: projectInfo.sprintId,
  };
}

/**
 * 删除临时图层对象
 * mapContainer, graphic,   id
 * */
export function deleteTempGraphic(vm) {
  return new Promise(() => {
    const graphics = vm.graphic;
    graphics.forEach(graphic => {
      HLDObj.mapBox.deleteByLayerNo('demandBuilding', graphic.id);
      let fillSymbol;
      if (graphic.geometry.geometryType === map.GeometryType.POINT) {
        if (graphic.resType === 'A7') {
          fillSymbol = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/manhole_del.png', 16, 16, 0, 0, 0, false, null, 16);
        } else if (graphic.resType === 'B1') {
          fillSymbol = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/chamber_del.png', 16, 16, 0, 0, 0, false, null, 16);
        }
      } else {
        fillSymbol = new vm.$map.CompositeSymbol([
          {
            style: graphic.geometry.geometryType === map.GeometryType.POLYGON ? Color.fillPolygonColorDeleted : Color.mouseStyleDeleted,
            geometry: null,
          },
          {
            style: graphic.resType === 'A1' ? Color.demandLine : Color.demandRoadLine,
          },
        ]);
      }
      // 如果是之前存在的建筑物进行删除就生成一个灰色的临时对象表示已经删除，如果是自己新建的临时图层还未保存到数据库要删除，直接删除
      if (graphic.attributes.gisKey) {
        // 删除成功会返回删除的对象，如果是之前存在的将其添加进删除列表
        // if (graphic.resType === 'A0') {
        //   HLDObj.$refs.tools.$refs.surfaceDraw.deleteRoadList.push(graphic);
        // } else if (graphic.resType === 'A1') {
        //   HLDObj.$refs.tools.$refs.surfaceDraw.deleteBuildingList.push(graphic);
        // }
        HLDObj.$refs.toolbar.$refs.InitialSurvey.$refs.RemoteSurvey.deleteRoadList.push(graphic);
        HLDObj.mapBox.addGeometry(graphic.id, graphic.geometry, fillSymbol, graphic.attributes, 'demandBuilding');
      }
    });
    HLDObj.mapBox.refresh();
  });
}

function EditGraphicMove(HLDVm, graph, resType, reLayerNo) {
  const fillSymbol = new HLDVm.$map.CompositeSymbol([
    {
      style: graph.geometry.geometryType === 'geometryMultipolygon' ? Color.fillPolygonColor : Color.mouseStyle,
      geometry: null,
    },
    {
      style: Color.defalutLine,
    },
  ]);
  const newGeo = HLDVm.mapBox.addGeometry(
    graph.geometry.__.ol_uid,
    graph.geometry.clone(),
    fillSymbol,
    { reLayerNo, reResType: resType, id: graph.geometry.__.ol_uid },
    'demandBuilding',
  );
  HLDVm.mapBox.editGraphicMove(newGeo, event => {
    if (event.length === 0) {
      return;
    }
    if (event[0]) {
      // if (resType === 'A0') {
      //   HLDObj.$refs.tools.$refs.surfaceDraw.addRoadList.push(event[0].id);
      // } else if (resType === 'A1') {
      //   HLDObj.$refs.tools.$refs.surfaceDraw.addBuildingList.push(event[0].id);
      // }
      HLDVm.$refs.toolbar.$refs.InitialSurvey.$refs.RemoteSurvey.addRoadList.push(event[0].id);
      HLDVm.mapSelection([newGeo]);
      EditGraphicMove(HLDVm, event[0], resType, reLayerNo);
    }
  });
}

// 复制临时图层上的要素
export function copySurface(vm) {
  const graph = vm.graphic[0];
  // 移除拖拽的监听事件
  HLDObj.mapBox.removeEditGraphicTranslate(graph);
  // 确保复制的是最新的图形
  const graphic = HLDObj.mapBox.findGeometryByLayerNo('demandBuilding', graph.id);
  EditGraphicMove(HLDObj, graphic, graphic.attributes.reResType, graphic.attributes.reLayerNo);
}

export function count() {
  const graphList = HLDObj.chooseGraphic;
  graphList.forEach((graphic, index) => {
    const filterParam = {
      geometryName: 'geom',
      geometry: graphic.geometry,
      spatialReference: map.SupportSpatialReferences.WEB_MERCATOR,
    };
    let finalFilter = {};
    if (HLDObj.schemaConfigs.selectModel === 'I') {
      finalFilter = map.Filter.intersects(filterParam);
    } else {
      finalFilter = map.Filter.within(filterParam);
    }
    const featureLike = {
      layerNo: 'EDESIGN_MAP_HO_BUILDING',
      filter: finalFilter,
      returnGeometry: true,
    };
    HLDObj.$map.getByFeatureLayer(featureLike).then(data => {
      // console.log(data);
      if (data && data.length > 0) {
        let total = 0;
        data.forEach(CloudGraphic => {
          total += CloudGraphic.attributes.userQty;
        });
        graphic.attributes = Object.assign(graphic.attributes, { userQty: total.toString() });
        HLDObj.$map.updateGeometryById(graphic.attributes.layerNo, graphic).then(() => {
          if (index === graphList.length - 1) {
            HLDObj.$root.$emit('changeAttributes', { userQty: total.toString() });
          }
        });
      }
    });
  });
}
