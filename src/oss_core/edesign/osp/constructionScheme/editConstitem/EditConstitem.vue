<template>
  <Popup :popupObj="editWorkModal" @popupClose="popupClose" @popupOk="editWorkOk">
    <template v-slot:popupBody>
      <div class="edit-constitem-modal">
        <el-form
          label-position="top"
          size="mini"
          :model="editWorkForm"
          :rules="editRules"
          label-width="auto"
          ref="editValidateForm"
          class="demo-ruleForm"
        >
          <el-form-item :label="$t('CONSTRUCTION_SCHEME_WORK_ITEM_NAME')" prop="itemName">
            <el-input v-model="editWorkForm.itemName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('UNIT')" prop="measUnit">
            <el-select v-model="editWorkForm.measUnit" :placeholder="$t('PLEASE_SELECT')">
              <el-option v-for="item in selectOptions" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('CONSTRUCTION_SHHEME_ASSOCIATED_PROPERTIES')" prop="relaAttr">
            <el-select
              v-model="editWorkForm.relaAttr"
              :placeholder="$t('PLEASE_SELECT')"
              size="mini"
              :disabled="editWorkForm && editWorkForm.itemSpecId"
            >
              <el-option v-for="item in associatedPropertiesOptions" :key="item.attrId" :label="item.attrName" :value="item.attrId"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('CONSTRUCTION_SCHEME_WORK_ITEM_QUANTITY_FORMULA')" prop="endcPubStat">
            <CountRule v-model="editWorkForm.endcPubStat" :varList="varList"></CountRule>
          </el-form-item>
          <el-form-item :label="$t('DESCRIPTION')" prop="description">
            <el-input type="textarea" v-model="editWorkForm.description"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </template>
  </Popup>
</template>
<script>
import { addConstitem } from '@/oss_core/edesign/api/add/schema.js';
import { updateConstitem } from '@/oss_core/edesign/api/edit/schema.js';
import { queryMaterialClassify } from '@/oss_core/edesign/api/query/dictId.js';
import { queryAttrsInfo } from '@/oss_core/edesign/api/query/resType.js';

import CountRule from '../countRule/CountRule.vue';

export default {
  name: 'EditConstitem',
  props: {
    varList: [],
    resType: '',
    constSchemeId: '',
  },
  components: {
    CountRule,
  },

  data() {
    return {
      editWorkModal: {
        title: this.$t('CONSTRUCTION_SCHEME_WORK_ITEM_MANAGEMENT'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '600px',
        height: 'auto',
        show: false,
        drag: true,
        zIndex: 3,
        el: document.body,
      },
      editWorkForm: {
        itemName: '',
        measUnit: '',
        endcPubStat: '',
        description: '',
      },
      editRules: {
        itemName: [{ required: true, message: this.$t('CONSTRUCTION_SCHEME_WORK_ITEM_NAME_NO_NULL') }],
        measUnit: [{ required: true, message: this.$t('CONSTRUCTION_SCHEME_WORK_ITEM_UNIT_SELECT') }],
        relaAttr: [{ required: true, message: this.$t('CONSTRUCTION_SHHEME_ASSOCIATION_PROPERTY_NULL') }],
        endcPubStat: [{ required: true }, { validator: this.validateRule }],
      },
      selectOptions: [],
      associatedPropertiesOptions: [],
    };
  },
  mounted() {
    queryMaterialClassify('END.ITEM.MEAS_UNIT').then(res => {
      this.selectOptions = res.data || [];
    });
    this.getAttrInfo();
  },
  methods: {
    // 查询关联属性
    getAttrInfo() {
      if (this.resType) {
        queryAttrsInfo(this.resType).then(res => {
          this.associatedPropertiesOptions = [];
          if (res.resultList.length > 0) {
            res.resultList.forEach(item => {
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
      }
    },
    handleShow(item) {
      this.editWorkForm = item || {
        itemName: '',
        measUnit: '',
        endcPubStat: '',
        description: '',
      };
      this.editWorkModal.show = !this.editWorkModal.show;
    },
    popupClose() {},
    validateRule(rule, value, callback) {
      if (value && value.nullMsg) {
        // 不能为空
        callback(new Error(value.nullMsg));
      } else if (value && value.errorMsg) {
        callback(new Error(value.errorMsg));
      } else {
        callback();
      }
    },
    editWorkOk() {
      this.$refs.editValidateForm.validate(valid => {
        if (valid) {
          const func = this.editWorkForm.itemSpecId ? updateConstitem : addConstitem;
          func({
            constSchemeId: this.constSchemeId,
            ...this.editWorkForm,
          }).then(res => {
            if (res.success) {
              this.$message({
                message: this.$t('SAVE_SUCCESS'),
                type: 'success',
              });
              this.editWorkModal.show = false;
              this.$emit('refresh');
            }
          });
        } else {
          console.log('error submit!!');
        }
      });
    },
  },
  watch: {
    resType() {
      this.getAttrInfo();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './editConstitem.scss';
</style>
