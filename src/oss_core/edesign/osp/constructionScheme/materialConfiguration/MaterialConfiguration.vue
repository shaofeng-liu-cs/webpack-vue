<!--
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-03-02 19:10:35
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-23 15:59:00
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\constructionScheme\materialConfiguration\MaterialConfiguration.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
      <template v-slot:popupBody>
        <div>
          <div class="config-head">
            <div class="left-button">
              <el-button type="primary" size="mini" icon="el-icon-folder-add" @click="addMaterial">{{ $t('NEW') }}</el-button>
            </div>
            <div class="right-content">
              <el-input :placeholder="$t('PLEASE_ENTER')" v-model="searchValue" class="input-with-select" size="mini">
                <el-select v-model="queryProperty" slot="prepend" :placeholder="$t('PLEASE_SELECT')" size="mini">
                  <el-option v-for="item in queryPropertyOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <el-button slot="append" icon="el-icon-search" size="mini" @click="searchAction"></el-button>
              </el-input>
            </div>
          </div>
          <div class="bottom-grid">
            <el-table
              ref="materialGrid"
              class="material-grid"
              :data="showGridData"
              height="320px"
              style="width: 100%"
              @select="selectRow"
              size="mini"
            >
              <el-table-column prop="seq" :label="$t('CONSTRUCTION_SHHEME_NUM')" min-width="120"> </el-table-column>
              <el-table-column prop="relaAttrName" :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_PROPERTIES')" min-width="120"> </el-table-column>
              <el-table-column prop="relaAttrValueName" :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_ATTRIBUTE_VALUE')" min-width="120">
              </el-table-column>
              <el-table-column prop="suppName" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_NAME')" min-width="100"> </el-table-column>
              <el-table-column prop="measUnit" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_UNIT')" min-width="60"> </el-table-column>
              <el-table-column prop="suppTypeName" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_CLASSIFY')" min-width="120"> </el-table-column>
              <el-table-column prop="pMeasUnit" :label="$t('CONSTRUCTION_SHHEME_CONSTRUNCTION_MEASUREMENT_UNIT')" min-width="120"> </el-table-column>
              <el-table-column prop="quantityPerUnit" :label="$t('CONSTRUCTION_SHHEME_REQUIRED_PER_UNIT')" min-width="120"> </el-table-column>
              <el-table-column prop="edncPubStatementDTO.statement" :label="$t('CONSTRUCTION_SHHEME_CALCULATION_FORMULA')" min-width="150">
              </el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="light" :content="$t('EDIT')" placement="bottom-start">
                    <i class="el-icon-edit material-option-icon" @click="editMaterial(scope.row)"></i>
                  </el-tooltip>
                  <el-tooltip class="item" effect="light" :content="$t('DELETE')" placement="bottom-start">
                    <i class="el-icon-delete material-option-icon delete" @click="deleteMaterial(scope.row)"></i>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-pagination
            class="page-footer"
            background
            layout="prev, pager, next"
            :total="supCount"
            :page-size="pageSize"
            @current-change="changePages"
          >
          </el-pagination>
        </div>
      </template>
    </Popup>
    <AddMaterial
      ref="addMaterials"
      v-if="actionFlag"
      :rowData="rowData"
      :resData="resData"
      :varList="varList"
      @close="closeAddMaterial"
    ></AddMaterial>
  </div>
</template>

<script>
import AddMaterial from './addMaterial/AddMaterial.vue';
import { qryMaterialList } from '@/oss_core/edesign/api/query/schema.js';
import { deleteConstitemSupp } from '@/oss_core/edesign/api/del/schema.js';

export default {
  components: { AddMaterial },
  name: 'MaterialConfiguration',
  inject: [],
  data() {
    return {
      popupObj: {
        title: this.$t('CONSTRUCTION_SHHEME_REQUIRED_MATERIAL_CONFIG'), // 弹框标题
        ok: 'OK', // 确认按钮内容
        close: 'Cancel', // 取消按钮内容
        modal: false, // 是否蒙层
        width: '1390px',
        height: '500px',
        // el: this.getHldEl(), // 指定插入节点
        show: true, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
        resize: 'both',
      },
      isVisble: 'true',
      actionFlag: '', //操作类别
      searchValue: '', // 搜索值
      showGridData: [], // 表格数据
      queryPropertyOptions: [
        {
          value: 'Material Name',
          label: 'Material Name',
        },
      ],
      queryProperty: 'Material Name', // 搜索的类型
      supCount: 0, //数据数量
      currentPage: 1,
      pageSize: 6,
      resData: {},
    };
  },
  props: {
    varList: {
      type: Array,
    },
    workData: {
      type: Object,
    },
  },
  created() {},
  mounted() {
    this.resData = {
      resType: this.workData.resType,
      pMeasUnit: this.workData.measUnit,
      itemSpecId: this.workData.itemSpecId,
      relaAttr: this.workData.relaAttr,
      relaAttrName: this.workData.relaAttrName,
    };
    this.loadGrid();
  },
  methods: {
    popupOk() {
      this.$emit('close');
    },
    popupClose() {
      this.$emit('close');
    },
    loadGrid() {
      let params = {
        itemSpecId: this.workData.itemSpecId,
        suppName: this.searchValue,
        pageIndex: this.currentPage,
        pageLen: this.pageSize,
      };
      qryMaterialList(params).then(res => {
        if (res.data) {
          // 展示的数据
          this.showGridData = res.data.edncConstItemSuppDTOS;
          this.supCount = res.data.total;
        }
      });
    },
    searchAction() {
      this.currentPage = 1;
      this.loadGrid();
    },
    addMaterial() {
      this.actionFlag = 'add';
    },
    editMaterial(row) {
      this.actionFlag = 'edit';
      this.rowData = row;
    },
    deleteMaterial(row) {
      this.$confirm(this.$t('CONSTRUCTION_SHHEME_DELETE_TIPS'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        let params = {
          itemSpecId: row.itemSpecId,
          relaAttrValue: row.relaAttrValue,
          relaAttr: row.relaAttr,
          suppId: row.suppId,
          quantityPerUnit: row.quantityPerUnit,
          suppType: row.suppType,
          measUnit: row.measUnit,
          edncPubStatementDTO: row.edncPubStatementDTO,
          statId: row.statId,
        };
        deleteConstitemSupp(params).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.loadGrid();
          }
        });
      });
    },
    hideInput() {
      this.searchValue = '';
    },
    closeAddMaterial() {
      this.actionFlag = '';
    },
    changePages(page) {
      this.currentPage = page;
      this.loadGrid();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './materialConfiguration.scss';
</style>
