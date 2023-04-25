<template>
  <div class="cs-block">
    <div class="topoContent col-md-8">
      <TopoTemplate ref="deviceTopo" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" :tool-buttons="toolButtonsData" @click-tool-node="clickToolNode" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
    <div class="col-md-4">
      <div class="right_info">
        <div class="cs-block">
          <div class="title">
            <h3>{{ $t('RESOURCE_TREE') }}</h3>
          </div>
          <div class="selection-body-cont">
            <div class="selection-body">
              <div class="tree col-md-12">
                <Tree :fNodes="fNodes" :data="dataIcon" @onClick="clickTree" @onDblClick="dbClickTree" :view="view" :allData="getAllData" ref="tree" :queryData="searchValue" :level="3"></Tree>
              </div>
            </div>
          </div>
          <div class="selection-footer">
            <button type="button" class="btn btn-primary" @click="jump" :text="$t('JUMP')">{{ $t('JUMP') }}</button>
            <button type="button" class="btn btn-default" @click="terminate" :text="$t('TERMINATE')">{{ $t('TERMINATE') }}</button>
            <button type="button" class="btn btn-default" @click="splice" :text="$t('SPLICE')">{{ $t('SPLICE') }}</button>
          </div>
        </div>
        <div class="cs-block">
          <div class="title">
            <h3>{{ $t('ATTRIBUTE') }}</h3>
          </div>
          <div class="attr-container" style="display: flex; flex-flow: column">
            <form class="form-horizontal divGrid grid-height-auto" id="gridDiv">
              <Grid :data="gridData" :option="gridOption" @onSelectRow="slect" id="gridID" ref="gridRef">
                <grid-column :label="$t('NAME')" prop="fullName"></grid-column>
                <grid-column :label="$t('VALUE')" prop="value"></grid-column>
              </Grid>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopoTemplate from '@/oss_core/edesign/topo/topo-template/TopoTemplate.vue';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';
import { listToTree } from '@/oss_core/edesign/topo/TopoUtil.js';
const DEVICE_SIZE = 60;
const CELL_SIZE = 80;
const STARTX = 0;
const STARTY = 0;
const LABEL_POSITION_BOTTOM = 31;
const LABEL_POSITION_RIGHT_TOP = 35;
const LABEL_POSITION_LEFT_TOP = 34;
const LABEL_POSITION_LEFT_BOTTOM = 29;
const LABEL_POSITION_LEFT_TOP_GAP = 1;
const PORT_SIZE = 24;
const PORT_GAP = 4;

const PANE_GAP = 8;
const DEF_COL_PORT_COUNT = 12;
const DEVICE_BORDER_COLOR = '#D4D4D4';
const DEVICE_FILL_COLOR = '#969698';

const WARE_BORDER_COLOR = '#EFF2EF';
const WARE_FILL_COLOR = '#BDC0BF';

const PORT_BORDER_COLOR = '#5675C1';
const PORT_FILL_COLOR = '#FFFFFF';

const LABEL_POSITION_CENTER = 17;
const LABEL_POSITION_LEFT = 14;
const LABEL_FONT = '12px Tahoma';

