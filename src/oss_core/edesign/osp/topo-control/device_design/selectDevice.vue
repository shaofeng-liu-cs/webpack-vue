<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content" v-if="show">
        <template v-slot:popupBody>
            <div class="selection-tap">
                <ul>
                    <li class="action">{{addResData.resTypeName}}</li>
                </ul>
            </div>
            <div class="selection-body-cont">
                <div class="selection-body">
                    <div class="selection-left">
                        <form ref="templateId">
                            <div class="required">
                                <label>{{$t('SELECT_TEMPLATE')}}</label>
                                <Combobox v-model="addResData.templateId" :setting="selectTemplate" @change="tempChange" dataRule="required"></Combobox>
                            </div>
                        </form>
                        <div>
                            <component :is="addResData.soltName" v-model="templateId" ref="tempTopo"></component>
                        </div>
                    </div>
                    <div class="selection-right">
                        <div class="input-content row" style="padding-left:5px;padding-top:10px;padding-right:5px;padding-bottom:10px;">
                            <form class="form-group" ref="fromAddNum">
                                <label class="label-control required-label">Number</label>
                                <div>
                                    <input type="text" class="form-control" v-model="addcount" name="optAddCount" ref="optAddCount" data-rule="required;integer;range[1~];" />
                                </div>
                            </form>
                        </div>
                        <ResForm :num="num" :resType="addResData.resType" :row='addResData.soltName ? 1 : 2' v-model="addResData.formList" :ref="addResData.resType" :schemaId="schemaId" @formComplete="formComplete" :designerType="designerType"></ResForm>
                        <!-- <ResFormDesign :num="num" :resType="addResData.resType" :attributes="addResData.attributes" :row='addResData.soltName ? 1 : 2' v-model="addResData.formList" :ref="addResData.resType"></ResFormDesign> -->
                    </div>
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import ResForm from '../../map-control/clickRight/selection/resForm/ResForm.vue'; // './resForm/ResForm.vue';
import Cable from '../../../topo/template/CableTemplateTopo.vue';
import Chassis from '../../../topo/template/ChassisTemplateTopo.vue';
import Device from '../../../topo/template/DeviceTemplateTopo.vue';
import Manhole from '../../../topo/template/ManholeTemplateTopo.vue';
import Pipeline from '../../../topo/template/PipelineTemplateTopo.vue';
import Pole from '../../../topo/template/PoleTemplateTopo.vue';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';
import { getResTypeConfig, getSurfaceLayers, getTaskDetail } from '@/oss_core/edesign/api/query/schema.js';
import { batchAddResources } from '@/oss_core/edesign/api/add/resources.js';
import { queryTemplateInfo } from '@/oss_core/edesign/api/query/resType.js';

