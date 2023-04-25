<template>
    <div class="cs-block">
        <div class="topoContent col-md-8">
            <TopoTemplate ref="poleTopo" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" :tool-buttons="toolButtonsData" @click-tool-node="clickToolNode" @click-node="clickNode" @select="selectMode"></TopoTemplate>
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
                        <div class="selection-body"></div>
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
const directiveConfig = {
    east: [500, 250],
    west: [100, 250],
    north: [300, 50],
    south: [300, 450],
};
const nodeSize = [200, 200];
export default {
    name: 'poleTopo',
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
            graphData: [],
            selectNode: null,
            toolButtonsData: [
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
            ],
            tabIndex: 0,
            tabList: [
                {
                    num: 0,
                    tabName: this.$t('OSP_MAP_FUNCTION_TOPO_TAB_0'),
                },
                {
                    num: 1,
                    tabName: this.$t('OSP_MAP_FUNCTION_TOPO_TAB_1'),
                },
            ],
            gridData: [],
            gridOption: {},
        };
    },
    mounted() {
        if (this.resId) {
            this.loadPoleTopoList(this.resId);
        }
    },
    created() {},
    methods: {
        loadPoleTopoList(facilityId) {
            if (!this.resId) {
                return;
            }
            let datas = {
                facilityId: facilityId,
            };

            let url = 'edesign/rivt/facilitysection/query/' + facilityId + '/wireholesection/v1';
            console.info('load url=' + url);

            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data.resultCode === '0') {
                        this.drawPoleData(data.resultList);
                    }
                },
            });
        },

        drawPoleData(tempData) {
            let postX = 300;
            let postY = 300;
            let dataTopo = [];
            let dataList = [];
            let wireHoleInfo = tempData.wireHoleInfo ? tempData.wireHoleInfo : null;

            let width = 100;
            let height = 200;
            let shapeType = wireHoleInfo.shapeType ? wireHoleInfo.shapeType : 'S';
            let elem = new ht.Node();
            elem.movable = false;
            elem.setAttrObject(wireHoleInfo);
            elem.setName(wireHoleInfo.name);
            elem.setSize(width, height);
            elem.setPosition(postX, postY);
            elem.setStyle('shape', 'rect');
            elem.setStyle('label.offset.x', 6);
            elem.setStyle('shape.background', '#FFFFFF');
            elem.setStyle('shape.border.width', 1);
            elem.setStyle('shape.border.color', '#CCCCCC');
            elem.setStyle('vector.outline.width', '5');
            dataTopo.push(elem);
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
        clickToolNode(eventName) {
            if (eventName === 'addDevice') {
                if (this.selectNode) {
                    let selNodeType = this.selectNode.getAttr('NODE_TYPE');
                    if (selNodeType === 'POLE') {
                        this.addDevice(eventName);
                    } else {
                        fish.info(this.$t('OSP_MAP_FUNCTION_POLE_NODE_MSG'));
                    }
                } else {
                    fish.info(this.$t('OSP_MAP_FUNCTION_POLE_NODE_MSG'));
                }
            } else if (eventName === 'addCable') {
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
                this.loadPoleTopoList(val);
            },
        },
    },
};
</script>

<style lang="scss" scoped>
// @import './ManholeTopo.scss';
</style>
