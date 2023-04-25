<template>
    <popup :popupObj="popupInfo" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div class="bind-AZ">
                <div class="bind-AZ-main">
                    <div class="bind-AZ-main-list">
                        <div v-for="(item,index) in graphics" :key="index" @click="nodeClick(item)" :title="item.graphic.attributes.resName">
                            <div class="bind-AZ-main-list-body-item">
                                <img :src="`oss_core/edesign/assets/image/map/new-layer/${item.resType}.png`">
                                <span>
                                    {{ item.graphic.attributes.resName }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="bind-AZ-main-content">
                        <div class="bind-AZ-main-content-success" v-if="selectGraphic.aList.length > 0 && selectGraphic.zList.length > 0">
                            <div class="a-point-content">
                                <div class="a-point-content-title">{{ $t('OSP_CLICK_BIND_START_POINT') }}</div>
                                <div class="a-point-content-list">
                                    <div v-for="(item,index) in selectGraphic.aList" :key="index" class="a-point-content-list-item">
                                        <input type="radio" name="aRadios" v-model="Achecks" :value="item.attributes.gisKey">
                                        <span :title="item.attributes.resName">{{ item.attributes.resName }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="switch-btn-container">
                                <button @click="changeAZ"><span class="icon_osp icon_ospswitch"></span></button>
                            </div>
                            <div class="z-point-content">
                                <div class="z-point-content-title">{{ $t('OSP_CLICK_BIND_END_POINT') }}</div>
                                <div class="z-point-content-list">
                                    <div v-for="(item,index) in selectGraphic.zList" :key="index" class="z-point-content-list-item">
                                        <input type="radio" name="zRadios" v-model="Zchecks" :value="item.attributes.gisKey">
                                        <span :title="item.attributes.resName">{{ item.attributes.resName }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <span>{{ $t('OSP_CLICK_BIND_NOT_EXIST') }}</span>
                        </div>
                    </div>
                </div>
                <div class="bind-AZ-footer">

                </div>
            </div>
        </template>
    </popup>
</template>

<script>
import * as map from 'map';

export default {
    name: 'bindAZ',
    data() {
        return {
            selectGraphic: {
                aList: [],
                zList: [],
            },
            popupInfo: {
                title: this.$t('OSP_CLICK_BIND_BIND_POINT'), // 弹框标题
                ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CANCEL'), // 取消按钮内容
                modal: true, // 是否蒙层
                width: '800px', // 宽
                height: 'auto', // 高
                show: false,
                drag: true, //是否拖拽
                zIndex: 10,
            },
            Achecks: '',
            Zchecks: '',
            active: 'A',
            graphics: [],
            graphic: [],
            Alists: [],
            Zlists: [],
        };
    },
    props: {},
    computed: {},
    methods: {
        initData() {
            this.graphics = [];
            this.selectGraphic = {
                aList: [],
                zList: [],
            };
            for (let i = 0; i < this.graphic.length; i++) {
                let tempAList = this.Alists[i];
                let tempZList = this.Zlists[i];
                let graph = this.graphic[i];
                if (tempAList.length > 0 && tempZList.length > 0) {
                    let AchecksObj = tempAList[0];
                    let ZchecksObj = tempZList[0];
                    graph.attributes.aGisKey = AchecksObj.attributes.gisKey;
                    graph.attributes.zGisKey = ZchecksObj.attributes.gisKey;
                    graph.attributes.aLayerNo = AchecksObj.layerNo;
                    graph.attributes.zLayerNo = ZchecksObj.layerNo;
                }
                this.graphics.push({
                    aList: tempAList,
                    zList: tempZList,
                    graphic: graph,
                    resType: graph.layerNo.substr(0, graph.layerNo.length - 2),
                    selectAObj: tempAList[0],
                    selectZObj: tempZList[0],
                });
            }
            this.selectGraphic = this.graphics[0];
            this.Achecks = this.graphics[0].graphic.attributes.aGisKey;
            this.Zchecks = this.graphics[0].graphic.attributes.zGisKey;
        },
        popupClose() {
            this.popupInfo.show = false;
        },
        nodeClick(item) {
            this.selectGraphic = item;
            this.Achecks = this.selectGraphic.graphic.attributes.aGisKey;
            this.Zchecks = this.selectGraphic.graphic.attributes.zGisKey;
        },
        popupOk() {
            let promiseList = [];
            this.graphics.forEach(graphicObj => {
                if (graphicObj.aList.length > 0 && graphicObj.zList.length > 0) {
                    let graph = graphicObj.graphic;
                    let [coordinates] = graph.geometry.paths;
                    coordinates[0] = [graphicObj.selectAObj.geometry.x, graphicObj.selectAObj.geometry.y, 0];
                    coordinates.pop();
                    coordinates.push([graphicObj.selectZObj.geometry.x, graphicObj.selectZObj.geometry.y, 0]);
                    graph.geometry.paths = [coordinates];
                    promiseList.push(this.okAction(graph));
                }
            });
            Promise.all(promiseList).then(results => {
                fish.toast('success', this.$t('BIND_SUCCESS'));
                this.popupInfo.show = false;
                this.$root.$emit('afterBindAZ');
            });
        },
        okAction(graph) {
            return new Promise((resolve, reject) => {
                this.$map.editAttributeById(graph.layerNo, graph).then(res => {
                    this.$map.updateGeometryById(graph.layerNo, graph).then(res => {
                        this.$parent.mapBox.refreshLayer(graph.layerNo);
                        resolve();
                    });
                });
            });
        },
        changeAZ() {
            let tempGraph = this.selectGraphic;
            let tempAZList = tempGraph.zList;
            tempGraph.zList = tempGraph.aList;
            tempGraph.aList = tempAZList;
            this.selectGraphic = tempGraph;
            let tempAZChecks = this.Achecks;
            this.Achecks = this.Zchecks;
            this.Zchecks = tempAZChecks;
            let graph = this.selectGraphic.graphic;
            let tempAGisKey = graph.attributes.aGisKey;
            let tempAZLayerNo = graph.attributes.aLayerNo;
            graph.attributes.aGisKey = graph.attributes.zGisKey;
            graph.attributes.aLayerNo = graph.attributes.zLayerNo;
            graph.attributes.zGisKey = tempAGisKey;
            graph.attributes.zLayerNo = tempAZLayerNo;
            graph.geometry.setPaths(map.GeometryUtils.reversePath(graph.geometry.getPaths()));
            for (let i = 0; i < this.graphics.length; i++) {
                if (graph.attributes.gisKey === this.graphics[i].graphic.attributes.gisKey) {
                    this.graphics[i].graphic = graph;
                }
            }
        },
    },
    watch: {
        Achecks(newVal, oldVal) {
            let graph = this.selectGraphic.graphic;
            if (this.selectGraphic.aList.length > 0) {
                let AchecksObj = this.selectGraphic.aList.find(item => item.attributes.gisKey === newVal);
                graph.attributes.aGisKey = AchecksObj.attributes.gisKey;
                graph.attributes.aLayerNo = AchecksObj.layerNo;
                for (let i = 0; i < this.graphics.length; i++) {
                    if (graph.attributes.gisKey === this.graphics[i].graphic.attributes.gisKey) {
                        this.graphics[i].graphic = graph;
                        this.graphics[i].selectAObj = AchecksObj;
                    }
                }
            }
        },
        Zchecks(newVal, oldVal) {
            let graph = this.selectGraphic.graphic;
            let ZchecksObj = this.selectGraphic.zList.find(item => item.attributes.gisKey === newVal);
            graph.attributes.zGisKey = ZchecksObj.attributes.gisKey;
            graph.attributes.zLayerNo = ZchecksObj.layerNo;
            for (let i = 0; i < this.graphics.length; i++) {
                if (graph.attributes.gisKey === this.graphics[i].graphic.attributes.gisKey) {
                    this.graphics[i].graphic = graph;
                    this.graphics[i].selectZObj = ZchecksObj;
                }
            }
        },
    },
};
</script>
<style scoped lang="scss">
@import './bindAZ.scss';
</style>
