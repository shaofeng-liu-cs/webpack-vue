<style lang="scss">
.tool-popover {
	background: white;
	padding: 0;
	border: none;
	border-radius: 3px;
	display: inline;
	
	.popover-content {
		padding: 0;
		width: 32px;
	}
}
</style>
<template>
	<div class="tool-bar">
		<div :name="item.name" @click="triggerEvent(item)" v-for="item in buttons" :key="item.id">
			<img :src="item.image" :title="item.title" width="32" height="32" />
		</div>
		<popover trigger="hover" placement="bottom" popClass="tool-popover" :key="buttonItem.id" v-for="buttonItem in selectButtons">
			<div ref="testButtons[0].id"  @click="triggerEvent(buttonItem.buttons[0])" :title="buttonItem.buttons[0].title">
				<img :src="buttonItem.buttons[0].image" :title="buttonItem.buttons[0].title" width="32" height="32" />
			</div>
			<ul slot="content" class="v9-popover-ul">
				<li class="menu-item" @click="triggerEvent(item)" v-for="(item, index) in buttonItem.buttons" :key="item.id" v-if="index>0">
					<img :src="item.image" :title="item.title" width="32" height="32" />
				</li>
			</ul>
		</popover>
	</div>
</template>
<script>
/// <reference path="../../../../index.d.ts"/>
//import { merge } from '@/utils/util';
import { merge } from '../../../base/utils/util';
export default {
	name: 'ToolBar',
	components: {},
	props: {
		customButtons: Array,
		selectButtons: Array
	},
	computed: {
		buttons() {
			return merge(this.customButtons, this.defaultButtons);
		},
	},
	data() {
		return {
			selfButtons: [],
			defaultButtons: [
				{
					id: 'select',
					name: this.$t('BTN_SELECT'),
					image: 'oss_core/edesign/assets/image/topo-tool-bar/selectMove.png',
					title: this.$t('BTN_SELECT'),
					event: 'select',
				},
				{
					id: 'zoomIn',
					name: this.$t('BTN_ZOOM_IN'),
					image: 'oss_core/edesign/assets/image/topo-tool-bar/zoomIn.png',
					title: this.$t('BTN_ZOOM_IN'),
					event: 'zoomIn',
				},
				{
					id: 'zoomOut',
					name: this.$t('BTN_ZOOM_OUT'),
					image: 'oss_core/edesign/assets/image/topo-tool-bar/zoomOut.png',
					title: this.$t('BTN_ZOOM_OUT'),
					event: 'zoomOut',
				},
				{
					id: 'fitContent',
					name: this.$t('BTN_FIT_CONTENT'),
					image: 'oss_core/edesign/assets/image/topo-tool-bar/fitContent.png',
					title: this.$t('BTN_FIT_CONTENT'),
					event: 'fitContent',
				},
				{
					id: 'refresh',
					name: this.$t('BTN_REFRESH'),
					image: 'oss_core/edesign/assets/image/topo-tool-bar/refresh.png',
					title: this.$t('BTN_REFRESH'),
					event: 'refresh',
				},
			],
		};
	},
	created() {
		console.info('tools: ' + this.customButtons);
	},
	mounted() {
		console.info('nounted tools: ' + this.customButtons);
	},
	methods: {
		setSelfTools(arrTools) {
			this.selfButtons = arrTools;
			//console.info("setSelfTools: "+this.customButton);
		},

		triggerEvent(item) {
			//console.info("toolbar: " + eventName);
			this.$emit('click', item);
		},
		directClick(name) {
			this.$refs[name].click();
			if (name !== 'A0' && name !== 'A1') {
				let gisDom = this.$refs[name].querySelector('div');
				gisDom.click();
			}
		},
	},
};
</script>
<i18n src="../i18n.json"></i18n>
<style lang="scss" scoped>
@import './scss/toolBar.scss';
</style>
