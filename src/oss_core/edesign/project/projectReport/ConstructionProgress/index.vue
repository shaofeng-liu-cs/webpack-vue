<template>
  <div class="projectReportBox">
    <span class="leftChartBox">
      <div class="leftItemBox m-b">
        <div class="headTitle">{{$t('PROJECT_CONSTRUCTION_PROGRESS')}}</div>
        <div class="progressBar">
          <!-- <div class="progress_back"></div> -->
          <div class="progress_fill" :style="`width:${queryData.CONSTRUCTION_PROGRESS||0}%;`">
            <div class="progress_num"><span class="numLabel">{{queryData.CONSTRUCTION_PROGRESS||0}}%</span></div>
          </div>

        </div>
        <!-- <Progressbar :min="1" :max="100" v-model="queryData.CONSTRUCTION_PROGRESS"></Progressbar> -->
      </div>
      <div class="leftItemBox m-b">
        <div class="headTitle">{{$t('PROJECT_BUILD_PROGRESS')}}{{`（${$t('PROJECT_WORK_LOAD')}${queryData.CROSS_CABLE_WORKLOAD},${$t('PROJECT_COMPANY')}）`}}</div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL')}}</span>
          <span class="labVal">{{queryData.ALL_CABLE_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_COMPLETED')}}</span>
          <span class="labVal">{{queryData.ALL_COMPLETE_CABLE_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_CONSTRUCTING')}}</span>
          <span class="labVal">{{queryData.ALL_CONSTRUCTION_CABLE_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_NOT_STARTED')}}</span>
          <span class="labVal">{{queryData.ALL_NOTSTART_CABLE_LENGTH_NUM}}</span>
        </div>
      </div>
      <div class="leftItemBox flex1">
        <div class="headTitle">{{$t('PROJECT_SPLICE_PROGRESS')}}{{`（${$t('PROJECT_WORK_LOAD')}${queryData.WELDING_WORKLOAD},${$t('PROJECT_COMPANY2')}）`}}</div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL')}}</span>
          <span class="labVal">{{queryData.ALL_SPLICE_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_COMPLETED')}}</span>
          <span class="labVal">{{queryData.ALL_COMPLETE_SPLICE_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_CONSTRUCTING')}}</span>
          <span class="labVal">{{queryData.ALL_CONSTRUCTION_SPLICE_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_NOT_STARTED')}}</span>
          <span class="labVal">{{queryData.ALL_NOTSTART_SPLICE_NUM}}</span>
        </div>
      </div>
    </span>
    <span class="rightMabBox">
      <div class="headTitle">{{$t('PROJECT_MAP')}}</div>
      <div class="mapContentBox">
        <HldOverview mapType="construction" :queryData="projectInfo" :sprintId="projectInfo&&projectInfo.sprintId"></HldOverview>
      </div>
    </span>
  </div>
</template>

<script>
import echart from 'echarts';
import { queryProjectConStructionData } from '@/oss_core/edesign/api/query/project.js';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';

export default {
    name: 'ConstructionProgress',
    props: {
        projectInfo: Object,
    },
    components: {
        HldOverview,
    },
    data() {
        return {
            queryData: {},
            progeress: 18,
        };
    },

    create() {},

    mounted() {
        this.loadData();
    },

    methods: {
        loadData() {
            queryProjectConStructionData(this.projectInfo.sprintId).then(res => {
                this.queryData = res.DATA || {};
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../index.scss';
</style>