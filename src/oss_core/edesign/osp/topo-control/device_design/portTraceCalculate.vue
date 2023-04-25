<!--
 * @Author: your name
 * @Date: 2020-12-11 14:48:59
 * @LastEditTime: 2021-03-02 18:23:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: oss_core\edesign\osp\topo-control\device_design\portTraceCalculate.vue
-->
<template>
    <div class="port-trace-content">
        <PortTraceTopo ref="portTraceTopo" :portId="portId" :resData="portParams" @openPortTraceSetting="openPortTraceSetting"></PortTraceTopo>
        <PortTrace ref="portTrace" v-model="portId" :resData="portParams" @closePortTraceSetting="closePortTraceSetting"></PortTrace>
    </div>
</template>
<script>
import PortTraceTopo from '../../../osp/topo-control/device_design/portTraceTopo.vue';
import PortTrace from '../../../osp/topo-control/device_design/portTrace.vue';

export default {
    //import引入的组件
    components: {
        // SchemaRoute,
        PortTraceTopo,
        PortTrace,
    },
    props: {
        portParams: {
            type: Object,
            default: () => {
                return {
                    portId: '',
                    schemaId:'',
                };
            },
        },
    },
    data() {
        return {
            showBudget: false,
            linkDatas: [],
            portId: '',
            schemaId:'',
        };
    },
    created() {},
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
        this.portId = this.portParams.portId;
        this.schemaId = this.portParams.schemaId;
        // console.log('port Id:' + this.portId);
    },
    //方法集合
    methods: {
        openPortTraceSetting(portId, linkData) {
            this.$refs.portTrace.CompPopuTopo.width = '1100';
            this.$refs.portTrace.CompPopuTopo.height = '660';
            this.$refs.portTrace.CompPopuTopo.left = 'calc(50% - 550px)';
            this.$refs.portTrace.CompPopuTopo.top = 'calc(50% - 330px)';
            this.$refs.portTrace.CompPopuTopo.show = true;
            this.$refs.portTrace.loadGrid(portId, linkData);
        },

        closePortTraceSetting(linkData, costInfo) {
            this.linkDatas = linkData;
            this.costInfo = costInfo;
            this.showBudget = true;
            let param = { linkData: linkData, costInfo: costInfo, showBudget: true };
            this.$refs.portTraceTopo.initPage(param);
        },
    },
};
</script>
<style lang="scss" scoped>
.port-trace-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 10px;
    > div {
        width: 100%;
        // height: auto;
        display: flex;
        flex-flow: column;
        border: 1px solid #e0e0e0;
        background: #ffffff;
        > div {
            width: 100%;
            background: #fff;
            overflow: auto;
        }
    }
}
</style>
