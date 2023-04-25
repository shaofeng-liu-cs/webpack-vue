<!--
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2022-10-18 20:32:40
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-02-16 17:49:05
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\sidebar\InitialSurvey\InitialSurvey.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="initiate-survey-container sidebar-body">
    <div class="initiate-survey-type">
      <div ref="RemoteSurvey" :class="[activeTap === 'RemoteSurvey' ? 'activeTap' : 'deactiveTap']" @click="surveyChange('RemoteSurvey')"> {{ $t('INITIATE_SURVEY_SURVEY_REMOTE_SURVEY') }}</div>
      <div ref="OnSiteSurvey" :class="[activeTap === 'OnSiteSurvey' ? 'activeTap' : 'deactiveTap']" @click="surveyChange('OnSiteSurvey')">{{ $t('INITIATE_SURVEY_SURVEY_ON_SITE_SURVEY') }}</div>
    </div>
    <keep-alive class="componets-div">
      <component :is="soltName" :ref="soltName"></component>
    </keep-alive>
  </div>
</template>

<script>
import OnSiteSurvey from '@/oss_core/edesign/osp/sidebar/InitialSurvey/onSiteSurvey/OnSiteSurvey.vue';
import RemoteSurvey from '@/oss_core/edesign/osp/sidebar/InitialSurvey/remoteSurvey/RemoteSurvey.vue';

export default {
  name: 'InitialSurvey',
  inject: ['getProjectInfo', 'getMapBox', 'getHldEl', 'getSurfaceLayerList'],
  components: {
    OnSiteSurvey,
    RemoteSurvey,
  },
  data() {
    return {
      activeTap: 'RemoteSurvey',
      soltName: 'RemoteSurvey',
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
  },
  created() {},
  mounted() {},
  deactivated() {},
  methods: {
    surveyChange(tap) {
      this.activeTap = tap;
      this.soltName = tap;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './InitialSurvey';
</style>
