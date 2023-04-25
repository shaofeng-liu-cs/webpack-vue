<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-03-04 16:30:44
 * @LastEditors: Please set LastEditors
 * @Description: 入口页
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\index.vue
-->
<template>
    <div id="app" class="box">
        <keep-alive>
            <Map v-if="detail.schemaId" ref="hldDesign" :queryData="detail" @openMenuInHld="openMenu" @btnToCoverCurrentPage="btnToCoverCurrentPage"></Map>
        </keep-alive>
    </div>
</template>
<script>
import { loadSprintList } from '../../../osp/task/api/taskAction';
import Map from './hldMap.vue';

export default {
    name: 'App',
    inject: ['initData'],
    components: {
        Map,
    },
    data() {
        return {
            detail: {},
        };
    },
    mounted() {},
    created() {
        let schemaId = this.initData.orderId ? this.initData.orderId.toString() : '';
        fish.ajax({
                url: 'edesign/schema/schemalist/v1',
                type: 'POST',

                contentType: "application/json",
                data: JSON.stringify({
                    //taskState:"NORMAL"
                }),
                success: (result) => {
                    if (result && result.resultList && result.resultList.length !== 0) {
                        let findRes = result.resultList.filter(res => res.schemaId === schemaId);
                        if (findRes && findRes.length === 1) {
                            findRes[0].sourceFlag = 'designer-map';
                            this.detail = findRes[0];
                        } else {
                            fish.warn("Invalid Schema ID");
                        }
                    }
                }
            
        })
    },
    methods: {
        // menuId 菜单ID,如果页签需要限制打开数量为1,menuId需要传相同值;
        // menuTitle 菜单标题
        // menuParams 菜单参数,包括choose(页面组件Code,必填)、projectInfo(当前sprint信息或者schema信息), isSingleMenu(是否限制同时只能打开一个相同页签);
        openMenu(menuId, menuTitle, menuParams) {
            if (menuParams.projectInfo) {
                this.detail = menuParams.projectInfo;
            }
            if (menuParams.portParams) {
                this.portParams = menuParams.portParams;
                
            }
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
                this.choose = menuParams.choose;
                this.initDevOpenParam(menuParams);
            } else {
                // 表示是业务菜单内部新开页签
                menuParams.openMenuMode = 'inner';

                // stringKey = true表示最终menuId使用用户自定义的ID而不会去修改
                menuParams.stringKey = true;

                if (this.$refs.hldDesign) {
                    this.$refs.hldDesign.refreshMap();
                }

                if (menuParams.isSingleMenu) {
                    // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
                    portal.closeMenu(menuId, 'oss_core/edesign/osp-design');
                }
                portal.openMenu(menuId, 'oss_core/edesign/osp-design', 'S', menuTitle, menuParams);
            }
        },

        initDevOpenParam(param) {
            if (param.lldParams) {
                this.lldParams = param.lldParams;
            }
        },


        btnToCoverCurrentPage(choose, param) {
            this.choose = choose;
            if (param) {
                this.initCoverParam(choose, param);
                // this.detail = finnalParam;
            }
        },
        initCoverParam(choose, param) {
            if (choose === 'SPRING_CODE') {
                param.schemaId = param.sprintId;
                param.flowState = param.sprintState;
                param.markFlag = 'sprint';
                this.springCodeParam = param;
            } else if (choose === 'FastLayingDesign') {
                this.cableDesignParam = param;
            }
        },
    },
};
</script>
<style lang="scss" scoped>
@import '@/oss_core/base/css/main.scss';
</style>
