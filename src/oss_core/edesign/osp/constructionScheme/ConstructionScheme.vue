<template>
  <div class="construction-scheme-box">
    <div class="left-box">
      <ConstructionLeftTreeList
        ref="leftTree"
        @changeScheme="selectScheme"
        @loadAttrData="loadAttrData"
        :allAttrData="allAttrData"
      ></ConstructionLeftTreeList>
    </div>
    <div class="right-box">
      <span class="right-content-box sys-card-box">
        <div class="box-head-title">
          <span class="left-title">
            {{ $t('CONSTRUCTION_SCHEME_DETAIL') }}
          </span>
          <span class="right-options">
            <el-button :type="viewType === 'base' ? 'primary' : 'default'" size="mini2" @click="viewType = 'base'">
              <i class="icon_ospBasic icon_osp"></i>
              <span>
                {{ $t('CONSTRUCTION_SCHEME_BASIC') }}
              </span>
            </el-button>
            <el-button :type="viewType === 'workItem' ? 'primary' : 'default'" size="mini2" @click="viewType = 'workItem'" class="m-l-lg">
              <i class="icon_ospa-WorkItem icon_osp"></i>
              <span>
                {{ $t('CONSTRUCTION_SCHEME_WORK_ITEM') }}
              </span>
            </el-button>
          </span>
        </div>

        <div class="content-body " v-if="selectSchemeCode && viewType === 'base'">
          <BaseSetting :key="selectSchemeCode" ref="baseSetting" :data="baseData"></BaseSetting>
          <div class="bott-btn">
            <el-button type="primary" size="mini" :loading="saveLoading" @click="saveHeadForm"
              ><i class="icon_osp icon_ospsave1 m-r" style="font-size:12px;"></i>{{ $t('SAVE') }}</el-button
            >
          </div>
        </div>
        <div v-if="selectSchemeCode && viewType === 'workItem'" class="content-body ">
          <WorkItemDetail ref="workDetail" :schemeData="detailData" :isEdit="true"></WorkItemDetail>
        </div>
      </span>
    </div>
  </div>
</template>
<script>
import ConstructionLeftTreeList from './constructionLeftTreeList/ConstructionLeftTreeList.vue';
import BaseSetting from './baseSetting/BaseSetting.vue';
import { queryConstructDetail } from '@/oss_core/edesign/api/query/schema.js';
import WorkItemDetail from './workItemDetail/WorkItemDetail.vue';
export default {
  name: 'ConstructionScheme',
  props: {},
  components: {
    ConstructionLeftTreeList,
    BaseSetting,
    WorkItemDetail,
  },

  data() {
    return {
      viewType: 'base',
      saveLoading: false,
      selectSchemeCode: '',
      detailData: {},
      baseData: {},
      allAttrData: {},
      // selectResTypeName:'',//选择的方案resTypeName
    };
  },

  create() {},

  mounted() {
    // this.updateConfigData('CHECKING_RULES');
  },

  methods: {
    loadDetail() {
      queryConstructDetail(this.selectSchemeCode).then(res => {
        this.detailData = res.data || {};
        this.baseData = {
          ...this.detailData,
          resTypeName: this.selectResTypeName,
        };
        this.loadAttrData(this.detailData.resSpecId, this.detailData.edncFeatureAttrList);
      });
    },

    loadAttrData(resType, data) {
      this.allAttrData[resType] = data;
    },

    selectScheme(code, item) {
      this.selectResTypeName = item.resTypeName;
      this.selectSchemeCode = code;
      this.loadDetail();
    },

    saveHeadForm() {
      this.saveLoading = true;
      this.$refs.baseSetting.onSubmit(
        () => {
          this.saveLoading = false;
          this.$refs.leftTree.loadTree();
        },
        () => {
          this.saveLoading = false;
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import './constructionScheme.scss';
</style>
