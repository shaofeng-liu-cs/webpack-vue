<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <div class="selection-body-cont">
                <div class="selection-body" :class="['cableStretch'].indexOf(topoName) > -1 ? 'noBorder' : ''">
                    <div>
                        <component ref="dynamicComp" :mapNo="projectInfo.mapNo" :is="topoName" v-model="resId" :params="resInfo" :res-data="resData" :graphic="graphic" :projectInfo="projectInfo" :functionData="functionData" @close="popupClose" @openDeviceInnerDesign='openDeviceInnerDesign'></component>
                    </div>
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import CableTopo from '../sectionalView/cableTopo/CableTopo.vue';
import ManholeTopo from '../sectionalView//manholeTopo/ManholeTopo.vue';
import PipelineTopo from '../sectionalView//pipelineTopo/PipelineTopo.vue';
import PoleTopo from '../sectionalView//poleTopo/PoleTopo.vue';
import DeviceTopo from '../sectionalView/deviceTopo/DeviceTopo.vue';
import SiteRoomTopo from '../sectionalView/siteRoomTopo/SiteRoomTopo.vue';
import PipeLineSelectTopo from '../sectionalView/pipeLineSelectTopo/PipelineSelectTopo.vue';
import TaskDetailTopo from '../sectionalView/taskDetailTopo/TaskDetailTopo.vue';
import setBuildingStr from '../setBuildingStr/setBuildingStr.vue';
import viewBuildingStr from '../setBuildingStr/setBuildingStr.vue';
import BuildingDesignTopo from '../../../../topo/design/BuildingDesignTopo.vue';
import cableStretch from '../cableStretch/CableStretch.vue';
import ReferenceDetail from '../referenceDetail/ReferenceDetail.vue';

export default {
    name: 'resFunction',

    //import引入的组件
    components: {
        CableTopo,
        ManholeTopo,
        PipelineTopo,
        PoleTopo,
        DeviceTopo,
        SiteRoomTopo,
        PipeLineSelectTopo,
        TaskDetailTopo,
        setBuildingStr,
        viewBuildingStr,
        BuildingDesignTopo,
        cableStretch,
        ReferenceDetail,
    },
    data() {
        return {
            topoName: '',
            titleTopo: 'test',
            resId: '',
            resData: {},
            resInfo: {},
            graphic: [],
            projectInfo: {},
            CompPopuTopo: {
                title: this.$t('OSP_MAP_FUNCTION_TITLE_TOPO'), // 标题
                //ok: this.$t('OK'), // 确认按钮
                close: this.$t('CLOSE'), // 取消按钮
                // width: '1000', // 宽
                // height: '670', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 1000, //层级
                // left: 'calc(50% - 500px)',
                // top: 'calc(50% - 225px)',
                width: '80%', // 宽
                height: '80%', // 高
                el: '', // 指定插入节点
                maxHeight: '1500', //
                maxWidth: '2000',
                resize: 'both',
            },
        };
    },
    mounted() {
        console.log(this.mytest);
    },
    created() {
        console.log(this.mytest);
    },
    //方法集合
    methods: {
        setParentParam(functionData, dataInfo, projectInfo, el) {
            this.resId = dataInfo.CloudGraphic.attributes.resId; //'200617160913109970'
            this.resData = dataInfo;
            this.graphic = [dataInfo.CloudGraphic];
            this.projectInfo = projectInfo;
            this.functionData = functionData;
            this.CompPopuTopo.title = functionData.name;
            this.CompPopuTopo.width = functionData.dialogWidth || '80%';
            this.CompPopuTopo.height = functionData.dialogHeight || '80%';
            this.CompPopuTopo.el = el || '';
            this.CompPopuTopo.show = true;
            // 默认参数
            this.resInfo = {
                resId: this.resId,
                resType: dataInfo.resType,
                schemaId: this.projectInfo.schemaId,
            };
            this.resData.schemaId = this.projectInfo.schemaId;
            switch (functionData.url) {
                case 'ManholeTopo':
                    this.resData.pageType = 'SHOW';
                    break;
                case 'ManholeDesignTopo':
                    this.resData.pageType = 'DESIGN';
                    break;
                case 'PipelineDesign':
                    this.CompPopuTopo.ok = this.$t('OK');
                    break;
                case 'setBuildingStr':
                    this.CompPopuTopo.ok = this.$t('OK');
                    this.CompPopuTopo.close = this.$t('CANCEL');
                    break;
                case 'viewBuildingStr':
                    this.CompPopuTopo.ok = '';
                    this.CompPopuTopo.close = this.$t('CLOSE');
                    break;
                case 'BuildingDesignTopo':
                    this.resInfo = {
                        schemaId: this.projectInfo.schemaId,
                        resId: this.resId,
                        mapNo: this.projectInfo.mapNo,
                    };
                    this.CompPopuTopo.ok = '';
                    this.CompPopuTopo.close = '';
                    break;
                case 'cableStretch':
                    this.CompPopuTopo.ok = this.$t('SAVE');
                    this.CompPopuTopo.close = this.$t('CANCEL');
                    this.resInfo = {
                        resId: this.resId,
                        resType: dataInfo.resType,
                        schemaId: this.projectInfo.schemaId,
                    };
                    break;
                case 'ReferenceDetail':
                    this.resInfo = {
                        resId: this.resId,
                        resType: dataInfo.resType,
                        schemaId: this.projectInfo.schemaId,
                    };
                    this.CompPopuTopo.resize = 'none';
                    break;
                default:
                    break;
            }
            this.topoName = functionData.url;
            if (functionData.url === 'ManholeDesignTopo') {
                this.topoName = 'ManholeTopo'; // 'CableTopo'
            }
        },
        popupClose() {
            this.CompPopuTopo.show = false;
        },
        popupOk() {
            if (this.topoName === 'PipelineDesign' || this.topoName === 'setBuildingStr' || this.topoName === 'cableStretch') {
                this.$refs.dynamicComp.popOk();
            }
        },

        openDeviceInnerDesign(param) {
            let menuId = 'HLD-RightDesignClickToOpenLLD';
            let menuTitle = 'LLD Design-' + param.resName;
            let openParams = {
                choose: 'DeviceTopo',
                lldParams: param,
            };
            this.$root.$emit('openMenu', menuId, menuTitle, openParams);
        },
    },
};
</script>
<style lang="scss"  scoped>
@import './PopuTopo.scss';
</style>