<template>
  <div class="batchSelectModelBox">
    <div class="headBtnBox">
      <span class="headLeft">
        <select class="filterSelectBox" v-model="filterModel" @change="formatTableData">
          <option value="ALL">{{$t('RESOURCE_SELECT_ALL')}}</option>
          <option value="SELECED">{{$t('RESOURCE_SELECT_SELECTED')}}</option>
          <option value="NOSELECT">{{$t('RESOURCE_SELECT_NOSELECTED')}}</option>
        </select>
        <button type="button" class="btn btn-default" style="margin-right:10px;" @click="resetSelect">{{$t('OSP_TASK_SET_RESET')}}</button>
        <button type="button" class="btn btn-default" @click="refreshLoad">
          <i class="icon_ospreload icon_osp" style="font-size:12px;"></i>
        </button>
      </span>
      <button type="button" class="btn btn-primary" @click="applyFunc">{{$t('APPLY')}}</button>
    </div>
    <div class="tableBox" ref="tableBox">
      <Grid :data="gridData" :option="gridOption" ref="treeGrid" :key="tableKey">
        <grid-column label="" prop="hldTemplateId" :keyFlag="true" :hidden="true"></grid-column>
        <grid-column :label="$t('RESOURCE_TYPE')" prop="resTypeName"></grid-column>
        <grid-column :label="$t('E_MAINPAGEMANAGER_DESIGN_ELEMENTS')" width="180px">
          <template slot-scope="{ row }">
            <div>
              <span>{{row.hldTemplateName||''}}</span>
              <span class="showResNumSpan">({{row.showResNum}})</span>
            </div>
          </template>
        </grid-column>
        <grid-column :label="$t('OSP_RESOURCE_TEMPLATE')" width="180px">
          <template slot-scope="{ row }">
            <select v-model="defSelectMap[row.hldTemplateId]">
              <option value="">{{$t('RESOURCE_SELECT_HLD_NO')}}</option>
              <option :value="item.id" v-for="(item,index) in row.resources" :key="index">{{item.templateName}}</option>
            </select>
          </template>
        </grid-column>
      </Grid>
    </div>
  </div>
</template>

<script>
import { updateIsDefultHld, getHldToTemList } from '@/oss_core/edesign/api/query/schema.js';
import { batchAddResources } from '@/oss_core/edesign/api/add/resources.js';

