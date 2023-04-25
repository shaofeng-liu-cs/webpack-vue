<template>
    <div class="cs-block">
        <TopoTemplate ref="chassisTempTopo" v-if="templateType == 'CHASSIS_TEMP'" :data-source="graphData" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
const CABLE_BORDER_WIDTH = 8;
const CABLE_FILL_COLOR = '#FAFAFA';
const CABLE_OUTLINE_COLOR = '#8B8989';
const CABLE_DASH_COLOR = '#FFD306';
const CABLE_LABEL_FONT = '12px Tahoma';

const TUBE_BORDER_WIDTH = 2;
const TUBE_FILL_COLOR = '#FFFFFF';
const TUBE_OUTLINE_COLOR = '#EE00EE';
const TUBE_LABEL_FONT = '12px Tahoma';
const TUBE_LABEL_POSITION = 17;

const CORE_BORDER_WIDTH = 2;
const CORE_FILL_COLOR = '#FFFFFF';
const CORE_OUTLINE_COLOR = '#FFFFFF';
const CORE_LABEL_FONT = '12px Tahoma';
const CORE_LABEL_POSITION = 17;
export default {
    name: 'cableTemplateTopo',
    components: {
        TopoTemplate,
    },
    props: {
        paramTopo: Object,
    },
    data() {
        return {
            graphData: [],
            templateType: 'CHASSIS_TEMP',
        };
    },
    mounted() {
        //let view = this.getGraphView();
        this.loadChassisTopoList(this.paramTopo);
    },
    created() {},
    methods: {
        getGraphView() {
            //console.info("chassisTemplateTopo's getGraphView.");
            return this.$refs.chassisTempTopo.getGraphView();
        },
        loadChassisTopoList(params) {
            let datas = {
                templateId: params.templateId,
            };
            let resSpecId = params.resSpecId;
            let url = 'edesign/template/chassistemplate/v1';
            console.info('template url=' + url);

            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data) {
                        this.drawChassisTemplateData(data);
                    }
                },
                error: e => {
                    fish.error(e.responseJSON.message);
                },
            });

            this.$refs.chassisTempTopo.setEditable(true);
        },

        drawChassisTemplateData(tempData) {
            let postX = 0;
            let postY = 0;
            let dataTopo = [];
            let dataList = [];
            let objAttr = { id: '1', name: 'test', nodeType: 'chassis' };

            let width = tempData.width ? tempData.width : 300;
            let height = tempData.height ? tempData.height : 100;

            let elem = new ht.Node();
            elem.movable = true;

            elem.setAttrObject(tempData);
            elem.setName('');
            elem.setSize(width, height);
            elem.setPosition(postX, postY);
            elem.setImage('oss_core/edesign/assets/image/topo-business/chassis.png');
            this.drawGroup(dataTopo, elem, null);
            dataTopo.push(elem);

            if (this.$refs) {
                if (this.$refs.chassisTempTopo) {
                    let gv = this.$refs.chassisTempTopo.getGraph();
                    gv.setLayoutType('true');
                }
            }

            this.graphData = dataTopo;
            /*
                console.info(this.graphData);
                for (let i = 0 ;i < this.graphData.length; i++) {
                    let node = this.graphData[i];
                    console.info(node);
                    node.setSize(500,200);
                    console.info(node.getAttrObject());                    
                }
                */
        },

        drawGroup(dataTopo, elemParent, objGroup) {
            let elemGroup = new ht.Node();
            elemGroup.setAttrObject(objGroup);
            elemGroup.movable = true;
            elemGroup.setStyle('opacity', 0.7);
            elemGroup.setSize(210, 76);
            elemGroup.setPosition(0, 0);
            elemGroup.setImage('');
            elemGroup.setStyle('shape', 'rect');
            elemGroup.setStyle('shape.border.width', 1);
            elemGroup.setStyle('shape.background', '#f1f1f1');
            elemGroup.setStyle('shape.border.color', '#a6a6a6');
            elemGroup.setStyle('shape.depth', 2); //带凹凸效果的Rect形；
            elemGroup.setHost(elemParent);
            this.drawSolt(dataTopo, elemGroup, null);
            elemParent.addChild(elemGroup);
            dataTopo.push(elemGroup);
        },

        drawSolt(dataTopo, elemParent, objSolt) {
            let groupWidth = elemParent.getWidth();
            let groupHeight = elemParent.getHeight();
            let groupHeightY = elemParent.getPosition().y;
            for (let i = 0; i < 3; i++) {
                let width = groupWidth;
                let height = 25;
                let postX = 0;
                let postY = groupHeightY - groupHeight / 2 + i * height + height / 2;
                let elemSolt = new ht.Node();
                elemSolt.setAttrObject(objSolt);
                elemSolt.movable = true;
                elemSolt.setName('Slot' + i);
                elemSolt.setStyle('label.position', 17);
                elemSolt.setStyle('opacity', 0.7);
                elemSolt.setSize(width, height);
                elemSolt.setPosition(postX, postY);
                elemSolt.setImage('oss_core/edesign/assets/image/topo-business/abeam_card.png');
                elemSolt.setHost(elemParent);
                elemParent.addChild(elemSolt);
                dataTopo.push(elemSolt);
            }
        },

        clickNode(node) {
            console.log(node);
        },
        refreshTopo() {
            this.$refs.chassisTempTopo.refreshTopo();
        },
        menuSource(node) {
            return [
                {
                    label: '测试',
                    visible: true,
                    action: data => this.viewDevice(data),
                },
            ];
        },
        selectMode() {
            console.log('select-mode');
        },
    },
};
</script>

<style>
</style>