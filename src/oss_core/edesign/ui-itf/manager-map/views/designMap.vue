<template>
  <div class="map-example">
    <Search ref="search" @inSearchResult="inSearchResult" @outSearchResult="outSearchResult" @showInfos="showInfos" @centerGeometries="centerGeometries" @third-url="thirdUrlPopup" @btnToCoverCurrentPage="btnToCoverCurrentPage" @resComponentShow="resComponentShow" @resComponentShowNoDialog="resComponentShowNoDialog" @openMenuInInfoPanel="openMenuInHld" @closeRightBars="closeRightBars"></Search>
    <Tools ref="tools" :rightMenuShow="isShow" @identify="identify" @map-selection="mapSelection" @street-view="streetView" v-if="initialized"></Tools>
    <div ref="map" class="map-container" @contextmenu="rightClick" @click="clearMenu"></div>
    <MenuRight ref="toolbar" @toolbarShowChange="toolbarShowChange" @refreshLayers="refreshLayers" @afterCenter="afterCenter" @property="propertyShow" @linkCalculation="linkCalculation" @loadCalculatData="loadCalculatData" @setSelect="setSelect" @btnToCoverCurrentPage="btnToCoverCurrentPage" @openMenuInTaskList="openMenuInHld" v-on="$listeners"></MenuRight>
    <Footer v-model="select" ref="footer" v-if="initialized"></Footer>
    <div ref="overlayDom" v-show="prevent">
      <ClickRight :menuList="menuList" :graphic="chooseGraphic" ref="clickRight" @property="propertyShow" @loadFormatPoint="loadFormatPoint" @delete="afterDeleteGraphic" @showBind="showBind" @afterSelection="afterSelection"></ClickRight>
    </div>
    <!-- <BindAZ ref="bindAZ"></BindAZ> -->
    <property ref="property" @afterSaveProperty="refreshTree" @map-selection="mapSelection"></property>
    <!-- <addFormatPoint ref="addFormatPoint"></addFormatPoint> -->
    <!-- <ThirdUrlPopup ref="summary"></ThirdUrlPopup> -->
    <PopuSchemaTopo ref="schemaTopo" v-if="schemaTopoState"></PopuSchemaTopo>
    <!-- <LinkCalculation ref="linkCalculation"></LinkCalculation> -->
    <ResFunctionDialog ref="resFunctionDialog" @updateInfoPanel="updateInfoPanel" @openMenuInResFuncDialog="openMenuInHld"></ResFunctionDialog>
    <ResFunctionNoDialog ref="resFunctionNoDialog" @afterSelection="afterSelection"></ResFunctionNoDialog>
  </div>
</template>

<script>
import Search from '../../../osp/map-control/searchbar/search.vue'; // 搜索组件
import Tools from '../../../osp/map-control/tools/tools.vue'; // 顶部功能组件
import MenuRight from '@/oss_core/widgets/toolbar/toolbar.vue'; // 右侧菜单栏组件
import Footer from '../../../osp/map-control/footbar/footer.vue'; // 底部信息组件
import ClickRight from '../../../osp/map-control/clickRight/clickRight.vue'; // 鼠标右键菜单栏组件
// import BindAZ from '../map-control/clickRight/bindAZ/bindAZ.vue';
import * as Color from '../../../osp/design/drawStyle.js'; // 画图样式
import * as ResTypeHandler from '../../../osp/domain/ResTypeHandler'; // 鼠标右键菜单栏
import property from '../../../osp/map-control/clickRight/property/property.vue';
// import LinkCalculation from '../sidebar/opticalAttenuation/linkCalculation.vue';
// import addFormatPoint from '../map-control/clickRight/addFormatPoint/addFormatPoint.vue';
// import ThirdUrlPopup from '../../../osp/map-control/searchbar/info-panel/ThirdUrlPopup/thirdUrlPopup.vue'; // 信息面板Summary按钮弹窗组件
import PopuSchemaTopo from '../../../topo/instance/PopuSchemaTopo.vue';
// import { getAreaById } from '../../../api/Area.js';
import { getResTypeConfig, getLayerConfig, getSurfaceLayers, getConfigExtend, getLayerConfigBySprintId } from '../../../api/query/schema.js';
import {
  Color as mapColor,
  SimpleLineSymbol,
  SimpleMarkerSymbol,
  TextSymbol,
  Font,
  SupportSpatialReferences,
  getByFeatureLayers,
  Filter,
  GeometryType,
} from 'map';
import ResFunctionDialog from '../../../osp/map-control/function/resFunctionDialog/ResFunctionDialog.vue';
import ResFunctionNoDialog from '../../../osp/map-control/function/resFunctionNoDialog/ResFunctionNoDialog.vue';
import { deleteGraphic } from '../../../osp/domain/ResEventHandler';

