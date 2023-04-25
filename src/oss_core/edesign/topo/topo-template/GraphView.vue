<template>
    <div class="graph-view" ref="graph" @click="selectNode" @mousemove="mouseMove"></div>
</template>
<script>
    /// <reference path="../../../../index.d.ts"/>
    //import ToggleOverview from './ToggleOverview';
    export default {
        name: 'GraphView',
        components: {},
        props: {
            data: Array,
            showRightMenu: Boolean,
            showMouseEvent: Boolean,
            menuSource: Function,
            toolEvent:String
        },
        computed: {},
        data() {
            return {
                layoutType:'false',
            };
        },
        created() {
            this.dataModel = new ht.DataModel();
            this.graphView = new ht.graph.GraphView(this.dataModel);
            this.graphView.setLayers([0, 1, 'Layer2','Layer3','Layer4','Layer5','Layer6']);
            this.graphView.enableToolTip();
            this.graphView.setMovableFunc(elem => elem.movable);
            let view = this.graphView.getView();
            view.className = 'topo-graphic';

            //this.overview = new ToggleOverview(this.graphView);
            //this.overview.getView().className = 'topo-overview topo-overview-animation';

            if (this.showRightMenu) {
                const contextMenu = new ht.widget.ContextMenu();
                let contextView = contextMenu.getView();
                contextView.className = 'context-menu';
                contextMenu.beforeShow = e => {
                    let node = this.graphView.getDataAt(e);
                    let items = [];
                    if (this.menuSource && fish.isFunction(this.menuSource)) {
                        items = this.menuSource(node);
                    }
                    contextMenu.setItems(items);
                };
                contextMenu.addTo(view);
            }
        },
        mounted() {
            this.$refs.graph.appendChild(this.graphView.getView());
            //this.$refs.graph.appendChild(this.overview.getView());
        },
        methods: {
            redraw(data) {
                //this.graphView.invalidateAll();
                this.dataModel.clear();
                data.forEach(node => this.dataModel.add(node));

                //this.graphView.fitContent();
                if (this.layoutType==='true'){
                    this.graphView.fitContent();
                }
                else if (this.layoutType==='false'){
                    //不需要自适应
                }
                else {
                    //自动布局
                    //circular,symmetric,towardnorth,towardsouth,towardeast,towardwest,hierarchical
                    this.layout(true, this.layoutType);
                }

            },
            getDataModel() {
                return this.dataModel;
            },
            getGraphView() {
                //console.info("GraphView's getGraphView.");
                return this.graphView;
            },
            setLayoutType(type){
                this.layoutType = type;
            },

            autoLayouter(){
                return new ht.layout.AutoLayout(this.graphView);
            },
            layout(animate, type){
                let gv = this.graphView;
                this.autoLayouter().setAnimate(animate);
                this.autoLayouter().layout(type, function(){
                    gv.fitContent(animate);
                });
            },

            setEditable(flag) {
                this.graphView.setEditable(flag);
            },
            selectNode(e) {
                if (this.graphView) {
                    let node = this.graphView.getDataAt(e);
                    //node && this.$emit('click-node', node);
                    if (node) {
                        this.$emit('click-node', node);
                    }
                    else {
                        this.$emit('click-node', null);
                    }

                }
            },
            mouseMove(e){
                //console.info("mouseMove");
                if (this.graphView) {
                    let node = this.graphView.getDataAt(e);
                    if (node) {
                        if (this.showMouseEvent){
                            this.$emit('mousemove-node', e, node);
                            //console.info("mouseMove >>>>>>>>>>>>>>>>>>>>>>>>>>>");
                        }
                    }
                }

            },

            ToolClick(eventName) {
                if (eventName==='zoomIn'){
                    this.graphView.zoomIn();
                }
                else if (eventName==='zoomOut'){
                    this.graphView.zoomOut();
                }
                else if (eventName==='fitContent'){
                    this.graphView.fitContent();
                }
                else if (eventName==='refresh'){
                    this.graphView.zoomReset();
                    this.graphView.fitContent();
                }
            }
        },
        watch: {
            data: {
                handler(val, old) {
                    this.redraw(val);
                }
            }
            // toolEvent:{
            //     deep:true,
            //     immediate:true,
            //     handler(val,old) {
            //         this.ToolClick(val);
            //     }
            // }
        }
    };
</script>

<style>
    .graph-view {
        height: 100%;
        width: 100%;
        position: relative;
    }
    .graph-view .topo-overview {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 150px;
    }

    .graph-view .topo-overview-animation {
        -webkit-transition: width 0.3s, height 0.3s;
        -moz-transition: width 0.3s, height 0.3s;
        -o-transition: width 0.3s, height 0.3s;
        transition: width 0.3s, height 0.3s;
        z-index: 1;
    }
    .graph-view .topo-graphic {
        height: 100%;
        width: 100%;
        display: inline-block;
        position: absolute;
        z-index: 999;
    }
    .context-menu {
        z-index: 999;
    }
</style>
