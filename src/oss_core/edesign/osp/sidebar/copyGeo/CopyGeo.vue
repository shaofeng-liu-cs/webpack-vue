<template>
  <div class="copy-geo sidebar-body">
    <div class="destination">
      <div class="title sidebar-tab-title">{{$t('AREA')}}</div>
      <div class="select">
        <DrawPolygon2Map @afterDrawPolygon="afterDrawPolygon" ref="DrawPolygon2Map"></DrawPolygon2Map>
      </div>
      <div class="select">
        <button type="button" class="btn btn-primary row-btn" @click="clearData">{{$t('CLEAR')}}</button>
      </div>
    </div>
    <div class="source-layer">
      <div class="title sidebar-tab-title">{{$t('COPY_GEO_SOURCE')}}</div>
      <div class="content-div source-layer-content">
        <div class="content-label col-md-2">{{$t('LAYER')}}</div>
        <Combobox class="form-control content-box" name="reLayer" v-model="resourceLayer" :disabled="!curGeometry" :setting="resourceLayerSetting" @change="changeSourceLayer"></Combobox>
      </div>
    </div>
    <div class="data">
      <div class="title sidebar-tab-title">{{$t('COPY_GEO_DATAS')}}</div>
      <div class="grid-div">
        <Grid :data="gridData" :option="gridOpt" ref="gridRef" id="copyGeoGrid" @onSelectRow="onSelectRow" :selection.sync="selection">
          <grid-column :label="$t('COPY_GEO_GIS_KEY')" prop="gisKey" width="100"></grid-column>
          <grid-column :label="$t('NAME')" prop="resName" width="100"></grid-column>
        </Grid>
      </div>
    </div>
    <div class="destination">
      <div class="title sidebar-tab-title">{{$t('COPY_GEO_DESTINATION')}}</div>
      <div class="content-div">
        <div class="content-label col-md-2">{{$t('LAYER')}}</div>
        <Combobox class="form-control content-box" name="taLayer" v-model="targetLayer" :disabled="!resourceLayer" :setting="targetLayerSetting"></Combobox>
      </div>
    </div>
    <div class="footer">
      <button class="btn btn-primary row-btn" @click="okAction" :disabled="okDisabled">{{$t('OK')}}</button>
    </div>
  </div>
</template>

