<template>
    <div id="history" class="edesign-task">
        <!-- <div class="left-panel"> -->
        <div class="home-panel">
            <div class="home-panel-heading">
                <div class="line"></div>
                <div><label class="home-panel-title">Designing Tasks</label></div>
                <div>
                    <div class="view-all" @click="showExportDialog"> View All </div>
                </div>
            </div>
            <div class="home-panel-body">
                <div class="chart-content" id="chartTask"></div>
                <div class="chart-content" id="chartState"></div>
            </div>
        </div>
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
        };
    },
    mounted() {
        this.chartTask = null;
        this.chartTask = this.$echarts.init(document.getElementById('chartTask'));
        // this.chartTask = this.$echarts.init(document.getElementById('chartTask'), null, {renderer: 'svg'});
        this.chartState = null;
        this.chartState = this.$echarts.init(document.getElementById('chartState'));
        // this.chartState = this.$echarts.init(document.getElementById('chartState'), null, {renderer: 'svg'});

        this.axios.get('edesign/sprint/statistics/designing/v1').then(response => {
            this.dataParams = response.data;
            this.chartTask.showLoading();
            this.chartState.showLoading();

            let hld = 0;
            let lld = 0;
            let syn = 0;
            response.data.FLOW.forEach(element => {
                if (element.flowState === 'HLD') {
                    hld = element.flowNum;
                }
                if (element.flowState === 'LLD') {
                    lld = element.flowNum;
                }
                if (element.flowState === 'SYN') {
                    syn = element.flowNum;
                }
            });
            var colorList = ['#FFDA14', '#29A0FA', '#DC2F9C'];
            let pieData = [
                {
                    value: 10,
                    name: 'HLD',
                    itemStyle: {
                        normal: {
                            shadowBlur: 8,
                            shadowColor: colorList[0],
                        },
                    },
                },
                {
                    value: 10,
                    name: 'LLD',
                    itemStyle: {
                        normal: {
                            shadowBlur: 8,
                            shadowColor: colorList[1],
                        },
                    },
                },
                // { value: syn, name: 'Syn' },
                {
                    value: 10,
                    name: 'Syn',
                    itemStyle: {
                        normal: {
                            shadowBlur: 8,
                            shadowColor: colorList[2],
                        },
                    },
                    selected: true,
                },
            ];

            let taskStateDatas = response.data.TASK;
            let normal = 0;
            let delay = 0;
            let about = 0;
            taskStateDatas.forEach(element => {
                if (element.taskState === 'DELAY') {
                    delay = element.taskNum;
                }
                if (element.taskState === 'ABOUT') {
                    about = element.taskNum;
                }
                if (element.taskState === 'NORMAL') {
                    normal = element.taskNum;
                }
            });

            this.drawPieFlow(pieData);

            // let lldDatas = [response.data.HIS_LLD_CTC.resNum, response.data.HIS_LLD_LINK.resNum, response.data.HIS_LLD_PTC.resNum];
            let lldDatas = [1, 4, 9];
            this.drawStatePie([normal, delay, about]);
        });
    },
    methods: {
        isShow(resType) {
            return (
                'OLT' === resType ||
                'ODF' === resType ||
                'OCC' === resType ||
                'SPLITTER' === resType ||
                'ODB' === resType ||
                'MANHOLE' === resType ||
                'RENT_FAC_SECT' === resType
            );
        },
        drawPieFlow: function (pieData) {
            var view = this;
            this.chartTask.setOption({
                title: {
                    text: 'By Flow State',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        color: '#71A7F4',
                        fontSize: 15,
                    },
                },
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
                    orient: 'horizontal', // 水平或者垂直 "vertical"
                    icon: 'circle', //默认为方形
                    x: 'center',
                    y: 'bottom', // 位置
                    data: ['HLD', 'LLD', 'Syn'],
                    textStyle: {
                        fontSize: LABEL_SIZE,
                        color: '#4E78AF',
                    },
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: ['35%', '60%'], // 内径与外径大小
                        center: ['50%', '44%'],
                        avoidLabelOverlap: true,
                        // radius: '70%',
                        //设置饼状图圆心属性
                        //normal,emphasis分别对应正常情况下与悬停效果
                        label: {
                            normal: {
                                show: true,
                                textStyle: {
                                    fontSize: '18',
                                    fontWeight: 'blod',
                                    color: '#71A7F4',
                                    fontFamily: 'HelveticaNeue-Bold',
                                },
                                formatter: '{c}',
                            },
                            // position: 'center',
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
                                        c1: '#FFDA14', //HLD
                                        c2: '#FA9105',
                                    },
                                    {
                                        c1: '#29A0FA', //LLD
                                        c2: '#00F0FE',
                                    },
                                    {
                                        c1: '#DC2F9C', //Syn
                                        c2: '#FE84D2',
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
                        },

                        data: pieData,
                    },
                ],
            });
            this.chartTask.hideLoading();
            window.addEventListener('resize', () => {
                this.chartTask.resize();
            });
        },

        drawStatePie: function (nums) {
            var view = this;
            var category = ['Normal', 'Delayed', 'About to delay'];
            const VALUE = nums; //每个柱子的值
            const VALUE1 = [
                {
                    //每个柱子的颜色（可自行改变颜色）
                    value: nums[0],
                    itemStyle: {
                        color: 'rgba(0,176,255,1.0)',
                    },
                },
                {
                    value: nums[1],
                    itemStyle: {
                        color: 'rgba(243,13,150,1.0)',
                    },
                },
                {
                    value: nums[2],
                    itemStyle: {
                        color: 'rgba(255,93,0,1.0)',
                    },
                },
            ];
            // 绘制左侧面
            const CubeLeft = this.$echarts.graphic.extendShape({
                shape: {
                    x: 0,
                    y: 0,
                },
                buildPath: function (ctx, shape) {
                    // 会canvas的应该都能看得懂，shape是从custom传入的
                    const xAxisPoint = shape.xAxisPoint;
                    const c0 = [shape.x, shape.y];
                    const c1 = [shape.x - 13, shape.y - 13];
                    const c2 = [xAxisPoint[0] - 13, xAxisPoint[1] - 13];
                    const c3 = [xAxisPoint[0], xAxisPoint[1]];
                    ctx.moveTo(c0[0], c0[1]).lineTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).closePath();
                },
            });
            // 绘制右侧面
            const CubeRight = this.$echarts.graphic.extendShape({
                shape: {
                    x: 0,
                    y: 0,
                },
                buildPath: function (ctx, shape) {
                    const xAxisPoint = shape.xAxisPoint;
                    const c1 = [shape.x, shape.y];
                    const c2 = [xAxisPoint[0], xAxisPoint[1]];
                    const c3 = [xAxisPoint[0] + 18, xAxisPoint[1] - 9];
                    const c4 = [shape.x + 18, shape.y - 9];
                    ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
                },
            });
            // 绘制顶面
            const CubeTop = this.$echarts.graphic.extendShape({
                shape: {
                    x: 0,
                    y: 0,
                },
                buildPath: function (ctx, shape) {
                    const c1 = [shape.x, shape.y];
                    const c2 = [shape.x + 18, shape.y - 9];
                    const c3 = [shape.x + 5, shape.y - 22];
                    const c4 = [shape.x - 13, shape.y - 13];
                    ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
                },
            });
            // 注册三个面图形
            this.$echarts.graphic.registerShape('CubeLeft', CubeLeft);
            this.$echarts.graphic.registerShape('CubeRight', CubeRight);
            this.$echarts.graphic.registerShape('CubeTop', CubeTop);

            var option = {
                backgroundColor: 'transparent',
                title: {
                    text: 'By Timeline State',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        color: '#71A7F4',
                        fontSize: 15,
                    },
                },
                grid: {
                    //图表的上下左右的距离
                    left: '1%',
                    right: '4%',
                    bottom: '10%',
                    top: '20%',
                    padding: '0 0 0 0',
                    containLabel: true,
                },
                xAxis: {
                    //x轴的样式设置
                    type: 'category',
                    data: category,
                    nameGap: 30,
                    axisLine: {
                        show: false,
                    },
                    offset: 20,
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        interval: 0,
                        margin: 0,
                        textStyle: {
                            color: '#71A7F4',
                            fontStyle: 'normal',
                            // fontFamily: 'HelveticaNeue',
                            fontSize: 12,
                        },
                    },
                },
                yAxis: {
                    //y轴的样式设置
                    type: 'value',
                    axisLine: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    boundaryGap: false,
                },
                series: [
                    {
                        type: 'custom',
                        renderItem: (params, api) => {
                            const location = api.coord([api.value(0), api.value(1)]);
                            return {
                                type: 'group',
                                children: [
                                    {
                                        type: 'CubeLeft',
                                        shape: {
                                            api,
                                            xValue: api.value(0),
                                            yValue: api.value(1),
                                            x: location[0],
                                            y: location[1],
                                            xAxisPoint: api.coord([api.value(0), 0]),
                                        },
                                        style: {
                                            fill: new view.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                {
                                                    offset: 0,
                                                    color: api.style().fill,
                                                },
                                                {
                                                    offset: 1,
                                                    color: 'rgba(210, 218, 226,1.0)',
                                                },
                                            ]),
                                        },
                                    },
                                    {
                                        type: 'CubeRight',
                                        shape: {
                                            api,
                                            xValue: api.value(0),
                                            yValue: api.value(1),
                                            x: location[0],
                                            y: location[1],
                                            xAxisPoint: api.coord([api.value(0), 0]),
                                        },
                                        style: {
                                            fill: new view.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                {
                                                    offset: 0,
                                                    color: api.style().fill,
                                                },
                                                {
                                                    offset: 1,
                                                    color: 'rgba(210, 218, 226,1.0)',
                                                },
                                            ]),
                                        },
                                    },
                                    {
                                        type: 'CubeTop',
                                        shape: {
                                            api,
                                            xValue: api.value(0),
                                            yValue: api.value(1),
                                            x: location[0],
                                            y: location[1],
                                            xAxisPoint: api.coord([api.value(0), 0]),
                                        },
                                        style: {
                                            fill: new view.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                {
                                                    offset: 0,
                                                    color: api.style().fill,
                                                },
                                                {
                                                    offset: 1,
                                                    color: api.style().fill,
                                                },
                                            ]),
                                        },
                                    },
                                ],
                            };
                        },
                        data: VALUE1,
                    },
                    {
                        type: 'bar',
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                fontSize: 13,
                                color: '#fff',
                                // offset: [2, -25],
                                formatter: '{c}',
                            },
                        },
                        itemStyle: {
                            color: 'transparent',
                        },
                        tooltip: {},
                        data: VALUE,
                    },
                ],
            };
            this.chartState.setOption(option);
            this.chartState.hideLoading();
            window.addEventListener('resize', () => {
                this.chartState.resize();
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
@import './DesignTask.scss';
</style>
