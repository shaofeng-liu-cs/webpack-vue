<template>
  <div class="topo-content">
    <TopoView ref="cableTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick"></TopoView>
  </div>
</template>
<script>
import TopoView from '@/oss_core/edesign/topo/topo-template/TopoView.vue';
import { drawCableGraphics } from './DrawCableTools';
import { getStateColor } from '@/oss_core/base/utils/ResourcesConfig.js';
import { loadResStatue } from '@/oss_core/edesign/topo/TopoHandleAction.js';
export default {
  name: 'cableTopo',
  components: {
    TopoView,
  },
  props: {
    resId: {
      type: String,
      default: '',
    },
    resData: Object,
    params: Object,
  },
  model: {
    prop: 'resId',
    event: 'input',
  },
  data() {
    return {
      dataModel: null,
      graphView: this.graphView,
      toolButtons: [
        {
          id: 'showColorMap',
          name: this.$t('BTN_SHOWCOLORMAP'),
          image: 'oss_core/edesign/assets/image/topo-tool-bar/showColor.png',
          title: this.$t('BTN_SHOWCOLORMAP'),
          event: 'showColorMap',
        },
        {
          id: 'showStateMap',
          name: this.$t('BTN_SHOWSTATEMAP'),
          image: 'oss_core/edesign/assets/image/topo-tool-bar/showStateMap.png',
          title: this.$t('BTN_SHOWSTATEMAP'),
          event: 'showStateMap',
        },
      ],
      stateList: [],
      showColorFlag: true,
      showStateFlag: true,
      occupancyRate: '0.00%',
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc((elem) => elem.movable);

    this.graphView.addInteractorListener((e) => {
      if (e.kind === 'betweenMove') {
        //拖拽
        //this.redrawEdgeWhenMoveNode();
      }
    });

    this.graphView.getView().addEventListener('click', (e) => {
      let data = this.graphView.getDataAt(e);
      if (data) {
        console.info(data);
      }
    });
  },
  mounted() {
    this.loadTopo();
  },
  methods: {
    loadTopo() {
      if (this.dataModel) {
        this.dataModel.clear();
      }
      this.graphView.setZoom(1);
      this.graphView.setTranslateX(0);
      this.graphView.setTranslateY(0);
      let cableSize = 320;
      let space = 320;
      let cableId = this.resId;
      let schemaId = this.resData.schemaId;
      let deviceId = '';
      let promises = [];
      let cableParam = {
        resSpecId: 'PORT',
        type: '2',
        state: '',
      };

      let p0 = drawCableGraphics(schemaId, cableId, deviceId, this.dataModel, 200, 100, cableSize);
      let p1 = loadResStatue(cableParam);
      Promise.all([p0, p1]).then((datas) => {
        this.stateList = datas[1].resultList || [];
        this.setStateColor();
      });
    },

    setStateColor() {
      this.stateList.forEach((item) => {
        item.color = getStateColor(item.state);
      });
      this.showStatePanel();
    },

    showStatePanel() {
      if (this.stateList.length > 0) {
        let occupancyRate = this.totalOccuRate();
        let statePanel = {
          name: 'State Diagram',
          baseSpecId: 'STATE_PANEL',
        };
        let posX = 950;
        let posY = 100;
        let panelHeight = this.stateList.length * 20;
        let panelWidth = 150;
        let node = new ht.Node();
        node.setName(statePanel.name);
        node.setPosition(posX, posY + panelHeight / 2);
        node.setSize(panelWidth, panelHeight);
        node.setStyle('shape', 'rect');
        node.setStyle('shape.background', '#F4F4F4');
        node.setStyle('shape.border.color', '#8B8989');
        node.setStyle('shape.border.width', 2);
        node.setStyle('shape.dash', true);
        node.setStyle('shape.dash.pattern', [2000]);
        node.setStyle('shape.dash.color', '#FFD306');
        node.setStyle('shape.dash.width', 1);
        node.setStyle('label.position', 3);
        node.setStyle('label.offset.y', -10);
        //node.setStyle('select.color', 'red');
        //node.setStyle('select.type', 'shadow');
        //node.setStyle('shadow.offset.x', 0);
        //node.setStyle('shadow.offset.y', 0);
        //node.setStyle('shadow.blur', 5);
        //node.setStyle('shadow.color', 'red');

        node.setStyle('label.font', '12px Tahoma');
        node.setStyle('label.scale', 1.5);
        node.movable = false;
        node.setAttrObject(statePanel);
        this.dataModel.add(node);
        let stateMapSize = 10;
        let colorX = node.getPosition().x + 20 - panelWidth / 2;
        let colorY = node.getPosition().y - panelHeight / 2;

        for (let i = 0; i < this.stateList.length; i++) {
          let state = this.stateList[i];
          state.baseSpecId = 'STATE_PANEL';
          let posY = colorY + i * (stateMapSize + 10) + 10;
          let stateNode = new ht.Node();
          stateNode.setAttrObject(state);
          stateNode.setName(state.stateDesc);
          stateNode.setLayer('Layer3');
          stateNode.setPosition(colorX, posY);
          stateNode.setSize(stateMapSize, stateMapSize);
          stateNode.setStyle('shape', 'circle');
          stateNode.setStyle('vector.shape', 'circle');
          stateNode.setStyle('shape.border.width', 1);
          stateNode.setStyle('shape.background', state.color);
          stateNode.setStyle('shape.border.color', state.color);
          stateNode.setStyle('label.font', '12px Tahoma');
          //coreNode.setStyle("label.position", CORE_LABEL_POSITION);
          stateNode.setStyle('select.color', 'red');
          stateNode.setStyle('select.type', 'shadow');
          stateNode.setStyle('shadow.offset.x', 0);
          stateNode.setStyle('shadow.offset.y', 0);
          //coreNode.setStyle('shadow.blur', 2);
          stateNode.setStyle('shadow.color', 'red');
          stateNode.setStyle('label.position', 20);
          stateNode.setStyle('label.offset.x', 10);
          stateNode.setParent(node);
          stateNode.setHost(node);
          this.dataModel.add(stateNode);
        }

        let rateNode = new ht.Node();
        let item1 = {
          baseSpecId: 'STATE_PANEL',
        };
        rateNode.setAttrObject(item1);
        rateNode.setAttr('baseSpecId', 'STATE_PANEL');
        rateNode.setLayer('Layer3');
        rateNode.setName(this.$t('OCCUPANCY_RATE') + ': ' + occupancyRate);
        rateNode.setStyle('label.font', '12px Tahoma');
        rateNode.setStyle('label.position', 20);
        rateNode.setStyle('label.offset.x', 0);
        rateNode.setPosition(colorX - 10, colorY + panelHeight + 10);
        rateNode.setSize(0, 0);
        this.dataModel.add(rateNode);
      }
    },

    totalOccuRate() {
      let occupancyState = 0;
      let nodeList = this.dataModel.getDatas()._as;
      let coreList = nodeList.filter((node) => node.getAttrObject().baseSpecId === 'CABLE_UNIT');
      coreList.forEach((core) => {
        if (core.getAttrObject().serviceState != '6') {
          occupancyState++;
        }
      });
      let maxSeq = coreList.length;
      let rateVal = (occupancyState / maxSeq) * 100;
      return rateVal.toFixed(2) + '%';
    },

    //色彩panel
    showColorMap() {
      this.dataModel.getDatas().each((node) => {
        let baseSpecId = node.getAttrObject().baseSpecId || '';
        if (baseSpecId === 'COLOR_PANEL') {
          node.setStyle('2d.visible', !this.showColorFlag);
        }
      });
      this.showColorFlag = !this.showColorFlag;
    },

    showStateMap() {
      this.dataModel.getDatas().each((node) => {
        let baseSpecId = node.getAttrObject().baseSpecId || '';
        if (baseSpecId === 'STATE_PANEL') {
          node.setStyle('2d.visible', !this.showStateFlag);
        }
      });
      this.showStateFlag = !this.showStateFlag;
    },

    initMenus(selectedDatas) {
      let menus = [];
      return menus;
    },
    toolbarClick(eventName) {
      console.info(eventName);

      if (eventName === 'refresh') {
        this.loadTopo();
      } else if (eventName === 'showColorMap') {
        this.showColorMap();
      } else if (eventName === 'showStateMap') {
        this.showStateMap();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import '@/oss_core/edesign/topo/topo-template/scss/topoTemplate.scss';
</style>