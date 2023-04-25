<!--
 * @Author: your name
 * @Date: 2021-04-08 15:43:48
 * @LastEditTime: 2021-04-27 11:33:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\ui-itf\dashboard\App.vue
-->
<template>
    <div id="app">
        <div v-if="design" class="app-content">
            <div class="div-left">
                <DesignResource></DesignResource>
            </div>
            <div class="div-center" id="map">
                <Map></Map>
            </div>
            <div class="div-right">
                <DesignTask></DesignTask>
            </div>
        </div>
    </div>
</template>

<script>
import Map from './components/map/Map.vue';
import DesignTask from './components/designTask/DesignTask.vue';
import DesignResource from './components/designResource/DesignResource.vue';

export default {
    name: 'App',
    components: {
        Map,
        DesignTask,
        DesignResource,
    },
    data() {
        return {
            btnActiveName: 'design',
            activeClass: 'background-color:#4477ee;color:white',
            design: true,
            history: false,
        };
    },
    mounted() {
        //  $(`#app`).parent()[0].style.height='auto';
    },
    methods: {
        designingBtnClick() {
            this.design = true;
            this.history = false;
            this.btnActiveName = 'design';
        },
        historyBtnClick() {
            this.design = false;
            this.history = true;
            this.btnActiveName = 'history';
        },
    },
};
</script>

<style lang="scss" scoped>
@import './App.scss';
</style>
