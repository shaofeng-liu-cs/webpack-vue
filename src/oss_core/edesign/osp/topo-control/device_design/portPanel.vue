<template>
    <el-drawer :visible.sync="drawer" size="280px" :with-header="false" :show-close="false" :modal="false" style="position: absolute" @close="portCloseCallBack">
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
				<div class="show_small_name" v-if="showGisInfoFlag" >cable_size_in:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.cableSizeIn }}</div>
				<div class="show_small_name" v-if="showGisInfoFlag">active_fibres_in:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.activeFibresIn }}</div>
				<div class="show_small_name" v-if="showGisInfoFlag">spare_fibres_in:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.spareFibresIn }}</div>
				<div class="show_small_name" v-if="showGisInfoFlag">cable_size_out:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.cableSizeOut }}</div>
				<div class="show_small_name" v-if="showGisInfoFlag">active_fibres_out:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.activeFibresOut }}</div>
				<div class="show_small_name" v-if="showGisInfoFlag">spare_fibres_out:</div>
				<div class="show_small_value" v-if="showGisInfoFlag">{{ gisInfo.spareFibresOut }}</div>
            </div>
            <div class="panel_space" v-show="!(showNodeType === 'HARDWARE' || showNodeType === 'TUBE')"></div>
            <div class="panel_row" v-show="showNodeType === 'PORT'">
                <div class="show_name">{{ $t('PORT_TYPE') }}</div>
                <div class="show_value">
                    <div class="port_type">{{ portType }}</div>
                </div>
            </div>
            <div class="panel_row" v-show="showNodeType === 'CABLE_UNIT'">
                <div class="show_title">{{ $t('CUT_DEVICE') }}</div>
                <div class="show_all">{{ cutDevice }}</div>
            </div>
            <div class="panel_row" v-show="showNodeType === 'DEVICE' || showNodeType === 'CABLE'">
                <div class="show_title">{{ $t('CUT_INFO') }}</div>
                <div v-for="(item, index) in cutInfoList" class="show_all" :key="index">{{ item }}</div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'PORT' || showNodeType === 'CABLE_UNIT'"></div>
            <div class="panel_row" v-show="showNodeType === 'PORT' || showNodeType === 'CABLE_UNIT'">
                <div class="show_name">{{ $t('STATUS') }}</div>
                <div class="show_value">
                    <div class="p_value">{{ status }}</div>
                </div>
            </div>
            <div class="panel_space"></div>
            <div class="panel_row">
                <div class="show_name">{{ $t('LIFE_STATUS') }}</div>
                <div class="show_value">
                    <div class="p_value">{{ lifeStatus }}</div>
                </div>
            </div>
            <div class="panel_space" v-show="showNodeType === 'HARDWARE' || showNodeType === 'DEVICE' || showNodeType === 'CABLE'"></div>
            <div class="panel_row" v-show="showNodeType === 'HARDWARE' || showNodeType === 'DEVICE' || showNodeType === 'CABLE'">
                <div class="show_name">{{ $t('DESIGN_STATUS') }}</div>
                <div class="show_value">
                    <div class="p_value">{{ designStatus }}</div>
                </div>
            </div>
            <div class="panel_space" v-show="!(showNodeType === 'HARDWARE' || showNodeType === 'TUBE')"></div>
            <div class="panel_row" v-show="!(showNodeType === 'HARDWARE' || showNodeType === 'TUBE')">
                <div class="show_title">{{ $t('CONNECTED') }}：</div>
                <div v-for="(item, index) in connList" class="show_all" :key="index" v-show="(portInfo.baseSpecId === 'PORT' || portInfo.baseSpecId === 'CABLE_UNIT')">
                    <div>{{ item.connText }}</div>
                    <div class="show_value">
                        <div class="p_value">{{ item.connStatus }}</div>
                    </div>
                </div>
                <div v-for="(item, index) in connList" class="show_all" :key="'info1-'+ index" v-show="!(portInfo.baseSpecId === 'PORT' || portInfo.baseSpecId === 'CABLE_UNIT')">
                    {{ item }}
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { getNodeInfo, getConfigureInfo } from '../../../api/query/schema';
import result_panel from '@/oss_core/base/locale/zh-CN/message/result_panel';
import LayerControl from '../../sidebar/layerControl/LayerControl.vue';
export default {
  components: {
    LayerControl,
  },
  name: 'PortPanel',
  props: {
    portDrawerShow: {
      type: Boolean,
      default: false,
    },
    portCloseCallBack: {
      type: Function,
      default: function () {},
    },
  },
  data() {
    return {
      drawer: this.portDrawerShow,
      schemaId: '',
      name: '',
      fullName: '',
      connList: [],
      cutInfoList: [],
      cutDevice: '',
      status: '',
      lifeStatus: '',
      designStatus: '',
      resType: '',
      resTypeName: '',
      confResult: '',
      showNodeType: '',
      portType: '',
      showResTypeBackFlag: false,
	  gisInfo:{},
      showGisInfoFlag:false,
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
    setData(port, schemaId) {
      this.initData();
      this.portInfo = port.getAttrObject();
      this.schemaId = schemaId;
      if (this.portInfo.baseSpecId === 'PORT') {
        this.loadPortInfo(); //设备端口
      } else if (this.portInfo.baseSpecId === 'CABLE_UNIT') {
        this.loadUnitInfo(); //光缆纤芯
      } else if (this.portInfo.baseSpecId === 'HARDWARE') {
        this.loadHardwareInfo(); //硬件
      } else if (this.portInfo.baseSpecId === 'TUBE') {
        this.loadTubeInfo(); //纤束管
      } else if (this.portInfo.baseSpecId === 'DEVICE') {
        this.loadDeviceInfo(); //设备
      } else if (this.portInfo.baseSpecId === 'CABLE') {
        this.loadCableInfo(); //光缆
      }
    },

    initData() {
      this.drawer = this.portDrawerShow;
      this.schemaId = '';
      this.name = '';
      this.fullName = '';
      this.portType = '';
      this.connList = [];
      this.cutInfoList = [];
      this.cutDevice = '';
      this.status = '';
      this.lifeStatus = '';
      this.designStatus = '';
      this.resType = '';
      this.resTypeName = '';
      this.resSpecId = '';
      this.showNodeType = '';
      this.showResTypeBackFlag = false;
	  this.gisInfo={};
	  this.showGisInfoFlag=false;
	  
    },

    loadPortInfo() {
      this.showNodeType = 'PORT';
      getNodeInfo(this.schemaId, this.portInfo.portId, this.portInfo.resSpecId).then(datas => {
        let connText = '';
        let connStatus = '';
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        // 根据name与fullname进行区分
        if (datas.linkEndResList) {
          for (let i = 0; i < datas.linkEndResList.length; i++) {
            let inOrOut = '';
            if (datas.linkEndResList[i]['inOutFlag'] === 'IN') {
              inOrOut = ' (In)';
            } else if (datas.linkEndResList[i]['inOutFlag'] === 'OUT') {
              inOrOut = ' (Out)';
            } else if (datas.linkEndResList[i]['inOutFlag'] === 'NA') {
              inOrOut = ' (N/A)';
            }
            if (this.confResult === 'name') {
              connText = datas.linkEndResList[i]['masterName'] + ' / ' + datas.linkEndResList[i]['subName'] + inOrOut;
            } else if (this.confResult === 'fullName') {
              connText = datas.linkEndResList[i]['masterFullName'] + ' / ' + datas.linkEndResList[i]['subFullName'] + inOrOut;
            }
            connStatus = datas.linkEndResList[i].lifeStatus;
            this.connList.push({ connText: connText, connStatus: connStatus });
          }
        }
        this.portType = datas.resTypeName;
        this.status = datas.status;
        this.lifeStatus = datas.lifeStatus;
      });
    },

    loadUnitInfo() {
      this.showNodeType = 'CABLE_UNIT';
      getNodeInfo(this.schemaId, this.portInfo.unitId, this.portInfo.resSpecId).then(datas => {
        let connText = '';
        let connStatus = '';
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        // 根据name与fullname进行区分
        if (datas.linkEndResList) {
          for (let i = 0; i < datas.linkEndResList.length; i++) {
            let inOrOut = '';
            if (datas.linkEndResList[i]['inOutFlag'] === 'IN') {
              inOrOut = ' (In)';
            } else if (datas.linkEndResList[i]['inOutFlag'] === 'OUT') {
              inOrOut = ' (Out)';
            } else if (datas.linkEndResList[i]['inOutFlag'] === 'NA') {
              inOrOut = ' (N/A)';
            }
            if (this.confResult === 'name') {
              connText = datas.linkEndResList[i]['masterName'] + ' / ' + datas.linkEndResList[i]['subName'] + inOrOut;
            } else if (this.confResult === 'fullName') {
              connText = datas.linkEndResList[i]['masterFullName'] + ' / ' + datas.linkEndResList[i]['subFullName'] + inOrOut;
            }
            // this.connList.push(connText);
            connStatus = datas.linkEndResList[i].lifeStatus;
            this.connList.push({ connText: connText, connStatus: connStatus });
          }
        }
        if (datas.cutPoint) {
          this.cutDevice = datas.cutPoint[this.confResult];
        }
        this.status = datas.status;
        this.lifeStatus = datas.lifeStatus;
      });
    },

    loadHardwareInfo() {
      this.showNodeType = 'HARDWARE';
      getNodeInfo(this.schemaId, this.portInfo.hardwareId, this.portInfo.resSpecId).then(datas => {
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

    loadTubeInfo() {
      this.showNodeType = 'TUBE';
      getNodeInfo(this.schemaId, this.portInfo.unitId, this.portInfo.resSpecId).then(datas => {
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
        this.lifeStatus = datas.lifeStatus;
      });
    },

    loadDeviceInfo() {
      this.showNodeType = 'DEVICE';
      getNodeInfo(this.schemaId, this.portInfo.deviceId, this.portInfo.resSpecId).then(datas => {
        console.log(datas);
        this.resType = datas.resType;
        this.resTypeName = datas.resTypeName;
        this.name = datas.name;
        this.fullName = datas.fullName;
		let gisInfoList = datas.gisInfo||[];
		if(gisInfoList.length>0){
			this.gisInfo=gisInfoList[0].attributes;
			this.showGisInfoFlag=true;
		}
        // 根据name与fullname进行区分
        if (datas.cableList) {
          for (let i = 0; i < datas.cableList.length; i++) {
            this.connList.push(datas.cableList[i][this.confResult]);
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

    loadCableInfo() {
      this.showNodeType = 'CABLE';
      getNodeInfo(this.schemaId, this.portInfo.cableId, this.portInfo.resSpecId).then(datas => {
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
    portDrawerShow: {
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
.drawer_panel_box > .panel_row > .show_all > .show_value > .p_value {
  float: right;
  font-size: 11px;
  min-width: 40px;
  height: 25px;
  border-radius: 20px;
  padding: 5px 10px;
  // padding-top: 5px;
  // padding-bottom: 5px;
  // padding-left: 10px;
  // padding-right: 10px;
  background-color: #ff6600;
  color: #ffffff;
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
    > .show_name {
      width: 40%;
      padding-top: 5px;
      font-weight: bold;
      font-size: 12px;
    }
    > .show_small_name {
      width: 40%;
      padding-top: 5px;
      font-size: 12px;
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
    }
    > .show_small_value {
      width: 60%;
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
      > .port_type {
        font-size: 11px;
        min-width: 120px;
        height: 25px;
        border-radius: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
        background-color: #ff6600;
        color: #ffffff;
        text-align: center;
      }
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
