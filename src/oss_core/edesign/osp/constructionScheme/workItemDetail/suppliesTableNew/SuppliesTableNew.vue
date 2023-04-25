<template>
  <div :style="{ visibility: isVisibility ? 'visible' : 'hidden' }" style="width:100%;">
    <div class="top-formula-box">
      <span>{{ $t('CONSTRUCTION_SHHEME_MATERIAL_FORMULA') }}</span>
      <span class="formula-span">{{
        baseInfo.edncPubStatementDTO && (baseInfo.edncPubStatementDTO.displayStat || baseInfo.edncPubStatementDTO.statement)
      }}</span>
      <span class="formula-btn" v-if="isEdit && baseInfo.edncPubStatementDTO && baseInfo.edncPubStatementDTO.statement" @click="handleMatchModal">
        <i class="icon_osp icon_ospjisuan"></i>
        {{ $t('EDIT') }}
      </span>
      <span v-else class="formula-btn"></span>
    </div>
    <el-table :data="tableData" border width="100%" :row-class-name="tableRowClassName" @row-click="selectEdit">
      <el-table-column align="left" label-class-name="text-center" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_CLASSIFY')" fixed min-width="150">
        <template slot-scope="scope">
          <el-select
            style="width:100%;"
            @change="val => suppTypeChange(scope.row, val)"
            v-if="scope.row.addTr"
            :data-csname="`suppType_${scope.$index}`"
            v-model="scope.row.suppType"
          >
            <el-option v-for="item in materialClassifyOptions" :key="item.code" :label="item.name" :value="item.code"> </el-option>
          </el-select>
          <div v-else>
            {{ scope.row.suppTypeName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" label-class-name="text-center" :label="$t('NAME')" fixed min-width="150">
        <template slot-scope="scope">
          <el-select
            style="width:100%;"
            v-if="scope.row.addTr && scope.row.suppType && matConfigData[scope.row.suppType]"
            v-model="scope.row.suppId"
            :data-csname="`suppId_${scope.$index}`"
            @change="val => suppIdTypeChange(scope.row, val)"
          >
            <el-option
              v-for="item in matConfigData[scope.row.suppType]"
              :value-key="item.suppId"
              :key="item.suppId"
              :label="item.suppName"
              :value="item.suppId"
            ></el-option>
          </el-select>
          <div v-else>
            {{ scope.row.suppName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" label-class-name="text-center" :label="$t('E_OSP_DP_SELECT_UNIT')" fixed min-width="150">
        <template slot-scope="scope">
          {{ scope.row.measUnit }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CONSTRUCTION_SCHEME_PERR_UNIT_QUOTA')">
        <el-table-column v-for="(item, i) in wuliaoHeads" :key="i" align="center" :label="item.valueDesc" width="auto">
          <template slot-scope="scope">
            <el-input
              v-if="scope.row.addTr || selectIndex === scope.$index"
              v-model="scope.row[item.attrValue]"
              :data-csname="`input_${item.attrValue}_${scope.$index}`"
              class="item-con-input"
              type="number"
            ></el-input>
            <div v-else>
              {{ scope.row[item.attrValue] }}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" :label="$t('OPERATIONS')" fixed="right" width="90" v-if="isEdit">
        <template slot-scope="scope">
          <div v-if="scope.row.addTr || selectIndex === scope.$index">
            <el-tooltip class="item" effect="light" :content="$t('SAVE')" placement="bottom-start">
              <i class="el-icon-receiving opt-icon" @click="saveEdit(scope.$index)"></i>
            </el-tooltip>
            <el-tooltip v-if="!scope.row.addTr" class="item" effect="light" :content="$t('CANCEL')" placement="bottom-start">
              <i class="el-icon-circle-close opt-icon" style="margin-left:10px;" @click="cancelEdit(scope.$index)"></i>
            </el-tooltip>
          </div>
          <div v-else>
            <el-tooltip class="item" effect="light" :content="$t('EDIT')" placement="bottom-start">
              <i class="el-icon-edit-outline opt-icon" @click="editItem(scope.$index, scope.row)"></i>
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="$t('DELETE')" placement="bottom-start">
              <i class="el-icon-delete opt-icon" style="margin-left:10px;" @click="deleteItem(scope.$index)"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Popup :popupObj="editMatchObj" @popupClose="popupMatchClose" @popupOk="editMatchOk">
      <template v-slot:popupBody>
        <CountRule v-model="edncPubStatementDTO" :varList="varList"></CountRule>
      </template>
    </Popup>
  </div>
</template>
<script>
import { qrySupplieslist } from '@/oss_core/edesign/api/query/schema.js';
import { saveMaterialConfig } from '@/oss_core/edesign/api/add/schema.js';
import { deleteConstitemSuppNew } from '@/oss_core/edesign/api/del/schema.js';
import CountRule from '@/oss_core/edesign/osp/constructionScheme/countRule/CountRule.vue';
import { editPubstat } from '@/oss_core/edesign/api/edit/schema.js';

export default {
  name: 'SuppliesTableNew',
  props: {
    detail: {},
    materialClassifyOptions: [],
    isEdit: false,
    varList: [],
  },
  components: {
    CountRule,
  },

  data() {
    return {
      headClass: `th_${Math.ceil(Math.random() * 1000000)}_${Math.ceil(Math.random() * 1000000)}`,
      baseInfo: {},
      wuliaoHeads: [],
      wuliaoData: [],
      tableData: [],
      selectIndex: -1,
      matConfigData: {},
      matConfigDataDefalt: {},
      isVisibility: false,
      materialClassifyOptions: [],
      edncPubStatementDTO: {},
      editMatchObj: {
        title: this.$t('RULE_COMPENT_EDIT_FORMULA'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '80%',
        height: '250px',
        show: false,
        drag: true,
        body: true,
        el: document.body,
        zIndex: 3,
      },
      // defalutItemData:{},//编辑的默认数据
    };
  },

  create() {},

  mounted() {
    this.formatTableData();
  },

  methods: {
    popupMatchClose() {},
    handleMatchModal() {
      this.edncPubStatementDTO = JSON.parse(JSON.stringify(this.baseInfo.edncPubStatementDTO || '{}'));
      this.editMatchObj.show = true;
    },
    editMatchOk() {
      const value = this.edncPubStatementDTO;
      if (value && (value.nullMsg || value.errorMsg)) {
        // 不能为空
        this.$message({
          type: 'error',
          message: value.nullMsg || value.errorMsg,
        });
      } else {
        editPubstat(value).then(res => {
          this.editMatchObj.show = false;
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('SAVE_SUCCESS'),
            });
            this.refresh();
          } else {
            this.$message({
              type: 'error',
              message: res.message || this.$t('AJAX_ERROR'),
            });
          }
        });
      }
    },
    getSupplieslist(suppType) {
      if (!this.matConfigData[suppType]) {
        const param = {
          suppType,
        };
        qrySupplieslist(param).then(res => {
          this.matConfigDataDefalt[suppType] = res.data[suppType] || [];
          this.filterSupp(suppType);
        });
      }
    },
    filterSupp(suppType) {
      const suppIds = this.tableData.map(it => it.suppId);
      let theId;
      if (this.selectIndex > -1) {
        theId = this.tableData[this.selectIndex].suppId;
        suppIds.splice(suppIds.indexOf(theId), 1);
      }
      this.matConfigData[suppType] = this.matConfigDataDefalt[suppType].filter(it => !suppIds.includes(it.suppId));
      this.matConfigData = JSON.parse(JSON.stringify(this.matConfigData));
    },
    resetSupp() {
      const keys = Object.keys(this.matConfigData);
      keys.forEach(it => {
        this.filterSupp(it);
      });
    },
    suppTypeChange(row, val) {
      const obj = this.materialClassifyOptions.find(it => it.code === val) || {};
      row.suppTypeName = obj.name;
      row.suppId = '';
      row.suppName = '';
      row.measUnit = '';
      this.getSupplieslist(val);
    },
    suppIdTypeChange(row, val) {
      const obj = this.matConfigData[row.suppType].find(it => it.suppId === val) || {};
      row.suppName = obj.suppName;
      row.measUnit = obj.measUnit;
    },
    formatTableData() {
      if (this.detail) {
        let tableData = [];
        const suppList = this.detail.suppList || [];
        this.wuliaoHeads = this.detail.relaAttrValueList || [];
        const wuliaoDataMap = {};
        suppList.forEach(it => {
          wuliaoDataMap[it.suppType] = wuliaoDataMap[it.suppType] || {
            suppTypeName: it.suppTypeName,
            suppType: it.suppType,
            dataList: [],
          };
          wuliaoDataMap[it.suppType].dataList.push(it);
        });

        this.wuliaoData = Object.values(wuliaoDataMap);
        this.wuliaoData.forEach(wl => {
          const wlList = [...wl.dataList];
          tableData = [...tableData, ...wlList];
        });
        this.baseInfo = this.detail.basicInfo || {};
        if (this.isEdit) {
          this.tableData = [...tableData, { addTr: true, suppType: '', suppId: '', suppName: '', measUnit: '' }];
          this.selectIndex = this.tableData.length - 1;
        } else {
          this.tableData = tableData;
        }
        this.resetSupp();
        this.$nextTick(() => {
          setTimeout(() => {
            this.isVisibility = true;
          }, 200);
        });
      }
    },
    objectSpanMethod({ row, columnIndex }) {
      if (columnIndex === 0) {
        return {
          rowspan: row.tabCol || 0,
          colspan: 1,
        };
      }
      return {
        rowspan: 1,
        colspan: 1,
      };
    },
    editItem(index, data) {
      this.cancelEdit(this.selectIndex);
      this.selectIndex = index;
      this.defalutItemData = { ...data };
      this.getSupplieslist(data.suppType);
    },
    cancelEdit(index) {
      if (index > -1) {
        if (!this.tableData[index].addTr) {
          this.tableData[index] = { ...this.defalutItemData };
          this.defalutItemData = {};
          this.tableData = JSON.parse(JSON.stringify(this.tableData));
        }
        this.selectIndex = -1;
      }
    },
    selectEdit(row) {
      if (row.addTr) {
        this.cancelEdit(this.selectIndex);
        this.selectIndex = this.tableData.length - 1;
      }
    },
    deleteItem(index) {
      const data = this.tableData[index];
      this.$confirm(this.$t('CONSTRUCTION_SHHEME_DELETE_MATERTAL_TIPS'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        const params = {
          itemSpecId: this.baseInfo.itemSpecId,
          suppId: data.suppId,
        };
        deleteConstitemSuppNew(params).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.refresh();
          } else {
            this.$message({
              message: res.message || this.$t('AJAX_ERROR'),
              type: 'error',
            });
          }
        });
      });
    },
    tableRowClassName({ rowIndex }) {
      if (this.selectIndex === rowIndex) {
        return 'selected-row';
      }
      return '';
    },
    saveEdit(index) {
      // 保存编辑
      const data = this.tableData[index];
      if (!data.suppType) {
        this.$message({
          message: this.$t('CONSTRUCTION_SHHEME_CLASSIFICATION_NULL'),
          type: 'error',
        });
      } else if (!data.suppId || !data.measUnit) {
        this.$message({
          message: this.$t('CONSTRUCTION_SHHEME_MATERIAL_NAME_NULL'),
          type: 'error',
        });
      } else if (!data.measUnit) {
        this.$message({
          message: this.$t('CONSTRUCTION_SHHEME_MATERIAL_UNIT_NULL'),
          type: 'error',
        });
      } else {
        const params = [];
        const defaultEdnCpub = {
          statement: 'workQuantity*quantityPerUnit',
          statJson: {
            default_next_001: {
              nextKey: '',
              operator: '',
              ruleType: 'variable',
              variableCode: 'quantityPerUnit',
              variableName: 'Quantity Per Unit',
            },
            root: {
              nextKey: 'default_next_001',
              operator: '*',
              ruleType: 'variable',
              variableCode: 'workQuantity',
              variableName: 'Work Quantity',
            },
          },
          displayStat: 'Work Quantity * Quantity Per Unit',
          pubStatVarList: [
            {
              varCode: 'workQuantity',
              varName: 'Work Quantity',
            },
            {
              varCode: 'quantityPerUnit',
              varName: 'Quantity Per Unit',
            },
          ],
        };
        this.wuliaoHeads.forEach(item => {
          params.push({
            itemSpecId: this.baseInfo.itemSpecId,
            relaAttrValue: item.attrValue,
            relaAttr: item.attrId,
            suppId: data.suppId,
            quantityPerUnit: data[item.attrValue] || 0,
            suppType: data.suppType,
            measUnit: data.measUnit,
            edncPubStatementDTO: this.baseInfo.edncPubStatementDTO || defaultEdnCpub,
          });
        });
        saveMaterialConfig(params).then(res => {
          if (res.success) {
            this.$message({
              message: this.$t('SAVE_SUCCESS'),
              type: 'success',
            });
            this.refresh();
          } else {
            this.$message({
              message: res.message || this.$t('AJAX_ERROR'),
              type: 'error',
            });
          }
        });
      }
    },
    refresh() {
      this.cancelEdit();
      this.$emit('refreshData', this.baseInfo.itemSpecId);
    },
  },
  watch: {
    detail() {
      this.formatTableData();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './suppliesTableNew.scss';
</style>
