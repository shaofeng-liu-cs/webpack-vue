<template>
    <div class="cs-block">
        <TopoTemplate ref="instanceSchemaTopo" :data-source="graphData" :show-toolbar="true" :show-right-menu="true" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';

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

const LABEL_POSITION_BOTTOM = 31;
const LABEL_POSITION_CENTER = 17;
const LABEL_POSITION_LEFT = 14;
const LABEL_FONT = '12px Tahoma';

export default {
  name: 'deviceTemplateTopo',
  components: {
    TopoTemplate,
  },
  props: {
    mapResData: Array,
    schemaId: {
      type: String,
      default: '',
    },
  },
  model: {
    prop: 'schemaId',
    event: 'input',
  },
  data() {
    return {
      graphData: [],
      schemaSpecData: [],
    };
  },
  mounted() {
    console.info('schemaTopo schemaId:' + this.schemaId);
    console.info('schemaTopo mapResData:');
    console.info(this.mapResData);
    //this.loadResSpecBySchemaId(this.schemaId);
  },
  created() {},
  methods: {
    loadResSpecBySchemaId(schemaId) {
      if (!schemaId) {
        return;
      }
      //let url = "/edesign/schema/schemarestopo/v1/"+schemaId;
      let url = 'edesign/schema/restyperela/' + schemaId + '/restypelist/v1';
      console.info('url:' + url);
      fish.ajax({
        url: url,
        type: 'GET',
        //contentType: "application/json",
        //data: datas,
        success: data => {
          console.info(data);
          if (data.resultCode === '0') {
            this.schemaSpecData = data.resultList;
            this.anysisMapData(this.mapResData, '');
            // if (this.schemaId) {
            //     this.loadPlanTopoList(this.schemaId);
            // }
          }
        },
      });
    },

    /**
     * showType
     *   ALL:        全视图
     *   PIPELIN:    管道视图
     *   CABLE:      光缆视图
     */

    anysisMapData(mapData, showType) {
      // mapData.forEach(elem => {
      //     console.info("this MapData layerNo:"+elem.layerNo);
      // });
      // for(let i=0;i<this.schemaSpecData.length;i++){
      //     console.info("schemaSpecData layerNo: "+ this.schemaSpecData[i].layerNo);
      // }

      let pointList = [];
      let polylineList = [];
      //console.info("this mapData:");
      //console.info(mapData);
      mapData.forEach(elem => {
        //console.info(elem);
        let attr = elem.attributes;
        //console.info(attr);

        let elemType = elem.geometry.type;
        let layerNo = elem.layerNo;
        if (elemType === 'point' || elemType === 'polyline') {
          let res = this.getResSpecByLayerNo(layerNo);
          if (res) {
            let resType = res.resType || '';
            let topoResType = getTopoTypeByResType(resType);
            if (showType === 'PIPELIN') {
              if (
                topoResType === 'Site' ||
                topoResType === 'Manhole' ||
                topoResType === 'Pipeline' ||
                topoResType === 'Pole' ||
                topoResType === 'Air_Wire'
              ) {
                attr.res_type = resType;
                pointList.push(attr);
              }
            } else if (showType === 'CABLE') {
              //console.info("res.resType = " +res.resType + ";returnType = " + topoResType);
              if (topoResType === 'Device' || topoResType === 'Cable') {
                attr.res_type = resType;
                pointList.push(attr);
              }
            } else {
              //显示全视图
              attr.res_type = resType;
              pointList.push(attr);
            }
          }
        }
      });
      console.info('new pointList:');
      console.info(pointList);
      console.info(polylineList);
      this.drawNodeData(pointList, polylineList);
    },

    //画点和线
    drawNodeData(nodeList, linkList) {
      this.nodeMap = {};
      let maxWidth = 200;
      let maxHeight = 150;
      let maxRowCount = 4;
      let postX = 0;
      let postY = 30;
      let dataTopo = [];
      let dataList = [];
      //let nodeList = tempData.nodeList || [];
      //let linkList = tempData.linkList || [];

      //let newNodeList = this.listToTree(nodeList);
      let newNodeList = nodeList;
      let i = 1;
      let rowI = 0;
      let colI = 0;
      newNodeList.forEach(node => {
        //console.info("i="+i + ";colI=" + colI);
        postX = (i % maxRowCount) * maxWidth;
        postY = maxHeight * colI;
        //console.info("postY="+postY);
        if (node.children) {
          let group = new ht.Group();
          group.setExpanded(false);

          let childNodeList = node.children;
          let j = 0;
          childNodeList.forEach(cNode => {
            let cElem = new ht.Node();
            cElem.movable = true;
            cElem.setAttrObject(cNode);
            cElem.setName(cNode.res_name);
            cElem.setPosition(postX, 70 * j);
            cElem.setSize(50, 50);
            cElem.setStyle('label.position', 31);
            cElem.setStyle('label.offset.y', 10);
            cElem.setImage('oss_core/edesign/assets/image/topo-business/res/' + cNode.res_type + '.png');
            group.addChild(cElem);
            dataTopo.push(cElem);
            this.nodeMap[cNode.objectid] = cElem;
            j++;
          });
          group.movable = true;
          group.setAttrObject(node);
          group.setName(node.res_name);
          group.setPosition(postX, postY);

          dataTopo.push(group);
          this.nodeMap[node.objectid] = group;
        } else {
          let elem = new ht.Node();
          elem.movable = true;
          elem.setAttrObject(node);
          elem.setName(node.res_name);
          elem.setPosition(postX, postY);
          elem.setSize(50, 50);
          elem.setStyle('label.position', 31);
          elem.setStyle('label.offset.y', 10);
          elem.setImage('oss_core/edesign/assets/image/topo-business/res/' + node.res_type + '.png');
          dataTopo.push(elem);
          this.nodeMap[node.objectid] = elem;
        }
        if (i % maxRowCount == 0) {
          colI++;
        }

        i++;
      });

      //资源连线
      for (let i = 0; i < linkList.length; i++) {
        let link = linkList[i];

        let aNode = this.nodeMap[link.aFacilityId];
        let zNode = this.nodeMap[link.zFacilityId];

        if (aNode && zNode) {
          let edge = new ht.Edge();
          edge.setSource(aNode);
          edge.setTarget(zNode);
          dataTopo.push(edge);
        }
      }

      if (this.$refs) {
        if (this.$refs.instanceSchemaTopo) {
          let schemaGraphView = this.$refs.instanceSchemaTopo.getGraph();
          schemaGraphView.setLayoutType('hierarchical');
        }
      }

      this.graphData = dataTopo;
    },

    getResSpecByLayerNo(layerNo) {
      let res = null;
      for (let i = 0; i < this.schemaSpecData.length; i++) {
        let resObj = this.schemaSpecData[i];
        //console.info("resType="+resObj.resType);
        if (layerNo === resObj.layerNo + '-AGS') {
          //resSpec = resObj.resType;
          res = resObj;
          break;
        }
      }
      return res;
    },

    clickNode(node) {
      console.log(node);
    },
    menuSource(node) {
      return [
        {
          label: this.$t('VIEW_ALL'),
          type: 'ALL',
          visible: true,
          action: data => this.viewDeviceType(data),
        },
        {
          label: this.$t('VIEW_PIPELINE'),
          type: 'PIPELIN',
          visible: true,
          action: data => this.viewDeviceType(data),
        },
        {
          label: this.$t('VIEW_CABLE'),
          type: 'CABLE',
          visible: true,
          action: data => this.viewDeviceType(data),
        },
      ];
    },

    viewDeviceType(item) {
      console.info('click right menu:' + item.type);
      this.anysisMapData(this.mapResData, item.type);
    },
    selectMode() {
      //console.log('select-mode');
    },
  },
  watch: {
    schemaId: {
      deep: true,
      immediate: true,
      handler(val, old) {
        //this.loadDeviceTopoList(val);
        this.loadResSpecBySchemaId(val);
      },
    },
    mapResData: {
      deep: true,
      immediate: true,
      handler(val, old) {
        //this.loadDeviceTopoList(val);
        console.info('mapResData is load.>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        this.anysisMapData(val);
      },
    },
  },
};
</script>

<style>
</style>