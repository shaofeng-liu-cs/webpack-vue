<template>
    <div class="surround-search">
       <div class="school-list">
           <div class="school-list-title title">{{$t('SURROUND_SCHOOL_LIST')}}</div>
           <a class="a-upload">
                <input type="file" id="uploadFile" class="uploadFile" accept=".xls,.xlsx">{{$t('SURROUND_SELECT_FILE')}}
            </a>
           
           <Grid :data='gridData' :option='gridOpt' ref="gridRef" class="grid-class" @onSelectRow="selectRow" :class="projectInfo.markFlag === 'sprint' ? 'sprint' : 'schema'">
                <grid-column label='BIL' prop="BIL" width="100" ></grid-column>
                <grid-column :label="$t('SURROUND_KOD_LOKASI')" prop="KOD LOKASI" ></grid-column>
                <grid-column :label="$t('SURROUND_NAME_LOKASI')" prop="NAMA LOKASI"></grid-column>
            </Grid>
       </div>
        <div class="search-par">
           <div class="search-par-title title">{{$t('SURROUND_SEARCH_PARAMTER')}}</div>
           <div class="radius search-par-div">
               <div class="search-label">{{$t('SURROUND_RADIUS')}}</div>
               <el-slider v-model="radius" show-input class="sider search-par-content" :min="1" :max="3000" :step="100"></el-slider>
           </div>
           <div class="layer search-par-div">
               <div class="search-label">{{$t('LAYER_CONTROL_LAYER_NAME')}}</div>
                <Combobox class="form-control search-par-content" name="layerType" v-model="layerType" :setting="layerTypeSetting" ></Combobox>
           </div>
           <div class="filter search-par-div">
               <div class="search-label">{{$t('INITIATE_SURVEY_FILTER')}}</div>
               <input type="text" v-model="filterString" class="form-control search-par-content input" />
           </div>
           <div class="btn-div">
               <button type="button" class="btn btn-primary action" id="highlight" @click="searchAndHigh">{{$t('SURROUND_HIGHIGHT_ON_MAP')}}</button>
           </div>
           
       </div>
        <div class="Export"> 
           <div class="Export-title title">{{$t('EXPORT')}}</div>
           <div class="btn-div">
               <button type="button" class="btn btn-primary action export" id="export" @click="exportResult" :disabled="!hasQueryDataFlag">{{$t('SURROUND_EXPORT_RESULT')}}</button>
           </div>
           
       </div>
    </div>
</template>

