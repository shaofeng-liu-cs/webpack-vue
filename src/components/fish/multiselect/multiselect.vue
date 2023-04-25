<template>
    <select ref="multiselect" name="multiselect" class="choose-select" multiple :value="selected" :data-rule="dataRule" :disabled="disabled">
    </select>
</template>

<script>
export default {
    name: 'Multiselect',
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },

        dataRule: {
            type: String,
            default: '',
        },
        options: {
            //数据源
            type: Array,
        },
        max: {
            // 多选限制条数
            type: String,
        },
        rowCount: {
            //显示结果展示条数
            type: Number,
        },
        displayMode: {
            // 是否折行  single   multiple
            type: String,
            default: 'multiple',
        },
        dataOption: {
            //dataValueField  dataTextField
            type: Object,
            default: () => {},
        },
        selected: {
            type: [String, Array],
        },
    },
    data() {
        return {
            //selected: undefined
        };
    },
    model: {
        prop: 'selected',
        event: 'input',
    },
    computed: {
        callback() {
            return {
                callback: {
                    change: (evt, params) => {
                        console.log(treeNode);
                        //this.currentValue = treeNode.name
                    },
                },
            };
        },
    },
    watch: {
        selected: {
            deep: true,
            immediate: true,
            handler(val, old) {
                $(this.$refs.multiselect).multiselect('value', val);
            },
        },
        'dataOption.dataSource': {
            deep: true,
            immediate: false,
            handler(val, old) {
                $(this.$refs.multiselect).multiselect('option', {
                    dataSource: val,
                });
            },
        },
        disabled:{
            deep: true,
            immediate: true,
            handler(val, old) {
                if (this.disabled) {
                    $(this.$refs.multiselect).multiselect('disable');
                } else {
                    $(this.$refs.multiselect).multiselect('enable');
                }
            }
        }
    },
    mounted() {
        let sitting = Object.assign({}, this.dataOption, {
            dataSource: this.options,
            maxLength: this.max,
            displayMode: this.displayMode,
            disabled: this.disabled,
            rowCount: this.rowCount,
        });
        console.log(this.selected);
        $(this.$refs.multiselect).multiselect(sitting);
        $(this.$refs.multiselect).multiselect('value', this.selected);
        $(this.$refs.multiselect).on('multiselect:change', (evt, params) => {
            this.$emit('change', evt, params, $(this.$refs.multiselect).multiselect('selectedItems') || {});
        });
        $(this.$refs.multiselect).on('multiselect:hidingdropdown', (evt, params) => {
            let val = $(this.$refs.multiselect).multiselect('value');
            this.$emit('input', val);
        });
    },
    methods: {
        inputload(event) {
            console.log(event);
            let value = event.target.value;
            this.$emit('input', value);
        },
    },
};
</script>

<style lang="scss">
.ui-multiselect-container {
    border-radius: 3px;
}
.ui-multiselect-inline {
    padding: 0 8px;
}
.choose-select + .ui-multiselect-disabled {
  background-color: #eeeeee;
}

input::-webkit-input-placeholder {
    color: #a0a0a0;
}
input::-moz-input-placeholder {
    color: #a0a0a0;
}
input::-ms-input-placeholder {
    color: #a0a0a0;
}

</style>
