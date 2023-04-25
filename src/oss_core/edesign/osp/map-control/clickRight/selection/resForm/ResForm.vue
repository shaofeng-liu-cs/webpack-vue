<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-11-11 14:09:20
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\clickRight\selection\resForm\ResForm.vue
-->
<template>
  <form ref="form" class="form-horizontal res-form-style">
    <Panel v-for="(items, indexs) in formList" :key="indexs" :panelFooter="false">
      <template v-slot:title> {{ mapTitle(items.name) }} </template>
      <template v-slot:body>
        <div v-for="item in items.childData.filter(child => child.isDisplay === 'Y')" :key="item.attrId" class="input-content" :class="`res-form-${row}`">
          <div :class="{ required: item.isMandatory === 'Y' }">
            <label class="required-label">{{ item.attrName }}</label>
            <div :class="item.displayStyle === 'URL' || item.attrCode === 'FULL_NAME' || item.attrCode === 'NAME' ? 'popedit input-group' : ''">
              <input v-if="item.displayStyle === 'TextEdit'" v-model="formValue[item.attrBeanName]" :name="item.attrBeanName" :disabled="item.isModifiable === 'N'" :data-rule="(item.isMandatory === 'Y' ? 'required;' : '') + (item.dataRuleString ? item.dataRuleString : '')" class="form-control" />
              <Popedit v-else-if="item.displayStyle === 'URL'" class="form-control" :value="popeditValue[item.attrBeanName]" :name="item.attrBeanName" :url="item.url" :disabled="item.isModifiable === 'N'" :dataRule="item.isMandatory === 'Y' ? 'required' : ''" :initialData="item.initialData || {}" @popeditChange="popeditChange"></Popedit>
              <Combobox v-else-if="item.displayStyle === 'ComboBox'" v-model="formValue[item.attrBeanName]" :name="item.attrBeanName" :setting="{ dataSource: item.attrValueList, value: item.defVal }" :disabled="item.isModifiable === 'N'" :dataRule="item.isMandatory === 'Y' ? 'required' : ''"></Combobox>
              <DatetimePicker v-else-if="item.displayStyle === 'DatePick'" v-model="formValue[item.attrBeanName]" :name="item.attrBeanName" :dataRule="item.isMandatory === 'Y' ? 'required' : ''" :disabled="item.isModifiable === 'N'"></DatetimePicker>
              <span v-if="item.attrCode === 'FULL_NAME' || item.attrCode === 'NAME'" class="input-group-addon" tabindex="0" @click="autoName(item.attrCode)"><span class="glyphicon glyphicon-new-window"></span></span>
            </div>
          </div>
        </div>
      </template>
    </Panel>
  </form>
</template>
<script>
import { getRoomInfosBySites } from '@/oss_core/edesign/api/query/site.js';
import { getTaskDetail, querySiteBySchemaId, getResTypeConfig } from '@/oss_core/edesign/api/query/schema.js';
import { queryResTypeInfo, queryTemplateInfo, queryAttrDtosInfo, getObjNaming, queryResourceInfo } from '@/oss_core/edesign/api/query/resType.js';
import { getAllManagedRestypesWithGeometryType } from '@/oss_core/base/utils/ResourcesConfig.js';

