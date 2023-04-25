<template>
  <div class="topo-content">
    <TopoView
      ref="deviceDesignTopo"
      :toolButtons="toolButtons"
      :show-toolbar="true"
      :graphView="graphView"
      :menu-source="initMenus"
      @click-toolbar="toolbarClick"
      :portCloseCallBack="closeDrawer"
    ></TopoView>
    <CreateLink ref="createLink" @refreshEvent="refreshAfterCreateLink"></CreateLink>
    <SelectDevice :schemaId="schemaId" :params="params" ref="selectDevice" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></SelectDevice>
    <CreateHardware ref="createHardware" @refreshEvent="doAfterAddHW" @refreshClose="doAfterCloseHw"></CreateHardware>

    <setting ref="setting" @settingOK="settingOK"></setting>
  </div>
</template>
<script>
import TopoView from '../topo-template/TopoView.vue';
import CreateLink from '../../osp/topo-control/device_design/createlink.vue';
import SelectDevice from '../../osp/topo-control/device_design/selectDevice.vue';
import CreateHardware from '../../osp/topo-control/device_design/createHardware.vue';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { getDefaultCoreFillColor, getConnectedCoreFillColor, drawPortOnHwGraphics, drawDeviceGraphics, drawCableGraphics } from './DrawTools';
import { queryDesignResInfo, deleteHardware, autoLink } from '../TopoHandleAction.js';
import { deleteGraphic } from '../../../edesign/osp/domain/ResEventHandler.js';
import { checkAddHardware } from '@/oss_core/edesign/api/add/resources.js';
import setting from '../../osp/sidebar/autoLLD/setting/autoLLDsetting.vue';
import { saveTopo, loadTopoData } from '../TopoUtil';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 1;
const LAYERS = [LAYER0, LAYER1, LAYER2];

