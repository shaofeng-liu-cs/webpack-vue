import { nearestAccessPoint } from 'map';
import * as map from 'map';
import i18n from '@/oss_core/base/locale/locale.js';
import { deleteReference, addReference } from '../../../map-control-api';
import { batchDelResources } from '@/oss_core/edesign/api/del/resources.js';

const { fish } = window;
let roadList = [];
let buildList = [];
let dpList = [];

function getNearestPoint(dataInfo, mapBox) {
  return new Promise(resolve => {
    if (mapBox.findLayer(buildList[0].layerNo).geometryType === map.GeometryType.POINT) {
      const pointList = [
        {
          geometry: dataInfo.CloudGraphic.geometry,
          attributes: {
            id: dataInfo.CloudGraphic.attributes.id,
            gisKey: dataInfo.CloudGraphic.attributes.gisKey,
            layerNo: dataInfo.CloudGraphic.layerNo,
          },
        },
      ];
      resolve(pointList);
    } else if (roadList && roadList.length === 1) {
      const paths = dataInfo.CloudGraphic.geometry.getRings();
      const geometry = mapBox.createPolygonGeometry(paths);
      nearestAccessPoint({
        geometry,
        polygonLayerNos: [buildList[0].layerNo],
        lineLayerNos: [roadList[0].layerNo],
        srid: map.SupportSpatialReferences.WEB_MERCATOR.wkid,
        tolerance: 5,
      }).then(result => {
        resolve(result);
      });
    } else {
      const pointList = [
        {
          geometry: dataInfo.CloudGraphic.geometry.getCentroid(),
          attributes: {
            id: dataInfo.CloudGraphic.attributes.id,
            gisKey: dataInfo.CloudGraphic.attributes.gisKey,
            layerNo: dataInfo.CloudGraphic.layerNo,
          },
        },
      ];
      resolve(pointList);
    }
  });
}

function addDemandPoint(dataInfo, mapBox, projectInfo, that) {
  // let paths = dataInfo.CloudGraphic.geometry.getRings();
  // let geometry = mapBox.createPolygonGeometry(paths);
  getNearestPoint(dataInfo, mapBox).then(result => {
    const demandPoints = result.filter(res => res.geometry).filter(geo => geo.attributes.id === dataInfo.CloudGraphic.attributes.id);
    demandPoints.forEach((point, index) => {
      const wgsGeo = mapBox
        .createPointFromCurrentCoord(
          [point.geometry.x, point.geometry.y],
          map.SupportSpatialReferences.getSpatialReference(point.geometry.spatialReference.wkid),
        )
        .transferProjection(map.SupportSpatialReferences.WGS84);
      point.layerNo = dpList[0].layerNo;
      const obj = {};
      obj.resStatus = 'C';
      obj.name = `DP${index}`;
      obj.resName = `DP${index}`;
      obj.resNo = `DP${index}`;
      obj.buildingGisId = point.attributes.gisKey || point.attributes.id;
      obj.buildingLayerNo = point.attributes.layerNo;
      obj.schemaId = projectInfo.schemaId;
      obj.sprintId = projectInfo.sprintId;
      obj.longitude = wgsGeo.x;
      obj.latitude = wgsGeo.y;
      point.attributes = obj;
    });
    const { Filter } = map;
    const filter = Filter.and(
      Filter.equalTo({ propertyName: 'building_gis_id', expression: dataInfo.CloudGraphic.attributes.id }),
      Filter.equalTo({ propertyName: 'sprintId', expression: projectInfo.sprintId }),
    );
    const featureLayer = {
      layerNo: dpList[0].layerNo,
      filter,
    };
    map.getByFeatureLayer(featureLayer).then(data => {
      if (data && data.length > 0) {
        fish.warn(i18n.t('MAP_POINT_HAS_EXISTS'));
        return;
      }
      map.batchAddGeometry(demandPoints).then(() => {
        fish.success(i18n.t('ADD_SUCCESS'));
        mapBox.refreshLayer(dpList[0].layerNo);
        that.controlData.initSelectedStatus = { componentName: '', rightCloseFlag: false };
      });
    });
  });
}