export default {
  components: {
    ResForm,
    Cable,
    Chassis,
    Device,
    Manhole,
    Pipeline,
    Pole,
  },
  props: {
	params:Object,
    schemaId: {
      type: String,
      default: '', // 如果没有传任务单详情 至少需要任务单ID
    },
  },
  inject: ['getDeviceDesignEl', 'getProjectInfo'], // 加载的组件位置
  computed: {
    deviceDesignEl() {
      return this.getDeviceDesignEl();
    },
  },
  data() {
    return {
      show: false, // 需要在获取到节点后才加载
      projectInfo: this.getProjectInfo(),
      resourceList: [],
      surfaceLayerList: [],
      templateId: '',
      selectTemplate: {
        dataTextField: 'templateName',
        dataValueField: 'templateId',
        dataSource: [],
        value: '',
      }, //template信息
      num: 1,
      addcount: 1,
      addResData: { resType: '', resTypeName: '', soltName: '', templateId: '' }, //增加资源信息；
      parentRes: {}, //父资源信息；
      // resData:{resType:"SPLITTER",resTypeName:"Splitter",soltName:"Device",templateId:"",formList:[],attributes:{}},
      CompPopuTopo: {
        title: 'Select Model', // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CLOSE'), // 取消按钮
        width: '1000', // 宽
        height: '650', // 高
        maxHeight: '80%', //
        maxWidth: '80%', //
        modal: true, //是否遮罩
        body: false, // 是否插入body
        show: false, //是否展示
        drag: true, //是否拖拽
        el: this.deviceDesignEl,
        zIndex: 4, //层级
      },
      designerType: 'add',
    };
  },
  mounted() {
    if (this.schemaId) {
      this.setInitData();
    }
  },
  created() {},
  //方法集合
  methods: {
    async setInitData() {
      console.log(this.projectInfo);
      if (!this.projectInfo || !this.projectInfo.sprintId || Object.keys(this.projectInfo).length === 0) {
        let data = await getTaskDetail(this.schemaId); //任务单详情
        if (data && data.resultList && data.resultList.length > 0) {
          this.projectInfo = data.resultList[0] || {};
        }
      }
      let resourceData = await getResTypeConfig(this.projectInfo.sprintId);
      if (resourceData && resourceData.resultList) {
        this.resourceList = resourceData.resultList || [];
      }

      let surfaceLayerData = await getSurfaceLayers();
      if (surfaceLayerData && surfaceLayerData.resultList) {
        this.surfaceLayerList = surfaceLayerData.resultList;
      }
    },

    setResData(addingRes, parentRes) {
      this.addResData = addingRes;
      this.parentRes = parentRes;
      if (parentRes.resType === 'BUILDING') {
        this.designerType = 'building';
      }
      console.log(this.parentRes);
      this.addResData.templateId = '';
      this.addResData.relaResType = '';
      this.getResource(this.addResData.resType);
      this.setTemplate(this.addResData.resType);
    },

    getResource(resType) {
      this.addResData.soltName = getTopoTypeByResType(resType);

      let resInfo = this.resourceList.filter(item => item.resType === resType && item.layerType === 'C');
      if (resInfo.length > 0) {
        this.addResData.resTypeName = resInfo[0].resTypeName;
        this.addResData.layerNo = resInfo[0].layerNo;
      } else {
        this.addResData.resTypeName = resType;
      }
    },

    popupClose() {
      this.clearSelectData();
      this.show = false;
      this.$emit('refreshClose');
    },
    popupOk() {
      if (!$(this.$refs[this.addResData.resType].$el).isValid() || !$(this.$refs.fromAddNum).isValid() || !$(this.$refs.templateId).isValid()) {
        fish.toast('warn', this.$t('FORM_ERROR'));
        return;
      }
      let param = [];
      let count = Number(this.addcount);
      let resFlag = this.addResData.resFlag || 'BOTH';
      let templateInfo = this.selectTemplate.dataSource.filter(temChild => temChild.templateId === this.addResData.templateId);
      let child = {
        resFlag: resFlag, //INV:资源 /GIS: gis /BOTH:两者都
        resInfo: {},
        action: 'A',
      };
      child.resType = this.addResData.resType;
      child.gisKey = '';
      child.resInfo.templateId = this.addResData.templateId;
      child.resInfo.vendorId = templateInfo[0].vendorCode;
      if (templateInfo[0].splitRatio) {
        //splitRatio为SPLITTER选型参数
        child.resInfo.splitRatio = templateInfo[0].splitRatio;
      }

      child.resInfo.resSpecId = this.addResData.resType;
      child.resInfo.schemaId = this.projectInfo.schemaId;
      child.resInfo.sprintId = this.projectInfo.sprintId;
      child.resInfo.projectId = this.projectInfo.projectId;
      child.resInfo.layerNo = this.addResData.layerNo;
      child.resInfo.placeResId = this.parentRes.resId;
      child.resInfo.placeResType = this.parentRes.resType;
      let formObj = $(this.$refs[this.addResData.resType].$el).form('value');
      Object.assign(child.resInfo, this.addResData, formObj);
      // delete child.resInfo.attrDtos;
      // delete child.resInfo.attributes;
      // delete child.resInfo.formList;
      for (let i = 0; i < count; i++) {
        let newChild = JSON.parse(JSON.stringify(child));
        if (i > 0) {
          newChild.resInfo.name = newChild.resInfo.name + '-' + i;
          if (newChild.resInfo.fullName) {
            newChild.resInfo.fullName = newChild.resInfo.fullName + '-' + i;
          }
        }
        newChild.mapNo = this.projectInfo.mapNo;
        param.push(newChild);
      }
      console.info('param: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.info(param);
      batchAddResources(param).then(resultList => {
        this.clearSelectData();
        this.$emit('refreshEvent', resultList);
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        this.show = false;
      });
    },

    setTemplate(resType) {
      queryTemplateInfo(this.projectInfo.sprintId, resType).then(templateData => {
        if (templateData && templateData.resultList && templateData.resultList.length !== 0) {
          this.selectTemplate.dataSource = templateData.resultList;
          this.selectTemplate.value = templateData.resultList[0].templateId;
          this.templateId = templateData.resultList[0].templateId;
          this.addResData.templateId = this.templateId;
        }
      }); // 模板数据
    },

    formComplete(form) {
      form.setStatus('TEMPLATE_ID', { isModifiable: 'N' });
      form.setStatus('MODEL_ID', { isModifiable: 'N' });
      if (this.addResData.resType === 'F_CABLE') {
        let objA = this.setCableAZ('A_DEVICE_ID');
        form.setStatus('A_DEVICE_ID', objA);
        let objZ = this.setCableAZ('Z_DEVICE_ID');
        form.setStatus('Z_DEVICE_ID', objZ);
        if (this.addResData.longitude) {
          form.setStatus('LENGTH', { isModifiable: 'N', defVal: this.addResData.length || 100 });
        }
      }

      if (this.addResData.siteId) {
        let siteObj = this.setSite();
        form.setStatus('SITE_ID', siteObj);
      }

      if (this.addResData.areaId) {
        let areaObj = this.setArea();
        form.setStatus('AREA_ID', areaObj);
      }

      if (this.parentRes.resType === 'SITE') {
        let roomObj = this.setRoom();
        form.setStatus('ROOM_ID', roomObj);
      }

      if (this.addResData.longitude) {
        form.setStatus('LONGITUDE', { isModifiable: 'N', defVal: this.addResData.longitude });
      }

      if (this.addResData.latitude) {
        form.setStatus('LATITUDE', { isModifiable: 'N', defVal: this.addResData.latitude });
      }
    },
    setSite() {
      let siteId = this.addResData.siteId || '';
      let siteName = this.addResData.siteName || '';
      let attrValueList = [{ code: siteId, name: siteName }];
      let obj = {
        defVal: siteId,
        isMandatory: 'N',
        isModifiable: 'N',
        displayStyle: 'ComboBox',
        attrValueList: attrValueList,
      };
      return obj;
    },
    setArea() {
      let areaId = this.addResData.areaId || '';
      let obj = {
        defVal: areaId + '',
        isMandatory: 'N',
        isModifiable: 'N',
        displayStyle: 'URL',
      };
      return obj;
    },
    setRoom() {
      let attrValueList = [{ code: this.addResData.roomId, name: this.addResData.roomName }];
      let obj = {
        defVal: this.addResData.roomId,
        isMandatory: 'N',
        isModifiable: 'N',
        displayStyle: 'ComboBox',
        attrValueList: attrValueList,
      };
      return obj;
    },

    setCableAZ(attrCode) {
      let defVal = '';
      let attrBeanName = '';
      let attrValueList = [];
      if (attrCode === 'A_DEVICE_ID' || attrCode === 'A_FACILITY_ID') {
        defVal = this.addResData.aDeviceId;
        attrBeanName = 'aDevcieId';
        attrValueList = [{ name: this.addResData.aDeviceName || '', code: this.addResData.aDeviceId || '' }];
      } else if (attrCode === 'Z_DEVICE_ID' || attrCode === 'Z_FACILITY_ID') {
        defVal = this.addResData.zDeviceId;
        attrBeanName = 'zDevcieId';
        attrValueList = [{ name: this.addResData.zDeviceName || '', code: this.addResData.zDeviceId || '' }];
      }
      let obj = {
        defVal: defVal,
        isMandatory: 'N',
        isModifiable: 'N',
        displayStyle: 'ComboBox',
        attrValueList: attrValueList,
      };

      return obj;
    },

    tempChange(obj) {
      this.$refs[this.addResData.resType].formValue.templateId = obj.templateId || '';
      this.addResData.templateId = obj.templateId;
      this.templateId = obj.templateId;
    },
    clearSelectData() {
      this.selectTemplate.dataSource = [];
      this.selectTemplate.value = '';
      this.templateId = '';
      this.addResData.templateId = '';
      this.addcount = 1;
    },
  },
  watch: {
    deviceDesignEl(newVal, oldVal) {
      this.show = true;
      this.CompPopuTopo.el = newVal;
    },
    schemaId(newVal, oldVal) {
      this.setInitData();
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/ .form-group div {
  height: 35px;
}
.required-label:before {
  content: '*';
  color: #fb6e52;
  vertical-align: middle;
  margin-right: 3px;
  line-height: 1;
}
.label-control {
  font-weight: normal;
}
</style>

<style lang="scss"  scoped>
@import '../scss/Selection.scss';
</style>