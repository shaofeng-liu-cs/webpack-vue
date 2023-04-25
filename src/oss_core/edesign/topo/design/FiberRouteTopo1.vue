<template>
  <div class="topo-content">
    <TopoView
      ref="fiberRouteTopo1"
      :menu-source="initMenus"
      :toolButtons="toolButtons"
      :toolSelectButtons="toolSelectButtons"
      :show-toolbar="true"
      :show-over-view="true"
      @click-toolbar="toolbarClick"
      :graphView="graphView"
    ></TopoView>
    <ShowInnerDesignTopo
      ref="showInnerDesignTopo"
      @refreshEvent="doAfterShowInnerDesginTopo"
      @refreshClose="doAfterShowInnerDesginTopo"
    ></ShowInnerDesignTopo>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { isLine } from '@/oss_core/base/utils/util';
import { jumpName } from '../../../base/utils/GlobalConst';
import { saveTopo, loadTopoData } from '../TopoUtil';
import JSPDF from 'jspdf';
import html2canvas from 'html2canvas';
import interval from 'echarts/src/scale/Interval';
import ShowInnerDesignTopo from './ShowInnerDesignTopo.vue';
import { queryTaskProjectInfo } from '../../osp/task/api/taskAction';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYER3 = 3;
const LAYERS = [LAYER0, LAYER1, LAYER2, LAYER3];

