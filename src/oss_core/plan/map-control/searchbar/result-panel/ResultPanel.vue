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
                        <div :title="item.CloudGraphic.resTypeName">{{ item.CloudGraphic.resTypeName }}</div>
                        <div :title="item.CloudGraphic.attributes.resNo">
                            {{ item.CloudGraphic.attributes.resNo || item.CloudGraphic.attributes.idMza }}
                        </div>
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

export default {
  inject: ['getResourceList', 'getSurfaceLayerList', 'getControlData'],
  computed: {
    resourceList() {
      return this.getResourceList();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
    controlData() {
      return this.getControlData();
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
  mounted() {
    this.$root.$on('setResult', this.setGraphic);
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
    getGisData() {
      let Filter = this.$map.Filter;
      let filterLike = Filter.like({
        propertyName: 'resName',
        expression: `%${this.val}%`,
      });
      let filterA = Filter.and(Filter.equalTo({ propertyName: 'resStatus', expression: 'A' }), filterLike);
      let filterC = Filter.and(Filter.equalTo({ propertyName: 'resStatus', expression: 'C' }), filterLike);
      let layerInfoA = this.resourceList.find(res => res.layerType === 'A' && res.resType === this.resInfo.resType);
      let layerInfoC = this.resourceList.find(res => res.layerType === 'C' && res.resType === this.resInfo.resType);
      let layerInfoSurface = this.surfaceLayerList.find(res => res.layerNo === this.resInfo.layerNo);
      let feature = [];
      if (layerInfoA) {
        feature.push({
          layerNo: layerInfoA.layerNo,
          filter: filterA,
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
            return graphic;
          });

          this.setGraphic(currentGraphicList);
          console.log(currentGraphicList);
        } else {
          fish.toast('warn', this.$t('NO_MATCHING_DATA'));
        }
      });
    },
    setGraphic(graphicList) {
      let newGraphicList = graphicList.map(graphic => {
        let resInfo = this.resourceList.find(resource => resource.layerNo === graphic.layerNo);
        graphic.resType = resInfo.resType;
        graphic.relaResType = resInfo.relaResType || '';
        graphic.resTypeName = resInfo.resTypeName;
        return graphic;
      });
      this.setResult(newGraphicList);
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
          let findRes = this.resourceList.find(res => res.layerNo === item.CloudGraphic.layerNo);
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
            this.$parent.$refs.info.queryAttrInfo(resultList[0], false, 1, this.clickType);
          } else {
            this.controlData.popupName = 'resultPanel';
            this.resultList = resultList;
            this.haveDataList[this.currentPage] = resultList;
          }
        });
      } else {
        this.resultList = this.haveDataList[this.currentPage];
      }
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
        let path = encodeURIComponent(item.fullPath + '/' + item.docAlias);
        item.url = `${portal.appGlobal.attributes.webroot} /opb/file/download?fileName=${path}&delete=true`;
        // item.url = 'im/webgis/file/download?fileName=' + encodeURIComponent(item.fullPath + '/' + item.docAlias);
      });
      resultList[index].imgList = imgList;
      resultList[index].generalList = generalList;
    },
    details(item, index) {
      // 进入详情页
      if (!item.CloudGraphic) {
        fish.toast('warn', this.$t('OSP_MAP_SEARCHBAR_INFO_MSG_NO_GIS'));
      }
      this.$parent.$refs.info.queryAttrInfo(item, true, index + 1, this.clickType);
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
  destroyed() {
    //全局监听地图刷新
    this.$root.$off('setResult', this.setGraphic);
  },
};
</script>
<style scoped lang="scss">
@import './resultPanel.scss';
</style>
