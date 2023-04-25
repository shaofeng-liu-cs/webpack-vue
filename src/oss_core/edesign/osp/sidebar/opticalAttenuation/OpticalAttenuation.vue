<template>
    <div class="container-block sidebar-body">
        <form class="form-group conten-form">
            <div class="content-title sidebar-tab-title">{{$t('MAP_LINK_MAX')}}</div>
            <div>
                <label class="content-label control-label">{{$t('MAP_CAL_PARAM')}}</label>
            </div>
            <div>
                <label class="content-label control-label">{{$t('MAP_USUA_DESIGN')}}</label>
            </div>
            <div class="btn-class">
                <button type="button" class="btn btn-primary row-btn" @click="linkCalculation">{{$t('MAP_CALCULATE')}}</button>
            </div>
        </form>

        <form class="form-group conten-form">
            <div class="content-title sidebar-tab-title">{{$t('MAP_HLD_CAL')}}</div>
            <div>
                <label class="content-label control-label">{{$t('MAP_AFTER_LIMIT')}}</label>
            </div>
            <div class="btn-class">
                <button type="button" class="btn btn-primary row-btn" disabled>{{$t('MAP_COMING_SOON')}}</button>
            </div>
        </form>

        <form class="form-group conten-form">
            <div class="content-title sidebar-tab-title">{{$t('MAP_LLD_BUDGET')}}</div>
            <div>
                <label class="content-label control-label">{{$t('MAP_AFTER_TEST')}}</label>
            </div>
            <div class="btn-class">
                <button type="button" class="btn btn-primary row-btn" disabled>{{$t('MAP_COMING_SOON')}}</button>
            </div>
        </form>
    </div>
</template>
<script>
export default {
    name: 'OpticalAttenuation',
    inject: ['getMapBox'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
    },
    data() {
        return {};
    },
    created() {},
    mounted() {},
    activated() {
        // 预加载预估数据
        this.$emit('loadCalculatData');
    },

    deactivated() {},

    methods: {
        linkCalculation() {
            this.$emit('linkCalculation');
        },
    },
};
</script>


<style lang="scss" scoped>

.content-title {
    color: #2d8cf0;
    border-bottom: 1px solid #d7d7d7;
    margin-left: 5px;
    margin-right: 5px;
    font-size: 14px;
}

.content-label {
    line-height: 15px;
    margin: 10px 0;
}
</style>