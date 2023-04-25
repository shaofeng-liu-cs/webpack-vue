<template>
	<input type="file" ref="fileUpload" class="js-fileupload"> 
</template>

<script>
	export default{
		name:'Upload',
		props:{
			acceptFileTypes:{	//上传文件类型
				type:RegExp
			},
			formData:{	
				type:Array
			},
			maxFileSize:{
				type:Number
			},
			minFileSize:{
				type:Number
			},
			replaceFileInput:{
				type:Boolean
			},
			singleFileUploads:{
				type:Boolean
			}
		},
		provide:{
			
		},
		computed: {
			callback:{
				add:(e,data)=>{	//选择文件触发
					this.$emit('add',e,data)
				},
				always:(e,data)=>{	//上传完成终端触发
					this.$emit('always',e,data)
				},
				done:(e,data)=>{	//上传成功触发
					this.$emit('done',e,data)
				},
				process:(e,data)=>{	//单文件加工处理方法
					this.$emit('process',e,data)
				},
				processalways:(e,data)=>{	//单文件加工处理结束方法
					this.$emit('processalways',e,data)
				},
				processdone:(e,data)=>{	//单文件加工处理成功方法
					this.$emit('processdone',e,data)
				},
				processfail:(e,data)=>{	//单文件加工处理成功方法
					this.$emit('processfail ',e,data)
				},
				processstart:(e,data)=>{	//单文件加工处理成功方法
					this.$emit('processstart ',e,data)
				},
				processstop:(e,data)=>{	//单文件加工处理成功方法
					this.$emit('processstart ',e,data)
				},
				progress:(e,data)=>{	//单文件加工处理成功方法
					this.$emit('process',e,data)
				},
				progressall:(e,data)=>{	//全部文件上传进度处理方法
					this.$emit('progressall',e,data)
				},
				submit:(e,data)=>{	//文件开始上传执行方法
					this.$emit('progressall',e,data)
				},
			}
		},
		mounted() {
			let option = Object.assign({})
			$(this.$refs.fileUpload).fileupload(option)
		},
		methods:{
			
		}
	}
</script>

<style>
</style>
