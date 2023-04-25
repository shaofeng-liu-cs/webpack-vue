<template>
  <div class="export-kml-parent-box">
    <JustTab :options="options" v-model="selectKey"></JustTab>
    <ExportSettingsConfig
      v-if="selectKey === 'exportImport'"
      :projectInfo="projectInfo"
      :disabled="disabled"
      :key="projectInfo.projectSchemaId"
    ></ExportSettingsConfig>
    <KMLStructureConfig v-else :projectInfo="projectInfo" :disabled="disabled" :key="projectInfo.projectSchemaId"></KMLStructureConfig>
  </div>
</template>
<script>
import KMLStructureConfig from '../kmlStructureConfig/KMLStructureConfig.vue'; // 组件
import ExportSettingsConfig from '../exportSettingsConfig/ExportSettingsConfig.vue'; // 组件
export default {
  name: 'ExportAndKml',
  props: {
    projectInfo: {},
    disabled: false,
  },
  components: {
    KMLStructureConfig,
    ExportSettingsConfig,
  },

  data() {
    return {
      selectKey: 'exportImport',
      options: [
        { name: this.$t('PARAMETER_SETTING_MAPPING'), code: 'exportImport' },
        { name: this.$t('PARAMETER_SETTING_KML'), code: 'kml' },
      ],
    };
  },

  create() {},

  mounted() {},

  methods: {
    refresh() {},
  },
};
</script>
<style lang="scss" scoped>
@import './exportAndKml.scss';
</style>
