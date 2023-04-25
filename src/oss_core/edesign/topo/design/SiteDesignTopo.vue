<template>
    <div class="topo-content">
        <TopoView ref="siteDesignTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick" :roomCloseCallBack="closeDrawer"></TopoView>
        <SelectDevice :schemaId="params.schemaId" ref="selectDevice" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></SelectDevice>
        <CreateRoom :schemaId="params.schemaId" ref="createRoom" @refreshEvent="doAfterAddResCR" @refreshClose="doAfterCloseCR"></CreateRoom>
    </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import SelectDevice from '../../osp/topo-control/device_design/selectDevice.vue';
import CreateRoom from '../../osp/topo-control/site-design/CreateRoom.vue';
import { saveTopo, loadTopoData } from '../TopoUtil';
import { bindCableToDevice, rebindCableToDevice, rebindDeviceToRoom } from '../TopoHandleAction.js';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { deleteGraphic } from '../../../edesign/osp/domain/ResEventHandler.js';
import { queryPointRelaResInfo } from '@/oss_core/edesign/api/query/resId.js';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const INNER_RES_TYPES = ['ROOM', 'OLT', 'ODF', 'F_CABLE'];
const ROOM_SIZE = { width: 300, height: 300 }; //机房大小
const START_POSITION = { x: 50, y: 50 }; //TOPO起始

