<template>
    <div class="cs-block" style="height:100%;">
        <TopoTemplate ref="pipelineTempTopo" v-if="templateType == 'PIPELINE_TEMP'" :data-source="graphData" :show-toolbar="true" :show-right-menu="false" :menu-source="menuSource" @click-node="clickNode" @select="selectMode"></TopoTemplate>
    </div>
</template>

<script>
import TopoTemplate from '../topo-template/TopoTemplate.vue';
export default {
    name: 'pipelineTemplateTopo',
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
            templateType: 'PIPELINE_TEMP',
        };
    },
    mounted() {
        if (this.templateId) {
            this.loadPipeLineTopoList(this.templateId);
        }
    },
    created() {},
    methods: {
        loadPipeLineTopoList(templateId) {
            if (!templateId) {
                return;
            }
            let datas = {
                templateId: templateId,
            };
            console.info('pipeLine template templateId=' + templateId);
            //let url = "/edesign/template/pipelinetemplate/v1";
            let url = 'edesign/template/query/pipelinetemplate/v1';
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
                error: e => {
                    fish.error(e.responseJSON.message);
                },
            });
        },
        drawPipelineData(tempData) {
            this.graphData = [];
            let dataTopo = [];

            // this.drawPipelineSection(tempData, dataTopo);
			this.drawPipeLineTopo(tempData, dataTopo);

            if (this.$refs) {
                if (this.$refs.pipelineTempTopo) {
                    let gv = this.$refs.pipelineTempTopo.getGraph();
                    gv.setLayoutType('true');
                }
            }

            this.graphData = dataTopo;
        },
		drawPipeLineTopo(tempData, dataTopo){
			let width = 150;
			let height = 150;
			let postX = 0;
			let postY = 0;
			
			let blockData = tempData;
			let shapeType = blockData.sectionalShape || 'S';
			let blockNode = new ht.Node();
			blockNode.movable = false;
			blockNode.setSize(width, height);
			blockNode.setPosition(postX, postY);
			//blockNode.setName(index);
			if (shapeType === 'C') {
				blockNode.setStyle('shape', 'circle');
				blockNode.setStyle('select.type', 'shadow');
				blockNode.setStyle('shadow.blur', 2);
				blockNode.setStyle('shadow.offset.x', 0);
				blockNode.setStyle('shadow.offset.y', 0);
			} else if (shapeType === 'S') {
				blockNode.setStyle('shape', 'rect');
			} else if (shapeType === 'H') {
				blockNode.setStyle('shape', 'polygon');
				blockNode.setStyle('shape.polygon.side', 6);
			}
			blockNode.setStyle('label.position', 17);
			blockNode.setStyle('label.font', '22px Arial');
			blockNode.setStyle('shape.border.width', 2);
			blockNode.setStyle('shape.background', '#FFFFFF');
			blockNode.setStyle('shape.border.color', '#CCCCCC');
			blockNode.setStyle('vector.outline.width', '1');
			blockNode.setAttrObject(blockData);
			dataTopo.push(blockNode);
			
			let pipelineHoleList = blockData.pipeHoleTemplateList || [];
			if (pipelineHoleList.length > 0) {
				this.drawPipelineHoleForBlock(dataTopo, pipelineHoleList, blockNode);
			}
			
		},
		drawPipelineHoleForBlock(dataTopo, pipelineHoleList, blockNode) {
			let blockAttr = blockNode.getAttrObject();
			let shapeType = blockAttr.sectionalShape || 'S';
		
			if ('C' === shapeType) {
				this.drawPipelineHoleCircleForBlock(dataTopo, pipelineHoleList, blockNode);
			} else if ('S' === shapeType) {
				this.drawPipelineHoleRectForBlock(dataTopo, pipelineHoleList, blockNode);
			} else if ('H' === shapeType) {
				this.drawPipelineHoleHexagonForBlock(dataTopo, pipelineHoleList, blockNode);
			}
		},
	
		drawPipelineHoleCircleForBlock(dataTopo, pipelineHoleList, blockNode) {
			let postX = blockNode.getPosition().x;
			let postY = blockNode.getPosition().y;
			let width = blockNode.getSize().width;
			let height = blockNode.getSize().height;
			let blockAttr = blockNode.getAttrObject();
			let shapeType = blockAttr.sectionalShape || 'S';
			let holeCount = parseInt(blockAttr.pipelineQty); //管孔数；
			//let radius = width; //管道块的宽度或直径；
			let blockRadius = parseInt(width) / 2;
		
			let holeRadius = this.calculateSubRadius(holeCount, blockRadius); //管孔直径
		
			let postWidth = this.calculatePosX(0, blockRadius, blockRadius, holeCount, 0, holeRadius);
			let i = 0;
			pipelineHoleList.forEach(pipelineHole => {
				let memberTemp = pipelineHole.memberTemplate;
				let holeShapeType = memberTemp.sectionalShape;
				// let holeWidth = subRadius;
				// let holeHeigh = subRadius;
				let xHole = this.calculatePosX(postX, blockRadius, blockRadius, holeCount, i, holeRadius);
				let yHole = this.calculatePosY(postY, blockRadius, blockRadius, holeCount, i, holeRadius);
				let holePostX = xHole - postWidth;
				let holePostY = yHole - postWidth;
			
				let holeNode = new ht.Node();
				holeNode.movable = false;
				holeNode.setSize(holeRadius * 2, holeRadius * 2);
				holeNode.setPosition(holePostX, holePostY);
				//holeNode.setName(index);
				holeNode.setStyle('shape', 'circle');
				holeNode.setStyle('select.type', 'shadow');
				holeNode.setStyle('shadow.blur', 1);
				holeNode.setStyle('shadow.offset.x', 0);
				holeNode.setStyle('shadow.offset.y', 0);
				holeNode.setStyle('label.position', 17);
				holeNode.setStyle('label.font', '22px Arial');
				holeNode.setStyle('shape.border.width', 1);
				holeNode.setStyle('shape.background', '#FFFFFF');
				holeNode.setStyle('shape.border.color', '#CCCCCC');
				holeNode.setStyle('vector.outline.width', '1');
				holeNode.setAttrObject(pipelineHole);
				holeNode.addChild(holeNode);
				holeNode.setHost(blockNode);
				dataTopo.push(holeNode);
				i++;
			});
		},
		//方形孔
		drawPipelineHoleRectForBlock(dataTopo, pipelineHoleList, blockNode) {
			let postX = blockNode.getPosition().x;
			let postY = blockNode.getPosition().y;
			let width = blockNode.getSize().width;
			let height = blockNode.getSize().height;
			let blockAttr = blockNode.getAttrObject();
			let shapeType = blockAttr.sectionalShape;
			let holeCount = parseInt(blockAttr.pipelineQty); //管孔数；
			let cols = Math.sqrt(holeCount);
			let rows = Math.sqrt(holeCount);
			//let cols = blockAttr.memberTemplate.colsQty;
			//let rows = blockAttr.memberTemplate.rowsQty;
			//let holeWidth = width/cols;
			let holeWidth = Math.floor((width - (cols + 1) * 3) / cols);
			let holeHeight = holeWidth;
		
			for (let i = 1; i <= rows; i++) {
				for (let j = 1; j <= cols; j++) {
					let index = (i - 1) * cols + j;
					let holePostX = postX - (width - holeWidth) / 2 + (j - 1) * holeWidth + j * 3;
					let holePostY = postY;
					holePostY = postY - (width - holeWidth) / 2 + (i - 1) * holeWidth + i * 3;
					// if (layout==='D') {
					//     holePostY = postY - (width - holeWidth)/2 + ((i-1) * holeWidth);
					// }
					// else if (layout === 'U') {
					//     holePostY = postY + (width - holeWidth)/2  - ((i-1) * holeWidth);
					// }
					let holeList = pipelineHoleList.filter(hole => hole.colNo === j && hole.rowNo === i);
					if (holeList.length > 0) {
						let holeData = holeList[0];
						let memberTempHole = holeData.memberTemplate;
						let shapeType = memberTempHole.sectionalShape;
						let holeNode = new ht.Node();
						holeNode.movable = false;
						//holeNode.setName(index);
						holeNode.setSize(holeWidth, holeWidth);
						holeNode.setPosition(holePostX, holePostY);
						holeNode.setStyle('shape', 'rect');
						holeNode.setStyle('label.position', 17);
						holeNode.setStyle('label.font', '12px Arial');
						holeNode.setStyle('shape.border.width', 1);
						holeNode.setStyle('shape.background', '#FFFFFF');
						holeNode.setStyle('shape.border.color', '#CCCCCC');
						holeNode.setStyle('vector.outline.width', '1');
						//holeNode.setAttrObject(pipelineHole);
						holeNode.addChild(holeNode);
						holeNode.setHost(blockNode);
						dataTopo.push(holeNode);
					}
				}
			}
		},
		//六边形孔
		drawPipelineHoleHexagonForBlock(dataTopo, pipelineHoleList, blockNode) {
			let postX = blockNode.getPosition().x;
			let postY = blockNode.getPosition().y;
			let width = blockNode.getSize().width;
			let height = blockNode.getSize().height;
			let blockAttr = blockNode.getAttrObject();
			let shapeType = blockAttr.sectionalShape;
			let holeCount = parseInt(blockAttr.pipelineQty); //管孔数；
			let subSize = (width * Math.sin(Math.PI / 3)) / 3 - 3;
			let postList = this.getHexagonPosition(postX, postY, subSize);
			let index = 0;
			pipelineHoleList.forEach(hole => {
				if (index < 7) {
					let x = postList[index].x;
					let y = postList[index].y;
					let holeNode = new ht.Node();
					//holeNode.setName((index+1) + '');
					holeNode.setSize(subSize, subSize);
					holeNode.setPosition(x, y);
					holeNode.setStyle('shape', 'polygon');
					holeNode.setStyle('shape.polygon.side', 6);
					holeNode.setStyle('shape.border.width', 1);
					holeNode.setStyle('label.position', 17); //中间
					holeNode.setStyle('label.font', '10px Arial');
					holeNode.setStyle('shape.border.color', '#CCCCCC');
					holeNode.setStyle('shape.background', '#ffffff');
					holeNode.setParent(blockNode);
					holeNode.setAttrObject(hole);
					dataTopo.push(holeNode);
					index++;
				}
			});
		},
		
		
        //管道组、
        drawPipelineSection(tempData, dataTopo) {
            let width = 150;
            let height = 150;
            let postX = 0;
            let postY = 0;

            let sectionData = this.getPipelineSetionRank(tempData);

            let sectionNode = new ht.Node();
            sectionNode.setAttrObject(sectionData);
            sectionNode.movable = false;
            sectionNode.setSize(width, height);
            sectionNode.setPosition(postX, postY);
            //sectionNode.setName('PIPELINE');
            sectionNode.setStyle('shape', 'rect');
            sectionNode.setStyle('label.position', 17);
            sectionNode.setStyle('label.font', '22px Arial');
            sectionNode.setStyle('shape.border.width', 3);
            sectionNode.setStyle('shape.background', '#FFFFFF');
            sectionNode.setStyle('shape.border.color', '#CCCCCC');
            sectionNode.setStyle('vector.outline.width', '5');
            dataTopo.push(sectionNode);

            let pipeBlockList = tempData.pipeBlockTemplateList || []; //管道块
            if (pipeBlockList.length > 0) {
                this.drawPipelineBlock(dataTopo, pipeBlockList, sectionNode);
            }
        },
        //管道块
        drawPipelineBlock(dataTopo, pipeBlockList, parentNode) {
            let postX = parentNode.getPosition().x;
            let postY = parentNode.getPosition().y;
            let width = parentNode.getSize().width;
            let height = parentNode.getSize().height;
            let sectionAttr = parentNode.getAttrObject();
            let cols = sectionAttr.colsQty;
            let rows = sectionAttr.rowsQty;
            let layout = sectionAttr.layout;
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

                    let blockList = pipeBlockList.filter(block => block.colNo === j && block.rowNo === i);
                    if (blockList.length > 0) {
                        let blockData = blockList[0];
                        let memberTemplate = blockData.memberTemplate;
                        let shapeType = memberTemplate.sectionalShape || 'S';
                        let blockNode = new ht.Node();
                        blockNode.movable = false;
                        blockNode.setSize(blockWidth, blockHeigh);
                        blockNode.setPosition(blockPostX, blockPostY);
                        //blockNode.setName(index);
                        if (shapeType === 'C') {
                            blockNode.setStyle('shape', 'circle');
                            blockNode.setStyle('select.type', 'shadow');
                            blockNode.setStyle('shadow.blur', 2);
                            blockNode.setStyle('shadow.offset.x', 0);
                            blockNode.setStyle('shadow.offset.y', 0);
                        } else if (shapeType === 'S') {
                            blockNode.setStyle('shape', 'rect');
                        } else if (shapeType === 'H') {
                            blockNode.setStyle('shape', 'polygon');
                            blockNode.setStyle('shape.polygon.side', 6);
                        }
                        blockNode.setStyle('label.position', 17);
                        blockNode.setStyle('label.font', '22px Arial');
                        blockNode.setStyle('shape.border.width', 2);
                        blockNode.setStyle('shape.background', '#FFFFFF');
                        blockNode.setStyle('shape.border.color', '#CCCCCC');
                        blockNode.setStyle('vector.outline.width', '1');
                        blockNode.setAttrObject(blockData);
                        parentNode.addChild(blockNode);
                        blockNode.setHost(parentNode);
                        dataTopo.push(blockNode);

                        let pipelineHoleList = blockData.childMemberList || [];
                        if (pipelineHoleList.length > 0) {
                            this.drawPipelineHole(dataTopo, pipelineHoleList, blockNode);
                        }
                    }
                }
            }
        },
        //管孔
        drawPipelineHole(dataTopo, pipelineHoleList, blockNode) {
            let blockAttr = blockNode.getAttrObject();
            let shapeType = blockAttr.memberTemplate.sectionalShape;

            if ('C' === shapeType) {
                this.drawPipelineHoleCircle(dataTopo, pipelineHoleList, blockNode);
            } else if ('S' === shapeType) {
                this.drawPipelineHoleRect(dataTopo, pipelineHoleList, blockNode);
            } else if ('H' === shapeType) {
                this.drawPipelineHoleHexagon(dataTopo, pipelineHoleList, blockNode);
            }
        },
        //圆形孔
        drawPipelineHoleCircle(dataTopo, pipelineHoleList, blockNode) {
            let postX = blockNode.getPosition().x;
            let postY = blockNode.getPosition().y;
            let width = blockNode.getSize().width;
            let height = blockNode.getSize().height;
            let blockAttr = blockNode.getAttrObject();
            let shapeType = blockAttr.memberTemplate.sectionalShape;
            let holeCount = parseInt(blockAttr.memberTemplate.pipelineQty); //管孔数；
            //let radius = width; //管道块的宽度或直径；
            let blockRadius = parseInt(width) / 2;

            let holeRadius = this.calculateSubRadius(holeCount, blockRadius); //管孔直径

            let postWidth = this.calculatePosX(0, blockRadius, blockRadius, holeCount, 0, holeRadius);
            let i = 0;
            pipelineHoleList.forEach(pipelineHole => {
                let memberTemp = pipelineHole.memberTemplate;
                let holeShapeType = memberTemp.sectionalShape;
                // let holeWidth = subRadius;
                // let holeHeigh = subRadius;
                let xHole = this.calculatePosX(postX, blockRadius, blockRadius, holeCount, i, holeRadius);
                let yHole = this.calculatePosY(postY, blockRadius, blockRadius, holeCount, i, holeRadius);
                let holePostX = xHole - postWidth;
                let holePostY = yHole - postWidth;

                let holeNode = new ht.Node();
                holeNode.movable = false;
                holeNode.setSize(holeRadius * 2, holeRadius * 2);
                holeNode.setPosition(holePostX, holePostY);
                //holeNode.setName(index);
                holeNode.setStyle('shape', 'circle');
                holeNode.setStyle('select.type', 'shadow');
                holeNode.setStyle('shadow.blur', 1);
                holeNode.setStyle('shadow.offset.x', 0);
                holeNode.setStyle('shadow.offset.y', 0);
                holeNode.setStyle('label.position', 17);
                holeNode.setStyle('label.font', '22px Arial');
                holeNode.setStyle('shape.border.width', 1);
                holeNode.setStyle('shape.background', '#FFFFFF');
                holeNode.setStyle('shape.border.color', '#CCCCCC');
                holeNode.setStyle('vector.outline.width', '1');
                holeNode.setAttrObject(pipelineHole);
                holeNode.addChild(holeNode);
                holeNode.setHost(blockNode);
                dataTopo.push(holeNode);
                i++;
            });
        },
        //方形孔
        drawPipelineHoleRect(dataTopo, pipelineHoleList, blockNode) {
            let postX = blockNode.getPosition().x;
            let postY = blockNode.getPosition().y;
            let width = blockNode.getSize().width;
            let height = blockNode.getSize().height;
            let blockAttr = blockNode.getAttrObject();
            let shapeType = blockAttr.memberTemplate.sectionalShape;
            let holeCount = parseInt(blockAttr.memberTemplate.pipelineQty); //管孔数；
            let cols = Math.sqrt(holeCount);
            let rows = Math.sqrt(holeCount);
            //let cols = blockAttr.memberTemplate.colsQty;
            //let rows = blockAttr.memberTemplate.rowsQty;
            //let holeWidth = width/cols;
            let holeWidth = Math.floor((width - (cols + 1) * 3) / cols);
            let holeHeight = holeWidth;

            for (let i = 1; i <= rows; i++) {
                for (let j = 1; j <= cols; j++) {
                    let index = (i - 1) * cols + j;
                    let holePostX = postX - (width - holeWidth) / 2 + (j - 1) * holeWidth + j * 3;
                    let holePostY = postY;
                    holePostY = postY - (width - holeWidth) / 2 + (i - 1) * holeWidth + i * 3;
                    // if (layout==='D') {
                    //     holePostY = postY - (width - holeWidth)/2 + ((i-1) * holeWidth);
                    // }
                    // else if (layout === 'U') {
                    //     holePostY = postY + (width - holeWidth)/2  - ((i-1) * holeWidth);
                    // }
                    let holeList = pipelineHoleList.filter(hole => hole.colNo === j && hole.rowNo === i);
                    if (holeList.length > 0) {
                        let holeData = holeList[0];
                        let memberTempHole = holeData.memberTemplate;
                        let shapeType = memberTempHole.sectionalShape;
                        let holeNode = new ht.Node();
                        holeNode.movable = false;
                        //holeNode.setName(index);
                        holeNode.setSize(holeWidth, holeWidth);
                        holeNode.setPosition(holePostX, holePostY);
                        holeNode.setStyle('shape', 'rect');
                        holeNode.setStyle('label.position', 17);
                        holeNode.setStyle('label.font', '12px Arial');
                        holeNode.setStyle('shape.border.width', 1);
                        holeNode.setStyle('shape.background', '#FFFFFF');
                        holeNode.setStyle('shape.border.color', '#CCCCCC');
                        holeNode.setStyle('vector.outline.width', '1');
                        //holeNode.setAttrObject(pipelineHole);
                        holeNode.addChild(holeNode);
                        holeNode.setHost(blockNode);
                        dataTopo.push(holeNode);
                    }
                }
            }
        },
        //六边形孔
        drawPipelineHoleHexagon(dataTopo, pipelineHoleList, blockNode) {
            let postX = blockNode.getPosition().x;
            let postY = blockNode.getPosition().y;
            let width = blockNode.getSize().width;
            let height = blockNode.getSize().height;
            let blockAttr = blockNode.getAttrObject();
            let shapeType = blockAttr.memberTemplate.sectionalShape;
            let holeCount = parseInt(blockAttr.memberTemplate.pipelineQty); //管孔数；
            let subSize = (width * Math.sin(Math.PI / 3)) / 3 - 3;
            let postList = this.getHexagonPosition(postX, postY, subSize);
            let index = 0;
            pipelineHoleList.forEach(hole => {
                if (index < 7) {
                    let x = postList[index].x;
                    let y = postList[index].y;
                    let holeNode = new ht.Node();
                    //holeNode.setName((index+1) + '');
                    holeNode.setSize(subSize, subSize);
                    holeNode.setPosition(x, y);
                    holeNode.setStyle('shape', 'polygon');
                    holeNode.setStyle('shape.polygon.side', 6);
                    holeNode.setStyle('shape.border.width', 1);
                    holeNode.setStyle('label.position', 17); //中间
                    holeNode.setStyle('label.font', '10px Arial');
                    holeNode.setStyle('shape.border.color', '#CCCCCC');
                    holeNode.setStyle('shape.background', '#ffffff');
                    holeNode.setParent(blockNode);
                    holeNode.setAttrObject(hole);
                    dataTopo.push(holeNode);
                    index++;
                }
            });
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

		getPipeLineRank(tempData) {
			let block = {};
			block.templateId = tempData.templateId;
			block.templateName = tempData.templateName;
			block.tmplSpecId = tempData.tmplSpecId;
			block.resSpecId = tempData.resSpecId;
			block.bpkgId = tempData.bpkgId;
			block.members = tempData.members;
			block.rowsQty = tempData.rowsQty || 6;
			block.colsQty = tempData.colsQty || 6;
			block.layout = tempData.layout || 'D'; //U ：Buttom to Top  D：Top to Buttom
			return block;
		},
        getPipelineSetionRank(tempData) {
            let section = {};
            section.templateId = tempData.templateId;
            section.templateName = tempData.templateName;
            section.tmplSpecId = tempData.tmplSpecId;
            section.resSpecId = tempData.resSpecId;
            section.bpkgId = tempData.bpkgId;
            section.members = tempData.members;
            section.rowsQty = tempData.rowsQty || 6;
            section.colsQty = tempData.colsQty || 6;
            section.layout = tempData.layout || 'D'; //U ：Buttom to Top  D：Top to Buttom
            return section;
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
            this.$refs.pipelineTempTopo.refreshTopo();
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
                this.loadPipeLineTopoList(val);
            },
        },
    },
};
</script>

<style>
</style>