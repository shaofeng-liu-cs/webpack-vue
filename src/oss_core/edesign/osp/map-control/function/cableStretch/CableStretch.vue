<!--
 * @Author: your name
 * @Date: 2021-05-10 09:47:11
 * @LastEditTime: 2022-08-25 09:37:24
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 盘留
 * @FilePath: \design-web\src\oss_core\edesign\osp\map-control\function\cableStretch\CableStretch.vue
-->
<template>
    <div class="grid-div">
        <Grid :data="gridData" :option="gridOption" id="gridCable" ref="gridCable">
            <grid-column :label="$t('OSP_MAP_FUNCTION_FACILITY')" prop="facilityName"></grid-column>
            <grid-column :label="$t('OSP_MAP_FUNCTION_CABLE')" prop="cableName"></grid-column>
            <grid-column :label="$t('OSP_MAP_FUNCTION_FACILITY')" prop="length" :editable="true" editrules="integer[+0];required"></grid-column>
            <grid-column label="">
                <template slot-scope="{ row }">
                    <div>
                        <button type="button" class="btn-link" @click="reset(row)"> {{$t('RESET')}} </button>
                    </div>
                </template>
            </grid-column>
        </Grid>
    </div>
</template>

<script>
import { operateCableStretch } from '@/oss_core/edesign/api/edit/resId.js';
import { getCableStretchByResId } from '@/oss_core/edesign/api/query/resId.js';

export default {
    name: 'cableStretch',

    props: {
        params: {
            type: Object,
            default: {},
        },
    },

    data() {
        return {
            gridData: [],
            gridOption: {
                cellEdit: true, //是否开启单元格编辑
            },
        };
    },

    mounted() {
        this.initGridData();
    },

    methods: {
        initGridData() {
            getCableStretchByResId(this.params).then(result => {
                this.gridData = result || [];
            });
        },
        popOk() {
            let newData = this.$refs.gridCable.getData();
            operateCableStretch(newData).then(result => {
                fish.toast('success', this.$t('SAVE_SUCCESS'));
            });
            this.$emit('close');
        },

        reset(row) {
            this.gridData.forEach(item => {
                if (item.facilityId === row.facilityId && item.cableId === row.cableId) {
                    item.length = 0;
                }
            });
        },
    },
};
</script>
<style lang="scss" scoped>
#gridCable {
    min-width: 700px;
    min-height: 299px;
}
.grid-div,
#gridCable,
#gridCable /deep/ .ui-jqgrid-view,
#gridCable /deep/ .ui-jqgrid-view .slimScrollDiv .ui-jqgrid-bdiv {
    height: 100% !important;
    width: 100% !important;
}
#gridCable /deep/ .ui-jqgrid-view .ui-jqgrid-hdiv,
#gridCable /deep/ .ui-jqgrid-view .ui-jqgrid-hdiv .ui-jqgrid-hbox,
#gridCable /deep/ .ui-jqgrid-view .ui-jqgrid-hdiv .ui-jqgrid-hbox .ui-jqgrid-htable,
#gridCable /deep/ .ui-jqgrid-view .slimScrollDiv .ui-jqgrid-bdiv #btable_gridCable {
    width: 100% !important;
}

#gridCable /deep/ .ui-jqgrid-view .slimScrollDiv {
    width: 100% !important;
    height: calc(100% - 29px) !important;
}
</style>