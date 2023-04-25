<template>
  <div class="design-export-container">
    <!-- <el-scrollbar style="height:100%;"> -->
    <div class="design-export-title">{{ $t('DESIGN_EXPORT_HLD_EXPORT') }}</div>
    <!-- <div class="export-map-area" ref="exportMap">
      <div class="map-extent-container">
        <div class="map-extent-container-east"> {{ this.mapExtent.VxMax }}</div>
        <div class="map-extent-container-west"> {{ this.mapExtent.VxMin }}</div>
        <div class="map-extent-container-south"> {{ this.mapExtent.VyMin }}</div>
        <div class="map-extent-container-north"> {{ this.mapExtent.VyMax }}</div>
      </div>
    </div> -->
    <div class="select-mode">
      <el-radio-group v-model="modeBtnActiveStr" size="mini" @change="laberChange" class="label-grow">
        <el-radio-button :label="$t('DESIGN_EXPORT_MANUALLY_VIEW')" :buttonObj="manuallyObj"></el-radio-button>
        <el-radio-button :label="$t('ALL')" :buttonObj="allObj"></el-radio-button>
        <el-radio-button :label="$t('DESIGN_EXPORT_CURRENT_VIEW')" :buttonObj="autoObj"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="select-mode">
      <DrawPolygon2Map @afterDrawPolygon="setExportParam" ref="DrawPolygon2Map" :disabled="disabledExtentButtonGroup"></DrawPolygon2Map>
    </div>
    <div class="layer-grid-container">
      <el-scrollbar style="height:100%;width:100%">
        <div class="layer-grid-header">
          <div>{{ $t('DESIGN_EXPORT_EXPORT_LAYER') }}</div>
          <!-- 空盒子为了进行表格内容布局 -->
          <div></div>
          <div></div>
          <div title="Selectable" class="icon_osp icon_ospxuanze"></div>
        </div>
        <div class="layer-grid-body">
          <div v-for="(items, indexs) in gridData" :key="indexs" v-show="items.dataLength !== 0">
            <div class="layer-grid-tap-tit">
              <div class="tap icon_osp" :class="items.show ? 'icon_ospsuoxiao' : 'icon_ospfangda'" @click="gridToggle(indexs)"></div>
              <div>{{ items.name }}</div>
              <!-- 空盒子为了进行表格内容布局 -->
              <div></div>
              <div></div>
              <div>
                <input type="checkbox" v-model="items.isExportAll" @change="checkboxAll(items, $event)" />
              </div>
            </div>
            <transition v-on:enter="enter" v-on:leave="leave">
              <div class="layer-grid-body-content v9-transition" v-show="items.show" :ref="items.name">
                <div v-for="(item, index) in items.childData" :key="index">
                  <div class="layer-grid-tap-tit layer-grid-tap-content">
                    <!-- 空盒子为了进行表格内容布局 -->
                    <div></div>
                    <div :title="item.layerName">
                      <span>{{ item.layerName }}</span>
                    </div>
                    <!-- 空盒子为了进行表格内容布局 -->
                    <div></div>
                    <div></div>
                    <div>
                      <input type="checkbox" v-model="item.isExport" @change="checkboxOne(items, $event, item)" />
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </el-scrollbar>
      <div class="layer-grid-footer">
        <div class="format-select-container">
          <div class="format-select-label">{{ $t('FORMAT') }}:</div>
          <div class="format-select-combobox">
            <Combobox class="form-control" name="cableType" v-model="exportParam.format" :setting="fileTypeSetting" dataRule="required"></Combobox>
          </div>
        </div>
        <button type="button" class="btn btn-primary" @click="exportClick">{{ $t('EXPORT') }}</button>
      </div>
    </div>
    <div>
      <div class="design-export-title">{{ $t('DESIGN_EXPORT_BOM_EXPORT') }}</div>
      <div class="design-export-bom-cad-container">
        <div class="design-export-notice">{{ $t('DESIGN_EXPORT_BOM_TIPS') }}</div>
        <button type="button" class="btn btn-primary" @click="exportBomClickHld">{{ $t('DESIGN_EXPORT_HLD_BOM') }}</button>
        <!-- <button type="button" class="btn btn-primary" @click="exportBomClick">{{$t('DESIGN_EXPORT_PREVIEW_BOM')}}</button> -->
      </div>
    </div>
    <!-- <div>
      <div class="design-export-title">{{ $t('DESIGN_EXPORT_CAD_EXPORT') }}</div>
      <div class="design-export-bom-cad-container">
        <div class="design-export-notice">{{ $t('DESIGN_EXPORT_CAD_TIPS') }}</div>
        <button type="button" class="btn btn-primary" @click="exportCADClick">{{ $t('DESIGN_EXPORT_PREVIEW_CAD') }}</button>
      </div>
    </div> -->
    <!-- <div>
      <div class="design-export-title"> {{$t('DESIGN_EXPORT_CONN_EXPORT')}}</div>
      <div class="design-export-bom-cad-container">
        <div class="design-export-notice"> {{$t('DESIGN_EXPORT_CONN_TIPS')}}</div>
        <button type="button" class="btn btn-primary" @click="exportConnInfoClick">{{ $t('EXPORT') }}</button>
      </div>
    </div>
    <BOM ref="bom"></BOM> -->
    <HLDBom ref="HLDBom"></HLDBom>
    <!-- </el-scrollbar> -->
  </div>
