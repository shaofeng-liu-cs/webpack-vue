<template>
    <div id="main-container">
        <div class="button-history-left" @click="getData('')">Back</div>
        <div class="button-history-right" @click="historyBtnClick">History Statistics</div>
        <HistoryStatistics ref="historyStatistics"></HistoryStatistics>
        <div id="dashboardMap"></div>
    </div>
</template>

<script>
import HistoryStatistics from '../HistoryStatistics.vue';

export default {
    name: 'Map',
    components: {
        HistoryStatistics,
    },
    data() {
        return {
            mapData: [],
        };
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            this.dashboardMap = this.$echarts.init(document.getElementById('dashboardMap'), 'dark');
            window.addEventListener('resize', () => {
                this.dashboardMap.resize();
            });
            this.getData();
        },
        loadMap(data, centroid) {
            this.$echarts.registerMap('China', data);
            let echarts = this.$echarts;
            let option = {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                tooltip: {
                    formatter: function (params, ticket, callback) {
                        let value = params.data.detailedData;
                        setTimeout(function () {
                            let myChart = echarts.init(document.getElementById('ebox'), 'dark');
                            let option;
                            option = {
                                backgroundColor: 'rgba(0, 0, 0, 0)',
                                grid: {
                                    top: '20px',
                                    bottom: '20px',
                                    left: '60px',
                                    right: '60px',
                                    // width:"auto", //图例宽度
                                    // height:"100%", //图例高度
                                },
                                series: [
                                    {
                                        name: '访问来源',
                                        type: 'pie',
                                        label: {
                                            normal: {
                                                show: true,
                                                textStyle: {
                                                    fontSize: '18',
                                                    fontWeight: 'blod',
                                                    color: '#ffffff',
                                                    fontFamily: 'HelveticaNeue-Bold',
                                                },
                                                formatter: '{b}:{c}',
                                            },
                                        },
                                        data: value,
                                    },
                                ],
                            };
                            option && myChart.setOption(option);
                        }, 100);
                        return '<div id="ebox" style="width:400px; height:300px;" class="ebox"></div>';
                    },
                },
                visualMap: {
                    min: 0,
                    max: 1500,
                    left: 'left',
                    top: 'bottom',
                    text: ['高', '低'],
                    inRange: {
                        color: ['#96aec6', '#1B8AC8'],
                    },
                    show: false,
                },
                geo: {
                    map: 'China',
                    roam: true,
                    scaleLimit: {
                        //滚轮缩放的极限控制
                        min: 1,
                        max: 30,
                    },
                    center: centroid,
                    zoom: 1.2,
                    label: {
                        normal: {
                            show: true,
                            fontSize: '10',
                            color: 'rgba(255,255,255,0.7)',
                        },
                    },
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                        },
                        emphasis: {
                            areaColor: '#F3B329',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 20,
                            borderWidth: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
                series: [
                    {
                        name: 'China',
                        type: 'map',
                        geoIndex: 0,
                        data: this.mapData,
                    },
                ],
            };
            this.dashboardMap.setOption(option);
            this.dashboardMap.on('click', params => {
                this.getData(params.data);
            });
        },
        getData(data) {
            let url = '';
            this.mapData = [];
            let center;
            if (data) {
                if (data.level === 'province') {
                    url = `oss_core/edesign/assets/geoJson/100000/${data.adcode}.geoJson`;
                    center = data.center;
                } else if (data.level === 'city') {
                    return;
                } else if (data.level === 'district') {
                    return;
                }
            } else {
                url = 'oss_core/edesign/assets/geoJson/100000.geoJson';
                center = [108.92, 34.54];
            }
            this.axios.get(url).then(response => {
                response.data.features.forEach(item => {
                    this.mapData.push({
                        name: item.properties.name,
                        adcode: item.properties.adcode,
                        value: item.properties.adcode,
                        detailedData: this.getValue(item.properties.adcode),
                        level: item.properties.level,
                        center: item.properties.centroid,
                    });
                });
                this.loadMap(response.data);
            });
        },
        getValue(adcode) {
            return [
                { value: 40, name: 'Manhole' },
                { value: 38, name: 'OLT' },
                { value: 32, name: 'OCC' },
                { value: 30, name: 'ODB' },
                { value: 28, name: 'Site' },
                { value: 26, name: 'Splitter' },
                { value: 22, name: 'ODF' },
                { value: 18, name: 'ONU' },
            ];
        },
        historyBtnClick() {
            //调服务
            this.$refs.historyStatistics.CompPopuTopo.show = true;
            this.$refs.historyStatistics.show = true;
            this.$refs.historyStatistics.draw();
        },
    },
};
</script>

<style scoped lang="scss">
@import './Map.scss';
</style>
