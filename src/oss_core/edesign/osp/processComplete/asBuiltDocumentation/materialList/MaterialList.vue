<template>
  <div class="table-box">
    <el-table :data="tableData" border width="100%" height="100%" :summary-method="getSummaries" show-summary>
      <el-table-column :label="$t('COMPLETE_TRAJ_TABLE_SEQ')" width="70">
        <el-table-column>
          <el-table-column type="index" width="70"> </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column :label="item.name" v-for="(item, i) in tableHead" :key="i">
        <el-table-column :label="item.spec">
          <el-table-column :prop="item.code" :label="item.unit">
            <template slot-scope="scope">
              {{ scope.row[item.code] }}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column v-if="!tableHead.length"> </el-table-column>
      <div slot="empty">
        <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
      </div>
    </el-table>
  </div>
</template>
<script>
import { queryPrjconstitemsupp } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'MaterialList',
  props: {
    projectInfo: {},
  },
  components: {},

  data() {
    return {
      tableData: [],
      tableHead: [],
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
        queryPrjconstitemsupp({
          projectId: this.projectInfo.projectId,
          resTypeName: this.$t('RESOURCE_SPECIFICATION'),
          schemeName: this.$t('CONSTRUCTION_SCHEME'),
          itemName: this.$t('CONSTRUCTION_SCHEME_WORK_ITEM'),
        }).then(res => {
          const resData = res.data || {};
          this.tableHead = resData.tableHead || [];
          let tableData = resData.list || [];
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
          sums[index] = this.totalData[column.property] || '';
        }
      });

      return sums;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './materialList.scss';
</style>
