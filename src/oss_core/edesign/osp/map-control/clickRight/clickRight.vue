<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2023-04-06 19:13:28
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 右侧点击菜单栏组件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\clickRight\clickRight.vue
-->
<template>
  <div class="clickRightOverlay" :style="height">
    <ul class="menu-right mainMenu">
      <popover v-for="item in menuList" :key="item.seq" trigger="hover" placement="left" popClass="opacityRight">
        <li class="menu-item" @click="event(item)" @mouseenter="mainEnter(item)" @mouseleave="mainLeave(item)">
          <i :class="item.icon"></i>
        </li>
        <div slot="content">
          <div class="fastKey-col">
            <div class="">{{ item.name }}</div>
            <div v-if="item.fastKey" class="fastKey-row">
              <div class="fastKey-title">{{ $t('OSP_RIGHT_CLICK_SELECTION_SHORTCUT') }}</div>
              <div class="fastKey-label">{{ item.fastKey }}</div>
            </div>
          </div>
        </div>
      </popover>
    </ul>
    <div v-if="subContentList.length > 0">
      <div v-for="(item, parIndex) in subContentList" v-show="curMainMenu === item.code || curSubMenu === item.code" :key="parIndex" class="subMenu-div">
        <ul v-if="item.subMenuContent && item.subMenuContent.length > 0" class="menu-right subMenu" :style="setMarginTop(item.code)" @mouseenter="subEnter(item)" @mouseleave="subLeave(item)">
          <li v-for="(singleSubMenuContent, index) in item.subMenuContent" :key="index" class="sub-menu-item" @click="item.singleContentFunction(singleSubMenuContent)">
            <div class="subContent" :title="singleSubMenuContent.showName">{{ singleSubMenuContent.showName }}</div>
          </li>
        </ul>
        <ul v-else v-show="curMainMenu === item.code || curSubMenu === item.code" class="menu-right subMenu noneLayer" :style="setMarginTop(item.code)" @mouseenter="subEnter(item)" @mouseleave="subLeave(item)">
          <li class="sub-menu-item">
            <i class="noneLayerContent">{{ item.emptyContentLabel }}</i>
          </li>
        </ul>
      </div>
    </div>

    <Selection ref="selection"></Selection>
    <MoveResource ref="moveResource"></MoveResource>
  </div>
</template>

<script>
import { Graphic, Circle, SupportSpatialReferences, Filter, updateGeometryById, batchUpdateGeometryById, addGeometry, editAttributeById } from 'map';
// import BindAZ from './bindAZ/bindAZ.vue';
import Selection from './selection/Selection.vue'; // 选型组件
import MoveResource from '@/oss_core/edesign/osp/map-control/clickRight/moveResource/moveResource.vue';
import { copyActionList, copyResource, deleteGraphic } from '../../domain/ResEventHandler.js';
import { getBaseResAttr } from '@/oss_core/base/utils/ResourcesConfig.js';

