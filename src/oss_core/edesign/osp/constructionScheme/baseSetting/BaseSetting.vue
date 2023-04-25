<template>
  <el-form class="head-form-box" label-position="top" :model="formValue" :rules="rules" ref="baseSettingForm">
    <div class="top-items">
      <el-form-item prop="schemeName" :label="$t('DESIGN_SCHEME_NEW_SCHEME_NAME')">
        <el-input size="small" v-model="formValue.schemeName"></el-input>
      </el-form-item>
      <el-form-item prop="description" :label="$t('DESCRIPTION')">
        <el-input size="small" v-model="formValue.description"></el-input>
      </el-form-item>
      <el-form-item prop="resTypeName" :label="$t('CONSTRUCTION_SCHEME_RESOURCE_SPE')">
        <el-input size="small" v-model="formValue.resTypeName" disabled></el-input>
      </el-form-item>
      <el-form-item prop="constCatName" :label="$t('CONSTRUCTION_SCHEME_CATE')">
        <el-input size="small" v-model="formValue.constCatName" disabled></el-input>
      </el-form-item>
    </div>
    <div class="rule-form-item-div">
      <div class="child-head-title m-t">
        <span class="head-title">{{ $t('CONSTRUCTION_SCHEME_MATCHING_POLICY') }}</span>
      </div>
      <div class="m-t rule-tips">
        <i class="el-icon-warning-outline"></i>
        {{ $t('CONSTRUCTION_SCHEME_MATCHING_POLICY_MSG') }}
      </div>
      <div class="rule-body">
        <el-form-item label="" prop="endcPubStat">
          <RuleSetting v-model="formValue.endcPubStat" :varList="data && data.edncFeatureAttrList"></RuleSetting>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script>
import RuleSetting from '../ruleSetting/RuleSetting.vue';
import { addConstruct } from '@/oss_core/edesign/api/add/schema.js';
import CountRule from '../countRule/CountRule.vue';
import { updateConstruct } from '@/oss_core/edesign/api/edit/schema.js';

export default {
  name: 'ConstructionScheme',
  props: {
    data: {},
  },
  components: {
    RuleSetting,
    CountRule,
  },

  data() {
    return {
      selectSchemeCode: '',
      formValue: {
        schemeName: '',
        resTypeName: '',
        constCatName: '',
        description: '',
        endcPubStat: {},
      },
      rules: {
        schemeName: [{ required: true, message: this.$t('DESIGN_SCHEME_NEW_SCHEME_NAME_NO_NULL') }],
        endcPubStat: [{ validator: this.validateRule }],
      },
    };
  },
  mounted() {
    this.formValue = {
      ...this.formValue,
      ...this.data,
    };
  },
  methods: {
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
    onSubmit(call, error) {
      this.$refs.baseSettingForm.validate(valid => {
        if (valid) {
          const func = this.formValue.constSchemeId ? updateConstruct : addConstruct;
          func({ ...this.formValue }).then(res => {
            if (res.success) {
              this.$message({
                message: this.$t('SAVE_SUCCESS'),
                type: 'success',
              });
              call && call(this.formValue);
            } else {
              this.$message({
                message: res.message || this.$t('AJAX_ERROR'),
                type: 'error',
              });
              error && error();
            }
          });
        } else {
          error && error();
          console.log('error submit!!');
        }
      });
    },
  },
  watch: {
    data(val) {
      this.formValue = {
        ...this.formValue,
        ...val,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
@import './baseSetting.scss';
</style>
