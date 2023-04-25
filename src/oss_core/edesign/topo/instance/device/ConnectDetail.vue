<template>
    <div class="connectDetail-content" id="mainConnectDetail" v-if="deviceId">
        <div class="divConnectDetail">
            <form class="form-horizontal divGrid grid-height-auto" id="gridDiv">
                <Grid :data="gridData" :option="gridOption" ref="gridRefConnDetail">
                    <grid-column :label="$t('A_RESOURCE')" prop="aResourceName"></grid-column>
                    <grid-column :label="$t('A_PORT_CORE')" prop="aPortName"></grid-column>
                    <grid-column :label="$t('Z_RESOURCE')" prop="zResourceName"></grid-column>
                    <grid-column :label="$t('Z_PORT_CORE')" prop="zPortName"></grid-column>
                    <grid-column :label="$t('TYPE')" prop="typeName"></grid-column>
                </Grid>
            </form>
        </div>
    </div>
</template>

<script>
import { queryDevicInfoById } from '@/oss_core/edesign/api/query/resId.js';
export default {
    name: 'devConnectDetail',
    components: {},
    props: {
        deviceId: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            _gridData: [],
            resNode: null,
            gridData: [],
            gridOption: {
                width: '100%',
                height: '100px',
                columnMenu: false,
                cached: true,
                pager: true,
                rowNum: 8,
                // rowList : [15,20,30]
            },
        };
    },
    mounted() {
        this.loadGrid(this.deviceId);
    },
    methods: {
        loadGrid(deviceId) {
            this.gridData = [];
            if (!deviceId) {
                return;
            }
            queryDevicInfoById(deviceId).then(data => {
                console.info(data);
                if (data.resultCode === '0') {
                    if (data.resultList) {
                        this.showGridListData(data.resultList);
                    }
                }
            });
        },

        showGridListData(dataList) {
            let gridListData = [];
            if (dataList) {
                let jumpDtos = dataList.imPortPortDTOS;
                let termDtos = dataList.imPortCblunitDTOS;
                let spliceDtos = dataList.imCblunitCblunitDTOS;

                jumpDtos.forEach(item => {
                    let connectInfo = {};
                    connectInfo.aResourceName = item.aDeviceFullName;
                    connectInfo.aPortName = item.aPortFullName;
                    connectInfo.zResourceName = item.zDeviceFullName;
                    connectInfo.zPortName = item.zPortFullName;
                    connectInfo.typeName = 'Jump';
                    gridListData.push(connectInfo);
                });
                termDtos.forEach(item => {
                    let connectInfo = {};
                    connectInfo.aResourceName = item.deviceFullName;
                    connectInfo.aPortName = item.portFullName;
                    connectInfo.zResourceName = item.cableFullName;
                    connectInfo.zPortName = item.unitName;
                    connectInfo.typeName = 'Termination';
                    gridListData.push(connectInfo);
                });
                spliceDtos.forEach(item => {
                    let connectInfo = {};
                    connectInfo.aResourceName = item.aCableFullName;
                    connectInfo.aPortName = item.aUnitFullName;
                    connectInfo.zResourceName = item.zCableFullName;
                    connectInfo.zPortName = item.zUnitFullName;
                    connectInfo.typeName = 'Splice';
                    gridListData.push(connectInfo);
                });
            }
            this.gridData = gridListData;
        },
    },
    watch: {
        deviceId(newVal, oldVal) {
            this.loadGrid(this.deviceId);
        },
    },
};
</script>
<style lang="scss" scoped>
@import './ConnectDetail.scss';
</style>
