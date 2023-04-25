<template>
    <div class="topo-content">
        <TopoView ref="ductDesignTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick"></TopoView>
        <SelectDevice :schemaId="params.schemaId" ref="selectDevice" @refreshEvent="doAfterAddRes" @refreshClose="doAfterClose"></SelectDevice>
    </div>
</template>

<script>
import TopoView from '../topo-template/TopoView.vue';
import SelectDevice from '../../osp/topo-control/device_design/selectDevice.vue';
import { saveTopo, loadTopoData } from '../TopoUtil';
import * as GlobalConst from '../../../base/utils/GlobalConst';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];

export default {
    name: 'DuctDesignTopo',
    components: {
        TopoView,
        SelectDevice,
    },
    provide() {
        return {
            getDeviceDesignEl: () => this.$el, //节点
        };
    },
    inject: [],
    props: {
        params: Object,
    },
    computed: {},
    data() {
        return {
            isAdding: false, //绘制状态标准
            addingObject: null, //当前绘制对象
            tempObjects: [], //绘制过程中的一些临时对象
            xPos: 320, //TOPO起始X
            yPos: 50, //TOPO起始Y
            width: 300,
            height: 400,
            topoId: 'FACILITY-DESIGN' + this.params.resId,
            facilityData: null,
            toolButtons: [
                {
                    id: 'ODB',
                    name: 'ODB',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/ODB.png',
                    title: 'ODB',
                    event: 'ODB',
                },
                {
                    id: 'F_CLOSURE',
                    name: 'Fiber Closure',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/F_CLOSURE.png',
                    title: 'Fiber Closure',
                    event: 'F_CLOSURE',
                },
                {
                    id: 'F_CABLE',
                    name: 'Fiber Cable',
                    image: 'oss_core/edesign/assets/image/topo-business/res/dark/F_CABLE.png',
                    title: 'Fiber Cable',
                    event: 'F_CABLE',
                },
                {
                    id: 'BIND',
                    name: 'Bind A/Z-End',
                    image: 'oss_core/edesign/assets/image/topo-tool-bar/bindPoint.png',
                    title: 'Bind A/Z-End',
                    event: 'BIND',
                },
            ],
        };
    },
    created() {
        this.dataModel = new ht.DataModel();
        this.graphView = new ht.graph.GraphView(this.dataModel);
        this.graphView.setLayers(LAYERS);
        this.graphView.enableToolTip();
        this.graphView.setMovableFunc(elem => elem.movable);
    },
    mounted() {
        this.loadTopo();
    },
    beforeDestroy() {
        if (this.params.resId && this.params.schemaId) {
            saveTopo(this.params.schemaId, this.topoId, this.dataModel);
        }
    },

    methods: {
        loadTopo() {
            if (this.dataModel) {
                this.dataModel.clear();
            }
            let size = 300;
            let n = 4;
            let space = 3;
            let parent = new ht.Node();
            parent.setName('');
            parent.setSize(size, size);
            parent.setPosition(500, 1100);
            parent.setStyle('shape', 'rect'); //矩形
            parent.setStyle('shape.background', '#ffffff');
            parent.setStyle('shape.border.width', 1);
            parent.setStyle('shape.border.color', 'gray');

            parent.setStyle('select.type', 'shadow');
            parent.setStyle('shadow.offset.x', 0);
            parent.setStyle('shadow.offset.y', 0);
            parent.setStyle('shadow.blur', 5);
            parent.movable = true;
            this.dataModel.add(parent);

            let subSize = (size - (n + 1) * space) / n;
            for (let i = 1; i <= n; i++) {
                this.drawRect(
                    i * i,
                    subSize,
                    500 - size / 2 + space + (subSize + space) * i - subSize / 2 - space,
                    1100 - size / 2 + space + subSize / 2
                );
            }
            for (let i = 1; i <= n; i++) {
                let x = 500 - size / 2 + space + (subSize + space) * i - subSize / 2 - space;
                let y = 1100 - size / 2 + ((space + subSize) * 3) / 2;
                this.drawHexagon(subSize, x, y);
            }
            for (let i = 1; i <= n; i++) {
                let x = 500 - size / 2 + space + (subSize + space) * i - subSize / 2 - space;
                let y = 1100 - size / 2 + ((space + subSize) * 5) / 2;
                this.drawCircle(i, subSize, x, y);
            }
            for (let i = 1; i <= n; i++) {
                let x = 500 - size / 2 + space + (subSize + space) * i - subSize / 2 - space;
                let y = 1100 - size / 2 + ((space + subSize) * 7) / 2;
                this.drawCircle(i + 4, subSize, x, y);
            }

            this.drawRect(1, 120, 200, 200);
            this.drawRect(4, 120, 500, 200);
            this.drawRect(9, 120, 800, 200);

            this.drawHexagon(100, 200, 500);

            for (let i = 1; i < 10; i++) {
                this.drawCircle(i, 100, 200 * i, 700);
            }
            // this.drawCircle(1, 80, 200, 700);
            // this.drawCircle(4, 80, 400, 700);
            // this.drawCircle(5, 80, 600, 700);
            // this.drawCircle(6, 80, 800, 700);
            // this.drawCircle(8, 80, 1000, 700);
        },

        drawRect(n, size, xPos, yPos) {
            let space = 4;
            // 方形
            let col = Math.ceil(Math.sqrt(n));
            let row = col;
            while ((row - 1) * col >= n) {
                row = col - 1;
            }

            let parent = new ht.Node();
            parent.setName('');
            parent.setSize(size, size);
            parent.setPosition(xPos, yPos);
            parent.setStyle('shape', 'rect'); //矩形
            parent.setStyle('shape.background', '#ffffff');
            parent.setStyle('shape.border.width', 1);
            parent.setStyle('shape.border.color', 'gray');

            parent.setStyle('select.type', 'shadow');
            parent.setStyle('shadow.offset.x', 0);
            parent.setStyle('shadow.offset.y', 0);
            parent.setStyle('shadow.blur', 5);
            parent.movable = true;
            this.dataModel.add(parent);

            let subWidth = (size - space * (col + 1)) / col;
            let subHeight = (size - space * (row + 1)) / row;
            let index = 0;
            for (let i = row; i > 0; i--) {
                for (let j = 1; j <= col; j++) {
                    let x = xPos - size / 2 + (subWidth + space) * (j - 1) + space + subWidth / 2;
                    let y = yPos - size / 2 + (i - 1) * (subHeight + space) + space + subHeight / 2;

                    let node = new ht.Node();
                    node.setName(++index + '');
                    node.setSize(subWidth, subHeight);
                    node.setPosition(x, y);
                    node.setStyle('shape', 'rect'); //矩形
                    node.setStyle('shape.background', '#ffffff');
                    node.setStyle('shape.border.width', 1);
                    node.setStyle('shape.border.color', '#08daff');
                    node.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);

                    node.setStyle('select.type', 'shadow');
                    node.setStyle('shadow.offset.x', 0);
                    node.setStyle('shadow.offset.y', 0);
                    node.setStyle('shadow.blur', 5);
                    node.setHost(parent);
                    //node.movable = true;
                    this.dataModel.add(node);

                    if (index >= n) {
                        break;
                    }
                }
            }
        },

        drawHexagon(oSize, xPos, yPos) {
            let parent = new ht.Node();
            parent.setName('');
            parent.setSize(oSize, oSize);
            parent.setPosition(xPos, yPos);
            parent.setStyle('shape', 'polygon');
            parent.setStyle('shape.polygon.side', 6);
            parent.setStyle('shape.border.width', 1);
            //parent.setStyle('shape.border.cap', 'butt');
            //node.setStyle('shape.dash', true);
            //node.setStyle('shape.dash.3d', true);
            //node.setStyle('shape.dash.pattern', [5]);
            //node.setStyle('shape.dash.color', 'red');
            //node.setStyle('shape.dash.width', 4);
            //node.setStyle('shape.gradient', 'linear.south');
            parent.setStyle('select.type', 'shadow');
            parent.setStyle('shadow.offset.x', 0);
            parent.setStyle('shadow.offset.y', 0);
            parent.setStyle('shadow.blur', 5);
            parent.setStyle('shape.border.color', 'gray');
            parent.setStyle('shape.background', '#ffffff');
            parent.movable = true;
            this.dataModel.add(parent);

            let size = (oSize * Math.sin(Math.PI / 3)) / 3 - 3;
            //let size = oSize / 3;
            for (let i = 0; i < 7; i++) {
                let x;
                let y;
                if (i == 0) {
                    x = xPos - size;
                    y = yPos - size / 2;
                } else if (i == 1) {
                    x = xPos - size;
                    y = yPos + size / 2;
                } else if (i == 2) {
                    x = xPos;
                    y = yPos - size;
                } else if (i == 3) {
                    x = xPos;
                    y = yPos;
                } else if (i == 4) {
                    x = xPos;
                    y = yPos + size;
                } else if (i == 5) {
                    x = xPos + size;
                    y = yPos - size / 2;
                } else if (i == 6) {
                    x = xPos + size;
                    y = yPos + size / 2;
                }

                let node = new ht.Node();
                node.setName(i + 1 + '');
                node.setSize(size, size);
                node.setPosition(x, y);
                node.setStyle('shape', 'polygon');
                node.setStyle('shape.polygon.side', 6);
                node.setStyle('shape.border.width', 1);
                node.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
                //node.setStyle('shape.border.cap', 'butt');
                //node.setStyle('shape.dash', true);
                //node.setStyle('shape.dash.3d', true);
                //node.setStyle('shape.dash.pattern', [5]);
                //node.setStyle('shape.dash.color', 'red');
                //node.setStyle('shape.dash.width', 4);
                //node.setStyle('shape.gradient', 'linear.south');

                node.setStyle('shape.border.color', '#08daff');
                node.setStyle('shape.background', '#ffffff');
                node.setParent(parent);
                node.setHost(parent);
                this.dataModel.add(node);
            }
        },

        drawCircle(n, oSize, xPos, yPos) {
            let parent = new ht.Node();
            parent.setName('');
            parent.setSize(oSize, oSize);
            parent.setPosition(xPos, yPos);
            parent.setStyle('shape', 'circle');
            parent.setStyle('shape.background', '#ffffff');
            parent.setStyle('shape.border.width', 1);
            parent.setStyle('shape.border.color', 'gray');

            parent.setStyle('select.type', 'shadow');
            parent.setStyle('shadow.offset.x', 0);
            parent.setStyle('shadow.offset.y', 0);
            parent.setStyle('shadow.blur', 5);
            parent.movable = true;
            this.dataModel.add(parent);

            let isCenter = false;
            if (n > 4) {
                isCenter = true;
                n = n - 1;
            }

            let space = n == 1 ? 6 : 1;
            let coreRadius = this.calculateSubRadius(n, oSize / 2) - space;
            if (isCenter) {
                if (n == 4) {
                    coreRadius = oSize / 6 - 1;
                } else if (n == 5) {
                    coreRadius = oSize / 2 - coreRadius * 2;
                }
            }

            for (let i = 0; i < n; i++) {
                let radius = oSize / 2;
                let x = this.calculatePosX(xPos, radius, radius - space, n, i, coreRadius) - oSize / 2 + coreRadius;
                let y = this.calculatePosY(yPos, radius, radius - space, n, i, coreRadius) - oSize / 2 + coreRadius;

                let node = new ht.Node();
                node.setName(i + 1 + '');
                node.setSize(coreRadius * 2, coreRadius * 2);
                node.setPosition(x, y);
                node.setStyle('shape', 'circle'); //矩形
                node.setStyle('shape.background', '#ffffff');
                node.setStyle('shape.border.width', 1);
                node.setStyle('shape.border.color', '#08daff');
                node.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);

                node.setStyle('select.type', 'shadow');
                node.setStyle('shadow.offset.x', 0);
                node.setStyle('shadow.offset.y', 0);
                node.setStyle('shadow.blur', 5);
                node.setHost(parent);
                //node.movable = true;
                this.dataModel.add(node);
            }

            if (isCenter) {
                let node = new ht.Node();
                node.setName(++n + '');
                node.setSize(coreRadius * 2, coreRadius * 2);
                node.setPosition(xPos, yPos);
                node.setStyle('shape', 'circle'); //矩形
                node.setStyle('shape.background', '#ffffff');
                node.setStyle('shape.border.width', 1);
                node.setStyle('shape.border.color', '#08daff');
                node.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);

                node.setStyle('select.type', 'shadow');
                node.setStyle('shadow.offset.x', 0);
                node.setStyle('shadow.offset.y', 0);
                node.setStyle('shadow.blur', 5);
                node.setHost(parent);
                //node.movable = true;
                this.dataModel.add(node);
            }

            // let size = oSize * Math.sin(Math.PI/4) + oSize / 12;
            // let col = Math.ceil(Math.sqrt(n));
            // let row = col;
            // while ((row - 1) * col >= n) {
            //     row = col - 1;
            // }
            //
            // let space = 3;
            // let subWidth = (size - space * (col + 1)) / col;
            // let subHeight = (size - space * (row + 1)) / row;
            // let index = 0;
            // for (let i = row; i > 0; i--) {
            //     for (let j = 1; j <= col; j++) {
            //
            //         let x = xPos - size / 2 + (subWidth + space) * (j - 1) + space + subWidth / 2;
            //         let y = yPos - size / 2 + (i - 1) * (subHeight + space) + space + subHeight / 2;
            //
            //         let node = new ht.Node();
            //         node.setName((++index) + '');
            //         node.setSize(subWidth, subHeight);
            //         node.setPosition(x, y);
            //         node.setStyle('shape', 'circle'); //矩形
            //         node.setStyle('shape.background', '#ffffff');
            //         node.setStyle('shape.border.width', 1);
            //         node.setStyle('shape.border.color', '#08daff');
            //         node.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
            //
            //         node.setStyle('select.type', 'shadow');
            //         node.setStyle('shadow.offset.x', 0);
            //         node.setStyle('shadow.offset.y', 0);
            //         node.setStyle('shadow.blur', 5);
            //         node.setHost(parent);
            //         //node.movable = true;
            //         this.dataModel.add(node);
            //
            //         if (index >= n) {
            //             break;
            //         }
            //     }
            //
            // }
        },

        calculateSubRadius(subCount, radius) {
            let subRadius = radius;
            if (subCount === 1) {
                subRadius = radius;
            } else {
                let a = Math.PI / subCount;
                subRadius = (radius * Math.sin(a)) / (1 + Math.sin(a));
            }
            return subRadius;
        },

        calculatePosX(posX, parentRadius, parentRealRadius, subCount, index, subRadius) {
            return posX + parentRadius + Math.sin(((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
        },
        calculatePosY(posY, parentRadius, parentRealRadius, subCount, index, subRadius) {
            return posY + parentRadius + Math.cos(2 * Math.PI + ((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
        },

        doAfterAddRes(datas) {},

        doAfterClose() {
            this.cancelAddingResOperation();
        },

        initMenus(datas) {
            let menus = [];

            return menus;
        },

        clickNode(node) {},

        toolbarClick(eventName) {},
    },
};
</script>

<style>
@import '../topo-template/scss/topoTemplate.scss';
</style>