const directiveConfig = {
  east: [500, 250],
  west: [100, 250],
  north: [300, 50],
  south: [300, 450],
};
const nodeSize = [200, 200];
export default {
  name: 'deviceTopo',
  components: {
    TopoTemplate,
  },
  props: {
    //resId is siteId;
    resId: {
      type: String,
      default: '',
    },
    resData: Object,
  },
  model: {
    prop: 'resId', //resId is siteId;
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
    };
  },
  mounted() {
    console.info('input resdata:>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.info(this.resData);
    this.initPage();
    if (this.resId) {
      //this.initResTree();
    }
  },
  created() {},
  methods: {
    getAllData(val) {
      this.allData = val;
    },
    initPage() {},
    initResTree() {
      //let resType = nodes[0].typeId;
      //let resId = nodes[0].id;
      let url = 'edesign/rivt/place/query/sitetree/v1/' + this.resId;
      console.info('load site url=' + url);

      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        //data: datas,
        success: (data) => {
          console.info(data);
          if (data) {
            this.loadResTree(data);
          }
        },
      });
    },

    loadResTree: function (resData) {
      let siteNode = resData.site;
      //let resSpecId = "SITE";
      let siteId = siteNode.siteId;
      let siteType = siteNode.siteType;
      let siteName = siteNode.fullName ? siteNode.fullName : siteNode.name;
      let roomsList = resData.roomList || [];

      let rooms = [];
      roomsList.forEach((room) => {
        let item = {};
        item.id = room.roomId;
        item.typeId = room.roomType;
        item.name = room.fullName ? room.fullName : room.name;
        item.pId = siteId;
        (item.open = true), (item.icon = 'oss_core/edesign/assets/image/topo-business/res-small/ROOM.png');

        rooms.push(item);
      });

      let nodes = [
        {
          id: siteId,
          typeId: siteType,
          pId: 0,
          name: siteName,
          open: true,
          icon: 'oss_core/edesign/assets/image/topo-business/res-small/SITE.png',
          children: rooms,
        },
      ];

      //nodes.children = rooms;

      this.fNodes = nodes;
    },

    clickTree(nodes) {
      console.info('click tree nodes>>>>>>>>>>>>>>>>>>>>');
      console.info(nodes);
      if (nodes) {
        this.selectTreeNode = nodes;
        console.info('nodes type===' + nodes[0].typeId);
        let nodeType = getTopoTypeByResType(nodes[0].typeId);
        if (nodeType === 'Device') {
        } else if (nodeType === 'Cable') {
          //this.loadRoomTopoList(nodes[0].id);
        }
        this.loadPropertyData(nodes[0].typeId, nodes[0].id);
      }
    },

    dbClickTree(nodes) {
      console.info('dbclick tree nodes>>>>>>>>>>>>>>>>>>>>');
      console.info(nodes);
    },

    loadPropertyData(resType, resId) {
      //let resType = nodes[0].typeId;
      //let resId = nodes[0].id;
      let url = 'edesign/resource/query/resourceinfo/v1?resType=' + resType + '&resId=' + resId;
      console.info('load device url=' + url);

      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        //data: datas,
        success: (data) => {
          console.info(data);
          if (data.resultCode === '0') {
            //this.linkList = data.resultList;
            this.showProper(data.resultList);
          }
        },
      });
    },
    showProper(attrData) {
      let propertyList = [];
      if (attrData) {
        attrData.forEach((v, i) => {
          Object.keys(v).forEach((v) => {
            //console.log("key = "+ v + ";value = "+attrData[i][v]);//取到了key
            //console.log("value = "+arr[i][v]);//取到了值
            let item = {};
            item.fullName = v;
            item.value = attrData[i][v];
            propertyList.push(item);
          });
        });
      }

      this.gridData = propertyList;
    },

    //区分截面图展示和设计
    initPageAction() {
      if (this.resData) {
        let pageType = this.resData.pageType;
        if (pageType === 'DESIGN') {
          let designToolMenu = [
            {
              id: 'addDevice',
              name: this.$t('BTN_ADD_DEVICE'),
              image: 'oss_core/edesign/assets/image/topo-tool-bar/addClosure.png',
              title: this.$t('BTN_ADD_DEVICE'),
              event: 'addDevice',
            },
            {
              id: 'addCable',
              name: this.$t('BTN_ADD_CABLE'),
              image: 'oss_core/edesign/assets/image/topo-tool-bar/addOdp.png',
              title: this.$t('BTN_ADD_CABLE'),
              event: 'addCable',
            },
          ];
          this.toolButtonsData.push.apply(this.toolButtonsData, designToolMenu);
        }
      }
    },

    // modify by wanjf 2021-9-9 修改url
    loadDeviceLinkList(deviceId) {
      let datas = {
        deviceId: deviceId,
      };
      // let url = 'edesign/rivt/device/query/' + deviceId + '/linklist/v1';
      let url = `edesign/device/linklist/v1`;

      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        data: datas,
        success: (data) => {
          console.info(data);
          if (data.resultCode === '0') {
            this.linkList = data.resultList;
          }
        },
      });
    },

    loadDeviceTopoList(deviceId) {
      if (!deviceId) {
        return;
      }
      let url = 'edesign/device/info/querydevicepanel/v1/' + deviceId;
      console.info('device url=' + url);
      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        //data: datas,
        success: (data) => {
          console.info(data);
          if (data.resultCode === '0') {
            this.drawDeviceData(data.resultList);
          }
        },
      });
    },

    drawDeviceData(dataDto) {
      let postX = 0;
      let postY = 0;
      let dataTopo = [];
      let deviceInfo = dataDto.deviceDTO;
      let hardwareList = dataDto.hardwareList || [];
      let portList = dataDto.portList || [];
      let colsQty = deviceInfo.colsQty || 1;
      let rowsQty = deviceInfo.rowsQty || 1;

      this.analysisData(deviceInfo, hardwareList, portList);

      let deviceNode;
      if (deviceInfo) {
        deviceNode = this.drawRect(
          'DEVICE',
          deviceInfo,
          deviceInfo.width,
          deviceInfo.height,
          postX,
          postY,
          DEVICE_BORDER_COLOR,
          DEVICE_FILL_COLOR,
          3,
        );

        if (hardwareList.length > 0) {
        } else {
        }

        dataTopo.push(deviceNode);
      }
      this.graphData = dataTopo;
    },

    analysisData(deviceInfo, hardwareList, portList) {
      deviceInfo.width = 400;
      deviceInfo.height = 500;
      //let hardwareList = dataDto.hardwareList || [];
      console.info('HwList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.info(hardwareList);
      let newHwList = listToTree(hardwareList, 'hardwareId');
      console.info('newHwList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.info(newHwList);
    },

    drawRect(nodeType, nodeInfo, width, height, postX, postY, borderColor, bgColor, labelNum) {
      let intLabelNum = 17;
      if (labelNum) {
        intLabelNum = labelNum;
      }
      let node = new ht.Node();
      node.movable = true;
      node.setAttrObject(nodeInfo);
      node.setAttr('NODE_TYPE', nodeType);
      node.setName(nodeInfo.name);
      node.setSize(width, height);
      node.setPosition(postX, postY);

      node.setStyle('shape', 'rect');
      node.setStyle('label.position', intLabelNum);
      node.setStyle('label.font', '22px Arial');
      node.setStyle('shape.border.width', 3);
      node.setStyle('shape.background', bgColor);
      node.setStyle('shape.border.color', borderColor);
      node.setStyle('vector.outline.width', '5');
      return node;
    },

    jump() {},
    terminate() {},
    splice() {},

    addDevice(eventName) {
      if (eventName === 'addDevice') {
        let poleNode = new ht.Node();
        let selNodeLocation = this.selectNode.getCorners(0, 0);
        let size = 60;
        let x = selNodeLocation[0].x + size / 2 + 5;
        let y = selNodeLocation[0].y + size / 2 + 5;
        poleNode.setSize(size, size);
        poleNode.setPosition(x, y);
        poleNode.setAttr('NODE_TYPE', 'POLE');
        poleNode.setImage('oss_core/edesign/assets/image/topo-business/res/POLE.png');
        poleNode.setHost(this.selectNode);
        this.graphData.push(poleNode);
      }
    },

    tabClick(index) {
      this.tabIndex = index;
    },

    clickNode(node) {
      if (node) {
        console.log(node.getAttr('NODE_TYPE') + '>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(node);
        let attr = node.getAttrObject();
        let resId = '';
        resId = attr.deviceId;
        this.loadPropertyData(attr.resSpecId, resId);
      } else {
        console.log('click the grapView');
        this.showProper([]);
      }
      this.selectNode = node;
    },
    clickToolNode(menuNode) {
      let eventName = menuNode.event;
      if (eventName === 'addDevice') {
        if (this.selectNode) {
          let selNodeType = this.selectNode.getAttr('NODE_TYPE');
          if (selNodeType === 'MANHOLE') {
            this.addDevice(eventName);
          } else {
            fish.info(this.$t('OSP_MAP_FUNCTION_DEVICE_TOPO_MSG'));
          }
        } else {
          fish.info(this.$t('OSP_MAP_FUNCTION_DEVICE_TOPO_MSG'));
        }
      } else if (eventName === 'addCable') {
        //this.addDevice(eventName);
      }
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
  watch: {
    resId: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.loadDeviceTopoList(val);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import './DeviceTopo.scss';
</style>
