<!--
 * @Author: your name
 * @Date: 2020-12-27 23:13:40
 * @LastEditTime: 2022-08-23 11:37:09
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\lldDesign\lldResTree\LldResTree.vue
-->
<template>
  <div class="lld-res-tree">
    <div class="title-panel">
      <!-- <h3>ResTree</h3> -->
      <div class="res-tree-content">
        <div v-for="items in treeList" :key="items.name">
          <div>
            <div class="layer-grid-tap-tit">
              <div class="tap icon_osp" :class="items.show ? 'icon_ospsuoxiao' : 'icon_ospfangda'" @click="gridToggle(items)"></div>
              <div>{{ items.name }}</div>
              <!-- <div>Connected Resources</div> -->
            </div>
          </div>
          <transition v-on:enter="enter" v-on:leave="leave">
            <div class="layer-grid-body-content v9-transition" v-show="items.show" :ref="items.name">
              <div v-for="(item, index) in items.childList" :key="index">
                <div class="layer-grid-tap-tit layer-grid-tap-content">
                  <div></div>
                  <div>
                    <input type="checkbox" v-model="item.isCheck" @change="checkboxOne($event, item, items)" />
                  </div>
                  <div>
                    <img :src="`oss_core/edesign/assets/image/map/new-layer/${item.resType}.png`" alt="" />
                  </div>
                  <div :title="`${item.resName}(${item.relation})`" v-if="item.relation" :style="{ color: item.logicCable ? '#f44336' : 'initial' }">
                    {{ `${item.resName}(${item.relation})` }}
                  </div>
                  <div :title="item.resName" v-else>{{ item.resName }}</div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="title-panel">
      <h3>{{ $t('LLD_DESIGN_INNER_FUNCTION') }}</h3>
      <div v-if="type === 'Device'">
        <button type="button" class="btn btn-primary" @click="connection('D')">{{ $t('LLD_DESIGN_INNER_DESIGN') }}</button>
        <button type="button" :disabled="jumpDisabled" class="btn btn-primary" @click="connection('DD')">
          {{ $t('LLD_DESIGN_JUMP') }}
        </button>
        <button type="button" :disabled="teminationDisabled" class="btn btn-primary" @click="connection('PC')">
          {{ $t('LLD_DESIGN_TERMINATION') }}
        </button>
        <button type="button" :disabled="spliceDisabled" class="btn btn-primary" @click="connection('CC')">
          {{ $t('LLD_DESIGN_SPLICE') }}
        </button>
        <button type="button" :disabled="cutDisabled" class="btn btn-primary" @click="connection('CUT')">
          {{ $t('LLD_DESIGN_INNER_CUT') }}
        </button>
      </div>
      <div v-else-if="type === 'PipeLineJoint'">
        <button type="button" :disabled="branchDisabled" class="btn btn-primary" @click="connection('BRANCH')">
          {{ $t('LLD_DESIGN_INNER_BRANCH') }}
        </button>
      </div>
      <div v-else>
        <button type="button" :disabled="innerResList.length < 1" class="btn btn-primary" @click="move('out')">
          {{ $t('LLD_DESIGN_INNER_MOVE_OUT') }}
        </button>
        <button type="button" :disabled="outerResList.length < 1" class="btn btn-primary" @click="move('in')">
          {{ $t('LLD_DESIGN_INNER_MOVE_IN') }}
        </button>
      </div>
    </div>
    <Popup :popupObj="selectRoom" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
      <template v-slot:popupBody>
        <div class="content-label-title">Room:</div>
        <div class="select-popup">
          <el-scrollbar>
            <el-radio-group v-model="roomId" class="radio-select">
              <el-radio v-for="(room, index) in roomList" :key="index" :label="room.roomId">{{ room.name }}</el-radio>
            </el-radio-group>
          </el-scrollbar>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryPointRelaResInfo } from '@/oss_core/edesign/api/query/resId.js';
import { editDevicePlace, removeCableInDuct } from '@/oss_core/edesign/api/edit/resId.js';
import { removeCableOutDuct } from '@/oss_core/edesign/api/del/resId.js';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';
import { connectedName, jumpName, throughName, sectionName, outerName, innerName } from '@/oss_core/base/utils/GlobalConst.js';

