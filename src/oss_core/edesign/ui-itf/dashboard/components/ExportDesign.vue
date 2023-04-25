<template>
    <div class="export-dialog">
        <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content" v-if="show">
            <template v-slot:popupBody>
                <div class="dashboard-export-resources">
                    <div class="template-div">
                        <div class="div-buttons">
                            <button ref="hldBtn" class="btn btn-default mode-btn" :style="btnActiveName === 'hld' ? activeClass : ''" @click="hldBtnClick"> Resources(HLD) </button>
                            <button ref="lldBtn" class="btn btn-default mode-btn" :style="btnActiveName === 'lld' ? activeClass : ''" @click="lldBtnClick"> Resources(LLD) </button>
                            <button ref="surveyBtn" class="btn btn-default mode-btn" :style="btnActiveName === 'survey' ? activeClass : ''" @click="surveyBtnClick"> Survey </button>
                            <button ref="tasksBtn" class="btn btn-default mode-btn last" :style="btnActiveName === 'tasks' ? activeClass : ''" @click="tasksBtnClick"> Tasks </button>
                        </div>
                    </div>
                    <div class="basicAttr">
                        <Grid :data="gridData" :option="gridOption" class="dashboard-export-grid">
                            <grid-column label="Resource Type" prop="resName"></grid-column>
                            <grid-column label="City" prop="cityName"></grid-column>
                            <grid-column label="Count/Length" prop="resNum"></grid-column>
                            <!-- <grid-column label="Status" prop="flowStateName"></grid-column>
                        <grid-column label="Start Time" prop="createDate"></grid-column>
                        <grid-column label="Plan Finish Time" prop="expectFinishDate"></grid-column>
                        <grid-column label="Area" prop="areaName"></grid-column> -->
                        </Grid>
                    </div>
                </div>
            </template>
        </Popup>
    </div>
