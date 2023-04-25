<template>
  <div class="topo-content">
    <TopoView
      ref="schemaResourceRouteTopo"
      :toolButtons="toolButtons"
      :toolSelectButtons="toolSelectButtons"
      @click-toolbar="toolbarClick"
      :show-toolbar="true"
      :menu-source="initMenus"
      :graphView="graphView"
    ></TopoView>
  </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import { isLine } from '../../../base/utils/util';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { loadTopoData, saveTopo } from '@/oss_core/edesign/topo/TopoUtil';
import JSPDF from 'jspdf';
import { RES_TYPE_DUCT_B } from '../../../base/utils/GlobalConst';

export default {
  name: 'SchemaResourceRouteTopo',
  components: {
    TopoView,
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
          id: 'ALIGNED',
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
          id: 'LAYOUT',
          buttons: [
            {
              id: 'HIERARCHICAL',
              name: 'hierarchical',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/towardeast.png',
              title: 'hierarchical',
              event: 'HIERARCHICAL',
            },
            {
              id: 'TOWARD_EAST',
              name: 'towardEast',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/towardeast.png',
              title: 'towardEast',
              event: 'TOWARD_EAST',
            },
            {
              id: 'TOWARD_NORTH',
              name: 'towardNorth',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/towardnorth.png',
              title: 'towardNorth',
              event: 'TOWARD_NORTH',
            },
            {
              id: 'TOWARD_SOUTH',
              name: 'towardSouth',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/towardsouth.png',
              title: 'towardSouth',
              event: 'TOWARD_SOUTH',
            },
            {
              id: 'TOWARD_WEST',
              name: 'towardWest',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/towardwest.png',
              title: 'towardWest',
              event: 'TOWARD_WEST',
            },
          ],
        },
        {
          id: 'LINE_STYLE',
          buttons: [
            {
              id: 'STRAIGHTLINE',
              name: 'straightLine',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/straightLine.png',
              title: 'straightLine',
              event: 'STRAIGHTLINE',
            },
            {
              id: 'RIGHTANGLE',
              name: 'rightAngle',
              image: 'oss_core/edesign/assets/image/topo-tool-bar/rightAngle.png',
              title: 'rightAngle',
              event: 'RIGHTANGLE',
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
  created() {
    console.log('是什么数据：', this.params);
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc(elem => elem.movable);

    this.graphView.getView().addEventListener('click', e => {
      let data = this.graphView.getDataAt(e);
      if (data) {
        let attrObject = data.getAttrObject();
        if (!isLine(attrObject.resType) || GlobalConst.RES_TYPE_DUCT === attrObject.resType || GlobalConst.RES_TYPE_DUCT_B === attrObject.resType) {
          this.$emit('nodeClick', attrObject);
        }
      }
    });
  },
  mounted() {
    this.loadGraph();
  },
  methods: {
    loadGraph() {
      this.topoId = 'SCHEMA_RES_ROUTE_TOPO' + this.params.projectId;
      Promise.all([loadTopoData(this.topoId)]).then(datas => {
        let positionList = datas[0];
        fish.get({
          url: `edesign/topo/schemaResRoute/v3`,
          data: {
            projectId: this.params.projectId,
            schemaId: this.params.schemaId,
            mapNo: this.params.mapNo,
          },
          success: data => {
            // 先加载点
            this.dataModel.clear();
            let isSavePosition = false;

            let resList = data.RES_LIST || [];
            let linkList = data.LINK_LIST || [];
            resList.forEach(res => {
              let resType = res.resType;
              let resId = res.resId;
              let resName = res.name;
              let isCutted = res.isCutted;

              if (isLine(resType) || this.dataModel.getDataByTag(resId)) {
                return;
              }
              // let imgUrl = `oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`;
              // if (isCutted === 'Y') {
              // 	imgUrl = `oss_core/edesign/assets/image/topo-business/res/dash/${resType}.png`;
              // }
              let imgUrl = `oss_core/edesign/assets/image/topo-business/res/dash/${resType}.png`;
              res.isReferenced = res.isRefer === 'Y' ? true : false;
              let node = new ht.Node(resId);
              node.setName(resName);
              node.movable = true;
              node.setSize(45, 45);
              node.setImage(imgUrl);
              node.setAttrObject(res);
              node.setTag(resId);
              node.setStyle('select.color', 'red');
              node.setStyle('select.type', 'shadow');
              node.setStyle('shadow.offset.x', 0);
              node.setStyle('shadow.offset.y', 0);
              node.setStyle('shadow.blur', 20);
              if (positionList[resId]) {
                isSavePosition = true;
                node.setPosition(positionList[resId].x, positionList[resId].y);
              }
              this.dataModel.add(node);
            });

            // 再加线
            resList.forEach(res => {
              let resType = res.resType;
              let resId = res.resId;
              if (!isLine(resType) && this.dataModel.getDataByTag(resId)) {
                return;
              }

              let aResId = res.aResId;
              let zResId = res.zResId;
              let aData = this.dataModel.getDataByTag(aResId);
              let zData = this.dataModel.getDataByTag(zResId);
              if (aData && zData) {
                let link = this.addEdge(aData, zData, res);
                if (resId === this.params.resId) {
                  this.dataModel.getSelectionModel().ss(link);
                }
                if (aResId === zResId) {
                  link.setStyle('label.position', 3);
                  link.setStyle('label.offset.y', -32);
                  link.setStyle('label.offset.x', 25);
                  link.setStyle('edge.gap', 25);
                  link.setStyle('edge.source.offset.x', 32);
                  link.setStyle('edge.target.offset.x', 32);
                  link.setStyle('edge.source.offset.y', -32);
                  link.setStyle('edge.target.offset.y', -32);
                }
              }
            });

            linkList.forEach(res => {
              let aResId = res.aDeviceId;
              let zResId = res.zDeviceId;
              let aData = this.dataModel.getDataByTag(aResId);
              let zData = this.dataModel.getDataByTag(zResId);
              let tageId = aResId + '_' + zResId;
              if (aData && zData && aResId != zResId && !this.dataModel.getDataByTag(tageId)) {
                let edge = this.addEdge(aData, zData, res);
                edge.setStyle('edge.dash', true);
                edge.setStyle('edge.dash.color', 'white');
                edge.setStyle('label.position', 3);
                edge.setTag(tageId);
                edge.setName('');
              }
            });

            //判断Topo中是否有环
            if (!isSavePosition) {
              // let mode = this.hasCloseCircle() ? 'hierarchical' : 'towardeast';
              let mode = 'towardeast';
              let autoLayout = new ht.layout.AutoLayout(this.graphView);
              autoLayout.setOffsetX(100);
              autoLayout.getNodeSize = () => {
                return mode === 'hierarchical' ? { width: 100, height: 120 } : { width: 150, height: 90 };
              };
              autoLayout.setAnimate(true);
              autoLayout.layout(mode, () => {
                if (mode === 'hierarchical') {
                  // 横着展示
                  this.dataModel.getDatas()._as.forEach(data => {
                    if (data instanceof ht.Node) {
                      data.setPosition(data.getPosition().y, data.getPosition().x);
                    }
                  });
                }
              });
            }
            this.graphView.setTranslateY(-50);
          },
        });
      });
    },

    hasCloseCircle() {
      let isClosed = false;
      let tag = this.params.aResId ? this.params.aResId : this.params.resId;
      let currentNode = this.dataModel.getDataByTag(tag);
      let nodes = [];
      if (currentNode) {
        let resType = currentNode.getAttrObject().resType;
        if (isLine(resType)) {
          isClosed = this.findClosedLine(currentNode, null, nodes);
        } else {
          isClosed = this.findClosedNode(currentNode, null, nodes);
        }
      }
      return isClosed;
    },

    findClosedLine(currentNode, preNode, nodes) {
      let isFind = false;
      let targetNode = currentNode.getTarget();
      if (targetNode) {
        isFind = this.findClosedNode(targetNode, null, nodes);
      }
      return isFind;
    },

    findClosedNode(currentNode, preEdge, nodes) {
      let isFind = false;
      nodes.push(currentNode);
      let edges = currentNode.getEdges();
      edges &&
        edges._as.some(edge => {
          if (edge != preEdge) {
            let nextNode = edge.getSource() === currentNode ? edge.getTarget() : edge.getSource();
            if (nodes.indexOf(nextNode) != -1) {
              isFind = true;
              return true; // break
            }
            isFind = this.findClosedNode(nextNode, edge, nodes);
          }
          return isFind;
        });
      return isFind;
    },

    addEdge(aNode, zNode, data, isThrough) {
      let resType = data.resType;
      let isLogic = data.isLogic;
      let edge = new ht.Edge();
      edge.setName(data.resName || data.name);
      edge.setSource(aNode);
      edge.setTarget(zNode);
      edge.setAttrObject(data);
      if (GlobalConst.RES_TYPE_DUCT === resType) {
        //管道
        edge.setStyle('edge.dash', true);
        edge.setStyle('edge.dash.color', '#ff5c0a');
      } else {
        if (isLogic === 'Y') {
          //逻辑光缆
          edge.setStyle('edge.dash', true);
          edge.setStyle('edge.dash.color', '#ff9218');
          edge.setStyle('label.position', 3);
        }
      }
      edge.setStyle('label.position', 3);

      edge.setTag(data.resId);
      this.dataModel.add(edge);
      return edge;
    },

    clickNode(node) {
      console.log(node);
    },

    initMenus(node) {
      return [];
    },

    selectMode() {
      console.log('select-mode');
    },
    toolbarClick(eventName) {
      if (eventName === 'refresh') {
        this.loadGraph();
      } else if (eventName === 'save') {
        this.saveTopo();
      } else if (eventName === 'TOP_ALIGNED' || eventName === 'BOTTOM_ALIGNED' || eventName === 'LEFT_ALIGNED' || eventName === 'RIGHT_ALIGNED') {
        this.aligned(eventName);
      } else if (
        eventName === 'HIERARCHICAL' ||
        eventName === 'TOWARD_EAST' ||
        eventName === 'TOWARD_NORTH' ||
        eventName === 'TOWARD_SOUTH' ||
        eventName === 'TOWARD_WEST'
      ) {
        this.layout(eventName);
      } else if (eventName === 'STRAIGHTLINE' || eventName === 'RIGHTANGLE') {
        this.setLineStyle(eventName);
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
        let filename = 'SchemaResourceRoute_' + new Date().getTime() + '.' + type;
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
        let filename = 'SchemaResourceRoute_' + new Date().getTime() + '.' + type;
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
        // let pdf = new JSPDF('l', 'pt', [canvas.width, canvas.height]);
        let maxSize = canvas.width > canvas.height ? canvas.width : canvas.height;
        let pdf = new JSPDF('l', 'pt', [maxSize, maxSize]);
        //pdf.internal.scaleFactor = 1.55;
        //pdf.addImage(blobURL, 'JPEG', 0, 0, canvas.width, canvas.height);
        //this.graphView.setZoom(20);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
      }
    },
    setLineStyle: function(event) {
      if (event === 'STRAIGHTLINE') {
        this.dataModel.getDatas().each(node => {
          if (node instanceof ht.Edge) {
            node.setStyle('edge.type', 'points');
          }
        });
      } else if (event === 'RIGHTANGLE') {
        this.dataModel.getDatas().each(node => {
          if (node instanceof ht.Edge) {
            node.setStyle('edge.type', 'ortho2');
          }
        });
      }
    },
    layout: function(event) {
      let layout = 'hierarchical';
      if (event === 'HIERARCHICAL') {
        layout = 'hierarchical';
      } else if (event === 'TOWARD_EAST') {
        layout = 'towardeast';
      } else if (event === 'TOWARD_NORTH') {
        layout = 'towardnorth';
      } else if (event === 'TOWARD_SOUTH') {
        layout = 'towardsouth';
      } else if (event === 'TOWARD_WEST') {
        layout = 'towardwest';
      }

      let autoLayout = new ht.layout.AutoLayout(this.graphView);
      autoLayout.setOffsetX(100);
      autoLayout.getNodeSize = () => {
        return layout === 'hierarchical' ? { width: 100, height: 120 } : { width: 150, height: 90 };
      };
      autoLayout.setAnimate(true);
      autoLayout.layout(layout);
      this.graphView.fitContent();
    },
    saveTopo: function() {
      let p0 = saveTopo(this.params.schemaId, this.topoId, this.dataModel);
      p0.then(value => {
        fish.info(this.$t('SAVE_SUCCESS'));
      });
    },
    aligned: function(event) {
      //获取所有选中的非子节点
      let selectNodeList = this.dataModel.getSelectionModel().getSelection()._as || [];

      let nodeList = [];
      selectNodeList.forEach(selectNode => {
        if (!selectNode.getParent() && selectNode instanceof ht.Node) {
          nodeList.push(selectNode);
        }
      });

      //获取起始标准节点
      let targetPos = null;
      if (event === 'TOP_ALIGNED') {
        nodeList.forEach(node => {
          if (targetPos && targetPos > node.getPosition().y - node.getSize().height / 2) {
            targetPos = node.getPosition().y - node.getSize().height / 2;
          } else if (!targetPos) {
            targetPos = node.getPosition().y - node.getSize().height / 2;
          }
        });
      } else if (event === 'BOTTOM_ALIGNED') {
        nodeList.forEach(node => {
          if (targetPos && targetPos < node.getPosition().y + node.getSize().height / 2) {
            targetPos = node.getPosition().y + node.getSize().height / 2;
          } else if (!targetPos) {
            targetPos = node.getPosition().y + node.getSize().height / 2;
          }
        });
      } else if (event === 'LEFT_ALIGNED') {
        nodeList.forEach(node => {
          if (targetPos && targetPos > node.getPosition().x - node.getSize().width / 2) {
            targetPos = node.getPosition().x - node.getSize().width / 2;
          } else if (!targetPos) {
            targetPos = node.getPosition().x - node.getSize().width / 2;
          }
        });
      } else if (event === 'RIGHT_ALIGNED') {
        nodeList.forEach(node => {
          if (targetPos && targetPos < node.getPosition().x + node.getSize().width / 2) {
            targetPos = node.getPosition().x + node.getSize().width / 2;
          } else if (!targetPos) {
            targetPos = node.getPosition().x + node.getSize().width / 2;
          }
        });
      }
      if (targetPos) {
        if (event === 'TOP_ALIGNED') {
          nodeList.forEach(node => {
            if (node) {
              node.setPosition(node.getPosition().x, targetPos + node.getSize().height / 2);
            }
          });
        } else if (event === 'BOTTOM_ALIGNED') {
          nodeList.forEach(node => {
            if (node) {
              node.setPosition(node.getPosition().x, targetPos - node.getSize().height / 2);
            }
          });
        } else if (event === 'LEFT_ALIGNED') {
          nodeList.forEach(node => {
            if (node) {
              node.setPosition(targetPos + node.getSize().width / 2, node.getPosition().y);
            }
          });
        } else if (event === 'RIGHT_ALIGNED') {
          nodeList.forEach(node => {
            if (node) {
              node.setPosition(targetPos - node.getSize().width / 2, node.getPosition().y);
            }
          });
        }
      }
    },
  },
  // watch: {
  //     params: {
  //         deep: true,
  //         immediate: false,
  //         handler(val, oldVal) {
  //             this.loadGraph();
  //         },
  //     },
  // },
};
</script>

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
