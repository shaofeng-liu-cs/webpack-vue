<template>
  <div class="surface-survey-container">
    <div class="select-surface-type">
      <div class="survey-type sidebar-tab-title">{{$t('INITIATE_SURVEY_SURVEY_TYPE')}}</div>
      <Multiselect name="TYPE" :dataOption="surveyType" :options="surveyTypeSource" displayMode="single" dataRule="required" @change="surveyTypeChange"></Multiselect>
    </div>
    <div class="survey-title sidebar-tab-title">{{$t('AREA')}}</div>
    <div class="select-mode">
      <DrawPolygon2Map @afterDrawPolygon="setExportParam" ref="DrawPolygon2Map" :disabled="isDisable"></DrawPolygon2Map>
    </div>
    <button type="button" class="btn btn-default cancelGeo-btn" @click="clearGeo" :disabled="!filterGeo">
      {{ $t('CLEAR') }}
    </button>
    <div>
      <div class="survey-list sidebar-tab-title">{{$t('INITIATE_SURVEY_SURVEY_LIST')}}</div>
      <Grid :data="gridData" :option="gridOption" id="gridSurface" ref="gridSurface">
        <grid-column :label="$t('INITIATE_SURVEY_SURFACE_CAT')" prop="surfaceCat" width="120px"></grid-column>
        <grid-column :label="$t('INITIATE_SURVEY_SURFACE_NUMBER')" prop="surfaceNumber" width="100px"></grid-column>
        <grid-column :label="$t('INITIATE_SURVEY_SURFACE_NUMBER_ALLOW')" prop="surfaceNumberAllow" width="120px"></grid-column>
      </Grid>
    </div>
    <form ref="addForm" class="srufaceSurveyForm">
      <div class="survey-title form-item-title required">{{$t('TITLE')}}</div>
      <div class="form-group required">
        <div class="input-group" style="width:100%">
          <input data-rule="required" type="text" class="form-control" name="title" maxlength="50" />
        </div>
      </div>
      <div class="survey-title form-item-title">{{$t('DESCRIPTION')}}</div>
      <div class="form-group">
        <div class="input-group" style="width:100%">
          <textarea name="description" class="form-control" maxlength="200" rows="5" />
        </div>
      </div>
      <div class="survey-title form-item-title">{{$t('INITIATE_SURVEY_TYPE')}}</div>
      <div class="form-group">
        <div class="input-group" style="width:100%">
          <div class="radio-group-box">
            <span class="radio-item-box"><input type="radio" name="surfaceType" value="excel" id="optionsRadios1">
              <label for="optionsRadios1">{{$t('INITIATE_SURVEY_EXCEL')}}</label></span>
            <span class="radio-item-box m-l">
              <input type="radio" name="surfaceType" value="eSurvey" id="optionsRadios2">
              <label for="optionsRadios2">{{$t('INITIATE_SURVEY_ESURVEY')}}</label>
            </span>
          </div>
        </div>
      </div>
    </form>
    <div class="new-survey-submit-box">
      <button type="button" class="btn btn-default" @click="goBack">
        {{ $t('BACK') }}
      </button>
      <button type="button" class="btn btn-primary el-button" ref="submitBtn" @click="formSubmit">
        {{ $t('SUBMIT') }}
      </button>
    </div>
  </div>
</template>

<script>
import { MapServiceType, getByFeatureLayers, Filter } from 'map';
import * as Color from '../../../../design/drawStyle.js'; // 画图样式
import { addSurface, checkSurface } from '@/oss_core/edesign/api/query/schema.js';
import html2canvas from 'html2canvas';

