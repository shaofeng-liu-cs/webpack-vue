<template>
    <div class="cs-block sidebar-body">
        <div class="demand-point">
            <div class="surface-type-title">{{ $t('DEMAND_POINT_POINTS_MAINTENANCE') }}</div>
            <div class="draw-type">
                <span class="draw-type-img icon_osp icon_ospshezhi1" :class="[drawPolygonFlag ? 'background-active map-icon' : 'background-deactive demand-icon-deactive']" @click="clickToDrawPolygon" :title="this.$t('DEMAND_POINT_DRAW_POLYGON')">
                </span>
                <span class="draw-type-img icon_osp icon_ospa-bianzu3" :class="[drawCircleFlag ? 'background-active map-icon' : 'background-deactive demand-icon-deactive']" @click="clickToDrawCircle"  :title="this.$t('DEMAND_POINT_DRAW_CIRCLE')">
                </span>
                <span class="draw-type-img icon_osp icon_ospa-bianzu2" :class="[selectPolygonFlag ? 'background-active map-icon' : 'background-deactive demand-icon-deactive']" @click="clickToSelect"  :title="this.$t('DEMAND_POINT_SELECT_POLYGON')">
                </span>
            </div>
            <div class="building-no demand-point-content">
                <span><label class="count-label">{{ $t('DEMAND_POINT_BUILDING_SELECTED') }}</label>
                    <label class="demandCount" id="demandCount">0</label></span>
                <span class="icon_osp icon_ospshengcheng color-active demand-point-action" @click="clickGenerate" :title="$t('DEMAND_POINT_GENERATE_DEMAND_POINT')"></span>
            </div>
            <div class="demand-no demand-point-content">
                <span><label class="count-label">{{ $t('DEMAND_POINT_DEMAND_POINTS_SELECTED') }}</label>
                    <label class="pointsCount" id="pointsCount">0</label></span>
                <span class="icon_osp icon_ospshanchu2 color-active demand-point-action" @click="deletePoints" :title="$t('DEMAND_POINT_DELETE_DEMAND_POINT')"></span>
            </div>
        </div>
    </div>
</template>
<script>
import * as EDNColor from '@/oss_core/base/map-style/default-styles.js'; // 画图样式
import * as Colors from '../../design/drawStyle.js';
import {
    nearestAccessPoint,
    CoordTransfer,
    Color,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    SupportSpatialReferences,
    GeometryType,
    Filter,
    DrawType,
} from 'map';