<script>
import { Graphic, SupportSpatialReferences, GeometryType, Filter } from 'map';
import * as EDNColor from '@/oss_core/base/map-style/default-styles.js'; // 画图样式
import { copyActionList, copyResource } from '../../domain/ResEventHandler.js';
import { getBaseResAttr } from '@/oss_core/base/utils/ResourcesConfig.js';
export default {
  name: 'CopyGeo',
  inject: ['getProjectInfo', 'getMapBox', 'getSurfaceLayerList', 'getResourceList', 'getAttrActionConfig', 'getSchemaConfigs'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList() || [];
    },
    resourceList() {
      return this.getResourceList() || [];
    },
    attrActionConfig() {
      return this.getAttrActionConfig() || {};
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
  },
  data() {
    return {
      resourceLayer: '',
      resourceLayerSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'layerName',
        dataValueField: 'layerNo',
        dataSource: [],
        value: '',
      },
      targetLayer: '',
      targetLayerSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'layerName',
        dataValueField: 'layerNo',
        dataSource: [],
        value: '',
      },
      template: '',
      templateSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'layerName',
        dataValueField: 'layerNo',
        dataSource: [],
        value: '',
      },
      curGeometry: null,
      gridData: [],
      allGridData: [],
      curPage: 1,
      totalRecords: 0,
      gridOpt: {
        width: '340',
        multiselect: true,
        preserveSelection: true,
        altRows: true,
      },
      curGeometry: null,
      temLayer: undefined,
      okDisabled: false,
      selection: [],
    };
  },
  created() {},
  mounted() {
    this.mapBox.addTempLayer('copyGeo');
    this.temLayer = this.mapBox._tempLayerList.get('copyGeo');
    this.initSourceLayer();
  },
  watch: {
    resourceLayer: {
      handler(val, old) {
        if (val) {
          let findRes = this.resourceLayerSetting.dataSource.find(res => res.layerNo === val);
          this.targetLayerSetting.dataSource = this._targetLayers.filter(res => res.layerNo !== val && res.geometryType === findRes.geometryType);
        } else {
          this.targetLayerSetting.dataSource = this._targetLayers;
        }
      },
    },
  },
  deactivated() {
    if (this.temLayer) {
      this.temLayer.clear();
    }
    this.mapBox.clear(); // 可以屏蔽掉绘画动作
    // this.controlData.initSelectedStatus.componentName = 'newResource';
    // this.controlData.initSelectedStatus.rightCloseFlag = false;
  },
  activated() {},
  methods: {
    initSourceLayer() {
      // 过滤：route为前台写死的资源类型，不允许在这里copy，只在Layer Control和Resource Tree中操作
      let designLayer = this.resourceList
        .filter(res => res.layerType === 'C' && res.layerNo !== 'ROUTE-C')
        .map(resLayer => {
          let findRes = this.mapBox.findLayer(resLayer.layerNo);
          if (findRes) {
            resLayer.geometryType = findRes.geometryType;
          }
          resLayer.schemaControl = true;
          return resLayer;
        });
      this.surfaceLayerList.forEach(res => {
        let findRes = this.mapBox.findLayer(res.layerNo);
        if (findRes) {
          res.geometryType = findRes.geometryType;
        }
        if (res.resType === 'A5') {
          res.schemaControl = true;
        }
      });
      let allValidLayer = designLayer.concat(this.surfaceLayerList).filter(res => res.geometryType);
      this.resourceLayerSetting.dataSource = allValidLayer;
      this._targetLayers = designLayer;
    },
    afterDrawPolygon(geometry) {
      if (geometry) {
        this.curGeometry = geometry;
        this.clearData();
        if (this.temLayer) {
          this.temLayer.clear();
        }
      }
    },
    // 更换Source
    changeSourceLayer() {
      this.targetLayer = '';
      this.gridData = [];
      $('#copyGeoGrid').grid('setAllCheckRows', false, true);
      let layerObj = this.resourceLayerSetting.dataSource.find(res => res.layerNo === this.resourceLayer);
      if (layerObj && this.curGeometry) {
        this.getIdentifyData(layerObj);
      }
    },
    getIdentifyData(layerObj) {
      return new Promise((resolve, reject) => {
        let filterParam = {
          geometryName: 'geom',
          geometry: this.curGeometry,
          spatialReference: SupportSpatialReferences.WEB_MERCATOR,
        };
        let finalFilter = {};
        if (this.schemaConfigs.selectModel === 'I') {
          finalFilter = Filter.intersects(filterParam);
        } else {
          finalFilter = Filter.within(filterParam);
        }
        if (layerObj.schemaControl) {
          finalFilter = Filter.and(finalFilter, Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId }));
        }
        let featureLike = {
          layerNo: this.resourceLayer,
          filter: finalFilter,
          returnGeometry: true,
        };
        this.$map.getByFeatureLayer(featureLike).then(data => {
          let resultData = [];
          if (data && data.length > 0) {
            resultData = data.map(res => {
              return {
                resId: res.attributes.resId,
                gisKey: res.attributes.gisKey,
                resName: res.attributes.resName,
                resNo: res.attributes.resNo,
                status: res.attributes.resStatus,
                lifeStateId: res.attributes.resStatus,
                statusDesc: res.attributes.resStatus === 'C' ? 'Planning' : 'In-Service',
                geometry: res.geometry,
                layerNo: res.layerNo,
                geometryType: this.mapBox.findLayer(res.layerNo).geometryType,
                attributes: res.attributes,
              };
            });
            this.gridData = resultData;
          } else {
            fish.toast('warn', this.$t('COPY_GEO_NO_RESOURCES'));
          }
        });
      });
    },

    okAction() {
      // let curSelectedData = $(`#copyGeoGrid`).grid('getCheckRows') || [];
      let curSelectedData = this.selection;
      if (curSelectedData.length === 0) {
        fish.toast('warn', this.$t('COPY_GEO_PLS_SELECT'));
        return;
      }
      if (!this.targetLayer) {
        fish.toast('warn', this.$t('COPY_GEO_PLS_SELECT2'));
        return;
      }
      let srclayerObj = this.resourceLayerSetting.dataSource.find(res => res.layerNo === this.resourceLayer);
      let dstlayerObj = this.targetLayerSetting.dataSource.find(res => res.layerNo === this.targetLayer);
      let copyActList = copyActionList(this.attrActionConfig, srclayerObj.resType, dstlayerObj.resType);
      let newGraphics =
        curSelectedData.map(singleGra => {
          let baseAttr = getBaseResAttr(singleGra.geometry, this.projectInfo);
          if (copyActList.length > 0) {
            copyResource(copyActList, singleGra.attributes, baseAttr);
          }
          let newGraphic = new Graphic('', this.targetLayer, singleGra.geometry.clone(), null, baseAttr);
          return newGraphic;
        }) || [];
      this.okDisabled = true;
      this.$map.batchAddGeometry(newGraphics).then(
        results => {
          if (results && results.length > 0) {
            let editGraphics = results.map(singleGra => {
              let editGra = singleGra.toJSON();
              let findeRes = this.targetLayerSetting.dataSource.find(res => res.layerNo === this.targetLayer);
              editGra.attributes.resName = findeRes.layerName + '-' + editGra.attributes.objectid;
              editGra.attributes.resNo = findeRes.layerName + '-' + editGra.attributes.objectid;
              return editGra;
            });
            this.$map.batchUpdateGeometryById(editGraphics).then(
              response => {
                this.mapBox.refreshLayer(this.targetLayer);
                fish.toast('success', this.$t('COPY_GEO_COPY_SUCC'));
                this.okDisabled = false;
                this.clearData();
              },
              error => {
                this.okDisabled = false;
                this.clearData();
              }
            );
          } else {
            this.okDisabled = false;
            this.clearData();
          }
        },
        e => {
          this.okDisabled = false;
          this.clearData();
        }
      );
    },
    onSelectRow(row, index) {
      let geometry = row.geometry;
      // let zoom = this.mapBox.getZoom();
      // this.mapBox.centerGeometries([geometry], zoom);
      let symbol = EDNColor.blueIndex;
      let point;
      if (geometry.geometryType === GeometryType.POLYLINE) {
        let paths;
        if (typeof geometry.getPaths === 'function') {
          [paths] = geometry.getPaths();
        } else {
          [paths] = geometry.paths;
        }
        let path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], geometry.spatialReference);
      } else if (geometry.geometryType === GeometryType.POLYGON) {
        if (typeof geometry.getCentroid === 'function') {
          point = geometry.getCentroid();
        } else {
          point = geometry.centroid;
        }
      } else {
        point = geometry.clone();
      }

      if (point.spatialReference.wkid !== this.mapBox.spatialReference.wkid) {
        point = point.transferProjection(this.mapBox.spatialReference);
      }
      this.mapBox.map.view.animate({
        center: [point.x, point.y],
      });
      if (this.temLayer) {
        this.temLayer.clear();
      }
      let gra = this.mapBox.addGeometry(`pic${row.gisKey}`, point, symbol, {}, 'copyGeo');
    },

    getLinecenter(paths) {
      //返回是多条线段组成的集合取中间坐标点
      let index;
      let x, y;
      if (paths.length === 2) {
        x = (paths[0][0] + paths[1][0]) / 2;
        y = (paths[0][1] + paths[1][1]) / 2;
      } else {
        index = Math.floor(paths.length / 2);
        x = (paths[index][0] + paths[index + 1][0]) / 2;
        y = (paths[index][1] + paths[index + 1][1]) / 2;
      }
      return [x, y];
    },

    clearData() {
      this.resourceLayer = '';
      this.targetLayer = '';
      this.gridData = [];
      $('#copyGeoGrid').grid('setAllCheckRows', false, true);
    },
  },
  destroyed() {},
};
</script>

<style lang="scss" scoped>
@import './copyGeo';
</style>
