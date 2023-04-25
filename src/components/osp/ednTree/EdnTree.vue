<template>
  <div class="edn-tree-box">
    <Search v-if="!hideSearch" ref="search" v-model="searchTreeVal"></Search>
    <div class="tree-content">
      <el-scrollbar>
        <div class="treeParent" v-for="(item, index) in fNodes" :key="index">
          <div
            class="tree_title"
            @click="openClose(item.code, 'Y')"
            v-if="!item.hidden"
            :class="{ active: selectTreeNode && selectTreeNode.code === item.code }"
          >
            <i :class="`icon_osp ${openList.includes(item.code) ? 'icon_ospdown' : 'icon_ospright'} titleIcon`"></i>
            <span class="title_text">
              <i class="icon_osp icon_ospwenjianjia"></i>
              {{ item.name }}
            </span>
            <slot name="parentBtn"></slot>
          </div>
          <div v-if="item.children && item.children.length && openList.includes(item.code) && !item.hidden" class="child_list_box">
            <div v-for="(child, i) in item.children" :key="i">
              <div
                v-if="!child.hidden"
                class="tree_child_item"
                @click="clickTree(child)"
                :class="{ active: selectTreeNode && selectTreeNode.code === child.code }"
              >
                <i class="icon_osp icon_ospfangan" style="margin-right:5px;"></i>
                <span class="item_tit">{{ child.name }}</span>
                <slot name="leafBtn"></slot>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EdnTree',
  props: {
    value: {
      type: Object,
    },
    data: [],
    hideSearch: false,
  },
  model: {
    prop: 'value',
    event: 'changeSelect',
  },
  components: {},

  data() {
    return {
      selectTreeNode: null,
      openList: [],
      allTreeList: [],
      fNodes: [],
      searchTreeVal: '',
      currKey: '',
    };
  },

  create() {},

  mounted() {
    this.initOpenList();
  },

  methods: {
    initValue() {
      if (this.value) {
        const selected = this.fNodes.find(it => it.code === this.value);
        if (selected) {
          this.selectTreeNode = selected;
          this.$emit('changeSelect', this.selectTreeNode && this.selectTreeNode.code, this.selectTreeNode);
        }
      } else {
        const selected = this.fNodes.find(it => it.children && it.children.length);
        if (selected) {
          this.selectTreeNode = selected.children[0];
          this.$emit('changeSelect', this.selectTreeNode && this.selectTreeNode.code, this.selectTreeNode);
          this.openClose(selected.code);
        }
      }
    },
    initOpenList() {
      this.openList = [];
      this.allTreeList = [...this.data];
      this.fNodes = [...this.data];
      this.data.forEach(it => {
        if (it.open) {
          this.openList.push(it.code);
        }
      });
      this.initValue();
    },
    clickTree(val) {
      this.selectTreeNode = val;
      this.$emit('changeSelect', val && val.code, val);
    },
    openClose(code, isClick) {
      const index = this.openList.indexOf(code);
      if (index === -1) {
        this.openList.push(code);
      } else if (isClick === 'Y') {
        this.openList.splice(index, 1);
      }
    },
    changeSearch() {
      let newTreeList = [...this.allTreeList];
      const val = this.searchTreeVal;
      if (val && val.trim().length > 0) {
        newTreeList = [];
        this.allTreeList.forEach(it => {
          const searchs = it.children.filter(chid => chid.name.indexOf(val) > -1);
          if (searchs.length) {
            newTreeList.push({
              ...it,
              open: true,
              children: searchs,
            });
          }
        });
      }
      this.fNodes = JSON.parse(JSON.stringify(newTreeList));
    },
  },
  watch: {
    value() {
      this.initValue();
    },
    searchTreeVal() {
      this.changeSearch();
    },
    data() {
      console.log('data更改了');
      this.initOpenList();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './ednTree.scss';
</style>
