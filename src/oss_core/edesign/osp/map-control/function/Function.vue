<!--
 * @Author: your name
 * @Date: 2021-05-19 10:05:27
 * @LastEditTime: 2023-02-24 09:23:24
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\function\Function.vue
-->
<template>
  <div class="function">
    <div class="info-head function-head">
      <h3>{{ $t('FUNCTION') }}</h3>
    </div>
    <div class="info-content function-list">
      <div v-for="(item, index) in functionList" :key="index" :style="{ order: item.seq }">
        <div v-if="item.isVisible">
          <div class="icon_osp" :class="item.icon"></div>
          <button type="button" class="btn btn-default" @click="process(item)" :disabled="!item.isEnable">{{ item.name }}</button>
        </div>
      </div>
    </div>
    <ResFunctionDialog ref="resFunctionDialog"></ResFunctionDialog>
    <ResFunctionNoDialog ref="resFunctionNoDialog"></ResFunctionNoDialog>
    <ThirdUrlPopup ref="summary" :appendEl="hldEl"></ThirdUrlPopup>
  </div>
</template>
<script>
import { resFunction } from '../searchbar/info-panel/InnerResFunction/innerResFunction.js';
import { queryFunctionInfo } from '@/oss_core/edesign/api/query/layerNo.js';
import ThirdUrlPopup from './ThirdUrlPopup/thirdUrlPopup.vue'; // 信息面板Summary按钮弹窗组件
import ResFunctionNoDialog from './resFunctionNoDialog/ResFunctionNoDialog.vue';
import ResFunctionDialog from './resFunctionDialog/ResFunctionDialog.vue';
import { queryBuildingStructure } from '../map-control-api';
import ResHandler from '@/oss_core/edesign/osp/domain/ResHandler';
import { GeometryType } from 'map';

