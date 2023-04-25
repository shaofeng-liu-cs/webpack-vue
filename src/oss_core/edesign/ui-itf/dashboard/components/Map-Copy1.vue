<template>
    <div id="main-container">
        <button @click="getData('')">Back</button>
        <div id="dashboardMap">
        </div>
    </div>
</template>

<script>

export default {
    name: "Map",
    data() {
        return {
            mapData: []
        }
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            this.dashboardMap = this.$echarts.init(document.getElementById('dashboardMap'));
            this.getData();
        },
        loadMap(data) {
            this.$echarts.registerMap('test', data);
            let option = {
                series: [{
                    map: "test",
                    type: "map",
                    selectedMode: 'single',//选择类型,
                    hoverable: false,//鼠标经过高亮
                    roam: true,//鼠标滚轮缩放
                    label: {
                        normal: {
                            show: true, //显示省份标签
                            textStyle: {
                                color: "blue"
                            } //省份标签字体颜色
                        },
                        emphasis: { //对应的鼠标悬浮效果
                            show: false,
                            textStyle: {
                                color: "#800080"
                            }
                        }
                    },
                    aspectScale: 0.75,
                    zoom: 1.2,
                    itemStyle: {
                        normal: {
                            borderWidth: .5, //区域边框宽度
                            borderColor: '#009fe8', //区域边框颜色
                            areaColor: "#ffefd5", //区域颜色
                        },
                        emphasis: {
                            borderWidth: .5,
                            borderColor: '#4b0082',
                            areaColor: "#ffdead",
                        }
                    },
                    data: this.mapData,
                    // dataRange: {
                    //     x: '-1000 px', //图例横轴位置
                    //     y: '-1000 px', //图例纵轴位置
                    //     splitList: [
                    //         {start: 110000, end: 11000, label: '北京', color: '#cfc5de'},
                    //         {start: 120000, end: 120000, label: '天津', color: '#f1ebd1'},
                    //         {start: 130000, end: 130000, label: '上海', color: '#feffdb'},
                    //         {start: 140000, end: 140000, label: '重庆', color: '#e0cee4'},
                    //         {start: 150000, end: 150000, label: '河北', color: '#fde8cd'},
                    //         {start: 160000, end: 160000, label: '河南', color: '#e4f1d7'},
                    //         {start: 170000, end: 170000, label: '云南', color: '#fffed7'},
                    //         {start: 180000, end: 180000, label: '辽宁', color: '#e4f1d7'},
                    //         {start: 190000, end: 190000, label: '黑龙江', color: '#e4f1d7'},
                    //         {start: 10, end: 10, label: '湖南', color: '#fffed7'},
                    //         {start: 11, end: 11, label: '安徽', color: '#fffed8'},
                    //         {start: 12, end: 12, label: '山东', color: '#dccee7'},
                    //         {start: 13, end: 13, label: '新疆', color: '#fffed7'},
                    //         {start: 14, end: 14, label: '江苏', color: '#fce8cd'},
                    //         {start: 15, end: 15, label: '浙江', color: '#ddceeb'},
                    //         {start: 16, end: 16, label: '江西', color: '#e4f1d3'},
                    //         {start: 17, end: 17, label: '湖北', color: '#fde8cd'},
                    //         {start: 18, end: 18, label: '广西', color: '#fde8cd'},
                    //         {start: 19, end: 19, label: '甘肃', color: '#fde8cd'},
                    //         {start: 20, end: 20, label: '山西', color: '#fffdd6'},
                    //         {start: 21, end: 21, label: '内蒙古', color: '#ddcfe6'},
                    //         {start: 22, end: 22, label: '陕西', color: '#fad8e9'},
                    //         {start: 23, end: 23, label: '吉林', color: '#fce8cd'},
                    //         {start: 24, end: 24, label: '福建', color: '#fad8e8'},
                    //         {start: 25, end: 25, label: '贵州', color: '#fad8e8'},
                    //         {start: 26, end: 26, label: '广东', color: '#ddcfe8'},
                    //         {start: 27, end: 27, label: '青海', color: '#fad8e9'},
                    //         {start: 28, end: 28, label: '西藏', color: '#ddcfe6'},
                    //         {start: 29, end: 29, label: '四川', color: '#e4f1d5'},
                    //         {start: 30, end: 30, label: '宁夏', color: '#fefcd5'},
                    //         {start: 31, end: 31, label: '海南', color: '#fad8e9'},
                    //         {start: 32, end: 32, label: '台湾', color: '#fce8cd'},
                    //         {start: 33, end: 33, label: '香港', color: '#dc9bbb'},
                    //         {start: 34, end: 34, label: '澳门', color: '#e0f7cc'}
                    //     ]
                    // }, //各省地图颜色；start：值域开始值；end：值域结束值；label：图例名称；color：自定义颜色值；
                }]
            };
            this.dashboardMap.setOption(option);
            this.dashboardMap.on('click', (params) => {
                this.getData(params.data)
            })
        },
        getData(data) {
            let url = '';
            this.mapData = [];
            if (data) {
                if (data.level === 'province') {
                    url = `./geoJson/100000/${data.adcode}.geoJson`;
                } else if (data.level === 'city') {
                    return;
                } else if (data.level === "district") {
                    return;
                }
            } else {
                url = './geoJson/100000.geoJson'
            }
            this.axios.get(url).then(response => {
                response.data.features.forEach((item) => {
                    this.mapData.push({
                        name: item.properties.name,
                        adcode: item.properties.adcode,
                        value: parseInt(item.properties.adcode),
                        level: item.properties.level
                    });
                })
                this.loadMap(response.data);
            })
        }
    }
}
</script>

<style scoped lang="scss">
#main-container, #dashboardMap {
    height: 100%;
    width: 100%;
}
</style>
