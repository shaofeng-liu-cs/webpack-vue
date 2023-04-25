<!--
 * @Author: your name
 * @Date: 2021-01-27 16:50:06
 * @LastEditTime: 2021-05-21 15:31:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\topo\instance\ResFunctionNoDialog.vue
-->
<template>
    <Popup :popupObj="popup" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <ResForm :action="action" :resType="dataInfo.CloudGraphic.resType" :attributes="dataInfo.CloudGraphic.attributes" :row="2" ref="form" :schemaId="projectInfo.schemaId"></ResForm>
        </template>
    </Popup>
</template>
<script>
import ResForm from '../../clickRight/selection/resForm/ResForm.vue';
import { editResource } from '@/oss_core/edesign/api/edit/resId.js';
import { GeometryType } from 'map';

export default {
    name: 'resFunctionNoDialog',
    //import引入的组件
    components: {
        ResForm,
    },

    props: {
        functionData: {},

        dataInfo: {},

        projectInfo: {},
    },

    model: {},

    data() {
        return {
            popup: {
                title: this.$t('SELECTION'), // 标题
                ok: this.$t('OK'), // 确认按钮
                close: this.$t('CANCEL'), // 取消按钮
                width: '1000', // 宽
                height: '700', // 高
                maxHeight: '80%', //
                maxWidth: '80%', //
                modal: true, //是否遮罩
                body: false, // 是否插入body
                el: '', // 指定插入节点
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 4, //层级
            },
            action: 'edit',
        };
    },
    mounted() {},
    created() {},
    //方法集合
    methods: {
        popupShow(el) {
            this.popup.show = true;
            this.popup.el = el;
            if (this.functionData.url === 'ResEdit') {
                this.popup.title = this.$t('EDIT');
                this.popup.ok = this.$t('OK');
                this.popup.close = this.$t('CANCEL');
                this.action = 'edit';
            } else if (this.functionData.url === 'ResView') {
                this.popup.title = this.$t('VIEW');
                this.popup.ok = '';
                this.popup.close = this.$t('CLOSE');
                this.action = 'view';
            }
        },
        popupClose() {},
        popupOk() {
            let params = {
                resInfo: this.$refs.form.formValue,
                gisInfo: {},
                resFlag: 'BOTH',
            };
            params.gisInfo.wkid = this.dataInfo.CloudGraphic.geometry.spatialReference.wkid + '';
            params.gisInfo.resType = this.dataInfo.resType;
            params.gisInfo.schemaId = this.dataInfo.CloudGraphic.attributes.schemaId;
            params.gisInfo.graphicsAttrs = this.$refs.form.getAttributes();
            if (this.dataInfo.CloudGraphic.geometry.geometryType === GeometryType.POLYLINE) {
                params.gisInfo.paths = this.dataInfo.CloudGraphic.geometry.getPaths();
            }
            params.resType = this.dataInfo.resType;
            params.gisKey = this.dataInfo.CloudGraphic.attributes.gisKey;
            params.resId = this.dataInfo.CloudGraphic.attributes.resId;

            params.resInfo.layerNo = this.dataInfo.CloudGraphic.attributes.layerNo;
            params.resInfo.schemaId = this.dataInfo.CloudGraphic.attributes.schemaId;
            params.gisInfo.wkid = this.dataInfo.CloudGraphic.geometry.spatialReference.wkid + '';
            // 点资源新增的话由于固定为经纬度，wkid即为4326
            if (params.resInfo.longitude && params.resInfo.latitude) {
                params.gisInfo.wkid = '4326';
                params.resInfo.longitude = Number(Number(params.resInfo.longitude).toFixed(6));
                params.resInfo.latitude = Number(Number(params.resInfo.latitude).toFixed(6));
            }
            params.mapNo = this.projectInfo.mapNo;
            params.schemaId = this.dataInfo.CloudGraphic.attributes.schemaId;
            editResource(params).then(data => {
                console.log(data);
                fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
                this.$root.$emit('afterSelection', [data]);
                this.$root.$emit('refreshMap');
                this.popup.show = false;
            });
        },
    },
};
</script>
<style lang="scss"  scoped>
</style>