<template>
  <div class="edn-tabs-box">
    <div
      class="tabs-head-item"
      v-for="item in options"
      :key="item.code"
      :class="{ activeClass: item.code === currKey }"
      @click="changeKey(item.code)"
    >
      <span class="tabs-img">
        <img src="oss_core/edesign/assets/image/tabs_item_icon.png" />
      </span>
      <span class="tabs-name">{{ item.name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EdnTabs',
  props: {
    value: {
      type: Object,
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
@import './ednTabs.scss';
</style>
