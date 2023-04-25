<template>
  <div class="on-site-survey-container">
    <div v-if="!showSurfaceSurvey" class="on-site-survey_body">
      <div class="survey-title sidebar-tab-title">{{$t('INITIATE_SURVEY_TASK_LIST')}}</div>
      <div class="survey-task-list-box">
        <template v-if="taskList.length">
          <div class="survey-task-item-box" @click="selectOrderShow(item)" :class="{active:selectOrder.orderId===item.orderId}" v-for="(item,index) of taskList" :key="item.orderId">
            <div class="survey-task-item-content">
              <span class="task-item-icon">
                <i :class="`icon_osp ${item.orderType!=='E_SURVEY'?'icon_ospbiaodan':'icon_ospfasongapp'}`"></i>
              </span>
              <span class="task-item-content">
                <div class="task-item-title">
                  {{item.title}}
                </div>
                <div class="task-item-status">{{item.orderStateDesc}}</div>
                <div class="task-item-desc">{{item.description}}</div>
              </span>
            </div>
            <div class="survey-task-item-footer">
              <span class="item-footer-span" @click="showResource(item.orderId)">{{$t('INITIATE_SURVEY_RESOURCES')}}</span>
              <span v-if="item.orderType!=='E_SURVEY'" class="item-footer-span" @click="exportExcel(item.orderId)">{{$t('INITIATE_SURVEY_RESOURCES_Export')}}</span>
              <span v-if="item.orderType!=='E_SURVEY'&&item.orderState!=='C'" class="item-footer-span" @click="importExcelBtnClick">{{$t('INITIATE_SURVEY_RESOURCES_IMPORT')}}</span>
              <span class="item-footer-span" v-if="item.orderState!=='C'&&item.orderType!=='E_SURVEY'" @click="closeTask(item.orderId,index)">{{$t('INITIATE_SURVEY_RESOURCES_CLOSE')}}</span>
            </div>
          </div>
        </template>
        <div v-else class="survey-no-content"></div>
      </div>
      <div class="new-task-survey-box">
        <div class="new-task-btn-box">
          <span class="new-task-btn" @click="handleShowSurfaceSurvey">{{$t('INITIATE_SURVEY_NEW_SUR_SURVEY')}}</span>
        </div>
      </div>

    </div>
    <SurfaceSurvey v-else></SurfaceSurvey>
    <iframe id="downIframe" name="downIframe" style="display:none;"></iframe>

    <input type="file" @change="uploadImportExcelFile" ref="importExcelInput" style="display:none;" accept=".xlsx,.xls">
    <popup :popupObj="popupInfo" @popupClose="popupClose" @popupOk="popupOk">
      <template v-slot:popupBody>
        <div class="data-comparison">
          <div class="data-comparison-notice">
            <div class="data-comparison-notice-updated">
              <div>
              </div>
              <span> {{$t('INITIATE_SURVEY_UPDATED')}}</span>
            </div>
            <div class="data-comparison-notice-no-updated">
              <div>
              </div>
              <span>{{$t('INITIATE_SURVEY_NO_UPDATED')}}</span>
            </div>
          </div>
          <div class="data-comparison-table">
            <div class="survey-title">{{$t('INITIATE_SURVEYSTATISTICS')}}</div>
            <table>
              <tr>
                <th>{{$t('INITIATE_SURFACE_CAT')}}</th>
                <th>{{$t('INITIATE_SURVEY_UPDATED')}}</th>
                <th>{{$t('INITIATE_SURVEY_NO_UPDATED')}}</th>
              </tr>
              <tr v-for="(item,index) in resultCount" :key="index">
                <td>{{item.type}}</td>
                <td>{{ item.updated }}</td>
                <td>{{ item.noUpdated }}</td>
              </tr>
            </table>
          </div>
        </div>
      </template>
    </popup>
    <Popup :popupObj="popupResInfo" @popupClose="respopupClose" @popupOk="popupResOk">
      <template v-slot:popupBody>
        <div class="resource-modal-box">
          <div class="search-head-box">
            <div class="tap-div" v-for="(item,index) in surveyTypeSource" :key="index">
              <label class="single-tap" :class="[activeTap === item.resType ? 'activeTap' : '']" @click="changeTap(item.resType)">{{item.catName}}</label>
            </div>
          </div>
          <div class="res-grid-box" v-if="resourceHeaderList.length" :key="activeTap">
            <Grid :data="resourceDataList" :option="resourceOption" ref="resourceRef">
              <grid-column v-for="(item) in resourceHeaderList" :key="item.name" :label="item.value" :prop="item.name" :width="`${item.name==='gisKey'?'220':'160'}`"></grid-column>
            </Grid>
          </div>

        </div>
      </template>
    </Popup>

  </div>
