<template>
  <div>
    <div class="map-tools" :class="rightMenuShow ? 'right' : ''">
      <div class="map-icon-content">
        <div ref="zoomAdd" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_ZOOM_IN')"></div>
        <div class="map-icon-line"></div>
        <div ref="zoomOut" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_ZOOM_OUT')"></div>
      </div>
      <div class="map-icon-content">
        <div class="map-icon icon_osp " :title="$t(fullscreen ? 'EXIT_FULL_SCREEN' : 'FULL_SCREEN')" :class="[fullscreen? 'icon_osptuichuquanping' : 'icon_ospquanping']" @click="fullShow"></div>
      </div>
      <div v-if="!modalConfig" class="map-icon-content">
        <Popover ref="popover" placement="bottom" trigger="hover" popClass="gis-tool-popover">
          <div ref="point" class="map-icon icon_osp" :title="$t('SELECT')" :class="[{active: ['select', 'multSelect'].indexOf(controlData.btnActiveName) > -1}, controlData.btnActiveName === 'multSelect'?'icon_ospmianji':'icon_ospselect']" @click="directClick(['select', 'multSelect'].indexOf(controlData.btnActiveName) === -1 ? 'select' : controlData.btnActiveName)"></div>
          <ul slot="content" class="v9-popover-ul">
            <li ref="select" :title="$t('SELECT')" @click="selectClick('select')"></li>
            <div class="v9-line"></div>
            <li ref="multSelect" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_FREE_SELECT')" @click="selectClick('multSelect')"></li>
          </ul>
        </Popover>
        <div class="map-icon-line"></div>
        <Popover ref="popover" placement="bottom" trigger="hover" popClass="gis-tool-popover">
          <div ref="pointIdentify" class="map-icon icon_osp" :class="[{active: ['identify', 'multiIdentify'].indexOf(controlData.btnActiveName) > -1}, controlData.btnActiveName === 'multiIdentify'?'icon_ospquanxuan-mianjitu':'icon_ospidentify']" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_IDENTIFY')" @click="directClick(['identify', 'multiIdentify'].indexOf(controlData.btnActiveName) === -1 ? 'identify' : controlData.btnActiveName)"></div>
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
      <div v-if="modalConfig" class="map-icon-content">
        <div ref="select" :title="$t('SELECT')" :class="{ active: controlData.btnActiveName === 'select' }" @click="selectClick('select')">
          <div></div>
        </div>
      </div>
      <div v-if="modalConfig&&!modalConfig.sprintId&&!createDisabled" class="map-icon-content">
        <!-- <div ref="crateGrid" :class="{ active: controlData.btnActiveName === 'crateGrid'||controlData.btnActiveName === 'PLAN_GRID' }"
           class="map-icon icon_osp icon_ospshuanglieliebiao" @click="createGrid" :title="$t('PROJECT_CREARE_GRID')">
          <div></div>
        </div> -->
        <Popover ref="popover" placement="bottom" trigger="hover" popClass="gis-tool-popover">
          <div ref="crateGrid" class="map-icon icon_osp" :title="$t('PROJECT_CREARE_GRID')" :class="[{active: ['createGrid', 'gridImport','PLAN_GRID'].indexOf(controlData.btnActiveName) > -1}, controlData.btnActiveName === 'createGrid'||controlData.btnActiveName === 'PLAN_GRID'?'icon_ospshougong':'icon_ospguihuawangge']"></div>
          <ul slot="content" class="v9-popover-ul">
            <li ref="manual" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_HANDMADE')" class="map-icon icon_osp icon_ospshougong" @click="createGrid"></li>
            <div class="v9-line"></div>
            <li ref="gridImport" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_GRID_IMPORT')" class="map-icon icon_osp icon_ospdaoru" @click="createGrid"></li>
          </ul>
        </Popover>
      </div>
      <div v-if="!modalConfig" class="map-icon-content">
        <div class="map-icon icon_osp icon_ospjiejing" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_STREET_VIEW')" :class="{ active: controlData.btnActiveName === 'streetView' }" @click="switchClick('streetView')"></div>
      </div>
      <div v-if="!modalConfig" class="map-icon-content">
        <div class="map-icon icon_osp icon_ospshuqian" :title="$t('BOOKMARK')" :class="{ active: controlData.btnActiveName === 'save' && bookFlag }" @click="bookMark"></div>
      </div>
      <div ref="refresh" class="map-icon-content" :title="$t('REFRESH')"></div>
    </div>
    <!-- <BookMark ref="refBook" @showChange="change"></BookMark> -->
  </div>
</template>

<script>
// import BookMark from './bookMark/bookMark.vue';

