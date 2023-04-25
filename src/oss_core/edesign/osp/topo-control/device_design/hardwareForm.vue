<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-03-12 18:27:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\clickRight\selection\resForm\ResForm.vue
-->
<template>
    <form class="form-horizontal hardware-form-style" ref="form">
        <Panel :panelFooter="false" v-for="(items, indexs) in formList" :key="indexs">
            <template v-slot:title> {{ mapTitle(items.name) }} </template>
            <template v-slot:body>
                <div v-for="item in items.childData.filter(child => child.isDisplay === 'Y')" :key="item.attrId" class="input-content" :class="`res-form-${row}`">
                    <div :class="{ required: item.isMandatory === 'Y' }">
                        <label class="required-label">{{ item.attrName }}</label>
                        <div :class="item.displayStyle === 'URL' || item.attrCode === 'FULL_NAME' || item.attrCode === 'NAME' ? 'popedit input-group' : ''">
                            <input class="form-control" :name="item.attrBeanName" v-model="formValue[item.attrBeanName]" :disabled="item.isModifiable === 'N'" :data-rule="item.isMandatory === 'Y' ? 'required' : ''" v-if="item.displayStyle === 'TextEdit'" />
                            <Popedit class="form-control" :value="item.defVal" :name="item.attrBeanName" :url="item.url" :disabled="item.isModifiable === 'N'" :dataRule="item.isMandatory === 'Y' ? 'required' : ''" v-else-if="item.displayStyle === 'URL'" :initialData="item.initialData || {}" @popeditChange="popeditChange"></Popedit>
                            <Combobox :name="item.attrBeanName" v-model="formValue[item.attrBeanName]" :setting="{ dataTextField: 'name', dataValueField: 'code', dataSource: item.attrValueList, value: item.defVal }" v-else-if="item.displayStyle === 'ComboBox'" :disabled="item.isModifiable === 'N'" :dataRule="item.isMandatory === 'Y' ? 'required' : ''"></Combobox>
                            <span class="input-group-addon" tabindex="0" v-if="item.attrCode === 'FULL_NAME' || item.attrCode === 'NAME'" @click="autoName()"><span class="glyphicon glyphicon-new-window"></span></span>
                        </div>
                    </div>
                </div>
            </template>
        </Panel>
    </form>
</template>
<script>
import { getTaskDetail } from '@/oss_core/edesign/api/query/schema.js';
import { queryResTypeInfo, getObjNaming, queryResourceInfo } from '@/oss_core/edesign/api/query/resType.js';
import { isHardware, isCard, isPanel } from '@/oss_core/base/utils/util.js';

