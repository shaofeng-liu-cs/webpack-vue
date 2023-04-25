<!--
 * @Author: your name
 * @Date: 2021-07-23 15:14:32
 * @LastEditTime: 2021-08-04 10:51:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \design-web\src\oss_core\edesign\osp\map-control\function\referenceDetail\referenceDetail.vue
-->
<template>
    <div class="grid-height-auto">
        <Grid :data="refList" :option="gridOption">
            <grid-column width="135" :label="$t('PROJECT')" prop="projectName"></grid-column>
            <grid-column width="135" :label="$t('TASK')" prop="schemaName"></grid-column>
            <grid-column width="135" :label="$t('REFERENCE_TIME')" prop="referenceTime"></grid-column>
            <grid-column width="135" :label="$t('REFERENCE_USER')" prop="operUserName"></grid-column>
        </Grid>
    </div>
</template>
<script>
import { getRefDetailByResId } from '@/oss_core/edesign/api/query/resId.js';

export default {
    name: 'ReferenceDetail',
    props: {
        params: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {
            refList: [],
            gridOption: {
                rownumbers: true,
                rownumWidth: 30,
                shrinkToFit: true, //宽度自适应
                width: '100%',
                height: '265px',
            },
        };
    },
    created() {},
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
        getRefDetailByResId(this.params).then(data => {
            console.log(data);
            if (data && data.resultList) {
                this.refList = data.resultList || [];
            }
        });
        console.log(this.params);
    },
    //方法集合
    methods: {},
};
</script>

<style lang="scss" scoped>
.grid-height-auto {
    height: 100%;
}
</style>