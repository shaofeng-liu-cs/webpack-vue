<template>
  <div style="width:100%;height:100%;">
    <el-table :data="tableData" border width="100%" height="100%">
      <el-table-column :label="$t('NAME')" prop="title"> </el-table-column>
      <el-table-column :label="$t('E_OSP_DESIGN_NETWORK_LEVEL')" prop="networkLevel" width="180"> </el-table-column>
      <el-table-column fixed="right" width="380">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="showDiagram(scope.row, 'cable')">{{ $t('COMPLETE_DOC_CABLE_ROUTE_DIAGRAM') }}</el-button>
          <el-button v-if="!hideTab" type="text" size="small" @click="showDiagram(scope.row, 'pipe')">{{
            $t('COMPLETE_DOC_PIPE_ROUTE_DIAGRAM')
          }}</el-button>
          <el-button type="text" size="small" @click="showDiagram(scope.row, 'core')">{{ $t('COMPLETE_DOC_CORE_ASSIGNMENT') }}</el-button>
        </template>
      </el-table-column>
      <div slot="empty">
        <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
      </div>
    </el-table>
    <Popup :popupObj="showDiagramObj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <FiberRouteTopo v-if="diagramObj.type == 'fiberRouteTopo'" :params="diagramObj.projectInfo"></FiberRouteTopo>
        <HldOverview
          v-if="diagramObj.type == 'toHldOverView'"
          :key="diagramObj.mapType"
          :queryData="diagramObj.projectInfo"
          :mapType="diagramObj.mapType"
          :sprintId="diagramObj.projectInfo && diagramObj.projectInfo.sprintId"
        ></HldOverview>
      </template>
    </Popup>
  </div>
</template>
<script>
import { getSchemaInfo } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
import FiberRouteTopo from '@/oss_core/edesign/topo/design/FiberRouteTopo1.vue';
import HldOverview from '@/oss_core/edesign/osp/design/hldOverview/hldOverview.vue';
export default {
  name: 'BuiltDrawings',
  props: {
    activeName: '',
    hideTab: false,
    projectInfo: {},
  },
  components: {
    FiberRouteTopo,
    HldOverview,
  },

  data() {
    return {
      showDiagramObj: {
        title: '',
        close: this.$t('CLOSE'),
        modal: true,
        width: '90%',
        height: '80%',
        show: false,
        drag: true,
        body: true,
        zIndex: 3,
      },
      //   isLoad:false,//记录是否加载过
      tableData: [],
      diagramObj: {},
    };
  },

  created() {
    this.showDiagramObj.el = document.body;
  },

  mounted() {
    this.init();
  },

  methods: {
    popupClose() {
      this.diagramObj = {};
    },
    showDiagram(row, type) {
      let diagramObj = {
        projectInfo: {
          projectId: row.projectId,
          sprintId: row.projectId,
          schemaId: row.taskId,
        },
      };
      let title = '';
      if (type === 'cable') {
        diagramObj.type = 'toHldOverView';
        diagramObj.mapType = 'cable';
        title = this.$t('COMPLETE_DOC_CABLE_ROUTE_DIAGRAM');
      } else if (type === 'pipe') {
        diagramObj.type = 'toHldOverView';
        diagramObj.mapType = ' construction';
        title = this.$t('COMPLETE_DOC_PIPE_ROUTE_DIAGRAM');
      } else {
        diagramObj.type = 'fiberRouteTopo';
        diagramObj.mapType = ' ';

        title = this.$t('COMPLETE_DOC_CORE_ASSIGNMENT');
      }
      this.diagramObj = diagramObj;
      this.showDiagramObj.title = title;
      this.showDiagramObj.show = true;
    },
    init() {
      //   if (this.isLoad) {
      //     return;
      //   }
      //   this.isLoad = true;
      if (!this.tableData.length) {
        getSchemaInfo({
          projectId: this.projectInfo.sprintId,
          taskType: 'LLD',
        }).then(res => {
          this.tableData = res.resultList || [];
        });
      }
    },
  },
  watch: {
    // activeName(val) {
    //   if (val === 'BuiltDrawings' && !this.isLoad) {
    //     this.init();
    //   }
    // },
  },
};
</script>
<style lang="scss" scoped>
// @import './asBuiltDocumentation.scss';
</style>