export default {
  inject: {
    getProjectInfo: {
      default: () => {}, // 工程详情
    },
  },
  props: {
    row: {
      type: Number,
      default: 1,
    },
    resType: {
      type: String,
      default: '',
    },
    attributes: {
      type: Object,
      default: () => ({}),
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
    designerType: {
      type: String,
      default: '', // building建筑物内部设计
    },
  },
  data() {
    return {
      projectInfo: this.getProjectInfo(), // 工程详细信息
      templateList: [], // 模板数据
      siteList: [], // 任务单下站点数据
      attrDtos: [], // gis和form关联数据attrDTOS数据
      initFormList: [], // 一开始从后台拿到的form数据
      formList: [], // 重新分组后的form数据
      isSetTemplate: false, // 是否设置过模板
      roomList: [], // 机房信息
      formByAttributes: {}, // attributes在formValue上映射关系 key为formValue上的key,value为attributes上的key
      // formByAttributes: {}, // 过滤后的映射关系
      formValue: {
        resSpecId: this.resType,
        schemaId: this.schemaId,
      }, // form的值
      cityList: [], // 城市信息
      popeditValue: {}, // 存放popedit值，比较麻烦需要特殊存放
      imResInfo: {}, //
      geometryType: '', // 资源的点线面类型
      hideAttrList: [], // 需要隐藏的属性节点列表
    };
  },
  // 生命周期挂载完成（可以访问DOM元素）
  mounted() {
    this.setInitData();
    this.formValue.sprintId = this.projectInfo.sprintId;
    this.formValue.projectId = this.projectInfo.sprintId;
    this.cityList = [
      {
        name: this.projectInfo.regionName,
        code: this.projectInfo.regionId,
      },
    ];
    this.setTapDataList().then(form => {
      this.$emit('formComplete', form);
    });
    this.num > 1 && this.getGeometryType();
  },
  // 方法集合
  methods: {
    async setInitData() {
      if (Object.keys(this.projectInfo).length === 0) {
        const data = await getTaskDetail(this.schemaId); // 任务单详情
        if (data && data.resultList && data.resultList.length > 0) {
          this.projectInfo = data.resultList[0] || {};
        }
      }
    },

    async setTapDataList() {
      let imResInfo = {};
      const urlObj = {};
      const setFormWatchList = [];
      if (this.attributes.resId) {
        const data = await queryResourceInfo({ resId: this.attributes.resId, resType: this.resType });
        if (data && data.resultList) {
          imResInfo = data.resultList[0];
          if (imResInfo.cfgTemplateId) {
            imResInfo.templateId = imResInfo.cfgTemplateId;
          }
        }
      }
      this.imResInfo = imResInfo;
      let hasTemplate; // 是否有模板
      const resourceData = await getResTypeConfig(this.projectInfo.sprintId);
      if (resourceData && resourceData.resultList) {
        const resourceInfo = resourceData.resultList.find(resource => resource.resType === this.resType && resource.layerType === 'C');
        if (resourceInfo) {
          hasTemplate = resourceInfo.hasTemplate === 'Y';
        }
      }
      const attrinfo = await queryAttrDtosInfo(this.resType); // gis和form关联数据attrDTOS数据
      if (attrinfo && attrinfo.attrDTOS && attrinfo.attrDTOS.length !== 0) {
        this.attrDtos = attrinfo.attrDTOS.filter(item => item.resAttrCode);

        // 如果没传attributes信息则在这里组装一次
        if (fish.isEmpty(this.attributes)) {
          attrinfo.attrDTOS.forEach(item => {
            let attrVal = item.initValue;
            if (item.attrName === 'sprintId') {
              attrVal = this.projectInfo.sprintId || '';
            } else if (item.attrName === 'schemaId') {
              attrVal = this.projectInfo.schemaId || '';
            } else if (item.attrName === 'areaId') {
              attrVal = this.projectInfo.areaId || '';
            } else if (item.attrName === 'cityId') {
              attrVal = this.projectInfo.regionId || '';
            }
            this.attributes[item.attrName] = attrVal;
          });
        }
      }
      const formData = await queryResTypeInfo(this.projectInfo.schemaId, this.resType); // 表单数据
      if (formData && formData.resultList && formData.resultList.length !== 0) {
        formData.resultList.forEach(item => {
          if (this.hideAttrList.indexOf(item.attrCode) === -1) {
            this.initFormList.push(item);
          }
          this.setFormByAttributes(item);
        });
      }
      const hasSite = this.initFormList.find(result => result.attrCode === 'SITE_ID'); // 是否有站点
      const hasRoom = this.initFormList.find(result => result.attrCode === 'ROOM_ID'); // 是否有机房
      const hasARes = this.initFormList.find(result => result.attrCode === 'A_FACILITY_ID' || result.attrCode === 'A_DEVICE_ID'); // 是否有A端
      const hasZRes = this.initFormList.find(result => result.attrCode === 'Z_FACILITY_ID' || result.attrCode === 'Z_DEVICE_ID'); // 是否有Z端
      if (hasTemplate) {
        const templateData = await queryTemplateInfo(this.projectInfo.sprintId, this.resType); // 模板数据
        if (templateData && templateData.resultList && templateData.resultList.length !== 0) {
          this.templateList = templateData.resultList;
        }
      }
      if (!!hasSite) {
        hasSite.attrValueList = (await querySiteBySchemaId(this.schemaId)) || [];
        if (hasSite.attrValueList.length === 1 && this.action !== 'view') {
          hasSite.defVal = hasSite.attrValueList[0].code; // 只有一个站点则设置为选中
        }
      }
      if (this.designerType === 'building' && !!hasRoom) {
        hasRoom.isModifiable = 'N'; // 建筑物内部选型暂时机房不可编辑
      }
      if (!!hasSite && !!hasRoom && hasSite.attrValueList.length > 0) {
        hasRoom.attrValueList = [];
        const siteIds = hasSite.attrValueList.map(site => site.code);
        const roomList = await getRoomInfosBySites(siteIds); // 根据站点查询机房
        if (roomList && roomList.length > 0) {
          this.roomList = roomList;
          roomList.forEach(room => {
            hasRoom.attrValueList.push(...room.relaCombox);
          });
        }
      }
      if (hasARes) {
        hasARes.displayStyle = 'ComboBox';
        hasARes.isModifiable = 'N';
        if (this.attributes && this.attributes.aGisKey) {
          await this.setAz(hasARes, this.attributes.aLayerNo, this.attributes.aGisKey);
        }
      }
      if (hasZRes) {
        hasZRes.displayStyle = 'ComboBox';
        hasZRes.isModifiable = 'N';
        if (this.attributes && this.attributes.aGisKey) {
          await this.setAz(hasZRes, this.attributes.zLayerNo, this.attributes.zGisKey);
        }
      }
      this.initFormList.forEach(result => {
        if (this.action === 'view') {
          result.isModifiable = 'N';
        }
        if (result.attrCode === 'CITY_ID') {
          if (this.projectInfo.regionId) {
            result.defVal = this.projectInfo.regionId;
            result.isModifiable = 'N';
          }
          result.attrValueList = this.cityList;
        } else if (result.attrCode === 'AREA_ID') {
          result.initialData = {
            areaID: this.projectInfo.regionId,
            areaName: this.projectInfo.regionName,
          };
        } else if (result.attrCode === 'TEMPLATE_ID') {
          result.isMandatory = 'Y';
          result.displayStyle = 'ComboBox';
          result.isModifiable = 'N';
          if (this.templateList.length > 0) {
            this.setTemplate(result);
          } else if (!result.attrValueList) {
            result.attrValueList = [];
          }
        } else if (result.attrCode === 'MODEL_ID') {
          result.isModifiable = 'N';
        } else if (result.attrCode === 'LATITUDE' || result.attrCode === 'LONGITUDE') {
          result.isModifiable = 'N';
        } else if (result.attrCode === 'NAME' || result.attrCode === 'FULL_NAME') {
          result.isMandatory = 'N'; // 写死为非必填
        }

        if (this.num > 1) {
          this.formValue[result.attrBeanName] = result.defVal || ''; // 回填表单信息
        } else {
          if (result.displayStyle === 'URL') {
            urlObj[result.attrBeanName] = {
              name: imResInfo[`${result.attrBeanName}Desc`] || '',
              code: imResInfo[result.attrBeanName] || '',
            };
          }
          this.formValue[result.attrBeanName] = imResInfo[result.attrBeanName] || result.defVal || ''; // 回填表单信息
        }
        setFormWatchList.push({ key: result.attrBeanName, type: result.displayStyle });
      });
      if (this.templateList.length > 0 && !this.isSetTemplate) {
        const obj = {
          attrCode: 'TEMPLATE_ID',
          attrName: 'Template',
          groupId: 'RES.BAS',
          defVal: '',
          isMandatory: 'Y',
          isDisplay: 'Y',
          isModifiable: 'N',
          columnName: 'TEMPLATE_ID',
          displayStyle: 'ComboBox',
          attrBeanName: 'templateId',
          attrValueList: [],
        };
        this.initFormList.push(obj);
        this.setTemplate(obj);
        this.formValue.templateId = obj.defVal;
        setFormWatchList.push({ key: obj.attrBeanName, type: obj.displayStyle });
      }
      this.popeditValue = Object.assign({}, urlObj);
      if (this.action === 'edit') {
        this.formValue = Object.assign({}, this.formValue, imResInfo); // 合并所有信息,编辑才需要
      } else {
        this.formValue = Object.assign({}, this.formValue);
      }
      // todo 这里需要读取后台查询出的模板价格
      this.formValue.price = this.formValue.price ? this.formValue.price : 0;
      if (this.resType !== 'SITE') {
        this.initFormList.unshift({
          attrCode: 'PRICE',
          attrName: 'Price',
          groupId: 'RES.BAS',
          defVal: '0',
          isMandatory: 'N',
          isDisplay: 'Y',
          isModifiable: 'Y',
          columnName: 'PRICE',
          displayStyle: 'TextEdit',
          attrBeanName: 'price',
          dataRuleString: 'float;',
        });
      }

      this.getResource(this.initFormList, this.formList);
      setFormWatchList.forEach(item => {
        this.setFormWatch(item.key, item.type);
      });

      return this;
    },

    // 设置映射关系
    setFormByAttributes(result) {
      this.attrDtos.some(item => {
        if (result.attrCode === item.resAttrCode) {
          if (result.precision && this.attributes[result.precision]) {
            this.setAttributes(item.attrName, result.precision);
          }
          result.defVal = this.attributes[item.attrName];
          this.formByAttributes[result.attrBeanName] = item.attrName;
          return true;
        }
        return false;
      });
    },

    // 添加formValue值的监听并定义回调函数
    setFormWatch(key, type) {
      const immediate = key !== 'cityId'; // cityId第一次不需要联动，联动的话会清空areaId的初始化
      this.$watch(
        `formValue.${key}`,
        function (newVal, oldVal) {
          this.formValueChange({ newVal, oldVal, key, type });
        },
        {
          immediate,
        },
      );
    },

    mapTitle(name) {
      if (name === 'RES.BAS') {
        return this.$t('MAP_CON_FUNC_BASIC');
      }
      if (name === 'RES.EXT') {
        return this.$t('MAP_CON_FUNC_EXTENSION');
      }
      return name;
    },

    // city联动area
    cityChange() {
      this.formValue.areaId = '';
      const areaInfo = this.initFormList.find(item => item.attrCode === 'AREA_ID');
      if (this.formValue.cityId !== '') {
        const cityInfo = this.cityList.find(item => item.code === Number(this.formValue.cityId));
        // 重置popedit参数
        if (areaInfo) {
          areaInfo.initialData = {
            areaID: cityInfo.code,
            areaName: cityInfo.name,
          };
        }
      } else if (areaInfo) {
        areaInfo.initialData = {
          areaID: '',
          areaName: '',
        };
      }
    },
    // 自动命名
    autoName(attrCode) {
      getObjNaming(this.resType).then(data => {
        const curKey = attrCode === 'NAME' ? 'name' : 'fullName';
        const otherKey = attrCode === 'NAME' ? 'fullName' : 'name';
        this.formValue[curKey] = data.name;
        this.formValue[otherKey] = this.formValue[otherKey] ? this.formValue[otherKey] : data.name;
      });
    },

    setAttributes(key, precision) {
      // 数值精度调整 precision小数点后几位
      if (key === 'longitude' || key === 'latitude') {
        this.attributes[key] = Number(Number(this.attributes[key]).toFixed(6));
      } else {
        const oldStr = this.attributes[key].toString();
        let filterCount = oldStr.indexOf('.') > -1 ? parseInt(precision, 10) + 1 : parseInt(precision, 10);
        if (oldStr.indexOf('-') > -1) {
          filterCount += 1;
        }
        this.attributes[key] = Number(oldStr.substring(0, filterCount));
      }
    },

    // 设置线资源AZ端数据
    async setAz(result, layerNo, gisKey) {
      const data = await this.$map.getByLayerAndId(layerNo, gisKey);
      result.attrValueList = [
        {
          name: data.attributes.resName || '',
          code: data.attributes.resId || '',
        },
      ];
      result.defVal = data.attributes.resId || '';
    },

    // form数据按组分类
    getResource(resData, formList) {
      if (resData.length > 0) {
        const name = resData[0].groupId;
        const childData = resData.filter(item => item.groupId === name);
        const gridDataChild = {
          name,
          childData,
        };
        formList.push(gridDataChild);
        const newResData = resData.filter(item => item.groupId !== name);
        this.getResource(newResData, formList);
      }
    },

    // popedit改变
    popeditChange(obj) {
      if (obj.data) {
        this.formValue[obj.name] = obj.data.value || obj.data.code || '';
      } else {
        this.formValue[obj.name] = '';
      }
    },

    // 设置模板
    setTemplate(result) {
      this.isSetTemplate = true;
      result.attrValueList = this.templateList.map(item => ({
        name: item.templateName,
        code: item.templateId,
      }));

      result.defVal = this.imResInfo.templateId || this.templateList[0].templateId;
    },
    // 模板联动和设置模板信息
    templateChange() {
      const templateInfo = this.templateList.find(temChild => temChild.templateId === this.formValue.templateId) || {};
      this.formValue.cfgTemplateId = templateInfo.confTemplateId || '';
      this.formValue.modelId = templateInfo.modelId || '';
      this.formValue.modelIdDesc = templateInfo.modelName || '';
      this.formValue.templateIdDesc = templateInfo.templateName || '';
      this.formValue.vendorId = templateInfo.vendorCode || '';
      this.formValue.splitRatio = templateInfo.splitRatio || '';
      const modelInfo = this.initFormList.find(item => item.attrCode === 'MODEL_ID'); // initFormList和formList共用数据源
      if (modelInfo) {
        modelInfo.attrValueList = [
          {
            name: templateInfo.modelName || '',
            code: templateInfo.modelId || '',
          },
        ];
        modelInfo.defVal = templateInfo.modelId || '';
      }
    },

    // 站点联动机房
    siteChange() {
      const roomInfo = this.initFormList.find(item => item.attrCode === 'ROOM_ID'); // initFormList和formList共用数据源
      if (roomInfo) {
        const nowRoomInfo = this.roomList.find(room => room.code === this.formValue.siteId);
        if (nowRoomInfo) {
          roomInfo.attrValueList = nowRoomInfo.relaCombox;
          if (roomInfo.attrValueList.length === 1 && this.designerType !== 'building') {
            this.formValue.roomId = roomInfo.attrValueList[0].code; // 建筑物内部选型暂时机房不需要默认值
          }
        }
      }
    },

    // 机房联动站点
    roomChange() {
      this.roomList.some(room => {
        const roomInfo = room.relaCombox.find(item => item.code === this.formValue.roomId);
        if (roomInfo) {
          this.formValue.siteId = room.code;
          return true;
        }
        return false;
      });
    },

    // 设置initFormList的原始值
    setStatus(attrCode, obj) {
      this.initFormList.some(result => {
        if (result.attrCode === attrCode) {
          const newResult = Object.assign(result, obj);
          this.formValue[newResult.attrBeanName] = newResult.defVal; // 设置后对formValue赋值
          if (obj.displayStyle === 'URL' && newResult.attrValueList) {
            const valueObj = newResult.attrValueList.find(item => item.code === obj.defVal);
            if (valueObj) {
              this.popeditValue[newResult.attrBeanName] = valueObj;
            }
          }
          return true;
        }
        return false;
      });
    },

    // 获取attributes最新数据
    getAttributes(attributes = Object.assign({}, this.attributes)) {
      const formMapAtrrList = Object.entries(this.formByAttributes);
      formMapAtrrList.forEach(item => {
        if (this.formValue[item[0]]) {
          attributes[item[1]] = this.formValue[item[0]];
        }
      });
      return attributes;
    },
    // 获取点线面
    getGeometryType() {
      this.geometryType = getAllManagedRestypesWithGeometryType().find(item => item.RES_TYPE === this.resType).GEOMETRY_TYPE;
      if (this.geometryType === 'geometryPoint') {
        this.hideAttrList = ['FULL_NAME', 'NAME', 'LATITUDE', 'LONGITUDE'];
      } else if (this.geometryType === 'geometryMultipolyline') {
        this.hideAttrList = ['FULL_NAME', 'NAME', 'A_DEVICE_ID', 'Z_DEVICE_ID', 'LENGTH', 'LATITUDE', 'LONGITUDE'];
      }
    },
    // 监听form值的变化的回调
    formValueChange(obj) {
      if (obj.type === 'URL' && obj.newVal === '') {
        this.popeditValue[obj.key] = {
          name: '',
          value: '',
        };
      }
      switch (obj.key) {
        case 'templateId':
          this.templateChange();
          break;
        case 'siteId':
          this.siteChange();
          break;
        case 'roomId':
          this.roomChange();
          break;
        case 'cityId':
          this.cityChange();
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './resForm.scss';
</style>
