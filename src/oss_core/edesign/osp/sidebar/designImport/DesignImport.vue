<template>
  <div class="design-import-container sidebar-body">
    <div class="design-import-type">
      <div class="type-title">{{ $t('DESIGN_IMPORT_TYPE') }}:</div>
      <combobox class="import-type-combobox" v-model="importType" :setting="importTypeSetting" @change="changeImportType"></combobox>
    </div>

    <GeoJsonImport v-if=" importType==='UK' "></GeoJsonImport>
    <div v-else>
      <div class="file-upload-container">
        <div class="file-upload-container-title sidebar-tab-title">{{ $t('FILE_UPLOAD') }}</div>
        <div class="file-upload-container-body">
          <!-- <div class="file-upload-container-body-item-1">
                    <span>{{ $t('FILE_TYPE') }}</span>
                </div>
                <div class="file-upload-container-body-item-2">
                    <Combobox class="form-control" name="cableType" v-model="fileType" :setting="fileTypeSetting"
                              dataRule="required"></Combobox>
                </div> -->
          <div class="file-upload-container-body-item-3">
            <button type="button" class="btn btn-primary row-btn" @click="uploadBtnClick">
              <i class="icon_osp icon_osptijiao">&nbsp;{{ $t('UPLOAD') }}</i>
            </button>
            <input type="file" @change="uploadFile" accept=".kml,.kmz,.zip" class="upload_input" ref="uploadFile" />
          </div>
        </div>
      </div>
      <div class="content-preview-container">
        <div class="content-preview-container-title sidebar-tab-title">{{ $t('CONTENT_PREVIEW') }}</div>
        <div class="content-preview-container-body">
          <div class="preview-count-container">
            <div>
              <label>{{ $t('TOTAL_COUNT') }}&nbsp;&nbsp;:&nbsp;&nbsp;</label>
              <span>{{ PreviewData.totalCount }}</span>
            </div>
            <div>
              <label>{{ $t('ERROR_COUNT') }}&nbsp;&nbsp;:&nbsp;&nbsp;</label>
              <span> {{ PreviewData.errorCount }}</span>
            </div>
          </div>
          <div class="resource-type-select-container">
            <div class="resource-type-select-container-item-1">
              <span>{{ $t('RESOURCE_TYPE') }}</span>
            </div>
            <div class="resource-type-select-container-item-2">
              <Combobox class="form-control" name="cableType" v-model="resourceType" :setting="resourceTypeSetting" dataRule="required"></Combobox>
            </div>
            <div class="btn-group resource-filter-btn-group">
              <button type="button" class="btn btn-default mode-btn" :style="this.btnActiveName === 'ERROR_BTN' ? activeClass : ''" @click="changShowDataStatus('ERROR')">
                <span>{{$t('STATUS_ERROR')}}</span>
              </button>
              <button type="button" class="btn btn-default mode-btn" :style="this.btnActiveName === 'ALL_BTN' ? activeClass : ''" @click="changShowDataStatus('ALL')">
                <span>{{$t('ALL')}}</span>
              </button>
            </div>
          </div>
          <div class="result-container" v-if="PreviewData.filterShowList.length > 0">
            <div class="result-title">
              <div class="result-title-1">
                {{$t('TYPE')}}
              </div>
              <div class="result-title-2">
                {{$t('DESIGN_CHECK_RESOURCE_NAME')}}
              </div>
              <div class="result-title-3"></div>
              <div class="result-title-4">
                {{$t('DESIGN_IMPORT_STATUS')}}
              </div>
            </div>
            <div class="result-container-list">
              <div class="result-item" v-for="(item, index) in PreviewData.filterShowList" :key="index">
                <div class="result-item-info">
                  <div class="result-item-1">
                    <img class="result-item-img" :src="`oss_core/edesign/assets/image/map/new-layer/${item.resType}.png`" v-if="item.status !== 'error'" />
                    <img class="result-item-img" :src="`oss_core/edesign/assets/image/status/status-${item.status}.png`" v-else />
                  </div>
                  <div class="result-item-2">{{ item.Name }}</div>
                  <div class="result-item-3 icon_osp" :class="item.isBindAZ ? (item.showAZ ? 'icon_ospdown' : 'icon_ospup') : ''" @click="showAZChange(item)"></div>
                  <div class="result-item-4">
                    <popover trigger="hover" placement="left" :content="item.info" popClass="designIm-popover">
                      <div>
                        <img class="result-item-img" :src="`oss_core/edesign/assets/image/status/status-${item.status}.png`" />
                      </div>
                    </popover>
                  </div>
                </div>
                <div class="result-item-azinfo" v-show="item.showAZ">
                  <Tree :fNodes="item.fNodes" :data="dataIcon" :view="view" :check="check" ref="tree" :level='2' @onCheck="onCheck($event,item)"></Tree>
                </div>
              </div>
            </div>
            <!-- <div class="result-container-pagination">
                        <Pagination :pageSize="paginationInfo.pageSize" :total="paginationInfo.resultCount" :pgTotal="false" :pgInput="false" :pageSizes="[]" :pgRecText="false" @page-change="onPageClick"></Pagination>
                    </div> -->
            <div class="resource-import-button" v-if="PreviewData.filterShowList.length > 0">
              <button type="button" class="btn btn-primary" @click="importFile">{{$t('DESIGN_IMPORT_IMPORT')}}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Shpjs from 'shpjs';
