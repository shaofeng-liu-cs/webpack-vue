<template>
  <Popup :popupObj="popup" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
    <template v-slot:popupBody>
      <div>
        <form>
          <div class="input-group">
            <label for="longitude">{{$t('EDN_MOVE_RESOURCE_LONGITUDE')}}</label>
            <input type="text" id="longitude" v-model="position.longitude">
            <span>{{$t('EDN_MOVE_RESOURCE_LONGITUDE_SCOPE')}}</span>
            <br>
          </div>
          <div class="input-group">
            <label for="latitude">{{$t('EDN_MOVE_RESOURCE_LATITUDE')}}</label>
            <input type="text" id="latitude" v-model="position.latitude">
            <span>{{$t('EDN_MOVE_RESOURCE_LATITUDE_SCOPE')}}</span>
          </div>
        </form>
      </div>
    </template>
  </Popup>
</template>

<script>
import { SupportSpatialReferences, Graphic, Point, updateGeometryById, GeometryUtils, getByFeatureLayer, Filter } from 'map';
import { modifyPromise } from '@/oss_core/edesign/osp/domain/ResEventHandler';
import { moveAllGraphic } from '@/oss_core/edesign/api/edit/resId.js';

export default {
  name: 'moveResource',
  inject: ['getHldEl', 'getMapBox', 'getProjectInfo', 'getSchemaConfigs'],
  computed: {
    hldEl() {
      return this.getHldEl();
    },
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
  },
  data() {
    return {
      popup: {
        title: this.$t('MOVE'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CANCEL'), // 取消按钮
        modal: false, //是否遮罩
        el: this.getHldEl(), // 指定插入节点
        show: false, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
        left: '40%',
        top: '5%',
      },
      position: {
        longitude: null, //经度
        latitude: null, //纬度
      },
      resultGraphic: null,
    };
  },
  methods: {
    popupShow(graphic) {
      this.popup.show = true;
      this.resultGraphic = graphic;
      let WGSGeo = graphic.geometry.clone().transferProjection(SupportSpatialReferences.WGS84);
      this.position.longitude = WGSGeo.x.toFixed(6);
      this.position.latitude = WGSGeo.y.toFixed(6);
      this.$root.$on('refresh', this.popupClose);
      this.$root.$on('resourceMoveComplete', this.setPosition);
    },
    popupClose() {
      this.popup.show = false;
      this.afterMoveAction();
      this.$root.$off('refresh', this.popupClose);

      //点地图刷图层
      this.$root.$off('resourceMoveComplete', this.setPosition);
    },
    popupOk() {
      if (!GeometryUtils.checkLongAndLatFormat([this.position.longitude, this.position.latitude])) {
        fish.toast('warn', this.$t('EDN_MOVE_RESOURCE_RULE_WARN'));
        return;
      }
      this.popup.show = false;
      let attribute = Object.assign({}, this.resultGraphic.attributes);
      attribute.longitude = this.position.longitude;
      attribute.latitude = this.position.latitude;
      let tempPoint = new Point(this.position.longitude, this.position.latitude, SupportSpatialReferences.WGS84).transferProjection(
        SupportSpatialReferences.WEB_MERCATOR
      );
      let tempGraphic = new Graphic(this.resultGraphic.id, this.resultGraphic.layerNo, tempPoint, this.resultGraphic.symbol, attribute);
      this.checkBuildingExtend(attribute, tempPoint.geometry).then(extendValidFlag => {
        if (!extendValidFlag && extendValidFlag !== 'ignoreCheck') {
          fish.warn(this.$t('EDN_MOVE_RESOURCE_BUILDING_WARN'));
          return;
        }
        if (attribute.resId) {
          let param = {
            resId: attribute.resId,
            resType: this.resultGraphic.resType,
            gisKey: attribute.gisKey,
            mapNo: this.projectInfo.mapNo,
            schemaId: attribute.schemaId,
            resFlag: 'BOTH',
            resInfo: {
              resSpecId: this.resultGraphic.resType,
              schemaId: attribute.schemaId,
              sprintId: attribute.sprintId,
              projectId: attribute.projectId,
              latitude: attribute.latitude,
              longitude: attribute.longitude,
            },
            gisInfo: {
              wkid: '4326', // point.geometry.spatialReference.wkid
              resType: this.resultGraphic.resType,
              latitude: attribute.latitude,
              longitude: attribute.longitude,
              graphicsAttrs: attribute,
            },
            latitude: attribute.latitude,
            longitude: attribute.longitude,
          };
          moveAllGraphic(param).then(result => {
            this.afterMoveAction(tempGraphic.layerNo);
            this.$parent.$root.$emit('changeAttributes', attribute);
          });
        } else {
          updateGeometryById(tempGraphic.layerNo, tempGraphic.toJSON()).then(res => {
            this.afterMoveAction(tempGraphic.layerNo);
            let stackDepth = this.schemaConfigs.stackDepth;
            this.mapBox.addUndo(modifyPromise(this.mapBox, this.resultGraphic, tempGraphic, 'move'), stackDepth);
            this.$root.$emit('changeUnDoCount', 'undo');
            this.$parent.$root.$emit('changeAttributes', attribute);
          });
        }
      });
    },
    afterMoveAction() {
      this.mapBox.refresh();
      let vm = this.$parent;
      vm.$parent.refreshTree();
      setTimeout(() => {
        this.mapBox.clear();
        vm.$parent.initSelectEvent(false);
      }, 0);
    },

    checkBuildingExtend(attributes, pointGeometry) {
      return new Promise((resolve, reject) => {
        if (!attributes.buildingLayerNo && !attributes.buildingGisId) {
          resolve('ignoreCheck');
          return;
        }
        let filter = Filter.equalTo({ propertyName: 'gisKey', expression: attributes.buildingGisId });
        let feature = {
          layerNo: attributes.buildingLayerNo,
          filter: filter,
        };
        getByFeatureLayer(feature).then(result => {
          if (result && result.length === 1) {
            // 如果是分离的（没相交），返回true，否则返回false
            let disJoinFlag = GeometryUtils.disJoint(result[0].geometry, pointGeometry);
            resolve(!disJoinFlag);
          }
        });
      });
    },
    setPosition(position) {
      this.position = position;
    },
  },
  mounted() {},
  destroyed() {},
  watch: {
    hldEl(val) {
      this.popup.el = val;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './moveResource.scss';
</style>
