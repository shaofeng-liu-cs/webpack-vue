<template>
  <div class="topo-content">
    <TopoView ref="cableLayingTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick"></TopoView>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import { queryResInfo, loadPipelineRate, loadPipelineData, removeCableInPipeline, getSprintSetting } from '../TopoHandleAction.js';
import * as GlobalConst from '../../../base/utils/GlobalConst';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const ROUTE_LABEL_FONT = '14px Tahoma';
const CABLE_BORDER_WIDTH = 2;
//const maxRate = 0.6;

const INNER_RES_TYPES = [];
const ROUTE_FACILITY_SIZE = { width: 200, height: 200 };
const ROUTE_LINE_SIZE = { width: 250, height: 50 };
const ROUTE_BRIDGE_SIZE = { width: 10, height: 120 };
const PIPELINE_GROUP_SIZE = { width: 420, height: 420 };
const RES_SPEC_INFO = {
  MANHOLE: 'Manhole',
  POLE: 'Pole',
  MARKSTONE: 'Markstone',
  BURIED_PIPE: 'Buried Pipe',
  PIPELINE_G: 'Pipe group',
  PIPELINE: 'Pipeline',
  AIR_WIRE: 'Air Wire',
};

export default {
  name: 'CableLayingTopo',
  components: {
    TopoView,
  },
  props: {
    params: Object,
  },
  computed: {},
  data() {
    return {
      topoData: {}, // TOPO元素位置数据
      topoId: 'CableLaying_' + this.params.cable.cableId,
      cable: null,
      pipelineIds: '',
      routeList: [],
      isExistPipelineGroup: false, //是否有管道段
      pipeLineGroupSelectHole: [], //选中穿缆的管孔
      offset: { X: 150, Y: 200 }, //TOPO起始X Y
      width: 300,
      height: 300,
      toolButtons: [],
      maxRate: 0.6,
      checkFlag: 'N',
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc((elem) => elem.movable);

    this.graphView.addInteractorListener((e) => {
      if (e.kind === 'clickData') {
        //点击Node
        this.clickNode(e.data);
      }
    });
  },
  mounted() {
    this.loadTopo();
  },
  beforeDestroy() {
    // if (this.params.resId && this.params.schemaId) {
    //     //saveTopo(this.params.schemaId, this.topoId, this.dataModel);
    // }
  },

  methods: {
    initData() {
      let preNode = null;
      let count = this.routeList.length;
      let newRouteList = [];
      for (let i = 0; i < count; i++) {
        let routeObj = this.routeList[i];
        if (preNode) {
          if (
            (preNode.resSpecId === 'MANHOLE' && routeObj.resSpecId === 'POLE') ||
            (preNode.resSpecId === 'POLE' && routeObj.resSpecId === 'MANHOLE') ||
            (preNode.resSpecId === 'MANHOLE' && routeObj.resSpecId === 'MANHOLE') ||
            (preNode.resSpecId === 'POLE' && routeObj.resSpecId === 'POLE')
          ) {
            let nullLine = { resSpecId: 'NULL_LINE', resId: '1_' + i, resName: '', RES_NO: '' };
            newRouteList.push(nullLine);
          }
        }
        preNode = routeObj;
        newRouteList.push(routeObj);
      }

      this.routeList = newRouteList;

      if (this.pipelineIds.length > 0) this.isExistPipelineGroup = true;
      let resType = this.cable.resSpecId;
      let resId = this.cable.cableId;
      queryResInfo(resType, resId).then((data) => {
        if (data) {
          if (data.resultList && data.resultList.length != 0) {
            this.cable.diameter = data.resultList[0].diameter;
          }
        }
      });
      let param = {
        sprintId: this.params.sprintId,
        paramNo: 'HOLE_OCCUPY_CHECKING',
      };
      getSprintSetting(param).then((data) => {
        if (data) {
          this.checkFlag = data.paramVal || 'N';
          this.maxRate = parseFloat(data.extVal);
        }
      });
    },
    loadTopo() {
      if (this.dataModel) {
        this.dataModel.clear();
      }
      console.info(this.params);
      this.cable = this.params.cable;
      this.pipelineIds = this.params.pipelineIds;
      this.routeList = this.params.routeList || [];
      this.initData();
      this.drawRoute();

      //当有管道组时，继续查询管道段数据
      if (this.isExistPipelineGroup) {
        let arrPipelineIds = this.pipelineIds.split(',');
        let p1 = loadPipelineRate(arrPipelineIds);
        let p2 = loadPipelineData(arrPipelineIds);

        Promise.all([p1, p2]).then((datas) => {
          let rateData = datas[0].resultList || [];
          let pipelineData = datas[1].resultList || [];

          this.drawRouteRate(rateData);

          this.drawPipelineGroup(pipelineData);
        });
      }
    },

    drawRoute() {
      let preNode = null;
      this.routeList.forEach((route) => {
        let width = 0;
        let height = 0;
        let postX = this.offset.X;
        let postY = this.offset.Y;
        let resSpecId = route.resSpecId;
        if (resSpecId === 'MANHOLE' || resSpecId === 'POLE') {
          width = ROUTE_FACILITY_SIZE.width;
          height = ROUTE_FACILITY_SIZE.height;
        } else if (resSpecId === 'PIPELINE_G' || resSpecId === 'AIR_WIRE') {
          width = ROUTE_LINE_SIZE.width;
          height = ROUTE_LINE_SIZE.height;
        } else {
          width = ROUTE_LINE_SIZE.width - 2;
          height = ROUTE_LINE_SIZE.height;
        }

        if (preNode) {
          let post = preNode.getPosition();
          postX = post.x + (preNode.getSize().width + width) / 2 + 2;
          postY = this.offset.Y;
        }

        let routeNode = this.drawRect(route, null, width, height, postX, postY, '#FFFFFF', '#E2DDFF');
        routeNode.setName(RES_SPEC_INFO[route.resSpecId]);
        routeNode.setStyle('label.font', ROUTE_LABEL_FONT);
        //routeNode.movable = true;

        if (preNode) {
          routeNode.setHost(preNode);
        }
        preNode = routeNode;

        if (route.resSpecId == 'PIPELINE_G') {
          routeNode.setTag('ROUTE_' + route.resId);

          let bridgeWidth = ROUTE_BRIDGE_SIZE.width;
          let bridgeHeight = ROUTE_BRIDGE_SIZE.height;
          let bridgePostX = postX;
          let bridgePostY = postY + bridgeHeight / 2 + ROUTE_LINE_SIZE.height / 2;
          let bridgeData = {
            baseSpecType: 'BRIDGE',
            resId: route.resId,
            resSpecId: route.resSpecId,
            resName: route.resName,
          };
          let bridgeNode = this.drawRect(bridgeData, null, bridgeWidth, bridgeHeight, bridgePostX, bridgePostY, '#E2DDFF', '#E2DDFF');
          bridgeNode.setTag('BRIDGE_' + route.resId);
          bridgeNode.setHost(routeNode);
        } else if (route.resSpecId == 'NULL_LINE') {
          routeNode.setStyle('label', '');
          routeNode.setName('');
          routeNode.setToolTip('');
          routeNode.setStyle('shape.dash', true);
        } else if (route.resSpecId == 'AIR_WIRE') {
          routeNode.setStyle('label', RES_SPEC_INFO[route.resSpecId]);
          routeNode.setStyle('label.scale', 2);
          routeNode.setStyle('label.offset.x', 0);
        } else {
          routeNode.setStyle('label', RES_SPEC_INFO[route.resSpecId]);
          routeNode.setStyle('label.scale', 2);
          routeNode.setStyle('label.offset.x', 0);
          //routeNode.setStyle('label.offset.y', -120);
        }
      });
    },

    //管道组占比
    drawRouteRate(rateData) {
      rateData.forEach((pipeSec) => {
        let pipelineId = pipeSec.pipelineId;
        let routePipelineGroupNode = this.dataModel.getDataByTag('ROUTE_' + pipelineId);
        if (routePipelineGroupNode) {
          let ratePostX = routePipelineGroupNode.getPosition().x;
          let ratePostY = routePipelineGroupNode.getPosition().y - 40;
          let rateDesc = pipeSec.pipeGroupOccupyRate ? pipeSec.pipeGroupOccupyRate : '0.00%';
          let rateVal = 0.0625;
          let groupRate = {
            pipeGrouptRateDesc: rateDesc,
            pipeGroupRateVal: rateVal,
          };
          let rateNode = this.drawRateNode(groupRate, ratePostX, ratePostY);
          rateNode.setTag('ROUTE_RATE_' + pipeSec.pipelineId);
        }
      });
    },

    drawPipelineGroup(pipelineData) {
      pipelineData.forEach((pipelineGroup) => {
        let pipelineId = pipelineGroup.pipelineId;
        let routeBridgeNode = this.dataModel.getDataByTag('BRIDGE_' + pipelineId);
        if (routeBridgeNode) {
          let width = PIPELINE_GROUP_SIZE.width;
          let height = PIPELINE_GROUP_SIZE.height;
          let postX = routeBridgeNode.getPosition().x;
          let postY = routeBridgeNode.getPosition().y + height - ROUTE_BRIDGE_SIZE.height - 30;
          let pipelineGroupNode = this.drawRect(pipelineGroup, null, width, height, postX, postY, '#FFFFFF', '#E2DDFF');

          pipelineGroupNode.setName(pipelineGroup.name);
          pipelineGroupNode.setStyle('label.font', GlobalConst.LABEL_FONT_16);
          pipelineGroupNode.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
          pipelineGroupNode.setStyle('label.offset.y', 10);

          let blockList = pipelineGroup.blockList || [];
          if (blockList.length > 0) {
            this.drawPipelineBlock(blockList, pipelineGroupNode);
          }
        }
      });
    },

    drawPipelineBlock(blockList, pipelineGroupNode) {
      let postX = pipelineGroupNode.getPosition().x;
      let postY = pipelineGroupNode.getPosition().y;
      let size = pipelineGroupNode.getSize();
      let width = pipelineGroupNode.getSize().width;
      let height = pipelineGroupNode.getSize().height;
      let attrGroup = pipelineGroupNode.getAttrObject();
      let cols = attrGroup.colQty || 6;
      let rows = attrGroup.rowQty || 6;
      let layout = attrGroup.layout;
      layout = 'U';
      let count = 0;
      let blockWidth = Math.floor((width - (cols + 1) * 5) / cols);
      let blockHeigh = blockWidth;
      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          let index = (i - 1) * cols + j;
          let blockPostX = postX - (width - blockWidth) / 2 + (j - 1) * blockWidth + j * 5;
          let blockPostY = postY;
          if (layout === 'D') {
            blockPostY = postY - (width - blockWidth) / 2 + (i - 1) * blockWidth + i * 5;
          } else if (layout === 'U') {
            blockPostY = postY + (width - blockWidth) / 2 - (i - 1) * blockWidth - i * 5;
          }

          let pipelineBlockList = blockList.filter((block) => block.colNo === j && block.rowNo === i);
          if (pipelineBlockList.length === 0) {
            let tempBlockList = [];
            tempBlockList.push(blockList[index - 1]);
            pipelineBlockList = tempBlockList;
          }
          if (pipelineBlockList.length > 0) {
            let pipelineBlock = pipelineBlockList[0];
            let sectionalShape = pipelineBlock.sectionalShape || 'S';

            let pipelineBlockNode = null;
            //C:Circular S:Square H:Hexagon
            if (sectionalShape === 'C') {
              pipelineBlockNode = this.drawCircle(
                pipelineBlock,
                pipelineGroupNode,
                blockWidth,
                blockHeigh,
                blockPostX,
                blockPostY,
                '#FFFFFF',
                '#E2DDFF',
              );
            } else if (sectionalShape === 'S') {
              pipelineBlockNode = this.drawRect(
                pipelineBlock,
                pipelineGroupNode,
                blockWidth,
                blockHeigh,
                blockPostX,
                blockPostY,
                '#FFFFFF',
                '#E2DDFF',
              );
            } else if (sectionalShape === 'H') {
              pipelineBlockNode = this.drawHexagon(
                pipelineBlock,
                pipelineGroupNode,
                blockWidth,
                blockHeigh,
                blockPostX,
                blockPostY,
                '#FFFFFF',
                '#E2DDFF',
              );
            }
            pipelineBlockNode.setTag(pipelineBlock.pipeChannelId);
            //pipelineBlockNode.setName(pipelineBlock.nameSeq);

            let holeList = pipelineBlock.holeList || [];

            this.drawPipelineHole(holeList, pipelineBlockNode);
          }
          //count++;
        }
      }
    },

    //画管道孔
    drawPipelineHole(holeList, pipelineBlockNode) {
      let attr = pipelineBlockNode.getAttrObject();
      let blockShapeType = attr.sectionalShape;
      if (blockShapeType === 'C') {
        this.drawPipelineHoleCircle(holeList, pipelineBlockNode);
      } else if (blockShapeType === 'S') {
        this.drawPipelineHoleRect(holeList, pipelineBlockNode);
      } else if (blockShapeType === 'H') {
        this.drawPipelineHoleHexagon(holeList, pipelineBlockNode);
      }
    },

    //画方形管道孔
    drawPipelineHoleRect(holeList, pipelineBlockNode) {
      let postX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
      let postY = pipelineBlockNode.getPosition().y;
      let width = pipelineBlockNode.getSize().width;
      let height = pipelineBlockNode.getSize().height;
      let attr = pipelineBlockNode.getAttrObject();
      //let blockShapeType = attr.sectionalShape;
      let layout = 'U';
      let holeAmout = attr.units;
      let colsQty = Math.sqrt(holeAmout);
      let rowsQty = Math.sqrt(holeAmout);
      let holeWidth = Math.floor((width - (colsQty + 1) * 5) / colsQty);
      //let holeWidth = width/colsQty;
      let holeHeight = holeWidth;
      for (let i = 1; i <= rowsQty; i++) {
        for (let j = 1; j <= colsQty; j++) {
          let index = (i - 1) * colsQty + j;
          let holeX = postX - (width - holeWidth) / 2 + (j - 1) * holeWidth + j * 5;
          let holeY = 0;
          if (layout === 'U') {
            holeY = postY + (height - holeHeight) / 2 - (i - 1) * holeHeight - i * 5;
          } else {
            holeY = postY - (height - holeHeight) / 2 + (i - 1) * holeHeight + i * 5;
          }
          let pipelineHoleList = holeList.filter((hole) => hole.colNo === j && hole.rowNo === i);
          if (pipelineHoleList.length > 0) {
            let pipelineHole = pipelineHoleList[0];
            let shapeType = pipelineHole.sectionalShape;
            let pipelineHoleNode = this.drawRect(pipelineHole, pipelineBlockNode, holeWidth, holeHeight, holeX, holeY, '#FFFFFF', '#E2DDFF');
            pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
            let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
            let toolTip = 'name:' + pipelineHole.name + ';Occupy Rate:' + curOccupyRate;
            pipelineHoleNode.setToolTip(toolTip);
            pipelineHoleNode.setName(pipelineHole.name);
            pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);

            //pipelineHoleNode.movable = true;
            //pipelineHoleNode.setName(index);
            let cableList = pipelineHole.cableList || [];
            if (cableList.length > 0) {
              this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
            }
          }
        }
      }
    },

    //画圆形管道孔
    drawPipelineHoleCircle(holeList, pipelineBlockNode) {
      let posX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
      let posY = pipelineBlockNode.getPosition().y;
      let diameter = pipelineBlockNode.getSize().width;
      let size = diameter;
      let radius = diameter / 2 - CABLE_BORDER_WIDTH;
      let subCount = holeList.length;
      let subRadius = this.calculateSubRadius(subCount, radius);

      //需要调整的偏移值
      let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);

      let i = 0;
      holeList.forEach((pipelineHole) => {
        let x = this.calculatePosX(posX, size / 2, radius, subCount, i, subRadius);
        let y = this.calculatePosY(posY, size / 2, radius, subCount, i, subRadius);

        let holeX = x - postWidth;
        let holeY = y - postWidth;
        let holeWidth = subRadius * 2;
        let holeHeight = subRadius * 2;
        if (subCount === 1) {
          holeWidth = subRadius * 2 - 10;
          holeHeight = subRadius * 2 - 10;
        }
        let pipelineHoleNode = this.drawCircle(pipelineHole, pipelineBlockNode, holeWidth, holeHeight, holeX, holeY, '#FFFFFF', '#E2DDFF');
        pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
        let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
        let toolTip = 'name:' + pipelineHole.name + ';Occupy Rate:' + curOccupyRate;
        pipelineHoleNode.setToolTip(toolTip);
        pipelineHoleNode.setName(pipelineHole.name);
        pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
        pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
        //pipelineHoleNode.setName(pipelineHole.nameSeq);
        //pipelineHoleNode.setToolTip(pipelineHole.nameSeq);
        let cableList = pipelineHole.cableList || [];
        if (cableList.length > 0) {
          this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
        }
        i++;
      });
    },

    //画六边形管道孔
    drawPipelineHoleHexagon(holeList, pipelineBlockNode) {
      let posX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
      let posY = pipelineBlockNode.getPosition().y;
      let width = pipelineBlockNode.getSize().width;
      let subSize = (width * Math.sin(Math.PI / 3)) / 3 - 3;

      let postList = this.getHexagonPosition(posX, posY, subSize);

      let i = 0;
      holeList.forEach((pipelineHole) => {
        if (i < 7) {
          let holeX = postList[i].x;
          let holeY = postList[i].y;
          let pipelineHoleNode = this.drawHexagon(pipelineHole, pipelineBlockNode, subSize, subSize, holeX, holeY, '#FFFFFF', '#E2DDFF');
          pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
          let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
          let toolTip = 'name:' + pipelineHole.name + ';Occupy Rate:' + curOccupyRate;
          pipelineHoleNode.setToolTip(toolTip);
          pipelineHoleNode.setName(pipelineHole.name);
          pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
          pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
          let cableList = pipelineHole.cableList || [];
          if (cableList.length > 0) {
            this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
          }
        }
        i++;
      });
    },

    drawCableAll(cableList, pipelineHoleNode, bgColor, borderColor) {
      let holeAttr = pipelineHoleNode.getAttrObject();
      let posX = pipelineHoleNode.getPosition().x; //parent.getLocation().x;
      let posY = pipelineHoleNode.getPosition().y;
      let diameter = pipelineHoleNode.getSize().width;
      let size = diameter;
      let radius = diameter / 2 - CABLE_BORDER_WIDTH;
      let subCount = cableList.length;
      let subRadius = this.calculateSubRadius(subCount, radius);
      let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);
      let cableI = 0;

      cableList.forEach((cable) => {
        let x = this.calculatePosX(posX, size / 2, radius, subCount, cableI, subRadius);
        let y = this.calculatePosY(posY, size / 2, radius, subCount, cableI, subRadius);

        let cableX = x - postWidth;
        let cableY = y - postWidth;
        let cableWidth = subRadius * 2;
        let cableHeight = subRadius * 2;
        if (subCount === 1) {
          cableWidth = subRadius;
          cableHeight = subRadius;
        }

        cable.pipeChannelId = holeAttr.pipeChannelId;
        cable.pipelineId = holeAttr.pipelineId;

        let cableBgColor = bgColor;
        if (cable.cableId === this.cable.cableId) {
          cableBgColor = 'Green';
        }

        let cableNode = this.drawCircle(cable, pipelineHoleNode, cableWidth, cableHeight, cableX, cableY, cableBgColor, borderColor);
        cableNode.setToolTip(cable.name);
        if (cable.cableId === this.cable.cableId) {
          this.pipeLineGroupSelectHole.push(pipelineHoleNode);
        }
        //cableNode.setTag(cable.cableId);
        // loadTemplateInfo(cable.resSpecId, cable.templateId).then(result => {
        //     if (result) {
        //         cable.diameter = result.diameter;
        //     }
        //     let cableNode = this.drawCircle(cable, pipelineHoleNode, cableWidth, cableHeight, cableX, cableY, cableBgColor, borderColor);
        // });

        cableI++;
      });
    },

    //画光缆
    drawCable(cable, pipelineHole, cableWidth, cableX, cableY, bgColor, borderColor) {
      let cableNode = this.drawCircle(cable, pipelineHole, cableWidth, cableWidth, cableX, cableY, bgColor, borderColor);
      return cableNode;
    },

    calculateSubRadius: function (subCount, radius) {
      let subRadius = radius;
      if (subCount === 1) {
        subRadius = radius;
      } else {
        let a = Math.PI / subCount;
        subRadius = (radius * Math.sin(a)) / (1 + Math.sin(a));
      }
      return subRadius;
    },

    calculatePosX: function (posX, parentRadius, parentRealRadius, subCount, index, subRadius) {
      return posX + parentRadius / 2 + Math.sin(((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
    },

    calculatePosY: function (posY, parentRadius, parentRealRadius, subCount, index, subRadius) {
      return posY + parentRadius / 2 + Math.cos(Math.PI + ((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
    },

    getHexagonPosition(xPos, yPos, subSize) {
      let postList = [];
      for (let i = 0; i < 7; i++) {
        let post = {};
        let x;
        let y;
        if (i == 0) {
          x = xPos - subSize;
          y = yPos - subSize / 2;
        } else if (i == 1) {
          x = xPos - subSize;
          y = yPos + subSize / 2;
        } else if (i == 2) {
          x = xPos;
          y = yPos - subSize;
        } else if (i == 3) {
          x = xPos;
          y = yPos;
        } else if (i == 4) {
          x = xPos;
          y = yPos + subSize;
        } else if (i == 5) {
          x = xPos + subSize;
          y = yPos - subSize / 2;
        } else if (i == 6) {
          x = xPos + subSize;
          y = yPos + subSize / 2;
        }
        post.x = x;
        post.y = y;
        postList.push(post);
      }
      return postList;
    },

    //管道组百分比；
    drawRateNode(data, offsetX, offsetY) {
      let pipeGrouptRateDesc = data.pipeGrouptRateDesc;
      let rateNode = new ht.Node();
      rateNode.setSize(0, 0);
      rateNode.setPosition(offsetX, offsetY);
      rateNode.setName(this.$t('PERCENT') + pipeGrouptRateDesc);
      rateNode.setStyle('shape', 'rect'); //矩形
      rateNode.setStyle('shape.background', '#FFFFFF');
      rateNode.setStyle('shape.border.width', 0);
      rateNode.setStyle('shape.border.color', '#FFFFFF');
      rateNode.setStyle('label.font', ROUTE_LABEL_FONT);
      rateNode.setStyle('label.position', 17);
      rateNode.setAttrObject(data);
      rateNode.setImage('');
      //rateNode.setParent(parent);
      //rateNode.setHost(parent);
      rateNode.movable = false;
      this.dataModel.add(rateNode);

      return rateNode;
    },
    //画方框
    drawRect(data, parent, width, height, posX, posY, bgColor, borderColor) {
      if (!bgColor) {
        bgColor = 'lightgray';
      }
      if (!borderColor) {
        borderColor = 'LightSkyBlue';
      }
      let x = parent ? parent.getPosition().x - parent.getSize().width / 2 + width / 2 + posX : posX;
      let y = parent ? parent.getPosition().y - parent.getSize().height / 2 + height / 2 + posY : posY;

      let routeNode = new ht.Node();
      routeNode.movable = false;
      routeNode.setSize(width, height);
      routeNode.setPosition(posX, posY);
      routeNode.setStyle('shape', 'rect'); //矩形
      routeNode.setStyle('shape.background', bgColor);
      routeNode.setStyle('shape.border.width', 2);
      routeNode.setStyle('shape.border.color', borderColor);
      routeNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      routeNode.setStyle('label.position', 17);
      routeNode.setImage('');
      if (parent) {
        parent.addChild(routeNode);
        //routeNode.setParent(parent);
        routeNode.setHost(parent);
      }

      if (data) {
        routeNode.setAttrObject(data);
      }
      this.dataModel.add(routeNode);
      return routeNode;
    },
    //画圆
    drawCircle(data, parent, width, height, posX, posY, bgColor, borderColor) {
      if (!bgColor) {
        bgColor = 'lightgray';
      }
      if (!borderColor) {
        borderColor = 'LightSkyBlue';
      }

      let node = new ht.Node();
      node.movable = false;
      node.setSize(width, height);
      node.setPosition(posX, posY);
      node.setStyle('shape', 'circle'); //矩形
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.blur', 2);
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shape.background', bgColor);
      node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
      node.setStyle('shape.border.color', borderColor);
      node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      node.setStyle('label.position', 17);
      node.setImage('');
      if (parent) {
        node.setParent(parent);
        //parent.addChild(node);
        node.setHost(parent);
      }

      if (data) {
        node.setAttrObject(data);
      }
      this.dataModel.add(node);
      return node;
    },
    //画六边形
    drawHexagon(data, parent, width, height, posX, posY, bgColor, borderColor) {
      if (!bgColor) {
        bgColor = 'lightgray';
      }
      if (!borderColor) {
        borderColor = 'LightSkyBlue';
      }

      let node = new ht.Node();
      node.movable = false;
      node.setSize(width, height);
      node.setPosition(posX, posY);
      node.setStyle('shape', 'polygon'); //六边形
      node.setStyle('shape.polygon.side', 6);
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.blur', 2);
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shape.background', bgColor);
      node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
      node.setStyle('shape.border.color', borderColor);
      node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
      node.setStyle('label.position', 17);
      node.setImage('');
      if (parent) {
        node.setParent(parent);
        //parent.addChild(node);
        node.setHost(parent);
      }

      if (data) {
        node.setAttrObject(data);
      }
      this.dataModel.add(node);
      return node;
    },

    //修改管道组占有率
    changePipelineGroupRate(node) {
      let attrNode = node.getAttrObject();
      let holeId = attrNode.pipeChannelId;
      let pipelineId = attrNode.pipelineId;
    },

    //将当前管道组中管孔的光缆删除，然后在当前管孔中新增光缆
    selectPipeLineHole(node) {
      //判断管孔是否允许增加光缆
      let addCableResult = this.isAllowAddCable(node);
      let isAllowAdd = addCableResult.isAllow;

      if (isAllowAdd) {
        //删除原有的
        this.clearCrossCablePipelineGroup(node);
        //删除当前管道组里增加的
        this.clearAddCablePipelineGroup(node);
        //如果当前管孔中有光缆
        this.clearPipeLineGroupSelectHole(node);

        let cablePost = this.dealHoleChildPosition(node);

        //新增光缆
        let cableWidth = cablePost.width;
        let cableX = cablePost.postX;
        let cableY = cablePost.postY;
        let cable = this.cable;
        cable.baseSpecType = 'AUTO_ADD';
        cable.resSpecId = 'F_CABLE';
        let cableNode = this.drawCable(cable, node, cableWidth, cableX, cableY, 'green', '#E2DDFF');
        this.pipeLineGroupSelectHole.push(node);
        //计算管道组的实时占有率
        this.changePipelineGroupRate(node);
      } else {
        //fish.toast('info',addCableResult.msg);

        fish.warn(addCableResult.msg);
      }
    },

    //maxCableQty : 1或0， 0代表不限制
    // 为1时，只允许一根光缆，有一根光缆，则占有率为100%；
    // 为0时，就按照截面积来算；
    //增加从配置里判断是否需要判断管孔的面积占比 edn_sprint_settings PARAM_NO ='HOLE_OCCUPY_CHECKING';
    isAllowAddCable(node) {
      let isAllow = true;
      let msg = '';
      let attrNode = node.getAttrObject();
      let maxCableQty = attrNode.maxCableQty || 0;
      if (this.checkFlag === 'Y') {
        let holeArea = attrNode.pipeHoleArea; //当前管孔面积
        // let curOccupyRateShow = attrNode.curOccupyRateShow;
        // let curOccupyRate = parseFloat(curOccupyRateShow.substring(0, curOccupyRateShow.length-1)); //当前管道占有率
        let curOccupyRate = attrNode.curOccupyRate;
        let curCableDiameter = this.cable.diameter;
        let curCableArea = this.getCircleArea(curCableDiameter); //当前光缆面积

        let cableRate = curCableArea / holeArea;

        let allCableArea = curOccupyRate + cableRate;

        if (allCableArea > this.maxRate) {
          isAllow = false;
          msg = this.$t('MSG_LARGEAREA');
        }
      } else {
        if (maxCableQty === 1) {
          let childList = node.getChildren()._as;
          if (childList.length >= maxCableQty) {
            isAllow = false;
            msg = this.$t('MSG_MAXNUM');
          }
        }
      }
      // if (maxCableQty===1) {
      //     let childList = node.getChildren()._as;
      //     if (childList.length >= maxCableQty) {
      //         isAllow = false;
      //         msg = this.$t('MSG_MAXNUM');
      //     }
      // }
      // else {

      //     let holeArea = attrNode.pipeHoleArea;   //当前管孔面积
      //     // let curOccupyRateShow = attrNode.curOccupyRateShow;
      //     // let curOccupyRate = parseFloat(curOccupyRateShow.substring(0, curOccupyRateShow.length-1)); //当前管道占有率
      //     let curOccupyRate = attrNode.curOccupyRate;
      //     let curCableDiameter = this.cable.diameter;
      //     let curCableArea = this.getCircleArea(curCableDiameter);    //当前光缆面积

      //     let cableRate = curCableArea/holeArea;

      //     let allCableArea = curOccupyRate + cableRate;

      //     if (allCableArea > this.maxRate) {
      //         isAllow = false;
      //         msg = this.$t('MSG_LARGEAREA');
      //     }
      // }
      return { isAllow, msg };
    },
    //maxCableQty : 1或0， 0代表不限制
    // 为1时，只允许一根光缆，有一根光缆，则占有率为100%；
    // 为0时，就按照截面积来算；
    isAllowAddCable_bak(node) {
      let isAllow = true;
      let msg = '';
      let attrNode = node.getAttrObject();
      let maxCableQty = attrNode.maxCableQty || 0;
      if (maxCableQty === 1) {
        let childList = node.getChildren()._as;
        if (childList.length >= maxCableQty) {
          isAllow = false;
          msg = this.$t('MSG_MAXNUM');
        }
      } else {
        let holeArea = attrNode.pipeHoleArea; //当前管孔面积
        // let curOccupyRateShow = attrNode.curOccupyRateShow;
        // let curOccupyRate = parseFloat(curOccupyRateShow.substring(0, curOccupyRateShow.length-1)); //当前管道占有率
        let curOccupyRate = attrNode.curOccupyRate;
        let curCableDiameter = this.cable.diameter;
        let curCableArea = this.getCircleArea(curCableDiameter); //当前光缆面积

        let cableRate = curCableArea / holeArea;

        let allCableArea = curOccupyRate + cableRate;

        if (allCableArea > this.maxRate) {
          isAllow = false;
          msg = this.$t('MSG_LARGEAREA');
        }
      }
      return { isAllow, msg };
    },
    //删除管孔同一个管道组下的
    clearCrossCablePipelineGroup(node) {
      let attrNode = node.getAttrObject();
      let holeId = attrNode.pipeChannelId;
      let nodeList = this.dataModel.getDatas()._as;
      for (let i = nodeList.length - 1; i >= 0; i--) {
        let elem = nodeList[i];
        let attr = elem.getAttrObject();
        if (!attr) continue;
        if (typeof attr.resSpecId === 'undefined') {
          continue;
        }
        if (attr.resSpecId === 'F_CABLE') {
          if (attr.pipelineId === attrNode.pipelineId && attr.cableId === this.cable.cableId) {
            this.dataModel.remove(elem);
          }
        }
      }
    },
    clearAddCablePipelineGroup(node) {
      let attrNode = node.getAttrObject();
      let holeId = attrNode.pipeChannelId;
      let nodeList = this.dataModel.getDatas()._as;
      for (let i = nodeList.length - 1; i >= 0; i--) {
        let elem = nodeList[i];
        let attr = elem.getAttrObject();
        if (!attr) continue;
        if (typeof attr.baseSpecType === 'undefined') {
          continue;
        }
        if (attr.baseSpecType === 'AUTO_ADD') {
          let parent = elem.getParent();
          if (parent.getAttrObject().pipelineId === attrNode.pipelineId) {
            this.dataModel.remove(elem);
          }
        }
      }
    },

    //已选中的管孔数据；
    clearPipeLineGroupSelectHole(node) {
      let nodeObject = node.getAttrObject();
      let selIndex = -1;
      for (let i = this.pipeLineGroupSelectHole.length - 1; i >= 0; i--) {
        let elem = this.pipeLineGroupSelectHole[i];
        let attr = elem.getAttrObject();
        if (!attr) continue;
        if (attr.pipelineId === nodeObject.pipelineId) {
          selIndex = i;
          break;
        }
      }
      if (selIndex > -1) {
        this.pipeLineGroupSelectHole.splice(selIndex, 1);
      }
    },

    clearChildrenHoleNode(node) {},

    getCircleArea(diameter) {
      let circleArea = 0;
      let radius = diameter / 2;
      circleArea = 3.14 * (radius * radius);
      return circleArea;
    },

    //查找光缆对应的管孔节点
    getPipelineHole(pipeChannelId) {
      let hole = this.dataModel.getDataByTag(pipeChannelId);
      return hole;
    },

    dealHoleChildPosition(node) {
      let cableWidth = 15;
      let cableX = 0;
      let cableY = 0;
      let childList = node.getChildren()._as;
      let cablePostList = [];
      let childCount = childList.length;
      childCount++;
      cablePostList = this.getCableAttrInHole(node, childCount);
      if (childList.length > 0) {
        for (let i = 0; i < childList.length; i++) {
          let child = childList[i];
          child.setPosition(cablePostList[i].x, cablePostList[i].y);
          child.setSize(cablePostList[i].width, cablePostList[i].height);
        }
        cableWidth = cablePostList[childCount - 1].width;
        cableX = cablePostList[childCount - 1].x;
        cableY = cablePostList[childCount - 1].y;
      } else {
        cableWidth = cablePostList[0].width;
        cableX = cablePostList[0].x;
        cableY = cablePostList[0].y;
      }
      let addCablePosition = {
        postX: cableX,
        postY: cableY,
        width: cableWidth,
        height: cableWidth,
      };
      return addCablePosition;
    },

    //管孔中光缆的位置及大小属性；
    getCableAttrInHole(holeNode, n) {
      let postList = [];
      let posX = holeNode.getPosition().x; //parent.getLocation().x;
      let posY = holeNode.getPosition().y;
      let diameter = holeNode.getSize().width;
      let size = diameter;
      let radius = diameter / 2 - CABLE_BORDER_WIDTH;
      let subCount = n;
      let subRadius = this.calculateSubRadius(subCount, radius);
      let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);
      let cableI = 0;
      for (let i = 0; i < n; i++) {
        let post = {};
        let x = this.calculatePosX(posX, size / 2, radius, subCount, i, subRadius);
        let y = this.calculatePosY(posY, size / 2, radius, subCount, i, subRadius);

        let cableX = x - postWidth;
        let cableY = y - postWidth;
        let cableWidth = subRadius * 2;
        let cableHeight = subRadius * 2;
        if (subCount === 1) {
          cableWidth = subRadius;
          cableHeight = subRadius;
        }
        post.x = cableX;
        post.y = cableY;
        post.width = Math.ceil(cableWidth);
        post.height = Math.ceil(cableHeight);

        postList.push(post);
      }

      return postList;
    },

    //增加自动穿缆节点；
    addAutoRuleCable(datas) {
      datas.forEach((data) => {
        //查找光缆对应的管孔
        let pipelineHole = this.getPipelineHole(data.pipeChannelId);
        if (pipelineHole) {
          let cable = this.cable;
          let cablePost = this.dealHoleChildPosition(pipelineHole);
          let cableWidth = cablePost.width;
          //cable.NODE_TYPE = "AUTO_RULE_NODE";
          cable.baseSpecType = 'AUTO_ADD';
          let cableX = cablePost.postX;
          let cableY = cablePost.postY;
          let cableNode = this.drawCable(cable, pipelineHole, cableWidth, cableX, cableY, 'green', '#E2DDFF');
          this.pipeLineGroupSelectHole.push(pipelineHole);
        }
      });
    },

    //上层组件点击Apply按钮时，将查询的管孔
    autoPipeHoleCableApply(data) {
      this.clearAutoRuleCable();
      this.clearOldCable();
      let holeList = data.holeList || [];
      this.addAutoRuleCable(holeList);

      let failMsg = data.queryFailDesc || '';
      if (failMsg) {
        fish.warn(failMsg);
      }
    },

    //清除上一个自动穿缆规则加载的内容；
    clearAutoRuleCable() {
      this.pipeLineGroupSelectHole = [];
      let nodeList = this.dataModel.getDatas()._as;
      for (let i = nodeList.length - 1; i >= 0; i--) {
        let elem = nodeList[i];
        let attr = elem.getAttrObject();
        if (!attr) continue;
        if (typeof attr.baseSpecType === 'undefined') {
          continue;
        }
        if (attr.baseSpecType === 'AUTO_ADD') {
          this.dataModel.remove(elem);
        }
      }
    },

    //清除原有的穿缆数据
    clearOldCable() {
      let nodeList = this.dataModel.getDatas()._as;
      for (let i = nodeList.length - 1; i >= 0; i--) {
        let elem = nodeList[i];
        let attr = elem.getAttrObject();
        if (!attr) continue;

        if (attr.resSpecId === 'F_CABLE') {
          if (attr.cableId === this.cable.cableId && attr.baseSpecType != 'AUTO_ADD') {
            this.dataModel.remove(elem);
          }
        }
      }
    },

    getSelectPipelineHole() {
      return this.pipeLineGroupSelectHole;
    },
    setSelectPipelineHole() {
      this.pipeLineGroupSelectHole = [];
      this.clearAutoRuleCable();
    },

    clickNode(node) {
      if (node) {
        console.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.info(node);
        //this.$emit('click-node', node);
        //如果选择是管孔时，往管孔中插入光缆
        let attr = node.getAttrObject();
        if (attr) {
          let resSpecId = attr.resSpecId;
          if (resSpecId === 'PIPELINE') {
            this.selectPipeLineHole(node);
          }
        }
      }
    },

    moveOutCable(node) {
      fish.confirm(this.$t('MAKE_SURE_REMOVE_CABLE_INHOLE'), () => {
        let parentNode = node.getParent();
        console.info(parentNode);
        let pResSpecId = parentNode.getAttr('resSpecId');
        let holeId = '';
        if (pResSpecId === 'PIPELINE') {
          holeId = parentNode.getAttr('pipeChannelId');
        }
        let cableId = node.getAttr('cableId') || node.getAttr('resId');
        let paramList = [];
        let param = {
          holeId: parentNode.getAttr('pipeChannelId'),
          cableId: cableId,
          sprintId: this.params.sprintId,
        };
        paramList.push(param);

        let baseSpecType = node.getAttr('baseSpecType');
        if (baseSpecType) {
          this.dataModel.remove(node);
          this.clearPipeLineGroupSelectHole(parentNode);
        } else {
          removeCableInPipeline(paramList).then((data) => {
            this.dataModel.remove(node);
            this.clearPipeLineGroupSelectHole(parentNode);
          });
        }
      });
    },

    initMenus(selectedDatas) {
      let menus = [];
      if (selectedDatas.size() === 1) {
        let data = selectedDatas._as[0];
        //let baseSpecId = data.getAttr('baseSpecType');
        let resSpecId = data.getAttr('resSpecId');
        if (resSpecId === 'F_CABLE') {
          menus.push({
            label: this.$t('BTN_MOVEOUT_CABLE'),
            visible: true,
            action: () => {
              this.moveOutCable(data);
            },
          });
        }
      }
      return menus;
    },

    toolbarClick(eventName) {
      if (eventName === 'refresh') {
        this.loadTopo();
      }
    },
  },
};
</script>

<style>
@import '../topo-template/scss/topoTemplate.scss';
</style>