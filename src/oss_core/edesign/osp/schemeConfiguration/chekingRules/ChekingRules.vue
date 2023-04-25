<template>
  <el-scrollbar>
    <el-form :model="formValue" ref="configForm" label-position="top">
      <div class="groups-container">
        <div v-for="(item, index) in configData" :key="index">
          <div class="child-head-title">
            <span class="head-title">{{ i18n === 'en' ? item.PARAM_GROUP_NAME_EN : item.PARAM_GROUP_NAME_CN }}</span>
          </div>
          <div v-if="item.PARAMS && item.PARAMS.length > 0" class="groups-item">
            <div v-for="(attr, attrIndex) in item.PARAMS" :key="attrIndex" class="item-fit">
              <el-form-item :prop="attr.PARAM_CODE" :label="i18n === 'en' ? attr.PARAM_NAME_EN : attr.PARAM_NAME_CN">
                <span v-if="disabled && !formValue[attr.PARAM_CODE]" class="theme-text-val">-</span>
                <el-input
                  :disabled="disabled"
                  :data-csname="attr.PARAM_CODE"
                  v-else-if="attr.CONTROL_TYPE === '1'"
                  size="mini"
                  v-model="formValue[attr.PARAM_CODE]"
                ></el-input>
                <el-select
                  :disabled="disabled"
                  :data-csname="attr.PARAM_CODE"
                  v-else-if="attr.CONTROL_TYPE === '2'"
                  v-model="formValue[attr.PARAM_CODE]"
                  :placeholder="$t('PLEASE_SELECT')"
                >
                  <el-option v-for="item in attr.DATA_SOURCE" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                </el-select>
              </el-form-item>
              <div v-if="attr.childList" class="item-child-list">
                <div
                  class="child-it"
                  v-for="(attrChild, attrChildIndex) in attr.childList"
                  :key="attrChildIndex"
                  v-show="attrChild.DISP_VAL === attr.value"
                >
                  <el-form-item :prop="attrChild.PARAM_CODE" :label="i18n === 'en' ? attrChild.PARAM_NAME_EN : attrChild.PARAM_NAME_CN">
                    <span v-if="disabled && !formValue[attrChild.PARAM_CODE]" class="theme-text-val">-</span>

                    <el-input
                      :disabled="disabled"
                      :data-csname="attrChild.PARAM_CODE"
                      v-else-if="attrChild.CONTROL_TYPE === '1'"
                      size="mini"
                      v-model="formValue[attrChild.PARAM_CODE]"
                    ></el-input>
                    <el-select
                      :disabled="disabled"
                      :data-csname="attrChild.PARAM_CODE"
                      v-else-if="attrChild.CONTROL_TYPE === '2'"
                      v-model="formValue[attrChild.PARAM_CODE]"
                      :placeholder="$t('PLEASE_SELECT')"
                    >
                      <el-option v-for="item in attrChild.DATA_SOURCE" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-form>
  </el-scrollbar>
</template>
<script>
import { queryDesignrules } from '@/oss_core/edesign/api/query/schema.js';
import { updateDesignRules } from '@/oss_core/edesign/api/edit/schema.js';
import { getKMLSettings } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口

export default {
  name: 'ChekingRules',
  props: {
    selectSchemeCode: '',
    sprintId: '',
    disabled: false,
  },
  components: {},
  inject: ['parameterSet'],
  data() {
    return {
      configCode: 'CHECKING_RULES',
      formValue: {},
      configData: [],
    };
  },

  create() {},

  mounted() {
    this.loadConfigData();
  },

  methods: {
    refresh() {
      console.log('刷新rules数据....');
      this.loadConfigData();
    },
    loadConfigData() {
      if (this.selectSchemeCode || this.sprintId) {
        const func = this.sprintId ? getKMLSettings : queryDesignrules;
        func(this.sprintId || this.selectSchemeCode).then(res => {
          const formValue = {};
          let schemeCode;
          let list = this.sprintId ? res.resultList : res;
          (list || []).forEach(it => {
            if (it.paramNo === 'PROJECT_DESIGN_SCHEMA' && this.sprintId) {
              schemeCode = it.paramVal;
            }
            formValue[it.paramNo] = it.paramVal;
            if (it.extVal && typeof it.extVal === 'object') {
              const extVal = JSON.parse(it.extVal);
              extVal.forEach(ext => {
                formValue[ext.paramNo] = ext.paramVal;
              });
            }
          });
          if (schemeCode) {
            //在工程那边使用
            this.$emit('initScheme', schemeCode);
          }
          this.configData = ((this.parameterSet || []).find(it => it.PARAM_CAT_CODE === this.configCode) || {}).GROUPS || [];
          this.formValue = formValue;
        });
      } else {
        this.formValue = {};
        this.configData = [];
      }
    },
    submit() {
      const value = this.formValue;
      const params = [];
      (this.configData || []).forEach(group => {
        (group.PARAMS || []).forEach(it => {
          let extVal = null;
          if (it.childList && it.childList.length) {
            extVal = extVal || [];
            it.childList.forEach(child => {
              if (value[child.PARAM_CODE] || value[child.PARAM_CODE] === 0) {
                extVal.push({
                  projectSchemaId: this.selectSchemeCode,
                  paramNo: child.PARAM_CODE,
                  paramVal: value[child.PARAM_CODE],
                });
              }
            });
          }
          if (extVal && extVal.length) {
            const parItem = {
              projectSchemaId: this.selectSchemeCode,
              paramNo: it.PARAM_CODE,
              paramVal: value[it.PARAM_CODE],
              extVal: JSON.stringify(extVal),
            };
            params.push(parItem);
          } else if (value[it.PARAM_CODE] || value[it.PARAM_CODE] === 0) {
            const parItem = {
              projectSchemaId: this.selectSchemeCode,
              paramNo: it.PARAM_CODE,
              paramVal: value[it.PARAM_CODE],
            };
            params.push(parItem);
          }
        });
      });
      console.log('提交格式化：', params);
      updateDesignRules({
        projectSchemaId: this.selectSchemeCode,
        designRules: params,
      }).then(() => {
        fish.toast('success', this.$t('SAVE_SUCCESS'));
      });
    },
  },
  watch: {
    selectSchemeCode() {
      this.loadConfigData();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './chekingRules.scss';
</style>
