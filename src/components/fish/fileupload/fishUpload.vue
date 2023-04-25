<template>
	<transitions>
		<span id="uploader" class="btn btn-primary fileinput-button">
			<slot name="icon"></slot>
			<slot name="name"></slot>
			<Upload></Upload>
		</span>
	</transitions>
</template>

<script>
	import Upload from './upload.vue'
	export default {
		name: 'FishUpload',
		data() {
			return {
				key: value
			}
		},
		props: {

		},
		mounted() {

		},
		methods: {

		}
	}
</script>

<style>
</style>
