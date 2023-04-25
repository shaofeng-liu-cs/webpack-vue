<!--
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-03-03 14:14:53
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-23 16:06:55
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\constructionScheme\materialConfiguration\addMaterial\AddMaterial.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <el-form class="add-material-body" :model="formLabelAlign" :rules="rules" ref="headForm">
        <div class="material-single-line">
          <el-form-item class="left-content" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_CLASSIFY')" prop="materialClassify">
            <el-select
              v-model="formLabelAlign.materialClassify"
              :placeholder="$t('PLEASE_SELECT')"
              size="mini"
              @change="changeMaterialClassify"
              :disabled="actionType === 'edit'"
            >
              <el-option v-for="item in materialClassifyOptions" :key="item.code" :label="item.name" :value="item.code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="right-content" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_NAME')" prop="materialName">
            <el-select
              v-model="formLabelAlign.materialName"
              :placeholder="$t('PLEASE_SELECT')"
              clearable
              size="mini"
              @change="changeMaterialName"
              :disabled="actionType === 'edit'"
            >
              <el-option v-for="item in materialNameOptions" :key="item.suppId" :label="item.suppName" :value="item.suppId"> </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="material-single-line">
          <el-form-item class="left-content" :label="$t('CONSTRUCTION_SHHEME_CONSTRUNCTION_MEASUREMENT_UNIT')">
            <el-input size="mini" disabled="true" class="unit-input" v-model="pMeasUnit"></el-input>
          </el-form-item>
          <el-form-item class="right-content" :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_PROPERTIES')" prop="associatedProperties">
            <el-select v-model="formLabelAlign.associatedProperties" :placeholder="$t('PLEASE_SELECT')" clearable size="mini" disabled>
              <el-option v-for="item in associatedPropertiesOptions" :key="item.attrId" :label="item.attrName" :value="item.attrId"> </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="material-single-line-bottom">
          <el-form-item class="row-content" :label="$t('CONSTRUCTION_SHHEME_CALCULATION_FORMULA')" prop="ruleParams">
            <div class="calc-content">
              <CountRule v-model="formLabelAlign.ruleParams" :varList="varList"></CountRule>
            </div>
          </el-form-item>
        </div>
        <div class="material-single-line-bottom">
          <el-form-item class="grid-content" :label="$t('CONSTRUCTION_SHHEME_QQUOTA_ALLOCATION')">
            <div class="quota-table">
              <el-table
                ref="materialGrid"
                @cell-mouse-enter="cellMouseEnter"
                :data="formLabelAlign.quotaGridData"
                height="220px"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                size="mini"
              >
                <el-table-column prop="suppName" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_NAME')" min-width="100"> </el-table-column>
                <el-table-column prop="measUnit" :label="$t('CONSTRUCTION_SHHEME_MATERIAL_UNIT')" min-width="100"> </el-table-column>
                <el-table-column prop="relaAttrName" :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_PROPERTIES')" min-width="120"> </el-table-column>
                <el-table-column prop="relaAttrValueName" :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_ATTRIBUTE_VALUE')" min-width="120">
                </el-table-column>
                <el-table-column required prop="quantityPerUnit" :label="$t('CONSTRUCTION_SHHEME_REQUIRED_PER_UNIT')" min-width="120">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.quantityPerUnit" :placeholder="$t('PLEASE_ENTER')" size="mini"> </el-input>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </template>
  </popup>
</template>
<script>
import { queryMaterialClassify } from '@/oss_core/edesign/api/query/dictId.js';
import { addMaterialConfig } from '@/oss_core/edesign/api/add/schema.js';
import { getSuppIdsUsedById, qrySupplieslist, qryMaterialList } from '@/oss_core/edesign/api/query/schema.js';
import { editConstitemSupp } from '@/oss_core/edesign/api/edit/schema.js';
import { queryAttrsInfo } from '@/oss_core/edesign/api/query/resType.js';

