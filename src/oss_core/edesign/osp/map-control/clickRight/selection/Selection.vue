<template>
  <Popup :popupObj="popup" class="selection-content" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <div class="selection-tap">
        <ul>
          <li v-for="(item, index) in tapList" :key="index" :class="{ active: index === tapIndex }" @click="tapClick(index)">
            {{ item.resTypeName }} {{ item.num > 1 ? `(${item.num})` : '' }}
          </li>
        </ul>
      </div>
      <div v-for="(item, index) in tapList" v-show="index === tapIndex" :key="index" class="selection-body-cont">
        <div class="selection-body">
          <div v-if="item.soltName" class="selection-left">
            <form :ref="`${item.resType}combobox`">
              <div class="required">
                <label>{{ $t('SELECT_TEMPLATE') }}</label>
                <Combobox :key="index" v-model="item.templateId" :setting="item.selectTemplate" dataRule="required" @change="temChange"></Combobox>
              </div>
            </form>
            <div>
              <component :is="item.soltName" ref="topoTemp" :key="index" v-model="item.templateId"></component>
            </div>
          </div>
          <div class="selection-right">
            <ResForm :ref="item.resType" :num="item.num" :resType="item.resType" :attributes="item.attributes" :row="item.soltName ? 1 : 2" :schemaId="projectInfo.schemaId" @formComplete="formComplete"></ResForm>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
<script>
import ResForm from './resForm/ResForm.vue';
import Cable from '../../../../topo/template/CableTemplateTopo.vue';
import Chassis from '../../../../topo/template/ChassisTemplateTopo.vue';
import Device from '../../../../topo/template/DeviceTemplateTopo.vue';
import Manhole from '../../../../topo/template/ManholeTemplateTopo.vue';
import Pipeline from '../../../../topo/template/PipelineTemplateTopo.vue';
import Pole from '../../../../topo/template/PoleTemplateTopo.vue';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';
import { getResTypeConfig, getSurfaceLayers } from '@/oss_core/edesign/api/query/schema.js';
import { sortByResType } from '@/oss_core/base/utils/util.js';
import { batchAddResources } from '@/oss_core/edesign/api/add/resources.js';
import { queryTemplateInfo, queryResourceInfo } from '@/oss_core/edesign/api/query/resType.js';

