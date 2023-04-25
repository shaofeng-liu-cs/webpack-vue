<template>
	<div ref="calendar"></div>
</template>

<script>
	export default{
		name:'Calendar',
		data() {
			return {
				
			}
		},
		computed: {
			callback() {
				return {
					
				}
			}
		},
		mounted(){
			let option = object.assign({});
			$(this.$refs.calendar).fullCalendar(option)
		}
		
	}
</script>

<style>
</style>
