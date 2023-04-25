<!--
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-04-07 16:32:29
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-04-10 10:48:56
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\design\constructionList\ConstructionList.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="construction-grid">
    <JustTab :options="tasOptions" v-model="tapName"></JustTab>
    <div v-if="tapName === 'Cable'" class="m-t-lg" key="cableConstructionList">
      <el-table :data="cableConstructionList" border style="width: 100%" class="single-table" height="280">
        <el-table-column label="Build" prop="buildTaskInfo" min-width="110"></el-table-column>
        <el-table-column label="BLOW" prop="blowTaskInfo" min-width="110"></el-table-column>
        <el-table-column :label="$t('E_OSP_DESIGN_CABLE_NAME')" prop="cableName" min-width="150"></el-table-column>
        <el-table-column :label="$t('E_OSP_DESIGN_CABLE_TYPE')" prop="cableTypeName" min-width="110"></el-table-column>
        <el-table-column :label="$t('E_OSP_DESIGN_INSTALLATION_TYPE')" prop="fixTypeName" min-width="110"></el-table-column>
        <el-table-column :label="$t('E_OSP_DESIGN_LENGTH')" prop="cableLength" min-width="90"></el-table-column>
        <div slot="empty">
          <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
        </div>
      </el-table>
      <el-pagination
        class="construction-footer"
        background
        layout="prev, pager, next"
        :current-page="currentBuildPage"
        :page-size="pageSize"
        :total="buildTotal"
        @current-change="currentBuildChange"
      ></el-pagination>
    </div>
    <div v-else class="m-t-lg" key="deviceConstructionList">
      <el-table :data="deviceConstructionList" border style="width: 100%" class="single-table" height="280">
        <el-table-column prop="connetions" :label="$t('E_OSP_DESIGN_CONNECTIONS')" min-width="130"></el-table-column>
        <el-table-column label="Design" min-width="60">
          <el-table-column prop="hldPcConnetions" :label="$t('E_OSP_DESIGN_TERMINATION')"></el-table-column>
          <el-table-column prop="hldCcConnetions" :label="$t('E_OSP_DESIGN_SPLICING')"></el-table-column>
        </el-table-column>
        <el-table-column label="Construction" min-width="60">
          <el-table-column prop="builtPcConnetions" :label="$t('E_OSP_DESIGN_TERMINATION')"></el-table-column>
          <el-table-column prop="builtCcConnetions" :label="$t('E_OSP_DESIGN_SPLICING')"></el-table-column>
          <el-table-column prop="spliceCnt" label="Splice"></el-table-column>
          <el-table-column prop="otdrCnt" label="OTDR"></el-table-column>
        </el-table-column>
        <div slot="empty">
          <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
        </div>
      </el-table>
      <el-pagination
        class="construction-footer"
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :current-page="currentSplicePage"
        :total="spliceTotal"
        @current-change="currentSpliceChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { qryBuildTask, qrySplicetask } from '@/oss_core/edesign/api/query/schema.js'; // 后台接口

export default {
  name: 'ConstructionList',
  inject: {
    getProjectInfo: {
      default: () => () => null, // 工程详情
    },
  },
  props: {},
  data() {
    return {
      tasOptions: [
        { code: 'Cable', name: this.$t('E_OSP_DESIGN_MATERIAL') },
        { code: 'Device', name: this.$t('E_OSP_DESIGN_CONSUMABLE_MATERIALS') },
      ],
      tapName: 'Cable',
      cableConstructionList: [],
      deviceConstructionList: [],
      pageSize: 10,
      buildTotal: 0,
      spliceTotal: 0,
      currentBuildPage: 1,
      currentSplicePage: 1,
    };
  },
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  watch: {
    tapName: {
      deep: true,
      handler(val) {
        if (val === 'Cable' && this.paramData) {
          this.getBuildTask();
        } else if (val === 'Device' && this.paramData) {
          this.getSpliceTask();
        }
      },
    },
  },
  created() {},

  mounted() {},

  methods: {
    async initData(projectInfo) {
      this.paramData = projectInfo;
      this.cableConstructionList = [];
      this.buildTotal = 0;
      this.currentBuildPage = 1;
      this.deviceConstructionList = [];
      this.spliceTotal = 0;
      this.currentSplicePage = 1;
      if (this.tapName === 'Cable') {
        this.getBuildTask();
      } else {
        this.getSpliceTask();
      }
    },
    getBuildTask() {
      const param = Object.assign(this.paramData, {
        pageIndex: this.currentBuildPage,
        pageSize: this.pageSize,
      });
      qryBuildTask(param).then(data => {
        this.cableConstructionList = data.resultList;
        this.buildTotal = data.total;
      });
    },
    getSpliceTask() {
      const param = Object.assign(this.paramData, {
        pageIndex: this.currentSplicePage,
        pageSize: this.pageSize,
      });
      qrySplicetask(param).then(data => {
        this.deviceConstructionList = data.resultList;
        this.spliceTotal = data.total;
      });
    },
    currentBuildChange(page) {
      this.currentBuildPage = page;
      this.getBuildTask();
    },
    currentSpliceChange(page) {
      this.currentSplicePage = page;
      this.getSpliceTask();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './constructionList.scss';
</style>
