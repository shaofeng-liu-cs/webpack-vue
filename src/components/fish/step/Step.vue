<template>
  <div class="v9-step" ref="step"></div>
</template>

<script>
export default {
  name: 'Step',
  componentName: 'Step',
  props: {
    allFinished: {
      type: Boolean,
      default: false, // 如果设置为true，则表示流程已走完，再切换节点时候只改变step节点选中状态
    },
    dataTextField: {
      type: String,
      default: 'name', // 数据源展示字段，默认是name ...
      //default:true
    },
    finishedIcon: {
      type: String,
      default: '', // 自定义步骤节点完成后显示图标，默认是‘‘，v3.12.0 版本后支持完成图标为空
    },
    interactive: {
      type: Boolean,
      default: false, // 是否使用交互模式（步骤节点可以点击），默认是false ...
    },
    status: {
      type: String,
      default: '', // 当前步骤的状态，默认process(进行中)
    },
    step: {
      type: Number,
      default: 1, // 默认步骤，从1开始
    },
    steps: {
      type: Array,
      default: () => [], // 数据源，设置步骤数据，内部支持String类型，V3.11.0后支持Object类型 节点数据保存在对应节点的data-step-node中
    },
    textPlacement: {
      type: String,
      default: '', // 文字展示，默认垂直展示 top|right|bottom
    },
    type: {
      type: String,
      default: '', // 步骤条类型，支持导航样式的步骤条 default|navigation
    },
    maxStep: {
      type: Number,
      default: 1, // 默认进行到的步数，从1开始
    },
  },
  data() {
    return {
      stepDom: null, //实列对象
    };
  },
  mounted() {
    let option = {
      allFinished: this.allFinished,
      dataTextField: this.dataTextField,
      finishedIcon: this.finishedIcon,
      interactive: this.interactive,
      status: this.status,
      step: this.step,
      steps: this.steps,
      textPlacement: this.textPlacement,
      type: this.type,
      click: (e, data) => {
        this.$emit('click', e, data); // 点击步骤节点事件 参数是：event以及当前点击的步骤数据
      },
      change: (e, index) => {
        if (index > this.maxStep && !this.allFinished) {
          this.stepDom.step('setStep', this.step);
        } else {
          this.$emit('update:step', index);
          this.$emit('change', e, index); // 改变步骤 参数是：event以及当前点击的步骤index值
        }
      },
      finish: e => {
        this.$emit('finish', e); // 点击到最后一个步骤节点事件 参数是：event
      },
    };
    console.log(option);
    this.stepDom = $(this.$refs.step);
    this.stepDom.step(option);
  },
  watch: {
    step(newVal, oldVal) {
      console.log(newVal);
      let step = this.stepDom.step('getStep');
      if (step !== newVal) {
        this.stepDom.step('setStep', newVal);
        if (newVal > this.maxStep) {
          this.maxStep = newVal;
        }
      }
    },
  },
};
</script>

<style>
</style>