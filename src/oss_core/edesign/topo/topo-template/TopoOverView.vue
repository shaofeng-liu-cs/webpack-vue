<template>
  <div class="topoOverViewShow" ref="topoOverViewShow" v-show="topoOverViewShow">
    <div class="topo-overview topo-overview-animation" ref="overViewPanel"></div>
    <div class="topo-overview-buttom-expand" ref="overViewButtom" @click.prevent="expandClick()"></div>
  </div>
</template>
<script>
/// <reference path="../../../../index.d.ts"/>
//import { merge } from '@/utils/util';
import { merge } from '../../../base/utils/util';
export default {
  name: 'TopoOverView',
  components: {},
  props: {
    graphView: Object,
    topoOverViewShow: {
      type: Boolean,
      default: false,
    },
  },
  computed: {},
  data() {
    return {
      expand: false,
    };
  },
  // created() {},
  // watch() {},
  mounted() {
    if (this.topoOverViewShow) {
      if (this.expand) {
        let overview = new ht.graph.Overview(this.graphView);
        this.topoOverView = overview;
        this.topoOverView.setContentBackground('white');
        this.topoOverView._view.style.setProperty('width', '200px', null);
        this.topoOverView._view.style.setProperty('height', '150px', null);
        // overview._canvas.style.setProperty("opacity", "0", null);
        // overview._mask.style.setProperty("opacity", "0", null);
        this.$refs.overViewPanel.append(this.topoOverView.getView());
        this.$refs.overViewButtom.style.setProperty('background', ' url(oss_core/edesign/assets/image/topo-overview/shrink.png) no-repeat', null);
      } else {
        this.$refs.overViewButtom.style.setProperty('background', ' url(oss_core/edesign/assets/image/topo-overview/expand.png) no-repeat', null);
        this.$refs.overViewPanel.innerHTML = '';
        this.$refs.overViewPanel.style.setProperty('width', '24px', null);
        this.$refs.overViewPanel.style.setProperty('height', '24px', null);
        this.$refs.topoOverViewShow.style.setProperty('width', '24px', null);
        this.$refs.topoOverViewShow.style.setProperty('height', '24px', null);
      }
    }
  },
  methods: {
    expandClick: function () {
      //console.info("toolbar: " + eventName);
      if (this.expand) {
        this.expand = false;
        this.$refs.overViewButtom.style.setProperty('background', ' url(oss_core/edesign/assets/image/topo-overview/expand.png) no-repeat', null);
        this.$refs.overViewPanel.innerHTML = '';
        this.$refs.overViewPanel.style.setProperty('width', '24px', null);
        this.$refs.overViewPanel.style.setProperty('height', '24px', null);
        this.$refs.topoOverViewShow.style.setProperty('width', '24px', null);
        this.$refs.topoOverViewShow.style.setProperty('height', '24px', null);
      } else {
        this.expand = true;
        this.$refs.overViewButtom.style.setProperty('background', ' url(oss_core/edesign/assets/image/topo-overview/shrink.png) no-repeat', null);
        this.$refs.topoOverViewShow.style.setProperty('width', '200px', null);
        this.$refs.topoOverViewShow.style.setProperty('height', '150px', null);
        this.$refs.overViewPanel.style.setProperty('width', '200px', null);
        this.$refs.overViewPanel.style.setProperty('height', '150px', null);
        let overview = new ht.graph.Overview(this.graphView);
        this.topoOverView = overview;
        this.topoOverView.setContentBackground('white');
        this.topoOverView._view.style.setProperty('width', '200px', null);
        this.topoOverView._view.style.setProperty('height', '150px', null);
        this.topoOverView._canvas.style.setProperty('opacity', '1', null);
        this.topoOverView._mask.style.setProperty('opacity', '1', null);
        this.$refs.overViewPanel.append(this.topoOverView.getView());
      }
    },
  },
};
</script>
<i18n src="../i18n.json"></i18n>
<style lang="scss" scoped>
@import './scss/toolBar.scss';
</style>