export default {
  name: 'BatchSelectModel',
  inject: ['getProjectInfo', 'getMapBox', 'getSurfaceLayerList', 'getResourceList', 'getAttrActionConfig', 'getSchemaConfigs'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList() || [];
    },
    resourceList() {
      return this.getResourceList() || [];
    },
    attrActionConfig() {
      return this.getAttrActionConfig() || {};
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
  },
  data() {
    return {
      filterModel: 'ALL',
      noHldResNUm: 0, //没有能力模版的资源总数
      hldTemplateMap: {}, //能力模版资源数据
      gridData: [],
      gridOption: {},
      resTemplateMap: {},
      defSelectMap: {},
      resTypeHldMap: {},
      layers: [],
      tableKey: 0,
    };
  },
  created() {},
  mounted() {
    console.log('mounted...');
    this.refreshLoad();
    this.resetTableHeight();
  },
  watch: {},
  deactivated() {},
  activated() {},
  methods: {
    resetTableHeight() {
      const dom = $(this.$refs.tableBox)[0];
      $(this.$refs.treeGrid.$refs.grid).grid('setGridWidth', 0);
      setTimeout(() => {
        $(this.$refs.treeGrid.$refs.grid).grid('setGridWidth', dom.clientWidth);
      }, 500);
    },
    resetSelect() {
      this.defSelectMap = {};
      this.tableKey++;
    },
    refreshLoad(noLoadHld) {
      let wfsList = [];
      wfsList = this.resourceList.filter(group => group.layerType === 'C');
      let resourceMap = {};
      this.resourceMap = resourceMap;
      this.resourceList.map(it => {
        resourceMap[it.layerNo] = { resType: it.resType, resTypeName: it.resTypeName };
      });
      let featureLikeList = [];
      let Filter = this.$map.Filter;
      let filter = Filter.and(
        Filter.equalTo({
          propertyName: 'schemaId',
          expression: this.projectInfo.schemaId,
        }),
        Filter.equalTo({
          propertyName: 'resStatus',
          expression: 'C',
        })
      );
      wfsList.forEach(like => {
        let object = {
          layerNo: like.layerNo,
          filter: filter,
        };
        featureLikeList.push(object);
      });
      let layerAllData = {};
      this.noHldResNUm = 0;
      this.featureLikeList = featureLikeList;
      this.$map.getByFeatureLayers(featureLikeList).then(child => {
        this.layers = child;
        let resTypeHldMap = {};
        child.map(item => {
          const attributes = item.attributes || {};
          if (attributes.zGisKey !== undefined && (!attributes.zGisKey || !attributes.aGisKey)) {
            return;
          }
          const { resType, resTypeName } = resourceMap[item.layerNo];
          //请求后台接口，获取能力模版的配置

          //每个资源类型下面有多少资源，归总一下
          layerAllData[resType] = layerAllData[resType] || {};
          item.resType = resType;
          item.resTypeName = resTypeName;
          item.hldTemplateId = attributes.hldTemplateId;
          if (item.hldTemplateId) {
            resTypeHldMap[item.hldTemplateId] = resType;
            layerAllData[resType][item.hldTemplateId] = layerAllData[resType][item.hldTemplateId] || {
              selectedResList: [], //已选型列表
              selectedResNum: 0, //已选型总数
              noSelectResList: [], //未选型列表
              noSelectResNum: 0, //未选型总数,
              allResList: [], //资源总列表
              alllNum: 0, //该能力模版下所有资源总数
              resType: resType,
              resTypeName,
              hldTemplateId: item.hldTemplateId,
            };
            if (attributes.resId) {
              //存在则表明该资源已选型
              layerAllData[resType][item.hldTemplateId].selectedResList.push(item);
              layerAllData[resType][item.hldTemplateId].selectedResNum++;
            } else {
              layerAllData[resType][item.hldTemplateId].noSelectResList.push(item);
              layerAllData[resType][item.hldTemplateId].noSelectResNum++;
            }
            layerAllData[resType][item.hldTemplateId].allResList.push(item);
            layerAllData[resType][item.hldTemplateId].alllNum++;
          } else {
            this.noHldResNUm++;
          }
        });
        let hldKeys = Object.keys(resTypeHldMap);
        this.resTypeHldMap = resTypeHldMap;
        if (hldKeys.length) {
          const formatHldTme = res => {
            this.resTemplateMap = {};
            this.defSelectMap = {};
            this.hldToTemList = res || [];
            (res || []).map(it => {
              (it.resources || []).map(item => {
                this.resTemplateMap[item.id] = item;
                if (item.isDefault === 'Y') {
                  this.defSelectMap[it.templateId] = item.id;
                }
              });
              if (it.resources && it.resources.length && !this.defSelectMap[it.templateId]) {
                this.defSelectMap[it.templateId] = it.resources[0].id;
              }
              layerAllData[it.resType][it.templateId].resources = it.resources;
              layerAllData[it.resType][it.templateId].hldTemplateName = it.templateName;
              layerAllData[it.resType][it.templateId].hldTemplateObj = it;
            });
            this.layerAllData = JSON.parse(JSON.stringify(layerAllData));
            this.formatTableData();
          };
          if (noLoadHld === 'Y') {
            //不用重新请求
            formatHldTme(this.hldToTemList);
          } else {
            getHldToTemList(this.projectInfo.sprintId, hldKeys).then(res => {
              formatHldTme(res);
            });
          }
        }
      });
    },
    //筛选切换/格式化表格数据
    formatTableData(call) {
      let list = Object.values(this.layerAllData);
      let tableData = [];
      let type = this.filterModel;
      list.map(item => {
        let dataList = Object.values(item);
        dataList.map(it => {
          if (it.resources && it.resources.length) {
            if (type === 'ALL') {
              //总资源
              if (it.alllNum > 0) {
                tableData.push({
                  ...it,
                  showResNum: it.alllNum,
                  subResList: it.allResList,
                });
              }
            } else if (type === 'SELECED') {
              //已选型资源
              if (it.selectedResNum > 0) {
                tableData.push({
                  ...it,
                  showResNum: it.selectedResNum,
                  subResList: it.selectedResList,
                });
              }
            } else {
              if (it.noSelectResNum > 0) {
                tableData.push({
                  ...it,
                  showResNum: it.noSelectResNum,
                  subResList: it.noSelectResList,
                });
              }
            }
          }
        });
      });
      this.gridData = tableData;
    },
    batchUpdateDefault(call) {
      let params = {};
      for (let key in this.resTemplateMap) {
        params[key] = {
          id: key,
          isDefault: 'N',
        };
      }
      for (let key in this.defSelectMap) {
        if (this.defSelectMap[key]) {
          params[this.defSelectMap[key]] = {
            id: this.defSelectMap[key],
            isDefault: 'Y',
          };
        }
      }
      updateIsDefultHld(Object.values(params)).then(() => {
        call && call();
      });
    },
    applyFunc() {
      this.$map.getByFeatureLayers(this.featureLikeList).then(tlayers => {
        this.layers = tlayers;
        let params = [];
        let errorMsg = [];
        for (let key in this.defSelectMap) {
          if (this.defSelectMap[key]) {
            let resType = this.resTypeHldMap[key];
            let gisList =
              this.layerAllData[resType][key][
                this.filterModel === 'ALL' ? 'allResList' : this.filterModel === 'SELECED' ? 'selectedResList' : 'noSelectResList'
              ];
            const hldInfo = this.layerAllData[resType][key].hldTemplateObj;

            gisList.forEach((item, index) => {
              const itAttrs = item.attributes || {};
              let child = {
                schemaId: this.projectInfo.schemaId,
                mapNo: this.projectInfo.mapNo,
                resFlag: 'BOTH',
                action: 'A', //选型为A，重新选型为R
                resInfo: {},
                gisInfo: {},
                resType: resType,
                gisKey: itAttrs.gisKey,
              };
              const templateInfo = this.resTemplateMap[this.defSelectMap[key]];
              let removeNullAttr = {};
              for (let key in itAttrs) {
                if (itAttrs[key] || itAttrs[key] === 0) {
                  removeNullAttr[key] = itAttrs[key];
                }
              }
              child.resInfo = {
                ...child.resInfo,
                cableType: itAttrs.cableType,
                resSpecId: resType,
                schemaId: this.projectInfo.schemaId,
                sprintId: this.projectInfo.sprintId,
                projectId: this.projectInfo.projectId,
                cityId: this.projectInfo.regionId || '',
                name: itAttrs.resName,
                fullName: itAttrs.resName,
                modelId: templateInfo.modelId || '', //需要在资源列表数据中带过来
                templateId: templateInfo.confTemplateId || templateInfo.benchTemplateId,
                fixType: itAttrs.fixType,
                latitude: itAttrs.latitude,
                longitude: itAttrs.longitude,
                price: templateInfo.price || 0,
                cfgTemplateId: templateInfo.confTemplateId,
                modelIdDesc: templateInfo.modelName || '',
                templateIdDesc: templateInfo.templateName || '',
                vendorId: templateInfo.vendorCode || '',
                splitRatio: templateInfo.splitRatio || '',
              }; //form内容写入resInfo
              child.gisInfo.graphicsAttrs = {
                ...itAttrs,
                price: templateInfo.price || 0,
              };
              child.gisInfo.resType = resType;
              if (itAttrs.resId) {
                child.resId = itAttrs.resId;
                child.action = 'R';
              } else {
                if (itAttrs.gisLen) {
                  child.resInfo.length = itAttrs.gisLen;
                  child.gisInfo.length = Number(itAttrs.gisLen);
                }
                if (itAttrs.aGisKey) {
                  const aIt = this.layers.find(ait => itAttrs.aGisKey === ait.id);
                  let isSelectModel = false; //A节点是否选型
                  if (aIt) {
                    child.resInfo.aResSpecId = aIt.resType || (this.resourceMap[aIt.layerNo] && this.resourceMap[aIt.layerNo].resType);
                    if (aIt.attributes.resId) {
                      isSelectModel = true;
                    } else {
                      if (aIt.attributes.hldTemplateId) {
                        //有能力模版，看这个能力模版有没有选资源模版
                        if (this.defSelectMap[aIt.attributes.hldTemplateId]) {
                          //有选择
                          isSelectModel = true;
                        }
                      }
                    }

                    if (child.resInfo.aResSpecId === 'A5') {
                      child.resInfo.aResSpecId = 'BUILDING';
                    }
                    child.resInfo.aGisKey = itAttrs.aGisKey;
                    child.resInfo.aResId = aIt.attributes.resId;
                    child.resInfo.aDeviceId = aIt.attributes.resId;
                    child.gisInfo.aLayerNo = aIt.layerNo;
                    child.gisInfo.paths = item.geometry.getPaths && item.geometry.getPaths();
                  }
                  if (!isSelectModel) {
                    errorMsg.push(itAttrs.resName);
                  }
                }
                if (itAttrs.zGisKey) {
                  const zIt = this.layers.find(zit => itAttrs.zGisKey === zit.id);
                  let isSelectModel = false; //Z节点是否选型
                  if (zIt) {
                    child.resInfo.zResSpecId = zIt.resType || (this.resourceMap[zIt.layerNo] && this.resourceMap[zIt.layerNo].resType);
                    if (zIt.attributes.resId) {
                      isSelectModel = true;
                    } else {
                      if (zIt.attributes.hldTemplateId) {
                        //有能力模版，看这个能力模版有没有选资源模版
                        if (this.defSelectMap[zIt.attributes.hldTemplateId]) {
                          //有选择
                          isSelectModel = true;
                        }
                      }
                    }

                    if (child.resInfo.zResSpecId === 'A5') {
                      child.resInfo.zResSpecId = 'BUILDING';
                    }
                    child.resInfo.zGisKey = itAttrs.zGisKey;
                    child.resInfo.zResId = zIt.attributes.resId;
                    child.resInfo.zDeviceId = zIt.attributes.resId;
                    child.gisInfo.zLayerNo = zIt.layerNo;
                  }
                  if (!isSelectModel && errorMsg.indexOf(itAttrs.resName) === -1) {
                    errorMsg.push(itAttrs.resName);
                  }
                }
                child.resInfo.layerNo = item.layerNo;
              }
              child.resInfo.resSpecId = resType;
              child.gisInfo.wkid = item.geometry.spatialReference.wkid + '';
              if (child.resInfo.longitude && child.resInfo.latitude) {
                child.resInfo.longitude = Number(Number(child.resInfo.longitude).toFixed(6));
                child.resInfo.latitude = Number(Number(child.resInfo.latitude).toFixed(6));
                child.gisInfo.wkid = '4326';
              }
              params.push(child);
            });
          }
        }
        console.log('this.defSelectMap:', JSON.stringify(this.defSelectMap));
        console.log('提交数据：', JSON.stringify(params));
        console.log('图层数据', JSON.stringify(this.layers));

        if (errorMsg.length) {
          fish.toast('warn', this.$t('RESOURCE_SELECT_HLD_NO_SELECTMODEL'));
          // fish.toast('warn', `其中${errorMsg.join('、')}两端节点未选型`);
          return;
        }
        if (params.length) {
          batchAddResources(params).then(resultList => {
            this.batchUpdateDefault(() => {
              fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
              this.refreshLoad('Y');
            });
            this.mapBox.refresh();
            this.mapBox.select();
          });
        } else {
          fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        }
      });
    },
  },
  destroyed() {},
};
</script>

<style lang="scss" scoped>
@import './BatchSelectModel';
</style>
