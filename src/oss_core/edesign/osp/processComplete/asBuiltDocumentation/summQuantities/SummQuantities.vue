<template>
  <div class="table-box">
    <el-table :data="dataList" border width="100%" height="100%">
      <el-table-column :label="$t('COMPLETE_TRAJ_TABLE_SEQ')" type="index" width="50"> </el-table-column>
      <el-table-column prop="schemeName" :label="$t('COMPLETE_TRAJ_TABLE_CONSTRUTION_SCHEME_NAME')"></el-table-column>
      <el-table-column prop="itemName" :label="$t('CONSTRUCTION_SCHEME_WORK_ITEM_NAME')"></el-table-column>
      <el-table-column prop="measUnit" :label="$t('UNIT')" min-width="60"></el-table-column>
      <el-table-column prop="quantity" :label="$t('COMPLETE_TRAJ_TABLE_QUANTITY')" min-width="80"></el-table-column>
      <div slot="empty">
        <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
      </div>
    </el-table>
  </div>
</template>
<script>
import { queryPrjcapability } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'SummQuantities',
  props: {
    projectInfo: {},
  },
  components: {},

  data() {
    return {
      dataList: [],
    };
  },

  create() {},

  mounted() {
    this.init();
  },

  methods: {
    init() {
      if (!this.dataList.length) {
        queryPrjcapability({ projectId: this.projectInfo.projectId }).then(res => {
          this.dataList = res.data || [];
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './summQuantities.scss';
</style>
