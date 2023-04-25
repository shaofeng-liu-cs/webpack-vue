<template>
  <div class="container">
    <div class="select">
      <h3>Node Selection</h3>
      <div>
        <div>
          <el-button type="primary" @click="select">Select</el-button>
          <label>{{ selectInfo.name }}</label>
        </div>
        <div>
          <el-button type="primary" :disabled="!selected" @click="search">Search</el-button>
        </div>
      </div>
    </div>
    <div class="type">
      <h3>View Type</h3>
      <div>
        <el-radio-group v-model="viewType" class="label-grow">
          <el-radio-button label="Design"></el-radio-button>
          <el-radio-button label="Construction" :disabled="isCO"></el-radio-button>
          <el-radio-button label="Publish"></el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div v-show="viewType === 'Design'" class="route">
      <h3>Route</h3>
      <div>
        <!-- <el-scrollbar> -->
        <div class="route-grid">
          <el-table :data="routeList" border style="width: 100%" height="100%" highlight-current-row @row-click="rowClick">
            <el-table-column prop="type" label="Type" width="90"></el-table-column>
            <el-table-column prop="resName" label="Name"></el-table-column>
            <el-table-column prop="statusName" label="Status" width="110"></el-table-column>
          </el-table>
        </div>
        <!-- </el-scrollbar> -->
        <div>
          <el-button type="primary" :disabled="routeList.length < 1" @click="highlight">Highlight</el-button>
        </div>
      </div>
    </div>
    <div v-show="viewType === 'Construction'" class="construction">
      <h3>Resource Construction</h3>
      <div class="construction-body">
        <ConstructionSpliceTask v-if="viewType === 'Construction'" ref="constructionTask" :dataInfo="dataInfo"></ConstructionSpliceTask>
      </div>
    </div>
    <div v-show="viewType === 'Publish'" class="construction">
      <h3>Publish Task</h3>
      <div class="construction-body">
        <PublishTask v-if="viewType === 'Publish'" ref="publishTask" :routeList="routeList"></PublishTask>
      </div>
    </div>
  </div>
</template>
  
<script>
import { queryRoute } from '@/oss_core/edesign/api/query/gisKey.js';
import ConstructionSpliceTask from './constructionSpliceTask/ConstructionSpliceTask.vue';
import PublishTask from '../publishTask/PublishTask.vue';

export default {
  name: 'NodeNetwork',
  components: {
    ConstructionSpliceTask,
    PublishTask,
  },
  inject: ['getMapBox', 'getProjectInfo'],
  data() {
    return {
      viewType: 'Design', // Design Construction Publish
      routeList: [],
      selectInfo: {},
      dataInfo: {}, // 参数信息
      selected: false, // 是否选中了某个点
      resIdList: [], // resId集合
      isCO: false, // 是否是CO设计
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  created() {},
  mounted() {
    if (this.projectInfo.networkLevel === 'CO') {
      this.isCO = true;
    }
  },
  destroyed() {
    this.$root.$off('map-selection', this.selectRult);
  },
  methods: {
    select() {
      this.$root.$emit('directClick', 'select');
      this.$root.$off('map-selection', this.selectRult);
      this.$root.$on('map-selection', this.selectRult);
    },
    selectRult(geos) {
      const geo = geos[0];
      if (geo.geometry._geometryType === this.$map.GeometryType.POINT) {
        this.$set(this.selectInfo, 'name', geo.attributes.name);
        // this.selectInfo.name = geo.attributes.name;
        this.selectInfo.layerNo = geo.attributes.layerNo;
        this.selectInfo.gisKey = geo.attributes.gisKey;
        this.$root.$off('map-selection', this.selectRult);
        this.selected = true;
      } else {
        this.$message({
          message: 'Please select a point',
          type: 'warning',
        });
        this.selected = false;
      }
    },
    search() {
      if (!this.selectInfo.gisKey) {
        this.$message({
          message: 'Please select a point',
          type: 'warning',
        });
      }
      const param = {
        projectId: this.projectInfo.sprintId,
        layerNo: this.selectInfo.layerNo,
        gisKey: this.selectInfo.gisKey,
      };
      queryRoute(param).then(data => {
        if (data && data.data) {
          this.routeList = data.data || [];
          this.resIdList = this.routeList.map(item => item.resId);
          this.dataInfo = {
            schemaId: this.projectInfo.schemaId,
            resIdList: this.resIdList,
          };
          if (this.viewType === 'Construction') {
            this.$refs.constructionTask.queryTasks(this.dataInfo);
          } else if (this.viewType === 'Publish') {
            this.$refs.publishTask.initTask(this.routeList);
          }
          this.centerSelection(this.routeList);
        }
      });
    },
    rowClick(row) {
      this.centerSelection([row]);
    },
    highlight() {
      this.centerSelection(this.routeList);
    },
    centerSelection(gisList) {
      this.mapBox.clear();
      const geometris = [];
      const setSelGis = [];
      // console.log(gisList);
      gisList.forEach(gisInfo => {
        const layerInfo = this.mapBox.getLayers().find(layer => layer.id === gisInfo.layerNo);
        if (layerInfo.source && layerInfo.visible) {
          const features = layerInfo.source.getFeatures();
          const feature = features.find(f => f.values_.gisKey === gisInfo.gisKey);
          if (feature) {
            const geo = this.$map.Graphic.from(feature, this.mapBox.spatialReference);
            setSelGis.push(geo);
            geometris.push(geo.geometry);
          } else {
            // console.log(gisInfo);
          }
        }
      });
      this.mapBox.centerGeometries(geometris);
      setSelGis.length > 0 && this.mapBox.setSelected(setSelGis);
      this.$emit('afterCenter', setSelGis);
    },
  },
};
</script>
  
<style lang="scss" scoped>
@import './nodeNetwork.scss';
</style>
