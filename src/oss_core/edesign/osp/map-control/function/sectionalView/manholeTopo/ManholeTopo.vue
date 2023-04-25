<template>
  <div class="topo-content">
    <TopoView ref="manholeTopo" :show-toolbar="true" :menu-source="initMenus" :graphView="graphView"> </TopoView>
  </div>
</template>
<script>
import TopoView from '@/oss_core/edesign/topo/topo-template/TopoView.vue';
import { queryResInfo, loadPipelineData } from '@/oss_core/edesign/topo/TopoHandleAction';
import { getGisGraphic } from '@/oss_core/edesign/topo/TopoUtil';
import * as GlobalConst from '@/oss_core/base/utils/GlobalConst';
import { drawDuctGraphics } from '@/oss_core/edesign/topo/design/DrawTools';
import { queryPointRelaResInfo } from '@/oss_core/edesign/api/query/resId.js';
const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const ROUTE_LABEL_FONT = '14px Tahoma';
const CABLE_BORDER_WIDTH = 2;
const maxRate = 0.6;

const INNER_RES_TYPES = [];
const ROUTE_FACILITY_SIZE = { width: 200, height: 200 };
const ROUTE_LINE_SIZE = { width: 250, height: 50 };
const ROUTE_BRIDGE_SIZE = { width: 10, height: 120 };
const PIPELINE_GROUP_SIZE = { width: 420, height: 420 };
export default {
  name: 'ManholeTopo',
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
    schemaId: {
      type: String,
      default: '',
    },
    mapNo: {
      type: String,
      default: '',
    },
  },
  model: {
    prop: 'resId',
    event: 'input',
  },
  data() {
    return {
      xPos: 370, //TOPO起始X
      yPos: 320, //TOPO起始Y
      pSize: 300,
      manholeInfo: null,
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
      }
    });
  },
  mounted() {
    this.loadTopoList(this.resId);
  },
  methods: {
    loadTopoList(resId) {
      let arrPipelineIds = resId.split(',');
      let param = {
        resId: this.resId,
        resType: 'MANHOLE',
        mapNo: this.mapNo,
        // todo 没有schemaId
        schemaId: this.resData.schemaId,
      };
      let p1 = queryPointRelaResInfo(param);
      let p2 = queryResInfo('MANHOLE', this.resId);

      Promise.all([p1, p2]).then((datas) => {
        let innerResList = datas[0].innerResList || [];
        let cableList = datas[0].cableList || [];
        let logicCableList = datas[0].logicCableList || [];
        let sectionResList = datas[0].sectionResList || [];

        this.manholeInfo = datas[1].resultList[0];
        // 展开图
        this.drawMHExpandView();

        // 管道
        if (sectionResList.length != 0) {
          let ductIds = sectionResList.map((section) => section.resId);
          let ps1 = loadPipelineData(ductIds);

          Promise.all([ps1]).then((result) => {
            let ducts = result[0].resultList;
            let direction = 0;
            ducts.forEach((data) => {
              let sideInfo = this.getSideByDirection(direction);
              drawDuctGraphics(data, this.dataModel, this.pSize, sideInfo.x, sideInfo.y);
              direction++;
            });
          });

          this.drawOuterCable(cableList, logicCableList);
        }

        //指北针
        this.drawCompass();

        this.graphView.fitContent();
      });
    },

    drawOuterCable(cableList, logicCableList) {
      // 光缆数据
      cableList.forEach((cable) => {
        let resType = cable.resType;
        let resId = cable.resId;

        let isAEnd = false;
        let isZEnd = false;
        let aResId = cable.aResId;
        if (this.dataModel.getDataByTag(aResId) != null || aResId == this.params.resId) {
          //光缆的A端等于人井内的设备或者等于人井

          let node = this.drawOuterCablePoint(cable, 'A');
          this.drawOuterCableToInnerDevice(node, aResId, 'A');
          isAEnd = true;
        }

        let zResId = cable.zResId;
        if (this.dataModel.getDataByTag(zResId) != null || zResId == this.params.resId) {
          //光缆的Z端等于人井内的设备或者等于人井
          let node = this.drawOuterCablePoint(cable, 'Z');
          this.drawOuterCableToInnerDevice(node, zResId, 'Z');
          isZEnd = true;
        }

        let isThrough = !isAEnd && !isZEnd;
        let isRing = isAEnd && isZEnd;
        // 直通
        if (isThrough) {
          this.drawOuterCablePoint(cable, 'A', isThrough);
          this.drawOuterCablePoint(cable, 'Z', isThrough);
        }
        // 环内部设计中不会掏接
        if (!isRing) {
          this.drawThroughCable(cable, logicCableList, isAEnd, isZEnd);
        }
      });
    },

    drawOuterCablePoint(data, azEnd, isThrough) {
      let x;
      let y;
      if (azEnd === 'A') {
        let index = this.aOuterCableIndex || 0;
        x = this.xPos + this.pSize + 350;
        y = this.yPos + index * 40;
        this.aOuterCableIndex = index + 1;
      } else {
        let index = this.zOuterCableIndex || 0;
        x = this.xPos - 350;
        y = this.yPos + index * 40;
        this.zOuterCableIndex = index + 1;
      }
      let resName = data.resName;
      let node = new ht.Node();
      node.setLayer(LAYER1);
      node.setName(`${resName}`);
      node.setPosition(x, y);
      node.setStyle('shape', 'circle');
      node.setStyle('shape.background', isThrough ? '#30c1a1' : '#c1911c');
      //node.setStyle('shape.border.color', '#5675C1');
      node.setStyle('shape.border.width', 0);
      node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      node.setStyle('label.position', azEnd === 'A' ? GlobalConst.LABEL_POSITION_RIGHT : GlobalConst.LABEL_POSITION_LEFT);
      node.setStyle('label.offset.x', azEnd === 'A' ? 10 : -10);
      node.setStyle('select.color', 'red');
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setStyle('shadow.color', 'red');

      data.isThrough = isThrough;
      data.azEnd = azEnd;
      data.isOuterCable = true;
      node.setAttrObject(data);
      node.setTag(data.resId + azEnd);
      node.setSize(20, 20);
      this.dataModel.add(node);
      return node;
    },

    drawOuterCableToInnerDevice(node, deviceId, azEnd, isCut) {
      let deviceNode = this.dataModel.getDataByTag(deviceId);
      if (deviceNode == null || deviceNode.getAttr('baseSpecId') !== 'DEVICE') {
        return;
      }

      let edge = new ht.Edge();
      edge.setToolTip(node.getAttrObject().name);
      edge.setLayer(LAYER1);
      edge.setSource(node);
      edge.setTarget(deviceNode);
      edge.setStyle('edge.width', 2);
      edge.setStyle('edge.color', '#08bcc1');
      edge.setStyle('edge.type', 'points');
      let points = [
        {
          x: azEnd === 'A' ? node.getPosition().x - 30 : node.getPosition().x + 30,
          y: node.getPosition().y,
        },
        {
          x: azEnd === 'A' ? node.getPosition().x - 30 : node.getPosition().x + 30,
          y: deviceNode.getPosition().y,
        },
      ];
      edge.setStyle('edge.points', points);
      edge.setStyle('edge.offset', 6);
      edge.setStyle('select.color', 'red');
      if (isCut) {
        edge.setStyle('edge.dash', true);
        edge.setStyle('edge.dash.pattern', [10, 10]);
        edge.setStyle('edge.dash.color', '#ff5c0a');
      }
      let data = fish.extend({}, node.getAttrObject());
      data.isOuterCableEdge = true;
      data.isOuterCable = false;
      edge.setAttrObject(data);
      this.dataModel.add(edge);
      return edge;
    },

    drawThroughCable(data, logicCableList, isAEnd, isZEnd) {
      let edges = [];
      let cableId = data.resId;
      if (isAEnd) {
        let hasCutNode = false;
        let startNode = this.dataModel.getDataByTag(data.aResId);
        let nextNode = this.findNextCutNode(cableId, data.aResId, logicCableList);
        while (nextNode != null) {
          let edge = this.createInnerEdge(data, startNode, nextNode, true, false);
          edges.push(edge);

          startNode = nextNode;
          nextNode = this.findNextCutNode(cableId, nextNode.getAttr('resId'), logicCableList);
          hasCutNode = true;
        }

        if (hasCutNode) {
          let cableNode = this.dataModel.getDataByTag(data.resId + 'A');
          if (cableNode) {
            cableNode.getEdges() && this.dataModel.remove(cableNode.getEdges().get(0));
            edges.push(this.drawOuterCableToInnerDevice(cableNode, startNode.getAttr('resId'), 'A', true));
          }
        }
      } else if (isZEnd) {
        let startNode = null;
        let nextNode = this.findNextCutNode(cableId, data.aResId, logicCableList);
        while (nextNode != null) {
          if (!startNode) {
            let cableNode = this.dataModel.getDataByTag(data.resId + 'Z');
            if (cableNode) {
              cableNode.getEdges() && this.dataModel.remove(cableNode.getEdges().get(0));
              edges.push(this.drawOuterCableToInnerDevice(cableNode, nextNode.getAttr('resId'), 'Z', true));
            }
          } else {
            let edge = this.createInnerEdge(data, startNode, nextNode, true, false);
            edges.push(edge);
          }
          startNode = nextNode;
          nextNode = this.findNextCutNode(cableId, nextNode.getAttr('resId'), logicCableList);
        }
      } else {
        let startNode = null;
        let nextNode = this.findNextCutNode(cableId, data.aResId, logicCableList);
        while (nextNode != null) {
          if (!startNode) {
            let cableNode = this.dataModel.getDataByTag(data.resId + 'Z');
            edges.push(this.drawOuterCableToInnerDevice(cableNode, nextNode.getAttr('resId'), 'Z', true));
          } else {
            let edge = this.createInnerEdge(data, startNode, nextNode, true, false);
            edges.push(edge);
          }
          startNode = nextNode;
          nextNode = this.findNextCutNode(cableId, nextNode.getAttr('resId'), logicCableList);
          if (!nextNode && startNode) {
            let cableNode = this.dataModel.getDataByTag(data.resId + 'A');
            edges.push(this.drawOuterCableToInnerDevice(cableNode, startNode.getAttr('resId'), 'A', true));
          }
        }
      }

      return edges;
    },

    findNextCutNode(cableId, deviceId, logicCableList) {
      let nextNode = null;
      logicCableList.some((logicCable) => {
        if (logicCable.parentId === cableId && logicCable.aResId === deviceId) {
          nextNode = this.dataModel.getDataByTag(logicCable.zResId);
          if (nextNode) {
            return true;
          }
          nextNode = this.findNextCutNode(cableId, logicCable.zResId, logicCableList);
        }
      });
      return nextNode;
    },

    createInnerEdge(data, source, target, isCut, isInner) {
      let edge = new ht.Edge();
      edge.setToolTip(data.name);
      edge.setLayer(LAYER1);
      edge.setSource(source);
      edge.setTarget(target);
      edge.setStyle('edge.width', 2);
      edge.setStyle('edge.type', 'ortho2');
      edge.setStyle('edge.center', true);
      edge.setStyle('edge.color', isInner ? 'blue' : '#08bcc1');
      //掏接的光缆画虚线
      if (isCut) {
        edge.setStyle('edge.dash', true);
        edge.setStyle('edge.dash.pattern', [10, 10]);
        edge.setStyle('edge.dash.color', '#ff5c0a');
      }
      edge.setStyle('edge.offset', 6);
      edge.setStyle('select.color', 'red');
      data.isInner = isInner;
      data.baseSpecId = 'CABLE';
      edge.setAttrObject(data);
      this.dataModel.add(edge);
      return edge;
    },

    drawMHExpandView() {
      //let data = this.graphic.attributes;
      let data = this.manholeInfo;
      let mainPane = new ht.Node();
      mainPane.setLayer(LAYER0);
      mainPane.setPosition(this.xPos + this.pSize / 2, this.yPos + this.pSize / 2);
      mainPane.setName(data.resName);
      mainPane.setSize(this.pSize, this.pSize);
      mainPane.setStyle('label.scale', 1);
      mainPane.setStyle('shape', 'rect'); //矩形
      mainPane.setStyle('shape.background', '#ece9f2');
      mainPane.setStyle('shape.border.width', 1);
      mainPane.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      mainPane.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
      mainPane.setStyle('select.type', 'shadow');
      mainPane.setStyle('shadow.offset.x', 0);
      mainPane.setStyle('shadow.offset.y', 0);
      mainPane.setStyle('shadow.blur', 5);
      mainPane.setTag(data.resId);
      mainPane.movable = false;
      data.resType = GlobalConst.RES_TYPE_MANHOLE;
      data.baseSpecId = 'FACILITY';
      mainPane.setAttrObject(data);
      this.dataModel.add(mainPane);

      for (let i = 0; i < 4; i++) {
        let sideInfo = this.getSideByDirection(i);
        let sidePane = new ht.Node();
        sidePane.setLayer(LAYER0);
        sidePane.setPosition(sideInfo.x, sideInfo.y);
        //sidePane.setName(sideInfo.name);
        sidePane.setSize(this.pSize, this.pSize);
        sidePane.setStyle('label.scale', 1);
        sidePane.setStyle('shape', 'rect'); //矩形
        sidePane.setStyle('shape.background', '#FFFFFF');
        sidePane.setStyle('shape.border.width', 1);
        sidePane.setStyle('shape.border.color', 'blue');
        sidePane.setStyle('shape.dash', true);
        sidePane.setStyle('shape.dash.pattern', [10, 10]);
        sidePane.setStyle('shape.dash.color', '#FFFFFF');
        sidePane.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
        sidePane.setStyle('label.position', sideInfo.lp);
        sidePane.setStyle('select.type', 'shadow');
        sidePane.setStyle('shadow.offset.x', 0);
        sidePane.setStyle('shadow.offset.y', 0);
        sidePane.setStyle('shadow.blur', 5);
        sidePane.movable = false;
        sidePane.setTag('Side-' + i);
        this.dataModel.add(sidePane);
      }
      return mainPane;
    },

    getSideByDirection(direction) {
      if (direction == 0) {
        return {
          name: 'North',
          lp: GlobalConst.LABEL_POSITION_TOP,
          x: this.xPos + this.pSize / 2,
          y: this.yPos - this.pSize / 2,
        };
      } else if (direction == 1) {
        return {
          name: 'East',
          lp: GlobalConst.LABEL_POSITION_RIGHT,
          x: this.xPos + this.pSize / 2 + this.pSize,
          y: this.yPos + this.pSize / 2,
        };
      } else if (direction == 2) {
        return {
          name: 'South',
          lp: GlobalConst.LABEL_POSITION_BOTTOM,
          x: this.xPos + this.pSize / 2,
          y: this.yPos + this.pSize / 2 + this.pSize,
        };
      } else {
        return {
          name: 'West',
          lp: GlobalConst.LABEL_POSITION_LEFT,
          x: this.xPos - this.pSize / 2,
          y: this.yPos + this.pSize / 2,
        };
      }
    },

    drawCompass() {
      let node = new ht.Node();
      node.setSize(120, 120);
      node.setImage(`oss_core/edesign/assets/image/map/compass.png`);
      node.setPosition(this.xPos + 2 * this.pSize, 50);
      node.movable = false;
      this.dataModel.add(node);
      return node;
    },

    loadSectionStructure(ductIds) {
      return new Promise((resolve, reject) => {
        fish.post({
          url: `edesign/rivt/facilitysection/query/pipelinebyids/v1`,
          data: ductIds,
          success: (result) => {
            resolve(result);
          },
          error: reject,
        });
      });
    },

    clickNode(node) {
      console.log(node);
    },

    initMenus(node) {
      return [];
    },

    selectMode() {
      console.log('select-mode');
    },
  },
};
</script>

<style lang="scss" scoped>
.topo-content {
  width: 100%;
  height: 100%;
}
// @import '../topo-template/scss/topoTemplate.scss';
</style>