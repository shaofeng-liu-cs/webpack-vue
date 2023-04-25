<template>
    <div class="topo-content">
        <TopoView ref="buildingDesignTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick" :roomCloseCallBack="closeDrawer"></TopoView>
        <SelectDevice :schemaId="params.schemaId" ref="selectDevice" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></SelectDevice>
    </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import SelectDevice from '../../osp/topo-control/device_design/selectDevice.vue';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { saveTopo, loadTopoData } from '../TopoUtil';
import { queryResInfo, loadStructure } from '../TopoHandleAction.js';
import { getByFeatureLayers, Filter, SupportSpatialReferences, GeometryType } from 'map';
import { getSurfaceLayers } from '../../api/query/schema.js';
import { deleteGraphic } from '../../../edesign/osp/domain/ResEventHandler.js';
import { queryPointRelaResInfo } from '@/oss_core/edesign/api/query/resId.js';

const LAYER0 = 0; //建筑物结构
const LAYER1 = 1; //内部设备， 内部连接
const LAYERS = [LAYER0, LAYER1];

const DATA_TYPE_DEVICE_IN_BUILDING = 'DIB';
const DATA_TYPE_DEVICE_IN_ROOM = 'DIR';
const DATA_TYPE_CABLE_IN_BUILDING = 'CIB';
const DATA_TYPE_CABLE_TO_ROOM = 'CTR';
const DATA_TYPE_CABLE_TO_BUILDING_DEVICE = 'CTBD';
const DATA_TYPE_CABLE_TO_BUILDING = 'CTB';

