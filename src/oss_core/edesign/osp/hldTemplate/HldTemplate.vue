<template>
  <div class="hld-template-box">
    <span class="sys-card-box left-resTypes-box">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('RESOURCE_TYPES_NAME') }}
        </span>
      </div>
      <div class="box-content">
        <EdnTree :data="fNodes" v-model="selectResType"></EdnTree>
      </div>
    </span>
    <span class="sys-card-box center-table-box">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('TEMPLATE_LIST') }}
        </span>
        <span>
          <el-button type="primary" size="mini2" @click="newHldTem">
            <i class="icon_osptianjia icon_osp m-r-small"></i>
            <span>{{ $t('NEW') }}</span>
          </el-button>
        </span>
      </div>
      <div class="box-content ele-content">
        <el-table
          :data="dataList"
          border
          style="width: 100%"
          height="100%"
          size="mini"
          @row-click="selectHldItem"
          :row-class-name="tableRowClassName"
        >
          <el-table-column prop="templateName" :label="$t('HLD_TEMPLATE_NAME')" min-width="180"> </el-table-column>
          <el-table-column prop="templateDesc" :label="$t('TEMPLATE_DESC')" min-width="180"> </el-table-column>
          <el-table-column prop="iconUrl" :label="$t('TEMPLATE_ICON')" width="70">
            <template slot-scope="scope">
              <img :src="scope.row.iconUrl" style="height:25px;" />
            </template>
          </el-table-column>
          <el-table-column width="85" :label="$t('OPERATIONS')" align="center">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="light" :content="$t('EDIT')" placement="bottom-start">
                <i class="el-icon-edit hld-option-icon cursor-hover" @click.stop="editEle(scope.row)"></i>
              </el-tooltip>
              <el-tooltip class="item" effect="light" :content="$t('DELETE')" placement="bottom-start">
                <i class="el-icon-delete hld-option-icon m-l text-red cursor-hover" @click.stop="deleteEle(scope.row.templateId)"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <div slot="empty">
            <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
          </div>
        </el-table>
      </div>
    </span>
    <span class="sys-card-box right-attrs-box">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('ATTRIBUTE_RELATION') }}
        </span>
      </div>
      <div class="box-content attr-content">
        <el-table :data="attrsList" border style="width: 100%" height="100%" size="mini">
          <el-table-column prop="attrDesc" :label="$t('ATTRIBUTE_NAME')"> </el-table-column>
          <el-table-column :label="$t('ATTRIBUTE_VALUE')" width="150">
            <template slot-scope="scope">
              <div v-if="editAttrIndex === scope.$index">
                <el-select
                  v-if="scope.row.attrValues && scope.row.attrValues.length > 0"
                  v-model="editAttrValue"
                  :data-csname="scope.row.attrId"
                  :placeholder="$t('PLEASE_SELECT')"
                >
                  <el-option v-for="item in scope.row.attrValues" :key="item.attrValue" :label="item.valueDesc" :value="item.attrValue"> </el-option>
                </el-select>
                <el-input
                  v-else
                  :type="scope.row.dataType === 'N' ? 'number' : 'text'"
                  v-model="editAttrValue"
                  :data-csname="scope.row.attrId"
                ></el-input>
              </div>
              <span v-else class="theme-text-val">{{ scope.row.attrValueName || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column width="85" :label="$t('OPERATIONS')" align="center">
            <template slot-scope="scope">
              <el-tooltip v-if="editAttrIndex !== scope.$index" class="item" effect="light" :content="$t('EDIT')" placement="bottom-start">
                <i
                  class="el-icon-edit hld-option-icon cursor-hover"
                  @click.stop="editAttr(scope.$index, scope.row.attrValue)"
                  :data-csname="`${scope.row.attrId}_edit`"
                ></i>
              </el-tooltip>
              <span v-else>
                <el-tooltip class="item" effect="light" :content="$t('SAVE')" placement="bottom-start">
                  <i class="el-icon-receiving hld-option-icon cursor-hover" @click="saveEdit(scope.$index)"></i>
                </el-tooltip>
                <el-tooltip class="item" effect="light" :content="$t('CANCEL')" placement="bottom-start">
                  <i class="el-icon-circle-close hld-option-icon cursor-hover m-l" @click="cancelEdit"></i>
                </el-tooltip>
              </span>
            </template>
          </el-table-column>
          <div slot="empty">
            <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
          </div>
        </el-table>
      </div>
    </span>

    <Popup :popupObj="editModalObj" @popupClose="popupClose" @popupOk="editSubmit">
      <template v-slot:popupBody>
        <div class="overflow-hidden flex-column all100">
          <JustTab :options="options" v-model="activeName"></JustTab>
          <div class="m-t-lg flex1 overflow-hidden">
            <div v-show="activeName === 'baseInfo'">
              <el-form label-position="top" :model="baseFormVal" :rules="baseFormRules" ref="baseForm" label-width="auto">
                <el-form-item :label="$t('HLD_TEMPLATE_NAME')" prop="templateName">
                  <el-input v-model="baseFormVal.templateName" maxlength="80" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item :label="$t('TEMPLATE_DESC')" prop="templateDesc">
                  <el-input v-model="baseFormVal.templateDesc" autocomplete="off" maxlength="160" type="textarea" :rows="5"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <SettingIcon v-show="activeName === 'icon'"></SettingIcon>
            <SettingCss v-show="activeName === 'style'"></SettingCss>
          </div>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryHldResType, queryHldtemplateList, queryHldtemplateAttrs } from '@/oss_core/edesign/api/query/hldTemplate.js';
import { editGISAttributeInfo, updateNewHLDTemplateInfo } from '@/oss_core/edesign/api/edit/hldTemplate.js';
import { deleteHLDTemplate } from '@/oss_core/edesign/api/del/hldTemplate.js';
import { addNewHLDTemplateInfo } from '@/oss_core/edesign/api/add/resources.js';
import SettingIcon from '@/oss_core/edesign/osp/SettingStyle/settingIcon/SettingIcon.vue';
import SettingCss from '@/oss_core/edesign/osp/SettingStyle/settingCss/SettingCss.vue';

export default {
  name: 'HldTemplate',
  props: {},
  components: {
    SettingIcon,
    SettingCss,
  },
  inject: ['defaultStyle'],
  provide() {
    return {
      getSettingData: () => this.settingData,
      changeSettingData: obj => {
        this.settingData = {
          ...this.settingData,
          ...obj,
        };
      },
    };
  },
  data() {
    return {
      options: [
        { name: this.$t('CONSTRUCTION_SCHEME_BASIC'), code: 'baseInfo' },
        { name: this.$t('HLD_SETTING_STYLE_ICON'), code: 'icon' },
        { name: this.$t('HLD_SETTING_STYLE_PRIMARY_LABEL'), code: 'style' },
      ],
      activeName: 'baseInfo',
      selectResType: '',
      selectHldTemId: '',
      editAttrIndex: -1,
      editAttrValue: '',
      fNodes: [],
      dataList: [],
      attrsList: [],
      editModalObj: {
        title: this.$t('NEW'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '850px',
        height: '600px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      baseFormVal: {},
      baseFormRules: {
        templateName: [{ required: true, message: this.$t('PLEASE_ENTER') }],
      },
      settingData: {},
    };
  },

  create() {},

  mounted() {
    this.loadTree();
  },

  methods: {
    popupClose() {},
    loadTable() {
      queryHldtemplateList({ resType: this.selectResType }).then(res => {
        this.dataList = res || [];
      });
    },
    loadTree() {
      queryHldResType().then(data => {
        const allData = data.resultList;
        if (allData) {
          const allRes = (allData || []).filter(it => it.resGroup !== 'Space Network');
          const nodeList = this.getResouceTypeNodeData(allRes);
          this.fNodes = [...nodeList];
        }
      });
    },
    getResouceTypeNodeData(allData) {
      const superParentName = [];
      allData.forEach(groupA => {
        if (superParentName.indexOf(groupA.resGroup) === -1) {
          superParentName.push(groupA.resGroup);
        }
      });
      const parent = [];
      superParentName.forEach(name => {
        const child = [];
        allData.forEach(left => {
          if (name === left.resGroup) {
            child.push({
              name: left.resTypeDesc,
              code: left.resTypeId,
            });
          }
        });
        parent.push({
          name,
          code: name,
          children: child,
          open: true,
        });
      });
      return parent.filter(lef => lef.children.length > 0);
    },
    tableRowClassName({ row }) {
      if (this.selectHldTemId === row.templateId) {
        return 'selected-row';
      }
      return '';
    },

    newHldTem() {
      this.settingData = this.defaultStyle[this.selectResType];
      this.editModalObj.show = true;
    },
    // 已选择能力模版选中事件
    selectHldItem(row) {
      if (this.selectHldTemId === row.templateId) {
        return;
      }
      this.selectHldTemId = row.templateId;
    },
    loadAttrs() {
      if (this.selectResType && this.selectHldTemId) {
        queryHldtemplateAttrs(this.selectResType, this.selectHldTemId).then(res => {
          const tableData = (res || []).map(item => {
            if (item.attrValues && item.attrValues.length > 0) {
              if (item.attrValue) {
                const findAttrItem = item.attrValues.find(obj => obj.attrValue === item.attrValue);
                if (findAttrItem) {
                  return {
                    ...item,
                    attrValueName: findAttrItem.valueDesc,
                  };
                }
              }
            } else {
              return {
                ...item,
                attrValueName: item.attrValue,
              };
            }
            return item;
          });
          this.attrsList = tableData;
        });
      } else {
        this.attrsList = [];
      }
    },
    editEle() {},
    deleteEle(templateId) {
      this.$confirm(this.$t('COMMON_DELETE_TIPS'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        deleteHLDTemplate(templateId).then(resultData => {
          if (resultData === 'SUCCESS') {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.loadTable();
          } else {
            this.$message({
              type: 'error',
              message: this.$t('DELETE_FAIL'),
            });
          }
        });
      });
    },
    editAttr(index, val) {
      this.editAttrValue = val;
      this.editAttrIndex = index;
    },
    saveEdit(index) {
      const data = this.attrsList[index];
      editGISAttributeInfo({
        attrId: data.attrId,
        attrValue: this.editAttrValue,
        templateId: this.selectHldTemId,
        resType: this.selectResType,
      }).then(resultData => {
        if (resultData === 'SUCCESS') {
          this.$message({
            type: 'success',
            message: this.$t('SAVE_SUCCESS'),
          });
          this.loadAttrs();
          this.cancelEdit();
        } else {
          this.$message({
            type: 'error',
            message: this.$t('AJAX_ERROR'),
          });
        }
      });
    },
    cancelEdit() {
      this.editAttrIndex = -1;
      this.editAttrValue = '';
    },
    editSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
        } else {
          this.activeName = 'baseInfo';
        }
      });
    },
  },
  watch: {
    selectResType() {
      this.selectHldTemId = '';
      this.loadTable();
    },
    selectHldTemId() {
      this.cancelEdit();
      this.loadAttrs();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './hldTemplate.scss';
</style>
