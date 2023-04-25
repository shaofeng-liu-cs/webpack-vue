<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-08-26 09:17:53
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description:
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\designCheck\DesignCheck.vue
-->
<template>
    <div class="reference-container sidebar-body">
        <div class="mode-btn">
            <button type="button" class="btn" :class="modeFlag === 'new' ? 'btn-primary' : 'btn-default'" @click="changeMode('new')">
                {{$t('BATCH_REFER_NEW_REFER')}}
            </button>
            <button type="button" class="btn" :class="modeFlag === 'old' ? 'btn-primary' : 'btn-default'" @click="changeMode('old')">
                {{$t('BATCH_REFER_REFERENCED')}}
            </button>
        </div>
        <!-- <hr class="gray-line" /> -->
        <div class="select-title sidebar-tab-title" v-show="modeFlag === 'new'">{{$t('BATCH_REFER_SELECT_RESOURCES')}}</div>
        <!-- <hr class="gray-line" v-show="modeFlag === 'new'" /> -->
        <div class="select-mode" v-show="modeFlag === 'new'">
            <keep-alive>
                <DrawPolygon2Map :disabled="selectDisabled" @afterDrawPolygon="afterDrawPolygon" ref="DrawPolygon2Map"></DrawPolygon2Map>
            </keep-alive>
        </div>
        <div class="grid-div" v-show="modeFlag === 'new'">
            <Grid :data="gridData" :option="gridOpt" ref="gridRef" id="batchRefGridID" @onSelectRow="onSelectRow">
                <grid-column label="" prop="gisKey" :hidden="true" :keyFlag="true"></grid-column>
                <grid-column :label="$t('BATCH_REFER_RESOURCE_TYPE')" width="150" prop="resTypeDesc"></grid-column>
                <grid-column :label="$t('NAME')" prop="resName" width="100"></grid-column>
                <grid-column :label="$t('BATCH_REFER_RESOURCE_STATUS')" prop="statusDesc" width="100"></grid-column>
            </Grid>
        </div>
        <div class="grid-div" v-show="modeFlag === 'old'">
            <Grid :data="gridDataOld" :option="gridOpt" ref="gridRefOld" id="batchRefGridIDOld" @onSelectRow="onSelectRow">
                <grid-column label="" prop="gisKey" :hidden="true" :keyFlag="true"></grid-column>
                <grid-column :label="$t('BATCH_REFER_RESOURCE_TYPE')" width="150" prop="resTypeDesc"></grid-column>
                <grid-column :label="$t('NAME')" prop="resName" width="100"></grid-column>
                <grid-column :label="$t('BATCH_REFER_RESOURCE_FROM')" prop="refSchemaIdDesc" width="100"></grid-column>
            </Grid>
        </div>
        <div class="ok-btn ">
            <button type="button" class="btn btn-primary row-btn" @click="OKEvent">{{ OKLabel }}</button>
        </div>
    </div>
</template>

