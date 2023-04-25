<template>
    <el-drawer :visible.sync="drawer" size="280px" :with-header="false" :show-close="false" :modal="false" style="position: absolute" @close="pipeCloseCallBack">
        <div class="drawer_bottom">
            <div class="drawer_bottom_center"></div>
        </div>
        <div class="drawer_panel_box">
            <div class="panel_row">
                <div class="res_title">
                    <span class="icon_osp icon_ospoutdent"></span>{{ $t('RES_TYPE') }} : <br v-show="showResTypeBackFlag" />{{ resTypeName }}
                </div>
            </div>
            <div class="panel_space"></div>
            <div class="panel_row">
                <div class="show_title">{{ $t('INFORMATION') }}：</div>
                <div class="show_small_name">Name:</div>
                <div class="show_small_value">{{ name }}</div>
                <div class="show_small_name">Full Name:</div>
                <div class="show_small_value">{{ fullName }}</div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'CABLE'"></div>
            <div class="panel_row" v-show="showNodeType === 'CABLE'">
                <div class="show_title">{{ $t('CONNECTED') }}：</div>
                <div v-for="(item, index) in connList" class="show_all" :key="index">{{ item }}</div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'CABLE'"></div>
            <div class="panel_row" v-show="showNodeType === 'CABLE'">
                <div class="show_title">{{ $t('CUT_INFO') }}</div>
                <div v-for="(item, index) in cutInfoList" class="show_all" :key="index">{{ item }}</div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'DUCT'"></div>
            <div class="panel_row" v-show="showNodeType === 'DUCT'">
                <div class="show_title">{{ $t('CONNECTED') }}：</div>
                <div v-for="(item, index) in connList" class="show_all" :key="index">{{ item }}</div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'DUCT' || showNodeType === 'PIPE_HOLE'"></div>
            <div class="panel_row" v-show="showNodeType === 'DUCT' || showNodeType === 'PIPE_HOLE'">
                <div class="show_title">{{ $t('CABLE_THROUGH_INFO') }}：</div>
                <div class="show_rate">
                    <div class="show_rate_all">
                        <div v-for="(item, index) in cableThrList" class="show_rate_item" :key="index">{{ item }}</div>
                    </div>
                    <div class="show_rate_value">
                        <div class="p_value">{{ rate }}</div>
                    </div>
                </div>
            </div>
            <div class="panel_space"></div>
            <div class="panel_row">
                <div class="show_name">{{ $t('LIFE_STATUS') }}</div>
                <div class="show_value">
                    <div class="p_value">{{ lifeStatus }}</div>
                </div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'PIPELINE' || showNodeType === 'DUCT'"></div>
            <div class="panel_row" v-show="showNodeType === 'PIPELINE' || showNodeType === 'DUCT'">
                <div class="show_name">{{ $t('DESIGN_STATUS') }}</div>
                <div class="show_value">
                    <div class="p_value">{{ designStatus }}</div>
                </div>
            </div>
        </div>
    </el-drawer>
