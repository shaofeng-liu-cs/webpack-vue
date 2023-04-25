<template>
    <div class="cs-block">
        <TopoTemplate ref="manholeTempTopo" v-if="templateType == 'MANHOLE'" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
export default {
    name: 'manholeTemplateTopo',
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
            templateType: 'MANHOLE',
        };
    },
    mounted() {
        if (this.templateId) {
            this.loadManholeTopoList(this.templateId);
        }
    },
    created() {},
    methods: {
        loadManholeTopoList(templateId) {
            if (!templateId) {
                return;
            }
            let datas = {
                templateId: templateId,
            };
            //let url = "/edesign/template/manholetemplate/v1";
            let url = 'edesign/template/query/manholetemplate/v1';

            console.info('template url=' + url);

            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data) {
                        this.drawManHoleData(data);
                    }
                },
                error: e => {
                    fish.error(e.responseJSON.message);
                },
            });
        },

        drawManHoleData(tempData) {
            let postX = 0;
            let postY = 0;
            let dataTopo = [];
            let dataList = [];

            let topSize = { width: 200, length: 200 };
            let sideSize = { width: 200, depth: 250 };
            let shapeType = 'C';
            if (tempData) {
                //let manHoleInfo = {ID:tempData.templateId,NAME:tempData.templateName,FULL_NAME:tempData.templateName};
                shapeType = tempData.shapeType ? tempData.shapeType : 'C';
                if (shapeType === 'C') {
                    let diameter = tempData.diameter ? tempData.diameter : 200;
                    topSize.width = 200;
                    topSize.length = 200;
                    topSize.diameter = diameter;
                    topSize.radius = diameter / 2;
                    topSize.widthLable = diameter / 2;
                    topSize.lengthLable = diameter / 2;

                    sideSize.width = 200;
                    sideSize.depth = 250;
                    sideSize.widthLable = diameter;
                    sideSize.depthLable = tempData.height ? tempData.height : 200;
                } else if (shapeType === 'S') {
                    topSize.width = 200;
                    topSize.length = 200;
                    topSize.widthLable = tempData.width ? tempData.width : 200;
                    topSize.lengthLable = tempData.length ? tempData.length : 200;

                    sideSize.width = 200;
                    sideSize.depth = 250;
                    sideSize.widthLable = tempData.width ? tempData.width : 200;
                    sideSize.depthLable = tempData.height ? tempData.height : 200;
                }

                console.info('postX=' + postX + ';postY=' + postY);
                let elem = new ht.Node();
                elem.movable = false;
                elem.setName(this.$t('TOP_VIEW'));
                elem.setSize(topSize.width, topSize.length);
                elem.setPosition(postX, postY);
                if (shapeType === 'S') {
                    elem.setStyle('shape', 'rect');
                    elem.setStyle('label.position', 31);
                    elem.setStyle('label.offset.y', 20);
                } else {
                    elem.setStyle('shape', 'circle');
                    elem.setStyle('label.position', 31);
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
                    let label = 'Width: ' + topSize.widthLable.toString() + ' mm';
                    let labelY = -5;
                    let points = [
                        { x: postX - topSize.width / 2, y: postY - topSize.length / 2 - 20 },
                        { x: topSize.width / 2 + postX, y: postY - topSize.length / 2 - 20 },
                    ];
                    let shapeL = this.drawShape(label, points, labelY);
                    elem.addChild(shapeL);
                    dataTopo.push(shapeL);

                    let strLabel = 'Length: ' + topSize.lengthLable.toString() + ' mm';
                    let polylabelY = -5;
                    let polyPoints = [
                        { x: topSize.width / 2 + postX + 20, y: postY - topSize.length / 2 },
                        { x: topSize.width / 2 + postX + 20, y: postY + topSize.length / 2 },
                    ];
                    let shapeV = this.drawPolyline(strLabel, polyPoints, polylabelY);
                    elem.addChild(shapeV);
                    dataTopo.push(shapeV);
                } else {
                    let label = 'Radius: ' + topSize.radius.toString() + ' mm';
                    let points = [
                        { x: postX, y: postY },
                        { x: postX + topSize.width / 2, y: postY },
                    ];
                    let labelY = 3;
                    let shape = this.drawShape(label, points, labelY);

                    elem.addChild(shape);
                    dataTopo.push(shape);
                }
                dataTopo.push(elem);

                //侧面图

                let depthPostX = sideSize.width + 100;
                let depthPostY = sideSize.depth / 2 - sideSize.depth / 2;
                console.info('depthPostX:' + depthPostX + ';depthPostY=' + depthPostY);
                let sideNode = this.drawRect(this.$t('FRONT_VIEW'), sideSize.width, sideSize.depth, depthPostX, depthPostY, '#969698', '#cccccc', 31);

                let labelSide = 'Width: ' + sideSize.widthLable.toString() + ' mm';
                let labelYSide = -5;
                let pointsSide = [
                    { x: depthPostX - sideSize.width / 2, y: depthPostY - sideSize.depth / 2 - 20 },
                    { x: depthPostX + sideSize.width / 2, y: depthPostY - sideSize.depth / 2 - 20 },
                ];
                let shapeLSide = this.drawShape(labelSide, pointsSide, labelYSide);

                elem.addChild(shapeLSide);
                dataTopo.push(shapeLSide);

                let labelSideV = 'Depth: ' + sideSize.depthLable.toString() + ' mm';
                let labelYSideV = -5;
                let pointsSideV = [
                    { x: sideSize.width / 2 + depthPostX + 20, y: depthPostY - sideSize.depth / 2 },
                    { x: sideSize.width / 2 + depthPostX + 20, y: depthPostY + sideSize.depth / 2 },
                ];
                let shapeVSide = this.drawPolyline(labelSideV, pointsSideV, labelYSideV);
                elem.addChild(shapeVSide);
                dataTopo.push(shapeVSide);

                dataTopo.push(sideNode);
            }

            if (this.$refs) {
                if (this.$refs.manholeTempTopo) {
                    let gv = this.$refs.manholeTempTopo.getGraph();
                    gv.setLayoutType('true');
                }
            }

            this.graphData = dataTopo;
        },

        drawShape(strLable, points, labelY) {
            let shapeL = new ht.Shape();
            shapeL.setPoints(points);
            shapeL.setStyle('label', strLable);
            shapeL.setStyle('label.font', '14px Arial');
            shapeL.setStyle('label.position.fixed', true);
            shapeL.setStyle('label.position', 3);
            shapeL.setStyle('shape.border.width', 3);
            shapeL.setStyle('label.offset.y', labelY);
            shapeL.setStyle('shape.border.color', '#000000');
            return shapeL;
        },

        drawPolyline(strLable, points, labelY) {
            let shapeV = new ht.Polyline();
            shapeV.setPoints(points);
            shapeV.setStyle('label', strLable);
            shapeV.setStyle('label.font', '14px Arial');
            shapeV.setStyle('label.position.fixed', true);
            shapeV.setStyle('label.position', 3);
            shapeV.setStyle('label.offset.y', labelY);
            shapeV.setStyle('shape.border.width', 3);
            shapeV.setStyle('shape.border.color', '#000000');
            return shapeV;
        },

        drawRect(name, width, height, postX, postY, borderColor, bgColor, labelNum) {
            let intLabelNum = 17;
            if (labelNum) {
                intLabelNum = labelNum;
            }
            let node = new ht.Node();
            node.movable = true;
            node.setName(name);
            node.setSize(width, height);
            node.setPosition(postX, postY);

            node.setStyle('shape', 'rect');
            node.setStyle('label.position', intLabelNum);
            node.setStyle('label.position.y', 20);
            node.setStyle('label.font', '22px Arial');
            node.setStyle('shape.border.width', 3);
            node.setStyle('shape.background', bgColor);
            node.setStyle('shape.border.color', borderColor);
            node.setStyle('vector.outline.width', '5');
            return node;
        },

        clickNode(node) {
            //console.log(node);
        },
        refreshTopo() {
            this.$refs.manholeTempTopo.refreshTopo();
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
            //console.log('select-mode');
        },
    },
    watch: {
        // templateId(value){
        //     this.loadManholeTopoList(value);
        // }
        templateId: {
            deep: true,
            immediate: true,
            handler(val, old) {
                //let a= 1;
                this.loadManholeTopoList(val);
            },
        },
    },
};
</script>

<style>
</style>