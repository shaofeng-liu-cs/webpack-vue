<template>
  <component :is="componentType" :ref="componentType" :projectInfo="paramsData"></component>
</template>
<script>
import SurveyReport from './SurveyReport/index.vue';
import ConstructionProgress from './ConstructionProgress/index.vue';
import CompletionReport from './CompletionReport/index.vue';
import ProjectTopology from './ProjectTopology/index.vue';
import BOMView from './BOMView/BOMView.vue';
export default {
  name: 'projectReport',
  props: {
    params: Object,
  },
  components: {
    SurveyReport,
    ConstructionProgress,
    CompletionReport,
    ProjectTopology,
    BOMView,
  },
  data() {
    const sprintId = (this.params && this.params.sprintId) || '221130103202146550';
    const schemaId = this.params && this.params.schemaId;
    return {
      paramsData: {
        ...this.params,
        sprintId: sprintId,
        schemaId: schemaId || sprintId,
      },
      componentType: (this.params && this.params.compoentType) || 'BOMView',
    };
  },

  create() {},

  mounted() {},

  methods: {
    init() {},
  },
  watch: {
    params(val) {
      if (val) {
        this.paramsData = val;
        this.componentType = val.componentType;
      }
    },
  },
};
</script>
