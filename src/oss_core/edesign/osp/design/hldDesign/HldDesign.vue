<template>
  <!-- <div class="map-example" @keyup.esc="escFn" @keyup.46="delFn" @keyup.ctrl.90="mapBox.undo()" @keyup.ctrl.89="mapBox.redo()" @keyup.ctrl.67="copy" tabindex="1"> -->
  <div class="map-example" :class="[fullscreen ? 'fullscreen' : '']" tabindex="1" @keyup.esc="escFn" @keyup.46="delFn" @keyup.ctrl.67="copy">
    <Search ref="search" @inSearchResult="inSearchResult" @outSearchResult="outSearchResult" @showInfos="showInfos" @centerGeometries="centerGeometries" @closeRightBars="closeRightBars" @map-selection="mapSelection"></Search>
    <Tools v-if="initialized" ref="tools" :fullscreen.sync="fullscreen" :rightMenuShow="isShow" @identify="identify" @street-view="streetView"></Tools>
    <div ref="map" class="map-container" @contextmenu="rightClick" @click="clearMenu"></div>
    <MenuRight ref="toolbar" @toolbarShowChange="toolbarShowChange" @map-selection="mapSelection" @openSchemaTopo="openSchemaTopo" @showTips="showTips" @refreshLayers="refreshLayers" @afterCenter="mapSelection" @linkCalculation="linkCalculation" @loadCalculatData="loadCalculatData" @setSelect="initSelectEvent" v-on="$listeners" @showContent="taskShowContent" @refreshTaskList="refreshTaskList"></MenuRight>
    <FooterMenu v-if="initialized" ref="footer" :select.sync="select"></FooterMenu>
    <div v-show="prevent" ref="overlayDom">
      <ClickRight ref="clickRight" :menuList="menuList" :graphic="chooseGraphic" @map-selection="mapSelection" @showTips="showTips" @splitGrid="splitGrid" @loadFormatPoint="loadFormatPoint" @delete="afterDeleteGraphic" @showBind="showBind" v-if="initialized"></ClickRight>
    </div>
    <BindAZ ref="bindAZ"></BindAZ>
    <property ref="property" @afterSaveProperty="refreshTree" @map-selection="mapSelection"></property>
    <addFormatPoint ref="addFormatPoint"></addFormatPoint>
    <PopuSchemaTopo v-if="schemaTopoState" ref="schemaTopo"></PopuSchemaTopo>
    <LinkCalculation ref="linkCalculation"></LinkCalculation>
    <QuickInput ref="quickInput" @attrChange="attrChange"></QuickInput>
  </div>
</template>

<script>
import {
  Color as MapColor,
  SimpleLineSymbol,
  TextSymbol,
  Font,
  SupportSpatialReferences,
  getByFeatureLayers,
  Filter,
  GeometryType,
  MapServiceType,
  Graphic,
} from 'map'; // gis平台API
import Search from '@/oss_core/edesign/osp/map-control/searchbar/search.vue'; // 搜索组件
import Tools from '@/oss_core/edesign/osp/map-control/tools/tools.vue'; // 顶部功能组件
import MenuRight from '@/oss_core/widgets/toolbar/toolbar.vue'; // 右侧菜单栏组件
import FooterMenu from '@/oss_core/edesign/osp/map-control/footbar/footer.vue'; // 底部信息组件
import ClickRight from '@/oss_core/edesign/osp/map-control/clickRight/clickRight.vue'; // 鼠标右键菜单栏组件
import BindAZ from '@/oss_core/edesign/osp/map-control/clickRight/bindAZ/bindAZ.vue'; // 绑定两端组件
import * as ResTypeHandler from '@/oss_core/edesign/osp/domain/ResTypeHandler'; // 鼠标右键菜单栏
import property from '@/oss_core/edesign/osp/map-control/clickRight/property/property.vue'; // 组件
import LinkCalculation from '@/oss_core/edesign/osp/sidebar/opticalAttenuation/linkCalculation.vue'; // 组件
import addFormatPoint from '@/oss_core/edesign/osp/map-control/clickRight/addFormatPoint/addFormatPoint.vue'; // 组件
import PopuSchemaTopo from '@/oss_core/edesign/topo/instance/PopuSchemaTopo.vue'; // 组件
import QuickInput from '@/oss_core/edesign/osp/sidebar/newResource/quickInput/QuickInput.vue'; // 快速输入组件
import * as Color from '@/oss_core/edesign/osp/design/drawStyle.js'; // 画图样式
import { deleteGraphic, initRouteObj, setHLDObj, copySurface, deleteTempGraphic, isAllEqual } from '@/oss_core/edesign/osp/domain/ResEventHandler'; // 抽出来的资源方法
import { getAllManagedRestypesWithGeometryType } from '@/oss_core/base/utils/ResourcesConfig.js'; // 公用配置
import { getDefaultDesignSetConfig } from '@/oss_core/base/utils/DesignSettingConfig.js'; // 公用配置
import {
  getResTypeConfig,
  getLayerConfig,
  getSurfaceLayers,
  getLayerConfigBySprintId,
  getSchemaSetting,
  queryAttrActionList,
  getConfigExtend,
  getMapDefSetting,
} from '@/oss_core/edesign/api/query/schema.js'; // 后台接口
import { getNewResInfo, getStyleConfig } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
import { getAppConfig } from '@/oss_core/edesign/api/common.js'; // 后台接口
// import { queryIsSurvey } from '@/oss_core/edesign/api/query/gisKey.js';

const gisResFilterMenus = ['move', 'editPoint', 'breakLine', 'mergeLine'];
const hasSelectionFilterMenus = ['breakLine', 'bindAZ', 'cancelBindAZ', 'loadFormatPoint', 'mergeLine'];

