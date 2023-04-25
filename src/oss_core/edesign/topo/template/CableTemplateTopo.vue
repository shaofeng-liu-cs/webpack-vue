<template>
    <div class="cs-block">
        <TopoTemplate ref="cableTempTopo" v-if="templateType == 'CABLE_TEMP'" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
const CABLE_BORDER_WIDTH = 2;
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
        //toolButtons: Array,
        //dataSource: Array,
        paramTopo: Object,
        templateId: {
            type: String,
            default: '',
        },
        //showRightMenu: Boolean,
        //menuSource: Function
    },
    model: {
        prop: 'templateId',
        event: 'input',
    },
    data() {
        return {
            graphData: [],
            templateType: 'CABLE_TEMP',
        };
    },
    mounted() {
        if (this.templateId) {
            this.loadCableTemplateTopoList(this.templateId);
        }
    },
    created() {},
    methods: {
        loadCableTemplateTopoList(templateId) {
            this.graphData = [];
            if (!templateId) {
                return;
            }
            let datas = {
                templateId: templateId,
            };
            //let url = "/edesign/template/cabletemplate/v1";
            let url = 'edesign/template/query/cabletemplate/v1';
            //console.info("template url=" + url);

            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data) {
                        this.drawCableTemplateData(data);
                    }
                },
                error: e => {
                    fish.error(e.responseJSON.message);
                },
            });
        },

        drawCableTemplateData(tempData) {
            let postX = 0;
            let postY = 0;
            let dataTopo = [];
            let dataList = [];
            let resSpecId = tempData.resSpecId; //C_CABLE:铜缆 F_CABLE：光缆
            let diameter = tempData.diameter ? tempData.diameter : 400; //直径
            //let members = tempData.members ? tempData.members : 0;
            let width = 400; //diameter;
            let height = 400; //diameter;
            let tubes = tempData.tubeMemberTemplList || [];

            let elem = new ht.Node();
            elem.movable = false;
            elem.setName('');
            elem.setSize(width, height);
            elem.setPosition(postX, postY);
            elem.setStyle('shape', 'circle');
            elem.setStyle('vector.shape', 'circle');
            elem.setStyle('shape.background', '#f4f4f4');
            elem.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
            elem.setStyle('shape.border.color', '#CCCCCC');
            elem.setStyle('vector.outline.color', '#CCCCCC');
            elem.setStyle('select.type', 'shadow');
            elem.setStyle('shadow.offset.x', 0);
            elem.setStyle('shadow.offset.y', 0);
            elem.setStyle('shadow.blur', 2);
            elem.setStyle('shadow.color', 'red');
            if (resSpecId === 'C_CABLE') {
                let units = tempData.units;
                this.drawUnits(dataTopo, elem, units, postX, postY, width);
            } else if (resSpecId === 'F_CABLE') {
                if (tubes.length > 0) {
                    this.drawTube(dataTopo, elem, tubes, postX, postY, width);
                }
            }

            dataTopo.push(elem);

            if (this.$refs) {
                if (this.$refs.cableTempTopo) {
                    let gv = this.$refs.cableTempTopo.getGraph();
                    gv.setLayoutType('true');
                }
            }
            this.graphData = dataTopo;
        },
        drawUnits(dataTopo, parent, units, postX, postY, size) {
            let posX = parent.getPosition().x; //parent.getLocation().x;
            let posY = parent.getPosition().y;
            let diameter = parent.getSize().width;
            let radius = diameter / 2;
            let subCount = units;
            let subRadius = this.calculateSubRadius(subCount, radius);
            //需要调整的偏移值
            let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);
            for (let i = 0; i < subCount; i++) {
                let x = this.calculatePosX(posX, size / 2, radius, subCount, i, subRadius);
                let y = this.calculatePosY(posY, size / 2, radius, subCount, i, subRadius);
                let subNode = new ht.Node();
                let seq = i + 1;
                subNode.setName(seq);
                subNode.setPosition(x - postWidth, y - postWidth);
                subNode.setSize(subRadius * 2, subRadius * 2);
                subNode.setStyle('shape', 'circle');
                subNode.setStyle('vector.shape', 'circle');
                //subNode.setStyle("vector.fill.color", TUBE_FILL_COLOR);
                subNode.setStyle('shape.background', '#FFFFFF');
                subNode.setStyle('shape.border.width', 1);
                subNode.setStyle('vector.outline.color', '#B8741A');
                subNode.setStyle('vector.outline.width', TUBE_BORDER_WIDTH);
                subNode.setStyle('select.color', 'red');
                subNode.setStyle('select.type', 'shadow');
                subNode.setStyle('shadow.offset.x', 0);
                subNode.setStyle('shadow.offset.y', 0);
                subNode.setStyle('shadow.blur', 2);
                subNode.setStyle('shadow.color', 'red');

                subNode.setStyle('label.position', TUBE_LABEL_POSITION);
                subNode.setStyle('label.font', TUBE_LABEL_FONT);
                parent.addChild(subNode);
                dataTopo.push(subNode);
            }
        },
        //
        // tubes：管数
        // postX, postY:坐标
        // size:直径
        drawTube(dataTopo, parent, tubes, postX, postY, size) {
            let posX = parent.getPosition().x; //parent.getLocation().x;
            let posY = parent.getPosition().y;
            let diameter = parent.getSize().width;
            let radius = diameter / 2;
            let subCount = tubes.length;
            let subRadius = this.calculateSubRadius(subCount, radius);
            //需要调整的偏移值
            let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);
            //console.info("cable:posX" + posX +  "; posY:" + posY + ";postWidth:" + postWidth);
            for (let i = 0; i < subCount; i++) {
                let tube = tubes[i];
                let x = this.calculatePosX(posX, size / 2, radius, subCount, i, subRadius);
                let y = this.calculatePosY(posY, size / 2, radius, subCount, i, subRadius);
                //console.info("tubePosition:x" + x +  "; y:" + y);
                let subNode = new ht.Node();
                subNode.setPosition(x - postWidth, y - postWidth);
                //subNode.setSize(subWidth, subHeight);
                subNode.setSize(subRadius * 2, subRadius * 2);
                subNode.setStyle('shape', 'circle');
                subNode.setStyle('vector.shape', 'circle');
                //subNode.setStyle("vector.fill.color", TUBE_FILL_COLOR);
                subNode.setStyle('shape.background', '#CCCCCC');
                subNode.setStyle('shape.border.width', 1);
                subNode.setStyle('shape.border.color', '#B8741A');
                subNode.setStyle('vector.outline.width', TUBE_BORDER_WIDTH);
                subNode.setStyle('select.color', 'red');
                subNode.setStyle('select.type', 'shadow');
                subNode.setStyle('shadow.offset.x', 0);
                subNode.setStyle('shadow.offset.y', 0);
                subNode.setStyle('shadow.blur', 2);
                subNode.setStyle('shadow.color', 'red');

                subNode.setStyle('label.position', TUBE_LABEL_POSITION);
                subNode.setStyle('label.font', TUBE_LABEL_FONT);

                let tubeCores = tube.childMemberList || [];
                if (tubeCores.length > 0) {
                    this.drawCore(dataTopo, subNode, tubeCores, posX, posY, subRadius * 2 - 2);
                }
                parent.addChild(subNode);
                dataTopo.push(subNode);
            }
        },
        //core: 纤芯
        //postWidth:调整偏移值
        drawCore(dataTopo, parent, cores, postX, postY, size) {
            let posX = parent.getPosition().x;
            let posY = parent.getPosition().y;
            let tubeRadius = parseInt(parent.getSize().width) / 2;

            let coresCount = cores.length;
            let coreRadius = this.calculateSubRadius(coresCount, tubeRadius);

            let postWidth = this.calculatePosX(0, tubeRadius, tubeRadius, coresCount, 0, coreRadius);

            for (let i = 0; i < coresCount; i++) {
                let core = cores[i];
                let colorId = core.color;
                let xCore = this.calculatePosX(posX, tubeRadius, tubeRadius, coresCount, i, coreRadius);
                let yCore = this.calculatePosY(posY, tubeRadius, tubeRadius, coresCount, i, coreRadius);
                //console.info("corePosition:xCore" + xCore +  "; yCore:" + yCore);
                //let postNum = coresCount *2;
                let coreNode = new ht.Node();
                coreNode.setName(core.seqInTmpl);
                //coreNode.setPosition(xCore - coresCount*2, yCore - coresCount *2);
                coreNode.setPosition(xCore - postWidth, yCore - postWidth);
                coreNode.setSize(coreRadius * 2, coreRadius * 2);
                coreNode.setStyle('shape', 'circle');
                coreNode.setStyle('shape.border.width', 1);
                coreNode.setStyle('shape.background', '#FFFFFF');
                coreNode.setStyle('vector.shape', 'circle');
                //coreNode.setStyle("vector.fill.color", '#FFFFFF');
                //coreNode.setStyle("vector.outline.color", colorId);
                coreNode.setStyle('shape.border.color', colorId);

                //coreNode.setStyle("vector.outline.width", CORE_BORDER_WIDTH);
                coreNode.setStyle('label.font', CORE_LABEL_FONT);
                if (colorId === 'White') {
                    coreNode.setStyle('label.color', 'Black');
                }
                coreNode.setStyle('label.position', CORE_LABEL_POSITION);
                coreNode.setStyle('select.color', 'red');
                coreNode.setStyle('select.type', 'shadow');
                coreNode.setStyle('shadow.offset.x', 0);
                coreNode.setStyle('shadow.offset.y', 0);
                //coreNode.setStyle('shadow.blur', 2);
                coreNode.setStyle('shadow.color', 'red');

                parent.addChild(coreNode);
                dataTopo.push(coreNode);
            }
        },

        calculateSubRadius: function (subCount, radius) {
            let subRadius = radius;
            if (subCount === 1) {
                subRadius = radius;
            } else {
                let a = Math.PI / subCount;
                subRadius = (radius * Math.sin(a)) / (1 + Math.sin(a));
            }
            return subRadius;
        },

        calculatePosX: function (posX, parentRadius, parentRealRadius, subCount, index, subRadius) {
            return posX + parentRadius / 2 + Math.sin(((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
        },

        calculatePosY: function (posY, parentRadius, parentRealRadius, subCount, index, subRadius) {
            return posY + parentRadius / 2 + Math.cos(Math.PI + ((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
        },
        refreshTopo() {
            this.$refs.cableTempTopo.refreshTopo();
        },
        clickNode(node) {
            console.log(node);
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
    watch: {
        templateId: {
            deep: true,
            immediate: true,
            handler(val, old) {
                //let a= 1;
                this.loadCableTemplateTopoList(val);
            },
        },
    },
};
</script>

<style>
</style>