const gisResFilterMenus = ['move', 'editPoint', 'breakLine', 'mergeLine'];
const hasSelectionFilterMenus = ['breakLine', 'bindAZ', 'cancelBindAZ', 'loadFormatPoint', 'mergeLine', 'move'];

export default {
  name: 'Index',
  components: {
    MenuRight,
    Footer,
    Search,
    Tools,
    ClickRight,
    // BindAZ,
    // Selection,
    property,
    // LinkCalculation,
    // addFormatPoint,
    // ThirdUrlPopup,
    PopuSchemaTopo,
    ResFunctionDialog,
    ResFunctionNoDialog,
  },
  provide() {
    return {
      getProjectInfo: () => this.queryData, // 任务单工程数据
      getHldEl: () => this.hldEl, //HLD节点
      getResourceList: () => this.resourceList, // 资源列表
      getLayerCheckData: () => this.layerCheckData, // 图层选择数据
      getLocation: () => this.location, // 点击地图获取对应经纬度
      getMapBox: () => this.mapBox, // gis实列
      getResTypeAttrDtos: () => this.resTypeAttrDtos, // gis的attr的属性对应资源form表内数据
      getSurfaceLayerList: () => this.surfaceLayerList, // 地貌列表
      getControlData: () => this.controlData, // 全局控制数据
      getResLabelField: () => this.resLabelField,
    };
  },
  props: {
    queryData: {
      type: Object,
    },
  },
  data() {
    return {
      hldEl: null,
      controlData: {
        popupName: '', //控制全局弹窗显示隐藏
        btnActiveName: 'select', // 地图联动当前功能按钮,
        initSelectedStatus: { componentName: 'init', rightCloseFlag: true }, // 初始化选择事件
      },
      styleConfigList: [],
      schemaTopoState: false,
      resTypeAttrDtos: [], // gis的attr的属性对应资源form表内数据
      RES_NAME: 'RES_test_001',
      areas: {
        longitude: null,
        latitude: null,
      },
      location: '',
      graphics: null,
      isShow: false,
      modal: {
        name: '',
        value: '',
      },
      isFirstList: false,
      isLastList: false,
      check: [],
      index: null,
      source: [],
      Longtiude: null,
      Latitude: null,
      option: {},
      service: [],
      AppMaps: [],
      resourceList: [], // 资源列表
      surfaceLayerList: [], // 地貌图层列表
      layerCheckData: [], // 图层选择数据
      graphicList: [],
      wfsObj: {},
      wfsList: [],
      wfsService: undefined, //定义wfs服务
      dynamicService: undefined, //定义dynamicservice服务,
      dynamicList: [],
      onlineMapList: [],
      mapBox: undefined,
      select: '0', // footer，底部信息展示
      prevent: false,
      overlay: undefined,
      menuList: [],
      chooseGraphic: undefined,
      //resourceLayers: [],
      alist: [],
      zlist: [],
      // showBind:false,
      initialized: false,
      resLabelField: 'NAME',
      // queryData:{},
    };
  },
  watch: {
    areas: {
      deep: true,
      handler(val, old) {
        let objs = {
          x: this.areas.longitude,
          y: this.areas.latitude,
        };
        this.centerAt(objs);
      },
    },
    'controlData.initSelectedStatus': {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val && val.componentName !== 'init') {
          this.initSelectEvent(val.rightCloseFlag);
        }
      },
    },

    // _portal: {
    // 	deep: true,
    // 	immediate: true,
    // 	handler(val, old) {
    // 		if (val && val.closeMenuFlag) {
    // 			if (this.mapBox) {
    // 				this.refreshMap();
    // 			}
    // 			portal.closeMenuFlag = false;
    // 		}
    // 	},
    // },
  },
  computed: {
    filter() {
      return (layerNo) => {
        let obj = this.resourceList.concat(this.surfaceLayerList).find((item) => item.layerNo === layerNo);
        if (!obj) return;
        if (obj.resStatus === 'A') return;
        let surfaceList = this.surfaceLayerList.filter((res) => res.resType !== 'A5').map((sur) => sur.layerNo);
        if (surfaceList.indexOf(layerNo) > -1) {
          return;
        }
        if (this.queryData.markFlag === 'sprint') {
          return this.$map.Filter.equalTo({
            propertyName: 'sprintId',
            expression: this.queryData.schemaId,
            matchCase: true,
          });
        } else {
          return this.$map.Filter.equalTo({
            propertyName: 'schemaId',
            expression: this.queryData.schemaId,
            matchCase: true,
          });
        }
      };
    },

    // _portal() {
    // 	return portal;
    // }
  },
  created() {
    // this.queryData = JSON.parse(JSON.stringify(this.rowData));
    getResTypeConfig(this.queryData.sprintId).then((data) => {
      // filter依赖此数据所以要在created生命周期函数内加载
      if (data && data.resultList) {
        let normalList = data.resultList.filter((res) => ['A', 'C'].indexOf(res.layerType) > -1);
        this.resourceList = normalList || [];
        getConfigExtend().then((result) => {
          if (result && result.labelField) {
            this.resLabelField = result.labelField;
          }
          this.getAppMaps();
        });
      }
    });

    getSurfaceLayers().then((data) => {
      if (data && data.resultList) {
        console.log(data);
        //A0 道路
        //A1 建筑
        //A5 接入点
        this.surfaceLayerList = data.resultList;
        this.surfaceLayerList = this.surfaceLayerList.filter((surface) => surface.mapNo === this.queryData.mapNo);
        this.surfaceLayerList.forEach((sur) => {
          sur.relaResType = sur.resType;
          sur.resType = sur.surfaceCat;
          sur.resTypeName = sur.surfaceDesc;
          sur.resGroup = sur.catDesc;
        });
      }
    });

    this.getStyleConfig().then((data) => {
      if (data && data.resultList) {
        this.styleConfigList = data.resultList;
      }
    });
  },
  mounted() {
    this.hldEl = this.$el;
    this.$nextTick(() => {
      //添加esc监听事件，清除操作、选中单选激活选中事件
      // map-example

      let mapDiv = $('.map-example').attr('tabindex', 1);

      mapDiv[0].addEventListener('keyup', (e) => {
        if (e.keyCode == 27) {
          // esc
          if (this.$refs.search) {
            this.$refs.search.hideSelect();
          }
          this.initSelectEvent(true);
        } else if (e.keyCode == 46) {
          // delete 删除
          if (this.menuList && this.menuList.length > 0) {
            let del = this.menuList.find((res) => res.code === 'delete');
            if (del) {
              this.graphic = this.chooseGraphic;
              deleteGraphic(this).then(() => {
                fish.toast('success', this.$t('DELETE_SUCCESS'));
                this.controlData.popupName = '';
                this.initSelectEvent(false);
              });
            }
          }
        }
      });
      // $('.map-container').context

      mapDiv[0].addEventListener('keydown', (e) => {
        // ctrl+f 查询
        if (e.keyCode === 70 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          this.$refs.search.query();
        }
        // else if (e.keyCode === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        // 	// ctrl + z 撤回
        // 	this.mapBox.undo();
        // } else if (e.keyCode === 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        // 	// ctrl + y 恢复
        // 	this.mapBox.redo();
        // }
      });
    });
    // 监听其他菜单关闭之后，地图实时更新数据
    let menu = portal.appGlobal.get('currentMenu');
    portal.appEvent.onMenuChanged((defer) => {
      //监听portal的事件
      let menuObject = portal.appGlobal.get('currentMenu');
      if (!menuObject) {
        defer.resolve();
        return;
      }
      if (menuObject.menuId !== menu.menuId) {
        console.log('leavel');
      } else {
        console.log('enter');
        this.updateSize();
        this.refreshMap();
      }
      defer.resolve();
    });

    window.onresize = () => {
      setTimeout(() => {
        this.updateSize();
      }, 300);
    };
  },
  methods: {
    initSelectEvent(rightCloseFlag) {
      this.mapBox.clear();
      this.mapBox.select();
      //this.menuList = [];
      this.prevent = false; // 关掉右键菜单
      if (this.$refs.tools) {
        this.$refs.tools.directClick('select');
      }
      if (this.$refs.toolbar && rightCloseFlag) {
        this.$refs.toolbar.rightClose();
      }
      this.controlData.initSelectedStatus.componentName = 'init';
    },

    updateSize() {
      if (this.mapBox) {
        this.mapBox._map.__.updateSize();
      }
    },

    closeRightBars() {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.rightClose();
      }
    },

    btnToCoverCurrentPage(val, param) {
      this.$emit('btnToCoverCurrentPage', val, param);
    },

    showBind() {
      this.$refs.bindAZ.graphic = JSON.parse(JSON.stringify(this.chooseGraphic));
      this.$refs.bindAZ.Alists = this.alist;
      this.$refs.bindAZ.Zlists = this.zlist;
      this.$refs.bindAZ.initData();
      this.$refs.bindAZ.popupInfo.show = true;
    },

    refreshMap() {
      this.mapBox.refresh();
      this.mapBox.select();
      if (this.$refs.tools) {
        this.$refs.tools.directClick('select');
      }
    },

    afterSelection(resultList) {
      this.$refs.search.$refs.info.changeAttributesByList(resultList);
      // this.mapBox.refreshLayers(resultList.map(res => res.resInfo.layerNo));
      this.refreshMap();
    },

    setSelect() {
      this.mapBox.clear();
      this.mapBox.select();
      this.$refs.tools.selectClick('select');
    },
    getAppMaps() {
      //获取地图
      this.mapBox = new this.$map.MapContainer('edesign', this.$refs.map);
      this.mapBox
        .init()
        .then(() => {
          this.initialized = true;
          // this.getArea();
          this.centerPlaningGrid();
          let visible = true;
          let styleFunction = this.getStyle();
          let filter = this.filter;
          let layers = this.mapBox.getLayers();
          // layers.forEach( layer => {
          //     layer.visible = this.resultList.some(y => y.layerNo === layer.id);
          // })
          if (this.queryData.markFlag === 'sprint') {
            getLayerConfigBySprintId(this.queryData.sprintId)
              .then((data) => {
                if (data && data.resultList) {
                  this.layerCheckData = data.resultList;
                  this.refreshLayers(data.resultList);
                }
              })
              .then(() => this.mapBox.select());
          } else {
            getLayerConfig(this.queryData.schemaId)
              .then((data) => {
                if (data && data.resultList) {
                  this.layerCheckData = data.resultList;
                  this.refreshLayers(data.resultList);
                }
              })
              .then(() => this.mapBox.select());
          }

          layers.forEach((layer) => {
            layer.showLabel = true;
            layer.labelField = this.resLabelField === 'NAME' ? 'resName' : 'resNo';
            layer.symbol = styleFunction(layer.id, layer.geometryType);
            layer.filter = filter(layer.id);
            let filterConfig = this.styleConfigList.filter((config) => config.layerNo === layer.id);
            if (filterConfig && filterConfig.length === 1) {
              let configData = filterConfig[0];
              if (configData.minVisibleScale) {
                this.mapBox.setLayerMinZoom(layer.id, Number(configData.minVisibleScale));
              }
              if (configData.maxVisibleScale) {
                this.mapBox.setLayerMaxZoom(layer.id, Number(configData.maxVisibleScale));
              }
            }
          });
          let onLineMapServices = this.mapBox.findServiceByType('OnLineMapService');
          onLineMapServices.forEach((i, index) => {
            i.layer.visible = visible;
            if (visible) {
              visible = false;
            }
          });
          this.mapBox.disableDoubleClickZoom();
          this.mapBox.refresh();
        })
        .then(() => this.addControl());
    },

    // 获取wfs图层样式配置
    getStyleConfig() {
      return new Promise((resolve, reject) => {
        fish.ajax({
          type: 'GET',
          url: 'edesign/gis/config/restype/resTypeStyle/v1',
          success: (data) => resolve(data),
        });
      });
    },

    openMenuInHld(menuId, menuTitle, menuParam) {
      // projectInfo, resDataInfo
      this.$emit('openMenuInHld', menuId, menuTitle, menuParam);
    },

    refreshLayers(val) {
      //刷新wfs图层,初始化时图层控制还没加载所以需要在HLD处理
      let layers = this.mapBox.getLayers();
      val.forEach((item) => {
        this.mapBox.setVisible(item.layerNo, item.isVisible === 'Y');
        this.mapBox.setSelectable(item.layerNo, item.isSelectable === 'Y');
        this.mapBox.setIsSnap(item.layerNo, item.isSnap === 'Y');
        layers.forEach((layer) => {
          if (layer.id === item.layerNo) {
            layer.showLabel = item.isLabelVisible === 'Y';
          }
        });
      });
      this.mapBox.refresh();
      this.initSelectEvent(false);
      // this.mapBox.select();
    },
    // 资源树中心定位之后
    afterCenter(menuList, gis) {
      this.prevent = true;
      this.menuList = menuList;
      this.chooseGraphic = gis;
      this.$refs.search.$refs.result.setResult(gis);
    },
    mapSelection(geos) {
      //this.mapBox.clear()
      if (geos.length === 0) {
        this.prevent = false;
        this.mapBox.clear();
        this.mapBox.select();
        if (this.$refs.tools) {
          this.$refs.tools.directClick('select');
        }
        return;
      }
      let geo = [];
      // 此处临时解决新建站点，选型之后进行站点内部设计，新建一个room，关掉内部设计页签，进行shift多选，出现layerNo为site，但是属性却是其他设备的问题
      geos.forEach((res) => {
        let layerNo = res.attributes.layerNo || res.layerNo;
        let newGra = new this.$map.Graphic(res.id, layerNo, res.geometry, null, res.attributes);
        geo.push(newGra);
      });

      console.log(geo);
      let finnalMenuList = [];
      //this.menuList = [];
      this.prevent = true;
      let resourceList = geo.map((item) => item.attributes);
      let layerNo = geo.map((item) => item.layerNo);
      let resTypes = [];
      this.chooseGraphic = geo;
      let hasResIdcount = 0;
      geo.forEach((item, i) => {
        if (item.attributes.resId) {
          hasResIdcount++;
        }
        let obj = this.resourceList.concat(this.surfaceLayerList).find((resource) => resource.layerNo === layerNo[i]);
        if (!obj) return;
        item.resType = obj.resType;
        item.relaResType = obj.relaResType ? obj.relaResType : '';
        resTypes.push(item.resType);
        item.name = obj.name;
        item.resTypeName = obj.resTypeName;
      });
      if (resTypes.length === 1) {
        finnalMenuList = ResTypeHandler.getContextMenu(resTypes[0]);
        if (geo[0].attributes.isGisRes === 'N') {
          finnalMenuList = finnalMenuList.filter((res) => gisResFilterMenus.indexOf(res.code) === -1);
        }
      } else {
        finnalMenuList = ResTypeHandler.getMultContextMenu(resTypes);
      }
      if (hasResIdcount > 0) {
        finnalMenuList = finnalMenuList.filter((res) => hasSelectionFilterMenus.indexOf(res.code) === -1);
      }
      if (this.queryData.markFlag === 'sprint') {
        finnalMenuList = finnalMenuList.filter((res) => ['RES_QRY'].indexOf(res.functionType) > -1);
      }
      finnalMenuList = finnalMenuList.sort((x, y) => x.seq - y.seq);
      this.menuList = finnalMenuList;

      let graphic = geo.filter((item) => item.resType !== undefined);
      this.select = graphic.length === 1 ? graphic[0].attributes.resName : '' + graphic.length; //选一个显示名称，多个显示数量
      this.$refs.search.$refs.result.setResult([graphic[graphic.length - 1]]);
    },

    updateInfoPanel(obj) {
      // layerNo用于刷新图层,刷新之后不需要了，最好是删掉
      if (obj.layerNo) {
        this.mapBox.refreshLayer(obj.layerNo);
        delete obj.layerNo;
      }
      this.$refs.search.$refs.info.changeAttributes(obj);
    },
    streetView(location) {
      //新增街景点击事件
      this.$refs.toolbar.menuTap({ name: 'Street View', code: 'StreetView' }, true);
      this.location = location;
      let arr = location.split(',');
      let symbol = Color.streetPicture;
      let coordinate = [Number(arr[1]), Number(arr[0])];
      let point = this.mapBox.createPointFromCurrentCoord(coordinate, SupportSpatialReferences.WGS84);
      //let point = new this.$map.Point(arr[0], arr[1], 4326);
      this.mapBox.getTempleLayer().clear();
      this.mapBox.addGeometry('streetView', point, symbol);
    },
    identify(graphics) {
      this.menuList = [];
      this.showInfos(graphics);
      this.prevent = true;
      let resourceList = graphics.map((item) => item.attributes);
      let layerNo = graphics.map((item) => item.layerNo);
      graphics.forEach((item, i) => {
        let obj = this.resourceList.concat(this.surfaceLayerList).find((resource) => resource.layerNo === layerNo[i]);
        if (!obj) return;
        item.resType = obj.resType ? obj.resType : obj.surfaceCat;
        item.name = obj.name ? obj.name : obj.catName;
        item.resTypeName = obj.resTypeName ? obj.resTypeName : obj.layerName;
      });
      let graphic = graphics.filter((item) => item.resType !== undefined);
      this.$refs.search.$refs.result.setResult(graphic);
    },
    getStyle() {
      return (layerNo, geometryType) => {
        let val = this.resourceList.concat(this.surfaceLayerList).find((row) => row.layerNo === layerNo);
        if (!val) return;

        let filterConfig = this.styleConfigList.filter((config) => config.layerNo === layerNo);

        let style;
        let textSymbol;
        let color;
        let alpha;
        if (filterConfig && filterConfig.length === 1) {
          let configData = filterConfig[0];
          let font = new Font(filterConfig.fontSize, configData.fontStyle, Number(configData.fontWeight), configData.fontFamiliy);
          let labelField = configData.labelField ? configData.labelField : '';
          textSymbol = new TextSymbol(
            labelField,
            font,
            this.createCloudColor(configData.fontColor),
            'center',
            'bottom',
            configData.fontXOff,
            configData.fontYOff,
            new mapColor(255, 255, 255, 0),
          );

          if (configData.geometryType === GeometryType.POINT) {
            let xOff = configData.xOff ? Number(configData.xOff) : 0;
            let yOff = configData.yOff ? Number(configData.yOff) : 0;
            style = new this.$map.PictureMarkerSymbol(
              configData.iconUrl,
              configData.imgSize,
              configData.imgSize,
              0,
              xOff,
              yOff,
              true,
              textSymbol,
              configData.size,
            );
          } else if (configData.geometryType === GeometryType.POLYGON) {
            let polygonLine = new SimpleLineSymbol(configData.lineStyle, this.createCloudColor(configData.lineColor), Number(configData.lineWidth));
            style = new this.$map.SimpleFillSymbol(polygonLine, this.createCloudColor(configData.fillColor), true, textSymbol);
          } else if (configData.geometryType === GeometryType.POLYLINE) {
            const airWire = new this.$map.SimpleLineSymbol(
              configData.lineStyle,
              this.createCloudColor(configData.lineColor),
              Number(configData.lineWidth),
              true,
              textSymbol,
            );
            const copper = new this.$map.SimpleLineSymbol(
              configData.lineStyle,
              this.createCloudColor(configData.lineColor),
              Number(configData.lineWidth),
              true,
              textSymbol,
            );
            const pipeline = new this.$map.SimpleLineSymbol(
              configData.lineStyle,
              this.createCloudColor(configData.lineColor),
              Number(configData.lineWidth),
              true,
              textSymbol,
            );
            const fiber = new this.$map.SimpleLineSymbol(
              configData.lineStyle,
              this.createCloudColor(configData.lineColor),
              Number(configData.lineWidth),
              true,
              textSymbol,
            );
            if (configData.layerNo === 'PIPELINE_G-C') {
              style = pipeline;
            } else if (configData.layerNo === 'AIR_WIRE-C') {
              style = airWire;
            } else if (configData.layerNo === 'C_CABLE-C') {
              style = copper;
            } else {
              style = fiber;
            }
          }
        }

        return style;

        // if (surfaceList.indexOf(val.layerNo) > -1) {
        // 	let lineColor = new mapColor(255, 0, 0);

        // }
        // const textSymbol = Color.blackText;
        // const airWire = new this.$map.SimpleLineSymbol('dash', new this.$map.Color(199, 21, 133, 1), 2, true, textSymbol);
        // const copper = new this.$map.SimpleLineSymbol('solid', new this.$map.Color(0, 0, 128, 1), 2, true, textSymbol);
        // const pipeline = new this.$map.SimpleLineSymbol('solid', new this.$map.Color(220, 20, 60, 0.8), 2, true,
        // 	textSymbol);
        // const fiber = new this.$map.SimpleLineSymbol('solid', new this.$map.Color(139, 0, 0, 0.8), 2, true, textSymbol);
        // let imgUrl = `oss_core/edesign/assets/image/map/res/${val.resType}.svg`;
        // let fillColor = new this.$map.Color(210, 105, 30, 0.1);
        // let lineStyle;
        // let style;
        // if (val.layerNo.includes('Pipeline')) {
        // 	lineStyle = pipeline;
        // } else if (val.layerNo.includes('AIR')) {
        // 	lineStyle = airWire;
        // } else if (val.layerNo.includes('Copper')) {
        // 	lineStyle = copper;
        // } else {
        // 	lineStyle = fiber;
        // }
        // let fillStyle = new this.$map.SimpleFillSymbol(Color.polygonLine, fillColor, true, textSymbol);
        // switch (geometryType) {
        // 	case 'geometryPoint':
        // 		style = new this.$map.PictureMarkerSymbol(imgUrl, 24, 24, 0, 0, 0, true, textSymbol);
        // 		break;
        // 	case 'geometryPolyline':
        // 		style = lineStyle;
        // 		break
        // 	case 'geometryPolygon':
        // 		style = fillStyle;
        // 		break
        // 	default:
        // 		break;
        // }
        // if (val.layerNo === "EDESIGN-CS-DP") {
        // 	style = new this.$map.PictureMarkerSymbol(imgUrl, 12, 12, 0, 0, 0, true, textSymbol);
        // }
        //return style
      };
    },

    createCloudColor(configColor) {
      let color;
      let alpha;
      let cloudColor;
      if (configColor && configColor.toString().length > 7) {
        color = configColor.toString().substr(0, 7);
        alpha = (parseInt(configColor.toString().substr(7, 2), 16) / 255).toFixed(2);
      } else {
        color = configColor.toString();
        alpha = 1;
      }
      cloudColor = mapColor.fromHex(color, alpha);
      return cloudColor;
    },
    addControl() {
      //加载控制器
      //创建菜单overlay
      this.overlay = new this.$map.Overlay({
        element: this.$refs.overlayDom,
        positioning: 'center-left',
        offset: [15, 0],
      });
      this.mapBox.addOverLay(this.overlay);
      this.mapBox.addEventListener('clear', () => {
        this.overlay.hide();
        return true;
      });
      // this.mapBox.select();
    },
    clearMenu(event) {
      if (!this.prevent) return;
      event.preventDefault();
      this.overlay.hide();
    },
    // getArea() {
    //     getAreaById(this.queryData.areaId).then(data => {
    //         if (data) {
    //             this.areas = Object.assign({}, this.areas, data);
    //         }
    //     });
    // },
    centerAt(val) {
      if (val.x && val.y) {
        let point = this.mapBox.createPointFromCurrentCoord([val.x, val.y], SupportSpatialReferences.WGS84);
        this.mapBox.centerAt(point);
      }
      this.centerPlaningGrid();
    },

    centerPlaningGrid() {
      this.getStyleConfig().then((data) => {
        if (data && data.resultList) {
          let gridLayers = data.resultList.filter((res) => res.geometryType === GeometryType.POLYGON).map((geo) => geo.layerNo);
          let filter;
          if (this.queryData.markFlag === 'sprint') {
            filter = Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.schemaId });
          } else {
            filter = Filter.equalTo({ propertyName: 'schemaId', expression: this.queryData.schemaId });
          }

          let featureLayers = gridLayers.map((layer) => {
            return {
              layerNo: layer,
              filter: filter,
            };
          });
          getByFeatureLayers(featureLayers).then((result) => {
            if (result && result.length > 0) {
              let geos = result.map((res) => res.geometry);
              this.mapBox.centerGeometries(geos);
            }
          });
        }
      });
    },
    toolbarShowChange(val) {
      //toolbar组件内容显示隐藏改变
      this.isShow = val;
    },
    showContent(val) {
      this.choosed = val;
    },
    inSearchResult(item, index) {
      // 搜索结果鼠标移入事件
      let graphic = item.CloudGraphic;
      let symbol = Color.blueIndex;
      let textSymbol = Color.blueText;
      textSymbol.text = `${index + 1}`;
      let point;
      if (graphic.geometry instanceof this.$map.Polyline) {
        let [paths] = graphic.geometry.getPaths();
        let path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], 3857);
      } else if (graphic.geometry instanceof this.$map.Polygon) {
        point = graphic.geometry.getCentroid();
      } else {
        point = graphic.geometry;
      }
      this.mapBox.addGeometry('pic', point, symbol);
      this.mapBox.addGeometry('text', point, textSymbol);
    },
    outSearchResult() {
      // 搜索结果鼠标移出事件
      this.mapBox.deleteById('pic');
      this.mapBox.deleteById('text');
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
    thirdUrlPopup(functionData, graphicData) {
      // 功能菜单弹框展示
      this.$refs.summary.functionData = functionData;
      this.$refs.summary.dataInfo = graphicData;
      this.$refs.summary.popup.show = true;
    },
    afterDeleteGraphic() {
      //右键删除
      this.controlData.popupName = '';
      this.initSelectEvent(true);
    },
    // gis属性界面展示
    propertyShow(graphics) {
      let resTypes = {};
      let resTypeNames = [];
      graphics.forEach((gra) => {
        if (resTypeNames.indexOf(gra.resTypeName) === -1) {
          resTypes[gra.resTypeName] = gra.resType;
          resTypeNames.push(gra.resTypeName);
        }
      });
      this.$refs.property.nameObjct = resTypes;
      this.$refs.property.tabList = resTypeNames;
      this.$refs.property.initGraphics = graphics;
      this.$refs.property.queryAttrInfo(resTypes[resTypeNames[0]]);
    },

    resComponentShow(functionData, dataInfo) {
      this.$refs.resFunctionDialog.setParentParam(functionData, dataInfo, this.queryData);
    },

    resComponentShowNoDialog(functionData, dataInfo) {
      this.$refs.resFunctionNoDialog.setParentParam(functionData, dataInfo, this.queryData, this.hldEl);
    },

    // 预加载衰减数据
    loadCalculatData() {
      this.$refs.linkCalculation.queryconfigData();
    },

    // 光衰减预估页面
    linkCalculation() {
      this.$refs.linkCalculation.popupObj.show = true;
    },

    // 定长布点场景
    loadFormatPoint(graphic) {
      this.$refs.addFormatPoint.initData(graphic);
    },
    centerGeometries(CloudGraphic) {
      // 搜索结果定位
      this.mapBox.centerAt(CloudGraphic.geometry);
    },
    showInfos(graphics) {
      graphics.forEach((graphic, index) => {
        let textSymbol = new this.$map.TextSymbol(`${index + 1}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -3, -20);
        let symbol = Color.showIndex;
        let point;
        if (graphic.geometry.geometryType === 'geometryPolyline') {
          let paths;
          if (typeof graphic.geometry.getPaths === 'function') {
            [paths] = graphic.geometry.getPaths();
          } else {
            [paths] = graphic.geometry.paths;
          }
          let path = this.getLinecenter(paths);
          point = new this.$map.Point(path[0], path[1], 3857);
        } else if (graphic.geometry.geometryType === 'geometryPolygon') {
          if (typeof graphic.geometry.getCentroid === 'function') {
            point = graphic.geometry.getCentroid();
          } else {
            point = graphic.geometry.centroid;
          }
        } else {
          point = graphic.geometry;
        }
        point = this.mapBox.createPointFromCurrentCoord([point.x, point.y], point.spatialReference);
        // newPoint = newPoint.transferProjection(SupportSpatialReferences.WEB_MERCATOR);
        try {
          this.mapBox.deleteById(`text${index + 1}`);
          this.mapBox.deleteById(`pic${index + 1}`);
        } catch (e) {
          console.log('no id found');
        }
        this.mapBox.addGeometry(`text${index + 1}`, point, textSymbol);
        this.mapBox.addGeometry(`pic${index + 1}`, point, symbol);
      });
    },
    rightClick(event) {
      if (!this.prevent) return;
      event.preventDefault();
      this.overlay.position = this.mapBox.getEventScreenPoint(event);
    },
    refreshTree() {
      if (this.$refs.toolbar.soltName !== 'ResourceTree') return;
      this.$refs.toolbar.$refs.ResourceTree.queryChildren();
    },
    openSchemaTopo() {
      this.schemaTopoState = true;
      this.$refs.schemaTopo.schemaId = this.queryData.schemaId;
      this.$refs.schemaTopo.popupSchemaTopo.show = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './designMap.scss';
</style>
