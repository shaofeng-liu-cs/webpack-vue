<template>
    <Popup :popupObj="roomPopu" @popupClose="popupClose" @popupOk="popupOk" class="selection-content" v-if="show">
        <template v-slot:popupBody>
            <!-- <div class="selection-tap">
                <ul>
                    <li class="action">{{addResData.resTypeName}}</li>
                </ul>
            </div> -->
            <div class="selection-body-cont">
                <div class="selection-body">
                    <div class="selection-right">
                        <div class="input-content row" style="padding-left:5px;padding-top:5px;padding-right:5px;padding-bottom:5px;">
                            <form class="form-group" ref="fromAddNum">
                                <label class="label-control required-label">Number</label>
                                <div><input type="number" class="form-control" v-model="addcount" name="optAddCount" ref="optAddCount" data-rule="required;integer;range[1~];" /></div>
                            </form>
                        </div>
                        <ResForm :resType="addResData.resType" :attributes="addResData.attributes" :row='2' v-model="addResData.formList" :ref="addResData.resType" :schemaId="schemaId" @formComplete="formComplete"></ResForm>
                    </div>
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import ResForm from '../../map-control/clickRight/selection/resForm/ResForm.vue';
import { getResTypeConfig, getSurfaceLayers } from '@/oss_core/edesign/api/query/schema.js';
import { batchAddResources } from '@/oss_core/edesign/api/add/resources.js';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig';

export default {
  components: {
    ResForm,
  },
  props: {
    schemaId: {
      type: String,
      default: '', // 如果没有传任务单详情 至少需要任务单ID
    },
  },
  inject: ['getDesignEl', 'getProjectInfo'], // 加载的组件位置
  computed: {
    designEl() {
      return this.getDesignEl();
    },
  },
  data() {
    return {
      show: false, // 需要在获取到节点后才加载
      projectInfo: this.getProjectInfo(),
      resourceList: [],
      surfaceLayerList: [],
      addcount: 1,
      addResData: { resType: '', resTypeName: '', soltName: '' }, //增加资源信息；
      parentRes: {}, //父资源信息；
      roomPopu: {
        title: 'Create Room', // 标题
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
        el: this.designEl,
        zIndex: 4, //层级
      },
    };
  },
  mounted() {
    if (this.schemaId) {
      this.setInitData();
    }
  },
  created() {
    console.log(this.designEl);
  },

  //方法集合
  methods: {
    async setInitData() {
      let resourceData = await getResTypeConfig(this.projectInfo.sprintId);
      if (resourceData && resourceData.resultList) {
        this.resourceList = resourceData.resultList || [];
      }

      let surfaceLayerData = await getSurfaceLayers();
      if (surfaceLayerData && surfaceLayerData.resultList) {
        this.surfaceLayerList = surfaceLayerData.resultList;
      }
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

    setResData(addingRes, parentRes) {
      this.addResData = addingRes;
      this.parentRes = parentRes;
      this.addcount = 1;
      this.addResData.formList = [];
      this.addResData.attributes = {};
      this.addResData.relaResType = '';

      this.getResource(this.addResData.resType);
    },
    popupClose() {
      this.show = false;
      this.$emit('refreshClose');
    },
    formComplete(form) {
      if (this.addResData.areaId) {
        let areaObj = this.setArea();
        form.setStatus('AREA_ID', areaObj);
      }
      if (this.addResData.siteId) {
        let siteObj = this.setSite();
        form.setStatus('SITE_ID', siteObj);
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
    popupOk() {
      if (!$(this.$refs[this.addResData.resType].$el).isValid() || !$(this.$refs.fromAddNum).isValid() || !$(this.$refs.templateId).isValid()) {
        fish.toast('warn', this.$t('FORM_ERROR'));
        return;
      }
      let param = [];
      let count = this.addcount;
      let child = {
        resInfo: {},
      };
      child.resFlag = 'INV';
      child.resType = this.addResData.resType;
      child.gisKey = '';
      child.resInfo.resSpecId = this.addResData.resType;
      child.resInfo.schemaId = this.projectInfo.schemaId;
      child.resInfo.sprintId = this.projectInfo.sprintId;
      child.resInfo.projectId = this.projectInfo.projectId;
      child.resInfo.layerNo = this.addResData.layerNo;
      child.resInfo.placeResId = this.parentRes.resId;
      child.resInfo.placeResType = this.parentRes.resType;
      let formObj = $(this.$refs[this.addResData.resType].$el).form('value');
      Object.assign(child.resInfo, this.addResData, formObj);
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
      batchAddResources(param).then(resultList => {
        this.$emit('refreshEvent', resultList);
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        this.show = false;
      });
    },
  },
  watch: {
    designEl(newVal, oldVal) {
      this.show = true;
      this.roomPopu.el = newVal;
    },
    schemaId(newVal, oldVal) {
      this.setInitData();
    },
  },
};
</script>

<style lang="scss"  scoped>
@import '../scss/CreateRoom.scss';
</style>