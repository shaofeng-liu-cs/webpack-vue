<template>
    <div class="auto-lld sidebar-body">
       <div class="route-list">
           <div class="title sidebar-tab-title">{{$t('AUTO_LLD_ROUTE_LIST')}}</div>
           <div class="btn-list">
               <button type="button" :title="$t('AUTO_LLD_CONNECTION')" class="btn btn-default setting icon_osp icon_ospshezhi" @click="openSetting"></button>
               <button type="button" :title="$t('AUTO_LLD_ANALYSE')" class="btn btn-default analyse icon_osp icon_ospneibusheji" @click="analyseFunction"></button>
           </div>
       </div>
       <div class="route" :class="routeList.length === 0 ? 'no-data' : 'has-data'">
           <div class="no-route" v-if="routeList.length === 0">{{$t('AUTO_LLD_ANALYSE_ROUTE')}}</div>
           <template v-else>
               <div v-for="(singleRoute, index) in routeList" :key="index" class="single-route">
                   <div class="route-title" @click="changeHideFlag(singleRoute)">
                       <div class="route-name">Route - {{index + 1}}</div>
                       <div class="route-flag" :class="singleRoute.successFlag ? 'success' : 'fail'" :title="singleRoute.hoverDesc">{{ singleRoute.successDesc }}</div>
                       <div class="route-hide btn btn-link icon_osp" :class="singleRoute.gridShowFlag ? 'icon_ospdown' : 'icon_ospup'"></div>
                   </div>
                   <transition name="show">
                        <div class="grid-class" v-show="singleRoute.gridShowFlag">
                            <Grid :data='singleRoute.gridData' :option='gridOpt' :ref="'gridRef'+ index">
                                <grid-column label='' prop="resId" :hidden='true'></grid-column>
                                <grid-column :label="$t('SETTING_SEQ')" prop="seq" width='85'></grid-column>
                                <grid-column :label="$t('AUTO_LLD_RESOURCE_NAME')" prop="resName"></grid-column>
                                <grid-column :label="$t('AUTO_LLD_PORT_NAME')" prop="endNames"></grid-column>
                            </Grid>
                        </div>
                   </transition>
                   
               </div>
           </template>
       </div>
       <div class="ok-btn">
           <button type="button" :title="$t('APPLY')" class="btn btn-primary row-btn" :disabled="routeList.length === 0" @click="applyRoute">{{$t('APPLY')}}</button>
       </div>

        <setting ref="setting"></setting>
    </div>
</template>

<script>
import setting from './setting/autoLLDsetting.vue';
import { analyseAutoLLD, applyAutoLLD } from '../../map-control/map-control-api';
export default {
    name: 'AutoLLD',
    inject: ['getProjectInfo', 'getMapBox', 'getSurfaceLayerList'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
        projectInfo() {
            return this.getProjectInfo();
        },
        surfaceLayerList() {
            return this.getSurfaceLayerList();
        },
    },
    components: {
        setting,
    },
    data() {
        return {
            _initRouteObj: {},
            routeList: [],
            gridOpt: {
                width: '330',
                altRows: true,
            },
        };
    },
    created() {
        
    },
    mounted() {

    },
    watch: {
        
    },
    deactivated() {

    },
    activated() {

    },
    methods: {
        openSetting() {
            this.$refs.setting.popupObj.show = true;
        },

        analyseFunction() {
            analyseAutoLLD(this.projectInfo.schemaId).then(result => {
                this._initRouteObj = Object.assign([], result);
                if (result && result.routeList && result.routeList.length > 0) {
                    let _routeList = [];
                    let apiRouteList = result.routeList;
                    let orderSeq = 0;
                    apiRouteList.forEach(singleRoute => {
                        orderSeq++;
                        let obj = {
                            orderSeq: singleRoute.succesFlag === 'Y' ? orderSeq : orderSeq + 9999,
                            gridData: singleRoute.routeNodeList || [],
                            gridShowFlag: false,
                            successFlag: singleRoute.succesFlag === 'Y',
                            successDesc: singleRoute.succesFlag === 'Y' ? 'success' : 'fail', //succesFlag
                            hoverDesc: singleRoute.errMsg ? singleRoute.errMsg : 'success', // errMsg
                        };
                        _routeList.push(obj);
                    });
                    _routeList = _routeList.sort((x, y) => x.orderSeq - y.orderSeq);
                    if (_routeList.length > 0) {
                        _routeList[0].gridShowFlag = true;
                    }
                    this.routeList = Object.assign([], _routeList);
                } else {
                    this.routeList = [];
                    fish.toast('warn', this.$t('AUTO_LLD_NO_ROUTE'));
                }
            })
        },

        changeHideFlag(singleRoute) {
            singleRoute.gridShowFlag = !singleRoute.gridShowFlag;
            // this.routeList = Object.assign([], this.routeList);
        },
        applyRoute() {
            applyAutoLLD(this._initRouteObj).then(result => {
                fish.toast('success', this.$t('AUTO_LLD_APPLY_SUCCESS'));
            })
        },
    },

    destroyed() {

    },
};
</script>

<style lang="scss" scoped>
@import './autoLLD';
</style>
