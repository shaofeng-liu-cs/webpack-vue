<template>
  <div class="topo-content">
    <TopoView ref="manholeDesignTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick" :pipeCloseCallBack="closeDrawer" :facilityCloseCallBack="closeDrawer" :roomCloseCallBack="closeDrawer"></TopoView>
    <SelectDevice :schemaId="params.schemaId" ref="selectDevice" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></SelectDevice>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import SelectDevice from '../../osp/topo-control/device_design/selectDevice.vue';
import { saveTopo, loadTopoData, getGisGraphic } from '../TopoUtil';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { queryDesignResInfo } from '../TopoHandleAction.js';
import { deleteGraphic } from '../../../edesign/osp/domain/ResEventHandler.js';
import { drawDuctGraphics } from './DrawTools';
import { queryPointRelaResInfo } from '@/oss_core/edesign/api/query/resId.js';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const INNER_RES_TYPES = ['ODB', 'F_CLOSURE', 'F_CABLE'];

export default {
  name: 'ManholeDesignTopo',
  components: {
    TopoView,
    SelectDevice,
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
      isAdding: false, //绘制状态标准
      addingObject: null, //当前绘制对象
      tempObjects: [], //绘制过程中的一些临时对象
      xPos: 370, //TOPO起始X
      yPos: 320, //TOPO起始Y
      pSize: 300,
      graphic: null,
      manholeInfo: null,
      toolButtons: [
        {
          id: 'ODB',
          name: 'ODB',
          image: 'oss_core/edesign/assets/image/topo-business/res/dark/ODB.png',
          title: 'ODB',
          event: 'ODB',
        },
        {
          id: 'F_CLOSURE',
          name: 'Fiber Closure',
          image: 'oss_core/edesign/assets/image/topo-business/res/dark/F_CLOSURE.png',
          title: 'Fiber Closure',
          event: 'F_CLOSURE',
        },
        {
          id: 'F_CABLE',
          name: 'Fiber Cable',
          image: 'oss_core/edesign/assets/image/topo-business/res/dark/F_CABLE.png',
          title: 'Fiber Cable',
          event: 'F_CABLE',
        },
        {
          id: 'BIND',
          name: 'Bind A/Z-End',
          image: 'oss_core/edesign/assets/image/topo-tool-bar/bindPoint.png',
          title: 'Bind A/Z-End',
          event: 'BIND',
        },
      ],
      schemaId: '',
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc((elem) => elem.movable);

    this.graphView.addInteractorListener((e) => {
      if (e.kind === 'betweenMove') {
        //拖拽
        this.redrawOuterCableWhenMoveDevice();
      } else if (e.kind === 'clickData') {
        //点击Node
        this.clickNode(e.data);
        this.showPipeOrFacilityPanel(e.data);
      }
      if (e.kind === 'clickBackground') {
        this.closeDrawer();
        this.nodeInfo = null;
      }
    });

    this.graphView.getView().addEventListener('mousemove', (e) => {
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

    // 鼠标右键屏蔽浏览器默认菜单
    this.graphView.getView().addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        document.oncontextmenu = () => {
          return false;
        };
      }
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
      if (this.dataModel) {
        this.dataModel.clear();
      }
      this.topoId = 'MH-DESIGN' + this.params.resId;
      this.schemaId = this.params.schemaId;

      let p1 = loadTopoData(this.topoId);
      let p2 = getGisGraphic(this.params.resType, this.params.resId, this.params.mapNo, this.params.schemaId);
      let params = {
        resId: this.params.resId,
        resType: this.params.resType,
        mapNo: this.params.mapNo,
        schemaId: this.params.schemaId,
      };
      let p3 = queryPointRelaResInfo(params);
      let p4 = queryDesignResInfo(params);

      Promise.all([p1, p2, p3, p4]).then((datas) => {
        this.graphic = datas[1];

        let topoData = datas[0];
        let innerResList = datas[2].innerResList || [];
        let cableList = datas[2].cableList || [];
        let logicCableList = datas[2].logicCableList || [];
        let sectionResList = datas[2].sectionResList || [];
        this.manholeInfo = datas[3];

        // 展开图
        this.drawMHExpandView();

        //内部资源
        innerResList.forEach((innerRes) => {
          let resType = innerRes.resType;
          if (GlobalConst.RES_TYPE_F_CABLE === resType || GlobalConst.RES_TYPE_COPPER_CABLE === resType) {
            this.drawInnerCable(innerRes, logicCableList);
          } else {
            this.drawInnerDevice(innerRes, topoData);
          }
        });

        // 管道
        if (sectionResList.length != 0) {
          let occupyDirections = [];
          let ductIds = sectionResList.map((section) => section.resId);
          let ps1 = this.loadSectionStructure(ductIds);
          let ps2 = getGisGraphic(GlobalConst.RES_TYPE_DUCT, ductIds.join(','), this.params.mapNo, this.params.schemaId);

          Promise.all([ps1, ps2]).then((result) => {
            let ducts = result[0].resultList;
            console.log(result[1]);

            ducts.forEach((data) => {
              let lineGraphic = getGisGraphic(data.resSpecId, data.pipelineId, this.params.mapNo, this.params.schemaId);
              lineGraphic.then((lineGraphicData) => {
                //let direction = 0;
                let lineDirection = this.calcLineDirection(lineGraphicData);
                console.log(lineDirection);
                if (lineDirection) {
                  let direction = lineDirection.inDirection || lineDirection.outDirection;
                  if (occupyDirections.indexOf(direction) < 0) {
                    let sideInfo = this.getSideByDirection(direction);
                    drawDuctGraphics(data, this.dataModel, this.pSize, sideInfo.x, sideInfo.y, sideInfo.lp);
                    occupyDirections.push(direction);
                  }
                }
                //direction++;
              });
            });

            this.drawOuterCable(cableList, logicCableList);
          });
        }

        //指北针
        this.drawCompass();

        this.graphView.fitContent();
      });
    },

    calcLineDirection(lineGraphic) {
      let result = null;
      // 计算管道进入人井的方向
      let pointGeometry = this.graphic.geometry; //人井的GEO
      let pointX = pointGeometry.x.toFixed(2);
      let pointY = pointGeometry.y.toFixed(2);
      //let lineGraphic = getGisGraphic(resType, resId, this.params.mapNo, this.params.schemaId);
      if (lineGraphic) {
        let lineGeometry = lineGraphic.geometry;
        let paths = lineGeometry.paths[0];
        for (let i = 0; i < paths.length; i++) {
          let path = paths[i];
          if (path[0].toFixed(2) === pointX && path[1].toFixed(2) === pointY) {
            result = {};
            if (i === 0) {
              result.outDirection = this.calcDirectionByAngle(paths[i + 1][0] - pointX, paths[i + 1][1] - pointY);
              break;
            } else if (i === paths.length - 1) {
              result.inDirection = this.calcDirectionByAngle(paths[i - 1][0] - pointX, paths[i - 1][1] - pointY);
              break;
            } else {
              result.inDirection = this.calcDirectionByAngle(paths[i - 1][0] - pointX, paths[i - 1][1] - pointY);
              result.outDirection = this.calcDirectionByAngle(paths[i + 1][0] - pointX, paths[i + 1][1] - pointY);
              break;
            }
          }
        }
      }
      return result;
    },

    calcDirectionByAngle(x, y) {
      let direction = 3; // 右
      let angle = (Math.atan2(y, x) * 180) / Math.PI;
      console.log(angle);
      if (45 < angle && angle <= 135) {
        direction = 0; // 上
      } else if (-45 < angle && angle <= 45) {
        direction = 1; // 左
      } else if (-135 < angle && angle <= -45) {
        direction = 2; // 下
      }
      return direction;
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

    // loadFacilityData() {
    //     return new Promise((resolve, reject) => {
    //         let resId = this.params.resId;
    //         let resType = this.params.resType;
    //         fish.get({
    //             url: `edesign/resource/query/resourceinfo/v1`,
    //             data: {
    //                 resType: resType,
    //                 resId: resId,
    //             },
    //             success: result => {
    //                 resolve(result);
    //             },
    //             error: reject,
    //         });
    //     });
    // },

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

    drawMHExpandView() {
      let data = this.graphic.attributes;
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

    drawInnerDevice(data, topoData) {
      let resType = data.resType;
      let resName = data.resName;
      let resId = data.resId;
      let node = new ht.Node();
      node.setLayer(LAYER1);
      node.setName(resName);
      node.setSize(32, 32);
      node.setImage(`oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`);

      if (topoData[resId]) {
        node.setPosition(topoData[resId].x, topoData[resId].y);
      } else {
        node.setPosition(this.xPos + 32, this.yPos + 32);
      }
      node.setStyle('select.color', 'red');
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setStyle('shadow.color', 'red');

      node.setTag(resId);
      node.movable = true;
      data.isInner = true;
      data.baseSpecId = 'DEVICE';
      node.setAttrObject(data);
      this.dataModel.add(node);
      return node;
    },

    drawInnerCable(data, logicCableList) {
      let edges = [];
      let startNode = this.dataModel.getDataByTag(data.aResId);
      let endNode = this.dataModel.getDataByTag(data.zResId);
      if (startNode == null || endNode == null) {
        return;
      }

      let hasCutNode = false;
      let nextNode = this.findNextCutNode(data.resId, data.aResId, logicCableList);
      while (nextNode != null) {
        let edge = this.createInnerEdge(data, startNode, nextNode, true, true);
        startNode = nextNode;
        nextNode = this.findNextCutNode(data.resId, nextNode.getAttr('resId'), logicCableList);
        hasCutNode = true;
        edges.push(edge);
      }

      if (!hasCutNode) {
        let edge = this.createInnerEdge(data, startNode, endNode, false, true);
        edges.push(edge);
      }
      return edges;
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

        getGisGraphic(resType, resId, this.params.mapNo).then((graphic) => {
          console.log(graphic);
        });
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

    redrawOuterCableWhenMoveDevice() {
      let node = this.dataModel.getSelectionModel().getFirstData();
      if (node) {
        let edges = this.dataModel.getSelectionModel().getFirstData().getEdges();
        edges &&
          edges.each((edge) => {
            if (edge.getAttr('isOuterCableEdge')) {
              let points = edge.getStyle('edge.points')._as;
              points[1].y = node.getPosition().y;
              edge.setStyle('edge.points', points);
            }
          });
      }
    },

    addResInFacility() {
      if (!this.addingObject) {
        return;
      }

      let resType = this.addingObject.getAttr('resType');
      let lng = this.graphic.attributes.longitude;
      let lat = this.graphic.attributes.latitude;
      //增加对象属性
      let addingRes = {
        resType: resType,
        longitude: lng ? lng.toFixed(6) : '',
        latitude: lat ? lat.toFixed(6) : '',
        formList: [],
      };

      if (GlobalConst.RES_TYPE_F_CABLE === resType) {
        addingRes.length = 10;
        addingRes.aResSpecId = this.addingObject.getSource().getAttr('resType');
        addingRes.aDeviceId = this.addingObject.getSource().getAttr('resId');
        addingRes.aDeviceName = this.addingObject.getSource().getAttr('resName');
        addingRes.zResSpecId = this.addingObject.getTarget().getAttr('resType');
        addingRes.zDeviceId = this.addingObject.getTarget().getAttr('resId');
        addingRes.zDeviceName = this.addingObject.getTarget().getAttr('resName');
        addingRes.resFlag = 'INV';
      }

      if (this.manholeInfo.siteId) {
        addingRes.siteId = this.manholeInfo.siteId;
        addingRes.siteName = this.manholeInfo.siteIdDesc;
      }

      if (this.manholeInfo.areaId) {
        addingRes.areaId = this.manholeInfo.areaId;
        addingRes.areaIdDesc = this.manholeInfo.areaIdDesc;
      }

      //上级资源属性
      let parentRes = {
        resId: this.params.resId,
        resType: this.params.resType,
      };

      this.$refs.selectDevice.setResData(addingRes, parentRes);
      this.$refs.selectDevice.CompPopuTopo.show = true;
      this.$refs.selectDevice.show = true;
    },

    doAfterAddRes(datas) {
      if (datas && datas.length > 0) {
        let index = 0;
        datas.forEach((data) => {
          let resType = data.resInfo.resSpecId;
          if (GlobalConst.RES_TYPE_F_CABLE === resType || GlobalConst.RES_TYPE_COPPER_CABLE === resType) {
            let params = {
              resType: resType,
              resId: data.resId,
              resName: data.resInfo.name,
              aResId: data.resInfo.aDeviceId,
              zResId: data.resInfo.zDeviceId,
              designOrdId: this.schemaId,
              schemaId: this.schemaId,
            };
            this.drawInnerCable(params, []);
          } else {
            let params = {
              resType: resType,
              resId: data.resId,
              resName: data.resInfo.name,
              designOrdId: this.schemaId,
              schemaId: this.schemaId,
            };
            let node = this.drawInnerDevice(params, {});
            node.setPosition(this.addingObject.getPosition().x, this.addingObject.getPosition().y + 40 * index);
            index++;
          }
        });
        this.$emit('resEvent', datas, 'add');
      }
      this.doAfterClose();
    },

    doAfterClose() {
      this.cancelAddingResOperation();
    },

    initMenus(datas) {
      let menus = [];
      if (datas.size() === 1) {
        let baseSpecId = datas.get(0).getAttr('baseSpecId');
        let isOuterCable = datas.get(0).getAttr('isOuterCable');
        let isInner = datas.get(0).getAttr('isInner');
        let isShowDelButton = this.isAllowDealButton('DEL', baseSpecId, datas.get(0));
        if (baseSpecId === 'DEVICE') {
          menus.push({
            label: 'Design',
            visible: true,
            action: () => {
              let attrObject = datas._as[0]._attrObject;
              let param = {
                resId: attrObject.resId,
                resType: attrObject.resSpecId ? attrObject.resSpecId : attrObject.resType,
                resName: attrObject.resName ? attrObject.resName : attrObject.name,
                schemaId: this.schemaId,
                mapNo: this.params.mapNo,
              };
              this.$emit('openDeviceInnerDesign', param);
            },
          });
        }

        if (isInner) {
          if (isShowDelButton) {
            menus.push({
              label: 'Delete',
              visible: true,
              action: () => {
                let param = {
                  graphic: [],
                };
                datas.each((data) => {
                  param.graphic.push({
                    resType: data.getAttr('resSpecId') || data.getAttr('resType'),
                    resId: data.getAttr('resId'),
                    schemaId: this.schemaId,
                  });
                });
                deleteGraphic(param).then(() => {
                  fish.toast('success', this.$t('DELETE_SUCCESS'));
                  this.saveAndRefreshTopo();
                  this.$emit('resEvent', param.graphic, 'del');
                });
              },
            });
          }
        }

        if (isOuterCable && datas.get(0).getEdges()) {
          menus.push({
            label: 'Rebind',
            visible: true,
            action: this.rebindCableToFacility,
          });
        }
      }
      return menus;
    },

    isAllowDealButton(dealType, dealObjType, node) {
      let isDealFlag = false;
      let nodeRefType = '';
      let projectSchemaId = '';
      if (node) {
        let attr = node.getAttrObject();
        nodeRefType = attr.refType ? attr.refType : 'N';
        projectSchemaId = attr.designOrdId || '';
      }
      if (dealType === 'ADD') {
        if (this.manholeInfo.refType === 'U' || this.manholeInfo.designOrdId === this.params.schemaId) {
          isDealFlag = true;
        }
      } else if (dealType === 'DEL') {
        if (nodeRefType !== 'R' || projectSchemaId === this.params.schemaId) {
          isDealFlag = true;
        }
      }
      return isDealFlag;
    },

    clickNode(node) {
      if (this.isAdding && this.addingObject && node) {
        let baseSpecId = node.getAttr('baseSpecId');
        let addingResType = this.addingObject.getAttr('resType');

        // 新增光缆
        if (addingResType === GlobalConst.RES_TYPE_F_CABLE) {
          if (!this.addingObject.getSource()) {
            if (baseSpecId !== 'DEVICE') {
              fish.toast('warn', 'Please select a device!');
              return;
            }
            let target = new ht.Node();
            target.setName('End');
            target.setSize(10, 10);
            target.setStyle('shape', 'circle');
            target.setStyle('shape.background', '#1c74c1');
            target.setStyle('shape.border.width', 0);
            target.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            target.setStyle('label.position', 5);
            target.setPosition(node.getPosition().x, node.getPosition().y);
            this.dataModel.add(target);
            this.addingObject.setSource(node);
            this.addingObject.setTarget(target);
            this.tempObjects.push(target);
            this.dataModel.add(this.addingObject);
          } else {
            if (baseSpecId !== 'DEVICE') {
              fish.toast('warn', 'Please select the end device!');
              return;
            }

            // 2021-5-20-lp 内部设计限制新建相同az端的光缆
            let aNode = this.addingObject.getSource();
            let aResId = aNode.getAttr('resId');
            let zResId = node.getAttr('resId');
            if (aResId === zResId) {
              fish.toast('warn', 'Cannot create a cable with the same A/Z device in the inner design, please select a different device!');
              return;
            }

            this.addingObject.setTarget(node);
            this.addResInFacility();
          }
        } else if (addingResType === 'BIND_CABLE') {
          // 光缆绑定AZ
          if (!this.addingObject.getSource()) {
            if (!node.getAttr('isOuterCable')) {
              fish.toast('warn', 'Please select one in-hole cable!');
              return;
            }

            if (node.getAttr('isThrough')) {
              // 直通的光缆不能Bind
              fish.toast('warn', 'The cable is a direct through support facility and cannot bind!');
              return;
            }

            if (node.getEdges() && node.getEdges().size() !== 0) {
              this.cancelAddingResOperation();
              fish.toast('warn', 'The cable has been bind to the device!');
              return;
            }

            let target = new ht.Node();
            target.setName('End');
            target.setSize(10, 10);
            target.setStyle('shape', 'circle');
            target.setStyle('shape.background', '#1c74c1');
            target.setStyle('shape.border.width', 0);
            target.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            target.setStyle('label.position', 5);
            target.setPosition(node.getPosition().x, node.getPosition().y);
            this.dataModel.add(target);

            this.addingObject.setSource(node);
            this.addingObject.setTarget(target);
            this.tempObjects.push(target);
            this.dataModel.add(this.addingObject);
          } else {
            if (node.getAttr('baseSpecId') !== 'DEVICE') {
              fish.toast('warn', 'Please select the end device!');
              return;
            }

            this.bindCableToDevice(node);
          }
        } else {
          // 新增设备
          this.addResInFacility();
        }
      } else if (node && node instanceof ht.Edge) {
        let cableId = node.getAttr('resId');
        let edges = this.dataModel.getDatas()._as.filter((data) => data instanceof ht.Edge && data.getAttr('resId') === cableId);
        this.dataModel.getSelectionModel().ss(edges);
      }
    },

    toolbarClick(eventName) {
      this.cancelAddingResOperation(); //先清除临时对象
      if (INNER_RES_TYPES.indexOf(eventName) != -1) {
        if (eventName === 'F_CABLE') {
          this.isAdding = true;
          fish.toast('info', 'Please select the start device!');
          this.addingObject = this.buildTempEdge(eventName);
        } else {
          //判断是否允许新增；
          let isAllAddFlag = this.isAllowDealButton('ADD', '', null);
          if (!isAllAddFlag) {
            fish.toast('warn', this.$t('NOT_ADD_RESOURCE'));
            return;
          }

          this.isAdding = true;
          this.addingObject = this.buildTempNode(eventName);
        }
      } else if (eventName === 'BIND') {
        fish.toast('info', 'Please select one in-hole cable!');
        this.isAdding = true;
        this.addingObject = this.buildTempEdge('BIND_CABLE');
      } else if (eventName === 'refresh') {
        this.loadTopo();
      }
    },

    cancelAddingResOperation() {
      this.isAdding = false;
      if (this.addingObject) {
        if (this.tempObjects.length !== 0) {
          this.tempObjects.forEach((object) => this.dataModel.remove(object));
          this.tempObjects = [];
        }
        this.dataModel.remove(this.addingObject);
        this.addingObject = null;
      }
    },

    buildTempNode(resType) {
      let node = new ht.Node();
      node.setLayer(LAYER1);
      node.movable = true;
      node.setSize(32, 32);
      node.setImage(`oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`);
      node.setAttr('resType', resType);
      return node;
    },

    buildTempEdge(resType) {
      let edge = new ht.Edge();
      edge.setName('');
      edge.setStyle('edge.width', 2);
      edge.setStyle('edge.type', 'ortho2');
      edge.setStyle('edge.center', true);
      edge.setStyle('edge.color', '#08bcc1');
      edge.setStyle('edge.offset', 6);
      edge.setStyle('edge.dash', true);
      edge.setStyle('edge.dash.pattern', [3]);
      edge.setAttr('resType', resType);
      return edge;
    },

    bindCableToDevice(target) {
      let source = this.addingObject.getSource();
      let resType = target.getAttr('resType');
      let resId = target.getAttr('resId');
      let azEnd = source.getAttr('azEnd');
      //调用服务修改光缆AZ端。
      fish.ajax({
        url: 'edesign/rivt/cable/rebindAOrZEnd/v1',
        type: 'PUT',
        data: JSON.stringify({
          endFlag: azEnd,
          resType: resType,
          resId: resId,
          cableId: source.getAttr('resId'),
          schemaId: this.schemaId,
          mapNo: this.params.mapNo,
        }),
        contentType: 'application/json',
        success: (result) => {
          this.drawOuterCableToInnerDevice(source, resId, azEnd, false);
          if (azEnd) {
            source.setAttr('aResSpecId', resType);
            source.setAttr('aResId', resId);
          } else {
            source.setAttr('zResSpecId', resType);
            source.setAttr('zResId', resId);
          }
        },
        error: (e) => {
          fish.warn(e.errorMessage);
        },
      });
      this.cancelAddingResOperation();
    },

    rebindCableToFacility() {
      let data = this.dataModel.getSelectionModel().getFirstData();
      if (data) {
        let azEnd = data.getAttr('azEnd');
        //调用服务修改光缆AZ端。
        fish.ajax({
          url: 'edesign/rivt/cable/unbindAOrZEnd/v1',
          type: 'PUT',
          data: JSON.stringify({
            endFlag: azEnd,
            resType: this.params.resType,
            resId: this.params.resId,
            cableId: data.getAttr('resId'),
            schemaId: this.schemaId,
            mapNo: this.params.mapNo,
          }),
          contentType: 'application/json',
          success: (result) => {
            //成功后刷新TOPO
            let edges = data.getEdges();
            if (edges && edges.size()) {
              if (azEnd === 'A') {
                data.setAttr('aResSpecId', this.params.resType);
                data.setAttr('aResId', this.params.resId);
              } else {
                data.setAttr('zResSpecId', this.params.resType);
                data.setAttr('zResId', this.params.resId);
              }
              this.dataModel.remove(edges.get(0));
            }
          },
          error: (e) => {
            fish.warn(e.errorMessage);
          },
        });
      }
    },
    /**
         * res = {
                resType: '',
                resId: '',
                resName: '',
            };
         */

    moveResFromManhole(resList, type) {
      if (type === 'out') {
        let allNodes = this.dataModel.getDatas();
        let resNodeList = [];
        resList.forEach((res) => {
          allNodes.each((node) => {
            let attrObject = node.getAttrObject();
            let baseSpecId = node.getAttr('baseSpecId');
            if (baseSpecId && baseSpecId === 'DEVICE') {
              if (attrObject.resId === res.resId) {
                resNodeList.push(node);
                return true;
              }
            }
          });
        });
        if (resNodeList.length > 0) {
          resNodeList.forEach((resNode) => {
            this.dataModel.remove(resNode);
          });
        }
      } else if (type === 'in') {
        resList.forEach((res) => {
          res.placeResId = this.params.resId;
          res.placeResType = this.params.resType;
          this.drawInnerDevice(res, {});
        });
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
      this.graphView.setZoom(0.5);
      this.graphView.setTranslateY(1);
    },

    showPipeOrFacilityPanel(current) {
      let isClickNode = false;
      if (current.getAttrObject() !== undefined) {
        if (
          current.getAttrObject().resSpecId === 'PIPELINE_G' ||
          current.getAttrObject().resSpecId === 'PIPELINE_B' ||
          current.getAttrObject().resSpecId === 'PIPELINE' ||
          current.getAttrObject().resSpecId === 'F_CABLE'
        ) {
          if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
            this.$refs.manholeDesignTopo.$refs.pipePanel.setData(current, this.schemaId);
          }
          this.nodeInfo = current;
          this.$refs.manholeDesignTopo.pipeDrawer = true;
          isClickNode = true;
        } else if (current.getAttrObject().resType === 'MANHOLE') {
          if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
            this.$refs.manholeDesignTopo.$refs.facilityPanel.setData(current, this.schemaId);
          }
          this.nodeInfo = current;
          this.$refs.manholeDesignTopo.facilityDrawer = true;
          isClickNode = true;
        } else if (current.getAttrObject().baseSpecId === 'DEVICE' || current.getAttrObject().baseSpecId === 'CABLE') {
          if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
            this.$refs.manholeDesignTopo.$refs.roomPanel.setData(current, this.schemaId);
          }
          this.nodeInfo = current;
          this.$refs.manholeDesignTopo.roomDrawer = true;
          isClickNode = true;
        }
      }
      if (!isClickNode) {
        this.$refs.manholeDesignTopo.pipeDrawer = false;
        this.$refs.manholeDesignTopo.facilityDrawer = false;
        this.$refs.manholeDesignTopo.roomDrawer = false;
        this.nodeInfo = null;
      }
    },

    closeDrawer() {
      this.$refs.manholeDesignTopo.pipeDrawer = false;
      this.$refs.manholeDesignTopo.facilityDrawer = false;
      this.$refs.manholeDesignTopo.roomDrawer = false;
      this.nodeInfo = null;
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
