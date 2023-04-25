<template>
  <div class="construction-task">
    <div class="row-btn btn btn-primary" @click="initTask">{{ $t('REFRESH') }}</div>
    <div class="search">
      <div class="filter-content">
        <div class="filter-name left-radius btn-primary">{{ filterName }} </div>
        <Popover placement="bottom" trigger="click" ref="popover" popClass="layer-control-popover">
          <button type="button" class="btn dropdown-btn btn-primary blue-border right-radius">
            <span class="caret"></span>
          </button>
          <ul slot="content" class="v9-popover-ul">
            <li @click="checkTap('', $t('ALL'))" class="btn btn-default filter-li">{{ $t('ALL') }}</li>
            <li @click="checkTap('New', 'New')" class="btn btn-default filter-li">New</li>
            <li @click="checkTap('Scheduled', 'Scheduled')" class="btn btn-default filter-li">Scheduled</li>
            <li @click="checkTap('Accepted', 'Accepted')" class="btn btn-default filter-li">Accepted</li>
            <li @click="checkTap('Processing', 'Processing')" class="btn btn-default filter-li">Processing</li>
            <li @click="checkTap('Finished', 'Finished')" class="btn btn-default filter-li">Finished</li>
            <li @click="checkTap('Failed', 'Failed')" class="btn btn-default filter-li">Failed</li>
          </ul>
        </Popover>
      </div>
      <div class="search-content">
        <Search v-model="searchValue" ref="search"></Search>
      </div>
    </div>
    <div class="task-list">
      <el-scrollbar>
        <div class="task-content" v-for="(items,indexs) in taskList" :key="indexs" :class="{active:selectedResID===items.resID}" @click="selectRes(items.resID)">
          <div class="task-head">
            <el-tooltip class="item" effect="light" :content="items.name" placement="bottom-start" v-if="searchValue">
              <div class="task-name">
                <!-- <span class="icon_osp icon_ospCableguanglan"></span> -->
                <img class="img" :src="items.iconUrl||`oss_core/edesign/assets/image/map/res/F_CLOSURE.svg`" alt="" />
                <span v-for="(text, i) in items.nameArr" :key="i" :class="{red: text.toUpperCase() === searchValue.toUpperCase()}">{{ text }}</span>
              </div>
            </el-tooltip>
            <div class="task-name" v-else>
              <!-- <span class="icon_osp icon_ospCableguanglan"></span> -->
              <img class="img" :src="items.iconUrl||`oss_core/edesign/assets/image/map/res/F_CLOSURE.svg`" alt="" />
              <el-tooltip class="item" effect="light" :content="items.name" placement="bottom-start">
                <div>{{ items.name }}</div>
              </el-tooltip>

            </div>
            <div class="task-new" v-if="items.totalLink - items.haveTaskLink > 0" @click="launch(items)">{{$t('LAUNCH')}}</div>
          </div>
          <div class="task-body">
            <div class="task-child-content" v-for="(item,index) in items.taskList" :key="index">

              <el-tooltip class="item" effect="light" :content="item.title" placement="bottom-start">
                <div class="task-child-name">{{item.title}}</div>
              </el-tooltip>
              <div class="task-child-state">
                <el-tooltip class="item" effect="light" :content="item.fieldEngineerName" placement="bottom-start">
                  <div>{{item.fieldEngineerName || 'N/A'}}</div>
                </el-tooltip>
                <div class="line"></div>
                <el-tooltip class="item" effect="light" :content="item.dispState || 'N/A'" placement="bottom-start">
                  <div>{{item.dispState || 'N/A'}}</div>
                </el-tooltip>
                <!-- <div class="line"></div> -->
                <!-- <div :title="item.completeTypeName">{{item.completeTypeName || 'N/A'}}</div>
                <div class="line"></div> -->
                <!-- <div :title="item.taskStatusName">{{item.taskStatusName || 'N/A'}}</div> -->
              </div>
              <div class="task-child-foot">
                <div @click="showResources(item)">{{$t('CONSTR_MANAGE_RESOURCES')}}</div>
                <!-- <div>{{$t('CONSTR_MANAGE_RE_LAUNCH')}}</div> -->
                <div @click="showImgs(item)">{{$t('CONSTR_MANAGE_IMAGE')}}</div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <Popup :popupObj="popupInfo" @popupClose="popClose">
      <template v-slot:popupBody>
        <Grid :data="resourceDataList" :option="{}">
          <grid-column :label="$t('RESOURCE_TYPE')" prop="resSpecId"></grid-column>
          <grid-column :label="$t('NAME')" prop="name"></grid-column>
          <grid-column :label="$t('MODEL')" prop="modelName"></grid-column>
          <grid-column :label="$t('OSP_RESOURCE_TEMPLATE')" prop="templateName"></grid-column>
          <grid-column :label="$t('OSP_TASK_VENDOR')" prop="vendorId"></grid-column>
          <grid-column :label="$t('LAYING_CABLE_LENGTH')" prop="cableLength"></grid-column>
        </Grid>
      </template>
    </Popup>
    <SplicePreview ref="splicePreview" @launchSuccess="launchSuccess"></SplicePreview>
    <ShowImgModal ref="showImgModal"></ShowImgModal>
  </div>
</template>

<script>
import SplicePreview from './splicePreview/SplicePreview.vue';
import { querySpliceTask, queryResourcelist } from '@/oss_core/edesign/api/query/schema.js';
import { addBuildTask } from '@/oss_core/edesign/api/add/schema.js';
import ShowImgModal from '../showImgModal/ShowImgModal.vue';

