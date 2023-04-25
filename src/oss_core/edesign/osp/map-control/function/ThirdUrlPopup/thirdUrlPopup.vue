<template>
    <Popup :popupObj="popup" class="summary-content" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div class="js-popup" ref="js-popup" :class="initClass"></div>
        </template>
    </Popup>
</template>

<script>
export default {
    //import引入的组件
    computed: {
        initClass() {
            if (this.functionData.funcCode === 'SERVICE_LIST_CABLE') {
                return 'fullHeightForServiceList';
            } else if (this.functionData.funcCode === 'FIBER_PAIR_LIST_TEMP') {
                return 'fullHeightForPair';
            }
            return '';
        },
    },
    props: {
        appendEl: {},
    },
    data() {
        return {
            popup: {
                title: '', // 标题
                ok: this.$t('OK'), // 确认按钮
                close: this.$t('CANCEL'), // 取消按钮
                width: '1200', // 宽
                height: '700', // 高
                modal: false, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 10, //层级
                left: 'calc(50% - 620px)',
                top: 'calc(50% - 300px)',
                resize: 'both',
            },
            url: '',
            functionData: {},
            dataInfo: {},
        };
    },
    created() {
        if (this.appendEl) {
            this.popup.el = this.appendEl;
        }
    },

    mounted() {},
    //方法集合
    methods: {
        popupOk() {
            this.popup.show = false;
        },
    },
    watch: {
        'popup.show'(newVal, oldVal) {
            if (newVal) {
                this.url = this.functionData.url;
                this.popup.title = this.functionData.name;
                this.popup.width = this.functionData.dialogWidth ? this.functionData.dialogWidth : 1200;
                this.popup.height = this.functionData.dialogHeight ? this.functionData.dialogHeight : 700;

                let obj = {};
                if (this.functionData.v9Flag === 'webgis') {
                    obj = {
                        RES_SPEC_ID: this.dataInfo.resType,
                        RES_ID: this.dataInfo.resId,
                    };
                } else if (this.functionData.funcCode === 'SUMMARY_IN_SERVICE') {
                    // hld summary
                    obj = {
                        RES_SPEC_ID: this.dataInfo.resSpecId,
                        FORM_DATA: {
                            DEVICE_ID: this.dataInfo.deviceId,
                        },
                    };
                } else if (this.functionData.funcCode === 'SERVICE_LIST_CABLE') {
                    this.popup.ok = '';
                    this.popup.close = 'Close';
                    obj = {
                        param: {
                            CABLE_ID: this.dataInfo.resId,
                        },
                    };
                } else if (this.functionData.funcCode === 'FIBER_PAIR_LIST_TEMP') {
                    this.popup.ok = '';
                    this.popup.close = 'Close';
                    obj = {
                        param: {
                            CABLE_ID: this.dataInfo.resId,
                        },
                        resEdt: 'Y',
                    };
                } else if (this.functionData.funcCode === 'SERVICE_LIST_DEV') {
                    this.popup.ok = '';
                    this.popup.close = 'Close';
                    obj = {
                        OBJ_TYPE: this.dataInfo.resSpecId,
                        FORM_DATA: {
                            DEVICE_ID: this.dataInfo.resId,
                        },
                    };
                }

                fish.require([this.url], aDialog => {
                    let view = new aDialog(obj);

                    console.log(view.$el);
                    view.render();
                    this.$refs['js-popup'].append(view.el);
                    view.resize();

                    if (this.functionData.funcCode === 'CABLE_ANALYSIS') {
                        $(view.$el).find('.modal-header')[0].style.height = '0';
                        $(view.$el).find('.modal-header')[0].style.padding = '0';
                    }
                });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
/** .summary-content /deep/.modal-body {
    height: calc(100% - 91px);
}*/
.js-popup {
    height: 100%;
}

.fullHeightForServiceList /deep/ .comprivroot,
.fullHeightForServiceList /deep/ .comprivroot .cs-block,
.fullHeightForServiceList /deep/ .comprivroot .cs-block .grid,
.fullHeightForServiceList /deep/ .comprivroot .cs-block .grid .ui-jqgrid-view .slimScrollDiv .ui-jqgrid-bdiv,
.fullHeightForServiceList /deep/ .comprivroot .cs-block .grid .ui-jqgrid-view .slimScrollDiv .ui-jqgrid-bdiv > div {
    height: 100% !important;
}

.fullHeightForServiceList /deep/ .comprivroot .cs-block .grid .ui-jqgrid-view {
    height: calc(100% - 40px);
}

.fullHeightForPair /deep/ .comprivroot,
.fullHeightForPair /deep/ .comprivroot > .grid .ui-jqgrid,
.fullHeightForPair /deep/ .comprivroot > .grid .ui-jqgrid .ui-jqgrid-view,
.fullHeightForPair /deep/ .comprivroot > .grid .ui-jqgrid .ui-jqgrid-view .ui-jqgrid-bdiv {
    height: 100% !important;
}

.fullHeightForPair /deep/ .comprivroot > .grid {
    height: calc(100% - 88px);
}

.fullHeightForPair /deep/ .comprivroot > .grid .ui-jqgrid .ui-jqgrid-view .slimScrollDiv {
    height: calc(100% - 29px) !important;
}
</style>
