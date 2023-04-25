<template>
  <span class="left-tree-box sys-card-box">
    <div class="box-head-title">
      <span class="left-title">{{ $t('DESIGN_SCHEME_LIST') }}</span>
      <span class="right-options">
        <i class="icon_osp icon_ospxinjianchufa options_icon" @click="createTree"></i>
      </span>
    </div>
    <div class="box-content">
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
                <i class="icon_osp icon_ospbianjibeifen options_icon" @click.stop="editTree(item, index)"></i>
                <i class="icon_osp icon_ospshanchu2 options_icon" @click.stop="deleteTree(item, index)"></i>
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
                    <i class="icon_osp icon_ospbianjibeifen options_icon" @click="editTree(child, index, i)"></i>
                    <i class="icon_osp icon_ospshanchu2 options_icon" @click.stop="deleteTree(child, index, i)"></i>
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
        <el-form :model="formValue" ref="editForm" label-width="auto">
          <input style="display:none;" />
          <el-form-item v-if="!editTreeData" prop="newType" :label="$t('TYPE')">
            <el-radio-group v-model="formValue.newType">
              <el-radio label="menu">{{ $t('DESIGN_SCHEME_NEW_MENU') }}</el-radio>
              <el-radio label="scheme">{{ $t('DESIGN_SCHEME_NEW_SCHEME') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="!editTreeData && formValue.newType === 'scheme'" prop="parentMenu" :label="$t('DESIGN_SCHEME_NEW_PARENT_MENU')">
            <el-select v-model="formValue.parentMenu" :placeholder="$t('PLEASE_SELECT')">
              <el-option v-for="item in fNodes" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="newName" :label="$t(formValue.newType === 'menu' ? 'DESIGN_SCHEME_NEW_MENU_NAME' : 'DESIGN_SCHEME_NEW_SCHEME_NAME')">
            <el-input v-model="formValue.newName" size="mini"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </Popup>
  </span>
</template>
<script>
import { querySchemeFoldList } from '@/oss_core/edesign/api/query/schema.js';
import { addFold, addDesignSchema } from '@/oss_core/edesign/api/add/schema.js';
import { updateFold, updateDesignSchema } from '@/oss_core/edesign/api/edit/schema.js';
import { deleteFold, deleteDesignScheme } from '@/oss_core/edesign/api/del/schema.js';

export default {
  name: 'LeftTreeList',
  props: {},
  components: {},
  data() {
    return {
      editModalObj: {
        title: this.$t('NEW'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '520px',
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
      formValue: {},
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
      querySchemeFoldList().then(res => {
        let fNodes = [];
        let openCode = null;
        (res || []).map((it, i) => {
          let children = (it.ednDesignSchemaDtoList || []).map(item => {
            return {
              name: item.projectSchemaName,
              code: item.projectSchemaId,
              isParent: false,
              folderId: item.folderId,
            };
          });
          if (!this.selectTreeNode) {
            if (!openCode && children.length) {
              openCode = it.folderId;
              this.clickTree(children[0]);
            }
          }
          // dataSource.push({ name: it.folderName, code: it.folderId});
          fNodes.push({ name: it.folderName, code: it.folderId, isParent: true, children: children, open: i === 0 });
        });
        if (openCode) {
          this.openClose(openCode, 'N');
        }
        this.allTreeList = fNodes;
        this.fNodes = JSON.parse(JSON.stringify(fNodes));
      });
    },
    editTree(data) {
      this.editTreeData = data;
      this.editModalObj.show = true;
      this.editModalObj.title = this.$t('EDIT');
      this.formValue = {
        newType: this.editTreeData.isParent ? 'menu' : 'scheme',
        newName: this.editTreeData.name,
        parentMenu: this.editTreeData.folderId,
      };
    },
    createTree() {
      this.editTreeData = null;
      this.editModalObj.title = this.$t('NEW');
      this.editModalObj.show = true;
      this.formValue = {
        newType: 'menu',
        newName: '',
        parentMenu: this.selectTreeNode.folderId,
      };
    },
    deleteTree(data) {
      this.$confirm(this.$t(data.isParent ? 'DESIGN_SCHEME_DELETE_MENU' : 'DESIGN_SCHEME_DELETE_SCHEME'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        const deleteFunc = data.isParent ? deleteFold : deleteDesignScheme;
        deleteFunc(data.code).then(res => {
          if (res.resultDesc === 'SUCCESS') {
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
              message: res.resultDesc || this.$t('AJAX_ERROR'),
            });
          }
        });
      });
    },

    eidtModalOk() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          let value = this.formValue;
          const succFunc = res => {
            if (res.success !== false) {
              this.$message({
                type: 'success',
                message: this.$t('SAVE_SUCCESS'),
              });
              this.editTreeData = null;
              this.editModalObj.show = false;
              this.loadTree();
            } else {
              this.$message({
                type: 'error',
                message: res.message || this.$t('AJAX_ERROR'),
              });
            }
          };
          if (this.editTreeData) {
            //编辑
            if (value.newType === 'scheme') {
              //方案
              let params = {
                projectSchemaName: value.newName,
                // folderId:value.parentMenu
              };
              updateDesignSchema(this.editTreeData.code, params).then(succFunc);
            } else {
              let params = {
                folderName: value.newName,
                folderId: this.editTreeData.code,
              };
              updateFold(params).then(succFunc);
            }
          } else {
            if (value.newType === 'scheme') {
              //方案
              let params = {
                projectSchemaName: value.newName,
                folderId: value.parentMenu,
              };
              addDesignSchema(params).then(succFunc);
            } else {
              let params = {
                folderName: value.newName,
                parentFolderId: null,
              };
              addFold(params).then(succFunc);
            }
          }
        }
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
    searchTreeVal() {
      this.changeSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './leftTreeList.scss';
</style>
