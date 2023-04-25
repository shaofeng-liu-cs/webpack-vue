<template>
  <div class="work-tree-box">
    <div class="search-box">
      <Search ref="search" v-model="searchTreeVal"></Search>
    </div>
    <div class="tree-content">
      <el-scrollbar>

        <div class="treeParent" v-for="(item,index) in fNodes" :key="index">
          <div class="tree_title" @click="openClose(item.code,'Y')" v-if="!item.hidden" :class="{active:selectTreeNode&&selectTreeNode.code===item.code}">
            <i :class="`icon_osp ${openList.includes(item.code)?'icon_ospdown':'icon_ospright'} titleIcon`"></i>
            <span class="title_text">
              <i class="icon_osp icon_ospwenjianjia"></i>
              {{item.name}}
            </span>
          </div>
          <div v-if="item.children&&item.children.length&&openList.includes(item.code)&&!item.hidden" class="child_list_box">
            <div v-for="(child,i) in item.children" :key="i">
              <div v-if="!child.hidden" class="tree_child_item" @click="clickTree(child)" :class="{active:selectTreeNode&&selectTreeNode.code===child.code}">
                <i class="icon_osp icon_ospfangan" style="margin-right:3px;"></i>
                <span class="item_tit">{{child.name}}</span>
              </div>
            </div>

          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import { queryTasktypelefttree } from '@/oss_core/edesign/api/query/schema.js';
export default {
  name: 'TaskWorkTree',
  props: {},
  components: {},
  data() {
    return {
      allTreeList: [],
      fNodes: [],
      searchTreeVal: '',
      selectTreeNode: null,
      openList: [],
    };
  },

  create() {},

  mounted() {
    this.loadTree();
  },

  methods: {
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
    loadTree() {
      queryTasktypelefttree().then(res => {
        let fNodes = [];
        let dataSource = res.data || [];
        let openCode = null;
        dataSource.map((it, i) => {
          let children = (it.taskTypeList || []).map(item => {
            return {
              name: item.taskTypeName,
              code: item.taskType,
              isParent: false,
            };
          });
          if (!this.selectTreeNode) {
            if (!openCode && children.length) {
              openCode = it.category;
              this.clickTree(children[0]);
            }
          }

          fNodes.push({ name: it.categoryName, code: it.category, isParent: true, children: children, open: i === 0 });
        });
        if (openCode) {
          this.openList = [openCode];
        }
        this.allTreeList = fNodes;
        this.fNodes = JSON.parse(JSON.stringify(fNodes));
      });
    },
    changeSearch() {
      let newTreeList = this.allTreeList;
      const val = this.searchTreeVal;
      if (val && val.trim().length > 0) {
        newTreeList = [];
        this.allTreeList.map(it => {
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
    searchTreeVal(val) {
      this.changeSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './taskWorkTree.scss';
</style>
