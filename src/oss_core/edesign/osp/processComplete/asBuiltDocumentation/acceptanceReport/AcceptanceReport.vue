<template>
  <div class="table-box">
    <el-table :data="tableData" border width="100%" height="100%" :summary-method="getSummaries" show-summary>
      <el-table-column :label="$t('COMPLETE_TRAJ_TABLE_SEQ')" type="index" width="80"> </el-table-column>
      <el-table-column prop="resSpecName" :label="$t('COMPLETE_TRAJ_TABLE_CONSTRUCTION_OBJ')"> </el-table-column>
      <!-- <el-table-column prop="constSchemeName" :label="$t('CONSTRUCTION_SCHEME')"> </el-table-column> -->
      <el-table-column prop="objectNum" :label="$t('COMPLETE_TRAJ_TABLE_CONSTRUCTION_OBJ_NUM')" width="200"> </el-table-column>
      <el-table-column prop="accepRate" :label="$t('COMPLETE_TRAJ_TABLE_SAMPLING_RATIO')" min-width="80">
        <template slot-scope="scope">
          {{ `${scope.row.accepRate}%` }}
        </template>
      </el-table-column>
      <el-table-column prop="accepNum" :label="$t('COMPLETE_TRAJ_TABLE_SAMPLING_QUANTITY')" min-width="80"> </el-table-column>
      <el-table-column prop="firstAccuracyRate" :label="$t('COMPLETE_TRAJ_TABLE_FIRST_PASS_RATE')" min-width="120">
        <template slot-scope="scope">
          {{ `${scope.row.firstAccuracyRate}%` }}
        </template>
      </el-table-column>
      <el-table-column prop="firstRectificationAccuracyRate" :label="$t('COMPLETE_TRAJ_TABLE_FIRST_INTEG_PASS_RATE')" min-width="120">
        <template slot-scope="scope">
          {{ `${scope.row.firstRectificationAccuracyRate}%` }}
        </template>
      </el-table-column>
      <div slot="empty">
        <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
      </div>
    </el-table>
  </div>
</template>
<script>
import { queryPrjAccepreport } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'AcceptanceReport',
  props: {
    projectInfo: {},
  },
  components: {},

  data() {
    return {
      tableData: [],
      totalData: {},
    };
  },

  create() {},

  mounted() {
    this.init();
  },

  methods: {
    init() {
      if (!this.tableData.length) {
        queryPrjAccepreport({
          projectId: this.projectInfo.sprintId,
        }).then(res => {
          let tableData = res.data || [];
          if (tableData.length) {
            this.totalData = tableData.splice(tableData.length - 1)[0];
          }
          this.tableData = tableData;
        });
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = this.$t('COMPLETE_TRAJ_TABLE_AMOUNT');
        } else {
          if (column.property === 'accepRate' || column.property === 'firstAccuracyRate' || column.property === 'firstRectificationAccuracyRate') {
            sums[index] = `${this.totalData[column.property]}%`;
          } else {
            sums[index] = this.totalData[column.property];
          }
        }
      });

      return sums;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './acceptanceReport.scss';
</style>
