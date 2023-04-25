<template>
  <!-- new-theme-box  添加这个样式名变为黑色主题 -->
  <div class="construction-list-body">
    <el-empty
      v-if="!selectedConstructList.length || isNoContent"
      class="con-nodata-box"
      image="oss_core/edesign/assets/image/no_data.png"
      :image-size="80"
      :description="$t('NO_DATA')"
    ></el-empty>

    <el-scrollbar v-else>
      <div v-for="item in selectedConstructList" :key="item.resType">
        <div class="construction-item-box" v-if="(item.constSchemaList && item.constSchemaList.length) || !disabled">
          <el-empty
            v-if="!item.constSchemaList || !item.constSchemaList.length"
            class="con-nodata-box"
            image="oss_core/edesign/assets/image/no_data.png"
            :image-size="50"
            :description="$t('NO_DATA')"
          ></el-empty>

          <div v-else class="con-item-content" v-for="(child, index) in item.constSchemaList" :key="child.constSchemeId">
            <span class="it-content-scheme it-content">
              <div class="it-label info-it-title" v-if="index === 0">
                {{ $t('CONSTRUCTION_SCHEME') }}
              </div>
              <div class="it-val info-it-val">
                {{ child.schemeName }}
              </div>
            </span>

            <span class="it-content-match it-content">
              <div class="it-label info-it-title" v-if="index === 0">
                {{ $t('CONSTRUCTION_SCHEME_MATCHING_POLICY') }}
              </div>
              <div class="it-val info-it-val">
                {{ child.endcPubStat && (child.endcPubStat.displayStat || child.endcPubStat.statement) }}
              </div>
            </span>
            <span class="it-content-btns it-content">
              <div class="it-label info-it-title" v-if="index === 0"></div>
              <div class="it-val info-it-val it-btn">
                <span class="btn-span-item" @click="showDetail(child)">
                  <i class=" icon_osp icon_ospxiangqingchakan"></i>
                  <span class="btn-text">{{ $t('CONSTRUCTION_SCHEME_QUOTA') }}</span>
                </span>
                <span class="btn-span-item" @click="showEditMatch(child)" v-if="!disabled">
                  <i class="icon_osp icon_ospedit"></i>
                  <span class="btn-text">{{ $t('CONSTRUCTION_SCHEME_MODIFY_POLICY') }}</span>
                </span>
                <span class="btn-span-item" @click="deleteScheme(child)" v-if="!disabled">
                  <i class="icon_osp icon_ospshanchu3"></i>
                  <span class="btn-text">{{ $t('DELETE') }}</span>
                </span>
              </div>
            </span>
          </div>
          <div class="con-item-head-btns">
            <span class="left-box">
              <span class="restype-label">
                <i class="icon_osp icon_ospa-WorkItem"></i>
                <span>{{ item.resTypeName }}</span>
              </span>
            </span>
            <span class="right-box" v-if="!disabled">
              <span class="add-con-btn" @click="addScheme(item.resType)">
                <i class="icon_osp icon_osptianjia"></i>
                <span>{{ $t('CONSTRUCTION_SCHEME_ADD') }}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <Popup :popupObj="selectSchemeObj" @popupClose="popupClose" @popupOk="selectSchemeOk">
      <template v-slot:popupBody>
        <el-select size="medium" v-model="selectScheme" :placeholder="$t('PLEASE_SELECT')" style="width:100%;">
          <el-option v-for="item in selectConList" :key="item.constSchemeId" :label="item.schemeName" :value="item.constSchemeId"> </el-option>
        </el-select>
      </template>
    </Popup>
    <Popup :popupObj="editMatchObj" @popupClose="popupMatchClose" @popupOk="editMatchOk">
      <template v-slot:popupBody>
        <RuleSetting v-model="endcPubStat" :varList="varList"></RuleSetting>
      </template>
    </Popup>
    <el-drawer class="show-detail-drawer" :title="$t('DESIGN_EXPORT_HLD_BOM_DETAIL')" :visible.sync="drawer" direction="rtl">
      <WorkItemDetail :schemeData="showSchemeData" :key="showSchemeData && showSchemeData.constSchemeId"></WorkItemDetail>
    </el-drawer>
  </div>
</template>
<script>
import { queryConstructList, queryCesignschemaConstscheme, queryResattrList, queryProjectConstscheme } from '@/oss_core/edesign/api/query/schema.js';
import { addDesignschemaConstscheme } from '@/oss_core/edesign/api/add/schema.js';
import { deleteDesignschemaConstscheme } from '@/oss_core/edesign/api/del/schema.js';
import { editPubstat } from '@/oss_core/edesign/api/edit/schema.js';
import WorkItemDetail from '@/oss_core/edesign/osp/constructionScheme/workItemDetail/WorkItemDetail.vue';
import RuleSetting from '@/oss_core/edesign/osp/constructionScheme/ruleSetting/RuleSetting.vue';

