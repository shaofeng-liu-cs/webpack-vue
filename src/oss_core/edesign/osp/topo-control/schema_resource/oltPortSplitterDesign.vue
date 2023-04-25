<template>
    <div class="schema-oltPort-content">
        <div class="">
            <h3> {{title}}</h3>
            <div>
                <div>
                    <OltTree :paramInfo="params" @treeCheck="treeCheck"  ref="oltTree"></OltTree>
                </div>
                <div>
                    <OltPortSplitterTopo :params="portParams" ref="portSplitterTopo"></OltPortSplitterTopo>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import OltTree from './oltTree.vue';
import OltPortSplitterTopo from '../../../topo/design/OltPortSplitterTopo.vue';
export default {
    components: {
        OltTree,
        OltPortSplitterTopo,
    },
    props: {
        params: {
            type: Object,
            default: () => {
                return {
                    schemaId: '',
                };
            },
        },
    },
    data() {
        return {
            title:this.$t('OLT_PORT_CONNTECTION'),
            portParams:null,
        }
    },
    created() {},
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
        
    },
    methods:{
        treeCheck(checkNodes) {
            console.info("check node");
            let portParams = {};
            let portList = checkNodes.filter(item => item.nodeType==='PORT');
            portParams.schemaId = this.params.schemaId;
            portParams.portList = portList;
            this.portParams = portParams;
            this.$refs.portSplitterTopo.loadGraphTopo(portParams);
        }
    },
    
}
</script>
<style lang="scss" scoped>
@import '../scss/oltPortSplitterDesign.scss';
</style>