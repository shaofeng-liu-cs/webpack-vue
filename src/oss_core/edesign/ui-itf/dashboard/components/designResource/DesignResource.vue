<template>
    <div id="history" class="edesign-resource">
        <!-- 左上HLD -->
        <div class="home-panel">
            <div class="home-panel-heading">
                <div class="line"></div>
                <div>
                    <label class="home-panel-title">Resources Designed (HLD)</label>
                </div>
                <div>
                    <div class="view-all" @click="showExportDialog"> View All </div>
                </div>
            </div>
            <div class="home-panel-body">
                <div class="hld-content">
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/occ.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">Optical Cabinet</div>
                            <div class="div-datas-res-num">{{occNum}}</div>
                        </div>
                    </div>
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/manhole.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">Manhole</div>
                            <div class="div-datas-res-num">{{manholeNum}}</div>
                        </div>
                    </div>
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/odb.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">Optical Distribution Point</div>
                            <div class="div-datas-res-num">{{odpNum}}</div>
                        </div>
                    </div>
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/odf.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">ODF</div>
                            <div class="div-datas-res-num">{{odfNum}}</div>
                        </div>
                    </div>
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/olt.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">OLT</div>
                            <div class="div-datas-res-num">{{oltNum}}</div>
                        </div>
                    </div>
                    <div class="div-res">
                        <div class="div-image" style="backgroundImage: url('oss_core/edesign/assets/image/dashboard/splitter.png')"></div>
                        <div class="div-datas">
                            <div class="div-datas-res">Splitter</div>
                            <div class="div-datas-res-num">{{splitterNum}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 左中LLD -->
        <div class="home-panel">
            <div class="home-panel-heading">
                <div class="line"></div>
                <div>
                    <label class="home-panel-title">Resources Designed (LLD)</label>
                </div>
                <div>
                    <div class="view-all" @click="showExportDialog"> View All </div>
                </div>
            </div>
            <div class="home-panel-body">
                <div class="chart-content" id="chartLLD"></div>
            </div>
        </div>
        <!-- 左下task -->
        <div class="home-panel">
            <div class="home-panel-heading">
                <div class="line"></div>
                <div>
                    <label class="home-panel-title">Survey Tasks</label>
                </div>
                <div>
                    <div class="view-all" @click="showExportDialog"> View All </div>
                </div>
            </div>
            <div class="home-panel-body">
                <div class="task-chart-content" id="chartSurvey"></div>
            </div>
        </div>
        <!-- </div> -->
        <ExportDesign ref="exportDesign"></ExportDesign>
    </div>
</template>

<script>
import ExportDesign from '../ExportDesign.vue';
const LABEL_SIZE = '12';
export default {
    name: 'History',
    components: {
        ExportDesign,
    },
    data() {
        return {
            design: false,
            history: true,
            dataParams: {},
            manholeNum: 0,
            occNum: 0,
            odpNum: 0,
            odfNum: 0,
            oltNum: 0,
            splitterNum: 0,
        };
    },
    mounted() {
        this.chartSurvey = null;
        this.chartSurvey = this.$echarts.init(document.getElementById('chartSurvey'));
        this.chartLLD = null;
        this.chartLLD = this.$echarts.init(document.getElementById('chartLLD'), null, { renderer: 'svg' });

        this.axios.get('edesign/sprint/statistics/designing/v1').then(response => {
            this.chartSurvey.showLoading();
            this.chartLLD.showLoading();
            let hldDatas = response.data.HLD;
            this.dataParams = response.data;
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

            // let lldDatas = [response.data.LLD_PTC.resNum, response.data.LLD_LINK.resNum, response.data.LLD_CTC.resNum];
            let lldDatas = [
                {
                    name: 'Termination',
                    value: '1',
                    itemStyle: {
                        barBorderRadius: 5,
                        shadowBlur: 9,
                        shadowColor: '#FDC22D',
                    },
                },
                {
                    name: 'Jump',
                    value: '4',
                    itemStyle: {
                        barBorderRadius: 5,
                        shadowBlur: 9,
                        shadowColor: '#219CFF',
                    },
                },
                {
                    name: 'Splicing',
                    value: '9',
                    itemStyle: {
                        barBorderRadius: 5,
                        shadowBlur: 9,
                        shadowColor: '#FF80D2',
                    },
                },
            ];
            this.drawBarLLD(lldDatas);
            let surveyDatas = [
                {
                    name: 'On-going',
                    value: 0,
                },
                {
                    name: 'Surveyed Users',
                    value: 0,
                },
                {
                    name: 'Surveyed Buildings',
                    value: 0,
                },
            ];
            this.drawPieSurvey(surveyDatas);
        });
    },
    methods: {
        isShow(resType) {
            return (
                'OLT' === resType || 'ODF' === resType || 'OCC' === resType || 'SPLITTER' === resType || 'ODB' === resType || 'MANHOLE' === resType
            );
        },
        drawBarLLD: function (lldDatas) {
            var view = this;

            let category = ['Termination', 'Jump', 'Splicing'];
            let option = {
                // backgroundColor: '#0f375f',
                tooltip: {
                    // trigger: 'axis',
                    // axisPointer: {
                    //     type: 'shadow'
                    // }
                },
                grid: {
                    top: '10px',
                    bottom: '0px',
                    left: '80px',
                    right: '20px',
                    // width:"auto", //图例宽度
                    // height:"100%", //图例高度
                },
                legend: {
                    data: category,
                    textStyle: {
                        color: '#ccc',
                    },
                    show: false,
                },
                xAxis: {
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc',
                        },
                    },
                },
                yAxis: [
                    {
                        data: category,
                        splitLine: { show: false },
                        axisTick: {
                            show: false,
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: '#35BCFF',
                            },
                        },
                    },
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: 10,
                        showBackground: true,
                        zlevel: 2,
                        backgroundStyle: {
                            color: '#2C3E5E',
                            borderWidth: 10,
                            barBorderRadius: 5,
                        },
                        itemStyle: {
                            barBorderRadius: 5,
                            color: function (params) {
                                let colorList = [
                                    {
                                        c1: '#FCCB2D', //Termination
                                        c2: '#FF7527',
                                    },
                                    {
                                        c1: '#63DDFF', //Jump
                                        c2: '#069AFF',
                                    },
                                    {
                                        c1: '#FFB1E5', //Splicing
                                        c2: '#FF50BF',
                                    },
                                ];
                                return new view.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                    {
                                        //颜色渐变函数 前四个参数分别表示四个位置依次为左、右、上、下
                                        offset: 0,
                                        color: colorList[params.dataIndex].c1,
                                    },
                                    {
                                        offset: 1,
                                        color: colorList[params.dataIndex].c2,
                                    },
                                ]);
                            },
                        },
                        data: lldDatas,
                    },
                ],
            };
            this.chartLLD.setOption(option);
            this.chartLLD.hideLoading();
            window.addEventListener('resize', () => {
                this.chartLLD.resize();
            });
        },

        drawPieSurvey: function (surveyDatas) {
            var view = this;
            let total = 0;
            for (var i = 0; i < surveyDatas.length; i++) {
                total += surveyDatas[i].value;
            }
            view.total = total;
            var category = ['On-going', 'Surveyed Users', 'Surveyed Buildings'];
            let option = {
                grid: {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    // width:"auto", //图例宽度
                    // height:"100%", //图例高度
                },
                //鼠标移入提示
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}:{c} ({d}%)',
                    confine: true,
                },
                // 标签展示
                legend: {
                    orient: 'vertical', // 水平 horizontal或者垂直 "vertical"
                    icon: 'circle', //默认为方形
                    x: 'right',
                    itemGap: 30,
                    top: 'middle',
                    align: 'left',
                    icon: 'circle',
                    data: category,
                    textStyle: {
                        fontSize: LABEL_SIZE,
                        color: '#35BCFF',
                    },
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: ['50%', '85%'], // 内径与外径大小
                        center: ['30%', '50%'],
                        avoidLabelOverlap: true,
                        // radius: '70%',
                        //设置饼状图圆心属性
                        //normal,emphasis分别对应正常情况下与悬停效果
                        label: {
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'blod',
                                },
                            },
                            position: 'center',
                            // formatter: '{b}:{d}%',
                            formatter: '{total|' + view.total + '}' + '\n\r' + '{active|All}',
                            rich: {
                                total: {
                                    fontSize: 36,
                                    fontFamily: 'HelveticaNeue-Bold',
                                    color: '#EBFEFF',
                                    // lineHeight: 32,
                                },
                                active: {
                                    fontFamily: 'HelveticaNeue',
                                    fontSize: 13,
                                    color: '#71A7F4',
                                    // lineHeight: 32,
                                },
                            },
                        },

                        labelLine: {
                            smooth: 0.8,
                            normal: {
                                show: true,
                                length: 10,
                                lineStyle: {
                                    color: '#2496f5',
                                },
                            },
                        },

                        itemStyle: {
                            //返回颜色
                            color: function (params) {
                                var colorList = [
                                    {
                                        c1: '#FCCB2D', //going
                                        c2: '#FF7527',
                                    },
                                    {
                                        c1: '#45CBFF', //users
                                        c2: '#219CFF',
                                    },
                                    {
                                        c1: '#FFB1E5', //builds
                                        c2: '#FF50BF',
                                    },
                                ];
                                return new view.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                    {
                                        //颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上

                                        offset: 0,
                                        color: colorList[params.dataIndex].c1,
                                    },
                                    {
                                        offset: 1,
                                        color: colorList[params.dataIndex].c2,
                                    },
                                ]);
                            },
                            borderRadius: 10,
                            borderColor: '#112539',
                            borderWidth: 2,
                        },

                        data: surveyDatas,
                    },
                ],
            };

            this.chartSurvey.setOption(option);
            this.chartSurvey.hideLoading();
            window.addEventListener('resize', () => {
                this.chartSurvey.resize();
            });
        },
        showExportDialog() {
            //调服务
            this.$refs.exportDesign.setParams(this.dataParams);
            this.$refs.exportDesign.CompPopuTopo.show = true;
            this.$refs.exportDesign.show = true;
        },
    },
};
</script>

<style lang="scss" scoped>
@import './DesignResource.scss';
</style>
