<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-08-17 18:53:56
 * @LastEditors: HongAnDing
 * @Description: 搜索组件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\searchbar\search.vue
-->
<template>
    <div class="btn-group map-query">
        <div class="map-icon-content" :class="{choosed: controlData.popupName === 'resTypePanel' || controlData.popupName === 'LocationPanel'}">
            <div class="form-group has-feedback input-wrap">
                <input type="text" id="searchs" ref="searchs" v-model="querys" :placeholder="$t('placeholder')" @keyup.enter="query">
                <span class="search-close-icon icon_osp icon_ospclose" v-if="controlData.popupName === 'resTypePanel' || controlData.popupName === 'LocationPanel'" @click="hideSelect"></span>
                <span class="icon_osp icon_ospjiejing" :class="isGeoSearch?'switch-locate-btn-active':'switch-locate-btn'" v-if="controlData.popupName === 'resTypePanel' || controlData.popupName === 'LocationPanel'" @click="isGeoSearch=!isGeoSearch"></span>
            </div>
            <div class="map-icon icon_osp icon_ospsearch" @click="query"></div>
        </div>
        <ResTypePanel @sendOutType="sendOutType" />
        <ResultPanel ref="result" v-on="$listeners"></ResultPanel>
        <LocationPanel ref="location-panel"></LocationPanel>
        <InfoPanel ref="info" v-on="$listeners"></InfoPanel>
    </div>
</template>

<script>
import ResTypePanel from './res-type-panel/ResTypePanel.vue';
import ResultPanel from './result-panel/ResultPanel.vue';
import InfoPanel from './info-panel/InfoPanel.vue';
import LocationPanel from '@/oss_core/edesign/osp/map-control/searchbar/loaction-panel/locationPanel.vue';

export default {
  name: 'Search',
  components: {
    LocationPanel,
    ResTypePanel,
    InfoPanel,
    ResultPanel,
  },
  inject: ['getControlData'],
  computed: {
    controlData() {
      return this.getControlData();
    },
  },
  watch: {
    isGeoSearch(val) {
      if (val) {
        this.controlData.popupName = 'LocationPanel';
        this.$refs['location-panel'].initLocationPanel(document.getElementById('searchs'));
      } else {
        this.controlData.popupName = 'resTypePanel';
      }
    },
  },
  data() {
    return {
      querys: '',
      hide: false,
      scheamaList: [],
      resType: '',
      item: {},
      isChoose: null,
      isGeoSearch: false,
    };
  },
  methods: {
    query() {
      if (this.controlData.popupName !== 'resTypePanel' && this.controlData.popupName !== 'LocationPanel') {
        this.controlData.popupName = 'resTypePanel';
      } else {
        if ((fish.isEmpty(this.item) || !this.querys) && !this.isGeoSearch) {
          fish.toast('warn', this.$t('SEARCH_CONDITION'));
          return;
        } else {
          if (!this.isGeoSearch) {
            this.$refs.result.querys(this.querys, this.item);
          }
        }
      }
    },
    hideSelect() {
      this.querys = '';
      this.isGeoSearch = false;
      this.$nextTick(() => {
        this.controlData.popupName = '';
      });
    },
    sendOutType(item) {
      this.item = item;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './search.scss';
</style>