export default {
  name: 'InitialSurfaceSurvey',
  inject: ['getMapBox', 'getProjectInfo', 'getOtherDesignList', 'getSurfaceLayerList', 'getLayerCheckData', 'getHldEl', 'getResourceList'],
  data() {
    return {
      exportParam: {
        schemaId: '',
        format: 'kml',
        layers: [],
        rings: [],
      },
      filterGeo: false,
      filterMap: {},
      hideLayerList: [],
      gridData: [],
      gridOption: {
        height: '260px',
        columnMenu: false,
        shrinkToFit: false, //表格列宽是否按比例缩放
        pager: false,
        columnResizable: false,
        slimscrollOptions: {
          alwaysVisible: false,
          axis: 'none',
        },
      },
      surveyType: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'catName',
        dataValueField: 'resType',
        dataSource: [],
      },
      surveyTypeSource: [],
      selectedSurveyType: [],
      isDisable: true,
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    resources() {
      return this.getResourceList();
    },
    layerCheckData() {
      return this.getLayerCheckData(); //
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    otherDesignList() {
      return this.getOtherDesignList();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
    hldEl() {
      return this.getHldEl();
    },
  },
  created() {
    this.getSurveyType();
  },
  mounted() {
    this.initMapCont();
    $(this.$refs.addForm).form('value', {
      surfaceType: 'excel',
    });
  },
  methods: {
    getSurveyType() {
      this.surveyTypeSource = this.$parent.surveyTypeSource;
    },
    surveyTypeChange(e, item, selItem) {
      this.selectedSurveyType = selItem;
    },
    toImgage(call) {
      const mapContent = document.querySelector('.map-container .ol-unselectable');
      html2canvas(mapContent, {
        width: mapContent.clientWidth, //画布的宽
        height: mapContent.clientHeight, //画布的高
        scale: 1, //处理模糊问题
        useCORS: true, //开启跨域，这个是必须的
      }).then((canvas) => {
        const showSrc = canvas.toDataURL('image/png');
        console.log('路径：', showSrc);
        call && call(showSrc);
      });
    },

    initMapCont() {
      let filter = Filter.equalTo({ propertyName: 'resStatus', expression: 'A' });
      this.filterMap = new Map();
      this.resources.forEach((item) => {
        if (item.layerType === 'A') {
          this.filterMap.set(item.layerNo, filter);
        }
      });
      this.otherDesignList.forEach((item) => {
        if (item.layerType === 'R') {
          let schemaFilterKey = this.projectInfo.markFlag === 'sprint' ? 'sprintId' : 'schemaId';
          let schemaFilterValue = this.projectInfo.markFlag === 'sprint' ? this.projectInfo.sprintId : this.projectInfo.schemaId;
          let filterList = [
            this.$map.Filter.notEqualTo({
              propertyName: schemaFilterKey,
              expression: schemaFilterValue,
              matchCase: true,
            }),
            // 可以利旧之后再引用
            this.$map.Filter.or(
              this.$map.Filter.equalTo({ propertyName: 'sourceFlag', expression: 'N', matchCase: true }),
              this.$map.Filter.equalTo({ propertyName: 'sourceFlag', expression: 'U', matchCase: true }),
            ),
            this.$map.Filter.equalTo({ propertyName: 'resStatus', expression: 'C', matchCase: true }),
          ];
          this.filterMap.set(item.layerNo, Filter.and(...filterList));
        }
      });
      this.surfaceLayerList
        .filter((surface) => {
          let findRes = this.mapBox.findLayer(surface.layerNo);
          return findRes && findRes._mapService.serviceType === MapServiceType.WMS_SERVICE;
        })
        .forEach((layer) => {
          this.filterMap.set(layer.layerNo, '');
        });
      let allLayers = this.mapBox.getLayers();
      let otherSurfaces = allLayers
        .filter((allA) => !this.resources.find((res) => res.layerNo === allA.id))
        .filter((allB) => !this.surfaceLayerList.find((res) => res.layerNo === allB.id))
        .filter((allC) => !this.otherDesignList.find((res) => res.layerNo === allC.id));
      if (otherSurfaces && otherSurfaces.length > 0) {
        otherSurfaces.forEach((res) => {
          this.filterMap.set(res.id, '');
        });
      }
      this.mapBox.on('select', (evt) => {
        console.log('地图选中：', evt.target);
      });
      window.testmapBox = this.mapBox;
      window.mapmapamap = this.$map;
      this.mapBox.on('identify', (evt) => {
        console.log('identify地图选中：', evt.target);
      });
    },
    goBack() {
      this.clearGeo();
      this.$parent.handleShowSurfaceSurvey(false);
    },
    setExportParam(geometry) {
      if (geometry) {
        this.theGeometry = geometry;
        this.filterGeo = true;
        this.exportParam.rings = geometry.getRings();
        let serchGeo = this.mapBox.createPolygonGeometry(geometry.getRings());

        let featureLayers = [];
        this.selectedSurveyType.forEach((layer) => {
          this.surfaceLayerList.map((res) => {
            if (layer.catName === res.catName) {
              let gisFilter = null;
              gisFilter = Filter.intersects({
                geometryName: 'geom',
                geometry: serchGeo,
                spatialReference: this.mapBox.spatialReference,
              });
              featureLayers.push({
                layerNo: res.layerNo,
                filter: gisFilter,
              });
            }
          });
        });
        getByFeatureLayers(featureLayers).then(
          (resultList) => {
            if (resultList && resultList.length > 0) {
              resultList.forEach((item, i) => {
                let obj = this.resources
                  .concat(this.surfaceLayerList)
                  .concat(this.otherDesignList)
                  .find((resource) => resource.layerNo === item.layerNo);
                if (obj) {
                  item.resType = obj.resType ? obj.resType : obj.surfaceCat;
                  item.name = obj.name ? obj.name : obj.catName;
                  item.resTypeName = obj.resTypeName ? obj.resTypeName : obj.layerName;
                }
              });
              $.blockUI({ message: 'loading' });
              this.propertyShow(resultList);
            } else {
              this.selectedSurveyType.forEach((item) => {
                let obj = {
                  surfaceCat: item.catName,
                  surfaceNumber: 0,
                  surfaceNumberAllow: 0,
                };
                this.gridData.push(obj);
              });
            }
          },
          (error) => {
            fish.toast('error', this.$t('INITIATE_SURVEY_SEARCH_ERROR'));
          },
        );
      } else {
        this.filterGeo = false;
      }
    },
    getLinecenter(paths) {
      //返回是多条线段组成的集合取中间坐标点
      let index;
      let x, y;
      if (paths.length === 2) {
        x = (paths[0][0] + paths[1][0]) / 2;
        y = (paths[0][1] + paths[1][1]) / 2;
      } else {
        index = Math.floor(paths.length / 2);
        x = (paths[index][0] + paths[index + 1][0]) / 2;
        y = (paths[index][1] + paths[index + 1][1]) / 2;
      }
      return [x, y];
    },
    propertyShow(graphics) {
      this.gridData = [];
      this.selectedGeo = graphics;
      this.$parent.$parent.$parent.$parent.showInfos(graphics);
      this.selectedSurveyType.forEach((item) => {
        let surfaceNumber = 0;
        let surfaceGisKey = [];
        graphics.map((res) => {
          if (res.resType === item.resType) {
            surfaceNumber++;
            surfaceGisKey.push(res.attributes.gisKey);
          }
        });
        checkSurface(this.projectInfo.sprintId, surfaceGisKey).then((res) => {
          let obj = {
            surfaceCat: item.catName,
            surfaceNumber: surfaceNumber,
            surfaceNumberAllow: res.allowSurvey.length,
          };
          this.gridData.push(obj);
        });
      });
      // console.log(this.gridData);
      // let resTypes = {};
      // let resTypeNames = [];
      // graphics.forEach(gra => {
      //   if (resTypeNames.indexOf(gra.resTypeName) === -1) {
      //     resTypes[gra.resTypeName] = gra.resType;
      //     resTypeNames.push(gra.resTypeName);
      //   }
      // });
      // this.selectedIsShow = true;
      // this.buildingList = graphics.filter(all => all.resType === resTypes.Building);
      // this.roadList = graphics.filter(all => all.resType === resTypes.Road);
      // let keys1 = this.buildingList.map(it => it._id);
      // let keys2 = this.roadList.map(it => it._id);
      // const surfaceGisKey = [...keys1, ...keys2];
      // checkSurface(this.projectInfo.sprintId, surfaceGisKey).then(res => {
      //   console.log('验证...：', res);
      //   let forbidSurvey = (res && res.forbidSurvey) || [];
      //   let building_dis = 0;
      //   let road_dis = 0;
      //   this.buildingList = this.buildingList.map((item, index) => {
      //     let point = item.geometry.getCentroid();
      //     let textSymbol = new this.$map.TextSymbol(`${index + 1}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -3, -20);
      //     let symbol = Color.showIndex; //showIndexD
      //     if (forbidSurvey.includes(item._id)) {
      //       symbol = Color.showIndexD;
      //       building_dis++;
      //     }
      //     this.mapBox.addGeometry(`text${index + 1}`, point, textSymbol);
      //     this.mapBox.addGeometry('pic' + index, point, symbol);
      //     item.index = index + 1;
      //     return item;
      //   });
      //   this.roadList = this.roadList.map((item, index) => {
      //     let [paths] = item.geometry.getPaths();
      //     let path = this.getLinecenter(paths);
      //     let point = new this.$map.Point(path[0], path[1], 3857);
      //     let textSymbol = new this.$map.TextSymbol(`${index + 1}`, Color.FONT_NORMAL, Color.WHITE, 'center', 'middle', -3, -20);
      //     let symbol = Color.blueIndex;
      //     if (forbidSurvey.includes(item._id)) {
      //       symbol = Color.showIndexD;
      //       road_dis++;
      //     }
      //     this.mapBox.addGeometry(`road_text${index + 1}`, point, textSymbol);
      //     this.mapBox.addGeometry('road_pic' + index, point, symbol);
      //     item.index = index + 1;
      //     return item;
      //   });
      //   this.mapBox.clearDrawLayer();
      //   console.log('this.buildingList:', this.buildingList);
      //   console.log('this.roadList:', this.roadList);
      //   $.unblockUI();
      //   this.buildNum = this.buildingList.length;
      //   this.building_allow = this.buildNum - building_dis;
      //   this.roadNum = this.roadList.length;
      //   this.road_allow = this.roadNum - road_dis;
      //   if (this.buildNum > 0) {
      //     this.buildCheck = true;
      //   } else {
      //     this.buildDisabled = true;
      //   }
      //   if (this.roadNum > 0) {
      //     this.roadCheck = true;
      //   } else {
      //     this.roadDisabled = true;
      //   }
      // });
    },
    clearGeo() {
      this.gridData = [];
      this.$refs.DrawPolygon2Map.cancelDrawAction();
    },
    submitFunc(data) {
      const succFunc = () => {
        this.$parent.loadTaskList();
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        $.unblockUI();
        this.goBack();
      };
      addSurface(
        this.projectInfo.projectId,
        data,
        (res) => {
          succFunc();
        },
        (res) => {
          if (res.status === 200) {
            succFunc();
          } else {
            console.log('res:', res);
            const responseJSON = res.responseJSON || {};
            fish.toast('warn', responseJSON.message || res.message || 'System error!');
          }
        },
      );
    },
    formSubmit() {
      const submitForm = $(this.$refs.addForm).form();
      const formValue = $(this.$refs.addForm).form('value');
      //将地图其他元素隐藏
      let list = this.selectedSurveyType.map((item) => {
        return item.layerNo;
      });
      let layers = this.mapBox.getLayers();

      if (submitForm.isValid()) {
        let params = {};
        let resMap = {};
        let parList = this.selectedGeo || [];
        let surveyResTypes = this.selectedSurveyType
          .map((item) => {
            return item.resType;
          })
          .join(',');
        console.log(surveyResTypes);
        $.blockUI({ message: 'loading' });

        parList.map((item, index) => {
          resMap[item.resType] = resMap[item.resType] || [];
          let newIt = {
            ...item.toJSON(),
            geometry: item.toJSON().geometry.toJSON(),
          };
          newIt.attributes = {
            ...newIt.attributes,
            seqIndex: item.index,
          };
          resMap[item.resType].push(newIt);
        });
        params = { resMap, ...formValue, surveyResTypes: surveyResTypes, geometry: this.theGeometry && this.theGeometry.toJSON() };

        this.hideLayerList = [];

        if (formValue.surfaceType == 'excel') {
          const ajaxFunc = () => {
            this.toImgage((url) => {
              if (this.hideLayerList.length) {
                this.hideLayerList.map((item) => {
                  this.mapBox.setVisible(item, true);
                });
                this.mapBox.refreshLayers(this.hideLayerList);
                this.hideLayerList = [];
              }

              params.surfaceImage = url;
              this.submitFunc(params);
            });
          };
          console.log('更新地图...');
          (this.layerCheckData || []).map((item, index) => {
            if (!list.includes(item.layerNo)) {
              const layerObj = layers.find((it) => it.id === item.layerNo);
              if (layerObj && layerObj.visible) {
                this.hideLayerList.push(item.layerNo);
              }
            }
          });
          if (!this.hideLayerList.length) {
            ajaxFunc();
            console.log('没有要更新的涂层...');
          } else {
            this.mapBox._map.__.once('rendercomplete', () => {
              if (!this.isRenderComplete) {
                this.isRenderComplete = true;
                ajaxFunc();
              }
            });
            setTimeout(() => {
              //10秒后还没有渲染完成就不等了
              if (!this.isRenderComplete) {
                this.isRenderComplete = true;
                ajaxFunc();
              }
            }, 10000);
            this.hideLayerList.map((hideMapItem) => {
              this.mapBox.setVisible(hideMapItem, false);
            });
            this.mapBox.refreshLayers(this.hideLayerList);
          }
        } else {
          this.submitFunc(params);
        }
      }
    },
  },
  watch: {
    selectedSurveyType: {
      deep: true,
      immediate: true,
      handler(val, old) {
        console.log(val);
        if (val.length > 0) {
          this.isDisable = false;
        } else {
          this.isDisable = true;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import './surfaceSurvey';
</style>

