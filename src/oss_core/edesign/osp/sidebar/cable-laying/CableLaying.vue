<template>
  <div class="cableLaying-class sidebar-body">
    <form class="form-group" ref="cableTypeForm">
      <div class="blue-div">
        <h5 class="bule-title-noborder col-md-10">{{ $t('LAYING_SELECT_DEVICE') }}</h5>
        <div class="col-md-2 btn btn-link icon_osp" :class="selectShowFlag ? 'icon_ospdown showFlag-class' : 'icon_ospup showFlag-class'" @click="showSelect"></div>
      </div>
      <div v-show="selectShowFlag">
        <div class="col-md-12 a1">
          <div class="col-md-3 select-device">{{ $t('LAYING_A_DEVICE') }}</div>
          <div class="col-md-6">
            <input type="text" name="aDevice" class="form-control" v-model="aDevice" disabled>
          </div>
          <div class="col-md-3 btn btn-link icon_osp icon_ospxuanze select-device " @click="selectDevice('A')"></div>
        </div>
        <div class="col-md-12 zDevice">
          <div class="col-md-3 select-device">{{ $t('LAYING_Z_DEVICE') }}</div>
          <div class="col-md-6">
            <input type="text" name="zDevice" class="form-control" v-model="zDevice" disabled>
          </div>
          <div class="col-md-3 btn btn-link icon_osp icon_ospxuanze select-device" @click="selectDevice('Z')"></div>
        </div>
        <!-- <div class="col-md-12">
                    <div class="col-md-3 type-label">
                        <label class="control-label required-label">{{$t('LAYING_CABLE_TYPE')}}</label>
                    </div>
                    <div class="col-md-6">
                        <Combobox class="form-control" name="cableType" v-model="cableType" :setting="cableTypeSetting" dataRule="required"></Combobox>
                    </div>
                </div> -->
      </div>
    </form>
    <form class="form-group">
      <div class="blue-div">
        <h5 class="bule-title-noborder route-class col-md-10">{{ $t('LAYING_CABLE_ROUTE') }}</h5>
        <div class="col-md-2 btn btn-link icon_osp" :class="gridShowFlag ? 'icon_ospdown showFlag-class' : 'icon_ospup showFlag-class'" @click="showGrid"></div>
      </div>
      <div class="grid-class" v-show="gridShowFlag">
        <Grid :data='gridData' :option='gridOpt' ref="gridRef">
          <grid-column label='' prop="gisKey" :hidden='true'></grid-column>
          <grid-column label='' prop="resId" :hidden='true'></grid-column>
          <grid-column :label="$t('DELETE')" width='60'>
            <template slot-scope="{ row }">
              <div v-if="row.seq === 1 || row.seq === gridData.length"></div>
              <div v-else class="btn btn-link icon_osp icon_ospshanchu1 remove-node" @click="removeNode(row)"></div>
            </template>
          </grid-column>
          <grid-column :label="$t('SETTING_SEQ')" prop="seq" width='60'></grid-column>
          <grid-column :label="$t('NAME')" prop="resName" width='130'></grid-column>
          <grid-column :label="$t('LAYING_LONGITUDE')" prop='longitude' width='160'></grid-column>
          <grid-column :label="$t('LAYING_LATITUDE')" prop="latitude" width='140'></grid-column>
        </Grid>
      </div>
    </form>
    <form class="form-group">
      <h5 class="bule-title sidebar-tab-title">{{ $t('LAYING_CREATE_MODE') }}</h5>
      <div class="btn-mode">
        <button type="button" class="free-class" :class="layingType === 'free' ? 'btn btn-primary' : ' btn btn-default' " @click="changeMode('free')" :disabled="gridData.length < 2">{{ $t('LAYING_FREE_HAND') }}
        </button>
        <button type="button" class="fast-class" :class="layingType === 'fast' ? 'btn btn-primary' : ' btn btn-default' " @click="changeMode('fast')" :disabled="gridData.length < 2">{{ $t('LAYING_FAST_LAYING') }}
        </button>
      </div>
    </form>
    <form class="form-group route-from">
      <h5 class="bule-title sidebar-tab-title">{{ $t('LAYING_ROUTE_RESULT') }}</h5>
      <div class="result-route">
        <!-- <div class="route-type col-md-12">
                    <div class="col-md-6 recommend-class" @click="changeRouteType('recommend')" :style="routeType === 'recommend' ? routeStyle : noneRouteStyle">{{$t('LAYING_RECOMMEND')}}</div>

                    <div class="col-md-6 short-class" @click="changeRouteType('short')" :style="routeType === 'short' ? routeStyle : noneRouteStyle">{{$t('LAYING_SHORT_ROUTE')}}</div>
                </div> -->
        <div class="v9-tap-head">
          <div :class="{active: routeType === 'recommend'}" @click="changeRouteType('recommend')">
            {{ $t('LAYING_RECOMMEND') }}
          </div>
          <div :class="{active: routeType === 'short'}" @click="changeRouteType('short')">
            {{ $t('LAYING_SHORT_ROUTE') }}
          </div>
        </div>
        <div class="route-list">
          <div v-for="(items, indexs) in initRouteList" :key="indexs">
            <div class="col-md-12 route-title" @mouseenter="changeSelectedStyle(items.routes)" @mouseleave="deleteSelectedStyle(items.routes)" :style="items.ductValidFlag ? '' : 'background-color: #ff00001a;'">
              <div class="col-md-9 node-length">
                <label class="control-label" :style="items.ductValidFlag ? '' : 'color: red;'"> {{ $t('LAYING_PASSING_NODE') }}{{ indexs + 1 }}
                  : {{ items.routeNodes }}/{{
                                        (Number(items.routeLength) / 1000).toFixed(2)
                                    }}{{ $t('LAYING_KM') }} </label>
              </div>
              <div class="col-md-1 up-down">
                <i class="toggleRoute icon_osp" :class="items.show ? 'icon_ospup' : 'icon_ospdown'" @click="routeToggle(indexs)"></i>
              </div>
              <div class="col-md-2 add-route">
                <button type="button" class="btn btn-link" @click="addToRoute(items)">{{ $t('ADD') }}
                </button>
              </div>
            </div>
            <div v-for="(item, index) in items.routes" :key="index" v-show="items.show" @mouseenter="changeSelectedStyle([item])" @mouseleave="deleteSelectedStyle([item])">
              <div class="col-md-12 line-class">
                <div class="line-png col-md-4">
                  <img :src="`oss_core/edesign/assets/image/map/layer/${item.resSpecId}.png`" alt="" class="line-image">
                </div>
                <div class="col-md-8 line-name">
                  <label class="control-label">{{ item.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <form class="form-group">
      <div class="confirmRouteClass">
        <div class="type-label">
          <label class="control-label required-label cableTypeLabel">{{ $t('LAYING_CABLE_TYPE') }}</label>
        </div>
        <div class="type-select">
          <Combobox class="form-control" name="cableType" v-model="cableType" :setting="cableTypeSetting" dataRule="required"></Combobox>
        </div>
        <div class="type-button">
          <button type="button" class="btn btn-primary" @click="clickOK" :disabled="gridData.length < 2">
            {{ $t('OK') }}
          </button>
          <button type="button" class="btn btn-default" @click="reset">{{ $t('RESET') }}</button>
        </div>
      </div>
    </form>
    <CableListDialog @newCable="newCable" ref="cableListDialog" @editCable="editCable"></CableListDialog>
    <SelectPopup :label="selectLabel" :list="selectList" :el="hldEl" ref="selectRef" @returnSelectValue="returnSelectValue"></SelectPopup>
    <Selection ref="selection" :apiAction="apiAction" :disableControl="disableControl"></Selection>
    <ResFunctionNoDialog ref="resFunctionNoDialog"></ResFunctionNoDialog>
  </div>
</template>
<script>
import { getByFeatureLayers, getByFeatureLayer, Filter, MeasureTool, addGeometry, SupportSpatialReferences, TextSymbol, GeometryType } from 'map';
import * as DefaultSymbol from '@/oss_core/base/symbol/DefaultSymbol';
import ResHandler from '@/oss_core/edesign/osp/domain/ResHandler';
import { removeRepeatDataForList } from '@/oss_core/base/utils/util.js';
import * as Color from '@/oss_core/base/map-style/default-styles.js'; // 画图样式
// import { querySupportRoute, queryCableByAandZ, addGeometryToMap, modifyGeometry, qryPipelineListByPointList } from '@/oss_core/webgis/api/resource'
import {
  querySupportRoute,
  queryCableByAandZ,
  addGeometryToMap,
  modifyGeometry,
  qryPipelineListByPointList,
  getCommonConfigData,
} from '../../map-control/map-control-api';
import CableListDialog from './cableListDialog.vue';
import Selection from '../../map-control/clickRight/selection/Selection.vue'; // 选型组件
import ResFunctionNoDialog from '../../map-control/function/resFunctionNoDialog/ResFunctionNoDialog.vue';

export default {
  //import引入的组件
  name: 'CableLaying',
  components: {
    CableListDialog,
    Selection,
    ResFunctionNoDialog,
  },
  inject: ['getMapBox', 'getResourceList', 'getProjectInfo', 'getControlData', 'getHldEl'],
  computed: {
    resourceList() {
      return this.getResourceList();
    },

    mapBox() {
      return this.getMapBox();
    },

    projectInfo() {
      return this.getProjectInfo();
    },
    controlData() {
      return this.getControlData();
    },
    hldEl() {
      return this.getHldEl();
    },
  },
  mixins: [ResHandler],
  props: {},

  data() {
    return {
      gridShowFlag: true,
      selectShowFlag: true,
      gridData: [],
      gridOpt: {
        height: '300px',
        width: 340,
        shrinkToFit: false, //表格列宽是否按比例缩放
        slimscrollOptions: {
          alwaysVisible: false,
          axis: 'both',
        },
      },
      layingType: 'free',
      routeType: 'recommend',
      routeStyle: 'border-bottom:2px solid #4477ee;',
      noneRouteStyle: 'border-bottom:0px;',
      selectType: '',
      aDevice: '',
      zDevice: '',
      aDeviceList: [],
      zDeviceList: [],
      azDevice: '',
      innnerDeviceList: [],
      startFacilityId: '',
      endFacilityId: '',
      perparToAddGridList: [],
      perparToAddGridGra: [],
      lastLineIds: [],
      coverLineId: [],
      cableType: 'F_CABLE',
      cableTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: this.$t('FIBER_CABLE'), value: 'F_CABLE' },
          { name: this.$t('COPPER_CABLE'), value: 'C_CABLE' },
        ],
        value: 'F_CABLE',
      },
      //AllRouteList:[],
      initRouteList: [],
      allNodeGraphicList: [],
      deleteIdList: [], //地图上的点的id收集起来，方便后面删除
      selectLabel: '',
      selectList: [],
      apiAction: '',
      disableControl: {
        templateEditControl: true, // 控制模板的可编辑情况，默认可编辑
        resFormEditControl: true, // 控制resForm的可编辑情况，默认可编辑
      },
      checkValue: 1000,
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    getCommonConfigData(this.projectInfo.sprintId, 'JAMMED_DUCT_CHECKING').then(result => {
      if (result && result.paramVal === 'Y') {
        this.checkValue = Number(result.extVal);
      }
    });
    this.$root.$on('afterSelection', this.afterSelection); //更新面板属性值
  },

  activated() {
    this.controlData.btnActiveName = 'cableLaying';
  },

  deactivated() {
    this.reset();
  },
  //方法集合
  methods: {
    showGrid() {
      this.gridShowFlag = !this.gridShowFlag;
    },

    showSelect() {
      this.selectShowFlag = !this.selectShowFlag;
    },

    returnSelectValue(returnValue) {
      this.azDevice = returnValue;
    },
    reset() {
      this.mapBox.clear();
      this.mapBox.select();
      this.gridData = [];
      this.allNodeGraphicList = [];
      this.layingType = 'free';
      this.routeType = 'recommend';
      this.selectType = '';
      this.aDevice = '';
      this.zDevice = '';
      //this.cableType = "";
      this.initRouteList = [];
      //this.AllRouteList = [];
      this.startFacilityId = '';
      this.endFacilityId = '';
      this.perparToAddGridList = [];
      this.perparToAddGridGra = [];
    },
    selectDevice(side) {
      this.azDevice = '';
      this.controlData.btnActiveName = 'cableLaying';
      if (side === 'A') {
        fish.toast('info', this.$t('LAYING_SEL_A_DEVICE'));
      } else if (side === 'Z') {
        fish.toast('info', this.$t('LAYING_SEL_Z_DEVICE'));
      }
      this.selectType = side ? side : this.selectType;

      this.mapBox.drawPoint(graphic => {
        this.deleteIdList.push(graphic.id);
        let filter = Filter.and(
          Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }),
          Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId, matchCase: true }),
          Filter.intersects({
            geometryName: 'geom',
            geometry: graphic.geometry,
            spatialReference: SupportSpatialReferences.WEB_MERCATOR,
          })
        );
        let featureLayers = this.getNormalDeviceGroup().map(res => {
          return {
            layerNo: this.getLayerNoByResTypeId(res),
            filter: filter,
          };
        });
        getByFeatureLayers(featureLayers).then(res => {
          this.mapBox.getDrawLayer().clear();
          if (res && res.length > 0) {
            res.forEach(geo => {
              geo.attributes = {
                selectName: geo.attributes.resName,
                selectValue: geo.attributes.gisKey,
              };
            });
            this.selectType === 'A' ? (this.aDeviceList = res) : (this.zDeviceList = res);
            if (res.length === 1) {
              this.azDevice = res[0].attributes.gisKey;
            } else {
              let label = `${this.selectType} Device`;
              let attrList = res.map(attr => attr.attributes);
              this.selectLabel = label;
              this.selectList = attrList;
              //this.$refs.selectRef.popupObj.el = this.getHldEl();
              this.$refs.selectRef.popupObj.show = true;
            }
          } else {
            fish.toast('info', this.$t('LAYING_PLEASE_SEL_DEVICE'));
            this.selectDevice();
          }
        });
      });
    },

    removeNode(row) {
      let initData = JSON.parse(JSON.stringify(this.gridData));
      initData = initData.filter(data => Number(data.seq) !== Number(row.seq));
      this.allNodeGraphicList = this.allNodeGraphicList.filter(data => Number(data.attributes.seq) !== Number(row.seq));
      initData.forEach(data => {
        if (Number(data.seq) > Number(row.seq)) {
          data.seq = Number(data.seq) - 1;
        }
      });
      this.allNodeGraphicList.forEach(data => {
        if (Number(data.attributes.seq) > Number(row.seq)) {
          data.attributes = {
            seq: Number(data.seq) - 1,
          };
        }
      });
      initData = initData.sort((x, y) => x.seq - y.seq);
      initData.forEach((grid, index) => {
        if (grid.seq === 1) {
          grid.length = 0;
        } else {
          let length = MeasureTool.measureLength(
            [grid.x, grid.y],
            [initData[index - 1].x, initData[index - 1].y],
            SupportSpatialReferences.WEB_MERCATOR
          );
          grid.length = length.toFixed(2);
        }
      });
      this.gridData = JSON.parse(JSON.stringify(initData));
      if (this.layingType === 'free') {
        this.changeMode('free');
      }
    },

    changeMode(type, ignoreTipFlag) {
      //if (this.layingType === type) return;
      this.layingType = type;
      this.selectType = 'innnerFacility';
      this.azDevice = '';
      if (type === 'free') {
        if (!ignoreTipFlag) {
          fish.toast('info', this.$t('LAYING_SEL_START_FACILITY'));
        }
        // 去掉fast laying形成的断节；
        this.gridData.forEach(res => (res.flag = ''));

        this.startFacilityId = '';
        this.endFacilityId = '';
        this.perparToAddGridList = [];
        this.perparToAddGridGra = [];
        this.initRouteList = [];
        //this.AllRouteList = [];
        this.routeType = 'recommend';
        this.drawPoint();
      } else if (type === 'fast') {
        // if (this.gridData.length > 2) {
        //     let startFacility = this.gridData[this.gridData.length - 2];
        //     if (startFacility.layerNo && this.isFacilityPoint(this.getResTypeIdByLayerNo(startFacility.layerNo))) {
        //         this.selectType = "endFacility";
        //         this.startFacilityId = startFacility.resId;
        //         fish.toast("info", this.$t('LAYING_DRAW_END_POINT'));
        //         this.drawPoint("endFacility");
        //     } else {
        //         fish.toast("info",this.$t('LAYING_NOT_A_FACILITY'));
        //         this.changeMode("free", true);
        //     }
        // } else {
        //     fish.toast("info",this.$t('LAYING_NOT_A_FACILITY'));
        //     this.changeMode("free", true);
        // }
        this.selectType = 'startFacility';
        fish.toast('info', this.$t('LAYING_STARTING_AEND'));
        this.drawPoint('startFacility');
      }
    },

    changeSelectedStyle(lineList) {
      let greenPaths = [];
      let redPaths = [];
      lineList.forEach(item => {
        let pathStr = item.pathStr;
        pathStr = pathStr.replace(/\[/g, '').replace(/\]/g, '');
        let pathArr = pathStr.split(',');
        pathArr.forEach((singlePath, index) => {
          if (index % 2 === 0) {
            let point = [Number(singlePath.trim()), Number(pathArr[index + 1].trim())];
            Number(item.occupyRate) < Number(this.checkValue) ? greenPaths.push(point) : redPaths.push(point);
          }
        });
      });
      if (greenPaths.length > 0) {
        let coverLine = this.mapBox.addLineByPath([greenPaths], DefaultSymbol.LINE.CABLE_COVER);
        this.coverLineId.push(coverLine.id);
      }
      if (redPaths.length > 0) {
        let coverLine = this.mapBox.addLineByPath([redPaths], DefaultSymbol.LINE.CABLE_COVER_RED);
        this.coverLineId.push(coverLine.id);
      }
    },

    deleteSelectedStyle(item) {
      try {
        this.coverLineId.forEach(id => {
          this.mapBox.deleteById(id);
        });
      } catch (error) {
        console.log('no id found');
      } finally {
        this.coverLineId = [];
      }
    },

    drawPoint(flag) {
      this.mapBox.drawPoint(graphic => {
        //this.mapBox.deleteById(graphic.id);
        this.deleteIdList.push(graphic.id);
        let filter = Filter.and(
          Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }),
          Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId, matchCase: true }),
          Filter.intersects({
            geometryName: 'geom',
            geometry: graphic.geometry,
            spatialReference: SupportSpatialReferences.WEB_MERCATOR,
          })
        );
        let featureLayers;
        if (flag === 'endFacility' || flag === 'startFacility') {
          featureLayers = this.getFacilityGroup().map(res => {
            return {
              layerNo: this.getLayerNoByResTypeId(res),
              filter: filter,
            };
          });
        } else {
          featureLayers = this.getPutSectionGroup()
            .concat(this.getFacilityLine())
            .map(res => {
              return {
                layerNo: this.getLayerNoByResTypeId(res),
                filter: filter,
              };
            });
        }
        getByFeatureLayers(featureLayers).then(res => {
          this.mapBox.getDrawLayer().clear();
          if (res && res.length > 0) {
            res.forEach(geo => {
              geo.attributes = {
                selectName: geo.attributes.resName,
                selectValue: geo.attributes.gisKey,
              };
            });
            this.innnerDeviceList = res;
            let innnerFacilityList = res.filter(graphic => !this.isFacilityLine(this.getResTypeIdByLayerNo(graphic.layerNo)));
            if (innnerFacilityList.length === 1) {
              this.azDevice = innnerFacilityList[0].attributes.gisKey;
            } else {
              let label = '';
              if (flag === 'startFacility') {
                label = 'Start Facility';
              } else if (flag === 'endFacility') {
                label = 'End Facility';
              } else {
                label = 'Facility Device';
              }
              let attrList = innnerFacilityList.map(attr => attr.attributes);
              this.selectLabel = label;
              this.selectList = attrList;
              // this.$refs.selectRef.popupObj.el = this.getHldEl();
              this.$refs.selectRef.popupObj.show = true;
            }
          } else {
            if (flag === 'endFacility' || flag === 'startFacility') {
              fish.toast('info', 'please select a facility');
              this.drawPoint(flag);
              return;
            } else {
              graphic.attributes = {
                seq: this.gridData.length,
                x: graphic.geometry.x,
                y: graphic.geometry.y,
              };
              let coorGeo = graphic.geometry.transferProjection(SupportSpatialReferences.WGS84);
              graphic.attributes = {
                longitude: coorGeo.x,
                latitude: coorGeo.y,
              };
              this.addGridData(JSON.parse(JSON.stringify(graphic.attributes)), graphic);
            }
          }
          if (flag === 'endFacility') {
            // do nothing
          } else if (flag === 'startFacility') {
            fish.toast('info', 'Starting to select Z-End Facility.');
            this.drawPoint('endFacility');
          } else {
            this.drawPoint();
          }
        });
      });
    },

    changeRouteType(type) {
      this.routeType = type;
      if (type === 'recommend') {
        this.initRouteList = this.initRouteList.sort((x, y) => {
          if (Number(x.routeNodes) !== Number(y.routeNodes)) {
            return Number(x.routeNodes) < Number(y.routeNodes) ? -1 : 1;
          } else {
            return Number(x.routeLength) - Number(y.routeLength);
          }
        });
      } else if (type === 'short') {
        // let shortList = this.AllRouteList.filter((all) => Number(all.routeLength) === Number(this.AllRouteList[0].routeLength));
        // shortList.forEach(list => list.show = false)
        // this.initRouteList = JSON.parse(JSON.stringify(shortList));
        this.initRouteList = this.initRouteList.sort((x, y) => {
          if (Number(x.routeLength) !== Number(y.routeLength)) {
            return Number(x.routeLength) < Number(y.routeLength) ? -1 : 1;
          } else {
            return Number(x.routeNodes) - Number(y.routeNodes);
          }
        });
      }
    },

    addToRoute(row) {
      let nodesList = JSON.parse(JSON.stringify(row.routes));
      let findRes = nodesList.find(res => Number(res.occupyRate) >= this.checkValue);
      if (findRes) {
        fish.warn(this.$t('LAYING_SELECT_ANOTHER_PATH'));
        return;
      }
      this.perparToAddGridList = [];
      let findResource = this.gridData.find(data => data.resId === this.startFacilityId); // 或者gridData的倒数第二条记录
      let initSeq = findResource.seq;
      let startId = this.startFacilityId; // this.startFacilityId  "200325191008398420"
      this.getSortedPoints(nodesList, initSeq, startId);
    },

    getSortedPoints(pointList, initSeq, startID) {
      if (pointList.length > 0) {
        let line = pointList.find(list => list.aFacilityId === startID || list.zFacilityId === startID);

        // 空白点也需要加入
        let paths = [];
        let pathStr = line.pathStr;
        pathStr = pathStr.replace(/\[/g, '').replace(/\]/g, '');
        let pathArr = pathStr.split(',');
        pathArr.forEach((singlePath, index) => {
          if (index === 0 || index === pathArr.length - 2) {
            // 排除掉头尾两个资源点
          } else {
            if (index % 2 === 0) {
              let point = [new Number(singlePath.trim()), new Number(pathArr[index + 1].trim())];
              paths.push(point);
            }
          }
        });
        paths.forEach(singlePoint => {
          let cloudPoint = this.mapBox.createPoint(singlePoint[0], singlePoint[1]);
          let [Longitude, Latitude] = this.mapBox.map.toCoordinate([singlePoint[0], singlePoint[1]]);
          let creatGra = this.mapBox.createGraphic(cloudPoint, null, {
            longitude: Longitude,
            latitude: Latitude,
            x: singlePoint[0],
            y: singlePoint[1],
            seq: initSeq,
          });
          this.perparToAddGridList.push(JSON.parse(JSON.stringify(creatGra.attributes)));
          this.perparToAddGridGra.push(creatGra);
        });

        let singlePointId = line.aFacilityId === startID ? line.zFacilityId : line.aFacilityId;
        let resType = line.aFacilityId === startID ? line.zResSpecId : line.aResSpecId;
        let filter = Filter.and(
          Filter.equalTo({
            propertyName: 'resStatus',
            expression: 'C',
          }),
          Filter.equalTo({ propertyName: 'resId', expression: singlePointId })
        );
        let featureLayer = {
          layerNo: this.getLayerNoByResTypeId(resType),
          filter: filter,
        };
        getByFeatureLayer(featureLayer).then(res => {
          if (res && res.length === 1) {
            let singleGraphic = res[0];
            singleGraphic.attributes = {
              seq: initSeq,
              x: singleGraphic.geometry.x,
              y: singleGraphic.geometry.y,
              layerNo: singleGraphic.layerNo,
              length: 0,
            };
            this.perparToAddGridList.push(JSON.parse(JSON.stringify(singleGraphic.attributes)));
            this.perparToAddGridGra.push(singleGraphic);
          }
          let newPointList = JSON.parse(JSON.stringify(pointList));
          newPointList = newPointList.filter(list => list.pipelineId !== line.pipelineId);
          this.getSortedPoints(newPointList, initSeq, singlePointId);
        });
      } else {
        let addData = JSON.parse(JSON.stringify(this.perparToAddGridList));
        let addGra = JSON.parse(JSON.stringify(this.perparToAddGridGra));
        this.addGridData(addData, addGra, 'batchAdd');
      }
    },

    addGridData(addGrid, addGraphic, flag) {
      let initGridData = JSON.parse(JSON.stringify(this.gridData));
      if (flag === 'batchAdd') {
        addGrid = addGrid.filter(res => {
          let findRes = initGridData.find(grid => grid.gisKey === res.gisKey);
          return findRes ? false : true;
        });
        addGraphic = addGraphic.filter(res => {
          let findRes = initGridData.find(grid => grid.gisKey === res.attributes.gisKey);
          return findRes ? false : true;
        });

        if (addGrid && addGrid.length > 0) {
          initGridData.forEach((grid, index) => {
            if (Number(grid.seq) > Number(addGrid[0].seq)) {
              grid.seq = Number(grid.seq) + addGrid.length;
            }
          });
          this.allNodeGraphicList.forEach((grid, index) => {
            if (Number(grid.attributes.seq) > Number(addGrid[0].seq)) {
              grid.attributes = {
                seq: Number(grid.attributes.seq) + addGrid.length,
              };
            }
          });

          addGrid.forEach((grid, index) => {
            if (index === 0) {
              grid.seq = Number(grid.seq) + 1;
            } else {
              grid.seq = Number(addGrid[index - 1].seq) + 1;
            }
          });

          addGraphic.forEach((grid, index) => {
            if (index === 0) {
              grid.seq = {
                seq: Number(grid.seq) + 1,
              };
            } else {
              grid.seq = {
                seq: Number(addGraphic[index - 1].attributes.seq) + 1,
              };
            }
          });

          this.allNodeGraphicList = this.allNodeGraphicList.concat(addGraphic);
          initGridData = initGridData.concat(addGrid);
        }
        // initGridData.forEach(res => {
        //     res.flag = "";
        // })

        this.startFacilityId = '';
        this.endFacilityId = '';
        this.perparToAddGridList = [];
        this.perparToAddGridGra = [];
        this.initRouteList = [];
        //this.AllRouteList = [];
        this.routeType = 'recommend';
        this.changeMode('free');
      } else {
        // let resIdList = [];
        // initGridData.forEach(data => {
        //     if (data.resId) {
        //         resIdList.push(data.resId);
        //     }
        // });
        // if (resIdList.indexOf(addGrid.resId) > -1) {
        //     fish.toast("warn", this.$t('LAYING_CAN_NOT_ADD'));
        //     retrun;
        // }
        initGridData.forEach((grid, index) => {
          if (grid.seq === initGridData.length) {
            grid.seq = Number(grid.seq) + 1;
          }
        });
        this.allNodeGraphicList.forEach((grid, index) => {
          if (grid.attributes.seq === this.allNodeGraphicList.length) {
            grid.attributes = {
              seq: Number(grid.attributes.seq) + 1,
            };
          }
        });
        this.allNodeGraphicList.push(addGraphic);
        initGridData.push(addGrid);
      }

      initGridData = initGridData.sort((x, y) => x.seq - y.seq);
      initGridData.forEach((grid, index) => {
        if (grid.seq === 1) {
          grid.length = 0;
        } else {
          let length = MeasureTool.measureLength(
            [grid.x, grid.y],
            [initGridData[index - 1].x, initGridData[index - 1].y],
            SupportSpatialReferences.WEB_MERCATOR
          );
          grid.length = length.toFixed(2);
        }
      });

      this.gridData = JSON.parse(JSON.stringify(initGridData));
      this.deleteSelectedStyle();
    },

    routeToggle(index) {
      this.initRouteList[index].show = !this.initRouteList[index].show;
    },

    addPassLineToGrid(passLineGraphic, endPoint, passFlag) {
      let [paths] = passLineGraphic.geometry.getPaths();
      paths.forEach((point, index) => {
        if (index === 0) {
        } else if (index !== paths.length - 1) {
          let addPoint = passFlag ? paths[index] : paths[paths.length - index - 1];
          let cloudPoint = this.mapBox.createPoint(addPoint[0], addPoint[1]);
          let [Longitude, Latitude] = this.mapBox.map.toCoordinate([addPoint[0], addPoint[1]]);
          let creatGra = this.mapBox.createGraphic(cloudPoint, null, {
            longitude: Longitude,
            latitude: Latitude,
            x: addPoint[0],
            y: addPoint[1],
            seq: this.gridData.length,
          });
          this.addGridData(JSON.parse(JSON.stringify(creatGra.attributes)), creatGra);
        } else if (index === paths.length - 1) {
          endPoint.attributes = {
            seq: this.gridData.length,
            x: endPoint.geometry.x,
            y: endPoint.geometry.y,
            layerNo: endPoint.layerNo,
          };
          this.addGridData(JSON.parse(JSON.stringify(endPoint.attributes)), endPoint);
        }
      });
    },

    clickOK() {
      let initForm = $(this.$refs.cableTypeForm).form();
      if (!initForm.isValid()) {
        return;
      }
      let url;
      let sectType = this.cableType;
      if (!sectType) {
        fish.toast('warn', this.$t('LAYING_SELECT_CABLE_TYPE'));
        return;
      }

      if (sectType === 'F_CABLE') {
        url = 'oss_core/im/rivt/cable/views/AddFiber';
      } else if (sectType === 'C_CABLE') {
        url = 'oss_core/im/rivt/cable/views/AddCable';
      }

      let initGridData = JSON.parse(JSON.stringify(this.gridData));
      let aDev = initGridData[0];
      let zDev = initGridData[initGridData.length - 1];
      if (!aDev.resId) {
        fish.warn(this.$t('LAYING_A_RES_ID_NULL'));
        return;
      }
      if (!zDev.resId) {
        fish.warn(this.$t('LAYING_Z_RES_ID_NULL'));
        return;
      }

      queryCableByAandZ(sectType, aDev.resId, zDev.resId).then(data => {
        if (data && data.length > 0) {
          data.forEach(cable => {
            cable.lineLength = cable.length;
            cable.geoFlag = cable.geoFlag === 'Y' ? 'Y' : 'N';
            delete cable.length;
          });
          // 选择界面
          //this.$emit("cablelist", data);
          this.$refs.cableListDialog.gridData = data;
          this.$refs.cableListDialog.popupObj.show = true;
        } else {
          // 新增界面
          this.openAddDialog();
        }
      });
    },

    editCable(row) {
      this.openEditDialog(row);
    },

    newCable() {
      this.openAddDialog();
    },

    openAddDialog() {
      let initGridData = JSON.parse(JSON.stringify(this.gridData));
      let aDev = initGridData[0];
      let zDev = initGridData[initGridData.length - 1];
      let totalLength = 0;
      initGridData.forEach(grid => (totalLength += Number(grid.length)));
      let url;
      if (this.cableType === 'F_CABLE') {
        // url = 'oss_core/im/rivt/cable/views/AddFiber';

        let paths = this.gridData.map(grid => [grid.x, grid.y]);
        let lineGeo = this.mapBox.createLineGeometry([paths]);
        let obj = {
          resName: '',
          resNo: '',
          aLayerNo: aDev.layerNo,
          aGisKey: aDev.gisKey,
          zLayerNo: zDev.layerNo,
          zGisKey: zDev.gisKey,
          gisLen: totalLength.toFixed(2) + '',
          schemaId: this.projectInfo.schemaId,
          sprintId: this.projectInfo.sprintId,
          resStatus: 'C',
        };
        // let lineGra = this.mapBox.createGraphic(lineGeo, null, obj);
        // lineGra.layerNo = this.getLayerNoByResTypeId("F_CABLE");
        let cloudGraphicLike = {
          geometry: lineGeo,
          attributes: obj,
          layerNo: this.getLayerNoByResTypeId('F_CABLE'),
        };
        this.$refs.selection.popup.title = 'New';
        this.apiAction = 'A';
        this.disableControl.templateEditControl = true;
        this.$refs.selection.popup.show = true;
        this.$refs.selection.setGraphicList([cloudGraphicLike]);
        // this.$map.addGeometry(this.getLayerNoByResTypeId("F_CABLE"), lineGra).then(res => {
        //     res.attributes = {
        //         gisKey:res.attributes.gis_key ? res.attributes.gis_key : res.attributes.gisKey,
        //         resNo: "",
        //         resName: "",
        //     }
        //     this.$refs.selection.popup.show = true;
        //     this.$refs.selection.setGraphicList([res]);
        // })
      } else if (this.cableType === 'C_CABLE') {
        url = 'oss_core/im/rivt/cable/views/AddCable';
        fish.require([url], AddCable => {
          let param = {
            OBJ_TYPE: this.cableType,
            FORM_DATA: {
              RES_SPEC_ID: this.cableType,
              A_DEVICE_ID: aDev.resId,
              A_RES_SPEC_ID: this.getResTypeIdByLayerNo(aDev.layerNo),
              A_DEVICE_ID_DESC: aDev.resName,
              Z_DEVICE_ID: zDev.resId,
              Z_DEVICE_ID_DESC: zDev.resName,
              Z_RES_SPEC_ID: this.getResTypeIdByLayerNo(zDev.layerNo),
              LENGTH: totalLength.toFixed(2) + '',
            },
          };
          let addCableView = new AddCable(param);
          fish.listenTo(addCableView, 'AddOk', result => {
            if (result && result.CABLE_LIST.length === 1) {
              let data = result.CABLE_LIST[0];
              let paths = this.gridData.map(grid => [grid.x, grid.y]);
              let params = {
                mapNo: this.projectInfo.mapNo,
                resId: data.CABLE_ID,
                resType: data.RES_SPEC_ID,
                paths: [paths], // 这里要不要转经纬度？？？
                length: data.LENGTH,
                graphicsAttrs: {
                  resStatus: 'C',
                  resName: data.NAME,
                  resNo: data.FULL_NAME,
                  aLayerNo: aDev.layerNo,
                  aGisKey: aDev.gisKey,
                  zLayerNo: zDev.layerNo,
                  zGisKey: zDev.gisKey,
                  gisLen: data.LENGTH,
                  schemaId: this.projectInfo.schemaId,
                  sprintId: this.projectInfo.sprintId,
                },
              };
              addGeometryToMap(params).then(res => {
                this.mapBox.clear();
                this.mapBox.refreshLayer(this.getLayerNoByResTypeId(data.RES_SPEC_ID));
                this.crossCable(data);
              });
            }
          });
        });
      }
    },

    afterSelection(cableList) {
      let cableInfo = cableList[0];
      this.crossCable(cableInfo);
    },

    openEditDialog(row) {
      let geoFlag = row.geoFlag;
      if (geoFlag === 'Y') {
        let Filter = this.$map.Filter;
        let filter = Filter.and(
          Filter.equalTo({ propertyName: 'resId', expression: row.cableId }),
          Filter.equalTo({ propertyName: 'schemaId', expression: this.getProjectInfo().schemaId }),
          Filter.equalTo({ propertyName: 'resStatus', expression: 'C' })
        );
        delete filter.olMap;
        let featureLike = [
          {
            layerNo: this.getLayerNoByResTypeId('F_CABLE'),
            filter: filter,
          },
        ];
        this.$map.getByFeatureLayers(featureLike).then(gisCables => {
          if (gisCables && gisCables.length > 0) {
            let gisCable = gisCables[0];

            let paths = this.gridData.map(grid => [grid.x, grid.y]);
            let lineGeo = this.mapBox.createLineGeometry([paths]);
            let initGridData = JSON.parse(JSON.stringify(this.gridData));
            let totalLength = 0;
            initGridData.forEach(grid => (totalLength += Number(grid.length)));
            let obj = {
              resName: row.name,
              resNo: row.fullName,
              aLayerNo: this.getLayerNoByResTypeId(row.aResSpecId),
              aGisKey: gisCable.attributes.aGisKey,
              zLayerNo: this.getLayerNoByResTypeId(row.zResSpecId),
              zGisKey: gisCable.attributes.zGisKey,
              gisLen: totalLength.toFixed(2) + '',
              schemaId: this.projectInfo.schemaId,
              sprintId: this.projectInfo.sprintId,
              resStatus: 'C',
              resId: row.cableId,
              gisKey: gisCable.attributes.gisKey,
              layerNo: this.getLayerNoByResTypeId('F_CABLE'),
            };
            let cloudGraphicLike = {
              geometry: lineGeo,
              attributes: obj,
              resType: 'F_CABLE',
              layerNo: this.getLayerNoByResTypeId('F_CABLE'),
            };
            // this.apiAction = 'M';
            // this.$refs.selection.popup.title = 'Edit';
            // this.disableControl.templateEditControl = false;
            // this.$refs.selection.popup.show = true;
            // this.$refs.selection.setGraphicList([cloudGraphicLike]);
            let functionData = {
              url: 'ResEdit',
            };
            let dataInfo = {
              CloudGraphic: cloudGraphicLike,
              resType: 'F_CABLE',
            };
            this.$refs.resFunctionNoDialog.setParentParam(functionData, dataInfo, this.projectInfo, this.hldEl);
          }
        });
      }
      // fish.require(['oss_core/im/rivt/cable/views/ModCable.js'], (aDialog) => {
      //     let param = {
      //         RES_SPEC_ID:row.resSpecId,
      //         RES_ID:row.cableId
      //     };
      //     let dialogView = new aDialog(param);
      //     fish.listenTo(dialogView, "OKEvent", (result) => {
      //         if (result.CABLE_LIST && result.CABLE_LIST.length === 1) {
      //             let data = result.CABLE_LIST[0];
      //             if (row.geoFlag === "Y") {
      //                 // 已经上图的则直接修改路由
      //                 let paths = this.gridData.map((grid) => [grid.x, grid.y]);
      //                 let aDev = this.gridData[0];
      //                 let zDev = this.gridData[this.gridData.length - 1];
      //                 let totalLength = 0;
      //                 this.gridData.forEach(grid => totalLength += Number(grid.length));
      //                 let modParam = {
      //                     "mapNo": this.projectInfo.mapNo,
      //                     "resId": data.CABLE_ID,
      //                     "resType": data.RES_SPEC_ID,
      //                     "paths": [paths],
      //                     "length": totalLength.toFixed(2) + '',
      //                     "graphicsAttrs": {
      //                         "resStatus": "C",
      //                         "resName": data.NAME,
      //                         "resNo": data.FULL_NAME,
      //                         "aLayerNo": this.getLayerNoByResTypeId(data.A_RES_SPEC_ID),
      //                         "aGisKey": aDev.gisKey,
      //                         "zLayerNo": this.getLayerNoByResTypeId(data.Z_RES_SPEC_ID),
      //                         "zGisKey": zDev.gisKey,
      //                         "gisLen": totalLength.toFixed(2) + '',
      //                         "schemaId": this.projectInfo.schemaId,
      //                         "sprintId": this.projectInfo.sprintId,

      //                     },
      //                 }
      //                 modifyGeometry(modParam).then(mod => {
      //                     this.mapBox.clear();
      //                     this.mapBox.refreshLayer(this.getLayerNoByResTypeId(data.RES_SPEC_ID));
      //                     data.fromIMEdit = true;
      //                     this.crossCable(data);
      //                 })
      //             } else {
      //                 // 先上图再更新长度
      //                 this.addMapGeo(result.CABLE_LIST[0]);
      //             }
      //         }

      //     })
      // });
    },

    addMapGeo(data) {
      let paths = this.gridData.map(grid => [grid.x, grid.y]);
      let aDev = this.gridData[0];
      let zDev = this.gridData[this.gridData.length - 1];
      let totalLength = 0;
      this.gridData.forEach(grid => (totalLength += Number(grid.length)));
      let params = {
        mapNo: this.projectInfo.mapNo,
        resId: data.CABLE_ID,
        resType: data.RES_SPEC_ID,
        paths: [paths],
        length: totalLength.toFixed(2) + '',
        graphicsAttrs: {
          resStatus: 'C',
          resName: data.NAME,
          resNo: data.FULL_NAME,
          aLayerNo: this.getLayerNoByResTypeId(data.A_RES_SPEC_ID),
          aGisKey: aDev.gisKey,
          zLayerNo: this.getLayerNoByResTypeId(data.Z_RES_SPEC_ID),
          zGisKey: zDev.gisKey,
          gisLen: totalLength.toFixed(2) + '',
          schemaId: this.projectInfo.schemaId,
          sprintId: this.projectInfo.sprintId,
        },
      };
      addGeometryToMap(params).then(res => {
        // 上图完之后的修改 （主要是更新im长度）
        modifyGeometry(params).then(mod => {
          this.mapBox.clear();
          this.mapBox.refreshLayer(this.getLayerNoByResTypeId(data.RES_SPEC_ID));
          data.fromIMEdit = true;
          this.crossCable(data);
        });
      });
    },
    crossCable(data) {
      // fish.toast("success", this.$t('SAVE_SUCCESS'));
      this.controlData.initSelectedStatus.componentName = 'cableLaying';
      this.controlData.initSelectedStatus.rightCloseFlag = false;

      let gisFilter = this.$map.Filter;
      let cableId = data.fromIMEdit ? data.CABLE_ID : data.resInfo.cableId;
      let initFilter = gisFilter.and(
        gisFilter.equalTo({ propertyName: 'resId', expression: cableId }),
        gisFilter.equalTo({ propertyName: 'schemaId', expression: this.getProjectInfo().schemaId }),
        gisFilter.equalTo({ propertyName: 'resStatus', expression: 'C' })
      );
      delete initFilter.olMap;
      let initFeatureLike = [
        {
          layerNo: this.getLayerNoByResTypeId('F_CABLE'),
          filter: initFilter,
        },
      ];
      this.$map.getByFeatureLayers(initFeatureLike).then(initResult => {
        if (initResult && initResult.length > 0) {
          let cableGeo = initResult[0].geometry;
          let filter = gisFilter.and(
            gisFilter.within({
              geometryName: 'geom',
              geometry: cableGeo,
              spatialReference: this.$map.SupportSpatialReferences.WEB_MERCATOR,
            }),
            gisFilter.equalTo({ propertyName: 'schemaId', expression: this.getProjectInfo().schemaId }),
            gisFilter.equalTo({ propertyName: 'resStatus', expression: 'C' })
          );
          delete filter.olMap;
          let featureLayers = [];
          ['MANHOLE', 'POLE', 'AIR_WIRE', 'PIPELINE_G'].forEach(res => {
            let obj = {
              layerNo: this.getLayerNoByResTypeId(res),
              filter: filter,
            };
            featureLayers.push(obj);
          });
          featureLayers = featureLayers.filter(res => res.layerNo);
          this.$map.getByFeatureLayers(featureLayers).then(result => {
            let returnParam = {};
            if (result && result.length > 0) {
              let pointList = result.filter(res => res.geometry.geometryType === GeometryType.POINT);
              let pipelineList = result.filter(res => res.geometry.geometryType === GeometryType.POLYLINE);
              if (pipelineList && pipelineList.length > 0) {
                // // 过滤非管道段两端的点资源
                // let validPointIds = [];
                // pipelineList.forEach(res => {
                //     validPointIds.push(res.attributes.aGisKey);
                //     validPointIds.push(res.attributes.zGisKey);
                // });
                // pointList = pointList.filter(res => validPointIds.indexOf(res.attributes.gisKey) > -1);

                // 添加长度用于排序点资源
                pointList.forEach(res => {
                  let length = this.$map.GeometryUtils.getPointToLineStartPointLength(res.geometry, cableGeo);
                  res.lengthToStart = length;
                });
                pointList = pointList.sort((x, y) => x.lengthToStart - y.lengthToStart);

                // // 根据排序之后的点资源过滤非本光缆下的管道
                // // （光缆依次经过A、B、C三点，管道段为AB、BC，此时AC这根管道段也会被查出来，需要过滤）
                // pipelineList = this.filterLineBySortedPoints(pipelineList, pointList);

                if (data.fromIMEdit) {
                  returnParam.cable = {
                    cableId: data.CABLE_ID,
                    resId: data.CABLE_ID,
                    resName: data.NAME,
                    RES_NO: data.FULL_NAME,
                    resSpecId: data.RES_SPEC_ID,
                  };
                } else {
                  returnParam.cable = {
                    cableId: data.resInfo.cableId,
                    resId: data.resInfo.cableId,
                    resName: data.resInfo.name,
                    RES_NO: data.resInfo.fullName,
                    resSpecId: data.resType,
                  };
                }
                let routeList = [];
                let pipelineIds = [];
                pointList.forEach((res, index) => {
                  let objPoint = {
                    resSpecId: this.getResTypeIdByLayerNo(res.layerNo),
                    resId: res.attributes.resId,
                    resName: res.attributes.resName,
                    RES_NO: res.attributes.resNo,
                  };
                  routeList.push(objPoint);
                  let pointGisKey = res.attributes.gisKey;
                  let findResult = pipelineList.find(res => res.attributes.aGisKey === pointGisKey || res.attributes.zGisKey === pointGisKey);
                  // 如果没有找到下一个线资源，则表示当前点是当前管道段集的终点
                  if (findResult) {
                    let objLine = {
                      resSpecId: this.getResTypeIdByLayerNo(findResult.layerNo),
                      resId: findResult.attributes.resId,
                      resName: findResult.attributes.resName,
                      RES_NO: findResult.attributes.resNo,
                    };
                    routeList.push(objLine);
                    if (objLine.resSpecId === 'PIPELINE_G') {
                      pipelineIds.push(findResult.attributes.resId);
                    }
                    // 去掉已经算进去的管道段
                    pipelineList = pipelineList.filter(res => res.attributes.resId !== findResult.attributes.resId);
                  }
                });
                returnParam.routeList = routeList;
                returnParam.pipelineIds = pipelineIds.toString() + '';
                returnParam.sprintId = this.getProjectInfo().sprintId;
                returnParam.schemaId = this.getProjectInfo().schemaId;
                this.$root.$emit('btnToCoverCurrentPage', 'FastLayingDesign', returnParam);
              }
            }
            this.mapBox.refresh();
          });
        } else {
          this.mapBox.refresh();
        }
      });
    },

    getRouteListByLines(lines) {
      let pointList = [];
      let validPoints = [];
      lines.forEach(res => {
        validPoints.push(res.aFacilityId);
        validPoints.push(res.zFacilityId);
      });
      this.gridData.forEach((grid, index) => {
        if (validPoints.indexOf(grid.resId) > -1) {
          pointList.push(grid);
        }
      });
      let routeList = [];
      pointList.forEach((res, index) => {
        let objPoint = {
          resSpecId: this.getResTypeIdByLayerNo(res.layerNo),
          resId: res.resId,
          resName: res.resName,
          RES_NO: res.resNo,
        };
        routeList.push(objPoint);
        let pointId = res.resId;
        let findResult = lines.find(res => res.aFacilityId === pointId || res.zFacilityId === pointId);
        // 如果没有找到下一个线资源，则表示当前点是当前管道段集的终点
        if (findResult) {
          let objLine = {
            resSpecId: findResult.resSpecId,
            resId: findResult.pipelineId,
            resName: findResult.name,
            RES_NO: findResult.fullName,
          };
          routeList.push(objLine);
          // 去掉已经算进去的管道段
          lines = lines.filter(res => res.pipelineId !== findResult.pipelineId);
        }
      });
      // let nodeList = [];
      // pointList.forEach((point, index) => {
      //     nodeList.push(point);
      //     if (index !== pointList.length - 1) {
      //         let findRes = lines.find(line => {
      //             return (line.aFacilityId === point.resId && line.zFacilityId === pointList[index + 1].resId)
      //                     || (line.zFacilityId === point.resId && line.aFacilityId === pointList[index + 1].resId)
      //         });
      //         if (findRes) {
      //             nodeList.push(findRes);
      //         }
      //     }
      // });
      // nodeList.forEach((node) => {
      //     let obj = {
      //         resId: node.resId ? node.resId : node.pipelineId,
      //         resName: node.resName ? node.resName : node.name,
      //         RES_NO: node.fullName ? node.fullName : node.resNo,
      //         resSpecId: node.resSpecId ? node.resSpecId : this.getResTypeIdByLayerNo(node.layerNo)
      //     };
      //     route.push(obj);
      // });
      return routeList;
    },
  },
  watch: {
    azDevice: {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val) {
          if (this.selectType === 'A') {
            let aDeviceData = this.aDeviceList.find(res => res.attributes.gisKey === val);
            aDeviceData.attributes = {
              seq: 1,
              x: aDeviceData.geometry.x,
              y: aDeviceData.geometry.y,
              layerNo: aDeviceData.layerNo,
              length: 0,
            };
            this.aDevice = aDeviceData.attributes.resName;
            let initData = JSON.parse(JSON.stringify(this.gridData));
            if (initData.length > 0) {
              initData = initData.filter(data => Number(data.seq) !== 1);
              this.allNodeGraphicList = this.allNodeGraphicList.filter(gra => Number(gra.attributes.seq) !== 1);
            }
            this.allNodeGraphicList.push(aDeviceData);
            initData.push(JSON.parse(JSON.stringify(aDeviceData.attributes)));
            initData = initData.sort((x, y) => x.seq - y.seq);
            this.gridData = JSON.parse(JSON.stringify(initData));
            if (this.gridData.length < 2) {
              this.selectDevice('Z');
            }
          } else if (this.selectType === 'Z') {
            let zDeviceData = this.zDeviceList.find(res => res.attributes.gisKey === val);

            let initData = JSON.parse(JSON.stringify(this.gridData));
            let seq = 0;
            if (initData.length === 0) {
              fish.toast('info', this.$t('LAYING_PLEASE_SEL_A_DEVICE'));
              return;
            } else if (initData.length === 1) {
              seq = 2;
            } else {
              seq = initData.length;
              initData = initData.filter(data => Number(data.seq) !== initData.length);
              this.allNodeGraphicList = this.allNodeGraphicList.filter(gra => Number(gra.attributes.seq) !== this.allNodeGraphicList.length);
            }
            let length = MeasureTool.measureLength(
              [initData[0].x, initData[0].y],
              [zDeviceData.geometry.x, zDeviceData.geometry.y],
              SupportSpatialReferences.WEB_MERCATOR
            );
            zDeviceData.attributes = {
              seq: seq,
              x: zDeviceData.geometry.x,
              y: zDeviceData.geometry.y,
              layerNo: zDeviceData.layerNo,
              length: length.toFixed(2),
            };
            this.zDevice = zDeviceData.attributes.resName;
            this.allNodeGraphicList.push(zDeviceData);
            initData.push(JSON.parse(JSON.stringify(zDeviceData.attributes)));
            initData = initData.sort((x, y) => x.seq - y.seq);
            this.gridData = JSON.parse(JSON.stringify(initData));
            if (this.gridData.length < 3) {
              this.changeMode('free');
            }
          } else if (this.selectType === 'innnerFacility' || this.selectType === 'startFacility') {
            let innnerDeviceData = this.innnerDeviceList.find(res => res.attributes.gisKey === val);
            let startPoint = this.gridData[this.gridData.length - 2];
            let passLine = this.innnerDeviceList.filter(graphic => {
              if (this.isFacilityLine(this.getResTypeIdByLayerNo(graphic.layerNo))) {
                if (
                  (graphic.attributes.aGisKey === startPoint.gisKey && graphic.attributes.zGisKey === innnerDeviceData.attributes.gisKey) ||
                  (graphic.attributes.zGisKey === startPoint.gisKey && graphic.attributes.aGisKey === innnerDeviceData.attributes.gisKey)
                ) {
                  return true;
                }
              }
              return false;
            });
            if (passLine && passLine.length === 1) {
              let passFlag = passLine[0].attributes.aGisKey === startPoint.gisKey ? true : false; // 线是否反向
              this.addPassLineToGrid(passLine[0], innnerDeviceData, passFlag);
            } else {
              innnerDeviceData.attributes = {
                seq: this.gridData.length,
                x: innnerDeviceData.geometry.x,
                y: innnerDeviceData.geometry.y,
                layerNo: innnerDeviceData.layerNo,
                flag: this.selectType === 'startFacility' ? 'start' : '',
              };
              this.addGridData(JSON.parse(JSON.stringify(innnerDeviceData.attributes)), innnerDeviceData);
            }
            if (this.selectType === 'startFacility') {
              this.selectType = 'endFacility';
              this.startFacilityId = innnerDeviceData.attributes.resId;
            }
          } else if (this.selectType === 'endFacility') {
            let innnerDeviceData = this.innnerDeviceList.find(res => res.attributes.gisKey === val);
            this.endFacilityId = innnerDeviceData.attributes.resId;
            let obj = {
              startId: this.startFacilityId,
              stopId: this.endFacilityId,
              mapNo: this.projectInfo.mapNo,
              schemaId: this.projectInfo.schemaId,
            };
            querySupportRoute(obj).then(data => {
              console.log(data);
              if (data && data.resultList) {
                let initGridData = JSON.parse(JSON.stringify(this.gridData));
                let resIdList = [];
                initGridData.forEach(gird => {
                  if (gird.resId) {
                    resIdList.push(gird.resId);
                  }
                });
                data.resultList.forEach(list => {
                  list.show = false;
                  let ids = [];
                  list.routes.forEach(route => {
                    ids.push(route.aFacilityId);
                    ids.push(route.zFacilityId);
                  });
                  ids = removeRepeatDataForList(ids);
                  list.facilityIds = ids;
                });

                data.resultList.forEach(list => {
                  let repeatList = [];
                  repeatList = resIdList.filter(gridid => {
                    return list.facilityIds.indexOf(gridid) > -1;
                  });
                  console.log(repeatList);
                  if (repeatList && repeatList.length > 1) {
                    list.isValidFlag = false;
                  } else {
                    list.isValidFlag = true;
                  }

                  // 拥堵flag
                  let findObj = list.routes.find(route => Number(route.occupyRate) >= Number(this.checkValue));
                  list.ductValidFlag = findObj ? false : true;
                });
                this.initRouteList = data.resultList.filter(res => res.isValidFlag);
                this.changeRouteType('recommend');
                innnerDeviceData.attributes = {
                  seq: this.gridData.length,
                  x: innnerDeviceData.geometry.x,
                  y: innnerDeviceData.geometry.y,
                  layerNo: innnerDeviceData.layerNo,
                  flag: 'end',
                };
                this.addGridData(JSON.parse(JSON.stringify(innnerDeviceData.attributes)), innnerDeviceData);

                //this.AllRouteList = JSON.parse(JSON.stringify(this.initRouteList)).sort((x, y) => Number(x.routeLength) - Number(y.routeLength));
              } else {
                fish.toast('warn', this.$t('LAYING_NO_ROUTE_DATA'));
                this.drawPoint('endFacility');
              }
            });
          }
        }
      },
    },

    gridData: {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val && val.length > 0) {
          // this.mapBox.clear(); //不能调，因为会将画图工具失效

          let initData = JSON.parse(JSON.stringify(val));
          try {
            this.lastLineIds.forEach(id => {
              this.mapBox.deleteById(id);
            });
            initData.forEach(grid => {
              this.mapBox.deleteById(`text${grid.seq}`);
              this.mapBox.deleteById(`pic${grid.seq}`);
            });

            // 删除表格数据的时候最后一条样式被遗漏
            this.mapBox.deleteById(`text${initData.length + 1}`);
            this.mapBox.deleteById(`pic${initData.length + 1}`);
          } catch (error) {
            console.log('no id found');
          } finally {
            let paths = initData.map(grid => [grid.x, grid.y]);
            let brokenIndex = 0;
            initData.forEach((res, index) => {
              if (res.flag === 'start' && initData[index + 1] && initData[index + 1].flag === 'end') {
                brokenIndex = index;
              }
            });
            if (brokenIndex !== 0) {
              let firstPaths = [];
              let secondPaths = [];
              initData.forEach((res, index) => {
                if (index < brokenIndex + 1) {
                  firstPaths.push([res.x, res.y]);
                } else {
                  secondPaths.push([res.x, res.y]);
                }
              });
              let tempLineGraphicA = this.mapBox.addLineByPath([firstPaths], DefaultSymbol.LINE.PINK5);
              let tempLineGraphicB = this.mapBox.addLineByPath([secondPaths], DefaultSymbol.LINE.PINK5);
              this.lastLineIds = [tempLineGraphicA.id, tempLineGraphicB.id];
            } else {
              let tempLineGraphic = this.mapBox.addLineByPath([paths], DefaultSymbol.LINE.PINK5);
              this.lastLineIds = [tempLineGraphic.id];
            }

            initData.forEach(grid => {
              let textSymbol = new TextSymbol(`${grid.seq}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -1, -12);
              let symbol = Color.showIndex;
              let point = this.mapBox.createPoint(grid.x, grid.y);
              this.mapBox.addGeometry(`text${grid.seq}`, point, textSymbol);
              this.mapBox.addGeometry(`pic${grid.seq}`, point, symbol);
            });
          }
        }
      },
    },
    'controlData.btnActiveName': {
      deep: true,
      handler(val, old) {
        if (val === 'cableLaying') {
          this.mapBox.clear(); //从其他交互事件切回铺揽的时候需要清除下地图
        }
      },
    },
    // deleteIdList:{
    //     immediate:true,
    //     deep:true,
    //     handler(val, old) {
    //         if (val && val.length > 0) {
    //             val.forEach(id => {
    //                 try {
    //                     this.mapBox.deleteById(id);
    //                 } catch(e) {
    //                     console.log("no id found");
    //                 } finally {

    //                 }
    //             });
    //             this.deleteIdList = [];
    //         }
    //     }
    // },
  },
  destroyed() {
    this.$root.$off('afterSelection', this.afterSelection); //更新面板属性值
  },
};
</script>
<style lang="scss" scoped>
@import './cableLaying.css';
</style>
