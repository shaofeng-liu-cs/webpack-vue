<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-09-09 16:12:00
 * @LastEditors: Please set LastEditors
 * @Description: gis搜索面板
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\searchbar\res-type-panel\ResTypePanel.vue
-->
<template>
    <div class="res-type-panel-default" v-if="controlData.popupName === 'resTypePanel'">
        <div>
            <div class="res-type-group clearfix" v-for="(items, indexs) in newResourceData" :key="indexs">
                <div class="res-type-group-header col-lg-3 col-sm-2 col-md-2">{{ items.name }}</div>
                <div class="res-type-group-body col-lg-9 col-sm-10 col-md-10">
                    <div :class="{active: activeName === item.layerNo}" v-for="(item, index) in items.childData" :key="index" @click="actBtn(item)">
                        <div class="res-type-panel-item " :title="item.resTypeName">{{ resTypePanelItemShowFiled(item) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResTypePanel',
    inject: ['getResourceList', 'getControlData'],
    computed: {
        resourceList() {
            return this.getResourceList();
        },
        controlData() {
            return this.getControlData();
        },
        surfaceLayerList() {
            return this.getSurfaceLayerList();
        },
        resTypePanelItemShowFiled() {
            return function (item) {
                if (item.surfaceCat) {
                    return item.layerName;
                } else {
                    return item.resTypeName;
                }
            };
        },
    },
    data() {
        return {
            newResourceData: [],
            activeName: '',
        };
    },
    methods: {
        getResource(resource) {
            if (resource.length > 0) {
                this.newResourceData.push({
                    name: resource[0].resGroupI18n,
                    childData: resource.filter(item => item.resGroup === resource[0].resGroup),
                });
            }
            let nowResource = resource.filter(item => item.resGroup !== resource[0].resGroup);
            if (nowResource.length > 0) {
                this.getResource(nowResource);
            }
            console.log(this.newResourceData);
        },
        actBtn(item) {
            this.$emit('sendOutType', item);
            this.activeName = item.layerNo;
        },
    },
    watch: {
        resourceList: function (val) {
            console.log(val);
            this.newResourceData = [];
            if (val && val.length > 0) {
                this.getResource(val);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import './resTypePanel.scss';
</style>
