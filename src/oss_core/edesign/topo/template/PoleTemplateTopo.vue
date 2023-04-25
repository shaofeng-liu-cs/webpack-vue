<template>
    <div class="cs-block">
        <TopoTemplate ref="poleTempTopo" v-if="templateType == 'POLE_TEMP'" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
export default {
    name: 'poleTemplateTopo',
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
            templateType: 'POLE_TEMP',
        };
    },
    mounted() {
        if (this.templateId) {
            this.loadPoleTopoList(this.templateId);
        }
    },
    created() {},
    methods: {
        loadPoleTopoList(templateId) {
            if (!this.templateId) {
                return;
            }
            let datas = {
                templateId: templateId,
            };

            //let url = "/edesign/template/poletemplate/v1";
            let url = 'edesign/template/query/poletemplate/v1';
            console.info('template url=' + url);

            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data) {
                        this.drawPoleData(data);
                    }
                },
                error: e => {
                    fish.error(e.responseJSON.message);
                },
            });
        },

        drawPoleData(tempData) {
            let postX = 0;
            let postY = 0;
            let dataTopo = [];
            let dataList = [];
            //let poleInfo = {ID:tempData.templateId,NAME:tempData.templateName,FULL_NAME:tempData.templateName};
            let width = tempData.diameter ? tempData.diameter : 100;
            let height = tempData.diameter ? tempData.diameter : 100;
            //let poleSize = [width,height];
            let relaDiameter = width;
            let relaRadiusVal = Math.ceil(relaDiameter / 2);
            width = width * 50;
            height = height * 50;

            let radiusVal = width / 2;
            let shapeType = tempData.shapeType;

            let elem = new ht.Node();
            elem.movable = false;
            elem.setName('POLE');
            elem.setSize(width, height);
            elem.setPosition(postX, postY);
            if (shapeType === 'S') {
                elem.setStyle('shape', 'rect');
                elem.setStyle('label.position', 17);
            } else {
                elem.setStyle('shape', 'circle');
                elem.setStyle('label.position', 49);
                elem.setStyle('label.offset.y', 20);
                elem.setStyle('select.type', 'shadow');
                elem.setStyle('shadow.offset.x', 0);
                elem.setStyle('shadow.offset.y', 0);
                elem.setStyle('shadow.blur', 2);
                //elem.setStyle('shape.arc.from', 2*Math.PI);
            }

            elem.setStyle('label.font', '22px Arial');
            elem.setStyle('shape.border.width', 3);
            elem.setStyle('shape.background', '#FFFFFF');
            elem.setStyle('shape.border.color', '#CCCCCC');
            elem.setStyle('vector.outline.width', '5');
            if (shapeType === 'S') {
                let shapeL = new ht.Shape();
                shapeL.setPoints([
                    { x: postX - width / 2, y: postY - height / 2 - 20 },
                    { x: width / 2 + postX, y: postY - height / 2 - 20 },
                ]);
                shapeL.setStyle('label', 'width: ' + relaDiameter.toString() + ' cm');
                shapeL.setStyle('label.font', '16px Arial');
                shapeL.setStyle('label.position.fixed', true);
                shapeL.setStyle('label.position', 3);
                shapeL.setStyle('shape.border.width', 3);
                shapeL.setStyle('label.offset.y', -5);
                shapeL.setStyle('shape.border.color', '#000000');
                elem.addChild(shapeL);
                dataTopo.push(shapeL);
                let shapeV = new ht.Polyline();
                shapeV.setPoints([
                    { x: width / 2 + postX + 20, y: postY - height / 2 },
                    { x: width / 2 + postX + 20, y: postY + height / 2 },
                ]);
                shapeV.setStyle('label', 'height: ' + relaDiameter.toString() + ' cm');
                shapeV.setStyle('label.font', '16px Arial');
                shapeV.setStyle('label.position.fixed', true);
                shapeV.setStyle('label.position', 3);
                shapeV.setStyle('label.offset.y', -5);
                shapeV.setStyle('shape.border.width', 3);
                shapeV.setStyle('shape.border.color', '#000000');
                elem.addChild(shapeV);
                dataTopo.push(shapeV);
            } else {
                let shape = new ht.Shape();
                shape.setPoints([
                    { x: postX, y: postY },
                    { x: postX + radiusVal, y: postY },
                ]);
                shape.setStyle('label', 'Radius: ' + relaRadiusVal.toString() + ' cm');
                shape.setStyle('label.font', '16px Arial');
                shape.setStyle('label.position.fixed', true);
                shape.setStyle('label.position', 3);
                shape.setStyle('shape.border.width', 3);
                shape.setStyle('shape.border.color', '#000000');
                elem.addChild(shape);
                dataTopo.push(shape);
            }
            dataTopo.push(elem);
            if (this.$refs) {
                if (this.$refs.poleTempTopo) {
                    let gv = this.$refs.poleTempTopo.getGraph();
                    gv.setLayoutType('true');
                }
            }
            this.graphData = dataTopo;
        },
        refreshTopo() {
            this.$refs.poleTempTopo.refreshTopo();
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
                this.loadPoleTopoList(val);
            },
        },
    },
};
</script>

<style>
</style>