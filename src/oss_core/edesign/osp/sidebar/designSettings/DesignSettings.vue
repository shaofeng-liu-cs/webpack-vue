<template>
    <div class="design-settings-container sidebar-body">
        <div class="main-content">
            <div>
                <div class="title sidebar-tab-title">{{ $t('SETTING_GIS_OPERATION') }}</div>
                <div class="context">
                    <div class="context-name">{{ $t('SETTING_SELECTION_TOLERANCE') }}</div>
                    <div class="context-value">
                        <input type="text" name="" v-model="selectTolerVal" class="form-control" @change="selectTolerValChange" />
                    </div>
                </div>
                <div class="context">
                    <div class="context-name">{{ $t('SETTING_UNDO_REDO') }}</div>
                    <div class="context-value">
                        <input type="text" name="" v-model="stackVal" class="form-control" @change="stackValChange" />
                    </div>
                </div>
                <div class="context">
                    <div class="context-name">{{ $t('SETTING_SELECTION_TYPE') }}</div>
                    <div class="context-value">
                        <el-switch v-model="switchFlag" :active-text="$t('SETTING_INTERSECTION')" :inactive-text="$t('SETTING_CONTAINS')"></el-switch>
                    </div>
                </div>
            </div>
            <div>
                <div class="title sidebar-tab-title">{{ $t('SETTING_BINDING') }}</div>
                <div class="context">
                    <div class="context-name">{{ $t('SETTING_BINDING_TOLERANCE') }}</div>
                    <div class="context-value">
                        <input type="text" name="" v-model="bindTolerVal" class="form-control" @change="bindTolerValChange" />
                    </div>
                </div>
                <div class="context">
                    <input type="checkbox" v-model="isAutoBind" class="checkbox" @change="autoBindChange" />
                    <div class="checkbox-context">{{ $t('SETTING_AUTO_BIND') }}</div>
                </div>
                <div class="context">
                    <input type="checkbox" v-model="isAutoBindSameLayer" class="checkbox" :disabled="!isAutoBind" />
                    <div class="checkbox-context">{{ $t('SETTING_SAME_LAYER') }}</div>
                </div>
                <div class="context">
                    <input type="checkbox" v-model="isAutoBindMultiLayer" class="checkbox" :disabled="!isAutoBind" />
                    <div class="checkbox-context">{{ $t('SETTING_MULTIPLE_LAYER') }}</div>
                </div>
                <div class="line-res-type require">
                    <div class="line-title">{{ $t('SETTING_LINE_RES_TYPE') }}</div>
                    <Combobox :setting="lineSetting" v-model="selectedLine" dataRule="required" :disabled="!isAutoBindMultiLayer" @change="lineChange"></Combobox>
                </div>
            </div>
            <div class="fun_button">
                <div class="icon_osp icon-flag icon_ospfangda" :class="!isAutoBindMultiLayer || selectedLine === '' ? 'fun_disable' : ''" @click="pointPopup"></div>
                <div class="icon_osp icon-flag icon_ospshanchu" :class="!isAutoBindMultiLayer || selectedLine === '' ? 'fun_disable' : ''" @click="removePoint"></div>
                <div class="icon_osp icon-flag icon_ospdown" :class="!isAutoBindMultiLayer || selectedLine === '' ? 'fun_disable' : ''" @click="downMove"></div>
                <div class="icon_osp icon-flag icon_ospup" :class="!isAutoBindMultiLayer || selectedLine === '' ? 'fun_disable' : ''" @click="upMove"></div>
            </div>
            <div class="point-grid" disabled>
                <Grid :data="selectedPoint" :option="gridOpt" @onSelectRow="clickData" ref="gridRef">
                    <!-- <grid-column label="SEQ" prop="SEQ" width="100"></grid-column> -->
                    <grid-column :label="$t('SETTING_POINT_RES_TYPE')" prop="resTypeName" width="246"></grid-column>
                </Grid>
            </div>
        </div>
        <button type="button" class="btn btn-primary centerBtn row-btn" @click="applyClick">{{ $t('APPLY') }}</button>
        <AddPointRes ref="addPoint" @selectedPoint="refreshPoint"></AddPointRes>
    </div>
</template>