const lineColor = new Color(255, 0, 0);
const lineSymbol = new SimpleLineSymbol('solid', lineColor, 1);
const redCableline = new SimpleLineSymbol('solid', new Color(245, 108, 108, 1), 2);
const pointColor = new Color(255, 255, 0);
const access_point_symbol = new SimpleMarkerSymbol('circle', 10, lineSymbol, pointColor);
export default {
    name: 'DemandPoint', // resourceTree
    inject: ['getMapBox', 'getSurfaceLayerList', 'getProjectInfo', 'getControlData'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
        surfaceLayerList() {
            return this.getSurfaceLayerList();
        },
        projectInfo() {
            return this.getProjectInfo();
        },
        controlData() {
            return this.getControlData();
        },
    },
    data() {
        return {
            buildingList: [],
            demandList: [],
            roadList: [],

            pathsList: [],
            deletePointList: [],
            stopSelectListen: false,
            removeLatsPointOverlay: null,
            drawInfoOverlay: null,
            drawingPointList: [],
            drawingInfo: {
                drawType: null,
                current: 0,
                total: 0,
            },
            drawPolygonFlag: false,
            drawCircleFlag: false,
            selectPolygonFlag: false,
        };
    },
    created() {},
    mounted() {},
    activated() {
        this.initSurfaceList();
        this.$nextTick(() => {
            document.getElementById('demandCount').innerHTML = 0;
            document.getElementById('pointsCount').innerHTML = 0;
            this.drawPolygonFlag = false;
            this.drawCircleFlag = false;
            this.selectPolygonFlag = false;
            this.editFlag = false;
            this.newFlag = false;
            this.saveFlag = false;
            this.pathsList = [];
            this.deletePointList = [];
        });
    },

    deactivated() {
        this.controlData.initSelectedStatus.componentName = 'demandPoint';
        this.controlData.initSelectedStatus.rightCloseFlag = false;
    },
    watch: {},
    methods: {
        initSurfaceList() {
            this.roadList = this.surfaceLayerList.filter(surface => surface.surfaceCat === 'A0');
            this.buildingList = this.surfaceLayerList.filter(surface => surface.surfaceCat === 'A1');
            this.demandList = this.surfaceLayerList.filter(surface => surface.surfaceCat === 'A5');
        },

        clickToDrawCircle() {
            this.mapBox.clear();
            document.getElementById('demandCount').innerHTML = 0;
            document.getElementById('pointsCount').innerHTML = 0;
            fish.toast('info', this.$t('DEMAND_POINT_DRAW_CIRCLE'));
            this.drawCircle();
            this.drawPolygonFlag = false;
            this.drawCircleFlag = true;
            this.selectPolygonFlag = false;
            this.newFlag = false;
            this.saveFlag = false;
        },
        drawCircle() {
            this.mapBox.drawCircle(evt => {
                this.mapBox.clear();
                let paths = evt.geometry.getRings();
                this.pathsList = [paths];
                // this.pathsList = this.pathsList.map( path => {
                //     return path.map(coord => {
                //         let coordinate = CoordTransfer.transferProjection(evt.geometry.spatialReference, SupportSpatialReferences.WGS84, coord);
                //         return coordinate;
                //     })
                // });
                let geometry = this.mapBox.createPolygonGeometry(this.pathsList);
                let Filter = this.$map.Filter;
                let filter = Filter.intersects({
                    geometryName: 'geom',
                    geometry: geometry,
                    spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                });
                let featureLike = {
                    layerNo: (this.buildingList[0] || {}).layerNo,
                    filter: filter,
                    returnGeometry: true,
                };
                this.$map.getByFeatureLayerAndPage(featureLike, 1, 10).then(res => {
                    document.getElementById('demandCount').innerHTML = (res.page && res.page.totalRows) || 0;
                    // currentPage: 1
                    // pageSize: 10
                    // totalPages: 1540
                    // totalRows: 15394;
                    let pointGeo = this.mapBox.createPolygonGeometry([paths]);
                    let pointFilter = Filter.and(
                        Filter.intersects({
                            geometryName: 'geom',
                            geometry: pointGeo,
                            spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                        }),
                        Filter.equalTo({
                            propertyName: 'schemaId',
                            expression: this.projectInfo.schemaId,
                        })
                    );
                    let pointLike = {
                        layerNo: (this.demandList[0] || {}).layerNo,
                        filter: pointFilter,
                    };
                    this.$map
                        .getByFeatureLayer(pointLike)
                        .then(pointList => {
                            document.getElementById('pointsCount').innerHTML = pointList.length;
                            this.deletePointList = pointList;
                        })
                        .then(() => {
                            this.drawCircle();
                        });
                });
            });
        },
        clickToDrawPolygon() {
            this.mapBox.clear();
            document.getElementById('demandCount').innerHTML = 0;
            document.getElementById('pointsCount').innerHTML = 0;
            fish.toast('info', this.$t('DEMAND_POINT_DRAW_POLYGON'));
            this.drawPolygon();
            this.drawPolygonFlag = true;
            this.drawCircleFlag = false;
            this.selectPolygonFlag = false;
            this.newFlag = false;
            this.saveFlag = false;
        },
        drawPolygon() {
            this.mapBox.drawPolygon(evt => {
                this.mapBox.clear();
                let paths = evt.geometry.getRings();
                this.pathsList = paths;
                // this.pathsList = this.pathsList.map( path => {
                //     return path.map(coord => {
                //         let coordinate = CoordTransfer.transferProjection(evt.geometry.spatialReference, SupportSpatialReferences.WGS84, coord);
                //         return coordinate;
                //     })
                // });
                let geometry = this.mapBox.createPolygonGeometry(this.pathsList);
                let Filter = this.$map.Filter;
                let filter = Filter.intersects({
                    geometryName: 'geom',
                    geometry: geometry,
                    spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                });
                let featureLike = {
                    layerNo: (this.buildingList[0] || {}).layerNo,
                    filter: filter,
                };
                this.$map.getByFeatureLayerAndPage(featureLike, 1, 10).then(res => {
                    document.getElementById('demandCount').innerHTML = (res.page && res.page.totalRows) || 0;

                    let pointGeo = this.mapBox.createPolygonGeometry(paths);
                    let pointFilter = Filter.and(
                        Filter.intersects({
                            geometryName: 'geom',
                            geometry: pointGeo,
                            spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                        }),
                        Filter.equalTo({
                            propertyName: 'sprintId',
                            expression: this.projectInfo.sprintId,
                        })
                    );
                    let pointLike = {
                        layerNo: (this.demandList[0] || {}).layerNo,
                        filter: pointFilter,
                    };
                    this.$map
                        .getByFeatureLayer(pointLike)
                        .then(pointList => {
                            document.getElementById('pointsCount').innerHTML = pointList.length;
                            this.deletePointList = pointList;
                        })
                        .then(() => {
                            this.drawPolygon();
                        });
                });
            });
        },
        clickToSelect() {
            this.mapBox.clear();
            this.stopSelectListen = false;
            document.getElementById('demandCount').innerHTML = 0;
            document.getElementById('pointsCount').innerHTML = 0;
            fish.toast('info', this.$t('DEMAND_POINT_SELECT_POLYGON'));
            //this.mapBox.activeSelectByLayerNos(['ODB_GRID-C','OCC_GRID-C','OLT_GRID-C']);
            this.select();
            this.drawPolygonFlag = false;
            this.drawCircleFlag = false;
            this.selectPolygonFlag = true;
            this.newFlag = false;
            this.saveFlag = false;
        },
        select() {
            this.mapBox.activeSelectByLayerNos(['ODB_GRID-C', 'OCC_GRID-C', 'OLT_GRID-C']);
            this.mapBox.removeSelectListener(graphics => this.selectListener(graphics));
            this.mapBox.addSelectListener(graphics => this.selectListener(graphics));
        },
        selectListener(graphics) {
            this.mapBox.clear();
            let graphic = graphics[0];
            let selectTool = this.mapBox.getSelectTool();
            //selectTool.activate([this.mapBox.findServiceByType("WFSService")], [graphic.layerNo], evt => {});
            selectTool.setSelected([graphic]);

            let paths = graphic.geometry.getRings();
            this.pathsList = paths;
            // this.pathsList = this.pathsList.map( path => {
            //     return path.map(coord => {
            //         let coordinate = CoordTransfer.transferProjection(graphic.geometry.spatialReference, SupportSpatialReferences.WGS84, coord);
            //         return coordinate;
            //     })
            // });
            let geometry = this.mapBox.createPolygonGeometry(this.pathsList);
            let Filter = this.$map.Filter;
            let filter = Filter.intersects({
                geometryName: 'geom',
                geometry: geometry,
                spatialReference: SupportSpatialReferences.WEB_MERCATOR,
            });
            let featureLike = {
                layerNo: (this.buildingList[0] || {}).layerNo,
                filter: filter,
            };
            this.$map.getByFeatureLayerAndPage(featureLike, 1, 10).then(res => {
                document.getElementById('demandCount').innerHTML = (res.page && res.page.totalRows) || 0;

                let pointGeo = this.mapBox.createPolygonGeometry(paths);
                let pointFilter = Filter.and(
                    Filter.intersects({
                        geometryName: 'geom',
                        geometry: pointGeo,
                        spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                    }),
                    Filter.equalTo({
                        propertyName: 'schemaId',
                        expression: this.projectInfo.schemaId,
                    })
                );
                let pointLike = {
                    layerNo: (this.demandList[0] || {}).layerNo,
                    filter: pointFilter,
                };
                this.$map
                    .getByFeatureLayer(pointLike)
                    .then(pointList => {
                        document.getElementById('pointsCount').innerHTML = pointList.length;
                        this.deletePointList = pointList;
                        if (!this.stopSelectListen) {
                            this.select();
                        }
                    })
                    .then(() => {});
            });
        },

        getNearestPoint() {
            return new Promise((resolve, reject) => {
                if (this.roadList && this.roadList.length === 1) {
                    let geometry = this.mapBox.createPolygonGeometry(this.pathsList);
                    nearestAccessPoint({
                        geometry: geometry,
                        polygonLayerNos: this.buildingList[0] ? [this.buildingList[0].layerNo] : [],
                        lineLayerNos: this.roadList[0] ? [this.roadList[0].layerNo] : [],
                        srid: SupportSpatialReferences.WEB_MERCATOR.wkid,
                        tolerance: 5,
                    }).then(result => {
                        resolve(result);
                    });
                } else {
                    let result = [];
                    let drawGeo = this.mapBox.createPolygonGeometry(this.pathsList);
                    let pointFilter = Filter.intersects({
                        geometryName: 'geom',
                        geometry: drawGeo,
                        spatialReference: SupportSpatialReferences.WEB_MERCATOR,
                    });
                    let pointLike = {
                        layerNo: (this.buildingList[0] || {}).layerNo,
                        filter: pointFilter,
                    };
                    this.$map.getByFeatureLayer(pointLike).then(buildings => {
                        if (buildings && buildings.length > 0) {
                            buildings.forEach(build => {
                                let buildGeo;
                                if (this.buildingList[0] && this.mapBox.findLayer(this.buildingList[0].layerNo).geometryType === GeometryType.POINT) {
                                    buildGeo = build.geometry;
                                } else {
                                    buildGeo = build.geometry.getCentroid();
                                }
                                result.push({
                                    geometry: buildGeo,
                                    attributes: {
                                        id: build.attributes.id,
                                        gisKey: build.attributes.gisKey,
                                        layerNo: build.layerNo,
                                        buildingGisId: build.attributes.gisKey,
                                    },
                                });
                            });
                            resolve(result);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        },

        getAccessPoints(paths) {
            this.getNearestPoint().then(result => {
                let demandPoints = result.filter(res => (res.geometry ? true : false));
                let nameIndex = 0;
                demandPoints.forEach(point => {
                    let wgsGeo = this.mapBox
                        .createPointFromCurrentCoord(
                            [point.geometry.x, point.geometry.y],
                            SupportSpatialReferences.getSpatialReference(point.geometry.spatialReference.wkid)
                        )
                        .transferProjection(SupportSpatialReferences.WGS84);
                    nameIndex++;
                    point.layerNo = (this.demandList[0] || {}).layerNo;
                    let obj = {};
                    obj.resStatus = 'C';
                    obj.name = 'DP ' + nameIndex;
                    obj.resNo = 'DP ' + nameIndex;
                    obj.resName = 'DP ' + nameIndex;
                    obj.longitude = wgsGeo.x;
                    obj.latitude = wgsGeo.y;
                    obj.buildingGisId = point.attributes.gisKey;
                    obj.buildingLayerNo = point.attributes.layerNo;
                    obj.schemaId = this.projectInfo.schemaId;
                    obj.sprintId = this.projectInfo.sprintId;
                    point.attributes = obj;
                    point.geometry = this.mapBox.createPointFromCurrentCoord(
                        [point.geometry.x, point.geometry.y],
                        SupportSpatialReferences.getSpatialReference(point.geometry.spatialReference.wkid)
                    );
                });
                this.queryPointByBuilding(demandPoints).then(retrunObj => {
                    if (retrunObj.flagList.indexOf('false') > -1) {
                        fish.confirm(this.$t('DEMAND_POINT_EXISTS_POINT'), () => {
                            if (retrunObj.validPointList.length > 0) {
                                this.$map.batchAddGeometry(retrunObj.validPointList).then(result => {
                                    fish.success(this.$t('ADD_SUCCESS'));
                                    this.pathsList = [];
                                    //this.mapBox.refreshLayer("EDESIGN-CS-DP");
                                    document.getElementById('demandCount').innerHTML = 0;
                                    document.getElementById('pointsCount').innerHTML = 0;
                                    this.drawPolygonFlag = false;
                                    this.drawCircleFlag = false;
                                    this.selectPolygonFlag = false;
                                    this.mapBox.refresh();
                                    this.stopSelectListen = true;
                                    this.mapBox.removeSelectListener(graphics => this.selectListener(graphics));
                                    this.controlData.initSelectedStatus.componentName = 'demandPoint';
                                    this.controlData.initSelectedStatus.rightCloseFlag = false;
                                });
                            }
                        });
                    } else {
                        this.$map.batchAddGeometry(retrunObj.validPointList).then(result => {
                            fish.success(this.$t('ADD_SUCCESS'));
                            this.pathsList = [];
                            //this.mapBox.refreshLayer("EDESIGN-CS-DP");
                            document.getElementById('demandCount').innerHTML = 0;
                            document.getElementById('pointsCount').innerHTML = 0;
                            this.drawPolygonFlag = false;
                            this.drawCircleFlag = false;
                            this.selectPolygonFlag = false;
                            this.mapBox.refresh();
                            this.stopSelectListen = true;
                            this.mapBox.removeSelectListener(graphics => this.selectListener(graphics));
                            this.controlData.initSelectedStatus.componentName = 'demandPoint';
                            this.controlData.initSelectedStatus.rightCloseFlag = false;
                        });
                    }
                });
            });
        },

        queryPointByBuilding(points) {
            return new Promise(resolve => {
                let Filter = this.$map.Filter;
                let repeatDPPointFlag = ['true'];
                let count = 0;
                let returnList = [];
                points.forEach(point => {
                    let filter = Filter.and(
                        Filter.equalTo({
                            propertyName: 'building_gis_id',
                            expression: point.attributes.buildingGisId,
                        }),
                        Filter.equalTo({
                            propertyName: 'sprintId',
                            expression: this.projectInfo.sprintId,
                        })
                    );
                    let featureLayer = {
                        layerNo: (this.demandList[0] || {}).layerNo,
                        filter: filter,
                    };
                    this.$map.getByFeatureLayer(featureLayer).then(result => {
                        count++;
                        if (result && result.length > 0) {
                            repeatDPPointFlag.push('false');
                        } else {
                            returnList.push(point);
                        }
                        if (count === points.length) {
                            resolve({
                                flagList: repeatDPPointFlag,
                                validPointList: returnList,
                            });
                        }
                    });
                });
            });
        },

        clickGenerate() {
            if (this.pathsList.length > 0) {
                this.getAccessPoints(this.pathsList);
            }
        },

        deletePoints() {
            if (this.deletePointList.length > 0) {
                this.$map.batchDeleteGeometry(this.deletePointList).then(() => {
                    fish.success(this.$t('DELETE_SUCCESS'));
                    this.deletePointList = [];
                    document.getElementById('demandCount').innerHTML = 0;
                    document.getElementById('pointsCount').innerHTML = 0;
                    this.drawPolygonFlag = false;
                    this.drawCircleFlag = false;
                    this.selectPolygonFlag = false;
                    this.mapBox.refresh();
                    this.stopSelectListen = true;
                    this.mapBox.removeSelectListener(graphics => this.selectListener(graphics));
                    this.controlData.initSelectedStatus.componentName = 'demandPoint';
                    this.controlData.initSelectedStatus.rightCloseFlag = false;
                });
            }
        },
    },
};
</script>
<style lang="scss" scoped>
@import './demandPoint.scss';
</style>