<script>
import { blueIndexOffset, showIndexOffset } from '../../design/drawStyle.js';
import { FILL } from '@/oss_core/base/symbol/DefaultSymbol';
import {SupportSpatialReferences, PictureMarkerSymbol, Circle, Filter, getByFeatureLayer, SpatialReference, GeometryType, Overlay, MeasureTool, Polyline, Polygon, DrawType} from 'map';
import XLSX from 'xlsx';
const schoolSymbol = new PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/school.png', 45, 49, 0, 0, 0);
const markSymbol = blueIndexOffset;
const circleSymbol = FILL.RED_OP_2;
const polygonSymbol = FILL.RED_OP_3;
const pointSymbol = showIndexOffset
export default {
    name: 'SurroundSearch',
    inject: ['getProjectInfo', 'getMapBox', 'getSurfaceLayerList'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
        projectInfo() {
            return this.getProjectInfo();
        },
        surfaceLayerList() {
            let surList = this.getSurfaceLayerList() || [];
            surList.forEach(res => {
                if (res.resType === 'A5') {
                    res.schemaControl = true;
                }
            })
            return surList;
        },
    },
    data() {
        return {
            gridData: [],
            gridOpt: {
                width: '350',
                // height: '100%',
                pager: true,
                // rowNum : 10,
                // rowList : [15,20,30]
                pginput: false,
                // minHeight: '100px',
                altRows: true,
            },
            radius: 0,
            layerType: '',
            layerTypeSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'layerName',
                dataValueField: 'layerNo',
                dataSource: [],
                value: '',
            },
            filterString: '',
            hasQueryDataFlag: false,
            // curMarkGraId: '',
        };
    },
    created() {
        
    },
    mounted() {
        this.mapBox.addTempLayer('surroundSearchLayer');
        this.mapBox.addTempLayer('surroundSearchLayerCircle');
        this.mapBox.addTempLayer('redMarkLayer');
        this.mapBox.addTempLayer('highLightLayer');
        let fileDiv = document.getElementById('uploadFile');
        fileDiv.addEventListener('change', event => {
            let files = event.target.files || [];
            if (files.length === 1) {
                this.mapBox.clear();
                this.mapBox.clearTempLayer('surroundSearchLayer');
                this.mapBox.clearTempLayer('surroundSearchLayerCircle');
                this.mapBox.clearTempLayer('highLightLayer');
                this.mapBox.clearTempLayer('redMarkLayer');
                this.gridData = [];
                this.hasQueryDataFlag = false;
                this.getExcelData(files[0]);
                setTimeout(() => {
                    $('#uploadFile').val('');
                }, 1000)
            }
        });

        this.layerTypeSetting.dataSource = this.surfaceLayerList || [];

    },
    watch: {
        radius: {
            handler(val, old) {
                this.mapBox.clearTempLayer('surroundSearchLayerCircle');
                this.gridData.forEach((grid, index) => {
                    grid.circleGra = null;
                    if (val && Number(val) > 0 && grid.graphic) {
                        let circleGeo = new Circle(grid.graphic.geometry, Number(val));
                        let rings = circleGeo.getRings();
                        let polygonGeo = this.mapBox.createPolygonGeometry([rings]);
                        let polygonGra = this.mapBox.addGeometry(fish.getUUID(), polygonGeo, circleSymbol, {}, 'surroundSearchLayerCircle');
                        grid.circleGra = polygonGra;
                    }
                })
            }
        }
    },
    deactivated() {
        this.mapBox.clearTempLayer('surroundSearchLayer');
        this.mapBox.clearTempLayer('surroundSearchLayerCircle');
        this.mapBox.clearTempLayer('highLightLayer');
        this.mapBox.clearTempLayer('redMarkLayer');
        this.gridData = [];
        this.hasQueryDataFlag = false;
    },
    activated() {

    },
    methods: {
        getExcelData(file) {
            var wb;//读取完成的数据
            var rABS = false; //是否将文件读取为二进制字符串
            var reader = new FileReader();
            reader.onload = (e) => {
                let data = e.target.result;
                if(rABS) {
                    wb = XLSX.read(btoa(this.fixdata(data)), {//手动转化
                        type: 'base64'
                    });
                } else {
                    wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }
                //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
                //wb.Sheets[Sheet名]获取第一个Sheet的数据
                let _gridData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) || [];
                console.log(_gridData) ;
                _gridData.forEach((grid, index) => {
                    this.createCenter(grid, index);
                })
                this.gridData = _gridData;
                fish.toast('success', this.$t('SURROUND_WARN_1'))
            }

            if(rABS) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsBinaryString(file);
            }
            
        },

        fixdata(data) { //文件流转BinaryString
            var o = "",
                l = 0,
                w = 10240;
            for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        },

        createCenter(grid, index) {
            if (grid.LONGITUDE && grid.LATITUDE) {
                let center = this.mapBox.createPointFromCurrentCoord([Number(grid.LONGITUDE), Number(grid.LATITUDE)], SupportSpatialReferences.WGS84);
                let gra = this.mapBox.addGeometry(index + 'school', center, schoolSymbol, {}, 'surroundSearchLayer');
                grid.graphic = gra;
            }
        },

        selectRow(row, index) {
            this.mapBox.clearTempLayer('redMarkLayer');
            if (row.graphic) {
                this.mapBox.centerAt(row.graphic.geometry);
                let markGra = this.mapBox.addGeometry(fish.getUUID(), row.graphic.geometry, markSymbol, {}, 'redMarkLayer');
            }
        },

        searchAndHigh() {
            this.mapBox.clearTempLayer('highLightLayer');
            this.hasQueryDataFlag = false;
            if (!this.layerType || this.radius == 0) {
                fish.toast('warn', this.$t('SURROUND_WARN_2'));
                return;
            }
            let layerObj = this.layerTypeSetting.dataSource.find(res => res.layerNo === this.layerType);
            let promiseList = [];
            this.gridData.forEach((grid, index) => {
                if (grid.graphic && grid.circleGra) {
                    let filter = Filter.intersects({
                        geometryName: 'geom',
                        geometry: grid.circleGra.geometry,
                        spatialReference: SupportSpatialReferences.WEB_MERCATOR
                    });
                    let stringFilter = [];
                    if (this.filterString) {
                        let filterList = this.filterString.split(';') || [];
                        filterList.forEach(singleFilter => {
                            let singleFilterArray = singleFilter.split('=') || [];
                            if (singleFilterArray.length === 2) {
                                stringFilter.push(Filter.equalTo({
                                    propertyName: singleFilterArray[0] + '',
                                    expression: singleFilterArray[1] + '',
                                }))
                            }
                        })
                    }
                    if (layerObj.schemaControl) {
                        stringFilter.push(Filter.equalTo({
                            propertyName: 'schemaId', 
                            expression: this.projectInfo.schemaId
                        }))
                    }
                    if (stringFilter.length > 0) {
                        filter = Filter.and(filter, ...stringFilter)
                    }
                    let featureLayer = {
                        layerNo: this.layerType,
                        filter: filter,
                    };
                    promiseList.push(this.getSurroundData(featureLayer, grid, layerObj.geometryType));
                }
            })
            if (promiseList.length === 0) {
                fish.toast('warn', this.$t('SURROUND_WARN_2'));
                return;
            }
            Promise.all(promiseList).then(results => {
                console.log(this.gridData);
                results = results ? results : [];
                let hasData = results.find(res => res === 'Y');
                if (hasData) {
                    this.hasQueryDataFlag = true;
                    fish.toast('success', this.$t('SURROUND_WARN_3'));                 
                } else {
                    fish.toast('warn', this.$t('SURROUND_WARN_2'));
                }
            })
        },

        getSurroundData(featureLayer, row, geometryType) {
            return new Promise((resolve, reject) => {
                getByFeatureLayer(featureLayer).then(res => {
                    let childGridData = [];
                    if (res && res.length > 0) {
                        res.forEach(geo => {
                            let centerPoint = geometryType === GeometryType.POLYGON ? geo.geometry.getCentroid() : {x: geo.attributes.longitude, y:geo.attributes.latitude, spatialReference: SupportSpatialReferences.WGS84};
                            let wgsrGeoPoint = centerPoint.spatialReference.wkid === SupportSpatialReferences.WGS84.wkid ? centerPoint : centerPoint.transferProjection(SupportSpatialReferences.WGS84);
                            let mectorGeo = geo.geometry.spatialReference.wkid === SupportSpatialReferences.WEB_MERCATOR.wkid ? geo.geometry : geo.geometry.transferProjection(SupportSpatialReferences.WEB_MERCATOR);
                            let realSymbol = geometryType === GeometryType.POLYGON ? polygonSymbol : pointSymbol;
                            this.mapBox.addGeometry(fish.getUUID(), mectorGeo, realSymbol, {}, 'highLightLayer');
                            childGridData.push({
                                // 'KOD LOKASI': geo.layerNo,
                                'NAMA LOKASI': geo.attributes.gisKey,
                                LONGITUDE: wgsrGeoPoint.x,
                                LATITUDE: wgsrGeoPoint.y,
                            })
                        })
                        row.surroundData = childGridData;
                    }
                    resolve(res && res.length ? 'Y' : 'N');
                })
            })
            
        },

        exportResult() {
            let table = [{
                'BIL':"BIL",
                'KOD LOKASI':"KOD LOKASI",
                'NAMA LOKASI':"NAMA LOKASI",
                'ALAMAT':"ALAMAT",
                'POSKOD':"POSKOD",
                'BANDAR':"BANDAR",
                'NEGERI':"NEGERI",
                'DISTRIBUTION POINT (DP)':"DISTRIBUTION POINT (DP)",
                'LONGITUDE':"LONGITUDE",
                'LATITUDE':"LATITUDE",
            }];
            this.gridData.forEach(grid => {
                table.push(grid);
                if (grid.surroundData && grid.surroundData.length > 0) {
                    table = table.concat(grid.surroundData);
                }
            })
            //创建book
            var wb = XLSX.utils.book_new();
            //json转sheet
            var ws = XLSX.utils.json_to_sheet(table, {header:["BIL","KOD LOKASI","NAMA LOKASI","ALAMAT","POSKOD", "BANDAR", 'NEGERI', 'DISTRIBUTION POINT (DP)', 'LONGITUDE', 'LATITUDE'], skipHeader:true});
            //设置列宽
            ws['!cols']= [
                {width: 10},
                {width: 20},
                {width: 60},
                {width: 30},
                {width: 7},
                {width: 7},
                {width: 7},
                {width: 10},
                {width: 10},
                {width: 10},
            ];
            var timestamp = (new Date()).getTime();
            //sheet写入book
            XLSX.utils.book_append_sheet(wb, ws, "file");
            //输出
            XLSX.writeFile(wb,"file"+timestamp+".xlsx");
        }
    },
    destroyed() {

    },
};
</script>

<style lang="scss" scoped>
@import './surroundSearch';
</style>
