<template>
  <div>
    <div class="top-formula-box">
      <span>{{ $t('CONSTRUCTION_SHHEME_MATERIAL_FORMULA') }}</span>
      <span class="formula-span">{{
        baseInfo.edncPubStatementDTO && (baseInfo.edncPubStatementDTO.displayStat || baseInfo.edncPubStatementDTO.statement)
      }}</span>
      <span class="formula-btn" v-if="isEdit">
        <i class="icon_osp icon_ospjisuan"></i>
        {{ $t('EDIT') }}
      </span>
      <span v-else class="formula-btn"></span>
    </div>
    <div class="work-item-tabel-box">
      <span class="table-left-menu">
        <div class="tr-head-title">{{ baseInfo.relaAttrName || $t('CONSTRUCTION_SHHEME_ASSOCIATED_PROPERTIES') }}</div>
        <div class="tr-head-item">
          <span class="head-it">
            <div class="item-info info-title norightborder"></div>
            <div
              class="item-info"
              :style="`height:${item.dataList.length * 33}px;min-height:${item.dataList.length * 33}px;`"
              v-for="(item, i) in wuliaoData"
              :key="i"
            >
              {{ item.suppTypeName }}
            </div>
            <div class="item-info" v-if="isEdit" :style="`height:33px;min-height:33px;`" :class="{ trSelect: selectIndex === tableData.length - 1 }">
              <el-input class="item-con-input" type="number"></el-input>
            </div>
          </span>
          <span class="head-it">
            <div class="item-info info-title">{{ $t('NAME') }}</div>
            <div class="item-info" v-for="(item, i) in tableData" :key="i" :class="{ trSelect: selectIndex === i }">
              <el-input v-if="item.addTr" class="item-con-input" type="number"></el-input>
              <span v-else>
                {{ item.suppName }}
              </span>
            </div>
          </span>
          <span class="head-it">
            <div class="item-info info-title">{{ $t('E_OSP_DP_SELECT_UNIT') }}</div>
            <div class="item-info" v-for="(item, i) in tableData" :key="i" :class="{ trSelect: selectIndex === i }">
              <el-input v-if="item.addTr" class="item-con-input" type="number"></el-input>
              <span v-else>
                {{ item.measUnit }}
              </span>
            </div>
          </span>
        </div>
      </span>

      <span class="right-table-content" :class="{ 'has-options': isEdit }">
        <el-scrollbar showFlag="horizontal">
          <span class="content-val-td-item" v-for="(item, i) in wuliaoHeads" :key="i">
            <div class="val-item-title">
              <el-input v-if="item.addTr" class="item-con-input" type="number"></el-input>
              <span v-else>
                {{ item.valueDesc }}
              </span>
            </div>
            <div class="val-item"></div>
            <div class="val-item-con" v-for="(it, index) in tableData" :key="index" :class="{ trSelect: selectIndex === index }">
              <!-- <el-input class="item-con-input" type="number"></el-input> -->
              <el-input v-if="it.addTr" class="item-con-input" type="number"></el-input>
              <span v-else>
                {{ it[item.attrValue] }}
              </span>
            </div>
          </span>

          <div v-if="wuliaoHeads.length === 0" class="empty-div"></div>
          <div class="content-tr-item" :class="{ noBorder: !tableData.length }">{{ $t('CONSTRUCTION_SCHEME_PERR_UNIT_QUOTA') }}</div>
        </el-scrollbar>
        <span class="content-val-td-item content-td-options" v-if="isEdit">
          <div class="val-item-title">
            {{ $t('OPERATIONS') }}
          </div>
          <div class="val-item"></div>
          <div class="val-item-con" v-for="(it, index) in tableData" :key="index" :class="{ trSelect: selectIndex === index }">
            <i class="el-icon-edit-outline"></i>
            <i class="el-icon-delete"></i>
          </div>
        </span>
      </span>
    </div>
    <div class="no-content-box" v-if="!tableData.length">
      <el-empty class="con-nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SuppliesTable',
  props: {
    detail: {},
    isEdit: false,
  },
  components: {},

  data() {
    return {
      baseInfo: {},
      wuliaoHeads: [],
      wuliaoData: [],
      tableData: [],
      selectIndex: -1,
    };
  },

  create() {},

  mounted() {
    this.formatTableData();
  },

  methods: {
    formatTableData() {
      if (this.detail) {
        let tableData = [];
        const suppList = this.detail.suppList || [];
        this.wuliaoHeads = this.detail.relaAttrValueList || [];
        const wuliaoDataMap = {};
        suppList.forEach(it => {
          wuliaoDataMap[it.suppType] = wuliaoDataMap[it.suppType] || {
            suppTypeName: it.suppTypeName,
            suppType: it.suppType,
            dataList: [],
          };
          wuliaoDataMap[it.suppType].dataList.push(it);
        });

        this.wuliaoData = Object.values(wuliaoDataMap);
        this.wuliaoData.forEach(wl => {
          tableData = [...tableData, ...wl.dataList];
        });
        this.baseInfo = this.detail.basicInfo || {};
        if (this.isEdit) {
          this.tableData = [...tableData, { addTr: true }];
          this.selectIndex = this.tableData.length - 1;
        } else {
          this.tableData = tableData;
        }
      }
    },
  },
  watch: {
    detail() {
      this.formatTableData();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './suppliesTable.scss';
</style>
