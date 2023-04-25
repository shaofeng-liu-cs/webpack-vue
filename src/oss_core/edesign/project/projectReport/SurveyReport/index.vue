<template>
  <div class="projectReportBox">
    <span class="leftChartBox">
      <div class="leftItemBox m-b flex1">
        <div class="headTitle">{{$t('PROJECT_SURVEYREPORT')}}</div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL_USERS')}}</span>
          <span class="labVal">{{surveyData.ALL_USER_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL_BUILDINGS')}}</span>
          <span class="labVal">{{surveyData.ALL_BUILD_NUM}}</span>
        </div>
        <div class="fgx"></div>
        <div class="chartBox" ref="chartBox"></div>
      </div>
      <div class="leftItemBox flex1">
        <div class="headTitle">{{$t('PROJECT_SURVEY_TASKS')}}</div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_COMPLETED')}}</span>
          <span class="labVal">{{surveyData.COMPLETE_TASK_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_DOING')}}</span>
          <span class="labVal">{{surveyData.RUNNING_TASK_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL_TIME')}}</span>
          <span class="labVal">{{surveyData.ALL_COM_TASK_TIME_NUM}}</span>
        </div>
      </div>
    </span>
    <span class="rightMabBox">
      <div class="headTitle">{{$t('PROJECT_MAP')}}</div>
      <div class="mapContentBox">
        <HldOverview mapType="investigation" :queryData="projectInfo" :sprintId="projectInfo&&projectInfo.sprintId"></HldOverview>
      </div>
    </span>
  </div>
</template>

<script>
import echart from 'echarts';
import { queryProjectSurveyData } from '@/oss_core/edesign/api/query/project.js';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';

export default {
    name: 'SurveyReport',
    props: {
        projectInfo: Object,
    },
    components: {
        HldOverview,
    },
    data() {
        console.log('params_projectInfo:', JSON.stringify(this.projectInfo || {}));
        return {
            surveyData: {},
        };
    },

    create() {},

    mounted() {
        this.loadSurveyData();
    },

    methods: {
        loadSurveyData() {
            queryProjectSurveyData(this.projectInfo && this.projectInfo.sprintId).then(res => {
                this.surveyData = res.DATA || {};
                this.loadCharts();
            });
        },
        loadCharts() {
            this.chartsUser = echart.init(this.$refs.chartBox);
            let option = {
                title: {
                    text: this.$t('PROJECT_BUILDING'),
                    textStyle: {
                        fontSize: 14,
                        fontWeight: 500,
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                },
                legend: {
                    data: [this.$t('PROJECT_USERS'), this.$t('PROJECT_BUILDING')],
                    right: 0,
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                yAxis: {
                    type: 'value',
                    axisLine: { show: false },
                    boundaryGap: [0, 0.01],
                },
                xAxis: {
                    type: 'category',
                    data: [this.$t('PROJECT_SINGLE_BUILDING'), this.$t('PROJECT_SINGLE_APARTMENT')],
                },
                series: [
                    {
                        name: this.$t('PROJECT_USERS'),
                        type: 'bar',
                        data: [this.surveyData.LH_ALL_USER_NUM, this.surveyData.MUHR_ALL_USER_NUM],
                        itemStyle: {
                            color: '#E98B4B',
                        },
                    },
                    {
                        name: this.$t('PROJECT_BUILDING'),
                        type: 'bar',
                        data: [this.surveyData.LH_ALL_BUILD_NUM, this.surveyData.MUHR_ALL_BUILD_NUM],
                        itemStyle: {
                            color: '#5B8FF9',
                        },
                    },
                ],
            };
            this.chartsUser.setOption(option);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../index.scss';
</style>