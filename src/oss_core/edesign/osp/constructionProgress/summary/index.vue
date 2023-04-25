<template>
  <div class="summary-con">
    <div class="img-con">
      <img class="img" src="oss_core/edesign/assets/image/task/construction.png" />
      <!-- <img class="img" src="oss_core/edesign/assets/image/project/BulletinItemIcon.png" /> -->
      <div class="title">{{ $t('TOTAL_PROGRESS') }}</div>
    </div>
    <div class="process-con">
      <div class="item-process-con">
        <el-progress text-color="white" :text-inside="true" :stroke-width="16" :percentage="coveredRatio"></el-progress>
      </div>
      <div class="text-con">
        <div class="text-constructed">
          <span class="info-it-title">{{ $t('COMPLETE') }}</span>
          <span class="info-it-val m-l-small">{{ constructed }}</span>
        </div>
        <div class="text-total">
          <span class="info-it-title">{{ $t('TOTAL') }}</span>
          <span class="info-it-val m-l-small">{{ covered }}</span>
        </div>
      </div>
    </div>
    <div class="number-con">
      <div class="info-it-title">{{ $t('PROJECT_COVER_HPS') }}</div>
      <div class="m-t info-it-val">{{ coverHPs }}</div>
    </div>
    <div class="number-con">
      <div class="info-it-title">{{ $t('HP_REDUNDANCY') }}</div>
      <div class="m-t info-it-val">{{ hpRedundancyRatio }}%</div>
    </div>
  </div>
</template>

<script>
import { queryConstructionGrogress } from '@/oss_core/edesign/api/query/project.js';
export default {
  name: 'SummaryPanel',
  props: {
    projectId: {
      type: String,
    },
  },
  inject: ['getInitData'],
  components: {},

  data() {
    return {
      coverHPs: 0,
      covered: 0,
      hpRedundancyRatio: '',
      coveredRatio: 0,
      constructed: 0,
    };
  },

  created() {},

  mounted() {
    queryConstructionGrogress(this.projectId).then(res => {
      let { data } = res;
      if (data) {
        let { coverHPs, covered, hpRedundancyRatio, coveredRatio, constructed } = data;
        this.coverHPs = coverHPs;
        this.covered = covered;
        this.hpRedundancyRatio = hpRedundancyRatio;
        (this.coveredRatio = parseFloat(coveredRatio)), (this.constructed = constructed);
      }
    });
  },

  methods: {
    handleChange(val) {
      console.log(val);
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
