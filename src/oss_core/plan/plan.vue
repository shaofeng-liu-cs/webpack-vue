<template>
  <div class="map-example box">
    <div ref="map" class="map-container" @contextmenu="rightClick"></div>
    <Search
      v-if="!modalConfig"
      ref="search"
      @inSearchResult="inSearchResult"
      @outSearchResult="outSearchResult"
      @showInfos="showInfos"
      @centerGeometries="centerGeometries"
    ></Search>
    <Tools
      ref="tools"
      :fullscreen.sync="fullscreen"
      :rightMenuShow="isShow"
      @identify="identify"
      @map-selection="mapSelection"
      @street-view="streetView"
      @createGridView="createGridView"
      v-if="initialized"
    ></Tools>
    <MenuRight ref="toolbar" @toolbarShowChange="toolbarShowChange" @showTips="showTips" @refreshLayers="refreshLayers" v-on="$listeners"></MenuRight>
    <ClickRight ref="clickRight" @showTips="showTips" @delete="afterDeleteGraphic" v-if="initialized"></ClickRight>
    <AddProject ref="addProjcet"></AddProject>
    <Footer :select.sync="select" ref="footer" v-if="initialized"></Footer>
    <!-- <div ref="addButton" class='grid-addbutton' title='New Task' id='addButton'>
            <span class='tipName' style='font-size:30px;padding-bottom:5px;padding-left:0.3px;'>+</span>
        </div> -->
  </div>
</template>

<script>
import Search from '@/oss_core/plan/map-control/searchbar/search.vue'; // 搜索组件
import Tools from '@/oss_core/plan/map-control/tools/tools.vue'; // 顶部功能组件
import AddProject from '@/oss_core/plan/map-control/addProject/addProject.vue'; // 组件
// import Tools from '@/oss_core/edesign/osp/map-control/tools/tools.vue'; // 顶部功能组件
import MenuRight from '@/oss_core/widgets/toolbar/toolbar.vue'; // 右侧菜单栏组件
import ClickRight from '@/oss_core/plan/map-control/clickRight/clickRight.vue'; // 鼠标右键菜单栏组件
import Footer from '@/oss_core/plan/map-control/footbar/footer.vue'; // 底部信息组件
import {
  Color as mapColor,
  Overlay,
  SimpleLineSymbol,
  TextSymbol,
  Font,
  getByFeatureLayers,
  Filter,
  GeometryType,
  Graphic,
  batchDeleteGeometry,
  Polyline,
  Polygon,
} from 'map';
import { getDefaultDesignSetConfig } from '@/oss_core/base/utils/DesignSettingConfig.js'; //公用配置
import * as Color from '@/oss_core/edesign/osp/design/drawStyle.js'; // 画图样式
import { queryAllrestypelist } from '@/oss_core/edesign/api/query/mapNo.js';
import { getSurfaceLayers } from '@/oss_core/edesign/api/query/schema.js';

// import BindAZ from '@/oss_core/edesign/osp/map-control/clickRight/bindAZ/bindAZ.vue';

// import property from '@/oss_core/edesign/osp/map-control/clickRight/property/property.vue';
// import LinkCalculation from '@/oss_core/edesign/osp/sidebar/opticalAttenuation/linkCalculation.vue';
// import addFormatPoint from '@/oss_core/edesign/osp/map-control/clickRight/addFormatPoint/addFormatPoint.vue';
// import PopuSchemaTopo from '@/oss_core/edesign/topo/instance/PopuSchemaTopo.vue';
// import {
//     getResTypeConfig,
//     getLayerConfig,
//     getSurfaceLayers,
//     getConfigExtend,
//     getLayerConfigBySprintId,
//     getSchemaSetting,
//     queryAttrActionList,
// } from '@/oss_core/edesign/api/query/schema.js';
// // import { getStyleConfig } from '@/oss_core/edesign/osp/task/api/taskAction';
// import ResourcesConfig from '@/oss_core/base/utils/ResourcesConfig.js';

