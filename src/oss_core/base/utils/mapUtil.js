import {
  MapContainer,
  MapServiceType,
  Polygon,
  Filter,
  GeometryType,
  SupportSpatialReferences,
  getByFeatureLayers,
  FeatureFilterHandlerEngine,
  StyleRule,
  PictureMarkerSymbol,
  Font,
  TextSymbol,
  SimpleFillSymbol,
  SimpleLineSymbol,
  Color as MapColor,
} from 'map'; // gis平台API
import { getAllManagedRestypesWithGeometryType } from '@/oss_core/base/utils/ResourcesConfig.js'; // 公用配置
// import { getResTypeConfig } from '@/oss_core/edesign/api/query/schema.js'; //后台接口
// import { getStyleConfig } from '@/oss_core/edesign/api/query/sprint.js'; //后台接口

// 获取网格图层
async function getGridGraphics(projectInfo, resourceList) {
  const featureLayers = [];
  if (projectInfo.markFlag !== 'sprint') {
    // 过滤：当前图层样式下的网格类型
    const gridResTypes = [];
    const gridLayers = [];
    getAllManagedRestypesWithGeometryType().forEach(item => {
      if (item.GEOMETRY_TYPE === GeometryType.POLYGON && item.RES_TYPE !== 'PLAN_GRID') {
        gridResTypes.push(item.RES_TYPE);
      }
    });
    resourceList.forEach(res => {
      if (res.layerType === 'C' && gridResTypes.indexOf(res.resType) > -1) {
        gridLayers.push(res.layerNo);
        featureLayers.push({
          layerNo: res.layerNo,
          filter: Filter.equalTo({ propertyName: 'schemaId', expression: projectInfo.schemaId }),
        });
      }
    });
  }
  featureLayers.push({
    layerNo: 'PLAN_GRID-C',
    filter: Filter.equalTo({ propertyName: 'sprintId', expression: projectInfo.sprintId }),
  });
  const gridGraphics = await getByFeatureLayers(featureLayers);
  const otherGraphics = gridGraphics.filter(graphic => graphic.layerNo !== 'PLAN_GRID-C');
  if (otherGraphics.length === 0) {
    return gridGraphics;
  }
  return otherGraphics;
}

function getExtendByGrid(gridGraphics) {
  let mapExtends;
  const geos = gridGraphics.map(graphic => graphic.geometry);
  if (geos.length === 1) {
    mapExtends = geos[0].getExtent();
  } else if (geos.length > 1) {
    let polygonGeoPaths = [];
    geos.forEach(geo => {
      const rings = geo.getRings();
      polygonGeoPaths = polygonGeoPaths.concat(rings);
    });
    // console.log(polygonGeoPaths);
    const polygonGeo = new Polygon(polygonGeoPaths, SupportSpatialReferences.WEB_MERCATOR);
    mapExtends = polygonGeo.getExtent();
  }
  return mapExtends;
}
function filter(projectInfo, layer, resType) {
  if (projectInfo.markFlag === 'sprint' || resType === 'A5' || resType === 'PLAN_GRID') {
    layer.filter = Filter.equalTo({ propertyName: 'sprintId', expression: projectInfo.sprintId, matchCase: true });
  } else {
    layer.filter = Filter.equalTo({ propertyName: 'schemaId', expression: projectInfo.schemaId, matchCase: true });
  }
}

function createCloudColor(configColor) {
  let color;
  let alpha;
  if (configColor && configColor.toString().length > 7) {
    color = configColor.toString().substr(0, 7);
    alpha = (parseInt(configColor.toString().substr(7, 2), 16) / 255).toFixed(2);
  } else {
    color = configColor.toString();
    alpha = 1;
  }
  const cloudColor = MapColor.fromHex(color, alpha);
  return cloudColor;
}

function setStylebyConfig(geometryType, config) {
  const font = new Font(Number(config.fontSize), config.fontStyle, config.fontWeight, config.fontFamiliy);
  const textSymbol = new TextSymbol(
    '', // text
    font,
    createCloudColor(config.fontColor),
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
    // const img1 = new Image();
    // img1.src = config.iconUrl;
    style = new PictureMarkerSymbol(config.iconUrl, config.imgSize, config.imgSize, 0, xOff, yOff, true, textSymbol, config.size);
  } else if (geometryType === GeometryType.POLYGON) {
    // 网格不参与数据库配置，
    const polygonLine = new SimpleLineSymbol(config.lineStyle, createCloudColor(config.lineColor), Number(config.lineWidth));
    style = new SimpleFillSymbol(polygonLine, createCloudColor(config.fillColor), true, textSymbol);
  } else if (geometryType === GeometryType.POLYLINE) {
    style = new SimpleLineSymbol(config.lineStyle, createCloudColor(config.lineColor), Number(config.lineWidth), true, textSymbol);
  }
  return style;
}