export default {
  name: 'FiberRouteTopo1',
  components: {
    TopoView,
    ShowInnerDesignTopo,
  },
  props: {
    params: Object,
  },
  data() {
    return {
      toolButtons: [
        {
          id: 'save',
          name: 'Save',
          image: 'oss_core/edesign/assets/image/topo-tool-bar/save.png',
          title: 'Save',
          event: 'save',
        },
      ],
      toolSelectButtons: [
        {
          id: 'LINE_ALIGNED',
          buttons: [
            {
              id: 'TOP_ALIGNED',
              name: 'TopAligned',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/TopAligned.png',
              title: 'TopAligned',
              event: 'TOP_ALIGNED',
            },
            {
              id: 'BOTTOM_ALIGNED',
              name: 'BottomAligned',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/BottomAligned.png',
              title: 'BottomAligned',
              event: 'BOTTOM_ALIGNED',
            },
          ],
        },
        {
          id: 'NODE_ALIGNED',
          buttons: [
            {
              id: 'LEFT_ALIGNED',
              name: 'LeftAligned',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/LeftAligned.png',
              title: 'LeftAligned',
              event: 'LEFT_ALIGNED',
            },
            {
              id: 'RIGHT_ALIGNED',
              name: 'RightAligned',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/RightAligned.png',
              title: 'RightAligned',
              event: 'RIGHT_ALIGNED',
            },
          ],
        },
        {
          id: 'EXPORT_TOPO',
          buttons: [
            {
              id: 'EXPORT_PDF',
              name: 'ExportPdf',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/exportPdf.png',
              title: 'ExportPdf',
              event: 'EXPORT_PDF',
            },
            {
              id: 'EXPORT_IMAGE',
              name: 'ExportImage',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/exportImage1.png',
              title: 'ExportImage',
              event: 'EXPORT_IMAGE',
            },
          ],
        },
      ],
      graphView: this.graphView,
    };
  },
  provide() {
    return {
      getDeviceDesignEl: () => this.$el, //节点
      getResourceList: () => this.resourceList,
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc(elem => elem.movable);
    this.graphView.setVisibleFunc(elem => elem.visible);
    this.graphView.setEditable(true);
    this.graphView.setEditableFunc(function(data) {
      if (data instanceof ht.Edge) {
        return true;
      } else {
        return false;
      }
    });
    this.PRE_EVENT = null;
    this.graphView.addInteractorListener(e => {
      //console.log(e);
      if (e.kind === 'moveLeft') {
        this.PRE_EVENT = e;
        // let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as||[];
        // selectNodeList.forEach(selectNode=>{
        // 	this.layout(selectNode);
        // })
      } else if (e.kind === 'moveRight') {
        this.PRE_EVENT = e;
        // let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as||[];
        // selectNodeList.forEach(selectNode=>{
        // 	this.layout(selectNode);
        // })
      } else if (e.kind === 'moveUp') {
        this.PRE_EVENT = e;
        // let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as||[];
        // selectNodeList.forEach(selectNode=>{
        // 	this.layout(selectNode);
        // })
      } else if (e.kind === 'moveDown') {
        this.PRE_EVENT = e;
        // let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as||[];
        // selectNodeList.forEach(selectNode=>{
        // 	this.layout(selectNode);
        // })
      } else if (e.event.button == 0 && e.kind === 'clickData' && e.data) {
        let elem = e.data;
        this.nodeClick(elem);
        this.CONN_LINK_LIST.forEach(connNode => {
          connNode.IS_ROUTE_SPLITTER = true;
        });
        this.edgeClick(elem);
        //console.log(e);
      } else if (e.event.button == 0 && e.kind === 'doubleClickData' && e.data && e.data instanceof ht.Node) {
        let elem = e.data;
        this.expandGroup(elem);
      } else if (e.event.button == 0 && e.kind === 'endMove') {
        //	    	        console.log('结束移动图元');
        // 				let point = this.graphView.getLogicalPoint(e.event);
        //
        // 				var elem = this.graphView.getSelectedDataAt(e.event);

        let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];
        selectNodeList.forEach(selectNode => {
          if (selectNode instanceof ht.Node) {
            this.layout(selectNode);
          }
        });
      }
      if (this.PRE_EVENT && e.kind !== 'moveLeft' && e.kind !== 'moveRight' && e.kind !== 'moveUp' && e.kind !== 'moveDown') {
        let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];
        selectNodeList.forEach(selectNode => {
          if (selectNode instanceof ht.Node) {
            this.layout(selectNode);
          }
        });
        //console.log("move end");
        this.PRE_EVENT = null;
      }
      //console.log(e);
    });

    // 鼠标右键屏蔽浏览器默认菜单
    this.graphView.getView().addEventListener('mousedown', e => {
      if (e.button === 2) {
        document.oncontextmenu = () => {
          return false;
        };
      }
    });
  },
  mounted() {
    this.screenHeight = window.screen.availHeight;
    this.screenWidth = window.screen.availWidth;
    console.log('参数： ' + this.params);
    this.loadTopo();
  },
  methods: {
    loadTopo() {
      let positionList = [];
      this.topoId = 'FIBER_ROUTE_TOPO_' + this.params.projectId;
      let p0 = loadTopoData(this.topoId);
      let p1 = new Promise((resolve, reject) => {
        fish.get({
          url: `edesign/topo/fiberRouteTopo/v1`,
          data: {
            projectId: this.params.projectId,
            schemaId: this.params.schemaId,
          },
          success: data => {
            resolve(data);
          },
          error: reject,
        });
      });
      Promise.all([p0, p1]).then(datas => {
        positionList = datas[0] || [];
        let data = datas[1];
        this.Y_INTERVAL = 100;
        this.X_INTERVAL = 200;
        this.DEV_WIDTH = 100;
        this.CABLE_WIDTH = 100;
        this.PORT_HEIGHT = 10;
        this.PORT_GROUP_HEIGHT = 13;
        this.PORT_INTERVAL = 3;
        this.LINK_LABEL_POSITION1 = 34;
        this.LINK_LABEL_POSITION2 = 55;
        this.LINK_SIZE = 1;
        this.IS_MOVE = true;

        this.POSITION_LIST = positionList;
        data.POSITION_LIST = positionList;
        // 先加载点
        this.dataModel.clear();
        data = this.preLoadData(data);
        this.initData(data);
        this.initSize();
        this.initPosition();
        this.drawTopo();
        this.layout();
        this.topoData = data;
        console.log(data);
      });
    },
    initMenus(selectedDatas) {
      let menus = [];
      let selectedNodes = [];
      selectedDatas.each(selectedData => {
        if (selectedData instanceof ht.Node) {
          if (selectedData.RES_SPEC_ID && selectedData.RES_SPEC_ID === 'DEV') {
            selectedNodes.push(selectedData);
          } else {
            selectedNodes.push(selectedData.getParent());
          }
        } else {
          selectedNodes.push(selectedDatas._as[0].getSource().getParent());
        }
      });
      let node = selectedNodes[0];
      menus.push({
        label: this.$t('LLD_DESIGN_INNER_DESIGN'),
        visible: true,
        action: () => {
          this.innerDesginTopo(node);
        },
      });
      return menus;
    },
    innerDesginTopo(node) {
      let param = this.getInnerDesginTopoParam(node);
      console.info("open innerDesginTopo's params:");
      console.info(param);
      this.showInnerDesginTopo(param);
    },
    showInnerDesginTopo(param) {
      //调服务
      this.$refs.showInnerDesignTopo.setParams(param);
      this.$refs.showInnerDesignTopo.CompPopuTopo.show = true;
      this.$refs.showInnerDesignTopo.show = true;
      //调服务完成后，返回组件；
    },
    // 增加硬件后返回
    doAfterShowInnerDesginTopo(datas, params) {
      // 将Topo重新加载；
      this.loadTopo();
    },
    getInnerDesginTopoParam(node) {
      let attrObject = node.getAttrObject();
      let param = {
        lldParams: {
          resId: attrObject.deviceId,
          schemaId: this.params.schemaId,
          sprintId: this.params.projectId,
          resType: attrObject.resSpecId,
          resName: attrObject.name,
          buildingGisId: '',
          buildingLayerNo: '',
          isReferenced: false,
          mapNo: '',
        },
        queryData: {},
      };
      queryTaskProjectInfo(attrObject.projectId).then(proInfo => {
        param.queryData.projectInfo = proInfo.resultData || {};
      });
      return param;
    },
    layout: function(selectNode) {
      if (selectNode) {
        this.layoutNodeSIze(selectNode);
        this.reloadInnerEdgePoints(selectNode);
        //this.layoutLinkPoints(selectNode);
        //this.layoutNodeXpos(selectNode);
        this.layoutNodeInnerLinkPoints(selectNode);
      } else {
        //this.layoutNodeSizeAndPosition();
        // this.layoutNodeYPos();
        this.layoutNodeSIze();
        //this.reloadInnerEdgePoints();
        //this.layoutLinkPoints();
        this.layoutNodeXpos();
        this.layoutNodeInnerLinkPoints();
      }
    },
    expandGroup: function(node) {
      let isExpand = false;
      if (node.getAttrObject() && node.getAttrObject().IS_GROUP && node.getAttrObject().OPEN_GROUP) {
        let newPortList = this.topoData.NEW_PORT_LIST || [];
        let newUnitList = this.topoData.NEW_UNIT_LIST || [];
        newPortList.forEach(newPort => {
          if (newPort.portId == node.getAttrObject().portId) {
            isExpand = true;
            newPort.OPEN_GROUP = false;
          }
        });
        newUnitList.forEach(newUnit => {
          if (newUnit.unitId == node.getAttrObject().unitId) {
            isExpand = true;
            newUnit.OPEN_GROUP = false;
          }
        });
        if (isExpand) {
          this.dataModel.clear();
          this.initData(this.topoData);
          this.initSize();
          this.initPosition();
          this.drawTopo();
        }
      } else {
        let newPortList = this.topoData.NEW_PORT_LIST || [];
        let newUnitList = this.topoData.NEW_UNIT_LIST || [];

        newPortList.forEach(newPort => {
          let isParent = false;
          let childNodeList = newPort.CHILD_NODE_LIST || [];
          if (childNodeList) {
            childNodeList.forEach(childNode => {
              if (childNode.portId == node.getAttrObject().portId) {
                isParent = true;
              }
            });
          }
          if (isParent && newPort.IS_GROUP && !newPort.OPEN_GROUP) {
            isExpand = true;
            newPort.OPEN_GROUP = true;
          }
        });
        newUnitList.forEach(newUnit => {
          let isParent = false;
          let childNodeList = newUnit.CHILD_NODE_LIST || [];
          if (childNodeList) {
            childNodeList.forEach(childNode => {
              if (childNode.unitId == node.getAttrObject().unitId) {
                isParent = true;
              }
            });
          }
          if (isParent && newUnit.IS_GROUP && !newUnit.OPEN_GROUP) {
            isExpand = true;
            newUnit.OPEN_GROUP = true;
          }
        });

        if (isExpand) {
          this.dataModel.clear();
          this.initData(this.topoData);
          this.initSize();
          this.initPosition();
          this.drawTopo();
        }
      }
    },
    drawTopo: function() {
      this.NODE_LIST = [];
      this.CONN_NODE_LIST = [];
      this.CONN_LINK_LIST = [];
      this.CABLE_LIST.forEach(cableInfo => {
        let node = new ht.Node();
        node.movable = this.IS_MOVE;
        node.visible = true;
        node.RES_SPEC_ID = 'CABLE';
        node.setName(cableInfo.name);
        node.setToolTip(cableInfo.fullName || cableInfo.name);
        node.setStyle('shape', 'rect'); //矩形
        node.setStyle('shape.background', '#D4D4D4');
        node.setStyle('shape.border.width', 2);
        node.setStyle('shape.border.color', 'red');
        node.setStyle('label.font', '20px Tahoma');
        node.setStyle('label.position', 3);
        if (cableInfo.W && cableInfo.H) {
          node.setSize(Number(cableInfo.W), Number(cableInfo.H));
        } else {
          node.setSize(this.CABLE_WIDTH, cableInfo.HEIGHT);
        }
        if (!cableInfo.X_NUMBER && cableInfo.X_NUMBER != 0) {
          cableInfo.X_NUMBER = -1;
        }
        if (!cableInfo.Y_POS) {
          cableInfo.Y_POS = 0;
        }
        if (cableInfo.X && cableInfo.Y) {
          node.setPosition(Number(cableInfo.X), Number(cableInfo.Y));
        } else {
          node.setPosition(cableInfo.X_POS, cableInfo.Y_POS);
        }
        node.setTag(cableInfo.cableId);
        node.setLayer(LAYER2);
        node.setAttrObject(cableInfo);
        this.dataModel.add(node);
        this.NODE_LIST.push(node);
        let preNode = node;

        //绘制cable内的纤芯
        let tubeList = cableInfo.TUBE_LIST || [];
        let posY = this.PORT_INTERVAL;
        tubeList.forEach(tubeInfo => {
          let fiberList = tubeInfo.FIBER_LIST || [];
          //首先绘制tube区域
          let tubeNode = new ht.Node();
          tubeNode.visible = true;
          tubeNode.movable = this.IS_MOVE;
          tubeNode.setAttrObject(tubeInfo);
          tubeNode.setHost(preNode);
          tubeNode.setParent(node);
          tubeNode.setName(tubeInfo.PARENT_SEQ ? tubeInfo.PARENT_SEQ : tubeInfo.nameSeq ? tubeInfo.nameSeq : tubeInfo.name);
          tubeNode.setToolTip(tubeInfo.fullName);
          tubeNode.setLayer(LAYER2);
          tubeNode.setStyle('shape', 'rect');
          tubeNode.setStyle('shape.background', '#fc02eb');
          tubeNode.setStyle('shape.border.width', 1);
          tubeNode.setStyle('shape.border.color', '#000000');
          tubeNode.setStyle('label.font', '4px Tahoma');
          tubeNode.setStyle('label.position', 17);
          tubeNode.setStyle('label.color', 'black');
          tubeNode.setStyle('label.scale', 1);
          tubeNode.setSize(this.CABLE_WIDTH / 4, tubeInfo.HEIGHT);
          tubeNode.setPosition(node.getPosition().x, node.getPosition().y - node.getSize().height / 2 + posY + tubeNode.getSize().height / 2);
          this.dataModel.add(tubeNode);
          posY += tubeInfo.HEIGHT;
          preNode = tubeNode;

          //绘制纤芯
          let tubeFiberrOffsetY = 0;
          fiberList.forEach((fiberInfo, index) => {
            // let fiberNode = new ht.Node();
            // fiberNode.visible = true;
            // fiberNode.movable =true;
            // fiberInfo.NODE_ID = fiberInfo.unitId;
            // fiberInfo.PARENT_NAME = cableInfo.name;
            // fiberNode.setTag(fiberInfo.NODE_ID);
            // fiberNode.setHost(preNode);
            // fiberNode.setParent(node);
            // fiberNode.setAttrObject(fiberInfo);
            // fiberNode.setName(fiberInfo.GROUP_MAX?fiberInfo.GROUP_MIN+":"+fiberInfo.GROUP_MAX:fiberInfo.seq);
            // fiberNode.setLayer(LAYER2);
            // fiberNode.setToolTip(fiberInfo.GROUP_MAX?fiberInfo.GROUP_MIN+"->"+fiberInfo.GROUP_MAX:fiberInfo.fullName || fiberInfo.name);
            // fiberNode.setStyle("shape", "circle");
            // fiberNode.setStyle('shape.background', '#D4D4D4');
            // fiberNode.setStyle('shape.border.width', 1);
            // fiberNode.setStyle('shape.border.color', '#000000');
            // fiberNode.setStyle('label.font', '3px Tahoma');
            // fiberNode.setStyle("label.position", 17);
            // fiberNode.setStyle("label.offset.y", -1);
            // fiberNode.setStyle('label.color', 'red');
            // fiberNode.setStyle('label.scale',1);
            // fiberNode.setSize(this.PORT_HEIGHT, this.PORT_HEIGHT);
            // fiberNode.setPosition(node.getPosition().x, node.getPosition().y-node.getSize().height/2+posY+this.PORT_HEIGHT/2 + this.PORT_INTERVAL);
            // this.dataModel.add(fiberNode);
            // this.CONN_NODE_LIST.push(fiberNode);
            // posY+= this.PORT_HEIGHT + this.PORT_INTERVAL;
            // preNode = fiberNode;

            //端口分为左右连接点
            let fiberALabelNode = new ht.Node();
            fiberALabelNode.visible = true;
            fiberALabelNode.movable = this.IS_MOVE;
            fiberALabelNode.setHost(preNode);
            fiberALabelNode.setParent(node);
            fiberALabelNode.setAttrObject(fiberInfo);
            fiberALabelNode.setName(fiberInfo.GROUP_MAX ? fiberInfo.GROUP_MIN + ':' + fiberInfo.GROUP_MAX : fiberInfo.seq);
            fiberALabelNode.setLayer(LAYER2);
            fiberALabelNode.setToolTip(fiberInfo.GROUP_MAX ? fiberInfo.GROUP_MIN + ':' + fiberInfo.GROUP_MAX : fiberInfo.fullName || fiberInfo.name);
            fiberALabelNode.setStyle('shape', 'rect');
            fiberALabelNode.setStyle('shape.background', '#ffffff');
            fiberALabelNode.setStyle('shape.border.width', 1);
            fiberALabelNode.setStyle('shape.border.color', '#000000');
            fiberALabelNode.setStyle('label.font', '3px Tahoma');
            fiberALabelNode.setStyle('label.position', 17);
            fiberALabelNode.setStyle('label.color', 'black');
            fiberALabelNode.setStyle('label.scale', 1);
            fiberALabelNode.setSize(this.DEV_WIDTH / 8, fiberInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL);
            fiberALabelNode.setPosition(
              tubeNode.getPosition().x - tubeNode.getSize().width / 2 - fiberALabelNode.getSize().width / 2,
              tubeNode.getPosition().y - tubeNode.getSize().height / 2 + tubeFiberrOffsetY + fiberALabelNode.getSize().height / 2,
            );
            this.dataModel.add(fiberALabelNode);
            preNode = fiberALabelNode;
            let fiberZLabelNode = new ht.Node();
            fiberZLabelNode.visible = true;
            fiberZLabelNode.movable = this.IS_MOVE;
            fiberZLabelNode.setHost(preNode);
            fiberZLabelNode.setParent(node);
            fiberZLabelNode.setAttrObject(fiberInfo);
            fiberZLabelNode.setName(fiberInfo.GROUP_MAX ? fiberInfo.GROUP_MIN + ':' + fiberInfo.GROUP_MAX : fiberInfo.seq);
            fiberZLabelNode.setLayer(LAYER2);
            fiberZLabelNode.setToolTip(fiberInfo.GROUP_MAX ? fiberInfo.GROUP_MIN + ':' + fiberInfo.GROUP_MAX : fiberInfo.fullName || fiberInfo.name);
            fiberZLabelNode.setStyle('shape', 'rect');
            fiberZLabelNode.setStyle('shape.background', '#ffffff');
            fiberZLabelNode.setStyle('shape.border.width', 1);
            fiberZLabelNode.setStyle('shape.border.color', '#000000');
            fiberZLabelNode.setStyle('label.font', '3px Tahoma');
            fiberZLabelNode.setStyle('label.position', 17);
            fiberZLabelNode.setStyle('label.color', 'black');
            fiberZLabelNode.setStyle('label.scale', 1);
            fiberZLabelNode.setSize(this.DEV_WIDTH / 8, fiberInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL);
            fiberZLabelNode.setPosition(
              tubeNode.getPosition().x + tubeNode.getSize().width / 2 + fiberZLabelNode.getSize().width / 2,
              tubeNode.getPosition().y - tubeNode.getSize().height / 2 + tubeFiberrOffsetY + fiberZLabelNode.getSize().height / 2,
            );
            this.dataModel.add(fiberZLabelNode);
            tubeFiberrOffsetY += fiberALabelNode.getSize().height;
            preNode = fiberZLabelNode;

            //绘制连接点
            let tubeAFiberNode = new ht.Node();
            tubeAFiberNode.visible = false;
            tubeAFiberNode.movable = this.IS_MOVE;
            fiberInfo.NODE_ID = fiberInfo.unitId;
            fiberInfo.PARENT_NAME = cableInfo.name;
            tubeAFiberNode.LINK_NODE_ID = fiberInfo.unitId;
            tubeAFiberNode.setTag(fiberInfo.NODE_ID + '_A');
            tubeAFiberNode.setHost(preNode);
            tubeAFiberNode.setParent(node);
            tubeAFiberNode.setAttrObject(fiberInfo);
            // hardwareAPortNode.setName(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.seq);
            tubeAFiberNode.setLayer(LAYER2);
            // hardwareAPortNode.setToolTip(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.fullName || hardwarePortInfo.name);
            tubeAFiberNode.setStyle('shape', 'rect');
            tubeAFiberNode.setStyle('shape.background', '#ffffff');
            tubeAFiberNode.setStyle('shape.border.width', 1);
            tubeAFiberNode.setStyle('shape.border.color', '#000000');
            tubeAFiberNode.setStyle('label.font', '4px Tahoma');
            tubeAFiberNode.setStyle('label.position', 17);
            tubeAFiberNode.setStyle('label.color', 'red');
            tubeAFiberNode.setStyle('label.scale', 1);
            tubeAFiberNode.setSize(fiberALabelNode.getSize().width / 2, this.PORT_HEIGHT / 2);
            tubeAFiberNode.setPosition(
              fiberALabelNode.getPosition().x - fiberALabelNode.getSize().width / 2 - tubeAFiberNode.getSize().width / 2,
              fiberALabelNode.getPosition().y,
            );
            this.dataModel.add(tubeAFiberNode);
            this.CONN_NODE_LIST.push(tubeAFiberNode);
            preNode = tubeAFiberNode;
            let tubeZFiberNode = new ht.Node();
            tubeZFiberNode.visible = false;
            tubeZFiberNode.movable = this.IS_MOVE;
            fiberInfo.NODE_ID = fiberInfo.unitId;
            fiberInfo.PARENT_NAME = cableInfo.name;
            tubeZFiberNode.LINK_NODE_ID = fiberInfo.unitId;
            tubeZFiberNode.setTag(fiberInfo.NODE_ID + '_Z');
            tubeZFiberNode.setHost(preNode);
            tubeZFiberNode.setParent(node);
            tubeZFiberNode.setAttrObject(fiberInfo);
            // hardwareAPortNode.setName(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.seq);
            tubeZFiberNode.setLayer(LAYER2);
            // hardwareAPortNode.setToolTip(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.fullName || hardwarePortInfo.name);
            tubeZFiberNode.setStyle('shape', 'rect');
            tubeZFiberNode.setStyle('shape.background', '#ffffff');
            tubeZFiberNode.setStyle('shape.border.width', 1);
            tubeZFiberNode.setStyle('shape.border.color', '#000000');
            tubeZFiberNode.setStyle('label.font', '4px Tahoma');
            tubeZFiberNode.setStyle('label.position', 17);
            tubeZFiberNode.setStyle('label.color', 'red');
            tubeZFiberNode.setStyle('label.scale', 1);
            tubeZFiberNode.setSize(fiberZLabelNode.getSize().width / 2, this.PORT_HEIGHT / 2);
            tubeZFiberNode.setPosition(
              fiberZLabelNode.getPosition().x + fiberZLabelNode.getSize().width / 2 + tubeZFiberNode.getSize().width / 2,
              fiberZLabelNode.getPosition().y,
            );
            this.dataModel.add(tubeZFiberNode);
            this.CONN_NODE_LIST.push(tubeZFiberNode);
            preNode = tubeZFiberNode;
          });
        });
        node.setHost(preNode);
      });
      this.DEV_LIST.forEach(devinfo => {
        //绘制设备节点
        let node = new ht.Node();
        node.movable = this.IS_MOVE;
        node.visible = true;
        node.RES_SPEC_ID = 'DEV';
        node.setName(devinfo.name);
        node.setToolTip(devinfo.fullName || devinfo.name);
        node.setStyle('shape', 'rect'); //矩形
        node.setStyle('shape.background', '#D4D4D4');
        node.setStyle('shape.border.width', 2);
        node.setStyle('shape.border.color', '#0026ff');
        node.setStyle('label.font', '20px Tahoma');
        node.setStyle('label.position', 3);
        if (devinfo.W && devinfo.H) {
          node.setSize(Number(devinfo.W), Number(devinfo.H));
        } else {
          node.setSize(devinfo.WIDTH, devinfo.HEIGHT);
        }
        if (devinfo.VH) {
          devinfo.VIR_AREA_HEIGHT = devinfo.VH;
        }
        node.setTag(devinfo.deviceId);
        if (!devinfo.X_NUMBER && devinfo.X_NUMBER != 0) {
          devinfo.X_NUMBER = -1;
        }
        if (!devinfo.Y_POS) {
          devinfo.Y_POS = 0;
        }
        if (devinfo.X && devinfo.Y) {
          node.setPosition(Number(devinfo.X), Number(devinfo.Y));
        } else {
          node.setPosition(devinfo.X_POS, devinfo.Y_POS);
        }
        node.setLayer(LAYER0);
        node.setAttrObject(devinfo);
        this.dataModel.add(node);
        this.NODE_LIST.push(node);

        let preNode = node;

        //绘制设备内的端口
        //首先绘制虚拟框，区分设备内的其它资源
        //let devPortList = devinfo.PORT_LIST ||[];
        let devHardwareList = devinfo.HARDWARE_LIST || [];
        let portArea = new ht.Node();
        portArea.movable = this.IS_MOVE;
        portArea.visible = false;
        portArea.setHost(preNode);
        portArea.setParent(node);
        portArea.setLayer(LAYER1);
        portArea.setStyle('shape', 'rect'); //矩形
        portArea.setStyle('shape.background', '#D4D4D4');
        portArea.setStyle('shape.border.width', 2);
        portArea.setStyle('shape.border.color', '#0026ff');
        portArea.setSize(this.DEV_WIDTH, devinfo.HARDWARE_HEIGHT);
        portArea.setPosition(
          node.getPosition().x - node.getSize().width / 2 + devinfo.LEFT_WIDTH + this.DEV_WIDTH / 2,
          node.getPosition().y - node.getSize().height / 2 + portArea.getSize().height / 2,
        );
        this.dataModel.add(portArea);
        preNode = portArea;
        node.CHILD_NODE = portArea;
        let hardwareOffetY = this.PORT_INTERVAL;
        devHardwareList.forEach((devhardwareInfo, index) => {
          let hardwarePortList = devhardwareInfo.PORT_LIST || [];
          //绘制硬件区域
          let harewareNode = new ht.Node();
          harewareNode.visible = true;
          harewareNode.movable = this.IS_MOVE;
          harewareNode.setTag(devhardwareInfo.hardwareId);
          harewareNode.setHost(preNode);
          harewareNode.setParent(node);
          harewareNode.setAttrObject(devhardwareInfo);
          harewareNode.setName(
            devhardwareInfo.PARENT_SEQ ? devhardwareInfo.PARENT_SEQ : devhardwareInfo.nameSeq ? devhardwareInfo.nameSeq : devhardwareInfo.name,
          );
          harewareNode.setLayer(LAYER2);
          harewareNode.setToolTip(devhardwareInfo.fullName);
          harewareNode.setStyle('shape', 'rect');
          harewareNode.setStyle('shape.background', '#fc02eb');
          harewareNode.setStyle('shape.border.width', 1);
          harewareNode.setStyle('shape.border.color', '#000000');
          harewareNode.setStyle('label.font', '4px Tahoma');
          harewareNode.setStyle('label.position', 17);
          harewareNode.setStyle('label.color', 'black');
          harewareNode.setStyle('label.scale', 1);
          harewareNode.setSize(this.DEV_WIDTH / 4, devhardwareInfo.HEIGHT);
          harewareNode.setPosition(
            node.getPosition().x - node.getSize().width / 2 + devinfo.LEFT_WIDTH + this.DEV_WIDTH / 2,
            node.getPosition().y - node.getSize().height / 2 + harewareNode.getSize().height / 2 + hardwareOffetY,
          );
          this.dataModel.add(harewareNode);
          hardwareOffetY += harewareNode.getSize().height;
          preNode = harewareNode;

          let hardwarePortOffsetY = 0;
          hardwarePortList.forEach(hardwarePortInfo => {
            //端口分为左右连接点
            let portALabelNode = new ht.Node();
            portALabelNode.visible = true;
            portALabelNode.movable = this.IS_MOVE;
            portALabelNode.setHost(preNode);
            portALabelNode.setParent(node);
            portALabelNode.setAttrObject(hardwarePortInfo);
            portALabelNode.setName(hardwarePortInfo.GROUP_MAX ? hardwarePortInfo.GROUP_MIN + ':' + hardwarePortInfo.GROUP_MAX : hardwarePortInfo.seq);
            portALabelNode.setLayer(LAYER2);
            portALabelNode.setToolTip(
              hardwarePortInfo.GROUP_MAX
                ? hardwarePortInfo.GROUP_MIN + ':' + hardwarePortInfo.GROUP_MAX
                : hardwarePortInfo.fullName || hardwarePortInfo.name,
            );
            portALabelNode.setStyle('shape', 'rect');
            portALabelNode.setStyle('shape.background', '#ffffff');
            portALabelNode.setStyle('shape.border.width', 1);
            portALabelNode.setStyle('shape.border.color', '#000000');
            portALabelNode.setStyle('label.font', '3px Tahoma');
            portALabelNode.setStyle('label.position', 17);
            portALabelNode.setStyle('label.color', 'black');
            portALabelNode.setStyle('label.scale', 1);
            portALabelNode.setSize(this.DEV_WIDTH / 8, hardwarePortInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL);
            portALabelNode.setPosition(
              harewareNode.getPosition().x - harewareNode.getSize().width / 2 - portALabelNode.getSize().width / 2,
              harewareNode.getPosition().y - harewareNode.getSize().height / 2 + hardwarePortOffsetY + portALabelNode.getSize().height / 2,
            );
            this.dataModel.add(portALabelNode);
            preNode = portALabelNode;
            let portZLabelNode = new ht.Node();
            portZLabelNode.visible = true;
            portZLabelNode.movable = this.IS_MOVE;
            portZLabelNode.setHost(preNode);
            portZLabelNode.setParent(node);
            portZLabelNode.setAttrObject(hardwarePortInfo);
            portZLabelNode.setName(hardwarePortInfo.GROUP_MAX ? hardwarePortInfo.GROUP_MIN + ':' + hardwarePortInfo.GROUP_MAX : hardwarePortInfo.seq);
            portZLabelNode.setLayer(LAYER2);
            portZLabelNode.setToolTip(
              hardwarePortInfo.GROUP_MAX
                ? hardwarePortInfo.GROUP_MIN + ':' + hardwarePortInfo.GROUP_MAX
                : hardwarePortInfo.fullName || hardwarePortInfo.name,
            );
            portZLabelNode.setStyle('shape', 'rect');
            portZLabelNode.setStyle('shape.background', '#ffffff');
            portZLabelNode.setStyle('shape.border.width', 1);
            portZLabelNode.setStyle('shape.border.color', '#000000');
            portZLabelNode.setStyle('label.font', '3px Tahoma');
            portZLabelNode.setStyle('label.position', 17);
            portZLabelNode.setStyle('label.color', 'black');
            portZLabelNode.setStyle('label.scale', 1);
            portZLabelNode.setSize(this.DEV_WIDTH / 8, hardwarePortInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL);
            portZLabelNode.setPosition(
              harewareNode.getPosition().x + harewareNode.getSize().width / 2 + portALabelNode.getSize().width / 2,
              harewareNode.getPosition().y - harewareNode.getSize().height / 2 + hardwarePortOffsetY + portALabelNode.getSize().height / 2,
            );
            this.dataModel.add(portZLabelNode);
            hardwarePortOffsetY += portALabelNode.getSize().height;
            preNode = portZLabelNode;

            //绘制连接点
            let hardwareAPortNode = new ht.Node();
            hardwareAPortNode.visible = false;
            hardwareAPortNode.movable = this.IS_MOVE;
            hardwarePortInfo.NODE_ID = hardwarePortInfo.portId;
            hardwareAPortNode.LINK_NODE_ID = hardwarePortInfo.portId;
            hardwarePortInfo.PARENT_NAME = devinfo.name;
            hardwareAPortNode.setTag(hardwarePortInfo.NODE_ID + '_A');
            hardwareAPortNode.setHost(preNode);
            hardwareAPortNode.setParent(node);
            hardwareAPortNode.setAttrObject(hardwarePortInfo);
            // hardwareAPortNode.setName(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.seq);
            hardwareAPortNode.setLayer(LAYER2);
            // hardwareAPortNode.setToolTip(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.fullName || hardwarePortInfo.name);
            hardwareAPortNode.setStyle('shape', 'rect');
            hardwareAPortNode.setStyle('shape.background', '#ffffff');
            hardwareAPortNode.setStyle('shape.border.width', 1);
            hardwareAPortNode.setStyle('shape.border.color', '#000000');
            hardwareAPortNode.setStyle('label.font', '4px Tahoma');
            hardwareAPortNode.setStyle('label.position', 17);
            hardwareAPortNode.setStyle('label.color', 'red');
            hardwareAPortNode.setStyle('label.scale', 1);
            hardwareAPortNode.setSize(portALabelNode.getSize().width / 2, this.PORT_HEIGHT / 2);
            hardwareAPortNode.setPosition(
              portALabelNode.getPosition().x - portALabelNode.getSize().width / 2 - hardwareAPortNode.getSize().width / 2,
              portALabelNode.getPosition().y,
            );
            this.dataModel.add(hardwareAPortNode);
            this.CONN_NODE_LIST.push(hardwareAPortNode);
            preNode = hardwareAPortNode;
            let hardwareZPortNode = new ht.Node();
            hardwareZPortNode.visible = false;
            hardwareZPortNode.movable = this.IS_MOVE;
            hardwarePortInfo.NODE_ID = hardwarePortInfo.portId;
            hardwareZPortNode.LINK_NODE_ID = hardwarePortInfo.portId;
            hardwarePortInfo.PARENT_NAME = devinfo.name;
            hardwareZPortNode.setTag(hardwarePortInfo.NODE_ID + '_Z');
            hardwareZPortNode.setHost(preNode);
            hardwareZPortNode.setParent(node);
            hardwareZPortNode.setAttrObject(hardwarePortInfo);
            // hardwareAPortNode.setName(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.seq);
            hardwareZPortNode.setLayer(LAYER2);
            // hardwareAPortNode.setToolTip(hardwarePortInfo.GROUP_MAX?hardwarePortInfo.GROUP_MIN+"->"+hardwarePortInfo.GROUP_MAX:hardwarePortInfo.fullName || hardwarePortInfo.name);
            hardwareZPortNode.setStyle('shape', 'rect');
            hardwareZPortNode.setStyle('shape.background', '#ffffff');
            hardwareZPortNode.setStyle('shape.border.width', 1);
            hardwareZPortNode.setStyle('shape.border.color', '#000000');
            hardwareZPortNode.setStyle('label.font', '4px Tahoma');
            hardwareZPortNode.setStyle('label.position', 17);
            hardwareZPortNode.setStyle('label.color', 'red');
            hardwareZPortNode.setStyle('label.scale', 1);
            hardwareZPortNode.setSize(portZLabelNode.getSize().width / 2, this.PORT_HEIGHT / 2);
            hardwareZPortNode.setPosition(
              portZLabelNode.getPosition().x + portZLabelNode.getSize().width / 2 + hardwareZPortNode.getSize().width / 2,
              portZLabelNode.getPosition().y,
            );
            this.dataModel.add(hardwareZPortNode);
            this.CONN_NODE_LIST.push(hardwareZPortNode);
            preNode = hardwareZPortNode;
          });
        });

        //绘制设备内的分光器
        //绘制分光器区域
        let devRelaDevList = devinfo.RELA_DEV_LIST || [];
        let relaDevArea = new ht.Node();
        relaDevArea.visible = false;
        relaDevArea.movable = this.IS_MOVE;
        relaDevArea.setHost(preNode);
        relaDevArea.setParent(node);
        relaDevArea.setLayer(LAYER1);
        relaDevArea.setStyle('shape', 'rect'); //矩形
        relaDevArea.setStyle('shape.background', '#D4D4D4');
        relaDevArea.setStyle('shape.border.width', 2);
        relaDevArea.setStyle('shape.border.color', '#0026ff');
        relaDevArea.setSize(this.DEV_WIDTH, devinfo.RELA_DEV_HEIGHT);
        relaDevArea.setPosition(
          node.getPosition().x - node.getSize().width / 2 + devinfo.LEFT_WIDTH + devinfo.HARDWARE_WIDTH + devinfo.INNER_WIDTH + this.DEV_WIDTH / 2,
          node.getPosition().y - node.getSize().height / 2 + portArea.getSize().height + devinfo.RELA_DEV_HEIGHT / 2,
        );
        this.dataModel.add(relaDevArea);
        preNode = relaDevArea;
        let relaDevPosY = 0;
        devRelaDevList.forEach((relaDevinfo, index) => {
          let relaDevPortList = relaDevinfo.PORT_LIST || [];
          //绘制分光器
          let relaDevNode = new ht.Node();
          relaDevNode.visible = true;
          relaDevNode.movable = this.IS_MOVE;
          relaDevNode.setHost(preNode);
          relaDevNode.setParent(node);
          relaDevNode.setName('1:' + ((relaDevinfo.OLD_PORT_LIST || []).length > 0 ? (relaDevinfo.OLD_PORT_LIST || []).length - 1 : 0));
          relaDevNode.setToolTip(relaDevinfo.fullName || relaDevinfo.name);
          relaDevNode.setStyle('shape', 'triangle');
          relaDevNode.setStyle('shape.background', '#D4D4D4');
          relaDevNode.setStyle('shape.border.width', 2);
          relaDevNode.setStyle('shape.border.color', '#0026ff');
          relaDevNode.setStyle('label.font', '6px Tahoma');
          relaDevNode.setStyle('label.position', 17);
          relaDevNode.setStyle('label.color', 'red');
          relaDevNode.setStyle('label.scale', 1);
          relaDevNode.setRotation(-Math.PI / 2);
          relaDevNode.setStyle('label.position', 48);
          relaDevNode.setSize(relaDevPortList.length * (this.PORT_HEIGHT + this.PORT_INTERVAL) + this.PORT_INTERVAL, this.DEV_WIDTH / 2);
          relaDevNode.setPosition(
            relaDevArea.getPosition().x,
            relaDevArea.getPosition().y - relaDevArea.getSize().height / 2 + relaDevNode.getSize().width / 2 + relaDevPosY + this.PORT_INTERVAL,
          );
          relaDevNode.setLayer(LAYER2);
          relaDevNode.setAttrObject(relaDevinfo);
          this.dataModel.add(relaDevNode);
          relaDevPosY += relaDevNode.getSize().width + this.PORT_INTERVAL;
          preNode = relaDevNode;

          //绘制分光器的端口
          let portPosY = 0;
          relaDevPortList.forEach(relaDevPortInfo => {
            let portNode = new ht.Node();
            portNode.visible = true;
            portNode.movable = this.IS_MOVE;
            relaDevPortInfo.NODE_ID = relaDevPortInfo.portId;
            relaDevPortInfo.PARENT_NAME = relaDevinfo.name;
            relaDevPortInfo.PARENT_DEV_ID = relaDevinfo.relaDeviceId;
            portNode.setTag(relaDevPortInfo.NODE_ID);
            portNode.setHost(preNode);
            portNode.setParent(node);
            portNode.setAttrObject(relaDevPortInfo);
            portNode.setName(relaDevPortInfo.GROUP_MAX ? relaDevPortInfo.GROUP_MIN + ':' + relaDevPortInfo.GROUP_MAX : relaDevPortInfo.seq);
            portNode.setLayer(LAYER3);
            portNode.setToolTip(
              relaDevPortInfo.GROUP_MAX
                ? relaDevPortInfo.GROUP_MIN + ':' + relaDevPortInfo.GROUP_MAX
                : relaDevPortInfo.fullName || relaDevPortInfo.name,
            );
            portNode.setStyle('shape', 'circle');
            portNode.setStyle('shape.background', '#D4D4D4');
            portNode.setStyle('shape.border.width', 1);
            portNode.setStyle('shape.border.color', '#000000');
            portNode.setStyle('label.font', '4px Tahoma');
            // portNode.setStyle("label.position", relaDevPortInfo.GROUP_MAX?20:17);
            portNode.setStyle('label.position', 17);
            portNode.setStyle('label.color', 'red');
            portNode.setStyle('label.scale', 1);
            portNode.setSize(this.PORT_HEIGHT, this.PORT_HEIGHT);
            if (relaDevPortInfo.portUse == '1') {
              portNode.setPosition(relaDevNode.getPosition().x - this.DEV_WIDTH / 4 - portNode.getSize().width / 2, relaDevNode.getPosition().y);
            } else {
              portNode.setPosition(
                relaDevNode.getPosition().x + this.DEV_WIDTH / 4 + portNode.getSize().width / 1,
                relaDevNode.getPosition().y -
                  relaDevNode.getSize().width / 2 +
                  portPosY +
                  portNode.getSize().height / 2 +
                  this.PORT_INTERVAL -
                  portNode.getSize().height / 2,
              );
            }
            this.dataModel.add(portNode);
            this.CONN_NODE_LIST.push(portNode);
            portPosY += portNode.getSize().height + this.PORT_INTERVAL;
            preNode = portNode;
          });
        });

        //绘制融接区域虚拟点
        let virResNodeList = [];
        let unitNodePosY = 0;
        // this.CONN_LIST.forEach(connInfo=>{
        //     let ccList = connInfo.cblunitCblunitList||[];
        // 	ccList.sort(function (a,b){
        // 		return a.A_SEQ - b.A_SEQ;
        // 	})
        //     ccList.forEach(ccInfo=>{
        //         if(ccInfo.deviceId == devinfo.deviceId){
        // 			virResNodeList.push(ccInfo);
        //             let portNode = new ht.Node();
        //             portNode.visible = true;
        // 			portNode.movable=this.IS_MOVE;
        //             ccInfo.NODE_ID = ccInfo.deviceId+"_"+ccInfo.aUnitId+"_"+ccInfo.zUnitId;
        //             portNode.setTag(ccInfo.NODE_ID);
        //             portNode.setHost(preNode);
        //             portNode.setParent(node);
        //             portNode.setAttrObject(ccInfo);
        //             portNode.setName(ccInfo.name);
        //             portNode.setLayer(LAYER2);
        //             portNode.setToolTip(ccInfo.fullName || ccInfo.name);
        //             portNode.setStyle("shape", "circle");
        //             portNode.setStyle('shape.background', '#D4D4D4');
        //             portNode.setStyle('shape.border.width', 1);
        //             portNode.setStyle('shape.border.color', '#000000');
        //             portNode.setStyle('label.font', '4px Tahoma');
        //             portNode.setStyle("label.position", 17);
        //             portNode.setStyle('label.color', 'red');
        //             portNode.setStyle('label.scale',1);
        //             portNode.setSize(this.PORT_HEIGHT, this.PORT_HEIGHT);
        //             portNode.setPosition(node.getPosition().x, relaDevArea.getPosition().y+relaDevArea.getSize().height/2+unitNodePosY+this.PORT_HEIGHT/2+this.PORT_INTERVAL);
        //             this.dataModel.add(portNode);
        //             this.CONN_NODE_LIST.push(portNode);
        // 			unitNodePosY+=portNode.getSize().height + this.PORT_INTERVAL;
        // 			preNode = portNode;
        //         }
        //     });
        // });

        let virNodeList = devinfo.VIR_NODE_LIST || [];
        let aCountPosY = unitNodePosY;
        let zCountPosY = unitNodePosY;
        virNodeList.forEach(virNodeInfo => {
          let unitNode = this.dataModel.getDataByTag(virNodeInfo.TARGET_NODE_ID);
          let portNode = new ht.Node();
          portNode.visible = true;
          portNode.movable = false;
          portNode.IS_DEV_VIR_NODE = true;
          portNode.setTag(virNodeInfo.NODE_ID);
          portNode.setHost(unitNode);
          portNode.setParent(node);
          portNode.setAttrObject(virNodeInfo);
          //portNode.setName(virNodeInfo.GROUP_MAX?virNodeInfo.GROUP_MIN+":"+virNodeInfo.GROUP_MAX:virNodeInfo.seq);
          portNode.setLayer(LAYER2);
          //portNode.setToolTip(virNodeInfo.GROUP_MAX?virNodeInfo.GROUP_MIN+"->"+virNodeInfo.GROUP_MAX:virNodeInfo.seq);
          //portNode.setStyle("shape", "circle");
          portNode.setImage('oss_core/edesign/assets/image/topo-business/res/VIR_UNIT.png');
          // portNode.setStyle('shape.background', '#D4D4D4');
          // portNode.setStyle('shape.border.width', 1);
          // portNode.setStyle('shape.border.color', '#000000');
          portNode.setStyle('label.font', '4px Tahoma');
          portNode.setStyle('label.position', 17);
          portNode.setStyle('label.color', 'red');
          portNode.setStyle('label.scale', 1);
          portNode.setSize(this.PORT_HEIGHT, this.PORT_HEIGHT);
          if (virNodeInfo.IS_A_NODE) {
            // portNode.setPosition(node.getPosition().x - devinfo.WIDTH/2 + 20, node.getPosition().y-node.getSize().height/2+aCountPosY+this.PORT_HEIGHT/2+this.PORT_INTERVAL);
            portNode.setPosition(node.getPosition().x - devinfo.WIDTH / 2 + 20, unitNode.getPosition().y);
            aCountPosY += portNode.getSize().height + this.PORT_INTERVAL;
          } else {
            // portNode.setPosition(node.getPosition().x + devinfo.WIDTH/2-20, node.getPosition().y-node.getSize().height/2+zCountPosY+this.PORT_HEIGHT/2+this.PORT_INTERVAL);
            portNode.setPosition(node.getPosition().x + devinfo.WIDTH / 2 - 20, unitNode.getPosition().y);
            zCountPosY += portNode.getSize().height + this.PORT_INTERVAL;
          }
          this.dataModel.add(portNode);
          this.CONN_NODE_LIST.push(portNode);
          unitNodePosY += portNode.getSize().height + this.PORT_INTERVAL;
          //preNode = portNode;
        });

        node.setHost(preNode);
      });
      //绘制连接
      this.CONN_LIST.forEach(connInfo => {
        let jumpList = connInfo.jump || [];
        let ccList = connInfo.cblunitCblunitList || [];
        let pcList = connInfo.portCblunitList || [];
        //绘制跳接
        jumpList.forEach(jumpInfo => {
          let aResId = jumpInfo.aPortId;
          let zResId = jumpInfo.zPortId;
          let targerNode = this.get2PortNode(aResId, zResId);
          let aNode = targerNode.NODE_A;
          let zNode = targerNode.NODE_Z;
          if (aNode && zNode && !this.dataModel.getDataByTag(jumpInfo.linkId)) {
            aNode.visible = true;
            zNode.visible = true;
            jumpInfo.LINK_ID = jumpInfo.linkId;
            let edge = new ht.Edge();
            edge.visible = true;
            edge.setToolTip(jumpInfo.fullName || jumpInfo.name);
            edge.setTag(jumpInfo.linkId);
            let aName = aNode.getAttrObject().PARENT_NAME + ': ' + aNode.getAttrObject().name;
            let zName = zNode.getAttrObject().PARENT_NAME + ': ' + zNode.getAttrObject().name;
            if (aNode.getPosition().x > zNode.getPosition().x) {
              edge.setSource(zNode);
              edge.setTarget(aNode);
              edge.setName(zName + '->' + aName);
              jumpInfo.A_NAME = zName;
              jumpInfo.Z_NAME = aName;
            } else {
              edge.setSource(aNode);
              edge.setTarget(zNode);
              edge.setName(aName + '->' + zName);
              jumpInfo.A_NAME = aName;
              jumpInfo.Z_NAME = zName;
            }
            edge.setAttrObject(jumpInfo);
            edge.setStyle('label.position', this.LINK_LABEL_POSITION1);
            edge.setStyle('edge.type', 'points');
            edge.setStyle('edge.points', jumpInfo.POINTS ? jumpInfo.POINTS : this.getPoints(edge.getSource(), edge.getTarget()));
            edge.setStyle('select.color', 'red');
            edge.setStyle('select.width', 1);
            // edge.setStyle('label.align', 'left');
            edge.setStyle('label.offset.x', 50);
            edge.setStyle('edge.target.position', 17);
            edge.setStyle('edge.source.position', 17);
            edge.setStyle('edge.source.anchor.x', 1);
            edge.setStyle('edge.source.anchor.y', 0.5);
            edge.setStyle('edge.target.anchor.x', 0);
            edge.setStyle('edge.target.anchor.y', 0.5);
            edge.setStyle('label.font', '4px Tahoma');
            edge.setStyle('edge.width', this.LINK_SIZE);
            edge.setLayer(LAYER3);
            edge.LINK_POSITION = 'CENTER';
            let points = edge.getStyle('edge.points')._as || [];
            if (points.length > 0) {
              if (!aNode.getParent().getAttrObject().INNER_POINTS_LINK_NUM) {
                aNode.getParent().getAttrObject().INNER_POINTS_LINK_NUM = 1;
              } else {
                aNode.getParent().getAttrObject().INNER_POINTS_LINK_NUM++;
              }
            }
            this.dataModel.add(edge);
            this.CONN_LINK_LIST.push(edge);
          }
        });
        pcList.forEach(pcInfo => {
          let zResId = pcInfo.unitId + '_V';
          let aResId = pcInfo.portId;
          let targerNode = this.get2PortNode(aResId, zResId);
          let aNode = targerNode.NODE_A;
          let zNode = targerNode.NODE_Z;
          // let zNode = this.dataModel.getDataByTag(zResId);
          // let aNode = this.getPortNode(aResId, zNode);
          if (aNode && zNode && !this.dataModel.getDataByTag(pcInfo.terminationId)) {
            aNode.visible = true;
            zNode.visible = true;
            pcInfo.LINK_ID = pcInfo.terminationId;
            let edge = new ht.Edge();
            edge.visible = true;
            edge.setToolTip(pcInfo.fullName || pcInfo.name);
            edge.setTag(pcInfo.terminationId);
            let aName = aNode.getAttrObject().PARENT_NAME + ': ' + aNode.getAttrObject().name;
            let zName = zNode.getAttrObject().PARENT_NAME + ': ' + zNode.getAttrObject().name;
            if (aNode.getPosition().x > zNode.getPosition().x) {
              edge.setSource(zNode);
              edge.setTarget(aNode);
              edge.setName(zName + '->' + aName);
              pcInfo.A_NAME = aName;
              pcInfo.Z_NAME = zName;
            } else {
              edge.setSource(aNode);
              edge.setTarget(zNode);
              edge.setName(aName + '->' + zName);
              pcInfo.A_NAME = aName;
              pcInfo.Z_NAME = zName;
            }
            edge.setAttrObject(pcInfo);
            edge.setStyle('label.position', this.LINK_LABEL_POSITION1);
            edge.setStyle('edge.type', 'points');
            edge.setStyle('edge.points', pcInfo.POINTS ? pcInfo.POINTS : this.getPoints(edge.getSource(), edge.getTarget()));
            edge.setLayer(LAYER3);
            edge.setStyle('select.color', 'red');
            edge.setStyle('select.width', 1);
            // edge.setStyle('label.align', 'left');
            edge.setStyle('label.offset.x', 50);
            edge.setStyle('edge.target.position', 17);
            edge.setStyle('edge.source.position', 17);
            edge.setStyle('edge.source.anchor.x', 1);
            edge.setStyle('edge.source.anchor.y', 0.5);
            edge.setStyle('edge.target.anchor.x', 0);
            edge.setStyle('edge.target.anchor.y', 0.5);
            edge.setStyle('label.font', '4px Tahoma');
            edge.setStyle('edge.width', this.LINK_SIZE);
            let points = edge.getStyle('edge.points')._as || [];
            if ((aNode.IS_DEV_VIR_NODE && aNode.getAttrObject().IS_A_NODE) || (zNode.IS_DEV_VIR_NODE && zNode.getAttrObject().IS_A_NODE)) {
              edge.LINK_POSITION = 'LEFT';
              if (points.length > 0) {
                if (!zNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM) {
                  zNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM = 1;
                } else {
                  zNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM++;
                }
              }
            } else {
              edge.LINK_POSITION = 'RIGHT';
              if (points.length > 0) {
                if (!aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM) {
                  aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM = 1;
                } else {
                  aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM++;
                }
              }
            }
            this.dataModel.add(edge);
            this.CONN_LINK_LIST.push(edge);
          }
        });
        ccList.forEach(ccInfo => {
          let aResId = ccInfo.aUnitId + '_V';
          let zResId = ccInfo.zUnitId + '_V';
          let virResId = ccInfo.deviceId + '_' + ccInfo.aUnitId + '_' + ccInfo.zUnitId;
          let targerNode = this.get2PortNode(aResId, zResId);
          let aNode = targerNode.NODE_A;
          let zNode = targerNode.NODE_Z;
          // let aNode = this.dataModel.getDataByTag(aResId);
          // let zNode = this.dataModel.getDataByTag(zResId);
          if (aNode && zNode && !this.dataModel.getDataByTag(ccInfo.splicingId)) {
            aNode.visible = true;
            zNode.visible = true;
            ccInfo.LINK_ID = ccInfo.splicingId;
            let edge = new ht.Edge();
            edge.visible = true;
            edge.setToolTip(ccInfo.fullName || ccInfo.name);
            edge.setTag(ccInfo.splicingId);
            let aName = aNode.getAttrObject().PARENT_NAME + ': ' + aNode.getAttrObject().name;
            let zName = zNode.getAttrObject().PARENT_NAME + ': ' + zNode.getAttrObject().name;
            if (aNode.getPosition().x > zNode.getPosition().x) {
              edge.setSource(zNode);
              edge.setTarget(aNode);
              edge.setName(zName + '->' + aName);
              ccInfo.A_NAME = aName;
              ccInfo.Z_NAME = zName;
            } else {
              edge.setSource(aNode);
              edge.setTarget(zNode);
              edge.setName(aName + '->' + zName);
              ccInfo.A_NAME = aName;
              ccInfo.Z_NAME = zName;
            }
            edge.setAttrObject(ccInfo);
            edge.setStyle('label.position', this.LINK_LABEL_POSITION1);
            edge.setStyle('edge.type', 'points');
            edge.setStyle('edge.points', ccInfo.POINTS ? ccInfo.POINTS : this.getPoints(edge.getSource(), edge.getTarget()));
            edge.setLayer(LAYER3);
            edge.setStyle('select.color', 'red');
            edge.setStyle('select.width', 1);
            // edge.setStyle('label.align', 'left');
            edge.setStyle('label.offset.x', 50);
            edge.setStyle('edge.target.position', 17);
            edge.setStyle('edge.source.position', 17);
            edge.setStyle('edge.source.anchor.x', 1);
            edge.setStyle('edge.source.anchor.y', 0.5);
            edge.setStyle('edge.target.anchor.x', 0);
            edge.setStyle('edge.target.anchor.y', 0.5);
            edge.setStyle('label.font', '4px Tahoma');
            edge.setStyle('edge.width', this.LINK_SIZE);
            edge.LINK_POSITION = 'ALL';
            let points = edge.getStyle('edge.points')._as || [];
            if (points.length === 4) {
              if (!aNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM) {
                aNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM = 1;
              } else {
                aNode.getParent().getAttrObject().LEFT_POINTS_LINK_NUM++;
              }
              if (!aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM) {
                aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM = 1;
              } else {
                aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM++;
              }
            } else if (points.length > 0) {
              if (!aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM) {
                aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM = 1;
              } else {
                aNode.getParent().getAttrObject().RIGHT_POINTS_LINK_NUM++;
              }
            }

            this.dataModel.add(edge);
            this.CONN_LINK_LIST.push(edge);
          }
        });
      });

      this.VIR_CONN_LIST.forEach(virVonnInfo => {
        let aResId = virVonnInfo.NODE_A;
        let zResId = virVonnInfo.NODE_Z;
        let targerNode = this.get2PortNode(aResId, zResId);
        let aNode = targerNode.NODE_A;
        let zNode = targerNode.NODE_Z;
        if (aNode && zNode && !this.dataModel.getDataByTag(virVonnInfo.LINK_ID)) {
          let edge = new ht.Edge();
          aNode.visible = true;
          zNode.visible = true;
          edge.visible = true;
          if (aNode.getPosition().x > zNode.getPosition().x) {
            edge.setSource(zNode);
            edge.setTarget(aNode);
          } else {
            edge.setSource(aNode);
            edge.setTarget(zNode);
          }
          edge.setTag(virVonnInfo.LINK_ID);
          edge.setAttrObject(virVonnInfo);
          edge.setStyle('label.position', this.LINK_LABEL_POSITION1);
          edge.setStyle('edge.type', 'points');
          edge.setStyle('edge.points', virVonnInfo.POINTS ? virVonnInfo.POINTS : this.getPoints(edge.getSource(), edge.getTarget()));
          edge.setStyle('select.color', 'red');
          edge.setStyle('select.width', 1);
          // edge.setStyle('label.align', 'left');
          edge.setStyle('label.offset.x', 50);
          edge.setStyle('edge.target.position', 17);
          edge.setStyle('edge.source.position', 17);
          edge.setStyle('edge.source.anchor.x', 1);
          edge.setStyle('edge.source.anchor.y', 0.5);
          edge.setStyle('edge.target.anchor.x', 0);
          edge.setStyle('edge.target.anchor.y', 0.5);
          edge.setStyle('label.font', '4px Tahoma');
          edge.setStyle('edge.width', this.LINK_SIZE);
          edge.setLayer(LAYER3);
          this.dataModel.add(edge);
          this.CONN_LINK_LIST.push(edge);
          if (this.dataModel.getDataByTag(virVonnInfo.cableId).LINK_LIST) {
            this.dataModel.getDataByTag(virVonnInfo.cableId).LINK_LIST.push(edge);
          } else {
            this.dataModel.getDataByTag(virVonnInfo.cableId).LINK_LIST = [];
            this.dataModel.getDataByTag(virVonnInfo.cableId).LINK_LIST.push(edge);
          }
        }
      });

      let self = this;
      setTimeout(function() {
        self.graphView.fitContent();
      });
    },
    getPortNode: function(portId, targetNode) {
      let portANode = this.dataModel.getDataByTag(portId + '_A');
      let portZNode = this.dataModel.getDataByTag(portId + '_Z');
      if (this.dataModel.getDataByTag(portId)) {
        return this.dataModel.getDataByTag(portId);
      } else if (portANode && !portANode.getEdges()) {
        if (targetNode) {
          if (portANode.getPosition().x > targetNode.getPosition().x) {
            return portANode;
          } else {
            return portZNode;
          }
        } else {
          return portANode;
        }
      } else if (portZNode) {
        return portZNode;
      } else {
        return null;
      }
    },
    get2PortNode: function(aPortId, zPortId) {
      let result = {};
      let aPortNode = this.dataModel.getDataByTag(aPortId);
      let aPortANode = this.dataModel.getDataByTag(aPortId + '_A');
      let aPortZNode = this.dataModel.getDataByTag(aPortId + '_Z');
      let zPortNode = this.dataModel.getDataByTag(zPortId);
      let zPortANode = this.dataModel.getDataByTag(zPortId + '_A');
      let zPortZNode = this.dataModel.getDataByTag(zPortId + '_Z');

      if (aPortNode) {
        result.NODE_A = aPortNode;
      } else if (
        aPortZNode &&
        aPortZNode.getPosition().x <
          (zPortNode ? zPortNode.getPosition().x : zPortANode ? zPortANode.getPosition().x : zPortZNode ? zPortZNode.getPosition().x : 9999)
      ) {
        result.NODE_A = aPortZNode;
      } else if (aPortANode) {
        result.NODE_A = aPortANode;
      }
      if (zPortNode) {
        result.NODE_Z = zPortNode;
      } else if (
        zPortZNode &&
        zPortZNode.getPosition().x <
          (aPortNode ? aPortNode.getPosition().x : aPortANode ? aPortANode.getPosition().x : aPortZNode ? aPortZNode.getPosition().x : 9999)
      ) {
        result.NODE_Z = zPortZNode;
      } else if (zPortANode) {
        result.NODE_Z = zPortANode;
      }
      return result;
    },
    getPoints: function(aNode, zNode) {
      let points = [];
      let offset = Math.abs(aNode.getPosition().x - zNode.getPosition().x) / 2;
      let offset1 = 100;
      // if(offset>100){
      // 	offset =100;
      // }
      let maxHeight = -9999;
      // let minHeight = 9999;
      if (aNode.IS_DEV_VIR_NODE && zNode.IS_DEV_VIR_NODE) {
        //融接的线需要特殊处理
        // this.CONN_NODE_LIST.forEach(node=>{
        // 	if(node.getPosition().x > (aNode.getPosition().x>zNode.getPosition().x?zNode.getPosition().x:aNode.getPosition().x)
        // 		&& node.getPosition().x < (aNode.getPosition().x>zNode.getPosition().x?aNode.getPosition().x:zNode.getPosition().x)
        // 		&& node !== aNode && node!==zNode && node.getParent()===aNode.getParent()
        // 	){
        // 		if(maxHeight<node.getPosition().y){
        // 			maxHeight = node.getPosition().y;
        // 		}
        // 		if(minHeight>node.getPosition().y){
        // 			minHeight = node.getPosition().y;
        // 		}
        // 	}
        // });
        let devNode = aNode.getParent();
        if (
          devNode.getAttrObject().RELA_DEV_HEIGHT > 0 &&
          devNode.getPosition().y - devNode.getSize().height / 2 + devNode.getAttrObject().RELA_DEV_HEIGHT > maxHeight
        ) {
          maxHeight = devNode.getPosition().y - devNode.getSize().height / 2 + devNode.getAttrObject().RELA_DEV_HEIGHT;
        }
        if (
          devNode.getAttrObject().HARDWARE_HEIGHT > 0 &&
          devNode.getPosition().y - devNode.getSize().height / 2 + devNode.getAttrObject().HARDWARE_HEIGHT > maxHeight
        ) {
          maxHeight = devNode.getPosition().y - devNode.getSize().height / 2 + devNode.getAttrObject().HARDWARE_HEIGHT;
        }
      }
      // if((maxHeight != -9999 || minHeight!=9999) && ((aNode.getPosition().y>minHeight && aNode.getPosition().y<maxHeight) || (zNode.getPosition().y>minHeight && zNode.getPosition().y<maxHeight))){
      if (maxHeight != -9999 && (aNode.getPosition().y < maxHeight || zNode.getPosition().y < maxHeight)) {
        //取最近的距离绕过去
        points = [
          {
            x: aNode.getPosition().x + offset1,
            y: aNode.getPosition().y,
          },
          {
            x: aNode.getPosition().x + offset1,
            y: maxHeight + 20,
          },
          {
            x: zNode.getPosition().x - offset1,
            y: maxHeight + 20,
          },
          {
            x: zNode.getPosition().x - offset1,
            y: zNode.getPosition().y,
          },
        ];
      } else if (aNode.getPosition().y === zNode.getPosition().y) {
        points = [];
      } else {
        points.push({
          x:
            zNode.getAttrObject().PARENT_DEV_ID && zNode.getAttrObject().portUse == '0'
              ? zNode.getPosition().x + offset
              : zNode.getPosition().x - offset,
          y: aNode.getPosition().y,
        });
        points.push({
          x:
            zNode.getAttrObject().PARENT_DEV_ID && zNode.getAttrObject().portUse == '0'
              ? zNode.getPosition().x + offset
              : zNode.getPosition().x - offset,
          y: zNode.getPosition().y,
        });
      }
      return points;
    },
    //初始化设备和cable节点的大小
    initSize: function() {
      //固定端口和纤芯的大小，然后计算cable和dev所需的高度，
      //根据最大高度计算坐标，根据实际需要计算大小，最大高度取所有dev和cable的最大高度
      let maxHeight = 0;
      this.DEV_LIST.forEach(devInfo => {
        //设备的计算高度分为，融接区，端口区，分光器区，高度均按端口数量来计算
        let height = 0;
        let hardwareAreaHeight = 0;
        let relaDevHeight = 0;
        let ccHeight = 0;
        let virNodeHeight = 0;

        let hardwareList = devInfo.HARDWARE_LIST || [];
        hardwareList.forEach(hardwareInfo => {
          let hardwareHeight = 0;
          let hardwarePortList = hardwareInfo.PORT_LIST || [];
          hardwarePortList.forEach(hardwarePortInfo => {
            // hardwareHeight += (hardwarePortInfo.IS_GROUP)?this.PORT_GROUP_HEIGHT:this.PORT_HEIGHT+this.PORT_INTERVAL;
            hardwareHeight += hardwarePortInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL;
          });
          hardwareInfo.HEIGHT = hardwareHeight;
          hardwareAreaHeight += hardwareHeight;
        });
        if (hardwareAreaHeight > 0) {
          hardwareAreaHeight += 2 * this.PORT_INTERVAL;
        }
        //hardwareAreaHeight += 2*this.PORT_INTERVAL;
        //hardwareAreaHeight += 2*this.PORT_INTERVAL;
        height += hardwareAreaHeight;
        //height += devInfo.PORT_LIST.length * (this.PORT_HEIGHT+this.PORT_INTERVAL) + this.PORT_INTERVAL;
        let relaDevList = devInfo.RELA_DEV_LIST || [];
        relaDevList.forEach(relaDevInfo => {
          height += relaDevInfo.PORT_LIST.length * (this.PORT_HEIGHT + this.PORT_INTERVAL) + 3 * this.PORT_INTERVAL;
          relaDevHeight += relaDevInfo.PORT_LIST.length * (this.PORT_HEIGHT + this.PORT_INTERVAL) + 3 * this.PORT_INTERVAL;
        });
        //计算融接点的数量
        // this.CONN_LIST.forEach(connInfo=>{
        //     let ccList = connInfo.cblunitCblunitList||[];
        //     ccList.forEach(ccInfo=>{
        //        if(ccInfo.deviceId == devInfo.deviceId){
        //            height += this.PORT_HEIGHT+this.PORT_INTERVAL;
        //            ccHeight += this.PORT_HEIGHT+this.PORT_INTERVAL;
        //        }
        //     });
        // });
        //计算虚拟连接点的高度
        // let virNodeList =devInfo.VIR_NODE_LIST||[];
        // virNodeList.forEach(virNodeInfo=>{
        // 	virNodeHeight += this.PORT_HEIGHT+ this.PORT_INTERVAL;
        // });
        // virNodeHeight = devInfo.VIR_NODE_NUM * (this.PORT_HEIGHT+ this.PORT_INTERVAL);
        // height += virNodeHeight;
        // height+=this.PORT_INTERVAL;

        if (maxHeight < height) {
          maxHeight = height;
        }
        devInfo.LEFT_CC_WIDTH = devInfo.CC_NUM * (this.PORT_HEIGHT + this.PORT_INTERVAL) + 20 + this.PORT_INTERVAL / 2;
        devInfo.HARDWARE_WIDTH = hardwareList.length > 0 ? this.DEV_WIDTH : 0;
        devInfo.RELA_DEV_WIDTH = relaDevList.length > 0 ? this.DEV_WIDTH : 0;
        devInfo.INNER_WIDTH = (devInfo.INNER_LINK_NUM ? devInfo.INNER_LINK_NUM + 1 : 1) * (this.PORT_HEIGHT + this.PORT_INTERVAL);
        devInfo.LEFT_WIDTH =
          (this.PORT_HEIGHT + this.PORT_INTERVAL) * ((devInfo.A_LINK_NUM ? devInfo.A_LINK_NUM : 0) + 1) + 20 + this.PORT_INTERVAL / 2;
        devInfo.RIGHT_WIDTH =
          (this.PORT_HEIGHT + this.PORT_INTERVAL) * ((devInfo.Z_LINK_NUM ? devInfo.Z_LINK_NUM : 0) + 1) + 20 + this.PORT_INTERVAL / 2;
        devInfo.WIDTH = devInfo.RELA_DEV_WIDTH + devInfo.HARDWARE_WIDTH + devInfo.INNER_WIDTH + devInfo.LEFT_WIDTH + devInfo.RIGHT_WIDTH;
        devInfo.HARDWARE_HEIGHT = hardwareAreaHeight;
        devInfo.HEIGHT = height;
        devInfo.RELA_DEV_HEIGHT = relaDevHeight;
        devInfo.CC_HEIGHT = ccHeight;
        //devInfo.VIR_HEIGHT = virNodeHeight;
      });
      this.CABLE_LIST.forEach(cableInfo => {
        let height = 0;
        let tubeList = cableInfo.TUBE_LIST || [];
        tubeList.forEach(tubeInfo => {
          let unitList = tubeInfo.FIBER_LIST || [];
          let tubeHeight = 0;
          unitList.forEach(unitInfo => {
            tubeHeight += unitInfo.IS_GROUP ? this.PORT_GROUP_HEIGHT : this.PORT_HEIGHT + this.PORT_INTERVAL;
          });
          tubeInfo.HEIGHT = tubeHeight;
          height += tubeHeight;
        });
        // let unitList =  cableInfo.FIBER_LIST||[];
        // unitList.forEach(unitInfo=>{
        // 	height+= this.PORT_HEIGHT + this.PORT_INTERVAL;
        // });
        height += this.PORT_INTERVAL * 2;
        if (maxHeight < height) {
          maxHeight = height;
        }
        cableInfo.HEIGHT = height;
        cableInfo.WIDTH = this.CABLE_WIDTH;
      });
      // this.MAX_HEIGHT = maxHeight;
    },
    //设置设备以及cable的坐标点
    initPosition: function() {
      this.CABLE_LIST.forEach(cableInfo => {
        cableInfo.IS_SHOW = false;
        cableInfo.X_NUMBER = 0;
        cableInfo.Y_NUMBER = 0;
        cableInfo.X_POS = 0;
        cableInfo.Y_POS = 0 + cableInfo.HEIGHT / 2;
      });
      this.DEV_LIST.forEach(devInfo => {
        devInfo.IS_SHOW = false;
        devInfo.X_NUMBER = 0;
        devInfo.Y_NUMBER = 0;
        devInfo.X_POS = 0;
        devInfo.Y_POS = 0 + devInfo.HEIGHT / 2;
        devInfo.VIR_AREA_MIN_POS = 9999;
        devInfo.VIR_AREA_MAX_POS = -9999;
        devInfo.VIR_AREA_HEIGHT = 0;
      });
      this.CONN_LIST.forEach(connInfo => {
        let jumpList = connInfo.jump || [];
        jumpList.forEach(jumpInfo => {
          jumpInfo.IS_ROUTE = false;
        });
      });

      //第一步获取起始节点
      //如果有OLT，则设置OLT为第一个起始设备
      //如果没有OLT，查询有分光器的节点，
      let startDevice = null;
      this.DEV_LIST.forEach(devInfo => {
        if (devInfo.resSpecId == 'OLT') {
          startDevice = devInfo;
          devInfo.X_NUMBER = 0;
          devInfo.Y_NUMBER = 0;
          devInfo.X_POS = 0;
          devInfo.Y_POS = 0 + devInfo.HEIGHT / 2;
          devInfo.IS_SHOW = true;
        }
      });

      // if(!startDevice){
      //     if(devInfo.RELA_DEV_LIST  && devInfo.RELA_DEV_LIST.length>0){
      //         startDevice = devInfo;
      //         devInfo.X_NUMBER=0;
      //         devInfo.Y_NUMBER=0;
      //         devInfo.Y_POS=0;
      //     }
      // }
      if (!startDevice) {
        startDevice = this.getStartCableList();
      }
      if (!startDevice) {
        startDevice = this.getStartDevList();
      }
      // if(!startDevice){
      // 	fish.error("No Data!");
      // 	return;
      // }

      //遍历所有设备和cable，设置坐标
      //递归设置设备和cable的行列号
      if (startDevice) {
        this.setposition(startDevice, startDevice.X_POS, 0);
      } else {
        startDevice = {
          Y_POS: 0,
          HEIGHT: 0,
        };
      }

      let count = 1;
      let preNode = startDevice;
      this.DEV_LIST.forEach(devInfo => {
        if (!devInfo.IS_SHOW) {
          devInfo.IS_SHOW = true;
          devInfo.X_NUMBER = 0;
          devInfo.Y_NUMBER = count;
          devInfo.X_POS = 0;
          devInfo.Y_POS = preNode.Y_POS + this.Y_INTERVAL + preNode.HEIGHT + devInfo.HEIGHT / 2;
          let tmj = this.setposition(devInfo, 0, 0);
          count++;
          preNode.HEIGHT = 0;
          preNode.Y_POS = tmj.maxYPos;
        }
      });
    },
    getStartCableList: function() {
      let startDeviceNode = null;
      this.CABLE_LIST.forEach(cableInfo => {
        let aDev = null;
        let zDev = null;
        this.DEV_LIST.forEach(devInfo => {
          if (devInfo.deviceId == cableInfo.aDeviceId) {
            aDev = devInfo;
          } else if (devInfo.deviceId == cableInfo.zDeviceId) {
            zDev = devInfo;
          }
        });
        if (!startDeviceNode && !aDev && zDev) {
          cableInfo.X_NUMBER = 0;
          cableInfo.Y_NUMBER = 0;
          cableInfo.X_POS = 0;
          cableInfo.Y_POS = 0 + cableInfo.HEIGHT / 2;
          cableInfo.IS_SHOW = true;

          zDev.X_NUMBER = 1;
          zDev.Y_NUMBER = 0;
          zDev.Y_POS = 0 + zDev.HEIGHT / 2;
          zDev.X_POS = cableInfo.X_POS + cableInfo.WIDTH / 2 + this.X_INTERVAL + zDev.WIDTH / 2;
          zDev.IS_SHOW = true;
          startDeviceNode = zDev;
        }
      });
      return startDeviceNode;
    },
    getStartDevList: function() {
      this.CABLE_LIST.forEach(cableInfo => {
        this.DEV_LIST.forEach(devInfo => {
          if (devInfo.deviceId == cableInfo.aDeviceId) {
            if (devInfo.Z_CONN_COUNT) {
              devInfo.Z_CONN_COUNT++;
            } else {
              devInfo.Z_CONN_COUNT = 1;
            }
          } else if (devInfo.deviceId == cableInfo.zDeviceId) {
            if (devInfo.A_CONN_COUNT) {
              devInfo.A_CONN_COUNT++;
            } else {
              devInfo.A_CONN_COUNT = 1;
            }
          }
        });
      });
      let startDeviceNode = null;
      this.DEV_LIST.forEach(devInfo => {
        //获取没有左连接，右连接最多的设备做起点
        if (!startDeviceNode && devInfo && !devInfo.A_CONN_COUNT && devInfo.Z_CONN_COUNT) {
          //if(!startDeviceNode && devInfo && !devInfo.A_CONN_COUNT){
          devInfo.X_NUMBER = 0;
          devInfo.Y_NUMBER = 0;
          devInfo.X_POS = 0;
          devInfo.Y_POS = 0 + devInfo.HEIGHT / 2;
          devInfo.IS_SHOW = true;
          startDeviceNode = devInfo;
        }
      });
      return startDeviceNode;
    },
    setposition: function(startDevice, currentX, baseYpos) {
      let returnObj = {};
      returnObj.isFindNext = false;
      returnObj.maxYPos = -9999;
      returnObj.minYPos = 9999;
      let nextCableList = [];
      this.CABLE_LIST.forEach(cableInfo => {
        if (!cableInfo.IS_SHOW && (startDevice.deviceId == cableInfo.aDeviceId || startDevice.deviceId == cableInfo.zDeviceId)) {
          nextCableList.push(cableInfo);
        }
      });
      //对连接的cable进行排序
      nextCableList.sort(function(cableA, cableB) {
        return cableA.Z_SEQ - cableB.Z_SEQ;
      });
      //let maxSize= 0;
      nextCableList.forEach(cableInfo => {
        let nextDevId = startDevice.deviceId == cableInfo.aDeviceId ? cableInfo.zDeviceId : cableInfo.aDeviceId;
        returnObj.isFindNext = true;
        cableInfo = this.getYPos(startDevice, currentX + 1, cableInfo);
        cableInfo.X_NUMBER = currentX + 1;
        cableInfo.IS_SHOW = true;
        cableInfo.X_POS = startDevice.X_POS + startDevice.WIDTH / 2 + this.X_INTERVAL + cableInfo.WIDTH / 2;
        cableInfo.preNodeId = startDevice.deviceId;
        if (returnObj.maxYPos !== -9999 && cableInfo.Y_POS - cableInfo.HEIGHT / 2 - this.Y_INTERVAL < returnObj.maxYPos) {
          cableInfo.Y_POS = returnObj.maxYPos + this.Y_INTERVAL + cableInfo.HEIGHT / 2;
        }
        if (cableInfo.Y_POS - cableInfo.HEIGHT / 2 < startDevice.VIR_AREA_MIN_POS) {
          startDevice.VIR_AREA_MIN_POS = cableInfo.Y_POS - cableInfo.HEIGHT / 2;
        }
        if (cableInfo.Y_POS + cableInfo.HEIGHT / 2 > startDevice.VIR_AREA_MAX_POS) {
          startDevice.VIR_AREA_MAX_POS = cableInfo.Y_POS + cableInfo.HEIGHT / 2;
        }
        //maxSize += cableInfo.HEIGHT;
        this.DEV_LIST.forEach(devInfo => {
          if (!devInfo.IS_SHOW && devInfo.deviceId == nextDevId) {
            devInfo = this.getYPos(cableInfo, currentX + 2, devInfo);
            devInfo.IS_SHOW = true;
            devInfo.X_NUMBER = currentX + 2;
            devInfo.preNodeId = cableInfo.cableId;
            devInfo.X_POS = cableInfo.X_POS + cableInfo.WIDTH / 2 + this.X_INTERVAL + devInfo.WIDTH / 2;
            devInfo.VIR_AREA_HEIGHT = cableInfo.HEIGHT;
            if (returnObj.maxYPos !== -9999 && devInfo.Y_POS - devInfo.HEIGHT / 2 - this.Y_INTERVAL < returnObj.maxYPos) {
              devInfo.Y_POS = returnObj.maxYPos + this.Y_INTERVAL + devInfo.HEIGHT / 2;
            }
            let tmpObj = this.setposition(devInfo, devInfo.X_NUMBER);
            if (tmpObj.maxYPos !== -9999 && tmpObj.maxYPos > returnObj.maxYPos) {
              returnObj.maxYPos = tmpObj.maxYPos;
            } else if (tmpObj.maxYPos === -9999) {
              returnObj.maxYPos = tmpObj.maxYPos;
            }
            if (tmpObj.minYPos !== 9999 && tmpObj.minYPos < returnObj.minYPos) {
              returnObj.minYPos = tmpObj.minYPos;
            } else if (tmpObj.minYPos !== 9999) {
              returnObj.minYPos = tmpObj.minYPos;
            }
          }
        });
      });
      if (startDevice.VIR_AREA_MIN_POS !== 9999 && startDevice.VIR_AREA_MAX_POS !== -9999) {
        if (startDevice.VIR_AREA_HEIGHT <= startDevice.VIR_AREA_MAX_POS - startDevice.VIR_AREA_MIN_POS) {
          startDevice.VIR_AREA_HEIGHT = startDevice.VIR_AREA_MAX_POS - startDevice.VIR_AREA_MIN_POS;
        }
        if (startDevice.HEIGHT < startDevice.VIR_AREA_HEIGHT) {
          startDevice.Y_POS += (startDevice.VIR_AREA_HEIGHT - startDevice.HEIGHT) / 2;
          startDevice.HEIGHT = startDevice.VIR_AREA_HEIGHT;
        }
      } else if (nextCableList.length == 0) {
        if (startDevice.HEIGHT < startDevice.VIR_AREA_HEIGHT) {
          startDevice.Y_POS += (startDevice.VIR_AREA_HEIGHT - startDevice.HEIGHT) / 2;
          startDevice.HEIGHT = startDevice.VIR_AREA_HEIGHT;
        }
      }
      //startDevice.Y_POS = startDevice.Y_POS + (maxSize - startDevice.Y_POS - startDevice.HEIGHT/2)/2;
      //startDevice.HEIGHT = startDevice.HEIGHT + (maxSize - startDevice.Y_POS - startDevice.HEIGHT/2);
      if (!returnObj.isFindNext) {
        this.CONN_LIST.forEach(connInfo => {
          let jumpList = connInfo.jump || [];
          jumpList.forEach(jumpInfo => {
            if (!jumpInfo.IS_ROUTE && jumpInfo.aDeviceId === startDevice.deviceId && jumpInfo.aDeviceId !== jumpInfo.zDeviceId) {
              jumpInfo.IS_ROUTE = true;
              returnObj.isFindNext = true;
              this.DEV_LIST.forEach(devInfo => {
                if (!devInfo.IS_SHOW && devInfo.deviceId === jumpInfo.zDeviceId && devInfo.resSpecId !== 'SPLITTER') {
                  devInfo = this.getYPos(startDevice, currentX + 1, devInfo);
                  devInfo.X_NUMBER = currentX + 1;
                  devInfo.IS_SHOW = true;
                  devInfo.preNodeId = startDevice.deviceId;
                  devInfo.IS_ROUTE_BY_JUMP = true;
                  // let linkList = jumpList.filter(function (jumpInfo){
                  // 	return (jumpInfo.zDeviceId === startDevice.deviceId && devInfo.deviceId === jumpInfo.aDeviceId) || (jumpInfo.aDeviceId === startDevice.deviceId && devInfo.deviceId ===jumpInfo.zDeviceId)
                  // });
                  // devInfo.X_POS = startDevice.X_POS + startDevice.WIDTH/2 + (linkList.length+1)*(this.PORT_INTERVAL+this.PORT_HEIGHT) + devInfo.WIDTH/2;
                  devInfo.X_POS = startDevice.X_POS + startDevice.WIDTH / 2 + this.X_INTERVAL + devInfo.WIDTH / 2;
                  if (returnObj.maxYPos !== -9999 && devInfo.Y_POS - devInfo.HEIGHT / 2 - this.Y_INTERVAL < returnObj.maxYPos) {
                    devInfo.Y_POS = returnObj.maxYPos + this.Y_INTERVAL + devInfo.HEIGHT / 2;
                  }
                  let tmpObj = this.setposition(devInfo, devInfo.X_NUMBER);
                  if (tmpObj.maxYPos !== -9999 && tmpObj.maxYPos > returnObj.maxYPos) {
                    returnObj.maxYPos = tmpObj.maxYPos;
                  }
                  if (tmpObj.minYPos !== 9999 && tmpObj.minYPos < returnObj.minYPos) {
                    returnObj.minYPos = tmpObj.minYPos;
                  }
                }
              });
            } else if (!jumpInfo.IS_ROUTE && jumpInfo.zDeviceId === startDevice.deviceId && jumpInfo.aDeviceId !== jumpInfo.zDeviceId) {
              jumpInfo.IS_ROUTE = true;
              returnObj.isFindNext = true;
              this.DEV_LIST.forEach(devInfo => {
                if (!devInfo.IS_SHOW && devInfo.deviceId === jumpInfo.aDeviceId && devInfo.resSpecId !== 'SPLITTER') {
                  devInfo = this.getYPos(startDevice, currentX + 1, devInfo);
                  devInfo.X_NUMBER = currentX + 1;
                  devInfo.IS_SHOW = true;
                  devInfo.preNodeId = startDevice.deviceId;
                  devInfo.IS_ROUTE_BY_JUMP = true;
                  // let linkList = jumpList.filter(function (jumpInfo){
                  // 	return (jumpInfo.zDeviceId === startDevice.deviceId && devInfo.deviceId === jumpInfo.aDeviceId) || (jumpInfo.aDeviceId === startDevice.deviceId && devInfo.deviceId ===jumpInfo.zDeviceId)
                  // });
                  // devInfo.X_POS = startDevice.X_POS + startDevice.WIDTH/2 + (linkList.length+1)*(this.PORT_INTERVAL+this.PORT_HEIGHT) + devInfo.WIDTH/2;
                  devInfo.X_POS = startDevice.X_POS + startDevice.WIDTH / 2 + this.X_INTERVAL + devInfo.WIDTH / 2;
                  if (returnObj.maxYPos !== -9999 && devInfo.Y_POS - devInfo.HEIGHT / 2 - this.Y_INTERVAL < returnObj.maxYPos) {
                    devInfo.Y_POS = returnObj.maxYPos + this.Y_INTERVAL + devInfo.HEIGHT / 2;
                  }
                  let tmpObj = this.setposition(devInfo, devInfo.X_NUMBER);
                  if (tmpObj.maxYPos !== -9999 && tmpObj.maxYPos > returnObj.maxYPos) {
                    returnObj.maxYPos = tmpObj.maxYPos;
                  }
                  if (tmpObj.minYPos !== 9999 && tmpObj.minYPos < returnObj.minYPos) {
                    returnObj.minYPos = tmpObj.minYPos;
                  }
                }
              });
            }
          });
        });
      }
      if (!returnObj.isFindNext) {
        returnObj.maxYPos = startDevice.Y_POS + startDevice.HEIGHT / 2;
        returnObj.minYPos = startDevice.Y_POS - startDevice.HEIGHT / 2;
      }
      // else if(startDevice.Y_POS -startDevice.HEIGHT/2 < returnObj.minYPos) {
      // 	startDevice.Y_POS = returnObj.minYPos + startDevice.HEIGHT/2;
      // }
      // if(returnObj.minYPos < startDevice.Y_POS+startDevice.HEIGHT/2){
      // 	returnObj.minYPos = returnObj.minYPos + startDevice.HEIGHT/2;
      // }
      if (startDevice.Y_POS + startDevice.HEIGHT / 2 > returnObj.maxYPos) {
        returnObj.maxYPos = startDevice.Y_POS + startDevice.HEIGHT / 2;
      }
      return returnObj;
      //return minPosY;
    },
    getYPos: function(startNode, xPos, nodeInfo) {
      let yPos = {};
      yPos.minY = 0;
      yPos.maxY = 0;
      let minYpos = 0;
      let maxYpos = 0;
      let isExist = false;
      this.DEV_LIST.forEach(devInfo => {
        if (devInfo.X_NUMBER == xPos) {
          if (devInfo.Y_NUMBER < yPos.minY) {
            yPos.minY = devInfo.Y_NUMBER;
          }
          if (devInfo.Y_NUMBER > yPos.maxY) {
            yPos.maxY = devInfo.Y_NUMBER;
          }
          if (minYpos > devInfo.Y_POS - devInfo.HEIGHT / 2) {
            minYpos = devInfo.Y_POS - devInfo.HEIGHT / 2;
          }
          if (maxYpos < devInfo.Y_POS + devInfo.HEIGHT / 2) {
            maxYpos = devInfo.Y_POS + devInfo.HEIGHT / 2;
          }
          isExist = true;
        }
      });
      this.CABLE_LIST.forEach(cableInfo => {
        if (cableInfo.X_NUMBER == xPos) {
          if (cableInfo.Y_NUMBER < yPos.minY) {
            yPos.minY = cableInfo.Y_NUMBER;
          }
          if (cableInfo.Y_NUMBER > yPos.maxY) {
            yPos.maxY = cableInfo.Y_NUMBER;
          }
          if (minYpos > cableInfo.Y_POS - cableInfo.HEIGHT / 2) {
            minYpos = cableInfo.Y_POS - cableInfo.HEIGHT / 2;
          }
          if (maxYpos < cableInfo.Y_POS + cableInfo.HEIGHT / 2) {
            maxYpos = cableInfo.Y_POS + cableInfo.HEIGHT / 2;
          }
          isExist = true;
        }
      });
      // if(!isExist){
      //     yPos.maxY = -1;
      // }
      // if(startNode && startNode.Y_NUMBER<0){
      //     nodeInfo.Y_NUMBER = yPos.minY-1;
      //     nodeInfo.Y_POS = minYpos - this.Y_INTERVAL - nodeInfo.HEIGHT/2;
      //     if(minYpos>startNode.Y_POS+startNode.HEIGHT/2+100){
      //         nodeInfo.Y_POS = startNode.Y_POS+startNode.HEIGHT/2 - nodeInfo.HEIGHT/2
      //     }
      // }
      // else if(startNode && startNode.Y_NUMBER>0){
      //     nodeInfo.Y_NUMBER = yPos.maxY+1;
      //     nodeInfo.Y_POS = maxYpos +this.Y_INTERVAL +nodeInfo.HEIGHT/2;
      //     if(maxYpos<startNode.Y_POS-this.Y_INTERVAL-startNode.HEIGHT/2){
      //         nodeInfo.Y_POS = startNode.Y_POS-this.Y_INTERVAL-startNode.HEIGHT/2 +this.Y_INTERVAL +nodeInfo.HEIGHT/2;
      //     }
      // }
      // else {
      //     if(yPos.minY+yPos.maxY>0){
      //         if(!isExist){
      //             nodeInfo.Y_NUMBER = yPos.minY;
      //             nodeInfo.Y_POS = minYpos;
      //         }
      //         else {
      //             nodeInfo.Y_NUMBER = yPos.minY-1;
      //             nodeInfo.Y_POS = minYpos - this.Y_INTERVAL - nodeInfo.HEIGHT/2;
      //         }
      //     }
      //     else {
      //         if(!isExist){
      //             nodeInfo.Y_NUMBER = yPos.maxY;
      //             nodeInfo.Y_POS = maxYpos;
      //         }
      //         else {
      //             nodeInfo.Y_NUMBER = yPos.maxY+1;
      //             nodeInfo.Y_POS = maxYpos +this.Y_INTERVAL +nodeInfo.HEIGHT/2;
      //         }
      //     }
      // }
      if (!isExist) {
        nodeInfo.Y_NUMBER = yPos.maxY;
        nodeInfo.Y_POS = maxYpos;
      } else {
        nodeInfo.Y_NUMBER = yPos.maxY + 1;
        nodeInfo.Y_POS = maxYpos + this.Y_INTERVAL;
      }
      if (nodeInfo.Y_POS < startNode.Y_POS - startNode.HEIGHT / 2) {
        nodeInfo.Y_POS = startNode.Y_POS - startNode.HEIGHT / 2;
      }
      nodeInfo.Y_POS += nodeInfo.HEIGHT / 2;
      return nodeInfo;
    },
    initData(data) {
      let devList = data.DEV_LIST || [];
      let cableList = data.CABLE_LIST || [];
      let unitList = data.NEW_UNIT_LIST || [];
      let relaDevList = data.RELA_DEV_LIST || [];
      let hardwareList = data.HARDWARE_LIST || [];
      let portList = data.NEW_PORT_LIST || [];
      let connList = data.CONN_LIST || [];
      let positionList = data.POSITION_LIST || [];
      let virConnList = [];
      let virNodeList = [];

      //把设备下的硬件和端口放到设备下
      relaDevList.forEach(relaDevInfo => {
        let devPortList = [];
        let oldPortList = [];

        portList.forEach(port => {
          if (port.IS_GROUP && !port.OPEN_GROUP) {
            let childPortList = port.CHILD_NODE_LIST || [];
            childPortList.forEach(childPort => {
              if (childPort.deviceId === relaDevInfo.relaDeviceId) {
                devPortList.push(childPort);
              }
              oldPortList.push(childPort);
            });
          } else if (port.deviceId === relaDevInfo.relaDeviceId) {
            devPortList.push(port);
            if (port.IS_GROUP) {
              oldPortList.push.apply(oldPortList, port.CHILD_NODE_LIST);
            } else {
              oldPortList.push(port);
            }
          }
        });
        relaDevInfo.OLD_PORT_LIST = oldPortList;
        relaDevInfo.PORT_LIST = devPortList;
      });
      devList.forEach(devInfo => {
        let devHardwareList = [];
        let devPortList = [];
        let relaList = [];

        hardwareList.forEach(hardware => {
          let hardwarePortList = [];
          if (hardware.deviceId === devInfo.deviceId) {
            portList.forEach(port => {
              if (port.IS_GROUP && !port.OPEN_GROUP) {
                let childPortList = port.CHILD_NODE_LIST || [];
                childPortList.forEach(childPort => {
                  if (childPort.hardwareId === hardware.hardwareId) {
                    hardwarePortList.push(childPort);
                  }
                });
              } else if (port.hardwareId === hardware.hardwareId) {
                hardwarePortList.push(port);
              }
            });
            if (hardwarePortList.length > 0) {
              hardware.PORT_LIST = hardwarePortList;
              hardwareList.forEach(parentHardware => {
                if (parentHardware.hardwareId === hardware.parentId) {
                  hardware.PARENT_SEQ = parentHardware.nameSeq;
                }
              });
              devHardwareList.push(hardware);
            }
          }
        });

        portList.forEach(port => {
          if (port.IS_GROUP && !port.OPEN_GROUP) {
            let childPortList = port.CHILD_NODE_LIST || [];
            childPortList.forEach(childPort => {
              if (childPort.deviceId === devInfo.deviceId) {
                devPortList.push(childPort);
              }
            });
          } else if (port.deviceId === devInfo.deviceId) {
            devPortList.push(port);
          }
        });
        relaDevList.forEach(relaDev => {
          if (relaDev.deviceId === devInfo.deviceId) {
            relaList.push(relaDev);
          }
        });
        devInfo.HARDWARE_LIST = devHardwareList;
        devInfo.PORT_LIST = devPortList;
        devInfo.RELA_DEV_LIST = relaList;
        devInfo.NODE_ID = devInfo.deviceId;
        devInfo.RES_SPEC_ID = devInfo.resSpecId;
        devInfo.DEVICE_ID = devInfo.deviceId;
        devInfo.ELEM_NAME = devInfo.name;
        devInfo.ELEM_SPEC = devInfo.resSpecId;
        devInfo.IS_PARENT = true;
        if (positionList[devInfo.deviceId]) {
          devInfo.X = positionList[devInfo.deviceId].x;
          devInfo.Y = positionList[devInfo.deviceId].y;
          devInfo.W = positionList[devInfo.deviceId].w;
          devInfo.H = positionList[devInfo.deviceId].h;
          devInfo.VH = positionList[devInfo.deviceId].vh;
        }
      });
      cableList.forEach(cableInfo => {
        let tubeList = [];
        let fiberList = [];
        unitList.forEach(unit => {
          if (unit.cableId === cableInfo.cableId) {
            if (unit.resSpecId === 'TUBE') {
              tubeList.push(unit);
            } else if (unit.resSpecId === 'FIBER_CORE') {
              if (unit.IS_GROUP && !unit.OPEN_GROUP) {
                let childNodeList = unit.CHILD_NODE_LIST || [];
                childNodeList.forEach(childNode => {
                  fiberList.push(childNode);
                });
              } else {
                fiberList.push(unit);
              }
            }
          }
        });
        tubeList.forEach(tubeInfo => {
          let tubeFiberList = [];
          fiberList.forEach(fiberInfo => {
            if (fiberInfo.parentId === tubeInfo.unitId) {
              tubeFiberList.push(fiberInfo);
            }
          });
          tubeInfo.FIBER_LIST = tubeFiberList;
        });
        cableInfo.TUBE_LIST = tubeList;
        cableInfo.FIBER_LIST = fiberList;
        cableInfo.NODE_ID = cableInfo.cableId;
        cableInfo.RES_SPEC_ID = cableInfo.resSpecId;
        cableInfo.CABLE_ID = cableInfo.cableId;
        cableInfo.ELEM_NAME = cableInfo.name;
        cableInfo.ELEM_SPEC = cableInfo.resSpecId;
        cableInfo.IS_PARENT = true;
        if (positionList[cableInfo.cableId]) {
          cableInfo.X = positionList[cableInfo.cableId].x;
          cableInfo.Y = positionList[cableInfo.cableId].y;
          cableInfo.W = positionList[cableInfo.cableId].w;
          cableInfo.H = positionList[cableInfo.cableId].h;
        }
      });

      connList.forEach(connInfo => {
        let jumpList = connInfo.jump || [];
        let pcList = connInfo.portCblunitList || [];
        let ccList = connInfo.cblunitCblunitList || [];
        jumpList.forEach(jumpInfo => {
          if (positionList[jumpInfo.linkId]) {
            jumpInfo.POINTS = positionList[jumpInfo.linkId].POINTS || [];
          }
          relaDevList.forEach(relaDevInfo => {
            if (jumpInfo.aDeviceId === relaDevInfo.relaDeviceId && jumpInfo.zDeviceId === relaDevInfo.deviceId) {
              devList.forEach(devInfo => {
                if (devInfo.deviceId === relaDevInfo.deviceId) {
                  if (devInfo.INNER_LINK_NUM) {
                    devInfo.INNER_LINK_NUM++;
                  } else {
                    devInfo.INNER_LINK_NUM = 1;
                  }
                }
              });
            } else if (jumpInfo.zDeviceId === relaDevInfo.relaDeviceId && jumpInfo.aDeviceId === relaDevInfo.deviceId) {
              devList.forEach(devInfo => {
                if (devInfo.deviceId === relaDevInfo.deviceId) {
                  if (devInfo.INNER_LINK_NUM) {
                    devInfo.INNER_LINK_NUM++;
                  } else {
                    devInfo.INNER_LINK_NUM = 1;
                  }
                }
              });
            }
          });
        });
        pcList.forEach(pcInfo => {
          if (positionList[pcInfo.terminationId]) {
            pcInfo.POINTS = positionList[pcInfo.terminationId].POINTS || [];
          }
          cableList.forEach(cableInfo => {
            if (cableInfo.cableId === pcInfo.cableId) {
              portList.forEach(port => {
                if (port.portId === pcInfo.portId && port.deviceId === pcInfo.deviceId) {
                  if (!cableInfo.A_SEQ && cableInfo.aDeviceId === pcInfo.deviceId) {
                    cableInfo.A_SEQ = 10000 + port.seq;
                  } else if (!cableInfo.Z_SEQ && cableInfo.zDeviceId === pcInfo.deviceId) {
                    cableInfo.Z_SEQ = 10000 + port.seq;
                  }
                }
              });
              let isSplitterPC = true;
              devList.forEach(devInfo => {
                if (devInfo.deviceId === pcInfo.deviceId) {
                  isSplitterPC = false;
                  if (cableInfo.zDeviceId === devInfo.deviceId) {
                    if (!devInfo.A_LINK_NUM) {
                      devInfo.A_LINK_NUM = 1;
                    } else {
                      devInfo.A_LINK_NUM++;
                    }
                  } else if (cableInfo.aDeviceId === devInfo.deviceId) {
                    if (!devInfo.Z_LINK_NUM) {
                      devInfo.Z_LINK_NUM = 1;
                    } else {
                      devInfo.Z_LINK_NUM++;
                    }
                  }
                }
              });
              if (isSplitterPC) {
                for (let relaDevIndex = 0; relaDevIndex < relaDevList.length; relaDevIndex++) {
                  let relaDevInfo = relaDevList[relaDevIndex];
                  if (relaDevInfo.relaDeviceId === pcInfo.deviceId) {
                    for (let devIndex = 0; devIndex < devList.length; devIndex++) {
                      let devInfo = devList[devIndex];
                      if (devInfo.deviceId === relaDevInfo.deviceId) {
                        isSplitterPC = false;
                        if (cableInfo.zDeviceId === devInfo.deviceId) {
                          if (!devInfo.A_LINK_NUM) {
                            devInfo.A_LINK_NUM = 1;
                          } else {
                            devInfo.A_LINK_NUM++;
                          }
                        } else if (cableInfo.aDeviceId === devInfo.deviceId) {
                          if (!devInfo.Z_LINK_NUM) {
                            devInfo.Z_LINK_NUM = 1;
                          } else {
                            devInfo.Z_LINK_NUM++;
                          }
                        }
                        break;
                      }
                    }
                    break;
                  }
                }
              }
            }
          });
        });
        let offsetASeq = 1;
        let offsetZSeq = 1;
        ccList.forEach(ccInfo => {
          if (positionList[ccInfo.splicingId + '_A']) {
            ccInfo.POINTS_A = positionList[ccInfo.splicingId + '_A'].POINTS || [];
          }
          if (positionList[ccInfo.splicingId + '_Z']) {
            ccInfo.POINTS_Z = positionList[ccInfo.splicingId + '_Z'].POINTS || [];
          }
          //获取左右两端纤芯的序号SEQ
          unitList.forEach(unit => {
            if (unit.unitId === ccInfo.aUnitId && unit.resSpecId === 'FIBER_CORE') {
              ccInfo.A_SEQ = unit.seq;
            }
            if (unit.unitId === ccInfo.zUnitId && unit.resSpecId === 'FIBER_CORE') {
              ccInfo.Z_SEQ = unit.seq;
            }
          });
          devList.forEach(devInfo => {
            if (devInfo.deviceId === ccInfo.deviceId) {
              if (!devInfo.Z_LINK_NUM) {
                devInfo.Z_LINK_NUM = 1;
              } else {
                devInfo.Z_LINK_NUM++;
              }
              if (!devInfo.A_LINK_NUM) {
                devInfo.A_LINK_NUM = 1;
              } else {
                devInfo.A_LINK_NUM++;
              }
            }
          });
        });
        ccList.sort(function(a, b) {
          return a.A_SEQ - b.A_SEQ;
        });
        ccList.forEach(ccInfo => {
          cableList.forEach(cableInfo => {
            if (!cableInfo.Z_SEQ && cableInfo.cableId === ccInfo.aCableId) {
              cableInfo.Z_SEQ = 20000 + offsetZSeq;
              offsetZSeq++;
            } else if (!cableInfo.A_SEQ && cableInfo.cableId === ccInfo.zCableId) {
              cableInfo.A_SEQ = 20000 + offsetASeq;
              offsetASeq++;
            }
          });
          // devList.forEach(devInfo=>{
          // 	if(devInfo.deviceId === ccInfo.deviceId){
          // 		if(!devInfo.Z_LINK_NUM){
          // 			devInfo.Z_LINK_NUM =1;
          // 		}
          // 		else {
          // 			devInfo.Z_LINK_NUM ++;
          // 		}
          // 	}
          // })
        });
      });
      cableList.forEach(cableInfo => {
        if (!cableInfo.Z_SEQ) {
          cableInfo.Z_SEQ = 99999;
        } else if (!cableInfo.A_SEQ) {
          cableInfo.A_SEQ = 99999;
        }
      });
      cableList.sort(function(cableA, cableB) {
        return cableA.A_SEQ - cableB.A_SEQ;
      });
      //根据纤芯的连接，补充虚拟节点和虚拟连接
      cableList.forEach(cableInfo => {
        let aDeviceId = cableInfo.aDeviceId;
        let zDeviceId = cableInfo.zDeviceId;

        let fiberList = cableInfo.FIBER_LIST || [];

        fiberList.forEach(fiberInfo => {
          //在左边的设备新增虚拟节点，新增虚拟连接
          let virLeftNode = fish.extend({}, fiberInfo);
          virLeftNode.NODE_ID = virLeftNode.unitId + '_V_A';
          virLeftNode.DEVICE_ID = aDeviceId;
          virLeftNode.SEQ = fiberInfo.seq;
          virLeftNode.IS_A_NODE = false;
          virLeftNode.CABLE_ID = cableInfo.cableId;
          virLeftNode.TARGET_NODE_ID = virLeftNode.unitId + '_A';
          virLeftNode.PARENT_NAME = cableInfo.name;
          virNodeList.push(virLeftNode);

          let virLeftConn = {};
          virLeftConn.LINK_ID = virLeftNode.NODE_ID + virLeftNode.unitId;
          virLeftConn.NODE_A = virLeftNode.NODE_ID;
          virLeftConn.NODE_Z = virLeftNode.unitId + '_A';
          virLeftConn.cableId = cableInfo.cableId;
          virLeftConn.deviceId = aDeviceId;
          virConnList.push(virLeftConn);

          //在右边的设备新增虚拟节点，新增虚拟连接
          let virRightNode = fish.extend({}, fiberInfo);
          virRightNode.NODE_ID = virRightNode.unitId + '_V_Z';
          virRightNode.DEVICE_ID = zDeviceId;
          virRightNode.SEQ = fiberInfo.seq;
          virRightNode.IS_A_NODE = true;
          virRightNode.CABLE_ID = cableInfo.cableId;
          virRightNode.TARGET_NODE_ID = virRightNode.unitId + '_Z';
          virRightNode.PARENT_NAME = cableInfo.name;
          virNodeList.push(virRightNode);

          let virRightConn = {};
          virRightConn.LINK_ID = virRightNode.NODE_ID + virRightNode.unitId;
          virRightConn.NODE_A = virRightNode.NODE_ID;
          virRightConn.NODE_Z = virRightNode.unitId + '_Z';
          virRightConn.cableId = cableInfo.cableId;
          virRightConn.deviceId = zDeviceId;
          virConnList.push(virRightConn);
        });
      });
      devList.forEach(devInfo => {
        let devVirNodeList = [];
        virNodeList.forEach(virNodeInfo => {
          if (virNodeInfo.DEVICE_ID === devInfo.deviceId) {
            devVirNodeList.push(virNodeInfo);
          }
        });
        //devVirNodeList.sort((x, y) => Number(x.SEQ) - Number(y.SEQ));
        let A_NUM = 0;
        let Z_NUM = 0;
        devVirNodeList.forEach(devVirNode => {
          if (devVirNode.IS_A_NODE) {
            A_NUM++;
          } else {
            Z_NUM++;
          }
        });
        if (A_NUM > Z_NUM) {
          devInfo.VIR_NODE_NUM = A_NUM;
        } else {
          devInfo.VIR_NODE_NUM = Z_NUM;
        }
        devInfo.VIR_NODE_LIST = devVirNodeList;
      });
      this.DEV_LIST = devList;
      this.CABLE_LIST = cableList;
      this.CONN_LIST = connList;
      this.VIR_CONN_LIST = virConnList;
    },
    checkConn: function(fiberInfo, deviceId, connList, devList) {
      let result = false;
      connList.forEach(connInfo => {
        let pcList = connInfo.portCblunitList || [];
        let ccList = connInfo.cblunitCblunitList || [];
        pcList.forEach(pcInfo => {
          if (pcInfo.cableId === fiberInfo.cableId && pcInfo.unitId === fiberInfo.unitId && pcInfo.deviceId === deviceId) {
            //左连接正常
            result = true;
          }
        });
        ccList.forEach(ccInfo => {
          if (ccInfo.deviceId === deviceId && (ccInfo.aUnitId === fiberInfo.unitId || ccInfo.zUnitId === fiberInfo.unitId)) {
            //左连接正常
            result = true;
          }
        });
      });
      if (!result) {
        //校验内部分光器的情况
        devList.forEach(devinfo => {
          if (devinfo.deviceId === deviceId) {
            let relaDevList = devinfo.RELA_DEV_LIST || [];
            relaDevList.forEach(relaDevInfo => {
              connList.forEach(connInfo => {
                let pcList = connInfo.portCblunitList || [];
                let ccList = connInfo.cblunitCblunitList || [];
                pcList.forEach(pcInfo => {
                  if (pcInfo.cableId === fiberInfo.cableId && pcInfo.unitId === fiberInfo.unitId && pcInfo.deviceId === relaDevInfo.relaDeviceId) {
                    //左连接正常
                    result = true;
                  }
                });
                ccList.forEach(ccInfo => {
                  if (ccInfo.deviceId === relaDevInfo.relaDeviceId && (ccInfo.aUnitId === fiberInfo.unitId || ccInfo.zUnitId === fiberInfo.unitId)) {
                    //左连接正常
                    result = true;
                  }
                });
              });
            });
          }
        });
      }
      return result;
    },
    preLoadData: function(data) {
      let devList = data.DEV_LIST || [];
      let cableList = data.CABLE_LIST || [];
      let unitList = data.UNIT_LIST || [];
      let relaDevList = data.RELA_DEV_LIST || [];
      let hardwareList = data.HARDWARE_LIST || [];
      let portList = data.PORT_LIST || [];
      let connList = data.CONN_LIST || [];

      relaDevList.forEach(relaDevInfo => {
        portList.forEach(port => {
          if (port.deviceId === relaDevInfo.relaDeviceId) {
            port.PARENT_DEV_ID = relaDevInfo.relaDeviceId;
          }
        });
      });

      //处理未连接的纤芯和端口
      let newUnintList = [];
      unitList.forEach(unitInfo => {
        if (unitInfo.resSpecId === 'FIBER_CORE') {
          //查询是否有连接，无连接则组合
          let isConn = false;
          connList.forEach(connInfo => {
            let jumpList = connInfo.jump || [];
            let ccList = connInfo.cblunitCblunitList || [];
            let pcList = connInfo.portCblunitList || [];

            ccList.forEach(ccInfo => {
              if (ccInfo.zUnitId === unitInfo.unitId || ccInfo.aUnitId === unitInfo.unitId) {
                isConn = true;
              }
            });
            pcList.forEach(pcInfo => {
              if (pcInfo.unitId === unitInfo.unitId) {
                isConn = true;
              }
            });
          });
          if (isConn) {
            newUnintList.push(unitInfo);
          } else {
            //未连接的unit，按照束管以及纤芯的顺序来组合
            newUnintList = this.addToGroup(unitInfo, newUnintList);
          }
        } else {
          newUnintList.push(unitInfo);
        }
      });

      let newPortList = [];
      portList.forEach(portInfo => {
        portInfo.parentId = portInfo.hardwareId;
        //查询是否有连接，无连接则组合
        let isConn = false;
        connList.forEach(connInfo => {
          let jumpList = connInfo.jump || [];
          let ccList = connInfo.cblunitCblunitList || [];
          let pcList = connInfo.portCblunitList || [];

          jumpList.forEach(jumpInfo => {
            if (jumpInfo.aPortId == portInfo.portId || jumpInfo.zPortId == portInfo.portId) {
              isConn = true;
            }
          });
          pcList.forEach(pcInfo => {
            if (pcInfo.portId == portInfo.portId) {
              isConn = true;
            }
          });
        });
        if (portInfo.PARENT_DEV_ID && portInfo.portUse == '1') {
          newPortList.push(portInfo);
        } else if (isConn) {
          newPortList.push(portInfo);
        } else {
          newPortList = this.addToGroup(portInfo, newPortList);
        }
      });
      data.NEW_UNIT_LIST = newUnintList;
      data.NEW_PORT_LIST = newPortList;
      return data;
    },
    addToGroup: function(nodeinfo, nodeList) {
      //遍历，找到和当前节点同一个硬件（束管或者caed）下的资源，根据序号编组
      let isExistGroup = false;
      nodeList.forEach(dataInfo => {
        if (dataInfo.parentId == nodeinfo.parentId) {
          if (dataInfo.GROUP_MAX == nodeinfo.seq - 1) {
            dataInfo.GROUP_MAX = nodeinfo.seq;
            isExistGroup = true;
            dataInfo.CHILD_NODE_LIST.push(nodeinfo);
          } else if (dataInfo.GROUP_MIN == nodeinfo.seq + 1) {
            dataInfo.GROUP_MIN = nodeinfo.seq;
            isExistGroup = true;
            dataInfo.CHILD_NODE_LIST.push(nodeinfo);
          }
        }
      });
      if (!isExistGroup) {
        //找不到已有的组，新建一个组
        let childNodeList = [];
        childNodeList.push(nodeinfo);
        let newGroupNode = fish.extend({}, nodeinfo);
        newGroupNode.GROUP_MAX = newGroupNode.seq;
        newGroupNode.GROUP_MIN = newGroupNode.seq;
        newGroupNode.IS_GROUP = true;
        newGroupNode.CHILD_NODE_LIST = childNodeList;
        newGroupNode.OPEN_GROUP = true;
        nodeList.push(newGroupNode);
      }
      return nodeList;
    },
    toolbarClick(eventName) {
      if (eventName === 'refresh') {
        this.loadTopo();
      } else if (eventName === 'save') {
        this.saveTopo();
      } else if (eventName === 'TOP_ALIGNED') {
        //顶端对齐
        this.topAligned();
      } else if (eventName === 'BOTTOM_ALIGNED') {
        this.bottomAligned();
      } else if (eventName === 'LEFT_ALIGNED') {
        this.leftAligned();
      } else if (eventName === 'RIGHT_ALIGNED') {
        this.rightAligned();
      } else if (eventName === 'EXPORT_IMAGE') {
        this.export(eventName);
      } else if (eventName === 'EXPORT_PDF') {
        this.export(eventName);
      }
    },
    export: function(event) {
      let _self = this;
      let canvas = _self.graphView.toCanvas('white');
      // let imgData = canvas.toDataURL("image/png", 2.0);
      let scale = 10;
      let imgData = _self.graphView.toDataURL('white', 'image/jpeg', scale);
      while (imgData.indexOf('image') == -1 && scale > 0) {
        scale = scale - 0.1;
        imgData = _self.graphView.toDataURL('white', 'image/jpeg', scale);
      }

      let saveFileForIE = function(canvas, fileName) {
        let blob = canvas.msToBlob();
        navigator.msSaveBlob(blob, fileName);
      };

      let saveFile = function(data, filename) {
        let save_link = document.createElement('a');
        save_link.href = data;
        save_link.download = filename;
        //save_link.click(); 该方式firefox不支持。改成下面鼠标事件
        let evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, true);
        save_link.dispatchEvent(evt);
      };

      let ua = navigator.userAgent.toLowerCase();
      let browserType = '';
      if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
        //浏览器类型
        browserType = 'IE';
        //浏览器版本
        //browserVersion = ua.match(/msie ([\d.]+)/) != null ? ua.match(/msie ([\d.]+)/)[1] : ua.match(/rv:([\d.]+)/)[1];
      }
      if (/msie/.test(navigator.userAgent.toLowerCase())) {
        browserType = 'IE';
      }

      if (event === 'EXPORT_IMAGE') {
        // 下载后的问题名
        let type = 'png';
        let filename = 'FiberRouteExport_' + new Date().getTime() + '.' + type;
        if (browserType === 'IE') {
          saveFileForIE(canvas, filename);
        } else {
          // download
          saveFile(imgData, filename);
        }
      } else if (event === 'EXPORT_PDF') {
        // let data = imgData.split(',');
        // let mime = data[0].match(/:(.*?);/)[1];
        // let code = data[1].replace(/[\n\r]/g, '');
        // let raw = window.atob(code);
        // let rawLength = raw.length;
        // let uInt8Array = new Uint8Array(rawLength);
        // for (let i = 0; i < rawLength; ++i) {
        // 	uInt8Array[i] = raw.charCodeAt(i);
        // }
        // let blobItem = new Blob([uInt8Array], {type: 'application/pdf'});
        // let blobURL = window.URL.createObjectURL(blobItem);

        let type = 'pdf';
        let filename = 'FiberRouteExport_' + new Date().getTime() + '.' + type;
        // if (browserType === "IE") {
        // 	//saveFileForIE(canvas, filename);
        // }
        // else {
        // 	// download
        // 	saveFile(blobURL, filename);
        // }

        // let scale =window.devicePixelRatio;
        //
        // canvas.width = this.graphView.toCanvas("white").width;
        // canvas.height = this.graphView.toCanvas("white").height;
        // canvas.style.width = this.graphView.toCanvas("white").width+"px";
        // canvas.style.height = this.graphView.toCanvas("white").height+"px";
        // canvas.getContext("2d").scale(scale, scale);
        // canvas.getContext("2d").fillRect(0,0, canvas.width, canvas.height);
        let pdf = new JSPDF('l', 'pt', [canvas.width, canvas.height]);
        pdf.internal.scaleFactor = 1.55;
        //pdf.addImage(blobURL, 'JPEG', 0, 0, canvas.width, canvas.height);
        //this.graphView.setZoom(20);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
      }
    },
    leftAligned: function() {
      let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];

      let nodeList = [];
      selectNodeList.forEach(selectNode => {
        if (selectNode.getAttrObject() && selectNode.getAttrObject().IS_PARENT) {
          nodeList.push(selectNode);
        }
      });
      //首先根据x轴对节点进行排序
      nodeList.sort(function(a, b) {
        return a.getPosition().x - b.getPosition().x;
      });

      if (nodeList.length > 1) {
        for (let i = 1; i < nodeList.length; i++) {
          nodeList[i].setPosition(nodeList[0].getPosition().x, nodeList[i].getPosition().y);
          this.layout(nodeList[i]);
        }
      }
    },
    rightAligned: function() {
      let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];

      let nodeList = [];
      selectNodeList.forEach(selectNode => {
        if (selectNode.getAttrObject() && selectNode.getAttrObject().IS_PARENT) {
          nodeList.push(selectNode);
        }
      });
      //首先根据x轴对节点进行排序
      nodeList.sort(function(a, b) {
        return b.getPosition().x - a.getPosition().x;
      });

      if (nodeList.length > 1) {
        for (let i = 1; i < nodeList.length; i++) {
          nodeList[i].setPosition(nodeList[0].getPosition().x, nodeList[i].getPosition().y);
          this.layout(nodeList[i]);
        }
      }
    },
    bottomAligned: function() {
      //获取选中的节点，限制选中的必须为设备或者cable
      let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];

      let nodeList = [];
      selectNodeList.forEach(selectNode => {
        if (selectNode.getAttrObject() && selectNode.getAttrObject().IS_PARENT) {
          nodeList.push(selectNode);
        }
      });

      //首先根据x轴对节点进行排序
      nodeList.sort(function(a, b) {
        return a.getPosition().x - b.getPosition().x;
      });

      if (nodeList.length > 1) {
        for (let i = 0; i < nodeList.length - 1; i++) {
          //获取第一个连接的连接点所在纵坐标
          let staerNode = nodeList[i];
          let endNode = nodeList[i + 1];
          let bottomLinkNode = null;
          let offsetY = 0;
          this.CONN_LINK_LIST.forEach(connLink => {
            let ANode = connLink.getSource();
            let ZNode = connLink.getTarget();
            if (
              ANode.getPosition().x > staerNode.getPosition().x - staerNode.getSize().width / 2 &&
              ANode.getPosition().x < staerNode.getPosition().x + staerNode.getSize().width / 2 &&
              ANode.getPosition().y < staerNode.getPosition().y + staerNode.getSize().height / 2 &&
              ANode.getPosition().y > staerNode.getPosition().y - staerNode.getSize().height / 2 &&
              ZNode.getPosition().x > endNode.getPosition().x - endNode.getSize().width / 2 &&
              ZNode.getPosition().x < endNode.getPosition().x + endNode.getSize().width / 2 &&
              ZNode.getPosition().y < endNode.getPosition().y + endNode.getSize().height / 2 &&
              ZNode.getPosition().y > endNode.getPosition().y - endNode.getSize().height / 2
            ) {
              if (!bottomLinkNode) {
                bottomLinkNode = ANode;
                offsetY = ZNode.getPosition().y - ANode.getPosition().y;
              } else if (ANode.getPosition().y > bottomLinkNode.getPosition().y) {
                bottomLinkNode = ANode;
                offsetY = ZNode.getPosition().y - ANode.getPosition().y;
              }
            }
          });
          endNode.setPosition(endNode.getPosition().x, endNode.getPosition().y - offsetY);
          this.layout(endNode);
        }
      }
    },
    topAligned: function() {
      //获取选中的节点，限制选中的必须为设备或者cable
      let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];

      let nodeList = [];
      selectNodeList.forEach(selectNode => {
        if (selectNode.getAttrObject() && selectNode.getAttrObject().IS_PARENT) {
          nodeList.push(selectNode);
        }
      });

      //首先根据x轴对节点进行排序，然后选取其中的第一条连接两端的节点对齐
      nodeList.sort(function(a, b) {
        return a.getPosition().x - b.getPosition().x;
      });

      if (nodeList.length > 1) {
        for (let i = 0; i < nodeList.length - 1; i++) {
          //获取第一个连接的连接点所在纵坐标
          let staerNode = nodeList[i];
          let endNode = nodeList[i + 1];
          let topLinkNode = null;
          let offsetY = 0;
          this.CONN_LINK_LIST.forEach(connLink => {
            let ANode = connLink.getSource();
            let ZNode = connLink.getTarget();
            if (
              ANode.getPosition().x > staerNode.getPosition().x - staerNode.getSize().width / 2 &&
              ANode.getPosition().x < staerNode.getPosition().x + staerNode.getSize().width / 2 &&
              ANode.getPosition().y < staerNode.getPosition().y + staerNode.getSize().height / 2 &&
              ANode.getPosition().y > staerNode.getPosition().y - staerNode.getSize().height / 2 &&
              ZNode.getPosition().x > endNode.getPosition().x - endNode.getSize().width / 2 &&
              ZNode.getPosition().x < endNode.getPosition().x + endNode.getSize().width / 2 &&
              ZNode.getPosition().y < endNode.getPosition().y + endNode.getSize().height / 2 &&
              ZNode.getPosition().y > endNode.getPosition().y - endNode.getSize().height / 2
            ) {
              if (!topLinkNode) {
                topLinkNode = ANode;
                offsetY = ZNode.getPosition().y - ANode.getPosition().y;
              } else if (ANode.getPosition().y < topLinkNode.getPosition().y) {
                topLinkNode = ANode;
                offsetY = ZNode.getPosition().y - ANode.getPosition().y;
              }
            }
          });
          endNode.setPosition(endNode.getPosition().x, endNode.getPosition().y - offsetY);
          this.layout(endNode);
        }
      }
    },
    saveTopo: function() {
      //组装参数
      // let param = {};
      // param.TOPO_SPEC_ID ="FIBER_ROUTE_TOPO";
      // param.RELA_OBJ_ID=this.params.schemaId;
      // param.RELA_OBJ_TYPE="EDN_PROJECT";
      // let nodeList = [];
      // this.NODE_LIST.forEach(node=>{
      //     let nodeInfo = node.getAttrObject();
      //     nodeInfo.X = node.getPosition().x;
      //     nodeInfo.Y = node.getPosition().y;
      //     nodeList.push(nodeInfo);
      // });
      // param.NODE_LIST = nodeList;
      // //保存位置
      // fish.post({
      //     url: 'edesign/topo/saveTopoDataPosition/v1',
      //     data: param,
      //     success : function(re){
      //         //this.loadTopo();
      //         fish.info("Save Success!");
      //     },
      //     error : function(re){
      //         fish.error("Save Position Error!");
      //     }
      // });

      let topoData = {};
      this.NODE_LIST.forEach(node => {
        topoData[node.getAttrObject().NODE_ID] = {
          x: node.getPosition().x,
          y: node.getPosition().y,
          w: node.getSize().width,
          h: node.getSize().height,
          vh: node.getAttrObject().VIR_AREA_HEIGHT,
        };
      });
      this.CONN_LINK_LIST.forEach(link => {
        let points = link.getStyle('edge.points')._as;
        topoData[link.getTag()] = {
          POINTS: points,
        };
      });
      if (Object.keys(topoData).length !== 0) {
        fish.post({
          url: `edesign/topo/data/v1`,
          data: {
            schemaId: this.params.schemaId,
            topoId: this.topoId,
            topoDataString: JSON.stringify(topoData),
          },
          success: result => {
            fish.info(this.$t('SAVE_SUCCESS'));
          },
          error: function(re) {
            fish.error('Save Position Error!');
          },
        });
      }
    },
    reloadInnerEdgePoints: function(node) {
      if (node && node.getAttrObject() && !node.getAttrObject().IS_PARENT) {
        //非父节点
        if (node.getParent()) {
          node = node.getParent();
        }
      }

      if (node && node.getAttrObject()) {
        //调整节点位置后，调整连线折点的位置
        this.CONN_LINK_LIST.forEach(link => {
          let aNode = link.getSource();
          let zNode = link.getTarget();
          if (node == aNode.getParent() && node == zNode.getParent()) {
            let aName = link.getAttrObject().A_NAME;
            let zName = link.getAttrObject().Z_NAME;
            if (zNode.getPosition().x < aNode.getPosition().x) {
              link.setSource(zNode);
              link.setTarget(aNode);
              link.setName(zName + '->' + aName);
              link.getAttrObject().A_NAME = zName;
              link.getAttrObject().Z_NAME = aName;
            }
            link.setStyle('edge.points', this.getPoints(link.getSource(), link.getTarget()));
          }
        });
      } else {
        this.NODE_LIST.forEach(node => {
          this.CONN_LINK_LIST.forEach(link => {
            let aNode = link.getSource();
            let zNode = link.getTarget();
            if (node == aNode.getParent() && node == zNode.getParent()) {
              let aName = link.getAttrObject().A_NAME;
              let zName = link.getAttrObject().Z_NAME;
              if (zNode.getPosition().x < aNode.getPosition().x) {
                link.setSource(zNode);
                link.setTarget(aNode);
                link.setName(zName + '->' + aName);
                link.getAttrObject().A_NAME = zName;
                link.getAttrObject().Z_NAME = aName;
              }
              link.setStyle('edge.points', this.getPoints(link.getSource(), link.getTarget()));
            }
          });
        });
      }
    },
    reloadEdgePoints: function(node) {
      if (!node instanceof ht.Node) {
        return;
      }
      if (!node) {
        return;
      }
      if (node && node.getAttrObject() && !node.getAttrObject().IS_PARENT) {
        //非父节点
        if (node.getParent()) {
          node = node.getParent();
        }
      }

      if (node && node.getAttrObject()) {
        //调整节点位置后，调整连线折点的位置
        this.CONN_LINK_LIST.forEach(link => {
          let aNode = link.getSource();
          let zNode = link.getTarget();
          if (node == aNode.getParent() || node == zNode.getParent()) {
            let aName = link.getAttrObject().A_NAME;
            let zName = link.getAttrObject().Z_NAME;
            if (zNode.getPosition().x < aNode.getPosition().x) {
              link.setSource(zNode);
              link.setTarget(aNode);
              link.setName(zName + '->' + aName);
              link.getAttrObject().A_NAME = zName;
              link.getAttrObject().Z_NAME = aName;
            }
            link.setStyle('edge.points', this.getPoints(link.getSource(), link.getTarget()));
          }
        });
      }
    },
    layoutLinkPoints: function(selectNode) {
      //获取图上所有连线
      let allEdgeList = [];
      let edgeList = [];
      if (selectNode) {
        if (!selectNode instanceof ht.Node) {
          return;
        }
        if (!selectNode) {
          return;
        }
        if (selectNode && selectNode.getAttrObject() && !selectNode.getAttrObject().IS_PARENT) {
          //非父节点
          if (selectNode.getParent()) {
            selectNode = selectNode.getParent();
          }
        }

        if (selectNode && selectNode.getAttrObject()) {
          //调整节点位置后，调整连线折点的位置
          this.CONN_LINK_LIST.forEach(link => {
            let aNode = link.getSource();
            let zNode = link.getTarget();
            if (selectNode == aNode.getParent() || selectNode == zNode.getParent()) {
              edgeList.push(link);
            }
          });
        }

        // this.dataModel.getDatas().each(node => {
        // 	if(node instanceof ht.Edge){
        // 		allEdgeList.push(node);
        // 	}
        // });
      } else {
        this.dataModel.getDatas().each(node => {
          if (node instanceof ht.Edge) {
            edgeList.push(node);
          }
        });
      }

      edgeList = edgeList.filter(function(edgeInfo) {
        return (edgeInfo.getStyle('edge.points')._as || []).length == 2 || (edgeInfo.getStyle('edge.points')._as || []).length == 4;
      });
      // allEdgeList = allEdgeList.filter(function (edgeInfo){
      // 	return (edgeInfo.getStyle("edge.points")._as||[]).length==2 || (edgeInfo.getStyle("edge.points")._as||[]).length==4
      // });

      this.layoutLinkPointsPosition(edgeList);
    },
    layoutNodeYPos: function() {
      let endNodeList = [];
      this.NODE_LIST.forEach(node => {
        let isZNode = true;
        for (let i = 0; i < this.CONN_LINK_LIST.length; i++) {
          let connInfo = this.CONN_LINK_LIST[i];
          if (connInfo.getSource().getParent() === node) {
            isZNode = false;
            break;
          }
        }
        if (isZNode) {
          endNodeList.push(node);
        }
      });
      this.layoutYpos(endNodeList);
      this.NODE_LIST.forEach(node => {
        if (node.MIN_Y) {
          node.setPosition(node.getPosition().x, node.MIN_Y + node.getSize().height / 2);
        }
      });
    },
    layoutYpos: function(endNodeList) {
      let preNodeList = [];
      endNodeList.forEach(endNode => {
        let preId = endNode.getAttrObject().preNodeId;
        if (preId) {
          let preNode = this.dataModel.getDataByTag(preId);
          if (!preNode.MIN_Y) {
            preNode.MIN_Y = endNode.getPosition().y - endNode.getSize().height / 2;
            preNodeList.push(preNode);
          } else if (preNode.MIN_Y > endNode.getPosition().y - endNode.getSize().height / 2) {
            preNode.MIN_Y = endNode.getPosition().y - endNode.getSize().height / 2;
            preNodeList.push(preNode);
          }
        }
      });
      if (preNodeList.length > 0) {
        this.layoutYpos(preNodeList);
      }
    },
    layoutNodeSIze: function(selectNode) {
      if (selectNode) {
        if (selectNode.getParent()) {
          selectNode = selectNode.getParent();
        }
        //设备节点移动，重置高度，以及内部虚拟点的x坐标
        if (selectNode.RES_SPEC_ID === 'DEV') {
          //校正设备的宽度
          this.layoutDevWidth(selectNode);
          //横坐标的校正
          let isHaveVirNode = false;
          this.CONN_NODE_LIST.forEach(connNodeInfo => {
            if (connNodeInfo.getParent() === selectNode && connNodeInfo.IS_DEV_VIR_NODE) {
              isHaveVirNode = true;
              if (connNodeInfo.getAttrObject().IS_A_NODE) {
                connNodeInfo.setPosition(selectNode.getPosition().x - selectNode.getSize().width / 2 + 20, connNodeInfo.getPosition().y);
              } else {
                connNodeInfo.setPosition(selectNode.getPosition().x + selectNode.getSize().width / 2 - 20, connNodeInfo.getPosition().y);
              }
            }
          });
          if (isHaveVirNode) {
            this.layoutDevHeight(selectNode);
          }
        } else if (selectNode.RES_SPEC_ID === 'CABLE') {
          this.NODE_LIST.forEach(node => {
            node.IS_LAYOUT_SIZE = false;
          });
          let linkList = selectNode.LINK_LIST || [];
          linkList.forEach(connInfo => {
            if (
              !connInfo.getTarget().getParent().IS_LAYOUT_SIZE &&
              connInfo.getSource().getParent() === selectNode &&
              connInfo.getTarget().IS_DEV_VIR_NODE
            ) {
              this.layoutNodeSIze(connInfo.getTarget().getParent());
              //this.layoutDevHeight(connInfo.getTarget().getParent());
              this.reloadInnerEdgePoints(connInfo.getTarget().getParent());
              this.layoutNodeInnerLinkPoints(connInfo.getTarget().getParent());
              connInfo.getTarget().getParent().IS_LAYOUT_SIZE = true;
            } else if (
              !connInfo.getSource().getParent().IS_LAYOUT_SIZE &&
              connInfo.getTarget().getParent() === selectNode &&
              connInfo.getSource().IS_DEV_VIR_NODE
            ) {
              this.layoutNodeSIze(connInfo.getSource().getParent());
              //this.layoutDevHeight(connInfo.getSource().getParent());
              this.reloadInnerEdgePoints(connInfo.getSource().getParent());
              this.layoutNodeInnerLinkPoints(connInfo.getSource().getParent());
              connInfo.getSource().getParent().IS_LAYOUT_SIZE = true;
            }
          });
        }
      } else {
        this.NODE_LIST.forEach(node => {
          if (node.RES_SPEC_ID === 'DEV') {
            this.layoutDevWidth(node);
            //横坐标的校正
            let isHaveVirNode = false;
            this.CONN_NODE_LIST.forEach(connNodeInfo => {
              if (connNodeInfo.getParent() === node && connNodeInfo.IS_DEV_VIR_NODE) {
                isHaveVirNode = true;
                if (connNodeInfo.getAttrObject().IS_A_NODE) {
                  connNodeInfo.setPosition(node.getPosition().x - node.getSize().width / 2 + 20, connNodeInfo.getPosition().y);
                } else {
                  connNodeInfo.setPosition(node.getPosition().x + node.getSize().width / 2 - 20, connNodeInfo.getPosition().y);
                }
              }
            });
            if (isHaveVirNode) {
              this.layoutDevHeight(node);
            }
          }
        });
      }
    },
    layoutDevWidth: function(selectNode) {
      let leftConnNum = selectNode.getAttrObject().LEFT_POINTS_LINK_NUM ? selectNode.getAttrObject().LEFT_POINTS_LINK_NUM : 0;
      let innerConnNum = selectNode.getAttrObject().INNER_POINTS_LINK_NUM ? selectNode.getAttrObject().INNER_POINTS_LINK_NUM : 0;
      let rightConnNum = selectNode.getAttrObject().RIGHT_POINTS_LINK_NUM ? selectNode.getAttrObject().RIGHT_POINTS_LINK_NUM : 0;
      // this.CONN_LINK_LIST.forEach(connInfo=>{
      // 	if(connInfo.getSource().getParent() === selectNode && connInfo.getTarget().getParent() === selectNode){
      // 		let points = connInfo.getStyle("edge.points")._as||[];
      // 		if(connInfo.LINK_POSITION === 'CENTER'&& points.length>0){
      // 			innerConnNum++;
      // 		}
      // 		else if(connInfo.LINK_POSITION === 'LEFT'&& points.length>0){
      // 			leftConnNum++;
      // 		}
      // 		else if(connInfo.LINK_POSITION === 'RIGHT' && points.length>0){
      // 			rightConnNum++;
      // 		}
      // 		else if(connInfo.LINK_POSITION === 'ALL'){
      // 			if(points.length ===4){
      // 				leftConnNum++;
      // 				rightConnNum++;
      // 			}
      // 			else if(points.length>0){
      // 				rightConnNum++;
      // 			}
      // 		}
      // 	}
      // });
      selectNode.getAttrObject().INNER_WIDTH = (innerConnNum ? innerConnNum + 1 : 1) * (this.PORT_HEIGHT + this.PORT_INTERVAL);
      selectNode.getAttrObject().LEFT_WIDTH =
        (this.PORT_HEIGHT + this.PORT_INTERVAL) * ((leftConnNum ? leftConnNum : 0) + 1) + 20 + this.PORT_INTERVAL / 2;
      selectNode.getAttrObject().RIGHT_WIDTH =
        (this.PORT_HEIGHT + this.PORT_INTERVAL) * ((rightConnNum ? rightConnNum : 0) + 1) + 20 + this.PORT_INTERVAL / 2;
      selectNode.getAttrObject().WIDTH =
        selectNode.getAttrObject().RELA_DEV_WIDTH +
        selectNode.getAttrObject().HARDWARE_WIDTH +
        selectNode.getAttrObject().INNER_WIDTH +
        selectNode.getAttrObject().LEFT_WIDTH +
        selectNode.getAttrObject().RIGHT_WIDTH;

      // selectNode.CHILD_NODE.setHost(null);
      let hostNode = selectNode.getHost();
      selectNode.setHost(null);
      let offsetWidth = selectNode.getSize().width - selectNode.getAttrObject().WIDTH;
      selectNode.setSize(selectNode.getSize().width - offsetWidth, selectNode.getSize().height);
      selectNode.setPosition(selectNode.getPosition().x - offsetWidth / 2, selectNode.getPosition().y);

      selectNode.CHILD_NODE.setPosition(
        selectNode.getPosition().x -
          selectNode.getSize().width / 2 +
          selectNode.getAttrObject().LEFT_WIDTH +
          selectNode.CHILD_NODE.getSize().width / 2,
        selectNode.CHILD_NODE.getPosition().y,
      );
      // selectNode.CHILD_NODE.setHost(selectNode);
      selectNode.setHost(hostNode);
    },
    layoutDevHeight: function(selectNode) {
      //横坐标的校正
      let minPosY = 9999;
      let maxPosY = -9999;
      this.CONN_NODE_LIST.forEach(connNodeInfo => {
        if (connNodeInfo.getParent() === selectNode && connNodeInfo.IS_DEV_VIR_NODE) {
          //if(connNodeInfo.getParent() === selectNode){
          if (connNodeInfo.getPosition().y - connNodeInfo.getSize().height / 2 < minPosY) {
            minPosY = connNodeInfo.getPosition().y - connNodeInfo.getSize().height / 2;
          }
          if (connNodeInfo.getPosition().y + connNodeInfo.getSize().height / 2 > maxPosY) {
            maxPosY = connNodeInfo.getPosition().y + connNodeInfo.getSize().height / 2;
          }
        }
      });
      selectNode.getAttrObject().VIR_AREA_HEIGHT = maxPosY - minPosY;
      let offsetYPos = 0;
      if (minPosY < selectNode.getPosition().y - selectNode.getSize().height / 2) {
        //let hostNode = selectNode.getHost();
        //selectNode.setHost(null);
        offsetYPos = selectNode.getPosition().y - selectNode.getSize().height / 2 + this.PORT_INTERVAL / 2 + this.PORT_INTERVAL - minPosY;
        //校正设备的宽度，高度
        //selectNode.setSize(selectNode.getSize().width, selectNode.getSize().height+offsetYPos);
        selectNode.setPosition(selectNode.getPosition().x, selectNode.getPosition().y - offsetYPos);

        //selectNode.CHILD_NODE.setPosition(selectNode.CHILD_NODE.getPosition().x, selectNode.getPosition().y-selectNode.getSize().height/2+selectNode.CHILD_NODE.getSize().height/2);
        //selectNode.setHost(hostNode);
      }
      if (maxPosY > selectNode.getPosition().y + selectNode.getSize().height / 2) {
        let hostNode = selectNode.getHost();
        selectNode.setHost(null);
        offsetYPos = maxPosY - (selectNode.getPosition().y + selectNode.getSize().height / 2 - this.PORT_INTERVAL / 2);
        //校正设备的宽度，高度
        selectNode.setSize(selectNode.getSize().width, selectNode.getSize().height + Math.abs(offsetYPos));
        selectNode.setPosition(selectNode.getPosition().x, selectNode.getPosition().y + offsetYPos / 2);
        selectNode.CHILD_NODE.setPosition(
          selectNode.CHILD_NODE.getPosition().x,
          selectNode.getPosition().y - selectNode.getSize().height / 2 + selectNode.CHILD_NODE.getSize().height / 2,
        );
        selectNode.setHost(hostNode);
      }
      let devMaxPosY = maxPosY;
      if (selectNode.getAttrObject().HARDWARE_HEIGHT + selectNode.getPosition().y - selectNode.getSize().height / 2 > devMaxPosY) {
        devMaxPosY = selectNode.getAttrObject().HARDWARE_HEIGHT + selectNode.getPosition().y - selectNode.getSize().height / 2;
      }
      if (selectNode.getAttrObject().RELA_DEV_HEIGHT + selectNode.getPosition().y - selectNode.getSize().height / 2 > devMaxPosY) {
        devMaxPosY = selectNode.getAttrObject().RELA_DEV_HEIGHT + selectNode.getPosition().y - selectNode.getSize().height / 2;
      }
      // if(selectNode.RES_SPEC_ID === 'DEV' && (selectNode.getPosition().y+selectNode.getSize().height/2)>devMaxPosY){
      // 	maxPosY = (selectNode.getAttrObject().HARDWARE_HEIGHT+selectNode.getPosition().y-selectNode.getSize().height/2)>(selectNode.getAttrObject().RELA_DEV_HEIGHT+selectNode.getPosition().y-selectNode.getSize().height/2)?(selectNode.getAttrObject().HARDWARE_HEIGHT+selectNode.getPosition().y-selectNode.getSize().height/2):(selectNode.getAttrObject().RELA_DEV_HEIGHT+selectNode.getPosition().y-selectNode.getSize().height/2);
      // 	let hostNode = selectNode.getHost();
      // 	selectNode.setHost(null);
      // 	offsetYPos = (selectNode.getPosition().y+selectNode.getSize().height/2) - devMaxPosY;
      // 	//校正设备的宽度，高度
      // 	selectNode.setSize(selectNode.getSize().width, selectNode.getSize().height-offsetYPos);
      // 	selectNode.setPosition(selectNode.getPosition().x, selectNode.getPosition().y - offsetYPos/2);
      // 	selectNode.CHILD_NODE.setPosition(selectNode.CHILD_NODE.getPosition().x, selectNode.getPosition().y-selectNode.getSize().height/2+selectNode.CHILD_NODE.getSize().height/2);
      // 	selectNode.setHost(hostNode);
      // }
      if (
        selectNode.getAttrObject().HARDWARE_HEIGHT === 0 &&
        selectNode.getAttrObject().RELA_DEV_HEIGHT === 0 &&
        selectNode.getPosition().y - selectNode.getSize().height / 2 + this.PORT_INTERVAL / 2 + this.PORT_INTERVAL < minPosY
      ) {
        let hostNode = selectNode.getHost();
        selectNode.setHost(null);
        offsetYPos = selectNode.getPosition().y - selectNode.getSize().height / 2 + this.PORT_INTERVAL / 2 + this.PORT_INTERVAL - minPosY;
        //校正设备的宽度，高度
        selectNode.setSize(selectNode.getSize().width, selectNode.getSize().height + offsetYPos);
        selectNode.setPosition(selectNode.getPosition().x, selectNode.getPosition().y - offsetYPos / 2);

        selectNode.CHILD_NODE.setPosition(
          selectNode.CHILD_NODE.getPosition().x,
          selectNode.getPosition().y - selectNode.getSize().height / 2 + selectNode.CHILD_NODE.getSize().height / 2,
        );
        selectNode.setHost(hostNode);
      }
    },
    layoutNodeInnerLinkPoints: function(selectNode) {
      if (!selectNode) {
        //获取横坐标为0的节点，进行横坐标调节
        this.NODE_LIST.forEach(node => {
          let edgeList = [];
          this.CONN_LINK_LIST.forEach(connInfo => {
            if (connInfo.getSource().getParent() === node && connInfo.getTarget().getParent() === node) {
              edgeList.push(connInfo);
            }
          });

          edgeList = edgeList.filter(function(edgeInfo) {
            return (edgeInfo.getStyle('edge.points')._as || []).length == 2 || (edgeInfo.getStyle('edge.points')._as || []).length == 4;
          });
          this.layoutInnerLinkPointsPosition(edgeList);
        });
      } else {
        let edgeList = [];
        this.CONN_LINK_LIST.forEach(connInfo => {
          if (connInfo.getSource().getParent() === selectNode && connInfo.getTarget().getParent() === selectNode) {
            edgeList.push(connInfo);
          }
        });

        edgeList = edgeList.filter(function(edgeInfo) {
          return (edgeInfo.getStyle('edge.points')._as || []).length == 2 || (edgeInfo.getStyle('edge.points')._as || []).length == 4;
        });
        this.layoutInnerLinkPointsPosition(edgeList);
      }
    },
    layoutNodeXpos: function(selectNode) {
      this.NODE_LIST.forEach(node => {
        node.IS_LAYOUT_XPOS = false;
      });
      if (!selectNode) {
        //获取横坐标为0的节点，进行横坐标调节
        this.NODE_LIST.forEach(node => {
          if (node.getAttrObject().X_NUMBER === 0) {
            this.layoutXPos(node);
          }
        });
        this.NODE_LIST.forEach(node => {
          this.CONN_NODE_LIST.forEach(connNodeInfo => {
            if (connNodeInfo.getParent() === node && connNodeInfo.IS_DEV_VIR_NODE) {
              if (connNodeInfo.getAttrObject().IS_A_NODE) {
                connNodeInfo.setPosition(node.getPosition().x - node.getSize().width / 2 + 20, connNodeInfo.getPosition().y);
              } else {
                connNodeInfo.setPosition(node.getPosition().x + node.getSize().width / 2 - 20, connNodeInfo.getPosition().y);
              }
            }
          });
        });
      } else {
        let isFindPreNode = false;
        //let connList = selectNode.getTargetEdges()?selectNode.getTargetEdges()._as:[];
        this.CONN_LINK_LIST.forEach(connInfo => {
          if (
            !connInfo.getSource().getParent().IS_LAYOUT_XPOS &&
            connInfo.getTarget().getParent() === selectNode &&
            connInfo.getTarget().getParent() !== connInfo.getSource().getParent()
          ) {
            isFindPreNode = true;
            connInfo.getSource().getParent().IS_LAYOUT_XPOS = true;
            this.layoutXPos(connInfo.getSource().getParent());
          }
        });
        if (!isFindPreNode && selectNode.IS_LAYOUT_XPOS === false) {
          selectNode.IS_LAYOUT_XPOS = true;
          this.layoutXPos(selectNode);
        }
      }
    },
    layoutXPos: function(selectNode) {
      //获取该节点左端和右端的连线，计算折线的数量
      //let leftConnList =[];
      this.layoutLinkPoints1(selectNode);
      let rightConnList = [];
      //let countPointLink = 1;
      this.CONN_LINK_LIST.forEach(connInfo => {
        if (connInfo.getSource().getParent() === selectNode && connInfo.getSource().getParent() !== connInfo.getTarget().getParent()) {
          rightConnList.push(connInfo);
          // if((connInfo.getStyle("edge.points")._as||[]).length>0){
          // 	countPointLink++;
          // }
        }
      });
      //调节后续节点的位置
      let baseXPos = selectNode.getPosition().x + selectNode.getSize().width / 2;
      // let xPosInterval = countPointLink * (this.PORT_HEIGHT + this.PORT_INTERVAL);
      //let xPosInterval = Math.ceil((countPointLink * (this.PORT_HEIGHT + this.PORT_INTERVAL))/this.X_INTERVAL)*this.X_INTERVAL;
      rightConnList.forEach(rightConnInfo => {
        let targetNode = rightConnInfo.getTarget().getParent();
        if (!targetNode.IS_LAYOUT_XPOS) {
          // let offsetPosX = baseXPos+xPosInterval+targetNode.getSize().width/2 - targetNode.getPosition().x;
          // if((baseXPos+xPosInterval+targetNode.getSize().width/2)>targetNode.getPosition().x){
          // 	targetNode.setPosition(baseXPos+xPosInterval+targetNode.getSize().width/2, targetNode.getPosition().y);
          // }
          targetNode.IS_LAYOUT_XPOS = true;
          // this.CONN_LINK_LIST.forEach(connInfo=>{
          // 	if(connInfo.getSource().getParent() === targetNode ||  connInfo.getTarget().getParent() === targetNode){
          // 		let points = connInfo.getStyle("edge.points")._as||[];
          // 		points.forEach(point=>{
          // 			point.x += offsetPosX/2;
          // 		});
          // 		connInfo.setStyle('edge.points', points);
          // 	}
          // });
          // if(targetNode.RES_SPEC_ID==='DEV'){
          // 	this.layoutNodeSIze(targetNode);
          // }
          if (!targetNode.getAttrObject().IS_ROUTE_BY_JUMP) {
            targetNode.setPosition(baseXPos + this.X_INTERVAL + targetNode.getSize().width / 2, targetNode.getPosition().y);
          }
          this.layoutXPos(targetNode);
        }
      });
    },
    layoutLinkPoints1: function(selectNode) {
      //获取图上所有连线
      let edgeList = [];
      let edgeList1 = [];
      this.CONN_LINK_LIST.forEach(connInfo => {
        if (connInfo.getSource().getParent() === selectNode && connInfo.getTarget().getParent() !== connInfo.getSource().getParent()) {
          edgeList1.push(connInfo);
        }
        // if(connInfo.getSource().getParent() === selectNode && connInfo.getTarget().getParent() === connInfo.getSource().getParent()){
        // 	edgeList.push(connInfo);
        // }
      });

      // edgeList = edgeList.filter(function (edgeInfo){
      // 	return (edgeInfo.getStyle("edge.points")._as||[]).length==2 || (edgeInfo.getStyle("edge.points")._as||[]).length==4
      // });
      edgeList1 = edgeList1.filter(function(edgeInfo) {
        return (edgeInfo.getStyle('edge.points')._as || []).length == 2 || (edgeInfo.getStyle('edge.points')._as || []).length == 4;
      });
      //this.layoutInnerLinkPointsPosition(edgeList);
      this.layoutLinkPointsPosition(edgeList1);
    },
    layoutInnerLinkPointsPosition: function(edgeList) {
      let edgeGroupList = [];

      edgeGroupList.push(edgeList);

      edgeGroupList.forEach(edgeNodeList => {
        let lineInterval = this.PORT_HEIGHT + this.PORT_INTERVAL;
        let fourPointsEdgeList = [];
        let leftEdgeList = [];
        let centerEdgeList = [];
        let rightEdgeList = [];
        edgeNodeList.forEach(edgeInfo => {
          if (edgeInfo.LINK_POSITION === 'CENTER') {
            centerEdgeList.push(edgeInfo);
          } else if (edgeInfo.LINK_POSITION === 'LEFT') {
            leftEdgeList.push(edgeInfo);
          } else if (edgeInfo.LINK_POSITION === 'RIGHT') {
            rightEdgeList.push(edgeInfo);
          } else if (edgeInfo.LINK_POSITION === 'ALL') {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            if (points.length === 4) {
              fourPointsEdgeList.push(edgeInfo);
              leftEdgeList.push(edgeInfo);
              rightEdgeList.push(edgeInfo);
            } else {
              leftEdgeList.push(edgeInfo);
            }
          }
        });
        if (fourPointsEdgeList.length > 0) {
          //纵坐标调整
          fourPointsEdgeList.sort(function(edgeA, edgeB) {
            return edgeA.getSource().getPosition().y - edgeB.getSource().getPosition().y;
          });
          let offsetYpos = lineInterval;
          let basePosYpos = (fourPointsEdgeList[0].getStyle('edge.points')._as || [])[1].y;
          fourPointsEdgeList.forEach(edge => {
            let points = edge.getStyle('edge.points')._as || [];
            points[1].y = basePosYpos + offsetYpos;
            points[2].y = basePosYpos + offsetYpos;
            edge.setStyle('edge.points', points);
            offsetYpos += lineInterval;
          });
        }
        if (centerEdgeList.length > 0) {
          let edgeTopList = [];
          let edgeButtomList = [];

          centerEdgeList.forEach(edgeInfo => {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            if (points[1].y > points[0].y) {
              edgeTopList.push(edgeInfo);
            } else if (points[1].y < points[0].y) {
              edgeButtomList.push(edgeInfo);
            }
          });

          if (edgeTopList.length > 0) {
            edgeTopList.sort(function(edgeA, edgeB) {
              return edgeB.getSource().getPosition().y - edgeA.getSource().getPosition().y;
            });
            let offsetTopXpos = lineInterval;
            // let topPosX = edgeTopList[0].getSource().getParent().getPosition().x-edgeTopList[0].getSource().getParent().getSize().width/2 + edgeTopList[0].getSource().getParent().getAttrObject().LEFT_WIDTH +edgeTopList[0].getSource().getParent().getAttrObject().HARDWARE_WIDTH;
            let topPosX = edgeTopList[0].getSource().getPosition().x;
            edgeTopList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              points[0].x = topPosX + offsetTopXpos;
              points[1].x = topPosX + offsetTopXpos;
              edgeInfo.setStyle('edge.points', points);
              offsetTopXpos += lineInterval;
            });
          }
          if (edgeButtomList.length > 0) {
            edgeButtomList.sort(function(edgeA, edgeB) {
              return edgeA.getSource().getPosition().y - edgeB.getSource().getPosition().y;
            });
            let offsetButtomXpos = 0;
            // let bottomPosX = edgeButtomList[0].getSource().getParent().getPosition().x - edgeButtomList[0].getSource().getParent().getSize().width/2 + edgeButtomList[0].getSource().getParent().getAttrObject().LEFT_WIDTH + edgeButtomList[0].getSource().getParent().getAttrObject().HARDWARE_WIDTH + (edgeTopList.length+1)*lineInterval ;
            let bottomPosX = edgeButtomList[0].getSource().getPosition().x + (edgeTopList.length + 1) * lineInterval;
            edgeButtomList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              points[0].x = bottomPosX + offsetButtomXpos;
              points[1].x = bottomPosX + offsetButtomXpos;
              edgeInfo.setStyle('edge.points', points);
              offsetButtomXpos += lineInterval;
            });
          }
        }
        if (leftEdgeList.length > 0) {
          let edgeTopList = [];
          let edgeButtomList = [];

          leftEdgeList.forEach(edgeInfo => {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            if (points[1].y > points[0].y) {
              edgeTopList.push(edgeInfo);
            } else if (points[1].y < points[0].y) {
              edgeButtomList.push(edgeInfo);
            }
          });

          if (edgeTopList.length > 0) {
            edgeTopList.sort(function(edgeA, edgeB) {
              let aPosY = edgeA.getSource().getPosition().y;
              let bPosY = edgeB.getSource().getPosition().y;
              return bPosY - aPosY;
            });
            let offsetTopXpos = lineInterval;
            let topPosX =
              edgeTopList[0]
                .getSource()
                .getParent()
                .getPosition().x -
              edgeTopList[0]
                .getSource()
                .getParent()
                .getSize().width /
                2 +
              lineInterval * 2;
            edgeTopList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              points[0].x = topPosX + offsetTopXpos;
              points[1].x = topPosX + offsetTopXpos;
              edgeInfo.setStyle('edge.points', points);
              offsetTopXpos += lineInterval;
            });
          }
          if (edgeButtomList.length > 0) {
            edgeButtomList.sort(function(edgeA, edgeB) {
              let aPosY = edgeA.getSource().getPosition().y;
              let bPosY = edgeB.getSource().getPosition().y;
              return aPosY - bPosY;
            });
            let offsetButtomXpos = 0;
            let bottomPosX =
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getPosition().x -
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getSize().width /
                2 +
              (edgeTopList.length + 3) * lineInterval;
            edgeButtomList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              points[0].x = bottomPosX + offsetButtomXpos;
              points[1].x = bottomPosX + offsetButtomXpos;
              edgeInfo.setStyle('edge.points', points);
              offsetButtomXpos += lineInterval;
            });
          }
        }
        if (rightEdgeList.length > 0) {
          let edgeTopList = [];
          let edgeButtomList = [];

          rightEdgeList.forEach(edgeInfo => {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            if (points.length === 4) {
              //融接连接，四个折点
              if (points[3].y > points[2].y) {
                edgeTopList.push(edgeInfo);
              } else if (points[3].y < points[2].y) {
                edgeButtomList.push(edgeInfo);
              }
            } else if (points[1].y > points[0].y) {
              edgeTopList.push(edgeInfo);
            } else if (points[1].y < points[0].y) {
              edgeButtomList.push(edgeInfo);
            }
          });

          if (edgeTopList.length > 0) {
            edgeTopList.sort(function(edgeA, edgeB) {
              let aPosY = edgeA.LINK_POSITION === 'ALL' ? edgeA.getStyle('edge.points')._as[2].y : edgeA.getSource().getPosition().y;
              let bPosY = edgeB.LINK_POSITION === 'ALL' ? edgeB.getStyle('edge.points')._as[2].y : edgeB.getSource().getPosition().y;
              return bPosY - aPosY;
            });
            let offsetTopXpos = lineInterval;
            let topPosX =
              edgeTopList[0]
                .getSource()
                .getParent()
                .getPosition().x -
              edgeTopList[0]
                .getSource()
                .getParent()
                .getSize().width /
                2 +
              edgeTopList[0]
                .getSource()
                .getParent()
                .getAttrObject().LEFT_WIDTH +
              edgeTopList[0]
                .getSource()
                .getParent()
                .getAttrObject().HARDWARE_WIDTH +
              edgeTopList[0]
                .getSource()
                .getParent()
                .getAttrObject().RELA_DEV_WIDTH +
              edgeTopList[0]
                .getSource()
                .getParent()
                .getAttrObject().INNER_WIDTH;
            edgeTopList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              if (points.length === 4) {
                points[2].x = topPosX + offsetTopXpos;
                points[3].x = topPosX + offsetTopXpos;
              } else {
                points[0].x = topPosX + offsetTopXpos;
                points[1].x = topPosX + offsetTopXpos;
              }
              edgeInfo.setStyle('edge.points', points);
              offsetTopXpos += lineInterval;
            });
          }
          if (edgeButtomList.length > 0) {
            edgeButtomList.sort(function(edgeA, edgeB) {
              let aPosY = edgeA.LINK_POSITION === 'ALL' ? edgeA.getStyle('edge.points')._as[2].y : edgeA.getSource().getPosition().y;
              let bPosY = edgeB.LINK_POSITION === 'ALL' ? edgeB.getStyle('edge.points')._as[2].y : edgeB.getSource().getPosition().y;
              return aPosY - bPosY;
            });
            let offsetButtomXpos = 0;
            let bottomPosX =
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getPosition().x -
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getSize().width /
                2 +
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getAttrObject().LEFT_WIDTH +
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getAttrObject().HARDWARE_WIDTH +
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getAttrObject().RELA_DEV_WIDTH +
              edgeButtomList[0]
                .getSource()
                .getParent()
                .getAttrObject().INNER_WIDTH +
              (edgeTopList.length + 1) * lineInterval;
            edgeButtomList.forEach(edgeInfo => {
              let points = edgeInfo.getStyle('edge.points')._as || [];
              if (points.length === 4) {
                points[2].x = bottomPosX + offsetButtomXpos;
                points[3].x = bottomPosX + offsetButtomXpos;
              } else {
                points[0].x = bottomPosX + offsetButtomXpos;
                points[1].x = bottomPosX + offsetButtomXpos;
              }

              edgeInfo.setStyle('edge.points', points);
              offsetButtomXpos += lineInterval;
            });
          }
        }
      });
    },
    layoutLinkPointsPosition: function(edgeList) {
      let edgeGroupList = [];

      edgeGroupList.push(edgeList);

      // if(selectNode){
      // 	allEdgeList.forEach(edgeInfo=>{
      // 		for(let i=0; i<edgeGroupList.length; i++){
      // 			let edgeGroup = edgeGroupList[i];
      // 			if(Math.abs((edgeGroup[0].getStyle("edge.points")._as||[])[0].x - (edgeInfo.getStyle("edge.points")._as||[])[0].x)<200 && Math.abs((edgeGroup[0].getStyle("edge.points")._as||[])[0].y - (edgeInfo.getStyle("edge.points")._as||[])[0].y)<200){
      // 				edgeGroup.push(edgeInfo);
      // 				break;
      // 			}
      // 		}
      // 	})
      // }

      //console.log(edgeGroupList);
      edgeGroupList.forEach(edgeNodeList => {
        let edgeTopList = [];
        let edgeButtomList = [];
        edgeNodeList.forEach(edgeInfo => {
          let points = edgeInfo.getStyle('edge.points')._as || [];
          if (points[1].y > points[0].y) {
            edgeTopList.push(edgeInfo);
          } else if (points[1].y < points[0].y) {
            edgeButtomList.push(edgeInfo);
          }
        });

        edgeButtomList.sort(function(edgeA, edgeB) {
          return (edgeA.getStyle('edge.points')._as || [])[0].y - (edgeB.getStyle('edge.points')._as || [])[0].y;
        });
        edgeTopList.sort(function(edgeA, edgeB) {
          return (edgeA.getStyle('edge.points')._as || [])[0].y - (edgeB.getStyle('edge.points')._as || [])[0].y;
        });

        let fourPointsEdgeList = [];
        let lineInterval = this.PORT_HEIGHT + this.PORT_INTERVAL;
        let nodeOffsetX = 0;
        if (edgeTopList.length > 0) {
          //lineInterval = (Math.abs(edgeTopList[0].getSource().getPosition().x-edgeTopList[0].getTarget().getPosition().x)-edgeTopList[0].getSource().getParent().getSize().width/2-edgeTopList[0].getTarget().getParent().getSize().width/2-20)/(edgeTopList.length+edgeButtomList.length);
          nodeOffsetX =
            (edgeTopList[0]
              .getSource()
              .getParent()
              .getSize().width /
              2 -
              edgeTopList[0]
                .getTarget()
                .getParent()
                .getSize().width /
                2) /
            2;
          if (lineInterval < 0) {
            return;
          }

          let offsetTopXpos = (edgeTopList.length - (edgeButtomList.length + edgeTopList.length) / 2) * lineInterval;
          if (edgeButtomList.length == 0) {
            offsetTopXpos = (edgeTopList.length * lineInterval) / 2;
          }
          let topPosX =
            edgeTopList[0]
              .getSource()
              .getParent()
              .getPosition().x +
            edgeTopList[0]
              .getSource()
              .getParent()
              .getSize().width /
              2 +
            (edgeTopList[0]
              .getTarget()
              .getParent()
              .getPosition().x -
              edgeTopList[0]
                .getTarget()
                .getParent()
                .getSize().width /
                2 -
              (edgeTopList[0]
                .getSource()
                .getParent()
                .getPosition().x +
                edgeTopList[0]
                  .getSource()
                  .getParent()
                  .getSize().width /
                  2)) /
              2;
          edgeTopList.forEach(edgeInfo => {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            points[0].x = topPosX + offsetTopXpos;
            points[1].x = topPosX + offsetTopXpos;
            edgeInfo.setStyle('edge.points', points);
            offsetTopXpos -= lineInterval;
            if ((edgeInfo.getStyle('edge.points')._as || []).length == 4) {
              fourPointsEdgeList.push(edgeInfo);
            }
          });
        }
        if (edgeButtomList.length > 0) {
          //lineInterval = (Math.abs(edgeButtomList[0].getSource().getPosition().x-edgeButtomList[0].getTarget().getPosition().x)-edgeButtomList[0].getSource().getParent().getSize().width/2-edgeButtomList[0].getTarget().getParent().getSize().width/2)/(edgeTopList.length+edgeButtomList.length);
          nodeOffsetX =
            (edgeButtomList[0]
              .getSource()
              .getParent()
              .getSize().width /
              2 -
              edgeButtomList[0]
                .getTarget()
                .getParent()
                .getSize().width /
                2) /
            2;
          if (lineInterval < 0) {
            return;
          }
          // if(lineInterval>5){
          // 	lineInterval=5;
          // }
          let offsetButtomXpos = (edgeTopList.length - (edgeButtomList.length + edgeTopList.length) / 2 + 1) * lineInterval;
          if (edgeTopList.length == 0) {
            offsetButtomXpos = -((edgeButtomList.length * lineInterval) / 2);
          }
          let bottomPosX =
            edgeButtomList[0]
              .getSource()
              .getParent()
              .getPosition().x +
            edgeButtomList[0]
              .getSource()
              .getParent()
              .getSize().width /
              2 +
            (edgeButtomList[0]
              .getTarget()
              .getParent()
              .getPosition().x -
              edgeButtomList[0]
                .getTarget()
                .getParent()
                .getSize().width /
                2 -
              (edgeButtomList[0]
                .getSource()
                .getParent()
                .getPosition().x +
                edgeButtomList[0]
                  .getSource()
                  .getParent()
                  .getSize().width /
                  2)) /
              2;
          edgeButtomList.forEach(edgeInfo => {
            let points = edgeInfo.getStyle('edge.points')._as || [];
            points[0].x = bottomPosX + offsetButtomXpos;
            points[1].x = bottomPosX + offsetButtomXpos;
            edgeInfo.setStyle('edge.points', points);
            offsetButtomXpos += lineInterval;
            if ((edgeInfo.getStyle('edge.points')._as || []).length == 4) {
              fourPointsEdgeList.push(edgeInfo);
            }
          });
        }
      });
    },
    nodeClick: function(node) {
      if (node instanceof ht.Node) {
        if (node.getParent()) {
          this.dataModel.getSelectionModel().appendSelection(node.getParent());
        }
      }
    },
    edgeClick: function(elem) {
      if (elem instanceof ht.Edge) {
        this.CONN_LINK_LIST.forEach(connNode => {
          if (
            connNode.getSource() === elem.getSource() ||
            connNode.getSource() === elem.getTarget() ||
            connNode.getTarget() === elem.getSource() ||
            connNode.getTarget() === elem.getTarget()
          ) {
            if (!this.graphView.isSelected(connNode)) {
              this.dataModel.getSelectionModel().appendSelection(connNode);
              this.edgeClick(connNode);
            }
          } else if (
            (elem.getSource().LINK_NODE_ID &&
              (connNode.getSource().LINK_NODE_ID === elem.getSource().LINK_NODE_ID ||
                connNode.getTarget().LINK_NODE_ID === elem.getSource().LINK_NODE_ID)) ||
            (elem.getTarget().LINK_NODE_ID &&
              (connNode.getSource().LINK_NODE_ID === elem.getTarget().LINK_NODE_ID ||
                connNode.getTarget().LINK_NODE_ID === elem.getTarget().LINK_NODE_ID))
          ) {
            if (!this.graphView.isSelected(connNode)) {
              this.dataModel.getSelectionModel().appendSelection(connNode);
              this.edgeClick(connNode);
            }
          } else if (
            elem.IS_ROUTE_SPLITTER &&
            ((elem.getSource().getAttrObject().portUse === '1' &&
              elem.getSource().getAttrObject().PARENT_DEV_ID &&
              ((connNode.getSource().getAttrObject().portUse === '0' &&
                connNode.getSource().getAttrObject().PARENT_DEV_ID === elem.getSource().getAttrObject().PARENT_DEV_ID) ||
                (connNode.getTarget().getAttrObject().portUse === '0' &&
                  connNode.getTarget().getAttrObject().PARENT_DEV_ID === elem.getSource().getAttrObject().PARENT_DEV_ID))) ||
              (elem.getTarget().getAttrObject().portUse === '1' &&
                elem.getTarget().getAttrObject().PARENT_DEV_ID &&
                ((connNode.getSource().getAttrObject().portUse === '0' &&
                  connNode.getSource().getAttrObject().PARENT_DEV_ID === elem.getTarget().getAttrObject().PARENT_DEV_ID) ||
                  (connNode.getTarget().getAttrObject().portUse === '0' &&
                    connNode.getTarget().getAttrObject().PARENT_DEV_ID === elem.getTarget().getAttrObject().PARENT_DEV_ID))))
          ) {
            if (!this.graphView.isSelected(connNode)) {
              this.dataModel.getSelectionModel().appendSelection(connNode);
              this.edgeClick(connNode);
            }
          } else if (
            (elem.getSource().getAttrObject().portUse === '0' &&
              elem.getSource().getAttrObject().PARENT_DEV_ID &&
              ((connNode.getSource().getAttrObject().portUse === '1' &&
                connNode.getSource().getAttrObject().PARENT_DEV_ID === elem.getSource().getAttrObject().PARENT_DEV_ID) ||
                (connNode.getTarget().getAttrObject().portUse === '1' &&
                  connNode.getTarget().getAttrObject().PARENT_DEV_ID === elem.getSource().getAttrObject().PARENT_DEV_ID))) ||
            (elem.getTarget().getAttrObject().portUse === '0' &&
              elem.getTarget().getAttrObject().PARENT_DEV_ID &&
              ((connNode.getSource().getAttrObject().portUse === '1' &&
                connNode.getSource().getAttrObject().PARENT_DEV_ID === elem.getTarget().getAttrObject().PARENT_DEV_ID) ||
                (connNode.getTarget().getAttrObject().portUse === '1' &&
                  connNode.getTarget().getAttrObject().PARENT_DEV_ID === elem.getTarget().getAttrObject().PARENT_DEV_ID)))
          ) {
            if (!this.graphView.isSelected(connNode)) {
              connNode.IS_ROUTE_SPLITTER = false;
              this.dataModel.getSelectionModel().appendSelection(connNode);
              this.edgeClick(connNode);
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
