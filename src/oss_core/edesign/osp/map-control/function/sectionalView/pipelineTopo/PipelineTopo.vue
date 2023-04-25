<template>
    <div class="topo-content">
        <TopoView ref="pipelineTopo" :show-toolbar="true" :menu-source="initMenus" :graphView="graphView"> </TopoView>
    </div>
</template>
<script>
import TopoView from '@/oss_core/edesign/topo/topo-template/TopoView.vue';
import { loadPipelineData } from '@/oss_core/edesign/topo/TopoHandleAction';
import * as GlobalConst from '@/oss_core/base/utils/GlobalConst';
const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 2;
const LAYERS = [LAYER0, LAYER1, LAYER2];
const ROUTE_LABEL_FONT = '14px Tahoma';
const CABLE_BORDER_WIDTH = 2;
const maxRate = 0.6;

const INNER_RES_TYPES = [];
const ROUTE_FACILITY_SIZE = { width: 200, height: 200 };
const ROUTE_LINE_SIZE = { width: 250, height: 50 };
const ROUTE_BRIDGE_SIZE = { width: 10, height: 120 };
const PIPELINE_GROUP_SIZE = { width: 420, height: 420 };
export default {
    name: 'PipelineTopo',
    components: {
        TopoView,
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
        return {};
    },
    created() {
        this.dataModel = new ht.DataModel();
        this.graphView = new ht.graph.GraphView(this.dataModel);
        this.graphView.enableToolTip();
        this.graphView.setMovableFunc(elem => elem.movable);

        this.graphView.addInteractorListener(e => {
            if (e.kind === 'betweenMove') {
                //拖拽
                //this.redrawEdgeWhenMoveNode();
            }
        });

        this.graphView.getView().addEventListener('click', e => {
            let data = this.graphView.getDataAt(e);
            if (data) {
            }
        });
    },
    mounted() {
        this.loadTopoList(this.resId);
    },
    methods: {
        loadTopoList(resId) {
            let arrPipelineIds = resId.split(',');
            let p1 = loadPipelineData(arrPipelineIds);
            Promise.all([p1]).then(datas => {
                let pipelineData = datas[0].resultList || [];
                this.drawPipelineGroup(pipelineData);
            });
        },

        drawPipelineGroup(pipelineData) {
            if (pipelineData.length > 0) {
                let pipelineGroup = pipelineData[0];
                let pipelineId = pipelineGroup.pipelineId;
                let width = PIPELINE_GROUP_SIZE.width;
                let height = PIPELINE_GROUP_SIZE.height;
                //let postX = routeBridgeNode.getPosition().x;
                //let postY = routeBridgeNode.getPosition().y + height - ROUTE_BRIDGE_SIZE.height - 30;
                let postX = 600;
                let postY = 250;
                let pipelineGroupNode = this.drawRect(pipelineGroup, null, width, height, postX, postY, '#FFFFFF', '#E2DDFF');

                pipelineGroupNode.setName(pipelineGroup.name);
                pipelineGroupNode.setStyle('label.font', GlobalConst.LABEL_FONT_16);
                pipelineGroupNode.setStyle('label.position', GlobalConst.LABEL_POSITION_BOTTOM);
                pipelineGroupNode.setStyle('label.offset.y', 10);

                let blockList = pipelineGroup.blockList || [];
                this.drawPipelineBlock(blockList, pipelineGroupNode);
            }
        },

        drawPipelineBlock(blockList, pipelineGroupNode) {
            let postX = pipelineGroupNode.getPosition().x;
            let postY = pipelineGroupNode.getPosition().y;
            let size = pipelineGroupNode.getSize();
            let width = pipelineGroupNode.getSize().width;
            let height = pipelineGroupNode.getSize().height;
            let attrGroup = pipelineGroupNode.getAttrObject();
            let cols = attrGroup.colQty || 6;
            let rows = attrGroup.rowQty || 6;
            let layout = attrGroup.layout;
            layout = 'U';
            let count = 0;
            let blockWidth = Math.floor((width - (cols + 1) * 5) / cols);
            let blockHeigh = blockWidth;
            for (let i = 1; i <= rows; i++) {
                for (let j = 1; j <= cols; j++) {
                    let index = (i - 1) * cols + j;
                    let blockPostX = postX - (width - blockWidth) / 2 + (j - 1) * blockWidth + j * 5;
                    let blockPostY = postY;
                    if (layout === 'D') {
                        blockPostY = postY - (width - blockWidth) / 2 + (i - 1) * blockWidth + i * 5;
                    } else if (layout === 'U') {
                        blockPostY = postY + (width - blockWidth) / 2 - (i - 1) * blockWidth - i * 5;
                    }

                    let pipelineBlockList = blockList.filter(block => block.colNo === j && block.rowNo === i);
                    if (pipelineBlockList.length > 0) {
                        let pipelineBlock = pipelineBlockList[0];
                        let sectionalShape = pipelineBlock.sectionalShape || 'S';

                        let pipelineBlockNode = null;
                        //C:Circular S:Square H:Hexagon
                        if (sectionalShape === 'C') {
                            pipelineBlockNode = this.drawCircle(
                                pipelineBlock,
                                pipelineGroupNode,
                                blockWidth,
                                blockHeigh,
                                blockPostX,
                                blockPostY,
                                '#FFFFFF',
                                '#E2DDFF'
                            );
                        } else if (sectionalShape === 'S') {
                            pipelineBlockNode = this.drawRect(
                                pipelineBlock,
                                pipelineGroupNode,
                                blockWidth,
                                blockHeigh,
                                blockPostX,
                                blockPostY,
                                '#FFFFFF',
                                '#E2DDFF'
                            );
                        } else if (sectionalShape === 'H') {
                            pipelineBlockNode = this.drawHexagon(
                                pipelineBlock,
                                pipelineGroupNode,
                                blockWidth,
                                blockHeigh,
                                blockPostX,
                                blockPostY,
                                '#FFFFFF',
                                '#E2DDFF'
                            );
                        }
                        pipelineBlockNode.setTag(pipelineBlock.pipeChannelId);
                        //pipelineBlockNode.setName(pipelineBlock.nameSeq);

                        let holeList = pipelineBlock.holeList || [];

                        this.drawPipelineHole(holeList, pipelineBlockNode);
                    }
                    //count++;
                }
            }
        },

        //画管道孔
        drawPipelineHole(holeList, pipelineBlockNode) {
            let attr = pipelineBlockNode.getAttrObject();
            let blockShapeType = attr.sectionalShape;
            if (blockShapeType === 'C') {
                this.drawPipelineHoleCircle(holeList, pipelineBlockNode);
            } else if (blockShapeType === 'S') {
                this.drawPipelineHoleRect(holeList, pipelineBlockNode);
            } else if (blockShapeType === 'H') {
                this.drawPipelineHoleHexagon(holeList, pipelineBlockNode);
            }
        },

        //画方形管道孔
        drawPipelineHoleRect(holeList, pipelineBlockNode) {
            let postX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
            let postY = pipelineBlockNode.getPosition().y;
            let width = pipelineBlockNode.getSize().width;
            let height = pipelineBlockNode.getSize().height;
            let attr = pipelineBlockNode.getAttrObject();
            //let blockShapeType = attr.sectionalShape;
            let layout = 'U';
            let holeAmout = attr.units;
            let colsQty = Math.sqrt(holeAmout);
            let rowsQty = Math.sqrt(holeAmout);
            let holeWidth = Math.floor((width - (colsQty + 1) * 5) / colsQty);
            //let holeWidth = width/colsQty;
            let holeHeight = holeWidth;
            for (let i = 1; i <= rowsQty; i++) {
                for (let j = 1; j <= colsQty; j++) {
                    let index = (i - 1) * colsQty + j;
                    let holeX = postX - (width - holeWidth) / 2 + (j - 1) * holeWidth + j * 5;
                    let holeY = 0;
                    if (layout === 'U') {
                        holeY = postY + (height - holeHeight) / 2 - (i - 1) * holeHeight - i * 5;
                    } else {
                        holeY = postY - (height - holeHeight) / 2 + (i - 1) * holeHeight + i * 5;
                    }
                    let pipelineHoleList = holeList.filter(hole => hole.colNo === j && hole.rowNo === i);
                    if (pipelineHoleList.length > 0) {
                        let pipelineHole = pipelineHoleList[0];
                        let shapeType = pipelineHole.sectionalShape;
                        let pipelineHoleNode = this.drawRect(
                            pipelineHole,
                            pipelineBlockNode,
                            holeWidth,
                            holeHeight,
                            holeX,
                            holeY,
                            '#FFFFFF',
                            '#E2DDFF'
                        );
                        pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
                        let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
                        pipelineHoleNode.setName(pipelineHole.name);
                        pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
                        pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
                        let cableList = pipelineHole.cableList || [];
                        if (cableList.length > 0) {
                            this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
                        }
                    }
                }
            }
        },

        //画圆形管道孔
        drawPipelineHoleCircle(holeList, pipelineBlockNode) {
            let posX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
            let posY = pipelineBlockNode.getPosition().y;
            let diameter = pipelineBlockNode.getSize().width;
            let size = diameter;
            let radius = diameter / 2 - CABLE_BORDER_WIDTH;
            let subCount = holeList.length;
            let subRadius = this.calculateSubRadius(subCount, radius);

            //需要调整的偏移值
            let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);

            let i = 0;
            holeList.forEach(pipelineHole => {
                let x = this.calculatePosX(posX, size / 2, radius, subCount, i, subRadius);
                let y = this.calculatePosY(posY, size / 2, radius, subCount, i, subRadius);

                let holeX = x - postWidth;
                let holeY = y - postWidth;
                let holeWidth = subRadius * 2;
                let holeHeight = subRadius * 2;
                if (subCount === 1) {
                    holeWidth = subRadius * 2 - 10;
                    holeHeight = subRadius * 2 - 10;
                }
                let pipelineHoleNode = this.drawCircle(pipelineHole, pipelineBlockNode, holeWidth, holeHeight, holeX, holeY, '#FFFFFF', '#E2DDFF');
                pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
                let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
                pipelineHoleNode.setName(pipelineHole.name);
                pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
                pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
                let cableList = pipelineHole.cableList || [];
                if (cableList.length > 0) {
                    this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
                }
                i++;
            });
        },

        //画六边形管道孔
        drawPipelineHoleHexagon(holeList, pipelineBlockNode) {
            let posX = pipelineBlockNode.getPosition().x; //parent.getLocation().x;
            let posY = pipelineBlockNode.getPosition().y;
            let width = pipelineBlockNode.getSize().width;
            let subSize = (width * Math.sin(Math.PI / 3)) / 3 - 3;

            let postList = this.getHexagonPosition(posX, posY, subSize);

            let i = 0;
            holeList.forEach(pipelineHole => {
                if (i < 7) {
                    let holeX = postList[i].x;
                    let holeY = postList[i].y;
                    let pipelineHoleNode = this.drawHexagon(pipelineHole, pipelineBlockNode, subSize, subSize, holeX, holeY, '#FFFFFF', '#E2DDFF');
                    pipelineHoleNode.setTag(pipelineHole.pipeChannelId);
                    let curOccupyRate = Math.round(pipelineHole.curOccupyRate * 100, 2) + '%';
                    pipelineHoleNode.setName(pipelineHole.name);
                    pipelineHoleNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
                    pipelineHoleNode.setStyle('label.position', GlobalConst.LABEL_POSITION_CENTER);
                    let cableList = pipelineHole.cableList || [];
                    if (cableList.length > 0) {
                        this.drawCableAll(cableList, pipelineHoleNode, 'red', '#E2DDFF');
                    }
                }
                i++;
            });
        },

        drawCableAll(cableList, pipelineHoleNode, bgColor, borderColor) {
            let holeAttr = pipelineHoleNode.getAttrObject();
            let posX = pipelineHoleNode.getPosition().x; //parent.getLocation().x;
            let posY = pipelineHoleNode.getPosition().y;
            let diameter = pipelineHoleNode.getSize().width;
            let size = diameter;
            let radius = diameter / 2 - CABLE_BORDER_WIDTH;
            let subCount = cableList.length;
            let subRadius = this.calculateSubRadius(subCount, radius);
            let postWidth = this.calculatePosX(0, size / 2, radius, subCount, 0, subRadius);
            let cableI = 0;

            cableList.forEach(cable => {
                let x = this.calculatePosX(posX, size / 2, radius, subCount, cableI, subRadius);
                let y = this.calculatePosY(posY, size / 2, radius, subCount, cableI, subRadius);

                let cableX = x - postWidth;
                let cableY = y - postWidth;
                let cableWidth = subRadius * 2;
                let cableHeight = subRadius * 2;
                if (subCount === 1) {
                    cableWidth = subRadius;
                    cableHeight = subRadius;
                }

                cable.pipeChannelId = holeAttr.pipeChannelId;
                cable.pipelineId = holeAttr.pipelineId;

                let cableBgColor = bgColor;

                let cableNode = this.drawCircle(cable, pipelineHoleNode, cableWidth, cableHeight, cableX, cableY, cableBgColor, borderColor);
                cableNode.setToolTip(cable.name);
                cableI++;
            });
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

        getHexagonPosition(xPos, yPos, subSize) {
            let postList = [];
            for (let i = 0; i < 7; i++) {
                let post = {};
                let x;
                let y;
                if (i == 0) {
                    x = xPos - subSize;
                    y = yPos - subSize / 2;
                } else if (i == 1) {
                    x = xPos - subSize;
                    y = yPos + subSize / 2;
                } else if (i == 2) {
                    x = xPos;
                    y = yPos - subSize;
                } else if (i == 3) {
                    x = xPos;
                    y = yPos;
                } else if (i == 4) {
                    x = xPos;
                    y = yPos + subSize;
                } else if (i == 5) {
                    x = xPos + subSize;
                    y = yPos - subSize / 2;
                } else if (i == 6) {
                    x = xPos + subSize;
                    y = yPos + subSize / 2;
                }
                post.x = x;
                post.y = y;
                postList.push(post);
            }
            return postList;
        },

        //画方框
        drawRect(data, parent, width, height, posX, posY, bgColor, borderColor) {
            if (!bgColor) {
                bgColor = 'lightgray';
            }
            if (!borderColor) {
                borderColor = 'LightSkyBlue';
            }
            let x = parent ? parent.getPosition().x - parent.getSize().width / 2 + width / 2 + posX : posX;
            let y = parent ? parent.getPosition().y - parent.getSize().height / 2 + height / 2 + posY : posY;

            let routeNode = new ht.Node();
            routeNode.movable = false;
            routeNode.setSize(width, height);
            routeNode.setPosition(posX, posY);
            routeNode.setStyle('shape', 'rect'); //矩形
            routeNode.setStyle('shape.background', bgColor);
            routeNode.setStyle('shape.border.width', 2);
            routeNode.setStyle('shape.border.color', borderColor);
            routeNode.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            routeNode.setStyle('label.position', 17);
            routeNode.setImage('');
            if (parent) {
                parent.addChild(routeNode);
                //routeNode.setParent(parent);
                routeNode.setHost(parent);
            }

            if (data) {
                routeNode.setAttrObject(data);
            }
            this.dataModel.add(routeNode);
            return routeNode;
        },
        //画圆
        drawCircle(data, parent, width, height, posX, posY, bgColor, borderColor) {
            if (!bgColor) {
                bgColor = 'lightgray';
            }
            if (!borderColor) {
                borderColor = 'LightSkyBlue';
            }

            let node = new ht.Node();
            node.movable = false;
            node.setSize(width, height);
            node.setPosition(posX, posY);
            node.setStyle('shape', 'circle'); //矩形
            node.setStyle('select.type', 'shadow');
            node.setStyle('shadow.blur', 2);
            node.setStyle('shadow.offset.x', 0);
            node.setStyle('shadow.offset.y', 0);
            node.setStyle('shape.background', bgColor);
            node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
            node.setStyle('shape.border.color', borderColor);
            node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            node.setStyle('label.position', 17);
            node.setImage('');
            if (parent) {
                node.setParent(parent);
                //parent.addChild(node);
                node.setHost(parent);
            }

            if (data) {
                node.setAttrObject(data);
            }
            this.dataModel.add(node);
            return node;
        },
        //画六边形
        drawHexagon(data, parent, width, height, posX, posY, bgColor, borderColor) {
            if (!bgColor) {
                bgColor = 'lightgray';
            }
            if (!borderColor) {
                borderColor = 'LightSkyBlue';
            }

            let node = new ht.Node();
            node.movable = false;
            node.setSize(width, height);
            node.setPosition(posX, posY);
            node.setStyle('shape', 'polygon'); //六边形
            node.setStyle('shape.polygon.side', 6);
            node.setStyle('select.type', 'shadow');
            node.setStyle('shadow.blur', 2);
            node.setStyle('shadow.offset.x', 0);
            node.setStyle('shadow.offset.y', 0);
            node.setStyle('shape.background', bgColor);
            node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
            node.setStyle('shape.border.color', borderColor);
            node.setStyle('label.font', GlobalConst.LABEL_FONT_DEFAULT);
            node.setStyle('label.position', 17);
            node.setImage('');
            if (parent) {
                node.setParent(parent);
                //parent.addChild(node);
                node.setHost(parent);
            }

            if (data) {
                node.setAttrObject(data);
            }
            this.dataModel.add(node);
            return node;
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
};
</script>

<style lang="scss" scoped>
.topo-content {
    width: 100%;
    height: 100%;
}
// @import '../topo-template/scss/topoTemplate.scss';
</style>