export default {
  name: 'MapView',
  components: {
    MenuRight,
    FooterMenu,
    Search,
    Tools,
    ClickRight,
    BindAZ,
    property,
    LinkCalculation,
    addFormatPoint,
    PopuSchemaTopo,
    QuickInput,
  },
  provide() {
    return {
      // getIsSplit: () => this.isSplit, // 任务单工程数据
      getProjectInfo: () => this.projectInfo, // 任务单工程数据
      getHldEl: () => this.hldEl, // HLD节点
      getResourceList: () => this.resourceList, // 资源列表
      getOtherDesignList: () => this.otherDesignList, // 资源列表
      getLayerCheckData: () => this.layerCheckData, // 图层选择数据
      getLocation: () => this.location, // 点击地图获取对应经纬度
      getMapBox: () => this.mapBox, // gis实列
      getResTypeAttrDtos: () => this.resTypeAttrDtos, // gis的attr的属性对应资源form表内数据
      getSurfaceLayerList: () => this.surfaceLayerList, // 地貌列表
      getControlData: () => this.controlData, // 全局控制数据
      getResLabelField: () => this.resLabelField,
      getPropertyConfigObj: () => this.propertyConfigObj,
      getSchemaConfigs: () => this.schemaConfigs, // 设计设置参数
      getAppConfig: () => this.appConfig,
      getAttrActionConfig: () => this.attrActionConfig, // 获取所有属性动作列表
      getResTypeConfig: () => this.resTypeConfig, // 获取任务单资源类型列表
      getHldTempleteTree: () => this.hldTempleteTree, // 获取能力模板树
      getBaseMapServices: () => this.baseMapServices, // 地图服务列表
    };
  },
  inject: ['defaultStyle'],
  props: {
    // isSplit: {
    //   type: Boolean,
    //   default: () => {
    //     return false;
    //   },
    // },
    projectInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      appConfig: {},
      otherDesignList: [],
      hldEl: null,
      controlData: {
        popupName: '', // 控制全局弹窗显示隐藏
        btnActiveName: 'select', // 地图联动当前功能按钮,
        initSelectedStatus: { componentName: 'init', rightCloseFlag: true }, // 初始化选择事件
      },
      styleConfigObj: null, // 样式配置
      schemaTopoState: false, // 控制PopuSchemaTopo组件加载
      resTypeAttrDtos: {}, // gis的attr的属性对应资源form表内数据
      location: '', // 存储街景点击地图的位置信息
      isShow: false, // toolbar组件内容显示隐藏改变
      resourceList: [], // 资源列表
      surfaceLayerList: [], // 地貌图层列表
      layerCheckData: [], // 图层选择数据
      // mapBox: {}, //地图实列
      select: '0', // footer，底部信息展示
      prevent: false, // 右键菜单显示隐藏控制
      overlay: undefined, // 右键菜单栏图层
      menuList: [], // 右键菜单栏数组
      chooseGraphic: [], // 当前选中的图元
      alist: [], // 绑定AZ数据
      zlist: [], // 绑定AZ数据
      initialized: false, // 地图是否初始化了
      resLabelField: 'resName',
      preventAll: false, // 屏蔽全部右键菜单
      clickMapRefreshFlag: '',
      propertyConfigObj: {}, // 后台配置数据
      schemaConfigs: {}, // 后台配置数据
      resTypeConfig: [], // 任务单资源类型列表
      gridGraphics: [], // 获取网格图层的所有图元
      hldTempleteTree: [], // 能力模板树
      tipOverlayMap: new Map(), // map类型存储tipOverlay
      sourceResList: [], // 引用资源列表
      baseMapServices: [], // 地图服务列表
      fullscreen: false, // 是否全屏模式
      resizeObserver: null, // 监听resize事件
    };
  },
  watch: {
    'controlData.initSelectedStatus': {
      deep: true,
      immediate: true,
      handler(val) {
        if (val && val.componentName !== 'init') {
          this.initSelectEvent(val.rightCloseFlag, val.componentName === 'needKeepCurSelectMode');
        }
      },
    },
  },
  created() {
    // getAppMaps方法依赖这些接口数据，需要全部获取完之后再进行地图初始化，Promise.all可以节省交互时间
    this.initData();
  },
  mounted() {
    this.hldEl = this.$el;
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.hldEl);
    //     if (e.keyCode === 70 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    //         e.preventDefault();
    //         this.$refs.search.query();
    //     }
    // 监听其他菜单关闭之后，地图实时更新数据
    const menu = portal.appGlobal.get('currentMenu');
    portal.appEvent.onMenuChanged(defer => {
      // 监听portal的事件
      const menuObject = portal.appGlobal.get('currentMenu');
      if (!menuObject) {
        defer.resolve();
        return;
      }
      if (menuObject.menuId !== menu.menuId) {
        // console.log('leavel');
      } else {
        // console.log('enter');
        this.updateSize();
        this.refreshMap();
      }
      defer.resolve();
    });

    // window.onresize = () => {
    //   setTimeout(() => {
    //     this.updateSize();
    //   });
    // };

    // 全局监听地图刷新
    this.$root.$on('refreshMap', this.refreshMap);
    this.$root.$on('map-selection', this.mapSelection);
    this.$root.$on('afterSelection', this.afterSelection);
    this.$root.$on('afterEditNode', this.afterEditNode);
    this.$root.$on('afterBindAZ', this.afterBindAZ);
    // 设计设置修改后全局更新
    this.$root.$on('refreshDesignSetting', this.refreshDesignSetting);
    // 引用后
    this.$root.$on('afterReferenceAction', this.getSourceResList);
    // 点地图刷图层
    this.$root.$on('clickMap2RefreshLayer', layerNo => {
      this.clickMapRefreshFlag = layerNo;
    });
    setHLDObj(this); // 在ResEventHander里面会需要用到当前组件方法和数据
  },
  destroyed() {
    // 全局监听地图刷新
    this.$root.$off('refreshMap', this.refreshMap);
    this.$root.$off('map-selection', this.mapSelection);
    this.$root.$off('afterReferenceAction', this.initReferenceFilter);
    // 全局监听地图刷新
    this.$root.$off('afterSelection', this.afterSelection);
    this.$root.$off('afterEditNode', this.afterEditNode);
    this.$root.$off('afterBindAZ', this.afterBindAZ);
    // 设计设置修改后全局更新
    this.$root.$off('refreshDesignSetting', this.refreshDesignSetting);
    // 点地图刷图层
    this.$root.$off('clickMap2RefreshLayer');
    this.resizeObserver.unobserve(this.hldEl);
    // window.onresize = null; //销毁
    setHLDObj(null); // 组件销毁时解除引用 释放当前对象 防止内存泄漏风险
  },
  methods: {
    initData() {
      const promiseList = [];
      promiseList.push(getResTypeConfig(this.projectInfo.sprintId));
      promiseList.push(getSurfaceLayers());
      promiseList.push(getStyleConfig({ sprintId: this.projectInfo.sprintId }));
      if (this.projectInfo.markFlag === 'sprint') {
        promiseList.push(getLayerConfigBySprintId(this.projectInfo.sprintId));
      } else {
        promiseList.push(getLayerConfig(this.projectInfo.schemaId));
      }
      promiseList.push(getSchemaSetting({ schemaId: this.projectInfo.schemaId }));
      promiseList.push(getAppConfig());
      promiseList.push(queryAttrActionList()); // 获取属性动作列表 copy / merge
      promiseList.push(getNewResInfo({ sprintId: this.projectInfo.sprintId })); // 获取能力模板信息
      promiseList.push(getConfigExtend());
      Promise.all(promiseList).then(promiseResult => {
        const key = fish.language === 'en' ? 'resGroup' : 'localName';
        if (promiseResult[0] && promiseResult[0].resultList) {
          this.resTypeConfig = promiseResult[0].resultList || []; // 任务单所有资源类型列表 包括：A在网 C当前设计 R非当前设计
          // 后台资源表中不配置ROUTE-C，需在前台手动加一个route，需要在Layer Control和Resource Tree中插入，不需要在New Resource和Copy Geo To中插入
          this.resTypeConfig.push(initRouteObj(this.projectInfo));
          this.resTypeConfig.forEach(res => {
            res.resGroupI18n = res[key];
            if (res.layerType === 'A' || res.layerType === 'C') {
              this.resourceList.push(res); // A在网 C当前设计
            } else if (res.layerType === 'R') {
              this.otherDesignList.push(res); // R非当前设计
            }
          });
        }
        if (promiseResult[1] && promiseResult[1].resultList) {
          this.surfaceLayerList = promiseResult[1].resultList; // A0 道路;  A1 建筑; A5 接入点;
          this.surfaceLayerList = this.surfaceLayerList.filter(surface => surface.mapNo === this.projectInfo.mapNo);
          this.surfaceLayerList.forEach(sur => {
            sur.relaResType = sur.resType;
            sur.resType = sur.surfaceCat;
            sur.resTypeName = sur.surfaceDesc;
            sur.resGroup = sur.catDesc;
            sur.resGroupI18n = sur[key];
          });
        }
        this.styleConfigObj = JSON.parse(JSON.stringify(this.defaultStyle)); // 深度拷贝防止影响defaultStyle原始数据
        const getStyleList = promiseResult[2] || [];
        this.resourceList.forEach(res => {
          if (res.layerType === 'C') {
            const queryStyle = getStyleList.find(style => style.layerNo === res.layerNo);
            if (queryStyle && queryStyle.styleJson) {
              const style = JSON.parse(queryStyle.styleJson);
              if (style.gisLayerThemeList && style.gisLayerThemeList.length > 0) {
                style.gisLayerThemeList.forEach(gisLayerTheme => {
                  gisLayerTheme.gisLayerThemeItemList.forEach(element => {
                    element.themeItemDef = JSON.stringify(element.themeItemDef);
                  });
                });
              }
              this.styleConfigObj[res.resType] = style; // 有配置就读配置
            }
            if (this.styleConfigObj[res.resType]) {
              res.style = this.styleConfigObj[res.resType];
              if (this.styleConfigObj[res.resType].gisLayerThemeList) {
                res.gisLayerThemeList = this.styleConfigObj[res.resType].gisLayerThemeList;
              }
            }
          }
        });
        const layerCheckData = promiseResult[3];
        if (layerCheckData && layerCheckData.resultList && layerCheckData.resultList.length > 0) {
          this.layerCheckData = layerCheckData.resultList;
        }
        if (promiseResult[4]) {
          const designSettingConfig = getDefaultDesignSetConfig();
          this.schemaConfigs = promiseResult[4];
          this.schemaConfigs.tolerance = promiseResult[4].tolerance ? promiseResult[4].tolerance : designSettingConfig.tolerance;
          this.schemaConfigs.stackDepth = promiseResult[4].stackDepth ? promiseResult[4].stackDepth : designSettingConfig.stackDepth;
          this.schemaConfigs.selectModel = promiseResult[4].selectModel ? promiseResult[4].tolerance : designSettingConfig.selectModel;
          // 后台不配置设计设置的默认值，在前台配置，当后台返回为null时，在前台读取默认配置
          this.schemaConfigs.bindTolerance = promiseResult[4].bindTolerance ? promiseResult[4].bindTolerance : designSettingConfig.bindTolerance;
        }
        if (promiseResult[5]) {
          this.appConfig = promiseResult[5];
        }
        if (promiseResult[6]) {
          this.attrActionConfig = promiseResult[6];
        }
        this.hldTempleteTree = promiseResult[7] || [];
        this.hldTempleteTree.forEach(item => {
          item.resGroupI18n = item[key];
        });
        this.propertyConfigObj = promiseResult[8] || {};
        this.getAppMaps();
      });
    },
    async getAppMaps() {
      // 获取地图
      this.mapBox = new this.$map.MapContainer('edesign', this.$refs.map);
      const onePromies = this.getGridGraphics();
      const twoPromies = this.getSourceResList(true);
      const threePromies = getMapDefSetting(this.projectInfo.sprintId);
      await onePromies;
      await twoPromies;
      const mapDef = await threePromies;
      // let geos = this.centerPlaningGrid(true);
      const mapExtends = this.getExtendByGrid(this.gridGraphics);
      await this.mapBox.init({ mapNo: this.projectInfo.mapNo, initExtent: mapExtends });
      const baseMapList = [MapServiceType.ONLINE_MAP_SERVICE, MapServiceType.GEOSERVER_OFFLINE_MAP, MapServiceType.BING_MAP];
      this.baseMapServices = this.mapBox.findServiceByType(baseMapList); // 初始化后要马上设置visible否则马上加载所有地图
      this.baseMapServices.forEach((i, index) => {
        if (mapDef && mapDef.paramVal ? mapDef.paramVal === i.serviceNo : index === 0) {
          i.layer.visible = true;
        } else {
          i.layer.visible = false;
        }
      });
      this.initialized = true;
      this.surfaceLayerList.forEach(sur => {
        const findRes = this.mapBox.findLayer(sur.layerNo);
        if (findRes) {
          sur.layerName = findRes.layerName;
          sur.geometryType = findRes.geometryType;
        }
      });
      // if (this.projectInfo.markFlag === 'sprint') {
      //   this.showAddButton();
      // }
      this.setLayerStyle();
      // 由于在保存route后，数据库中新增的layerName和layerNo都为ROUTE-C，后台不便解决，前台改layerName为Route
      this.layerCheckData.some(item => {
        if (item.layerNo === 'ROUTE-C') {
          item.layerName = 'Route';
          return true;
        }
        return false;
      });
      this.mapBox.disableDoubleClickZoom();
      this.addControl();
      this.initReferenceFilter();
      this.$nextTick(() => {
        this.mapBox.select();
      });
    },
    setLayerStyle() {
      const layers = this.mapBox.getLayers() || [];
      layers.forEach(layer => {
        const layerInfo = this.resTypeConfig.concat(this.surfaceLayerList).find(res => res.layerNo === layer.id);
        if (layerInfo) {
          if (layerInfo.layerType === 'C' || layerInfo.resType === 'A5') {
            this.filter(layer, layerInfo.resType); // 过滤非本任务单数据
            const configData = this.styleConfigObj[layerInfo.resType];
            if (!layer.labelField) {
              layer.labelField = this.resLabelField;
            }
            if (configData) {
              if (configData.labelField) {
                layer.labelField = configData.labelField;
              }
              if (configData.minVisibleScale) {
                this.mapBox.setLayerMinZoom(layer.id, Number(configData.minVisibleScale));
              }
              if (configData.maxVisibleScale) {
                this.mapBox.setLayerMaxZoom(layer.id, Number(configData.maxVisibleScale));
              }
              this.setStyle(layer, configData);
            }
          }
          // 是否图层配置有保存数据，没有就判断是否是设计准备，设计中默认为都勾选（但不展示地貌跟其他设计的），设计准备只展示地貌和规划网格，有就根据配置刷新地图展示
          if (this.layerCheckData.length === 0) {
            let flag = false;
            if (this.projectInfo.markFlag === 'sprint') {
              if (layerInfo.surfaceCat || layerInfo.layerNo === 'PLAN_GRID-C') {
                flag = true;
              }
            } else if (!(layerInfo.layerType === 'R' || layerInfo.surfaceCat)) {
              flag = true;
            }
            this.mapBox.setVisible(layer.id, flag);
            this.mapBox.setSelectable(layer.id, flag);
            this.mapBox.setIsSnap(layer.id, flag);
            layer.showLabel = false;
          }
        } else {
          if (['EDESIGN_MAP_MARKER_POINT', 'EDESIGN_MAP_MARKER_LINE', 'EDESIGN_MAP_MARKER_GRID'].indexOf(layer.id) > -1) {
            this.filter(layer); // 过滤非本任务单数据
          }
          this.mapBox.setVisible(layer.id, false);
          this.mapBox.setIsSnap(layer.id, false);
        }
      });
      this.projectInfo.markFlag !== 'sprint' && this.layerCheckData.length > 0 && this.refreshLayers(true);
    },
    filter(layer, resType) {
      if (this.projectInfo.markFlag === 'sprint' || resType === 'A5' || resType === 'PLAN_GRID') {
        layer.filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.projectInfo.sprintId, matchCase: true });
      } else {
        layer.filter = this.$map.Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId, matchCase: true });
      }
    },
    setStyle(layer, configData) {
      layer.symbol = this.setStylebyConfig(configData.geometryType, configData);
      if (configData.gisLayerThemeList && configData.gisLayerThemeList.length > 0) {
        const styleRuleList = [];
        configData.gisLayerThemeList.forEach(gisLayerTheme => {
          gisLayerTheme.gisLayerThemeItemList.forEach(element => {
            const themeItemDef = JSON.parse(element.themeItemDef);
            const featureFilter = this.$map.FeatureFilterHandlerEngine.encode(themeItemDef);
            const style = this.setStylebyConfig(configData.geometryType, element);
            let styleRule;
            if (element.minVisibleScale || element.maxVisibleScale) {
              styleRule = new this.$map.StyleRule(featureFilter, style, true, element.minVisibleScale, element.maxVisibleScale);
            } else {
              styleRule = new this.$map.StyleRule(featureFilter, style);
            }
            styleRule.themeItemId = element.themeItemId;
            styleRuleList.push(styleRule);
          });
        });
        layer.themeItemList = styleRuleList;
      }
    },
    setStylebyConfig(geometryType, config) {
      const font = new Font(Number(config.fontSize), config.fontStyle, config.fontWeight, config.fontFamiliy);
      const textSymbol = new TextSymbol(
        '', // text
        font,
        this.createCloudColor(config.fontColor),
        'center',
        'bottom',
        config.fontXOff,
        config.fontYOff,
        new MapColor(255, 255, 255, 0),
      );
      let style;
      if (geometryType === GeometryType.POINT) {
        const xOff = config.xOff ? Number(config.xOff) : 0;
        const yOff = config.yOff ? Number(config.yOff) : 0;
        style = new this.$map.PictureMarkerSymbol(config.iconUrl, config.imgSize, config.imgSize, 0, xOff, yOff, true, textSymbol, config.size);
      } else if (geometryType === GeometryType.POLYGON) {
        // 网格不参与数据库配置，
        const polygonLine = new SimpleLineSymbol(config.lineStyle, this.createCloudColor(config.lineColor), Number(config.lineWidth));
        style = new this.$map.SimpleFillSymbol(polygonLine, this.createCloudColor(config.fillColor), true, textSymbol);
      } else if (geometryType === GeometryType.POLYLINE) {
        style = new this.$map.SimpleLineSymbol(config.lineStyle, this.createCloudColor(config.lineColor), Number(config.lineWidth), true, textSymbol);
      }
      return style;
    },
    createCloudColor(configColor) {
      let color;
      let alpha;
      if (configColor) {
        if (configColor.toString().length > 7) {
          color = configColor.toString().substr(0, 7);
          alpha = (parseInt(configColor.toString().substr(7, 2), 16) / 255).toFixed(2);
        } else {
          color = configColor.toString();
          alpha = 1;
        }
      } else {
        this.$message.error('Color Configuration Error');
        color = '#000000';
        alpha = 1;
      }

      const cloudColor = MapColor.fromHex(color, alpha);
      return cloudColor;
    },
    initSelectEvent(rightCloseFlag, keepCurMode) {
      // 试用clear方法会清除select事件 暂时清除select就可以了
      // this.mapBox.clear();
      this.mapBox.select();
      // this.menuList = [];
      this.prevent = false; // 关掉右键菜单
      if (this.$refs.tools) {
        this.$refs.tools.directClick(keepCurMode ? this.$refs.tools.selectName : 'select');
      }
      if (this.$refs.toolbar && rightCloseFlag) {
        this.$refs.toolbar.rightClose();
      }
      this.controlData.initSelectedStatus.componentName = 'init';
      // this.$nextTick(() => {
      //     this.mapBox.select();
      // });
    },

    updateSize() {
      if (this.mapBox && this.mapBox._map) {
        this.mapBox._map.__.updateSize();
      }
    },

    closeRightBars() {
      if (this.$refs.toolbar) {
        // 如果打开的右侧页签是路由查询则不关闭
        if (this.$refs.toolbar.$refs.NodeNetwork) return;
        this.$refs.toolbar.rightClose();
      }
    },

    showBind() {
      this.$refs.bindAZ.graphic = JSON.parse(JSON.stringify(this.chooseGraphic));
      this.$refs.bindAZ.Alists = this.alist;
      this.$refs.bindAZ.Zlists = this.zlist;
      this.$refs.bindAZ.initData();
      this.$refs.bindAZ.popupInfo.show = true;
    },

    refreshMap() {
      if (this.mapBox) {
        this.mapBox.refresh();
        this.mapBox.select();
      }
      if (this.$refs.tools) {
        this.$refs.tools.directClick('select');
      }
    },
    splitGrid(grids) {
      this.$emit('splitGrid', grids);
    },
    editAttributeById(layerNo, graphic, call) {
      this.$map.editAttributeById(layerNo, graphic).then(res => {
        call && call(res);
      });
    },
    getExtendByGrid(gridGraphics) {
      let mapExtends;
      const geos = gridGraphics.map(graphic => graphic.geometry);
      if (geos.length === 1) {
        mapExtends = geos[0].getExtent();
      } else if (geos.length > 1) {
        let polygonGeoPaths = [];
        // geos.forEach(geo => {
        //   let centerPoint = geo.getCentroid();
        //   polygonGeoPaths.push([centerPoint.x, centerPoint.y]);
        // });
        geos.forEach(geo => {
          const rings = geo.getRings();
          polygonGeoPaths = polygonGeoPaths.concat(rings);
        });
        const polygonGeo = new this.$map.Polygon(polygonGeoPaths, SupportSpatialReferences.WEB_MERCATOR);
        mapExtends = polygonGeo.getExtent();
      }
      return mapExtends;
    },
    async getSourceResList(init) {
      const filter = Filter.and(
        Filter.equalTo({
          propertyName: 'schemaId',
          expression: this.projectInfo.schemaId,
        }),
        Filter.equalTo({
          propertyName: 'sourceFlag',
          expression: 'R',
        }),
      );
      // 过滤：本项目下sourceFlag为R的资源类型
      const featureLayers = this.resourceList
        .filter(
          resource => resource.layerType === 'C' && ['OLT_GRID', 'OCC_GRID', 'ODB_GRID', 'PLAN_GRID', 'TASK_GRID'].indexOf(resource.resType) < 0,
        )
        .map(res => ({ layerNo: res.layerNo, filter }));
      this.sourceResList = (await getByFeatureLayers(featureLayers)) || [];
      !init && this.initReferenceFilter();
    },
    initReferenceFilter() {
      const schemaFilterKey = this.projectInfo.markFlag === 'sprint' ? 'sprintId' : 'schemaId';
      const schemaFilterValue = this.projectInfo.markFlag === 'sprint' ? this.projectInfo.sprintId : this.projectInfo.schemaId;
      // 此处的这些过滤条件注意需要与tools的identify过滤条件作响应
      const filterList = [
        this.$map.Filter.notEqualTo({
          propertyName: schemaFilterKey,
          expression: schemaFilterValue,
          matchCase: true,
        }),
        // 可以利旧之后再引用
        this.$map.Filter.or(
          this.$map.Filter.equalTo({ propertyName: 'sourceFlag', expression: 'N', matchCase: true }),
          this.$map.Filter.equalTo({ propertyName: 'sourceFlag', expression: 'U', matchCase: true }),
        ),
      ];
      if (this.sourceResList.length > 0) {
        const invalidGisKeys = this.sourceResList.map(res => res.attributes.refGisKey);
        invalidGisKeys.forEach(gisKey => {
          const filter = this.$map.Filter.notEqualTo({
            propertyName: 'gisKey',
            expression: gisKey,
            matchCase: true,
          });
          filterList.push(filter);
        });
      }
      const finnalFilter = Filter.and(...filterList);
      const service = this.mapBox.findService('edesign.other-design-layer-service-geoserver');
      if (service && service.layers) {
        service.layers.forEach(res => {
          res.filter = finnalFilter;
        });
      }
      this.mapBox.refresh();
      this.initSelectEvent();
    },

    refreshLayers(init, refreshLayers) {
      // 刷新wfs图层,初始化时图层控制还没加载所以需要在HLD处理
      const layers = this.mapBox.getLayers();

      this.layerCheckData.forEach(item => {
        if (refreshLayers && refreshLayers.indexOf(item.layerNo) < 0) {
          return;
        }
        const layer = layers.find(layerItem => layerItem.id === item.layerNo);
        if (!layer) {
          // eslint-disable-next-line no-console
          console.log(
            `Error: edn_gis_layer_config(任务单或者sprint单下的图层)或者ednc_restype_layer_rela(mapNo下的图层)配置了图层，但是gis库没有配置该图层, layerNo名为:${item.layerNo}`,
          );
          return;
        }
        if (item.themeItemId) {
          const themeStyle = layer.themeItemList && layer.themeItemList.find(themeItem => themeItem.themeItemId === item.themeItemId);
          if (themeStyle) {
            themeStyle.isVisible = item.isVisible === 'Y';
          }
        } else {
          this.mapBox.setVisible(item.layerNo, item.isVisible === 'Y');
          this.mapBox.setSelectable(item.layerNo, item.isSelectable === 'Y');
          this.mapBox.setIsSnap(item.layerNo, item.isSnap === 'Y');
          layer.showLabel = item.isLabelVisible === 'Y';
        }
      });
      if (!init) {
        if (refreshLayers) {
          this.mapBox.refreshLayers(refreshLayers);
        } else {
          this.mapBox.refresh();
        }
        this.initSelectEvent(false);
      }
    },
    taskSetSelected(gisKey) {
      const layerInfo = this.mapBox.getLayers().find(layer => layer.id === 'TASK_GRID');
      const setSelGis = [];
      this.mapBox.clear();
      if (layerInfo.source && layerInfo.visible) {
        const features = layerInfo.source.getFeatures();
        const feature = features.find(item => item.values_.gisKey === gisKey);
        if (feature) {
          const geo = Graphic.from(feature, this.mapBox.spatialReference);
          setSelGis.push(geo);
        }
      }
      setSelGis.length > 0 && this.mapSelection(setSelGis);
      setSelGis.length > 0 && this.mapBox.setSelected(setSelGis);
    },
    mapSelection(geos) {
      this.controlData.popupName = ''; // 每次选择清除页面弹窗
      this.$emit('mapSelected', geos);
      if (geos.length === 0) {
        this.prevent = false;
        this.$root.$emit('directClick', 'select');
        // 点击到空地之后，取消编辑节点动作
        if (this.clickMapRefreshFlag) {
          this.mapBox.refreshLayer(this.clickMapRefreshFlag);
          this.clickMapRefreshFlag = '';
        }
        return;
      }
      // 或者选中到另外一个对象时，也取消编辑节点动作
      this.mapBox._editTool.deactivate();
      this.preventAll = false;
      const geo = geos;
      // let geo = [];
      // 此处临时解决新建站点，选型之后进行站点内部设计，新建一个room，关掉内部设计页签，进行shift多选，出现layerNo为site，但是属性却是其他设备的问题
      // geos.forEach(res => {
      //     let layerNo = res.attributes.layerNo || res.layerNo;
      //     let newGra = new this.$map.Graphic(res.id, layerNo, res.geometry, null, res.attributes);
      //     geo.push(newGra);
      // });
      console.log(geo);
      let finnalMenuList = [];
      this.prevent = true;
      let isReferenced = false;
      const resTypes = [];
      const layerNos = [];
      this.chooseGraphic = geo;
      let hasResIdcount = 0;
      // let hasSchemaGridCount = 0; // just for grid, is_sprint_grid='N',
      let hasSprintGridCount = 0; // just for grid, is_sprint_grid='Y',
      let hasSchemaId = 0;
      geo.forEach(item => {
        if (item.attributes.sourceFlag === 'R' || item.attributes.sourceFlag === 'U') {
          isReferenced = true;
        }
        if (item.attributes.resId) {
          hasResIdcount += 1;
        }
        // if (item.attributes.isSprintGrid === 'N') {
        //   hasSchemaGridCount += 1;
        // }
        if (item.attributes.isSprintGrid === 'Y') {
          hasSprintGridCount += 1;
        }
        if (item.attributes.schemaId) {
          hasSchemaId += 1;
        }
        const obj = this.resourceList
          .concat(this.surfaceLayerList)
          .concat(this.otherDesignList)
          .find(resource => resource.layerNo === item.layerNo || resource.resType === item.attributes.reResType);
        // this.$refs.tools.$refs.surfaceDraw.selectObj;
        if (obj) {
          item.resType = obj.resType;
          item.relaResType = obj.relaResType ? obj.relaResType : '';
          if (resTypes.indexOf(item.resType) === -1) {
            resTypes.push(item.resType);
          }
          if (layerNos.indexOf(item.layerNo) === -1) {
            layerNos.push(item.layerNo);
          }
          item.name = obj.name;
          item.resTypeName = obj.resTypeName;
        } else if (['EDESIGN_MAP_MARKER_POINT', 'EDESIGN_MAP_MARKER_LINE', 'EDESIGN_MAP_MARKER_GRID'].indexOf(item.layerNo) > -1) {
          item.resType = item.layerNo;
          if (resTypes.indexOf(item.resType) === -1) {
            resTypes.push(item.resType);
          }
          if (layerNos.indexOf(item.layerNo) === -1) {
            layerNos.push(item.layerNo);
          }
        }
      });
      if (geo.length === 1) {
        // finnalMenuList = ResTypeHandler.getContextMenu(geo[0].resType);
        if (geo[0].layerNo === 'demandBuilding') {
          finnalMenuList = ResTypeHandler.getContextTempMenu(geo[0].resType);
        } else {
          finnalMenuList = ResTypeHandler.getContextMenu(geo[0].resType);
        }
        if (geo[0].attributes.isGisRes === 'N') {
          finnalMenuList = finnalMenuList.filter(res => gisResFilterMenus.indexOf(res.code) < 0);
        }
      } else if (geo.length > 1) {
        if (layerNos.length === 1 && layerNos[0] === 'demandBuilding') {
          finnalMenuList = ResTypeHandler.getMultContextTempMenu(resTypes);
        } else {
          finnalMenuList = ResTypeHandler.getMultContextMenu(resTypes);
        }
      }
      if (hasResIdcount > 0) {
        finnalMenuList = finnalMenuList.filter(res => hasSelectionFilterMenus.indexOf(res.code) < 0);
      }
      //   网格不添加这个功能
      if (!isAllEqual(geo) || ['OLT_GRID', 'OCC_GRID', 'ODB_GRID'].indexOf(geo[0].resType) > -1) {
        finnalMenuList = finnalMenuList.filter(res => res.code !== 'changeDesignElement');
      }
      // let findRes = finnalMenuList.find(res => res.code === 'delete');
      // if (findRes) {
      //     finnalMenuList = finnalMenuList.filter(res => res.code !== 'delete');
      // }
      if (this.projectInfo.markFlag === 'sprint') {
        // 如果资源有SchemaId则只允许查询
        if (hasSchemaId > 0 && geo[0].layerNo !== 'TASK_GRID') {
          finnalMenuList = finnalMenuList.filter(res => res.functionType === 'RES_QRY');
        }
        if (geo[0].layerNo === 'TASK_GRID') {
          finnalMenuList = finnalMenuList.filter(res => res.code !== 'copy');
        }
      } else if (hasSprintGridCount > 0) {
        if (geo[0].layerNo === 'TASK_GRID') {
          finnalMenuList = finnalMenuList.filter(res => res.code === 'copy');
        } else {
          // 在设计界面时,is_sprint_grid='Y'的网格，不允许删除，分割自身等会导致原始对象消失的操作。但是可以编辑节点。
          const editNodeMenu = finnalMenuList.find(res => res.code === 'editPoint');
          finnalMenuList = finnalMenuList.filter(res => res.functionType === 'RES_QRY');
          if (editNodeMenu) {
            finnalMenuList.push(editNodeMenu);
          }
        }
      }
      finnalMenuList = finnalMenuList.sort((x, y) => x.seq - y.seq);
      if (isReferenced) {
        finnalMenuList = finnalMenuList.filter(res => res.code !== 'selectModel');
        finnalMenuList = finnalMenuList.filter(res => res.code !== 'move');
        finnalMenuList = finnalMenuList.filter(res => res.code !== 'delete');
      }

      if (resTypes.length !== 1) {
        finnalMenuList = finnalMenuList.filter(res => res.code !== 'copy2OtherLayer');
      }

      if (this.projectInfo.viewType === 'view') {
        finnalMenuList = finnalMenuList.filter(res => res.functionType === 'RES_QRY');
      }
      this.menuList = finnalMenuList;

      const graphic = geo.filter(item => item.resType !== undefined);
      this.select = graphic.length === 1 ? graphic[0].attributes.resName : graphic.length.toString(); // 选一个显示名称，多个显示数量
      // if (!isIgnoreInfoPanel) {
      //   this.$refs.search.$refs.result.setResult([graphic[graphic.length - 1]]);
      // }
      // 如果是已有的道路建筑物转换的临时图层，选中后直接放进编辑数组，因为选中后可能进行拉伸旋转
      if (geo[0].layerNo === 'demandBuilding' && geo.length === 1 && geo[0].attributes.gisKey) {
        // if (geo[0].resType === 'A0' && geo[0].attributes.gisKey) {
        //   this.$refs.tools.$refs.surfaceDraw.editRoadList.push(geo[0].id);
        // } else if (geo[0].resType === 'A1' && geo[0].attributes.gisKey) {
        //   this.$refs.tools.$refs.surfaceDraw.editBuildingList.push(geo[0].id);
        // }
        this.$refs.toolbar.$refs.InitialSurvey.$refs.RemoteSurvey.editRoadList.push(geo[0].id);
      }
    },
    streetView(location) {
      // 新增街景点击事件
      this.$refs.toolbar.menuTap({ name: this.$t('OSP_MAP_SEARCHBAR_TOOLS_STREET_VIEW'), code: 'StreetView' }, true);
      this.location = location;
      const arr = location.split(',');
      const symbol = Color.streetPicture;
      const coordinate = [Number(arr[1]), Number(arr[0])];
      const point = this.mapBox.createPointFromCurrentCoord(coordinate, SupportSpatialReferences.WGS84);
      // let point = new this.$map.Point(arr[0], arr[1], 4326);
      this.mapBox.getTempleLayer().clear();
      this.mapBox.addGeometry('streetView', point, symbol);
    },
    identify(graphics) {
      this.menuList = [];
      this.showInfos(graphics);
      this.prevent = true;
      graphics.forEach(item => {
        let obj = this.resourceList
          .concat(this.surfaceLayerList)
          .concat(this.otherDesignList)
          .find(resource => resource.layerNo === item.layerNo);
        if (!obj) {
          obj = this.mapBox.findLayer(item.layerNo);
          if (!obj) return;
          item.resType = item.layerNo;
          item.name = item.attributes.idMza;
          item.resTypeName = item.layerNo;
          item.surfaceFlag = 'otherSurfaceLayer';
        } else {
          item.resType = obj.resType ? obj.resType : obj.surfaceCat;
          item.name = obj.name ? obj.name : obj.catName;
          item.resTypeName = obj.layerName ? obj.layerName : obj.resTypeName;
          item.relaResType = obj.relaResType ? obj.relaResType : '';
        }
      });
      const graphic = graphics.filter(item => item.resType !== undefined);
      this.$refs.search.$refs.result.setResult(graphic);
    },
    addControl() {
      // 加载控制器
      // 创建菜单overlay
      this.overlay = new this.$map.Overlay({
        element: this.$refs.overlayDom,
        positioning: 'top-left',
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
      if (!this.prevent) {
        this.preventAll = false;
        return;
      }
      event.preventDefault();
      this.overlay.hide();
    },
    centerAt(val) {
      if (val.x && val.y) {
        const point = this.mapBox.createPointFromCurrentCoord([val.x, val.y], SupportSpatialReferences.WGS84);
        this.mapBox.centerAt(point);
      }
      this.mapBox.centerGeometries([this.graphics[0].geometry]);
    },

    centerPlaningGrid() {
      // let geos = [];
      // let geoMap = {};
      // // let layerNoType = this.isSplit ? 'TASK_GRID' : 'PLAN_GRID';
      // let layerNoType = 'PLAN_GRID'; //依然根据plan网格居中
      // if (this.projectInfo.markFlag === 'sprint') {
      //   this.gridGraphics.forEach(graphic => {
      //     const mapKey = `${graphic.layerNo}_${graphic.id}`;
      //     if (graphic.layerNo === layerNoType && !geoMap[mapKey]) {
      //       geos.push(graphic.geometry);
      //       geoMap[mapKey] = true;
      //     }
      //   });
      // } else {
      //   this.gridGraphics.forEach(graphic => {
      //     if (graphic.layerNo !== layerNoType && graphic.attributes.schemaId === this.projectInfo.schemaId) {
      //       geos.push(graphic.geometry);
      //     }
      //   });
      // }
      // if(this.isSplit){
      //   geos = [geos[0]];
      // }
      // !init && this.mapBox.centerGeometries(geos);
      // return geos;
    },
    // showAddButton() {
    //   this.gridGraphics.forEach(graphic => {
    //     if (graphic.layerNo !== 'PLAN_GRID' && !graphic.attributes.schemaId) {
    //       this.showTips(graphic); //展示
    //     }
    //   });
    // },
    // showTips(graphic, type) {
    //   if (this.projectInfo.markFlag === 'sprint') {
    //     let tipOverlay = this.tipOverlayMap.get(graphic.attributes.gisKey);
    //     if (type === 'del') {
    //       tipOverlay && this.mapBox.removeOverLay(tipOverlay);
    //     } else {
    //       if (tipOverlay) {
    //         this.mapBox.addOverLay(tipOverlay);
    //       } else {
    //         let centerGeo = graphic.geometry.getCentroid();
    //         let mouseOver = $(`<div class='grid-addbutton' title='${this.$t('E_PROJECTDETAIL_NEW_PROJECT')}'><span>+</span></div>`);
    //         let overlay = new Overlay({
    //           id: graphic.attributes.gisKey,
    //           position: {
    //             x: centerGeo.x,
    //             y: centerGeo.y,
    //           },
    //           element: mouseOver[0],
    //           positioning: 'center-center',
    //           // offset: [-15, -15],
    //         });
    //         this.mapBox.addOverLay(overlay);
    //         this.tipOverlayMap.set(graphic.attributes.gisKey, overlay);
    //         console.log(this.tipOverlayMap);
    //         mouseOver.click(() => {
    //           this.chooseGraphic = [];
    //           this.menuList = [];
    //           this.$refs.toolbar.newTask(graphic, overlay);
    //         });
    //       }
    //     }
    //   }
    // },
    toolbarShowChange(val) {
      this.isShow = val; // toolbar组件内容显示隐藏改变
    },
    showContent(val) {
      this.choosed = val;
    },
    taskShowContent() {
      this.$emit('taskNewSucced');
    },
    refreshTaskList() {
      this.$emit('refreshTaskList');
    },
    inSearchResult(item, index) {
      // 搜索结果鼠标移入事件
      const graphic = item.CloudGraphic;
      const symbol = Color.blueIndex;
      const textSymbol = Color.blueText;
      textSymbol.text = `${index + 1}`;
      let point;
      if (graphic.geometry.geometryType === GeometryType.POLYLINE) {
        const [paths] = graphic.geometry.getPaths();
        const path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], 3857);
      } else if (graphic.geometry.geometryType === GeometryType.POLYGON) {
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
      // 返回是多条线段组成的集合取中间坐标点
      let index;
      let x;
      let y;
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
    afterDeleteGraphic() {
      if (this.projectInfo.markFlag === 'sprint') {
        this.chooseGraphic.forEach(graphic => {
          this.showTips(graphic, 'del');
        });
      }
      // 右键删除
      this.controlData.popupName = '';
      this.initSelectEvent(true);
    },
    // gis属性界面展示 property可从多处进入，对应多个资源类型，多个资源
    propertyShow(graphics) {
      this.$refs.property.init(graphics);
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
      // this.mapBox.centerAt(CloudGraphic.geometry);
      this.mapBox.centerGeometries([CloudGraphic.geometry]);
    },
    showInfos(graphics) {
      graphics.forEach((graphic, index) => {
        const textSymbol = new this.$map.TextSymbol(`${index + 1}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -3, -20);
        const symbol = Color.showIndex;
        let point;
        // this.$map.GeometryType.POINTgraphic.geometry.geometryType === GeometryType.POLYLINE
        if (graphic.geometry.geometryType === GeometryType.POLYLINE) {
          let paths;
          if (typeof graphic.geometry.getPaths === 'function') {
            [paths] = graphic.geometry.getPaths();
          } else {
            [paths] = graphic.geometry.paths;
          }
          const path = this.getLinecenter(paths);
          point = new this.$map.Point(path[0], path[1], graphic.geometry.spatialReference);
        } else if (graphic.geometry.geometryType === GeometryType.POLYGON) {
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
      // console.log(event);
      event.preventDefault();
      // 触发新建线和面资源时右键返回上一步操作
      if (this.$refs.toolbar.$refs.NewResource && this.$refs.toolbar.$refs.NewResource.drawUndo) {
        this.$refs.toolbar.$refs.NewResource.rightClickDraw();
      }
      if (this.$refs.tools.controlData.btnActiveName === 'polyline' || this.$refs.tools.controlData.btnActiveName === 'polygon') {
        this.$refs.tools.rightClickDraw();
      }
      // 右键撤回上一步操作
      const drawTool = this.mapBox.getDrawTool();
      drawTool._activeDrawTool && drawTool.removeLastPoint();
      if (this.preventAll || !this.prevent) {
        return;
      }
      let positioning = 'center-left';
      if (event.y < 200) {
        positioning = 'top-left';
      } else if (this.hldEl.offsetHeight - event.y < 200) {
        positioning = 'bottom-left';
      }
      this.overlay.positioning = positioning;
      this.overlay.position = this.mapBox.getEventScreenPoint(event);
      if (this.$refs.clickRight && this.$refs.footer) {
        this.$refs.clickRight.curPosition = this.$refs.footer.getcond();
      }
    },
    afterEditNode() {
      this.refreshTree();
    },
    afterSelection() {
      this.refreshTree();
    },
    afterBindAZ() {
      this.refreshTree();
    },
    refreshTree() {
      if (this.$refs.toolbar.soltName !== 'ResourceTree') return;
      this.$refs.toolbar.$refs.ResourceTree.queryChildren();
    },
    openSchemaTopo() {
      this.schemaTopoState = true;
      this.$refs.schemaTopo.schemaId = this.projectInfo.schemaId;
      this.$refs.schemaTopo.popupSchemaTopo.show = true;
    },
    refreshDesignSetting() {
      getSchemaSetting({ schemaId: this.projectInfo.schemaId }).then(result => {
        this.schemaConfigs = result;
      });
    },

    // 获取网格图层
    async getGridGraphics() {
      const featureLayers = [];
      if (this.projectInfo.markFlag !== 'sprint') {
        // 过滤：当前图层样式下的网格类型
        const gridResTypes = [];
        const gridLayers = [];
        const filter = Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId });
        getAllManagedRestypesWithGeometryType().forEach(item => {
          if (item.GEOMETRY_TYPE === GeometryType.POLYGON && item.RES_TYPE !== 'PLAN_GRID') {
            gridResTypes.push(item.RES_TYPE);
          }
        });
        this.resourceList.forEach(res => {
          if (res.layerType === 'C' && gridResTypes.indexOf(res.resType) > -1) {
            gridLayers.push(res.layerNo);
            featureLayers.push({
              layerNo: res.layerNo,
              filter,
            });
          }
        });
      }
      featureLayers.push({
        layerNo: 'PLAN_GRID-C',
        filter: Filter.equalTo({ propertyName: 'sprintId', expression: this.projectInfo.sprintId }),
      });
      const gridGraphics = await getByFeatureLayers(featureLayers);
      const otherGraphics = gridGraphics.filter(graphic => graphic.layerNo !== 'PLAN_GRID-C');
      if (otherGraphics.length === 0) {
        this.gridGraphics = gridGraphics || []; // 没有其他网格则plan网格居中
      } else {
        this.gridGraphics = otherGraphics; // 有其他网格则其他网格居中
      }
    },
    // 生成临时图层上的建筑物并直接选中
    surfaceTransfer(CloudGraphic) {
      let fillSymbol;
      if (CloudGraphic.geometry.geometryType === GeometryType.POINT) {
        let url = '';
        if (CloudGraphic.resType === 'A7') {
          url = 'oss_core/edesign/assets/image/map/surface-png/manhole_add.png';
        } else if (CloudGraphic.resType === 'B1') {
          url = 'oss_core/edesign/assets/image/map/surface-png/chamber_add.png';
        }
        fillSymbol = new this.$map.PictureMarkerSymbol(url, 16, 16, 0, 0, 0, false, null, 16);
      } else {
        fillSymbol = new this.$map.CompositeSymbol([
          {
            style: CloudGraphic.geometry.geometryType === GeometryType.POLYGON ? Color.fillPolygonColor : Color.mouseStyle,
            geometry: null,
          },
          {
            style: Color.defalutLine,
          },
        ]);
      }
      const attributes = Object.assign(CloudGraphic.attributes, { reResType: CloudGraphic.resType, reLayerNo: CloudGraphic.layerNo });
      const newGra = this.mapBox.addGeometry(CloudGraphic.id, CloudGraphic.geometry, fillSymbol, attributes, 'demandBuilding');
      this.$refs.tools.directClick('select');
      this.mapBox.setSelected([newGra]);
      this.mapBox.selectTransform(newGra.__);
      this.mapSelection([newGra]);
    },

    // mapKeyup(e) {
    //   if (e.keyCode === 27) {
    //   } else if (e.keyCode === 46) {
    //   }
    // },

    // 键盘事件监听
    escFn() {
      if (this.$refs.search) {
        this.$refs.search.hideSelect();
      }
      // this.$root.$emit('refresh');
      this.initSelectEvent(true);
      if (this.$refs.tools) {
        this.$refs.tools.directClick('select');
      }
    },
    delFn() {
      // delete 删除
      if (this.menuList && this.menuList.length > 0) {
        const del = this.menuList.find(res => res.code === 'delete');
        if (del) {
          this.graphic = this.chooseGraphic;
          if (this.graphic[0].layerNo === 'demandBuilding') {
            deleteTempGraphic(this);
          } else {
            deleteGraphic(this).then(() => {
              fish.toast('success', this.$t('DELETE_SUCCESS'));
              this.controlData.popupName = '';
              this.initSelectEvent(false);
              this.afterDeleteGraphic();
            });
          }
        }
      }
    },
    copy() {
      // copy 复制
      if (this.menuList && this.menuList.length > 0) {
        const copy = this.menuList.find(res => res.code === 'copySurface');
        if (copy) {
          this.graphic = this.chooseGraphic;
          copySurface(this);
        }
      }
    },
    resize() {
      if (this.oldT) {
        clearTimeout(this.oldT);
      }
      this.oldT = setTimeout(() => {
        this.updateSize();
      }, 500);
    },
    // attr改变事件
    attrChange(key, value) {
      this.$refs.toolbar.$refs.NewResource.attributes[key] = value;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './hldDesign.scss';
</style>
