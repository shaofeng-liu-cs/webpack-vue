<template>
  <div class="new-resource-content-box">
    <div v-for="(items, indexs) in newResourceData" :key="indexs" :class="`new-resource-container ${items.show ? '' : 'hideBox'}`">
      <div class="resource-item-title">
        <span class="re-tit-h3">{{ items.resGroup }}</span>
        <span class="re-tit-option" @click="items.show = !items.show">
          <i :class="`icon_osp  ${items.show ? 'icon_ospdown' : 'icon_ospup'}`"></i>
          <!-- <span class="opt-text">{{$t(hideContent.includes(indexs)?'OPEN':'STOW')}}</span> -->
        </span>
      </div>
      <!-- 当数据有三层的时候，第二层的数组名暂定为childItemData -->
      <div class="new-resource-itemlist">
        <div v-for="(item, index) in items.childData" :key="index" class="itemlist-itembox-parent">
          <div class="itemlist-itembox" :class="{active: selectRes.layerNo === item.layerNo} " :title="item.name" @click="toolbarBtn(item)">
            <div class="item-iconbox"><img :src="item.iconUrl" alt="" /></div>
            <div class="item-titlebox">{{item.resName}}</div>
          </div>
          <template v-if="item.hldTemplates && item.hldTemplates.length">
            <div :class="`hove-box-sanjiao ${indexs===newResourceData.length-1?'sanjiao-top':'sanjiao-bottom'}`"></div>
            <div :class="`hove-resource-itemlist item_${index%4} ${indexs>newResourceData.length-2?'hover-top':'hover-bottom'}`">
              <div v-for="(it, index) in item.hldTemplates" :key="index" :class="{active: it.hldTemplateId === item.hldTemplateId} " class="hover-itemlist-itembox" @click="toolbarBtn(item,it)" :title="it.hldTemplateName">
                <div class="hover-item-iconbox">
                  <img :src="it.iconUrl" alt="" />
                </div>
                <div class="hover-item-titlebox">{{it.hldTemplateName}}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- <QuickInput ref="quickInput" @attrChange="attrChange"></QuickInput> -->
  </div>
</template>
<script>
import { SupportSpatialReferences, GeometryType, MeasureTool, Polyline, Polygon, DrawType } from 'map';
// import QuickInput from './quickInput/QuickInput.vue';
import * as Color from '../../design/drawStyle.js';
import { bindAz } from '../../domain/ResEventHandler.js';

