<template>
	<div class="topo-template">
		<div class="tool-bar-wrapper" v-if="showToolbar">
			<ToolBar ref="toolsBar" @click="toolbarClick" :custom-buttons="toolButtons" :selectButtons="toolSelectButtons"></ToolBar>
        </div>
		<div id="panel_drawer" v-bind:class="{ 'graph-wrapper': showToolbar, 'graph-wrapper-all': !showToolbar }">
			<div class="graph-view" ref="graph"></div>
			<TopoOverView ref="topoOverView" :topoOverViewShow="showOverView" :graphView="graphView" style="position:absolute" ></TopoOverView>
            <PortPanel ref="portPanel" :portDrawerShow="portDrawer" style="position:absolute" :portCloseCallBack="portCloseCallBack"></PortPanel>
            <RoomPanel ref="roomPanel" :roomDrawerShow="roomDrawer" style="position:absolute" :roomCloseCallBack="roomCloseCallBack"></RoomPanel>
            <PipePanel ref="pipePanel" :pipeDrawerShow="pipeDrawer" style="position:absolute" :pipeCloseCallBack="pipeCloseCallBack"></PipePanel>
            <FacilityPanel ref="facilityPanel" :facilityDrawerShow="facilityDrawer" style="position:absolute" :facilityCloseCallBack="facilityCloseCallBack"></FacilityPanel>
        </div>
	</div>
</template>
<script>
import ToolBar from './ToolBar.vue';
import PortPanel from '../../osp/topo-control/device_design/portPanel.vue';
import RoomPanel from '../../osp/topo-control/device_design/roomPanel.vue';
import PipePanel from '../../osp/topo-control/device_design/pipePanel.vue';
import FacilityPanel from '../../osp/topo-control/device_design/facilityPanel.vue';
import TopoOverView from "@/oss_core/edesign/topo/topo-template/TopoOverView.vue";

export default {
	name: 'TopoView',
	components: {
		ToolBar,
        PortPanel,
        RoomPanel,
        PipePanel,
        FacilityPanel,
		TopoOverView,
	},
	props: {
		showToolbar: Boolean,
		showOverView: {
			type: Boolean,
			default:false
		},
		toolButtons: Array,
		toolSelectButtons:Array,
		graphView: ht.graph.GraphView,
		menuSource: Function,
        portCloseCallBack: Function,
        roomCloseCallBack: Function,
        pipeCloseCallBack: Function,
        facilityCloseCallBack: Function,
		//dataSource: Array,
		//showRightMenu: Boolean,
		//showMouseEvent: { type: Boolean, default: false },
		//menuSource: Function,
	},

	data() {
		return {
            portDrawer: false,
            roomDrawer: false,
            pipeDrawer: false,
            facilityDrawer: false,
						menuShowState:false,
		};
	},

	created() {},

	mounted() {
		let view = this.graphView.getView();
		view.className = 'topo-graphic';
		this.$refs.graph.appendChild(this.graphView.getView());

		if (this.menuSource) {
			const contextMenu = new ht.widget.ContextMenu();
			let contextView = contextMenu.getView();
			contextView.className = 'context-menu';
			contextMenu.enableGlobalKey();
			contextMenu.beforeShow = e => {
				let nodes = this.graphView.getSelectionModel().getSelection();
				let items = [];
				if (fish.isFunction(this.menuSource)) {
					items = this.menuSource(nodes);
					contextMenu.setItems(items);
				}
				else {
					contextMenu.setItems([]);
				}
				contextMenu.setItems(items);
			};
			
			contextMenu.addTo(view);
		}
	},

	methods: {
		toolbarClick(item) {
			let eventName = item.id;
			if (eventName === 'zoomIn') {
				this.graphView.zoomIn();
			} else if (eventName === 'zoomOut') {
				this.graphView.zoomOut();
			} else if (eventName === 'refresh') {
				//this.graphView.zoomReset();
				this.$emit('click-toolbar', eventName);
			} else if (eventName === 'fitContent') {
				this.graphView.fitContent();
			} else {
				this.$emit('click-toolbar', eventName);
			}
		},

	},
};
</script>

<style lang="scss" scoped>
#panel_drawer{
    overflow: hidden;
    position: relative;
	height: 100%;
}

/deep/ .el-drawer__wrapper{
	width: 320px;
	left: initial;
}
@import './scss/topoTemplate.scss';
</style>