// function resReuse(dataInfo, mapBox, projectInfo) {
//   let g = dataInfo.CloudGraphic;
//   let attributes = Object.assign({}, g.attributes);
//   attributes.resStatus = 'C';
//   delete attributes.objectid;
//   let graphic = new map.Graphic(g.id, `${g.resType}-C`, g.geometry, g.symbol, attributes);
//   addGraphic(`${g.resType}-C`, g.resType, graphic.toJSON(), mapBox, projectInfo);
// }

// function addGraphic(layerNo, resTypeName, graphic, mapBox, projectInfo) {
//   Object.assign(graphic.attributes, {
//     resstatus: 'C',
//     projectId: projectInfo.projectId,
//     schemaId: projectInfo.schemaId,
//     sprintId: projectInfo.sprintId,
//     sourceFlag: 'U',
//   });
//   map
//     .addGeometry(layerNo, graphic)
//     .then(res => {
//       graphic = res.toJSON();
//       graphic.attributes.resName = resTypeName + '-' + graphic.attributes.objectid;
//       graphic.attributes.resNo = resTypeName + '-' + graphic.attributes.objectid;
//       map.editAttributeById(layerNo, graphic).then(res => {
//         mapBox.setSelected([graphic]);
//         mapBox.refreshLayer(layerNo);
//         // let [layers] = mapBox.getLayersByIds([layerNo]);
//         // layers.refresh();
//         // mapBox.drawLayer.clear();
//       });
//     })
//     .catch(res => {
//       console.log(res);
//     });
// }

function removeDemandPoint(dataInfo, mapBox, projectInfo) {
  fish.confirm(i18n.t('OSP_MAP_SEARCHBAR_REMOVE_DEMAND_MSG'), () => {
    const { Filter } = map;
    const buildingId = dataInfo.CloudGraphic.attributes.gisKey || dataInfo.CloudGraphic.attributes.id;
    const filter = Filter.and(
      Filter.equalTo({ propertyName: 'building_gis_id', expression: buildingId }),
      Filter.equalTo({ propertyName: 'sprintId', expression: projectInfo.sprintId }),
    );
    const featureLayer = {
      layerNo: dpList[0].layerNo,
      filter,
    };
    map.getByFeatureLayer(featureLayer).then(result => {
      if (result && result.length > 0) {
        map.deleteGeometry(dpList[0].layerNo, result[0].attributes.gisKey).then(() => {
          fish.success(i18n.t('DELETE_SUCCESS'));
          mapBox.refreshLayer(dpList[0].layerNo);
        });
      } else {
        fish.warn(i18n.t('MAP_NO_POINTS_FOUND'));
      }
    });
  });
}

function removeStr(dataInfo, projectInfo, mapBox, that) {
  fish.confirm(i18n.t('OSP_MAP_SEARCHBAR_REMOVE_STRUCTURE_MSG'), () => {
    // 接入点的resId就是建筑物的资源Id
    if (dataInfo.CloudGraphic.attributes.resId) {
      const deleteResDTO = [
        {
          resType: 'BUILDING',
          resId: dataInfo.CloudGraphic.attributes.resId,
          gisKey: dataInfo.CloudGraphic.attributes.gisKey,
          resFlag: 'BOTH',
          mapNo: projectInfo.mapNo,
          schemaId: projectInfo.projectInfo,
          layerNo: dataInfo.CloudGraphic.layerNo === 'demandBuilding' ? dataInfo.CloudGraphic.attributes.reLayerNo : dataInfo.CloudGraphic.layerNo,
        },
      ];
      batchDelResources(deleteResDTO).then(() => {
        // let res = dataInfo.CloudGraphic.toJSON();
        // res.attributes.resId = '';
        dataInfo.CloudGraphic.attributes = {
          resId: '',
        };
        that.$root.$emit('changeAttributes', dataInfo.CloudGraphic.attributes);
        mapBox._map.mapServices.forEach(mapService => {
          if (!(mapService instanceof that.$map.OnlineMapService)) {
            // 底图不刷新
            mapService.refresh();
          }
        });
        // mapBox.refresh();
        fish.success(i18n.t('DELETE_SUCCESS'));
        // that.$map.editAttributeById(res.layerNo, res).then(() => {

        // });
      });
    }
  });
}

