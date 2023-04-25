<template>
  <div class="projectReportBox">
    <span class="leftChartBox">
      <div class="leftItemBox flex1">
        <div class="topoImgListBox">
          <div class="imgItemBox" @click="toSplTopo" style="z-index:5;">
            <span class="imgName" :class="{active:currImgType === 'splitterTopo'}">{{$t('PROJECT_SPLITTER_DIAGRAM')}}</span>
            <span class="imgShow">
              <img src="oss_core/edesign/assets/image/project/splitterDiagram.png" alt="">
            </span>
          </div>
          <div class="imgItemBox" @click="toRouteTopo" style="z-index:4;">
            <span class="imgName" :class="{active:currImgType === 'fiberRouteTopo'}">{{$t('PROJECT_POTICAL_CONN_DIAGRAM')}}</span>
            <span class="imgShow">
              <img src="oss_core/edesign/assets/image/project/connDiagram.png" alt="">
            </span>
          </div>
          <div class="imgItemBox" @click="toSchemaTopo" style="z-index:3;">
            <span class="imgName" :class="{active:currImgType === 'schemaResource'}">{{$t('PROJECT_POTICAL_CABLE_TOPO')}}</span>
            <span class="imgShow">
              <img src="oss_core/edesign/assets/image/project/cableTopo.png" alt="">
            </span>
          </div>

          <div class="imgItemBox" @click="toHldOverView('cable')" style="z-index:4;">
            <span class="imgName" :class="{active:mapType === 'cable'}">{{$t('PROJECT_POTICAL_ROUTING')}}</span>
            <span class="imgShow">
              <img src="oss_core/edesign/assets/image/project/poticalRouting.png" alt="">
            </span>
          </div>

          <div class="imgItemBox" @click="toHldOverView('supportSection')" style="z-index:2;">
            <span class="imgName" :class="{active:mapType === 'supportSection'}">{{$t('PROJECT_PIPELINE_ROUTING')}}</span>
            <span class="imgShow">
              <img src="oss_core/edesign/assets/image/project/pipelineRouting.png" alt="">
            </span>
          </div>
          <!-- <img @click="toHldOverView('cable')" src="oss_core/edesign/assets/image/project/cableTopo.png" alt=""> -->
        </div>
      </div>
    </span>
    <span class="rightMabBox">
      <div class="headTitle">{{currShowName}}</div>
      <div class="mapContentBox" ref="mapContentBox">
        <div v-if="currImgType==='splitterTopo'" ref="splitterTopoContent" style="width:100%;height:100%;"></div>
        <SchemaResourceRouteTopo v-if="currImgType==='schemaResource'" :params="projectInfo"></SchemaResourceRouteTopo>
        <FiberRouteTopo v-if="currImgType == 'fiberRouteTopo'" :params="projectInfo"></FiberRouteTopo>
        <HldOverview v-if="currImgType == 'toHldOverView'" :key="mapType" :queryData="projectInfo" :mapType="mapType" :sprintId="projectInfo&&projectInfo.sprintId"></HldOverview>
      </div>
    </span>
  </div>
</template>

<script>
import echart from 'echarts';
import { queryProjectConStructionData } from '@/oss_core/edesign/api/query/project.js';
import SchemaResourceRouteTopo from '@/oss_core/edesign/topo/design/SchemaResourceRouteTopo.vue';
import FiberRouteTopo from '@/oss_core/edesign/topo/design/FiberRouteTopo1.vue';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';
export default {
  name: 'ConstructionProgress',
  props: {
    projectInfo: Object,
  },
  components: {
    SchemaResourceRouteTopo,
    FiberRouteTopo,
    HldOverview,
  },
  data() {
    return {
      currImgType: '',
      currShowName: '',
      paramsData: {},
      mapType: '',
    };
  },

  create() {},

  mounted() {
    this.toSplTopo();
  },

  methods: {
    toSplTopo() {
      console.log('设置splitterTopo');

      if (this.currImgType === 'splitterTopo') {
        return;
      }
      this.currImgType = 'splitterTopo';
      this.currShowName = this.$t('PROJECT_SPLITTER_DIAGRAM');
      fish.require(['oss_core/im/project/views/ProjectSplitterTopoView.js'], aDialog => {
        let options = {
          PROJECT_ID: this.projectInfo && this.projectInfo.sprintId,
          WIDTH: this.$refs.splitterTopoContent.offsetWidth,
          HEIGHT: this.$refs.splitterTopoContent.offsetHeight,
        };
        console.log('options:', options);
        let view = new aDialog(options);
        view.render();
        this.$refs['splitterTopoContent'].append(view.el);
        view.resize();
      });
    },
    toSchemaTopo() {
      if (this.currImgType === 'schemaResource') {
        return;
      }
      console.log('设置schemaResource');
      this.currImgType = 'schemaResource';
      this.currShowName = this.$t('PROJECT_POTICAL_CABLE_TOPO');
    },
    toRouteTopo() {
      if (this.currImgType === 'fiberRouteTopo') {
        return;
      }
      this.currImgType = 'fiberRouteTopo';
      this.currShowName = this.$t('PROJECT_POTICAL_CONN_DIAGRAM');
    },
    toHldOverView(mapType) {
      this.currImgType = 'toHldOverView';
      this.mapType = mapType;
      if (mapType === 'cable') {
        this.currShowName = this.$t('PROJECT_POTICAL_ROUTING');
      } else {
        this.currShowName = this.$t('PROJECT_PIPELINE_ROUTING');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../index.scss';
</style>