export default {
  name: 'NewResource',
  components: {
    // QuickInput,
  },
  inject: ['getProjectInfo', 'getMapBox', 'getControlData', 'getSchemaConfigs', 'defaultStyle', 'getHldTempleteTree'],
  data() {
    return {
      newResourceData: [], // 新建资源列表
      removeLatsPointOverlay: null,
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
      attributes: {}, // 当前所选功能模板自带属性
      selectRes: {}, // 当前选择新建的资源信息
      drawUndo: false, // 是否开启右键撤回
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    controlData() {
      return this.getControlData();
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
    hldTempleteTree() {
      return this.getHldTempleteTree();
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'controlData.btnActiveName': function (val) {
      if (val !== 'newResource') {
        this.clearDrawingInfoOverlay();
      }
    },
  },
  created() {
    const newlist = [];
    const isSprint = this.getProjectInfo().flowState === 'OS1' || this.getProjectInfo().markFlag === 'sprint';
    const allTree = this.hldTempleteTree;
    let resGroupI18n;
    if (this.hldTempleteTree[0].resGroupI18n === 'Fiber Network') {
      resGroupI18n = 'Marker Class';
    } else {
      resGroupI18n = '标记类';
    }
    allTree.push({
      hldTemplateResTypes: [
        {
          layerNo: 'EDESIGN_MAP_MARKER_POINT',

          resName: 'Marker Point',

          resType: 'EDESIGN_MAP_MARKER_POINT',
        },
        {
          layerNo: 'EDESIGN_MAP_MARKER_LINE',

          resName: 'Marker Line',

          resType: 'EDESIGN_MAP_MARKER_LINE',
        },
        {
          layerNo: 'EDESIGN_MAP_MARKER_GRID',

          resName: 'Marker Grid',

          resType: 'EDESIGN_MAP_MARKER_GRID',
        },
      ],
      resGroupI18n,
    });
    if (isSprint) {
      allTree.forEach(item => {
        const network = {
          resGroup: item.resGroupI18n, // 组名 多语言,
          childData: [],
          show: true,
        };
        if (item.resGroup === 'Space Network') {
          (item.hldTemplateResTypes || []).forEach(it => {
            if (it.resType !== 'SITE' && it.resType !== 'PLAN_GRID' && it.resType !== 'TASK_GRID') {
              this.setChild(it);
              network.childData.push(it);
            }
          });
          newlist.push(network);
        }
      });
    } else {
      allTree.forEach(item => {
        const network = {
          resGroup: item.resGroupI18n, // 组名 多语言,
          childData: [],
          show: true,
        };
        (item.hldTemplateResTypes || []).forEach(it => {
          if (it.resType !== 'SPLITTER' && it.resType !== 'PLAN_GRID' && it.resType !== 'TASK_GRID') {
            this.setChild(it);
            network.childData.push(it);
          }
        });
        newlist.push(network);
      });
    }
    this.newResourceData = newlist;
    // a~z 排序 顺序每次都边 暂时不用
    // this.newResourceData = this.newResourceData.sort((a, b) => a.resGroup.toLowerCase().charCodeAt(0) - b.resGroup.toLowerCase().charCodeAt(0));
    // console.log('数据：', JSON.parse(JSON.stringify(this.newResourceData)));
  },

  mounted() {
    this.$root.$on('refresh', this.clearDrawingInfoOverlay);
  },
  activated() {
    this.selectRes = {};
    this.controlData.btnActiveName = 'newResource';
    this.drawUndo = false;
  },
  deactivated() {
    this.$parent.$parent.$refs.quickInput.popupObj.show = false;
    this.clearDrawingInfoOverlay();
    // this.mapBox.clear();
  },
  destroyed() {
    this.$root.$off('refresh', this.clearDrawingInfoOverlay);
  },
  methods: {
    setChild(it) {
      const layerNoInfo = (it.layerNos || []).find(item => item.layerType === 'C' && item.layerNo !== 'ROUTE-C') || {};
      it.layerNo = layerNoInfo.layerNo ? layerNoInfo.layerNo : it.layerNo;
      this.$set(it, 'iconUrl', this.defaultStyle[it.resType].iconUrl);
      this.$set(it, 'name', it.resName);
      it.style = this.defaultStyle[it.resType];
    },
    setHld(it, hldInfo) {
      let newHldInfo;
      if (hldInfo) {
        newHldInfo = hldInfo;
      } else if (it.hldTemplateId) {
        newHldInfo = it.hldTemplates.find(item => item.hldTemplateId === it.hldTemplateId);
      } else {
        return;
      }
      it.iconUrl = newHldInfo.iconUrl;
      it.name = newHldInfo.hldTemplateName;
      it.hldTemplateId = newHldInfo.hldTemplateId;
      it.style = JSON.parse(newHldInfo.styleJson);
      this.attributes.hldTemplateId = newHldInfo.hldTemplateId;
      newHldInfo.attrs.forEach(item => {
        if (item.attrName) {
          this.attributes[item.attrName] = item.attrVal;
        }
      });
    },
    toolbarBtn(item, hldData) {
      this.controlData.btnActiveName = 'newResource';
      this.clearDrawingInfoOverlay();
      this.attributes = {};
      if (['EDESIGN_MAP_MARKER_POINT', 'EDESIGN_MAP_MARKER_LINE', 'EDESIGN_MAP_MARKER_GRID'].indexOf(item.layerNo) > -1) {
        this.$parent.$parent.$refs.quickInput.queryStyle(item.layerNo, 'add');
        this.$parent.$parent.$refs.quickInput.showRestype = 'maker';
      } else {
        this.setHld(item, hldData);
        this.$parent.$parent.$refs.quickInput.queryAttrInfo(item.resType, this.attributes);
        this.$parent.$parent.$refs.quickInput.showRestype = 'resource';
      }
      this.selectRes = item;
      this.prepareAddGraphic();
    },
    prepareAddGraphic() {
      this.mapBox.clear();
      this.mapBox.deactiveSelect();
      const obj = this.mapBox.findLayer(this.selectRes.layerNo);
      const drawTool = this.mapBox.getDrawTool();
      if (obj.geometryType === GeometryType.POINT) {
        const imgInfo = this.selectRes.style;
        const pic = new this.$map.PictureMarkerSymbol(this.selectRes.iconUrl, imgInfo.imgSize, imgInfo.imgSize, 0, 0, 0, false, null, imgInfo.size);
        drawTool.markerSymbol = pic;
        this.mapBox.addDrawToolListener(DrawType.POINT, this.drawPoint(pic));
      } else if (obj.geometryType === GeometryType.POLYLINE) {
        this.drawUndo = true;
        this.drawingInfo.drawType = GeometryType.POLYLINE;
        drawTool.lineSymbol = new this.$map.CompositeSymbol(
          [
            {
              style: Color.mouseStyle,
              geometry: geo => {
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
        this.mapBox.addDrawToolListener(DrawType.POLYLINE, this.drawPolyline());
        this.mapBox.addMouseMoveListener(point => {
          this.addDrawInfoOverlay(point);
        });
        this.mapBox.addMouseClickListener(point => {
          this.drawingPointList.push(point);
        });
      } else {
        this.drawUndo = true;
        drawTool.fillSymbol = new this.$map.CompositeSymbol([
          {
            style: Color.mouseStyle,
            geometry: geo => {
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
        this.mapBox.addMouseClickListener(point => {
          this.drawingPointList.push(point);
        });
        this.mapBox.addMouseMoveListener(point => {
          this.addDrawInfoOverlay(point);
        });
        this.drawingInfo.drawType = GeometryType.POLYGON;
        this.mapBox.addDrawToolListener(DrawType.POLYGON, this.drawPolygon());
      }
    },
    drawPoint(pic) {
      return evt => {
        const graphic = evt.toJSON();
        evt.symbol = pic;
        const transferred = evt.geometry.transferProjection(SupportSpatialReferences.WGS84);
        graphic.attributes.longitude = transferred.x;
        graphic.attributes.latitude = transferred.y;
        this.addGraphic(graphic);
        this.mapBox.addDrawToolListener(DrawType.POINT, this.drawPoint(pic));
      };
    },
    drawPolyline() {
      return evt => {
        let lineStyle;
        if (this.selectRes.layerNo.includes('Pipeline')) {
          lineStyle = Color.pipeline;
        } else if (this.selectRes.layerNo.includes('AIR')) {
          lineStyle = Color.airWire;
        } else if (this.selectRes.layerNo.includes('Copper')) {
          lineStyle = Color.copper;
        } else {
          lineStyle = Color.fiber;
        }
        evt.symbol = lineStyle;
        const graphic = evt.toJSON();
        const paths = graphic.geometry.getPaths()[0];
        // eslint-disable-next-line vue/max-len
        const length = paths.reduce(
          (total, currentValue, currentIndex, arr) =>
            currentIndex === 0 ? 0 : this.mapBox.calculateLength(arr[currentIndex - 1], currentValue) + total,
          0,
        );
        graphic.attributes.gisLen = length;
        this.addGraphic(graphic);
        this.lengthAndArea = {
          currentLength: '',
          totalLength: '',
          totalArea: '',
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); // 完成后bus派发一个完成事件，通知底部信息栏刷新
        this.mapBox.addDrawToolListener(DrawType.POLYLINE, this.drawPolyline());
      };
    },
    drawPolygon() {
      return evt => {
        const graphic = evt.toJSON();
        const rings = graphic.geometry.getRings()[0];
        graphic.attributes.gisArea = this.mapBox.calculateArea(rings);
        this.addGraphic(graphic);
        this.lengthAndArea = {
          currentLength: '',
          totalLength: '',
          totalArea: '',
        };
        this.$root.$emit('lengthAndArea', this.lengthAndArea); // 完成后bus派发一个完成事件，通知底部信息栏刷新
        this.mapBox.addDrawToolListener(DrawType.POLYGON, this.drawPolygon());
      };
    },
    addGraphic(graphic) {
      const { layerNo } = this.selectRes;
      const { resName } = this.selectRes;
      if (['EDESIGN_MAP_MARKER_POINT', 'EDESIGN_MAP_MARKER_LINE', 'EDESIGN_MAP_MARKER_GRID'].indexOf(layerNo) > -1) {
        if (!this.attributes || !this.attributes.style) {
          fish.warn(this.$t('NEW_RESOURCE_SELECT_MARKER_STYLE'));
          this.mapBox.clear();
          return;
        }
      }
      if (this.getProjectInfo().markFlag === 'sprint') {
        Object.assign(graphic.attributes, {
          resStatus: 'C',
          projectId: this.getProjectInfo().projectId,
          sprintId: this.getProjectInfo().sprintId,
          isSprintGrid: 'Y',
        });
      } else {
        Object.assign(graphic.attributes, {
          resStatus: 'C',
          projectId: this.getProjectInfo().projectId,
          schemaId: this.getProjectInfo().schemaId,
          sprintId: this.getProjectInfo().sprintId,
          isSprintGrid: 'N',
        });
      }
      Object.assign(graphic.attributes, this.attributes);
      // console.log('在地图添加元素', graphic, this.attributes);
      this.$map
        .addGeometry(layerNo, graphic)
        .then(res => {
          res.attributes = Object.assign(res.attributes, { resName: `${resName}-${res.attributes.objectid}`, resNo: '' });
          this.$map.editAttributeById(layerNo, res).then(() => {
            if (layerNo === 'PIPELINE_G-C' || layerNo === 'F_CABLE-C' || layerNo === 'AIR_WIRE-C' || layerNo === 'C_CABLE-C') {
              this.mapContainer = this.mapBox;
              this.graphic = [res];
              this.autoBind = true;
              bindAz(this);
            }
            const { stackDepth } = this.schemaConfigs;
            this.mapBox.addUndo(this.deleteGraphicPromise(layerNo, resName, graphic), stackDepth);
            this.$root.$emit('changeUnDoCount', 'undo');
            // this.refreshTree();
            // this.mapBox.setSelected([graphic])
            this.mapBox.refreshLayer(layerNo);
            this.mapBox._drawLayer.clear();
            this.$emit('showTips', res, 'add');
            this.clearDrawingInfoOverlay();
          });
        })
        .catch(() => {
          this.clearDrawingInfoOverlay();
        });
    },
    deleteGraphicPromise(layerNo, resName, graphic) {
      return () =>
        new Promise(resolve => {
          this.$map.deleteGeometry(layerNo, graphic.attributes.gisKey).then(() => {
            this.$emit('showTips', graphic, 'del');
            this.mapBox.refreshLayer(layerNo);
          });
          resolve(this.addGraphPromise(layerNo, resName, graphic));
        });
    },
    addGraphPromise(layerNo, resName, graphic) {
      return () =>
        new Promise(resolve => {
          this.$map.addGeometry(layerNo, graphic).then(res => {
            this.$emit('showTips', graphic, 'add');
            this.mapBox.refreshLayer(layerNo);
            resolve(this.deleteGraphicPromise(layerNo, resName, res.toJSON()));
          });
        });
      // return this.deleteGraphic(layerNo,resName,graphic)
    },
    rightClickDraw() {
      this.drawingPointList.splice(-1, 1);
    },
    addDrawInfoOverlay(point) {
      const pointCount = this.drawingPointList.length;
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
        const rings = [];
        this.drawingPointList.forEach(point1 => {
          const tempPoint = [point1.x, point1.y];
          rings.push(tempPoint);
        });
        this.drawingInfo.total = this.drawingInfo.current + new Polyline([rings], this.mapBox.spatialReference).getTheLength();
      } else {
        this.drawingInfo.current = 0;
        this.drawingInfo.total = 0;
      }
      this.lengthAndArea = {
        currentLength: MeasureTool.lengthUnitConversion(this.drawingInfo.current),
        totalLength: MeasureTool.lengthUnitConversion(this.drawingInfo.total),
        totalArea: '',
      };
      if (this.drawingInfo.drawType === GeometryType.POLYGON && pointCount >= 2) {
        const rings = [];
        this.drawingPointList.forEach(point2 => {
          const tempPoint = [point2.x, point2.y];
          rings.push(tempPoint);
        });
        rings.push([point.x, point.y]);
        rings.push([this.drawingPointList[0].x, this.drawingPointList[0].y]);
        const area = new Polygon([rings], this.mapBox.spatialReference).getTheArea() || 0;
        const total = new Polyline([rings], this.mapBox.spatialReference).getTheLength() || 0;
        this.lengthAndArea.total = MeasureTool.lengthUnitConversion(total);
        this.lengthAndArea.totalArea = MeasureTool.areaUnitConversion(area);
      }
      this.$root.$emit('lengthAndArea', this.lengthAndArea); // 完成后bus派发一个完成事件，通知底部信息栏刷新
    },
    clearDrawingInfoOverlay() {
      if (this.removeLatsPointOverlay) {
        this.mapBox.removeOverLay(this.removeLatsPointOverlay);
      }
      this.removeLatsPointOverlay = null;
      this.drawingPointList = [];
      // this.drawingInfo.drawType = null;
      this.drawingInfo.current = 0;
      this.drawingInfo.total = 0;
      this.lengthAndArea = {
        currentLength: '',
        totalLength: '',
        totalArea: '',
      };
      this.$root.$emit('lengthAndArea', this.lengthAndArea); // 完成后bus派发一个完成事件，通知底部信息栏刷新
    },
    // // attr改变事件
    // attrChange(key, value) {
    //   this.attributes[key] = value;
    // },
  },
};
</script>

<style lang="scss" scoped>
@import './newResource';
</style>