// import { deleteGraphic, initRouteObj } from '@/oss_core/edesign/osp/domain/ResEventHandler';
// import { getAllSchema } from '@/oss_core/edesign/osp/map-control/map-control-api';
// import { getAppConfig } from '@/oss_core/edesign/api/common.js';

// const gisResFilterMenus = ['move', 'editPoint', 'breakLine', 'mergeLine'];
// const hasSelectionFilterMenus = ['breakLine', 'bindAZ', 'cancelBindAZ', 'loadFormatPoint', 'mergeLine'];
// import { FILL } from '@/oss_core/base/symbol/DefaultSymbol';

export default {
  name: 'Plan',
  components: {
    Search,
    Tools,
    AddProject,
    MenuRight,
    ClickRight,
    Footer,
  },
  provide() {
    return {
      getProjectInfo: () => this.projectInfo, // 任务单工程数据
      getControlData: () => this.controlData, // 全局控制数据
      getResourceList: () => this.resourceList, // 资源列表
      getLocation: () => this.location, // 点击地图获取对应经纬度
      getHldEl: () => this.hldEl, //HLD节点
      getSurfaceLayerList: () => this.surfaceLayerList, //地貌图层
      getLayerCheckData: () => this.layerCheckData, // 图层选择数据
      getResTypeAttrDtos: () => this.resTypeAttrDtos, // gis的attr的属性对应资源form表内数据
      getMapBox: () => this.mapBox, // gis实列
      getSchemaConfigs: () => this.schemaConfigs, // 设计设置参数
      getHldTempleteTree: () => [], //获取能力模板树
    };
  },
  inject: ['defaultStyle', 'modalConfig'],
  data() {
    return {
      controlData: {
        popupName: '', //控制全局弹窗显示隐藏
        btnActiveName: 'select', // 地图联动当前功能按钮,
        initSelectedStatus: { componentName: 'init', rightCloseFlag: true }, // 初始化选择事件
      },
      hldEl: null,
      resTypeAttrDtos: [], // gis的attr的属性对应资源form表内数据
      resourceList: [], //资源类型
      surfaceLayerList: [], //地貌图层
      layerCheckData: [], //图层选择数据
      isShow: false, //toolbar组件内容显示隐藏改变
      mapBox: undefined, //地图实列
      projectInfo: {},
      styleConfigObj: this.defaultStyle, //样式配置
      gridGraphics: [], //获取网格图层的所有图元
      tipOverlayMap: new Map(), //map类型存储tipOverlay
      initialized: false,
      schemaConfigs: getDefaultDesignSetConfig(), //后台配置数据
      chooseGraphic: [], //当前选中的图元
      location: '', //存储街景点击地图的位置信息
      select: '0', // footer，底部信息展示
      fullscreen: false, //是否全屏模式
    };
  },
  created() {},
  mounted() {
    this.modalConfig && this.modalConfig.initFunc && this.modalConfig.initFunc(this);
    this.hldEl = this.$el;
    this.initData();
    window.onresize = () => {
      this.updateSize();
    };
  },
  methods: {
    async initData() {
      // this.schemaConfigs = getDefaultDesignSetConfig();
      let key = fish.language === 'en' ? 'resGroup' : 'localName';
      let allrestypelist = queryAllrestypelist('plan-map'); // 查询资源列表
      let surfaceLayers = getSurfaceLayers();
      allrestypelist = await allrestypelist;
      surfaceLayers = await surfaceLayers;
      this.resourceList = allrestypelist.resultList || [];
      this.resourceList.forEach(res => {
        res.resGroupI18n = res[key];
        res.resName = res.resName || res.resTypeName;
      });
      this.surfaceLayerList = surfaceLayers.resultList || [];
      this.surfaceLayerList = this.surfaceLayerList.filter(surface => surface.mapNo === 'plan-map');
      this.surfaceLayerList.forEach(sur => {
        sur.relaResType = sur.resType;
        sur.resType = sur.surfaceCat;
        sur.resTypeName = sur.surfaceDesc;
        sur.resGroup = sur.catDesc;
        sur.flag = 'surface';
        sur.resGroupI18n = sur[key];
      });
      this.getAppMaps();
    },
    // 初始化地图
    getAppMaps() {
      //获取地图
      this.mapBox = new this.$map.MapContainer('plan', this.$refs.map);
      this.mapBox.init({ mapNo: 'plan-map' }).then(() => {
        this.mapBox._map.__.once('rendercomplete', () => {
          console.log('地图加载完成...');
          document.querySelector('.project-edit-loading') && document.querySelector('.project-edit-loading').remove();
        });
        this.initialized = true;
        this.setLayerStyle();
        this.getGridGraphics();
        this.mapBox.disableDoubleClickZoom();

        this.$nextTick(() => {
          this.mapBox.select();
        });
      });
    },
    centerAt(objs) {
      console.log('定位...', objs);
      let point = this.mapBox.createPointFromCurrentCoord([objs.x, objs.y], this.$map.SupportSpatialReferences.WGS84);
      this.mapBox.centerAt(point);
    },
    setLayerStyle() {
      let layers = this.mapBox.getLayers() || [];
      layers.forEach(layer => {
        let layerInfo = this.resourceList.find(res => res.layerNo === layer.id);
        if (layerInfo && layerInfo.layerType === 'C') {
          let configData = this.styleConfigObj[layerInfo.resType];
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
        this.mapBox.setVisible(layer.id, true);
        this.mapBox.setSelectable(layer.id, true);
        this.mapBox.setIsSnap(layer.id, true);
        layer.showLabel = true;
        this.mapBox.refresh();
      });
    },
    setStyle(layer, configData) {
      let font = new Font(Number(configData.fontSize), configData.fontStyle, Number(configData.fontWeight), configData.fontFamiliy);
      let textSymbol = new TextSymbol(
        '', // text
        font,
        this.createCloudColor(configData.fontColor),
        'center',
        'bottom',
        configData.fontXOff,
        configData.fontYOff,
        new mapColor(255, 255, 255, 0),
      );
      layer.symbol = this.setStylebyConfig(configData.geometryType, configData, textSymbol);
      if (configData.gisLayerThemeList && configData.gisLayerThemeList.length > 0) {
        let styleRuleList = [];
        configData.gisLayerThemeList.forEach(gisLayerTheme => {
          gisLayerTheme.gisLayerThemeItemList.forEach(element => {
            let themeItemDef = JSON.parse(element.themeItemDef);
            let featureFilter = this.$map.FeatureFilterHandlerEngine.encode(themeItemDef);
            let style = this.setStylebyConfig(configData.geometryType, element, textSymbol);
            let styleRule = new this.$map.StyleRule(featureFilter, style);
            styleRule.themeItemId = element.themeItemId;
            styleRuleList.push(styleRule);
          });
        });
        layer.themeItemList = styleRuleList;
      }
    },
    setStylebyConfig(geometryType, config, textSymbol) {
      let style;
      if (geometryType === GeometryType.POINT) {
        let xOff = config.xOff ? Number(config.xOff) : 0;
        let yOff = config.yOff ? Number(config.yOff) : 0;
        style = new this.$map.PictureMarkerSymbol(config.iconUrl, config.imgSize, config.imgSize, 0, xOff, yOff, true, textSymbol, config.size);
      } else if (geometryType === GeometryType.POLYGON) {
        // 网格不参与数据库配置，
        let polygonLine = new SimpleLineSymbol(config.lineStyle, this.createCloudColor(config.lineColor), Number(config.lineWidth));
        style = new this.$map.SimpleFillSymbol(polygonLine, this.createCloudColor(config.fillColor), true, textSymbol);
      } else if (geometryType === GeometryType.POLYLINE) {
        style = new this.$map.SimpleLineSymbol(config.lineStyle, this.createCloudColor(config.lineColor), Number(config.lineWidth), true, textSymbol);
      }
      return style;
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
    rightClick(event) {
      // 右键绘制撤销动作
      if (this.$refs.toolbar.$refs.NewResource && this.$refs.toolbar.$refs.NewResource.drawUndo) {
        this.$refs.toolbar.$refs.NewResource.rightClickDraw();
      }
      if (this.$refs.tools.controlData.btnActiveName === 'polyline' || this.$refs.tools.controlData.btnActiveName === 'polygon') {
        this.$refs.tools.rightClickDraw();
      }
      let drawTool = this.mapBox.getDrawTool();
      drawTool._activeDrawTool && drawTool.removeLastPoint();
      this.$refs.clickRight.rightClick(event);
    },
    mapSelection(geos) {
      if (geos.length === 0) {
        this.$refs.tools.directClick('select');
        this.modalConfig && this.modalConfig.selectGrid && this.modalConfig.selectGrid(null);
        return;
      }
      this.chooseGraphic = geos;
      // let graphic = geos.filter(item => item.resType !== undefined);
      if (this.modalConfig) {
        //是modal框，只需要单选
        if (geos.length > 0) {
          if (!geos[0].attributes.sprintId) {
            let selectGeo = geos[0];
            selectGeo = selectGeo.toJSON();
            const totalLength = this.getTotalLengthKm(selectGeo.geometry.getRings());
            this.modalConfig.selectGrid &&
              this.modalConfig.selectGrid(selectGeo, {
                extCoverageArea: totalLength,
              });
          } else {
            this.modalConfig.selectGrid && this.modalConfig.selectGrid(null);
            this.$refs.tools.directClick('select');
          }
        } else {
          this.modalConfig.selectGrid && this.modalConfig.selectGrid(null);
        }
      }
      this.select = geos.length === 1 ? geos[0].attributes.resName : '' + geos.length; //选一个显示名称，多个显示数量
      // this.$refs.search.$refs.result.setResult(graphic);
    },
    refreshLayers(val, refreshLayers) {
      //刷新wfs图层,初始化时图层控制还没加载所以需要在HLD处理
      let layers = this.mapBox.getLayers();
      val.forEach(item => {
        if (refreshLayers && refreshLayers.indexOf(item.layerNo) < 0) {
          return;
        }
        let layer = layers.find(layerItem => layerItem.id === item.layerNo);
        if (!layer) {
          console.log(
            `Error: edn_gis_layer_config(任务单或者sprint单下的图层)或者ednc_restype_layer_rela(mapNo下的图层)配置了图层，但是gis库没有配置该图层, layerNo名为:${item.layerNo}`,
          );
          return;
        }
        if (item.themeItemId) {
          let themeStyle = layer.themeItemList.find(themeItem => themeItem.themeItemId === item.themeItemId);
          if (themeStyle) {
            themeStyle.isVisible = item.isVisible === 'Y';
          }
        } else {
          this.mapBox.setVisible(item.layerNo, item.isVisible === 'Y');
          this.mapBox.setSelectable(item.layerNo, item.isSelectable === 'Y');
          this.mapBox.setIsSnap(item.layerNo, item.isSnap === 'Y');
          layer.showLabel = item.isLabelVisible === 'Y';
          if (item.layerNo === 'PLAN_GRID') {
            this.tipOverlayMap.forEach(value => {
              if (item.isVisible === 'Y') {
                value.show();
              } else {
                value.hide();
              }
            });
          }
        }
      });
      if (refreshLayers) {
        this.mapBox.refreshLayers(refreshLayers);
      } else {
        this.mapBox.refresh();
      }
    },
    identify(graphics) {
      this.showInfos(graphics);
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
      let graphic = graphics.filter(item => item.resType !== undefined);
      this.$refs.search.$refs.result.setResult(graphic);
    },
    createGridView() {
      console.log('开始规划网格....');
      console.log('this.$refs.toolbar:', this.$refs.toolbar);
      window.toolbarDemo = this.$refs.toolbar;
      //工具栏调用右边菜单
      this.$refs.toolbar.menuTap({ name: this.$t('MAP_TOOLBAR_CONFIG_DESIGN_PLANNING_AREA'), code: 'NewResourcePlan' }, true);
    },
    streetView(location) {
      //新增街景点击事件
      this.$refs.toolbar.menuTap({ name: this.$t('OSP_MAP_SEARCHBAR_TOOLS_STREET_VIEW'), code: 'StreetViewPlan' }, true);
      this.location = location;
      let arr = location.split(',');
      let symbol = Color.streetPicture;
      let coordinate = [Number(arr[1]), Number(arr[0])];
      let point = this.mapBox.createPointFromCurrentCoord(coordinate, this.$map.SupportSpatialReferences.WGS84);
      this.mapBox.getTempleLayer().clear();
      this.mapBox.addGeometry('streetView', point, symbol);
    },
    // 搜索结果鼠标移入事件
    inSearchResult(item, index) {
      let graphic = item.CloudGraphic;
      let symbol = Color.blueIndex;
      let textSymbol = Color.blueText;
      textSymbol.text = `${index + 1}`;
      let point;
      if (graphic.geometry.geometryType === GeometryType.POLYLINE) {
        let [paths] = graphic.geometry.getPaths();
        let path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], 3857);
      } else if (graphic.geometry.geometryType === GeometryType.POLYGON) {
        point = graphic.geometry.getCentroid();
      } else {
        point = graphic.geometry;
      }
      this.mapBox.addGeometry('pic', point, symbol);
      this.mapBox.addGeometry('text', point, textSymbol);
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
    // 搜索结果鼠标移出事件
    outSearchResult() {
      this.mapBox.deleteById('pic');
      this.mapBox.deleteById('text');
    },
    showInfos(graphics) {
      graphics.forEach((graphic, index) => {
        let textSymbol = new this.$map.TextSymbol(`${index + 1}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -3, -20);
        let symbol = Color.showIndex;
        let point;
        // this.$map.GeometryType.POINTgraphic.geometry.geometryType === GeometryType.POLYLINE
        if (graphic.geometry.geometryType === GeometryType.POLYLINE) {
          let paths;
          if (typeof graphic.geometry.getPaths === 'function') {
            [paths] = graphic.geometry.getPaths();
          } else {
            [paths] = graphic.geometry.paths;
          }
          let path = this.getLinecenter(paths);
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
      // this.centerGeometries(graphics);
    },
    centerGeometries(CloudGraphicList) {
      // 搜索结果定位
      let geometryList = [];
      CloudGraphicList.forEach(graphic => {
        geometryList.push(graphic.geometry);
      });
      this.mapBox.centerGeometries(geometryList);
    },

    addProjcet() {
      this.$refs.addProjcet.init();
    },
    // getTaskGridGraphics(gisKey, call) {
    //   let filter = Filter.greaterThan({ propertyName: 'objectid', expression: 0 });
    //   let featureLayers2 = [
    //     {
    //       layerNo: 'TASK_GRID',
    //       filter: filter,
    //     },
    //   ];
    //   getByFeatureLayers(featureLayers2).then(res => {
    //     const gridGraphics = res || [];
    //     let taskGrid = gridGraphics.find(it => it.attributes.planGisKey === gisKey);
    //     call(taskGrid);
    //   });
    // },
    // async clearTaskNoId() {
    //   //删除无用的task网格数据
    //   let filter = Filter.greaterThan({ propertyName: 'objectid', expression: 0 });
    //   let featureLayers2 = [
    //     {
    //       layerNo: 'TASK_GRID',
    //       filter: filter,
    //     },
    //   ];
    //   const gridGraphicsTask = (await getByFeatureLayers(featureLayers2)) || [];
    //   const newlist = gridGraphicsTask.filter(it => !it.attributes.sprintId);
    //   newlist.length > 0 && batchDeleteGeometry(newlist);
    // },
    //获取网格图层
    async getGridGraphics() {
      let filter;
      if (this.modalConfig && this.modalConfig.sprintId) {
        filter = Filter.and(
          Filter.equalTo({ propertyName: 'sprintId', expression: this.modalConfig.sprintId, matchCase: true }),
          Filter.greaterThan({ propertyName: 'objectid', expression: 0 }),
        );
      } else {
        filter = Filter.greaterThan({ propertyName: 'objectid', expression: 0 });
      }
      let featureLayers = [
        {
          layerNo: 'PLAN_GRID',
          filter: filter,
        },
      ];
      // this.clearTaskNoId();
      this.gridGraphics = (await getByFeatureLayers(featureLayers)) || [];

      if (this.modalConfig && this.modalConfig.sprintId && this.gridGraphics.length) {
        this.setCenterGrid(this.gridGraphics[0]);
      }
      this.showAddButton();
    },
    setCenterGrid(selectGrap) {
      this.mapBox.map.setExtent(selectGrap.geometry.getExtent(), true);
    },
    afterDeleteGraphic() {
      console.log('删除.....：');
      this.chooseGraphic.forEach(graphic => {
        this.showTips(graphic, 'del');
      });
    },
    showAddButton() {
      this.gridGraphics.forEach(graphic => {
        !graphic.attributes.sprintId && this.showTips(graphic); //展示
      });
    },
    getTotalLengthKm(rings) {
      // const length = new Polyline(rings, this.mapBox.spatialReference).getTheLength();
      let length = new Polygon(rings, this.mapBox.spatialReference).getTheArea();
      length = Number(length / 1000000).toFixed(3);
      console.log('总长度：', length);
      return length;
    },
    // bindAndRemoveOverLay(graphic, call) {
    //   //暂时不要了，先放着
    //   const grapGeo = graphic.geometry;
    //   graphic.geometry = graphic.geometry.toJSON();
    //   let taskGraphic = JSON.parse(JSON.stringify(graphic));
    //   taskGraphic.id = 'TASK_' + taskGraphic.id;
    //   taskGraphic.layerNo = 'TASK_GRID';
    //   taskGraphic.attributes.layerNo = 'TASK_GRID';
    //   delete taskGraphic.attributes.gisKey;
    //   this.$map
    //     .addGeometry('TASK_GRID', taskGraphic)
    //     .then(taskRes => {
    //       call(taskRes.attributes.gisKey, data => {
    //         //先调用此方法创建网格，然后调回调方法回传gisKey，在那边创建好工程后再执行更新gis数据的操作
    //         taskGraphic = taskRes.toJSON();
    //         taskGraphic.attributes = Object.assign(taskGraphic.attributes, data);
    //         taskGraphic.attributes.resName = 'Task Grid' + '-' + taskGraphic.attributes.objectid;
    //         taskGraphic.attributes.resNo = '';
    //         this.$map.editAttributeById('TASK_GRID', taskGraphic).then(res => {
    //           graphic.attributes = Object.assign(graphic.attributes, data);
    //           let layerNo = graphic.layerNo;
    //           this.$map.updateGeometryById(layerNo, graphic).then(() => {
    //             // fish.toast('success', this.$t('SAVE_SUCCESS'));
    //             this.$refs.tools && this.$refs.tools.changeDisabled && this.$refs.tools.changeDisabled();
    //             this.mapBox.map.setExtent(grapGeo.getExtent(), true);
    //           });
    //         });

    //         let overlay = this.tipOverlayMap.get(graphic.attributes.gisKey);
    //         this.mapBox.removeOverLay(overlay);
    //         this.mapBox.refresh();
    //       });
    //     })
    //     .catch(res => {
    //       fish.toast('error', this.$t('PROJECT_SELECT_PROJECT_MSG2'));
    //     });
    // },
    updateGridGeometry(graphic) {
      let layerNo = graphic.layerNo;
      this.$map.updateGeometryById(layerNo, graphic).then(() => {
        // fish.toast('success', this.$t('SAVE_SUCCESS'));
        this.$refs.tools && this.$refs.tools.changeDisabled && this.$refs.tools.changeDisabled();
        const grapGeo = graphic.geometry;
        this.mapBox.map.setExtent(grapGeo.getExtent(), true);
        let overlay = this.tipOverlayMap.get(graphic.attributes.gisKey);
        this.mapBox.removeOverLay(overlay);
        this.mapBox.refresh();
      });
    },
    setSelectPlan(graphic) {
      let layerInfo = this.mapBox.getLayers().find(layer => layer.id === graphic.layerNo);
      let setSelGis = [];
      this.mapBox.clear();
      if (layerInfo.source && layerInfo.visible) {
        let features = layerInfo.source.getFeatures();
        let feature = features.find(feature => feature.values_.gisKey === graphic.attributes.gisKey);
        let geo = Graphic.from(feature, this.mapBox.spatialReference);
        setSelGis.push(geo);
      }
      setSelGis.length > 0 && this.mapBox.setSelected(setSelGis);
      this.chooseGraphic = setSelGis;
      const totalLength = this.getTotalLengthKm(graphic.geometry.getRings());
      this.setCenterGrid(graphic);
      this.modalConfig.selectGrid &&
        this.modalConfig.selectGrid(graphic, {
          extCoverageArea: totalLength,
        });
    },
    showTips(graphic, type) {
      let tipOverlay = this.tipOverlayMap.get(graphic.attributes.gisKey);
      if (type === 'del') {
        console.log('删除网格...', graphic, type);
        this.modalConfig.selectGrid &&
          this.modalConfig.selectGrid(null, {
            extCoverageArea: '',
          });
        tipOverlay && this.mapBox.removeOverLay(tipOverlay);
      } else {
        if (tipOverlay) {
          this.mapBox.addOverLay(tipOverlay);
        } else {
          let centerGeo = graphic.geometry.getCentroid();
          let mouseOver = $(`<div class='grid-addbutton' title='${this.$t('E_PROJECTDETAIL_NEW_PROJECT')}'><span>+</span></div>`);
          if (this.modalConfig) {
            //modal框下是选择
            mouseOver = $(`<div class='grid-addbutton'><i class='icon_osp icon_ospxuanze1'></i></div>`);
          }
          let overlay = new Overlay({
            id: graphic.attributes.gisKey,
            position: {
              x: centerGeo.x,
              y: centerGeo.y,
            },
            element: mouseOver[0],
            positioning: 'center-center',
            // offset: [-15, -15],
          });
          this.mapBox.addOverLay(overlay);
          this.tipOverlayMap.set(graphic.attributes.gisKey, overlay);
          console.log(this.tipOverlayMap);
          mouseOver.click(() => {
            if (!this.modalConfig) {
              this.$refs.addProjcet.init(graphic, overlay);
            } else {
              this.setSelectPlan(graphic);
            }
          });
          if (type === 'add' && this.modalConfig) {
            this.mapBox._map.__.once('rendercomplete', () => {
              console.log('渲染完成...');
              this.setSelectPlan(graphic);
            });
            // setTimeout(() => {
            // }, 200);
          }
          // mouseOver.mousewheel(e => {
          //   console.log(e);
          //   if (e.deltaY > 0) {
          //     this.mapBox.zoomIn();
          //   } else {
          //     this.mapBox.zoomOut();
          //   }
          // });
        }
      }
    },

    toolbarShowChange(val) {
      this.isShow = val; //toolbar组件内容显示隐藏改变
    },

    updateSize() {
      if (this.mapBox) {
        this.mapBox._map.__.updateSize();
      }
    },
  },
  destroyed() {
    window.onresize = null; //销毁
  },
};
</script>

<style lang="scss" scoped>
@import '@/oss_core/base/css/main.scss';
@import './plan.scss';
</style>
