<template>
  <el-table :data="drawList" height="100%" border style="width: 100%" size="mini">
    <el-table-column :label="$t('E_OSP_DP_SELECT_ICON_FOR_NEW')">
      <template slot-scope="{ row }">
        <div v-if="row.styleJson.geometryType === $map.GeometryType.POINT">
          <img class="image-btn" :src="row.styleJson.iconUrl" style="height:20px;" />
        </div>
        <div v-else class="line-container">
          <div
            :style="{
              borderTop: `${row.styleJson.lineWidth}px ${row.styleJson.lineStyle === 'dash' ? 'dashed' : row.styleJson.lineStyle} ${
                row.styleJson.lineColor
              }`,
            }"
          ></div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="hldTemplateName" :label="$t('E_OSP_DP_SELECT_DESIGN_ELEMENT')"> </el-table-column>
    <el-table-column prop="resTypeName" :label="$t('RESOURCE_TYPE')"> </el-table-column>
    <el-table-column prop="relativeModel" :label="$t('RESOURCE_TEMPLATE')"> </el-table-column>
  </el-table>
</template>
<script>
import { getDrawingSettings } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
export default {
  name: 'DrawList',
  props: {
    sprintId: '',
  },
  components: {},

  data() {
    return {
      drawList: [],
    };
  },

  create() {},

  mounted() {
    this.refresh();
  },

  methods: {
    refresh() {
      getDrawingSettings(this.sprintId).then(res => {
        this.drawList = res || [];
        this.drawList.forEach(draw => {
          draw.relativeModel = draw.modelName || draw.benchTmplName || '';
        });
      });
    },
  },
};
</script>
