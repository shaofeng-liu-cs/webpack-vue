<template>
  <Popup :popupObj="popup" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <div class="content-label-title">{{ $t('LAYER') }}:</div>
      <div class="select-popup">
        <el-scrollbar>
          <el-radio-group v-model="targetLayer" class="radio-select">
            <el-radio :label="item.layerNo" v-for="item in targetLayersObj" :key="item.layerNo">{{ item.layerName }}</el-radio>
          </el-radio-group>
        </el-scrollbar>
      </div>
    </template>
  </Popup>
</template>
<script>
import { Graphic } from 'map';
import { copyActionList, copyResource } from '../../../domain/ResEventHandler.js';
import { getBaseResAttr } from '@/oss_core/base/utils/ResourcesConfig.js';
export default {
  name: 'CopyGeoSingle',
  inject: ['getMapBox', 'getSurfaceLayerList', 'getResourceList', 'getAttrActionConfig'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList() || [];
    },
    resourceList() {
      return this.getResourceList() || [];
    },
    attrActionConfig() {
      return this.getAttrActionConfig() || {};
    },
  },
  props: {
    functionData: {},

    dataInfo: {},

    projectInfo: {},
  },
  model: {},
  data() {
    return {
      targetLayer: '',
      popup: {
        title: this.$t('SELECTION'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CANCEL'), // 取消按钮
        width: '400', // 宽
        height: 'auto', // 高
        maxHeight: '400px', //
        modal: true, //是否遮罩
        el: '', // 指定插入节点
        show: false, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
      action: 'copy',
    };
  },
  mounted() {},
  created() {},
  //方法集合
  methods: {
    popupShow(el) {
      this.popup.show = true;
      this.popup.el = el;
      this.popup.title = this.$t('COPY');
      this.popup.ok = this.$t('OK');
      this.popup.close = this.$t('CANCEL');
      this.action = 'copy';
      this.initTargetLayer();
    },
    initTargetLayer() {
      // 初始化单选框的选项，要过滤掉选中的资源类型，以及只显示相同geometryType的资源
      this._targetLayers = this.resourceList
        .filter(res => res.layerType === 'C' && res.layerNo !== 'ROUTE-C')
        .map(resLayer => {
          let findRes = this.mapBox.findLayer(resLayer.layerNo);
          if (findRes) {
            resLayer.geometryType = findRes.geometryType;
          }
          resLayer.schemaControl = true;
          return resLayer;
        });
      this.srcCloudGraphic = this.dataInfo.CloudGraphic;
      this.targetLayersObj = this._targetLayers.filter(
        res => res.layerNo !== this.srcCloudGraphic.LayerNo && res.geometryType === this.srcCloudGraphic.geometry.geometryType
      );
    },
    popupClose() {},
    popupOk() {
      if (!this.targetLayer) {
        fish.toast('warn', this.$t('OSP_MAP_FUNCTION_MSG_SELECT_LAYER'));
        return;
      }
      let dstlayerObj = this.targetLayersObj.find(res => res.layerNo === this.targetLayer);
      // 获得复制的属性列表
      let copyActList = copyActionList(this.attrActionConfig, this.srcCloudGraphic.resType, dstlayerObj.resType);
      // 获得基础的属性
      let baseAttr = getBaseResAttr(this.srcCloudGraphic.geometry, this.projectInfo);
      if (copyActList.length > 0) {
        copyResource(copyActList, this.srcCloudGraphic.attributes, baseAttr);
      }
      let newGraphic = new Graphic('', this.targetLayer, this.srcCloudGraphic.geometry.clone(), null, baseAttr);
      this.$map.addGeometry(this.targetLayer, newGraphic).then(
        result => {
          if (result) {
            let editGra = result.toJSON();
            let findeRes = this.targetLayersObj.find(res => res.layerNo === this.targetLayer);
            editGra.attributes.resName = findeRes.layerName + '-' + editGra.attributes.objectid;
            editGra.attributes.resNo = findeRes.layerName + '-' + editGra.attributes.objectid;
            this.$map.updateGeometryById(editGra.layerNo, editGra).then(
              response => {
                this.mapBox.refreshLayer(this.targetLayer);
                fish.toast('success', this.$t('OSP_MAP_FUNCTION_MSG_COPY_LAYER'));
                this.popup.show = false;
              },
              error => {}
            );
          } else {
          }
        },
        e => {}
      );
    },
  },
};
</script>
<style lang="scss" scoped></style>
