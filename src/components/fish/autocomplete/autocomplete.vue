<template>
	<input :value="value" ref="tags" class="form-control">
</template>

<script>
	export default{
		name:'Autocomplete',
		data() {
			return {
				
			}
		},
		model:{
			event:'input',
			prop:'value'
		},
		props:{
			value:{
				type:String
			},
			source:{
				type:Array
			},
			option:{
				type:Object
			}
		},
		computed: {
			callback() {
				return{
					change:(event,val) => {
						this.$emit('change',val)
					},
					close:e => {
						this.$emit('input',$(this.$refs.tags).autocomplete('value'))
						this.$emit('close',e)
					},
					open:event => {
						this.$emit('open',event)
					},
					response:(event,val) => {
						this.$emit('response',val)
					},
					search:event => {
						this.$emit('search',event)
					},
					select:(event,val) => {
						this.$emit('select',val)
					},
				}
			}
		},
		mounted() {
			let option = Object.assign({},this.callback,this.option,{source:this.source})
			 $(this.$refs.tags).autocomplete(option)
		},
		methods:{
			
		}
	}
</script>

<style>
</style>