function cancelReference(dataInfo, projectInfo, that) {
  fish.confirm(i18n.t('OSP_MAP_SEARCHBAR_CANCEL_REFERENCE_MSG'), () => {
    // 接入点的resId就是建筑物的资源Id
    if (dataInfo.CloudGraphic.attributes.resId) {
      const deleteResDTO = {
        resType: dataInfo.CloudGraphic.resType,
        resId: dataInfo.CloudGraphic.attributes.resId,
        curSchemaId: projectInfo.schemaId,
        curProjectId: projectInfo.sprintId,
        lifeStateId: dataInfo.lifeStateId,
        mapNo: projectInfo.mapNo,
        sourceFlag: dataInfo.CloudGraphic.attributes.resStatus === 'A' ? 'U' : 'R',
        oriSchemaId: dataInfo.CloudGraphic.attributes.schemaId,
        oriProjectId: dataInfo.CloudGraphic.attributes.projectId,
        oriSprintId: dataInfo.CloudGraphic.attributes.sprintId,
      };
      deleteReference(deleteResDTO).then(() => {
        that.controlData.popupName = '';
        that.$root.$emit('afterReferenceAction');
        fish.success(i18n.t('SUCCESS'));
      });
    }
  });
}

function reference(dataInfo, projectInfo, that) {
  // 接入点的resId就是建筑物的资源Id
  if (dataInfo.CloudGraphic.attributes.resId) {
    if (dataInfo.CloudGraphic.attributes.sourceFlag === 'R' && dataInfo.CloudGraphic.attributes.refSchemaId) {
      const findRes = that.allSchemaList.find(res => res.schemaId === dataInfo.CloudGraphic.attributes.refSchemaId);
      fish.toast('info', i18n.t('OSP_MAP_SEARCHBAR_REFERENCE_MSG', { name: findRes.name }));
    }
    const addResDTO = {
      resType: dataInfo.CloudGraphic.resType,
      resId: dataInfo.CloudGraphic.attributes.resId,
      curSchemaId: projectInfo.schemaId,
      curProjectId: projectInfo.sprintId,
      curSprintId: projectInfo.sprintId,
      lifeStateId: dataInfo.lifeStateId,
      mapNo: projectInfo.mapNo,
      partitionId: projectInfo.cityId ? projectInfo.cityId : projectInfo.areaId,
      sourceFlag: dataInfo.CloudGraphic.attributes.resStatus === 'A' ? 'U' : 'R',
      oriSchemaId: dataInfo.CloudGraphic.attributes.schemaId,
      oriProjectId: dataInfo.CloudGraphic.attributes.projectId,
      oriSprintId: dataInfo.CloudGraphic.attributes.sprintId,
    };
    addReference(addResDTO).then(() => {
      that.controlData.popupName = '';
      that.$root.$emit('afterReferenceAction');
      fish.success(i18n.t('SUCCESS'));
    });
  }
}

export function resFunction(functionData, dataInfo, mapBox, projectInfo, surfaceList, that) {
  if (surfaceList) {
    roadList = surfaceList.filter(res => res.resType === 'A0');
    buildList = surfaceList.filter(res => res.resType === 'A1');
    dpList = surfaceList.filter(res => res.resType === 'A5');
  }

  switch (functionData.url) {
    case 'addDemandPoint':
      addDemandPoint(dataInfo, mapBox, projectInfo, that);
      break;
    // case 'resReuse':
    //     resReuse(dataInfo, mapBox, projectInfo);
    //     break;
    case 'removeDemandPoint':
      removeDemandPoint(dataInfo, mapBox, projectInfo);
      break;
    case 'removeStr':
      removeStr(dataInfo, projectInfo, mapBox, that);
      break;
    case 'cancelReference':
    case 'cancelReuse':
      cancelReference(dataInfo, projectInfo, that);
      break;
    case 'reference':
    case 'resReuse':
      reference(dataInfo, projectInfo, that);
      break;
    default:
      // console.log('No url function found!');
      break;
  }
}
