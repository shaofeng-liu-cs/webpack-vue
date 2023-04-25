<template>
  <TopoView ref="portTraceTopo" :toolButtons="toolButtons" @click-toolbar="toolbarClick" :show-toolbar="true" :menu-source="initMenus" :graphView="graphView">
  </TopoView>
</template>

<script>
import TopoView from '../../../topo/topo-template/TopoView.vue';
import { isLine } from '../../../../base/utils/util';

const PARAMS_WIDTH = 250;
const PARAMS_HEIGHT = 30;
const ATTENUATION_BORDER_COLOR = '#030303';
const ATTENUATION_FILL_COLOR = '#FFFFFF';

const UPLINK_BORDER_COLOR = 'red';

const DOWN_BORDER_COLOR = 'green';

const LABEL_POSITION_CENTER = 16;
const SPLICE_POINT = 'SPLICE_POINT'; //熔接
const RES_TYPE_SPLITTER = 'SPLITTER';

export default {
  name: 'portTraceTopo',
  components: {
    // PortTrace,
  },

  components: {
    TopoView,
  },
  props: {
    portId: {
      type: String,
      default: '',
    },
    resData: Object,
  },

  model: {
    prop: 'resId',
    event: 'input',
  },
  data() {
    return {
      fNodes: [],
      dataIcon: {
        key: {
          iconFontEnable: false,
        },
        simpleData: {
          enable: true,
        },
      },
      view: {
        showIcon: this.showIconForTree,
        showLine: true,
      },
      allData: [],
      searchValue: '',
      selectTreeNode: null,
      graphData: [],
      selectNode: null,
      toolButtonsData: [],
      linkList: [],
      gridData: [],
      gridOption: {},
      graphView: this.graphView,
      toolButtons: [
        {
          id: 'CALCULATE',
          name: 'Calculate LLD Budget',
          image: 'oss_core/edesign/assets/image/topo-tool-bar/calculate.png',
          title: 'Calculate',
          event: 'CALCULATE',
        },
      ],
      opticalPowerList: [],
      connectList: [],
      splitterList: [],
      nodeSplitterList: [],
      lastPoint: null,
      linkData: [],
      maxX: 0,
      maxY: 0,
      showBudget: false,
      costInfo: {},
    };
  },
  mounted() {
    this.queryBudgets();
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc((elem) => elem.movable);

    this.graphView.getView().addEventListener('click', (e) => {
      let data = this.graphView.getDataAt(e);
      if (data) {
        // this.nodeClick(data);
      }
    });
  },
  // created() {},
  methods: {
    initPage(param) {
      let dataTopo = [];
      let postX = 150;
      let postY = 150;
      if (!this.dataModel) {
        return;
      }
      this.dataModel.clear();
      if (param) {
        this.linkData = param.linkData;
        this.costInfo = param.costInfo;
        this.showBudget = param.showBudget;
      }

      if (!fish.isEmpty(this.linkData)) {
        this.drawTraceLinks(dataTopo);
      } else {
        this.getPortTraceLinks(dataTopo);
      }
    },

    setLayout() {
      let autoLayout = new ht.layout.AutoLayout(this.graphView);
      autoLayout.setOffsetX(50);
      autoLayout.getNodeSize = () => {
        return { width: 150, height: 90 };
      };
      autoLayout.setAnimate(false);
      autoLayout.layout('towardeast', () => {});
    },

    getPortTraceLinks(dataTopo) {
      fish.ajax({
        url: `edesign/link/trace/v1?portId=${this.portId}&schemaId=${this.resData.schemaId}`,
        type: 'GET',
        success: (data) => {
          if (data && data.resultList) {
            // 保存原始数据
            this.linkData = data.resultList;
            this.drawTraceLinks(dataTopo);
          }
        },
      });
    },

    drawTraceLinks(dataTopo) {
      let nodeDatas = this.linkData;
      let addVirtualCount = 0;
      for (let i = 0; i < nodeDatas.length; i++) {
        let node = nodeDatas[i];
        if (!isLine(node.resType)) {
          if (this.dataModel.getDataByTag(node.endId)) {
            continue;
          }
          this.drawTracePoint(nodeDatas, node, dataTopo);
        } else {
          if (this.dataModel.getDataByTag(node.endId)) {
            continue;
          }
          let parentNode = this.getPreNode(nodeDatas, node);
          let childNode = this.getNextNode(nodeDatas, node);
          let aNode = null;
          let zNode = null;
          if (fish.isEmpty(parentNode)) {
            continue;
          }

          aNode = this.dataModel.getDataByTag(parentNode.endId);
          //找a端
          if (isLine(parentNode.resType)) {
            //获取parent的zNode作为这个cable的aNode
            aNode = aNode.getTarget();
          }
          if (childNode) {
            if (isLine(childNode.resType)) {
              addVirtualCount++;
              //熔接，添加一个点
              this.lastPoint = aNode;
              let virtualNode = { resName: '', endId: 'virtual_' + addVirtualCount, resType: SPLICE_POINT };
              zNode = this.drawTracePoint(nodeDatas, virtualNode, dataTopo);
            } else {
              if (!this.dataModel.getDataByTag(childNode.endId)) {
                zNode = this.drawTracePoint(nodeDatas, childNode, dataTopo);
              } else {
                zNode = this.dataModel.getDataByTag(childNode.endId);
              }
            }
          } else {
            addVirtualCount++;
            // 最后一个节点是cable,加一个虚拟点完成画线
            this.lastPoint = aNode;
            let virtualNode = { resName: '', endId: 'virtual_' + addVirtualCount, resType: 'endPoint' };
            zNode = this.drawTracePoint(nodeDatas, virtualNode, dataTopo);
          }
          this.drawLink(dataTopo, node, aNode, zNode);
        }
      }

      this.setLayout();
      this.getPostXY();
      if (this.showBudget) {
        this.getNodeSplitterList();
        this.addBudgets();
        this.addNodeBudget();
      }
    },

    getNodeSplitterList() {
      this.dataModel.getDatas()._as.forEach((data) => {
        if (data instanceof ht.Node) {
          let nodeData = data.getAttrObject();
          if (nodeData.resType == RES_TYPE_SPLITTER) {
            let splitterRadio = nodeData.splitterRadio;
            if (splitterRadio && !this.hasContains(splitterRadio)) {
              this.nodeSplitterList.push(splitterRadio);
            }
          }
        }
      });
    },

    hasContains(splitterRadio) {
      for (let i = 0; i < this.nodeSplitterList.length; i++) {
        if (splitterRadio == this.nodeSplitterList[i]) {
          return true;
        }
      }
      return false;
    },

    drawTracePoint(nodeDatas, node, dataTopo) {
      let parentNode = this.getPreNode(nodeDatas, node);
      if (RES_TYPE_SPLITTER == node.resType && node.portUse == '0') {
        if (!node.inCostUp) {
          let childNodes = this.getNextNode(nodeDatas, node);
          // if (fish.isEmpty(childNodes)) {
          //     return null;
          // }
        }
      }

      let zNode = this.drawPointNode(dataTopo, 'DEVICE', node, 3);
      if (parentNode) {
        if (!isLine(parentNode.resType)) {
          let ppNode = { resName: '', nodeId: '1' };
          let aNode = null;
          if (!this.dataModel.getDataByTag(parentNode.endId)) {
            aNode = this.drawTracePoint(nodeDatas, parentNode, dataTopo);
          } else {
            aNode = this.dataModel.getDataByTag(parentNode.endId);
          }
          if (RES_TYPE_SPLITTER == node.resType && node.portUse == '0') {
            ppNode.splitterRadio = node.splitterRadio;
            ppNode.splitterCost = node.splitterCost;
          }
          this.drawLink(dataTopo, ppNode, aNode, zNode);
        }
      }
      this.lastPoint = zNode;
      return zNode;
    },

    getNextNode(nodeDatas, cableNode) {
      let nodeId = cableNode.endId;
      for (let i = 0; i < nodeDatas.length; i++) {
        let node = nodeDatas[i];
        let parentNodeId = node.parentEndId;
        if (nodeId == parentNodeId) {
          return node;
        }
      }
      return null;
    },

    getPreNode(nodeDatas, node) {
      if (node.parent) {
        let parentNodeId = node.parentEndId;
        for (let i = 0; i < nodeDatas.length; i++) {
          let nodeTemp = nodeDatas[i];
          let nodeId = nodeTemp.endId;
          if (nodeId == parentNodeId) {
            return nodeTemp;
          }
        }
      }

      return null;
    },

    getPostXY() {
      this.dataModel.getDatas()._as.forEach((data) => {
        if (data instanceof ht.Node) {
          let nodeX = data.getPosition().x;
          let nodeY = data.getPosition().y;
          if (nodeX > this.maxX) {
            this.maxX = nodeX;
          }
          if (nodeY > this.maxY) {
            this.maxY = nodeY;
          }
        }
      });
      // fish.info(this.maxX + "-" + this.maxY);
    },

    addBudgets() {
      let dataTopo = [];
      let postX = 250;
      let postY = this.maxY + 150;
      let nodeInfo = { name: `Downlink Maximal Power: ${this.costInfo.downMaxCost}(dBm)`, nodeId: '11' };
      let node1 = this.drawRect(
        dataTopo,
        'PARAMS',
        nodeInfo,
        PARAMS_WIDTH,
        PARAMS_HEIGHT,
        postX,
        postY,
        ATTENUATION_BORDER_COLOR,
        ATTENUATION_FILL_COLOR,
        LABEL_POSITION_CENTER,
      );
      let nodeInfo2 = { name: `Uplink Maximal Power: ${this.costInfo.upMaxCost}(dBm)`, nodeId: '12' };
      let node2 = this.drawRect(
        dataTopo,
        'PARAMS',
        nodeInfo2,
        PARAMS_WIDTH,
        PARAMS_HEIGHT,
        postX,
        postY,
        ATTENUATION_BORDER_COLOR,
        ATTENUATION_FILL_COLOR,
        LABEL_POSITION_CENTER,
      );

      let colSize = 3;
      this.opticalPowerList.forEach((data) => {
        let dataInfo = {
          name: data.fiberType + '(' + data.name + '): ' + data.userVal + '(dBm)',
          id: data.id,
          specId: data.specId,
        };
        this.drawRect(
          dataTopo,
          'PARAMS',
          dataInfo,
          PARAMS_WIDTH,
          PARAMS_HEIGHT,
          postX,
          postY,
          ATTENUATION_BORDER_COLOR,
          ATTENUATION_FILL_COLOR,
          LABEL_POSITION_CENTER,
        );
      });

      this.connectList.forEach((data) => {
        let dataInfo = { name: data.name + ': ' + data.userVal + '(dBm)', id: data.id };
        this.drawRect(
          dataTopo,
          'PARAMS',
          dataInfo,
          PARAMS_WIDTH,
          PARAMS_HEIGHT,
          postX,
          postY,
          ATTENUATION_BORDER_COLOR,
          ATTENUATION_FILL_COLOR,
          LABEL_POSITION_CENTER,
        );
      });

      let nodeInfo3 = { name: `PON Attenuation: ${this.costInfo.ponCost}(dBm)`, nodeId: '14' };
      let node3 = this.drawRect(
        dataTopo,
        'PARAMS',
        nodeInfo3,
        PARAMS_WIDTH,
        PARAMS_HEIGHT,
        postX,
        postY,
        ATTENUATION_BORDER_COLOR,
        ATTENUATION_FILL_COLOR,
        LABEL_POSITION_CENTER,
      );

      this.splitterList.forEach((data) => {
        if (this.hasContains(data.name)) {
          let dataInfo = { name: 'Splitter ' + data.name + ': ' + data.userVal + '(dBm)', id: data.id };
          this.drawRect(
            dataTopo,
            'PARAMS',
            dataInfo,
            PARAMS_WIDTH,
            PARAMS_HEIGHT,
            postX,
            postY,
            ATTENUATION_BORDER_COLOR,
            ATTENUATION_FILL_COLOR,
            LABEL_POSITION_CENTER,
          );
        }
      });

      let y = postY + parseInt(dataTopo.length / colSize) * PARAMS_HEIGHT + 50;
      let nodeInfo41 = { name: 'Down-link', nodeId: '41' };
      let node41 = this.drawRect(
        dataTopo,
        'DOWN',
        nodeInfo41,
        110,
        30,
        postX - 70,
        y,
        UPLINK_BORDER_COLOR,
        ATTENUATION_FILL_COLOR,
        LABEL_POSITION_CENTER,
      );

      let nodeInfo42 = { name: 'Up-link', nodeId: '42' };
      let node42 = this.drawRect(
        dataTopo,
        'UP',
        nodeInfo42,
        110,
        30,
        postX + 40,
        y,
        DOWN_BORDER_COLOR,
        ATTENUATION_FILL_COLOR,
        LABEL_POSITION_CENTER,
      );
    },

    addNodeBudget() {
      this.linkData.forEach((data) => {
        let node = this.dataModel.getDataByTag(data.endId);
        if (node instanceof ht.Node) {
          let x = node.getPosition().x;
          let y = node.getPosition().y;

          if (data.inCost || data.inCost == 0) {
            let cost = data.inCost.toFixed(3);
            this.drawTextNode('TEXT', cost, x - 30, data.inCostUp ? y - 40 : y - 20, 3, 'U');
          }
          if (data.outCost || data.outCost == 0) {
            let cost = data.outCost.toFixed(3);
            this.drawTextNode('TEXT', cost, x + 30, data.outCostUp ? y - 40 : y - 20, 3, 'U');
          }
          if (data.inCostUp || data.inCostUp == 0) {
            let cost = data.inCostUp.toFixed(3);
            this.drawTextNode('TEXT', cost, x - 30, y - 20, 3, 'D');
          }
          if (data.outCostUp || data.outCostUp == 0) {
            let cost = data.outCostUp.toFixed(3);
            this.drawTextNode('TEXT', cost, x + 30, y - 20, 3, 'D');
          }
        }
      });
    },

    queryBudgets() {
      // fish.info('queryBudgets');
      fish.ajax({
        url: 'edesign/optical/attenuation/config/list/v1',
        type: 'GET',
        success: (data) => {
          if (data && data.resultList) {
            // 保存原始数据
            this.opticalPowerList = data.resultList.cableBudgetDTOS;
            this.connectList = data.resultList.connectAttenuationDTOS;
            this.splitterList = data.resultList.splitterBudgetDTOS;
            let datas = [];
            this.initPage(datas);
          }
        },
      });
    },

    drawRect(dataTopo, nodeType, nodeInfo, width, height, postX, postY, borderColor, bgColor, labelNum) {
      let intLabelNum = 17;
      if (labelNum) {
        intLabelNum = labelNum;
      }
      let count = dataTopo.length;
      let colSize = 3;
      let positionX = postX + (count % colSize) * PARAMS_WIDTH;
      let positionY = postY + parseInt(count / colSize) * PARAMS_HEIGHT;
      let node = new ht.Node();
      node.movable = false;
      node.setAttrObject(nodeInfo);
      node.setAttr('NODE_TYPE', nodeType);
      node.setAttr('NODE_SPEC', nodeType);
      node.setName(nodeInfo.name);
      node.setName(nodeInfo.name);
      node.setSize(width, height);
      node.setPosition(positionX, positionY);
      node.setStyle('shape', 'rect');
      node.setStyle('label.position', intLabelNum);
      node.setStyle('label.font', '14px Arial');
      node.setStyle('label.align', 'left');
      node.setStyle('shape.border.width', 1);
      node.setStyle('shape.border.color', borderColor);
      node.setStyle('vector.outline.width', '2');
      if (nodeType === 'UP' || nodeType === 'DOWN') {
        node.setStyle('label.color', borderColor);
        node.setStyle('vector.outline.width', '4');
        node.setStyle('label.font', '20px Arial');
        node.setPosition(postX, postY);
      }
      node.setStyle('select.color', borderColor);
      node.setStyle('shape.background', bgColor);
      dataTopo.push(node);
      this.dataModel.add(node);
      return node;
    },

    drawPointNode(dataTopo, nodeType, nodeInfo, labelNum) {
      let intLabelNum = 17;
      let node = new ht.Node();
      node.setAttrObject(nodeInfo);
      let name = nodeInfo.resName;
      if (nodeInfo.seq) {
        name += '/' + nodeInfo.seq;
      }
      let info = this.getTooltipInfos(nodeInfo, nodeType);
      if (info) {
        node.setToolTip(info);
      }

      node.setName(name);
      node.setAttr('NODE_TYPE', nodeType);
      node.setAttr('NODE_SPEC', nodeType);
      node.movable = true;
      let imageUrl = 'oss_core/edesign/assets/image/topo-business/port/';
      if (RES_TYPE_SPLITTER == nodeInfo.resType) {
        if (nodeInfo.portUse == '1') {
          imageUrl += nodeInfo.resType + '_UP' + '.png';
        } else {
          imageUrl += nodeInfo.resType + '_DOWN' + '.png';
        }
      } else if (nodeInfo.resType == 'endPoint') {
        imageUrl = '';
      } else {
        imageUrl += nodeInfo.resType + '.png';
      }
      node.setImage(imageUrl);
      node.setTag(nodeInfo.endId);
      dataTopo.push(node);
      this.dataModel.add(node);
      return node;
    },

    drawTextNode(nodeType, cost, postX, postY, labelNum, type) {
      let intLabelNum = 17;
      let node = new ht.Node();
      node.movable = false;
      node.setName(cost);
      node.setToolTip(cost);
      node.setAttr('NODE_TYPE', nodeType);
      node.setAttr('NODE_SPEC', nodeType);
      node.setStyle('label.font', '14px Arial');
      node.setStyle('label.position', intLabelNum);
      node.setStyle('label.color', 'red');
      if ('D' == type) {
        node.setStyle('label.color', 'green');
      }
      // 'label.background': 'yellow',
      node.setPosition(postX, postY);
      node.setStyle('shape', 'rect');
      node.setStyle('shape.background', '#FFFFFF');
      node.setStyle('shape.border.color', '#030303');
      // node.setStyle('shape.border.width',1);
      // node.setStyle('vector.outline.width','2');
      node.setSize(20, 20);
      this.dataModel.add(node);
      return node;
    },

    drawLink(dataTopo, data, aNode, zNode) {
      let edge = new ht.Edge();
      edge.setLayer('Layer3');
      edge.setAttrObject(data);
      let name = data.resName;
      if (data.seq) {
        name += '/' + data.seq;
      }
      edge.setName(name);
      edge.setAttr('NODE_TYPE', 'LINK');
      edge.setAttr('NODE_SPEC', 'LINK_PORT_PORT');

      edge.setStyle('edge.type', 'points');
      let info = this.getTooltipInfos(data, 'LINK');
      if (info) {
        edge.setToolTip(info);
      }

      edge.setSource(aNode);
      edge.setTarget(zNode);
      edge.setTag(data.endId);
      this.dataModel.add(edge);
      dataTopo.push(edge);
    },
    getTooltipInfos(node, nodeType) {
      let html = '';
      // if(node.resName){
      //     let name = node.resName;
      //     if (node.seq) {
      //         name += '/' + node.seq;
      //     }
      //     html += name + '<br/>';
      // }
      if (nodeType === 'DEVICE') {
        if (node.activeNum || node.activeNum == 0) {
          html += 'Connector Count(down) : ' + node.activeNum + '<br/>';
        }
        if (node.activeNumUp || node.activeNumUp == 0) {
          html += 'Connector Count(up) : ' + node.activeNumUp + '<br/>';
        }
        if (node.spliceNum || node.spliceNum == 0) {
          html += 'Splice Count(down) : ' + node.spliceNum + '<br/>';
        }
        if (node.spliceNumUp || node.spliceNumUp == 0) {
          html += 'Splice Count(up) : ' + node.spliceNumUp + '<br/>';
        }
        if (node.activeCost || node.activeCost == 0) {
          html += 'Connector Cost(down) : ' + node.activeCost + '<br/>';
        }
        if (node.activeCostUp || node.activeCostUp == 0) {
          html += 'Connector Cost(up) : ' + node.activeCostUp + '<br/>';
        }
        if (node.spliceCost || node.spliceCost == 0) {
          html += 'Splice Cost(down) : ' + node.spliceCost + '<br/>';
        }
        if (node.spliceCostUp || node.spliceCostUp == 0) {
          html += 'Splice Cost(up) : ' + node.spliceCostUp + '<br/>';
        }
        if (node.ponCostOlt || node.ponCostOlt == 0) {
          html += 'OLT Connector Cost : ' + node.ponCostOlt + '<br/>';
        }
        if (node.ponCostOnt || node.ponCostOnt == 0) {
          html += 'ONT Connector Cost : ' + node.ponCostOnt + '<br/>';
        }
      } else if (nodeType == 'LINK') {
        if (node.lineLength || node.lineLength == 0) {
          html += 'Length : ' + node.lineLength + '<br/>';
        }
        if (node.spliceNum || node.spliceNum == 0) {
          html += 'Splice Count(down) : ' + node.spliceNum + '<br/>';
        }
        if (node.spliceNumUp || node.spliceNumUp == 0) {
          html += 'Splice Count(up) : ' + node.spliceNumUp + '<br/>';
        }
        if (node.mechanicalSpliceNum || node.mechanicalSpliceNum == 0) {
          html += 'Mechanical Splice Count(down) : ' + node.mechanicalSpliceNum + '<br/>';
        }
        if (node.mechanicalSpliceNumUp || node.mechanicalSpliceNumUp == 0) {
          html += 'Mechanical Splice Count(up) : ' + node.mechanicalSpliceNumUp + '<br/>';
        }
        if (node.lineCost || node.lineCost == 0) {
          html += 'Line Cost(down) : ' + node.lineCost + '<br/>';
        }
        if (node.lineCostUp || node.lineCostUp == 0) {
          html += 'Line Cost(up) : ' + node.lineCostUp + '<br/>';
        }
        if (node.spliceCost || node.spliceCost == 0) {
          html += 'Splice Cost(down) : ' + node.spliceCost + '<br/>';
        }
        if (node.spliceCostUp || node.spliceCostUp == 0) {
          html += 'Splice Cost(up) : ' + node.spliceCostUp + '<br/>';
        }
        if (node.mechanicalSpliceCost || node.mechanicalSpliceCost == 0) {
          html += 'Mechanical Splice Cost(down) : ' + node.mechanicalSpliceCost + '<br/>';
        }
        if (node.mechanicalSpliceCostUp || node.mechanicalSpliceCostUp == 0) {
          html += 'Mechanical Splice Cost(up) : ' + node.mechanicalSpliceCostUp + '<br/>';
        }
        if (node.splitterRadio || node.splitterRadio == 0) {
          html += 'Splitter Radio : ' + node.splitterRadio + '<br/>';
        }
        if (node.splitterCost || node.splitterCost == 0) {
          html += 'Splitter Cost : ' + node.splitterCost + '<br/>';
        }
      }

      return html;
    },

    nodeClick(node) {
      this.dataModel.getDatas()._as.forEach((data) => {
        let attrNode = data.getAttrObject();
        let nodeSpec = attrNode.NODE_SPEC;
        if (nodeSpec === 'DEVICE') {
          data.setStyle('note', null);
          // data.setStyle('note.expanded', false);
        }
      });

      if (node) {
        let names = ['SplitView SplitView', 'AccordionView', 'TabView', 'PropertyView'];
        let attrNode = node.getAttrObject();
        let nodeSpec = attrNode.NODE_SPEC;
        if (nodeSpec === 'DEVICE') {
          node.setStyle('note', names.join('\n'));
          node.setStyle('note.background', '#d3d7d4');
          node.setStyle('note.color', 'black');
          node.setStyle('note.align', 'left');
        }
      } else {
        console.log('click the grapView');
      }
      this.selectNode = node;
    },
    clickToolNode(menuNode) {
      let eventName = menuNode.event;
    },
    toolbarClick(eventName) {
      if (eventName === 'CALCULATE') {
        if (this.linkData) {
          let upDatas = this.linkData
            .filter((data) => {
              return data.upLink && data.upLink == 'Y';
            })
            .map((module) => {
              return {
                name: module.resName + '/' + module.seq,
                value: module.resId + '-' + module.endId,
              };
            });
          let downDatas = this.linkData
            .filter((data) => {
              return data.downLink && data.downLink == 'Y';
            })
            .map((module) => {
              return {
                name: module.resName + '/' + module.seq,
                // name: module.resId + '-' + module.endId,
                value: module.resId + '-' + module.endId,
              };
            });
          if (upDatas.length > 0 || downDatas.length > 0) {
            this.$emit('openPortTraceSetting', this.portId, this.linkData);
          } else {
            fish.info("Can't confirm the direction to calculate attenuate!");
          }
        }
      }
    },
    initMenus(node) {
      return [];
    },
    slect() {},
    menuSource(node) {
      return [
        {
          label: '测试',
          visible: true,
          action: (data) => this.viewDevice(data),
        },
      ];
    },
    selectMode() {
      //console.log('select-mode');
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped></style>