export default {
  name: 'SpliceTask',
  //import引入的组件
  components: {
    SplicePreview,
    ShowImgModal,
  },
  inject: ['getProjectInfo', 'getResourceList', 'getMapBox', 'getHldEl'],
  data() {
    return {
      searchValue: '', //搜索关键词
      filterName: this.$t('ALL'), //搜索过滤条件
      searchDispState: '', //搜索过滤条件对应状态
      initTaskList: [], //初始任务单列表
      taskList: [], //条件过滤后任务单列表
      schemaId: this.getProjectInfo().schemaId, //任务单ID
      selectedResID: '',
      resourceDataList: [],
      popupInfo: {
        title: this.$t('INITIATE_SURVEY_RESOURCE_LIST'), // 弹框标题
        close: this.$t('CLOSE'),
        width: '1200px', // 宽
        height: '500px', // 高
        show: false,
        modal: false, // 是否蒙层
        drag: true,
        body: true,
        zIndex: 10,
      },
    };
  },
  created() {
    this.popupInfo.el = this.getHldEl();
  },
  mounted() {
    this.mapBox = this.getMapBox();

    this.initTask();
  },
  methods: {
    showImgs(item) {
      this.$refs.showImgModal.handleShow(item.taskId);
    },
    popClose() {},

    showResources(item) {
      queryResourcelist(item.taskId).then(res => {
        this.resourceDataList = res || [];
      });
      this.popupInfo.show = true;
    },
    selectRes(id) {
      this.selectedResID = id;
      let wfsList = [];
      wfsList = this.getResourceList().filter(group => group.layerType === 'C');

      let featureLikeList = [];
      let Filter = this.$map.Filter;
      let filter = Filter.equalTo({
        propertyName: 'resId',
        expression: id,
      });
      wfsList.forEach(like => {
        let object = {
          layerNo: like.layerNo,
          filter: filter,
        };
        featureLikeList.push(object);
      });
      this.$map.getByFeatureLayers(featureLikeList).then(child => {
        let selectGeo = [];
        child.map(it => {
          let layerInfo = this.mapBox.getLayers().find(layer => layer.id === it.layerNo);
          let features = layerInfo.source.getFeatures();
          let feature = features.find(feature => feature.values_.gisKey === it.attributes.gisKey);
          if (feature) {
            let geo = this.$map.Graphic.from(feature, this.mapBox.spatialReference);
            selectGeo.push(geo);
          }
        });
        this.mapBox.clear();
        // child[0] && this.mapBox.map.setExtent(child[0].geometry.getExtent(), false);
        // let currZoom = this.mapBox.map.getZoom();
        // this.mapBox.map.setZoom(currZoom - 1);

        // this.initzoom = this.initzoom || this.mapBox.getZoom();
        child && child[0] && this.mapBox.centerGeometries([child[0].geometry]);

        // this.$emit('mapSelected', selectGeo);
        selectGeo.length && this.mapBox.setSelected(selectGeo);
      });
    },
    // 初始化列表
    initTask() {
      let param = {
        schemaId: this.schemaId,
        searchFlag: '1',
      };
      querySpliceTask(param).then(data => {
        if (data && data.resultData && data.resultData.length > 0) {
          this.initTaskList = data.resultData;
          this.taskList = data.resultData;
          this.cableFilter();
        }
        console.log(data);
      });
    },

    //下拉选择关闭
    checkTap(searchDispState, filterName) {
      this.searchDispState = searchDispState;
      this.filterName = filterName;
      // this.$refs.search.hideInput(); //刷新一次视图
      // this.initTask(); //再次刷新视图
      this.cableFilter();
      this.$refs.popover.close();
    },

    // 发单
    launch(taskInfo) {
      let option = {
        param: {
          schemaId: this.schemaId,
          resIdList: [taskInfo.resID],
        },
        resType: taskInfo.resType,
      };
      this.$refs.splicePreview.initSpliceList(option);
      // let param = {
      //     schemaId: this.schemaId,
      //     resIdList: [resId],
      // };
      // addBuildTask(param).then(data => {
      //     this.initTask();
      // });
    },
    launchSuccess() {
      this.initTask();
    },
    // 过滤列表
    cableFilter() {
      let taskList = this.initTaskList;
      if (this.searchDispState) {
        let newTaskList = [];
        this.initTaskList.map(item => {
          const fil = item.taskList.filter(it => it.dispState === this.searchDispState);
          if (fil.length) {
            newTaskList.push({
              ...item,
              taskList: fil,
            });
          }
        });
        taskList = newTaskList;
      }
      if (this.searchValue) {
        this.taskList = taskList.filter(task => task.name.toUpperCase().indexOf(this.searchValue.toUpperCase()) > -1);
        this.taskList.forEach(task => {
          task.nameArr = [];
          this.splitStr(task.name, this.searchValue, task.nameArr);
        });
      } else {
        this.taskList = taskList;
      }
      this.taskList = JSON.parse(JSON.stringify(this.taskList));
    },

    // 字符串截取
    splitStr(longStr, shortStr, arr) {
      let index = longStr.toUpperCase().indexOf(shortStr.toUpperCase());
      if (index > -1) {
        if (longStr.substring(0, index)) {
          arr.push(longStr.substring(0, index));
        }
        arr.push(longStr.substring(index, index + shortStr.length));
        if (longStr.substring(index + shortStr.length)) {
          this.splitStr(longStr.substring(index + shortStr.length), shortStr, arr);
        }
      } else {
        arr.push(longStr);
      }
    },
  },
  watch: {
    searchValue() {
      // 搜索
      this.cableFilter();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './SpliceTask.scss';
</style>