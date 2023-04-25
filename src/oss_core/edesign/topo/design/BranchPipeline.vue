<template>
  <div class="topo-content">
    <TopoView
      ref="BranchPipeLine"
      :toolButtons="toolButtons"
      :show-toolbar="true"
      :graphView="graphView"
      :menu-source="initMenus"
      @click-toolbar="toolbarClick"
    ></TopoView>
    <CutCablePanel ref="cutCablePanel" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></CutCablePanel>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import CutCablePanel from '../../osp/topo-control/device_design/cutCablePanel.vue';
import { saveTopo, loadTopoData } from '../TopoUtil';
import { queryResInfo, loadBuildingDevice, deleteCutCable, deleteMidSpan, addMidSpan, loadPipeLineRoute } from '../TopoHandleAction.js';
import * as GlobalConst from '../../../base/utils/GlobalConst';
const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const NODE_SPACE = 200;
export default {
  name: 'BranchPipeLine',
  components: {
    TopoView,
    CutCablePanel,
  },
  props: {
    topoResInfo: Object,
  },
  computed: {
    params() {
      return {
        schemaId: this.topoResInfo.schemaId,
        resType: this.topoResInfo.cableList[0].resSpecId,
        resId: this.topoResInfo.cableList[0].resId,
        resName: this.topoResInfo.cableList[0].name,
        mapNo: this.topoResInfo.mapNo,
      };
    },
  },
  data() {
    return {
      dataModel: null,
      graphView: this.graphView,
      isInnerDevice: false, //是否建筑物内部设备掏接；
      toolButtons: [
        {
          id: 'save',
          name: 'Save',
          image: 'oss_core/edesign/assets/image/topo-tool-bar/save.png',
          title: 'Save',
          event: 'save',
        },
      ],
      cableInfo: null,
      logicCableList: [],
      buildingDeviceList: [],
      schemaId: '',
      startNode: null,
      endNode: null,
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc(elem => elem.movable);
    this.graphView.setVisibleFunc(elem => elem.visible);

    this.graphView.addInteractorListener(e => {
      if (e.kind === 'betweenMove') {
        //拖拽
        this.redrawMoveDevice();
      } else if (e.kind === 'clickData' && e.data) {
        this.clickNode(e.data);
      }
    });

    this.graphView.getView().addEventListener('mousemove', e => {
      //let p = this.graphView.lp(e);
      //let node = this.dataModel.getSelectionModel().getFirstData();
    });
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
      this.topoId = 'BRANCH-PIPELINE-DESIGN' + this.params.resId;
      this.schemaId = this.params.schemaId;
      let params = {
        schemaId: this.params.schemaId,
        resId: this.params.resId,
        resType: this.params.resType,
        mapNo: this.params.mapNo,
      };
      let p0 = loadTopoData(this.topoId);
      let p1 = queryResInfo(this.params.resType, this.params.resId); //查询分歧的管道
      let p2 = loadPipeLineRoute(params); //查询分歧点，以及分歧的连接
      Promise.all([p0, p1, p2, p3]).then(datas => {
        let topoData = datas[0];
        this.pipeLineInfo = datas[1].resultList[0];
        let topoResData = datas[2];
        this.drawPipeLineTopo(this.pipeLineInfo, topoResData, topoData);
      });
    },

    dealLogicListData(pointResList) {
      this.logicCableList.forEach(logic => {
        let aResList = pointResList.filter(item => item.resId === logic.aResId);
        if (aResList.length > 0) {
          logic.aResName = aResList[0].resName;
        }
        let zResList = pointResList.filter(item => item.resId === logic.zResId);
        if (zResList.length > 0) {
          logic.zResName = zResList[0].resName;
        }
      });
    },
    drawPipeLineTopo(pipeLineInfo, topoResData, topoData) {
      let pointResList = topoResData.pointResList || [];
      let maxResIndex = 0;
      let nodeTop = 300;
      let cutNodeTop = 150;

      //中间点；
      let iCount = 1;
      pointResList.forEach(res => {
        if (res.resId != cableInfo.aDeviceId && res.resId != cableInfo.zDeviceId) {
          let resNode = this.drawResNode(res);

          let index = iCount; //parseInt(res.index);
          resNode.setPosition(index * NODE_SPACE + NODE_SPACE, cutNodeTop);
          if (res.cutUnitRecord) {
            resNode.setPosition(index * NODE_SPACE + NODE_SPACE, cutNodeTop);
            resNode.setToolTip(res.cutUnitRecord);
            resNode.setStyle('note', res.cutUnitRecord);
            resNode.setStyle('note.background', '#FFA000');
          }
          if (topoData[res.resId]) {
            resNode.setPosition(topoData[res.resId].x, topoData[res.resId].y);
          }
          resNode.setStyle('label.position', 20);
          resNode.setStyle('note.position', 3);
          resNode.setAttr('baseSpecId', 'POINT_DEVICE');
          resNode.setAttr('nodeSite', 'center');
          maxResIndex = iCount;
          iCount++;
        }
      });
      //画起始结束节点；
      pointResList.forEach(res => {
        if (res.resId === cableInfo.aDeviceId) {
          let resNode = this.drawResNode(res, 'start');
          resNode.setPosition(NODE_SPACE, nodeTop);
          resNode.movable = false;
          if (topoData[res.resId]) {
            resNode.setPosition(topoData[res.resId].x, topoData[res.resId].y);
          }
          resNode.setAttr('nodeSite', 'start');
          this.startNode = resNode;
        }
        if (res.resId === cableInfo.zDeviceId) {
          let resNode = this.drawResNode(res, 'end');
          resNode.setPosition((maxResIndex + 1) * NODE_SPACE + NODE_SPACE, nodeTop);
          resNode.movable = false;
          if (topoData[res.resId]) {
            resNode.setPosition(topoData[res.resId].x, topoData[res.resId].y);
          }
          resNode.setAttr('nodeSite', 'end');
          this.endNode = resNode;
        }
      });

      pointResList.forEach(res => {
        if (res.resId != cableInfo.aDeviceId && res.resId != cableInfo.zDeviceId) {
          let resNode = this.dataModel.getDataByTag(res.resId);
          if (res.isMidspan && res.isMidspan === 'Y') {
            //根据掏接标记生成虚拟点，建立虚拟连接
            let virNode = new ht.Node();
            virNode.visible = true;
            virNode.movable = false;
            virNode.setPosition(resNode.getPosition().x, this.startNode.getPosition().y + 5);
            virNode.setAttr('baseSpecId', 'VIR_NODE');
            virNode.setSize(3, 3);
            virNode.setStyle('shape', 'circle');
            virNode.setTag(res.resId + '_V');

            let virLink = new ht.Edge();
            virLink.visible = true;
            virLink.setSource(resNode);
            virLink.setTarget(virNode);
            virLink.setStyle('edge.type', 'ortho');
            virLink.setStyle('edge.dash', true);
            virLink.setStyle('edge.dash.pattern', [5, 5]);
            virLink.setStyle('edge.color', '#000000');
            virLink.setStyle('edge.dash.color', '#ffffff');
            virLink.setStyle('edge.target.position', 17);
            virLink.setStyle('edge.source.position', 17);
            virLink.setAttr('baseSpecId', 'isVirLINK');

            if (resNode.getPosition().x < this.startNode.getPosition().x) {
              virLink.setStyle('edge.type', 'points');
              let points = [
                {
                  x: resNode.getPosition().x,
                  y: this.startNode.getPosition().y - 8,
                },
                {
                  x: this.startNode.getPosition().x + 50,
                  y: this.startNode.getPosition().y - 8,
                },
              ];
              virLink.setStyle('edge.points', points);
              virNode.setPosition(this.startNode.getPosition().x + 50, this.startNode.getPosition().y + 5);
            } else if (resNode.getPosition().x > this.endNode.getPosition().x) {
              virLink.setStyle('edge.type', 'points');
              let points = [
                {
                  x: resNode.getPosition().x,
                  y: this.endNode.getPosition().y - 8,
                },
                {
                  x: this.endNode.getPosition().x - 50,
                  y: this.endNode.getPosition().y - 8,
                },
              ];
              virLink.setStyle('edge.points', points);
              virNode.setPosition(this.endNode.getPosition().x - 50, this.endNode.getPosition().y + 5);
            }
            virLink.setStyle('edge.center', true);
            this.dataModel.add(virNode);
            this.dataModel.add(virLink);
          }
        }
      });
      let aResId = cableInfo.aDeviceId;
      let zResId = cableInfo.zDeviceId;

      let aDataNode;
      let zDataNode;

      //环形网
      let isRingNet = false;
      if (aResId === zResId) {
        aDataNode = this.dataModel.getDataByTag(aResId + 'start');
        zDataNode = this.dataModel.getDataByTag(zResId + 'end');
        isRingNet = true;
      } else {
        aDataNode = this.dataModel.getDataByTag(aResId + 'start');
        zDataNode = this.dataModel.getDataByTag(zResId + 'end');
      }
      //物理光缆
      if (aDataNode && zDataNode) {
        let cableNode = this.addEdge(aDataNode, zDataNode, cableInfo, false);
        let showText = cableInfo.name + ' (' + this.$t('CORE_COUNT') + ':' + cableInfo.coreCount + ')';
        cableNode.setName(showText);
        cableNode.setStyle('label.offset.y', 10);
        cableNode.setAttr('baseSpecId', 'isPhysic');
        cableNode.setStyle('edge.target.position', 17);
        cableNode.setStyle('edge.source.position', 17);
      }

      logicCableList.forEach(logicCable => {
        let aNodeId = logicCable.aResId;
        let zNodeId = logicCable.zResId;
        let aNode;
        let zNode;

        if (aNodeId === cableInfo.aDeviceId) {
          aNode = this.dataModel.getDataByTag(aNodeId + 'start');
        } else {
          aNode = this.dataModel.getDataByTag(aNodeId);
        }

        if (zNodeId === cableInfo.zDeviceId) {
          zNode = this.dataModel.getDataByTag(zNodeId + 'end');
        } else {
          zNode = this.dataModel.getDataByTag(zNodeId);
        }

        if (aNode && zNode) {
          let lineType = 'C';
          if (aNode === this.startNode) {
            lineType = 'L';
          }
          if (zNode === this.endNode) {
            lineType = 'R';
          }
          if (aNode.getAttr('baseSpecId') === 'POINT_DEVICE' && zNode.getAttr('baseSpecId') === 'POINT_DEVICE') {
            lineType = 'C';
          }
          let logicCableNode = this.addEdge(aNode, zNode, logicCable, true, lineType);
          logicCableNode.setAttr('baseSpecId', 'isLogic');
        }
      });
    },

    drawResNode(data, type) {
      let resType = data.resType;
      let resId = data.resId;
      let resName = data.name;
      let imgUrl = `oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`;
      let node = new ht.Node(resId);
      node.setName(resName);
      node.movable = true;
      node.visible = true;
      node.setSize(45, 45);
      node.setLayer(LAYER2);
      node.setImage(imgUrl);
      node.setAttrObject(data);
      if (type) {
        node.setTag(resId + type);
      } else {
        node.setTag(resId);
      }
      node.setStyle('select.color', 'blue');
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 10);
      this.dataModel.add(node);
      return node;
    },

    addEdge(aNode, zNode, data, isLogic, lineType) {
      let edge = new ht.Edge();
      edge.setToolTip(data.resName || data.name);

      edge.visible = true;

      edge.setLayer(LAYER1);
      edge.setSource(aNode);
      edge.setTarget(zNode);
      edge.setStyle('edge.width', 2);
      //edge.setStyle('edge.type', 'ortho2');
      edge.setStyle('edge.center', true);
      edge.setStyle('edge.color', 'blue');
      //掏接的光缆画虚线
      if (isLogic) {
        edge.setStyle('edge.type', 'points');
        edge.setStyle('edge.dash', true);
        edge.setStyle('edge.dash.pattern', [10, 10]);
        edge.setStyle('edge.dash.color', '#ff5c0a');
        //edge.setStyle('edge.ortho','0.02');
        //edge.setStyle('label.offset.y',22);
        //edge.setStyle('label.rotation',1.5);
        if (lineType === 'L') {
          edge.setStyle('edge.points', [
            { x: aNode.getPosition().x + 5, y: this.startNode.getPosition().y - 8 },
            { x: zNode.getPosition().x - 5, y: this.startNode.getPosition().y - 8 },
            { x: zNode.getPosition().x - 5, y: zNode.getPosition().y },
          ]);
          edge.setStyle('label.position', 17);
          edge.setStyle('label.offset.y', -10);
          edge.setStyle('label.offset.x', -50);
        }
        if (lineType === 'C') {
          edge.setStyle('edge.points', [
            { x: aNode.getPosition().x + 5, y: aNode.getPosition().y },
            { x: aNode.getPosition().x + 5, y: this.startNode.getPosition().y - 8 },
            { x: zNode.getPosition().x - 5, y: this.startNode.getPosition().y - 8 },
            { x: zNode.getPosition().x - 5, y: zNode.getPosition().y },
          ]);
          edge.setStyle('label.position', 17);
          edge.setStyle('label.offset.y', -10);
        }
        if (lineType === 'R') {
          edge.setStyle('edge.points', [
            { x: aNode.getPosition().x + 5, y: aNode.getPosition().y },
            { x: aNode.getPosition().x + 5, y: this.startNode.getPosition().y - 8 },
            { x: zNode.getPosition().x - 5, y: zNode.getPosition().y - 8 },
          ]);
          edge.setStyle('label.position', 17);
          edge.setStyle('label.offset.y', -10);
          edge.setStyle('label.offset.x', +50);
        }

        edge.setName(data.resName || data.name);
      } else {
        edge.setStyle('edge.type', 'points');
        edge.setStyle('edge.points', [
          { x: aNode.getPosition().x, y: this.startNode.getPosition().y + 7 },
          { x: zNode.getPosition().x, y: this.startNode.getPosition().y + 7 },
        ]);
        edge.setName(data.resName || data.name);
      }
      edge.setStyle('edge.offset', 6);
      edge.setStyle('select.color', 'red');
      edge.setTag(data.resId);
      data.isLogic = isLogic;
      //data.baseSpecId = 'CABLE';
      edge.setAttrObject(data);
      this.dataModel.add(edge);
      return edge;
    },

    clickNode(node) {
      console.log(node);
      //this.selectNode = node;
    },

    redrawMoveDevice() {
      let node = this.dataModel.getSelectionModel().getFirstData();
      if (node) {
        let sEdges = node.getSourceEdges();
        let tEdges = node.getTargetEdges();
        let nodeSite = node.getAttrObject().nodeSite;
        sEdges &&
          sEdges.each(edge => {
            let isEdgeType = edge.getAttrObject().baseSpecId;
            if (isEdgeType === 'isLogic') {
              let points = edge.getStyle('edge.points')._as;
              let length = points.length;
              if (length > 3) {
                points[0].y = node.getPosition().y;
                points[0].x = node.getPosition().x + 8;
                points[1].x = node.getPosition().x + 8;
                edge.setStyle('edge.points', points);
              } else {
                if (nodeSite === 'center') {
                  points[0].x = node.getPosition().x + 5;
                  points[0].y = node.getPosition().y;
                  points[1].x = node.getPosition().x + 5;
                  edge.setStyle('edge.points', points);
                } else {
                  points[0].x = node.getPosition().x;
                  points[0].y = node.getPosition().y - 5;
                  edge.setStyle('edge.points', points);
                }
              }
            } else if (isEdgeType === 'isVirLINK') {
              let virNode = this.dataModel.getDataByTag(node.getTag() + '_V');
              if (node.getPosition().x < this.startNode.getPosition().x) {
                edge.setStyle('edge.type', 'points');
                let points = [
                  {
                    x: node.getPosition().x,
                    y: this.startNode.getPosition().y - 8,
                  },
                  {
                    x: this.startNode.getPosition().x + 50,
                    y: this.startNode.getPosition().y - 8,
                  },
                ];
                edge.setStyle('edge.points', points);
                virNode.setPosition(this.startNode.getPosition().x + 50, this.startNode.getPosition().y + 5);
              } else if (node.getPosition().x > this.endNode.getPosition().x) {
                edge.setStyle('edge.type', 'points');
                let points = [
                  {
                    x: node.getPosition().x,
                    y: this.endNode.getPosition().y - 8,
                  },
                  {
                    x: this.endNode.getPosition().x - 50,
                    y: this.endNode.getPosition().y - 8,
                  },
                ];
                edge.setStyle('edge.points', points);
                virNode.setPosition(this.endNode.getPosition().x - 50, this.endNode.getPosition().y + 5);
              } else {
                edge.setStyle('edge.type', 'ortho');
                virNode.setPosition(node.getPosition().x, virNode.getPosition().y);
              }
            } else {
              let points = edge.getStyle('edge.points')._as;
              let length = points.length;
              points[0].x = node.getPosition().x;
              points[0].y = node.getPosition().y + 7;
              edge.setStyle('edge.points', points);
            }
          });

        tEdges &&
          tEdges.each(edge => {
            let isEdgeType = edge.getAttrObject().baseSpecId;
            if (isEdgeType === 'isLogic') {
              let points = edge.getStyle('edge.points')._as;
              let length = points.length;
              if (length > 3) {
                points[length - 2].x = node.getPosition().x - 5;
                points[length - 1].x = node.getPosition().x - 5;
                points[length - 1].y = node.getPosition().y;
                edge.setStyle('edge.points', points);
              } else {
                if (nodeSite === 'center') {
                  points[length - 2].x = node.getPosition().x - 5;
                  points[length - 1].x = node.getPosition().x - 5;
                  points[length - 1].y = node.getPosition().y;
                  edge.setStyle('edge.points', points);
                } else {
                  points[length - 1].x = node.getPosition().x;
                  points[length - 1].y = node.getPosition().y - 5;
                  edge.setStyle('edge.points', points);
                }
              }
            } else if (isEdgeType === 'isVirLINK') {
              let virNode = this.dataModel.getDataByTag(node.getTag() + '_V');
              if (node.getPosition().x < this.startNode.getPosition().x) {
                edge.setStyle('edge.type', 'points');
                let points = [
                  {
                    x: node.getPosition().x,
                    y: this.startNode.getPosition().y - 8,
                  },
                  {
                    x: this.startNode.getPosition().x + 50,
                    y: this.startNode.getPosition().y - 8,
                  },
                ];
                edge.setStyle('edge.points', points);
                virNode.setPosition(this.startNode.getPosition().x + 50, this.startNode.getPosition().y + 5);
              } else if (node.getPosition().x > this.endNode.getPosition().x) {
                edge.setStyle('edge.type', 'points');
                let points = [
                  {
                    x: node.getPosition().x,
                    y: this.endNode.getPosition().y - 8,
                  },
                  {
                    x: this.endNode.getPosition().x - 50,
                    y: this.endNode.getPosition().y - 8,
                  },
                ];
                edge.setStyle('edge.points', points);
                virNode.setPosition(this.endNode.getPosition().x - 50, this.endNode.getPosition().y + 5);
              } else {
                edge.setStyle('edge.type', 'ortho');
                virNode.setPosition(node.getPosition().x, virNode.getPosition().y);
              }
            } else {
              let points = edge.getStyle('edge.points')._as;
              let length = points.length;
              points[length - 1].x = node.getPosition().x;
              points[length - 1].y = node.getPosition().y + 7;
              edge.setStyle('edge.points', points);
            }
          });
      }
    },

    initMenus(selectedDatas) {
      let menus = [];
      let isSelected = selectedDatas.size() != 0;
      if (selectedDatas.size() === 1) {
        let data = selectedDatas._as[0];
        let dataInfo = data.getAttrObject();
        let baseSpecId = data.getAttr('baseSpecId');
        if (baseSpecId === 'POINT_DEVICE') {
          menus.push({
            label: this.$t('CUT_SPLICE'),
            visible: true,
            action: () => {
              this.addCutCableByNode(data);
            },
          });
          if (data.getAttr('cutUnitRecord')) {
            menus.push({
              label: this.$t('DELETE_CUT_SPLICE'),
              visible: true,
              action: () => {
                this.delCutCable(data);
              },
            });
          }
          if (dataInfo.isMidspan && dataInfo.isMidspan == 'Y') {
            menus.push({
              label: this.$t('DELETE_MIDSPAN'),
              visible: true,
              action: () => {
                this.delMidSpan(data);
              },
            });
          } else {
            menus.push({
              label: this.$t('ADD_MIDSPAN'),
              visible: true,
              action: () => {
                this.addMidSpan(data);
              },
            });
          }
        }
      }

      return menus;
    },

    addMidSpan(node) {
      let deviceInfo = node.getAttrObject();
      let param = {
        deviceId: deviceInfo.resId,
        cableId: this.cableInfo.cableId,
        schemaId: this.params.schemaId,
      };
      console.info(param);
      addMidSpan(param).then(data => {
        this.clearTopoData();
        this.loadTopo();
      });
    },
    delMidSpan(node) {
      fish.confirm(this.$t('MAKE_SURE_REMOVE_MIDSPAN'), () => {
        let deviceInfo = node.getAttrObject();
        if (deviceInfo.isMidspan && deviceInfo.isMidspan == 'Y') {
          let param = {
            deviceId: deviceInfo.resId,
            cableId: this.cableInfo.cableId,
            schemaId: this.params.schemaId,
          };

          console.info(param);

          deleteMidSpan(param).then(data => {
            this.clearTopoData();
            this.loadTopo();
          });
        }
      });
    },
    //通过节点掏接
    addCutCableByNode(node) {
      let isCut = false; //当前节点是否被掏接过
      this.selectNode = node;
      let deviceInfo = node.getAttrObject();
      let cableInfo = {};
      let deviceInfoList = [];
      deviceInfoList.push(deviceInfo);

      if (deviceInfo.cutUnitRecord) {
        isCut = true;
      }

      if (isCut) {
        let edges = node.getEdges();
        if (edges) {
          let edgesList = edges._as;
          if (edgesList.length > 0) {
            let edge = edgesList[0];
            let attr = edge._attrObject;
            cableInfo = attr;
            cableInfo.cableId = attr.resId;
            cableInfo.resSpecId = attr.resType;
            cableInfo.name = attr.resName;
          }
        }
      } else {
        if (this.logicCableList.length > 0) {
          cableInfo = this.getPreLogicCable(node);
        } else {
          cableInfo = this.cableInfo;
        }
      }
      if (!cableInfo) {
        cableInfo = this.cableInfo;
      }
      this.$refs.cutCablePanel.setData(deviceInfoList, cableInfo, this.logicCableList, this.cableInfo, this.params);
      this.$refs.cutCablePanel.CompPopuTopo.show = true;
      this.$refs.cutCablePanel.show = true;
    },

    getPreLogicCable(node) {
      let attrNode = node.getAttrObject();
      let indexNode = Number(attrNode.index);
      let logicCableInfo = null;
      let pointDeviceList = [];
      this.dataModel.getDatas().each(data => {
        let attrObject = data.getAttrObject();
        if (attrObject.baseSpecId === 'POINT_DEVICE') {
          if (attrObject.cutUnitRecord && Number(attrObject.index) < indexNode) {
            pointDeviceList.push(data);
          }
        }
      });
      let indexCut = -1;
      if (pointDeviceList.length > 0) {
        indexCut = pointDeviceList.length - 1;
        let preNode = pointDeviceList[indexCut];
        let preNodeAttr = preNode.getAttrObject();
        let edges = preNode.getEdges();
        if (edges) {
          let edgesList = edges._as;
          edgesList.forEach(edge => {
            let attr = edge._attrObject;
            if (attr.aResId === preNodeAttr.resId) {
              logicCableInfo = {};
              logicCableInfo = attr;
              logicCableInfo.cableId = attr.resId;
              logicCableInfo.resSpecId = attr.resType;
              logicCableInfo.name = attr.resName;
            }
          });
        }
      } else {
        let startNodeAttr = this.startNode.getAttrObject();
        let edges = this.startNode.getEdges();
        if (edges) {
          let edgesList = edges._as;
          edgesList.forEach(edge => {
            let attr = edge._attrObject;
            if (attr.isLogic) {
              if (attr.aResId === startNodeAttr.resId) {
                logicCableInfo = {};
                logicCableInfo = attr;
                logicCableInfo.cableId = attr.resId;
                logicCableInfo.resSpecId = attr.resType;
                logicCableInfo.name = attr.resName;
              }
            }
          });
        }
      }
      return logicCableInfo;
    },

    delCutCable(node) {
      fish.confirm(this.$t('MAKE_SURE_REMOVE_CUT'), () => {
        let deviceInfo = node.getAttrObject();
        let nodeResId = deviceInfo.resId;
        let edges = node.getEdges();
        if (edges) {
          let edgesList = edges._as;
          if (edgesList.length > 0) {
            let aLogicCableId = '';
            let zLogicCableId = '';
            let phyCableId = this.cableInfo.cableId;
            let datas = [];
            edgesList.forEach(edge => {
              let attr = edge._attrObject;
              if (attr.aResId === nodeResId) {
                zLogicCableId = attr.resId;
                datas.push(attr);
              }
              if (attr.zResId === nodeResId) {
                aLogicCableId = attr.resId;
                datas.push(attr);
              }
            });

            let param = {
              cutPoint: nodeResId,
              aLogicCableId: aLogicCableId,
              zLogicCableId: zLogicCableId,
              phyCableId: phyCableId,
              schemaId: this.params.schemaId,
            };

            console.info(param);

            deleteCutCable(param).then(data => {
              this.$emit('cutChange');
              this.clearTopoData();
              this.loadTopo();
            });
          }
        }
      });
    },

    clearTopoData() {
      this.dataModel.clear();
      this.cableInfo = null;
      this.logicCableList = [];
    },

    doAfterAddRes(datas) {
      console.info(datas);
      this.clearTopoData();
      this.$emit('cutChange');
      this.loadTopo();
    },

    doAfterClose() {},

    toolbarClick(eventName) {
      if (eventName === 'refresh') {
        this.saveAndRefreshTopo();
      } else if (eventName === 'save') {
        this.saveTopo();
      }
    },
    saveAndRefreshTopo() {
      if (this.graphView) {
        this.graphView.setZoom(1);
        this.graphView.setTranslateX(0);
        this.graphView.setTranslateY(0);
        // 切换前保存
        if (this.dataModel.getDatas().size() !== 0) {
          saveTopo(this.params.schemaId, this.topoId, this.dataModel);
          this.dataModel.clear();
        }
      }
      this.loadTopo();
    },
    saveTopo: function() {
      let p0 = saveTopo(this.params.schemaId, this.topoId, this.dataModel);
      p0.then(value => {
        fish.info(this.$t('SAVE_SUCCESS'));
      });
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

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
