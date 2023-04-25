<template>
  <!-- new-theme-box  添加这个样式名变为黑色主题 -->

  <div class="scheme-detail-box ">
    <div class="add-work-item" v-if="isEdit" @click="addWorkItem">
      <i class="el-icon-plus"></i>
      <span class="add-text">
        {{ $t('CONSTRUCTION_SCHEME_ADD_WORK_ITEM') }}
      </span>
    </div>
    <el-scrollbar v-if="isLoad && workList.length">
      <el-collapse v-model="activeNames" @change="handleChange" :accordion="true">
        <el-collapse-item class="collapse-item-box" v-for="(item, index) in workList" :key="item.itemSpecId" :name="item.itemSpecId">
          <template slot="title">
            <div class="collapse-title">
              <span class="title-tag">
                <i class="icon_osp icon_ospwenjianjia1"></i>
                <span>{{ $t('CONSTRUCTION_SCHEME_QUOTA_TABLE') }} {{ item.seqLabel }}</span>
              </span>
              <div class="title-content">
                <span class="title-tiem">
                  <span class="info-it-title">{{ $t('CONSTRUCTION_SCHEME_WORK_ITEM_NAME') }}:</span>
                  <span class="info-it-val">{{ item.itemName }}</span>
                </span>
                <span class="title-tiem">
                  <span class="info-it-title">{{ $t('UNIT') }}:</span>
                  <span class="info-it-val">{{ item.measUnitName }}</span>
                </span>
                <span class="title-tiem">
                  <span class="info-it-title">{{ $t('CONSTRUCTION_SCHEME_WORK_QUANTITY') }}:</span>
                  <span class="info-it-val">{{ item.displayStat || item.statement }}</span>
                </span>
              </div>
              <div class="title-options" v-if="isEdit">
                <el-tooltip class="item" effect="light" :content="$t('EDIT')" placement="bottom-start">
                  <i class="el-icon-edit work-item-option-icon" @click.stop="editWorkItem(item)"></i>
                </el-tooltip>
                <el-tooltip v-if="index > 0" class="item" effect="light" :content="$t('CONSTRUCTION_SCHEME_WORK_ITEM_PREV')" placement="bottom-start">
                  <i class="el-icon-top work-item-option-icon" @click.stop="sortWorkItem('prev', index)"></i>
                </el-tooltip>
                <el-tooltip
                  v-if="index < workList.length - 1"
                  class="item"
                  effect="light"
                  :content="$t('CONSTRUCTION_SCHEME_WORK_ITEM_NEXT')"
                  placement="bottom-start"
                >
                  <i class="el-icon-bottom work-item-option-icon" @click.stop="sortWorkItem('next', index)"></i>
                </el-tooltip>
                <el-tooltip class="item" effect="light" :content="$t('DELETE')" placement="bottom-start">
                  <i class="el-icon-delete work-item-option-icon delete" @click.stop="deleteWorkItem(item.itemSpecId)"></i>
                </el-tooltip>
              </div>
            </div>
          </template>
          <SuppliesTable
            :isEdit="isEdit"
            :detail="detailMap[item.itemSpecId]"
            @refreshData="refreshTable"
            :materialClassifyOptions="materialClassifyOptions"
            :varList="schemeData.edncFeatureAttrList"
          ></SuppliesTable>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
    <el-empty
      v-else
      class="con-nodata-box"
      image="oss_core/edesign/assets/image/no_data.png"
      :image-size="120"
      :description="$t('NO_DATA')"
    ></el-empty>
    <EditConstitem
      ref="editConstitem"
      :resType="schemeData.resSpecId"
      :varList="schemeData.edncFeatureAttrList"
      :constSchemeId="schemeData.constSchemeId"
      @refresh="refreshList"
    ></EditConstitem>
  </div>
</template>
<script>
// import SuppliesTable from './suppliesTable/SuppliesTable.vue';
import SuppliesTable from './suppliesTableNew/SuppliesTableNew.vue';
import { queryConstitemList, queryComplexsupp } from '@/oss_core/edesign/api/query/schema.js';
import EditConstitem from '@/oss_core/edesign/osp/constructionScheme/editConstitem/EditConstitem.vue';
import { updateConstitemseq } from '@/oss_core/edesign/api/edit/schema.js';
import { deleteConstitem } from '@/oss_core/edesign/api/del/schema.js';
import { queryMaterialClassify } from '@/oss_core/edesign/api/query/dictId.js';

export default {
  name: 'WorkItemDetail',
  props: {
    schemeData: {},
    isEdit: false,
  },
  components: {
    SuppliesTable,
    EditConstitem,
  },

  data() {
    return {
      activeNames: '',
      isLoad: false,
      workList: [],
      detailMap: {},
      materialClassifyOptions: [],
    };
  },

  create() {},

  mounted() {
    this.loadWorkItemList();
    this.queryMaterialClass();
  },

  methods: {
    // 查询物料分类下拉框值
    queryMaterialClass() {
      queryMaterialClassify('EDNC_SUPPLIES.SUPP_TYPE').then(res => {
        this.materialClassifyOptions = res.data || [];
      });
    },
    loadWorkItemList() {
      if (this.schemeData && this.schemeData.constSchemeId) {
        this.workList = [];
        this.activeNames = '';
        this.isLoad = false;
        queryConstitemList(this.schemeData.constSchemeId).then(res => {
          this.isLoad = true;
          this.workList = res.data || [];
          this.activeNames = (this.workList[0] || {}).itemSpecId;
          this.handleChange(this.activeNames);
        });
      } else {
        this.workList = [];
        this.activeNames = '';
      }
    },
    refreshList() {
      queryConstitemList(this.schemeData.constSchemeId).then(res => {
        this.workList = res.data || [];
        if (this.activeNames) {
          const isHas = this.workList.find(it => it.itemSpecId === this.activeNames);
          if (!isHas) {
            this.activeNames = (this.workList[0] || {}).itemSpecId;
          }
        }
      });
    },
    handleChange(val) {
      if (val && !this.detailMap[val]) {
        this.refreshTable(val);
      }
    },
    refreshTable(val) {
      queryComplexsupp(val).then(res => {
        this.detailMap[val] = res.data || [];
        this.detailMap = JSON.parse(JSON.stringify(this.detailMap));
      });
    },
    addWorkItem() {
      this.$refs.editConstitem.handleShow();
    },
    editWorkItem(item) {
      this.$refs.editConstitem.handleShow(item);
    },
    sortWorkItem(type, index) {
      let prevItem = {};
      const theItem = this.workList[index];
      if (type === 'prev') {
        // 上移
        prevItem = this.workList[index - 1];
      } else {
        prevItem = this.workList[index + 1];
      }
      const list = [
        {
          itemSpecId: prevItem.itemSpecId,
          seq: theItem.seq,
        },
        {
          itemSpecId: theItem.itemSpecId,
          seq: prevItem.seq,
        },
      ];
      updateConstitemseq(list).then(res => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: this.$t('SAVE_SUCCESS'),
          });
          this.refreshList();
        } else {
          this.$message({
            type: 'error',
            message: res.message || this.$t('AJAX_ERROR'),
          });
        }
      });
    },
    deleteWorkItem(itemSpecId) {
      this.$confirm(this.$t('CONSTRUCTION_SCHEME_WORK_ITEM_DELETE_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        deleteConstitem(itemSpecId).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.refreshList();
          } else {
            this.$message({
              type: 'error',
              message: this.$t('DELETE_FAIL'),
            });
          }
        });
      });
    },
  },
  watch: {
    schemeData() {
      this.loadWorkItemList();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './workItemDetail.scss';
</style>
