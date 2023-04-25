<template>
  <div>
    <div class="map-tools" :class="rightMenuShow ? 'right' : ''">
      <RouteExport ref="export"></RouteExport>
      <div class="map-icon-content">
        <div ref="zoomAdd" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_ZOOM_IN')"></div>
        <div class="map-icon-line"></div>
        <div ref="zoomOut" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_ZOOM_OUT')"></div>
      </div>
      <div class="map-icon-content">
        <div class="map-icon icon_osp " :class="[fullscreen? 'icon_osptuichuquanping' : 'icon_ospquanping']" :title="$t(fullscreen ? 'EXIT_FULL_SCREEN' : 'FULL_SCREEN')" @click="fullShow"></div>
      </div>
      <div class="map-icon-content">
        <Popover ref="popover" placement="bottom" trigger="hover" popClass="gis-tool-popover">
          <div ref="point" class="map-icon icon_osp" :title="$t('SELECT')" :class="[{active: controlData.btnActiveName === 'multSelect'|| controlData.btnActiveName === 'select'}, selectName === 'multSelect'?'icon_ospmianji':'icon_ospselect']" @click="directClick(['select', 'multSelect'].indexOf(selectName) === -1 ? 'select' : selectName)"></div>
          <ul slot="content" class="v9-popover-ul">
            <li ref="select" :title="$t('SELECT')" @click="selectClick('select')"></li>
            <div class="v9-line"></div>
            <li ref="multSelect" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_FREE_SELECT')" @click="selectClick('multSelect')"></li>
          </ul>
        </Popover>
        <div class="map-icon-line"></div>
        <Popover ref="popover" placement="bottom" trigger="hover" popClass="gis-tool-popover">
          <div ref="pointIdentify" class="map-icon icon_osp" :class="[{active: controlData.btnActiveName === 'identify' || controlData.btnActiveName === 'multiIdentify'}, selectName === 'multiIdentify'?'icon_ospquanxuan-mianjitu':'icon_ospidentify']" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_IDENTIFY')" @click="directClick(['identify', 'multiIdentify'].indexOf(selectName) === -1 ? 'identify' : selectName)"></div>
          <ul slot="content" class="v9-popover-ul">
            <li ref="identify" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_IDENTIFY')" @click="selectClick('identify')"></li>
            <div class="v9-line"></div>
            <li ref="multiIdentify" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_FREE_IDENTIFY')">
              <div class="map-icon icon_osp icon_ospquanxuan-mianjitu" @click="multiIdentifyFunction"></div>
            </li>
          </ul>
        </Popover>
        <div class="map-icon-line"></div>
        <div ref="polyline" :class="{ active: controlData.btnActiveName === 'polyline' }" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_MEASURE_LINE')" @click="switchClick('polyline')"></div>
        <div class="map-icon-line"></div>
        <div ref="polygon" :class="{ active: controlData.btnActiveName === 'polygon' }" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_MEASURE_AREA')" @click="switchClick('polygon')"></div>
      </div>
      <!-- <div class="map-icon-content">
        <div class="map-icon icon_osp icon_ospjiejing" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_STREET_VIEW')"
        :class="{ active: controlData.btnActiveName === 'streetView' }" @click="switchClick('streetView')">
        </div>
      </div> -->
      <!-- <div class="map-icon-content">
                <div class="map-icon icon_osp icon_ospxiayibuchehui" :title="$t('UNDO')" @click="undo">
                    <sup class="redoSup undo">{{ undoCount }}</sup>
                </div>
                <div class="map-icon-line"></div>
                <div class="map-icon icon_osp icon_ospshangyibuchehui" :title="$t('REDO')" @click="redo">
                    <sup class="redoSup redo">{{ redoCount }}</sup>
                </div>
            </div> -->
      <div class="map-icon-content">
        <div class="map-icon icon_osp icon_ospshuqian" :title="$t('BOOKMARK')" :class="{ active: controlData.btnActiveName === 'save' && bookFlag }" @click="bookMark"></div>
        <div class="map-icon-line"></div>
        <div ref="refresh" :title="$t('REFRESH')" @click="switchClick('point')"></div>
      </div>
      <!-- <div class="map-icon-content" ref="refresh" :title="$t('REFRESH')" @click="switchClick('point')"></div> -->
      <ViewType v-if="projectInfo.markFlag !== 'sprint'" @exportShow="exportShow"></ViewType>
    </div>
    <BookMark ref="refBook" @showChange="change"></BookMark>
  </div>
