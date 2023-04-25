<template>
  <div class="as-built-documentation-box">
    <JustTab :options="docTabList" v-model="activeName" type="vertical"></JustTab>
    <span class="tab-pane-content-box">
      <keep-alive>
        <component :is="activeName" :ref="activeName" :projectInfo="projectInfo" :hideTab="hideTab"></component>
      </keep-alive>
    </span>
  </div>
</template>
<script>
import BuiltDrawings from './builtDrawings/BuiltDrawings.vue';
import ProDescription from './proDescription/ProDescription.vue';
import SummQuantities from './summQuantities/SummQuantities.vue';
import MaterialList from './materialList/MaterialList.vue';
import BomComparison from './bomComparison/BomComparison.vue';
import AcceptanceReport from './acceptanceReport/AcceptanceReport.vue';

export default {
  name: 'AsBuiltDocumentation',
  props: {
    projectInfo: {},
    hideTab: false,
  },
  components: {
    BuiltDrawings,
    ProDescription,
    SummQuantities,
    MaterialList,
    BomComparison,
    AcceptanceReport,
  },

  data() {
    return {
      docTabList: [
        { name: this.$t('COMPLETE_DOC_PROJECT_DESCRIPTION'), code: 'ProDescription' },
        { name: this.$t('COMPLETE_DOC_SUMMARY_QUANTITIES'), code: 'SummQuantities' },
        { name: this.$t('COMPLETE_DOC_MATERIAL_LIST'), code: 'MaterialList' },
        { name: this.$t('COMPLETE_DOC_BOM_DIFF_COMPARISON'), code: 'BomComparison' },
        { name: this.$t('COMPLETE_DOC_PROJECT_ACCEPTANCE_REPORT'), code: 'AcceptanceReport' },
        { name: this.$t('COMPLETE_DOC_AS_BUILT_DRAWINGS'), code: 'BuiltDrawings' },
      ],
      activeName: 'ProDescription',
    };
  },

  create() {},

  mounted() {},

  methods: {},
  watch: {},
};
</script>
<style lang="scss" scoped>
@import './asBuiltDocumentation.scss';
</style>
