<template>
     <Popup :popupObj="popupParam" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div class="param-form">
                <div class="singleForm" v-for="(refForm, index) in formList" :key="index">
                    <label class="formTitle" :title="refForm.paramName">{{ refForm.paramName }}:</label>
                    <input class="formContent form-control" name="param_input" v-model="refForm.defValue" :type="refForm.valueType === 'N' ? 'number' : 'text'" v-if="refForm.controlType === '1'">
                    <Combobox name="param_com" v-model="refForm.defValue" :setting="{ dataTextField: 'name', dataValueField: 'code', dataSource: refForm.valueSelect, value: refForm.defValue }" v-else-if="refForm.controlType === '3'"></Combobox>
                </div>
            </div>
            
        </template>
    </Popup>
</template>

<script>
export default {
    name:'ParamView',
    computed: {  

    },
    props:{
        appendEl: {},
    },
    data() {
        return {
            popupParam: {
                title: this.$t('DESIGN_CHECK_SET_POL'), // 弹框标题
                ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CANCEL'), // 取消按钮内容
                modal: true, // 是否蒙层
                width: '400', // 宽
                height: 'auto', // 高
                //left: '30%',
                //top:'20%',
                show: false,
                drag: true,
                zIndex: 3,
            },
            formList: [],
            items: {},
            item: {},
        }
    },
    created() {
        if (this.appendEl) {
            this.popupParam.el = this.appendEl;
        }
    },
    mounted() {

    },

    methods: {
        initParmData(items, item) {
            this.item = item;
            this.formList = JSON.parse(JSON.stringify(item.paramList));
        },
        popupClose() {
            this.popupParam.show = false;
        },

        popupOk() {
            this.popupParam.show = false;
            this.item.paramList = JSON.parse(JSON.stringify(this.formList));
        },

    },
}
</script>

<style lang="scss" scoped>
    .singleForm {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 10px;
        }
        /deep/ .input-group input {
            padding-right: 8px !important;
        }
    }
    .formTitle {
        display: flex;
        align-items: center;
        width: 120px;
        justify-content: flex-end;
        white-space: nowrap;
        overflow: hidden;
        margin-right: 20px;
    }
    .formContent {
        width: 211px;
    }
</style>