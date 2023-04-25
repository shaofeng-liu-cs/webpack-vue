<!--
 * @Author: your name
 * @Date: 2020-05-09 14:33:54
 * @LastEditTime: 2020-07-27 11:14:55
 * @LastEditors: Please set LastEditors
 * @Description: 统一搜索组件, 可以通过绑定props参数或者通过派发事件获取搜索框内的值
 * @FilePath: \online-design-v9\code\design-web\src\components\search\search.vue
-->
<template>
  <!-- 搜索 -->
  <el-input type="text" class="search" :placeholder="$t('PLEASE_ENTER')" v-model="value" clearable @clear="search">
    <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
  </el-input>
  <!-- <div class="search" :class="{ auto }">
    <el-input type="text" :placeholder="$t('PLEASE_ENTER')" v-model="value" clearable></el-input>
    <span class="search-close-icon icon_osp icon_ospsearch" v-show="auto && !value"></span>
    <span class="search-close-icon icon_osp icon_ospclose" v-show="value" @click="hideInput"></span>
    <div class="icon_osp icon_ospsearch icon_ospsearch_noauto" v-if="!auto" @click="search"></div>
  </div> -->
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      value: this.searchValue,
    };
  },
  props: {
    searchValue: {
      // 父组件传过来的搜索框的值
      type: String,
    },
    auto: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {},
  methods: {
    hideInput() {
      // 清空搜索框
      this.value = '';
    },
    search() {
      // 点击搜索按钮派发事件并传搜索框的值
      this.$emit('search', this.value);
    },
  },
  watch: {
    value(newVal, oldVal) {
      // 父子组件数据双向绑定
      this.$emit('input', newVal);
    },
  },
};
</script>

<style scoped lang="scss">
.search {
  width: 100%;
  height: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0;
  position: relative;
  .el-icon-search {
    cursor: pointer;
  }
  /deep/ input {
    background-color: var(--theme-input-back-color);
    color: var(--theme-input-prl-color);
    border: 1px solid var(--theme-input-border-color);
    border-radius: 2px;
    height: 100%;
    font-size: 12px;
    padding-right: 60px;
  }
}
</style>
