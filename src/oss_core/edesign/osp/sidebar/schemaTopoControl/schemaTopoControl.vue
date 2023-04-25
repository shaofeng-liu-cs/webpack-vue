<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-17 15:35:54
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\schemaTopoControl\schemaTopoControl.vue
--> 
<template>
    <div class="initlate-survey-container">
        <div class="menu-right-panel select-map">
            <h3>{{$t('ONLINE_BASE_MAP')}}</h3>
            <div>
                <div class="menu-right-radio">
                    <input type="radio" name="optionsRadios" value="Schema Topo" id="optionsRadios1" v-model="radioValue">
                    <label>{{$t('TIT_SCHEMATOPO')}}</label>
                </div>
                <div>
                    <button class="btn btn-primary" @click="openSchemaTopoPopup">{{$t('OPEN_TOPO')}}</button>
                </div>
            </div>
        </div>
        
    </div>
</template>

<script>

export default {
    name: 'SchemaTopo',
    data() {
        return {
            radioValue: 'Select a grid',            
        };
    },
    created() {},
    mounted() {},
    methods: {
        openSchemaTopoPopup(){
            //console.info("test schema Topo control before");
            this.$emit('openSchemaTopo');
            //console.info("test schema Topo control after");
        }
    },
    watch: {
        isVisibleAll(newVal, oldVal) {
            /*
            this.gridData.forEach(item => {
                item.is_visible = newVal
            });
            */
        },
        radioValue(newVal, oldVal) {
            console.log(newVal)
        },
    }
};
</script>

<style lang="scss" scoped>
@import './schemaTopoControl';
</style>