</template>
<script>
import { getNodeInfo, getConfigureInfo } from '../../../api/query/schema';
import LayerControl from '../../sidebar/layerControl/LayerControl.vue';
export default {
  components: {
    LayerControl,
  },
  name: 'PipePanel',
  props: {
    pipeDrawerShow: {
      type: Boolean,
      default: false,
    },
    pipeCloseCallBack: {
      type: Function,
      default: function () {},
    },
  },
  data() {
    return {
      drawer: this.pipeDrawerShow,
      schemaId: '',
      name: '',
      fullName: '',
      connList: [],
      cutInfoList: [],
      lifeStatus: '',
      designStatus: '',
      resType: '',
      resTypeName: '',
      confResult: '',
      resSpecId: '',
      showNodeType: '',
      connList: [],
      cableThrList: [],
      rate: '',
      showResTypeBackFlag: false,
    };
  },
  created() {},
  mounted() {
    getConfigureInfo().then(datas => {
      if (datas.labelField === 'NAME') {
        this.confResult = 'name';
      } else if (datas.labelField === 'FULLNAME') {
        this.confResult = 'fullName';
      }
    });
  },
  methods: {
    setData(pipe, schemaId) {
      this.initData();
      this.pipeInfo = pipe.getAttrObject();
      this.schemaId = schemaId;
      if (this.pipeInfo.resSpecId === 'PIPELINE_G') {
        this.loadDuctInfo(); //管道组
      } else if (this.pipeInfo.resSpecId === 'PIPELINE_B') {
        this.loadPipelineInfo(); //管道块
      } else if (this.pipeInfo.resSpecId === 'PIPELINE') {
        this.loadPipeHoleInfo(); //管孔
      } else if (this.pipeInfo.resSpecId === 'F_CABLE') {
        this.loadCableInfo(); //站点
      }
    },

    initData() {
      this.drawer = this.pipeDrawerShow;
      this.schemaId = '';
      this.name = '';
      this.fullName = '';
      this.connList = [];
      this.cutInfoList = [];
      this.lifeStatus = '';
      this.designStatus = '';
      this.resType = '';
      this.resTypeName = '';
      this.resSpecId = '';
      this.showNodeType = '';
      this.connList = [];
      this.cableThrList = [];
      this.rate = '';
      this.showResTypeBackFlag = false;
    },

    loadDuctInfo() {
      this.showNodeType = 'DUCT';
      getNodeInfo(this.schemaId, this.pipeInfo.pipelineId, this.pipeInfo.resSpecId).then(datas => {
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        // 根据name与fullname进行区分
        for (let i = 0; i < datas.facilityList.length; i++) {
          this.connList.push(datas.facilityList[i][this.confResult]);
        }
        for (let i = 0; i < datas.cableList.length; i++) {
          this.cableThrList.push(datas.cableList[i][this.confResult]);
        }
        this.rate = datas.occupyRate;
        this.lifeStatus = datas.lifeStatus;
        if (datas.refType === 'R') {
          this.designStatus = 'Reference';
        } else if (datas.refType === 'U') {
          this.designStatus = 'Reuse';
        } else if (datas.refType === 'N') {
          this.designStatus = 'New';
        } else {
          this.designStatus = '';
        }
      });
    },

    loadPipelineInfo() {
      this.showNodeType = 'PIPELINE';
      getNodeInfo(this.schemaId, this.pipeInfo.pipeChannelId, this.pipeInfo.resSpecId).then(datas => {
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        this.lifeStatus = datas.lifeStatus;
        if (datas.refType === 'R') {
          this.designStatus = 'Reference';
        } else if (datas.refType === 'U') {
          this.designStatus = 'Reuse';
        } else if (datas.refType === 'N') {
          this.designStatus = 'New';
        } else {
          this.designStatus = '';
        }
      });
    },

    loadPipeHoleInfo() {
      this.showNodeType = 'PIPE_HOLE';
      getNodeInfo(this.schemaId, this.pipeInfo.pipeChannelId, this.pipeInfo.resSpecId).then(datas => {
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        // 根据name与fullname进行区分
        for (let i = 0; i < datas.cableList.length; i++) {
          this.cableThrList.push(datas.cableList[i][this.confResult]);
        }
        this.rate = datas.occupyRate;
        this.lifeStatus = datas.lifeStatus;
      });
    },

    loadCableInfo() {
      this.showNodeType = 'CABLE';
      getNodeInfo(this.schemaId, this.pipeInfo.cableId, this.pipeInfo.resSpecId).then(datas => {
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        // 根据name与fullname进行区分
        if (datas.deviceList) {
          for (let i = 0; i < datas.deviceList.length; i++) {
            this.connList.push(datas.deviceList[i][this.confResult]);
          }
        }
        if (datas.cutRecordList) {
          for (let i = 0; i < datas.cutRecordList.length; i++) {
            this.cutInfoList.push(datas.cutRecordList[i][this.confResult] + ' : ' + datas.cutRecordList[i]['cutUnitRecord']);
          }
        }
        this.lifeStatus = datas.lifeStatus;
        if (datas.refType === 'R') {
          this.designStatus = 'Reference';
        } else if (datas.refType === 'U') {
          this.designStatus = 'Reuse';
        } else if (datas.refType === 'N') {
          this.designStatus = 'New';
        } else {
          this.designStatus = '';
        }
      });
    },
  },
  watch: {
    pipeDrawerShow: {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.drawer = val;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer_bottom {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1000;
  background-color: #e9e9e9;
  padding: 6px;
  .drawer_bottom_center {
    width: 268px;
    height: calc(100% - 12px);
    background-color: #ffffff;
    z-index: -1;
    position: absolute;
  }
}
.drawer_panel_box {
  width: 280px;
  height: auto;
  position: relative;
  z-index: 1000;
  background-color: #e9e9e9;
  padding: 6px 6px 2px 6px;
  > .panel_row {
    width: 100%;
    height: auto;
    background-color: #ffffff;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    > .res_title {
      width: 100%;
      font-weight: bold;
      font-size: 12px;
      > span {
        font-size: 14px;
        padding-right: 10px;
        width: 48px;
        height: 48px;
      }
    }
    > .show_title {
      width: 100%;
      padding-bottom: 10px;
      font-weight: bold;
      font-size: 12px;
    }
    > .show_all {
      width: 100%;
      font-size: 12px;
    }
    > .show_rate {
      width: 100%;
      height: auto;
      background-color: #ffffff;
      display: flex;
      flex-wrap: wrap;
      > .show_rate_all {
        width: 70%;
        padding-top: 5px;
        > .show_rate_item {
          width: 100%;
          word-wrap: break-word;
          word-break: break-all;
          overflow: hidden;
        }
      }
      > .show_rate_value {
        width: 30%;
        padding-left: 15px;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        flex-direction: row-reverse;
        > .p_value {
          font-size: 11px;
          min-width: 40px;
          height: 25px;
          border-radius: 20px;
          padding-top: 5px;
          padding-bottom: 5px;
          padding-left: 10px;
          padding-right: 10px;
          background-color: #ff6600;
          color: #ffffff;
        }
      }
    }
    > .show_name {
      width: 40%;
      padding-top: 5px;
      font-weight: bold;
      font-size: 12px;
    }
    > .show_small_name {
      width: 30%;
      padding-top: 5px;
      font-size: 12px;
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
    }
    > .show_small_value {
      width: 70%;
      padding-top: 5px;
      font-size: 12px;
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
    }
    > .show_value {
      width: 60%;
      padding-left: 15px;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      flex-direction: row-reverse;
      > .p_value {
        font-size: 11px;
        min-width: 40px;
        height: 25px;
        border-radius: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
        background-color: #ff6600;
        color: #ffffff;
      }
    }
  }
  > .panel_space {
    width: 100%;
    height: 2px;
    background-color: #e9e9e9;
  }
}
</style>