function setStyle(layer, configData) {
  layer.symbol = setStylebyConfig(configData.geometryType, configData);
  if (configData.gisLayerThemeList && configData.gisLayerThemeList.length > 0) {
    const styleRuleList = [];
    configData.gisLayerThemeList.forEach(gisLayerTheme => {
      gisLayerTheme.gisLayerThemeItemList.forEach(element => {
        const themeItemDef = JSON.parse(element.themeItemDef);
        const featureFilter = FeatureFilterHandlerEngine.encode(themeItemDef);
        const style = setStylebyConfig(configData.geometryType, element);
        const styleRule = new StyleRule(featureFilter, style);
        styleRule.themeItemId = element.themeItemId;
        styleRuleList.push(styleRule);
      });
    });
    layer.themeItemList = styleRuleList;
  }
}

function setLayerStyle(mapBox, projectInfo, resourceList, styleConfigObj) {
  const layers = mapBox.getLayers() || [];
  layers.forEach(layer => {
    const layerInfo = resourceList.find(res => res.layerNo === layer.id);
    if (layerInfo) {
      if (layerInfo.layerType === 'C' || layerInfo.resType === 'A5') {
        filter(projectInfo, layer, layerInfo.resType); // 过滤非本任务单数据
        const configData = styleConfigObj[layerInfo.resType];
        if (configData) {
          setStyle(layer, configData);
        }
      }
      // 只展示
      mapBox.setVisible(layer.id, true);
      mapBox.setSelectable(layer.id, false);
      mapBox.setIsSnap(layer.id, false);
      layer.showLabel = false;
    } else {
      mapBox.setVisible(layer.id, false);
      mapBox.setIsSnap(layer.id, false);
    }
  });
}

// 地图截图
export async function mapToPng(projectInfo, resourceList, styleConfigObj, el, downloadName) {
  //   const resApi = getResTypeConfig(projectInfo.sprintId);
  //   const styleApi = getStyleConfig(projectInfo.sprintId);
  // 获取地图
  const mapBox = new MapContainer('edesign', el);
  const gridGraphics = await getGridGraphics(projectInfo, resourceList);
  // let geos = this.centerPlaningGrid(true);
  const mapExtends = getExtendByGrid(gridGraphics);
  await mapBox.init({ mapNo: projectInfo.mapNo, initExtent: mapExtends });
  const baseMapList = [MapServiceType.ONLINE_MAP_SERVICE, MapServiceType.GEOSERVER_OFFLINE_MAP, MapServiceType.BING_MAP];
  const baseMapServices = mapBox.findServiceByType(baseMapList); // 初始化后要马上设置visible否则马上加载所有地图
  baseMapServices.forEach((i, index) => {
    if (index === 0) {
      i.layer.visible = true;
    } else {
      i.layer.visible = false;
    }
  });
  setLayerStyle(mapBox, projectInfo, resourceList, styleConfigObj);
  return new Promise(resolve => {
    mapBox._map.__.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = mapBox._map.__.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(el.querySelectorAll('.ol-layer canvas'), canvas => {
        if (canvas.width > 0) {
          const canvasOpacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = canvasOpacity === '' ? 1 : Number(canvasOpacity);
          const canvasTransform = canvas.style.transform;
          // Get the transform parameters from the style's transform matrix
          const matrix = canvasTransform
            // .match(/^matrix\(([^\(]*)\)$/)[1]
            .match(/^matrix\(([^(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          mapContext.drawImage(canvas, 0, 0);
        }
      });
      // const url = mapCanvas.toDataURL('image/webp');
      mapCanvas.toBlob(
        blob => {
          const file = new File([blob], `${downloadName}.webp`, { type: 'image/webp', lastModified: Date.now() });
          resolve(file);
        },
        'image/webp',
        0.95,
      );

      // const source = tinify.fromFile('url');
      // if (navigator.msSaveBlob) {
      //   // link download attribute does not work on MS browsers
      //   navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
      // } else {
      // let aLink = document.createElement('a');
      // aLink.href = url;
      // aLink.download = downloadName || 'map.png'; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      // aLink.click();
      // }
    });
  });
}
