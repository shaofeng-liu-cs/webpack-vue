<template>
  <div class="overflow-hidden all100" style="display:flex;height:200px;padding:10px 20px;">
    <JustTab :options="optionsList" v-model="currKey" type="vertical"></JustTab>
    <div class="overflow-hidden flex1" key="A" v-if="currKey === 'A'">
      <el-table :data="materialList" style="width: 100%" height="100%" border>
        <el-table-column property="designElement" :label="$t('DESIGN_ELEMENT')"></el-table-column>
        <el-table-column width="240" property="modelName" :label="$t('MODEL')"></el-table-column>
        <el-table-column width="200" property="unit" :label="$t('UNIT')"></el-table-column>
        <el-table-column width="200" property="quantity" :label="$t('QUANTITY')"></el-table-column>
      </el-table>
    </div>
    <div class="overflow-hidden flex1" key="C" v-if="currKey === 'C'">
      <el-table :data="consumableMaterialList" border style="width: 100%" height="100%">
        <el-table-column property="designElement" :label="$t('CONSUMABLE_MATERIAL')"></el-table-column>
        <el-table-column width="200" property="unit" :label="$t('UNIT')"></el-table-column>
        <el-table-column width="200" property="quantity" :label="$t('QUANTITY')"></el-table-column>
      </el-table>
    </div>
    <div class="overflow-hidden flex1" key="M" v-if="currKey === 'M'">
      <el-table :data="manHoursList" border style="width: 100%" height="100%">
        <el-table-column property="designElement" :label="$t('TYPE_OF_WORK')"></el-table-column>
        <el-table-column width="200" property="unit" :label="$t('UNIT')"></el-table-column>
        <el-table-column width="200" property="quantity" :label="$t('QUANTITY')"></el-table-column>
      </el-table>
    </div>
    <div class="overflow-hidden flex1" key="T" v-if="currKey === 'T'">
      <el-table :data="toolsList" border style="width: 100%" height="100%">
        <el-table-column property="designElement" :label="$t('TOOLS')"></el-table-column>
        <el-table-column width="200" property="unit" :label="$t('UNIT')"></el-table-column>
        <el-table-column width="200" property="quantity" :label="$t('QUANTITY')"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { querySuppliecBom, queryMaterialBom } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'ExpandTabInfo',
  props: {
    rowData: {},
  },
  components: {},

  data() {
    return {
      optionsList: [
        { code: 'A', name: this.$t('MATERIAL') },
        { code: 'C', name: this.$t('CONSUMABLE_MATERIAL') },
        { code: 'M', name: this.$t('MAN_HOURS') },
        { code: 'T', name: this.$t('TOOLS') },
      ],
      currKey: 'A',
      materialList: [],
    };
  },

  create() {},

  mounted() {
    this.getABOMList();
  },

  methods: {
    getABOMList() {
      let params = {
        taskIdList: [this.rowData.taskId],
        taskType: 'Construction',
        resId: this.rowData.resId,
      };
      queryMaterialBom(params).then(res => {
        let { data } = res;
        let newData = (data || []).map(item => ({
          ...item,
          designElement: item.hldTemplateName,
        }));
        this.materialList = newData;
      });
    },
    getCMTBOMList() {
      let params = {
        suppType: this.currKey,
        taskIdList: [this.rowData.taskId],
        taskType: 'Construction',
        resId: this.rowData.resId,
        constSchemeId: this.rowData.constSchemeId,
      };
      querySuppliecBom(params).then(res => {
        let { data } = res;
        let newData = (data || []).map(item => ({
          ...item,
          quantity: item[this.rowData.taskId],
        }));
        let tabObject = {
          C: 'consumableMaterialList',
          M: 'manHoursList',
          T: 'toolsList',
        };
        this[tabObject[this.currKey]] = newData;
      });
    },
    handleChangeTab() {
      if (['C', 'M', 'T'].includes(this.currKey)) {
        this.getCMTBOMList();
      } else {
        this.getABOMList();
      }
    },
  },
  watch: {
    currKey() {
      this.handleChangeTab();
    },
  },
};
</script>
