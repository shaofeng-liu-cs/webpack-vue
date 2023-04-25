<template>
    <div class="topo-content">
        <TopoView ref="schemaResourceTopo" :show-toolbar="false" :menu-source="initMenus" :graphView="graphView"> </TopoView>
    </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import { isLine } from '../../../base/utils/util';
import { loadSchemaResource } from '../TopoHandleAction';
import * as GlobalConst from '../../../base/utils/GlobalConst';

export default {
    name: 'SchemaResourceTopo',
    components: {
        TopoView,
    },
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

        this.graphView.getView().addEventListener('click', e => {
            let data = this.graphView.getDataAt(e);
            if (data) {
                let attrObject = data.getAttrObject();
                if (!isLine(attrObject.resType)) {
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
            //type:cable 缆线；support:管道；
            let params = {
                schemaId: this.params.projectId,
                type:this.params.type || 'cable',
                mapNo: this.params.mapNo,
            };

            let resource = loadSchemaResource(params);

            Promise.all([resource]).then(datas => {
                let lineList = datas[0].lineList || [];
                let pointList = datas[0].pointList || [];
                if (this.dataModel){
                    this.dataModel.clear();
                }
                this.drawRourceTopo(pointList, lineList);
                
            });

        },

        drawRourceTopo(resList, lineList){
            //先画点
            resList.forEach(res => {
                let resType = res.resType;
                let resId = res.resId;
                let resName = res.name;
                let isCutted = res.isCutted;
                let imgUrl = `oss_core/edesign/assets/image/topo-business/res/dark/${resType}.png`;
                if (isCutted === 'Y') {
                    imgUrl = `oss_core/edesign/assets/image/topo-business/res/dash/${resType}.png`;
                }
                //未选型的点；
                if(!resId) {
                    resId = res.gisKey;
                    imgUrl = `oss_core/edesign/assets/image/topo-business/res/grey/${resType}.png`;
                }

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
                this.dataModel.add(node);

            });

            //画线
            lineList.forEach(line => {
                let resType = line.resType;
                let resId = line.resId;
                if (!isLine(resType) && this.dataModel.getDataByTag(resId)) {
                    return;
                }
                let aResId = '';
                let zResId = '';
                let aDataNode;
                let zDataNode;
                if (resId) {
                    aResId = line.aResId;
                    zResId = line.zResId;
                    aDataNode = this.dataModel.getDataByTag(aResId);
                    zDataNode = this.dataModel.getDataByTag(zResId);
                }
                else {
                    aResId = line.aResId || line.aGisKey;
                    zResId = line.zResId || line.zGisKey;
                    aDataNode = this.dataModel.getDataByTag(aResId);
                    zDataNode = this.dataModel.getDataByTag(zResId);
                }

                if (aDataNode && zDataNode) {
                    let link = this.addEdge(aDataNode, zDataNode, line);
                    if (aResId===zResId) {
                        link.setStyle('label.position', 3);
                        link.setStyle('label.offset.y', -32);
                        link.setStyle('label.offset.x', 25);
                        link.setStyle('edge.gap',25);
                        link.setStyle('edge.source.offset.x',32);
                        link.setStyle('edge.target.offset.x',32);
                        link.setStyle('edge.source.offset.y',-32);
                        link.setStyle('edge.target.offset.y',-32);
                    }
                }
                
            });


            let mode = this.hasCloseCircle() ? 'hierarchical' : 'towardeast';
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

                this.graphView.setTranslateY(-50);
            });
        },

        hasCloseCircle() {
            let isClosed = false;
            let currentNode = this.dataModel.getDataByTag(this.params.resId);
            let nodes = [];
            if (currentNode) {
                isClosed = this.findClosedNode(currentNode, null, nodes);
            }
            return isClosed;
        },

        findClosedNode(currentNode, preEdge, nodes) {
            let isFind = false;
            nodes.push(currentNode);
            let edges = currentNode.getEdges();
            // if (edges) {
            // 	for (let edge in edges._as) {
            // 		if (edge != preEdge) {
            // 			let nextNode = edge.getSource() === currentNode ? edge.getTarget() : edge.getSource();
            // 			if (nodes.indexOf(nextNode) != -1) {
            // 				isFind = true;
            // 				break;
            // 			}
            // 			isFind = this.findClosedNode(nextNode, edge, nodes);
            // 		}
            // 	}
            // }
            // return isFind;

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
            let isGisRes = 'N';
            let resId = data.resId;
            if (!resId) {
                resId = data.gisKey;
                isGisRes = 'Y'; //未选型的
            }
            let edge = new ht.Edge();
            edge.setName(data.resName || data.name);
            edge.setSource(aNode);
            edge.setTarget(zNode);
            edge.setAttrObject(data);
            if (GlobalConst.RES_TYPE_DUCT === resType) {
                //管道
                if (isGisRes==='Y') {
                    //未选型的
                    edge.setStyle('edge.dash', true);
                    edge.setStyle('edge.dash.color', '#cccccc');
                }
                else {
                    edge.setStyle('edge.dash', true);
                    edge.setStyle('edge.dash.color', '#ff5c0a');
                }
            }
            else {
                if (isLogic === 'Y') {
                    //逻辑光缆
                    edge.setStyle('edge.dash', true);
                    edge.setStyle('edge.dash.color', '#ff9218');
                    edge.setStyle('label.position', 3);
                }
                else if (isGisRes==='Y') {
                    //未选型的
                    edge.setStyle('edge.color', '#cccccc');
                    edge.setStyle('label.position', 3);
                }
                else {
                    edge.setStyle('edge.color', 'blue');
                    edge.setStyle('label.position', 3);
                }
            }
            edge.setStyle('label.position', 3);

            edge.setTag(resId);
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
.topo-content {
    width:100%;
    height:100%;
}
@import '../topo-template/scss/topoTemplate.scss';
</style>
