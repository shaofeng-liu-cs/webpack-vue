<template>
    <div ref="page" class="v9-pagination"></div>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        displayNum: {
            // 显示最大有效页数
            type: Number,
            default: 5,
        },
        first: {
            // first标签内容
            type: String,
            default: '<i class="glyphicon glyphicon-step-backward"></i>',
        },
        gotext: {
            // gotext输入框内容
            type: String,
            default: 'Go {0}',
        },
        isUpdateAll: {
            // 默认为false，如果为true，则只会更新页码信息，不会更新跳转框中信息
            type: Boolean,
            default: false,
        },
        last: {
            // last标签内容
            type: String,
            default: '<i class="glyphicon glyphicon-step-forward"></i>',
        },
        next: {
            // next标签内容
            type: String,
            default: '<i class="glyphicon glyphicon-triangle-right"></i>',
        },
        pgButton: {
            // 如果为false，隐藏所有页码操作按钮
            type: Boolean,
            default: true,
        },
        pgInput: {
            // 如果为false，隐藏input直接跳转
            type: Boolean,
            default: true,
        },
        pgMultipleTurn: {
            // 如果为false,到首页、尾页按钮隐藏
            type: Boolean,
            default: true,
        },
        pgNumber: {
            // 在pgButton为true的情况下，如果为false，只隐藏页码按钮
            type: Boolean,
            default: true,
        },
        pgRecText: {
            // 如果为false，隐藏记录标签---'1-20/100'
            type: Boolean,
            default: true,
        },
        pgSingleTurn: {
            // 如果为false,到上一页、下一页按钮隐藏
            type: Boolean,
            default: true,
        },
        pgTotal: {
            // 如果为false，隐藏总计元素
            type: Boolean,
            default: true,
        },
        pgtext: {
            // pgtext标签内容,总计页数
            type: String,
            default: 'Page {0} of {1}',
        },
        prev: {
            // previous标签内容
            type: String,
            default: '<i class="glyphicon glyphicon-triangle-left"></i>',
        },
        recordtext: {
            // recordtext标签内容,元素显示区间
            type: String,
            default: 'View {0} - {1} / {2}',
        },
        rowListEditable: {
            // 默认为false，如果为true，则rowList配置失效，下拉选择框变为输入框，根据输入的值来控制当前页显示的条数
            type: Boolean,
            default: false,
        },
        rowtext: {
            // rowtext标签内容,每页显示条数
            type: String,
            default: '{0}/page',
        },
        pageNo: {
            type: Number,
            default: 1,
        }, // 起始页数
        pageSize: {
            type: Number,
            default: 10,
        }, // 每页显示条数
        pageSizes: {
            // 每页显示条数可选数据集
            type: Array,
            default() {
                return [10, 20, 30];
            },
        },
        total: {
            type: Number,
            default: 10,
        }, // 查询到数据的总个数
        layout: String,
    },
    data() {
        return {
            options: {
                displayNum: this.displayNum,
                first: this.first,
                gotext: this.gotext,
                isUpdateAll: this.isUpdateAll,
                last: this.last,
                next: this.next,
                pgButton: this.pgButton,
                pgInput: this.pgInput,
                pgMultipleTurn: this.pgMultipleTurn,
                pgNumber: this.pgNumber,
                pgRecText: this.pgRecText,
                pgSingleTurn: this.pgSingleTurn,
                pgTotal: this.pgTotal,
                pgtext: this.pgtext,
                prev: this.prev,
                recordtext: this.recordtext,
                rowListEditable: this.rowListEditable,
                rowtext: this.rowtext,
                rowList: this.pageSizes,
                rowNum: this.pageSize,
                records: this.total,
                start: this.pageNo,
                // total: {// 总页数，非必传
                //     type: Number,
                // },
                onPageClick: (e, e1, e2, e3) => {
                    if (e1.eventType === 'select') {
                        this.$emit('size-change', e1.rowNum);
                    } else {
                        this.$emit('page-change', Number(e1.page));
                    }
                },
            },
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this._pagination = $(this.$refs.page).pagination(this.options);
        },
        updatePageNo(pageNo) {
            this._pagination.pagination('update', { start: pageNo });
        },
        updateTotal(total) {
            this._pagination.pagination('update', { records: total });
        },
        updatePageSize(pageSize) {
            this._pagination.pagination('update', { rowNum: pageSize });
        },
    },
    watch: {
        total(newVal, oldVal) {
            this.updateTotal(newVal);
        },
        pageNo(newVal, oldVal) {
            this.updatePageNo(newVal);
        },
        pageSize(newVal, olgVal) {
            this.updatePageSize(newVal);
        },
    },
};
</script>

<style lang="scss" scoped>
.v9-pagination /deep/.pagination > li > a {
    height: 22px;
    display: flex;
    align-items: center;
}
</style>
