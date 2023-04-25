<template>
	<input ref="spinner" class="form-control" :value="values">
</template>

<script>
	export default {
		name: 'Spinner',
		props: {
			values: {
				type: Number
			},
			loop: {
				type: Boolean
			},
			max: {
				type: Number
			},
			min: {
				type: Number
			},
			page: {
				type: Number
			},
			step: {
				type: Number
			}
		},
		computed: {
			option() {
				return {
					type: this.loop,
					max: this.max,
					page: this.page,
					step: this.step,
					min: this.min
				}
			}
		},
		data() {
			return {
				spinner: null
			}
		},
		model: {
			prop: 'values',
			event: 'input'
		},
		mounted() {
			let option = Object.assign({}, this.option)
			let spinner = $(this.$refs.spinner).spinner(option);
			spinner.on("spinner:spin", (e, ui) => {
				this.$emit('input',ui.value)
			});
		},
		methods: {

		}
	}
</script>

<style>
</style>
