<template>
  <div class="new-resource-content-box">
    <div class="new-resource-container" v-for="(items, indexs) in newResourceData" :key="indexs">
      <h3 class="resource-item-title">{{ items.name }}</h3>
      <!-- 当数据有三层的时候，第二层的数组名暂定为childItemData -->
      <div class="new-resource-itemlist">
        <div :class="{active: controlData.btnActiveName === item.layerNo} " class="itemlist-itembox" v-for="(item, index) in items.childData" :key="index" @click="toolbarBtn(item, item)" :title="item.resName">
          <div class="item-iconbox"><img :src="defaultStyle[item.resType].iconUrl" alt=''></div>
          <div class="item-titlebox">{{item.resName}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as Color from '@/oss_core/edesign/osp/design/drawStyle.js'; // 画图样式
// import { bindAz } from '../../domain/ResEventHandler.js';
import { SupportSpatialReferences, GeometryType, Overlay, MeasureTool, Polyline, Polygon, DrawType } from 'map';

export default {
  name: 'NewResourcePlan',
  inject: ['getMapBox', 'getControlData', 'getResourceList', 'defaultStyle'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    controlData() {
      return this.getControlData();
    },
    resourceList() {
      return this.getResourceList();
    },
  },
  props: {
    isInitFunc: false,
  },
  data() {
    return {
      selectResourceType: '',
      newResourceData: [],
      rowData: {},
      removeLatsPointOverlay: null,
      drawInfoOverlay: null,
      drawingPointList: [],
      drawingInfo: {
        drawType: null,
        current: 0,
        total: 0,
      },
      lengthAndArea: {
        currentLength: '',
        totalLength: '',
        totalArea: '',
      },
      drawUndo: false, //是否开启右键撤回
    };
  },
  created() {
    let newResource = this.resourceList || [];
    // 过滤：route为前台写死的资源类型，不允许new，只在Layer Control和Resource Tree中操作
    let newResourceC = newResource.filter((item) => item.layerType === 'C' && item.resType !== 'SPLITTER' && item.layerNo !== 'ROUTE-C');
    if (newResourceC.length > 0) {
      this.getResource(newResourceC, newResourceC[0].resGroup);
    }
  },
  mounted() {
    console.log(this.defaultStyle);
    this.$root.$on('refresh', this.clearDrawingInfoOverlay);
    this.initToolBar();
  },
  watch: {
    // drawingPointList(val) {
    //     console.log(val);
    // },
    'controlData.btnActiveName'(val) {
      let isClear = true;
      this.resourceList.forEach((resource) => {
        if (val === resource.layerNo) {
          isClear = false;
        }
      });
      console.log('编号：', val);
      this.initToolBar(val);
      if (isClear) {
        this.clearDrawingInfoOverlay();
      }
    },
  },
  activated() {
    this.drawUndo = false;
  },
  deactivated() {
    this.clearDrawingInfoOverlay();
    this.mapBox.clear();
    this.controlData.initSelectedStatus.componentName = 'newResource';
    this.controlData.initSelectedStatus.rightCloseFlag = false;
  },
  methods: {
    getResource(resource, name) {
      if (resource.length > 0) {
        this.newResourceData.push({
          name: name,
          childData: resource.filter((item) => item.resGroup === name),
        });
      }
      let nowResource = resource.filter((item) => item.resGroup !== name);
      if (nowResource.length > 0) {
        this.getResource(nowResource, nowResource[0].resGroup);
      }
    },
    initToolBar(val) {
      const name = val || this.controlData.btnActiveName;
      console.log('执行。。。', name, name === 'createGrid');
      if (name === 'createGrid') {
        const childData = this.newResourceData.find((it) => it.childData && it.childData.length > 0).childData[0];
        console.log('选中执行.', childData);
        this.toolbarBtn(childData, childData);
      }
    },
    toolbarBtn(item, hldData) {
      let newUrl = this.defaultStyle[item.resType].iconUrl;
      this.prepareAddGraphic(newUrl, item, hldData);
      this.controlData.btnActiveName = item.layerNo;
      this.selectResourceType = (hldData && hldData.hldTemplateId) || item.layerNo;
    },
    prepareAddGraphic(url, item, hldData) {
      this.mapBox.clear();
      this.mapBox.deactiveSelect();
      let obj = this.mapBox.findLayer(item.layerNo);
      let drawTool = this.mapBox.getDrawTool();
      if (obj.geometryType === GeometryType.POINT) {
        let imgInfo;
        if (hldData && hldData.styleJson) {
          imgInfo = JSON.parse(hldData.styleJson);
        } else {
          imgInfo = this.defaultStyle[item.resType];
        }
        let pic = new this.$map.PictureMarkerSymbol(url, imgInfo.imgSize, imgInfo.imgSize, 0, 0, 0, false, null, imgInfo.size);
        drawTool.markerSymbol = pic;
        this.mapBox.addDrawToolListener(DrawType.POINT, this.drawPoint(item, pic, hldData));
      } else if (obj.geometryType === GeometryType.POLYLINE) {
        this.drawUndo = true;
        this.drawingInfo.drawType = GeometryType.POLYLINE;
        drawTool.lineSymbol = new this.$map.CompositeSymbol(
          [
            {
              style: Color.mouseStyle,
              geometry: (geo) => {
                if (geo.geometry.geometryType === GeometryType.POINT) {
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
        this.mapBox.addDrawToolListener(DrawType.POLYLINE, this.drawPolyline(item, hldData));
        this.mapBox.addMouseMoveListener((point) => {
          this.addDrawInfoOverlay(point);
        });
        this.mapBox.addMouseClickListener((point) => {
          this.drawingPointList.push(point);
        });
      } else {
        this.drawUndo = true;
        drawTool.fillSymbol = new this.$map.CompositeSymbol([
          {
            style: Color.mouseStyle,
            geometry: (geo) => {
              if (geo.geometry.geometryType === GeometryType.POINT) {
                return geo.geometry;
              }
              return null;
            },
          },
          {
            style: Color.defalutLine,
          },
        ]);
        this.mapBox.addMouseClickListener((point) => {
          this.drawingPointList.push(point);
        });
        this.mapBox.addMouseMoveListener((point) => {
          this.addDrawInfoOverlay(point);
        });
        this.drawingInfo.drawType = GeometryType.POLYGON;
        this.mapBox.addDrawToolListener(DrawType.POLYGON, this.drawPolygon(item, hldData));
      }
    },
    drawPoint(item, pic, hldData) {
      return (evt) => {
        let graphic = evt.toJSON();
        evt.symbol = pic;
        let transferred = evt.geometry.transferProjection(SupportSpatialReferences.WGS84);
        graphic.attributes.longitude = transferred.x;
        graphic.attributes.latitude = transferred.y;
        this.addGraphic(item.layerNo, item.resName, graphic, hldData);
        this.mapBox.addDrawToolListener(DrawType.POINT, this.drawPoint(item, pic, hldData));
      };
    },
    drawPolyline(item, hldData) {
      return (evt) => {
        let lineStyle;
        if (item.layerNo.includes('Pipeline')) {
          lineStyle = Color.pipeline;
        } else if (item.layerNo.includes('AIR')) {
          lineStyle = Color.airWire;
        } else if (item.layerNo.includes('Copper')) {
          lineStyle = Color.copper;
        } else {
          lineStyle = Color.fiber;
        }
        evt.symbol = lineStyle;
        let graphic = evt.toJSON();
        let paths = graphic.geometry.getPaths()[0];
        let length = paths.reduce((total, currentValue, currentIndex, arr) => {
          return currentIndex === 0 ? 0 : this.mapBox.calculateLength(arr[currentIndex - 1], currentValue) + total;
        }, 0);
        graphic.attributes.gisLen = length;
        this.addGraphic(item.layerNo, item.resName, graphic, hldData);
        this.lengthAndArea = {
          currentLength: '',
          totalLength: '',
          totalArea: '',
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); //完成后bus派发一个完成事件，通知底部信息栏刷新
        this.mapBox.addDrawToolListener(DrawType.POLYLINE, this.drawPolyline(item, hldData));
      };
    },
    drawPolygon(item, hldData) {
      return (evt) => {
        let graphic = evt.toJSON();
        let rings = graphic.geometry.getRings()[0];
        graphic.attributes.gisArea = this.mapBox.calculateArea(rings);
        this.addGraphic(item.layerNo, item.resName, graphic, hldData);
        this.lengthAndArea = {
          currentLength: '',
          totalLength: '',
          totalArea: '',
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); //完成后bus派发一个完成事件，通知底部信息栏刷新
        this.mapBox.addDrawToolListener(DrawType.POLYGON, this.drawPolygon(item, hldData));
      };
    },
    addGraphic(layerNo, resName, graphic, hldData) {
      Object.assign(graphic.attributes, {
        resStatus: 'C',
      });

      if (hldData && hldData.hldTemplateId) {
        let obj = {};
        if (hldData.attrs && hldData.attrs.length) {
          hldData.attrs.map((it) => {
            obj[it.attrName] = it.attrVal;
          });
        }

        Object.assign(graphic.attributes, {
          hldTemplateId: hldData.hldTemplateId,
          ...obj,
        });
      }
      console.log('在地图添加元素', layerNo, graphic, hldData);

      this.$map
        .addGeometry(layerNo, graphic)
        .then((res) => {
          let graphics = res;
          graphic = res.toJSON();
          graphic.attributes.resName = resName + '-' + graphic.attributes.objectid;
          // graphic.attributes.resNo = resName + '-' + graphic.attributes.objectid;
          graphic.attributes.resNo = '';
          this.$map.editAttributeById(layerNo, graphic).then((res) => {
            if (layerNo === 'PLAN_GRID') {
              this.mapBox.refreshLayer(layerNo);
              this.mapBox._drawLayer.clear();
              this.$emit('showTips', graphic, 'add');
              this.clearDrawingInfoOverlay();
            }
          });
        })
        .catch((res) => {
          this.clearDrawingInfoOverlay();
        });
    },
    deleteGraphicPromise(layerNo, resName, graphic) {
      return () => {
        return new Promise((resolve, reject) => {
          this.$map.deleteGeometry(layerNo, graphic.attributes.gisKey).then((res) => {
            this.mapBox.refreshLayer(layerNo);
          });
          resolve(this.addGraphPromise(layerNo, resName, graphic));
        });
      };
    },
    addGraphPromise(layerNo, resName, graphic) {
      return () => {
        return new Promise((resolve, reject) => {
          this.$map.addGeometry(layerNo, graphic).then((res) => {
            this.mapBox.refreshLayer(layerNo);
            resolve(this.deleteGraphicPromise(layerNo, resName, res.toJSON()));
          });
        });
        //return this.deleteGraphic(layerNo,resName,graphic)
      };
    },
    rightClickDraw() {
      this.drawingPointList.splice(-1, 1);
    },
    addDrawInfoOverlay(point) {
      // let infoDiv = document.createElement('div');
      let pointCount = this.drawingPointList.length;
      if (this.drawingInfo.drawType === GeometryType.POLYLINE) {
        // let currentLengthSpan = document.createElement('span');
        // let totalLengthSpan = document.createElement('span');
        if (pointCount >= 1) {
          this.drawingInfo.current = new Polyline(
            [
              [
                [this.drawingPointList[pointCount - 1].x, this.drawingPointList[pointCount - 1].y],
                [point.x, point.y],
              ],
            ],
            this.mapBox.spatialReference,
          ).getTheLength();
          let rings = [];
          this.drawingPointList.forEach((point) => {
            let tempPoint = [point.x, point.y];
            rings.push(tempPoint);
          });
          this.drawingInfo.total = this.drawingInfo.current + new Polyline([rings], this.mapBox.spatialReference).getTheLength();
        } else {
          this.drawingInfo.current = 0;
          this.drawingInfo.total = 0;
        }
        // currentLengthSpan.append('Current Length: ' + MeasureTool.lengthUnitConversion(this.drawingInfo.current));
        // totalLengthSpan.append('Total Length: ' + MeasureTool.lengthUnitConversion(this.drawingInfo.total));
        this.lengthAndArea = {
          currentLength: MeasureTool.lengthUnitConversion(this.drawingInfo.current),
          totalLength: MeasureTool.lengthUnitConversion(this.drawingInfo.total),
          totalArea: '',
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); //完成后bus派发一个完成事件，通知底部信息栏刷新
        // infoDiv.append(currentLengthSpan);
        // infoDiv.append(totalLengthSpan);
        // currentLengthSpan.style.margin = '3px';
        // totalLengthSpan.style.margin = '3px';
      } else if (this.drawingInfo.drawType === GeometryType.POLYGON) {
        // let areaDiv = document.createElement('span');
        let area = 0;
        if (pointCount >= 2) {
          let rings = [];
          this.drawingPointList.forEach((point) => {
            let tempPoint = [point.x, point.y];
            rings.push(tempPoint);
          });
          rings.push([point.x, point.y]);
          rings.push([this.drawingPointList[0].x, this.drawingPointList[0].y]);
          area = new Polygon([rings], this.mapBox.spatialReference).getTheArea();
        }
        // areaDiv.append('Area: ' + MeasureTool.areaUnitConversion(area));
        this.lengthAndArea = {
          currentLength: '',
          totalLength: '',
          totalArea: MeasureTool.areaUnitConversion(area),
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); //完成后bus派发一个完成事件，通知底部信息栏刷新
      }
    },
    clearDrawingInfoOverlay() {
      if (this.drawInfoOverlay) {
        this.mapBox.removeOverLay(this.drawInfoOverlay);
      }
      if (this.removeLatsPointOverlay) {
        this.mapBox.removeOverLay(this.removeLatsPointOverlay);
      }
      this.removeLatsPointOverlay = null;
      this.drawInfoOverlay = null;
      this.drawingPointList = [];
      this.drawingInfo.current = 0;
      this.drawingInfo.total = 0;
    },
  },
  destroyed() {
    this.$root.$off('refresh', this.clearDrawingInfoOverlay);
  },
};
</script>

<style lang="scss" scoped>
@import './newResource';
</style>