</template>

<script>
import { Filter, MapServiceType, getByFeatureLayers } from 'map';
import BookMark from './bookMark/bookMark.vue';
import ViewType from './viewType/viewType.vue';
import RouteExport from './routeExport/routeExport.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Tools',
  components: {
    BookMark,
    ViewType,
    RouteExport,
  },
  inject: ['getMapBox', 'getResourceList', 'getControlData', 'getSurfaceLayerList', 'getOtherDesignList', 'getProjectInfo', 'getSchemaConfigs'],
  props: {
    rightMenuShow: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false, // 是否全屏
    },
  },
  data() {
    return {
      bookFlag: false,
      pointselect: 'select',
      selectName: 'select',
      undoCount: 0,
      redoCount: 0,
      filterMap: null,
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    resources() {
      return this.getResourceList();
    },
    controlData() {
      return this.getControlData();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
    otherDesignList() {
      return this.getOtherDesignList();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
  },
  mounted() {
    this.setFilterMap();
    this.addControl();
    this.$root.$on('changeUnDoCount', this.changeUnDoCount);
    this.$root.$on('afterSelection', this.clearUndo); // 选型之后清空堆栈
    this.$root.$on('directClick', this.directClick); // 监听tool事件
    document.documentElement.addEventListener('fullscreenchange', this.fullscreenchange);
  },
  destroyed() {
    this.$root.$off('changeUnDoCount', this.changeUnDoCount);
    this.$root.$off('afterSelection', this.clearUndo); // 选型之后清空堆栈
    this.$root.$off('directClick', this.directClick); // 监听tool事件
    document.documentElement.removeEventListener('fullscreenchange', this.fullscreenchange);
  },
  methods: {
    setFilterMap() {
      const filter = Filter.equalTo({ propertyName: 'resStatus', expression: 'A' });
      this.filterMap = new Map();
      // 此处的这些过滤条件需要注意与hld的initReferenceFilter方法做响应
      this.resources.forEach(item => {
        if (item.layerType === 'A') {
          this.filterMap.set(item.layerNo, filter);
        }
      });
      this.otherDesignList.forEach(item => {
        if (item.layerType === 'R') {
          const schemaFilterKey = this.projectInfo.markFlag === 'sprint' ? 'sprintId' : 'schemaId';
          const schemaFilterValue = this.projectInfo.markFlag === 'sprint' ? this.projectInfo.sprintId : this.projectInfo.schemaId;
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
            this.$map.Filter.equalTo({ propertyName: 'resStatus', expression: 'C', matchCase: true }),
          ];
          this.filterMap.set(item.layerNo, Filter.and(...filterList));
        }
      });
      this.surfaceLayerList
        .filter(surface => {
          const findRes = this.mapBox.findLayer(surface.layerNo);
          return findRes && findRes._mapService.serviceType === MapServiceType.WMS_SERVICE;
        })
        .forEach(layer => {
          this.filterMap.set(layer.layerNo, '');
        });
      const allLayers = this.mapBox.getLayers();
      const otherSurfaces = allLayers
        .filter(allA => !this.resources.find(res => res.layerNo === allA.id))
        .filter(allB => !this.surfaceLayerList.find(res => res.layerNo === allB.id))
        .filter(allC => !this.otherDesignList.find(res => res.layerNo === allC.id));
      if (otherSurfaces && otherSurfaces.length > 0) {
        otherSurfaces.forEach(res => {
          this.filterMap.set(res.id, '');
        });
      }
    },
    addControl() {
      // 加载控制器
      const polygon = new this.$map.MeasureAreaControl({
        mapContainer: this.mapBox,
        target: this.$refs.polygon,
        className: 'map-icon icon_osp icon_ospmianji',
      });
      this.polygon = polygon;
      const polyline = new this.$map.MeasureLengthControl({
        mapContainer: this.mapBox,
        target: this.$refs.polyline,
        className: 'map-icon icon_osp icon_ospceliang',
      });
      this.polyline = polyline;
      const zoomAdd = new this.$map.ZoomAddControl({
        target: this.$refs.zoomAdd,
        className: 'map-icon icon_osp icon_ospfangda',
      });
      const zoomOut = new this.$map.ZoomOutControl({
        target: this.$refs.zoomOut,
        className: 'map-icon icon_osp icon_ospsuoxiao',
      });
      this.selectControl = new this.$map.SelectControl({
        target: this.$refs.select,
        className: 'map-icon icon_osp icon_ospselect',
        mapContainer: this.mapBox,
      });
      const multSelectControl = new this.$map.FreeHandMutiSelectControl({
        target: this.$refs.multSelect,
        className: 'map-icon icon_osp icon_ospmianji',
        mapContainer: this.mapBox,
        selectModel: this.schemaConfigs.selectModel,
      });
      const identifyControl = new this.$map.IdentifyControl({
        mapContainer: this.mapBox,
        target: this.$refs.identify,
        className: 'map-icon icon_osp icon_ospidentify',
        layers: this.filterMap,
      });
      const refresh = new this.$map.RefreshControl({
        target: this.$refs.refresh,
        mapContainer: this.mapBox,
        className: 'map-icon icon_osp icon_ospreload',
      });
      this.mapBox.map.addControl(zoomAdd);
      this.mapBox.map.addControl(zoomOut);
      this.mapBox.map.addControl(this.selectControl);
      this.mapBox.map.addControl(multSelectControl);
      this.mapBox.map.addControl(identifyControl);
      this.mapBox.map.addControl(polyline);
      this.mapBox.map.addControl(polygon);
      this.mapBox.map.addControl(refresh);
      this.mapBox.on('identify', evt => {
        this.$emit('identify', evt.target);
        return true;
      });
      this.mapBox.on('select', evt => {
        this.$root.$emit('map-selection', evt.target);
      });

      // polyline.addMeasureListener(event => {
      //     // this.controlData.btnActiveName = 'select';
      //     // this.selectControl.activate();
      // });
      // polygon.addMeasureListener(event => {
      //     // this.controlData.btnActiveName = 'select';
      //     // this.selectControl.activate();
      // });
      refresh.addRefreshListener(() => {
        this.$root.$emit('refresh');
      });
    },
    rightClickDraw() {
      if (this.controlData.btnActiveName === 'polyline') {
        this.polyline.undoDraw();
      } else if (this.controlData.btnActiveName === 'polygon') {
        this.polygon.undoDraw();
      }
    },
    imgPopupClose() {
      this.showImgList = [];
      this.fengeType = 'T';
      this.fengeNum = 1;
    },
    changeUnDoCount(flag) {
      const { stackDepth } = this.schemaConfigs;
      if (flag === 'undo') {
        // eslint-disable-next-line no-plusplus
        this.undoCount >= stackDepth ? '' : this.undoCount++;
      }
    },
    directClick(name) {
      this.$refs[name].click();
      if (name !== 'A0' && name !== 'A1') {
        const gisDom = this.$refs[name].querySelector('div');
        gisDom.click();
      }
    },
    selectClick(name) {
      this.selectName = name;
      this.controlData.btnActiveName = name;
    },
    multiIdentifyFunction() {
      this.selectClick('multiIdentify');
      this.mapBox.clear(false);
      this.mapBox.drawPolygon(graphic => {
        const { geometry } = graphic;
        if (!geometry.isRealPolygon()) {
          fish.toast('warn', this.$t('RESOURCE_DEL_DRAWING_POLYGON_NOT_POLYGON'));
          this.multiIdentifyFunction();
          return;
        }
        const serchGeo = this.mapBox.createPolygonGeometry(geometry.getRings());
        if (this.filterMap) {
          $.blockUI({ message: 'Searching...' }); // loading
          const featureLayers = this.mapBox
            .getLayers()
            .filter(gisLayer => this.filterMap.has(gisLayer.id) && gisLayer.visible && gisLayer.selectable)
            .map(layer => {
              let gisFilter = null;
              gisFilter = Filter.intersects({
                geometryName: 'geom',
                geometry: serchGeo,
                spatialReference: this.mapBox.spatialReference,
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
          getByFeatureLayers(featureLayers).then(
            resultList => {
              if (resultList && resultList.length > 0) {
                resultList.forEach(item => {
                  const obj = this.resources
                    .concat(this.surfaceLayerList)
                    .concat(this.otherDesignList)
                    .find(resource => resource.layerNo === item.layerNo);
                  if (obj) {
                    item.resType = obj.resType ? obj.resType : obj.surfaceCat;
                    item.name = obj.name ? obj.name : obj.catName;
                    item.resTypeName = obj.resTypeName ? obj.resTypeName : obj.layerName;
                  }
                });
                this.$root.$emit('property', resultList);
              } else {
                fish.toast('warn', 'No reource found.');
                this.multiIdentifyFunction();
              }
              $.unblockUI();
              // this.mapBox.getDrawLayer().clear();
            },
            () => {
              fish.toast('error', 'Search error');
              $.unblockUI();
              this.multiIdentifyFunction();
            },
          );
        }
      });
    },
    switchClick(name) {
      this.controlData.btnActiveName = name;
      // eslint-disable-next-line default-case
      switch (name) {
        case 'point':
          this.selectControl.activate();
          break;
        case 'streetView':
          this.mapBox.deactiveSelect();
          this.mapBox.addMouseClickListener(evt => this.locationCallback(evt));
          break;
      }
    },
    locationCallback(evt) {
      // 新增街景点击事件
      const [Longtiude, Latitude] = this.mapBox.map.toCoordinate([evt.x, evt.y]);
      // this.location = `${Latitude},${Longtiude}`;
      this.$emit('street-view', `${Latitude},${Longtiude}`);
    },
    bookMark() {
      // this.switchClick("save");
      if (!this.$refs.refBook.popupBook.show) {
        this.$refs.refBook.loadBookGrid();
      }
      this.$refs.refBook.popupBook.show = !this.$refs.refBook.popupBook.show;
      // this.bookFlag = this.$refs.refBook.popupBook.show
    },
    change(val) {
      this.bookFlag = val;
    },
    undo() {
      const { stackDepth } = this.schemaConfigs;
      if (this.undoCount > 0) {
        // eslint-disable-next-line no-plusplus
        this.undoCount--;
        // eslint-disable-next-line no-plusplus
        this.redoCount >= stackDepth ? '' : this.redoCount++;
      }
      this.mapBox.undo(stackDepth);
    },
    redo() {
      const { stackDepth } = this.schemaConfigs;
      if (this.redoCount > 0) {
        // eslint-disable-next-line no-plusplus
        this.redoCount--;
        // eslint-disable-next-line no-plusplus
        this.undoCount >= stackDepth ? '' : this.undoCount++;
      }
      this.mapBox.redo(stackDepth);
    },
    clearUndo() {
      this.undoCount = 0;
      this.redoCount = 0;
      this.mapBox.clearUndo();
    },
    exportShow(show) {
      this.$refs.export.showRouteExport = show;
    },

    // 全屏和退出全屏
    fullShow() {
      if (!this.fullscreen) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    fullscreenchange() {
      this.$emit('update:fullscreen', !!document.fullscreenElement);
    },
  },
};
</script>

<style lang="scss">
.gis-tool-popover {
  // background: $opacity-background;
  background: var(--theme-bg-color12);
  padding: 0;
  border: none;
  border-radius: 5px;

  .popover-content {
    padding: 0;
    width: 36px;
  }

  .v9-popover-ul .icon_osp {
    cursor: pointer;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    width: 36px;
    font-size: 14px;

    &:hover {
      font-size: 18px;
      background: $theme-color;
      color: #ffffff;
      border-radius: 5px;
    }
  }

  .v9-line {
    width: 30px;
    margin: 0 2px;
    height: 1px;
    background: #181818;
  }
}

.popover.bottom.gis-tool-popover > .arrow:after {
  border-bottom-color: $opacity-background;
}
</style>
<style lang="scss" scoped>
@import './tool.scss';
</style>
