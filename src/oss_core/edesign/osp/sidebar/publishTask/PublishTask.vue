<template>
  <div class="construction-task">
    <div class="row-btn-two" v-if="launchFlag">
      <div class="btn btn-primary" @click="initTask()">{{$t('REFRESH')}}</div>
      <div class="btn btn-primary" :class="{disabled: !canLaunch}" @click="isLaunch">{{$t('LAUNCH')}}</div>
    </div>
    <div v-else class="btn btn-primary row-btn" @click="initTask()">{{$t('REFRESH')}}</div>
    <div class="task-list">
      <el-scrollbar>
        <div class="task-content" v-for="(item, index) in taskList" :key="index">
          <div>
            <div>{{$t('NAME')}}：</div>
            <el-tooltip class="item" effect="light" :content="item.title" placement="bottom-start">
              <div>{{item.title}}</div>
            </el-tooltip>
          </div>
          <div>
            <div>{{$t('OSP_TASK_TASK_STATUS')}}：</div>
            <el-tooltip class="item" effect="light" :content="item.orderStateName" placement="bottom-start">
              <div>{{item.orderStateName}}</div>
            </el-tooltip>
          </div>
          <div>
            <div>{{$t('OSP_MECHANCIAL_TRIGGER_STAFF')}}：</div>
            <el-tooltip class="item" effect="light" :content="item.createUserName || 'N/A'" placement="bottom-start">
              <div>{{item.createUserName || 'N/A'}}</div>
            </el-tooltip>
          </div>
          <div>
            <div>{{$t('OSP_MECHANCIAL_TRIGGER_TIME')}}：</div>
            <el-tooltip class="item" effect="light" :content="item.createDate || 'N/A'" placement="bottom-start">
              <div>{{item.createDate || 'N/A'}}</div>
            </el-tooltip>
          </div>
          <div>
            <div>{{$t('OSP_TASK_FINISH_TIME')}}：</div>
            <el-tooltip class="item" effect="light" :content="item.realFinishDate || 'N/A'" v-if="searchValue" placement="bottom-start">
              <div>{{item.realFinishDate || 'N/A'}}</div>
            </el-tooltip>
          </div>
          <div class="task-child-foot">
            <div @click="resShow(item.orderId)">{{$t('CONSTR_MANAGE_RESOURCES')}}</div>
            <!-- <div @click="launch" v-if="constrRequired === 'Y'">{{$t('LAUNCH')}}</div> -->
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="sidebar-tab-title">{{$t('E_PUBLISH_TASK_RES_STATISTICS')}}</div>
    <div class="task-total">
      <div class="task-total-tap">
        <el-radio-group v-model="laberName" size="mini" @change="laberChange" class="label-grow">
          <el-radio-button :label="i18n.resources" :title="i18n.resources"></el-radio-button>
          <el-radio-button :label="i18n.connection" :title="i18n.connection"></el-radio-button>
          <el-radio-button :label="i18n.address" :title="i18n.address"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="task-total-grid" v-if="laberName==='Address'">
        <el-table :data="showGridData" border style="width: 100%" height="100%">
          <el-table-column :label="$t('OSP_TASK_DESIGNED')" prop="covered" min-width="100px"></el-table-column>
          <el-table-column :label="$t('OSP_TASK_SYNCHRONIZED')" prop="synced" min-width="100px"></el-table-column>
        </el-table>
      </div>
      <div class="task-total-grid" v-else>
        <el-table :data="showGridData" border style="width: 100%" height="100%">
          <el-table-column :label="$t('BATCH_REFER_RESOURCE_TYPE')" prop="resTypeDesc" width="130px"></el-table-column>
          <el-table-column :label="$t('OSP_TASK_DESIGNED')" prop="designed" width="95px"></el-table-column>
          <el-table-column :label="$t('OSP_TASK_SYNCHRONIZED')" prop="synced"></el-table-column>
        </el-table>
      </div>
    </div>
    <Resources ref="resources"></Resources>
    <SelectSplice ref="selectSplice" @launch="launch"></SelectSplice>
  </div>
</template>

<script>
import { queryPublishTask, queryPublishStatisticsRes } from '@/oss_core/edesign/api/query/schema.js';
import { addPublishTask } from '@/oss_core/edesign/api/add/resId.js';
import Resources from './resources/Resources.vue';
import SelectSplice from './selectSplice/SelectSplice.vue';

export default {
  name: 'PublishTask',
  components: {
    Resources,
    SelectSplice,
  },
  inject: ['getProjectInfo'],
  data() {
    return {
      searchValue: '', //搜索关键词
      taskList: [], //条件过滤后任务单列表
      schemaId: this.getProjectInfo().schemaId, //任务单ID
      canLaunch: false, //是否可以发单
      showGridData: [],
      i18n: {
        resources: this.$t('CONSTR_MANAGE_RESOURCES'),
        connection: this.$t('OSP_TASK_CONNECTION'),
        address: this.$t('ADDRESS'),
      },
      laberName: '',
      statisticsData: null, //统计数据
      constrRequired: this.getProjectInfo().constrRequired,
      launchFlag: true, //是否可以发起publish单
    };
  },
  props: {
    routeList: {
      type: Array,
    },
  },
  created() {},
  mounted() {
    this.initTask();
    console.log(this.constrRequired);
    // 如果不是CO设计，不需要自己发单
    if (this.getProjectInfo().networkLevel && this.getProjectInfo().networkLevel !== 'CO') {
      this.launchFlag = false;
    }
  },
  activated() {
    this.initTask();
  },
  methods: {
    // 初始化列表
    initTask(routeList) {
      let param = {
        schemaId: this.schemaId,
      };
      if (routeList || this.routeList) {
        routeList = routeList ? routeList : this.routeList;
        param.resIdList = [];
        routeList.map((item) => {
          if (item.resId) {
            param.resIdList.push(item.resId);
          }
        });
      }
      queryPublishTask(param).then((data) => {
        if (data && data.resultData && data.resultData.length > 0) {
          this.taskList = data.resultData;
          this.canLaunch = !this.taskList.some((task) => task.orderState !== 'C'); //如果有一个没有完成则不能发单
        } else {
          this.canLaunch = true;
        }
        console.log(data);
      });
      if (routeList || this.routeList) {
        let gisKeyList = routeList.map((item) => {
          return item.gisKey;
        });
        param = gisKeyList;
      } else {
        param = [];
      }
      queryPublishStatisticsRes(param, this.schemaId).then((res) => {
        console.log(res);
        this.statisticsData = res.data ||
          data || {
            linkList: [],
            resList: [],
            addressList: [],
          };
        this.showGridData = this.statisticsData.resList;
        this.laberName = this.i18n.resources;
      });
    },

    isLaunch() {
      if (!this.canLaunch) {
        return;
      }
      if (this.constrRequired === 'Y') {
        this.$refs.selectSplice.initSpliceList();
      } else {
        this.launch();
      }
    },
    launch(orderIdList = []) {
      let param = {
        schemaId: this.schemaId,
        orderIdList: orderIdList,
      };
      addPublishTask(param).then((data) => {
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        this.initTask();
      });
    },
    laberChange(laber) {
      switch (laber) {
        case this.i18n.resources:
          this.showGridData = this.statisticsData.resList;
          break;
        case this.i18n.connection:
          this.showGridData = this.statisticsData.linkList;
          break;
        case this.i18n.address:
          this.showGridData = this.statisticsData.addressList;
          break;
        default:
          break;
      }
    },
    resShow(orderId) {
      this.$refs.resources.init(orderId);
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
@import './PublishTask.scss';
</style>