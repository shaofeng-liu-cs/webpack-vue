<template>
  <div class="acceptance-project-box">
    <span class="left-map-box">
      <FiberRouteTopo v-if="mapParentType == 'fiberRouteTopo'" :params="mapParams"></FiberRouteTopo>
      <HldOverview
        v-if="mapParentType == 'toHldOverView'"
        :key="mapType"
        :queryData="mapParams"
        :mapType="mapType"
        :sprintId="mapParams && mapParams.sprintId"
      ></HldOverview>
    </span>
    <span class="right-card-box">
      <div class="card-head-box">
        <span class="head-title">{{ $t('COMPLETE_CONSTRUCTION_INSPETION') }}</span>
        <!-- <span class="head-exar">{{$t('COMPLETE_RULES_AUTOMATIC')}}</span> -->
      </div>
      <div class="card-body-box">
        <el-scrollbar>
          <div
            class="inspetion-item"
            v-for="(item, i) in acceptanceList"
            :key="i"
            @click="openAccep(item)"
            :class="{ active: openAccepTypeId === item.typeId }"
          >
            <div class="inspetion-head">
              <span class="head-title">{{ item.typeName }}</span>
              <span class="head-right">
                <span>{{ $t('COMPLETE_CONSTRUCTED') }}: {{ item.totalComplete }}</span>
                <span class="proress-box"><el-progress :percentage="item.completePercentage"></el-progress></span>
                <span>{{ $t('PROJECT_TOTAL') }}: {{ item.total }}</span>
              </span>
            </div>
            <div class="inspetion-content">
              <el-badge :value="item.onlineTaskNum" class="task-btn-item">
                <el-button @click.stop="showDeailModal(item.typeId, 'ONLINE_INSP')" size="small">{{ $t('COMPLETE_INITIALIZING_TASK') }}</el-button>
              </el-badge>
              <el-badge :value="item.fieldTaskNum" class="task-btn-item">
                <el-button @click.stop="showDeailModal(item.typeId, 'FIELD_INSP')" size="small">{{ $t('COMPLETE_FIELD_INSPECTION_TASK') }}</el-button>
              </el-badge>
              <el-badge :value="item.rectificationTaskNum" class="task-btn-item">
                <el-button @click.stop="showDeailModal(item.typeId, 'RECTIFICATION')" size="small">{{ $t('COMPLETE_RECTIFICATION_TASK') }}</el-button>
              </el-badge>
            </div>
            <div class="inspetion-lld-list" v-if="openAccepTypeId === item.typeId">
              <div
                class="lld-item"
                v-for="(lld, ind) in item.lldList"
                :key="ind"
                :class="{ active: selectedLLD === `${item.typeId}_${lld.taskId}` }"
                @click.stop="selectLLD(`${item.typeId}_${lld.taskId}`)"
              >
                {{ lld.title }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </span>
    <Popup :popupObj="taskListObj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <div class="task-modal-content-box">
          <div class="head-filter-box">
            <el-form :inline="true" :model="searchFormVal" ref="searchForm">
              <!-- <el-form-item :label="$t('COMPLETE_MODAL_TECHNOLOGY_CATEGORY')">
                <el-select v-model="searchFormVal.constCatId" :placeholder="$t('PLEASE_SELECT')">
                  <el-option v-for="item in allTypeData.constCat" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
              </el-form-item> -->
              <el-form-item :label="$t('COMPLETE_MODAL_ACCEPTANCE_TASK')">
                <el-select v-model="searchFormVal.taskType" :placeholder="$t('PLEASE_SELECT')">
                  <el-option v-for="item in allTypeData.taskType" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('COMPLETE_TRAJECTORRY_TASK_STATE')">
                <el-select v-model="searchFormVal.taskState" :placeholder="$t('PLEASE_SELECT')">
                  <el-option v-for="item in allTypeData.taskState" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitSearch">{{ $t('HLD_WIZARD_Query') }}</el-button>
                <!-- <el-button @click="resetForm">{{$t('HLD_WIZARD_Reset')}}</el-button> -->
              </el-form-item>
            </el-form>
          </div>
          <div class="table-content">
            <el-table :data="taskList" ref="taskTable" style="width: 100%" height="100%" border>
              <el-table-column prop="constCatName" :label="$t('COMPLETE_MODAL_TECHNOLOGY_CATEGORY')" width="200"> </el-table-column>
              <el-table-column prop="taskTypeName" :label="$t('COMPLETE_MODAL_ACCEPTANCE_TASK')" width="150"> </el-table-column>
              <el-table-column prop="resSpecName" :label="$t('CONSTRUCTION_SCHEME_RESOURCE_SPE')" width="170"> </el-table-column>
              <el-table-column prop="resName" :label="$t('COMPLETE_MODAL_RESOURCE_OBJECT')"> </el-table-column>
              <el-table-column prop="taskStateName" :label="$t('COMPLETE_TRAJECTORRY_TASK_STATE')" width="150"> </el-table-column>
              <el-table-column prop="accepResultName" :label="$t('COMPLETE_TRAJECTORRY_RESULT')" width="150"> </el-table-column>
              <el-table-column align="center" width="85" :label="$t('OPERATIONS')">
                <template slot-scope="scope">
                  <span class="text-btn-bg cursor-hover" @click="toTaskDetail(scope.row)">{{ $t('DETAIL') }}</span>
                </template>
              </el-table-column>
              <div slot="empty">
                <el-empty
                  class="nodata-box"
                  image="oss_core/edesign/assets/image/no_data.png"
                  :image-size="50"
                  :description="$t('NO_DATA')"
                ></el-empty>
              </div>
            </el-table>
          </div>
          <div style="text-align: right;" class="m-t">
            <el-pagination background layout="prev, pager, next" @current-change="changePageIndex" :page-count="totalPage"> </el-pagination>
          </div>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import FiberRouteTopo from '@/oss_core/edesign/topo/design/FiberRouteTopo1.vue';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';
import { queryTaskStatistics, queryTaskComboxdata, queryAcceptanceTaskTaskList } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'AcceptanceProject',
  props: {
    projectInfo: {},
  },
  components: {
    FiberRouteTopo,
    HldOverview,
  },
  data() {
    return {
      selectedLLD: '',
      openAccepTypeId: '',
      searchFormVal: {},
      mapParentType: '', // fiberRouteTopo:光缆接续图，toHldOverView：光缆路由图和基础设施
      mapType: '', // cable：光缆路由图,supportSection：基础设施
      // isOpenDetail:false,//记录是否在弹框操作打开过详情
      taskListObj: {
        title: this.$t('COMPLETE_MODAL_SAMPLING_TASK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '90%',
        height: '550px',
        show: false,
        drag: true,
        body: true,
        zIndex: 3,
      },
      acceptanceList: [],
      allTypeData: {},
      taskList: [],
      pageIndex: 1,
      totalPage: 1,
      lldDataMap: {},
    };
  },

  create() {},

  mounted() {
    queryTaskComboxdata(this.projectInfo.projectId).then(res => {
      this.allTypeData = res.data || {};
    });
    this.initData(true);
  },

  methods: {
    initData(isInit) {
      queryTaskStatistics(this.projectInfo.projectId).then(res => {
        this.acceptanceList = (res.data || []).map(it => {
          it.lldList = it.lldTask || [];
          return it;
        });
        const openAccepTypeId = (this.acceptanceList[0] || {}).typeId;
        if (!isInit) {
          this.openAccepTypeId = openAccepTypeId;
        }
        if (openAccepTypeId) {
          const accep = this.acceptanceList[0] || {};
          const lld = (accep.lldList || [])[0] || {};
          if (lld.taskId) {
            this.selectedLLD = `${openAccepTypeId}_${lld.taskId}`;
          } else {
            this.changeMapData();
          }
        }
      });
    },
    selectLLD(id) {
      this.selectedLLD = id;
    },
    openAccep(data) {
      if (this.openAccepTypeId === data.typeId) {
        this.openAccepTypeId = '';
      } else {
        this.openAccepTypeId = data.typeId;
        if (!data.lldList || !data.lldList.length) {
          this.changeMapData();
        }
      }
    },
    showDeailModal(constCatId, taskType) {
      this.searchFormVal = {
        constCatId,
        taskType,
        taskState: 'P',
      };
      this.pageIndex = 1;
      this.taskListObj.show = true;

      // doLayout
    },
    toTaskDetail(obj) {
      this.isOpenDetail = true; //是否打开过详情
      // TaskTrajectory
      const menuId = 'TaskTrajectory';
      const mentTitle = obj.resName;
      const params = {
        choose: 'TaskTrajectory',
        taskBase: {
          projectId: obj.projectId,
          taskId: obj.taskId,
          constCatId: obj.constCatId,
        },
        isSingleMenu: true,
      };
      this.$root.$emit('openMenu', menuId, mentTitle, params);
    },
    popupClose() {
      if (this.isOpenDetail) {
        this.isOpenDetail = false;
        // 如果打开过则刷新数据
        this.initData();
      }
    },
    changePageIndex(page) {
      this.pageIndex = page;
      this.submitSearch();
    },
    submitSearch() {
      console.log('提交：', this.searchFormVal);
      queryAcceptanceTaskTaskList({
        projectId: this.projectInfo.projectId,
        ...this.searchFormVal,
        pageIndex: this.pageIndex,
        pageSize: 10,
      }).then(res => {
        const resdata = res.data || {};
        this.taskList = resdata.taskAccepDTOS || [];
        this.totalPage = Math.ceil(resdata.total / 10);
      });
    },
    resetForm() {
      this.pageIndex = 1;
      this.searchFormVal = {};
      this.$refs.searchForm.resetFields();
    },
    changeMapData() {
      const ids = this.selectedLLD.split('_');
      this.mapParams = {
        projectId: this.projectInfo.projectId,
        sprintId: this.projectInfo.projectId,
        schemaId: ids[1],
      };
      const typeId = ids[0] || this.openAccepTypeId;
      // if(this.openAccepTypeId=== '1001' || this.openAccepTypeId === '1002'){
      // //基础设施
      // }else
      if (typeId === '1003') {
        // 光缆路由
        this.mapParentType = 'toHldOverView';
        // this.mapType = 'cable';
        this.mapType = 'acceptance';
      } else if (typeId === '1005') {
        // 光纤接续图
        this.mapParentType = 'fiberRouteTopo';
        this.mapType = '';
      } else {
        // 基础设施
        this.mapParentType = 'toHldOverView';
        // this.mapType = 'construction';
        this.mapType = 'acceptance';
      }
    },
  },
  watch: {
    searchFormVal() {
      this.submitSearch();
    },
    selectedLLD() {
      this.changeMapData();
    },
    // openAccepTypeId() {
    //   this.changeMapData();
    // },
  },
};
</script>
<style lang="scss" scoped>
@import './acceptanceProject.scss';
</style>
