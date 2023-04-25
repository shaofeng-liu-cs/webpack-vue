<template>
  <div class="result-panel" v-if="controlData.popupName === 'resultPanel'">
    <div class="search-result">
      <div class="result-head">
        <h3>{{ $t('SEARCH_RESULT') }}</h3>
        <span class="icon_osp icon_ospclose" @click="close"></span>
      </div>
      <div class="result-content">
        <div v-for="(item, index) in resultList" :key="index" @click="details(item, index)" @mouseenter="inSearchResult(item, index)" @mouseleave="outSearchResult(item, index)">
          <div style="backgroundImage: url('oss_core/edesign/assets/image/bgimg/marker.png')" ref="bgimg">
            {{ index + 1 }}
          </div>
          <div>
            <div :title="item.CloudGraphic.attributes.resName">{{
                                item.CloudGraphic.attributes.resName
                            }}
            </div>
            <div :title="item.CloudGraphic.resTypeName">{{ item.CloudGraphic.resTypeName }} {{item.CloudGraphic.statusLabel}}</div>
            <div :title="item.CloudGraphic.attributes.resNo">
              {{ item.CloudGraphic.attributes.resNo || item.CloudGraphic.attributes.idMza }}
            </div>
            <!-- <div :title="item.CloudGraphic.schemaName" v-if="item.CloudGraphic.attributes.resStatus === 'C' && item.CloudGraphic.attributes.schemaId !== projectInfo.schemaId">
                            {{ item.CloudGraphic.schemaName }}
                        </div> -->
          </div>
          <div>
            <img :src="item.imgList && item.imgList.length !== 0 ? item.imgList[0].url : `oss_core/edesign/assets/image/map/search/res/${item.CloudGraphic.resType}.jpg`" onerror="this.src='oss_core/edesign/assets/image/map/search/res/GRID.jpg';this.onerror=null" />
          </div>
        </div>
        <Pagination :pageSize="pageSize" :total="resultCount" :pgTotal="false" :pgInput="false" :pageSizes="[]" :pgRecText="false" :pageNo="currentPage" @page-change="onPageClick"></Pagination>
      </div>
    </div>
  </div>
</template>
<script>
import { queryResourceInfo } from '@/oss_core/edesign/api/query/resType.js';
import { GeometryType } from 'map';
import { queryIsSurvey } from '@/oss_core/edesign/api/query/gisKey.js';

