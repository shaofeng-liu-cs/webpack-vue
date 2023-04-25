<template>
    <div class="topo-content">
        <TopoView ref="coreAssignmentTopo" :show-toolbar="true" :menu-source="initMenus" :graphView="graphView" @click-toolbar="toolbarClick"> </TopoView>
    </div>
</template>
<script>
import TopoView from '../topo-template/TopoView.vue';
import { loadPanelPortByDevice, loadTuneCoreByDevice, loadAllLinkByDevice } from '../TopoHandleAction';
const LAYER0 = 0; //面板
const LAYER1 = 1; //连接线
const LAYER2 = 2; //端口
const LAYERS = [LAYER0, LAYER1, LAYER2];
const PORT_BG_COLOR = '';
const PORT_BORDER_COLOR = '';
const PORT_UP_BG_COLOR = '';
const PORT_UP_BORDER_COLOR = '';
const PORT_DOWN_BG_COLOR = '';
const PORT_DOWN_BORDER_COLOR = '';
const CORE_BG_COLOR = '';
const CORE_BORDER_COLOR = '';
export default {
    name: 'CoreAssignmentTopo',
    components: {
        TopoView,
    },
    /**
    params:{
        resId:'210802113606892635',
        resType:'ODF',
    }
    */
    props: {
        params: Object,
    },
    data() {
        return {};
    },
    created() {
        this.dataModel = new ht.DataModel();
        this.graphView = new ht.graph.GraphView(this.dataModel);
        this.graphView.enableToolTip();
        this.graphView.setMovableFunc(elem => elem.movable);

        this.graphView.addInteractorListener(e => {
            if (e.kind === 'betweenMove') {
                //拖拽
                //this.redrawEdgeWhenMoveNode();
            }
        });

        this.graphView.getView().addEventListener('click', e => {
            let data = this.graphView.getDataAt(e);
            if (data) {
            }
        });
    },
    mounted() {
        this.loadGraphTopo();
    },
    methods: {
        loadGraphTopo() {
            if (this.dataModel) {
                this.dataModel.clear();
            }
            //let cableParam = {resId:'210802113806895355',deviceId:'210802113706893415'};
            let panelParam = {
                resId:this.params.resId,
                deviceId:this.params.resId,
                schemaId:this.params.schemaId,
            }
            let resPanel = loadPanelPortByDevice(panelParam);
            let cablePanel = loadTuneCoreByDevice(this.params);
            let resConnect = loadAllLinkByDevice(this.params);
            Promise.all([resPanel, cablePanel, resConnect]).then(datas => {
                let resPorts = datas[0];
                let resHeight = 0;
                let resWidth = 0;
                let resIndex = 0;
                let indexSeq = 0;//设备端口起始号
                //设备端口
                
                resPorts.forEach(res => {
                    let hardwareList = res.hardwareList;
                    hardwareList = hardwareList.sort((a, b) => a.seq - b.seq);
                    let portList = res.portList;
                    if (resIndex > 0) {
                        resHeight = resHeight + 120;
                        resWidth = resWidth + 150;
                    }
                    if (portList.length > 0 ) {
                        resHeight = this.loadPortTopoV(res.deviceData, hardwareList, portList || [], resHeight, indexSeq);
                        resWidth = this.loadPortTopoH(res.deviceData, hardwareList, portList || [], resWidth, indexSeq);
                        if (resIndex > 0) {
                            resHeight = resHeight - 120;
                            resWidth = resWidth - 150;
                        }
                        resIndex++;
                        indexSeq = indexSeq + portList.length;
                    }
                });
                //光缆端口
                resHeight = resHeight + 120;
                resWidth = resWidth + 150;
                let cableDatas = datas[1];
                let cableUnits = cableDatas.resultList || [];

                let tubes = cableUnits.filter(item => item.resSpecId === 'TUBE');
                let cores = cableUnits.filter(item => item.resSpecId === 'FIBER_CORE');

                resHeight = this.loadCoresTopoV(tubes, cores, resHeight);
                resWidth = this.loadCoresTopoH(tubes, cores, resWidth);
                //连接线
                let resLinks = datas[2];
                this.loadLinks(resLinks);
            });
        },

        loadPortTopoV(deviceData, hardwareList, portList, deviceHeight, indexSeq) {
            //let deviceHeight = 0;
            let indexPanel = 0;
            let panelHeight = deviceHeight;
            let deviceName = deviceData.fullName || deviceData.name;
            let hardwareCount = hardwareList.length;
            if (hardwareCount > 0) {
                hardwareList.forEach(hardware => {
                    let panelPortListV = portList.filter(port => port.hardwareId === hardware.hardwareId);
                    if (panelPortListV.length > 0) {
                        hardware.baseSpecId = 'PANEL';
                        hardware.uniqueId = hardware.hardwareId + 'V';
                        let portCount = panelPortListV.length;
                        let rectWidth = 20;
                        let rectHeight = portCount * 20;
                        let posX = 100;
                        let posY = 120 + panelHeight + rectHeight / 2 + 10 + indexPanel * 20;
                        let panelNodeV = this.drawRect(this.dataModel, hardware, rectWidth, rectHeight, posX, posY);
                        panelNodeV.baseSpecId = 'VPANEL';
                        panelNodeV.setName(hardware.fullName);
                        panelNodeV.setStyle('label', deviceName + '\n' + hardware.fullName);
                        panelNodeV.setStyle('label.rotation', 4.70);
                        panelNodeV.setStyle('shape.gradient', 'radial.center');
                        panelNodeV.setStyle('label.position', 15);
                        panelNodeV.setStyle('label.offset.x', -50);
                        panelNodeV.setStyle('label.position.fixed', true);

                        let index = 0;
                        panelPortListV.forEach(portV => {
                            let portId = portV.portId;
                            //portV.baseSpecId = 'VPORT';
                            portV.uniqueId = portId + 'V';
                            let portX = panelNodeV.getPosition().x;
                            let portY = panelNodeV.getPosition().y - rectHeight / 2 + 10 + index * 20;
                            let portVNode = this.drawPort(this.dataModel, portV, panelNodeV, portX, portY, indexSeq);
                            portVNode.baseSpecId = 'VPORT';
                            portVNode.setStyle('label.position', 17);
                            portVNode.setStyle('label.offset.x', -30);
                            index++;
                        });
                        indexPanel++;
                        panelHeight = panelHeight + rectHeight;
                    }
                });
            }
            else {
                let portCount = portList.length;
                let rectWidth = 20;
                let rectHeight = portCount * 20;
                let posX = 100;
                let posY = 120 + panelHeight + rectHeight / 2 + 10;
                let panelNodeV = this.drawRect(this.dataModel, deviceData, rectWidth, rectHeight, posX, posY);
                panelNodeV.baseSpecId = 'VPANEL';
                panelNodeV.setName(deviceName);
                //panelNodeV.setStyle('label', deviceName + '\n' + hardware.fullName);
                panelNodeV.setStyle('label.rotation', 4.70);
                panelNodeV.setStyle('shape.gradient', 'radial.center');
                panelNodeV.setStyle('label.position', 15);
                panelNodeV.setStyle('label.offset.x', -50);
                panelNodeV.setStyle('label.position.fixed', true);

                let index = 0;
                portList.forEach(portV => {
                    let portId = portV.portId;
                    //portV.baseSpecId = 'VPORT';
                    portV.uniqueId = portId + 'V';
                    let portX = panelNodeV.getPosition().x;
                    let portY = panelNodeV.getPosition().y - rectHeight / 2 + 10 + index * 20;
                    let portVNode = this.drawPort(this.dataModel, portV, panelNodeV, portX, portY, indexSeq);
                    portVNode.baseSpecId = 'VPORT';
                    portVNode.setStyle('label.position', 17);
                    portVNode.setStyle('label.offset.x', -30);
                    index++;
                });
                panelHeight = rectHeight;
            }

            deviceHeight = panelHeight;

            return deviceHeight;
        },
        loadPortTopoH(deviceData, hardwareList, portList, deviceWidth, indexSeq) {
            let indexPanel = 0;
            let panelWidth = deviceWidth;
            let deviceName = deviceData.fullName || deviceData.name;
            let hardwareCount = hardwareList.length;
            if (hardwareCount > 0) {
                hardwareList.forEach(hardware => {
                    let panelPortListH = portList.filter(port => port.hardwareId === hardware.hardwareId);
                    if (panelPortListH.length > 0) {
                        hardware.baseSpecId = 'HPANEL';
                        hardware.uniqueId = hardware.hardwareId + 'H';
                        let portCount = panelPortListH.length;
                        let rectWidth = portCount * 20;
                        let rectHeight = 20;
                        let posX = 150 + panelWidth + rectWidth / 2 + 10 + indexPanel * 20;
                        let posY = 80;
                        let panelNodeH = this.drawRect(this.dataModel, hardware, rectWidth, rectHeight, posX, posY);
                        panelNodeH.baseSpecId = 'HPANEL';
                        panelNodeH.setStyle('label', deviceName + '\n' + hardware.fullName);
                        panelNodeH.setStyle('label.position', 3);
                        panelNodeH.setStyle('label.offset.y', -20);
                        let index = 0;
                        panelPortListH.forEach(portH => {
                            let portId = portH.portId;
                            portH.baseSpecId = 'HPORT';
                            portH.uniqueId = portId + 'H';
                            let portX = panelNodeH.getPosition().x - rectWidth / 2 + 10 + index * 20;
                            let portY = panelNodeH.getPosition().y;
                            let portHNode = this.drawPort(this.dataModel, portH, panelNodeH, portX, portY, indexSeq);
                            portHNode.setStyle('label.position', 17);
                            portHNode.setStyle('label.offset.y', -20);

                            portHNode.baseSpecId = 'HPORT';
                            index++;
                        });
                        indexPanel++;
                        panelWidth = panelWidth + rectWidth;
                    }
                });
            }
            else {
                let portCount = portList.length;
                let rectWidth = portCount * 20;
                let rectHeight = 20;
                let posX = 150 + panelWidth + rectWidth / 2 + 10;
                let posY = 80;
                let panelNodeH = this.drawRect(this.dataModel, deviceData, rectWidth, rectHeight, posX, posY);
                panelNodeH.baseSpecId = 'HPANEL';
                panelNodeH.setName(deviceName + '\n');
                //panelNodeH.setStyle('label', deviceName);
                panelNodeH.setStyle('label.position', 3);
                panelNodeH.setStyle('label.offset.y', -20);
                let index = 0;
                portList.forEach(portH => {
                    let portId = portH.portId;
                    portH.baseSpecId = 'HPORT';
                    portH.uniqueId = portId + 'H';
                    let portX = panelNodeH.getPosition().x - rectWidth / 2 + 10 + index * 20;
                    let portY = panelNodeH.getPosition().y;
                    let portHNode = this.drawPort(this.dataModel, portH, panelNodeH, portX, portY, indexSeq);
                    portHNode.setStyle('label.position', 17);
                    portHNode.setStyle('label.offset.y', -20);

                    portHNode.baseSpecId = 'HPORT';
                    index++;
                });

                panelWidth = rectWidth;
            }

            deviceWidth = panelWidth + 20;

            return deviceWidth;
        },

        loadCoresTopoV(tubesList, coresList, cableHeight) {
            let indexPanel = 0;
            let panelHeight = cableHeight;
            //let cableName = cableData.fullName || cableData.name;
            tubesList.forEach(tube => {
                let panelCoreListV = coresList.filter(core => core.parentId === tube.unitId);
                if (panelCoreListV.length > 0) {
                    let cableName = tube.cableName;
                    tube.uniqueId = tube.unitId + 'V';
                    let portCount = panelCoreListV.length;
                    let rectWidth = 20;
                    let rectHeight = portCount * 20;
                    let posX = 100;
                    let posY = 120 + panelHeight + rectHeight / 2 + 10 + indexPanel * 20;
                    let panelNodeV = this.drawRect(this.dataModel, tube, rectWidth, rectHeight, posX, posY);
                    panelNodeV.baseSpecId = 'VPANEL';
                    panelNodeV.setStyle('label', cableName + '\n' + tube.fullName);
                    panelNodeV.setStyle('label.rotation', 4.70);
                    panelNodeV.setStyle('shape.gradient', 'radial.center');
                    panelNodeV.setStyle('label.position', 15);
                    panelNodeV.setStyle('label.offset.x', -50);
                    panelNodeV.setStyle('label.position.fixed', true);
                    panelNodeV.setStyle('shape', 'roundRect');

                    let index = 0;
                    panelCoreListV.forEach(coreV => {
                        let unitId = coreV.unitId;
                        //portV.baseSpecId = 'VCORE';
                        coreV.uniqueId = unitId + 'V';
                        let portX = panelNodeV.getPosition().x;
                        let portY = panelNodeV.getPosition().y - rectHeight / 2 + 10 + index * 20;
                        let coreVNode = this.drawPort(this.dataModel, coreV, panelNodeV, portX, portY, 0);
                        let colorId = coreV.colourId;
                        coreVNode.setName(coreV.fullName);
                        coreVNode.setStyle('shape.border.color', colorId);
                        coreVNode.setStyle('label.position', 17);
                        coreVNode.setStyle('label.offset.x', -40);
                        coreVNode.baseSpecId = 'VCORE';
                        index++;
                    });
                    indexPanel++;
                    panelHeight = panelHeight + rectHeight;
                }
            });

            cableHeight = panelHeight;

            return cableHeight + 20;
        },

        loadCoresTopoH(tubesList, coresList, cableWidth) {
            let indexPanel = 0;
            let panelWidth = cableWidth;
            //let cableName = cableData.fullName || cableData.name;
            tubesList.forEach(tube => {
                let panelPortListH = coresList.filter(core => core.parentId === tube.unitId);
                if (panelPortListH.length > 0) {
                    let cableName = tube.cableName;
                    tube.baseSpecId = 'HPANEL';
                    tube.uniqueId = tube.unitId + 'H';
                    let portCount = panelPortListH.length;
                    let rectWidth = portCount * 20;
                    let rectHeight = 20;
                    let posX = 150 + panelWidth + rectWidth / 2 + 10 + indexPanel * 20;
                    let posY = 80;
                    let panelNodeH = this.drawRect(this.dataModel, tube, rectWidth, rectHeight, posX, posY);
                    panelNodeH.baseSpecId = 'HPANEL';
                    panelNodeH.setStyle('label', cableName + '\n' + tube.fullName);
                    panelNodeH.setStyle('label.position', 3);
                    panelNodeH.setStyle('label.offset.y', -20);
                    panelNodeH.setStyle('shape', 'roundRect');
                    let index = 0;
                    panelPortListH.forEach(coreH => {
                        let unitId = coreH.unitId;
                        coreH.baseSpecId = 'HCORE';
                        coreH.uniqueId = unitId + 'H';
                        let portX = panelNodeH.getPosition().x - rectWidth / 2 + 10 + index * 20;
                        let portY = panelNodeH.getPosition().y;
                        let coreHNode = this.drawPort(this.dataModel, coreH, panelNodeH, portX, portY, 0);
                        let colorId = coreH.colourId;
                        coreHNode.setName(coreH.fullName);
                        coreHNode.setStyle('shape.border.color', colorId);
                        coreHNode.baseSpecId = 'HCORE';
                        coreHNode.setStyle('label.position', 17);
                        coreHNode.setStyle('label.offset.y', -20);
                        index++;
                    });
                    indexPanel++;
                    panelWidth = panelWidth + rectWidth;
                }
            });

            cableWidth = panelWidth;

            return cableWidth + 20;
        },

        loadLinks(resLinks) {
            this.loadJumpLink(resLinks.jump || []);
            this.loadTerminationLink(resLinks.portCblunitList || []);
            this.loadSpliceLink(resLinks.cblunitCblunitList || []);
        },
        loadJumpLink(links) {
            links.forEach(link => {
                let linkId = link.linkId;
                let aPortId = link.aPortId;
                let zPortId = link.zPortId;
                let isExists = this.findElement('LINK', 'linkId', linkId);
                if (isExists) {
                    return false;
                }
                let vPortId = aPortId + 'V';
                let hPortId = zPortId + 'H';
                let aPortNode = this.findElement('VPORT', 'portId', aPortId);
                let zPortNode = this.findElement('HPORT', 'portId', zPortId);

                if (aPortNode != null && zPortNode != null) {
                    let edge = new ht.Edge();
                    edge.setSource(aPortNode);
                    edge.setTarget(zPortNode);
                    edge.setStyle('edge.width', 2);
                    edge.setStyle('edge.color', 'blue');
                    edge.setStyle('edge.type', 'points');
                    let points = [
                        { x: aPortNode.getPosition().x, y: aPortNode.getPosition().y },
                        { x: zPortNode.getPosition().x, y: aPortNode.getPosition().y },
                        { x: zPortNode.getPosition().x, y: zPortNode.getPosition().y },
                    ];
                    edge.setStyle('edge.points', points);

                    edge.setLayer(LAYER1);
                    link.baseSpecId = 'LINK';
                    edge.setAttrObject(link);
                    this.dataModel.add(edge);
                }
            });
        },
        loadTerminationLink(links) {
            links.forEach(link => {
                let linkId = link.terminationId;
                let aPortId = link.portId;
                let zPortId = link.unitId;
                let isExists = this.findElement('LINK', 'terminationId', linkId);
                if (isExists) {
                    return false;
                }
                let vPortId = aPortId + 'V';
                let hPortId = zPortId + 'H';
                let aPortNode = this.findElement('VPORT', 'portId', aPortId);
                let zPortNode = this.findElement('HCORE', 'unitId', zPortId);

                if (aPortNode != null && zPortNode != null) {
                    let edge = new ht.Edge();
                    edge.setSource(aPortNode);
                    edge.setTarget(zPortNode);
                    edge.setStyle('edge.width', 2);
                    edge.setStyle('edge.color', '#08bcc1');
                    edge.setStyle('edge.type', 'points');

                    // edge.setStyle('edge.color', '#08bcc1');
                    // edge.setStyle('edge.dash', true);
                    // edge.setStyle('edge.dash.pattern', [10, 10]);
                    // edge.setStyle('edge.dash.color', '#ff5c0a');

                    let points = [
                        { x: aPortNode.getPosition().x, y: aPortNode.getPosition().y },
                        { x: zPortNode.getPosition().x, y: aPortNode.getPosition().y },
                        { x: zPortNode.getPosition().x, y: zPortNode.getPosition().y },
                    ];
                    edge.setStyle('edge.points', points);

                    edge.setLayer(LAYER1);
                    link.baseSpecId = 'LINK';
                    edge.setAttrObject(link);
                    this.dataModel.add(edge);
                }
            });
        },

        loadSpliceLink(links) {
            links.forEach(link => {
                let linkId = link.splicingId;
                let aPortId = link.aUnitId;
                let zPortId = link.zUnitId;
                let isExists = this.findElement('LINK', 'splicingId', linkId);
                if (isExists) {
                    return false;
                }
                let vPortId = aPortId + 'V';
                let hPortId = zPortId + 'H';
                let aPortNode = this.findElement('VCORE', 'unitId', aPortId);
                let zPortNode = this.findElement('HCORE', 'unitId', zPortId);

                if (aPortNode != null && zPortNode != null) {

                    //增加一个中间点，然后再连接线
                    let nodeData = {
                        resId : aPortId + '-' + zPortId,
                        aUnitId:aPortId,
                        zUnitId:zPortId,
                    };
                    let pointX = zPortNode.getPosition().x;
                    let pointY = aPortNode.getPosition().y;
                    let pointNode = this.addPointNode(this.dataModel, nodeData, pointX, pointY);
                    let link1 = link;
                    let aColor = aPortNode.getAttrObject().colourId;
                    this.addEdge(this.dataModel, link1, aPortNode, pointNode, aColor);
                    let link2 = link;
                    let zColor = zPortNode.getAttrObject().colourId;
                    this.addEdge(this.dataModel, link2, pointNode, zPortNode, zColor);

                    // let edge = new ht.Edge();
                    // edge.setSource(aPortNode);
                    // edge.setTarget(zPortNode);
                    // edge.setStyle('edge.width', 2);
                    // edge.setStyle('edge.color', '#08bcc1');
                    // edge.setStyle('edge.dash', true);
                    // edge.setStyle('edge.dash.pattern', [10, 10]);
                    // edge.setStyle('edge.dash.color', '#ff5c0a');
                    // edge.setStyle('edge.type', 'points');
                    // let points = [
                    //     { x: aPortNode.getPosition().x, y: aPortNode.getPosition().y },
                    //     { x: zPortNode.getPosition().x, y: aPortNode.getPosition().y },
                    //     { x: zPortNode.getPosition().x, y: zPortNode.getPosition().y },
                    // ];
                    // edge.setStyle('edge.points', points);
                    // edge.setLayer(LAYER1);
                    // link.baseSpecId = 'LINK';
                    // edge.setAttrObject(link);
                    // this.dataModel.add(edge);
                }
            });
        },

        addPointNode(box, data, posX, posY) {
            let node = new ht.Node();
            node.setSize(12, 12);
            node.setPosition(posX, posY);
            node.setLayer(LAYER2);
            node.setStyle('shape', 'circle');
            node.setStyle('shape.border.color', '#CCCCCC');
            node.setStyle('shape.background', '#FFFFFF');
            node.setStyle('shape.border.width', 1);
            node.setStyle('shape.type', 'circle');
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 17);
            box.add(node);
            return node;
        },

        addEdge(box, link, aPortNode,zPortNode,color){
            let edge = new ht.Edge();
            edge.setSource(aPortNode);
            edge.setTarget(zPortNode);
            edge.setStyle('edge.width', 2);
            edge.setStyle('edge.color', color);
            edge.setStyle('edge.center', true);
            edge.setLayer(LAYER0);
            link.baseSpecId = 'LINK';
            edge.setAttrObject(link);
            box.add(edge);
            return edge;
        },

        findElement: function (baseSpecId, key, objectId) {
            let portNode = null;
            let allNodes = this.dataModel.getDatas();
            allNodes.each(node => {
                let attrObject = node.getAttrObject();
                if (attrObject && node.baseSpecId === baseSpecId && attrObject[key] === objectId) {
                    portNode = node;
                    return true;
                }
            });
            return portNode;
        },

        drawRect(box, data, width, height, posX, posY) {
            let node = new ht.Node();
            let toolTip = data.fullName || data.name;
            node.setToolTip(toolTip);
            node.setSize(width, height);
            node.setPosition(posX, posY);
            node.setLayer(LAYER0);
            node.setStyle('shape', 'rect');
            node.setStyle('shape.background', '#EFF2EF');
            node.setStyle('shape.border.color', '#969698');
            node.setStyle('shape.border.width', 1);
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 17);
            node.movable = false;
            if (data) {
                node.setAttrObject(data);
            }
            box.add(node);
            return node;
        },

        drawPort(box, data, parent, posX, posY, indexSeq) {
            let node = new ht.Node();
            let resSpecId = data.resSpecId;
            let portSeq = data.seq + indexSeq;
            node.setName(portSeq);
            node.setToolTip(portSeq);
            node.setLayer(LAYER2);
            node.setSize(10, 10);
            node.setPosition(posX, posY);
            node.setStyle('shape', 'circle');
            node.setStyle('shape.background', '#e8f3ff');
            node.setStyle('shape.border.color', '#5675C1');
            node.setStyle('shape.border.width', 1);
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 17);

            if ('SPL_PORT' == resSpecId) {
                let portUse = data.portUse;
                if ('1' == portUse) {
                    //上行
                    node.setStyle('shape.border.color', 'Gold');
                } else {
                    // 下行
                    node.setStyle('shape.border.color', 'LightSeaGreen');
                }
            }

            node.movable = false;
            node.setAttrObject(data);
            if (parent) {
                node.setParent(parent);
                node.setHost(parent);
            }
            box.add(node);
            return node;
        },

        clickNode(node) {
            console.log(node);
        },

        initMenus(node) {
            return [];
        },

        toolbarClick(eventName) {
            if (eventName === 'refresh') {
                this.loadGraphTopo();
            }
        },

        selectMode() {
            console.log('select-mode');
        },
    },
    watch: {
        params: {
            deep: true,
            immediate: false,
            handler(val, old) {
                //this.loadGraphTopo(this.loadTopoParams);
            },
        },
    },
};
</script>
<style>
    @import '../topo-template/scss/topoTemplate.scss';
</style>