import { GeometryType, SupportSpatialReferences } from 'map';
import GeoJsonImport from './geoJsonImport/GeoJsonImport.vue';
import { queryTaskProgress } from '@/oss_core/edesign/api/query/taskId.js';
import { addZip, addKmlFile, addZipFile } from '@/oss_core/edesign/api/add/schema.js';

export default {
  components: { GeoJsonImport },
  name: 'DesignImport',
  inject: ['getProjectInfo', 'getResourceList', 'getMapBox'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    resourceList() {
      return this.getResourceList() || [];
    },
    // acceptFileType() {
    //     return ".".concat(this.fileType);
    // }
  },
  data() {
    return {
      hisList: [],
      stateMap: {
        0: {
          icon: 'icon_ospreloadtime',
          color: 'rgb(255, 193, 0)',
        },
        1: {
          icon: 'icon_ospbujinji',
          color: 'blue',
        },
        2: {
          icon: 'icon_ospcheck-circle1',
          color: 'rgb(38, 178, 81)',
        },
        '-1': {
          icon: 'icon_ospreloadtime1',
          color: 'rgb(244, 20, 20)',
        },
      },
      check: {
        enable: true,
        chkStyle: 'radio',
      },
      view: {
        showIcon: this.showIconForTree,
        showLine: true,
      },
      dataIcon: {
        key: {
          iconFontEnable: false,
        },
        simpleData: {
          enable: true,
        },
      },
      paginationInfo: {
        resultCount: 10, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10, // 每页数量
      },
      schemaId: '',
      haveDataList: {}, // 获取过的数据存入
      fileType: 'kml',
      fileTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Keyhole Markup Language', value: 'kml' },
          { name: 'Keyhole Markup Zip', value: 'kmz' },
        ],
        value: 'kml',
      },
      resourceType: 'ALL',
      resourceTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'RES_TYPE_DESC',
        dataValueField: 'RES_TYPE_ID',
        dataSource: [
          {
            RES_TYPE_ID: 'ALL',
            RES_TYPE_DESC: this.$t('ALL'),
            LAYER_NO: 'ALL',
            LAYER_NAME: this.$t('ALL'),
            RES_GROUP: 'ALL',
          },
          {
            RES_TYPE_ID: 'SITE',
            RES_TYPE_DESC: 'Site',
            LAYER_NO: 'SITE-C',
            LAYER_NAME: 'Site',
            RES_GROUP: 'Location',
          },
          {
            RES_TYPE_ID: 'ODF',
            RES_TYPE_DESC: 'ODF',
            LAYER_NO: 'ODF-C',
            LAYER_NAME: 'ODF',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'OCC',
            RES_TYPE_DESC: 'OCC',
            LAYER_NO: 'OCC-C',
            LAYER_NAME: 'OCC',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'ODB',
            RES_TYPE_DESC: 'ODP',
            LAYER_NO: 'ODB-C',
            LAYER_NAME: 'ODP',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'F_CLOSURE',
            RES_TYPE_DESC: 'Fiber Closure',
            LAYER_NO: 'F_CLOSURE-C',
            LAYER_NAME: 'Fiber Closure',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'SPLITTER',
            RES_TYPE_DESC: 'Splitter',
            LAYER_NO: 'SPLITTER-C',
            LAYER_NAME: 'Splitter',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'F_CABLE',
            RES_TYPE_DESC: 'Fiber',
            LAYER_NO: 'F_CABLE-C',
            LAYER_NAME: 'Fiber',
            RES_GROUP: 'Fiber Network',
          },
          {
            RES_TYPE_ID: 'OLT',
            RES_TYPE_DESC: 'OLT',
            LAYER_NO: 'OLT-C',
            LAYER_NAME: 'OLT',
            RES_GROUP: 'PON Network',
          },
          {
            RES_TYPE_ID: 'ONU',
            RES_TYPE_DESC: 'Optical Network Unit',
            LAYER_NO: 'ONU-C',
            LAYER_NAME: 'Optical Network Unit',
            RES_GROUP: 'PON Network',
          },
          {
            RES_TYPE_ID: 'MDF',
            RES_TYPE_DESC: 'MDF',
            LAYER_NO: 'MDF-C',
            LAYER_NAME: 'MDF',
            RES_GROUP: 'Copper Network',
          },
          {
            RES_TYPE_ID: 'DB',
            RES_TYPE_DESC: 'Distribution Box',
            LAYER_NO: 'DB-C',
            LAYER_NAME: 'Distribution Box',
            RES_GROUP: 'Copper Network',
          },
          {
            RES_TYPE_ID: 'CC',
            RES_TYPE_DESC: 'Cabinet',
            LAYER_NO: 'CC-C',
            LAYER_NAME: 'Cabinet',
            RES_GROUP: 'Copper Network',
          },
          {
            RES_TYPE_ID: 'C_CABLE',
            RES_TYPE_DESC: 'Copper',
            LAYER_NO: 'C_CABLE-C',
            LAYER_NAME: 'Copper',
            RES_GROUP: 'Copper Network',
          },
          {
            RES_TYPE_ID: 'MANHOLE',
            RES_TYPE_DESC: 'Manhole',
            LAYER_NO: 'MANHOLE-C',
            LAYER_NAME: 'Manhole',
            RES_GROUP: 'Pipeline Network',
          },
          {
            RES_TYPE_ID: 'POLE',
            RES_TYPE_DESC: 'Pole',
            LAYER_NO: 'POLE-C',
            LAYER_NAME: 'Pole',
            RES_GROUP: 'Pipeline Network',
          },
          {
            RES_TYPE_ID: 'PIPELINE_G',
            RES_TYPE_DESC: 'Pipeline',
            LAYER_NO: 'PIPELINE_G-C',
            LAYER_NAME: 'Pipeline',
            RES_GROUP: 'Pipeline Network',
          },
          {
            RES_TYPE_ID: 'AIR_WIRE',
            RES_TYPE_DESC: 'Air Wire',
            LAYER_NO: 'AIR_WIRE-C',
            LAYER_NAME: 'Air Wire',
            RES_GROUP: 'Pipeline Network',
          },
          {
            RES_TYPE_ID: 'OLT_GRID',
            RES_TYPE_DESC: 'OLT Grid',
            LAYER_NO: 'OLT_GRID-C',
            LAYER_NAME: 'OLT Grid',
            RES_GROUP: 'Grid',
          },
          {
            RES_TYPE_ID: 'OCC_GRID',
            RES_TYPE_DESC: 'OCC Grid',
            LAYER_NO: 'OCC_GRID-C',
            LAYER_NAME: 'OCC Grid',
            RES_GROUP: 'Grid',
          },
          {
            RES_TYPE_ID: 'ODB_GRID',
            RES_TYPE_DESC: 'ODB Grid',
            LAYER_NO: 'ODB_GRID-C',
            LAYER_NAME: 'ODB Grid',
            RES_GROUP: 'Grid',
          },
          {
            RES_TYPE_ID: 'CLOSURE',
            RES_TYPE_DESC: 'Closure',
            LAYER_NO: 'CLOSURE-C',
            LAYER_NAME: 'Closure',
            RES_GROUP: 'Copper Network',
          },
        ],
        value: 'ALL',
      },
      PreviewData: {
        totalCount: 0,
        errorCount: 0,
        correctCount: 0,
        showList: [],
        filterShowList: [],
        allShowList: [],
      },
      analysisData: null,
      btnActiveName: 'ALL_BTN',
      activeClass: 'background-color:#4477ee;color:white',
      curFileType: '',
      importTypeSetting: {
        dataTextField: 'Name',
        dataValueField: 'Value',
        dataSource: [
          {
            Name: 'UK Geojson Package',
            Value: 'UK',
          },
          {
            Name: 'KML',
            Value: 'KML',
          },
        ],
        value: 'UK',
      },
      importType: 'UK',
    };
  },
  mounted() {
    this.schemaId = this.projectInfo.schemaId;
    // this.searchHisList();
  },
  deactivated() {
    //  组件关闭时进行销毁重置
    this.$destroy();
  },
  watch: {
    resourceType(val) {
      if (val === 'ALL') {
        this.setPreviewDataShowList();
      } else {
        this.setPreviewDataShowList(val);
      }
    },
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD');
    },
    formatTime2(time) {
      return moment(time).format('HH:mm:ss');
    },
    // searchHisList() {
    //   queryTaskProgress(this.projectInfo.schemaId, 'Design Import').then(res => {
    //     let isjixu = false;
    //     (res.resultData || []).map(it => {
    //       if (it.operationTraceEntityList && it.operationTraceEntityList.length) {
    //         let isEnd = it.operationTraceEntityList.find(item => item.traceStatus !== '2' && item.traceStatus !== '-1');
    //         if (isEnd) {
    //           //找到没处理完成的，需要继续查询
    //           isjixu = true;
    //         }
    //       } else {
    //         isjixu = true;
    //       }
    //     });
    //     this.hisList = res.resultData || [];
    //     if (isjixu) {
    //       setTimeout(() => {
    //         this.searchHisList();
    //       }, 10000);
    //     }
    //   });
    // },
    changeImportType() {
      console.log(this.importType);
    },
    // uploadBtnClickZip() {
    //   this.$refs.uploadZip.click();
    // },
    // uploadZip() {
    //   console.log(this.projectInfo);
    //   let uploadFormData = new FormData();
    //   let file = this.$refs.uploadZip.files[0];
    //   this.$refs.uploadZip.value = '';
    //   this.$refs.fileLoactionName.value = file.name;
    //   uploadFormData.append('file', file);
    //   uploadFormData.append('projectId', this.projectInfo.sprintId);
    //   uploadFormData.append('taskId', this.projectInfo.schemaId);
    //   console.log(uploadFormData);
    //   addZip(uploadFormData).then(res => {
    //     console.log(res);
    //     this.searchHisList();
    //   });
    // },
    uploadBtnClick() {
      this.$refs.uploadFile.click();
    },
    uploadFile() {
      let uploadFormData = new FormData();
      let file = this.$refs.uploadFile.files[0];
      this.$refs.uploadFile.value = '';

      // shpjs也可以直接解析shape文件
      const reader = new FileReader();
      const fileData = file;
      reader.readAsArrayBuffer(fileData);
      reader.onload = function (e) {
        Shpjs(this.result)
          .then(function (data) {
            console.log(data);
          })
          .catch(function () {
            console.log('load shape file error');
          });
      };

      let fileType = file.name.split('.')[file.name.split('.').length - 1];
      this.curFileType = fileType;
      if (['kml', 'kmz', 'zip'].indexOf(fileType) === -1) {
        fish.toast('warn', 'Invalid file type!');
        return;
      }

      if (['kml', 'kmz'].indexOf(fileType) > -1) {
        uploadFormData.append('file', file, file.name);
        uploadFormData.append('fileType', fileType);
        uploadFormData.append('schemaId', this.schemaId);
        addKmlFile(uploadFormData).then(result => {
          this.PreviewData.totalCount = 0;
          this.PreviewData.errorCount = 0;
          this.PreviewData.correctCount = 0;
          this.analysisData = result;
          this.changShowDataStatus('ALL');
          this.PreviewData.correctCount = this.calCount(result.importData);
          this.PreviewData.errorCount = result.errorData.length > 0 ? Object.keys(result.errorData[0]).length : 0;
          this.PreviewData.totalCount = this.PreviewData.correctCount + this.PreviewData.errorCount;
          this.setPreviewDataShowList();
          this.initBindCheck();
        });
      } else if (['zip'].indexOf(fileType) > -1) {
        uploadFormData.append('file', file);
        addZipFile(uploadFormData).then(result => {
          result = result || [];
          let pointList = result.filter(res => res.geometry.geometryType === GeometryType.POINT);
          let lineList = result.filter(res => res.geometry.geometryType === GeometryType.POLYLINE);
          let resultDTO = {
            errorData: {
              0: {},
            },
            importData: {
              AREA_LIST: [],
              LINE_LIST: lineList,
              POINT_LIST: pointList,
            },
            schemaId: this.projectInfo.schemaId,
          };

          this.PreviewData.totalCount = 0;
          this.PreviewData.errorCount = 0;
          this.PreviewData.correctCount = 0;
          this.analysisData = Object.assign({}, resultDTO);
          this.changShowDataStatus('ALL');
          this.PreviewData.correctCount = this.calCount(this.analysisData.importData);
          this.PreviewData.errorCount = Object.keys(this.analysisData.errorData[0]).length;
          this.PreviewData.totalCount = this.PreviewData.correctCount + this.PreviewData.errorCount;
          this.setPreviewDataShowList();
          this.initBindCheck();
        });
      }
    },

    // onPageClick(page) {
    //     this.PreviewData.showList = [];
    //     for (
    //         let i = (page - 1) * this.paginationInfo.pageSize;
    //         i < Math.min(page * this.paginationInfo.pageSize, this.PreviewData.filterShowList.length);
    //         i++
    //     ) {
    //         this.PreviewData.showList.push(this.PreviewData.filterShowList[i]);
    //     }
    //     this.paginationInfo.currentPage = page;
    // },
    importFile() {
      if (this.curFileType === 'zip') {
        let resList = this.analysisData.importData.LINE_LIST.concat(this.analysisData.importData.POINT_LIST);
        $.blockUI({ message: `Importing file for ${resList.length} data...` }); // loading
        this.insertShapeFileData(resList, () => {
          fish.toast('success', 'Import successfully!');
          this.mapBox.refresh();
        });
      } else {
        fish.ajax({
          url: 'edesign/kml/import/v1',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(this.analysisData),
          success: data => {
            console.log(data);
            console.log(this.analysisData);
            this.mapBox.refresh();
            fish.toast('success', 'Import Successfully.');
          },
        });
      }
    },
    insertShapeFileData(resourceList, callBack) {
      let graphicList = [];
      resourceList.forEach(singleRes => {
        let attr = Object.assign({}, singleRes.attributes);
        delete attr.objectid;
        delete attr.gisKey;
        attr.sprintId = this.projectInfo.sprintId;
        if (this.projectInfo.markFlag !== 'sprint') {
          attr.schemaId = this.projectInfo.schemaId;
        }
        let obj = {
          layerNo: singleRes.layerNo,
          geometry: this.createGeometry(singleRes.geometry),
          attributes: attr,
        };
        graphicList.push(obj);
      });
      this.$map.batchAddGeometry(graphicList).then(
        () => {
          $.unblockUI();
          callBack();
        },
        error => {
          fish.warn('Import file failed.');
          $.unblockUI();
        }
      );
    },

    createGeometry(geometry) {
      let validGeo = null;
      if (geometry.geometryType === GeometryType.POINT) {
        validGeo = this.mapBox.createPointFromCurrentCoord(
          [geometry.x, geometry.y],
          SupportSpatialReferences.getSpatialReference(geometry.spatialReference.wkid)
        );
      } else if (geometry.geometryType === GeometryType.POLYLINE) {
        let lineGeo = this.mapBox.createLineGeometry(geometry.paths);
        if (geometry.spatialReference.wkid !== this.mapBox.spatialReference.wkid) {
          lineGeo = lineGeo.clone().transferProjection(this.mapBox.spatialReference);
        }
        validGeo = lineGeo;
      }
      return validGeo;
    },
    setPreviewDataShowList(resType) {
      this.PreviewData.filterShowList = [];
      if (resType) {
        this.PreviewData.allShowList.forEach(item => {
          if (item.resType === resType) {
            Vue.set(item, 'showAZ', false);
            if (item.resType === 'F_CABLE' || item.resType === 'C_CABLE' || item.resType === 'AIR_WIRE' || item.resType === 'PIPELINE_G') {
              Vue.set(item, 'isBindAZ', true);
            } else {
              Vue.set(item, 'isBindAZ', false);
            }
            this.PreviewData.filterShowList.push(item);
          }
        });
      } else {
        this.PreviewData.allShowList.forEach(item => {
          Vue.set(item, 'showAZ', false);
          if (item.resType === 'F_CABLE' || item.resType === 'C_CABLE' || item.resType === 'AIR_WIRE' || item.resType === 'PIPELINE_G') {
            Vue.set(item, 'isBindAZ', true);
          } else {
            Vue.set(item, 'isBindAZ', false);
          }
          this.PreviewData.filterShowList.push(item);
        });
      }
      this.paginationInfo.resultCount = this.PreviewData.filterShowList.length;
      // this.onPageClick(1);
    },
    changShowDataStatus(status) {
      this.PreviewData.allShowList = [];
      if (status === 'ALL') {
        this.btnActiveName = 'ALL_BTN';
        if (this.analysisData && this.analysisData.importData) {
          let tempImportDataList = this.integrationList(this.analysisData.importData);
          tempImportDataList.forEach(item => {
            // this.PreviewData.allShowList.push(item);
            let childA = [];
            if (item.attributes['A Bind Point']) {
              for (let i = 0; i < item.attributes['A Bind Point'].length; i++) {
                childA.push({
                  name: item.attributes['A Bind Point'][i].attributes['Full Name'],
                  icon: `oss_core/edesign/assets/image/map/new-layer/${item.attributes['A Bind Point'][i].attributes.resType}.png`,
                  checked: i === 0 ? true : false,
                });
              }
            }
            let childZ = [];
            if (item.attributes['Z Bind Point']) {
              for (let i = 0; i < item.attributes['Z Bind Point'].length; i++) {
                childZ.push({
                  name: item.attributes['Z Bind Point'][i].attributes['Full Name'],
                  icon: `oss_core/edesign/assets/image/map/new-layer/${item.attributes['Z Bind Point'][i].attributes.resType}.png`,
                  checked: i === 0 ? true : false,
                });
              }
            }
            let parent = [
              {
                name: 'A Bind Point',
                isParent: true,
                children: childA,
                open: true,
                nocheck: true,
              },
              {
                name: 'Z Bind Point',
                isParent: true,
                children: childZ,
                open: true,
                nocheck: true,
              },
            ];
            let tempItem = {
              resType: item.attributes.resType || item.layerNo,
              Name: item.attributes.Name || item.attributes.resName,
              fNodes: parent,
              info: item.attributes.warnMsg
                ? `Property(${item.warnMsg || item.attributes.warnMsg}) can not be imported and will be ignored!`
                : 'success',
              status: item.attributes.warnMsg ? 'warning' : 'right',
            };
            this.PreviewData.allShowList.push(tempItem);
          });
        }
        if (this.analysisData && this.analysisData.errorData > 0) {
          Object.keys(this.analysisData.errorData[0]).forEach(key => {
            let tempItem = {
              Name: key,
              info: `Property(${this.analysisData.errorData[0][key]}) can not be found!`,
              status: 'error',
            };
            this.PreviewData.allShowList.push(tempItem);
          });
        }
      } else if (status === 'ERROR') {
        this.btnActiveName = 'ERROR_BTN';
        if (this.analysisData && this.analysisData.errorData.length > 0) {
          Object.keys(this.analysisData.errorData[0]).forEach(key => {
            let tempItem = {
              Name: key,
              info: `Property(${this.analysisData.errorData[0][key]}) can not be found!`,
              status: 'error',
            };
            this.PreviewData.allShowList.push(tempItem);
          });
        }
      }
      this.setPreviewDataShowList(this.resourceType !== 'ALL' ? this.resourceType : '');
    },
    calCount(param) {
      return this.integrationList(param).length;
    },
    integrationList(param) {
      let result = [];
      Object.values(param).forEach(value => {
        for (let i = 0; i < value.length; i++) {
          result.push(value[i]);
        }
      });
      return result;
    },
    showAZChange(item) {
      item.showAZ = !item.showAZ;
    },
    showIconForTree(treeNode) {
      return !treeNode.isParent;
    },
    onCheck(checkNodes, item) {
      this.analysisData.importData.LINE_LIST.forEach(lineItem => {
        if (lineItem.attributes.Name === item.Name) {
          if (checkNodes.length === 2) {
            this.setBindCheck(lineItem, 'A Bind Point', checkNodes[0].name);
            this.setBindCheck(lineItem, 'Z Bind Point', checkNodes[1].name);
          } else if (checkNodes.length === 1) {
            if (checkNodes[0].getParentNode().name === 'A Bind Point') {
              this.setBindCheck(lineItem, 'A Bind Point', checkNodes[0].name);
              lineItem.attributes['Z Bind Point'] = [];
            } else {
              this.setBindCheck(lineItem, 'Z Bind Point', checkNodes[0].name);
              lineItem.attributes['A Bind Point'] = [];
            }
          } else {
            lineItem.attributes['A Bind Point'] = [];
            lineItem.attributes['Z Bind Point'] = [];
          }
        }
      });
    },
    setBindCheck(lineItem, typePoint, checkName) {
      this.analysisData.importData.POINT_LIST.forEach(pointItem => {
        if (pointItem.attributes.Name === checkName) {
          lineItem.attributes[typePoint] = [pointItem];
        }
      });
    },
    initBindCheck() {
      this.analysisData.importData.LINE_LIST.forEach(lineItem => {
        this.PreviewData.allShowList.forEach(item => {
          if (item.isBindAZ) {
            if (item.fNodes[0].children.length === 0) {
              lineItem.attributes['A Bind Point'] = [];
            } else {
              item.fNodes[0].children.forEach(itemA => {
                if (itemA.checked) {
                  if (lineItem.attributes.Name === item.Name) {
                    this.setBindCheck(lineItem, 'A Bind Point', itemA.name);
                  }
                } else {
                  lineItem.attributes['A Bind Point'] = [];
                }
              });
            }
            if (item.fNodes[1].children.length === 0) {
              lineItem.attributes['Z Bind Point'] = [];
            } else {
              item.fNodes[1].children.forEach(itemZ => {
                if (itemZ.checked) {
                  if (lineItem.attributes.Name === item.Name) {
                    this.setBindCheck(lineItem, 'Z Bind Point', itemZ.name);
                  }
                } else {
                  lineItem.attributes['Z Bind Point'] = [];
                }
              });
            }
          }
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './designImport.scss';
</style>
