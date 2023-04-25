<template>
    <component ref="dynamicComp" :is="soltName" :dataInfo="dataInfo" :projectInfo="projectInfo" :functionData="functionData"></component>
</template>
<script>
import ResView from '../editView/EditView.vue';
import ResEdit from '../editView/EditView.vue';
import CopyGeoSingle from '../copyGeoSingle/CopyGeoSingle.vue';

export default {
    name: 'resFunctionNoDialog',

    //import引入的组件
    components: {
        ResView,
        ResEdit,
        CopyGeoSingle,
    },
    data() {
        return {
            soltName: '',
            dataInfo: {},
            projectInfo: {},
            functionData: {},
        };
    },
    mounted() {},
    created() {},
    //方法集合
    methods: {
        setParentParam(functionData, dataInfo, projectInfo, el) {
            this.functionData = functionData;
            this.dataInfo = dataInfo;
            this.projectInfo = projectInfo;
            this.soltName = functionData.url;
            this.$nextTick(() => {
                this.$refs.dynamicComp.popupShow(el);
            });
        },
    },
};
</script>
<style lang="scss" scoped></style>