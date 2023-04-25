<!--
 * @Author: HongAnDing
 * @Date: 2022-07-04 10:45:08
 * @LastEditors: HongAnDing
 * @LastEditTime: 2022-08-15 18:22:17
 * @Description: file content
-->
<template>
    <Popup :popupObj="popupObj" @popupOk="popupOk">
        <template v-slot:popupBody>
            <Grid :data="pointList" :option="gridOpt" :selection.sync="selectData" @select="select" ref="gridRef">
                <grid-column label="SEQ" prop="SEQ" width="100"></grid-column>
                <grid-column label="Point Resource Type" prop="resTypeName" width="390"></grid-column>
            </Grid>
        </template>
    </Popup>
</template>

<script>
export default {
    name: 'AddPointRes',
    inject: ['getHldEl'],
    computed: {
        hldEl() {
            return this.getHldEl();
        },
    },
    data() {
        return {
            popupObj: {
                title: 'Add Point Resource', // 弹框标题
                ok: 'OK', // 确认按钮内容
                close: 'Cancel', // 取消按钮内容
                modal: true, // 是否蒙层
                width: '550', // 宽
                height: '400', // 高
                el: this.getHldEl(),
                drag: true,
                show: false,
                zIndex: 3,
            },
            pointList: [],
            selectData: [], // 当前已选择的点资源 将要添加到列表中
            rowData: '',
            gridOpt: {
                height: '260px',
                width: '400px',
                multiselect: true,
                multiselectWidth: 30,
            },
        };
    },
    created() {},
    mounted() {},

    methods: {
        select(selectedRow, row) {
            this.selectData = selectedRow;
        },

        popupOk() {
            this.$emit('selectedPoint', this.selectData);
            this.popupObj.show = false;
        },
        refreshPointList(oldSelect) {
            // oldSelect为上次选择的点资源，重新打开弹窗，需要预先勾选
            let selectedData = [];
            let allData = $(this.$refs.gridRef.$refs.grid).grid('getRowData');
            oldSelect.forEach(itemSelet => {
                selectedData.push(allData.find(itemAll => itemAll.resTypeId === itemSelet.resTypeId));
            });
            let ids = [];
            allData.forEach(all => {
                let findResult = selectedData.find(sel => sel._id_ === all._id_);
                if (!findResult) {
                    ids.push(all._id_);
                }
            });
            $(this.$refs.gridRef.$refs.grid).grid('setAllCheckRows', true);
            $(this.$refs.gridRef.$refs.grid).grid('setCheckRows', ids, false);
            this.selectData = $(this.$refs.gridRef.$refs.grid).grid('getCheckRows');
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