import CountRule from '../../countRule/CountRule.vue';
export default {
  name: 'AddMaterial',
  components: { CountRule },
  data() {
    return {
      popupObj: {
        title: this.$t('CONSTRUCTION_SHHEME_ADD_MATERIAL'), // 弹框标题
        ok: 'OK', // 确认按钮内容
        close: 'Cancel', // 取消按钮内容
        modal: true, // 是否蒙层
        width: '980px',
        height: '700px',
        // el: this.getHldEl(), // 指定插入节点
        show: true, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
        resize: 'both',
      },
      materialClassifyOptions: [],
      materialNameOptions: [],
      associatedPropertiesOptions: [],
      actionType: '', //操作类型
      // 表单数据
      formLabelAlign: {
        materialClassify: '',
        materialName: '',
        associatedProperties: '',
        quotaGridData: [],
        ruleParams: {
          statJson: {
            root: {
              ruleType: 'variable',
              variableName: 'Work Quantity',
              variableCode: 'workQuantity',
              operator: '*',
              nextKey: 'default_next_001',
            },
            default_next_001: {
              ruleType: 'variable',
              variableName: 'Quantity Per Unit',
              variableCode: 'quantityPerUnit',
              operator: '',
              nextKey: '',
            },
          },
        },
      },
      rules: {
        materialClassify: [{ required: true, message: this.$t('CONSTRUCTION_SHHEME_CLASSIFICATION_NULL') }],
        materialName: [{ required: true, message: this.$t('CONSTRUCTION_SHHEME_MATERIAL_NAME_NULL') }],
        associatedProperties: [{ required: true, message: this.$t('CONSTRUCTION_SHHEME_ASSOCIATION_PROPERTY_NULL') }],
        ruleParams: [{ required: true }, { validator: this.validateRule }],
      },
      pMeasUnit: '',
    };
  },
  props: {
    rowData: {
      type: Object,
    },
    resData: {
      type: Object,
    },
    varList: {
      type: Array,
    },
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.actionType = this.$parent.actionFlag;
      this.pMeasUnit = this.resData.pMeasUnit;
      if (this.actionType === 'edit') {
        this.formLabelAlign = {
          materialClassify: this.rowData.suppTypeName,
          materialName: this.rowData.suppName,
          associatedProperties: this.rowData.relaAttrName ? this.rowData.relaAttrName : 'Unassociated',
          quotaGridData: [],
          ruleParams: this.rowData.edncPubStatementDTO,
        };
        this.loadGrid();
      } else {
        this.formLabelAlign.associatedProperties = this.resData.relaAttrName ? this.resData.relaAttrName : 'Unassociated';
        this.queryMaterialClass();
        this.querySuppIdsUsedById();
        this.getAttrInfo();
      }
    },
    // 编辑情况下加载表格
    loadGrid() {
      let params = {
        itemSpecId: this.rowData.itemSpecId, //this.rowData.itemSpecId,
        suppId: this.rowData.suppId,
        pageIndex: 0,
        pageLen: 1000,
      };
      qryMaterialList(params).then(res => {
        if (res.data) {
          // 展示的数据
          this.formLabelAlign.quotaGridData = res.data.edncConstItemSuppDTOS;
        }
      });
    },
    // 查询施工项已配置物料规格id清单
    querySuppIdsUsedById() {
      getSuppIdsUsedById({
        itemSpecId: this.resData.itemSpecId,
      }).then(res => {
        console.log(res);
        this.suppIdUsed = res.data;
      });
    },
    // 查询关联属性
    getAttrInfo() {
      queryAttrsInfo(this.resData.resType).then(res => {
        this.associatedPropertiesOptions = [];
        if (res.resultList.length > 0) {
          res.resultList.map(item => {
            if (item.attrValues.length > 0) {
              this.associatedPropertiesOptions.push(item);
            }
          });
        }
        this.associatedPropertiesOptions.push({
          attrName: 'Unassociated',
          attrId: ' ',
        });
      });
    },
    changeMaterialClassify(suppType) {
      this.formLabelAlign.materialName = '';
      this.materialNameOptions = [];
      this.getSupplieslist(suppType);
    },
    changeMaterialName(val) {
      console.log(val);
      let obj = this.materialNameOptions.find(item => item.suppId === val);
      this.selectedMaterialName = obj;
      this.getGridData(this.resData.relaAttr);
    },
    // changeAssociatedProperties(val) {
    //   this.getGridData(val);
    // },
    // 获取表格数据
    getGridData(val) {
      let obj = this.associatedPropertiesOptions.find(item => item.attrId === val);
      let gridData = [];
      if (obj.attrValues) {
        obj.attrValues.forEach(item => {
          gridData.push({
            relaAttrValue: item.attrValue,
            relaAttrValueName: item.valueDesc,
            relaAttr: obj.attrId,
            relaAttrName: obj.attrName,
            suppId: this.selectedMaterialName.suppId,
            suppName: this.selectedMaterialName.suppName,
            quantityPerUnit: '',
            measUnit: this.selectedMaterialName.measUnit,
          });
        });
      } else {
        gridData.push({
          relaAttrValue: '',
          relaAttrValueName: '',
          relaAttr: '',
          relaAttrName: '',
          suppId: this.selectedMaterialName.suppId,
          suppName: this.selectedMaterialName.suppName,
          quantityPerUnit: '',
          measUnit: this.selectedMaterialName.measUnit,
        });
      }
      this.formLabelAlign.quotaGridData = gridData;
    },
    getSupplieslist(suppType) {
      let param = {
        suppType: suppType,
      };
      qrySupplieslist(param).then(res => {
        console.log(res);
        if (this.suppIdUsed.length > 0) {
          res.data[suppType].map(item => {
            let flag = true;
            this.suppIdUsed.map(single => {
              if (item.suppId === single) {
                flag = false;
              }
            });
            flag && this.materialNameOptions.push(item);
          });
        } else {
          this.materialNameOptions = res.data[suppType];
        }
      });
    },
    // 查询物料分类下拉框值
    queryMaterialClass() {
      queryMaterialClassify('EDNC_SUPPLIES.SUPP_TYPE').then(res => {
        console.log(res);
        this.materialClassifyOptions = res.data;
      });
    },
    // 新增物料配置
    newMaterialConfig() {
      let params = [];
      this.formLabelAlign.quotaGridData.forEach(item => {
        params.push({
          itemSpecId: this.resData.itemSpecId,
          relaAttrValue: item.relaAttrValue,
          relaAttr: item.relaAttr,
          suppId: item.suppId,
          quantityPerUnit: item.quantityPerUnit,
          suppType: this.formLabelAlign.materialClassify,
          measUnit: item.measUnit,
          edncPubStatementDTO: this.formLabelAlign.ruleParams,
        });
      });
      addMaterialConfig(params).then(res => {
        this.$parent.loadGrid();
      });
    },
    // 编辑物料配置
    editMaterialConfig() {
      let params = [];
      this.formLabelAlign.quotaGridData.forEach(item => {
        params.push({
          itemSpecId: this.resData.itemSpecId,
          relaAttrValue: item.relaAttrValue,
          relaAttr: item.relaAttr,
          suppId: item.suppId,
          quantityPerUnit: item.quantityPerUnit,
          suppType: this.formLabelAlign.materialClassify,
          measUnit: item.measUnit,
          edncPubStatementDTO: this.formLabelAlign.ruleParams,
          statId: this.rowData.statId,
          seq: item.seq,
        });
      });
      editConstitemSupp(params).then(res => {
        this.$parent.loadGrid();
      });
    },
    validateRule(rule, value, callback) {
      if (value && value.nullMsg) {
        //不能为空
        callback(new Error(value.nullMsg));
      } else if (value && value.errorMsg) {
        callback(new Error(value.errorMsg));
      } else {
        callback();
      }
    },
    popupOk() {
      this.$refs.headForm.validate(valid => {
        if (valid) {
          if (this.actionType === 'edit') {
            this.editMaterialConfig();
          } else {
            this.newMaterialConfig();
          }
          this.$emit('close');
        } else {
          console.log('error submit!!');
        }
      });
    },
    popupClose() {
      this.$emit('close');
    },
  },
};
</script>
<style lang="scss" scoped>
@import './addMaterial.scss';
</style>
