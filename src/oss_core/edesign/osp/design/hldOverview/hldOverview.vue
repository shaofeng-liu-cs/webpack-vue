<template>
  <div class="map-example">
    <div ref="map" class="map-container"></div>
  </div>
</template>

<script>
import { Color as mapColor, SimpleLineSymbol, TextSymbol, Font, SupportSpatialReferences, getByFeatureLayers, Filter, GeometryType } from 'map'; // gis平台API
import { getAllManagedRestypesWithGeometryType } from '@/oss_core/base/utils/ResourcesConfig.js'; // 公用配置
import { getSurfaceLayers } from '@/oss_core/edesign/api/query/schema.js'; // 后台接口
import { queryAllrestypelist } from '@/oss_core/edesign/api/query/mapNo.js'; // 后台接口
import { getStyleConfig } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口

export default {
  name: 'OverView',
  inject: ['defaultStyle'],
  props: {
    mapType: {
      type: String,
      default: 'construction',
    },
    // eslint-disable-next-line vue/require-default-prop
    queryData: {
      type: Object,
    },
  },
  data() {
    return {
      styleConfigObj: null, // 样式配置
      surfaceLayerList: [], // 地貌图层列表
      mapBox: undefined, // 地图实列
      resLabelField: 'resName',
      resTypeConfig: [], // 任务单资源类型列表
      gridGraphics: [], // 获取网格图层的所有图元
      baseMapServices: [], // 地图服务列表
      gridResTypes: [], // 网格类型
      mapNo: 'view-map',
      conStatusList: ['OLT-ALL', 'OCC-ALL', 'ODF-ALL', 'ODB-ALL', 'F_CLOSURE-ALL', 'F_CABLE-ALL', 'SPLITTER-ALL'], // 有工程状态的图层
      // mapType: 'construction', //地图类型 investigation：工勘  construction：施工 supportSection：支撑段路由 cable：光缆路由
    };
  },
  watch: {
    // eslint-disable-next-line func-names
    'queryData.schemaId': function () {
      this.getGridGraphics().then(() => {
        this.setLayerStyle();
        this.mapBox.centerAt(this.getExtendByGrid(this.gridGraphics));
        this.mapBox.refresh();
      });
    },
  },
  created() {
    // getAppMaps方法依赖这些接口数据，需要全部获取完之后再进行地图初始化，Promise.all可以节省交互时间
    this.initData();
  },
  mounted() {
    window.onresize = () => {
      this.updateSize();
    };
  },
  destroyed() {
    window.onresize = null; // 销毁
  },
  methods: {
    initData() {
      const promiseList = [];
      promiseList.push(queryAllrestypelist(this.mapNo));
      promiseList.push(getSurfaceLayers());
      Promise.all(promiseList).then(promiseResult => {
        if (promiseResult[0] && promiseResult[0].resultList) {
          this.resTypeConfig = promiseResult[0].resultList || []; // 任务单所有资源类型列表 包括：A在网 C当前设计 R非当前设计
        }
        if (promiseResult[1] && promiseResult[1].resultList) {
          this.surfaceLayerList = promiseResult[1].resultList; // A0 道路;  A1 建筑; A5 接入点;
          this.surfaceLayerList = this.surfaceLayerList.filter(surface => surface.mapNo === this.mapNo);
          this.surfaceLayerList.forEach(sur => {
            sur.relaResType = sur.resType;
            sur.resType = sur.surfaceCat;
            sur.resTypeName = sur.surfaceDesc;
            sur.resGroup = sur.catDesc;
          });
        }
        this.styleConfigObj = this.defaultStyle;
        this.setDataByType();
      });
    },
    setDataByType() {
      // eslint-disable-next-line default-case
      switch (this.mapType) {
        case 'investigation':
          this.resTypeConfig = this.resTypeConfig.filter(res => res.resType === 'PLAN_GRID');
          this.surfaceLayerList = this.surfaceLayerList.filter(sur => ['A1', 'A0', 'B0', 'B1', 'A7', 'A8'].indexOf(sur.surfaceCat) > -1);
          break;

        case 'construction':
          this.surfaceLayerList = [];
          break;

        case 'supportSection':
          this.resTypeConfig = this.resTypeConfig.filter(res => res.groupKey === 'PIPELINE' || res.resType === 'PLAN_GRID');
          this.surfaceLayerList = [];
          break;

        case 'cable':
          this.resTypeConfig = this.resTypeConfig.filter(
            res => ['SITE', 'PLAN_GRID'].indexOf(res.resType) > -1 || (res.groupKey === 'FIBER' && ['OLT', 'ODF'].indexOf(res.resType) < 0),
          );
          this.surfaceLayerList = [];
          break;

        case 'acceptance':
          this.surfaceLayerList = [];
          break;
      }
      this.setStyleConfig();
    },
    async setStyleConfig() {
      this.styleConfigObj = this.defaultStyle;
      if (['cable', 'supportSection'].indexOf(this.mapType) > -1) {
        const getStyleList = (await getStyleConfig({ sprintId: this.queryData.sprintId })) || [];
        this.resTypeConfig.forEach(res => {
          const queryStyle = getStyleList.find(style => style.layerNo === res.layerNo);
          if (queryStyle) {
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
        });
      } else if (this.mapType === 'construction') {
        this.resTypeConfig.forEach(res => {
          if (this.conStatusList.indexOf(res.layerNo) > -1) {
            if (this.styleConfigObj[res.resType].geometryType === GeometryType.POINT) {
              const nameList = this.styleConfigObj[res.resType].iconUrl.split('.')[0].split('_');
              const redNum = Number(nameList[nameList.length - 1]);
              const blueNum = redNum - 7;
              const greenNum = blueNum - 1;
              this.styleConfigObj[res.resType].gisLayerThemeList = [
                {
                  gisLayerThemeItemList: [
                    {
                      iconUrl: this.styleConfigObj[res.resType].iconUrl,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"C","opt_matchCase":false}',
                      themeItemName: 'C',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${blueNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CI","opt_matchCase":false}',
                      themeItemName: 'CI',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${greenNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CF","opt_matchCase":false}',
                      themeItemName: 'CF',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${greenNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AI","opt_matchCase":false}',
                      themeItemName: 'AI',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${greenNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AF","opt_matchCase":false}',
                      themeItemName: 'AF',
                    },
                  ],
                  themeName: 'Cons Status',
                },
              ]; // 写死在前台
            } else if (this.styleConfigObj[res.resType].geometryType === GeometryType.POLYLINE) {
              this.styleConfigObj[res.resType].gisLayerThemeList = [
                {
                  gisLayerThemeItemList: [
                    {
                      lineColor: '#df1d1d',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"C","opt_matchCase":false}',
                      themeItemName: 'C',
                    },
                    {
                      lineColor: '#2e6ceb',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CI","opt_matchCase":false}',
                      themeItemName: 'CI',
                    },
                    {
                      lineColor: '#5eac25',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CF","opt_matchCase":false}',
                      themeItemName: 'CF',
                    },
                    {
                      lineColor: '#5eac25',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AI","opt_matchCase":false}',
                      themeItemName: 'AI',
                    },
                    {
                      lineColor: '#5eac25',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AF","opt_matchCase":false}',
                      themeItemName: 'AF',
                    },
                  ],
                  themeName: 'Cons Status',
                },
              ]; // 写死在前台
            }
          }
        });
      } else if (this.mapType === 'acceptance') {
        this.resTypeConfig.forEach(res => {
          if (this.conStatusList.indexOf(res.layerNo) > -1) {
            if (this.styleConfigObj[res.resType].geometryType === GeometryType.POINT) {
              const nameList = this.styleConfigObj[res.resType].iconUrl.split('.')[0].split('_');
              const redNum = Number(nameList[nameList.length - 1]);
              const blueNum = redNum - 7;
              const greenNum = blueNum - 1;
              this.styleConfigObj[res.resType].gisLayerThemeList = [
                {
                  gisLayerThemeItemList: [
                    {
                      iconUrl: this.styleConfigObj[res.resType].iconUrl,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"C","opt_matchCase":false}',
                      themeItemName: 'C',
                    },
                    {
                      iconUrl: this.styleConfigObj[res.resType].iconUrl,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CI","opt_matchCase":false}',
                      themeItemName: 'CI',
                    },
                    {
                      iconUrl: this.styleConfigObj[res.resType].iconUrl,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CF","opt_matchCase":false}',
                      themeItemName: 'CF',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${blueNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AI","opt_matchCase":false}',
                      themeItemName: 'AI',
                    },
                    {
                      iconUrl: `oss_core/edesign/assets/image/map/res-png/hld_icon_${greenNum}.png`,
                      size: 36.0,
                      imgSize: 44.0,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AF","opt_matchCase":false}',
                      themeItemName: 'AF',
                    },
                  ],
                  themeName: 'Cons Status',
                },
              ]; // 写死在前台
            } else if (this.styleConfigObj[res.resType].geometryType === GeometryType.POLYLINE) {
              this.styleConfigObj[res.resType].gisLayerThemeList = [
                {
                  gisLayerThemeItemList: [
                    {
                      lineColor: '#df1d1d',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"C","opt_matchCase":false}',
                      themeItemName: 'C',
                    },
                    {
                      lineColor: '#df1d1d',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CI","opt_matchCase":false}',
                      themeItemName: 'CI',
                    },
                    {
                      lineColor: '#df1d1d',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"CF","opt_matchCase":false}',
                      themeItemName: 'CF',
                    },
                    {
                      lineColor: '#2e6ceb',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AI","opt_matchCase":false}',
                      themeItemName: 'AI',
                    },
                    {
                      lineColor: '#5eac25',
                      lineStyle: 'solid',
                      lineWidth: 3,
                      themeItemDef: '{"type":"equalTo","propertyName":"consStatus","expression":"AF","opt_matchCase":false}',
                      themeItemName: 'AF',
                    },
                  ],
                  themeName: 'Cons Status',
                },
              ]; // 写死在前台
            }
          }
        });
      }
      this.getAppMaps();
    },
    async getAppMaps() {
      // 获取地图
      this.mapBox = new this.$map.MapContainer(this.mapNo, this.$refs.map);
      const onePromies = this.getGridGraphics();
      await onePromies;
      const mapExtends = this.getExtendByGrid(this.gridGraphics);
      await this.mapBox.init({ initExtent: mapExtends.getExtent() });
      this.surfaceLayerList.forEach(sur => {
        const findRes = this.mapBox.findLayer(sur.layerNo);
        if (findRes) {
          sur.layerName = findRes.layerName;
          sur.geometryType = findRes.geometryType;
        }
      });
      this.setLayerStyle();
      this.mapBox.disableDoubleClickZoom();
      this.mapBox.refresh();
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
          this.mapBox.setVisible(layer.id, true);
          this.mapBox.setSelectable(layer.id, true);
          this.mapBox.setIsSnap(layer.id, true);
          layer.showLabel = false;
        } else {
          this.mapBox.setVisible(layer.id, false);
          this.mapBox.setIsSnap(layer.id, false);
        }
      });
    },
    filter(layer, resType) {
      if (resType === 'PLAN_GRID') {
        layer.filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId, matchCase: true });
      } else if (this.queryData.schemaId) {
        layer.filter = this.$map.Filter.equalTo({ propertyName: 'schemaId', expression: this.queryData.schemaId, matchCase: true });
      } else if (['ODB_GRID', 'OCC_GRID', 'OLT_GRID'].indexOf(resType) > -1) {
        layer.filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId, matchCase: true });
      } else {
        // layer.filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId, matchCase: true });
        layer.filter = Filter.and(
          this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId, matchCase: true }),
          this.$map.Filter.not(this.$map.Filter.isNull({ propertyName: 'resId' })),
        );
      }
    },
    setStyle(layer, configData) {
      const font = new Font(Number(configData.fontSize), configData.fontStyle, Number(configData.fontWeight), configData.fontFamiliy);
      const textSymbol = new TextSymbol(
        '', // text
        font,
        this.createCloudColor(configData.fontColor),
        'center',
        'bottom',
        configData.fontXOff,
        configData.fontYOff,
        // eslint-disable-next-line new-cap
        new mapColor(255, 255, 255, 0),
      );
      layer.symbol = this.setStylebyConfig(configData.geometryType, configData, textSymbol);
      if (configData.gisLayerThemeList && configData.gisLayerThemeList.length > 0) {
        const styleRuleList = [];
        configData.gisLayerThemeList.forEach(gisLayerTheme => {
          gisLayerTheme.gisLayerThemeItemList.forEach(element => {
            const themeItemDef = JSON.parse(element.themeItemDef);
            const featureFilter = this.$map.FeatureFilterHandlerEngine.encode(themeItemDef);
            const style = this.setStylebyConfig(configData.geometryType, element, textSymbol);
            const styleRule = new this.$map.StyleRule(featureFilter, style);
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
      if (configColor && configColor.toString().length > 7) {
        color = configColor.toString().substr(0, 7);
        alpha = (parseInt(configColor.toString().substr(7, 2), 16) / 255).toFixed(2);
      } else {
        color = configColor.toString();
        alpha = 1;
      }
      const cloudColor = mapColor.fromHex(color, alpha);
      return cloudColor;
    },
    getExtendByGrid(gridGraphics) {
      let mapExtends;
      const geos = gridGraphics.map(graphic => graphic.geometry);
      if (geos.length === 1) {
        mapExtends = geos[0];
        // mapExtends = geos[0].getExtent();
      } else if (geos.length > 1) {
        let polygonGeoPaths = [];
        geos.forEach(geo => {
          const rings = geo.getRings();
          polygonGeoPaths = polygonGeoPaths.concat(rings);
        });
        // console.log(polygonGeoPaths);
        const polygonGeo = new this.$map.Polygon(polygonGeoPaths, SupportSpatialReferences.WEB_MERCATOR);
        // mapExtends = polygonGeo.getExtent();
        mapExtends = polygonGeo;
      }
      return mapExtends;
    },
    // 获取网格图层
    async getGridGraphics() {
      const featureLayers = [];
      // 过滤：当前图层样式下的网格类型
      const gridResTypes = [];
      const gridLayers = [];
      let filter;
      if (this.queryData.schemaId) {
        filter = this.$map.Filter.equalTo({ propertyName: 'schemaId', expression: this.queryData.schemaId, matchCase: true });
      } else {
        filter = this.$map.Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId, matchCase: true });
      }
      getAllManagedRestypesWithGeometryType().forEach(item => {
        if (item.GEOMETRY_TYPE === GeometryType.POLYGON && item.RES_TYPE !== 'PLAN_GRID') {
          gridResTypes.push(item.RES_TYPE);
        }
      });
      this.resTypeConfig.forEach(res => {
        if (res.layerType === 'C' && gridResTypes.indexOf(res.resType) > -1) {
          gridLayers.push(res.layerNo);
          featureLayers.push({
            layerNo: res.layerNo,
            filter,
          });
        }
      });
      featureLayers.push({
        layerNo: 'PLAN_GRID-C',
        filter: Filter.equalTo({ propertyName: 'sprintId', expression: this.queryData.sprintId }),
      });
      // console.log(featureLayers);
      const gridGraphics = await getByFeatureLayers(featureLayers);
      const otherGraphics = gridGraphics.filter(graphic => graphic.layerNo !== 'PLAN_GRID-C');
      if (otherGraphics.length === 0) {
        this.gridGraphics = gridGraphics || []; // 没有其他网格则plan网格居中
      } else {
        this.gridGraphics = otherGraphics; // 有其他网格则其他网格居中
      }
    },
    updateSize() {
      if (this.mapBox) {
        this.mapBox._map.__.updateSize();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import './hldOverview.scss';
</style>
