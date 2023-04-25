<template>
    <Popup :popupObj="popupSchemaTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <div class="selection-body-cont">
                <div class="selection-body">
                    <!--<div class="selection-left">-->
                    <div>
                        <component :is="topoName" v-model="schemaId" :map-res-data="mapResDataList"></component>
                    </div>
                    <!--</div>-->
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import SchemaTopo from './SchemaTopo.vue';

export default {
    //import引入的组件
    components: {
        SchemaTopo,
    },
    inject: ['getProjectInfo', 'getMapBox'], // gis实列
    computed: {
        mapBox() {
            return this.getMapBox();
        },
    },
    model: {
        prop: 'schemaId',
        event: 'input',
    },
    data() {
        return {
            topoName: 'SchemaTopo',
            schemaId: '',
            mapResDataList: [],
            popupSchemaTopo: {
                title: this.$t('TIT_SCHEMATOPO'), // 标题
                //ok: 'OK', // 确认按钮
                close: this.$t('CLOSE'), // 取消按钮
                width: '1000', // 宽
                height: '700', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 1000, //层级
                left: 'calc(50% - 500px)',
                top: 'calc(50% - 370px)',
            },
        };
    },
    mounted() {},
    created() {},
    //方法集合
    methods: {
        setSchemaId(id) {
            this.schemaId = id;
        },
        loadMapResInfo() {
            let serviceNo = 'edesign.graphic-layer-service';
            if (this.mapBox) {
                let filter = new this.$map.Filter.equalTo({
                    propertyName: 'schemaId',
                    expression: this.getProjectInfo().schemaId,
                    matchCase: true,
                });
                this.mapBox.queryFeatureByService(serviceNo, filter).then(dataInit => {
                    //let retData = dataInit;
                    this.mapResDataList = dataInit || [];
                    console.info('Map Res Data after:');
                    console.info(this.mapResDataList);
                });
            }
        },
        popupClose() {},
        popupOk() {},
    },
    // watch: {
    //     schemaId:{
    //         deep:true,
    //         immediate:true,
    //         handler(val,old) {
    //             this.loadMapResInfo(val);
    //         }
    //     }
    // },
};
</script>
<style lang="scss"   scoped>
@import './PopuSchemaTopo.scss';
</style>
