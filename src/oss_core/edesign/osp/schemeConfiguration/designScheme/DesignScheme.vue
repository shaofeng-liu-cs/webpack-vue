<template>
  <div class="design-scheme-box">
    <div class="child-head-title">
      <span class="head-title">{{ $t('DESIGN_SCHEME_ELEMENTS') }}</span>
    </div>
    <div class="elements-box">
      <div class="options">
        <el-button size="mini2" @click="handleSelectModal" type="primary">
          <i class="icon_osp icon_ospxinjianchufa "></i>
          {{ $t('ADD') }}
        </el-button>
        <el-button size="mini2" @click="removeSelected" type="danger"> <i class="icon_osp icon_ospshanchu2 "></i>{{ $t('DELETE') }}</el-button>
      </div>
      <div class="bt-table-config">
        <span class="left-table-box">
          <el-table
            class="selectedTable"
            :data="selectGridList"
            border
            width="100%"
            height="100%"
            ref="selectedTable"
            @row-click="selectHldItem"
            :row-class-name="tableRowClassName"
          >
            <el-table-column :label="$t('DESIGN_SCHEME_TEMPLATE_ICON')" width="80">
              <template slot-scope="scope">
                <div v-if="scope.row.styleJson.geometryType === $map.GeometryType.POINT">
                  <img class="image-btn" :src="scope.row.styleJson.iconUrl" />
                </div>
                <div v-else class="line-container">
                  <div
                    :style="{
                      borderTop: `${scope.row.styleJson.lineWidth}px ${
                        scope.row.styleJson.lineStyle === 'dash' ? 'dashed' : scope.row.styleJson.lineStyle
                      } ${scope.row.styleJson.lineColor}`,
                    }"
                  ></div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="hldTemplateName" :label="$t('DESIGN_SCHEME_ELEMENTS')"> </el-table-column>
            <el-table-column prop="resTypeName" :label="$t('RES_TYPE')"> </el-table-column>
            <el-table-column :label="$t('DESIGN_SCHEME_SELECT_RESOURCE_MODAL')">
              <template slot-scope="scope">
                <div v-show="selectHldTemId === scope.row.hldTemplateId && modelIsLoad === scope.row.hldTemplateId">
                  <el-select
                    style="width:100%;"
                    v-if="modelSelectMap[scope.row.resType] && modelSelectMap[scope.row.resType].length"
                    v-model="scope.row.selectConfTempId"
                    @change="val => comTreeChange(scope.row, val)"
                  >
                    <el-option v-for="item in modelSelectMap[scope.row.resType]" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                  </el-select>
                </div>
                <div v-show="!(selectHldTemId === scope.row.hldTemplateId && modelIsLoad === scope.row.hldTemplateId)" class="text-val">
                  {{ scope.row.templateName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('MODEL')">
              <template slot-scope="scope">
                <el-select
                  v-if="selectHldTemId === scope.row.hldTemplateId && selectBenchTemplateId === scope.row.benchTemplateId"
                  style="width:100%;"
                  v-model="scope.row.modelId"
                  @change="val => comTreeChange2(scope.row, val)"
                >
                  <el-option
                    v-for="item in benchModelMap[scope.row.benchTemplateId]"
                    :key="item.modelId"
                    :label="item.modelName"
                    :value="item.modelId"
                  >
                  </el-option>
                </el-select>
                <span v-else class="text-val"> {{ scope.row.modelName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('DESIGN_EXPORT_BOM_PRICE_1')">
              <template slot-scope="scope">
                <div v-if="selectHldTemId === scope.row.hldTemplateId">
                  <el-input type="number" v-model="scope.row.price"></el-input>
                </div>
                <div v-else class="text-val">
                  {{ scope.row.price }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </span>
        <span class="right-config-box">
          <div class="config-title">{{ $t('DESIGN_SCHEME_RELATIVE_PROPERTIES') }}</div>
          <div
            class="config-form-content"
            v-if="
              selectGridList[selectHldIndex] &&
                selectGridList[selectHldIndex].attrList &&
                selectGridList[selectHldIndex].attrList.length &&
                hldIsLoadAttrMap[`${selectSchemeCode}_${selectHldTemId}`]
            "
          >
            <div class="hld-item-attr-setting" v-for="(attr, index) in selectGridList[selectHldIndex].attrList" :key="index">
              <div class="attr-name">{{ attr.attrDesc }}</div>
              <div class="attr-input">
                <el-input v-model="attr.attrValue" v-if="!attr.attrValues || !attr.attrValues.length"></el-input>
                <!-- <Combobox v-else v-model="attr.attrValue" :setting="getComBoAttrSetting(attr.attrValues)"></Combobox> -->
                <el-select style="width:100%;" v-else class="filterSelectBox" v-model="attr.attrValue" :clearable="true">
                  <el-option v-for="attrItem in attr.attrValues" :key="attrItem.id" :value="attrItem.attrValue" :label="attrItem.valueDesc">
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
          <el-empty
            v-else
            class="con-nodata-box"
            image="oss_core/edesign/assets/image/no_data.png"
            :image-size="50"
            :description="$t('NO_DATA')"
          ></el-empty>
        </span>
      </div>
    </div>
    <div class="child-head-title">
      <span class="head-title">{{ $t('DESIGN_SCHEME_MANAGED_BUSINESS_GRIDS') }}</span>
    </div>
    <div class="grids-checks">
      <el-checkbox-group v-model="checkList">
        <el-checkbox label="OLT_GRID">{{ $t('DESIGN_SCHEME_SELECT_OLT_GRID') }}</el-checkbox>
        <el-checkbox label="OCC_GRID">{{ $t('DESIGN_SCHEME_SELECT_DISTRIBUTION_GRID') }}</el-checkbox>
        <el-checkbox label="ODB_GRID">{{ $t('DESIGN_SCHEME_SELECT_COVERAGE_GRID') }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <Popup :popupObj="selectHldObj" @popupClose="popupClose" @popupOk="selectHldTemOk">
      <template v-slot:popupBody>
        <div class="select-design-elements-modal">
          <div class="flex-center search-head">
            <span>
              <Search ref="search" v-model="searchName"></Search>
            </span>
            <span>
              <el-select v-model="filterResType">
                <el-option v-for="resItem in resourceTypeList" :key="resItem.resType" :value="resItem.resType" :label="resItem.resTypeName">
                </el-option>
              </el-select>
            </span>
          </div>
          <div class="modal-table-content">
            <el-table
              ref="newHldGridRef"
              width="100%"
              height="100%"
              border
              :data="modalSelectList"
              tooltip-effect="light"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55"> </el-table-column>
              <el-table-column :label="$t('DESIGN_SCHEME_ELEMENTS')" prop="hldTemplateName"> </el-table-column>
              <el-table-column :label="$t('OSP_TASK_SET_PROPERTIES')" prop="hldTemplateDesc"> </el-table-column>
              <el-table-column :label="$t('DESIGN_SCHEME_TEMPLATE_ICON')" width="80">
                <template slot-scope="scope">
                  <div v-if="scope.row.styleJson.geometryType === $map.GeometryType.POINT">
                    <img class="image-btn" :src="scope.row.styleJson.iconUrl" alt="" />
                  </div>
                  <div v-else class="line-container">
                    <div
                      :style="{
                        borderTop: `${scope.row.styleJson.lineWidth}px ${
                          scope.row.styleJson.lineStyle === 'dash' ? 'dashed' : scope.row.styleJson.lineStyle
                        } ${scope.row.styleJson.lineColor}`,
                      }"
                    ></div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryAllrestypelistNew } from '@/oss_core/edesign/api/query/mapNo.js'; // 后台接口
import {
  getDesignHldtemplateList,
  getDesignModelList,
  getSelectedEleList,
  getHldAttrList,
  queryBenchModellist,
} from '@/oss_core/edesign/api/query/schema.js';
import { updateDesignelement } from '@/oss_core/edesign/api/edit/schema.js';

export default {
  name: 'DesignScheme',
  props: {
    selectSchemeCode: {
      type: [String, Number],
    },
  },
  components: {},
  inject: ['defaultStyle'],

  data() {
    return {
      selectHldObj: {
        title: this.$t('DESIGN_SCHEME_SELECT_DESIGN_ELEMENTS'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '680px',
        height: '600px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      gridOption: {
        // 资源模版-已选择列表的配置
        width: '100%',
        cellEdit: true,
        columnResizable: false, // 是否支持列头拖拽调整大小，默认是支持; 如果设置为false，则所有列都不支持拖拽 ...
        slimscrollOptions: {
          alwaysVisible: false, // 滚动轴是否一直显示
          axis: 'both', // 滚动轴类型。x:只有横向滚动轴，y:只有纵向滚动轴，both:两者都有 ...
        }, // 表格滚动条的选项参数
      },
      resourceTypeList: [],

      hldNoSelectGridOption: {
        // 能力模版可选择列表的配置
        checkChildren: true,
        checkParent: true,
        multiselect: true,
        multiselectWidth: 40,
      },
      multipleSelection: [],
      selectGridIds: [],
      selectGridList: [],
      modalSelectList: [], // 弹框可以选择的显示用list
      hldAllMap: {}, // 所有的能力模版数据
      searchName: '',
      filterResType: 'F_CLOSURE',
      selectHldTemId: '',
      selectHldIndex: -1,
      modelSelectMap: {}, // 选型列表Map
      modelIsLoad: null,
      modelIdValMap: {},
      hldIsLoadAttrMap: {},
      benchModelMap: {},
      selectBenchTemplateId: '',
      resTypeMap: {},
      currentRow: null,
      checkList: [],
    };
  },

  create() {},

  mounted() {
    queryAllrestypelistNew().then(res => {
      this.resourceTypeList = res.resultList || [];
      const resTypeMap = {};
      (res.resultList || []).forEach(it => {
        resTypeMap[it.resType] = it.resTypeName;
      });
      this.resTypeMap = resTypeMap;
      this.loadTemList();
      this.loadSelectHldList();
    });
  },

  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getComBoAttrSetting(list) {
      return {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'valueDesc',
        dataValueField: 'attrValue',
        dataSource: list,
      };
    },
    loadSelectHldList() {
      if (!this.selectSchemeCode) {
        return;
      }
      this.selectHldTemId = null;
      this.selectHldIndex = -1;
      this.searchName = '';
      this.checkList = [];
      this.hldIsLoadAttrMap = {};
      getSelectedEleList(this.selectSchemeCode).then(res => {
        // 初始化下方多选框的选中状态
        (res.businessGridList || []).forEach(it => {
          if (it.selected === 'Y') {
            this.checkList.push(it.resType);
          }
        });
        const list = (res.hldTemplateList || []).map(it => ({
          ...it,
          selectConfTempId: it.confTemplateId || it.benchTemplateId,
        }));
        this.formatSelectedGridData(list);
      });
    },

    popupClose() {
      this.multipleSelection = [];
    },
    popupOk() {},
    handleSelectModal() {
      this.selectHldObj.show = true;
      this.searchHldTemplate();
    },
    loadTemList() {
      if (!this.filterResType) {
        return;
      }
      getDesignHldtemplateList(this.filterResType).then(res => {
        this.hldAllMap[this.filterResType] = (res || []).map(it => ({
          ...it,
          resType: it.resType || it.resSpecId,
          resTypeName: this.resTypeMap[it.resType || it.resSpecId],
        }));
        this.searchHldTemplate();
      });
    },

    // 选择能力模版确定
    selectHldTemOk() {
      const selectDatas = this.multipleSelection.map(it => ({
        ...it,
        modelId: '',
      }));
      this.selectHldObj.show = false;
      if (!selectDatas.length) {
        return;
      }
      const newSelectList = [...this.selectGridList, ...selectDatas];
      this.multipleSelection = [];
      this.formatSelectedGridData(newSelectList);
    },
    formatSelectedGridData(newSelectList) {
      this.selectHldMap = {};
      this.selectGridIds = [];
      newSelectList.forEach(it => {
        this.selectHldMap[it.hldTemplateId] = it;
        this.selectGridIds.push(it.hldTemplateId);
      });
      this.selectGridList = newSelectList;
      // this.searchHldTemplate();
    },
    // 能力模版弹框筛选能力模版
    searchHldTemplate() {
      this.modalSelectList = this.hldAllMap[this.filterResType].filter(
        it => it.hldTemplateName.indexOf(this.searchName) > -1 && !this.selectGridIds.includes(it.hldTemplateId),
      );
    },
    removeSelected() {
      if (this.selectHldTemId) {
        this.selectGridIds.splice(this.selectGridIds.indexOf(this.selectHldTemId), 1);
        this.selectGridList.splice(this.selectHldIndex, 1);
        this.selectHldTemId = null;
        this.selectHldIndex = -1;
      }
    },
    tableRowClassName({ row }) {
      if (this.selectHldTemId === row.hldTemplateId) {
        return 'selected-row';
      }
      return '';
    },
    // 已选择能力模版选中事件
    selectHldItem(row) {
      if (this.selectHldTemId === row.hldTemplateId) {
        return;
      }
      console.log('设置选中：', row);
      this.currentRow = row;
      const index = this.selectGridList.findIndex(it => it.hldTemplateId === row.hldTemplateId);
      this.selectHldTemId = row.hldTemplateId;
      this.selectHldIndex = index;
      this.loadModelSelectList(row);
      this.loadHldAttrList(row);
      this.loadBenchModelList(row.benchTemplateId);
      this.$nextTick(() => {
        this.$refs.selectedTable.setCurrentRow(this.currentRow);
      });
    },
    loadModelSelectList(row) {
      if (this.modelSelectMap[row.resType]) {
        this.modelIsLoad = row.hldTemplateId;
        return;
      }
      getDesignModelList(row.resType).then(res => {
        let modelList = res || [];
        modelList = modelList.map(it => {
          let newIt = {};
          if (it.isBench === 'Y') {
            const isDisabled = modelList.find(item => item.isBench === 'N' && it.benchTemplateId === item.benchTemplateId);
            newIt = {
              id: it.benchTemplateId,
              pId: null,
              open: true,
              name: it.templateName,
              disabled: !!isDisabled,
              data: it,
            };
          } else {
            newIt = {
              id: it.confTemplateId,
              pId: it.benchTemplateId,
              name: it.templateName,
              data: it,
            };
          }
          return newIt;
        });
        this.modelIdValMap = this.modelIdValMap || {};
        modelList.forEach(it => {
          this.modelIdValMap[it.id] = it;
        });
        this.modelSelectMap[row.resType] = modelList;
        this.$nextTick(() => {
          this.modelIsLoad = this.selectHldTemId;
        });
      });
    },
    loadHldAttrList(row) {
      const key = `${this.selectSchemeCode}_${row.hldTemplateId}`;
      if (!this.hldIsLoadAttrMap[key]) {
        const index = this.selectHldIndex;
        getHldAttrList(this.selectSchemeCode, row.hldTemplateId).then(res => {
          this.hldIsLoadAttrMap[key] = true;
          this.selectGridList[index].attrList = (res || []).map(item => ({
            ...item,
            attrValue: item.attrValue || item.attrValue === 0 ? item.attrValue : '',
          })); // todo...
          this.selectGridList = JSON.parse(JSON.stringify(this.selectGridList));
        });
      }
    },
    loadBenchModelList(benchTemplateId) {
      if (benchTemplateId) {
        if (this.benchModelMap[benchTemplateId]) {
          this.selectBenchTemplateId = benchTemplateId;
          return;
        }
        queryBenchModellist(benchTemplateId).then(res => {
          this.benchModelMap[benchTemplateId] = res || [];
          this.selectBenchTemplateId = benchTemplateId;
        });
      }
    },
    comTreeChange(row, val) {
      const obj = (this.modelSelectMap[row.resType] || []).find(it => it.id === val) || {};
      row.templateName = obj.name;
      const selectObj = this.modelIdValMap[row.selectConfTempId];
      if (selectObj.pId) {
        row.benchTemplateId = selectObj.pId;
        row.confTemplateId = row.selectConfTempId;
      } else {
        row.benchTemplateId = row.selectConfTempId;
      }
      row.modelId = '';
      row.modelName = '';
      this.loadBenchModelList(row.benchTemplateId);
    },
    comTreeChange2(row, val) {
      const model = (this.benchModelMap[row.benchTemplateId] || []).find(it => it.modelId === val) || {};
      row.modelName = model.modelName;
      row.modelId = val;
      console.log('变化：', val);
    },
    formatSubData() {
      const dataMap = {};
      console.log('this.selectGridList:', this.selectGridList);
      this.selectGridList.forEach(it => {
        dataMap[it.resType] = dataMap[it.resType] || {
          resType: it.resType,
          selectList: [],
        };
        dataMap[it.resType].selectList.push(it);
      });
      const list = Object.values(dataMap);
      const params = [];
      (list || []).forEach(lit => {
        // eslint-disable-next-line prefer-destructuring
        const resType = lit.resType;
        const gisLayerThemeItemList = [];
        // eslint-disable-next-line prefer-destructuring
        const selectList = lit.selectList;
        let theStyleJson = {};
        if (selectList.length) {
          selectList.forEach((it, index) => {
            const styleJson = it.styleJson || {};
            const filterJson = { propertyName: 'hldTemplateId', expression: it.hldTemplateId, type: 'equalTo' };
            gisLayerThemeItemList.push({
              ...styleJson,
              seq: index + 1,
              themeItemDef: filterJson,
              themeItemName: it.hldTemplateName,
              themeItemId: it.hldTemplateName,
            });
          });
          const styleData = JSON.parse(JSON.stringify(this.defaultStyle[resType] || {}));
          theStyleJson = {
            ...styleData,
            themeName: 'HLD Template',
            themeId: 'HLD Template',
            themeType: 'R',
            gisLayerThemeList: [
              {
                gisLayerThemeItemList: [
                  ...gisLayerThemeItemList,
                  {
                    ...styleData,
                    seq: gisLayerThemeItemList.length + 1,
                    themeItemDef: { propertyName: 'resStatus', expression: 'C', type: 'equalTo' },
                    themeItemName: 'Other',
                    themeItemId: 'Other',
                  },
                ],
                seq: 1,
                themeDef: null,
                themeName: 'HLD Template',
                themeId: 'HLD Template',
                themeType: 'R',
              },
            ],
          };
        }
        params.push({
          resType,
          styleJson: theStyleJson,
        });
      });
      return params;
    },
    submit() {
      let params = {};
      const businessGridList = this.checkList;
      // eslint-disable-next-line no-restricted-syntax

      let isSub = true;
      const hldTemplateList = this.selectGridList.map(it => {
        if (it.resType !== 'SITE' && it.resType !== 'PIPELINE_JOINT' && !it.selectConfTempId) {
          isSub = false;
        }
        const newIt = {
          ...it,
          resType: it.resType,
          projectSchemaId: this.selectSchemeCode,
        };
        delete newIt.selectConfTempId;
        return newIt;
      });
      if (!isSub) {
        this.$message({
          type: 'error',
          message: this.$t('DESIGN_SCHEME_SUBMIT_CONFIM'),
        });
        return;
      }
      params = {
        businessGridList,
        hldTemplateList,
        projectSchemaId: this.selectSchemeCode,
        styleJsonList: this.formatSubData(),
      };
      updateDesignelement(params).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('SAVE_SUCCESS'),
        });
      });
    },
  },
  watch: {
    selectSchemeCode() {
      this.loadSelectHldList();
    },
    filterResType() {
      this.loadTemList();
    },
    searchName() {
      this.searchHldTemplate();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './designScheme.scss';
</style>