</template>
  
  <script>
import * as DefaultSymbol from '@/oss_core/base/symbol/DefaultSymbol';
import { GeometryType, SimpleLineSymbol, Color } from 'map';
import SurfaceSurvey from '@/oss_core/edesign/osp/sidebar/InitialSurvey/onSiteSurvey/surfaceSurvey/SurfaceSurvey.vue';
import { getSurfaceTaskList, getProResourceList, queryResourceData, closeSurfaceExcel } from '@/oss_core/edesign/api/query/schema.js';
import * as Colors from '../../../design/drawStyle.js'; // 画图样式

export default {
  name: 'OnsiteSurvey',
  inject: ['getProjectInfo', 'getMapBox', 'getHldEl', 'getSurfaceLayerList'],
  components: { SurfaceSurvey },
  data() {
    return {
      orderId: '',
      schemaId: '',
      searchVal: '',
      searchValue: '',
      showSurfaceSurvey: false,
      selectOrder: {},
      popupInfo: {
        title: this.$t('INITIATE_SURVEY_RESOURCE_SELECTED'), // 弹框标题
        ok: this.$t('TASK_LIST_CONFIRM'), // 确认按钮内容
        close: this.$t('OSP_TASK_REJECT'), // 取消按钮内容
        width: '400px', // 宽
        height: 'auto', // 高
        show: false,
        modal: false, // 是否蒙层
        left: '5%',
        top: '10%',
        drag: true,
        body: true,
        zIndex: 10,
      },
      popupResInfo: {
        title: this.$t('INITIATE_SURVEY_RESOURCE_LIST'), // 弹框标题
        close: this.$t('CLOSE'),
        width: '900px', // 宽
        height: '500px', // 高
        show: false,
        modal: false, // 是否蒙层
        left: '5%',
        top: '10%',
        drag: true,
        body: true,
        zIndex: 10,
      },
      resourceData: [],
      resourceOption: {},
      resourceOption2: {},
      taskList: [],
      filterArr: [],
      excelAnalysisResult: null,
      resultCount: [],
      isNeedCenterMap: true,
      filterCode: 'All',
      activeTap: 'A1',
      resourceHeaderList: [],
      resourceDataList: [],
      resourceHeaderList2: [],
      resourceDataList2: [],
      surveyTypeSource: [],
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
  },
  created() {
    this.getSurveyType();
    this.popupInfo.el = this.getHldEl();
    this.popupResInfo.el = this.getHldEl();
    this.loadTaskList();
  },
  mounted() {
    this.schemaId = this.projectInfo.schemaId;
  },
  deactivated() {
    this.clearTmp();
    this.selectOrder = {};
    this.mapBox.clear(false);
  },
  methods: {
    popupClose() {},
    respopupClose() {
      this.activeTap = 'A1';
    },
    popupOk() {
      this.clearTmp();
      this.saveExcelFileData();
    },
    popupResOk() {},
    getSurveyType() {
      this.surfaceLayerList.forEach(item => {
        if (item.resType !== 'A5') {
          let obj = {
            catName: item.catName,
            resType: item.resType,
          };
          let res = this.surveyTypeSource.map(a => {
            return a.catName;
          });
          if (res.indexOf(obj.catName) === -1) {
            this.surveyTypeSource.push(obj);
          }
        }
      });
      console.log(this.surveyTypeSource);
    },
    checkTap(name, buttonName) {
      if (this.$refs.popoverF) {
        this.$refs.popoverF.close();
      }
      if (name) {
        this.filterCode = name;
        this.loadResourceList();
      }
    },
    selectOrderShow(item) {
      if (this.selectOrder.orderId === item.orderId) {
        return;
      }
      this.clearTmp();
      this.selectOrder = item;
      this.mapBox.clear(false);
      if (item.geometry) {
        console.log('选择区域：', item);
        this.mapBox.addTempLayer('highLightLayer');
        let polygonGeo = this.mapBox.createPolygonGeometry(item.geometry.rings);
        const polygonSymbol = DefaultSymbol.FILL.CABLE_LAYING;
        let polygonGra = this.mapBox.addGeometry(`selectOrderLayer`, polygonGeo, polygonSymbol, {}, 'highLightLayer');
        this.mapBox.centerGeometries([polygonGra.geometry]);
        (item.imPrjordResDTOList || []).map((it, index) => {
          this.addGeometryIcon(it.graphic, it.resSpecId, index + 1); //item.surfaceDispSeq
        });
      }
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
    addGeometryIcon(graphic, type, index) {
      let point;
      if (graphic.geometry.geometryType === GeometryType.POLYGON) {
        let polygonGeo = this.mapBox.createPolygonGeometry(graphic.geometry.rings);
        const polygonSymbol = DefaultSymbol.FILL.NOCOLOR;
        let polygonGra = this.mapBox.addGeometry(`selectOrderLayer`, polygonGeo, polygonSymbol, {}, 'highLightLayer');
        point = polygonGra.geometry.getCentroid();
      } else if (graphic.geometry.geometryType === GeometryType.POLYLINE) {
        let [paths] = graphic.geometry.paths;
        let path = this.getLinecenter(paths);
        point = new this.$map.Point(path[0], path[1], 3857);
      } else {
        point = new this.$map.Point(graphic.geometry.x, graphic.geometry.y, 3857);
      }
      let textSymbol = new this.$map.TextSymbol(`${index}`, Colors.FONT_NORMAL, Colors.WHITE, 'center', 'middle', -3, -20);
      let symbol = Colors.showIndex;
      this.mapBox.addGeometry(`text${index}`, point, textSymbol);
      this.mapBox.addGeometry('pic' + index, point, symbol);
    },
    closeTask(orderId, index) {
      closeSurfaceExcel({ orderId }).then(res => {
        fish.toast('success', this.$t('INITIATE_SURFACE_CLOSE_TASK'));
        this.taskList[index].orderStateDesc = 'Close';
        this.taskList[index].orderState = 'C';
      });
    },
    loadTaskList() {
      getSurfaceTaskList(this.projectInfo.projectId).then(res => {
        this.taskList = res || [];
      });
    },
    changeTap(type) {
      this.activeTap = type;
      this.loadResourceList();
    },
    showResource(orderId) {
      this.orderId = orderId;
      this.loadResourceList();
      this.popupResInfo.show = true;
    },
    loadResourceList() {
      this.resourceHeaderList = [];
      this.resourceDataList = [];
      getProResourceList({
        projectId: this.projectInfo.projectId,
        orderId: this.orderId,
        resType: this.activeTap,
      }).then(data => {
        console.log('列表接口数据：', data);
        this.resourceHeaderList = data.headerList || [];
        this.resourceDataList = data.dataList || [];
      });
    },
    saveExcelFileData() {
      let option = {
        url: 'edesign/gis/excel/import/v1',
        data: {
          importData: this.excelAnalysisResult,
          schemaId: this.schemaId,
          mapNo: this.mapBox.mapNo,
          orderId: this.selectOrder.orderId,
          docPath: this.docPath,
        },
        success: result => {
          fish.toast('success', this.$t('INITIATE_SURFACE_IMPORT_SUCCESS'));
          this.popupInfo.show = false;
          this.mapBox.refresh();
        },
      };
      fish.post(option);
    },
    handleShowSurfaceSurvey() {
      this.mapBox.clear(false);
      this.selectOrder = {};
      this.clearTmp();
      this.showSurfaceSurvey = !this.showSurfaceSurvey;
    },
    clearTmp() {
      let temLayer = this.mapBox._tempLayerList.get('highLightLayer');
      if (temLayer) {
        temLayer.clear();
      }
    },
    importExcelBtnClick() {
      this.$refs.importExcelInput.click();
    },
    uploadImportExcelFile() {
      let uploadFormData = new FormData();
      let file = this.$refs.importExcelInput.files[0];
      if (this.$refs.importExcelInput.value) {
        this.$refs.importExcelInput.value = '';
      }
      uploadFormData.append('file', file, file.name);
      uploadFormData.append('schemaId', this.schemaId);
      uploadFormData.append('mapNo', this.mapBox.mapNo);
      fish.postBasic({
        url: 'edesign/gis/excel/analysis/v1',
        showMask: true,
        processData: false,
        contentType: false,
        data: uploadFormData,
        success: result => {
          this.isNeedCenterMap = true;
          let newResult = JSON.parse(JSON.stringify(result));
          delete newResult.docPath;
          this.excelAnalysisResult = newResult;
          this.docPath = result.docPath;
          this.popupInfo.show = true;
          this.calResultCount();
          this.addAllGeometry();
        },
      });
    },
    calResultCount() {
      for (const key in this.excelAnalysisResult) {
        let updated = this.excelAnalysisResult[key].changedDataList.length;
        let noUpdated = this.excelAnalysisResult[key].unChangedDataList.length;
        this.resultCount.push({
          type: key,
          updated: updated,
          noUpdated: noUpdated,
        });
        console.log(this.resultCount);
      }
    },
    addAllGeometry() {
      if (this.excelAnalysisResult.Building) {
        this.excelAnalysisResult.Building.unChangedDataList.forEach(item => {
          this.addOneGeometryOnMap(item.geometry);
        });
        this.excelAnalysisResult.Building.changedDataList.forEach(item => {
          this.addOneGeometryOnMap(item.geometry);
        });
      }
      if (this.excelAnalysisResult.Road) {
        this.excelAnalysisResult.Road.changedDataList.forEach(item => {
          this.addOneGeometryOnMap(item.geometry);
        });
        this.excelAnalysisResult.Road.unChangedDataList.forEach(item => {
          this.addOneGeometryOnMap(item.geometry);
        });
      }
    },
    exportExcel(id) {
      console.log('下载', id);
      const path = window.location.host.indexOf('localhost') > -1 ? '' : '/oss';
      window.open(`${path}/edesign/surveyTask/download/surfaceExcel/v1?orderId=${id}&time=${new Date().getTime()}`, 'downIframe');
    },
    addOneGeometryOnMap(geometry) {
      switch (geometry.geometryType) {
        case GeometryType.POINT:
          this.mapBox.addPoint(geometry, DefaultSymbol.MARKER.RED);
          if (this.isNeedCenterMap) {
            let point = this.mapBox.createPoint(geometry.x, geometry.y);
            this.mapBox.centerAt(point, 17);
            this.isNeedCenterMap = false;
          }
          break;
        case GeometryType.POLYGON:
          this.mapBox.addPolygonByRings(geometry.rings, DefaultSymbol.FILL.BLUE);
          if (this.isNeedCenterMap) {
            let point = this.mapBox.createPoint(geometry.rings[0][0][0], geometry.rings[0][0][1]);
            this.mapBox.centerAt(point, 17);
            this.isNeedCenterMap = false;
          }
          break;
        case GeometryType.POLYLINE:
          this.mapBox.addLineByPath(geometry.paths, new SimpleLineSymbol('solid', new Color(255, 0, 0, 1), 5));
          if (this.isNeedCenterMap) {
            let point = this.mapBox.createPoint(geometry.paths[0][0][0], geometry.paths[0][0][1]);
            this.mapBox.centerAt(point, 17);
            this.isNeedCenterMap = false;
          }
          break;
        default:
          break;
      }
    },
  },
};
</script>
  
  <style lang="scss" scoped>
@import './onSiteSurvey';
</style>
  