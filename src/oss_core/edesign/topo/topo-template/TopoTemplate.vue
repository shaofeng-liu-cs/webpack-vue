<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-03-15 17:14:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\topo\topo-template\TopoTemplate.vue
-->
<template>
    <div class="topo-template">
        <div class="tool-bar-wrapper" v-if="showToolbar">
            <ToolBar ref="toolsBar" @click="toolbarClick" :custom-buttons="toolButtons" :select-buttons="toolSelectButtons"></ToolBar>
        </div>
        <div v-bind:class="{ 'graph-wrapper': showToolbar, 'graph-wrapper-all': !showToolbar }">
            <GraphView ref="graphView" :toolEvent="toolEvent" :data="dataSource" :show-right-menu="showRightMenu" :show-mouse-event="showMouseEvent" :menu-source="menuSource" @click-node="clickNode" @mousemove-node="mousemoveNode"></GraphView>
        </div>
    </div>
</template>
<script>
import GraphView from './GraphView.vue';
import ToolBar from './ToolBar.vue';
export default {
    name: 'TopoTemplate',
    components: {
        GraphView,
        ToolBar,
    },
    props: {
        toolButtons: Array,
		toolSelectButtons:Array,
        dataSource: Array,
        showRightMenu: Boolean,
        showToolbar: Boolean,
        showMouseEvent: { type: Boolean, default: false },
        menuSource: Function,
    },
    data() {
        return {
            toolEvent: '',
        };
    },
    mounted() {},
    created() {},
    methods: {
        getGraph() {
            return this.$refs.graphView;
        },
        getTool() {
            this.$refs.toolsBar;
        },
        getGraphView() {
            //console.info("TopoTemplate's getGraphView.");
            return this.$refs.graphView.getGraphView();
        },
        setTools(arrTools) {
            //console.info("setTools tools1:" + arrTools);
            //console.info(this.$refs);
            this.$refs.toolsBar.setSelfTools(arrTools);
            //console.info("setTools tools2:" + arrTools);
            //this.toolButtons = array;
        },
        setEditable(flag) {
            this.$refs.graphView.setEditable(flag);
        },
        toolbarClick(item) {
            //console.info("topoTemplate=" + eventName);
            let eventName = item.event;
            this.$emit(eventName);
            this.toolEvent = eventName;
            this.$emit('click-tool-node', item);
            this.$refs.graphView.ToolClick(eventName);
        },
        refreshTopo() {
            this.$refs.graphView.ToolClick('refresh');
        },
        clickNode(node) {
            this.$emit('click-node', node);
        },
        mousemoveNode(e, node) {
            if (this.showMouseEvent) {
                this.$emit('mousemove-node', e, node);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import './scss/topoTemplate.scss';
</style>
