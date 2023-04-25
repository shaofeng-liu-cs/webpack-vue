<template>
    <div class="cs-block">
        <div class="col-md-8">
            <TopoTemplate ref="pipelineSelecTopo" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode">
            </TopoTemplate>
        </div>
        <div class="col-md-4">
            <div class="right_info">
                <div class="cs-block">
                    <div class="title">
                        <h3>{{ $t('CONFIGURATION') }}</h3>
                    </div>
                    <div class="main-container" style="display: flex; flex-flow: column">
                        <div style="padding: 8px">
                            <input type="radio" v-model="picked" value="1" id="study" /><label for="study"> {{ $t('AUTO_INSERT_LOW') }}</label>
                        </div>
                        <div style="padding: 8px">
                            <input type="radio" v-model="picked" value="2" id="read" /><label for="read"> {{ $t('AUTO_INSERT_SMALLER') }}</label>
                        </div>
                        <div style="padding: 8px">
                            <input type="radio" v-model="picked" value="3" id="play" /><label for="play"> {{ $t('AUTO_INSERT_LARGER') }}</label>
                        </div>
                        <div style="padding: 5px; text-align: right">
                            <span class="glyphicon glyphicon-info-sign" style="color: rgb(15, 7, 189); font-size: 12px">{{
                                $t('AUTO_INSERT_OTHER')
                            }}</span>
                        </div>
                        <div style="padding: 5px; text-align: right">
                            <input type="button" class="btn btn_minwidth btn-primary" id="btnApply" value="APPLY" title="APPLY" />
                        </div>
                    </div>
                </div>
                <div class="cs-block">
                    <div class="title">
                        <h3>{{ $t('ATTRIBUTE') }}</h3>
                    </div>
                    <div class="main-container" style="display: flex; flex-flow: column">
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
export default {
    name: 'pipelineSelecTopo',
    components: {
        TopoTemplate,
    },
    props: {
        resId: {
            type: String,
            default: '',
        },
        resData: Object,
    },
    data() {
        return {
            graphData: [],
            picked: '',
            gridData: [],
            gridOption: {},
        };
    },
    mounted() {
        //this.loadPipeLineTopoList(this.resId);
        console.info('resData>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.info(this.resData);
    },
    created() {},
    methods: {
        loadPipeLineTopoList(resId) {
            let datas = {
                templateId: resId,
            };
            let url = 'edesign/template/pipelinetemplate/v1';
            console.info('template url=' + url);
            fish.ajax({
                url: url,
                type: 'GET',
                //contentType: "application/json",
                data: datas,
                success: data => {
                    console.info(data);
                    if (data) {
                        this.drawPipelineData(data);
                    }
                },
            });
        },
        //管道组、管道块、管孔
        drawPipelineData(tempData) {
            this.analysisPipelineData(tempData);

            let postX = 0;
            let postY = 0;
            let dataTopo = [];
            let dataList = [];
            let colsQty = tempData.colsQty; //管道组列数
            let rowsQty = tempData.rowsQty; //管道组行数
            let resSpecId = tempData.resSpecId; //
            let groupMembers = tempData.members; //管道块数
            let pipeBlockList = tempData.pipeBlocakTemplateList || []; //管道块
            let width = tempData.widthDiameter ? tempData.widthDiameter : 600;
            let height = tempData.heightDiameter ? tempData.heightDiameter : 600;
            let pipelineGroupSize = [width, height];
            let shapeType = 'S';

            let elem = new ht.Node();
            elem.movable = false;
            elem.setAttrObject(tempData);
            elem.setName('PIPELINE');
            elem.setSize(width, height);
            elem.setPosition(postX, postY);
            elem.setStyle('shape', 'rect');
            elem.setStyle('label.position', 17);
            elem.setStyle('label.font', '22px Arial');
            elem.setStyle('shape.border.width', 3);
            elem.setStyle('shape.background', '#FFFFFF');
            elem.setStyle('shape.border.color', '#CCCCCC');
            elem.setStyle('vector.outline.width', '5');
            this.drawPipelineBlock(dataTopo, elem, tempData, postX, postY);

            dataTopo.push(elem);
            this.graphData = dataTopo;
        },
        //分析数据
        analysisPipelineData(tempData) {
            let colsQty = tempData.colsQty; //管道组列数
            let rowsQty = tempData.rowsQty; //管道组行数
            let blockMembers = tempData.members; //管道块数
            let pipeBlocks = tempData.pipeBlocakTemplateList || []; //管道块
            let pipelineBlockDiameter = 0;
            for (let i = 0; i < blockMembers; i++) {
                let piepBlock = pipeBlocks[i];
                let holeMembers = piepBlock.members; //管道块中管孔数
                let pipeHoles = piepBlock.pipeHoleTemplMemberDTOList || []; //管孔
                let maxDiameter = 0;
                for (let j = 0; j < holeMembers; j++) {
                    let pipeHole = pipeHoles[j];
                    let holeDiameter = pipeHole.diameter;
                    if (holeDiameter > maxDiameter) {
                        maxDiameter = holeDiameter;
                    }
                }
                pipelineBlockDiameter = maxDiameter;
                piepBlock.pipelineBlockDiameter = pipelineBlockDiameter;
                piepBlock.heightDiameter = maxDiameter;
                piepBlock.widthDiameter = maxDiameter;
            }
            tempData.heightBlock = pipelineBlockDiameter;
            tempData.widthBlock = pipelineBlockDiameter;
            tempData.widthDiameter = pipelineBlockDiameter * 6;
            tempData.heightDiameter = pipelineBlockDiameter * 6;

            console.info(tempData);
        },
        //画管道块
        drawPipelineBlock(dataTopo, elemGroup, tempData, postX, postY) {
            let colsQty = tempData.colsQty; //管道组列数
            let rowsQty = tempData.rowsQty; //管道组行数
            let groupCol = 6;
            let groupRow = 6;
            let groupMembers = tempData.members; //管道块数
            let groupWidth = tempData.widthDiameter; //管道组宽度
            let groupHeight = tempData.heightDiameter; //管道组高度
            let pipeBlockList = tempData.pipeBlocakTemplateList || []; //管道块
            let width = tempData.widthBlock ? tempData.widthBlock : 100; //管道块高度
            let height = tempData.heightBlock ? tempData.heightBlock : 100;

            let x = postX - groupWidth / 2 + width / 2;
            let y = postY + groupHeight / 2 - height / 2;

            for (let i = 0; i < groupCol; i++) {
                for (let j = 0; j < groupRow; j++) {
                    var blockIndex = i * groupCol + j;
                    if (blockIndex < pipeBlockList.length) {
                        let pipelineBlock = pipeBlockList[blockIndex];
                        let shapyType = pipelineBlock.sectionalShape;
                        var posX = x + width * j;
                        var posY = y - width * i;
                        //let pipelineBlock = pipeBlockList[i];
                        let elemBlock = new ht.Node();
                        elemBlock.movable = false;
                        elemBlock.setName(blockIndex);
                        elemBlock.setSize(width, height);
                        elemBlock.setPosition(posX, posY);
                        if (shapyType === 'S') {
                            elemBlock.setStyle('shape', 'rect');
                        } else {
                            elemBlock.setStyle('shape', 'circle');
                        }
                        elemBlock.setStyle('label.position', 17);
                        elemBlock.setStyle('label.font', '22px Arial');
                        elemBlock.setStyle('shape.border.width', 3);
                        elemBlock.setStyle('shape.background', '#FFFFFF');
                        elemBlock.setStyle('shape.border.color', '#CCCCCC');
                        elemBlock.setStyle('vector.outline.width', '5');
                        this.drawPipelineHole(dataTopo, elemBlock, pipelineBlock, posX, posY, width);
                        elemGroup.addChild(elemBlock);
                        dataTopo.push(elemBlock);
                    }
                }
            }
        },

        //画管道孔
        drawPipelineHole(dataTopo, elemBlock, pipelineBlock, posX, posY, size) {
            let members = pipelineBlock.members; //管道孔数
            var postion = this.getPostion(pipelineBlock.sectionalShape, posX, posY, members, size);
            if (members === 1) {
                let pipelineHole = pipelineBlock.pipeHoleTemplMemberDTOList[0];
                let shapeType = pipelineHole.sectionalShape;
                let width = pipelineHole.diameter;
                let height = width;

                let elemHole = new ht.Node();
                elemHole.movable = false;
                elemHole.setName('');
                elemHole.setSize(width, height);
                elemHole.setPosition(posX, posY);
                if (shapeType === 'S') {
                    elemHole.setStyle('shape', 'rect');
                    elemHole.setStyle('label.position', 17);
                } else {
                    elemHole.setStyle('shape', 'circle');
                    elemHole.setStyle('label.position', 49);
                    elemHole.setStyle('label.offset.y', 20);
                    elemHole.setStyle('select.type', 'shadow');
                    elemHole.setStyle('shadow.offset.x', 0);
                    elemHole.setStyle('shadow.offset.y', 0);
                    elemHole.setStyle('shadow.blur', 2);
                }
                elemHole.setStyle('shape.border.width', 2);
                elemHole.setStyle('shape.background', '#FFFFFF');
                elemHole.setStyle('shape.border.color', '#CCCCCC');
                elemHole.setStyle('vector.outline.width', '5');

                elemBlock.addChild(elemHole);
                dataTopo.push(elemHole);
            } else {
                console.info(postion);
                for (var index = 0; index < members; index++) {
                    let pipelineHole = pipelineBlock.pipeHoleTemplMemberDTOList[index];
                    let shapeType = pipelineHole.sectionalShape;
                    let width = pipelineHole.diameter;
                    let height = width;

                    let elemHole = new ht.Node();
                    //elemHole.movable = false;
                    elemHole.setName('');
                    elemHole.setSize(width, height);
                    elemHole.setPosition(postion[index].x, postion[index].y);
                    if (shapeType === 'S') {
                        elemHole.setStyle('shape', 'rect');
                        elemHole.setStyle('label.position', 17);
                    } else {
                        elemHole.setStyle('shape', 'circle');
                        elemHole.setStyle('label.position', 49);
                        elemHole.setStyle('label.offset.y', 20);
                        elemHole.setStyle('select.type', 'shadow');
                        elemHole.setStyle('shadow.offset.x', 0);
                        elemHole.setStyle('shadow.offset.y', 0);
                        elemHole.setStyle('shadow.blur', 2);
                    }
                    elemHole.setStyle('shape.border.width', 2);
                    elemHole.setStyle('shape.background', '#FFFFFF');
                    elemHole.setStyle('shape.border.color', '#CCCCCC');
                    elemHole.setStyle('vector.outline.width', '5');

                    elemBlock.addChild(elemHole);
                    dataTopo.push(elemHole);
                }
            }
        },

        getPostion: function (shapeType, preX, preY, member_count, size) {
            let position = new Array();
            //var member_count=parseInt(node.MEMBERS);
            if (shapeType === 'C') {
                position = this.getCirclesInHoleGeo(preX + size / 2, preY + size / 2, size, member_count, 'circle');
            } else if (shapeType === 'S') {
                let count_line = Math.ceil(Math.sqrt(member_count));
                for (var i = 0; i < member_count; i++) {
                    let object = new Object();
                    object.posX = preX + parseInt(i % count_line) * ((size - (count_line + 1) * 5) / count_line) + 5 * (parseInt(i % count_line) + 1);
                    object.posY = preY + parseInt(i / count_line) * ((size - (count_line + 1) * 5) / count_line) + 5 * (parseInt(i / count_line) + 1);
                    position.push(object);
                }
            }
            return position;
        },

        /**
         *
         * @param x  圆心坐标
         * @param y
         * @param radius  直径
         * @param subCount  个数
         * @param shape  形状 圆形/方形  默认方形
         * @returns {Array}
         */
        getCirclesInHoleGeo(x, y, radius, subCount, shape) {
            var circleArr = new Array();
            var i;
            var j;
            var subCircles = new Array();

            function CircleHole(x, y, radius) {
                this.x = x;
                this.y = y;
                this.radius = radius;
            }

            var subCircle;
            radius = radius * 0.9;

            if (subCount == 1) {
                subCircle = new CircleHole(x, y, (4 * radius) / 5);
                subCircles.push(subCircle);
            } else if (subCount == 2) {
                for (i = -1; i <= 1; i += 2) {
                    subCircle = new CircleHole(x + radius * 0.25 * i, y, radius * 0.5);
                    subCircles.push(subCircle);
                }
            } else if (subCount == 3) {
                subCircles = this.createSubCircle(x, y, radius, subCount, Math.PI / 2);
            } else if (subCount == 4) {
                subCircles = this.createSubCircle(x, y, radius, subCount, Math.PI / 2);

                // } else if (subCount == 5 && "rectangle" != shape) {
                //     circleArr = this.createSubCircle(x, y, radius, subCount -1 , Math.PI / 4,5);
                //     subCircle = new CircleHole(x, y, (circleArr[0]).radius);
                //     subCircles = circleArr;
                //     subCircles.push(subCircle);
            } else if (subCount == 5 && 'rectangle' != shape) {
                subCircles = this.createSubCircle(x, y, radius, subCount, Math.PI / 2);
            } else if (subCount == 8 && 'rectangle' != shape) {
                subCircles = this.createSubCircle(x, y, radius, subCount, Math.PI / 2);
            } else if (subCount == 6 && 'rectangle' != shape) {
                subCircles = this.createSubCircle(x, y, radius, subCount, Math.PI / 2);
            } else if (subCount == 7 && 'rectangle' != shape) {
                circleArr = this.createSubCircle(x, y, radius, subCount - 1, 0);
                subCircle = new CircleHole(x, y, circleArr[0].radius);
                subCircles = circleArr;
                subCircles.push(subCircle);
            } else if (subCount == 12 && 'rectangle' != shape) {
                //光缆段12个特殊处理
                /* circleArr = this.createSubCircle(x, y, 2*radius/3, 4 , Math.PI / 4,5);
                 subCircle = new CircleHole(x, y, (circleArr[0]).radius);
                 subCircles = circleArr;
                 subCircles.push(subCircle);
                 var outerCircles = this.createOutLayerCir(x, y, radius, 9 , radius/5);
                 subCircles.concat(outerCircles);*/
                var subCircles = new Array();

                function CircleHole(x, y, radius) {
                    this.x = x;
                    this.y = y;
                    this.radius = radius;
                }
                var subCircle;
                var r = (0.24 * radius) / 2;
                var b = (0.27 * radius) / 2;
                for (var i = 0; i < 9; i++) {
                    var _x = x + Math.sin(((2 * Math.PI) / 360) * 40 * i) * (2 * r + b);
                    var _y = y + Math.cos(((2 * Math.PI) / 360) * 40 * i) * (2 * r + b);
                    subCircle = new CircleHole(_x, _y, 1.8 * r);
                    subCircles.push(subCircle);
                }
                for (var i = 0; i < 3; i++) {
                    var _x = x + Math.sin(((2 * Math.PI) / 360) * 120 * i) * b;
                    var _y = y + Math.cos(((2 * Math.PI) / 360) * 120 * i) * b;
                    subCircle = new CircleHole(_x, _y, 1.8 * r);
                    subCircles.push(subCircle);
                }
            } else {
                radius = (10 * radius) / 9;
                //是方形
                radius = radius / 2;
                radius = Math.pow(radius, 2) / 2;
                radius = Math.sqrt(radius) * 2;
                //end
                //圆形 再加下面这段
                if ('rectangle' != shape) {
                    radius = Math.pow(radius, 2) / 2;
                    radius = Math.sqrt(radius);
                }
                //end
                var a = parseInt(Math.sqrt(subCount));
                var b = subCount == a * a ? a : a + 1;
                if (subCount > a * b) {
                    a = b;
                }
                var dis = (Math.sqrt(2) * radius) / b;
                x = x - radius / Math.sqrt(2);
                y = y - radius / Math.sqrt(2);
                for (i = 1; i <= b; i++) {
                    for (j = 1; j <= a; j++) {
                        if ((i - 1) * a + j <= subCount) {
                            subCircle = new CircleHole(x + i * dis - dis / 2, y + j * dis - dis / 2, dis);
                            subCircles.push(subCircle);
                        }
                    }
                }
            }

            return subCircles;
        },

        createSubCircle(x0, y0, radius, subCount, angle, isFive) {
            var subCircles = new Array();

            function CircleHole(x, y, radius) {
                this.x = x;
                this.y = y;
                this.radius = radius;
            }
            var subCircle;
            if (subCount > 0) {
                var a = (Math.PI * 2) / subCount;
                var b = a / 2;
                var R = radius;
                var r = R * (Math.sin(b) / (1 + Math.sin(b)));
                if (isFive == 5) {
                    r = R / 3;
                } else {
                    r = r * 0.95;
                }
                var dis = R - r;
                var x;
                var y;
                for (var i = 0; i < subCount; i++) {
                    x = dis * Math.cos(a * i - angle) * 0.5 + x0;
                    y = y0 + dis * Math.sin(a * i - angle) * 0.5;
                    subCircle = new CircleHole(x, y, r);
                    subCircles.push(subCircle);
                }
            }
            return subCircles;
        },

        clickNode(node) {
            console.log('node:' + node);
        },
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
            console.log('select-mode');
        },
        slect() {},
    },
};
</script>

<style lang="scss" scoped>
@import './PipelineSelectTopo.scss';
</style>
