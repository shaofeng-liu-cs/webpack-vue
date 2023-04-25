<template>
  <div class="process-complete-box">
    <JustTab :options="tabsList" v-model="selectTab" v-if="!hideTab"></JustTab>

    <div class="tab-content-box">
      <keep-alive>
        <component :is="selectTab" v-on="$listeners" :projectInfo="projectInfo" :hideTab="hideTab"></component>
      </keep-alive>
    </div>
  </div>
</template>
<script>
import AsBuiltDocumentation from './asBuiltDocumentation/AsBuiltDocumentation.vue';
import AcceptanceProject from './acceptanceProject/AcceptanceProject.vue';
import CapabilityView from './capabilityView/CapabilityView.vue';

export default {
  name: 'ProcessComplete',
  props: {
    hideTab: false,
  },
  inject: ['getInitData'],
  components: {
    AsBuiltDocumentation,
    AcceptanceProject,
    CapabilityView,
  },

  data() {
    return {
      selectTab: this.hideTab ? 'AsBuiltDocumentation' : 'AcceptanceProject',
      projectInfo: this.getInitData().projectInfo || {
        projectId: '230325142114138862',
        projectName: 'accep-test-0033',
        projectCode: '29291255307915854000',
        projectType: 'OPT',
        projectTypeName: 'Optical Cable',
        gisKey: null,
        coverageRatio: null,
        totalUsers: null,
        regionId: 549,
        regionName: 'London',
        projManagerId: 1,
        projManagerName: 'admin',
        dsManagerId: 1,
        designManagerName: 'admin',
        projectState: 'O',
        projectStateName: 'Open',
        createDate: '2023-03-25 14:21:43',
        prjCreateDate: null,
        notes: null,
        flowId: 'F0000003',
        operationType: 'GreenField',
        stageCode: 'COMPLETE',
        stageTaskType: null,
        imgPath: 'temp/im/2023-03-25/untitled1_9.png',
        thumbnailPath: 'temp/im/2023-03-25/untitled2_9.jpeg',
        interOrderId: 'accep-test-0033',
        projectDocList: [],
        projectExtInfoList: [
          {
            id: null,
            projectId: 230325142114138850,
            seq: 1,
            attrCode: 'extHpType',
            attrValue: 'P2P',
            createUser: 1,
            createDate: 1679725303000,
            modifyUser: 1,
            modifyDate: 1679725303000,
          },
          {
            id: null,
            projectId: 230325142114138850,
            seq: 2,
            attrCode: 'extHpRedundancyRatio',
            attrValue: '100',
            createUser: 1,
            createDate: 1679725303000,
            modifyUser: 1,
            modifyDate: 1679725303000,
          },
          {
            id: null,
            projectId: 230325142114138850,
            seq: 3,
            attrCode: 'extCoverHps',
            attrValue: '80000',
            createUser: 1,
            createDate: 1679725303000,
            modifyUser: 1,
            modifyDate: 1679725303000,
          },
          {
            id: null,
            projectId: 230325142114138850,
            seq: 4,
            attrCode: 'extUserDensity',
            attrValue: '12195.122',
            createUser: 1,
            createDate: 1679725303000,
            modifyUser: 1,
            modifyDate: 1679725303000,
          },
          {
            id: null,
            projectId: 230325142114138850,
            seq: 5,
            attrCode: 'extCoverageArea',
            attrValue: '6.560',
            createUser: 1,
            createDate: 1679725303000,
            modifyUser: 1,
            modifyDate: 1679725303000,
          },
        ],
        sprintId: '230325142114138862',
      }, // 工程详情
      tabsList: [
        { name: this.$t('COMPLETE_ACCEPTANCE_OF_WORK'), code: 'AcceptanceProject' },
        { name: this.$t('COMPLETE_AS_BUILT_DOC'), code: 'AsBuiltDocumentation' },
        // { name: this.$t('COMPLETE_AS_CAPABILITY'), code: 'CapabilityView' },
      ],
    };
  },

  create() {},

  mounted() {
    console.log('projectInfo:', this.projectInfo);
  },

  methods: {},
  watch: {},
};
</script>
<style lang="scss" scoped>
@import './processComplete.scss';
</style>
