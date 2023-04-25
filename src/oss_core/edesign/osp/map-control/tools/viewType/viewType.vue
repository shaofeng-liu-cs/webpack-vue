<template>
  <div class="map-icon-content">
    <Popover placement="bottom" trigger="hover" ref="popover" popClass="gis-tool-popover">
      <div ref="layerTypepoint" class="map-icon icon_osp" :class="selectObj[layerType].class" :title="selectObj[layerType].title" @click="selectObj[layerType].function"></div>
      <ul slot="content" class="v9-popover-ul">
        <li ref="Desgin" @click="resetMapLayerShow" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_DEFULT')">
          <div class="map-icon icon_osp icon_ospdesgin"></div>
        </li>
        <div class="v9-line" v-if="projectInfo.viewType!=='view'"></div>
        <li ref="Topo" v-if="projectInfo.viewType!=='view'" @click="openSchemaResRouteTopo" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_TOPO')">
          <div class="map-icon icon_osp icon_osptuoputu"></div>
        </li>
        <div class="v9-line"></div>
        <li ref="Route" @click="hideMapLayerShow" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_ROUTE')">
          <div class="map-icon icon_osp icon_osproute"></div>
        </li>
        <div class="v9-line" v-if="projectInfo.viewType!=='view'"></div>
        <li ref="Pistil" v-if="projectInfo.viewType!=='view'" @click="openFiberRouteTopo" :title="$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_CORE')">
          <div class="map-icon icon_osp icon_ospxianxinfenpai"></div>
        </li>
      </ul>
    </Popover>
  </div>
</template>

<script>
import { GeometryType } from 'map';

export default {
  name: 'ViewType',
  inject: ['getMapBox', 'getProjectInfo', 'getBaseMapServices'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    baseMapServices() {
      return this.getBaseMapServices() || {};
    },
  },
  data() {
    return {
      selectObj: {
        desgin: { class: 'icon_ospdesgin', title: this.$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_DEFULT'), function: this.resetMapLayerShow },
        topo: { class: 'icon_osptuoputu', title: this.$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_TOPO'), function: this.openSchemaResRouteTopo },
        route: { class: 'icon_osproute', title: this.$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_ROUTE'), function: this.hideMapLayerShow },
        core: { class: 'icon_ospxianxinfenpai', title: this.$t('OSP_MAP_SEARCHBAR_TOOLS_DESGIN_CORE'), function: this.openFiberRouteTopo },
      }, //当前选择的按钮
      layerType: 'desgin', //当前地图类型
      layerShowList: [], //底图显示配置
      buildingLabel: '', //建筑物Label原始配置
      roadLabel: '', //道路Label原始配置
      showLabelObj: {}, //label展示原始配置
    };
  },
  mounted() {},
  methods: {
    resetMapLayerShow() {
      if (this.layerShowList.length) {
        this.baseMapServices.forEach((i, index) => {
          i.layer.visible = this.layerShowList[index];
        });
        let layers = this.mapBox.getLayers();
        layers.forEach(layer => {
          if (layer.id === 'EDESIGN_MAP_HO_BUILDING') {
            layer.labelStyle = this.buildingLabel;
          } else if (layer.id === 'EDESIGN_MAP_HO_ROAD') {
            layer.labelStyle = this.roadLabel;
          }
          if (this.showLabelObj[layer.id]) {
            layer.showLabel = true;
          }
        });
        this.layerShowList = [];
        this.buildingLabel = '';
        this.roadLabel = '';
        this.showLabelObj = {};
        this.$root.$emit('refreshMap');
        // this.mapBox.refresh();
      }
      this.layerType = 'desgin';
      this.$emit('exportShow', false);
    },
    openSchemaResRouteTopo() {
      let menuId = 'SchemaResourceRouteTopo';
      let menuTitle = 'Route Topology -' + this.projectInfo.schemaId;
      let params = {
        choose: 'SchemaResourceRouteTopo',
        lldParams: this.projectInfo,
        isSingleMenu: true,
      };
      this.$emit('exportShow', false);
      // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
      this.$root.$emit('openMenu', menuId, menuTitle, params);
      this.layerType = 'topo';
    },
    hideMapLayerShow() {
      if (!this.layerShowList.length) {
        this.baseMapServices.forEach((i, index) => {
          this.layerShowList.push(i.layer.visible);
          i.layer.visible = false;
        });
        let layers = this.mapBox.getLayers();
        layers.forEach(layer => {
          if (layer.id === 'EDESIGN_MAP_HO_BUILDING') {
            this.buildingLabel = layer.labelStyle;
            layer.labelStyle = 'eDesign:Building_with_export';
          } else if (layer.id === 'EDESIGN_MAP_HO_ROAD') {
            this.roadLabel = layer.labelStyle;
            layer.labelStyle = 'eDesign:Road_with_export';
          }
          if (layer.geometryType === GeometryType.POLYGON) {
            this.showLabelObj[layer.id] = layer.showLabel;
            layer.showLabel = false;
          }
        });
        this.$root.$emit('refreshMap');
        // this.mapBox.refresh();
      }
      this.$emit('exportShow', true);
      this.layerType = 'route';
    },
    openFiberRouteTopo() {
      let menuId = 'FiberRouteTopo';
      let menuTitle = 'Fiber Route Topology -' + this.projectInfo.schemaId;
      let params = {
        choose: 'FiberRouteTopo',
        lldParams: this.projectInfo,
        isSingleMenu: true,
      };
      this.$emit('exportShow', false);
      // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
      this.$root.$emit('openMenu', menuId, menuTitle, params);
      this.layerType = 'core';
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
