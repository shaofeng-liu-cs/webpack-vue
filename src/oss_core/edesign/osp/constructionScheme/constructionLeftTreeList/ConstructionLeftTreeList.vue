<template>
  <span class="left-tree-box sys-card-box">
    <div class="box-head-title">
      <span class="left-title">
        {{ $t('CONSTRUCTION_SCHEME_LIST') }}
      </span>
    </div>
    <div class="tree-body">
      <Search ref="search" v-model="searchTreeVal"></Search>
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
              <span class="options">
                <i class="icon_osp icon_osptianjia options_icon" @click.stop="createScheme(item)"></i>
              </span>
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
                  <span class="options">
                    <i class="icon_osp icon_ospshanchu3 options_icon" @click.stop="deleteTree(child)"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <Popup :popupObj="editModalObj" @popupClose="popupClose" @popupOk="eidtModalOk">
      <template v-slot:popupBody>
        <BaseSetting ref="baseSetting" :data="createData"></BaseSetting>
      </template>
    </Popup>
  </span>
</template>
<script>
import { queryConstructList, queryResattrList } from '@/oss_core/edesign/api/query/schema.js';
import { deleteConstruct } from '@/oss_core/edesign/api/del/schema.js';
import BaseSetting from '../baseSetting/BaseSetting.vue';

export default {
  name: 'ConstructionLeftTreeList',
  props: {
    allAttrData: {},
  },
  components: {
    BaseSetting,
  },
  data() {
    return {
      editModalObj: {
        title: this.$t('NEW'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '80%',
        height: 'auto',
        show: false,
        drag: true,
        zIndex: 3,
      },
      allTreeList: [],
      fNodes: [],
      searchTreeVal: '',
      selectTreeNode: null,
      openList: [],
      createData: {}, // 创建方案时存的数据
    };
  },

  create() {},

  mounted() {
    this.loadTree();
  },

  methods: {
    popupClose() {},
    clickTree(val) {
      this.selectTreeNode = val;
      this.$emit('changeScheme', val && val.code, val);
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
      queryConstructList().then(res => {
        const fNodes = [];
        const dataSource = res.data || [];
        let openCode = null;
        dataSource.forEach((it, i) => {
          const children = (it.constSchemaList || []).map(item => ({
            name: item.schemeName,
            code: item.constSchemeId,
            isParent: false,
            resCategory: it.resCategory,
            resSpecId: item.resSpecId,
            resTypeName: it.resTypeName,
            constCatId: it.constCatId,
            constCatName: it.constCatName,
          }));
          if (!this.selectTreeNode) {
            if (!openCode && children.length) {
              openCode = it.resType;
              this.clickTree(children[0]);
            }
          }

          fNodes.push({
            name: it.resTypeName,
            code: it.resType,
            resCategory: it.resCategory,
            constCatId: it.constCatId,
            constCatName: it.constCatName,
            isParent: true,
            children,
            open: i === 0,
          });
        });
        if (openCode) {
          this.openList = [openCode];
        }
        this.allTreeList = fNodes;
        this.fNodes = JSON.parse(JSON.stringify(fNodes));
      });
    },
    createScheme(item) {
      const cdata = {
        resSpecId: item.code,
        resCategory: item.resCategory,
        resTypeName: item.name,
        constCatId: item.constCatId,
        constCatName: item.constCatName,
      };
      if (this.allAttrData[item.code]) {
        cdata.edncFeatureAttrList = this.allAttrData[item.code];
      } else {
        queryResattrList(item.code).then(res => {
          this.createData.edncFeatureAttrList = res.data || [];
          this.createData = JSON.parse(JSON.stringify(this.createData));
          this.$emit('loadAttrData', item.code, res.data || []);
        });
      }
      this.createData = cdata;
      this.openClose(item.code);
      this.editModalObj.show = true;
    },
    deleteTree(data) {
      this.$confirm(this.$t('DESIGN_SCHEME_DELETE_SCHEME'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        deleteConstruct(data.code).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            if (this.selectTreeNode.code === data.code) {
              this.selectTreeNode = '';
            }
            this.loadTree();
          } else {
            this.$message({
              type: 'error',
              message: res.message || this.$t('DELETE_FAIL'),
            });
          }
        });
      });
    },
    eidtModalOk() {
      this.$refs.baseSetting.onSubmit(() => {
        this.editModalObj.show = false;
        this.loadTree();
      });
    },
    changeSearch() {
      let newTreeList = this.allTreeList;
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
    searchTreeVal() {
      this.changeSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './constructionLeftTreeList.scss';
</style>