<script>
import { getSchemaSetting, getLineResType, getPointResType } from '../../../api/query/schema';
import { applyDesignSetting } from '../../../api/edit/resId';
import AddPointRes from './addPointRes.vue';
export default {
  name: 'DesignSettings',
  inject: ['getProjectInfo', 'getSchemaConfigs'],
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
    schemaConfigs() {
      return this.getSchemaConfigs();
    },
  },
  components: {
    AddPointRes,
  },
  data() {
    return {
      schemaId: '',
      lineList: [], // 所有线资源
      selectedLine: '', // 已选择的线资源
      pointList: [], // 所有点资源
      selectedPoint: [], // 已选择的点资源
      resArr: [], // 点线资源组合 线资源为第一个元素 后面的元素为点资源
      selectedRes: {}, // 所有资源 对象存储
      multiLayerExtVal: '', // 所有资源 点资源与点资源,分隔  点资源与线资源:分割  线资源与线资源;分隔
      rowData: '', // 鼠标点击的点资源
      bindTolerVal: '10', // 绑定容限 默认10m
      selectTolerVal: '5', // 容限设置 默认5px
      stackVal: '15', // 堆栈大小 默认15
      switchFlag: true,
      isAutoBind: false, // 绘制完线段自动绑定 默认N
      isAutoBindSameLayer: false, // 多个相同图点层自动绑定 默认N
      isAutoBindMultiLayer: false, // 不同图层点自动绑定 默认N
      gridOpt: {
        rownumbers: true,
        rownumWidth: 90,
        height: '300px',
        width: '340',
      },
      lineSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'resTypeName',
        dataValueField: 'resTypeId',
        dataSource: [],
      },
    };
  },
  created() {},
  mounted() {
    this.schemaId = this.projectInfo.schemaId;
    this.mapNo = this.projectInfo.mapNo;
    this.initData();
  },
  activated() {},

  deactivated() {},

  methods: {
    initData() {
      let promiseList = [];
      promiseList.push(getLineResType({ mapNo: this.mapNo })); // 请求线数据
      promiseList.push(getPointResType({ mapNo: this.mapNo })); // 请求点数据
      Promise.all(promiseList).then(promiseResult => {
        if (promiseResult[0] && promiseResult[0].resultList) {
          this.lineSetting.dataSource = promiseResult[0].resultList;
          this.lineSetting.dataSource.forEach(item => {
            this.selectedRes[item.resTypeId] = [];
          });
        }
        if (promiseResult[1] && promiseResult[1].resultList) {
          let i = 1;
          promiseResult[1].resultList.forEach(item => {
            item.SEQ = i++;
            this.pointList.push(item);
          });
          this.$refs.addPoint.pointList = this.pointList;
        }
        // 回填之前的数据 在HLD查询或配置默认值
        this.bindTolerVal = this.schemaConfigs.bindTolerance;
        this.selectTolerVal = this.schemaConfigs.tolerance;
        this.stackVal = this.schemaConfigs.stackDepth;
        this.switchFlag = this.schemaConfigs.selectModel === 'C' ? false : true;
        this.isAutoBind = this.schemaConfigs.autoBind === 'Y' ? true : false;
        this.isAutoBindSameLayer = this.schemaConfigs.autoBindSameLayer === 'Y' ? true : false;
        this.isAutoBindMultiLayer = this.schemaConfigs.autoBindMultiLayer === 'Y' ? true : false;
        if (this.schemaConfigs.multiLayerExtVal) {
          let res = this.schemaConfigs.multiLayerExtVal.split(';'); // 资源以;分隔
          res.forEach(itemRes => {
            let itemResList = itemRes.split(':');
            let lineRes = itemResList[0]; // 每个资源属性对应的线
            let pointRes = itemResList[1].split(','); // 每个资源属性对应的点 以,分隔
            // 将已选资源封装到selectedRes中
            this.selectedRes[lineRes] = [];
            pointRes.forEach(itemPointRes => {
              this.selectedRes[lineRes].push(this.pointList.find(itemPoint => itemPointRes === itemPoint.resTypeId));
            });
          });
        }
      });
    },

    bindTolerValChange() {
      this.bindTolerVal = parseInt(this.bindTolerVal);
      // if (this.bindTolerVal < 1) {
      //     this.bindTolerVal = 1;
      // } else
      if (this.bindTolerVal > 100) {
        this.bindTolerVal = 100;
      } else if (isNaN(this.bindTolerVal)) {
        this.bindTolerVal = 10;
      }
    },

    selectTolerValChange() {
      this.selectTolerVal = parseInt(this.selectTolerVal);
      if (this.selectTolerVal < 1) {
        this.selectTolerVal = 1;
      } else if (this.selectTolerVal > 15) {
        this.selectTolerVal = 15;
      } else if (isNaN(this.selectTolerVal)) {
        this.selectTolerVal = 5;
      }
    },

    stackValChange() {
      this.stackVal = parseInt(this.stackVal);
      if (this.stackVal < 1) {
        this.stackVal = 1;
      } else if (this.stackVal > 20) {
        this.stackVal = 20;
      } else if (isNaN(this.stackVal)) {
        this.stackVal = 15;
      }
    },
    // 第一个多选框未勾选时 下面两个也禁止勾选
    autoBindChange() {
      if (this.isAutoBind === false) {
        this.isAutoBindSameLayer = false;
        this.isAutoBindMultiLayer = false;
      }
    },

    pointPopup() {
      this.$refs.addPoint.popupObj.show = true;
      this.$nextTick(() => {
        this.$refs.addPoint.refreshPointList(this.selectedPoint);
      });
    },
    // 删除点资源
    removePoint() {
      this.selectedPoint = this.selectedPoint.filter(item => item.resTypeId !== this.rowData.resTypeId);
      this.refreshSeq();
    },
    // 表格点击行
    clickData(row) {
      this.rowData = row;
    },
    // 更新点资源
    refreshPoint(currentSelect) {
      this.selectedPoint = currentSelect;
      this.refreshSeq();
    },
    // 上移
    upMove() {
      let temp = '';
      if (this.rowData.SEQ === 1) {
        this.selectedPoint;
      } else {
        temp = this.selectedPoint[this.rowData.SEQ - 1];
        this.selectedPoint[this.rowData.SEQ - 1] = this.selectedPoint[this.rowData.SEQ - 2];
        this.selectedPoint[this.rowData.SEQ - 2] = temp;
      }
      this.refreshSeq();
    },
    // 下移
    downMove() {
      let temp = '';
      if (this.rowData.SEQ === this.selectedPoint.length) {
        this.selectedPoint;
      } else {
        temp = this.selectedPoint[this.rowData.SEQ - 1];
        this.selectedPoint[this.rowData.SEQ - 1] = this.selectedPoint[this.rowData.SEQ];
        this.selectedPoint[this.rowData.SEQ] = temp;
      }
      this.refreshSeq();
    },

    refreshSeq() {
      let tempArr = [];
      let i = 1;
      this.selectedPoint.forEach(item => {
        item.SEQ = i++;
        tempArr.push(item);
      });
      this.selectedPoint = tempArr;
      for (const key in this.selectedRes) {
        if (this.selectedLine === key) {
          this.selectedRes[key] = this.selectedPoint;
        }
      }
    },

    // 线资源类型切换时，展示的点资源联动
    lineChange() {
      this.selectedPoint = this.selectedRes[this.selectedLine];
    },

    applyClick() {
      this.multiLayerExtVal = '';
      for (const key in this.selectedRes) {
        let pointArr = [];
        this.selectedRes[key].forEach(item => {
          pointArr.push(item.resTypeId);
        });
        if (this.selectedRes[key].length !== 0) {
          this.multiLayerExtVal = this.multiLayerExtVal + ';' + key + ':' + pointArr.toString();
        }
      }
      this.multiLayerExtVal = this.multiLayerExtVal.substr(1);
      let params = {
        bindTolerance: this.bindTolerVal,
        tolerance: this.selectTolerVal,
        stackDepth: this.stackVal,
        selectModel: this.switchFlag ? 'I' : 'C',
        autoBind: this.isAutoBind ? 'Y' : 'N',
        autoBindSameLayer: this.isAutoBindSameLayer ? 'Y' : 'N',
        autoBindMultiLayer: this.isAutoBindMultiLayer ? 'Y' : 'N',
        schemaId: this.schemaId,
        multiLayerExtVal: this.isAutoBindMultiLayer ? this.multiLayerExtVal : '',
      };
      applyDesignSetting(params).then(result => {
        this.$root.$emit('refreshDesignSetting');
        fish.success(this.$t('SAVE_SUCCESS'));
      });
    },
  },

  watch: {
    selectedLine: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.selectedLine = val;
      },
    },

    selectedPoint: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.selectedPoint = val;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'designSettings';
</style>
