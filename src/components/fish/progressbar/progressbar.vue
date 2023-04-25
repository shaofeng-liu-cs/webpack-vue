<template>
	<div ref="progressbar" ></div>
</template>

<script>
	export default {
		name: 'Progressbar',
		props: {
			value: {
				type: Number
			},
			label:{
				type:String
			},
			max:{
				type:Number
			},
			min:{
				type:Number
			},
			progressbarClass:{
				type:String
			}
		},
		computed: {
			option() {
				return {
					change: (e, ui) => {
						this.$emit('change', e, ui)
						this.$emit('input',$(this.$refs.progressbar).progressbar("value"))
					},
					create: (e, ui) => {
						this.$emit('create', e, ui)
					},
					complete: (e, ui) => {
						ui.progressbar.progressbar('label', 'Complete!');
					},
					label:this.label,
					value:this.value,
					max:this.max,
					min:this.min,
					progressbarClass:this.progressbarClass
				}
			}
		},
		data() {
			return {

			}
		},
		model: {
			prop: 'value',
			event: 'input'
		},
		mounted() {
			let option = Object.assign({},this.option)
			$(this.$refs.progressbar).progressbar(option);
		},
		methods: {

		},
		watch: {
			value:{
				deep: true,
				handler(val, old) {
					if (val <= this.max) {
						$(this.$refs.progressbar).progressbar("value", val)
					}
					
				}
			}
		}
	}
</script>

<style>
</style>
