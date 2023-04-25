<template>
  <Popup :popupObj="modalObj" @popupClose="popupClose">
    <template v-slot:popupBody>
      <div class="flex-column overflow-hidden all100">
        <div class="flex1 overflow-hidden">
          <el-table
            fit="true"
            :data="detailList"
            height="100%"
            row-key="itemId"
            :expand-row-keys="expandKeys"
            @expand-change="handleExpand"
            border
            style="width: 100%"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <ExpandTabInfo :rowData="props.row"></ExpandTabInfo>
              </template>
            </el-table-column>
            <el-table-column :label="$t('NETWORK_LEVEL')" prop="networkLevel" width="110"> </el-table-column>
            <el-table-column :label="$t('RESOURCE_NAME')" prop="resName"> </el-table-column>
            <el-table-column :label="$t('RESOURCE_SPECIFICATION')" prop="resSpecId" width="160"> </el-table-column>
            <el-table-column :label="$t('CONSTRUCTION_SCHEME')" prop="constSchemeName" width="190"> </el-table-column>
            <el-table-column :label="$t('UNIT')" prop="measUnit" width="70"> </el-table-column>
            <el-table-column :label="$t('QUANTITY')" prop="quantitySupp" width="90"> </el-table-column>
            <el-table-column :label="$t('CONSTRUCTION_STATE')" prop="consStatusName" width="130"> </el-table-column>
          </el-table>
        </div>
        <div class="m-t">
          <el-pagination
            background
            style="text-align: right;"
            layout="total, prev, pager, next"
            :current-page="current"
            :page-size="pageSize"
            :total="total"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script>
import { queryConsItemResList } from '@/oss_core/edesign/api/query/project.js';
import ExpandTabInfo from './expandTabInfo.vue';
export default {
  name: 'DetailDialog',
  props: {
    dialogVisible: {
      type: Boolean,
    },
    projectId: {
      type: String,
    },
    constSchemeIdList: {
      type: Array,
    },
    title: {
      type: String,
    },
  },
  inject: ['getInitData'],
  components: {
    ExpandTabInfo,
  },

  data() {
    return {
      modalObj: {
        title: this.title,
        modal: true,
        width: '80%',
        height: '600px',
        show: this.dialogVisible,
        drag: true,
        el: document.body,
        zIndex: 3,
      },
      expandKeys: [],
      detailList: [],
      current: 1,
      pageSize: 10,
      total: 0,
    };
  },

  created() {},

  mounted() {
    this.getConsItemResList();
  },

  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.getConsItemResList(val);
    },
    popupClose() {
      this.$emit('close');
    },
    getConsItemResList(current) {
      let params = {
        projectId: this.projectId,
        constSchemeIdList: this.constSchemeIdList,
        pageIndex: current || this.current,
        pageSize: this.pageSize,
      };
      queryConsItemResList(params).then(res => {
        let { data } = res;
        if (data) {
          let { total, pageNum, list } = data;
          this.total = total;
          this.detailList = list.map(item => {
            return {
              ...item,
              materialList: [],
              consumableMaterialList: [],
              manHoursList: [],
              toolsList: [],
            };
          });
        }
      });
    },
    handleExpand(row, expandedRows) {
      this.expandKeys = expandedRows.map(item => item.itemId);
      let index = this.detailList.findIndex(item => item == row);
      if (expandedRows.includes(row)) {
        console.log('展开', row);
      } else {
        console.log('收起');
      }
    },
  },
  watch: {
    title(val) {
      this.modalObj.title = val;
    },
    dialogVisible(val) {
      this.modalObj.show = val;
    },
  },
};
</script>
<style lang="scss" scoped>
/* @import './index.scss'; */
</style>