export default {
  inject: ['getResourceList', 'getControlData', 'getProjectInfo', 'getSurfaceLayerList', 'getOtherDesignList'],
  computed: {
    resourceList() {
      return this.getResourceList();
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
    // allSchemaList() {
    //     return this.getAllSchemaList();
    // },
    otherDesignList() {
      return this.getOtherDesignList();
    },
  },
  data() {
    return {
      resultList: [], // 列表数据
      resultCount: 0, // 总条数
      currentPage: 1, // 当前页码
      pageSize: 5, // 每页数量
      haveDataList: {}, // 获取过的数据存入
      clickType: 'map', // 从什么地方来的
      inputVal: '', //用户输入的查询条件
      resInfo: {}, //用户选择的类型信息
      mouseIndex: -1, //触发派发事件的下标
      val: '', // 搜索条件
      gisData: '', // 把gis数据缓存起来，在前台做分页，然后查询资源数据
    };
  },
  methods: {
    querys(val, item) {
      // 查询数据
      this.val = val;
      this.resInfo = item;
      this.currentPage = 1;
      this.resultCount = 0;
      this.getGisData();
      this.clickType = 'search';
    },
    setResult(resultData) {
      //对数据进行处理
      if (resultData.length === 0) {
        fish.toast('warn', this.$t('NO_RESOURCES') + '!');
        return;
      }
      this.currentPage = 1;
      this.haveDataList = {};
      this.resultCount = resultData.length;
      this.gisData = resultData;
      this.setPagination();
    },
    setPagination() {
      if (!this.haveDataList[this.currentPage]) {
        let promiseList = [];
        let resultList = [];
        let resultData = this.gisData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
        this.$emit('showInfos', resultData);
        resultData.forEach(item => {
          resultList.push({ CloudGraphic: item });
        });
        resultList.forEach(item => {
          // 不属于资源图层并且不是接入点类型的跳过查询资源详情的逻辑
          let findRes = this.resourceList.concat(this.otherDesignList).find(res => res.layerNo === item.CloudGraphic.layerNo);
          if (!findRes && item.CloudGraphic.resType !== 'A5') {
            return;
          }
          // todo(选中网格会有resid)
          if (
            item.CloudGraphic.attributes.resId &&
            item.CloudGraphic.geometry.geometryType !== GeometryType.POLYGON &&
            item.CloudGraphic.resType !== 'ROUTE'
          ) {
            promiseList.push(this.setPromise(item));
          }
        });
        Promise.all(promiseList).then(() => {
          if (resultList.length === 1 && this.currentPage === 1) {
            this.isEsurveying(resultList[0]);
          } else {
            this.controlData.popupName = 'resultPanel';
            resultList.forEach(res => {
              res.CloudGraphic.statusLabel = this.initStatusLabel(res.CloudGraphic.attributes);
              if (res.CloudGraphic.attributes.resStatus === 'C' && res.CloudGraphic.attributes.schemaId !== this.projectInfo.schemaId) {
                // let schemaObj = this.allSchemaList.find(schema => schema.schemaId === res.CloudGraphic.attributes.schemaId);
                // res.CloudGraphic.schemaName = schemaObj ? schemaObj.name : '';
              }
            });
            this.resultList = resultList;
            this.haveDataList[this.currentPage] = resultList;
          }
        });
      } else {
        this.resultList = this.haveDataList[this.currentPage];
      }
    },
    // 判断资源是否正在工勘中
    isEsurveying(graphic, index = 1) {
      let allResType = [];
      this.surfaceLayerList.map(item => {
        if (item.resType !== 'A5') {
          allResType.push(item.resType);
        }
      });
      let isDisable = false;
      if (allResType.indexOf(graphic.CloudGraphic.resType) > -1) {
        queryIsSurvey(graphic.CloudGraphic.attributes.gisKey).then(res => {
          isDisable = res.resultCount > 0 ? true : false;
          if (
            this.$parent.$parent.$refs.toolbar.$refs.InitialSurvey &&
            this.$parent.$parent.$refs.toolbar.$refs.InitialSurvey.$refs.RemoteSurvey &&
            graphic.CloudGraphic.layerNo !== 'demandBuilding'
          ) {
            this.$parent.$parent.surfaceTransfer(graphic.CloudGraphic);
          } else {
            this.$parent.$refs.info.queryAttrInfo(graphic, false, index, this.clickType, isDisable);
          }
        });
      } else {
        this.$parent.$refs.info.queryAttrInfo(graphic, false, index, this.clickType, isDisable);
      }
    },
    initStatusLabel(attributes) {
      let finalLabel = '';
      if (attributes.beRefFlag === 'Y') {
        finalLabel = '[Be-Referenced]';
      } else if (attributes.sourceFlag === 'R') {
        // let schemaObj = this.allSchemaList.find(schema => schema.schemaId === attributes.refSchemaId);
        // finalLabel = schemaObj ? `[Reference From ${schemaObj.name}]` : '[Reference]';
      } else if (attributes.sourceFlag === 'U') {
        finalLabel = '[Reuse]';
      }

      if (attributes.resStatus === 'A') {
        finalLabel = '[In-Service]';
      }
      return finalLabel;
    },
    setPromise(item) {
      return new Promise((resolve, reject) => {
        let param = {
          resId: item.CloudGraphic.attributes.resId,
          resType: item.CloudGraphic.relaResType ? item.CloudGraphic.relaResType : item.CloudGraphic.resType,
        };
        queryResourceInfo(param).then(data => {
          if (data && data.resultList && data.resultList.length !== 0) {
            this.setResultList(data.resultList, data.attachList, 0);
            Object.assign(item, data.resultList[0]);
          }
          resolve();
        });
      });
    },
    getGisData() {
      let Filter = this.$map.Filter;
      let filterLike = Filter.like({
        propertyName: 'resNo',
        expression: `%${this.val}%`,
      });
      let fliterId;
      let fliterNotId;
      if (this.projectInfo.markFlag === 'sprint') {
        fliterId = Filter.equalTo({ propertyName: 'sprintId', expression: this.projectInfo.sprintId });
        fliterNotId = Filter.notEqualTo({ propertyName: 'sprintId', expression: this.projectInfo.sprintId });
      } else {
        fliterId = Filter.equalTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId });
        fliterNotId = Filter.notEqualTo({ propertyName: 'schemaId', expression: this.projectInfo.schemaId });
      }
      let filterA = Filter.and(Filter.equalTo({ propertyName: 'resStatus', expression: 'A' }), filterLike);
      let filterR = Filter.and(Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }), fliterNotId, filterLike);
      let filterC = Filter.and(Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }), fliterId, filterLike);
      let layerInfoA = this.resourceList.find(res => res.layerType === 'A' && res.resType === this.resInfo.resType);
      let layerInfoR = this.otherDesignList.find(res => res.layerType === 'R' && res.resType === this.resInfo.resType);
      let layerInfoC = this.resourceList.find(res => res.layerType === 'C' && res.resType === this.resInfo.resType);
      let layerInfoSurface = this.surfaceLayerList.find(res => res.layerNo === this.resInfo.layerNo);
      let feature = [];
      if (layerInfoA) {
        feature.push({
          layerNo: layerInfoA.layerNo,
          filter: filterA,
        });
      }
      if (layerInfoR) {
        feature.push({
          layerNo: layerInfoR.layerNo,
          filter: filterR,
        });
      }
      if (layerInfoC) {
        feature.push({
          layerNo: layerInfoC.layerNo,
          filter: filterC,
        });
      }
      if (layerInfoSurface) {
        feature.push({
          layerNo: layerInfoSurface.layerNo,
          //Todo 需要修改地貌数据的搜索字段
          filter: Filter.like({
            propertyName: 'resName',
            expression: `%${this.val}%`,
          }),
        });
      }

      this.$map.getByFeatureLayersAndPage(feature, 1, 50).then(data => {
        if (data && data.graphicList && data.graphicList.length > 0) {
          let currentGraphicList = data.graphicList.map(res => {
            let graphic = new this.$map.Graphic(res.id, res.layerNo, res.geometry, null, res.attributes);
            let allList = this.resourceList.concat(this.surfaceLayerList).concat(this.otherDesignList);
            let resInfo = allList.find(resource => resource.layerNo === graphic.layerNo);
            graphic.resType = resInfo.resType;
            graphic.relaResType = resInfo.relaResType || '';
            graphic.resTypeName = resInfo.resTypeName;
            return graphic;
          });

          this.setResult(currentGraphicList);
          console.log(currentGraphicList);
        } else {
          fish.toast('warn', this.$t('NO_MATCHING_DATA'));
        }
      });
    },
    setResultList(resultList, attachList, index) {
      let imgList = [];
      let generalList = [];
      let childList = [];
      if (attachList[index] instanceof Array) {
        childList = attachList[index];
      } else {
        childList = attachList;
      }
      childList.forEach(item => {
        if (item.category === 'SUMMARY_PIC') {
          imgList.push(item);
        } else {
          generalList.push(item);
        }
        item.url = 'edesign/file/download?fileName=' + encodeURIComponent(item.fullPath + '/' + item.docAlias);
      });
      resultList[index].imgList = imgList;
      resultList[index].generalList = generalList;
    },
    details(item, index) {
      // 进入详情页
      if (!item.CloudGraphic) {
        fish.toast('warn', this.$t('OSP_MAP_SEARCHBAR_INFO_MSG_NO_GIS'));
      }
      this.isEsurveying(item, index + 1);
      // this.$parent.$refs.info.queryAttrInfo(item, true, index + 1, this.clickType);
    },
    inSearchResult(item, index) {
      if (item.CloudGraphic) {
        this.$emit('inSearchResult', item, index);
        this.mouseIndex = index;
      }
      this.$refs.bgimg[index].style.backgroundImage = `url('oss_core/edesign/assets/image/bgimg/marker-b.png')`;
    },
    outSearchResult(item, index) {
      if (this.mouseIndex === index) {
        this.$emit('outSearchResult', item, index);
        this.mouseIndex = -1;
      }
      this.$refs.bgimg[index].style.backgroundImage = `url('oss_core/edesign/assets/image/bgimg/marker.png')`;
    },
    close() {
      //
      this.controlData.popupName = '';
    },
    onPageClick(page) {
      // 切换页签
      console.log(page);
      this.currentPage = page;
      if (!this.haveDataList[this.currentPage]) {
        // this.getGisData();
        this.setPagination();
      } else {
        this.resultList = this.haveDataList[this.currentPage];
        this.$emit(
          'showInfos',
          this.resultList.map(res => res.CloudGraphic)
        );
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import './resultPanel.scss';
</style>