export default {
  name: 'ClickRight',
  components: {
    MoveResource,
    Selection,
  },
  inject: [
    'getMapBox',
    'getControlData',
    'getProjectInfo',
    'getSurfaceLayerList',
    'getSchemaConfigs',
    'getResourceList',
    'getAttrActionConfig',
    'getHldTempleteTree',
  ],
  props: {
    menuList: {
      type: Array,
      default: () => [],
    },
    graphic: {
      type: Array,
      default: () => [],
    },
    layerState: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      propertyGridData: [],
      propertyGridGraphic: [],
      subContentList: [],
      curSubMenu: '',
      curMainMenu: '',
      curPosition: [0, 0, 0, 0],
    };
  },
  computed: {
    mapContainer() {
      return this.getMapBox();
    },
    controlData() {
      return this.getControlData();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
    resourceList() {
      return this.getResourceList() || {};
    },
    height() {
      const height = this.menuList.length * 32;
      return `height: ${height}px;`;
    },
    attrActionConfig() {
      return this.getAttrActionConfig();
    },
    hldTempleteTree() {
      return this.getHldTempleteTree();
    },
  },
  watch: {
    graphic: {
      handler() {
        this.menuList.forEach(res => {
          if (res.hasSubMenu && res.initSubMenuContentFunctionName && res.functionRunMode === 'graphic-change') {
            this[res.initSubMenuContentFunctionName](res);
          }
        });
      },
    },
    curPosition: {
      handler(val) {
        if (val) {
          this.menuList.forEach(res => {
            if (res.hasSubMenu && res.initSubMenuContentFunctionName && res.functionRunMode === 'right-click') {
              this[res.initSubMenuContentFunctionName](res);
            }
          });
        }
      },
    },
  },
  mounted() {},
  methods: {
    event(item) {
      if (item.code === 'mergeLine' || item.code === 'breakLine') {
        // 控制这两种情况下的az绑定只在完全可以确定az的情况下进行绑定
        this.autoBind = true;
      }
      if (item.code === 'property') {
        if (this.graphic.length === 1) {
          this.$parent.$refs.search.$refs.result.setResult([this.graphic[0]]);
        } else {
          this.$root.$emit('property', this.graphic);
        }
      } else if (item.code === 'selectModel') {
        this.selectionShow(this.graphic);
      } else if (item.code === 'loadFormatPoint') {
        this.$emit('loadFormatPoint', this.graphic);
      } else if (item.code === 'delete') {
        item.event(this).then(() => {
          fish.toast('success', this.$t('DELETE_SUCCESS'));
          this.$emit('delete');
        });
      } else if (item.code === 'move') {
        this.moveResourceShow(item);
      } else if (item.code === 'editMarker') {
        this.$parent.$refs.quickInput.queryStyle(this.graphic[0].layerNo, 'edit', this.graphic[0]);
        this.$parent.$refs.quickInput.showRestype = 'maker';
      } else {
        item.event(this);
      }
    },
    showBindAZ(alist, zlist) {
      this.$parent.alist = alist;
      this.$parent.zlist = zlist;
      this.$emit('showBind');
    },
    selectionShow(graphicList) {
      // 选型界面展示
      this.$refs.selection.setGraphicList(graphicList);
    },
    moveResourceShow(item) {
      const [gra] = this.graphic;
      item.event(this);
      this.$refs.moveResource.popupShow(gra);
    },
    mainEnter(item) {
      this.curMainMenu = item.code;
    },
    mainLeave() {
      this.curMainMenu = '';
    },
    subEnter(item) {
      this.curSubMenu = item.code;
    },
    subLeave() {
      this.curSubMenu = '';
    },
    // 对每一根cable生成route
    genRoute(cableGraphic) {
      return new Promise(resolve => {
        // 每一根cable
        let routeGisKey = '';
        const updateCableGra = cableGraphic.toJSON();
        if (cableGraphic.attributes.ductGisKey && cableGraphic.attributes.ductLayerNo) {
          const ductGisKeyList = cableGraphic.attributes.ductGisKey.split(',');
          const ductLayerNoList = cableGraphic.attributes.ductLayerNo.split(',');
          const ductList = [];
          const promiseList = [];
          // 找到每一根cable对应的所有duct
          for (let i = 0; i < ductGisKeyList.length; i += 1) {
            promiseList.push(this.$map.getByLayerAndId(ductLayerNoList[i], ductGisKeyList[i]));
          }
          Promise.all(promiseList).then(promiseResult => {
            promiseResult.forEach(res => {
              ductList.push(res);
            });
            // 获取cable复制到route的具体属性配置
            const srcObj = this.surfaceLayerList.find(surfaceLayItem => surfaceLayItem.layerNo === ductList[0].layerNo);
            const copyActList = copyActionList(this.attrActionConfig, srcObj.resType, 'ROUTE');
            // 组装route的graphic对象
            const newGraphics =
              ductList.map(singleGra => {
                const baseAttr = getBaseResAttr(singleGra.geometry, this.projectInfo);
                if (copyActList.length > 0) {
                  copyResource(copyActList, singleGra.attributes, baseAttr);
                }
                const newGraphic = new Graphic('', 'ROUTE-C', singleGra.geometry.clone(), null, baseAttr);
                return newGraphic;
              }) || [];
            if (newGraphics.length > 0) {
              // 批量新建route
              this.$map.batchAddGeometry(newGraphics).then(results => {
                if (results && results.length > 0) {
                  const editGraphics = results.map(singleGra => {
                    const editGra = singleGra.toJSON();
                    if (routeGisKey === '') {
                      routeGisKey = editGra.attributes.gisKey;
                    } else {
                      routeGisKey = `${routeGisKey},${editGra.attributes.gisKey}`;
                    }
                    editGra.attributes.resName = `Route-${editGra.attributes.objectid}`;
                    editGra.attributes.resNo = `Route-${editGra.attributes.objectid}`;
                    editGra.attributes.resId = editGra.attributes.gisKey;
                    return editGra;
                  });
                  this.$map.batchUpdateGeometryById(editGraphics).then(() => {
                    this.mapContainer.refreshLayer('ROUTE-C');
                    fish.toast('success', this.$t('OSP_RIGHT_CLICK_MSG_COPY_LAYER'));
                  });
                  updateCableGra.attributes.routeGisKey = routeGisKey;
                  resolve(updateCableGra);
                }
              });
            }
          });
        }
      });
    },
    // 对每一根cable清除route
    clearRoute(cableGraphic) {
      return new Promise(resolve => {
        const updateCableGra = cableGraphic.toJSON();
        if (cableGraphic.attributes.routeGisKey) {
          const routeGisKeyList = cableGraphic.attributes.routeGisKey.split(',');
          const promiseList = [];
          // 找到每一根cable对应的所有route
          for (let i = 0; i < routeGisKeyList.length; i += 1) {
            promiseList.push(this.$map.getByLayerAndId('ROUTE-C', routeGisKeyList[i]));
          }
          Promise.all(promiseList).then(promiseResult => {
            deleteGraphic({ graphic: promiseResult });
            updateCableGra.attributes.routeGisKey = '';
            resolve(updateCableGra);
          });
        }
      });
    },
    changeSelected(singleRes) {
      this.mapContainer.clear();
      const newGraphic = new Graphic('', singleRes.layerNo, singleRes.geometry.clone(), null, singleRes.attributes);
      this.mapContainer.setSelected([newGraphic]);
      this.$emit('map-selection', [newGraphic]);
    },
    routeChoose(singleRoute) {
      const promiseList = [];
      if (singleRoute.showName === 'Generation') {
        this.graphic.forEach(cableGraphic => {
          promiseList.push(this.genRoute(cableGraphic));
        });
      } else if (singleRoute.showName === 'Clear') {
        this.graphic.forEach(cableGraphic => {
          promiseList.push(this.clearRoute(cableGraphic));
        });
      }
      // 更新cable
      Promise.all(promiseList).then(updateCableGrahics => {
        this.$map.batchUpdateGeometryById(updateCableGrahics).then(() => {
          this.$root.$emit('refreshMap'); // 完成后通知地图刷新
        });
      });
    },

    initOtherResource(menu) {
      let tolrence = this.schemaConfigs.tolerance;
      const point = this.mapContainer
        .createPointFromCurrentCoord([this.curPosition[0], this.curPosition[1]], SupportSpatialReferences.WGS84)
        .transferProjection(SupportSpatialReferences.WEB_MERCATOR);
      const screenPoint = this.mapContainer._map.toScreen(point);
      const adjustCoord = this.mapContainer._map.toMapFromStage(screenPoint.x - tolrence, screenPoint.y);
      tolrence = point.x - adjustCoord.x;
      const circleGeo = new Circle(point, tolrence);
      const newGeo = this.mapContainer.createPolygonGeometry([circleGeo.getRings()]);
      this.filterMap = new Map();
      // 过滤显示当前设计
      const filter = Filter.equalTo({ propertyName: 'resStatus', expression: 'C' });
      this.resourceList.forEach(item => {
        if (item.layerType === 'C') {
          this.filterMap.set(item.layerNo, filter);
        }
      });
      const featureLayers = this.mapContainer
        .getLayers()
        .filter(gisLayer => this.filterMap.has(gisLayer.id) && gisLayer.visible && gisLayer.selectable)
        .map(layer => {
          let gisFilter = null;
          gisFilter = Filter.intersects({
            geometryName: 'geom',
            geometry: newGeo,
            spatialReference: this.mapContainer.spatialReference,
          });
          const resFilter = this.filterMap.get(layer.id);
          if (resFilter) {
            gisFilter = Filter.and(gisFilter, resFilter);
          }
          return {
            layerNo: layer.id,
            filter: gisFilter,
          };
        });

      this.$map.getByFeatureLayers(featureLayers).then(data => {
        // console.log(data);
        const validRes = data
          .filter(res => {
            if (res.attributes.gisKey === this.graphic[0].attributes.gisKey) {
              return false;
            }
            if (this.projectInfo.markFlag === 'sprint') {
              if (res.attributes.sprintId !== this.projectInfo.sprintId) {
                return false;
              }
            } else if (res.attributes.schemaId !== this.projectInfo.schemaId) {
              return false;
            }

            return true;
          })
          .map(item => ({
            showName: item.attributes.resName,
            layerNo: item.layerNo,
            geometry: item.geometry,
            attributes: item.attributes,
          }));
        this.subContentList = this.subContentList.filter(res => res.code !== menu.code);
        this.subContentList.push({
          code: menu.code,
          subMenuContent: validRes,
          singleContentFunction: this.changeSelected,
          emptyContentLabel: this.$t('OSP_RIGHT_CLICK_NO_OTHER_RESOURCE'),
        });
      });

      // let extend = circleGeo.getExtent();
      // console.log(extend);
      // let selectedSources = [];
      // if (this.graphic.length !== 1) {
      //     return;
      // }
      // let gisLayer = this.mapContainer.findLayer(this.graphic[0].layerNo);
      // if (gisLayer) {
      //     let mapServiceLayers = gisLayer._mapService.mapLayers || [];
      //     console.log(mapServiceLayers);
      //     mapServiceLayers.forEach(mapLayer => {
      //         selectedSources = selectedSources.concat(mapLayer._source.getFeaturesInExtent(extend.__) || []);
      //     });
      // }
      // console.log(selectedSources);
      // let validRes = selectedSources
      //     .filter(res => {
      //         if (res.values_.gisKey === this.graphic[0].attributes.gisKey) {
      //             return false;
      //         }
      //         if (this.projectInfo.markFlag === 'sprint') {
      //             if (res.values_.sprintId !== this.projectInfo.sprintId) {
      //                 return false;
      //             }
      //         } else {
      //             if (res.values_.schemaId !== this.projectInfo.schemaId) {
      //                 return false;
      //             }
      //         }
      //         return true;
      //     })
      // .map(single => {
      //     let values = single.values_;
      //     let findRes = this.resourceList.find(resour => resour.layerNo === values.layerNo);
      //     let gisRes = this.mapContainer.findLayer(values.layerNo);
      //     let flatCoordinates = values.geom.flatCoordinates;
      //     if (values.layerout === 'XYZ') {
      //         flatCoordinates = flatCoordinates.filter((coo, index) => (index + 1) % 3 !== 0);
      //     }
      //     let geometry;
      //     if (gisRes.geometryType === GeometryType.POINT) {
      //         geometry = this.mapContainer.createPoint(flatCoordinates[0], flatCoordinates[1]);
      //     } else if (gisRes.geometryType === GeometryType.POLYLINE) {
      //         let paths = this.initRings(flatCoordinates);
      //         geometry = this.mapContainer.createLineGeometry(paths);
      //     } else if (gisRes.geometryType === GeometryType.POLYGON) {
      //         let paths = this.initRings(flatCoordinates);
      //         geometry = this.mapContainer.createPolygonGeometry(paths);
      //     }
      //     return {
      //         showName: values.resName + ` (${findRes ? findRes.layerName : values.layerNo})`,
      //         layerNo: values.layerNo,
      //         geometry: geometry,
      //         attributes: values,
      //     };
      // });
      // this.subContentList = this.subContentList.filter(res => res.code !== menu.code);
      // console.log(validRes);
      // this.subContentList.push({
      //     code: menu.code,
      //     subMenuContent: validRes,
      //     singleContentFunction: this.changeSelected,
      //     emptyContentLabel: 'No Other Resource Found.',
      // });
    },
    // 右键选择模板
    initDesignElement(menu) {
      let showList;
      this.hldTempleteTree.forEach(item => {
        if (item.hldTemplateResTypes.filter(res => res.resType === this.graphic[0].resType).length) {
          showList = item.hldTemplateResTypes.filter(res => res.resType === this.graphic[0].resType);
        }
      });
      let validRes;
      if (showList[0].hldTemplates) {
        validRes = showList[0].hldTemplates
          .map(item => ({
            showName: item.hldTemplateName,
            hldTemplateId: item.hldTemplateId,
            graphic: this.graphic,
            attrs: item.attrs,
          }))
          .filter(res => res.hldTemplateId !== this.graphic[0].attributes.hldTemplateId);
      } else {
        validRes = [];
      }
      this.subContentList = this.subContentList.filter(res => res.code !== menu.code);
      this.subContentList.push({
        code: menu.code,
        subMenuContent: validRes,
        singleContentFunction: this.changeElement,
        emptyContentLabel: this.$t('OSP_RIGHT_CLICK_NO_OTHER_ELEMENT'),
      });
    },
    changeElement(singleRes) {
      const selectList = singleRes.graphic;
      let templateAttr = {};
      if (singleRes.attrs[0].attrId) {
        singleRes.attrs.forEach(item => {
          templateAttr = Object.assign(templateAttr, { [item.attrName]: item.attrVal });
        });
      }
      if (selectList.length === 1) {
        const attributes = Object.assign(selectList[0].attributes, { hldTemplateId: singleRes.hldTemplateId }, templateAttr);
        const newGraphic = new Graphic(selectList[0].id, selectList[0].layerNo, selectList[0].geometry.clone(), null, attributes);
        updateGeometryById(selectList[0].layerNo, newGraphic).then(() => {
          this.$root.$emit('changeAttributes', templateAttr);
        });
      } else {
        const newGraphic = [];
        selectList.forEach(item => {
          const attributes = Object.assign(item.attributes, { hldTemplateId: singleRes.hldTemplateId }, templateAttr);
          newGraphic.push(new Graphic(item.id, item.layerNo, item.geometry.clone(), null, attributes));
        });
        batchUpdateGeometryById(newGraphic).then(() => {
          this.$root.$emit('changeAttributes', templateAttr);
        });
      }
      this.mapContainer.refreshLayer(selectList[0].layerNo);
    },
    // 将plan Grid复制成其他网格
    initCopyTo(menu) {
      const graph = this.graphic[0];
      this.subContentList = this.subContentList.filter(res => res.code !== menu.code);
      const validRes = [
        {
          showName: 'OLT Grid',
          layerNo: 'OLT_GRID-C',
          graphic: graph,
        },
        {
          showName: 'ODC-P Grid',
          layerNo: 'OCC_GRID-C',
          graphic: graph,
        },
        {
          showName: 'ODP Grid',
          layerNo: 'ODB_GRID-C',
          graphic: graph,
        },
      ];
      this.subContentList.push({
        code: menu.code,
        subMenuContent: validRes,
        singleContentFunction: this.copyToOtherGrid,
      });
    },
    copyToOtherGrid(singleRes) {
      const graph = singleRes.graphic;
      const baseAttr = getBaseResAttr(graph.geometry, this.projectInfo);
      delete baseAttr.schemaId;
      const attributes = Object.assign({}, baseAttr, {
        isSprintGrid: this.projectInfo.markFlag === 'sprint' ? 'Y' : 'N',
      });
      const newGraphic = new Graphic('', singleRes.layerNo, graph.geometry.clone(), null, attributes);
      addGeometry(singleRes.layerNo, newGraphic).then(res => {
        res.attributes = Object.assign({}, res.attributes, { resName: `${singleRes.showName}-${res.attributes.objectid}`, resNo: '' });
        editAttributeById(singleRes.layerNo, res).then(() => {
          this.$emit('showTips', res);
          this.mapContainer.refreshLayers([singleRes.layerNo, graph.layerNo]);
          this.mapContainer._drawLayer.clear();
        });
      });
    },
    initRoute(menu) {
      const routeList = [];
      let canRouteFlag = true;
      this.graphic.some(cableGraphic => {
        // 批量操作中，如果有一个cable已有routeGisKey则表明已route，不能再次route，只能clear其中已route的cable
        if (cableGraphic.attributes.routeGisKey && cableGraphic.attributes.routeGisKey !== '') {
          canRouteFlag = false;
          return true;
        }
        return false;
      });
      if (canRouteFlag) {
        routeList.push({ showName: 'Generation' });
      } else {
        routeList.push({ showName: 'Clear' });
      }
      this.subContentList = this.subContentList.filter(res => res.code !== menu.code);
      this.subContentList.push({
        code: menu.code,
        subMenuContent: routeList,
        singleContentFunction: this.routeChoose,
        emptyContentLabel: this.$t('OSP_RIGHT_CLICK_NO_ROUTE_FUNCTION'),
      });
    },
    initRings(paths) {
      const rings = [];
      paths.forEach((path, index) => {
        if (index % 2 === 0) {
          rings.push([path, paths[index + 1]]);
        }
      });
      return [rings];
    },

    setMarginTop(code) {
      const index = this.menuList.findIndex(res => res.code === code);
      const top = index === -1 ? 0 : index * 32;
      return `margin-top: ${top}px;`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './clickRight.scss';
</style>

<style lang="scss">
.popover.opacityRight {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