export default {
  //import引入的组件
  components: {},
  props: {
    resInfo: {
      type: Object,
      default: () => {
        return {
          resId: '',
          resType: '',
          schemaId: '',
          mapNo: '',
        };
      },
    },
  },
  inject: {
    getSiteInfo: {
      default: () => {},
    },
  },
  computed: {
    roomList() {
      return this.getSiteInfo().roomList;
    },
  },
  data() {
    return {
      treeList: [], // 树数据容器
      cableList: [], // 设备类型树选择的光缆数组
      selectThroughList: [], // 勾选的直通光缆
      selectConnectedList: [], // 勾选的关联光缆
      selectJumpList: [], //勾选的跳接设备
      jumpDisabled: true, //跳接按钮控制
      teminationDisabled: true, // 成端按钮控制
      spliceDisabled: true, // 熔接按钮控制
      cutDisabled: true, // 掏接按钮控制
      branchDisabled: true, //分歧控制按钮
      outerResList: [], //选择的移出设备数组
      innerResList: [], //选择的移入设备数组
      sectionResList: [], // 选择的设施段数组
      type: '', //当前资源类型
      selectRoom: {
        title: 'Select Room', // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CLOSE'), // 取消按钮
        width: '400', // 宽
        height: 'auto', // 高
        maxHeight: '300px',
        modal: true, //是否遮罩
        show: false, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
      roomId: '',
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.routeNodeClick();
  },
  //方法集合
  methods: {
    getHeight() {
      this.treeList.forEach(item => {
        if (this.$refs[item.name]) {
          let el = this.$refs[item.name][0];
          this.enter(el);
        }
      });
    },
    initTree() {
      this.teminationDisabled = true;
      this.spliceDisabled = true;
      this.cutDisabled = true;
      this.branchDisabled = true;
      this.treeList = [];
      this.cableList = [];
      this.selectThroughList = [];
      this.selectConnectedList = [];
      this.selectJumpList = [];
      this.routeNodeClick();
    },

    //节点变换或者数据变化的时候初始化树
    routeNodeClick() {
      let params = {
        resId: this.resInfo.resId,
        resType: this.resInfo.resType,
        queryCable: 'Y',
        mapNo: this.resInfo.mapNo,
        schemaId: this.resInfo.schemaId,
      };
      this.type = getTopoTypeByResType(this.resInfo.resType);
      queryPointRelaResInfo(params).then(data => {
        if (data) {
          if (this.type === 'Device') {
            let cableList = data.cableList;
            data.logicCableList.forEach(cable => {
              cable.logicCable = true; //标记逻辑光缆
              cableList.push(cable);
            });
            let devList = data.relativeDeviceList;
            this.setDeviceTree(cableList, devList);
          } else if (this.type === 'PipeLineJoint') {
            let pipeLineList = data.pipeLineList || [];
            this.setPipeLineTree(data, pipeLineList);
          } else {
            this.setOtherTree(data);
          }
        }
        console.log(data);
      });
    },

    //设置设备树
    setDeviceTree(cableList, devList) {
      let connectedObj = {
        name: connectedName,
        childList: [],
        show: true,
      };
      let throughObj = {
        name: throughName,
        childList: [],
        show: true,
      };
      let jumpObj = {
        name: jumpName,
        childList: devList,
        show: true,
      };
      this.isAz(cableList);
      cableList.forEach(cable => {
        if (cable.relation === '') {
          if (!cable.logicCable) {
            throughObj.childList.push(cable);
          }
        } else {
          if (cable.isCutted !== 'Y') {
            if (cable.zResId === this.resInfo.resId && cable.aResId === this.resInfo.resId) {
              //环形光缆 分开
              let aCable = Object.assign({}, cable);
              let zCable = Object.assign({}, cable);
              aCable.relation = 'A';
              zCable.relation = 'Z';
              connectedObj.childList.push(aCable);
              connectedObj.childList.push(zCable);
            } else {
              connectedObj.childList.push(cable);
            }
          }
        }
      });
      this.treeList.push(connectedObj, jumpObj, throughObj);
      this.$nextTick(this.getHeight);
    },

    //设置设备树
    setPipeLineTree(treeData, pipelineList) {
      let sectionObj = {
        name: sectionName,
        childList: treeData.sectionResList ? treeData.sectionResList : [],
        show: true,
      };
      let innerObj = {
        name: innerName,
        childList: treeData.innerResList ? treeData.innerResList : [],
        show: true,
      };
      let outerObj = {
        name: outerName,
        childList: treeData.outerResList ? treeData.outerResList : [],
        show: true,
      };
      let throughObj = {
        name: throughName,
        childList: [],
        show: true,
      };
      pipelineList.forEach(pipeLine => {
        throughObj.childList.push(pipeLine);
      });
      this.isAz(treeData.sectionResList);
      this.treeList.push(sectionObj, innerObj, outerObj, throughObj);
      this.$nextTick(this.getHeight);
    },

    // 会有两个树结构，如果是设备的内部设计则是设备树，其他的都是其他树，设置其他树
    setOtherTree(treeData) {
      let sectionObj = {
        name: sectionName,
        childList: treeData.sectionResList ? treeData.sectionResList : [],
        show: true,
      };
      let innerObj = {
        name: innerName,
        childList: treeData.innerResList ? treeData.innerResList : [],
        show: true,
      };
      let outerObj = {
        name: outerName,
        childList: treeData.outerResList ? treeData.outerResList : [],
        show: true,
      };
      this.isAz(treeData.sectionResList);
      this.treeList.push(sectionObj, innerObj, outerObj);
      this.$nextTick(this.getHeight);
    },

    //当前设备是不是线资源的AZ端
    isAz(lineList) {
      if (lineList) {
        lineList.forEach(line => {
          // if (line.zResId === this.resInfo.resId && line.aResId === this.resInfo.resId) {
          //     line.relation = 'A,Z';
          // } else
          if (line.zResId === this.resInfo.resId) {
            line.relation = 'Z';
          } else if (line.aResId === this.resInfo.resId) {
            line.relation = 'A';
          } else {
            line.relation = '';
          }
        });
      }
    },

    //选择或取消一个资源后数据处理
    checkboxOne(e, child, parent) {
      let check = e.target.checked;
      if (this.type === 'Device') {
        if (check) {
          let selectObj = {
            resId: child.resId,
            resSpecId: child.resType,
            name: child.resName,
          };
          if (parent.name === throughName) {
            this.selectThroughList.push(selectObj);
          } else if (parent.name === connectedName) {
            this.selectConnectedList.push(selectObj);
          } else if (parent.name === jumpName) {
            this.selectJumpList.push(selectObj);
          }
        } else {
          if (parent.name === throughName) {
            this.selectThroughList = this.selectThroughList.filter(cable => cable.resId !== child.resId); //取消选中则删除数据
          } else if (parent.name === connectedName) {
            this.selectConnectedList = this.selectConnectedList.filter(cable => cable.resId !== child.resId); //取消选中则删除数据
          } else if (parent.name === jumpName) {
            this.selectJumpList = this.selectJumpList.filter(cable => cable.resId !== child.resId); //取消选中则删除数据
          }
        }
        if (this.selectConnectedList.length === 1 && this.selectThroughList.length === 0 && this.selectJumpList.length === 0) {
          this.teminationDisabled = false;
          this.spliceDisabled = true;
          this.cutDisabled = true;
          this.branchDisabled = true;
          this.jumpDisabled = true;
        } else if (this.selectConnectedList.length === 2 && this.selectThroughList.length === 0 && this.selectJumpList.length === 0) {
          this.teminationDisabled = true;
          this.spliceDisabled = false;
          this.cutDisabled = true;
          this.branchDisabled = true;
          this.jumpDisabled = true;
        } else if (this.selectConnectedList.length === 0 && this.selectThroughList.length === 1 && this.selectJumpList.length === 0) {
          this.teminationDisabled = true;
          this.spliceDisabled = true;
          this.cutDisabled = false;
          this.branchDisabled = false;
          this.jumpDisabled = true;
        } else if (this.selectConnectedList.length === 0 && this.selectThroughList.length === 0 && this.selectJumpList.length === 1) {
          this.teminationDisabled = true;
          this.spliceDisabled = true;
          this.cutDisabled = true;
          this.branchDisabled = true;
          this.jumpDisabled = false;
        } else {
          this.teminationDisabled = true;
          this.spliceDisabled = true;
          this.cutDisabled = true;
          this.branchDisabled = true;
          this.jumpDisabled = true;
        }
      } else {
        if (check) {
          if (parent.name === outerName) {
            this.outerResList.push(child);
          } else if (parent.name === innerName) {
            this.innerResList.push(child);
          } else if (parent.name === sectionName) {
            this.sectionResList.push(child);
          }
        } else {
          if (parent.name === outerName) {
            this.outerResList = this.outerResList.filter(res => res.resId !== child.resId); //取消选中则删除数据
          } else if (parent.name === innerName) {
            this.innerResList = this.innerResList.filter(res => res.resId !== child.resId); //取消选中则删除数据
          } else if (parent.name === sectionName) {
            this.sectionResList = this.sectionResList.filter(res => res.resId !== child.resId); //取消选中则删除数据
          }
        }
      }
    },

    //添加资源
    addRes(resList, type) {
      this.treeList.some(item => {
        if (item.name === type) {
          item.childList.push(...resList);
          return true;
        }
      });
      this.$nextTick(this.getHeight); //刷新树的高度，不然看不到新增的节点；
    },

    //删除资源
    delRes(resList, type) {
      let resIdList = resList.map(res => res.resId);
      this.treeList.some(item => {
        if (item.name === type) {
          item.childList = item.childList.filter(child => resIdList.indexOf(child.resId) < 0);
          return true;
        }
      });
      this.$nextTick(this.getHeight);
    },

    connection(modType) {
      let topoResInfo = {
        mode: modType,
        throughCableList: this.selectThroughList,
        connectedCableList: this.selectConnectedList,
        jumpDeviceList: this.selectJumpList,
      };
      this.$emit('connection', topoResInfo);
    },

    //设备的移入移出
    move(type) {
      let deviceList = type === 'in' ? this.outerResList : this.innerResList;
      let action = type === 'in' ? 'A' : 'D';
      if (this.resInfo.resType === 'PIPELINE_G') {
        if (type === 'in') {
          let paramDeviceList = deviceList.map(device => {
            return device.resId;
          });
          let params = {
            pipelineId: this.resInfo.resId,
            cableList: paramDeviceList,
            sprintId: this.resInfo.sprintId,
          };

          removeCableInDuct(params).then(() => {
            this.reloadResTree(deviceList, action);
          });
        } else {
          let params = deviceList.map(device => {
            return {
              pipelineId: this.resInfo.resId,
              cableId: device.resId,
              sprintId: this.resInfo.sprintId,
            };
          });
          removeCableOutDuct(params).then(() => {
            this.reloadResTree(deviceList, action);
          });
        }
      } else {
        let paramDeviceList = deviceList.map(device => {
          return {
            deviceId: device.resId,
            deviceResType: device.resType,
          };
        });
        let params = {
          mapNo: this.resInfo.mapNo,
          deviceList: paramDeviceList,
          placeResId: this.resInfo.resId,
          placeResType: this.resInfo.resType,
          schemaId: this.resInfo.schemaId,
          action,
        };
        if (action === 'A' && this.resInfo.resType === 'SITE') {
          if (this.roomList.length === 0) {
            fish.warn('Please add room before resource move in!');
            return;
          } else if (this.roomList.length === 1) {
            params.roomId = this.roomList[0].roomId;
          } else {
            this.selectRoom.show = true;
            return;
          }
        }
        editDevicePlace(params).then(() => {
          this.reloadResTree(deviceList, action);
        });
      }
    },
    selectRoomFn() {
      let paramDeviceList = this.outerResList.map(device => {
        return {
          deviceId: device.resId,
          deviceResType: device.resType,
        };
      });
      let params = {
        mapNo: this.resInfo.mapNo,
        deviceList: paramDeviceList,
        placeResId: this.resInfo.resId,
        placeResType: this.resInfo.resType,
        schemaId: this.resInfo.schemaId,
        roomId: this.roomId,
        action: 'A',
      };
      editDevicePlace(params).then(() => {
        this.reloadResTree(this.outerResList, params.action);
      });
    },
    gridToggle(items) {
      items.show = !items.show;
    },
    // 进入中
    enter(el, done) {
      el.style.height = 'auto';
      let endHeight = window.getComputedStyle(el).height;
      el.style.height = '0px';
      el.offsetHeight; // force repaint
      el.style.height = endHeight;
    },

    // 离开时
    leave(el) {
      el.style.height = '0px';
    },

    reloadResTree(deviceList, action) {
      let type = action === 'A' ? 'in' : 'out';
      this.$emit('move', deviceList, type);
      deviceList.forEach(device => {
        device.isCheck = false; // 移除勾选
        if (action === 'A') {
          this.outerResList = this.outerResList.filter(res => res.resId !== device.resId);
        } else {
          this.innerResList = this.innerResList.filter(res => res.resId !== device.resId);
        }
      });
      if (action === 'A') {
        this.addRes(deviceList, innerName);
        this.delRes(deviceList, outerName);
      } else {
        this.addRes(deviceList, outerName);
        this.delRes(deviceList, innerName);
      }
    },
    popupClose() {
      this.selectRoom.show = false;
    },
    popupOk() {
      this.selectRoomFn();
      this.selectRoom.show = false;
    },
  },
  watch: {
    resInfo: {
      deep: true,
      immediate: false,
      handler(val, oldVal) {
        this.initTree();
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import './LldResTree.scss';
</style>