export default {
  //import引入的组件
  components: {
    ThirdUrlPopup,
    ResFunctionNoDialog,
    ResFunctionDialog,
  },
  mixins: [ResHandler],
  inject: ['getMapBox', 'getHldEl', 'getSurfaceLayerList', 'getControlData'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    hldEl() {
      return this.getHldEl();
    },
    surfaceList() {
      return this.getSurfaceLayerList();
    },
    controlData() {
      return this.getControlData();
    },
  },
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          layerNo: '',
        };
      },
    },
    isDisable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      functionList: [],
      dataInfo: this.params.dataInfo,
      childParams: {
        resId: this.params.dataInfo.CloudGraphic.attributes.resId,
      }, //子组件入参
      resId: '', // 如果是接入点，判断其关联的建筑物是否有RES_ID
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    // 如果是接入点，判断其关联的建筑物是否有RES_ID
    if (this.dataInfo.CloudGraphic.resType === 'A5') {
      this.$map
        .getByLayerAndId(this.dataInfo.CloudGraphic.attributes.buildingLayerNo, this.dataInfo.CloudGraphic.attributes.buildingGisId)
        .then(res => {
          this.resId = res.attributes.resId;
          this.getFunctionList();
        });
    } else {
      this.getFunctionList();
    }
  },
  //方法集合
  methods: {
    getFunctionList() {
      let params = {
        layerNo: this.params.layerNo,
        functionType: 'RES_EDT', //目前后台会忽略这个入参，返回全部类型的数据，需要前台自己判断过滤
      };
      queryFunctionInfo(params).then(data => {
        if (data && data.resultList && data.resultList.length !== 0) {
          var sourceFlag = this.dataInfo.CloudGraphic.attributes.sourceFlag;
          var beRefFlag = this.dataInfo.CloudGraphic.attributes.beRefFlag;
          data.resultList.forEach(item => {
            item.isVisible = this.setIsTrue(item, item.visibleControl, sourceFlag, beRefFlag);
            item.isEnable = this.isDisable ? !this.isDisable : this.setIsTrue(item, item.enableControl, sourceFlag, beRefFlag);
          });
          // if (this.params.projectInfo && this.params.projectInfo.markFlag === 'sprint') {
          //     data.resultList = data.resultList.filter(res => ['RES_QRY', 'RES_VIEW'].indexOf(res.functionType) > -1);
          // }
          if (this.params.projectInfo.markFlag === 'sprint') {
            data.resultList = data.resultList.filter(res => ['A', 'M'].indexOf(res.displayScope) > -1);
          } else {
            data.resultList = data.resultList.filter(res => ['A', 'D'].indexOf(res.displayScope) > -1);
          }
          this.functionList = data.resultList;
        }
      });
    },
    setIsTrue(item, type, sourceFlag, beRefFlag) {
      let list = type.split('|');
      let isReuse = sourceFlag === 'U';
      let isReference = sourceFlag === 'R';
      let isBeenReferenced = beRefFlag === 'Y';
      let graph = this.dataInfo.CloudGraphic;
      let resId = this.resId || graph.attributes.resId;
      let hasModel = !!resId;
      let isInnerRes = false;
      if (
        (list[0] === 'Y' && !isReuse) ||
        (list[0] === 'N' && isReuse) ||
        (list[1] === 'Y' && !isReference) ||
        (list[1] === 'N' && isReference) ||
        (list[2] === 'Y' && !isBeenReferenced) ||
        (list[2] === 'N' && isBeenReferenced) ||
        (list[3] === 'Y' && !hasModel) ||
        (list[3] === 'N' && hasModel) ||
        (list[4] === 'Y' && !isInnerRes) ||
        (list[4] === 'N' && isInnerRes)
      ) {
        return false;
      } else {
        return true;
      }
    },
    updateFunctionStatus() {
      var sourceFlag = this.dataInfo.CloudGraphic.attributes.sourceFlag;
      var beRefFlag = this.dataInfo.CloudGraphic.attributes.beRefFlag;
      // 如果是接入点，判断其关联的建筑物是否有RES_ID
      if (this.dataInfo.CloudGraphic.resType === 'A5') {
        this.$map
          .getByLayerAndId(this.dataInfo.CloudGraphic.attributes.buildingLayerNo, this.dataInfo.CloudGraphic.attributes.buildingGisId)
          .then(res => {
            this.resId = res.attributes.resId;
            this.functionList.forEach(item => {
              item.isVisible = this.setIsTrue(item, item.visibleControl, sourceFlag, beRefFlag);
              item.isEnable = this.isDisable ? !this.isDisable : this.setIsTrue(item, item.enableControl, sourceFlag, beRefFlag);
            });
          });
      } else {
        this.functionList.forEach(item => {
          item.isVisible = this.setIsTrue(item, item.visibleControl, sourceFlag, beRefFlag);
          item.isEnable = this.isDisable ? !this.isDisable : this.setIsTrue(item, item.enableControl, sourceFlag, beRefFlag);
        });
      }
    },
    process(item) {
      if (['R', 'U'].indexOf(this.dataInfo.CloudGraphic.attributes.sourceFlag) > -1 && ['ResEdit'].indexOf(item.url) > -1) {
        fish.toast('warn', this.$t('MAP_CON_FUNC_OPERATE'));
        return;
      }
      // type
      // 1 - 打开外部js view，入参暂时不配置, 第三方url
      // 2 - 内部Vue组件
      // 3 - 调用内部方法，内部方法都在一起，入参为当前的对象内容（包括资源和GIS）

      // viewType
      // 1 - 组件本身只表示内容，需要外层嵌一个Dialog（如需要改变大小就配置dialogWidth和dialogHeight）
      // 2 - 组件本身就是一个弹窗，不需要外层包一个Dialog
      // 3 - 新的页签（portal）
      // 4 - 覆盖当前页面（利用vue缓存机制，便于信息交互）
      switch (item.type) {
        case '1':
          // 第三方Url
          if (item.viewType === '1' || item.viewType === '2') {
            this.thirdUrlPopup(item, this.dataInfo);
          } else if (item.viewType === '3') {
            // this.$emit("btnToMap", item.url, this.projectInfo);
            let param = {};
            let resId = this.dataInfo.resId;
            param = {
              RES_SPEC_ID: this.dataInfo.resType,
              FORM_DATA: {
                DEVICE_ID: resId,
              },
            };
            portal.openMenu(resId, item.url, 'S', item.name, param);
          }
          break;
        case '2':
          // 动态组件
          if (item.viewType === '1') {
            this.resComponentShow(item);
          } else if (item.viewType === '2') {
            this.resComponentShowNoDialog(item);
          } else if (item.viewType === '3') {
            // let menuId = 'HLD' + this.params.dataInfo.CloudGraphic.attributes.resId;
            let menuId = 'HLD-InfoPanelFunction';
            let menuTitle = 'LLD Design-' + this.dataInfo.CloudGraphic.attributes.resName;
            let resId = this.resId || this.dataInfo.CloudGraphic.attributes.resId;
            let params = {
              portParams: {
                resId,
                resType: this.resId
                  ? 'BUILDING'
                  : this.dataInfo.CloudGraphic.relaResType
                  ? this.dataInfo.CloudGraphic.relaResType
                  : this.dataInfo.CloudGraphic.resType,
                resName: this.dataInfo.CloudGraphic.attributes.resName,
                buildingGisId: this.dataInfo.CloudGraphic.attributes.buildingGisId ? this.dataInfo.CloudGraphic.attributes.buildingGisId : '',
                buildingLayerNo: this.dataInfo.CloudGraphic.attributes.buildingLayerNo ? this.dataInfo.CloudGraphic.attributes.buildingLayerNo : '',
                schemaId: this.params.projectInfo.schemaId,
                sprintId: this.params.projectInfo.sprintId,
                mapNo: this.params.projectInfo.mapNo,
              },
              choose: item.url,
              projectInfo: this.params.projectInfo,
              lldParams: {
                resId,
                schemaId: this.params.projectInfo.schemaId,
                sprintId: this.params.projectInfo.sprintId,
                resType: this.resId
                  ? 'BUILDING'
                  : this.dataInfo.CloudGraphic.relaResType
                  ? this.dataInfo.CloudGraphic.relaResType
                  : this.dataInfo.CloudGraphic.resType,
                resName: this.dataInfo.CloudGraphic.attributes.resName,
                buildingGisId: this.dataInfo.CloudGraphic.attributes.buildingGisId ? this.dataInfo.CloudGraphic.attributes.buildingGisId : '',
                buildingLayerNo: this.dataInfo.CloudGraphic.attributes.buildingLayerNo ? this.dataInfo.CloudGraphic.attributes.buildingLayerNo : '',
                isReferenced: this.dataInfo.CloudGraphic.attributes.sourceFlag === 'R' ? true : false,
                mapNo: this.params.projectInfo.mapNo,
              },
              isSingleMenu: true,
            };

            // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
            this.$root.$emit('openMenu', menuId, menuTitle, params);

            // 关闭右侧页签，避免内部设计操作数据时，资源树等一些组件的刷新不及时问题
            this.$emit('closeRightBars');
          } else if (item.viewType === '4') {
            this.initParam(item.url)
              .then(param => {
                this.$root.$emit('btnToCoverCurrentPage', item.url, param);
              })
              .catch(error => {
                fish.warn(error);
              });
          }
          break;
        case '3':
          // 内部代码
          this.callInnerFunction(item, this.dataInfo, this.mapBox, this.params.projectInfo);
          //this[item.url](this.dataInfo, this.mapBox);
          break;
        default:
          break;
      }
      // if (item.url === 'removeStr') {
      //     this.$root.$emit('changeAttributes', { resId: '', userQty: 0, buildingType: '', buildingPurpose: '' });
      // }
    },
    initParam(url) {
      return new Promise((resolve, reject) => {
        if (url === 'FastLayingDesign') {
          // 信息面板光缆topo功能的入参组装

          let cableGeo = this.dataInfo.CloudGraphic.geometry;
          let gisFilter = this.$map.Filter;
          let filter = gisFilter.and(
            gisFilter.within({
              geometryName: 'geom',
              geometry: cableGeo,
              spatialReference: this.$map.SupportSpatialReferences.WEB_MERCATOR,
            }),
            gisFilter.equalTo({ propertyName: 'schemaId', expression: this.params.projectInfo.schemaId }),
            gisFilter.equalTo({ propertyName: 'resStatus', expression: 'C' })
          );
          // delete filter.olMap;
          let featureLayers = [];
          ['MANHOLE', 'POLE', 'AIR_WIRE', 'PIPELINE_G'].forEach(res => {
            let obj = {
              layerNo: this.getLayerNoByResTypeId(res),
              filter: filter,
            };
            featureLayers.push(obj);
          });
          featureLayers = featureLayers.filter(res => res.layerNo);
          this.$map.getByFeatureLayers(featureLayers).then(result => {
            let returnParam = {};
            if (result) {
              let pointList = result.filter(res => res.geometry.geometryType === GeometryType.POINT);
              let pipelineList = result.filter(res => res.geometry.geometryType === GeometryType.POLYLINE);
              if (pipelineList && pipelineList.length > 0) {
                // 添加长度用于排序点资源
                pointList.forEach(res => {
                  let length = this.$map.GeometryUtils.getPointToLineStartPointLength(res.geometry, cableGeo);
                  res.lengthToStart = length;
                });
                pointList = pointList.sort((x, y) => x.lengthToStart - y.lengthToStart);
                returnParam.cable = {
                  cableId: this.dataInfo.CloudGraphic.attributes.resId,
                  resId: this.dataInfo.CloudGraphic.attributes.resId,
                  resName: this.dataInfo.CloudGraphic.attributes.resName,
                  RES_NO: this.dataInfo.CloudGraphic.attributes.resNo,
                  resSpecId: this.getResTypeIdByLayerNo(this.dataInfo.CloudGraphic.layerNo),
                };
                let routeList = [];
                let pipelineIds = [];
                pointList.forEach((res, index) => {
                  let objPoint = {
                    resSpecId: this.getResTypeIdByLayerNo(res.layerNo),
                    resId: res.attributes.resId,
                    resName: res.attributes.resName,
                    RES_NO: res.attributes.resNo,
                  };
                  routeList.push(objPoint);
                  let pointGisKey = res.attributes.gisKey;
                  let findResult = pipelineList.find(res => res.attributes.aGisKey === pointGisKey || res.attributes.zGisKey === pointGisKey);
                  // 如果没有找到下一个线资源，则表示当前点是当前管道段集的终点
                  if (findResult) {
                    let objLine = {
                      resSpecId: this.getResTypeIdByLayerNo(findResult.layerNo),
                      resId: findResult.attributes.resId,
                      resName: findResult.attributes.resName,
                      RES_NO: findResult.attributes.resNo,
                    };
                    routeList.push(objLine);
                    if (objLine.resSpecId === 'PIPELINE_G') {
                      pipelineIds.push(findResult.attributes.resId);
                    }
                    // 去掉已经算进去的管道段
                    pipelineList = pipelineList.filter(res => res.attributes.resId !== findResult.attributes.resId);
                  }
                });
                returnParam.routeList = routeList;
                returnParam.pipelineIds = pipelineIds.toString() + '';
                returnParam.sprintId = this.params.projectInfo.sprintId;
                returnParam.schemaId = this.params.projectInfo.schemaId;
                resolve(returnParam);
              }
            }
            reject(this.$t('MAP_CON_FUNC_EXIXT'));
          });
        } else {
          resolve(this.dataInfo);
        }
      });
    },
    callInnerFunction(functionData, dataInfo, mapBox, projectInfo) {
      return resFunction(functionData, dataInfo, mapBox, projectInfo, this.surfaceList, this);
    },

    thirdUrlPopup(functionData, graphicData) {
      // 功能菜单弹框展示
      this.$refs.summary.functionData = functionData;
      this.$refs.summary.dataInfo = graphicData;
      this.$refs.summary.popup.show = true;
    },
    resComponentShow(functionData) {
      if (functionData.url === 'BuildingDesignTopo') {
        queryBuildingStructure({ buildingId: this.dataInfo.CloudGraphic.attributes.resId }).then(data => {
          if (data && data.resultList && data.resultList.length > 0) {
            let buildingStrInfo = data.resultList[0]; //SDU不能做内部设计
            if (buildingStrInfo.buildingType === '3') {
              fish.toast('warn', this.$t('MAP_CON_FUNC_INTERNAL'));
            } else {
              this.$refs.resFunctionDialog.setParentParam(functionData, this.dataInfo, this.params.projectInfo, this.hldEl);
            }
          } else {
            this.$refs.resFunctionDialog.setParentParam(functionData, this.dataInfo, this.params.projectInfo, this.hldEl);
          }
        });
      } else {
        this.$refs.resFunctionDialog.setParentParam(functionData, this.dataInfo, this.params.projectInfo, this.hldEl);
      }
    },

    //打开编辑和查看界面
    resComponentShowNoDialog(functionData) {
      this.getHldEl();
      this.$refs.resFunctionNoDialog.setParentParam(functionData, this.dataInfo, this.params.projectInfo, this.hldEl);
    },
  },
  watch: {
    'params.layerNo': function (val, oldVal) {
      this.getFunctionList();
    },
    'params.dataInfo': function (val, oldVal) {
      this.dataInfo = val;

      this.childParams = {
        resId: val.CloudGraphic.attributes.resId,
      }; //子组件入参
      this.updateFunctionStatus();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './Function.scss';
</style>