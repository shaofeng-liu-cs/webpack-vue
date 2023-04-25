<template>
    <Popup :popupObj="popupResult" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div v-if="errorMessage" class="errorMessage">
                <Panel :panelFooter="false">
                    <template v-slot:title>
                        <h5>{{$t('DESIGN_CHECK_ERROR_MSG')}}</h5>
                    </template>
                    <template v-slot:body>
                        <label class="control-label">{{errorMessage}}</label>
                    </template>
                </Panel>
            </div>
            <div v-else class="gridDiv">
                <Grid :data="gridData" :option="gridOption" @onSelectRow="slect" id="gridIDDesignCheckResult" @onDblClickRow="onDblClickRow" ref="gridRefDesignCheckResult">
                    <grid-column :label="$t('DESIGN_CHECK_RESOURCE_NAME')" prop="resName"></grid-column>
                    <grid-column :label="$t('DESIGN_CHECK_RESOURCE_SPE')" prop="resType"></grid-column>
                    <grid-column :label="$t('DESIGN_CHECK_RESOURCE_STATUS')" prop="resStatus"></grid-column>
                    <grid-column :label="extendLabel" prop="resExtendDesc" v-if="extendLabel"></grid-column>
                    <grid-column label="" width="50px">
                        <template slot-scope="{ row }">
                            <div class="icon_osp icon_osplocate" title="Locate" @click="onDblClickRow(row)"></div>
                        </template>
                    </grid-column>
                </Grid>
            </div>

        </template>
    </Popup>
</template>

<script>
import ResHandler from '@/oss_core/edesign/osp/domain/ResHandler';
import { repairLngData } from '../../map-control/map-control-api';
import { GeometryType } from 'map';
export default {
    name: 'ViewResult',
    mixins: [ResHandler],
    inject: ['getMapBox'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
    },
    props: {
        appendEl: {},
        errorMessage: {
            type: String,
            default: '',
        },
        checkResult: {
            type: Array,
            default: [],
        },
    },
    data() {
        return {
            popupResult: {
                title: this.$t('DESIGN_CHECK_VIEW_RESULT'), // 弹框标题
                // ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CLOSE'), // 取消按钮内容
                modal: false, // 是否蒙层
                width: '600', // 宽
                height: 'auto', // 高
                left: '30%',
                top: '20%',
                show: false,
                drag: true,
                zIndex: 3,
                resize: 'both',
            },
            gridData: [],

            gridOption: {},
            extendLabel: '',
            singleItem: [],
        };
    },
    created() {
        if (this.appendEl) {
            this.popupResult.el = this.appendEl;
        }
    },
    mounted() {},

    methods: {
        initGridData(resultList, item) {
            let gridData = [];
            this.extendLabel = '';
            this.singleItem = item;
            resultList.forEach(result => {
                let obj = {
                    resId: result.attributes.resId,
                    resName: result.attributes.resName,
                    resNo: result.attributes.resNo,
                    resStatus: result.attributes.resStatus,
                    layerNo: result.layerNo,
                    resType: this.getResTypeIdByLayerNo(result.layerNo),
                    geometry: result.geometry,
                    graId: result.id,
                    attributes: result.attributes,
                    resExtendDesc: result.attributes.resExtendDesc,
                };
                this.extendLabel = result.attributes.resExtendCode;

                gridData.push(obj);
            });
            this.gridData = gridData;
        },
        slect(row, index) {},
        onDblClickRow(row, index) {
            this.mapBox.clear();
            if (row && row.geometry) {
                this.centerGeo(row);
            }
        },
        centerGeo(row) {
            let geo = row.geometry;
            let geos = [];
            let graphic;
            let selectTool = this.mapBox.getSelectTool();
            if (geo.geometryType === GeometryType.POINT) {
                let pointGeo = this.mapBox.createPoint(geo.x, geo.y);
                graphic = new this.$map.Graphic(row.graId, row.layerNo, pointGeo, null, row.attributes);
                geos.push(geo);
            } else if (geo.geometryType === GeometryType.POLYLINE) {
                let paths = geo.paths;
                let polyGeo = this.mapBox.createLineGeometry(paths);
                graphic = new this.$map.Graphic(row.graId, row.layerNo, polyGeo, null, row.attributes);
                geos.push(polyGeo);
            } else if (geo.geometryType === GeometryType.POLYGON) {
                let paths = geo.rings;
                let polyGeo = this.mapBox.createPolygonGeometry(paths);
                graphic = new this.$map.Graphic(row.graId, row.layerNo, polyGeo, null, row.attributes);
                geos.push(polyGeo);
            }
            if (geos.length > 0) {
                this.mapBox.centerGeometries(geos);

                setTimeout(() => {
                    selectTool.setSelected([graphic]);
                    this.$emit('map-selection', [graphic]);
                }, 1000);
            }
        },
        popupClose() {
            this.popupResult.show = false;
            this.extendLabel = '';
        },

        popupOk() {
            repairLngData(this.singleItem.resultList).then(result => {
                this.singleItem.resultList = [];
                fish.success(this.$t('OPERATION_SUCCESS'));
                this.popupResult.show = false;
                this.extendLabel = '';
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.gridDiv {
    min-height: 300px;
    /deep/ .icon_osplocate {
        color: #6594e4;
    }
}
</style>