export default {
  name: 'DeviceDesignTopo',
  components: {
    TopoView,
    CreateLink,
    CreateHardware,
    SelectDevice,
    setting,
  },
  props: {
    params: Object,
    topoResInfo: {
      type: Object,
      default: () => {
        return {
          projectId: '',
          schemaId: '',
          mode: '',
          deviceList: [],
          cableList: [],
        };
      },
    },
  },
  data() {
    return {
      dataModel: null,
      graphView: this.graphView,
      toolButtons: [
        {
          id: 'save',
          name: 'Save',
          image: 'oss_core/edesign/assets/image/topo-tool-bar/save.png',
          title: 'Save',
          event: 'save',
        },
      ],
      mode: '',
      resourceList: [],
      portId: '',
      schemaId: '',
      deviceInfo: null,
      deviceList: [],
      cableList: [],
      nodeInfo: null,
      isReferenced: false,
      refType: '', //refType  R 引用过来的； U利旧过来的； N或者为空  自建的
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
    this.graphView.setEditable(true);
    this.graphView.setEditableFunc(function(data) {
      if (data instanceof ht.Edge) {
        return true;
      } else {
        return false;
      }
    });

    this.graphView.addInteractorListener(e => {
      if (e.kind === 'hover' && e.event.type === 'mousemove') {
        // this.showPortPanel(e);
      }

      if (e.event.button == 0 && e.kind === 'clickData' && e.data) {
        this.highlightLink(e.data);
        this.showPortPanel(e.data);
      }
      if (e.kind === 'clickBackground') {
        this.closeDrawer();
      }
    });

    this.graphView.getView().addEventListener('mousemove', e => {
      this.mousePoint = this.graphView.lp(e);
    });

    // 鼠标右键屏蔽浏览器默认菜单
    this.graphView.getView().addEventListener('mousedown', e => {
      if (e.button === 2) {
        document.oncontextmenu = () => {
          return false;
        };
      }
    });
    // let values = [50, 50];
    // let colors = ['#FFFFFF', '#666666'];

    // ht.Default.setImage('port', {
    //     width: 200,
    //     height: 200,
    //     comps: [
    //         {
    //             type: 'pieChart',
    //             rect: [5, 5, 190, 190],
    //             labelColor: 'white',
    //             shadow: true,
    //             startAngle: Math.PI / 2,
    //             shadowColor: 'rgba(0, 0, 0, 0.5)',
    //             values: values,
    //             colors: colors,
    //         },
    //     ],
    // });
  },
  mounted() {
    this.screenHeight = window.screen.availHeight;
    this.screenWidth = window.screen.availWidth;
    this.loadTopo();
  },
  methods: {
    // loadDemo() {
    //     let port = new ht.Node();
    //     let portData = { id: '1', name: '1', seq: '1' };
    //     port.movable = true;
    //     port.setAttrObject(portData);
    //     //port.setName("1");
    //     port.setPosition(620, 120);
    //     port.setSize(24, 24);
    //     port.setImage('port');
    //     port.setStyle('image.stretch', 'uniform');
    //     this.dataModel.add(port);
    // },

    initData() {
      if (this.topoResInfo) {
        if (this.dataModel) {
          this.dataModel.clear();
        }
        this.deviceList = this.topoResInfo.deviceList || [];
        this.cableList = this.topoResInfo.cableList || [];
        this.mode = this.topoResInfo.mode;
        this.schemaId = this.topoResInfo.schemaId;
        this.projectId = this.topoResInfo.projectId;
        this.isReferenced = false;
        if (this.deviceList.length > 0) {
          this.deviceInfo = this.deviceList[0];
          this.isReferenced = this.deviceInfo.isReferenced;
          let resType = this.deviceInfo.resSpecId;
          if (resType === 'OLT') {
            this.toolButtons = this.toolButtons.filter(res => res.id !== 'AUTOLINK') || [];
            this.toolButtons.push({
              id: 'AUTOLINK',
              name: 'Auto Link',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/calculate.png',
              title: 'Auto Connection',
              event: 'AUTOLINK',
            });
          } else {
            this.toolButtons = this.toolButtons.filter(res => res.id !== 'AUTOLINK') || [];
          }
          let resId = this.deviceInfo.resId;
          let param = {
            resType: this.deviceInfo.resSpecId,
            resId: this.deviceInfo.resId,
            schemaId: this.schemaId,
          };
          if (resType && resId) {
            queryDesignResInfo(param).then(data => {
              if (data) {
                //if (data.resultList && data.resultList.length != 0) {
                this.deviceInfo.latitude = data.latitude;
                this.deviceInfo.longitude = data.longitude;
                this.deviceInfo.templateId = data.templateId;
                this.deviceInfo.areaId = data.areaId || '';
                this.deviceInfo.areaIdDesc = data.areaIdDesc || '';
                this.deviceInfo.designOrdId = data.designOrdId || '';
                this.deviceInfo.refType = data.refType || '';
                //}
              }
            });
          }
        }
      } else {
        this.deviceList = [];
        this.cableList = [];
      }
    },
    loadTopo() {
      this.initData();
      if (this.deviceList.length === 0 || !this.dataModel) {
        return;
      }
      if (!this.deviceList[0].resId) {
        return;
      }
      this.graphView.setZoom(1);
      this.graphView.setTranslateX(0);
      this.graphView.setTranslateY(0);

      let startX = 50;
      let startY = 50;
      //this.mode = this.deviceInfo.mode || "D";
      let cableSize = 320;
      let space = 320;

      let promises = [];

      if (this.mode === 'D') {
        // 设备内部设计
        let deviceId = this.deviceList[0].resId; //'201211182327394400';
        this.topoId = 'DD_TOPO_' + this.schemaId + this.mode + deviceId;
        // 过滤掉站点
        if (this.deviceList[0].resSpecId !== 'SITE') {
          promises.push(drawDeviceGraphics(this.schemaId, deviceId, this.dataModel, startX, startY, 0));
        }
      } else if (this.mode === 'DD') {
        // 两个设备跳接
        let aDeviceId = this.deviceList[0].resId; //'201211182327394400';
        let zDeviceId = this.deviceList[1].resId; //'201211182227393650';
        this.topoId = 'DD_TOPO_' + this.schemaId + this.mode + aDeviceId + zDeviceId;
        promises.push(drawDeviceGraphics(this.schemaId, aDeviceId, this.dataModel, startX, startY, 0));
        promises.push(drawDeviceGraphics(this.schemaId, zDeviceId, this.dataModel, 0, 0, 0));
      } else if (this.mode === 'PC') {
        // 成端
        let deviceId = this.deviceList[0].resId; //'201211182327394400';
        let cableId = this.cableList[0].resId; //'201211191927399030';
        this.topoId = 'DD_TOPO_' + this.schemaId + this.mode + deviceId + cableId;
        promises.push(drawDeviceGraphics(this.schemaId, deviceId, this.dataModel, startX, startY, 0));
        promises.push(drawCableGraphics(this.schemaId, cableId, deviceId, this.dataModel, 0, 0, cableSize));
      } else if (this.mode === 'CC') {
        // 熔接
        let deviceId = this.deviceList[0].resId;
        let aCableId = this.cableList[0].resId; //'201211191927399030';
        let zCableId = this.cableList[1].resId; //'201211182627395680';
        this.topoId = 'DD_TOPO_' + this.schemaId + this.mode + deviceId + aCableId + zCableId;
        promises.push(drawCableGraphics(this.schemaId, aCableId, deviceId, this.dataModel, startX, startY, cableSize));
        promises.push(drawCableGraphics(this.schemaId, zCableId, deviceId, this.dataModel, 0, 0, cableSize));
      }

      promises.push(loadTopoData(this.topoId));

      Promise.all(promises).then(results => {
        if (this.mode !== 'D' && results.length > 2) {
          let leftNodes = results[0];
          let rightNodes = results[1];

          let maxX = 0;
          leftNodes.forEach(node => {
            if (maxX < node.getPosition().x + node.getSize().width / 2) {
              maxX = node.getPosition().x + node.getSize().width / 2;
            }
          });

          rightNodes.forEach(node => {
            node.setPosition(maxX + space + node.getSize().width / 2, startY + node.getPosition().y);
          });
        }

        // if (this.mode === 'D' || this.mode === 'DD' || this.mode === 'PC') {
        //     let deviceNodes = results[0];
        //     this.refType = deviceNodes[0].getAttrObject().refType || '';
        // }

        if (this.mode === 'CC') {
          // 熔接
          let deviceId = this.deviceList[0].resId; //'201211182327394400';
          let resType = this.deviceList[0].resSpecId;
          this.loadInstLink(deviceId, resType);
        } else {
          let deviceIds = [];
          this.dataModel.getDatas().each(node => {
            let deviceId = node.getAttrObject().deviceId;
            let resType = node.getAttrObject().resSpecId;
            let deviceObj = {
              resId: deviceId,
              resType: resType,
            };
            if (deviceId && deviceIds.indexOf(deviceId) == -1) {
              deviceIds.push(deviceId);
            }
          });

          deviceIds.forEach(deviceId => {
            let node = this.dataModel.getDataByTag(deviceId);
            if (node) {
              let resType = node.getAttrObject().resSpecId;
              this.loadInstLink(deviceId, resType);
            }
          });
        }

        let topodata = results[2];
        if (topodata) {
          this.dataModel.getDatas().each(data => {
            if (data instanceof ht.Node && (data.getAttrObject().baseSpecId == 'CABLE' || data.getAttrObject().baseSpecId == 'DEVICE')) {
              let resId = data.getAttrObject().deviceId || data.getAttrObject().cableId;
              if (topodata[resId]) {
                data.setPosition(topodata[resId].x, topodata[resId].y);
              }
            } else if (data instanceof ht.Edge) {
              let linkId = data.getAttrObject().linkId || data.getAttrObject().terminationId || data.getAttrObject().splicingId;
              if (topodata[linkId] && topodata[linkId].POINTS) {
                data.setStyle('edge.points', topodata[linkId].POINTS || []);
              }
            }
          });
        }

        this.dataModel.getDatas().each(data => {
          if (data.getAttrObject().deviceId === this.deviceInfo.resId && data.getAttrObject().baseSpecId == 'DEVICE') {
            this.showPortPanel(data);
          }
        });
      });
    },

    // modify by wanjf 2021-9-9 修改url
    loadInstLink(deviceId, resType) {
      let actionType = 'VIEW';
      let params = {
        resType: resType,
        resId: deviceId,
      };
      fish.get({
        // url: `edesign/rivt/device/query/${deviceId}/linklist/v1`,
        url: `edesign/device/linklist/v1`,
        data: params,
        success: result => {
          let jumpLinks = result.jump;
          this.pointList = [];
          this.loadJumpLinks(jumpLinks, actionType);

          let termLinks = result.portCblunitList;
          this.loadTermLinks(termLinks, actionType);

          let spliceLinks = result.cblunitCblunitList;
          this.loadSpliceLinks(spliceLinks, actionType);
        },
        error: e => {},
      });
    },
    //微调线转折点的位置，达到线不重叠的目的
    dealPointPosition: function(points) {
      let positionOffset = 5;
      points.forEach(pointInfo => {
        //判断在x和y方向上是否和其它线重叠
        this.pointList.forEach(existPoint => {
          if (pointInfo.x == existPoint.x) {
            //x方向上重叠
            pointInfo.x = existPoint.x + positionOffset;
          }
          if (pointInfo.y == existPoint.y) {
            //y方向上重叠
            pointInfo.y = existPoint.y - positionOffset;
          }
        });
      });
      this.pointList = this.pointList.concat(points);
      console.log(this.pointList);
      console.log(points);
      return points;
    },

    loadJumpLinks: function(jumpLinks, actionType) {
      let elements = [];
      jumpLinks.forEach(data => {
        let linkId = data.linkId;
        let aPortId = data.aPortId;
        let zPortId = data.zPortId;
        let isExists = this.findElement('LINK', 'linkId', linkId);
        if (isExists) {
          return false;
        }

        let aPortNode = this.findElement('PORT', 'portId', aPortId);
        let zPortNode = this.findElement('PORT', 'portId', zPortId);

        if (aPortNode != null) {
          this.setPortLinkCountTip(aPortNode);
        }

        if (zPortNode != null) {
          this.setPortLinkCountTip(zPortNode);
        }

        if (aPortNode != null && zPortNode != null) {
          let edge = new ht.Edge();
          edge.setSource(aPortNode);
          edge.setTarget(zPortNode);
          edge.setStyle('edge.width', 1);
          if (actionType === 'CREATE') {
            edge.setStyle('edge.color', 'red');
          } else {
            edge.setStyle('edge.color', 'blue');
          }
          edge.setStyle('edge.type', 'points');
          let points;
          if (aPortNode.getPosition().y === zPortNode.getPosition().y) {
            points = [
              {
                x: aPortNode.getPosition().x,
                y: aPortNode.getPosition().y + aPortNode.getSize().height / 2 + 2,
              },
              {
                x: zPortNode.getPosition().x,
                y: zPortNode.getPosition().y + zPortNode.getSize().height / 2 + 2,
              },
            ];
          } else {
            points = [
              {
                x: aPortNode.getPosition().x,
                y: aPortNode.getPosition().y + aPortNode.getSize().height / 2 + 2,
              },
              {
                x: aPortNode.getPosition().x - aPortNode.getSize().width / 2 - 2,
                y: aPortNode.getPosition().y + aPortNode.getSize().height / 2 + 2,
              },
              {
                x: aPortNode.getPosition().x - aPortNode.getSize().width / 2 - 2,
                y: zPortNode.getPosition().y + zPortNode.getSize().height / 2 + 2,
              },
              {
                x: zPortNode.getPosition().x,
                y: zPortNode.getPosition().y + zPortNode.getSize().height / 2 + 2,
              },
            ];
          }
          edge.setStyle('edge.points', points);
          edge.setStyle('edge.group', 'J');
          edge.setStyle('edge.gap', 5);
          edge.setStyle('edge.offset', 6);
          //edge.setStyle('edge.extend', 8);
          edge.setStyle('select.color', 'red');
          edge.setStyle('select.width', 1);
          edge.setLayer(LAYER1);
          data.baseSpecId = 'LINK';
          edge.setAttrObject(data);
          this.dataModel.add(edge);
          console.log(edge);
          if (actionType === 'CREATE') {
            elements.push(aPortNode);
            elements.push(edge);
            elements.push(zPortNode);
          }
        }
      });
      this.dataModel.getSelectionModel().appendSelection(elements);
    },

    loadTermLinks: function(termLinks, actionType) {
      let elements = [];
      termLinks.forEach(data => {
        let linkId = data.terminationId;
        let portId = data.portId;
        let unitId = data.unitId;
        let isExists = this.findElement('LINK', 'terminationId', linkId);
        if (isExists) {
          return false;
        }

        let aNode = this.findElement('PORT', 'portId', portId);
        let zNode = this.findElement('CABLE_UNIT', 'unitId', unitId);
        let cableNode = this.findElement('CABLE', 'cableId', data.cableId);

        if (aNode != null) {
          this.setPortLinkCountTip(aNode);
        }

        if (zNode != null) {
          zNode.setStyle('shape.background', getConnectedCoreFillColor());
        }

        if (aNode != null && zNode != null) {
          let edge = new ht.Edge();
          edge.setSource(aNode);
          edge.setTarget(zNode);
          //let edgeType = 'extend.west';
          edge.setStyle('edge.width', 1);
          if (actionType === 'CREATE') {
            edge.setStyle('edge.color', 'red');
          } else {
            edge.setStyle('edge.color', 'blue');
          }
          edge.setStyle('edge.type', 'points');
          let points = [
            {
              x: aNode.getPosition().x,
              y: aNode.getPosition().y - aNode.getSize().height / 2 - 2,
            },
            {
              x: cableNode.getPosition().x - cableNode.getSize().width / 2 - 100,
              //x: zNode.getPosition().x - 200,
              y: aNode.getPosition().y - aNode.getSize().height / 2 - 2,
            },
            {
              x: cableNode.getPosition().x - cableNode.getSize().width / 2 - 100,
              y: zNode.getPosition().y,
            },
          ];
          edge.setStyle('edge.points', points);

          edge.setStyle('edge.group', 'T');
          edge.setStyle('edge.gap', 5);
          edge.setStyle('edge.offset', 6);
          //edge.setStyle('edge.extend', 8);
          edge.setStyle('select.color', 'red');
          edge.setStyle('select.width', 1);
          edge.setLayer(LAYER1);
          data.baseSpecId = 'LINK';
          edge.setAttrObject(data);
          this.dataModel.add(edge);
          if (actionType === 'CREATE') {
            elements.push(aNode);
            elements.push(edge);
            elements.push(zNode);
          }
        }
      });
      this.dataModel.getSelectionModel().appendSelection(elements);
    },

    loadSpliceLinks: function(spliceLinks, actionType) {
      let elements = [];
      spliceLinks.forEach(data => {
        let linkId = data.splicingId;
        let isExists = this.findElement('LINK', 'splicingId', linkId);
        if (isExists) {
          return false;
        }

        let spliceType = data.spliceType;
        if (spliceType === 'D') {
          return false;
        }

        let aUnitNode = this.findElement('CABLE_UNIT', 'unitId', data.aUnitId);
        let zUnitNode = this.findElement('CABLE_UNIT', 'unitId', data.zUnitId);

        if (aUnitNode != null) {
          aUnitNode.setStyle('shape.background', getConnectedCoreFillColor());
        }

        if (zUnitNode != null) {
          zUnitNode.setStyle('shape.background', getConnectedCoreFillColor());
        }
        if (aUnitNode != null && zUnitNode != null) {
          let edge = new ht.Edge();
          edge.setSource(aUnitNode);
          edge.setTarget(zUnitNode);
          edge.setStyle('edge.width', 1);
          if (actionType === 'CREATE') {
            edge.setStyle('edge.color', 'red');
          } else {
            edge.setStyle('edge.color', 'blue');
          }
          edge.setStyle('edge.type', 'ortho2');
          edge.setStyle('edge.center', true);
          // let points = [
          //     {
          //         x: cableNode.getPosition().x + cableNode.getSize().width / 2 + 100,
          //         y: aUnitNode.getPosition.y
          //     },
          //     {
          //         x: cableNode.getPosition().x + cableNode.getSize().width / 2 + 100,
          //         y: zUnitNode.getPosition.y
          //     }
          // ];
          // edge.setStyle('edge.points', points);

          // edge.setStyle("edge.group", 'S');
          // edge.setStyle('edge.gap', 5);
          edge.setStyle('edge.offset', 10);
          edge.setStyle('select.color', 'red');
          edge.setStyle('select.width', 1);
          edge.setLayer(LAYER1);
          data.baseSpecId = 'LINK';
          edge.setAttrObject(data);
          this.dataModel.add(edge);
          if (actionType === 'CREATE') {
            elements.push(aUnitNode);
            elements.push(edge);
            elements.push(zUnitNode);
          }
        }
      });
      this.dataModel.getSelectionModel().appendSelection(elements);
    },

    setPortLinkCountTip: function(node, mode) {
      mode = !mode ? 'increase' : mode;
      let currCount = node.getAttrObject().linkCount;
      if ('increase' === mode) {
        currCount = currCount ? currCount + 1 : 1;
      } else {
        currCount = currCount ? currCount - 1 : -1;
      }

      if (currCount > 0) {
        node.setStyle('label2', currCount);
        node.setStyle('label2.position', 8);
        node.setStyle('label2.font', '10px Tahoma');
        node.setStyle('label2.color', 'red');
        node.setStyle('label2.offset.x', -2);
        node.setStyle('label2.offset.y', 2);
        node.getAttrObject().linkCount = currCount;
      } else {
        node.setStyle('label2', '');
        node.getAttrObject().linkCount = null;
      }

      if (currCount === 1) {
        node.setStyle('shape.background', 'grey');
        node.setStyle('shape.gradient', 'spread.horizontal');
      } else if (currCount > 1) {
        node.setStyle('shape.background', 'grey');
        node.setStyle('shape.gradient', '');
      } else {
        node.setStyle('shape.background', '#e8f3ff');
        node.setStyle('shape.gradient', '');
      }

      //let currCount = node.getAttrObject().linkCount ? node.getAttrObject().linkCount + 1 : 1;
      // node.setStyle('label2', currCount);
      // node.setStyle('label2.position', 8);
      // node.setStyle('label2.font', '10px Tahoma');
      // node.setStyle('label2.color', 'red');
      // node.setStyle('label2.offset.x', -2);
      // node.setStyle('label2.offset.y', 2);
      // node.getAttrObject().linkCount = currCount;
    },

    highlightLink: function(current) {
      if (current.getAttrObject() && (current.getAttrObject().baseSpecId === 'PORT' || current.getAttrObject().baseSpecId === 'CABLE_UNIT')) {
        let elements = [];
        this.dataModel.getDatas().each(data => {
          let attrObject = data.getAttrObject();
          if (attrObject.baseSpecId === 'LINK' && (data.getSource() === current || data.getTarget() === current)) {
            elements.push(data);
            //elements.push(data.getSource());
            //elements.push(data.getTarget());
          }
        });
        this.dataModel.getSelectionModel().appendSelection(elements);
      }
    },

    findElement: function(baseSpecId, key, objectId) {
      let portNode = null;
      let allNodes = this.dataModel.getDatas();
      allNodes.each(node => {
        let attrObject = node.getAttrObject();
        if (attrObject && attrObject.baseSpecId === baseSpecId && attrObject[key] === objectId) {
          portNode = node;
          return true;
        }
      });
      return portNode;
    },

    popupCreateLinkDialog() {
      let params = {};
      params.createType = this.mode;
      params.schemaId = this.topoResInfo.schemaId;
      params.projectId = this.topoResInfo.projectId;
      if (this.mode === 'D') {
        params.createType = 'DD';
        params.aDeviceId = this.deviceList[0].resId; //'201211182327394400';
        params.aDeviceType = this.deviceList[0].resSpecId;
        params.zDeviceId = this.deviceList[0].resId; //'201211182327394400';
        params.zDeviceType = this.deviceList[0].resSpecId;
      } else if (this.mode === 'DD') {
        params.aDeviceId = this.deviceList[0].resId; //'201211182327394400';
        params.aDeviceType = this.deviceList[0].resSpecId;
        params.zDeviceId = this.deviceList[1].resId; //'201211182227393650';
        params.zDeviceType = this.deviceList[1].resSpecId;
      } else if (this.mode === 'PC') {
        params.deviceId = this.deviceList[0].resId; //'201211182327394400';
        params.deviceType = this.deviceList[0].resSpecId;
        params.cableId = this.cableList[0].resId; //'201211191927399030';
      } else if (this.mode === 'CC') {
        params.deviceId = this.deviceList[0].resId; //'201211182327394400';
        params.deviceType = this.deviceList[0].resSpecId;
        params.aCableId = this.cableList[0].resId; //'201211191927399030';
        params.zCableId = this.cableList[1].resId; //'201211182627395680';
      }
      this.$refs.createLink.setResData(params);
    },

    refreshAfterCreateLink(data) {
      let actionType = 'CREATE';
      if (this.mode === 'D' || this.mode === 'DD') {
        let jumpLinks = data.imPortPortDTOS || [];
        this.loadJumpLinks(jumpLinks, actionType);
      } else if (this.mode === 'PC') {
        let termLinks = data.imPortCblunitDTOS || [];
        this.loadTermLinks(termLinks, actionType);
      } else if (this.mode === 'CC') {
        let spliceLinks = data.imCblunitCblunitDTOS || [];
        this.loadSpliceLinks(spliceLinks, actionType);
      }
    },

    popupAddSplitterDialog() {
      let addingRes = {
        resType: GlobalConst.RES_TYPE_SPLITTER,
        longitude: this.deviceInfo.longitude,
        latitude: this.deviceInfo.latitude,
        areaId: this.deviceInfo.areaId || '',
        areaIdDesc: this.deviceInfo.areaIdDesc || '',
        resFlag: 'INV',
        formList: [],
      };
      let resType = this.deviceInfo.resType ? this.deviceInfo.resType : this.deviceInfo.resSpecId;
      let parentRes = {
        resId: this.deviceInfo.resId,
        resType: resType,
        longitude: this.deviceInfo.longitude,
        latitude: this.deviceInfo.latitude,
      };

      this.$refs.selectDevice.setResData(addingRes, parentRes);
      this.$refs.selectDevice.CompPopuTopo.show = true;
      this.$refs.selectDevice.show = true;

      // let datas=[
      // 	{resId:"210122105202660125",resInfo:{resId:"210122105202660125",name:'SPLITTER_210122105200266011',resType:'SPLITTER',deviceId:"210122105202660125"}},
      // 	{resId:"210122105202660255",resInfo:{resId:"210122105202660255",name:'SPLITTER_210122105200266011-1',resType:'SPLITTER',deviceId:"210122105202660255"}},
      // 	{resId:"210122105202660385",resInfo:{resId:"210122105202660385",name:'SPLITTER_210122105200266011-2',resType:'SPLITTER',deviceId:"210122105202660385"}},
      // 	];
      // this.doAfterAddRes(datas);
    },

    getMaxSeqPort() {
      let maxSeq = 0;
      this.dataModel.getDatas().each(node => {
        if (node.getAttrObject().baseSpecId === 'PORT') {
          let nodeName = node.getName();
          if (parseInt(nodeName) > maxSeq) {
            maxSeq = parseInt(nodeName);
          }
        }
      });
      return maxSeq;
    },

    getLastDeviceNodePosition() {
      let maxPostY = 0;
      let lastDeviceNode = null;
      this.dataModel.getDatas().each(node => {
        if (node.getAttrObject().baseSpecId === 'DEVICE') {
          let nodeY = node.getPosition().y;
          if (nodeY > maxPostY) {
            lastDeviceNode = node;
            maxPostY = nodeY;
          }
        }
      });
      let startX = 0;
      let startY = 0;
      let width = 0;
      let height = 0;
      if (lastDeviceNode) {
        startX = lastDeviceNode.getPosition().x - lastDeviceNode.getWidth() / 2;
        startY = lastDeviceNode.getPosition().y + lastDeviceNode.getHeight() / 2;
        width = lastDeviceNode.getWidth();
        height = lastDeviceNode.getHeight();
      }
      let position = {
        x: startX,
        y: startY,
        width: width,
        height: height,
      };

      return position;
    },

    changePortName(deviceId, portIndex) {
      let allNodes = this.dataModel.getDatas();
      allNodes.each(node => {
        if (node.getAttrObject().baseSpecId === 'PORT' && node.getAttrObject().deviceId === deviceId) {
          let newName = node.getAttrObject().seq + portIndex;
          node.setName(newName);
        }
      });
    },

    doAfterAddRes(data) {
      if (data.length > 0) {
        let portIndex = this.getMaxSeqPort();
        let lastDeviceNode = this.getLastDeviceNodePosition();
        let promises = [];
        for (let i = 0; i < data.length; i++) {
          let resInfo = data[i].resInfo;
          let deviceId = resInfo.deviceId;
          let startX = lastDeviceNode.x;
          let startY = lastDeviceNode.y;
          promises.push(drawDeviceGraphics(this.schemaId, deviceId, this.dataModel, startX, startY, portIndex));
        }

        Promise.all(promises).then(datas => {
          let count = 0;
          let preNode = null;
          datas.forEach(data => {
            let newDevice = data[0];
            let attr = newDevice.getAttrObject();

            let deviceHeight = newDevice.getHeight();
            let deviceX = newDevice.getPosition().x;
            let deviceY = newDevice.getPosition().y + deviceHeight / 2 + count * (deviceHeight + 30);
            newDevice.setPosition(deviceX, deviceY);

            let deviceId = attr.deviceId;
            if (portIndex > 0) {
              this.changePortName(deviceId, portIndex);
            }

            preNode = newDevice;

            portIndex = portIndex + newDevice.portLength;
            count++;
          });
        });
      }
    },

    doAfterClose(node) {
      if (!node) {
        return;
      }
      let attrNode = node.getAttrObject();
      let resSpecId = attrNode.resSpecId;
      if (resSpecId === 'SPLITTER') {
        let delResInfoList = [];
        let delResInfo = {
          resId: attrNode.deviceId,
          resType: attrNode.resSpecId,
        };
        delResInfoList.push(delResInfo);
        let param = {
          resInfo: delResInfoList,
          currentRes: {
            resId: this.deviceList[0].resId,
            resType: this.deviceList[0].resSpecId,
          },
        };
        fish.confirm(this.$t('MAKE_SURE_REMOVE_DEVICE'), () => {});
      }
    },
    //删除独立分光器
    deleteDevice(node) {
      let attrNode = node.getAttrObject();
      let resSpecId = attrNode.resSpecId;
      if (resSpecId === 'SPLITTER') {
        let param = {
          graphic: [
            {
              resId: attrNode.deviceId,
              resType: attrNode.resSpecId,
              schemaId: this.schemaId,
            },
          ],
        };

        deleteGraphic(param).then(() => {
          this.loadTopo();
          this.dataModel.remove(node);
          fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        });
      }
    },

    //删除硬件
    deleteHardware(node) {
      fish.confirm(this.$t('REMOVE_HARDWARE_CONFIRM'), () => {
        //服务删除后台数据
        let hardwareId = node.getAttrObject().hardwareId;
        let resSpecId = node.getAttrObject().resSpecId;
        let param = {
          hardwareId: hardwareId,
          resSpecId: resSpecId,
          schemaId: this.schemaId,
        };

        deleteHardware(param).then(data => {
          //加载删除服务完成后从topo图中删除相应的节点内容
          this.deleteHardwareFromTopo(node);
        });
      });
    },
    deleteHardwareFromTopo(node) {
      //node.removeChild();
      let childNodes = node.getChildren();
      if (childNodes) {
        let childList = childNodes._as || [];
        for (let i = childList.length - 1; i >= 0; i--) {
          let childNode = childList[i];
          let nodeId = childNode.getId();
          this.dataModel.removeDataById(nodeId);
        }
      }
      let nodeAttr = node.getAttrObject();
      let delAttr = {
        baseSpecId: 'HARDWARE',
        parentId: nodeAttr.parentId,
        rowNo: nodeAttr.rowNo,
        colNo: nodeAttr.colNo,
        resSpecId: nodeAttr.resSpecId,
      };
      node.setAttrObject(delAttr);
      node.setToolTip();
      node.setStyle('shape.dash', true);
      node.setStyle('shape.dash.pattern', [3]);
    },

    modifyHardware(node, actionType) {
      let param = this.getModifyHardwareParam(node, actionType);
      console.info("add hardware's params:");
      console.info(param);
      // 添加之前先检验
      if (actionType === 'ADD') {
        let checkParam = {};
        checkParam.deviceId = param.deviceId;
        checkParam.currentResId = param.addObject.parentResId;
        checkParam.currentResType = param.addObject.parentResType;
        checkAddHardware(checkParam).then(resultList => {
          this.showCreateHardware(param);
        });
      } else {
        this.showCreateHardware(param);
      }
    },
    showCreateHardware(param) {
      //调服务
      this.$refs.createHardware.setParams(param);
      this.$refs.createHardware.CompPopuTopo.show = true;
      this.$refs.createHardware.show = true;

      //调服务完成后，返回组件；
    },

    getModifyHardwareParam(node, actionType) {
      let hardwareId = '';
      let parentNode = null;
      let attrObject = null;
      let templateId = this.deviceInfo.templateId;

      if (actionType === 'ADD') {
        attrObject = node.getAttrObject();
        console.info(parentNode);
        hardwareId = node.getAttrObject().hardwareId;
        let resSpecId = node.getAttrObject().resSpecId;
        if (hardwareId && resSpecId) {
          parentNode = node;
          templateId = attrObject.templateId;
        } else {
          parentNode = node.getParent();
        }
        //表示增加panel
        if (hardwareId && resSpecId === 'SHELF') {
          let panelObject = {
            baseSpecId: 'HARDWARE',
            parentId: node.getAttrObject().hardwareId,
            resSpecId: 'PANEL',
            colNo: '',
            rowNo: '',
          };
          attrObject = panelObject;
        }
      } else {
        hardwareId = node.getAttrObject().hardwareId;
        attrObject = node.getAttrObject();
        parentNode = node.getParent();
      }

      let parentResId = '';
      let parentResType = '';

      if (node.getAttrObject().hardwareId) {
        parentResId = node.getAttrObject().hardwareId;
        parentResType = node.getAttrObject().resSpecId;
      } else {
        parentResId = parentNode.getAttrObject().hardwareId;
        parentResType = parentNode.getAttrObject().resSpecId;
        if (!parentResId) {
          parentResId = parentNode.getAttrObject().deviceId;
        }
      }

      let parentTemplateId = node.getAttrObject().templateId;
      if (!parentTemplateId) {
        parentTemplateId = parentNode.getAttrObject().templateId;
      }
      let param = {
        schemaId: this.schemaId,
        deviceId: this.deviceInfo.resId,
        deviceType: this.deviceInfo.resType || this.deviceInfo.resSpecId,
        templateId: templateId,
        addObject: {
          resSpecId: attrObject.resSpecId,
          parentId: attrObject.parentId,
          hardwareId: hardwareId,
          colNo: attrObject.colNo,
          rowNo: attrObject.rowNo,
          attrObject: attrObject,
          parentTemplateId: parentTemplateId,
          parentResType: parentResType,
          parentResId: parentResId,
        },
        actionType: actionType,
      };

      return param;
    },

    //增加硬件后返回；
    doAfterAddHW(datas, params) {
      //将Topo重新加载；
      this.loadTopo();
    },

    doAfterCloseHw() {},

    initMenus(selectedDatas) {
      let selectedNodes = [];
      selectedDatas.each(selectedData => {
        if (selectedData instanceof ht.Node) {
          selectedNodes.push(selectedData);
        }
      });

      let menus = [];

      if (selectedNodes.length == 0) {
        menus.push({
          label: this.$t('BTN_CREATE_LINK'),
          visible: true,
          action: () => this.popupCreateLinkDialog(),
        });
        if (this.mode === 'D') {
          let isAllowAddFlag = this.isAllowDealDevice('ADD', 'SPLITTER', null);
          if (isAllowAddFlag) {
            menus.push({
              label: this.$t('BTN_ADD_SPLITTER'),
              visible: true,
              action: () => this.popupAddSplitterDialog(),
            });
          }
        }
      } else if (selectedNodes.length == 1) {
        let allNodes = this.findNodesStepByStep(selectedNodes[0]);
        let allEdges = [];
        let linkIds = [];
        let canRomoveLink = true;
        let terminationIds = [];
        let splicingIds = [];
        let portSeleted = selectedNodes[0]._attrObject.baseSpecId === 'PORT';
        if (portSeleted) {
          menus.push({
            label: this.$t('BTN_PORT_TRACE'),
            visible: true,
            action: () => this.loadPortTrace(selectedNodes[0]),
          });
        }

        this.dataModel.getDatas().each(node => {
          let attrObject = node.getAttrObject();
          if (attrObject.baseSpecId === 'LINK' && (allNodes.indexOf(node.getSource()) != -1 || allNodes.indexOf(node.getTarget()) != -1)) {
            if (this.schemaId !== attrObject.projOrderId) {
              canRomoveLink = false;
            }

            if (attrObject.linkId) {
              linkIds.push(attrObject.linkId);
            }

            if (attrObject.terminationId) {
              terminationIds.push(attrObject.terminationId);
            }

            if (attrObject.splicingId) {
              splicingIds.push(attrObject.splicingId);
            }
            allEdges.push(node);
          }
        });
        if (selectedNodes[0]._attrObject.baseSpecId === 'DEVICE' && selectedNodes[0]._attrObject.resSpecId === 'SPLITTER') {
          let node = selectedNodes[0];
          let isShowDelButton = this.isAllowDealDevice('DEL', 'SPLITTER', node);
          menus = [];
          if (isShowDelButton) {
            menus.push({
              label: this.$t('BTN_REMOVE_SPLITTER'),
              visible: true,
              action: () => {
                this.deleteDevice(node);
              },
            });
          }
        }
        if (selectedNodes[0]._attrObject.baseSpecId === 'HARDWARE') {
          let node = selectedNodes[0];
          menus = this.getMenuOfHardware(node);
        }
        if (canRomoveLink && (linkIds.length != 0 || terminationIds.length != 0 || splicingIds.length != 0)) {
          menus.push({
            label: this.$t('BTN_REMOVE_LINK'),
            visible: true,
            action: () => {
              fish.confirm(this.$t('MAKE_SURE_REMOVE_CONNECTION'), () => {
                fish.ajax({
                  type: 'DELETE',
                  url: `edesign/rivt/link/connectionbyids/v1`,
                  dataType: 'json',
                  contentType: 'application/json',
                  processData: false,
                  data: JSON.stringify({
                    linkIds: linkIds,
                    terminationIds: terminationIds,
                    splicingIds: splicingIds,
                  }),
                  success: result => {
                    fish.toast('success', this.$t('DELETE_SUCCESS'));
                    allEdges.forEach(edge => {
                      let source = edge.getSource();
                      if (source != null && source.getAttrObject()) {
                        if (source.getAttrObject().baseSpecId === 'PORT') {
                          this.setPortLinkCountTip(source, 'decrease');
                        } else if (source.getAttrObject().baseSpecId === 'CABLE_UNIT') {
                          source.setStyle('shape.background', getDefaultCoreFillColor());
                        }
                      }

                      let target = edge.getTarget();
                      if (target != null) {
                        if (target.getAttrObject().baseSpecId === 'PORT') {
                          this.setPortLinkCountTip(target, 'decrease');
                        } else if (target.getAttrObject().baseSpecId === 'CABLE_UNIT') {
                          target.setStyle('shape.background', getDefaultCoreFillColor());
                        }
                      }
                      this.dataModel.remove(edge);
                    });
                    this.dataModel.getSelectionModel().clearSelection();
                  },
                  error: e => {},
                });
              });
            },
          });
        }
      }
      return menus;
    },
    /**
     * 增加按钮：利旧与自己的方案可以；
     * 编辑按钮：自己的且没有被引用的可以
     * 删除按钮：自己的且没被引用的
     * designOrdId 表示创建时的schemaId  是否与当前 schemaId相同
     * refType  R  引用过来的；   U利旧过来的； N或者为空  自建的
     */
    isAllowDealDevice(dealType, dealObjType, node) {
      let isDealFlag = false;

      let attr;
      let nodeRefType = '';
      let projectSchemaId = '';
      if (node) {
        attr = node.getAttrObject();
        nodeRefType = attr.refType ? attr.refType : 'N';
        projectSchemaId = attr.designOrdId || '';
      }

      if (dealType === 'ADD') {
        if (dealObjType === 'SPLITTER') {
          if (this.refType === 'U' || this.deviceInfo.designOrdId === this.schemaId) {
            isDealFlag = true;
          }
        } else {
          if (nodeRefType === 'U' || projectSchemaId === this.schemaId) {
            isDealFlag = true;
          }
        }
      } else if (dealType === 'EDIT') {
        if (nodeRefType !== 'R' || projectSchemaId === this.schemaId) {
          isDealFlag = true;
        }
      } else if (dealType === 'DEL') {
        if (this.refType !== 'R' || this.deviceInfo.designOrdId === this.schemaId) {
          isDealFlag = true;
        }
      }
      return isDealFlag;
    },

    getMenuOfHardware(node) {
      let menus = [];
      let attrNode = node.getAttrObject();
      let resSpecId = node.getAttrObject().resSpecId;
      let hardwareId = attrNode.hardwareId;
      let isAllowEditFlag = this.isAllowDealDevice('EDIT', 'HARDWARE', node);
      let isAllowAddFlag = this.isAllowDealDevice('ADD', 'HARDWARE', node);
      if (hardwareId) {
        if (resSpecId != 'SLOT') {
          menus.push({
            label: this.$t('BTN_VIEW_HARDWARE'),
            visible: true,
            action: () => {
              this.modifyHardware(node, 'VIEW');
            },
          });
          if (isAllowEditFlag) {
            menus.push({
              label: this.$t('BTN_EDIT_HARDWARE'),
              visible: true,
              action: () => {
                this.modifyHardware(node, 'EDIT');
              },
            });
            menus.push({
              label: this.$t('BTN_REMOVE_HARDWARE'),
              visible: true,
              action: () => {
                this.deleteHardware(node);
              },
            });
          }
        }
        if (!node.hasChildren()) {
          if (isAllowAddFlag) {
            menus.push({
              label: this.$t('BTN_ADD_HARDWARE'),
              visible: true,
              action: () => {
                this.modifyHardware(node, 'ADD');
              },
            });
          }
        }
      } else {
        if (resSpecId != 'SLOT') {
          if (isAllowAddFlag) {
            menus.push({
              label: this.$t('BTN_ADD_HARDWARE'),
              visible: true,
              action: () => {
                this.modifyHardware(node, 'ADD');
              },
            });
          }
        }
      }
      return menus;
    },

    loadPortTrace(node) {
      this.portId = node.getAttrObject().portId;
      // this.$refs.portTrace.CompPopuTopo.width = '1100';
      // this.$refs.portTrace.CompPopuTopo.height = '660';
      // this.$refs.portTrace.CompPopuTopo.left = 'calc(50% - 550px)';
      // this.$refs.portTrace.CompPopuTopo.top = 'calc(50% - 330px)';
      // this.$refs.portTrace.CompPopuTopo.show = true;
      // this.$refs.portTrace.actionType = 'CAL';
      // this.$refs.portTraceCalculate.openDevicePortTrace(this.portId);
      let param = {
        portId: this.portId,
        schemaId: this.schemaId,
      };
      this.$emit('openPortTrace', param);
    },

    findNodesStepByStep(node) {
      let nodes = [node];
      node.getChildren().each(child => {
        nodes = nodes.concat(this.findNodesStepByStep(child));
      });
      return nodes;
    },

    showPortPanel(current) {
      let isClickNode = false;
      if (
        current.getAttrObject().baseSpecId === 'PORT' ||
        current.getAttrObject().baseSpecId === 'CABLE_UNIT' ||
        current.getAttrObject().baseSpecId === 'CABLE' ||
        current.getAttrObject().baseSpecId === 'TUBE' ||
        current.getAttrObject().baseSpecId === 'DEVICE'
      ) {
        if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
          this.$refs.deviceDesignTopo.$refs.portPanel.setData(current, this.schemaId);
        }
        this.nodeInfo = current;
        this.$refs.deviceDesignTopo.portDrawer = true;
        isClickNode = true;
      } else if (current.getAttrObject().baseSpecId === 'HARDWARE') {
        if (current.getAttrObject().hardwareId && current.getAttrObject().resSpecId) {
          if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
            this.$refs.deviceDesignTopo.$refs.portPanel.setData(current, this.schemaId);
          }
          this.nodeInfo = current;
          this.$refs.deviceDesignTopo.portDrawer = true;
          isClickNode = true;
        }
      }
      if (!isClickNode) {
        this.$refs.deviceDesignTopo.portDrawer = false;
        this.nodeInfo = null;
      }
    },

    closeDrawer() {
      this.$refs.deviceDesignTopo.portDrawer = false;
      this.nodeInfo = null;
    },

    toolbarClick(eventName) {
      console.info(eventName);
      if (eventName === 'refresh') {
        this.$refs.deviceDesignTopo.portDrawer = false;
        this.nodeInfo = null;
        this.loadTopo();
      } else if (eventName === 'AUTOLINK') {
        if (this.deviceInfo.resSpecId === 'OLT' && this.deviceInfo.resId) {
          this.$refs.setting.popupObj.show = true;
        }
      } else if (eventName === 'save') {
        this.saveTopo();
      }
    },
    saveTopo: function() {
      let topoData = {};
      this.dataModel.getDatas().each(data => {
        if (data instanceof ht.Node && (data.getAttrObject().baseSpecId == 'CABLE' || data.getAttrObject().baseSpecId == 'DEVICE')) {
          let resId = data.getAttrObject().cableId || data.getAttrObject().deviceId;
          topoData[resId] = {
            x: data.getPosition().x,
            y: data.getPosition().y,
          };
        } else if (data instanceof ht.Edge) {
          let linkId = data.getAttrObject().linkId || data.getAttrObject().terminationId || data.getAttrObject().splicingId;
          let points = data.getStyle('edge.points')._as;
          topoData[linkId] = {
            POINTS: points,
          };
        }
      });
      if (Object.keys(topoData).length !== 0) {
        fish.post({
          url: `edesign/topo/data/v1`,
          data: {
            schemaId: this.schemaId,
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
    settingOK() {
      autoLink(
        this.deviceInfo.resId,
        this.schemaId,
        result => {
          fish.toast('success', 'Opearate Successfully!');
          this.loadTopo();
        },
        response => {
          if (response && response.responseJSON && response.responseJSON.message) {
            fish.warn(response.responseJSON.message);
          } else {
            fish.warn('Ajax Error');
          }
        },
      );
    },
    refreshSize() {
      this.graphView.setZoom(1);
      this.graphView.setTranslateY(1);
    },
  },
  watch: {
    topoResInfo: {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.loadTopo();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
