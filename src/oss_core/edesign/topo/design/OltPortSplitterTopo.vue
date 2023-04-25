<template>
    <div class="topo-content">
        <TopoView ref="portSplitterTopo" :show-toolbar="true" :menu-source="initMenus" :graphView="graphView" @click-toolbar="toolbarClick"> </TopoView>
    </div>
</template>
<script>
import TopoView from '../topo-template/TopoView.vue';
import { isLine } from '../../../base/utils/util';
import { loadSplitterByPort } from '../TopoHandleAction';
import * as GlobalConst from '../../../base/utils/GlobalConst';
const LAYER0 = 0; //建筑物结构
const LAYER1 = 1; //连接线
const LAYER2 = 2; //端口
const LAYERS = [LAYER0, LAYER1, LAYER2];

export default {
    name: 'PortSplitterTopo',
    components: {
        TopoView,
    },
    props: {
        params: Object,
    },
    data() {
        return {
            portCount:0,
            loadTopoParams:null,
        };
    },
    created() {
        this.dataModel = new ht.DataModel();
        this.graphView = new ht.graph.GraphView(this.dataModel);
        this.graphView.enableToolTip();
        this.graphView.setMovableFunc(elem => elem.movable);

        this.graphView.addInteractorListener(e => {
            if (e.kind === 'betweenMove') {
                //拖拽
                this.redrawEdgeWhenMoveNode();
            }
        });

        this.graphView.getView().addEventListener('click', e => {
            let data = this.graphView.getDataAt(e);
            if (data) {

            }
        });
    },
    mounted() {

    },
    methods: {
        loadGraphTopo(params) {
            let index = 0;
            if (this.dataModel){
                this.dataModel.clear();
            }
            this.loadTopoParams = params;
            let portList = params.portList || [];
            this.portCount = portList.length;
            let oltPortRect = null;
            let odfPortRect = null;
            if (this.portCount === 0) {
                return;
            }
            if (this.portCount > 0) {
                let rectWidth = this.portCount * 55;
                let rectHeight = 50;
                if (this.portCount < 12) {
                    rectWidth = 700;
                }
                let posX = rectWidth/2 + 100;
                let posY = 700;

                let oltData = {
                    name:'OLT',
                }
                oltPortRect = this.drawRect(this.dataModel,oltData, rectWidth, rectHeight, posX, posY);
                let odfPosX = rectWidth/2 + 100;
                let odfPosY = 600;
                let odfData = {
                    name:'ODF',
                }
                odfPortRect = this.drawRect(this.dataModel,odfData, rectWidth, rectHeight, odfPosX, odfPosY);
            }
            let condParams = [];
            portList.forEach(port => {
                condParams.push(port.portId);
            });
            let resource = loadSplitterByPort(condParams, params.schemaId);
            Promise.all([resource]).then(datas => {
                let dataList = datas[0].resultList || [];
                this.drawTopo(dataList, oltPortRect, odfPortRect,);
            });

        },

        drawTopo(dataList, oltPortRect, odfPortRect) {

            let indexI = 0;
            let splitterPostX = 0;
            let splitterPostY = 0;
            let splitterHeight = 0;
            let startY = 50;
            let width = oltPortRect.getSize().width;
            let count = dataList.length;
            let preSplitterHeight = 0;
            let maxPostX = 0;
            for (let i = 0; i < count; i++){
                let modeNum = (i % 2);
                let colNum = Math.floor(i/2);
                let data = dataList[i];
                let oltPort = null;
                let odfPort = null;
                let oltPortNode =null;
                let odfPortNode=null;
                let oltPostX = oltPortRect.getPosition().x - width/2 + 50/2 + i*50;
                let oltPostY = oltPortRect.getPosition().y;
                let odfPostX = odfPortRect.getPosition().x - width/2 + 50/2 + i*50;
                let odfPostY = odfPortRect.getPosition().y;

                let oltPortList = data.filter(item => item.resType==='OLT');
                let odfPortList = data.filter(item => item.resType==='ODF');
                let splitterList = data.filter(item => item.resType==='SPLITTER' && item.parentType==='ODF');
                

                if (oltPortList.length > 0) {
                    oltPort = oltPortList[0];
                }
                if (odfPortList.length > 0) {
                    odfPort = odfPortList[0];
                }
                if (oltPort) {
                    oltPortNode = this.drawPort(this.dataModel,oltPort, oltPortRect, oltPostX, oltPostY);
                }
                if (odfPort) {
                    odfPortNode = this.drawPort(this.dataModel,odfPort, odfPortRect, odfPostX, odfPostY);
                }

                if (!oltPort || !odfPort) {
                    continue;
                }

                

                let edge = this.createEdge(this.dataModel,oltPortNode,odfPortNode,'OO');

                if (splitterList.length>0){
                    modeNum = (indexI % 2);
                    colNum = Math.floor(indexI/2);
                    
                    let splitter = splitterList[0];
                    let splitterId = splitter.resId;
                    let splitter2List = data.filter(item => item.resType === 'SPLITTER' && item.parentType === 'SPLITTER' && item.parent === splitterId);
                    

                    let childCount = splitter2List.length;
                    splitterHeight = childCount * 32;
                    if (splitterHeight > preSplitterHeight) {
                        preSplitterHeight = splitterHeight;
                    }

                    splitterPostX = odfPortNode.getPosition().x + (colNum *400);
                    if (splitterPostX > maxPostX) {
                        maxPostX = splitterPostX;
                    }

                    splitterPostX = maxPostX + (colNum *400);

                    let splitterPostY = modeNum * 32 + startY + (splitterHeight-32)/2 + modeNum * (preSplitterHeight-32); 

                    let splitterNode = this.drawNode(this.dataModel, splitter, null, splitterPostX, splitterPostY);
                    splitterNode.setStyle('label.position',3);
                    let edgeS = this.createEdge(this.dataModel,odfPortNode,splitterNode,'OS');
                    //二级分光器
                    for (let j = 0; j < childCount; j++){
                        let child = splitter2List[j];
                        let childPostX = splitterPostX + 200;
                        let childPostY = j * 32 + startY + modeNum * (preSplitterHeight);
                        //let childPostY = startY + indexJ*30 + splitterHeight  + countIndex * 32 + 16;
                        let childNode = this.drawNode(this.dataModel, child, splitterNode, childPostX, childPostY);
                        childNode.setStyle('label.position',20);
                        let edgeS = this.createEdge(this.dataModel,splitterNode,childNode,'SS');
                    }
                    indexI++;
                }
            }

            
        },

        drawTopo_BAK1(dataList, oltPortRect, odfPortRect) {

            let indexI = 0;
            let splitterPostX = 0;
            let splitterPostY = 0;
            let splitterHeight = 0;
            let startY = 50;
            let width = oltPortRect.getSize().width;
            let count = 4;
            for (let i = 0; i < count; i++){
                let modeNum = (i % 2);
                let colNum = Math.floor(i/2);
                let seq = i + 1;
                let oltPortNode =null;
                let odfPortNode=null;
                let oltPostX = oltPortRect.getPosition().x - width/2 + 50/2 + i*50;
                let oltPostY = oltPortRect.getPosition().y;
                let odfPostX = odfPortRect.getPosition().x - width/2 + 50/2 + i*50;
                let odfPostY = odfPortRect.getPosition().y;
                let oltPort={
                    resId:'20210422_OLT_'+i,
                    resName:i,
                    resType:'OLT',
                    seq:seq,
                };
                if (oltPort) {
                    oltPortNode = this.drawPort(this.dataModel,oltPort, oltPortRect, oltPostX, oltPostY);
                }
                let odfPort={
                    resId:'20210422_ODF_'+i,
                    resName:i,
                    resType:'ODF',
                    seq:seq,
                };
                if (odfPort) {
                    odfPortNode = this.drawPort(this.dataModel,odfPort, odfPortRect, odfPostX, odfPostY);
                }

                let edge = this.createEdge(this.dataModel,oltPortNode,odfPortNode,'OO');

                let splitter = {
                    resId:'20210422_S_'+ seq,
                    resName:'20210422_S_'+ seq,
                    resType:'SPLITTER',
                    seq:seq,
                    parentId:'20210422_ODF_'+ seq,
                    parentType:'ODF',
                };
                let childCount = 8;
                splitterHeight = childCount * 32;
                let splitterPostX = odfPortNode.getPosition().x + (colNum *400);

                let splitterPostY = modeNum * 32 + startY + (splitterHeight-32)/2 + modeNum * (splitterHeight-32); 

                let splitterNode = this.drawNode(this.dataModel, splitter, null, splitterPostX, splitterPostY);
                splitterNode.setStyle('label.position',3);
                let edgeS = this.createEdge(this.dataModel,odfPortNode,splitterNode,'OS');
                
                for (let j = 0; j < childCount; j++){
                    let child = {
                        resId:'20210422_S_'+ seq +"_"+ j,
                        resName:'20210422_S_'+ seq +"_"+ j,
                        resType:'SPLITTER',
                        seq:seq,
                        parentId:'20210422_S_'+ seq,
                        parentType:'SPLITTER',
                    };
                    let childPostX = splitterPostX + 200;
                    let childPostY = j * 32 +startY + (modeNum*splitterHeight);
                    //let childPostY = startY + indexJ*30 + splitterHeight  + countIndex * 32 + 16;
                    let childNode = this.drawNode(this.dataModel, child, splitterNode, childPostX, childPostY);
                    childNode.setStyle('label.position',20);
                    let edgeS = this.createEdge(this.dataModel,splitterNode,childNode,'SS');
                }
            }

            
        },

        drawRect(box, data, width, height, posX, posY) {
            let node = new ht.Node();
            node.setSize(width, height);
            node.setPosition(posX, posY);
            node.setStyle('shape', 'rect');
            node.setStyle('shape.background', '#EFF2EF');
            node.setStyle('shape.border.color', '#969698');
            node.setStyle('shape.border.width', 2);
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 17);
            node.movable = false;
            if (data) {
                node.setAttrObject(data);
            }
            box.add(node);
            return node;
        },

        drawPort(box, data, parent, posX, posY) {
            let node = new ht.Node();
            node.setName(data.seq);
            node.setToolTip(data.resName);
            node.setLayer(LAYER2);
            node.setSize(32, 32);
            node.setPosition(posX, posY);
            node.setStyle('shape', 'circle');
            node.setStyle('shape.background', '#e8f3ff');
            node.setStyle('shape.border.color', '#5675C1');
            node.setStyle('shape.border.width', 2);
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 17);
            node.movable = false;
            node.setTag(data.resId);
            node.setAttrObject(data);
            if (parent) {
                node.setParent(parent);
                node.setHost(parent);
            }
            box.add(node);
            return node;
        },

        drawNode(box, data, parent, posX, posY) {
            let node = new ht.Node();
            node.setName(data.resName);
            node.setToolTip(data.resName);
            node.setLayer(LAYER2);
            node.setSize(32, 32);
            node.setPosition(posX, posY);
            node.setImage(`oss_core/edesign/assets/image/topo-business/port/${data.resType}.png`);
            // if (data.portUse==='0'){
            //     node.setImage(`oss_core/edesign/assets/image/topo-business/port/${data.resType}_DOWN.png`);
            // }
            // else if (data.portUse==='1'){
            //     node.setImage(`oss_core/edesign/assets/image/topo-business/port/${data.resType}_UP.png`);
            // }
            // else {
            //     node.setImage(`oss_core/edesign/assets/image/topo-business/port/${data.resType}.png`);
            // }
            node.setStyle('label.font', '12px Tahoma');
            node.setStyle('label.position', 31);
            node.movable = true;
            node.setTag(data.resId);
            node.setAttrObject(data);
            if (parent) {
                node.setParent(parent);
                node.setHost(parent);
            }
            box.add(node);
            return node;
        },
        //connType: 
        //OO:OLT-ODF  OS:ODF-SPLITTER  SS:SPLITTER-SPLITTER
        createEdge(box, source, target, connType){
            let edge = new ht.Edge();
            edge.setLayer(LAYER1);
            edge.setSource(source);
            edge.setTarget(target);
            edge.setStyle('edge.type', 'ortho2');
            edge.setStyle('edge.center', true);
            edge.setStyle('edge.color', '#08bcc1');
            edge.setStyle('edge.dash', true);
            edge.setStyle('edge.dash.pattern', [10, 10]);
            edge.setStyle('edge.dash.color', '#ff5c0a');
            if (connType==='OO') {
                edge.setStyle('edge.type', 'ortho2');
                edge.setStyle('edge.center', true);
            }
            else if (connType==='OS') {
                let points = [
                    {x:source.getPosition().x, y:source.getPosition().y -40},
                    {x:target.getPosition().x - 40, y:source.getPosition().y -40},
                    {x:target.getPosition().x - 40, y:target.getPosition().y}];
                edge.setStyle('edge.type', 'points');
                edge.setStyle('edge.points', points);
            }
            else if (connType==='SS') {
                let points = [
                    {x:source.getPosition().x + 100, y:source.getPosition().y},
                    {x:source.getPosition().x + 100, y:target.getPosition().y}];
                edge.setStyle('edge.type', 'points');
                edge.setStyle('edge.points', points);
            }
            edge.setAttr('linkType', connType);
            box.add(edge);
            return edge;
        },

        redrawEdgeWhenMoveNode(){
            let node = this.dataModel.getSelectionModel().getFirstData();
            if (node) {
                let edges = this.dataModel.getSelectionModel().getFirstData().getEdges();
                 edges &&
                    edges.each(edge => {
                        if (edge.getAttr('linkType')==='OS') {
                            let source = edge.getSource();
                            let target = edge.getTarget();
                            let points = [
                                {x:source.getPosition().x, y:source.getPosition().y -40},
                                {x:target.getPosition().x - 40, y:source.getPosition().y -40},
                                {x:target.getPosition().x - 40, y:target.getPosition().y}];
                            edge.setStyle('edge.points', points);
                        }
                        if (edge.getAttr('linkType')==='SS') {
                            let source = edge.getSource();
                            let target = edge.getTarget();
                            let points = [
                                {x:source.getPosition().x + 100, y:source.getPosition().y},
                                {x:source.getPosition().x + 100, y:target.getPosition().y}];
                            edge.setStyle('edge.points', points);
                        }
                    });
            }
        },

        clickNode(node) {
            console.log(node);
        },

        initMenus(node) {
            return [];
        },

        toolbarClick(eventName) {
            if (eventName==='refresh'){
                this.loadGraphTopo(this.loadTopoParams);
            }
        },

        selectMode() {
            console.log('select-mode');
        },
    },
    watch: {
		params:{
			deep:true,
			immediate:false,
			handler(val,old) {
				//this.loadGraphTopo(this.loadTopoParams);
			}
		}
	},

}
</script>

<style lang="scss" scoped>
.topo-content {
    width:100%;
    height:100%;
}
@import '../topo-template/scss/topoTemplate.scss';
</style>