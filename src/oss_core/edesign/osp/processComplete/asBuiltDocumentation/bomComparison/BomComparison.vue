<template>
  <div class="bom-comparison-box">
    <div class="head-tabs" v-if="!hideTab">
      <el-radio-group v-model="tableType" size="small">
        <el-radio-button label="Material">{{ $t('E_OSP_DESIGN_MATERIAL') }}</el-radio-button>
        <el-radio-button label="Construction">{{ $t('E_OSP_DESIGN_CONSUMABLE_MATERIALS') }}</el-radio-button>
        <el-radio-button label="ManHours">{{ $t('E_OSP_DESIGN_MAN_HOURS') }}</el-radio-button>
        <el-radio-button label="Tools">{{ $t('E_OSP_DESIGN_TOOLS') }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="table-box">
      <el-table :data="dataList" border width="100%" height="100%" :summary-method="getSummaries" show-summary>
        <el-table-column v-if="tableType === 'Material'" prop="designElement" :label="$t('E_OSP_DP_SELECT_DESIGN_ELEMENT')"></el-table-column>
        <el-table-column v-if="tableType === 'Construction'" prop="designElement" :label="$t('E_OSP_DESIGN_CONSUMABLE_MATERIALS')"></el-table-column>
        <el-table-column v-if="tableType === 'ManHours'" prop="designElement" :label="$t('COMPLETE_BOM_TABLE_TYPE_OF_WORK')"></el-table-column>
        <el-table-column v-if="tableType === 'Tools'" prop="designElement" :label="$t('E_OSP_DESIGN_TOOLS')"></el-table-column>
        <el-table-column prop="unit" :label="$t('E_OSP_DP_SELECT_UNIT')" min-width="60"></el-table-column>
        <el-table-column :label="$t('COMPLETE_BOM_TABLE_AS_PLANNED')" width="160">
          <el-table-column prop="asPlan" :label="$t('E_OSP_DP_SELECT_QUANTITY')" width="80"></el-table-column>
          <el-table-column prop="asPlan2" :label="$t('DESIGN_EXPORT_BOM_PRICE_1')" width="80"></el-table-column>
        </el-table-column>
        <el-table-column :label="$t('COMPLETE_BOM_TABLE_AS_BUILT')" width="160">
          <el-table-column prop="asBuilt" :label="$t('E_OSP_DP_SELECT_QUANTITY')" width="80"></el-table-column>
          <el-table-column prop="asBuilt2" :label="$t('DESIGN_EXPORT_BOM_PRICE_1')" width="80"></el-table-column>
        </el-table-column>
        <div slot="empty">
          <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
        </div>
      </el-table>
    </div>
  </div>
</template>
<script>
import { queryBomCompare, selectSuppliecBomByProject } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'BomComparison',
  props: {
    activeName: '',
    hideTab: false,
    projectInfo: {},
  },
  components: {},

  data() {
    return {
      tableType: 'Material',
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
        this.loadMaterialList();
      }
    },
    addNum(list) {
      return list.map(it => {
        return {
          ...it,
          asPlan: parseInt(Math.random() * 100, 10),
          asPlan2: parseFloat(Math.random() * 100).toFixed(2),
          asBuilt: parseInt(Math.random() * 100, 10),
          asBuilt2: parseFloat(Math.random() * 100).toFixed(2),
        };
      });
    },
    loadMaterialList() {
      queryBomCompare(this.projectInfo.projectId).then(res => {
        this.dataList = this.addNum(res || []);
      });
    },
    loadSuppList(type) {
      selectSuppliecBomByProject(this.projectInfo.projectId, type).then(res => {
        this.dataList = this.addNum(res.data || []);
      });
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = this.$t('COMPLETE_TRAJ_TABLE_AMOUNT');
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          if (`${sums[index]}`.indexOf('.') > -1) {
            sums[index] = sums[index].toFixed(2);
          }
          // sums[index] += ' 元';
        } else {
          sums[index] = '';
        }
      });

      return sums;
    },
  },
  watch: {
    tableType(val) {
      this.dataList = [];
      if (val === 'Material') {
        this.loadMaterialList();
      } else {
        let type = 'T';
        if (val === 'Construction') {
          type = 'C';
        } else if (val === 'ManHours') {
          type = 'M';
        }
        this.loadSuppList(type);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './bomComparison.scss';
</style>
