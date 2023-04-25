<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2023-03-28 21:01:40
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 入口页
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\index.vue
-->
<template>
  <div class="scheme-configuration-box edn-page-box">
    <LeftTreeList @changeScheme="selectScheme"></LeftTreeList>
    <span class="right-content-box" :class="{ hasPaddingBt: selectCatCode !== 'CONSTRUCTION_SCHEME' && selectCatCode !== 'EXPORT_FORMAT' }">
      <div class="bottom-options" v-if="selectCatCode !== 'CONSTRUCTION_SCHEME' && selectCatCode !== 'EXPORT_FORMAT'">
        <span class="left-box"> </span>
        <span class="right-box">
          <el-button size="small" @click="saveFunc" type="primary" data-csname="schemeConfigSubmitBtn">{{ $t('SUBMIT') }}</el-button>
        </span>
      </div>
      <EdnTabs :options="tabsList" v-model="selectCatCode"></EdnTabs>
      <div class="btt-content-box" v-show="selectSchemeCode" :class="{ nopadding: selectCatCode === 'EXPORT_FORMAT' }">
        <ChekingRules v-if="selectCatCode === 'CHECKING_RULES'" ref="CHECKING_RULES" :selectSchemeCode="selectSchemeCode"></ChekingRules>
        <ExportAndKml
          :key="selectSchemeCode"
          v-else-if="selectCatCode === 'EXPORT_FORMAT'"
          ref="EXPORT_FORMAT"
          :selectSchemeCode="selectSchemeCode"
          :projectInfo="projectInfo"
        ></ExportAndKml>
        <DesignScheme v-else-if="selectCatCode === 'Design_Draw'" ref="Design_Draw" :selectSchemeCode="selectSchemeCode"></DesignScheme>
        <Construction v-else ref="construction" :selectSchemeCode="selectSchemeCode"></Construction>
      </div>
    </span>
  </div>
</template>
<script>
import LeftTreeList from './leftTreeList/LeftTreeList.vue';
import DesignScheme from './designScheme/DesignScheme.vue';
import { qrySystemParamInfo } from '@/oss_core/edesign/api/query/project.js';
import Construction from '@/oss_core/edesign/osp/schemeConfiguration/construction/Construction.vue';
import ChekingRules from './chekingRules/ChekingRules.vue'; // 组件
import ExportAndKml from './exportAndKml/ExportAndKml.vue'; // 组件

export default {
  name: 'SchemeConfiguration',
  props: {},
  components: {
    LeftTreeList,
    DesignScheme,
    Construction,
    ChekingRules,
    ExportAndKml,
  },
  inject: ['parameterSet'],
  data() {
    return {
      formValue: {},
      configData: [],
      i18n: this.$i18n.locale, // 当前语言
      tabsList: [
        {
          name: this.$t('DESIGN_SCHEME_RULES'),
          code: 'CHECKING_RULES',
        },
        {
          name: this.$t('DESIGN_SCHEME_ELEMENTS'),
          code: 'Design_Draw',
        },
        // {
        //   name: this.$t('DESIGN_SCHEME_BOM_BOQ'),
        //   catCode: 'BOM_BOQ',
        // },
        {
          name: this.$t('DESIGN_SCHEME_EXPORT_DEFINITION'),
          code: 'EXPORT_FORMAT',
        },
      ],
      selectCatCode: 'CHECKING_RULES', // CHECKING_RULES
      selectSchemeCode: '',
      projectInfo: {}, // 传递给kml结构页面的参数
    };
  },

  create() {
    console.log('我加载了');
  },

  mounted() {
    qrySystemParamInfo('CONSTRUCTION.SHOW').then(res => {
      if ((res.SYSTEM_PARAM || {}).DEFAULT_VAL === 'Y') {
        this.tabsList.push({
          name: this.$t('CONSTRUCTION_SCHEME'),
          code: 'CONSTRUCTION_SCHEME',
        });
      }
    });
  },

  methods: {
    selectScheme(code) {
      this.selectSchemeCode = code;
      this.projectInfo.projectSchemaId = code;
      this.projectInfo = { ...this.projectInfo };
    },

    saveFunc() {
      this.$refs[this.selectCatCode] && this.$refs[this.selectCatCode].submit();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './schemeConfiguration.scss';
</style>
