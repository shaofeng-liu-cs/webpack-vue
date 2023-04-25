<template>
    <div class="propertyMain">
        <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
            <template v-slot:popupBody>
                <div class="body-class">
                    <div class="grid-class">
                        <Grid :data="gridData" :option="gridOption">
                            <grid-column :label="$t('LAYING_CABLE_NAME')" prop="name" ></grid-column>
                            <grid-column :label="$t('LAYING_CABLE_LENGTH')" prop="lineLength" ></grid-column>
                            <grid-column :label="$t('LAYING_GEO_FLAG')" prop="geoFlag" ></grid-column>
                            <grid-column label="" >
                                <template slot-scope="{ row }">
                                    
                                    <div class="btn btn-link icon_osp edit" @click="editRow(row)">{{$t('EDIT')}}</div>
                                </template>
                            </grid-column>
                        </Grid>
                    </div> 
                </div>
            </template>
        </Popup>
    </div>
</template>
<script>
    
import ResHandler from '@/oss_core/edesign/osp/domain/ResHandler';
	export default {
        name: 'CableList',
        inject: ['getMapBox', 'getHldEl'],
        mixins: [ ResHandler ],
        computed: {
            mapBox() {
                return this.getMapBox();
            },
            hldEl() {
                return this.getHldEl();
            },
        },
		data() {
			return {
				popupObj: {
                    title: this.$t('LAYING_CABLE_LIST'), // 弹框标题
                    ok: this.$t('LAYING_NEW_CABLE'), // 确认按钮内容
                    close: this.$t('CLOSE'), // 取消按钮内容
                    modal: false, // 是否蒙层
                    width: '530px', // 宽
                    height: "320px", // 高
                    left: '35%',
                    top:'35%',
                    show: false,
                    zIndex: 10,
                    drag:true,
                    //body:false,
                    el:this.getHldEl(),
                },
                gridData:[],
                gridOption: {
                    height: '180px',
                   
                    //width:'1000px',
                    
                },
			}
        },
    
		
        mounted() {
          
            
        },
		methods: {

            popupClose(val) { 
            },

            editRow(row) {
                //oss_core/im/rivt/cable/views/ModCable.js
                
                this.$emit("editCable", row);
                this.popupObj.show = false;
            },
           
            popupOk() {
                this.$emit("newCable");
                this.popupObj.show = false;
            }, 
            

        },

        watch: {
            
        },
       
	}
</script>

<style lang="scss" scoped>

</style>