</template>

<script>
import { Filter } from 'map'; // transferProjection, SupportSpatialReferences,
import BOM from './bom/Bom.vue';
import HLDBom from './bom/HLDBom.vue';

export default {
  name: 'DesignExport',
  inject: ['getMapBox', 'getResourceList', 'getSurfaceLayerList', 'getProjectInfo', 'getHldEl'],
  components: {
    BOM,
    HLDBom,
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    resourceList() {
      const resourceList = this.getResourceList(); // 资源图层
      const surfaceLayerList = this.getSurfaceLayerList(); // 地貌图层
      return resourceList.concat(surfaceLayerList);
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    disabledExtentButtonGroup() {
      return !(this.modeBtnActiveStr === this.$t('DESIGN_EXPORT_MANUALLY_VIEW'));
    },
    hldEl() {
      return this.getHldEl();
    },
  },
  data() {
    return {
      modeBtnActiveStr: this.$t('DESIGN_EXPORT_CURRENT_VIEW'),
      manuallyObj: {
        width: '140px', // 宽
        height: '30px', // 高
      },
      allObj: {
        width: '60px', // 宽
        height: '30px', // 高
      },
      autoObj: {
        width: '140px', // 宽
        height: '30px', // 高
      },
      gridData: [],
      exportMapBox: undefined,
      mapExtent: {
        xMin: '0',
        yMin: '0',
        xMax: '0',
        yMax: '0',
      },
      exportParam: {
        schemaId: '',
        format: 'kml',
        layers: [],
        rings: [],
      },
      fileTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Keyhole Markup Language', value: 'kml' },
          { name: 'Keyhole Markup Zip', value: 'kmz' },
          { name: 'Shape', value: 'shape' },
        ],
        value: 'kml',
      },
      // isInit: false, //是否初始化完成
    };
  },
  created() {},
  mounted() {
    this.getMapApp();
    this.getGridData();
  },
  methods: {
    getMapApp() {
      // this.exportMapBox = new this.$map.MapContainer('edesign', this.$refs.exportMap);
      // this.exportMapBox.init({ mapNo: this.projectInfo.mapNo }).then(() => {
      //   this.exportMapBox.refresh();
      //   this.exportMapBox.removeDragPan();
      //   let currZoom = this.mapBox.map.getZoom();
      //   this.exportMapBox.map.setZoom(currZoom);
      const currExtend = this.mapBox.map.getExtent();
      // this.exportMapBox.map.setExtent(currExtend);
      this.setMapExtent(currExtend);
      // this.loadLayer();
      this.mapBox.map.addEventListener('moveend', () => {
        const currExtend2 = this.mapBox.map.getExtent();
        this.setMapExtent(currExtend2);
        // this.exportMapBox.map.setExtent(currExtend);
      });
      // this.isInit = true;
      // });
    },
    // loadLayer() {
    //   let layers = this.exportMapBox.getLayers() || [];
    //   let maplayers = this.mapBox.getLayers() || [];
    //   console.log(layers);
    //   console.log(maplayers);
    //   layers.forEach(item => {
    //     maplayers.some(child => {
    //       if (item.id === child.id) {
    //         this.exportMapBox.setVisible(item.id, false);
    //         item.showLabel = child.showLabel;
    //         // Object.assign(item, child);
    //         return true;
    //       }
    //     });
    //   });
    //   this.exportMapBox.refresh();
    // },
    setMapExtent(extent) {
      // const point1 = transferProjection(SupportSpatialReferences.WEB_MERCATOR, SupportSpatialReferences.WGS84, [extent.xmin, extent.ymin]);
      // const point2 = transferProjection(SupportSpatialReferences.WEB_MERCATOR, SupportSpatialReferences.WGS84, [extent.xmax, extent.ymax]);
      this.mapExtent = {
        xMin: extent.xmin,
        yMin: extent.ymin,
        xMax: extent.xmax,
        yMax: extent.ymax,
        // VxMin: point1[0].toFixed(6),
        // VyMin: point1[1].toFixed(6),
        // VxMax: point2[0].toFixed(6),
        // VyMax: point2[1].toFixed(6),
      };
    },
    getGridData() {
      const temp = [];
      this.resourceList.forEach(item => {
        if (item.layerType === 'C') {
          const tempChild = item;
          tempChild.isExport = true;
          temp.push(Object.assign({}, tempChild));
        }
      });

      this.getResourceGroup(temp);
    },
    getResourceGroup(resData) {
      // 数据分组处理
      if (resData.length > 0) {
        const childData = resData.filter(item => item.resGroup === resData[0].resGroup);
        let tapType;
        if (resData[0].resStatus) {
          tapType = 'resource';
        } else {
          tapType = 'surface';
        }
        const gridDataChild = {
          name: resData[0].resGroupI18n, // 组名
          tapType, // 组类型（对应tap切换）
          childData, // 组成员
        };
        gridDataChild.show = false;
        gridDataChild.isExportAll = true;
        gridDataChild.isExportNum = gridDataChild.childData.length;
        this.gridData.push(Object.assign({}, gridDataChild));
        const newResData = resData.filter(item => item.resGroup !== resData[0].resGroup);
        this.getResourceGroup(newResData);
      }
    },
    gridToggle(index) {
      this.gridData[index].show = !this.gridData[index].show;
    },
    exportClick() {
      this.exportParam.schemaId = this.projectInfo.schemaId;
      if (this.modeBtnActiveStr !== this.$t('DESIGN_EXPORT_MANUALLY_VIEW')) {
        this.setExportParam();
      } else {
        this.setExportParamLayers();
      }
      if (this.exportParam.layers.length < 1) {
        fish.toast('warn', this.$t('NO_LAYER_BE_SELECTED'));
        return;
      }

      if (this.exportParam.format === 'shape') {
        if (this.exportParam.layers && this.exportParam.layers.length === 1) {
          this.queryResource();
        } else {
          fish.warn(this.$t('DESIGN_EXPORT_WRAN_1'));
        }
      } else {
        let param = `schemaId=${this.exportParam.schemaId}&layerNos=${this.exportParam.layers}&fileType=${this.exportParam.format}`;
        if (this.modeBtnActiveStr !== 'All') {
          param += `&rings=${this.exportParam.rings}`;
        } else {
          param += '&rings=0,0,0,0,0,0,0,0,0,0';
        }
        // window.location.href = `edesign/kml/export/v1?${param}`;
        const hurl = `edesign/kml/export/v1?${param}`;
        const fileName = `${this.projectInfo.taskName}-${new Date().toLocaleDateString()}.${this.exportParam.format}`;
        const xhr = new XMLHttpRequest();
        xhr.open('get', hurl, true);
        $(this.hldEl).blockUI();
        xhr.responseType = 'blob';
        const that = this;
        xhr.onload = () => {
          if (this.status === 200) {
            const res = this.response;
            const blob = new Blob([res], {
              type: 'application/vnd.google-earth.kml+xml',
            });
            const a = document.createElement('a');
            a.download = fileName;
            a.href = URL.createObjectURL(blob);
            a.click();
            $(a).remove();
          }
          $(that.hldEl).unblockUI();
        };
        xhr.send();
      }
    },
    queryResource() {
      const featureLikeList = [];
      let filter = Filter.equalTo({
        propertyName: 'schemaId',
        expression: this.projectInfo.schemaId,
        matchCase: true,
      });
      let geometry = null;
      if (this.modeBtnActiveStr === this.$t('DESIGN_EXPORT_CURRENT_VIEW')) {
        const rings = this.exportParam.rings || [];
        const curRings = [
          [
            [rings[0], rings[1]],
            [rings[2], rings[3]],
            [rings[4], rings[5]],
            [rings[6], rings[7]],
            [rings[8], rings[9]],
          ],
        ];
        geometry = this.mapBox.createPolygonGeometry(curRings);
      } else if (this.modeBtnActiveStr === this.$t('DESIGN_EXPORT_MANUALLY_VIEW')) {
        const rings = this.exportParam.rings || [];
        geometry = this.mapBox.createPolygonGeometry([rings]);
      }
      if (geometry) {
        filter = Filter.and(
          filter,
          Filter.intersects({
            geometry,
            geometryName: 'geom',
            spatialReference: this.mapBox.spatialReference,
          }),
        );
      }
      this.exportParam.layers.forEach(res => {
        featureLikeList.push({
          layerNo: res,
          filter,
          returnGeometry: true,
        });
      });
      this.$map.getByFeatureLayers(featureLikeList).then(data => {
        if (data && data.length > 0) {
          // fish.post({
          //     url: 'gis-plat/open-api/file-processing/create-shapefile',
          //     data: data,
          // });
          const fileName = `${this.exportParam.layers[0]}.zip`;
          const xhr = new XMLHttpRequest();
          xhr.open('post', 'gis-plat/open-api/file-processing/create-shapefile', true);
          $(this.hldEl).blockUI();
          xhr.responseType = 'blob';
          xhr.setRequestHeader('Content-type', 'application/json');
          const that = this;
          xhr.onload = () => {
            if (this.status === 200) {
              const res = this.response;
              const blob = new Blob([res], {
                type: 'application/zip',
              });
              const a = document.createElement('a');
              a.download = fileName;
              a.href = URL.createObjectURL(blob);
              a.click();
              $(a).remove();
            } else {
              fish.warn(this.$t('DESIGN_EXPORT_WRAN_2'));
            }
            $(that.hldEl).unblockUI();
          };
          xhr.send(JSON.stringify(data));
        }
      });
    },
    exportBomClick() {
      this.$refs.bom.initData();
    },
    exportBomClickHld() {
      this.$refs.HLDBom.initData();
    },
    exportCADClick() {
      alert('export cad');
    },
    exportConnInfoClick() {
      const hurl = `edesign/Connection/excel/export/v1?schemaId=${this.projectInfo.schemaId}`;
      const fileName = `${this.projectInfo.name || this.projectInfo.title}-${new Date().toLocaleDateString()}.xls`;
      const xhr = new XMLHttpRequest();
      xhr.open('get', hurl, true);
      $(this.hldEl).blockUI();
      xhr.responseType = 'blob';
      const that = this;
      xhr.onload = () => {
        if (this.status === 200) {
          const res = this.response;
          const blob = new Blob([res], {
            type: 'application/vnd.ms-excel',
          });
          const a = document.createElement('a');
          a.download = fileName;
          a.href = URL.createObjectURL(blob);
          a.click();
          $(a).remove();
        }
        $(that.hldEl).unblockUI();
      };
      xhr.send();
    },
    // 进入中
    enter(el) {
      el.style.height = 'auto';
      const endHeight = window.getComputedStyle(el).height;
      el.style.height = '0px';
      el.offsetHeight; // force repaint
      el.style.height = endHeight;
    },

    // 离开时
    leave(el) {
      el.style.height = '0px';
    },
    checkboxOne(items, e, item) {
      item.isExport = e.target.checked;
      if (e.target.checked) {
        items.isExportNum += 1;
      } else {
        items.isExportNum -= 1;
      }
      items.isExportAll = items.childData.length === items.isExportNum;
    },
    checkboxAll(items, e) {
      items.isExportAll = e.target.checked;
      if (items.isExportAll) {
        items.isExportNum = items.childData.length;
        items.childData.forEach(item => {
          item.isExport = true;
        });
      } else {
        items.isExportNum = 0;
        items.childData.forEach(item => {
          item.isExport = false;
        });
      }
    },
    setExportParam(geometry) {
      this.setExportParamLayers();
      if (geometry) {
        this.exportParam.rings = geometry.getRings();
      } else {
        this.exportParam.rings = [];
        this.exportParam.rings.push(this.mapExtent.xMin);
        this.exportParam.rings.push(this.mapExtent.yMin);
        this.exportParam.rings.push(this.mapExtent.xMin);
        this.exportParam.rings.push(this.mapExtent.yMax);
        this.exportParam.rings.push(this.mapExtent.xMax);
        this.exportParam.rings.push(this.mapExtent.yMax);
        this.exportParam.rings.push(this.mapExtent.xMax);
        this.exportParam.rings.push(this.mapExtent.yMin);
        this.exportParam.rings.push(this.mapExtent.xMin);
        this.exportParam.rings.push(this.mapExtent.yMin);
      }
    },
    setExportParamLayers() {
      const layerNoS = [];
      this.gridData.forEach(gridDataChild => {
        gridDataChild.childData.forEach(item => {
          if (item.isExport) {
            layerNoS.push(item.layerNo);
          }
        });
      });
      this.exportParam.layers = layerNoS;
    },
    laberChange(laberName) {
      switch (laberName) {
        case this.$t('DESIGN_EXPORT_MANUALLY_VIEW'):
          break;
        case this.$t('ALL'):
          this.setExportParam();
          this.exportParam.rings = [];
          break;
        case this.$t('DESIGN_EXPORT_CURRENT_VIEW'):
          this.setExportParam();
          break;
        default:
          break;
      }
    },
  },
  // activated() {
  //   if (this.isInit) {
  //     this.loadLayer();
  //   }
  // },
  watch: {},
};
</script>

<style lang="scss" scoped>
@import 'designExport';
</style>