</template>
<script>
import Popup from '@/components/popup/popup.vue';
import Grid from '@/components/grid/grid.vue';
import GridColumn from '@/components/grid/grid-column';
import FileSaver from 'file-saver';
export default {
    name: 'exportDesigning',
    components: {
        Popup,
        Grid,
        GridColumn,
    },
    data() {
        return {
            show: false,
            inParam: null,
            activeClass: 'background-color:#2E76B5;border:1px solid #2E76B5;color:#fff',
            btnActiveName: '',
            CompPopuTopo: {
                title: 'Designing Resources', // 标题
                ok: 'Export', // 确认按钮
                close: 'Close', // 取消按钮
                width: '558', // 宽
                height: '471', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                el: '.app-content',
                left: 'calc(50% - 280px)',
                top: 'calc(50% - 235px)',
            },
            gridData: [],
            gridOption: {
                columnMenu: false,
                cached: true,
                pager: false,
                rowNum: 20,
                // rowList : [20,40,60]
            },
        };
    },
    mounted() {
        console.log('export design' + this.$refs.tasksBtn);
    },
    created() {},
    methods: {
        setParams(params) {
            this.inParam = params;
            this.hldBtnClick();
        },

        popupClose() {
            this.$emit('refreshClose');
        },
        popupOk() {
            var template =
                ' <style type="text/css">' +
                'table {' +
                '    font-family: verdana,arial,sans-serif;' +
                '    font-size:11px;' +
                '    color:#333333;' +
                '    border-width: 0.5px;' +
                '    border-color: #666666;' +
                '    border-collapse: collapse;' +
                '}' +
                'table th {' +
                '    padding: 8px;' +
                '    width: 200px;' +
                '	 height: 25px;' +
                '    border-width: 0.5px;' +
                '    border-style: solid;' +
                '    border-color: #9a9a9a;' +
                '    color: #ffffff;' +
                '    background-color: #439bde;' +
                '}' +
                'table td {' +
                '    width: 200px;' +
                '	 height: 25px;' +
                '    padding: 8px;' +
                '    border-width: 0.5px;' +
                '    text-align: left;' +
                '    border-style: solid;' +
                '    border-color: #9a9a9a;' +
                '}' +
                '' +
                '.td_class_0{' +
                '    background-color: #ffffff;' +
                '}' +
                '' +
                '.td_class_1{' +
                '    background-color: #2496f5;' +
                '}' +
                '</style>';
            var fileName = 'DesigningReport';
            var myDate = new Date();
            fileName = fileName + myDate.getFullYear() + (myDate.getMonth() + 1) + myDate.getDate() + myDate.getTime(); // 获取完整的年份(4位,1970-????)
            fileName += '.xlsx';
            this.tableToExcel('Designing', template, fileName);
        },

        hldBtnClick() {
            this.gridData = this.inParam.HLD_CITY;
            this.btnActiveName = 'hld';
        },

        lldBtnClick() {
            this.btnActiveName = 'lld';
            if (!this.lldDatas) {
                this.getLLDDatas();
            }

            this.gridData = this.lldDatas;
        },

        surveyBtnClick() {
            this.btnActiveName = 'survey';
            if (!this.surveyDatas) {
                this.getSurverDatas();
            }

            this.gridData = this.surveyDatas;
        },

        tasksBtnClick() {
            this.btnActiveName = 'tasks';
            if (!this.tasksDatas) {
                this.getTasksDatas();
            }

            this.gridData = this.tasksDatas;
        },

        getLLDDatas() {
            this.lldDatas = [];
            let lldCtc = this.inParam.LLD_CTC_CITY;
            let lldPtc = this.inParam.LLD_PTC_CITY;
            let lldPtp = this.inParam.LLD_LINK_CITY;
            lldCtc.forEach(element => {
                element.resName = 'Splice';
            });
            lldPtc.forEach(element => {
                element.resName = 'Termination';
            });
            lldPtp.forEach(element => {
                element.resName = 'Jump';
            });
            let data = lldCtc.concat(lldPtc);
            this.lldDatas = data.concat(lldPtp);
        },

        getSurverDatas() {
            this.surveyDatas = [];
            let all = { resName: 'All', resNum: 0 };
            let going = { resName: 'On-going', resNum: 0 };
            let users = { resName: 'Surveyed Users', resNum: 0 };
            let buildings = { resName: 'Surveyed Buildings', resNum: 0 };

            this.surveyDatas.push(all);
            this.surveyDatas.push(going);
            this.surveyDatas.push(users);
            this.surveyDatas.push(buildings);
        },

        getTasksDatas() {
            let flowDatas = this.inParam.FLOW_CITY;
            flowDatas.forEach(element => {
                element.resName = element.flowStateName ? element.flowStateName : element.flowState;
                element.resNum = element.flowNum;
            });

            let stateDatas = this.inParam.TASK_CITY;
            stateDatas.forEach(element => {
                let resName = '';
                if (element.taskState == 'DELAY') {
                    resName = 'Delay';
                }
                if (element.taskState == 'NORMAL') {
                    resName = 'Normal';
                }
                if (element.taskState == 'ABOUT') {
                    resName = 'About to delay';
                }
                element.resName = resName;
                element.resNum = element.taskNum;
            });
            this.tasksDatas = flowDatas.concat(stateDatas);
        },

        tableToExcel(sheetName, template, fileName) {
            let datas = this.inParam.HLD_CITY;
            if (!this.lldDatas) {
                this.getLLDDatas();
            }
            if (!this.surveyDatas) {
                this.getLLDDatas();
            }
            if (!this.tasksDatas) {
                this.getLLDDatas();
            }

            if (this.lldDatas) {
                datas = datas.concat(this.lldDatas);
            }
            if (this.surveyDatas) {
                datas = datas.concat(this.surveyDatas);
            }
            if (this.tasksDatas) {
                datas = datas.concat(this.tasksDatas);
            }

            var str = '<table><tr><th>Resource Type</th><th style="height:25px">City</th><th style="height:25px">Count/Length</th></tr>';
            //具体数值 遍历
            for (let i = 0; i < datas.length; i++) {
                str += '<tr>';
                var resName = datas[i].resName ? datas[i].resName : '';
                //不让表格显示科学计数法或者其他格式
                //方法1 tr里面加 style="mso-number-format:'\@';" 方法2  是改为 = 'XXXX'格式
                //如果纯数字且超过15位
                /*var reg = /^[0-9]+.?[0-9]*$/;
                if ((cellvalue.length>15) && (reg.test(cellvalue))){
                    //cellvalue = '="' + cellvalue + '"';
                }*/
                //此处用`取代'，具体用法搜索模板字符串 ES6特性
                str += `<td style="mso-number-format:'\@';">${resName}</td>`;

                var cityName = datas[i].cityName ? datas[i].cityName : '';
                str += `<td style="mso-number-format:'\@';">${cityName}</td>`;

                var resNum = datas[i].resNum ? datas[i].resNum : '';
                str += `<td style="mso-number-format:'\@';">${resNum}</td>`;

                str += '</tr>';
            }
            str += '</table>';
            var html =
                '<html xmlns:x="urn:schemas-microsoft-com:office:excel">\n' +
                '    <head>\n' +
                '        <!--[if gte mso 9]><xml>\n' +
                '            <x:ExcelWorkbook>\n' +
                '                <x:ExcelWorksheets>\n' +
                '                    <x:ExcelWorksheet>\n' +
                '                        <x:Name>' +
                sheetName +
                '</x:Name>\n' +
                '                        <x:WorksheetOptions>\n' +
                '                            <x:Print>\n' +
                '                                <x:ValidPrinterInfo />\n' +
                '                            </x:Print>\n' +
                '                        </x:WorksheetOptions>\n' +
                '                    </x:ExcelWorksheet>\n' +
                '                </x:ExcelWorksheets>\n' +
                '            </x:ExcelWorkbook>\n' +
                '        </xml>\n' +
                '        <![endif]-->\n' +
                template +
                '    </head>' +
                '<body>' +
                str +
                '</body></html>';
            var blob = new Blob([html], { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(blob, fileName);
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

.mode-btn {
    width: 123px;
    background-color: #041427;
    border: 1px solid #004f71;
    border-radius: 2px;
    font-family: 'HelveticaNeue';
    font-size: 13px;
    color: #35bcff;
    // background: #2E76B5;
    margin-right: 10px;

    // line-height: 32px;
}

.last {
    margin-right: 0px;
}

/deep/ .dashboard-export-resources div .panel-body {
    padding-top: 5px;
}

.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}

.dashboard-export-resources {
    height: 100%;
    display: flex;
    flex-flow: column;
    // border: 1px solid #ebebeb;
    padding: 2px;
    .template-div {
        display: flex;
        flex-flow: column;
        width: 100%;
        padding: 8px 0px 8px 0px;
    }
    .div-buttons {
        display: flex;
    }

    .basicAttr {
        height: calc(100% - 30px);
        width: 100%;
        overflow: auto;
        /deep/ .ui-jqgrid-view .ui-jqgrid-htable .ui-th-column {
            background-color: #0b2345;
            height: 28px;
            border: none;
            color: #35bcff;
        }

        /deep/ .ui-jqgrid-view .ui-jqgrid-hdiv {
            border: none;
        }

        /deep/ .ui-jqgrid-view .ui-jqgrid-btable tr.jqgrow td {
            border-bottom: 1px solid #152d50;
        }

        /deep/ .ui-jqgrid-view .ui-jqgrid-bdiv {
            border: none;
        }

        /deep/ .ui-jqgrid-view .ui-jqgrid-btable {
            color: #35bcff;
        }

        /deep/ .ui-jqgrid {
            border-bottom: none;
        }

        /deep/ .ui-jqgrid-tip{
            background: none;
            padding-top: 150px;
            color: #35bcff;
        }
    }
}

.modal-title {
    font-size: 13px;
}

.dashboard-export-grid {
    background-color: #041427;
}

</style>
