<template>

		<input :value="currentValue" type="text" name="currencybox" ref="currencybox" class="form-control" @input="inputload">

</template>

<script>
	export default {
		name: 'Currencybox',

		componentName: 'Currencybox',

		provide() {
			return {};
		},

		props: {
			value: {
				type: [String, Number],
				default: ''
			},
			options:{
				type:Object
			}
		},
		computed: {},
		data() {
			return {
				currentValue: '',
				isShow: false
			};
		},
		created() {},
		mounted() {
			$(this.$refs.currencybox).currencybox(this.options);
		},
		watch: {
			value: {
				deep: true,
				immediate: true,
				handler(val, old) {
					this.setvalue(val)
				}
			}
		},
		methods: {
			setvalue(val) {
				if (this.currentValue === val) return;
				this.currentValue = val
			},
			inputload(event) {
				let value = event.target.value;
				this.$emit('input', value)
			}
		},
	};
</script>
