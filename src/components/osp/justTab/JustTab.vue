<template>
  <div :class="`${type === 'vertical' ? 'just-tabs-box-vertical' : 'just-tabs-box'}`">
    <div class="tabs-head-item" v-for="item in options" :key="item.code" :class="{ active: item.code === currKey }" @click="changeKey(item.code)">
      {{ item.name }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'JustTab',
  props: {
    value: {
      type: Object,
    },
    type: {
      type: String,
    },
    options: [],
  },
  model: {
    prop: 'value',
    event: 'changeValue',
  },
  components: {},

  data() {
    return {
      currKey: '',
    };
  },

  create() {},

  mounted() {
    this.initValue();
  },

  methods: {
    initValue() {
      this.currKey = this.value;
    },
    changeKey(key) {
      this.currKey = key;
      this.$emit('changeValue', key);
    },
  },
  watch: {
    value() {
      this.initValue();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './justTab.scss';
</style>