<script>
import { queryPolicyData, savePolicyData, checkPolicyData, addReference, getAllSchema, deleteReference } from '../../map-control/map-control-api';
import * as EDNColor from '@/oss_core/base/map-style/default-styles.js'; // 画图样式
import { nearestAccessPoint, CoordTransfer, Color, SimpleLineSymbol, SimpleMarkerSymbol, SupportSpatialReferences, GeometryType, Filter } from 'map';
export default {
  name: 'BatchReference',
  inject: ['getProjectInfo', 'getMapBox', 'getControlData', 'getHldEl', 'getResourceList', 'getOtherDesignList'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    controlData() {
      return this.getControlData();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    hldEl() {
      return this.getHldEl();
    },
    resourceList() {
      return this.getResourceList();
    },
    otherDesignList() {
      return this.getOtherDesignList();
    },
    // allSchemaList() {
    //     return this.getAllSchemaList();
    // },
  },
  components: {},
  data() {
    return {
      gridData: [],
      gridDataOld: [],
      gridOpt: {
        // 321px
        // height: 'auto',
        // minHeight: 'calc(100%)',
        // maxHeight: '621px',
        width: '340',
        datatype: 'json',
        pager: true,
        rowNum: 20,
        pgbuttons: true,
        pgnumbers: false,
        // pginput:false,
        // viewtotal:false,
        viewrecords: false,
        multiselect: true,
        // multiselectWidth: '30',
        pageData: this.getGridData,
        // reloadGrid:function(){
        //     console.log("reloadGrid---->");
        // },
        // autoPaged: true, // 为true可以省略$('#batchRefGridID').grid('reloadData', this.getPerData(1, this.rowNum));启动pageData函数
        preserveSelection: true,
        altRows: true,
      },
      selectDisabled: false,
      OKLabel: this.$t('OK'),
      totalRecords: 0,
      totalRecordsOld: 0,
      curGeometry: undefined,
      allGridData: [],
      allGridDataOld: [],
      curPage: 1,
      curPageOld: 1,
      temLayer: undefined,
      modeFlag: 'new',
    };
  },

  created() {},
  mounted() {
    // $('#batchRefGridID').grid('reloadData', this.getPerData(1, this.rowNum));

    this.mapBox.addTempLayer('batchRef');
    this.temLayer = this.mapBox._tempLayerList.get('batchRef');
  },
  methods: {
    changeMode(flag) {
      if (flag === this.modeFlag) return;
      this.modeFlag = flag;
      this.OKLabel = this.$t('OK');
      if (this.$refs.DrawPolygon2Map) {
        this.$refs.DrawPolygon2Map.restartDrawAction();
      }
      if (flag === 'old') {
        if (this.temLayer) {
          this.temLayer.clear();
        }
        this.mapBox.clear(); // 可以屏蔽掉绘画动作
        this.allGridDataOld = [];
        this.OKLabel = this.$t('BATCH_REFER_CANCEL_REFERENCE_BTN');
        this.getIdentifyDataByPage(1, 'old');
      }
    },
    getGridData(page, rowNum, sortname, sortorder) {
      _.delay(() => {
        this.getIdentifyDataByPage(page, this.modeFlag);
      }, 100);
      return false;
    },
    createFilter(modeFlag) {
      return new Promise((resolve, reject) => {
        let filterObj = {};
        let hasResIdFilter = Filter.notEqualTo({ propertyName: 'resId', expression: '', matchCase: true });
        let featureLike = [];
        let featureLikeOld = [];
        // Filter.equalTo({ propertyName: 'resStatus', expression: 'C', matchCase: true }),
        let filterOld = Filter.and(
          Filter.equalTo({ propertyName: 'resStatus', expression: 'C', matchCase: true }),
          Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId, matchCase: true }),
          Filter.or(
            Filter.equalTo({ propertyName: 'sourceFlag', expression: 'R', matchCase: true }),
            Filter.equalTo({ propertyName: 'sourceFlag', expression: 'U', matchCase: true })
          )
        );

        this.resourceList.forEach(res => {
          if (res.layerType === 'C' && res.resGroup !== 'Grid') {
            featureLikeOld.push({
              layerNo: res.layerNo,
              filter: filterOld,
            });
          }
        });
        if (modeFlag !== 'old') {
          let idFilter;
          let idFeature = featureLikeOld.map(res => {
            return {
              layerNo: res.layerNo,
              filter: res.filter,
              returnGeometry: false,
            };
          });
          this.$map.getByFeatureLayers(idFeature).then(idResult => {
            if (idResult && idResult.length > 0) {
              let ids = idResult.map(res => res.attributes.resId) || [];
              let idFilterList = [];
              ids.forEach(res => {
                idFilterList.push(
                  Filter.notEqualTo({
                    propertyName: 'resId',
                    expression: res,
                    matchCase: true,
                  })
                );
              });
              idFilter = idFilterList.length === 1 ? idFilterList[0] : Filter.and(...idFilterList);
            }
            let filterInsec = Filter.intersects({
              geometryName: 'geom',
              geometry: this.curGeometry,
              spatialReference: SupportSpatialReferences.WEB_MERCATOR,
            });
            let filterA = Filter.equalTo({ propertyName: 'resStatus', expression: 'A' });
            this.resourceList.forEach(res => {
              if (res.layerType === 'A') {
                let finalFilter = idFilter ? Filter.and(filterInsec, filterA, idFilter) : Filter.and(filterInsec, filterA);
                featureLike.push({
                  layerNo: res.layerNo,
                  filter: finalFilter,
                });
              }
            });
            this.otherDesignList.forEach(item => {
              if (item.layerType === 'R') {
                let filterList = [
                  Filter.notEqualTo({
                    propertyName: 'schemaId',
                    expression: this.projectInfo.schemaId,
                    matchCase: true,
                  }),
                  hasResIdFilter,
                  Filter.or(
                    Filter.equalTo({ propertyName: 'sourceFlag', expression: 'N', matchCase: true }),
                    Filter.equalTo({ propertyName: 'sourceFlag', expression: 'U', matchCase: true })
                  ),
                  Filter.equalTo({ propertyName: 'resStatus', expression: 'C', matchCase: true }),
                ];
                let finalFilter = idFilter
                  ? Filter.and(filterInsec, ...filterList, idFilter, hasResIdFilter)
                  : Filter.and(filterInsec, ...filterList, hasResIdFilter);
                featureLike.push({
                  layerNo: item.layerNo,
                  filter: finalFilter,
                });
              }
            });
            filterObj = { featureLike };
            resolve(filterObj);
          });
        } else {
          filterObj = { featureLikeOld };
          resolve(filterObj);
        }
      });
    },
    getIdentifyDataByPage(page, modeFlag) {
      return new Promise((resolve, reject) => {
        let allData = modeFlag === 'old' ? this.allGridDataOld : this.allGridData;
        let gridID = modeFlag === 'old' ? 'batchRefGridIDOld' : 'batchRefGridID';
        let total = modeFlag === 'old' ? this.totalRecordsOld : this.totalRecords;
        if (allData[page]) {
          let reloadData = {
            rows: allData[page],
            page: page,
            // "total": Math.ceil(mydataServer.length/rowNum),  传了total就不需要传records了,除非treeGrid不知道records的场景需要自己控制total
            userdata: {
              extra: this.$t('BATCH_REFER_THE_EXTRA'),
            },
            records: total,
            id: 'gisKey',
          };

          modeFlag === 'old' ? (this.curPageOld = page) : (this.curPage = page);
          $(`#${gridID}`).grid('reloadData', reloadData);
          return reloadData;
        }
        this.createFilter(modeFlag).then(filterObj => {
          let feature = modeFlag === 'old' ? filterObj.featureLikeOld : filterObj.featureLike;
          this.$map.getByFeatureLayersAndPage(feature, page, this.gridOpt.rowNum).then(data => {
            if (data && data.page) {
              modeFlag === 'old' ? (this.totalRecordsOld = data.page.totalRows || 0) : (this.totalRecords = data.page.totalRows || 0);
            } else {
              modeFlag === 'old' ? (this.totalRecordsOld = 0) : (this.totalRecords = 0);
            }
            total = modeFlag === 'old' ? this.totalRecordsOld : this.totalRecords;
            let resultData = [];
            if (data && data.graphicList && data.graphicList.length > 0) {
              resultData = data.graphicList.map(res => {
                // if (!res.attributes.resId) {
                //     disabledIds.push(res.attributes.gisKey);
                // }
                // let schemaObj = this.allSchemaList.find(schema => schema.schemaId === res.attributes.refSchemaId) || {};
                return {
                  resId: res.attributes.resId,
                  gisKey: res.attributes.gisKey,
                  resName: res.attributes.resName,
                  resNo: res.attributes.resNo,
                  status: res.attributes.resStatus,
                  lifeStateId: res.attributes.resStatus,
                  statusDesc: res.attributes.resStatus === 'C' ? 'Planning' : 'In-Service',
                  geometry: res.geometry,
                  layerNo: res.layerNo,
                  resType: this.resourceList.concat(this.otherDesignList).find(resource => resource.layerNo === res.layerNo).resType,
                  resTypeDesc: this.resourceList.concat(this.otherDesignList).find(resource => resource.layerNo === res.layerNo).resTypeName,
                  refSchemaId: res.attributes.refSchemaId,
                  // refSchemaIdDesc: schemaObj.name,
                  geometryType: this.mapBox.findLayer(res.layerNo).geometryType,
                  schemaId: res.attributes.schemaId,
                  sprintId: res.attributes.sprintId,
                  projectId: res.attributes.projectId,
                };
              });
              modeFlag === 'old' ? (this.allGridDataOld[page] = resultData) : (this.allGridData[page] = resultData);
            } else {
              fish.toast('warn', this.$t('BATCH_REFER_NO_RESOURCES'));
            }
            let reloadData = {
              rows: resultData,
              page: page,
              // "total": Math.ceil(mydataServer.length/rowNum),  传了total就不需要传records了,除非treeGrid不知道records的场景需要自己控制total
              userdata: {
                extra: this.$t('BATCH_REFER_THE_EXTRA'),
              },
              records: total,
              id: 'gisKey',
            };
            modeFlag === 'old' ? (this.curPageOld = page) : (this.curPage = page);
            $(`#${gridID}`).grid('reloadData', reloadData);
            return reloadData;
          });
        });
      });
    },

    afterDrawPolygon(geometry) {
      if (geometry) {
        this.curGeometry = geometry;
        this.allGridData = [];
        if (this.temLayer) {
          this.temLayer.clear();
        }
        $('#batchRefGridID').grid('setAllCheckRows', false, true);
        this.getIdentifyDataByPage(1);
      }
    },

    onSelectRow(row, index) {
      let geometry = row.geometry;
      // let zoom = this.mapBox.getZoom();
      // this.mapBox.centerGeometries([geometry], zoom);
      let symbol = EDNColor.showIndex;
      let point;
      if (geometry.geometryType === GeometryType.POLYLINE) {
        let paths;
        if (typeof geometry.getPaths === 'function') {
          [paths] = geometry.getPaths();
        } else {
          [paths] = geometry.paths;
        }
        let path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], geometry.spatialReference);
      } else if (geometry.geometryType === GeometryType.POLYGON) {
        if (typeof geometry.getCentroid === 'function') {
          point = geometry.getCentroid();
        } else {
          point = geometry.centroid;
        }
      } else {
        point = geometry;
      }

      this.mapBox.map.view.animate({
        center: [point.x, point.y],
      });
      if (this.temLayer) {
        this.temLayer.clear();
      }
      let gra = this.mapBox.addGeometry(`pic${row.gisKey}`, point, symbol, {}, 'batchRef');
    },

    OKEvent() {
      let gridID = this.modeFlag === 'old' ? 'batchRefGridIDOld' : 'batchRefGridID';
      let curSelectedData = $(`#${gridID}`).grid('getCheckRows');
      console.log(curSelectedData);

      if (curSelectedData && curSelectedData.length > 0) {
        let promise = new Promise((resolve, reject) => {
          if (this.modeFlag === 'old') {
            fish.confirm(
              this.$t('BATCH_REFER_CANCEL_REFERENCE'),
              () => {
                resolve();
              },
              () => {
                reject();
              }
            );
          } else {
            resolve();
          }
        });
        promise.then(() => {
          // $.blockUI({ message: 'loading' }); // loading
          let paramList = [];
          let paramListOld = [];
          let repeatFlag = false;
          let idList = [];
          curSelectedData.forEach((item, index) => {
            // if (this.modeFlag === 'new' && item.refSchemaIdDesc) {
            //     fish.toast('info', `The resource is referenced from ${item.refSchemaIdDesc}. This operation will reference the corresponding resource from the source scheme.`)
            // }
            if (idList.indexOf(item.resId) > -1) {
              repeatFlag = true;
            }
            idList.push(item.resId);

            let refResDTO = {
              resType: item.resType,
              resId: item.resId,
              curSchemaId: this.projectInfo.schemaId,
              curProjectId: this.projectInfo.projectId,
              curSprintId: this.projectInfo.sprintId,
              lifeStateId: item.lifeStateId,
              mapNo: this.projectInfo.mapNo,
              partitionId: this.projectInfo.cityId ? this.projectInfo.cityId : this.projectInfo.areaId,
              sourceFlag: item.status === 'A' ? 'U' : 'R',
              oriSchemaId: item.schemaId,
              oriProjectId: item.projectId,
              oriSprintId: item.sprintId,
            };
            if (this.modeFlag === 'new') {
              paramList.push(refResDTO);
            } else if (this.modeFlag === 'old') {
              paramListOld.push(refResDTO);
            }
          });
          if (repeatFlag && this.modeFlag === 'new') {
            fish.warn(this.$t('BATCH_REFER_ID_EXIST'));
            return;
          }
          let functionAction = this.modeFlag === 'new' ? this.traverse(paramList, 'new') : this.traverse(paramListOld, 'old');
          functionAction()
            .then(result => {
              fish.success(this.$t('OPERATION_SUCCESS'));
              this.afterOKEvent();
            })
            .catch(response => {
              if (response && response.responseJSON && response.responseJSON.message) {
                fish.warn(response.responseJSON.message);
              }
              this.afterOKEvent();
            });
        });
      } else {
        fish.toast('warn', ths.$t('BATCH_REFER_SELECT_RECORD'));
      }
    },

    traverse(paramArray, flag) {
      let i = 0;
      let len = paramArray.length;
      return function recursion(lastResolve, lastReject) {
        return new Promise((resolve, reject) => {
          if (i === 0) {
            lastResolve = resolve;
            lastReject = reject;
          }
          let param = paramArray[i];
          i += 1;
          if (flag === 'new') {
            addReference(param)
              .then(result => {
                if (i >= len) {
                  lastResolve();
                } else {
                  recursion(lastResolve, lastReject);
                }
              })
              .catch(error => {
                lastReject(error);
              });
          } else if (flag === 'old') {
            deleteReference(param)
              .then(result => {
                if (i >= len) {
                  lastResolve();
                } else {
                  recursion(lastResolve, lastReject);
                }
              })
              .catch(error => {
                lastReject(error);
              });
          }
        });
      };
    },

    afterOKEvent() {
      this.$root.$emit('afterReferenceAction');
      if (this.temLayer) {
        this.temLayer.clear();
      }
      if (this.modeFlag === 'old') {
        this.allGridDataOld = [];
        $('#batchRefGridIDOld').grid('setAllCheckRows', false, true);
        this.getIdentifyDataByPage(1, 'old');
      } else {
        this.allGridData = [];
        $('#batchRefGridID').grid('setAllCheckRows', false, true);
        this.getIdentifyDataByPage(1, 'new');
      }
      $.unblockUI(); //  loading
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
  },
  deactivated() {
    if (this.temLayer) {
      this.temLayer.clear();
    }
    this.mapBox.clear(); // 可以屏蔽掉绘画动作
    this.controlData.initSelectedStatus.componentName = 'newResource';
    this.controlData.initSelectedStatus.rightCloseFlag = false;
  },
};
</script>

<style lang="scss" scoped>
@import 'batchReference';
</style>
