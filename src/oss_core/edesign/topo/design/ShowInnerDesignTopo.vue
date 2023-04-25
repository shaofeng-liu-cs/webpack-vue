<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div class="showInnerDesignTopo">
                <InnerDesignForm ref="innerDesign" :lldParams="lldParams" :queryData="queryData"></InnerDesignForm>
            </div>
        </template>
    </Popup>
</template>
<script>
import InnerDesignForm from '../../osp/design/lldDesign/lldDesign.vue';
export default {
    components: {
        InnerDesignForm,
    },
    data() {
        return {
            show: false,
            lldParams: null,
            queryData: null,
            title: '',
            CompPopuTopo: {
                title: 'Inner Design', // 标题
                ok: '', // 确认按钮
                close: '', // 取消按钮
                width: '1250', // 宽
                height: '700', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                // left: 'calc(50% - 600px)',
                // top: 'calc(50% - 360px)',
                el: this.deviceDesignEl,
            },
            row: {},
            addObject: null,
            template: '',
            templateResType: '',
            selectedTemplateId: '',
            templateSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            action: '',
            templateList: [],
            selectedNodeIsOperate: false,
            deviceInstanceList: [],
        };
    },
    inject: ['getDeviceDesignEl'], // 加载的组件位置
    computed: {
        deviceDesignEl() {
            return this.getDeviceDesignEl();
        },
    },
    mounted() {
        console.info("innerDesginTopo's lldParams:");
        console.info(this.lldParams);
    },
    created() {
        console.info("innerDesginTopo's lldParams:");
        console.info(this.lldParams);
    },
    methods: {
        setParams(params) {
            // [3148613]纤蕊分派页面支持从选中设备跳转到Inner Design
            this.lldParams = params.lldParams;
            this.queryData = params.queryData;
            console.info("setParams::lldParams:");
            console.info(this.lldParams);
        },
        popupOk() {

        },
        popupClose() {
            console.info("ShowInnerDesignTopo::Close");
            this.$emit('refreshClose');
        },
    },
    watch: {},
};
</script>
<style lang="scss" scoped>
.connect-class {
    margin-top: 10px;
}

.content-label {
    text-align: right;
}

/deep/ .showInnerDesignTopo div .panel-body {
    padding-top: 5px;
}

.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}

.showInnerDesignTopo {
    height: 100%;
    display: flex;
    flex-flow: column;
    border: 1px solid #ebebeb;
    padding: 10px;
    .template-div {
        display: flex;
        flex-flow: column;
        width: 50%;
        padding-bottom: 10px;
    }
    .basicAttr {
        overflow: auto;
    }
}
</style>
