<template>
  <div class="edn-step-box">
    <el-tooltip effect="light" :content="item.description" placement="bottom-start" v-for="(item, index) in steps" :key="index">
      <div class="step-head-item" :class="{ activeClass: index + 1 === currIndex, disabled: index + 1 > maxStep }" @click="changeIndex(index + 1)">
        <span class="step-img">
          <img :src="item.img || 'oss_core/edesign/assets/image/tabs_item_icon.png'" />
        </span>
        <span class="step-name">{{ item.name }}</span>
      </div>
    </el-tooltip>
  </div>
</template>
<script>
export default {
  name: 'EdnStep',
  props: {
    step: {
      type: Number,
      default: 1, // 默认步骤，从1开始
    },
    steps: {
      type: Array,
      default: () => [], // 数据源
    },
    maxStep: {
      type: Number,
      default: 1, // 默认进行到的步数，从1开始
    },
    interactive: {
      type: Boolean,
      default: true, // 是否使用交互模式（步骤节点可以点击），默认是true ...
    },
  },
  model: {
    prop: 'step',
    event: 'change',
  },
  components: {},

  data() {
    return {
      currIndex: 1,
    };
  },

  create() {},

  mounted() {
    this.initValue();
  },

  methods: {
    initValue() {
      this.currIndex = this.step;
      this.maxStep = this.maxStep < this.currIndex ? this.currIndex : this.maxStep;
    },
    changeIndex(currIndex) {
      if (currIndex > this.maxStep || !this.interactive) {
        console.log('不能跳转..');
      } else {
        this.currIndex = currIndex;
        this.$emit('change', currIndex);
      }
    },
  },
  watch: {
    step() {
      this.initValue();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './ednStep.scss';
</style>
