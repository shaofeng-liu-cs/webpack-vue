<template>
  <div class="task-work-item-box">
    <span class="left-tree-box sys-card-box">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('E_OSP_DESIGN_TASK_TYPE') }}
        </span>
      </div>
      <div class="tree-content-box">
        <EdnTree :data="fNodes" v-model="selectTaskType" @changeSelect="changeSelect"></EdnTree>
      </div>
    </span>
    <span class="right-content-box">
      <div class="sys-card-box hasOptions">
        <div class="bottom-options" v-if="selectTaskType">
          <span class="left-box">
            <el-button size="small" type="primary" @click="addWork">{{ $t('NEW') }}</el-button>
          </span>
          <span class="right-box">
            <el-button @click="saveFunc" size="small" type="primary" style="margin-left:15px;">{{ $t('SAVE') }}</el-button>
          </span>
        </div>
        <div class="box-head-title">
          <span class="left-title">
            {{ $t('CONSTRUCTION_SCHEME_WORK_ITEM_LIST') }}
          </span>
        </div>
        <div class="content-body box-content">
          <div class="items-cotntent-box">
            <el-table :data="workItemList" height="100%" width="100%" ref="workTable" border>
              <el-table-column type="index" width="50"> </el-table-column>
              <el-table-column :label="$t('CONSTRUCTION_SCHEME_RESOURCE_SPE')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.resSpecId" @change="val => changeResType(val, scope.row)" :placeholder="$t('PLEASE_SELECT')">
                    <el-option v-for="it in resTypeList" :key="it.resType" :label="it.resTypeName" :value="it.resType"> </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('CONSTRUCTION_SCHEME')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.constSchemeId" @change="val => changeScheme(val, scope.row)" :placeholder="$t('PLEASE_SELECT')">
                    <el-option
                      v-for="item in allMap[scope.row.resSpecId]"
                      :key="item.constSchemeId"
                      :label="item.schemeName"
                      :value="item.constSchemeId"
                    >
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('CONSTRUCTION_SCHEME_WORK_ITEM')">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.itemSpecId" :placeholder="$t('PLEASE_SELECT')">
                    <el-option v-for="item in allMap[scope.row.constSchemeId]" :key="item.itemSpecId" :label="item.itemName" :value="item.itemSpecId">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('OPERATIONS')" width="110">
                <template slot-scope="scope">
                  <el-button @click="removeWork(scope.$index)" size="mini2" type="danger" icon="el-icon-delete">{{ $t('DELETE') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </span>
  </div>
</template>
<script>
import LeftTree from './taskWorkTree/TaskWorkTree.vue';
import { queryTasktypeDatasource, queryTasktypeSetting, queryTasktypelefttree } from '@/oss_core/edesign/api/query/schema.js';
import { editTasktypeWork } from '@/oss_core/edesign/api/edit/schema.js';

export default {
  name: 'TaskWorkItem',
  props: {},
  components: {
    LeftTree,
  },

  data() {
    return {
      fNodes: [],
      selectTaskType: '',
      searchVal: '',
      workItemList: [],
      allMap: {},
      resTypeList: [],
    };
  },

  create() {},

  mounted() {
    queryTasktypeDatasource().then(res => {
      const allMap = {};
      (res.data || []).forEach(it => {
        allMap[it.resType] = it.schemeList || [];
        (it.schemeList || []).forEach(scheme => {
          allMap[scheme.constSchemeId] = scheme.itemList || [];
        });
      });
      this.allMap = allMap;
      this.resTypeList = res.data || [];
    });
    this.loadTree();
  },

  methods: {
    loadTree() {
      queryTasktypelefttree().then(res => {
        let fNodes = [];
        let dataSource = res.data || [];
        dataSource.map((it, i) => {
          let children = (it.taskTypeList || []).map(item => {
            return {
              name: item.taskTypeName,
              code: item.taskType,
              isParent: false,
            };
          });
          fNodes.push({ name: it.categoryName, code: it.category, isParent: true, children: children, open: i === 0 });
        });
        this.fNodes = JSON.parse(JSON.stringify(fNodes));
      });
    },
    loadData() {
      if (this.selectTaskType) {
        queryTasktypeSetting(this.selectTaskType).then(res => {
          this.workItemList = (res.data || []).map(it => ({
            taskType: it.taskType,
            resSpecId: it.resSpecId,
            constSchemeId: it.constSchemeId,
            itemSpecId: it.itemSpecId,
          }));
        });
      }
    },

    changeResType(val, row) {
      row.constSchemeId = '';
      row.itemSpecId = '';
    },
    changeScheme(val, row) {
      row.itemSpecId = '';
    },
    removeWork(i) {
      console.log('删除：', i);
      this.workItemList.splice(i, 1);
    },
    addWork() {
      this.workItemList.push({
        taskType: this.selectTaskType,
        resSpecId: '',
        constSchemeId: '',
        itemSpecId: '',
      });
      this.$nextTick(this.scrollToBottom);
    },

    scrollToBottom() {
      const dom = $(this.$refs.workTable)[0].$el.querySelector('.el-table__body-wrapper'); // .querySelector('.el-table__body-wrapper')
      if (dom) {
        dom.scrollTop = dom.scrollHeight;
      }
    },
    saveFunc() {
      console.log('数据：', this.workItemList);
      let isTrue = this.workItemList.length > 0;
      this.workItemList.forEach(it => {
        if (!it.resSpecId || !it.constSchemeId || !it.itemSpecId) {
          isTrue = false;
        }
      });
      if (!isTrue) {
        this.$message({
          message: this.$t('CONSTRUCTION_SCHEME_ADD_WORK_ITEM_MSG'),
          type: 'error',
        });
      } else {
        editTasktypeWork(this.selectTaskType, this.workItemList).then(res => {
          if (res.success) {
            this.$message({
              message: this.$t('SAVE_SUCCESS'),
              type: 'success',
            });
            this.loadData();
          } else {
            this.$message({
              message: res.message || this.$t('AJAX_ERROR'),
              type: 'error',
            });
          }
        });
      }
    },
  },
  watch: {
    selectTaskType() {
      this.loadData();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './taskWorkItem.scss';
</style>
