<template>
    <div class="deviceAssignment">
        <div class="">
            <h3>{{$t('DEVICE_ASSIGNMENT_TITLE')}}({{topoParams.resName}})</h3>
            <div>
                <div>
                    <div>
                        <CoreAssignmentTopo ref="coreAssignment" :params="topoParams"></CoreAssignmentTopo>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CoreAssignmentTopo from '../../../topo/design/CoreAssignmentTopo.vue';

export default {
    name: 'DeviceCoreAssign',
    components: {
        CoreAssignmentTopo,
    },
    props: {
        portParams: {
            type: Object,
        },
    },
    data() {
        return {
            topoParams: null,
        };
    },
    mounted() {
        this.topoParams = this.portParams;

        console.info(this.portParams);
    },
    created() {},
    methods: {},
    watch: {
        portParams: {
            deep: true,
            immediate: true,
            handler(val, old) {
                this.topoParams = val;
            },
        },
    },
};
</script>
<style lang="scss" scoped>
@import '../scss/deviceCoreAssign.scss';
</style>