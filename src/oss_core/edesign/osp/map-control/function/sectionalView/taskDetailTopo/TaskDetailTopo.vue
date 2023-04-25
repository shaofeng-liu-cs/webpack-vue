<template>
    <div class="cs-block">
        <div class="stateConent">
            <span class="linkInfo" v-for="(item, index) in proceStateDataList" :key="index"><img :src="`${item.icon}`" /> {{ item.stateDesc }}</span>
        </div>
        <div class="flowTopoBox">
            <TopoTemplate ref="taskDetailTopo" :data-source="graphData" :show-toolbar="false" :show-right-menu="false" :menu-source="menuSource" :tool-buttons="toolButtonsData" @click-tool-node="clickToolNode" @click-node="clickNode" @select="selectMode"></TopoTemplate>
        </div>
    </div>
</template>

<script>
import TopoTemplate from '@/oss_core/edesign/topo/topo-template/TopoTemplate.vue';
export default {
    name: 'taskDetailTopo',
    components: {
        TopoTemplate,
    },
    props: {
        resId: {
            type: String,
            default: '',
        },
    },
    model: {
        prop: 'resId',
        event: 'input',
    },
    data() {
        return {
            isShow: false,
            graphData: [],
            toolButtonsData: [],
            lastNodeCode: '',
            proceStateDataList: [
                {
                    id: '1',
                    seq: '01',
                    stateDesc: 'Start',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce01.png',
                },
                {
                    id: '2',
                    seq: '02',
                    stateDesc: 'Not Beginning',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce02.png',
                },
                {
                    id: '3',
                    seq: '03',
                    stateDesc: 'Processing',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce03.png',
                },
                {
                    id: '4',
                    seq: '04',
                    stateDesc: 'Finsh on Time',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce04.png',
                },
                {
                    id: '5',
                    seq: '05',
                    stateDesc: 'Archive',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce05.png',
                },
                {
                    id: '6',
                    seq: '06',
                    stateDesc: 'Complete On-Time',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce06.png',
                },
                {
                    id: '7',
                    seq: '07',
                    stateDesc: 'Delayed',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce07.png',
                },
                {
                    id: '8',
                    seq: '08',
                    stateDesc: 'Execution Exception',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce08.png',
                },
                {
                    id: '9',
                    seq: '09',
                    stateDesc: 'Obsolete',
                    icon: 'oss_core/edesign/assets/image/topo-business/flow/proce09.png',
                },
            ],
        };
    },
    mounted() {},
    created() {},
    methods: {
        loadFlowEndState() {
            return new Promise((resolve, reject) => {
                let url = 'edesign/sprint/settings/sprintEndState/SPRINT_END_STATE/v1';
                fish.ajax({
                    url: url,
                    type: 'GET',
                    contentType: 'application/json',
                    success: data => {
                        if (data) {
                            // 避免数据污染
                            this.lastNodeCode = data;
                            resolve();
                        }
                    },
                });
            });
        },

        loadTaskProcessData(resId) {
            if (!resId) {
                return;
            }

            let loadParamData = this.loadFlowEndState();

            Promise.all([loadParamData]).then(() => {
                let datas = JSON.stringify({
                    schemaId: resId,
                });
                console.info('process datas:');
                console.info(datas);
                let url = 'edesign/flow/queryschemaflowlistinfo/v1';
                console.info('task detail process topo url=' + url);
                fish.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        schemaId: resId,
                    }),
                    success: data => {
                        console.info('task detail process topo query result:');
                        console.info(data);
                        if (data) {
                            // 避免数据污染
                            this.drawTaskProcessData(data);
                        }
                    },
                });
            });
        },
        drawTaskProcessData(dataObj) {
            let dataTopo = [];
            let count = 0;
            let posX = 70;
            let posY = 100;
            let spacValue = 150;
            let flowFinishState = false;
            let preNodeInfo = {
                stateName: 'Start',
                icon: 'oss_core/edesign/assets/image/topo-business/res/start_en.png',
            };
            let lastNodeInfo = {
                stateName: 'End',
                icon: 'oss_core/edesign/assets/image/topo-business/res/end_en.png',
            };
            let flowList = dataObj.beforeSchemaFlowList || [];
            let flowNodeCount = flowList.length;
            let preNode = this.createNode(dataTopo, 'Node', 'Start');
            preNode.setAttrObject(preNodeInfo);
            preNode.movable = true;
            preNode.setSize(127, 69);
            preNode.setPosition(posX, posY);
            preNode.setImage(preNodeInfo.icon);

            for (let i = 0; i < flowList.length; i++) {
                let id = i + 1;
                let nodeInfo = flowList[i];
                let strNodeName = nodeInfo.stateName;
                let iNode = this.createNode(dataTopo, 'Node', strNodeName);
                iNode.setAttrObject(nodeInfo);
                iNode.movable = true;
                iNode.setSize(60, 60);
                iNode.setPosition(posX + (i + 1) * spacValue, posY);
                if (nodeInfo.icon) {
                    iNode.setImage(nodeInfo.icon);
                }
                if (preNode) {
                    this.createEdge(dataTopo, preNode, iNode);
                }
                if (this.lastNodeCode === nodeInfo.currentState) {
                    flowFinishState = true;
                }
                preNode = iNode;
            }

            if (flowFinishState) {
                let lastNode = this.createNode(dataTopo, 'Node', 'End');
                lastNode.setAttrObject(lastNodeInfo);
                lastNode.movable = true;
                lastNode.setSize(127, 69);
                lastNode.setPosition(posX + (flowNodeCount + 1) * spacValue, posY);
                lastNode.setImage(lastNodeInfo.icon);

                this.createEdge(dataTopo, preNode, lastNode);
            }

            if (this.$refs) {
                if (this.$refs.taskDetailTopo) {
                    let gv = this.$refs.taskDetailTopo.getGraph();
                    gv.setLayoutType('false');
                }
            }

            this.graphData = dataTopo;
        },

        createNode(dm, type, name, parent) {
            var node = null;
            if (type === 'Node') node = new ht.Node();
            else if (type === 'Group') node = new ht.Group();
            node.movable = true;
            if (name) node.setName(name);
            if (parent) node.setParent(parent);
            //dm.add(node);
            dm.push(node);
            return node;
        },

        createEdge(dm, sourceNode, targetNode) {
            var edge = new ht.Edge(sourceNode, targetNode);
            edge.s({
                'edge.width': 2,
                'edge.color': 'white',
                'edge.dash.3d': true,
                'edge.dash': true,
                'edge.dash.width': 6,
                'edge.dash.pattern': [16, 0],
                'edge.dash.color': 'green',
                'edge.dash.3d.color': 'yellow',
                'edge.center': false,
                'edge.type': 'ortho',
            });
            dm.push(edge);
            return edge;
        },

        clickNode(node) {},
        clickToolNode(menuNode) {},
        selectMode() {},

        menuSource(node) {
            return [
                {
                    label: this.$t('TEST'),
                    visible: true,
                    action: data => this.viewDevice(data),
                },
            ];
        },
    },
    watch: {
        resId: {
            deep: true,
            immediate: true,
            handler(val, old) {
                this.loadTaskProcessData(val);
            },
        },
    },
};
</script>

<style lang="scss" scoped>
@import './TaskDetailTopo.scss';
</style>
