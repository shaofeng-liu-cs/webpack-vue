<template>
  <div class="topo-content">
    <TopoView
      ref="pipelineDesignTopo"
      :show-toolbar="true"
      :graphView="graphView"
      :menu-source="initMenus"
      @click-toolbar="toolbarClick"
      :pipeCloseCallBack="closeDrawer"
    ></TopoView>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import { saveTopo, getGisGraphic } from '../TopoUtil';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { drawDuctGraphics, drawPipeLineGraphics } from './DrawTools';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const INNER_RES_TYPES = ['F_CABLE'];

export default {
  name: 'PipelineDesignTopo',
  components: {
    TopoView,
  },
  provide() {
    return {
      getDeviceDesignEl: () => this.$el, //节点
    };
  },
  inject: [],
  props: {
    params: Object,
  },
  computed: {},
  data() {
    return {
      nodeInfo: null,
      isAdding: false, //绘制状态标准
      addingObject: null, //当前绘制对象
      tempObjects: [], //绘制过程中的一些临时对象
      xPos: 450, //TOPO起始X
      yPos: 100, //TOPO起始Y
      pSize: 400,
      graphic: null,
      manholeInfo: null,
      schemaId: '',
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc(elem => elem.movable);

    this.graphView.addInteractorListener(e => {
      if (e.kind === 'betweenMove') {
        //拖拽
        this.redrawOuterCableWhenMoveDevice();
      } else if (e.kind === 'clickData') {
        //点击Node
        this.clickNode(e.data);
        this.showPipePanel(e.data);
      }
      if (e.kind === 'clickBackground') {
        this.closeDrawer();
      }
    });

    this.graphView.getView().addEventListener('mousemove', e => {
      if (this.isAdding && this.addingObject) {
        let p = this.graphView.lp(e);
        // 新增光缆
        if (this.addingObject.getAttr('resType') === GlobalConst.RES_TYPE_F_CABLE || this.addingObject.getAttr('resType') === 'BIND_CABLE') {
          if (this.addingObject.getTarget()) {
            this.addingObject.getTarget().setPosition(p.x, p.y);
          }
        } else {
          // 新增设备
          this.addingObject.setPosition(p.x, p.y);
          if (!this.dataModel.contains(this.addingObject)) {
            this.dataModel.add(this.addingObject);
          }
        }
      }
    });

    // window.addEventListener('click', e => {
    //     this.dataModel.getSelectionModel().clearSelection();
    //     let data = this.graphView.getDataAt(e);
    //     if (data) {
    //         this.showPipePanel(data);
    //         this.dataModel.getSelectionModel().appendSelection(this.nodeInfo);
    //     }
    // });
  },
  mounted() {
    this.loadTopo();
  },
  beforeDestroy() {
    if (this.topoId) {
      saveTopo(this.schemaId, this.topoId, this.dataModel);
    }
  },

  methods: {
    loadTopo() {
      if (this.dataModel) {
        this.dataModel.clear();
      }
      this.topoId = 'DUCT-DESIGN' + this.params.resId;
      this.resId = this.params.resId;
      this.resType = this.params.resType;
      this.schemaId = this.params.schemaId;

      let ps1;
      if ('PIPELINE_B' == this.resType) {
        ps1 = this.loadPipeLineStructure([this.resId]);
      } else {
        ps1 = this.loadTrenchStructure([this.resId]);
      }

      let ps2 = getGisGraphic(GlobalConst.RES_TYPE_DUCT, this.resId, this.params.mapNo, this.params.schemaId);
      // let drawTools = new DrawTools();

      Promise.all([ps1, ps2]).then(result => {
        let ducts = result[0].resultList;
        console.log(result[1]);

        ducts.forEach(data => {
          let x = this.xPos + this.pSize / 2;
          let y = this.yPos + this.pSize / 2;
          if ('PIPELINE_B' == this.resType) {
            drawPipeLineGraphics(data, this.dataModel, this.pSize, x, y, GlobalConst.LABEL_POSITION_BOTTOM);
          } else {
            drawDuctGraphics(data, this.dataModel, this.pSize, x, y, GlobalConst.LABEL_POSITION_BOTTOM);
          }
        });

        this.graphView.fitContent();
      });
    },

    loadSectionStructure(ductIds) {
      return new Promise((resolve, reject) => {
        fish.post({
          url: `edesign/rivt/facilitysection/query/pipelinebyids/v1`,
          data: ductIds,
          success: result => {
            resolve(result);
          },
          error: reject,
        });
      });
    },

    loadTrenchStructure(ductIds) {
      return new Promise((resolve, reject) => {
        fish.post({
          url: `edesign/rivt/facilitysection/query/trenchbyids/v1`,
          data: ductIds,
          success: result => {
            resolve(result);
          },
          error: reject,
        });
      });
    },

    loadPipeLineStructure(ductIds) {
      return new Promise((resolve, reject) => {
        fish.post({
          url: `edesign/rivt/facilitysection/query/pipebyids/v1`,
          data: ductIds,
          success: result => {
            resolve(result);
          },
          error: reject,
        });
      });
    },

    redrawOuterCableWhenMoveDevice() {
      let node = this.dataModel.getSelectionModel().getFirstData();
      if (node) {
        let edges = this.dataModel
          .getSelectionModel()
          .getFirstData()
          .getEdges();
        edges &&
          edges.each(edge => {
            if (edge.getAttr('isOuterCableEdge')) {
              let points = edge.getStyle('edge.points')._as;
              points[1].y = node.getPosition().y;
              edge.setStyle('edge.points', points);
            }
          });
      }
    },

    initMenus(datas) {
      let menus = [];
      return menus;
    },

    clickNode(node) {},

    showPipePanel(current) {
      let isClickNode = false;
      if (
        current.getAttrObject().resSpecId === 'PIPELINE_G' ||
        current.getAttrObject().resSpecId === 'PIPELINE_B' ||
        current.getAttrObject().resSpecId === 'PIPELINE' ||
        current.getAttrObject().resSpecId === 'F_CABLE'
      ) {
        if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
          this.$refs.pipelineDesignTopo.$refs.pipePanel.setData(current, this.schemaId);
        }
        this.nodeInfo = current;
        this.$refs.pipelineDesignTopo.pipeDrawer = true;
        isClickNode = true;
      }
      if (!isClickNode) {
        this.$refs.pipelineDesignTopo.pipeDrawer = false;
        this.nodeInfo = null;
      }
    },

    closeDrawer() {
      this.$refs.pipelineDesignTopo.pipeDrawer = false;
      this.nodeInfo = null;
    },

    toolbarClick(eventName) {
      if (eventName === 'refresh') {
        this.loadTopo();
      }
    },

    saveAndRefreshTopo() {
      if (this.graphView) {
        this.graphView.setZoom(1);
        this.graphView.setTranslateX(0);
        this.graphView.setTranslateY(0);
        // 切换前保存
        if (this.dataModel.getDatas().size() !== 0) {
          saveTopo(this.schemaId, this.topoId, this.dataModel);
          this.dataModel.clear();
        }
      }
      this.loadTopo();
    },
    refreshSize() {
      this.graphView.setZoom(1);
      this.graphView.setTranslateY(1);
    },
  },
  watch: {
    params: {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.saveAndRefreshTopo();
      },
    },
  },
};
</script>

<style>
@import '../topo-template/scss/topoTemplate.scss';
</style>
