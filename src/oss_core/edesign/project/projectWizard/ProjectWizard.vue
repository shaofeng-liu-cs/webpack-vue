<template>
  <div class="projectWizardBox">
    <EdnStep v-model="stepNum" :maxStep.sync="maxNum" :steps="stepList" @change="stepChange" v-if="initTury"></EdnStep>
    <div v-show="controlData.parentName === 'project'" class="wizardBody">
      <keep-alive>
        <component :is="soltName" v-on="$listeners" :detail="projectInfo" @changeProjectInfo="changeProjectInfo"></component>
      </keep-alive>
    </div>
    <div v-show="controlData.parentName === 'osp'" class="wizardBody">
      <div class="osp-container"></div>
    </div>
  </div>
</template>
<script>
import ProjectEdit from './projectEdit/ProjectEdit.vue';
import { queryProjectDetail, qrySystemParamInfo } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'ProjectWizard',
  components: {
    ProjectEdit,
  },
  props: {
    param: Object,
  },
  provide() {
    return {
      getControlData: () => this.controlData, // 全局控制数据
      getProjectInfo: () => this.projectInfo, // 工程详情数据共享
      getStepMaxNum: () => this.maxNum, // 获取当前进行到哪一步
    };
  },
  data() {
    return {
      controlData: {
        soltName: '', // 当前展示的子组件名称
        parentName: '', // 当前入口的js模块名称
      },
      soltName: '', // project的子组件的名称
      stepNum: 1, // 第几步
      stepList: [], // 步骤详细参数
      maxNum: 1, // 最大步骤数  工程进行到第几步
      projectInfo: {},
      isLoadOsp: false, // osp是否加载过，防止重复加载
      initTury: false, // 初始化数据加载好后再加载步骤组件
      flowId: this.param.flowId,
    };
  },

  create() {},

  mounted() {
    this.init();
  },

  methods: {
    async init() {
      if (this.param.projectId) {
        const projectData = await queryProjectDetail(this.param.projectId);
        this.flowId = projectData.resultData.flowId;
        this.projectInfo = projectData.resultData;
      } else {
        this.projectInfo.stageCode = 'ACCEPTANCE';
        this.projectInfo.flowId = this.flowId;
      }
      qrySystemParamInfo('CONSTRUCTION.SHOW').then(res => {
        this.constructionFlag = res.SYSTEM_PARAM.DEFAULT_VAL;

        this.initStep();
      });
    },
    initStep() {
      const stepList = [
        { name: this.$t('PROJECT_CREATION'), description: this.$t('PROJECT_CREATION_DESC'), img: 'oss_core/edesign/assets/image/project/step_1.png' },
        {
          name: this.$t('PROJECT_DESIGN_PREPARATION'),
          description: this.$t('PROJECT_DESIGN_PREPARATION_DESC'),
          img: 'oss_core/edesign/assets/image/project/step_2.png',
        },
        { name: this.$t('PROJECT_DESIGN'), description: this.$t('PROJECT_DESIGN_DESC'), img: 'oss_core/edesign/assets/image/project/step_3.png' },
        {
          name: this.$t('PROJECT_CONSTRUCTION'),
          description: this.$t('PROJECT_CONSTRUCTION_DESC'),
          img: 'oss_core/edesign/assets/image/project/step_4.png',
        },
        { name: this.$t('PROJECT_COMLETE'), description: this.$t('PROJECT_COMLETE_DESC'), img: 'oss_core/edesign/assets/image/project/step_5.png' },
      ];
      if (this.flowId === 'F0000002') {
        stepList.splice(3, 1);
      }
      this.stepList = stepList;
      const getSoltName = () => {
        let name = 'Design1';
        if (this.projectInfo.stageTaskType === 'HLD_PRE') {
          name = 'DesignPreparation';
        } else if (this.constructionFlag === 'Y') {
          name = 'Design';
        }
        return name;
      };
      // let stepIndex = ['ACCEPTANCE', 'DESIGN', 'CONSTRUCTION', 'COMPLETE'].indexOf(this.projectInfo && this.projectInfo.STAGE_CODE);
      switch (this.projectInfo.stageCode) {
        case 'ACCEPTANCE':
          this.controlData.soltName = 'ProjectEdit';
          break;
        case 'DESIGN':
          this.controlData.soltName = getSoltName();
          break;
        case 'CONSTRUCTION':
          this.controlData.soltName = this.constructionFlag === 'Y' ? 'ConstructionProgress' : 'Design2';
          break;
        case 'COMPLETE':
          this.controlData.soltName = this.constructionFlag === 'Y' ? 'ProcessComplete' : 'ProcessComplete1';
          break;
        default:
          break;
      }
      this.initTury = true;
    },
    changeProjectInfo(data) {
      this.projectInfo = {
        ...this.projectInfo,
        ...data,
      };
    },
    initOsp() {
      this.isLoadOsp = true;
      fish.require(
        [
          'oss_core/edesign/view/new-osp-design',
          'oss_core/edesign/assets/config/edesign/themeConfig.js',
          'oss_core/edesign/assets/config/edesign/menuConfig.js',
          'oss_core/edesign/assets/config/edesign/styleConfig.js',
          'oss_core/edesign/assets/config/edesign/parameterSetConfig.js',
        ],
        (OspDesign, theme, menu, style, parameterSet) => {
          console.log('加载成功..');
          const options = Object.assign(
            {},
            theme,
            menu,
            style,
            { parameterSet },
            {
              data: {
                // choose: this.stepNum === 2 ? 'DesignPreparation' : 'Design',
                projectInfo: this.projectInfo,
                controlData: this.controlData,
              },
            },
          );
          this.ospView = OspDesign.main(options);
        },
      );
    },
    soltChange(soltName) {
      switch (soltName) {
        case 'ProjectEdit':
          this.stepNum = 1;
          this.controlData.parentName = 'project';
          break;
        case 'DesignPreparation':
          this.stepNum = 2;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'Design':
          this.stepNum = 3;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'Design1':
          this.stepNum = 3;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'Design2':
          this.stepNum = 4;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'ConstructionProgress':
          this.stepNum = 4;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'ProcessComplete':
          this.stepNum = 5;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        case 'ProcessComplete1':
          this.stepNum = 5;
          this.controlData.parentName = 'osp';
          !this.isLoadOsp && this.initOsp();
          break;
        default:
          break;
      }

      if (this.maxNum < this.stepNum) {
        this.maxNum = this.stepNum;
      }
      if (this.constructionFlag === 'N' && this.stepNum > 2) {
        this.maxNum = 5;
      }
      this.soltName = this.controlData.parentName === 'project' ? soltName : '';
    },
    stepChange(index) {
      switch (index) {
        case 1:
          this.controlData.soltName = 'ProjectEdit';
          break;
        case 2:
          this.controlData.soltName = 'DesignPreparation';
          break;
        case 3:
          this.controlData.soltName = this.constructionFlag === 'N' ? 'Design1' : 'Design';
          break;
        case 4:
          this.controlData.soltName = this.constructionFlag === 'N' ? 'Design2' : 'ConstructionProgress';
          break;
        case 5:
          this.controlData.soltName = this.constructionFlag === 'N' ? 'ProcessComplete1' : 'ProcessComplete';
          break;
        default:
          break;
      }
    },
  },
  watch: {
    'controlData.soltName'(newVal) {
      this.soltChange(newVal);
    },
  },
  destroyed() {
    if (this.ospView) {
      this.ospView.$destroy();
    }
  },
};
</script>

<style lang="scss" scoped>
@import './projectWizard.scss';
</style>