import { Filter, MapServiceType, getByFeatureLayers } from 'map';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Tools',
  components: {
    // BookMark,
  },
  inject: ['getMapBox', 'getResourceList', 'getControlData', 'getSurfaceLayerList', 'getSchemaConfigs', 'modalConfig'],
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
      createDisabled: false,
      bookFlag: false,
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
    schemaConfigs() {
      return this.getSchemaConfigs();
    },
  },
  mounted() {
    this.setFilterMap();
    this.addControl();
    this.fullDom = document.querySelector('.planMapContentBox') || document.documentElement;
    this.fullDom.addEventListener('fullscreenchange', this.fullscreenchange);
  },
  destroyed() {
    this.fullDom.removeEventListener('fullscreenchange', this.fullscreenchange);
  },
  methods: {
    changeDisabled() {
      this.createDisabled = !this.createDisabled;
    },
    setFilterMap() {
      this.filterMap = new Map();
      const filter = Filter.equalTo({ propertyName: 'resStatus', expression: 'A' });
      // 此处的这些过滤条件需要注意与hld的initReferenceFilter方法做响应
      this.resources.forEach(item => {
        if (item.layerType === 'A') {
          this.filterMap.set(item.layerNo, filter);
        }
      });
      this.surfaceLayerList.forEach(surface => {
        const findRes = this.mapBox.findLayer(surface.layerNo);
        if (findRes && findRes._mapService.serviceType === MapServiceType.WMS_SERVICE) {
          this.filterMap.set(surface.layerNo, '');
        }
      });
    },
    addControl() {
      // 加载控制器

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

      const refresh = new this.$map.RefreshControl({
        target: this.$refs.refresh,
        mapContainer: this.mapBox,
        className: 'map-icon icon_osp icon_ospreload',
      });
      if (!this.modalConfig) {
        const polyline = new this.$map.MeasureLengthControl({
          mapContainer: this.mapBox,
          target: this.$refs.polyline,
          className: 'map-icon icon_osp icon_ospceliang',
        });
        this.polyline = polyline;
        const polygon = new this.$map.MeasureAreaControl({
          mapContainer: this.mapBox,
          target: this.$refs.polygon,
          className: 'map-icon icon_osp icon_ospmianji',
        });
        this.polygon = polygon;
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
        this.mapBox.map.addControl(multSelectControl);
        this.mapBox.map.addControl(identifyControl);
        this.mapBox.map.addControl(polygon);
        this.mapBox.map.addControl(polyline);
      }
      this.mapBox.map.addControl(zoomAdd);
      this.mapBox.map.addControl(zoomOut);
      this.mapBox.map.addControl(this.selectControl);

      this.mapBox.map.addControl(refresh);
      this.mapBox.on('identify', evt => {
        this.$emit('identify', evt.target);
      });
      this.mapBox.on('select', evt => {
        this.$emit('map-selection', evt.target);
      });
      this.mapBox.on('refresh', () => {
        this.controlData.popupName = '';
        this.directClick('select');
      });
    },
    popupSave() {
      this.$refs.surfaceDraw.saveDemand();
      this.popupInfo.show = false;
    },
    popupExit() {
      this.mapBox.removeTempLayer('demandBuilding');
      this.mapBox.refresh();
      this.$refs.surfaceDraw.initSurfaceManage();
      this.popupInfo.show = false;
    },
    popupClose() {
      this.popupInfo.show = false;
      this.$refs.surfaceDraw.editFlag = true;
    },
    imgPopupClose() {
      this.showImgList = [];
      this.fengeType = 'T';
      this.fengeNum = 1;
    },
    directClick(name) {
      const gisDom = this.$refs[name].querySelector('div');
      gisDom.click();
    },
    selectClick(name) {
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
              this.multiIdentifyFunction();
              if (resultList && resultList.length > 0) {
                this.$emit('map-selection', resultList);
              } else {
                fish.toast('warn', 'No reource found.');
              }
              $.unblockUI();
            },
            () => {
              this.multiIdentifyFunction();
              fish.toast('error', 'Search error');
              $.unblockUI();
            },
          );
        }
      });
    },
    switchClick(name) {
      this.controlData.btnActiveName = name;
      // eslint-disable-next-line default-case
      switch (name) {
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
    createGrid() {
      // 创建网格
      this.controlData.btnActiveName = 'createGrid';
      this.$emit('createGridView');
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
    // 右键撤销
    rightClickDraw() {
      if (this.controlData.btnActiveName === 'polyline') {
        this.polyline.undoDraw();
      } else if (this.controlData.btnActiveName === 'polygon') {
        this.polygon.undoDraw();
      }
    },
    // 全屏和退出全屏
    fullShow() {
      if (!this.fullscreen) {
        this.fullDom.requestFullscreen();
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
  background: var(--theme-bg-color12);
  padding: 0;
  border: none;
  border-radius: 5px;

  .popover-content {
    padding: 0;
    width: 34px;
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
