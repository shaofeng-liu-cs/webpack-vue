<template>
    <div class="layingTopoDesign">
        <div class="">
            <h3>{{$t('CABLE_LAYING_TITLE')}}</h3>
            <div>
                <div>
                    <div>
                        <CableLayingTopo ref="cableLaying" :params="topoParams" @click-node="clickTopoNode"></CableLayingTopo>
                    </div>
                    <div>
                        <button type="button" class="btn btn-primary" @click="layingSave">{{$t('SAVE')}}</button>
                        <button type="button" class="btn btn-default" @click="btnCancel">{{$t('BACK')}}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="infoBox">
            <div>{{$t('AUTO_INSERT')}}</div>
            <div>
                <div><input type="radio" name="AUTO_RULE" v-model="autoRule" value="1"> {{$t('AUTO_INSERT_LOW')}}</div>
                <div><input type="radio" name="AUTO_RULE" v-model="autoRule" value="2"> {{$t('AUTO_INSERT_SMALLER')}}</div>
                <div><input type="radio" name="AUTO_RULE" v-model="autoRule" value="3"> {{$t('AUTO_INSERT_LARGER')}}</div>
            </div>
            <div> {{$t('AUTO_INSERT_OTHER')}} </div>
            <div>
                <button type="button" class="btn btn_minwidth btn-primary" :disabled="autoRule === ''" @click="applyAutoInsert">{{$t('APPLY')}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import CableLayingTopo from '../../../topo/design/CableLayingTopo.vue';
import { loadAutoCableThreading, saveCrossCable } from '../../../topo/TopoHandleAction.js';
export default {
  name: 'fastlayingTopoDesign',
  components: {
    CableLayingTopo,
  },
  props: {
    rowData: {
      type: Object,
    },
  },
  data() {
    return {
      topoParams: null,
      autoRule: '',
      isShowAutoInsert: true,
      pipelineForCable: [],
      resInfo: [],
      gridData: [],
      gridOption: {
        height: '85%',
        columnMenu: false,
        cached: true,
        pager: false,
        //rowNum : 8,
        // rowList : [15,20,30]
      },
    };
  },
  mounted() {
    this.topoParams = this.rowData;
    this.initPage();
    //console.info(this.rowData);
  },
  created() {},
  methods: {
    initPage() {
      let routeList = this.topoParams.routeList || [];
      //let isShowAutoInsert = true;
      if (routeList.length > 0) {
        let pipelineGList = routeList.filter(route => route.resSpecId === 'PIPELINE_G');
        if (pipelineGList.length === 0) {
          this.isShowAutoInsert = false;
        }
      } else {
        this.isShowAutoInsert = false;
      }
    },
    layingSave() {
      let datas = this.$refs.cableLaying.getSelectPipelineHole();
      //console.info("select pipeline Hole Node>>>>>>>>>>>>>>>>>>>>>");
      //console.info(data);
      let selHoleCount = datas.length;
      let routeList = this.topoParams.routeList || [];
      let pipelineList = routeList.filter(item => item.resSpecId === 'PIPELINE_G');
      let pipelineCount = pipelineList.length;
      if (selHoleCount < pipelineCount) {
        let noCablePipeList = [];
        pipelineList.forEach(res => {
          let isExitst = false;
          datas.forEach(hole => {
            if (res.resId === hole.getAttrObject().pipelineId) {
              isExitst = true;
              return false;
            }
          });
          if (!isExitst) {
            noCablePipeList.push(res);
          }
        });

        let pipelineName = '';
        noCablePipeList.forEach(res => {
          if (pipelineName) {
            pipelineName = res.resName + ',' + pipelineName;
          } else {
            pipelineName = res.resName;
          }
        });

        fish.warn('[' + pipelineName + '],' + this.$t('WARN_PIPEHOLE_NOCABLE'));
        return;
      }

      let cableId = this.topoParams.cable.cableId;

      let routes = [];
      routeList.forEach(route => {
        let item = {};
        if (route.resSpecId === 'PIPELINE_G') {
          datas.forEach(hole => {
            if (route.resId === hole.getAttrObject().pipelineId) {
              item.resSpecId = route.resSpecId;
              item.pipelineId = route.resId;
              item.pipeChannelId = hole.getAttrObject().pipeChannelId;
              routes.push(item);
            }
          });
        } else if (route.resSpecId === 'AIR_WIRE') {
          item.resSpecId = route.resSpecId;
          item.pipelineId = route.resId;
          routes.push(item);
        } else {
          item.resSpecId = route.resSpecId;
          item.facilityId = route.resId;
          routes.push(item);
        }
      });

      let param = {};
      param.cableId = cableId;
      param.routes = routes;

      saveCrossCable(param).then(data => {
        this.$root.$emit('btnToCoverCurrentPage', 'HldDesign'); //保存完成后，返回事件
        fish.toast('success', 'Save Successfully.');
      });
    },

    btnCancel() {
      this.autoRule = '';
      this.$refs.cableLaying.setSelectPipelineHole();
      this.$root.$emit('btnToCoverCurrentPage', 'HldDesign');
    },

    applyAutoInsert() {
      let arrPipelineIds = this.topoParams.pipelineIds.split(',');
      let param = {};
      param.cableId = this.topoParams.cable.cableId;
      param.selectedRule = this.autoRule;
      param.pipelineIds = arrPipelineIds;
      param.sprintId = this.topoParams.sprintId;
      loadAutoCableThreading(param).then(data => {
        if (data.holeList.length === 0) {
          let failMsg = data.queryFailDesc || '';
          fish.warn(failMsg);
        } else {
          this.autoPipeHoleCableApply(data);
        }
      });
    },

    autoPipeHoleCableApply(data) {
      this.$refs.cableLaying.autoPipeHoleCableApply(data);
    },

    clickTopoNode(node) {
      // if (node) {
      //     let attr = node.getAttrObject();
      //     if (attr) {
      //         let resSpecId = attr.resSpecId;
      //         if (resSpecId ==='NULL_LINE') {
      //             this.gridData = [];
      //         }
      //         else {
      //             this.loadResAttr(attr);
      //         }
      //     }
      // }
    },
    // loadResAttr(attr){
    //     this.resInfo = [];
    //     if (attr) {
    //         //console.info("node >>>>>>>>>>>>>>>>>>>>>>>>>>");
    //         //console.info(attr);
    //         let resSpecId = attr.resSpecId;
    //         let resId = "";
    //         switch (resSpecId){
    //             case 'PIPELINE_G':
    //                 resId = attr.resId ? attr.resId : attr.pipelineId;
    //                 break;
    //             case 'MANHOLE':
    //                 resId = attr.resId;
    //                 break;
    //             case 'POLE':
    //                 resId = attr.resId;
    //                 break;
    //             case 'AIR_WIRE':
    //                 resId = attr.resId;
    //                 break;
    //             case 'MARKSTONE':
    //                 resId = attr.resId;
    //                 break;
    //             case 'BURIED_PIPE':
    //                 resId = attr.resId;
    //                 break;
    //             case 'PIPELINE_B':
    //                 resId = attr.pipeChannelId;
    //                 break;
    //             case 'PIPELINE':
    //                 resId = attr.pipeChannelId;
    //                 break;
    //             case 'F_CABLE':
    //                 resId = attr.cableId;
    //                 break;
    //             default:
    //                 resId = attr.resId;
    //                 break;
    //         }
    //         if (resSpecId==='PIPELINE' || resSpecId==='PIPELINE_B' || resSpecId==='F_CABLE') {
    //             if (resSpecId==='PIPELINE'){
    //                 let valRate = attr.curOccupyRate;
    //                 if (valRate) {
    //                     attr.curOccupyRateShow = (valRate * 100).toFixed(2) + '%';
    //                 }
    //                 else {
    //                     attr.curOccupyRateShow = '0.00%';
    //                 }

    //             }
    //             this.resInfo.push(attr);
    //             this.showGridList();
    //         }
    //         else {
    //             if (resId) {
    //                 queryResInfo(resSpecId,resId).then(data => {
    //                     this.resInfo = data.resultList;
    //                     this.showGridList();
    //                 });
    //             }
    //         }
    //     }
    // },
    // showGridList(){
    //     let gridListData = [];
    //     if (this.resInfo.length > 0){
    //         let resType = this.resInfo[0].resSpecId;
    //         let attr = this.resourcesConfig.getFastLayingResByType(resType);
    //         let attrCodes = attr.attrCode || [];
    //         let attrNames = attr.attrName || [];
    //         let attrKeys = Object.keys(this.resInfo[0]);
    //         let attrVals = Object.values(this.resInfo[0]);
    //         //this.showGridListData(attr, attrKeys, attrVals);
    //         for (let i = 0; i < attrCodes.length; i++) {
    //             let attrCode = attrCodes[i];
    //             let attrName = attrNames[i];
    //             for (let j = 0; j < attrKeys.length; j++) {
    //                 let attrKey = attrKeys[j];
    //                 if (attrCode === attrKey){
    //                     let item = {};
    //                     item.name = attrName;//attrKeys[j];
    //                     item.value = attrVals[j];
    //                     gridListData.push(item);
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    //     this.gridData = gridListData;
    // }
  },
  watch: {
    rowData: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.topoParams = val;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../scss/AbstractTopoDesign.scss';
</style>
