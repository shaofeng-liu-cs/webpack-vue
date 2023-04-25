<template>
    <div class="construction-management-content">
        <div class="construction-tap">
            <el-radio-group v-model="laberName" size="mini" @change="laberChange" class="label-grow">
                <el-radio-button label="PM" :title="$t('CONSTR_MANAGE_PM_TASK')"><i class="icon_osp icon_ospPM"></i></el-radio-button>
                <el-radio-button label="Build" :title="$t('CONSTR_MANAGE_BUILD_TASK')"><i class="icon_osp icon_ospBuild"></i></el-radio-button>
                <el-radio-button label="Splice" :title="$t('CONSTR_MANAGE_SPLICE_TASK')"><i class="icon_osp icon_ospSplice"></i></el-radio-button>
            </el-radio-group>
        </div>
        <div class="construction-management-body">
            <component :is="soltName" :ref="soltName"></component>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConstructionManagement',
    data() {
        return {
            laberName: 'PM',
            soltName: 'PmTask', //动态组件
        };
    },
    created() {},
    mounted() {},
    methods: {
        laberChange(laberName) {
            switch (laberName) {
                case 'PM':
                    this.soltName = 'PmTask';
                    break;
                case 'Build':
                    this.soltName = 'ConstructionTask';
                    break;
                case 'Splice':
                    this.soltName = 'SpliceTask';
                    break;
                default:
                    break;
            }
        },
    },
    watch: {},
};
</script>

<style lang="scss" scoped>
@import './ConstructionManagement.scss';
</style>