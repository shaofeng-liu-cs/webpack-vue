<template>
    <div class="cs-block">
        <div class="topoContent col-md-8">
            <TopoTemplate ref="siteRoomTopo" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" :tool-buttons="toolButtonsData" @click-tool-node="clickToolNode" @click-node="clickNode" @select="selectMode"></TopoTemplate>
        </div>
        <div class="col-md-4">
            <div class="right_info">
                <div class="cs-block">
                    <div class="selection-tap">
                        <ul>
                            <li v-for="(item, index) in tabList" :key="index" :class="{ active: index === tabIndex }" @click="tabClick(index)">
                                {{ item.tabName }} {{ item.num > 1 ? `(${item.num})` : '' }}
                            </li>
                        </ul>
                    </div>
                    <div class="selection-body-cont" v-for="(item, index) in tabList" :key="index" v-show="index === tabIndex">
                        <div class="selection-body">
                            <div class="tree col-md-12">
                                <Tree :fNodes="fNodes" :data="dataIcon" @onClick="clickTree" @onDblClick="dbClickTree" :view="view" :allData="getAllData" ref="tree" :queryData="searchValue" :level="3"></Tree>
                            </div>
                        </div>
                    </div>
                    <div class="selection-footer">
                        <button type="button" class="btn btn-primary" @click="addRoom" :text="$t('NEW_ROOM')">{{ $t('NEW_ROOM') }}</button>
                        <button type="button" class="btn btn-default" @click="deleteSiteOrRoom" :text="$t('DELETE')">{{ $t('DELETE') }}</button>
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
const DEVICE_SIZE = 60;
const CELL_SIZE = 80;
const STARTX = 0;
const STARTY = 0;
const LABEL_POSITION_BOTTOM = 31;
const LABEL_POSITION_RIGHT_TOP = 35;
const LABEL_POSITION_LEFT_TOP = 34;
const LABEL_POSITION_LEFT_BOTTOM = 29;
const LABEL_POSITION_LEFT_TOP_GAP = 1;
const directiveConfig = {
  east: [500, 250],
  west: [100, 250],
  north: [300, 50],
  south: [300, 450],
};
const nodeSize = [200, 200];
export default {
  name: 'siteRoomTopo',
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
      tabIndex: 0,
      tabList: [
        {
          num: 0,
          tabName: this.$t('RESOURCE_TREE'),
        },
      ],
      gridData: [],
      gridOption: {},
    };
  },
  mounted() {
    console.info('input resdata:>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.info(this.resData);
    if (this.resId) {
      this.initResTree();
    }
  },
  created() {},
  methods: {
    getAllData(val) {
      this.allData = val;
    },
    initResTree() {
      let url = 'edesign/rivt/place/query/sitetree/v1/' + this.resId;
      console.info('load site url=' + url);

      fish.ajax({
        url: url,
        type: 'GET',
        success: data => {
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
      roomsList.forEach(room => {
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
        if (nodeType === 'Site') {
        } else if (nodeType === 'Room') {
          this.loadRoomTopoList(nodes[0].id);
        }
        this.loadPropertyData(nodes);
      }
    },

    dbClickTree(nodes) {
      console.info('dbclick tree nodes>>>>>>>>>>>>>>>>>>>>');
      console.info(nodes);
    },

    addRoom() {
      let addRoomFlag = false;
      if (this.selectTreeNode) {
        let typeId = this.selectTreeNode[0].typeId;
        let nodeType = getTopoTypeByResType(typeId);
        if (nodeType === 'Site') {
          addRoomFlag = true;
        }
      }

      if (!addRoomFlag) {
        fish.info(this.$t('OSP_MAP_FUNCTION_ROOM_TOPO_MSG'));
        return;
      }

      let item = {};
      item.id = '20200001';
      item.typeId = 'ROOM';
      item.name = 'test';
      item.pId = this.resId;
      (item.open = true), (item.icon = 'oss_core/edesign/assets/image/topo-business/res-small/ROOM.png');

      this.fNodes[0].children.push(item);
    },

    deleteSiteOrRoom() {
      if (this.selectTreeNode) {
        let id = this.selectTreeNode[0].id;
        let typeId = this.selectTreeNode[0].typeId;
        let nodeType = getTopoTypeByResType(typeId);
        if (nodeType === 'Site') {
          for (let i = 0; i < this.fNodes.length; i++) {
            if (this.fNodes[i].id === id) {
              this.fNodes.splice(i, 1);
              break;
            }
          }
        } else if (nodeType === 'Room') {
          for (let i = 0; i < this.fNodes.length; i++) {
            let child = this.fNodes[i].children || [];
            for (let j = 0; j < child.length; j++) {
              if (child[j].id === id) {
                child.splice(j, 1);
                break;
              }
            }
          }
        }

        this.selectTreeNode = null;
      } else {
        fish.info('please select a node.');
        return;
      }
    },

    loadPropertyData(nodes) {
      let resType = nodes[0].typeId;
      let resId = nodes[0].id;
      let url = 'edesign/resource/query/resourceinfo/v1?resType=' + resType + '&resId=' + resId;
      console.info('load device url=' + url);

      fish.ajax({
        url: url,
        type: 'GET',
        success: data => {
          console.info(data);
          if (data.resultCode === '0') {
            this.showProper(data.resultList);
          }
        },
      });
    },
    showProper(attrData) {
      let propertyList = [];
      if (attrData) {
        attrData.forEach((v, i) => {
          Object.keys(v).forEach(v => {
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

    loadRoomTopoList(roomId) {
      if (!roomId) {
        return;
      }

      // modify by wanjf 2021-9-9 修改url
      let url = 'edesign/rivt/place/devicelist/v1?roomId=' + roomId;

      console.info('room url=' + url);

      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        //data: datas,
        success: data => {
          console.info(data);
          if (data.resultCode === '0') {
            this.drawRoomData(data.resultList);
          }
        },
      });
    },

    drawRoomData(resList) {
      let dataTopo = [];
      resList.forEach(device => {
        if (device.resSpecId !== 'RRU_DEV' && device.resSpecId !== 'ANTENNA') {
          let elem = new ht.Node();
          elem.movable = true;
          elem.setAttrObject(device);
          elem.setName(device.name);
          elem.setToolTip(device.name);
          elem.setStyle('label.font', '16px Tahoma');
          elem.setStyle('label.position', LABEL_POSITION_BOTTOM);
          elem.setSize(DEVICE_SIZE, DEVICE_SIZE);
          elem.setImage('oss_core/edesign/assets/image/topo-business/res/' + device.resSpecId + '.png');

          dataTopo.push(elem);
        }
      });

      if (this.$refs) {
        if (this.$refs.siteRoomTopo) {
          let gv = this.$refs.siteRoomTopo.getGraph();
          gv.setLayoutType('hierarchical');
        }
      }

      this.graphData = dataTopo;
    },

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
        console.log(node.getAttr('NODE_TYPE'));
      } else {
        console.log('click the grapView');
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
          label: this.$t('TEST'),
          visible: true,
          action: data => this.viewDevice(data),
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
        this.initResTree();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import './SiteRoomTopo.scss';
</style>
