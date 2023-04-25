<template>
  <div class="task-collapse">
    <el-tooltip
      effect="light"
      :content="`${constCatName}: (${$t('CONSTRUCTED')}：${constructedCount},${$t('TOTAL')}${total})`"
      placement="bottom-start"
    >
      <div class="task-title" v-on:click="toggleShow">
        <i v-if="openKey === constCatId" class="el-icon-arrow-down"></i>
        <i v-else class="el-icon-arrow-right"></i>
        <div class="title-text">{{ constCatName }}</div>

        <div class="process-con">
          <div class="item-process-con">
            <el-progress :percentage="percentage"></el-progress>
          </div>
          <div class="text-con">
            <div class="text-constructed">{{ $t('CONSTRUCTED') }}：{{ constructedCount }}</div>
            <div class="text-total">{{ $t('TOTAL') }}{{ total }}</div>
          </div>
        </div>
        <el-button v-if="constSchemeIdList" class="white" type="text" v-on:click.stop="showDialog">Detail</el-button>
      </div>
    </el-tooltip>
    <div v-show="openKey === constCatId" class="task-detail-list">
      <div :id="chartDOMId" :style="{ width: '540px', height: domHeight + 'px' }"></div>
      <!-- <div v-for="(detailItem, index) in taskDetailList" :key="index" class="task-detial-item">
        <div class="task-detail-item-left">{{detailItem.itemName}}</div>
        <div class="task-detail-item-right">
          <div class="text-planing">{{$t('PLANNING')}}：{{detailItem.planningCount}}</div>
          <div class="text-constructing">{{$t('CONSTRUCTING')}}：{{detailItem.constructingCount}}</div>
          <div class="text-constructed">{{$t('CONSTRUCTED')}}：{{detailItem.constructedCount}}</div>
        </div>
      </div> -->
    </div>
    <div v-if="dialogVisible">
      <DetailDialog
        :title="constCatName"
        :dialogVisible="dialogVisible"
        :projectId="projectId"
        :constSchemeIdList="constSchemeIdList"
        @close="closeDialog"
      />
    </div>
  </div>
</template>
<script>
import echart from 'echarts';
import DetailDialog from '@/oss_core/edesign/osp/constructionProgress/detailDialog/index.vue';

export default {
  name: 'TaskCollapse',
  props: {
    openKey: '',
    taskInfo: {
      type: Object,
    },
  },
  inject: ['getInitData'],
  components: {
    DetailDialog,
  },

  data() {
    let {
      projectId,
      constSchemeIdList,
      constCatId,
      constCatName,
      constructedCount,
      total,
      percentage,
      planningCount,
      consSuppliecBomGroupChildDTOList = [],
    } = this.taskInfo;
    let length = (consSuppliecBomGroupChildDTOList && consSuppliecBomGroupChildDTOList.length) || 0;
    let domHeight = (length + 1) * 30 + 20;
    return {
      chartDOMId: `chart${constCatId}`,
      domHeight,
      dialogVisible: false,
      projectId,
      constSchemeIdList,
      constCatId,
      constCatName,
      constructedCount,
      total,
      planningCount,
      percentage: (percentage && parseFloat(percentage)) || 0,
      taskDetailList: consSuppliecBomGroupChildDTOList || [],
    };
  },

  created() {},

  mounted() {
    let chartDOM = document.getElementById(this.chartDOMId);
    let myChart = echart.init(chartDOM);
    let nameData = [];
    let planningData = [];
    let constructingData = [];
    let constructedData = [];
    this.taskDetailList.forEach(item => {
      let { itemName, constructingCount, constructedCount } = item;
      nameData.push(itemName);
      planningData.push(0);
      constructingData.push(constructingCount);
      constructedData.push(constructedCount);
    });
    nameData.push(this.$t('PLANNING'));
    planningData.push(this.planningCount);
    constructingData.push(0);
    constructedData.push(0);
    let option = {
      color: ['#df1d1d', '#2e6ceb', '#5eac25'],
      tooltip: {
        trigger: 'item',
        confine: false,
        position: ['20%', '50%'],
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '2%',
        right: '4%',
        top: '4%',
        bottom: '4%',
        containLabel: true,
      },
      textStyle: {
        color: '#999',
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: nameData,
      },
      series: [
        {
          name: this.$t('PLANNING'),
          type: 'bar',
          stack: 'total',
          label: {
            show: false,
          },
          emphasis: {
            focus: 'series',
          },
          data: planningData,
        },
        {
          name: this.$t('CONSTRUCTING'),
          type: 'bar',
          stack: 'total',
          label: {
            show: false,
          },
          emphasis: {
            focus: 'series',
          },
          data: constructingData,
        },
        {
          name: this.$t('CONSTRUCTED'),
          type: 'bar',
          stack: 'total',
          label: {
            show: false,
          },
          emphasis: {
            focus: 'series',
          },
          data: constructedData,
        },
      ],
    };
    myChart.setOption(option);
  },

  methods: {
    toggleShow() {
      this.$emit('changeOpenKey', this.constCatId);
    },
    showDialog() {
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