export default {
  name: 'Construction',
  props: {
    selectSchemeCode: '',
    sprintId: '',
    disabled: false,
  },
  components: {
    WorkItemDetail,
    RuleSetting,
  },

  data() {
    return {
      isNoContent: false,
      drawer: false,
      showSchemeData: {},
      selectConList: [], // 存储可选择的方案列表
      selectedConstructList: [], // 已选择的方案数据
      selectScheme: '',
      selectResType: '',
      allConstructMap: {},
      endcPubStat: {},
      selectSchemeObj: {
        title: this.$t('CONSTRUCTION_SCHEME_ADD'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '420px',
        height: '180px',
        show: false,
        drag: true,
        body: true,
        zIndex: 3,
      },
      attrMapData: {},
      varList: [],
      editMatchObj: {
        title: this.$t('RULE_COMPENT_EDIT_FORMULA'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '80%',
        height: '450px',
        show: false,
        drag: true,
        body: true,
        zIndex: 3,
      },
    };
  },

  created() {
    this.selectSchemeObj.el = document.body;
    this.editMatchObj.el = document.body;
  },

  mounted() {
    console.log('施工方案加载..');
    if (this.sprintId) {
      this.loadSelectProjectConstructScheme();
    } else {
      this.loadConstructList();
      this.loadSelectConstructScheme();
    }
  },

  methods: {
    refresh() {
      this.loadSelectProjectConstructScheme();
    },
    showDetail(data) {
      this.drawer = true;
      console.log('SS：', data);
      this.showSchemeData = data;
    },
    showEditMatch(data) {
      if (this.attrMapData[data.resSpecId]) {
        this.varList = this.attrMapData[data.resSpecId];
        this.editMatchObj.show = true;
      } else {
        queryResattrList(data.resSpecId).then(res => {
          this.attrMapData[data.resSpecId] = res.data || [];
          this.varList = res.data || [];
          this.editMatchObj.show = true;
        });
      }
      this.endcPubStat = data.endcPubStat;
    },
    popupMatchClose() {},
    editMatchOk() {
      const value = this.endcPubStat;
      if (value && (value.nullMsg || value.errorMsg)) {
        // 不能为空
        this.$message({
          type: 'error',
          message: value.nullMsg || value.errorMsg,
        });
      } else {
        editPubstat(value).then(res => {
          this.editMatchObj.show = false;
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('SAVE_SUCCESS'),
            });
            this.loadSelectConstructScheme();
          } else {
            this.$message({
              type: 'error',
              message: res.message || this.$t('AJAX_ERROR'),
            });
          }
        });
      }
    },
    popupClose() {
      this.selectResType = null;
      this.selectScheme = null;
    },
    addScheme(resType) {
      this.selectResType = resType;
      this.changeConstructMap();
      this.selectSchemeObj.show = true;
    },
    changeConstructMap() {
      const resTypeSelected = ((this.selectedConstructList.find(con => con.resType === this.selectResType) || {}).constSchemaList || []).map(
        item => item.constSchemeId,
      );
      const list = (this.allConstructMap[this.selectResType] || []).filter(item => !resTypeSelected.includes(item.constSchemeId));
      this.selectConList = list;
    },
    loadConstructList() {
      queryConstructList().then(res => {
        const allConstructMap = {};
        (res.data || []).forEach(it => {
          allConstructMap[it.resType] = it.constSchemaList || [];
        });
        this.allConstructMap = allConstructMap;
      });
    },
    loadSelectConstructScheme() {
      // 查询已选择的方案列表
      queryCesignschemaConstscheme(this.selectSchemeCode).then(res => {
        this.selectedConstructList = res.data || [];
      });
    },
    loadSelectProjectConstructScheme() {
      // 查询已选择的方案列表
      queryProjectConstscheme(this.sprintId).then(res => {
        this.selectedConstructList = res.data || [];
        const hasContent = this.selectedConstructList.find(it => it.constSchemaList && it.constSchemaList.length > 0);
        this.isNoContent = !hasContent;
      });
    },
    selectSchemeOk() {
      if (!this.selectScheme) {
        this.$message({
          type: 'error',
          message: this.$t('CONSTRUCTION_SCHEME_PLS_SELECT'),
        });
      } else {
        const obj = (this.selectConList || []).find(it => it.constSchemeId === this.selectScheme);
        addDesignschemaConstscheme({
          projectSchemaId: this.selectSchemeCode,
          constSchemeId: this.selectScheme,
          resCategory: obj.resCategory,
          resSpecId: obj.resSpecId,
        }).then(res => {
          this.selectSchemeObj.show = false;
          this.selectScheme = null;
          this.selectResType = null;
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('SAVE_SUCCESS'),
            });
            this.loadSelectConstructScheme();
          } else {
            this.$message({
              type: 'error',
              message: res.message || this.$t('AJAX_ERROR'),
            });
          }
        });
      }
    },
    deleteScheme(data) {
      this.$confirm(this.$t('DELETE_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        deleteDesignschemaConstscheme(data.id).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.loadSelectConstructScheme();
          } else {
            this.$message({
              type: 'error',
              message: res.data || this.$t('DELETE_FAIL'),
            });
          }
        });
      });
    },
  },
  watch: {
    selectSchemeCode() {
      console.log('有更改哦');
      this.loadSelectConstructScheme();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './construction.scss';
</style>
