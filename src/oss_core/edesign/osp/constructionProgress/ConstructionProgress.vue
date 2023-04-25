<template>
  <div class="construction-progress-box sys-card-box">
    <div class="box-head-title">
      <div class="left-title">
        {{ $t('PROJECT_CONSTRUCTION_PROGRESS') }}
      </div>
    </div>
    <div class="head-content">
      <SummaryPanel :projectId="projectInfo.projectId" />
    </div>
    <div class="container-body-box">
      <span class="left-map-box">
        <FiberRouteTopo v-if="mapParentType == 'fiberRouteTopo'" :params="projectInfo"></FiberRouteTopo>
        <HldOverview
          v-if="mapParentType == 'toHldOverView'"
          :key="mapType"
          :queryData="projectInfo"
          :mapType="mapType"
          :sprintId="projectInfo && projectInfo.sprintId"
        ></HldOverview>
      </span>
      <span class="right-desc-box">
        <div class="box-head-title">
          <div class="left-title">
            {{ $t('CONSTRUCTION_TASK') }}
          </div>
          <span class="color-right">
            <div class="text">{{ $t('PLANNING') }}</div>
            <div class="color-box planning-color"></div>
            <div class="text">{{ $t('CONSTRUCTING') }}</div>
            <div class="color-box constructing-color"></div>
            <div class="text">{{ $t('CONSTRUCTED') }}</div>
            <div class="color-box constructed-color"></div>
          </span>
        </div>
        <div class="task-panel-container">
          <el-scrollbar>
            <TaskPanel :projectId="projectInfo.projectId" @changeMapType="changeMapType" />
          </el-scrollbar>
        </div>
      </span>
    </div>
  </div>
</template>
<script>
import FiberRouteTopo from '@/oss_core/edesign/topo/design/FiberRouteTopo.vue';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';
import SummaryPanel from '@/oss_core/edesign/osp/constructionProgress/summary/index.vue';
import TaskPanel from '@/oss_core/edesign/osp/constructionProgress/taskPanel/index.vue';

export default {
  name: 'ConstructionProgress',
  props: {},
  inject: ['getInitData'],
  components: {
    FiberRouteTopo,
    HldOverview,
    SummaryPanel,
    TaskPanel,
  },
  data() {
    return {
      projectInfo: this.getInitData().projectInfo || {
        projectId: '230325142114138862',
      }, //工程详情
      mapParentType: 'toHldOverView', //fiberRouteTopo:光缆接续图，toHldOverView：光缆路由图和基础设施
      mapType: 'construction', //cable：光缆路由图,supportSection：基础设施
    };
  },

  created() {},

  mounted() {},

  methods: {
    // changeMapType(type) {
    //   console.log('切换地图：', type);
    //   if (type) {
    //     if (type === '1') {
    //       //光缆路由
    //       this.mapParentType = 'toHldOverView';
    //       this.mapType = 'construction';
    //     } else if (type === '2') {
    //       //基础设施
    //       this.mapParentType = 'toHldOverView';
    //       this.mapType = 'construction';
    //     } else if (type === '3') {
    //       //光纤接续设施
    //       this.mapParentType = 'fiberRouteTopo';
    //       this.mapType = '';
    //     }
    //   }
    // },
  },
};
</script>
<style lang="scss" scoped>
@import './constructionProgress.scss';
</style>