export default {
  props: {
    row: {
      type: Number,
      default: 1,
    },
    resType: {
      type: String,
    },
    selectedTemplateId: {
      type: String,
    },
    attributes: {
      type: Object,
    },
    schemaId: {
      type: String,
      default: '', // 如果没有传任务单详情 至少需要任务单ID
    },
    num: {
      type: Number,
      default: 1, // 是不是批量的form表单
    },
    action: {
      type: String,
      default: 'add', // 默认新增； add新增 edit编辑 view查看
    },
    addObject: {
      type: Object,
    },
    templateList: {
      type: Array,
    },
  },
  data() {
    return {
      projectInfo: {}, // 工程详细信息
      initFormList: [], //一开始从后台拿到的form数据
      formList: [], //重新分组后的form数据
      formValue: {
        resSpecId: this.resType,
        schemaId: this.schemaId,
      }, // form的值
    };
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    getTaskDetail(this.schemaId).then(data => {
      if (data && data.resultList && data.resultList.length > 0) {
        this.projectInfo = data.resultList[0] || {};
        this.formValue.sprintId = this.projectInfo.sprintId;
        this.formValue.projectId = this.projectInfo.projectId;
        this.setTapDataList().then(form => {
          this.$emit('formComplete', form);
        });
      }
    });
  },
  //方法集合
  methods: {
    async setTapDataList() {
      let imResInfo = {};
      if (this.action !== 'add') {
        let resType = this.resType;
        let resId = this.addObject.hardwareId;
        resType = this.addObject.attrObject ? this.addObject.attrObject.resSpecId : this.resType;

        // let data = await queryResourceInfo({ resId: '210225155706585175', resType: 'PANEL' });
        let data = await queryResourceInfo({ resId: resId, resType: resType });
        if (data && data.resultList) {
          imResInfo = data.resultList[0];
        }
      } else {
        this.formValue.name = '';
        this.formValue.fullName = '';
      }
      // console.log(imResInfo);
      var hardwareResType = this.resType;
      if (isCard(hardwareResType)) {
        hardwareResType = 'CARD';
      }
      let formData = await queryResTypeInfo(this.projectInfo.schemaId, hardwareResType); //表单数据
      if (formData && formData.resultList && formData.resultList.length !== 0) {
        this.initFormList = formData.resultList;
      }
      this.setModelInfo();
      let selectedNodeIsOperate = false;
      if ((isPanel(this.resType) && isPanel(this.addObject.resSpecId)) || (isCard(this.resType) && isCard(this.addObject.resSpecId))) {
        selectedNodeIsOperate = true;
      }
      this.initFormList.forEach(result => {
        if (isHardware(this.resType)) {
          result.isModifiable = 'Y';
        }

        if (this.action === 'view') {
          result.isModifiable = 'N';
        }
        if (this.action === 'add') {
          result.isModifiable = 'Y';
        }
        if (result.attrCode === 'MODEL_ID') {
          result.isModifiable = 'N';
        }
        if (result.attrCode === 'COL_NO' && this.addObject.colNo) {
          result.isModifiable = 'N';
          imResInfo.colNo = selectedNodeIsOperate ? this.addObject.colNo : '';
        }
        if (result.attrCode === 'ROW_NO' && this.addObject.rowNo) {
          result.isModifiable = 'N';
          imResInfo.rowNo = selectedNodeIsOperate ? this.addObject.rowNo : '';
        }
        if (this.action === 'edit' && result.attrCode === 'NAME_SEQ') {
          result.isModifiable = 'N';
        }
      });

      this.formValue = Object.assign({}, this.formValue, imResInfo);
      this.getResource(this.initFormList, this.formList);
      return this;
    },
    mapTitle(name) {
      if (name === 'RES.BAS') {
        return 'Basic';
      } else if (name === 'RES.EXT') {
        return 'Extension';
      } else {
        return name;
      }
    },

    //自动命名
    autoName() {
      getObjNaming(this.resType).then(data => {
        this.formValue.name = data.name;
        this.formValue.fullName = data.name;
      });
    },

    //form数据按组分类
    getResource(resData, formList) {
      if (resData.length > 0) {
        let name = resData[0].groupId;
        let childData = resData.filter(item => item.groupId === name);
        let gridDataChild = {
          name,
          childData,
        };
        formList.push(gridDataChild);
        let newResData = resData.filter(item => item.groupId !== name);
        this.getResource(newResData, formList);
      }
    },

    // popedit改变
    popeditChange(obj) {
      this.formValue[obj.name] = obj.data.value;
      console.log(this.formValue);
    },

    // 模板联动和设置模板信息
    setModelInfo() {
      let templateInfo = this.templateList.find(temChild => temChild.templateId === this.selectedTemplateId) || {};
      this.formValue.cfgTemplateId = templateInfo.confTemplateId || '';
      this.formValue.modelId = templateInfo.modelId || '';
      this.formValue.modelIdDesc = templateInfo.modelName || '';
      this.formValue.templateIdDesc = templateInfo.templateName || '';
      this.formValue.vendorId = templateInfo.vendorCode || '';
      let modelInfo = this.initFormList.find(item => item.attrCode === 'MODEL_ID'); // initFormList和formList共用数据源
      if (modelInfo) {
        modelInfo.attrValueList = [
          {
            name: templateInfo.modelName || '',
            code: templateInfo.modelId || '',
          },
        ];
        modelInfo.defVal = templateInfo.modelId || '';
      }
      let vendorInfo = this.initFormList.find(item => item.attrCode === 'VENDOR_ID'); // initFormList和formList共用数据源
      if (vendorInfo) {
        vendorInfo.attrValueList = [
          {
            name: templateInfo.vendorCode || '',
            code: templateInfo.vendorCode || '',
          },
        ];
        vendorInfo.defVal = templateInfo.vendorCode || '';
      }
    },
  },
  watch: {
    formList: {
      deep: true,
      immediate: false,
      handler(newVal, oldVal) {
        // console.log(newVal);
      },
    },
    selectedTemplateId: {
      handler(newVal, oldVal) {
        this.setModelInfo();
      },
    },
    resType: {
      handler(newVal, oldVal) {
        this.resType = newVal;
        this.formList = [];
        this.setTapDataList();
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import './hardwareForm.scss';
</style>
