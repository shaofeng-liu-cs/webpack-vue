<template>
  <div class="design-preparation">
    <div class="preparation-box">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t(showSurvey ? 'E_OSP_DP_SELECT_SURVEY' : 'E_OSP_DP_SELECT_PARAMETER_SET') }}
          <span class="change-tab-down" v-if="!showSurvey">
            <el-dropdown @command="changeTab">
              <span class="tab-dropdown-link">
                <i class="el-icon-edit-outline"></i>
                <span class="down-name">{{ currTabName }}</span>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in parameterList"
                  :key="index"
                  :valueName="i18n === 'en' ? item.PARAM_CATA_NAME_EN : item.PARAM_CATA_NAME_CN"
                  :command="item.PARAM_CAT_CODE"
                  >{{ i18n === 'en' ? item.PARAM_CATA_NAME_EN : item.PARAM_CATA_NAME_CN }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="load-scheme-box" v-if="!showSurvey">
            <el-select data-csname="loadSchemeSelect" class="scheme-select" v-model="selectSchema" :placeholder="$t('PLEASE_SELECT')">
              <el-option v-for="item in schemaSetting" :key="item.projectSchemaId" :label="item.projectSchemaName" :value="item.projectSchemaId">
              </el-option>
            </el-select>
            <el-button type="primary" size="mini2" @click="saveSchema">{{ $t('LOAD') }}</el-button>
          </span>
        </span>
        <span class="right-box">
          <span class="change-tab-text cursor-hover" @click="showSurvey = !showSurvey">{{
            $t(showSurvey ? 'E_OSP_DP_SELECT_PARAMETER_SET' : 'E_OSP_DP_SELECT_SURVEY')
          }}</span>
        </span>
      </div>

      <div class="preparation-content" v-if="!showSurvey" :style="{ paddingBottom: currTabCode === 'EXPORT_FORMAT' ? '0' : '20px' }">
        <component
          v-if="currTabCode"
          :is="compentMap[currTabCode]"
          :ref="currTabCode"
          :sprintId="projectInfo.sprintId"
          :projectInfo="projectInfo"
          :disabled="true"
          @initScheme="initSchemeCode"
        ></component>
      </div>
      <div class="preparation-content" v-else>
        <keep-alive>
          <HldDesign :projectInfo="projectInfo"></HldDesign>
        </keep-alive>
      </div>
    </div>
    <div class="footer-btns">
      <el-button type="primary" size="mini" @click="submit" data-csname="projectEditSubmit"> {{ $t('NEXT') }}</el-button>
    </div>
  </div>
</template>

<script>
import HldDesign from '@/oss_core/edesign/osp/design/hldDesign/HldDesign.vue'; // 组件
import Construction from '@/oss_core/edesign/osp/schemeConfiguration/construction/Construction.vue'; // 组件

import ChekingRules from '@/oss_core/edesign/osp/schemeConfiguration/chekingRules/ChekingRules.vue';
import ExportAndKml from '@/oss_core/edesign/osp/schemeConfiguration/exportAndKml/ExportAndKml.vue';
import DrawList from './DrawList.vue';
import BOMBOQ from './BOMBOQ.vue';

import { getSchemaList, getSchemaInfo } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
import { editSchemaInfo } from '@/oss_core/edesign/api/edit/sprint.js'; // 后台接口
import { addDesignTask } from '@/oss_core/edesign/api/add/project.js'; // 后台接口
import { queryMapNoByProjectId, qrySystemParamInfo } from '@/oss_core/edesign/api/query/project.js'; // 后台接口

export default {
  name: 'ProjectCreation2',
  components: {
    HldDesign,
    Construction,
    ChekingRules,
    ExportAndKml,
    DrawList,
    BOMBOQ,
  },
  inject: ['parameterSet', 'getTaskInfo', 'getInitData'],
  computed: {
    taskInfo() {
      return this.getTaskInfo();
    },
  },
  // props: {
  //   projectInfo: {
  //     type: Object,
  //     default: () => {
  //       return {};
  //     },
  //   },
  // },
  data() {
    return {
      compentMap: {
        CHECKING_RULES: 'ChekingRules',
        CONSTRUCTION_SETTING: 'Construction',
        EXPORT_FORMAT: 'ExportAndKml',
        Design_Draw: 'DrawList',
        BOM_BOQ: 'BOMBOQ',
      },
      showSurvey: false,
      projectInfo: this.getInitData().projectInfo || {}, // 工程详情
      currTabCode: '',
      currTabName: '',
      componentList: [
        {
          name: 'ParameterSetting',
          title: this.$t('E_OSP_DP_SELECT_PARAMETER_SET'),
        },
        {
          name: 'Survey',
          title: this.$t('E_OSP_DP_SELECT_SURVEY'),
        },
        // {
        //   name: 'DesignSplitting',
        //   title: this.$t('E_MAINPAGEMANAGER_DESIGN_SPLITTING'),
        // },
      ], // 外层页签信息
      selectSchema: '', // 所选schema信息
      schemaSetting: [], // 可选schema列表
      i18n: this.$i18n.locale, // 当前语言
      parameterList: [], // 当前视图所有的描绘数据
      constructionShow: false,
    };
  },
  created() {
    // this.row = JSON.parse(JSON.stringify(this.rowData));
  },

  mounted() {
    this.projectInfo.markFlag = 'sprint';
    this.projectInfo.schemaId = this.projectInfo.sprintId;

    if (!this.projectInfo.mapNo) {
      queryMapNoByProjectId(this.projectInfo.projectId).then(result => {
        this.projectInfo.mapNo = result.resultData;
      });
    }
    if (!this.projectInfo.hldPreTaskId) {
      const param = {
        projectId: this.projectInfo.sprintId,
        taskType: 'HLD_PRE',
      };
      getSchemaInfo(param).then(result => {
        this.projectInfo.hldPreTaskId = result.resultList[0].taskId;
      });
    }
    getSchemaList(this.projectInfo.sprintId).then(data => {
      this.schemaSetting = data || [];
      this.selectSchema = (data[0] || {}).projectSchemaId;
    });
    qrySystemParamInfo('CONSTRUCTION.SHOW').then(res => {
      this.constructionShow = (res.SYSTEM_PARAM || {}).DEFAULT_VAL === 'Y';
      this.initParameterSet();
    });
  },
  methods: {
    changeTab(val, obj) {
      const name = obj.$attrs.valueName;
      this.currTabCode = val;
      this.currTabName = name;
    },
    initSchemeCode(code) {
      if (!this.init) {
        this.init = true;
        this.selectSchema = code;
        this.projectInfo = {
          ...this.projectInfo,
          projectSchemaId: code,
        };
      }
    },

    initParameterSet() {
      this.parameterList = JSON.parse(JSON.stringify(this.parameterSet));
      if (!this.constructionShow) {
        this.parameterList = this.parameterList.filter(it => it.PARAM_CAT_CODE !== 'CONSTRUCTION_SETTING');
      }
      const obj = this.parameterList[0] || {};
      this.currTabCode = obj.PARAM_CAT_CODE;
      this.currTabName = this.i18n === 'en' ? obj.PARAM_CATA_NAME_EN : obj.PARAM_CATA_NAME_CN;
    },
    saveSchema() {
      const param = {
        schemaId: this.selectSchema,
        sprintId: this.projectInfo.sprintId,
      };
      editSchemaInfo(param).then(() => {
        this.projectInfo = {
          ...this.projectInfo,
          projectSchemaId: this.selectSchema,
        };
        this.$refs[this.currTabCode] && this.$refs[this.currTabCode].refresh();
        // this.$refs.construction && this.$refs.construction[0] && this.$refs.construction[0].loadSelectProjectConstructScheme();
        this.$message({
          type: 'success',
          message: this.$t('SAVE_SUCCESS'),
        });
      });
    },
    async submit() {
      if (Object.keys(this.taskInfo).length === 0) {
        const param = {
          taskId: this.projectInfo.hldPreTaskId,
        };
        const resultData = await addDesignTask(param);
        const taskInfo = resultData.newTaskList[0];
        this.$set(this.taskInfo, 'title', taskInfo.title);
        this.$set(this.taskInfo, 'hdUserName', taskInfo.hdUserName);
        this.$set(this.taskInfo, 'stateDesc', taskInfo.stateName);
        this.taskInfo.projectId = taskInfo.projectId;
        this.taskInfo.taskId = taskInfo.taskId;
        this.taskInfo.state = taskInfo.state;
      }
      this.$emit('submit', 'Design');
    },
  },
};
</script>
<style lang="scss" scoped>
@import './designPreparation.scss';
</style>
