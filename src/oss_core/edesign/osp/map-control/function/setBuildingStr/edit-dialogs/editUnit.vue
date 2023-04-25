<template>
    <Popup :popupObj="popupNew" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div>
                <div>
                    <h5>{{ $t('MAP_CON_FUNC_UNIT_INFO') }}</h5>
                    <form class="contentForm" ref="unitInfo">
                        <div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_UNIT_NAME') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="text" class="form-control" v-model="row.unitName" name="prefix" data-rule="required" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </template>
    </Popup>
</template>

<script>
export default {
    name: 'New',
    inject: ['getHldEl'],
    computed: {
        hldEl() {
            return this.getHldEl();
        },
    },
    props: {
        graphic: {},
    },
    data() {
        return {
            popupNew: {
                title: this.$t('OSP_MAP_FUNCTION_EDIT_UNIT_TITLE'), // 弹框标题
                ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CANCEL'), // 取消按钮内容
                modal: true, // 是否蒙层
                width: '650px', // 宽
                height: 'auto', // 高
                //left: '30%',
                //top:'20%',
                show: false,
                el: this.getHldEl(),
                drag: true,
                zIndex: 3,
            },
            row: {},
        };
    },

    mounted() {},

    methods: {
        popupClose() {
            this.popupNew.show = false;
            this.row = {};
        },

        popupOk() {
            this.$initForm = $(this.$refs.unitInfo).form();
            if (!this.$initForm.isValid()) {
                return;
            }
            this.$emit('editUnit', this.row);
            this.popupNew.show = false;
            this.row = {};
        },
    },
};
</script>

<style lang="scss" scoped>
h5 {
    margin-top: 5px;
    color: #4477ee;
    border-bottom: 1px solid #d7d7d7;
    font-size: 14px;
    margin-bottom: 10px;
}

.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}

.content {
    margin-top: 4px;
    height: 35px;
}

.inputLabel {
    text-align: right;
    padding-top: 4px;
}

.contentForm {
    height: 75px;
}
</style>
