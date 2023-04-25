<template>
    <div class="history-dialog">
        <Popup :popupObj="CompPopuTopo" class="selection-content" v-show="show">
            <template v-slot:popupBody>
                <div id="history" class="edesign-history">
                    <div class="left-panel">
                        <div class="left-panel-top">
                            <div class="panel-heading">
                                <label class="panel-title">Resources Designed (HLD)</label>
                            </div>
                            <div class="panel-body">
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/occ.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Optical Cabinet: </label>
                                        <label class="div-datas-res-num"> {{occNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/manhole.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Manhole: </label>
                                        <label class="div-datas-res-num"> {{manholeNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/odb.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Optical Distribution Point: </label>
                                        <label class="div-datas-res-num"> {{odpNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/odf.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> ODF: </label>
                                        <label class="div-datas-res-num"> {{odfNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/olt.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> OLT: </label>
                                        <label class="div-datas-res-num"> {{oltNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/splitter.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Splitter: </label>
                                        <label class="div-datas-res-num"> {{splitterNum}} </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="left-panel-bottom">
                            <div class="panel-heading">
                                <label class="panel-title">Resources Designed (LLD)</label>
                            </div>
                            <div class="panel-body">
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/resources.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Termination: </label>
                                        <label class="div-datas-res-num"> {{terminationNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/resources.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Jump: </label>
                                        <label class="div-datas-res-num"> {{jumpNum}} </label>
                                    </div>
                                </div>
                                <div class="div-res">
                                    <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/resources.png')"></div>
                                    <div class="div-datas">
                                        <label class="div-datas-res"> Splicing: </label>
                                        <label class="div-datas-res-num"> {{splitterNum}} </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right-panel">
                        <div class="panel top">
                            <div class="panel-heading">
                                <div><label class="panel-title">Monthly Task Statisitics</label></div>
                                <div>
                                    <button class="close" @click="popupHeadClose">
                                        <span class="icon_osp icon_ospclose"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="panel-body">
                                <div class="chart-content" id="historyChart3" ref="historyChart3"></div>
                            </div>
                        </div>
                        <div class="panel bottom">
                            <div class="panel-heading">
                                <label class="panel-title">Monthly Resource In Service Statistics</label>
                            </div>
                            <div class="panel-body">
                                <div class="chart-content" id="historyChart4" ref="historyChart4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Popup>
    </div>
</template>
<script>
import Popup from '@/components/popup/popup.vue';
const LABEL_SIZE = '12';
const CHART_LABEL_COLOR = '#185475';
const CHART_GRID_COLOR = '#172339';
export default {
    name: 'History',
    components: {
        Popup,
    },
    data() {
        return {
            design: false,
            history: true,
            show: true,
            changValue: null,
            manholeNum: 0,
            occNum: 0,
            odpNum: 0,
            odfNum: 0,
            oltNum: 0,
            splitterNum: 0,
            terminationNum: 0,
            splicingNum: 0,
            jumpNum: 0,
            CompPopuTopo: {
                // title: 'History Statistics', // 标题
                // ok: 'Export', // 确认按钮
                // close: 'Close', // 取消按钮
                width: '80%', // 宽
                height: '90%', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                left: 'calc(50% - 40%)',
                top: 'calc(50% - 45%)',
            },
        };
    },
    mounted() {},
    created() {},
    methods: {
        isShow(resType) {
            return (
                'OLT' === resType || 'ODF' === resType || 'OCC' === resType || 'SPLITTER' === resType || 'ODB' === resType || 'MANHOLE' === resType
            );
        },
        draw() {
            this.chart2 = null;
            this.chartTask = null;
            this.chart4 = null;
            var colorList = [
                '#0093FF',
                '#00C564',
                '#45DC2D',
                '#DCC62D',
                '#DC9A2D',
                '#78DC2D',
                '#2DDBDC',
                '#A12DDC',
                '#852DDC',
                '#592DDC',
                '#DC2DD4',
                '#2DDCB5',
                '#2D4CDC',
                '#2D8CDC',
                '#DC4F2D',
                '#DC742D',
                '#2DDC4C',
                '#2DDC2D',
                '#60DC2D',
            ];
            this.axios.get('edesign/sprint/statistics/history/v1').then(response => {
                this.chartTask = this.$echarts.init(this.$refs.historyChart3, null, { renderer: 'svg' });

                this.charts4 = this.$echarts.init(this.$refs.historyChart4, null, { renderer: 'svg' });
                this.chartTask.showLoading();
                this.charts4.showLoading();
                let hldDatas = response.data.HIS_HLD;
                hldDatas.forEach(element => {
                    if (this.isShow(element.resType)) {
                        if (element.resType === 'OLT') {
                            this.oltNum = element.resNum;
                        }
                        if (element.resType === 'OCC') {
                            this.occNum = element.resNum;
                        }
                        if (element.resType === 'ODF') {
                            this.odfNum = element.resNum;
                        }
                        if (element.resType === 'SPLITTER') {
                            this.splitterNum = element.resNum;
                        }
                        if (element.resType === 'ODB') {
                            this.odpNum = element.resNum;
                        }
                        if (element.resType === 'MANHOLE') {
                            this.manholeNum = element.resNum;
                        }
                    }
                });

                this.splicingNum = response.data.HIS_LLD_CTC[0].resNum;
                this.jumpNum = response.data.HIS_LLD_LINK[0].resNum;
                this.terminationNum = response.data.HIS_LLD_PTC[0].resNum;

                var xAxisData = [];
                var normalDatas = [];
                var delayDatas = [];
                response.data.HIS_TASK.forEach(element => {
                    xAxisData.push(element.taskDate);
                    normalDatas.push(element.normalNum ? element.normalNum : '0');
                    delayDatas.push(element.delaylNum ? element.delaylNum : '0');
                });
                this.drawLineTask(xAxisData, normalDatas, delayDatas);

                var resXAxisData = [];
                var resTypes = [];
                var resTypeNames = [];
                var tmp = [];
                response.data.HIS_RES.forEach(element => {
                    if (resXAxisData.indexOf(element.taskDate) === -1) {
                        resXAxisData.push(element.taskDate);
                    }
                    element.value.forEach(res => {
                        if (res.resType) {
                            if (resTypes.indexOf(res.resType) === -1) {
                                resTypes.push(res.resType);
                                resTypeNames.push(res.resName);
                            }
                            //resTypeNames.push(res.resName);
                        }
                    });
                });
                let index = 0;
                resTypes.forEach(resType => {
                    var resNumDatas = [];
                    var resTypeName = '';
                    resXAxisData.forEach(dates => {
                        response.data.HIS_RES.forEach(element => {
                            if (dates === element.taskDate) {
                                var find = false;
                                for (let i = 0; i < element.value.length; i++) {
                                    if (resType === element.value[i].resType) {
                                        resNumDatas.push(element.value[i].resNum);
                                        find = true;
                                        resTypeName = element.value[i].resName;
                                        break;
                                    }
                                }
                                if (!find) {
                                    resNumDatas.push(0);
                                }
                            }
                        });
                    });
                    let temp = {
                        name: resTypeName,
                        type: 'line',
                        symbol: 'circle',
                        data: resNumDatas,
                        itemStyle: {
                            normal: {
                                color: colorList[index],
                                lineStyle: {
                                    color: colorList[index],
                                },
                            },
                        },
                    };
                    tmp.push(temp);
                    index++;
                });

                this.drawLineRes(resTypeNames, resXAxisData, tmp);
            });
        },
        drawLineTask: function (xAxisData, normalDatas, delayDatas) {
            let category = ['Tasks Intime', 'Tasks Outtime'];
            let option = {
                tooltip: {
                    trigger: 'axis',
                    confine: true,
                    transitionDuration: 0,
                },
                legend: {
                    data: category,
                    icon: 'line',
                    show: true,
                    textStyle: {
                        fontSize: LABEL_SIZE,
                        color: '#35BCFF',
                    },
                    x: 'right',
                    y: 'top',
                    itemGap: 30,
                    padding: [0, 10, 0, 0],
                },
                grid: {
                    top: '25px',
                    bottom: '10px',
                    left: '20px',
                    right: '40px',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xAxisData,
                    axisLabel: {
                        textStyle: {
                            fontSize: LABEL_SIZE,
                            color: CHART_LABEL_COLOR,
                        },
                    },
                    axisTick: {
                        lineStyle: {
                            color: CHART_LABEL_COLOR,
                            // width: 2,
                            type: 'solid',
                        },
                    },
                },
                yAxis: {
                    minInterval: 1,
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dotted',
                            color: CHART_GRID_COLOR,
                        },
                    },
                    //去除网格线
                    axisLine: {
                        show: false,
                    },
                    min: 0,
                    max: function (value) {
                        return value.max > 5 ? value.max : 5;
                    },
                    axisLabel: {
                        textStyle: {
                            fontSize: LABEL_SIZE,
                            color: CHART_LABEL_COLOR,
                        },
                    },
                },
                series: [
                    {
                        name: category[0],
                        type: 'line',
                        data: normalDatas,
                        symbol: 'circle',
                        itemStyle: {
                            normal: {
                                color: '#0093FF',
                                lineStyle: {
                                    color: '#0093FF', //折线颜色
                                },
                            },
                        },
                    },
                    {
                        name: category[1],
                        type: 'line',
                        data: delayDatas,
                        symbol: 'circle',
                        itemStyle: {
                            normal: {
                                color: '#00C564',
                                lineStyle: {
                                    color: '#00C564', //折线颜色
                                },
                            },
                        },
                    },
                ],
            };
            this.chartTask.setOption(option);
            this.chartTask.hideLoading();
            window.addEventListener('resize', () => {
                this.chartTask.resize();
            });
        },

        drawLineRes: function (resTypeNames, resXAxisData, tmp) {
            let option = {
                tooltip: {
                    trigger: 'axis',
                    confine: true,
                },
                legend: {
                    data: resTypeNames,
                    show: true,
                    icon: 'line',
                    textStyle: {
                        fontSize: LABEL_SIZE,
                        color: '#35BCFF',
                    },
                    x: 'center',
                    y: 'bottom',
                },
                grid: {
                    top: '2%',
                    left: '3%',
                    right: '4%',
                    bottom: '20%',
                    containLabel: true,
                    // width:"auto", //图例宽度
                    // height:"100%", //图例高度
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: resXAxisData,

                    axisLabel: {
                        textStyle: {
                            fontSize: LABEL_SIZE,
                            color: CHART_LABEL_COLOR,
                        },
                    },
                    axisTick: {
                        lineStyle: {
                            color: CHART_LABEL_COLOR,
                            // width: 2,
                            type: 'solid',
                        },
                    },
                },
                dataset: {
                    source: this.lineData,
                },
                yAxis: {
                    minInterval: 1,
                    axisTick: {
                        show: false,
                        color: CHART_LABEL_COLOR,
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dotted',
                            color: CHART_GRID_COLOR,
                        },
                    },
                    //去除网格线
                    axisLine: {
                        show: false,
                    },
                    min: 0,
                    max: function (value) {
                        return value.max > 10 ? value.max : 10;
                    },
                    axisLabel: {
                        textStyle: {
                            fontSize: LABEL_SIZE,
                            color: CHART_LABEL_COLOR,
                        },
                    },
                },
                series: tmp,
            };
            this.charts4.setOption(option);
            this.charts4.hideLoading();
            window.addEventListener('resize', () => {
                this.charts4.resize();
            });
        },

        popupHeadClose() {
            //this.$emit("beforeClose");

            if (this.sureFlag) {
                this.$emit('popupSure');
            } else {
                this.show = false;
                this.$emit('popupClose', 'head');
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.edesign-history {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    // background-color: rgba(4,18,37, 0.5);
}

.edesign-history > div.left-panel {
    width: 260px;
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    background-color: rgba(9, 25, 48, 0.5);
    border-radius: 10px;
}

.edesign-history > div.right-panel {
    width: calc(100% - 260px);
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    .top {
        height: 30%;
        border: none;
        background-color: rgba(4, 18, 37, 1);
    }
    .bottom {
        height: calc(70% - 0px);
        border: none;
        background-color: rgba(4, 18, 37, 1);
    }
}

.edesign-history .panel {
    width: 100%;
    height: calc(50%-10px);
    display: flex;
    flex-direction: column;
    margin: 0px;
}

.edesign-history .left-panel-top {
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
}

.edesign-history .left-panel-bottom {
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
}

.edesign-history .panel-body {
    width: 100%;
    flex-grow: 1;
    display: flex;
    padding: 0px;
    flex-direction: column;
    overflow: hidden;
    .chart-content {
        width: 100%;
        height: 100%;
    }
}

.edesign-history .panel-heading {
    padding: 8px;
    display: flex;
    justify-content: space-between;
    cursor: auto;
}

.edesign-history .panel-title {
    font-family: 'PingFangSC-Semibold', 'PingFang SC Semibold', 'PingFang SC';
    font-weight: 650;
    font-style: normal;
    font-size: 10px;
    color: #1c79ed;
    text-align: left;
    line-height: 10px;
}

.edesign-history .close {
    color: #1c79ed;
}

.div-res {
    width: 100%;
    height: 30px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    padding-left: 10px;
}

.div-image {
    width: 30px;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 30px;
}

.div-datas-res {
    height: 100%;
    width: auto;
    // font-family: 'HelveticaNeue';
    font-size: 12px;
    color: #35bcff;
    flex-grow: 1;
}

.div-datas-res-num {
    height: 100%;
    width: auto;
    // font-family: 'HelveticaNeue-Bold';
    font-size: 18px;
    color: #d8eafe;
}

.history-dialog {
    /deep/ .ui-dialog .modal-footer {
        display: none !important;
    }

    /deep/ .ui-dialog .modal-body {
        flex-grow: 1;
        background-color: #041225 !important; 
        padding: 10px;
        border-radius: 10px;
    }

    /deep/ .ui-dialog {
        background-color: #041225 !important;
        border-radius: 10px;
    }
}
</style>
