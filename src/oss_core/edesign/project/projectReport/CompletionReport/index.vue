<template>
  <div class="projectReportBox">
    <span class="leftChartBox ">
      <div class="leftItemBox flex1">
        <div class="headTitle">{{$t('PROJECT_SUMMARY')}}</div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL_PON_PORTS')}}</span>
          <span class="labVal">{{queryData.ALL_OLT_PON_PORT_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_TOTAL_SPLITTERS')}}</span>
          <span class="labVal">{{queryData.ALL_SPILITTER_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_ACCESS_CAPACITY')}}</span>
          <span class="labVal">{{queryData.ALL_SPILITTER_USER_PORT_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_COVERED_USERS')}}</span>
          <span class="labVal">-</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_PIPE_LENGTH')}}</span>
          <span class="labVal">{{queryData.ALL_PIPE_GROUP_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_HOLE_LENGTH')}}</span>
          <span class="labVal">{{queryData.ALL_PIPE_POLE_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_CABLE_SEGMENTS_NUM')}}</span>
          <span class="labVal">{{queryData.ALL_CABLE_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_CABLE_SECTION_LENGTH')}}</span>
          <span class="labVal">{{queryData.ALL_CABLE_LENGTH_NUM}}</span>
        </div>
        <div class="showLabItem">
          <span class="labText">{{$t('PROJECT_CORES_CABLE')}}</span>
          <span class="labVal">{{queryData.ALL_CABLE_UNIT_NUM}}</span>
        </div>
      </div>

    </span>
    <span class="rightMabBox gray nopadding">
      <div class="chartListBox">
        <div class="chartItemBox m-b">
          <div class="chartBox" ref="chartBox1"></div>
          <div class="chartBox" ref="chartBox2"></div>
        </div>
        <div class="chartItemBox">
          <div class="chartBox" ref="chartBox3"></div>
          <div class="chartBox" ref="chartBox4"></div>
        </div>
      </div>
    </span>
  </div>
</template>

<script>
import echart from 'echarts';
import { queryProjectComPletionData } from '@/oss_core/edesign/api/query/project.js';

export default {
    name: 'CompletionReport',
    props: {
        projectInfo: Object,
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
            console.log('params_projectInfo:', this.projectInfo);
            queryProjectComPletionData(this.projectInfo.sprintId).then(res => {
                this.queryData = res.DATA || {};
                this.loadChart1();
            });
        },
        loadChart1() {
            let option = {
                title: {
                    left: 'center',
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
                xAxis: {
                    type: 'category',
                },
                yAxis: {
                    type: 'value',
                    axisLine: { show: false },
                },
                series: [
                    {
                        type: 'bar',
                        itemStyle: {
                            color: '#5B8FF9',
                        },
                    },
                ],
            };
            const { ALL_CABLE_LENGTH_BY_UNIT, ALL_CABLE_NUM_BY_UNIT, ALL_DEV_NUM_BY_RESSPECID, ALL_FAC_NUM_BY_RESSPECID } = this.queryData;
            let names1 = [];
            let vals1 = [];
            (ALL_CABLE_LENGTH_BY_UNIT || []).map(item => {
                names1.push(`${item.UNITS} ${this.$t('PROJECT_CORE')}`);
                vals1.push(item.CNT);
            });
            let option1 = JSON.parse(JSON.stringify(option));
            option1.title.text = this.$t('PROJECT_CABLE_MILEAGE');
            option1.xAxis.data = names1;
            option1.series[0].data = vals1;
            this.chartsUser1 = echart.init(this.$refs.chartBox1);
            this.chartsUser1.setOption(option1);

            let names2 = [];
            let vals2 = [];
            (ALL_CABLE_NUM_BY_UNIT || []).map(item => {
                names2.push(`${item.UNITS} ${this.$t('PROJECT_CORE')}`);
                vals2.push(item.CNT);
            });
            let option2 = JSON.parse(JSON.stringify(option));
            option2.title.text = this.$t('PROJECT_TOTAL_CABLES');
            option2.xAxis.data = names2;
            option2.series[0].data = vals2;
            this.chartsUser2 = echart.init(this.$refs.chartBox2);
            this.chartsUser2.setOption(option2);

            let names3 = [];
            let vals3 = [];
            (ALL_DEV_NUM_BY_RESSPECID || []).map(item => {
                names3.push(item.RES_SPEC_ID);
                vals3.push(item.CNT);
            });
            let option3 = JSON.parse(JSON.stringify(option));
            option3.title.text = this.$t('PROJECT_TOTAL_DEVICES');
            option3.xAxis.data = names3;
            option3.series[0].data = vals3;
            this.chartsUser3 = echart.init(this.$refs.chartBox3);
            this.chartsUser3.setOption(option3);

            let names4 = [];
            let vals4 = [];
            (ALL_FAC_NUM_BY_RESSPECID || []).map(item => {
                names4.push(item.RES_SPEC_ID);
                vals4.push(item.CNT);
            });
            let option4 = JSON.parse(JSON.stringify(option));
            option4.title.text = this.$t('PROJECT_INFRASTRUCTURE');
            option4.xAxis.data = names4;
            option4.series[0].data = vals4;
            this.chartsUser4 = echart.init(this.$refs.chartBox4);
            this.chartsUser4.setOption(option4);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../index.scss';
</style>