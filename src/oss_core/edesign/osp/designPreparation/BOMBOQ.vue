<template>
  <el-table :data="BomList" height="100%" style="width: 100%" size="mini" border>
    <el-table-column :label="$t('E_OSP_DP_SELECT_DESIGN_ELEMENT')" prop="element"> </el-table-column>
    <el-table-column :label="$t('E_OSP_DP_SELECT_MODEL')" prop="model"> </el-table-column>
    <el-table-column :label="$t('E_OSP_DP_SELECT_UNIT')" prop="unit"> </el-table-column>
    <el-table-column :label="$t('E_OSP_DP_SELECT_QUANTITY')" prop="quantity"> </el-table-column>
  </el-table>
</template>
<script>
// import { getDrawingSettings } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
export default {
  name: 'DrawList',
  props: {
    sprintId: '',
  },
  components: {},

  data() {
    return {
      BomList: [],
    };
  },

  create() {},

  mounted() {
    this.refresh();
  },

  methods: {
    refresh() {
      // getDrawingSettings(this.sprintId).then(res => {
      //   this.drawList = res || [];
      //   this.drawList.forEach(draw => {
      //     draw.relativeModel = draw.modelName || draw.benchTmplName || '';
      //   });
      // });
    },
  },
};
</script>