export default {
    name: 'SiteDesignTopo',
    components: {
        TopoView,
        SelectDevice,
        CreateRoom,
    },
    props: {
        params: Object,
    },
    provide() {
        return {
            getDesignEl: () => this.$el, //节点
            getDeviceDesignEl: () => this.$el, //节点
        };
    },
    inject: {
        getSiteInfo: {
            default: () => {},
        },
    },
    computed: {
        siteInfo() {
            return this.getSiteInfo();
        },
    },
    data() {
        return {
            isAdding: false, //绘制状态标准
            addingObject: null, //当前绘制对象
            tempObjects: [], //绘制过程中的一些临时对象
            topoData: {}, // TOPO元素位置数据
            topoId: 'SITE-DESIGN' + this.params.resId,
            siteData: null, //站点基本信息
            roomList: [], //机房信息
            nodeInfo: null,
            lastRoomPosition: null,
            selectedRoomObject: null, //选中的机房
            startPost: null,
            endPost: null,
            selectedDeviceNode: null,
            toolButtons: [
                {
                    id: 'ROOM',
                    name: 'ROOM',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/ROOM.png',
                    title: this.$t('NEW_ROOM'),
                    event: 'ROOM',
                },
                {
                    id: 'OLT',
                    name: 'OLT',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/OLT.png',
                    title: 'OLT',
                    event: 'OLT',
                },
                {
                    id: 'ODF',
                    name: 'ODF',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/ODF.png',
                    title: 'ODF',
                    event: 'ODF',
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
                this.showRoomPanel(e.data);
            } else if (e.kind === 'clickBackground') {
                this.closeDrawer();
                this.clearUseData();
            } else if (e.kind === 'doubleClickBackground') {
                //双击背景空白展示site站点右侧信息
                this.showRoomPanel(this.params.resType);
            }
        });

        this.graphView.getView().addEventListener('mouseup', e => {
            let p = this.graphView.lp(e);
            if (this.selectedDeviceNode) {
                this.endPost = {
                    x: p.x,
                    y: p.y,
                };
            }
            this.moveDevice();
        });

        this.graphView.getView().addEventListener('mousemove', e => {
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

        // window.addEventListener('click', e => {
        //     this.dataModel.getSelectionModel().clearSelection();
        //     let data = this.graphView.getDataAt(e);
        //     if (data) {
        //         this.showRoomPanel(data);
        //         this.dataModel.getSelectionModel().appendSelection(this.nodeInfo);
        //     }
        // });
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
        if (this.params.resId && this.params.schemaId) {
            saveTopo(this.params.schemaId, this.topoId, this.dataModel);
        }
    },

    methods: {
        initData() {
            this.startPost = null;
            this.endPost = null;
            this.lastRoomPosition = null;
            this.outerCableIndex = 0;
        },
        loadTopo() {
            this.initData();
            if (this.dataModel) {
                this.dataModel.clear();
            }
            let params = {
                resId: this.params.resId,
                resType: this.params.resType,
                queryCable: 'Y',
                mapNo: this.params.mapNo,
                schemaId: this.params.schemaId,
            };
            let p1 = loadTopoData(this.topoId);
            let p2 = queryPointRelaResInfo(params); //查询站点关联资源
            this.siteData = this.siteInfo.site;
            this.roomList = this.siteInfo.roomList || [];
            Promise.all([p1, p2]).then(datas => {
                let topoData = datas[0];
                let innerResList = datas[1].innerResList || [];
                let cableList = datas[1].cableList || [];
                let logicCableList = datas[1].logicCableList || [];
                let linkList = datas[1].innerLinkList ||[];

                //机房
                this.drawSitePanel();
                //内部资源
                this.drawRoomInnerDevice(innerResList, topoData, logicCableList);

                this.drawRoomInnerLink(linkList);

                this.drawOuterCable(cableList, logicCableList);
            });
        },

        //画站点中的机房
        drawSitePanel() {
            let index = 0;

            this.roomList.forEach(data => {
                let roomPosition = {};
                let roomNode = this.drawRoom(data);
                let roomPosX = START_POSITION.x + index * (ROOM_SIZE.width + 50) + ROOM_SIZE.width / 2;
                roomNode.setPosition(roomPosX, START_POSITION.y + ROOM_SIZE.height / 2);
                roomPosition.x = roomPosX;
                roomPosition.y = START_POSITION.y + ROOM_SIZE.height / 2;
                this.lastRoomPosition = roomPosition;
                index++;
            });
        },

        drawRoom(data) {
            let name = data.name || data.fullName || data.resName;
            let node = new ht.Node();
            node.setLayer(LAYER0);
            node.setPosition(START_POSITION.x + ROOM_SIZE.width / 2, START_POSITION.y + ROOM_SIZE.height / 2);
            node.setName(name);
            node.setSize(ROOM_SIZE.width, ROOM_SIZE.height);
            node.setStyle('label.scale', 1);
            node.setStyle('shape', 'rect'); //矩形
            node.setStyle('shape.background', '#ece9f2');
            node.setStyle('shape.border.width', 2);
            node.setStyle('shape.border.color', '#f29e08');
            node.setStyle('label.font', GlobalConst.LABEL_FONT_16);
            //node.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
            node.setStyle('select.type', 'shadow');
            node.setStyle('shadow.offset.x', 0);
            node.setStyle('shadow.offset.y', 0);
            node.setStyle('shadow.blur', 5);
            node.setStyle('label.position', 3);
            node.setStyle('label.offset.y', -10);

            node.setTag(data.resId);
            node.movable = false;
            data.isInner = true;
            //data.resType = data.resSpecId;
            data.baseSpecId = 'ROOM';
            node.setAttrObject(data);
            this.dataModel.add(node);
            return node;
        },

        drawRoomInnerLink:function (linkList){
            linkList.forEach(innerRes => {
                this.drawInnerLink(innerRes);
            });
        },

        drawRoomInnerDevice(innerResList, topoData, logicCableList) {
            let index = 0;
            innerResList.forEach(innerRes => {
                let resType = innerRes.resType;
                if (GlobalConst.RES_TYPE_F_CABLE === resType || GlobalConst.RES_TYPE_COPPER_CABLE === resType) {
                    this.drawInnerCable(innerRes, logicCableList);
                } else {
                    let deviceNode = this.drawInnerDevice(innerRes, topoData, 'S');
                }
            });
        },

        drawOuterCable(cableList, logicCableList) {
            // 光缆数据
            cableList.forEach(cable => {
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
            });
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

        getRoomNode(roomId) {
            let roomNode = this.dataModel.getDataByTag(roomId);
            return roomNode;
        },

        initMenus(selectedDatas) {
            let menus = [];
            if (selectedDatas.size() === 1) {
                let baseSpecId = selectedDatas.get(0).getAttr('baseSpecId');
                let isOuterCable = selectedDatas.get(0).getAttr('isOuterCable');
                let isInner = selectedDatas.get(0).getAttr('isInner');
                let isShowDelButton = this.isAllowDealButton('DEL', baseSpecId, selectedDatas.get(0));
                if (baseSpecId === 'DEVICE') {
                    menus.push({
                        label: 'Design',
                        visible: true,
                        action: () => {
                            let attrObject = selectedDatas._as[0]._attrObject;
                            let param = {
                                resId: attrObject.resId,
                                resType: attrObject.resSpecId ? attrObject.resSpecId : attrObject.resType,
                                resName: attrObject.resName ? attrObject.resName : attrObject.name,
                                schemaId: this.params.schemaId,
								sprintId:this.params.sprintId,
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
                                this.deleteRes(selectedDatas);
                            },
                        });
                    }
                }

                if (isOuterCable && selectedDatas.get(0).getEdges()) {
                    menus.push({
                        label: 'Rebind',
                        visible: true,
                        action: this.rebindCableToDevice,
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
         * designOrdState  A:在网 C:设计：
         */
        isAllowDealButton(dealType, dealObjType, node) {
            let isDealFlag = false;
            let attr;
            let nodeRefType = '';
            let projectSchemaId = '';
            let designOrdState = '';
            if (node) {
                attr = node.getAttrObject();
                nodeRefType = attr.refType ? attr.refType : 'N';
                projectSchemaId = attr.designOrdId || '';
                designOrdState = attr.designOrdState;
            }

            if (dealType === 'ADD') {
                //引用只允许做连接，不能增加机房设备；增加设备时，则需要判断, 本方案下可增加
                if (dealObjType === 'ROOM') {
                    if (this.siteData.refType === 'U' || this.siteData.designOrdId === this.params.schemaId) {
                        isDealFlag = true;
                    }
                } else if (dealObjType === 'DEVICE') {
                    if (projectSchemaId === this.params.schemaId) {
                        isDealFlag = true;
                    } else {
                        if (nodeRefType !== 'R' && designOrdState === 'A') {
                            isDealFlag = true;
                        }
                    }
                }
            } else if (dealType === 'DEL') {
                if (projectSchemaId === this.params.schemaId) {
                    isDealFlag = true;
                } else {
                    if (!dealObjType === 'ROOM') {
                        if (nodeRefType !== 'U') {
                            isDealFlag = true;
                        }
                    }
                }
            }
            return isDealFlag;
        },

        //判断节点是否可操作；比如删除。。。
        // 主要引用、利旧时，取designOrdId 表示创建时的schemaId;
        isAllowDeal(node) {
            let isDealFlag = true;
            let attr = node.getAttrObject();
            let projectSchemaId = attr.designOrdId || ''; //利旧 创建schemaId与当前schemaId不同时，表示利旧
            let isRefer = attr.isRefer || 'N'; //'Y' 为引用

            if (projectSchemaId !== this.params.schemaId || isRefer === 'Y') {
                isDealFlag = false;
            }
            return isDealFlag;
        },

        deleteRes(selectedDatas) {
            //fish.confirm(this.$t('MAKE_SURE_REMOVE_RESOURCES'), () => {
            let param = {
                graphic: [],
            };
            let refCount = 0;
            selectedDatas.each(data => {
                let isRef = data.getAttr('isRefer');
                refCount = isRef === 'Y' ? refCount + 1 : refCount;
                param.graphic.push({
                    resType: data.getAttr('resSpecId') || data.getAttr('resType'),
                    resId: data.getAttr('resId'),
                    schemaId: this.params.schemaId,
					sprintId: this.params.sprintId,
                });
            });
            if (refCount > 0) {
                fish.info(this.$t('CANNOT_DEL_REF_DATA'));
                return;
            }
            //如果删除room,找出room下的设备；
            let roomChildList = [];
            selectedDatas.each(data => {
                if (data.getAttr('baseSpecId') === 'ROOM') {
                    let childList = this.findRoomChildNode(data);
                    roomChildList = roomChildList.concat(childList);
                }
            });

            deleteGraphic(param).then(() => {
                fish.toast('success', this.$t('DELETE_SUCCESS'));
                selectedDatas.each(data => {
                    this.dataModel.remove(data);
                    if (data.getAttr('resType') === 'ROOM') {
                        let roomId = data.getAttr('resId');
                        let indexRoom = '';
                        this.roomList.some((room, index) => {
                            if (room.roomId === roomId) {
                                indexRoom = index;
                                return true;
                            }
                        });
                        this.roomList.splice(indexRoom, 1);
                    }
                });
                //删除room时，同时将room下的资源传给资源树
                roomChildList.forEach(data => {
                    param.graphic.push({
                        resType: data.getAttr('resSpecId') || data.getAttr('resType'),
                        resId: data.getAttr('resId'),
                        schemaId: this.params.schemaId,
						sprintId: this.params.sprintId,
                    });
                });
                this.loadTopo();
                this.$emit('resEvent', param.graphic, 'del');
            });

            //});
        },

        drawOuterCablePoint(data, azEnd, isThrough) {
            let index = this.outerCableIndex || 0;
            let x = START_POSITION.x + 10 + index * 80;
            let y = START_POSITION.y + ROOM_SIZE.height + 100;
            this.outerCableIndex = index + 1;

            let resName = data.resName;
            let node = new ht.Node();
            node.setLayer(LAYER1);
            node.setName(`${resName}(${azEnd})`);
            node.setToolTip(`${resName}(${azEnd})`);
            node.setPosition(x, y);
            node.setStyle('shape', 'circle');
            node.setStyle('shape.background', isThrough ? '#30c1a1' : '#c1911c');
            //node.setStyle('shape.border.color', '#5675C1');
            node.setStyle('shape.border.width', 0);
            node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            node.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
            node.setStyle('label.offset.y', 10);
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
            let name = node.getAttrObject().name || node.getAttrObject().resName;
            edge.setToolTip(name);
            edge.setLayer(LAYER1);
            edge.setSource(node);
            edge.setTarget(deviceNode);
            edge.setStyle('edge.width', 2);
            edge.setStyle('edge.color', '#08bcc1');
            edge.setStyle('edge.type', 'points');
            let points = [
                {
                    x: node.getPosition().x,
                    y: node.getPosition().y - 50,
                },
                {
                    x: deviceNode.getPosition().x - 1,
                    y: node.getPosition().y - 50,
                },
                {
                    x: deviceNode.getPosition().x - 1,
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

        redrawOuterCableWhenMoveDevice() {
            let node = this.dataModel.getSelectionModel().getFirstData();
            if (node) {
                let edges = this.dataModel.getSelectionModel().getFirstData().getEdges();
                edges &&
                    edges.each(edge => {
                        if (edge.getAttr('isOuterCableEdge')) {
                            let points = edge.getStyle('edge.points')._as;
                            if (points.length <= 2) {
                                points[1].y = node.getPosition().y;
                                edge.setStyle('edge.points', points);
                            } else {
                                points[1].x = node.getPosition().x - 1;
                                //points[1].y = node.getPosition().y;
                                points[2].x = node.getPosition().x - 1;
                                points[2].y = node.getPosition().y;
                                edge.setStyle('edge.points', points);
                            }
                        }
                    });
            }
        },
        //要增加的设备node;
        findRoomNode(node) {
            let roomObject = null;
            let points = node.getPosition();
            let nodeList = this.dataModel.getDatas()._as;
            for (let i = 0; i < nodeList.length; i++) {
                let elem = nodeList[i];
                let attr = elem.getAttrObject();
                if (attr.baseSpecId === 'ROOM') {
                    let roomPosition = elem.getPosition();
                    let roomSize = elem.getSize();
                    let roomLeft = roomPosition.x - roomSize.width / 2;
                    let roomTop = roomPosition.y - roomSize.height / 2;
                    if (points.x > roomLeft && points.x < roomLeft + roomSize.width && points.y > roomTop && points.y < roomTop + roomSize.height) {
                        roomObject = elem;
                        break;
                    }
                }
            }
            return roomObject;
        },

        findRoomChildNode(node) {
            let roomChildList = [];
            let nodeAttr = node.getAttrObject();
            let nodeList = this.dataModel.getDatas()._as;
            for (let i = 0; i < nodeList.length; i++) {
                let elem = nodeList[i];
                let attr = elem.getAttrObject();
                if (attr.resType != 'ROOM' && attr.roomId === nodeAttr.roomId) {
                    roomChildList.push(elem);
                }
            }
            return roomChildList;
        },

        clickNode(node) {
            this.selectedDeviceNode = null;
            if (this.isAdding && this.addingObject && node) {
                let baseSpecId = node.getAttr('baseSpecId');
                let addingResType = this.addingObject.getAttr('resType');
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
                        if (baseSpecId !== 'DEVICE' && baseSpecId !== 'ROOM') {
                            fish.toast('warn', 'Please select the end device!');
                            return;
                        }

                        // 2021-5-20-lp 内部设计限制新建相同az端的光缆
                        let aNode = this.addingObject.getSource();
                        let aResId = aNode.getAttr('resId');
                        let zResId = node.getAttr('resId');
                        if (aResId === zResId) {
                            fish.toast(
                                'warn',
                                'Cannot create a cable with the same A/Z device in the inner design, please select a different device!'
                            );
                            return;
                        }

                        this.addingObject.setTarget(node);
                        this.addCableInRes();
                    }
                } else if (addingResType === 'ODF' || addingResType === 'OLT' || addingResType === 'F_CLOSURE') {
                    this.selectedRoomObject = this.findRoomNode(node);
                    if (this.selectedRoomObject) {
                        let isAllAddFlag = this.isAllowDealButton('ADD', 'DEVICE', this.selectedRoomObject);
                        if (isAllAddFlag) {
                            this.addResInRoom();
                            this.selectedDeviceNode = node;
                        } else {
                            fish.toast('warn', this.$t('NOT_ADD_RESOURCE'));
                            this.cancelAddingResOperation();
                        }
                    }
                } else if (addingResType === 'BIND_CABLE') {
                    if (!this.addingObject.getSource()) {
                        if (!node.getAttr('isOuterCable')) {
                            fish.toast('warn', 'Please select one in-site cable!');
                            return;
                        }

                        if (node.getAttr('isThrough')) {
                            // 直通的光缆不能Bind
                            fish.toast('warn', 'The cable is a direct through support site and cannot bind!');
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
                }
            } else if (node && node instanceof ht.Edge) {
                let cableId = node.getAttr('resId');
                let edges = this.dataModel.getDatas()._as.filter(data => data instanceof ht.Edge && data.getAttr('resId') === cableId);
                this.dataModel.getSelectionModel().ss(edges);
            } else if (node && node instanceof ht.Node) {
                let baseSpecId = node.getAttr('baseSpecId');
                if (baseSpecId === 'DEVICE') {
                    this.selectedDeviceNode = node;
                }
            }

            if (this.selectedDeviceNode) {
                this.startPost = {
                    x: this.selectedDeviceNode.getPosition().x,
                    y: this.selectedDeviceNode.getPosition().y,
                };
            }
        },

        addRoomInSite() {
            let resType = 'ROOM';
            let siteId = this.params.resId;
            let addingRes = {
                resType: resType,
                formList: [],
                latitude: this.siteData.latitude,
                longitude: this.siteData.longitude,
                siteId: this.siteData.siteId,
                siteName: this.siteData.name,
                areaId: this.siteData.areaId || '',
                areaIdDesc: this.siteData.areaIdDesc || '',
            };
            let parentRes = {
                resId: siteId,
                resType: this.params.resType,
            };

            this.$refs.createRoom.setResData(addingRes, parentRes);
            this.$refs.createRoom.roomPopu.show = true;
            this.$refs.createRoom.show = true;
        },

        addCableInRes() {
            let resType = this.addingObject.getAttr('resType');
            if (GlobalConst.RES_TYPE_F_CABLE === resType) {
                let addingRes = {
                    resType: resType,
                    longitude: this.siteData.longitude ? this.siteData.longitude.toFixed(6) : '',
                    latitude: this.siteData.latitude ? this.siteData.latitude.toFixed(6) : '',
                    formList: [],
                    areaId: this.siteData.areaId || '',
                    areaIdDesc: this.siteData.areaIdDesc || '',
                };
                addingRes.length = 10;
                addingRes.aResSpecId = this.addingObject.getSource().getAttr('resType');
                addingRes.aDeviceId = this.addingObject.getSource().getAttr('resId');
                addingRes.aDeviceName = this.addingObject.getSource().getAttr('resName');
                addingRes.zResSpecId = this.addingObject.getTarget().getAttr('resType');
                addingRes.zDeviceId = this.addingObject.getTarget().getAttr('resId');
                addingRes.zDeviceName = this.addingObject.getTarget().getAttr('resName');
                addingRes.resFlag = 'INV';

                let parentRes = {
                    resId: this.params.resId,
                    resType: this.params.resType,
                };
                this.$refs.selectDevice.setResData(addingRes, parentRes);
                this.$refs.selectDevice.CompPopuTopo.show = true;
                this.$refs.selectDevice.show = true;
            }
        },

        addResInRoom() {
            if (this.selectedRoomObject) {
                let attrRoom = this.selectedRoomObject.getAttrObject();
                let resType = this.addingObject.getAttr('resType');
                let addingRes = {
                    resType: resType,
                    formList: [],
                    latitude: this.siteData.latitude,
                    longitude: this.siteData.longitude,
                    roomId: attrRoom.roomId,
                    roomName: attrRoom.name,
                    siteId: this.siteData.siteId,
                    siteName: this.siteData.name,
                    areaId: this.siteData.areaId || '',
                    areaIdDesc: this.siteData.areaIdDesc || '',
                };

                let parentRes = {
                    resId: this.siteData.siteId,
                    resType: 'SITE',
                };
                this.$refs.selectDevice.setResData(addingRes, parentRes);
                this.$refs.selectDevice.CompPopuTopo.show = true;
                this.$refs.selectDevice.show = true;
            } else {
                fish.warn(this.$t('MSG_ADDDEVICE_ROOM'));
                this.cancelAddingResOperation();
            }
        },
        //绑定光缆AZ端；
        bindCableToDevice(target) {
            let source = this.addingObject.getSource();
            let resType = target.getAttr('resSpecId') || target.getAttr('resType');
            let resId = target.getAttr('resId');
            let azEnd = source.getAttr('azEnd');
            //let isAEnd = source.getName().endsWith('(A)');
            let schemaId = this.params.schemaId;
            let param = {
                endFlag: azEnd,
                resType: resType,
                resId: resId,
                cableId: source.getAttr('resId'),
                schemaId: schemaId,
                mapNo: this.params.mapNo,
            };
            //调用服务修改光缆AZ端。
            bindCableToDevice(param).then(result => {
                this.drawOuterCableToInnerDevice(source, resId, azEnd, false);
                if (azEnd) {
                    source.setAttr('aResSpecId', resType);
                    source.setAttr('aResId', resId);
                } else {
                    source.setAttr('zResSpecId', resType);
                    source.setAttr('zResId', resId);
                }
            });
            this.cancelAddingResOperation();
        },
        //解除光缆AZ端；
        rebindCableToDevice() {
            let data = this.dataModel.getSelectionModel().getFirstData();
            if (data) {
                let azEnd = data.getAttr('azEnd');
                let param = {
                    endFlag: azEnd,
                    resType: this.params.resType,
                    resId: this.params.resId,
                    cableId: data.getAttr('resId'),
                    schemaId: this.params.schemaId,
                    mapNo: this.params.mapNo,
                };
                //调用服务修改光缆AZ端。
                rebindCableToDevice(param).then(result => {
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
                });
            }
        },

        toolbarClick(eventName) {
            this.cancelAddingResOperation(); //先清除临时对象
            if (INNER_RES_TYPES.indexOf(eventName) != -1) {
                if (eventName === 'F_CABLE') {
                    this.isAdding = true;
                    fish.toast('info', 'Please select the start device!');
                    this.addingObject = this.buildTempEdge(eventName);
                } else if (eventName === 'ROOM') {
                    //判断是否允许新增；
                    let isAllAddFlag = this.isAllowDealButton('ADD', 'ROOM', null);
                    if (!isAllAddFlag) {
                        fish.toast('warn', this.$t('NOT_ADD_RESOURCE'));
                        return;
                    }
                    this.addRoomInSite();
                } else {
                    //判断是否允许新增；
                    // let isAllAddFlag = this.isAllowDealButton('ADD', 'DEVICE', null);
                    // if (!isAllAddFlag) {
                    //     fish.toast('warn', this.$t('NOT_ADD_RESOURCE'));
                    //     return;
                    // }
                    this.isAdding = true;
                    this.addingObject = this.buildTempNode(eventName);
                }
            } else if (eventName === 'BIND') {
                fish.toast('info', 'Please select one in-site cable!');
                this.isAdding = true;
                this.addingObject = this.buildTempEdge('BIND_CABLE');
            } else if (eventName === 'refresh') {
                this.saveAndRefreshTopo();
            }
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
        drawInnerLink:function (data){
            let edges = [];
            let startNode = this.dataModel.getDataByTag(data.aResId);
            let endNode = this.dataModel.getDataByTag(data.zResId);
			let tagId = data.aResId +"-"+data.zResId;
            if (startNode == null || endNode == null) {
                return;
            }
			if(this.dataModel.getDataByTag(tagId)){
				return ;
			}
            let edge = new ht.Edge();
			edge.setTag(tagId);
            edge.setToolTip(data.resName);
            edge.setLayer(LAYER1);
            edge.setSource(startNode);
            edge.setTarget(endNode);
            edge.setStyle('edge.width', 2);
            edge.setStyle('edge.type', 'ortho2');
            edge.setStyle('edge.center', true);
            edge.setStyle('edge.color', 'black');
            edge.setStyle('edge.dash', true);
            edge.setStyle('edge.dash.pattern', [10, 10]);
            edge.setStyle('edge.dash.color', '#ffffff');
            edge.setStyle('edge.offset', 6);
            edge.setStyle('select.color', 'red');
            data.isInner = true;
            data.baseSpecId = 'CABLE';
            edge.setAttrObject(data);
            this.dataModel.add(edge);
            edges.push(edge);
            return edges;
        },

        drawInnerDevice(data, topoData, typeVal) {
            let resType = data.resType;
            let resName = data.resName;
            let resId = data.resId;
            let parentId = data.roomId;
            let parentNode = this.dataModel.getDataByTag(parentId);
            let roomPosition = parentNode.getPosition();
            let roomSize = parentNode.getSize();
            let seq = parentNode.getChildren().size();
            let node = new ht.Node();
            node.setLayer(LAYER1);
            node.setName(resName);
            node.setSize(32, 32);
            node.setImage(`oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`);

            if (topoData[resId]) {
                //判断如果设备在机房外面，则调整设备位置；
                let devX = topoData[resId].x;
                let devY = topoData[resId].y;
                if (
                    devX < roomPosition.x - roomSize.width / 2 ||
                    devX > roomPosition.x + roomSize.width / 2 ||
                    devY < roomPosition.y - roomSize.height / 2 ||
                    devY > roomPosition.y + roomSize.height / 2
                ) {
                    devX = roomPosition.x - parentNode.getSize().width / 2 + 40;
                    devY = roomPosition.y - parentNode.getSize().height / 2 + 40 + seq * 40;
                }
                node.setPosition(devX, devY);
            } else {
                let devX = roomPosition.x;
                let devY = roomPosition.y;
                if (typeVal === 'S') {
                    devX = roomPosition.x - parentNode.getSize().width / 2 + 40;
                    devY = roomPosition.y - parentNode.getSize().width / 2 + 40 + seq * 40;
                }
                node.setPosition(devX, devY);
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
            node.setParent(parentNode);
            node.setAttrObject(data);
            this.dataModel.add(node);
            return node;
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

        doAfterAddRes(datas) {
            if (datas && datas.length > 0) {
                let index = 0;
                datas.forEach(data => {
                    data.resName = data.resInfo.name;
                    let resType = data.resInfo.resSpecId;
                    if (GlobalConst.RES_TYPE_F_CABLE === resType || GlobalConst.RES_TYPE_COPPER_CABLE === resType) {
                        let params = {
                            resType: resType,
                            resSpecId: resType,
                            resId: data.resId,
                            resName: data.resInfo.name,
                            aResId: data.resInfo.aDeviceId,
                            zResId: data.resInfo.zDeviceId,
                            designOrdId: this.params.schemaId,
                            schemaId: this.params.schemaId,
                            refType: '',
                        };
                        this.drawInnerCable(params, []);
                    } else {
                        let params = {
                            resType: resType,
                            resSpecId: resType,
                            resId: data.resId,
                            resName: data.resInfo.name,
                            roomId: data.resInfo.roomId,
                            siteId: data.resInfo.siteId,
                            designOrdId: this.params.schemaId,
                            schemaId: this.params.schemaId,
                            refType: '',
                        };
                        let node = this.drawInnerDevice(params, {}, 'A');
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

        doAfterAddResCR(datas) {
            if (datas && datas.length > 0) {
                let index = 0;
                datas.forEach(data => {
                    let resType = data.resType;
                    let params = data.resInfo;
                    params.resSpecId = resType;
                    params.resId = data.resInfo.roomId;
                    params.resType = data.resType;
                    params.designOrdId = this.params.schemaId; //新增时，将schemaId带入；
                    params.refType = ''; //新增时，将schemaId带入；
                    params.schemaId = this.params.schemaId;
                    let roomNode = this.drawRoom(params);

                    let roomNum = this.roomList.length;
                    let roomPosX = START_POSITION.x + roomNum * (ROOM_SIZE.width + 50) + ROOM_SIZE.width / 2;
                    roomNode.setPosition(roomPosX, START_POSITION.y + ROOM_SIZE.height / 2);
                    this.roomList.push(params);
                });
            }
            this.doAfterCloseCR();
        },

        doAfterCloseCR() {
            this.cancelAddingResOperation();
        },

        clearUseData() {
            this.selectedRoomObject = null;
            this.selectedDeviceNode = null;
            this.startPost = null;
            this.endPost = null;
        },
        backStartPosition() {
            this.selectedDeviceNode.setPosition(this.startPost.x, this.startPost.y);
        },
        moveDevice() {
            //this.startPost
            //this.endPost
            if (this.selectedDeviceNode) {
                let roomId = this.selectedDeviceNode.getAttrObject().roomId;
                let sourceRoom = this.getRoomNode(roomId);
                let targRoom = this.findRoomNode(this.selectedDeviceNode);
                if (targRoom) {
                    if (targRoom.getAttrObject().roomId !== roomId) {
                        fish.confirm(
                            this.$t('MAKE_SURE_MOVE_ROOM'),
                            () => {
                                let resType = this.selectedDeviceNode.getAttrObject().resType;
                                let resId = this.selectedDeviceNode.getAttrObject().resId;
                                //修改设备机房；
                                let param = {
                                    resFlag: 'INV',
                                    actionType: 'M',
                                    resType: resType,
                                    resId: resId,
                                    schemaId: this.params.schemaId,
                                    resInfo: {
                                        deviceId: resId,
                                        roomId: targRoom.getAttrObject().roomId,
                                    },
                                    mapNo: this.params.mapNo,
                                };
                                rebindDeviceToRoom(param).then(
                                    result => {
                                        this.selectedDeviceNode.setAttr('roomId', targRoom.getAttrObject().roomId);
                                    },
                                    e => {
                                        this.backStartPosition();
                                    }
                                );
                            },
                            () => {
                                this.backStartPosition();
                            }
                        );
                    }
                } else {
                    fish.warn(this.$t('MSG_OUT_ROOM'));
                    this.backStartPosition();
                }
            }
        },

        saveAndRefreshTopo() {
            let _this = this;
            if (this.graphView) {
                this.graphView.setZoom(1);
                this.graphView.setTranslateX(0);
                this.graphView.setTranslateY(0);
                // 切换前保存
                if (this.dataModel.getDatas().size() !== 0) {
                    saveTopo(this.params.schemaId, this.topoId, this.dataModel).then(() => {
                        _this.dataModel.clear();
                        _this.loadTopo();
                    });
                }
            } else {
                this.loadTopo();
            }
        },
        refreshSize() {
            this.graphView.setZoom(1);
            this.graphView.setTranslateY(1);
        },
        showRoomPanel(current) {
            let isClickNode = false;
            if (typeof current !== 'string') {
                if (
                    current.getAttrObject().baseSpecId === 'ROOM' ||
                    current.getAttrObject().baseSpecId === 'DEVICE' ||
                    current.getAttrObject().resType === 'F_CABLE'
                ) {
                    if ((this.nodeInfo && this.nodeInfo !== current) || !this.nodeInfo) {
                        this.$refs.siteDesignTopo.$refs.roomPanel.setData(current, this.params.schemaId);
                    }
                    this.nodeInfo = current;
                    this.$refs.siteDesignTopo.roomDrawer = true;
                    isClickNode = true;
                }
            } else if (current === 'SITE') {
                this.$refs.siteDesignTopo.$refs.roomPanel.setData(this.params, this.params.schemaId);
                this.$refs.siteDesignTopo.roomDrawer = true;
                isClickNode = true;
            }
            if (!isClickNode) {
                this.$refs.siteDesignTopo.roomDrawer = false;
                this.nodeInfo = null;
            }
        },

        closeDrawer() {
            this.$refs.siteDesignTopo.roomDrawer = false;
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
