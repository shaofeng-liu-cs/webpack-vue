<template>
  <Popup :popupObj="popupObj">
    <template v-slot:popupBody>
      <div v-if="showRestype==='resource'" class="quick-input-content">
        <div v-for="(attr, index) in attrInfoList" :key="index + attr.attrName" :style="{ order: attr.dispSeq }">
          <label :title="attr.attrDesc">{{ attr.attrDesc }}</label>
          <input class="form-control" :value="attr.initValue" :name="attr.attrName" :placeholder="attr.controlFlag === '2' ? '' : 'Please input content'" v-if="attr.controlType === '1'" :type="attr.dataType === 'N' ? 'number' : 'text'" @blur="blur($event,attr)" :disabled="attr.disabled" />
          <Combobox :name="attr.attrName" :setting="{ dataTextField: 'valueDesc', dataValueField: 'attrValue', dataSource: attr.attrValuesDTOS, value: attr.initValue}" v-else-if="attr.controlType === '3'" @change="attrChange($event,attr)" :disabled="attr.disabled"></Combobox>
        </div>
      </div>
      <el-form v-else ref="form" :model="formData" size="mini">
        <el-form-item :label="$t('NEW_RESOURCE_STYLE_TYPE')">
          <el-select v-model="formData.style" :placeholder="$t('PLEASE_SELECT')" @change="changeStyle">
            <el-option v-for="item in styleOptions" :key="item.markId" :label="item.markName" :value="item.markId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('NEW_RESOURCE_LABEL_CONTENT')">
          <el-input v-model="formData.label" @change="changeLabel"></el-input>
        </el-form-item>
      </el-form>
    </template>
  </Popup>
</template>
<script>
import { queryAttrDtosInfo } from '@/oss_core/edesign/api/query/resType.js';
import { queryMakerStyle } from '@/oss_core/edesign/api/query/layerNo.js';
import { checkAttr } from '@/oss_core/base/utils/util.js';

export default {
  name: 'QuickInput',
  inject: ['getMapBox', 'getResTypeAttrDtos', 'getHldEl'],
  data() {
    return {
      popupObj: {
        title: this.$t('NEW_RESOURCE_QUICK_INPUT'), // 弹框标题
        ok: '', // 确认按钮内容
        close: '', // 取消按钮内容
        modal: false, // 是否蒙层
        width: '200px',
        height: 'auto',
        top: '40px',
        right: '410px',
        body: false, // 是否插入body
        el: this.getHldEl(), // 指定插入节点
        show: false, // 是否展示
        drag: true, // 是否拖拽
        zIndex: 4, // 层级
      },
      attrInfoList: [], // 所有快速录入字段的详细信息
      styleList: [],
      showRestype: 'resource', // 默认展示资源的快速录入
      styleOptions: [], // 风格类型
      formData: {
        style: '',
        label: '',
      },
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    resTypeAttrDtos() {
      return this.getResTypeAttrDtos();
    },
  },
  mounted() {},
  methods: {
    // 根据资源类型查询每个类型下需要展示的信息
    async queryAttrInfo(resType, attributes) {
      let normalData = this.resTypeAttrDtos[resType];
      if (!normalData) {
        const attrDtosInfo = await queryAttrDtosInfo(resType);
        this.resTypeAttrDtos[resType] = attrDtosInfo.attrDTOS || [];
      }
      normalData = JSON.parse(JSON.stringify(this.resTypeAttrDtos[resType])); // 深度拷贝下
      this.attrInfoList = normalData.filter(item => item.quickInputFlag === 'Y');
      this.attrInfoList.forEach(attr => {
        const value = attributes[attr.attrName];
        if (value) {
          attr.initValue = value;
          attr.disabled = true;
        }
      });
      this.popupObj.show = this.attrInfoList.length > 0;
    },
    async queryStyle(layerNo, actionType, graphic) {
      this.actionType = actionType;
      this.selectedGraphic = graphic;
      if (actionType === 'edit') {
        this.formData = {
          style: graphic.attributes.markId,
          label: graphic.attributes.label,
        };
      } else {
        this.formData = {
          style: '',
          label: '',
        };
      }
      let applyType;
      if (layerNo === 'EDESIGN_MAP_MARKER_POINT') {
        applyType = 'POINT';
      } else if (layerNo === 'EDESIGN_MAP_MARKER_LINE') {
        applyType = 'LINE';
      } else {
        applyType = 'GRID';
      }
      let normalData = this.styleList[layerNo];
      if (!normalData) {
        const resData = await queryMakerStyle(applyType);
        console.log(resData);
        this.styleList[layerNo] = resData.data || [];
      }
      normalData = JSON.parse(JSON.stringify(this.styleList[layerNo]));
      this.styleOptions = normalData;
      this.popupObj.show = true;
    },
    blur(e, attr) {
      let { value } = e.target;
      if (value) {
        const checkAttrResult = checkAttr(value, attr);
        if (!checkAttrResult) {
          e.preventDefault();
          e.target.value = '';
          value = '';
        }
      }
      this.$emit('attrChange', attr.attrName, value);
    },
    attrChange(item, attr) {
      console.log(attr);
      const value = item.attrValue || '';
      this.$emit('attrChange', attr.attrName, value);
    },
    changeLabel(value) {
      if (this.actionType === 'edit') {
        const obj = this.styleOptions.find(item => item.markId === this.selectedGraphic.attributes.markId);
        const markStyle = JSON.parse(obj.markStyle);
        this.selectedGraphic.attributes = Object.assign(this.selectedGraphic.attributes, { label: value, style: markStyle });
        this.$map.editAttributeById(this.selectedGraphic.layerNo, this.selectedGraphic).then(() => {
          this.mapBox.refreshLayer(this.selectedGraphic.layerNo);
        });
      } else {
        this.$emit('attrChange', 'label', value);
      }
    },
    changeStyle(val) {
      const obj = this.styleOptions.find(item => item.markId === val);
      const markStyle = JSON.parse(obj.markStyle);
      if (this.actionType === 'edit') {
        this.selectedGraphic.attributes = Object.assign(this.selectedGraphic.attributes, { style: markStyle, markId: val });
        this.$map.editAttributeById(this.selectedGraphic.layerNo, this.selectedGraphic).then(() => {
          this.mapBox.refreshLayer(this.selectedGraphic.layerNo);
        });
      } else {
        this.$emit('attrChange', 'markId', val);
        this.$emit('attrChange', 'style', markStyle);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './quickInput.scss';
</style>