export default {
  name: 'BuildingDesignTopo',
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
      xPos: 100, //TOPO起始X
      yPos: 30, //TOPO起始Y
      buildHeight: 0, //建筑物高度
      topoData: {}, //保存的Topo元素的位置信息
      buildingData: {}, //建筑基本信息
      buildingInfo: null,
      toolButtons: [
        {
          id: 'ODB',
          name: 'ODB',
          image: 'oss_core/edesign/assets/image/topo-business/res/dark/ODB.png',
          title: 'ODB',
          event: 'ODB',
        },
        {
          id: 'ODF',
          name: 'ODF',
          image: 'oss_core/edesign/assets/image/topo-business/res/dark/ODF.png',
          title: 'ODF',
          event: 'ODF',
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
    this.graphView.setMovableFunc(elem => elem.movable);

    this.graphView.addInteractorListener(e => {
      if (e.kind === 'betweenMove') {
        //拖拽
        this.redrawOuterCableWhenMoveDevice();
      } else if (e.kind === 'clickData') {
        //点击Node
        this.clickNode(e.data);
        this.showBuildPanel(e.data);
      }
      if (e.kind === 'clickBackground') {
        this.closeDrawer();
      }
    });

    this.graphView.getView().addEventListener('keyup', e => {
      if (e.keyCode === 27) {
        // ESC,
        this.toolbarClick('select');
      }
    });

    this.graphView.getView().addEventListener('mousemove', e => {
      if (this.isAdding && this.addingObject) {
        let p = this.graphView.lp(e);
        // 新增光缆
        if (this.addingObject.getAttr('resSpecId') === GlobalConst.RES_TYPE_F_CABLE || this.addingObject.getAttr('resSpecId') === 'BIND_CABLE') {
          if (this.addingObject.getTarget()) {
            this.addingObject.getTarget().setPosition(p.x, p.y);
          }
        } else {
          // 新增设备
          //this.addingObject.setPosition(e.layerX - translateX, e.layerY - translateY);
          this.addingObject.setPosition(p.x, p.y);
          if (!this.dataModel.contains(this.addingObject)) {
            this.dataModel.add(this.addingObject);
          }
        }
      }
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
      this.topoId = 'BLD-DESIGN' + this.params.resId;
      this.schemaId = this.params.schemaId;
      let condParam = { buildingId: this.params.resId };
      let buildingId = this.params.resId;
      let p0 = loadTopoData(this.topoId);
      let p1 = queryResInfo(this.params.resType, this.params.resId);
      let p2 = loadStructure(condParam); //查询建筑物结构
      let params = {
        resId: this.params.resId,
        resType: this.params.resType,
        mapNo: this.params.mapNo,
        schemaId: this.params.schemaId,
      };
      let p3 = queryPointRelaResInfo(params); //查询建筑物关联资源

      Promise.all([p0, p1, p2, p3]).then(datas => {
        let topoData = datas[0];
        let buildingInfo = datas[1].resultList[0];
        this.buildingInfo = buildingInfo;
        //this.longitude = buildingInfo.longitude;
        //this.latitude = buildingInfo.latitude;
        let innerResList = datas[3].innerResList || [];
        let outerResList = datas[3].outerResList || [];
        let cableList = datas[3].cableList || [];
        let logicCableList = datas[3].logicCableList || [];
        let sectionResList = datas[3].sectionResList || [];

        this.queryBuildingGeometry();

        let resultList = datas[2].resultList || [];
        if (resultList.length > 0) {
          let buildingData = resultList[0];
          this.drawBuilding(buildingData);
        }

        // 建筑物内设备
        let innerDevList = innerResList.filter(item => item.resType === 'ODB' || item.resType === 'ODF' || item.resType === 'F_CLOSURE');
        //innerDevList.forEach(dev => this.addDeviceNode(dev));

        innerResList.forEach(innerRes => {
          let resType = innerRes.resType;
          if (innerRes.placeResType !== 'BUILDING') {
            let placeResId = innerRes.placeResId;
            let parent = this.dataModel.getDataByTag(placeResId);
            let node = this.addDeviceNode(innerRes, parent);
            node.setName('');
            node.setToolTip(innerRes.resName);
            node.movable = false;
          }
        });

        innerResList.forEach(innerRes => {
          let resType = innerRes.resType;
          if (innerRes.placeResType === 'BUILDING') {
            if (GlobalConst.RES_TYPE_F_CABLE === resType || GlobalConst.RES_TYPE_COPPER_CABLE === resType) {
              this.drawInnerCable(innerRes, logicCableList);
            } else {
              this.drawInnerDevice(innerRes, topoData);
            }
          }
        });

        //To House 光缆
        cableList.forEach(cable => {
          let aResId = cable.aResId;

          if (this.dataModel.getDataByTag(aResId) != null || aResId == buildingId) {
            let node = this.addToHouseCable(cable, 'A');
            this.addToHouseLink(node, aResId);
          }

          let zResId = cable.zResId;
          if (this.dataModel.getDataByTag(zResId) != null || zResId == buildingId) {
            let node = this.addToHouseCable(cable, 'Z');
            this.addToHouseLink(node, zResId);
          }
        });
      });
    },

    queryBuildingGeometry() {
      getByFeatureLayers([
        {
          layerNo: this.params.buildingLayerNo,
          filter: Filter.equalTo({ propertyName: 'gisKey', expression: this.params.buildingGisId }),
        },
      ]).then(result => {
        if (result && result.length > 0) {
          let geo = result[0].geometry.transferProjection(SupportSpatialReferences.WGS84);
          if (geo.geometryType === GeometryType.POINT) {
            this.longitude = geo.x.toFixed(6) + '';
            this.latitude = geo.y.toFixed(6) + '';
          } else {
            let centerPoint = geo.getCentroid();
            this.longitude = centerPoint.x.toFixed(6) + '';
            this.latitude = centerPoint.y.toFixed(6) + '';
          }
        }
      });
    },

    drawBuilding(buildingData) {
      let buildingType = buildingData.buildingType;
      let startX = this.xPos;
      let startY = this.yPos;
      // 独栋
      if ('3' === buildingType) {
        let uWidth = 320;
        let uHeight = 260;
        let unitNode = this.drawRect(
          {
            resSpecId: GlobalConst.RES_TYPE_BUILDING_UNIT,
            name: buildingData.name,
          },
          null,
          startX,
          startY,
          uWidth,
          uHeight
        );

        let floorNode = this.drawRect(
          {
            resSpecId: GlobalConst.RES_TYPE_BUILDING_FLOOR,
            name: '',
          },
          unitNode,
          startX,
          startY,
          uWidth,
          uHeight
        );

        let roomNode = this.drawRect(
          {
            resSpecId: GlobalConst.RES_TYPE_BUILDING_ROOM,
            name: '',
          },
          floorNode,
          startX + 5,
          startY + 5,
          uWidth - 10,
          uHeight - 10
        );
        roomNode.setName('');
        roomNode.setStyle('shape.background', '#FFFFFF');
        roomNode.setStyle('shape.border.color', '#70c076');

        // 弱电井
        this.drawRect(
          {
            resSpecId: GlobalConst.RES_TYPE_BUILDING_WELL,
            name: '',
          },
          null,
          startX + uWidth,
          startY,
          150,
          uHeight
        );

        this.buildHeight = uHeight;
      } else {
        let units = buildingData.imBuildingUnitList;
        let floors = buildingData.imFloorList.reverse();
        let floorCnt = floors.length;

        let rWidth = 65;
        let rHeight = 45;
        let space = 10;

        let fHeight = rHeight + 2 * space;
        let hWidth = 150;
        let uSpace = 150;

        units.forEach(unit => {
          let unitId = unit.unitId;
          let maxRoomCountPerFloor = 1;
          //计算单元下楼层的最大房间数
          floors.forEach(floor => {
            let floorRoomCount = 0;
            let rooms = floor.imFloorRoomList;
            rooms.forEach(room => {
              if (room.unitId === unitId) {
                floorRoomCount++;
              }
            });

            if (maxRoomCountPerFloor < floorRoomCount) {
              maxRoomCountPerFloor = floorRoomCount;
            }
          });

          let uWidth = (rWidth + space) * maxRoomCountPerFloor + space;
          let uHeight = (rHeight + 2 * space) * floorCnt;
          let unitNode = this.drawRect(unit, null, startX, startY, uWidth, uHeight);
          // 楼层
          let floorIndex = 0;
          floors.forEach(floor => {
            let y = startY + floorIndex * fHeight;
            floorIndex++;
            let floorNode = this.drawRect(floor, unitNode, startX, y, uWidth, fHeight);
            floorNode.setStyle('label.position', GlobalConst.LABEL_POSITION_LEFT);
            floorNode.setStyle('label.offset.x', -5);

            let rooms = floor.imFloorRoomList;
            let roomIndex = 0;
            rooms.forEach(room => {
              if (room.unitId === unitId) {
                let rx = startX + roomIndex * (rWidth + space) + space;
                let ry = y + space;
                roomIndex++;

                //room.id = room.roomId;
                room.resSpecId = GlobalConst.RES_TYPE_BUILDING_ROOM;
                let roomNode = this.drawRect(room, floorNode, rx, ry, rWidth, rHeight);
                roomNode.setTag(room.roomId);
                roomNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
                roomNode.setStyle('shape.background', '#FFFFFF');
                roomNode.setStyle('shape.border.color', '#70c076');
              }
            });
          });

          startX += uWidth;

          // 弱电井
          let wellNode = this.drawRect(unit, null, startX, startY, hWidth, uHeight);
          wellNode.setName('');
          wellNode.setAttr('resSpecId', GlobalConst.RES_TYPE_BUILDING_WELL);
          startX += hWidth + uSpace;
        });

        this.buildHeight = (rHeight + 2 * space) * floorCnt;
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
        node.setPosition(100, 100);
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
      edge.setToolTip(data.resName);
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

    findNextCutNode(cableId, deviceId, logicCableList) {
      let nextNode = null;
      logicCableList.some(logicCable => {
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

    drawRect(data, parent, xPos, yPos, width, height) {
      let node = new ht.Node();
      let name = data.name || data.fullName;
      let toolTip = data.fullName || data.name;

      xPos += width / 2;
      yPos += height / 2;
      node.setPosition(xPos, yPos);
      node.setName(name);
      node.setToolTip(toolTip);
      node.setSize(width, height);
      node.setStyle('label.scale', 1);
      node.setStyle('shape', 'rect'); //矩形
      node.setStyle('shape.background', '#EFF2EF');
      node.setStyle('shape.border.width', 2);
      node.setStyle('shape.border.color', '#BDC0BF');
      node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      node.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setParent(parent);
      node.setHost(parent);
      node.movable = false;
      node.setAttrObject(data);
      this.dataModel.add(node);
      return node;
    },

    buildDeviceNode(data) {
      let resType = data.resSpecId;
      let resName = data.name;
      let node = new ht.Node();
      node.setLayer(LAYER1);
      node.setName(resName);
      node.movable = true;
      node.setSize(32, 32);
      node.setImage(`oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`);
      node.setAttrObject(data);
      return node;
    },

    buildCableEdge(data) {
      let edge = new ht.Edge();
      edge.setName('');
      //edge.setSource(aDeviceNode);
      //edge.setTarget(zDeviceNode);
      edge.setStyle('edge.width', 2);
      edge.setStyle('edge.type', 'ortho2');
      edge.setStyle('edge.center', true);
      edge.setStyle('edge.color', '#08bcc1');
      edge.setStyle('edge.offset', 6);
      edge.setStyle('edge.dash', true);
      edge.setStyle('edge.dash.pattern', [3]);
      edge.setStyle('select.color', 'red');
      edge.setAttrObject(data);
      return edge;
    },

    addDeviceNode(data, parent) {
      let resType = data.resSpecId || data.resType;
      let resName = data.name || data.resName;
      let node = new ht.Node();
      data.resType = data.resType;
      node.setLayer(LAYER1);
      node.setName(resName);
      node.movable = true;
      node.setSize(32, 32);
      node.setImage(`oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`);
      if (parent) {
        node.setParent(parent);
        node.setPosition(parent.getPosition().x, parent.getPosition().y);
      } else {
        let resId = data.resId;
        if (this.topoData[resId]) {
          node.setPosition(this.topoData[resId].x, this.topoData[resId].y);
        } else {
          node.setPosition(100, 100);
        }
      }
      node.setStyle('select.color', 'red');
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setStyle('shadow.color', 'red');
      node.setTag(data.resId);
      node.setAttrObject(data);
      node.setAttr('type', parent ? DATA_TYPE_DEVICE_IN_ROOM : DATA_TYPE_DEVICE_IN_BUILDING);
      node.setAttr('baseSpecId', 'DEVICE');
      this.dataModel.add(node);
      return node;
    },

    addToHouseCable(data, azEnd) {
      let index = this.toHouseCableIndex || 0;
      let resName = data.name || data.resName;
      let node = new ht.Node();
      node.setLayer(LAYER1);
      node.setName(`${resName}(${azEnd})`);
      node.setToolTip(`${resName}(${azEnd})`);
      node.setStyle('shape', 'circle');
      node.setStyle('shape.background', '#c1911c');
      //node.setStyle('shape.border.color', '#5675C1');
      node.setStyle('shape.border.width', 0);
      node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      node.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
      node.setStyle('select.color', 'red');
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setStyle('shadow.color', 'red');
      node.setAttrObject(data);
      node.setAttr('type', DATA_TYPE_CABLE_TO_BUILDING);
      node.setTag(data.CABLE_ID + azEnd);
      node.setSize(20, 20);
      node.setPosition(this.xPos + index * 100, this.yPos + this.buildHeight + 150);
      this.dataModel.add(node);
      this.toHouseCableIndex = index + 1;
      return node;
    },

    addToHouseLink(cableNode, deviceId) {
      let deviceNode = this.dataModel.getDataByTag(deviceId);
      if (deviceNode == null) {
        return;
      }
      let cableAttr = cableNode.getAttrObject();
      let resName = cableAttr.name || cableAttr.resName;
      let edge = new ht.Edge();
      edge.setToolTip(resName);
      edge.setLayer(LAYER1);
      edge.setSource(cableNode);
      edge.setTarget(deviceNode);
      edge.setStyle('edge.width', 2);
      edge.setStyle('edge.color', '#08bcc1');
      edge.setStyle('edge.type', 'points');
      let points = [
        {
          x: cableNode.getPosition().x,
          y: cableNode.getPosition().y - 80,
        },
        {
          x: deviceNode.getPosition().x,
          y: cableNode.getPosition().y - 80,
        },
      ];
      edge.setStyle('edge.points', points);
      edge.setStyle('edge.offset', 6);
      edge.setStyle('select.color', 'red');
      let data = fish.extend({}, cableAttr, { type: DATA_TYPE_CABLE_TO_BUILDING_DEVICE });
      edge.setAttrObject(data);
      this.dataModel.add(edge);
    },

    addInnerCableLink(data) {
      let aDeviceNode = this.dataModel.getDataByTag(data.aDeviceId);
      let zDeviceNode = this.dataModel.getDataByTag(data.zDeviceId);
      if (aDeviceNode == null || zDeviceNode == null) {
        return;
      }

      let edge = new ht.Edge();
      edge.setToolTip(data.name);
      edge.setLayer(LAYER1);
      edge.setSource(aDeviceNode);
      edge.setTarget(zDeviceNode);
      edge.setStyle('edge.width', 2);

      // 判断是否为To Room光缆
      let isToRoom = false;
      let points;
      if (aDeviceNode.getParent() != null && GlobalConst.RES_TYPE_BUILDING_ROOM == aDeviceNode.getParent().getAttr('resSpecId')) {
        isToRoom = true;
        let midX = aDeviceNode.getPosition().x > zDeviceNode.getPosition().x ? zDeviceNode.getPosition().x + 30 : zDeviceNode.getPosition().x - 30;
        points = [
          {
            x: aDeviceNode.getPosition().x,
            y: aDeviceNode.getPosition().y + 28,
          },
          {
            x: midX,
            y: aDeviceNode.getPosition().y + 28,
          },
          {
            x: midX,
            y: zDeviceNode.getPosition().y,
          },
        ];
      } else if (zDeviceNode.getParent() != null && GlobalConst.RES_TYPE_BUILDING_ROOM == zDeviceNode.getParent().getAttr('resSpecId')) {
        isToRoom = true;
        let midX = aDeviceNode.getPosition().x > zDeviceNode.getPosition().x ? aDeviceNode.getPosition().x - 30 : aDeviceNode.getPosition().x + 30;
        points = [
          {
            x: midX,
            y: aDeviceNode.getPosition().y,
          },
          {
            x: midX,
            y: zDeviceNode.getPosition().y + 28,
          },
          {
            x: zDeviceNode.getPosition().x,
            y: zDeviceNode.getPosition().y + 28,
          },
        ];
      }

      if (isToRoom) {
        edge.setStyle('edge.type', 'points');
        edge.setStyle('edge.points', points);
      } else {
        //edge.setName(data.name);
        edge.setStyle('edge.type', 'ortho2');
        edge.setStyle('edge.center', true);
      }
      edge.setStyle('edge.color', 'blue'); //'#08bcc1'
      edge.setStyle('edge.offset', 6);
      edge.setStyle('select.color', 'red');
      edge.setAttrObject(data);
      edge.setAttr('type', isToRoom ? DATA_TYPE_CABLE_TO_ROOM : DATA_TYPE_CABLE_IN_BUILDING);
      edge.setAttr('baseSpecId', 'CABLE');
      this.dataModel.add(edge);
      return edge;
    },

    loadTopoData() {
      return new Promise((resolve, reject) => {
        fish.get({
          url: `edesign/topo/data/${this.topoId}/v1`,
          success: result => {
            let data = {};
            if (result && result.topoDataString) {
              data = JSON.parse(result.topoDataString);
            }
            resolve(data);
          },
          error: reject,
        });
      });
    },

    // 接口已被删除
    // loadBuildingRes() {
    //     return new Promise((resolve, reject) => {
    //         let buildingId = this.params.resId;
    //         fish.get({
    //             url: `edesign/rivt/building/${buildingId}/topores/v1?mapNo=${this.params.mapNo}`,
    //             data: {},
    //             success: result => {
    //                 let innerDevList = result.devListUnderBuilding || [];
    //                 let roomDevList = result.devListUnderFloorRoom || [];
    //                 let innerCableList = result.cableListUnderBuilding || [];
    //                 let inCableList = result.cableListOfAccessPoint || [];

    //                 // 建筑物内设备
    //                 innerDevList.forEach(dev => this.addDeviceNode(dev));

    //                 // 房间内设备
    //                 roomDevList.forEach(dev => {
    //                     let placeResId = dev.placeResId;
    //                     let parent = this.dataModel.getDataByTag(placeResId);
    //                     let node = this.addDeviceNode(dev, parent);
    //                     node.setName('');
    //                     node.movable = false;
    //                 });

    //                 //内部光缆
    //                 innerCableList.forEach(cable => {
    //                     this.addInnerCableLink(cable);
    //                 });

    //                 //To House 光缆
    //                 inCableList.forEach(cable => {
    //                     let aDeviceId = cable.aDeviceId;

    //                     if (this.dataModel.getDataByTag(aDeviceId) != null || aDeviceId == buildingId) {
    //                         let node = this.addToHouseCable(cable, 'A');
    //                         this.addToHouseLink(node, aDeviceId);
    //                     }

    //                     let zDeviceId = cable.zDeviceId;
    //                     if (this.dataModel.getDataByTag(zDeviceId) != null || zDeviceId == buildingId) {
    //                         let node = this.addToHouseCable(cable, 'Z');
    //                         this.addToHouseLink(node, zDeviceId);
    //                     }
    //                 });
    //                 resolve(0);
    //             },
    //             error: reject,
    //         });
    //     });
    // },

    redrawOuterCableWhenMoveDevice() {
      let node = this.dataModel.getSelectionModel().getFirstData();
      if (node) {
        let links = this.dataModel.getSelectionModel().getFirstData().getEdges();
        let count = links ? links.size() : 0;
        for (let i = count - 1; i >= 0; i--) {
          let link = links.get(i);
          let data = link.getAttrObject();
          let type = data.type;
          if (type === DATA_TYPE_CABLE_TO_BUILDING_DEVICE) {
            this.addToHouseLink(link.getSource(), node.getAttr('resId'));
            this.dataModel.remove(link);
          } else if (type === DATA_TYPE_CABLE_TO_ROOM) {
            this.addInnerCableLink(data);
            this.dataModel.remove(link);
          }
        }
      }
    },

    clickNode(node) {
      console.info(node);
      if (this.isAdding && this.addingObject) {
        let resSpecId = this.addingObject.getAttr('resSpecId') || this.addingObject.getAttr('resType');
        // 新增光缆
        if (resSpecId === GlobalConst.RES_TYPE_F_CABLE) {
          if (node) {
            if (!this.addingObject.getSource()) {
              if (node.getAttr('baseSpecId') !== 'DEVICE') {
                fish.toast('info', 'Please select a device!');
                return;
              }

              let target = new ht.Node();
              //target.setLayer(LAYER1);
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
                fish.toast('info', 'Please select the end device!');
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
              this.addResInBuilding(this.addingObject);
            }
          }
        } else if (resSpecId === 'BIND_CABLE') {
          // 光缆绑定AZ
          if (node) {
            let resType = node.getAttr('resType');
            if (!this.addingObject.getSource()) {
              if (resType !== GlobalConst.RES_TYPE_F_CABLE || !(node instanceof ht.Node)) {
                fish.toast('info', 'Please select one in-house cable!');
                return;
              }

              if (node.getEdges() && node.getEdges().size() !== 0) {
                this.cancelAddingResOperation();
                fish.toast('warn', 'The cable has been bind to the device!');
                return;
              }

              let target = new ht.Node();
              //target.setLayer(LAYER1);
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
                fish.toast('info', 'Please select the end device!');
                return;
              }

              this.bindCableToDevice(node);
            }
          }
        } else {
          this.addResInBuilding(this.addingObject);
        }
      }
    },

    showBuildPanel(current) {
      let isClickNode = false;
      if (current.getAttrObject().baseSpecId === 'DEVICE' || current.getAttrObject().resType === 'F_CABLE') {
        if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
          this.$refs.buildingDesignTopo.$refs.roomPanel.setData(current, this.params.schemaId);
        }
        this.nodeInfo = current;
        this.$refs.buildingDesignTopo.roomDrawer = true;
        isClickNode = true;
      }
      if (!isClickNode) {
        this.$refs.buildingDesignTopo.roomDrawer = false;
        this.nodeInfo = null;
      }
    },

    closeDrawer() {
      this.$refs.buildingDesignTopo.roomDrawer = false;
      this.nodeInfo = null;
    },

    initMenus(selectedDatas) {
      let isSelected = selectedDatas.size() != 0;
      let isAllInnerRes = isSelected;
      let isDevice = isSelected;
      let isToHouseCable = isSelected;
      selectedDatas.each(data => {
        let baseSpecId = data.getAttr('baseSpecId');
        let resSpecId = data.getAttr('resSpecId') || data.getAttr('resType');
        if (baseSpecId !== 'DEVICE' && baseSpecId !== 'CABLE') {
          isAllInnerRes = false;
        }

        if (baseSpecId !== 'DEVICE') {
          isDevice = false;
        }

        if (!(data instanceof ht.Node) || resSpecId !== GlobalConst.RES_TYPE_F_CABLE) {
          isToHouseCable = false;
        }
      });

      let menus = [];
      if (selectedDatas.size() === 1) {
        if (isDevice) {
          menus.push({
            label: 'Design',
            visible: true,
            action: () => {
              let attrObject = selectedDatas._as[0]._attrObject;
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

        // 已经绑定到内部设备的 入户光缆，重新绑定到Building
        if (isToHouseCable && selectedDatas.get(0).getEdges() && selectedDatas.get(0).getEdges().size() != 0) {
          menus.push({
            label: 'Rebind',
            visible: true,
            action: this.rebindCableToBuilding,
          });
        }
      }

      if (isAllInnerRes) {
        let isShowDelButton = this.isAllowDeal(selectedDatas);
        if (isShowDelButton) {
          menus.push({
            label: 'Delete',
            visible: true,
            action: () => {
              this.deleteRes(selectedDatas);
            },
          });
        }
      }
      return menus;
    },

    //判断节点是否可操作；比如删除。。。
    // 主要引用、利旧时，取designOrdId 表示创建时的schemaId;
    //projectSchemaId !== this.schemaId   //利旧 创建schemaId与当前schemaId不同时，表示利旧
    isAllowDeal(nodes) {
      let isDealFlag = true;
      for (let i = 0; i < nodes.length - 1; i++) {
        let attr = node.getAttrObject();
        let projectSchemaId = attr.designOrdId || '';
        if (projectSchemaId !== this.schemaId) {
          isDealFlag = false;
          break;
        }
      }
      return isDealFlag;
    },

    deleteRes(selectedDatas) {
      //fish.confirm(this.$t('MAKE_SURE_REMOVE_RESOURCES'), () => {
      let param = {
        graphic: [],
      };
      selectedDatas.each(data => {
        param.graphic.push({
          resType: data.getAttr('resSpecId') || data.getAttr('resType'),
          resId: data.getAttr('resId'),
          schemaId: this.schemaId,
        });
      });
      deleteGraphic(param).then(() => {
        fish.toast('success', this.$t('DELETE_SUCCESS'));
        selectedDatas.each(data => {
          this.dataModel.remove(data);
        });
        this.$emit('resEvent', param.graphic, 'del');
        //this.saveAndRefreshTopo();
      });
      //});
    },

    toolbarClick(eventName) {
      this.cancelAddingResOperation();

      if (eventName === 'ODB' || eventName === 'ODF' || eventName === 'F_CLOSURE' || eventName === 'F_CABLE') {
        this.isAdding = true;
        if (eventName === 'F_CABLE') {
          fish.toast('info', 'Please select the start device!');
          this.addingObject = this.buildCableEdge({
            resSpecId: eventName,
            name: '',
          });
        } else {
          this.addingObject = this.buildDeviceNode({
            resSpecId: eventName,
            name: '',
          });
        }
      } else if (eventName === 'BIND') {
        fish.toast('info', 'Please select one in-house cable!');
        this.isAdding = true;
        this.addingObject = this.buildCableEdge({
          resSpecId: 'BIND_CABLE',
          name: '',
        });
      } else if (eventName === 'refresh') {
        this.loadTopo();
      }
    },

    addResInBuilding(addingNode) {
      if (!addingNode) {
        return;
      }

      let resType = addingNode.getAttr('resSpecId') || addingNode.getAttr('resType');
      let buildingId = this.params.resId;

      //增加对象属性
      let addingRes = {
        resType: resType,
        longitude: this.longitude,
        latitude: this.latitude,
        formList: [],
      };

      if (GlobalConst.RES_TYPE_F_CABLE === resType) {
        addingRes.length = 10;
        addingRes.aResSpecId = addingNode.getSource().getAttr('resSpecId') || addingNode.getSource().getAttr('resType');
        addingRes.aDeviceId = addingNode.getSource().getAttr('resId');
        addingRes.aDeviceName = addingNode.getSource().getAttr('name') || addingNode.getSource().getAttr('resName');
        addingRes.zResSpecId = addingNode.getTarget().getAttr('resSpecId') || addingNode.getTarget().getAttr('resType');
        addingRes.zDeviceId = addingNode.getTarget().getAttr('resId');
        addingRes.zDeviceName = addingNode.getTarget().getAttr('name') || addingNode.getTarget().getAttr('resName');
        addingRes.resFlag = 'INV';
      }

      if (this.buildingInfo.siteId) {
        addingRes.siteId = this.buildingInfo.siteId;
        addingRes.siteName = this.buildingInfo.siteIdDesc;
      }

      if (this.buildingInfo.areaId) {
        addingRes.areaId = this.buildingInfo.areaId;
        addingRes.areaIdDesc = this.buildingInfo.areaIdDesc;
      }

      //上级资源属性
      let parentRes = {
        resId: buildingId,
        resType: GlobalConst.RES_TYPE_BUILDING,
      };

      this.$refs.selectDevice.setResData(addingRes, parentRes);
      this.$refs.selectDevice.CompPopuTopo.show = true;
      this.$refs.selectDevice.show = true;
    },

    doAfterAddRes(datas) {
      let resSpecId = this.addingObject.getAttr('resSpecId') || this.addingObject.getAttr('resType');
      let isAddCable = resSpecId === GlobalConst.RES_TYPE_F_CABLE;
      if (datas && datas.length > 0) {
        let index = 0;
        datas.forEach(data => {
          data.resInfo.resId = data.resId;
          data.resInfo.designOrdId = this.schemaId;
          data.resInfo.schemaId = this.schemaId;
          if (isAddCable) {
            //this.drawInnerCable(data.resInfo);
            this.addInnerCableLink(data.resInfo);
          } else {
            let node = this.addDeviceNode(data.resInfo);
            node.setPosition(this.addingObject.getPosition().x, this.addingObject.getPosition().y + 40 * index);
            index++;
          }
        });
        this.$emit('resEvent', datas, 'add');
      }
      this.doAfterClose();
    },

    cancelAddingResOperation() {
      this.isAdding = false;
      if (this.addingObject) {
        if (this.tempObjects.length !== 0) {
          this.tempObjects.forEach(object => this.dataModel.remove(object));
          this.tempObjects = [];
        }
        this.dataModel.remove(this.addingObject);
        this.addingObject = null;
      }
    },

    doAfterClose() {
      this.cancelAddingResOperation();
    },

    bindCableToDevice(target) {
      let source = this.addingObject.getSource();
      let resType = target.getAttr('resType') || target.getAttr('resSpecId');
      let resId = target.getAttr('resId');
      let isAEnd = source.getName().endsWith('(A)');
      //调用服务修改光缆AZ端。
      fish.ajax({
        url: 'edesign/rivt/cable/rebindAOrZEnd/v1',
        type: 'PUT',
        data: JSON.stringify({
          endFlag: isAEnd ? 'A' : 'Z',
          resType: resType,
          resId: resId,
          cableId: source.getAttr('resId'),
          schemaId: this.schemaId,
          mapNo: this.params.mapNo,
        }),
        contentType: 'application/json',
        success: result => {
          this.addToHouseLink(source, target.getAttr('resId'));
          if (isAEnd) {
            source.setAttr('aResSpecId', resType);
            source.setAttr('aDeviceId', resId);
          } else {
            source.setAttr('zResSpecId', resType);
            source.setAttr('zDeviceId', resId);
          }
        },
        error: e => {
          fish.warn(e.errorMessage);
        },
      });

      //this.dataModel.remove(this.addingObject.getTarget());
      this.cancelAddingResOperation();
    },

    rebindCableToBuilding() {
      let data = this.dataModel.getSelectionModel().getFirstData();
      if (data) {
        let isAEnd = data.getName().endsWith('(A)');
        //调用服务修改光缆AZ端。
        fish.ajax({
          url: 'edesign/rivt/cable/unbindAOrZEnd/v1',
          type: 'PUT',
          data: JSON.stringify({
            endFlag: isAEnd ? 'A' : 'Z',
            resType: GlobalConst.RES_TYPE_BUILDING,
            resId: this.params.resId,
            cableId: data.getAttr('resId'),
            schemaId: this.schemaId,
            mapNo: this.params.mapNo,
          }),
          contentType: 'application/json',
          success: result => {
            //成功后刷新TOPO
            let edges = data.getEdges();
            if (edges && edges.size()) {
              if (isAEnd) {
                data.setAttr('aResSpecId', GlobalConst.RES_TYPE_BUILDING);
                data.setAttr('aDeviceId', this.params.resId);
              } else {
                data.setAttr('zResSpecId', GlobalConst.RES_TYPE_BUILDING);
                data.setAttr('zDeviceId', this.params.resId);
              }
              this.dataModel.remove(edges.get(0));
            }
          },
          error: e => {
            fish.warn(e.errorMessage);
          },
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

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