export default {
  // import引入的组件
  components: {
    ResForm,
    Cable,
    Chassis,
    Device,
    Manhole,
    Pipeline,
    Pole,
  },
  inject: {
    getProjectInfo: {
      default: () => {}, // 工程详情
    },
    getHldEl: {
      default: () => {},
    },
    getResTypeConfig: {
      default: () => [],
    }, // 获取任务单资源类型列表
    getSurfaceLayerList: {
      default: () => [],
    }, // 获取任务单资源类型列表
  },
  props: {
    schemaId: {
      type: String,
      default: '', // 如果没有传任务单详情 至少需要任务单ID
    },
  },
  data() {
    return {
      // show: false, // 需要在获取到hld节点后才加载
      projectInfo: this.getProjectInfo(),
      resourceList: this.getResTypeConfig(),
      surfaceLayerList: this.getSurfaceLayerList(),
      popup: {
        title: this.$t('OSP_RIGHT_CLICK_SELECTION_TITLE'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CANCEL'), // 取消按钮
        width: '1000', // 宽
        height: '700', // 高
        maxHeight: '80%', //
        maxWidth: '80%', //
        modal: true, // 是否遮罩
        el: this.getHldEl(), // 指定插入节点
        show: false, // 是否展示
        drag: true, // 是否拖拽
        zIndex: 4, // 层级
      },
      tapList: [], // 页签所有数据
      graphicList: [], // 选中的资源
      tapIndex: 0, // 当前页签下标
      refreshTopoList: [], // 已经刷新过的topo图下标
    };
  },
  computed: {
    hldEl() {
      return this.getHldEl();
    },
  },
  watch: {
    hldEl(newVal) {
      this.popup.el = newVal;
    },
  },
  created() {},
  mounted() {
    this.setInitData();
  },
  // 方法集合
  methods: {
    async setInitData() {
      if (this.resourceList.length === 0) {
        const resourceData = await getResTypeConfig(this.projectInfo.sprintId); // 父组件没有传值则请求接口获取数据
        if (resourceData && resourceData.resultList) {
          this.resourceList = resourceData.resultList || [];
        }
      }
      if (this.surfaceLayerList.length === 0) {
        const surfaceLayerData = await getSurfaceLayers();
        if (surfaceLayerData && surfaceLayerData.resultList) {
          this.surfaceLayerList = surfaceLayerData.resultList;
        }
      }
    },
    popupClose() {
      this.popup.show = false;
    },
    popupOk() {
      const param = [];
      let isValid = true;
      this.tapList.some((tap, index) => {
        if (
          !$(this.$refs[tap.resType][0].$el).isValid() ||
          (this.$refs[`${tap.resType}combobox`] && !$(this.$refs[`${tap.resType}combobox`][0]).isValid())
        ) {
          isValid = false;
          this.tapIndex = index;
          fish.toast('warn', this.$t('FORM_ERROR'));
          return true;
        }
        return false;
      });
      if (!isValid) {
        return;
      }
      this.tapList.forEach(tap => {
        tap.graphic.forEach(item => {
          const child = {
            schemaId: this.projectInfo.schemaId,
            sprintId: this.projectInfo.sprintId,
            mapNo: this.projectInfo.mapNo,
            resFlag: 'BOTH',
            action: 'A', // 选型为A，重新选型为R
            resInfo: {},
            gisInfo: {},
            resType: tap.relaResType ? tap.relaResType : tap.resType,
            gisKey: item.attributes.gisKey,
          };

          child.resInfo = Object.assign(child.resInfo, this.$refs[tap.resType][0].formValue); // form内容写入resInfo
          child.gisInfo.graphicsAttrs = this.$refs[tap.resType][0].getAttributes(item.attributes);
          this.$refs[tap.resType][0].attrDtos;
          // console.log(this.$refs[tap.resType][0].attrDtos);
          // console.log(this.$refs[tap.resType][0].formByAttributes);
          const formMapAtrrList = Object.entries(this.$refs[tap.resType][0].formByAttributes);
          formMapAtrrList.forEach(it => {
            child.resInfo[it[0]] = child.gisInfo.graphicsAttrs[it[1]];
          });
          child.gisInfo.resType = item.resType;
          // Object.assign(child.resInfo, formAttributes); // gis信息全部拷贝进参数
          if (item.attributes.resId) {
            // 有就传表示再次选型
            child.resId = item.attributes.resId;
            child.action = 'R';
          } else {
            if (item.attributes.gisLen) {
              child.resInfo.length = item.attributes.gisLen;
              child.gisInfo.length = Number(item.attributes.gisLen);
            }
            const layers = this.resourceList.concat(this.surfaceLayerList);
            if (item.aGraphic) {
              child.resInfo.aResSpecId = layers.find(resource => resource.layerNo === item.aGraphic.layerNo).resType;
              if (child.resInfo.aResSpecId === 'A5') {
                child.resInfo.aResSpecId = 'BUILDING';
              }
              child.resInfo.aGisKey = item.aGraphic.attributes.gisKey;
              child.resInfo.aResId = item.aGraphic.attributes.resId;
              child.gisInfo.aLayerNo = item.aGraphic.attributes.layerNo;
              child.gisInfo.paths = item.geometry.getPaths();
            }
            if (item.zGraphic) {
              child.resInfo.zResSpecId = layers.find(resource => resource.layerNo === item.zGraphic.layerNo).resType;
              if (child.resInfo.zResSpecId === 'A5') {
                child.resInfo.zResSpecId = 'BUILDING';
              }
              child.resInfo.zGisKey = item.zGraphic.attributes.gisKey;
              child.resInfo.zResId = item.zGraphic.attributes.resId;
              child.gisInfo.zLayerNo = item.zGraphic.layerNo;
            }
            child.resInfo.layerNo = item.layerNo;
            child.resInfo.resSpecId = tap.relaResType ? tap.relaResType : tap.resType;
          }

          if (tap.num > 1) {
            delete child.gisInfo.graphicsAttrs.resName;
            delete child.gisInfo.graphicsAttrs.resNo;
          }
          // 点资源新增的话由于固定为经纬度，wkid即为4326
          child.gisInfo.wkid = String(item.geometry.spatialReference.wkid);
          if (child.resInfo.longitude && child.resInfo.latitude) {
            child.resInfo.longitude = Number(Number(child.resInfo.longitude).toFixed(6));
            child.resInfo.latitude = Number(Number(child.resInfo.latitude).toFixed(6));
            child.gisInfo.wkid = '4326';
          }
          param.push(child);
        });
      });
      const noNeedConfirmList = ['C_CABLE', 'F_CABLE', 'SITE', 'AIR_WIRE', 'POLE'];
      const actionR = param.filter(res => res.action === 'R' && noNeedConfirmList.indexOf(res.resType) === -1);
      const secondSelectionFlag = actionR && actionR.length > 0; // 是否二次选型
      if (secondSelectionFlag) {
        fish.confirm(this.$t('OSP_RIGHT_CLICK_RESELECTION_CONTINUE'), () => {
          batchAddResources(param).then(resultList => {
            fish.toast('success', `${this.$t('SAVE_SUCCESS')}!`);
            // this.$emit('afterSelection', resultList); //完成后自己派发一个完成事件
            this.$root.$emit('afterSelection', resultList); // 完成后bus派发一个完成事件，通知信息面板刷新
            this.$root.$emit('refreshMap'); // 完成后通知地图刷新，
            this.popup.show = false;
          });
        });
      } else {
        batchAddResources(param).then(resultList => {
          fish.toast('success', `${this.$t('SAVE_SUCCESS')}!`);
          // this.$emit('afterSelection', resultList); //完成后自己派发一个完成事件
          this.$root.$emit('afterSelection', resultList); // 完成后bus派发一个完成事件，通知信息面板刷新
          this.$root.$emit('refreshMap'); // 完成后通知地图刷新，
          this.popup.show = false;
        });
      }
    },
    formComplete(form) {
      form.setStatus('TEMPLATE_ID', {
        isModifiable: 'N',
      });
    },
    temChange(obj) {
      this.$refs[this.tapList[this.tapIndex].resType][0].formValue.templateId = obj.templateId || '';
    },
    tapClick(index) {
      this.tapIndex = index;
      const template = this.tapList[index].selectTemplate;
      if (template) {
        if (template.length > 0) {
          this.temChange(template[0]);
          this.tapList[index].templateId = template[0].templateId;
        }
        if (this.tapIndex > 0 && this.refreshTopoList.indexOf(this.tapIndex) < 0) {
          this.refreshTopo(); // 多个选型对象位置偏移的问题
        }
      }
    },
    refreshTopo() {
      this.refreshTopoList.push(this.tapIndex);
      this.$refs.topoTemp[this.tapIndex].refreshTopo();
    },
    setGraphicList(newVal) {
      this.refreshTopoList = []; // 已经刷新过的topo图下标
      this.tapList = []; // 页签所有数据
      this.templateId = ''; // 选中的模板ID
      this.tapIndex = 0; // 当前页签下标
      const tapList = [];
      const promiseList = [];
      this.filterGraphicList(newVal).then(() => {
        this.graphicList.forEach(graphic => {
          const resInfo = this.resourceList.find(resource => resource.layerNo === graphic.layerNo);
          graphic.resType = resInfo.resType;
          graphic.relaResType = resInfo.relaResType;
          graphic.resTypeName = resInfo.resTypeName;
          if (tapList.length === 0) {
            tapList.push({
              graphic: [graphic],
              attributes: graphic.attributes,
              resType: graphic.resType,
              relaResType: graphic.relaResType ? graphic.relaResType : '',
              resTypeName: graphic.resTypeName,
              num: 1,
            });
          } else {
            let have = false;
            tapList.some(tap => {
              if (tap.resType === graphic.resType) {
                tap.num += 1;
                tap.graphic.push(graphic);
                have = true;
                return true;
              }
              return false;
            });
            if (!have) {
              tapList.push({
                graphic: [graphic],
                attributes: graphic.attributes,
                resType: graphic.resType,
                relaResType: graphic.relaResType ? graphic.relaResType : '',
                resTypeName: graphic.resTypeName,
                num: 1,
              });
            }
          }
        });
        sortByResType(tapList); // 排序
        tapList.forEach(tap => {
          let hasTemplate = false;
          this.resourceList.some(item => {
            if (item.layerType === 'C' && item.resType === tap.resType) {
              if (item.hasTemplate === 'Y') {
                // 有模板再去找对应的模板组件
                tap.soltName = getTopoTypeByResType(tap.resType);
                hasTemplate = true;
              }
              return true;
            }
            return false;
          });
          promiseList.push(this.setTapDataList(tap, hasTemplate));
        });
        Promise.all(promiseList).then(() => {
          this.tapList = tapList;
        });
      });
    },

    // 过滤不符合选型要求的数据
    async filterGraphicList(newVal) {
      const filterArr = [];
      this.graphicList = [];
      for (let i = 0; i < newVal.length; i += 1) {
        const graphic = newVal[i];
        if (graphic.geometry.geometryType === this.$map.GeometryType.POLYLINE) {
          // 是否绑定了两端
          if (graphic.attributes.aGisKey && graphic.attributes.aLayerNo && graphic.attributes.zGisKey && graphic.attributes.zLayerNo) {
            const aDevice = newVal.find(child => child.attributes.gisKey === graphic.attributes.aGisKey);
            const zDevice = newVal.find(child => child.attributes.gisKey === graphic.attributes.zGisKey);
            // 是否两端已经在选型列表中，在就直接用不需要验证resId如果不在就必须是已经选型的两端（有resId）
            if (aDevice) {
              graphic.aGraphic = aDevice;
            } else {
              const data = await this.$map.getByLayerAndId(graphic.attributes.aLayerNo, graphic.attributes.aGisKey);
              if (data && data.attributes.resId) {
                graphic.aGraphic = data;
              }
            }
            if (zDevice) {
              graphic.zGraphic = zDevice;
            } else {
              const data = await this.$map.getByLayerAndId(graphic.attributes.zLayerNo, graphic.attributes.zGisKey);
              if (data && data.attributes.resId) {
                graphic.zGraphic = data;
              }
            }
            if (graphic.aGraphic && graphic.zGraphic) {
              this.graphicList.push(graphic);
            } else {
              filterArr.push(graphic.attributes.resName);
            }
          } else {
            filterArr.push(graphic.attributes.resName);
          }
        } else {
          this.graphicList.push(graphic);
        }
      }
      if (this.graphicList.length === 0) {
        fish.warn(this.$t('OSP_RIGHT_CLICK_SELECTION_NULL'));
      } else {
        const nameStr = filterArr.join(',');
        if (this.graphicList.length !== newVal.length) {
          fish.confirm(`[${nameStr}] ${this.$t('OSP_RIGHT_CLICK_SELECTION_FILTER')}`).result.then(() => {
            this.popup.show = true;
          });
        } else {
          this.popup.show = true;
        }
      }
    },
    async setTapDataList(tap) {
      const selectTemplate = {
        dataTextField: 'templateName',
        dataValueField: 'templateId',
        dataSource: [],
        value: '',
      };
      const templateData = await queryTemplateInfo(this.projectInfo.sprintId, tap.resType); // 模板数据
      if (templateData && templateData.resultList && templateData.resultList.length !== 0) {
        let imResInfo = {};
        if (tap.attributes.resId) {
          const data = await queryResourceInfo({ resId: tap.attributes.resId, resType: tap.resType });
          if (data && data.resultList) {
            imResInfo = data.resultList[0];
            if (imResInfo.cfgTemplateId) {
              imResInfo.templateId = imResInfo.cfgTemplateId;
            }
          }
        }
        selectTemplate.dataSource = templateData.resultList;
        selectTemplate.value = imResInfo.templateId || templateData.resultList[0].templateId;
        tap.selectTemplate = selectTemplate;
        tap.templateId = selectTemplate.value;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './Selection.scss';
</style>
