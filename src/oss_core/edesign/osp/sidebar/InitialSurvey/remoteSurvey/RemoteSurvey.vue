<!--
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-02-13 17:23:22
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-06 14:55:16
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\sidebar\InitialSurvey\RemoteSurvey\RemoteSurvey.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="on-site-survey-container">
    <div class="surface-draw">
      <div class="sidebar-tab-title">{{ $t('INITIATE_SURVEY_SURVEY_MANUALLY_DRAWING') }}</div>
      <div class="surface-draw-type">
        <div class="single-type">
          <div class="single-type-title">{{ $t('INITIATE_SURVEY_SURVEY_BUILDING') }}</div>
          <div class="single-type-body">
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospduobianxing" :class="{'active':selectObj&&selectObj.resType==='A1'&&buildingShape==='Polygon'}" @click="addBuildings('A1','Polygon')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_FREE_HAND') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospT" :class="{'active':selectObj&&selectObj.resType==='A1'&&buildingShape==='T'}" @click="addBuildings('A1','T')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_T_TYPE') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospL" :class="{'active':selectObj&&selectObj.resType==='A1'&&buildingShape==='L'}" @click="addBuildings('A1','L')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_L_TYPE') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospdaoL" :class="{'active':selectObj&&selectObj.resType==='A1'&&buildingShape==='Unl'}" @click="addBuildings('A1','Unl')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_INVERTED_L_TYPE') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospzhengfangxing" :class="{'active':selectObj&&selectObj.resType==='A1'&&buildingShape==='Square'}" @click="addBuildings('A1','Square')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_SQUARE_TYPE') }}</label>
            </div>
          </div>
        </div>
        <div class="single-type">
          <div class="single-type-title">{{ $t('INITIATE_SURVEY_SURVEY_ROAD') }}</div>
          <div class="single-type-body">
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospdanxiangdaolu" :class="{'active':selectObj&&selectObj.resType==='A0'}" @click="addRoads('A0')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_SINGLE_LINE') }}</label>
            </div>
          </div>
        </div>
        <div class="single-type">
          <div class="single-type-title">{{ $t('INITIATE_SURVEY_SURVEY_BASE_FACILITIES') }}</div>
          <div class="single-type-body">
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospdiangan" :class="{'active':selectObj&&selectObj.resType==='B1'}" @click="addRoads('B1')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_POLE') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_osprenjing" :class="{'active':selectObj&&selectObj.resType==='A7'}" @click="addRoads('A7')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_MANHOLE') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospguandao" :class="{'active':selectObj&&selectObj.resType==='A8'}" @click="addRoads('A8')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_DUCT') }}</label>
            </div>
            <div class="single-type-des">
              <div class="shape-icon icon_osp icon_ospdiaoxian" :class="{'active':selectObj&&selectObj.resType==='B0'}" @click="addRoads('B0')"></div>
              <label class="type-shape">{{ $t('INITIATE_SURVEY_SURVEY_AIR_WIRE') }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="surface-action">
        <div class="surface-tips">
          <i class="info-icon icon_osp icon_osppoint"></i>
          {{ $t('INITIATE_SURVEY_SURVEY_SAVE_SURVEY_RESULT') }}
        </div>
        <button class="surface-save btn btn-primary" @click="saveDemand">{{ $t('SAVE') }}</button>
      </div>
    </div>
    <div class="auto-identify">
      <div class="sidebar-tab-title">{{ $t('INITIATE_SURVEY_SURVEY_AUTO_IDENTIFY') }}</div>
      <div class="identify-tips">{{ $t('INITIATE_SURVEY_SURVEY_DISPLAY_BUILDING') }}</div>
      <div class="mode-btn">
        <button type="button" class="btn btn-primary" :disabled="startFlag" @click="AutoIdentifyBuilding()">
          {{ $t('START') }}
        </button>
        <!-- <button type="button" class="btn" :class="modeFlag === 'end' ? 'btn-primary' : 'btn-default'" @click="changeMode('end');clearBuildings()">
          Clear Result
        </button> -->
      </div>
      <div class="identify-info">
        <div class="identify-info-title">{{ $t('INFORMATION') }}:</div>
        <div class="identify-info-content">
          <div class="identify-info-content-single" v-for="(item,index) in allInfo" :key="index">{{item}}</div>
        </div>
      </div>
    </div>
    <popup :popupObj="popupInfo" @popupClose="popupClose" @popupOk="popupExit" @popupOther="popupSave">
      <template v-slot:popupBody>
        <div class="operation-content">{{$t('INITIATE_SURVEY_SURVEY_OPERATION_NOT_SAVE')}}</div>
      </template>
    </popup>
  </div>
</template>
<script>
import * as Colors from '../../../design/drawStyle';
import { mapFlowIdentify } from '@/oss_core/edesign/api/add/project.js';
import { queryMapFlowState } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'RemoteSurvey',
  inject: ['getMapBox', 'getSurfaceLayerList', 'getProjectInfo'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  props: {
    tapName: {
      type: String,
    },
  },
  data() {
    return {
      // 新建的道路标记数组
      addRoadList: [],
      // 编辑的道路标记数组
      editRoadList: [],
      // 删除的道路标记数组
      deleteRoadList: [],
      popupInfo: {
        title: this.$t('INITIATE_SURVEY_SURVEY_OPERATION_TIPS'), // 弹框标题
        other: 'Save', //弹窗其他按钮
        ok: 'Exit', // 确认按钮内容
        close: 'Cancel', // 取消按钮内容
        modal: true, // 是否蒙层
        width: '500px', // 宽
        height: '150px', // 高
        show: false,
        zIndex: 10,
        el: 'body', //指定插入节点
        drag: true,
        resize: 'both',
      },
      drawingPointList: [],
      drawUndo: false,
      surfaceRestype: [],
      isShowBaseFacilities: false,
      // modeFlag: 'start',
      gridGraphics: [],
      buildingState: '',
      allInfo: [],
      selectObj: '',
      buildingShape: '',
      startFlag: false,
    };
  },
  created() {
    this.getGridGraphics();
  },
  mounted() {
    this.demandSurfaceList = this.surfaceLayerList.filter((item) => item.isSysLayer === 'Y');
    // .filter(
    //   item => item.resType === 'A0' || item.resType === 'A1' || item.resType === 'A7' || item.resType === 'A8'
    // );
    this.initShowBaseFacilities();
    this.mapBox.addTempLayer('demandBuilding');
    this.temLayer = this.mapBox._tempLayerList.get('demandBuilding');
  },
  activated() {
    this.timer && clearInterval(this.timer);
    this.queryStateBuilding();
    this.timer = setInterval(this.queryStateBuilding, 10000);
    this.mapBox.addTempLayer('demandBuilding');
  },
  deactivated() {
    if (this.addRoadList.length || this.editRoadList.length || this.deleteRoadList.length) {
      this.popupInfo.show = true;
    } else {
      this.clearDatas();
      this.$root.$emit('refresh');
    }
  },
  methods: {
    popupSave() {
      this.saveDemand();
      this.popupInfo.show = false;
      this.clearDatas();
    },
    popupExit() {
      this.mapBox.refresh();
      this.popupInfo.show = false;
      this.clearDatas();
    },
    popupClose() {
      this.popupInfo.show = false;
    },
    // 退出远程工勘要处理的操作
    clearDatas() {
      this.allInfo = [];
      this.buildingState = '';
      this.selectObj = '';
      this.mapBox.getDrawTool().deactivate();
      this.timer && clearInterval(this.timer);
      this.drawUndo = false;
      this.initSurfaceManage();
      this.mapBox.removeTempLayer('demandBuilding');
    },
    // 查询识别状态
    queryStateBuilding() {
      // if (this.buildingState && this.buildingState !== 'P') {
      //   return;
      // }
      queryMapFlowState(this.projectInfo.sprintId).then((res) => {
        let orderData = res.resultData.TASK_LIST;
        if (orderData.length > 0) {
          this.buildingState = orderData[orderData.length - 1].state;
          let date = this.GetDateTime();
          this.allInfo.push(date + ' ' + orderData[orderData.length - 1].stateDesc);
          if (this.buildingState !== 'P') {
            this.timer && clearInterval(this.timer);
          }
        } else {
          this.timer && clearInterval(this.timer);
          this.startFlag = false;
        }
      });
    },
    // 获取当前时间
    GetDateTime() {
      var getDate = new Date();

      let dateYear = getDate.getFullYear(); //获取年

      let dateMonth = getDate.getMonth() + 1; //获取月

      let dateDate = getDate.getDate(); //获取当日

      let dateHours = getDate.getHours(); //获取小时

      let dateMinutes = getDate.getMinutes(); //获取分钟

      let dateSeconds = getDate.getSeconds(); //获取秒

      dateMonth = dateMonth < 10 ? '0' + dateMonth : dateMonth;

      dateDate = dateDate < 10 ? '0' + dateDate : dateDate;

      dateHours = dateHours < 10 ? '0' + dateHours : dateHours;

      dateMinutes = dateMinutes < 10 ? '0' + dateMinutes : dateMinutes;

      dateSeconds = dateSeconds < 10 ? '0' + dateSeconds : dateSeconds;

      return dateYear + '-' + dateMonth + '-' + dateDate + ' ' + dateHours + ':' + dateMinutes + ':' + dateSeconds;
    },
    // 初始化基础设施按钮
    initShowBaseFacilities() {
      this.surfaceRestype = this.demandSurfaceList.map((item) => {
        return item.resType;
      });
      if (
        this.surfaceRestype.indexOf('A7') > -1 ||
        this.surfaceRestype.indexOf('A8') > -1 ||
        this.surfaceRestype.indexOf('B1') > -1 ||
        this.surfaceRestype.indexOf('B0') > -1
      ) {
        this.isShowBaseFacilities = true;
      }
    },
    // 初始化新增编辑和删除地貌类型的数组
    initSurfaceManage() {
      this.addRoadList = [];
      this.editRoadList = [];
      this.deleteRoadList = [];
      this.selectObj = '';
    },
    // 新增建筑物标记
    addBuildings(resType, type) {
      this.buildingShape = type;
      let data = this.demandSurfaceList.find((item) => item.resType === resType);
      this.selectObj = data;
      if (type === 'Polygon') {
        this.mapBox.clear(false);
        this.drawDemands(data);
      } else {
        let drawTool = this.mapBox.getDrawTool();
        let pic = new this.$map.CompositeSymbol(
          [
            {
              style: Colors.mouseStyle,
              geometry: (geo) => {
                if (geo.geometry.geometryType === this.$map.GeometryType.POINT) {
                  return geo.geometry;
                }
                return null;
              },
            },
            {
              style: Colors.defalutLine,
            },
          ],
          3857,
        );
        drawTool.markerSymbol = pic;
        this.mapBox.addDrawToolListener(this.$map.DrawType.POINT, this.drawRegularGeo(pic, type, data));
      }
    },
    // 新增道路标记
    addRoads(resType) {
      let data = this.demandSurfaceList.find((item) => item.resType === resType);
      this.selectObj = data;
      this.mapBox.clear(false);
      this.drawDemands(data);
    },
    // 新增规则图形
    drawRegularGeo(pic, type, data) {
      return (evt) => {
        let geo;
        if (type === 'L') {
          geo = this.mapBox.createLGeometryBycenter(evt.geometry);
        } else if (type === 'Unl') {
          geo = this.mapBox.createUnlGeometryBycenter(evt.geometry);
        } else if (type === 'T') {
          geo = this.mapBox.createTGeometryBycenter(evt.geometry);
        } else if (type === 'Square') {
          geo = this.mapBox.createSquareGeometryBycenter(evt.geometry);
        }
        let fillSymbol = new this.$map.CompositeSymbol([
          {
            style: geo.geometryType === this.$map.GeometryType.POLYGON ? Colors.fillPolygonColor : Colors.mouseStyle,
            geometry: null,
          },
          {
            style: Colors.defalutLine,
          },
        ]);
        this.mapBox.addGeometry(
          geo.__.ol_uid,
          geo,
          fillSymbol,
          { reResType: data.resType, reLayerNo: data.layerNo, id: geo.__.ol_uid },
          'demandBuilding',
        );
        this.addRoadList.push(geo.__.ol_uid);
        this.mapBox.addDrawToolListener(this.$map.DrawType.POINT, this.drawRegularGeo(pic, type, data));
      };
    },
    // 绘制时的效果
    prepareDraw(obj) {
      let drawTool = this.mapBox.getDrawTool();
      if (obj.geometryType === this.$map.GeometryType.POINT) {
        let pic;
        if (obj.resType === 'A7') {
          pic = new this.$map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/manhole_add.png', 20, 20, 0, 0, 0, false, null, 16);
        } else if (obj.resType === 'B1') {
          pic = new this.$map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/chamber_add.png', 16, 16, 0, 0, 0, false, null, 20);
        }
        drawTool.markerSymbol = pic;
      } else {
        drawTool.markerSymbol =
          drawTool.lineSymbol =
          drawTool.fillSymbol =
            new this.$map.CompositeSymbol([
              {
                style: Colors.mouseStyle,
                geometry: (geo) => {
                  if (geo.geometry.geometryType === this.$map.GeometryType.POINT) {
                    return geo.geometry;
                  }
                  return null;
                },
              },
              {
                style: Colors.defalutLine,
              },
            ]);
      }
    },
    // 绘制地貌
    drawDemands(data) {
      this.prepareDraw(data);
      let fillSymbol = new this.$map.CompositeSymbol([
        {
          style: this.selectObj.geometryType === this.$map.GeometryType.POLYGON ? Colors.fillPolygonColor : Colors.mouseStyle,
          geometry: null,
        },
        {
          style: Colors.defalutLine,
        },
      ]);
      if (this.selectObj.geometryType === this.$map.GeometryType.POLYGON) {
        this.drawUndo = true;
        this.mapBox.addMouseClickListener((point) => {
          this.drawingPointList.push(point);
        });
        this.mapBox.drawPolygon((graphic) => {
          this.mapBox.addGeometry(
            graphic.id,
            graphic.geometry,
            fillSymbol,
            { reResType: data.resType, reLayerNo: data.layerNo, id: graphic.id },
            'demandBuilding',
          );
          this.addRoadList.push(graphic.id);
          this.drawDemands(data);
        });
      } else if (this.selectObj.geometryType === this.$map.GeometryType.POLYLINE) {
        this.drawUndo = true;
        this.mapBox.addMouseClickListener((point) => {
          this.drawingPointList.push(point);
        });
        this.mapBox.drawLine((graphic) => {
          this.mapBox.addGeometry(
            graphic.id,
            graphic.geometry,
            fillSymbol,
            { reResType: data.resType, reLayerNo: data.layerNo, id: graphic.id },
            'demandBuilding',
          );
          this.addRoadList.push(graphic.id);
          this.drawDemands(data);
        });
      } else {
        let pic;
        if (data.resType === 'A7') {
          pic = new this.$map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/manhole_add.png', 16, 16, 0, 0, 0, false, null, 16);
        } else if (data.resType === 'B1') {
          pic = new this.$map.PictureMarkerSymbol('oss_core/edesign/assets/image/map/surface-png/chamber_add.png', 16, 16, 0, 0, 0, false, null, 16);
        }
        this.mapBox.drawPoint((graphic) => {
          this.mapBox.addGeometry(
            graphic.id,
            graphic.geometry,
            pic,
            { reResType: data.resType, reLayerNo: data.layerNo, id: graphic.id },
            'demandBuilding',
          );
          this.addRoadList.push(graphic.id);
          this.drawDemands(data);
        });
      }
    },
    rightClickDraw() {
      this.drawingPointList.splice(-1, 1);
    },
    // 保存新增和编辑以及删除的地貌
    saveDemand() {
      console.log(this.tapName);
      let promiseList = [];
      let allAddGraphic = [];
      let allEditGraphic = [];
      let allDeleteGraphic = [];
      this.addRoadList.forEach((id, index) => {
        let graphic = this.mapBox.findGeometryByLayerNo('demandBuilding', id);
        if (graphic) {
          let newGraphic = new this.$map.Graphic(id, graphic.attributes.reLayerNo, graphic.geometry.clone(), null, graphic.attributes);
          allAddGraphic.push(newGraphic);
        }
      });
      this.editRoadList.forEach((id, index) => {
        let graphic = this.mapBox.findGeometryByLayerNo('demandBuilding', id);
        let newGraphic = new this.$map.Graphic(id, graphic.attributes.reLayerNo, graphic.geometry.clone(), null, graphic.attributes);
        if (graphic) {
          allEditGraphic.push(newGraphic);
        }
      });
      this.deleteRoadList.forEach((graphic) => {
        let newGraphic = new this.$map.Graphic(graphic.id, graphic.attributes.reLayerNo, graphic.geometry.clone(), null, graphic.attributes);
        allDeleteGraphic.push(newGraphic);
      });
      this.demandSurfaceList.forEach((item) => {
        let addList = [];
        let editList = [];
        let deleteList = [];
        allAddGraphic.map((adds) => {
          if (adds.layerNo === item.layerNo) {
            addList.push(adds);
          }
        });
        allEditGraphic.map((edits) => {
          if (edits.layerNo === item.layerNo) {
            editList.push(edits);
          }
        });
        allDeleteGraphic.map((deletes) => {
          if (deletes.layerNo === item.layerNo) {
            deleteList.push(deletes);
          }
        });
        if (addList.length > 0 || editList.length > 0 || deleteList.length > 0) {
          promiseList.push(this.saveSingleDemand(addList, editList, deleteList));
        }
      });
      Promise.all(promiseList).then(() => {
        this.mapBox.refresh();
        let temLayer = this.mapBox._tempLayerList.get('demandBuilding');
        temLayer.clear();
        this.initSurfaceManage();
        fish.success(this.$t('OPERATION_SUCCESS'));
      });
    },
    // 保存每种地貌类型
    saveSingleDemand(addList, editList, deleteList) {
      return new Promise((resolve) => {
        this.$map.batchAddGeometry(addList).then((addRes) => {
          this.$map.batchUpdateGeometryById(editList).then((editRes) => {
            this.$map.batchDeleteGeometry(deleteList).then(() => {
              // this.graphics = this.graphics.contact(addRes).contact(editRes);
              resolve();
            });
          });
        });
      });
    },
    // changeMode(mode) {
    //   this.modeFlag = mode;
    // },
    // 获取规划网格
    async getGridGraphics() {
      let filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.projectInfo.sprintId });
      let layerNo = 'PLAN_GRID';
      let featureLayers = { layerNo: layerNo, filter: filter };
      this.gridGraphics = (await this.$map.getByFeatureLayer(featureLayers)) || [];
    },
    AutoIdentifyBuilding() {
      this.selectObj = '';
      this.mapBox.getDrawTool().deactivate();
      this.startFlag = true;
      let graph = this.gridGraphics[0];
      let coordinate = graph.geometry.getRings()[0].map((item) => {
        return this.mapBox.map.toCoordinate(item);
      });
      let params = {
        projectId: this.projectInfo.sprintId,
        wdType: 'Buildings',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinate],
        },
      };
      if (this.buildingState === 'C') {
        fish.warn(this.$t('RIGHT_MENU_CANNOT_REPEAT_IDENTIRY_BUILDINGS'));
      } else if (this.buildingState !== 'P') {
        mapFlowIdentify(params).then((res) => {
          if (res.resultCode === '-1') {
            fish.warn(res.resultDesc);
            this.startFlag = false;
          } else {
            this.timer && clearInterval(this.timer);
            this.queryStateBuilding();
            this.timer = setInterval(this.queryStateBuilding, 10000);
          }
        });
      }
    },
    // 清除已经识别过的区域的建筑物
    clearBuildings() {
      let layer = this.demandSurfaceList.find((item) => item.resType === 'A1');
      let filterParam = {
        geometryName: 'geom',
        geometry: this.gridGraphics[0].geometry,
        spatialReference: this.$map.SupportSpatialReferences.WEB_MERCATOR,
      };
      let finalFilter = this.$map.Filter.intersects(filterParam);
      finalFilter = this.$map.Filter.and(finalFilter, this.$map.Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId }));
      let featureLike = {
        layerNo: layer.layerNo,
        filter: finalFilter,
        returnGeometry: true,
      };
      this.$map.getByFeatureLayer(featureLike).then((res) => {
        let graphics = res;
        this.$map.batchDeleteGeometry(graphics).then((data) => {
          this.mapBox.refresh();
          fish.success(this.$t('OPERATION_SUCCESS'));
        });
      });
    },
  },
  watch: {
    buildingState: {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val && (val === 'P' || val === 'C')) {
          this.startFlag = true;
        } else {
          this.startFlag = false;
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import './remoteSurvey';
</style>
