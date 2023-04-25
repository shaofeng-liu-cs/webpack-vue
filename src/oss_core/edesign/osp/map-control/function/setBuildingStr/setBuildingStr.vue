<template>
  <div class="setBuilding">
    <div class="col-md-6 left">
      <form class="buildType" ref="typeForm">
        <div class="col-md-3 inputLabel">
          <label class="control-label required-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_TYPE') }}</label>
        </div>
        <div class="col-md-9">
          <Combobox type="text" name="type" class="form-control" v-model="row.buildingType" :setting="buildingTypeSetting" dataRule="required" :disabled="typeDisableFlag|| disableFlag"></Combobox>
        </div>
      </form>
      <h5>{{ $t('OSP_MAP_FUNCTION_BUILDING_BASIC') }}</h5>
      <form class="contentForm" ref="basicForm">
        <div class="content">
          <div class="col-md-3 inputLabel">
            <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_AREA') }}</label>
          </div>
          <div class="col-md-9">
            <!-- :disabled="true" -->
            <AddrPub v-model="row.areaName" @select="addrChange" ref="addrPopRef" :cityId="row.cityId" :cityName="row.cityName" :disabled="disableFlag"></AddrPub>
          </div>
        </div>
        <div class="content">
          <div class="col-md-3 inputLabel required-label">
            <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_FULL_NAME') }}</label>
          </div>
          <div class="col-md-9">
            <input type="text" name="no" class="form-control" v-model="row.fullName" data-rule="required" :disabled="disableFlag" />
          </div>
        </div>
        <div class="content">
          <div class="col-md-3 inputLabel required-label">
            <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_NAME') }}</label>
          </div>
          <div class="col-md-9">
            <input type="text" name="name" class="form-control" v-model="row.name" data-rule="required" :disabled="disableFlag" />
          </div>
        </div>
        <div class="content">
          <div class="col-md-3 inputLabel required-label">
            <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_USER_QTY') }}</label>
          </div>
          <div class="col-md-9">
            <input type="number" name="qty" class="form-control" v-model="row.userQty" data-rule="required" :disabled="disableFlag" />
          </div>
        </div>
      </form>
      <h5>{{ $t('OSP_MAP_FUNCTION_BUILDING_EXTENSION') }}</h5>
      <form class="contentForm">
        <div class="content">
          <div class="col-md-3 inputLabel">
            <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_PURPOSE') }}</label>
          </div>
          <div class="col-md-9">
            <Combobox type="text" name="purpose" class="form-control" v-model="row.buildingPurpose" :setting="buildingPurposeSetting" :disabled="disableFlag"></Combobox>
          </div>
        </div>
      </form>
    </div>
    <div class="col-md-6 right">
      <h5 class="title">{{ $t('OSP_MAP_FUNCTION_BUILDING_STRUCTURE') }}</h5>
      <div class="structure" v-if="row.buildingType === '1'">
        <div class="structure-btn">
          <button type="button" class="btn btn-link icon_osp icon_ospjiahao-fang top-btn" :title="$t('ADD')" @click="addTreeNode" :disabled="typeDisableFlag||disableFlag"></button>
          <button type="button" class="btn btn-link icon_osp icon_ospbianji top-btn" :title="$t('EDIT')" @click="editTreeNode" :disabled="(selectedNodeList.length === 0 || typeDisableFlag)||disableFlag"></button>
          <button type="button" class="btn btn-link icon_osp icon_ospshanchu top-btn" :title="$t('DELETE')" @click="deleteTreeNode" :disabled="(selectedNodeList.length === 0 || typeDisableFlag)||disableFlag"></button>
        </div>
        <div class="tree-class" ref="treeEL">
          <Tree :fNodes="singleFNodes" :data="dataIcon" :view="view" @onClick="onClick" @onCheck="getAllCheckedNodes" @afterRemove="afterRemove" :check="check" :edit="edit" ref="structureTree"></Tree>
        </div>
      </div>
      <div class="structure" v-else-if="row.buildingType === '2'">
        <div class="structure-btn">
          <button type="button" class="btn btn-link icon_osp icon_ospjiahao-fang top-btn" :title="$t('ADD')" @click="addTreeNode" :disabled="typeDisableFlag||disableFlag"></button>
          <button type="button" class="btn btn-link icon_osp icon_ospbianji top-btn" :title="$t('EDIT')" @click="editTreeNode" :disabled="(selectedNodeList.length === 0 || typeDisableFlag)||disableFlag"></button>
          <button type="button" class="btn btn-link icon_osp icon_ospshanchu top-btn" title="Delete" @click="deleteTreeNode" :disabled="(selectedNodeList.length === 0 || typeDisableFlag)||disableFlag"></button>
        </div>
        <div class="tree-class" ref="treeEL">
          <Tree :fNodes="fNodes" :data="dataIcon" :view="view" @onClick="onClick" @onCheck="getAllCheckedNodes" @afterRemove="afterRemove" :check="check" :edit="edit" ref="structureTree"></Tree>
        </div>
      </div>
      <div class="structure-image" v-else-if="row.buildingType === '3'"></div>
      <div class="structure" v-else></div>
      <h5 class="title">{{ $t('OSP_MAP_FUNCTION_BUILDING_ADDRESS') }}</h5>
      <div class="tips">
        <label class="control-label">{{ $t('OSP_MAP_FUNCTION_BUILDING_GENERATION') }}</label>
      </div>
    </div>
    <newFloorAndRoom ref="newFloorAndRoom" :graphic="graphic[0]" @addFloorAndRoom="addFloorAndRoom"></newFloorAndRoom>
    <newFloor ref="newFloor" :graphic="graphic[0]" @addFloor="addFloorAndRoom"></newFloor>
    <newUnit ref="newUnit" :graphic="graphic[0]" @addUnit="addUnit"></newUnit>
    <newRoom ref="newRoom" :graphic="graphic[0]" @addRoom="addRoom"></newRoom>
    <editFloor ref="editFloor" :graphic="graphic[0]" @editFloor="editFloor"></editFloor>
    <editUnit ref="editUnit" :graphic="graphic[0]" @editUnit="editUnit"></editUnit>
    <editRoom ref="editRoom" :graphic="graphic[0]" @editRoom="editRoom"></editRoom>
  </div>
</template>

<script>
import newFloorAndRoom from './new-dialogs/newFloorAndRoom.vue';
import newFloor from './new-dialogs/newFloor.vue';
import newUnit from './new-dialogs/newUnit.vue';
import newRoom from './new-dialogs/newRoom.vue';
import editFloor from './edit-dialogs/editFloor.vue';
import editUnit from './edit-dialogs/editUnit.vue';
import editRoom from './edit-dialogs/editRoom.vue';
import { queryEnumValue, queryBuildingStructure, addBuildingStructure, editBuildingStructure } from '../../map-control-api.js';

export default {
  name: 'SetBuilding',
  components: {
    newFloorAndRoom,
    newFloor,
    newUnit,
    newRoom,
    editFloor,
    editUnit,
    editRoom,
  },
  props: {
    functionData: {},
    resData: {
      type: Object,
      default: {},
    },
    graphic: {
      type: Array,
      default: [],
    },
    projectInfo: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      row: {},
      buildingTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'code',
        dataSource: [],
      },
      buildingPurposeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'code',
        dataSource: [],
      },

      fNodes: [],
      singleFNodes: [],
      dataIcon: {
        key: {
          iconFontEnable: false,
        },
        simpleData: {
          enable: true,
        },
      },
      view: {
        showIcon: true,
        showLine: true,
        formatter: function (node) {
          var len = node.name.split(''),
            str = node.name;
          if (len.length > 32) {
            str = node.name.slice(0, 31) + '...';
          }
          return str;
        },
      },
      check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: {
          Y: '',
          N: '',
        }, // Y 属性定义 checkbox 被勾选后的情况； N 属性定义 checkbox 取消勾选后的情况； "p" 表示操作会影响父级节点； "s" 表示操作会影响子级节点。
      },
      edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false,
        drag: {
          autoExpandTrigger: false,
          prev: this.dropPrev,
          inner: this.dropInner,
          next: this.dropNext,
        },
      },

      unitIndex: 1,
      initBuildingInfo: {},
      selectedNodeList: [],

      listenShiftFlag: false,
      lastSelectedList: [],
      typeDisableFlag: false,
      // 是否可编辑的标志
      disableFlag: true,
    };
  },

  mounted() {
    // 如果是查看建筑物结构，禁用按钮
    this.disableFlag = this.functionData.url === 'viewBuildingStr' ? true : false;
    this.row = {};
    this.unitIndex = 1;
    this.initBuildingInfo = {};
    this.selectedNodeList = [];
    $(this.$refs.addrPopRef.$refs.addr_osp).popedit('setValue', {
      name: this.projectInfo.areaName,
      value: this.projectInfo.areaId,
    });
    this.row.areaId = this.projectInfo.areaId;
    this.initValue();
    document.addEventListener('keydown', e => {
      if (e.keyCode == 16) {
        // shift
        if (this.$refs.structureTree) {
          let selectedNodes = $(this.$refs.structureTree.$el).tree('getSelectedNodes');

          if (selectedNodes && selectedNodes.length > 0) {
            this.lastSelectedList = selectedNodes;
            this.listenShiftFlag = true;
          } else {
            this.listenShiftFlag = false;
          }
        } else {
          this.listenShiftFlag = false;
        }
      }
    });

    document.addEventListener('keyup', e => {
      if (e.keyCode == 16) {
        // shift
        this.listenShiftFlag = false;
      }
    });
  },

  methods: {
    onClick(allSelectedList, e, currNode) {
      if (this.listenShiftFlag) {
        // let minId = this.lastSelectedList[0].id;
        let maxId = this.lastSelectedList[this.lastSelectedList.length - 1].tId;
        if (this.lastSelectedList[0].level !== currNode.level) {
          return;
        }
        // $(this.$refs.structureTree.$el).tree("cancelSelectedNode");
        let startIndex = 0;
        let endIndex = 0;
        let currentList;
        if (currNode.level === 0) {
          currentList = $(this.$refs.structureTree.$el).tree('getNodes');
        } else {
          let parentNode = currNode.getParentNode();
          currentList = parentNode.children;
        }
        currentList.forEach((res, index) => {
          if (maxId === res.tId) {
            startIndex = index;
          }
          if (currNode.tId === res.tId) {
            endIndex = index;
          }
        });
        currentList.forEach((res, index) => {
          if (startIndex === index || (startIndex < index && index < endIndex) || index === endIndex) {
            $(this.$refs.structureTree.$el).tree('checkNode', res, null, false, true);
          }
        });
      } else {
        $(this.$refs.structureTree.$el).tree('cancelSelectedNode');
        $(this.$refs.structureTree.$el).tree('selectNode', currNode, false);
      }
    },

    dropPrev(treeId, nodes, targetNode) {
      if (nodes[0].level === targetNode.level) {
        return true;
      }
      return false;
    },
    dropNext(treeId, nodes, targetNode) {
      if (nodes[0].level === targetNode.level) {
        return true;
      }
      return false;
    },
    dropInner(treeId, nodes, targetNode) {
      if (nodes[0].level - 1 === targetNode.level) {
        return true;
      }
      return false;
    },
    initValue() {
      let attrIdForType = this.graphic[0].relaResType + '.BUILDING_TYPE';
      let attrIdForPurpose = this.graphic[0].relaResType + '.BUILDING_PURPOSE';

      let promiseList = [];
      let typePromise = new Promise((resolve, reject) => {
        queryEnumValue(attrIdForType).then(data => {
          if (data && data.resultList) {
            this.buildingTypeSetting.dataSource = data.resultList;
          }
          resolve();
        });
      });
      promiseList.push(typePromise);

      let promisePurpose = new Promise((resolve, reject) => {
        queryEnumValue(attrIdForPurpose).then(data => {
          if (data && data.resultList) {
            this.buildingPurposeSetting.dataSource = data.resultList;
          }
          resolve();
        });
      });
      promiseList.push(promisePurpose);

      Promise.all(promiseList).then(() => {
        let param = {
          buildingId: this.graphic[0].attributes.resId,
        };
        if (param.buildingId) {
          queryBuildingStructure(param).then(data => {
            if (data && data.resultList && data.resultList.length > 0) {
              this.row = JSON.parse(JSON.stringify(data.resultList[0]));
              this.initBuildingInfo = data.resultList[0];
              this.typeDisableFlag = true;
              if (this.initBuildingInfo.imBuildingUnitList || this.initBuildingInfo.imFloorList) {
                this.initTreeNode();
              }
            } else {
              this.row = {
                name: this.graphic[0].attributes.resName,
                fullName: this.graphic[0].attributes.resNo,
                userQty: Number(this.graphic[0].attributes.userQty) || 0,
                buildingPurpose: this.graphic[0].attributes.buildingPurpose,
                buildingType: this.graphic[0].attributes.buildingType,
              };
            }
            if (this.projectInfo.cityId && this.projectInfo.cityName) {
              this.row.cityId = this.projectInfo.cityId + '';
              this.row.cityName = this.projectInfo.cityName;
            }
          });
        } else {
          this.row = {
            name: this.graphic[0].attributes.resName,
            fullName: this.graphic[0].attributes.resNo,
            userQty: Number(this.graphic[0].attributes.userQty) || 0,
            buildingPurpose: this.graphic[0].attributes.buildingPurpose,
            buildingType: this.graphic[0].attributes.buildingType,
          };
          if (this.projectInfo.cityId && this.projectInfo.cityName) {
            this.row.cityId = this.projectInfo.cityId + '';
            this.row.cityName = this.projectInfo.cityName;
          }
        }
      });
    },

    initTreeNode() {
      let fNodes = [];
      if (this.row.buildingType === '1') {
        if (this.initBuildingInfo.imFloorList && this.initBuildingInfo.imFloorList.length > 0) {
          let floorList = this.initBuildingInfo.imFloorList;
          floorList.forEach(floor => {
            let roomList = [];
            if (floor.imFloorRoomList && floor.imFloorRoomList.length > 0) {
              floor.imFloorRoomList.forEach(room => {
                let roomObj = {
                  id: fish.getUUID(),
                  name: room.name,
                  roomType: room.roomType,
                  flag: 'room',
                };
                roomList.push(roomObj);
              });
            }
            let floorObj = {
              id: fish.getUUID(),
              isParent: true,
              name: floor.name,
              floorHeight: floor.height,
              children: roomList,
              flag: 'floor',
            };
            fNodes.push(floorObj);
          });
        }
        this.singleFNodes = fNodes;
      } else if (this.row.buildingType === '2') {
        if (this.initBuildingInfo.imFloorList && this.initBuildingInfo.imFloorList.length > 0) {
          let floorList = this.initBuildingInfo.imFloorList;
          floorList.forEach((floor, floorIndex) => {
            let unitList = [];
            if (this.initBuildingInfo.imBuildingUnitList && this.initBuildingInfo.imBuildingUnitList.length > 0) {
              this.initBuildingInfo.imBuildingUnitList.forEach(unit => {
                if (
                  Number(unit.startFloorId) === floorIndex + 1 ||
                  (Number(unit.startFloorId) < floorIndex + 1 && floorIndex + 1 < Number(unit.endFloorId)) ||
                  Number(unit.endFloorId) === floorIndex + 1
                ) {
                  let roomList = [];
                  if (floor.imFloorRoomList && floor.imFloorRoomList.length > 0) {
                    floor.imFloorRoomList.forEach(room => {
                      if (room.unitId === unit.unitId) {
                        let roomObj = {
                          id: fish.getUUID(),
                          name: room.name,
                          roomType: room.roomType,
                          flag: 'room',
                        };
                        roomList.push(roomObj);
                      }
                    });
                  }
                  let unitObj = {
                    id: fish.getUUID(),
                    isParent: true,
                    name: unit.name,
                    startFloorId: name.startFloorId,
                    endFloorId: name.endFloorId,
                    children: roomList,
                    flag: 'unit',
                  };
                  unitList.push(unitObj);
                }
              });
            }
            let floorObj = {
              id: fish.getUUID(),
              isParent: true,
              name: floor.name,
              floorHeight: floor.height,
              children: unitList,
              flag: 'floor',
            };
            fNodes.push(floorObj);
          });
        }
        this.fNodes = fNodes;
      }
    },

    getAllCheckedNodes(nodeList) {
      this.selectedNodeList = nodeList;
    },

    addTreeNode() {
      let parentNodes = this.selectedNodeList.filter(res => res.level === 0 || res.level === 1);
      if (this.row.buildingType === '1') {
        parentNodes = parentNodes.filter(res => res.level === 0);
      }
      if (parentNodes.length === 0) {
        if (this.row.buildingType === '1') {
          this.$refs.newFloorAndRoom.popupNew.show = true;
        } else if (this.row.buildingType === '2') {
          this.$refs.newFloor.popupNew.show = true;
        }
      } else {
        if (this.row.buildingType === '1') {
          // 选中楼层新增房间
          this.$refs.newRoom.popupNew.show = true;
        } else if (this.row.buildingType === '2') {
          let floorList = parentNodes.filter(res => res.level === 0);
          let unitlist = parentNodes.filter(res => res.level === 1);
          if (floorList && floorList.length > 0 && unitlist && unitlist.length > 0) {
            fish.toast('warn', this.$t('MAP_ONLY_SELECT_FLOOR_OR_ROOM'));
            return;
          }
          if (floorList && floorList.length > 0) {
            // 选中楼层新增单元
            let inValidSeqCount = 0;
            floorList.forEach((res, index) => {
              let next = res.getNextNode();
              if (index < floorList.length - 1 && next.id !== floorList[index + 1].id) {
                inValidSeqCount++;
              }
            });
            if (inValidSeqCount > 0) {
              fish.toast('warn', this.$t('OSP_MAP_FUNCTION_BUILDING_ISVALID_MSG'));
              return;
            }
            let startSeq = 1;
            let endSeq = 1;
            let allFloor = $(this.$refs.structureTree.$el).tree('getNodes');
            allFloor.forEach((res, index) => {
              if (res.id === floorList[0].id) {
                startSeq = index + 1;
              }
              if (res.id === floorList[floorList.length - 1].id) {
                endSeq = index + 1;
              }
            });

            this.$refs.newUnit.popupNew.show = true;
            this.$refs.newUnit.row = {
              startFloor: startSeq,
              endFloor: endSeq,
            };
          } else if (unitlist && unitlist.length > 0) {
            // 选中单元新增房间
            this.$refs.newRoom.popupNew.show = true;
          }
        }
      }
    },

    addFloorAndRoom(addParam) {
      let roomType = addParam.roomType;
      let roomPrefix = addParam.roomPrefix;
      let roomCount = Number(addParam.roomCount);

      let floorPrefix = addParam.floorPrefix;
      let floorCount = Number(addParam.floorCount);
      let floorHeight = addParam.floorHeight;
      if (floorCount > 0) {
        for (let i = 1; i < floorCount + 1; i++) {
          let children = [];
          if (roomCount > 0) {
            for (let k = 1; k < roomCount + 1; k++) {
              let obj = {
                name: roomPrefix + k + '',
                roomType: roomType,
                flag: 'room',
              };
              children.push(obj);
            }
          }
          $(this.$refs.structureTree.$el).tree('addNodes', null, {
            id: fish.getUUID(),
            isParent: true,
            pId: 0,
            name: floorPrefix + i + '',
            floorHeight: floorHeight,
            children: children,
            flag: 'floor',
          });
        }
      }
      $(this.$refs.structureTree.$el).tree('checkAllNodes', false);
      this.selectedNodeList = [];
    },

    addUnit(addParam) {
      let roomType = addParam.roomType;
      let roomPrefix = addParam.roomPrefix || '';
      let roomCount = Number(addParam.roomCount);

      let unitName = addParam.unitName;
      let startFloor = Number(addParam.startFloor);
      let endFloor = Number(addParam.endFloor);
      // 选中的楼层列表
      let parentNodes = this.selectedNodeList.filter(res => res.level === 0);
      parentNodes.forEach((floor, floorIndex) => {
        let children = [];
        if (roomCount > 0) {
          for (let k = 1; k < roomCount + 1; k++) {
            let obj = {
              name: roomPrefix + k + '',
              roomType: roomType,
              flag: 'room',
            };
            children.push(obj);
          }
        }
        $(this.$refs.structureTree.$el).tree('addNodes', floor, {
          id: fish.getUUID(),
          isParent: true,
          pId: floor.tId,
          name: unitName,
          startFloorId: startFloor,
          endFloorId: endFloor,
          children: children,
          unitIdTemp: this.unitIndex,
          flag: 'unit',
        });
      });
      this.unitIndex++;
      $(this.$refs.structureTree.$el).tree('checkAllNodes', false);
      this.selectedNodeList = [];
    },

    addRoom(addParam) {
      let roomType = addParam.roomType;
      let roomCount = Number(addParam.roomCount);
      let roomPrefix = addParam.roomPrefix;
      let parentNodes;
      if (this.row.buildingType === '1') {
        parentNodes = this.selectedNodeList.filter(res => res.level === 0);
      } else if (this.row.buildingType === '2') {
        parentNodes = this.selectedNodeList.filter(res => res.level === 1);
      }
      parentNodes.forEach((unit, unitIndex) => {
        let children = [];
        if (roomCount > 0) {
          for (let k = 1; k < roomCount + 1; k++) {
            $(this.$refs.structureTree.$el).tree('addNodes', unit, {
              id: fish.getUUID(),
              pId: unit.tId,
              name: roomPrefix + k + '',
              roomType: roomType,
              flag: 'room',
            });
          }
        }
      });
      $(this.$refs.structureTree.$el).tree('checkAllNodes', false);
      this.selectedNodeList = [];
    },

    editTreeNode(e) {
      if (this.selectedNodeList.length !== 1) {
        fish.toast('warn', this.$t('OSP_MAP_FUNCTION_BUILDING_SELECT_RECORD'));
        return;
      }
      let node = this.selectedNodeList[0];
      if (node.level === 0) {
        // 编辑楼层
        this.$refs.editFloor.popupNew.show = true;
        this.$refs.editFloor.row = {
          floorName: node.name,
          floorHeight: node.floorHeight,
        };
      } else if (node.flag === 'unit') {
        this.$refs.editUnit.popupNew.show = true;
        this.$refs.editUnit.row = {
          unitName: node.name,
        };
      } else if (node.flag === 'room') {
        this.$refs.editRoom.popupNew.show = true;
        this.$refs.editRoom.row = {
          roomName: node.name,
          roomType: node.roomType,
        };
      }
    },

    editFloor(row) {
      let node = this.selectedNodeList[0];
      node.name = row.floorName;
      node.floorHeight = row.floorHeight;
      $(this.$refs.structureTree.$el).tree('updateNode', node);
    },
    editUnit(row) {
      let node = this.selectedNodeList[0];
      node.name = row.unitName;
      $(this.$refs.structureTree.$el).tree('updateNode', node);
    },
    editRoom(row) {
      let node = this.selectedNodeList[0];
      node.name = row.roomName;
      node.roomType = row.roomType;
      $(this.$refs.structureTree.$el).tree('updateNode', node);
    },

    deleteTreeNode(e) {
      if (this.selectedNodeList && this.selectedNodeList.length > 0) {
        this.selectedNodeList.forEach(node => {
          $(this.$refs.structureTree.$el).tree('removeNode', node, true, e);
        });
      }
    },

    afterRemove(nodeList) {
      this.selectedNodeList = [];
    },

    popOk() {
      let initForm = $(this.$refs.basicForm).form();
      let typeForm = $(this.$refs.typeForm).form();
      if (!initForm.isValid() || !typeForm.isValid()) {
        return;
      }
      // if (this.initBuildingInfo.name) {
      //     fish.toast("warn", "The structure of this building has existed, please delete and try again.");
      //     return;
      // }

      let param = {
        areaId: this.row.areaId,
        buildingId:
          this.initBuildingInfo && this.initBuildingInfo.buildingId ? this.initBuildingInfo.buildingId : this.graphic[0].attributes.buildingGisId,
        buildingPurpose: this.row.buildingPurpose,
        buildingType: this.row.buildingType,
        isValid: 'Y',
        latitude: this.graphic[0].attributes.latitude,
        longitude: this.graphic[0].attributes.longitude,
        userQty: this.row.userQty,
        fullName: this.row.fullName,
        name: this.row.name,

        // "buildingStatus": "",
        // "height": 0,
        // "cityId": 0,
      };

      let finalAllData = [];
      if (this.$refs.structureTree) {
        finalAllData = $(this.$refs.structureTree.$el).tree('getNodes');
      }
      if (this.row.buildingType === '3') {
        finalAllData = [];
      }

      let unitList = [];
      let unitIds = [];
      finalAllData.forEach(floor => {
        if (floor.children && floor.children.length > 0 && floor.children[0].flag === 'unit') {
          floor.children.forEach((unit, index) => {
            if (unitIds.indexOf(unit.unitIdTemp) === -1) {
              unitIds.push(unit.unitIdTemp);
              let obj = {
                buildingId:
                  this.initBuildingInfo && this.initBuildingInfo.buildingId
                    ? this.initBuildingInfo.buildingId
                    : this.graphic[0].attributes.buildingGisId,
                startFloorId: Number(unit.startFloorId),
                endFloorId: Number(unit.endFloorId),
                fullName: unit.name,
                name: unit.name,
                isValid: 'Y',
                unitIdTemp: unit.unitIdTemp,
              };
              unitList.push(obj);
            }
          });
        }
      });
      if (unitList.length > 0) {
        unitList = unitList.sort((x, y) => x.unitIdTemp - y.unitIdTemp);
      }
      param.imBuildingUnitList = unitList;

      // 合并相同name的单元
      let flagUnits = [];
      if (param.buildingType === '2' && param.imBuildingUnitList && param.imBuildingUnitList.length > 1) {
        let unitArray = param.imBuildingUnitList;
        let validNames = [];
        unitArray.forEach(res => {
          if (validNames.indexOf(res.name) === -1) {
            validNames.push(res.name);
          }
        });
        validNames.forEach(validName => {
          let inValidUnits = unitArray.filter(res => res.name === validName);
          inValidUnits[0].validFlag = true;
          if (inValidUnits && inValidUnits.length > 1) {
            let start = inValidUnits[0].startFloorId;
            let end = inValidUnits[0].endFloorId;
            inValidUnits.forEach((res, index) => {
              if (index > 0) {
                res.validFlag = false;
                res.realUnitIdTemp = inValidUnits[0].unitIdTemp;
              }
              start = start > res.startFloorId ? res.startFloorId : start;
              end = end < res.endFloorId ? res.endFloorId : end;
            });
            inValidUnits[0].startFloorId = start;
            inValidUnits[0].endFloorId = end;
          }
          flagUnits = flagUnits.concat(inValidUnits);
        });
        param.imBuildingUnitList = flagUnits.filter(res => res.validFlag);
      }

      let floorList = [];
      finalAllData.forEach(res => {
        let floorObj = {
          buildingId:
            this.initBuildingInfo && this.initBuildingInfo.buildingId ? this.initBuildingInfo.buildingId : this.graphic[0].attributes.buildingGisId,
          fullName: res.name,
          name: res.name,
          isValid: 'Y',
          floorType: '1',
        };
        let roomList = [];
        if (res.children && res.children.length > 0) {
          if (res.children[0].flag === 'room') {
            res.children.forEach(room => {
              let roomObj = {
                buildingId:
                  this.initBuildingInfo && this.initBuildingInfo.buildingId
                    ? this.initBuildingInfo.buildingId
                    : this.graphic[0].attributes.buildingGisId,
                fullName: room.name,
                name: room.name,
                isValid: 'Y',
                // unitId:unit.unitIndex,
                equipRoomId: 0,
                roomType: room.roomType,
              };
              roomList.push(roomObj);
            });
          } else if (res.children[0].flag === 'unit') {
            res.children.forEach(unit => {
              if (unit.children && unit.children.length > 0) {
                let unitIdTemp = unit.unitIdTemp;
                if (flagUnits.length > 0) {
                  let findRes = flagUnits.find(res => res.unitIdTemp === unitIdTemp);
                  unitIdTemp = findRes.validFlag ? unitIdTemp : findRes.realUnitIdTemp;
                }
                unit.children.forEach((room, roomIndex) => {
                  let roomObj = {
                    buildingId:
                      this.initBuildingInfo && this.initBuildingInfo.buildingId
                        ? this.initBuildingInfo.buildingId
                        : this.graphic[0].attributes.buildingGisId,
                    fullName: room.name,
                    name: room.name,
                    isValid: 'Y',
                    unitId: unitIdTemp,
                    equipRoomId: 0,
                    roomType: room.roomType,
                  };
                  roomList.push(roomObj);
                });
              }
            });
          }
        }
        floorObj.imFloorRoomList = roomList;
        floorList.push(floorObj);
      });
      param.imFloorList = floorList;

      if (this.initBuildingInfo.name) {
        let obj = Object.assign(this.initBuildingInfo, {
          userQty: this.row.userQty,
          fullName: this.row.fullName,
          name: this.row.name,
          buildingPurpose: this.row.buildingPurpose,
          areaId: this.row.areaId,
        });
        let editResDTO = {
          action: 'M',
          gisKey: this.graphic[0].attributes.gisKey,
          resFlag: 'BOTH',
          resType: this.graphic[0].relaResType,
          resId: this.graphic[0].attributes.resId,
          resInfo: obj,
          mapNo: this.projectInfo.mapNo,
          schemaId: this.projectInfo.schemaId,
          layerNo: this.graphic[0].layerNo,
        };
        editBuildingStructure(editResDTO).then(data => {
          fish.success(this.$t('OSP_MAP_FUNCTION_BUILDING_INFO_SUCCESS_MSG'));
          this.$emit('close');

          this.$root.$emit('changeAttributes', {
            resId: this.graphic[0].attributes.resId,
            resName: this.row.name,
            resNo: this.row.fullName,
            userQty: Number(this.row.userQty),
            buildingPurpose: this.row.buildingPurpose,
            buildingType: this.row.buildingType,
            // layerNo用于刷新图层,刷新之后不需要了，最好是删掉
            layerNo: this.graphic[0].layerNo === 'demandBuilding' ? this.graphic[0].attributes.reLayerNo : this.graphic[0].layerNo,
            needDelLayerNo: true,
          });
        });
      } else {
        let newResDTO = {
          action: 'A',
          gisKey: this.graphic[0].attributes.gisKey,
          resFlag: 'BOTH',
          resType: this.graphic[0].relaResType,
          resInfo: param,
          mapNo: this.projectInfo.mapNo,
          schemaId: this.projectInfo.schemaId,
          layerNo: this.graphic[0].layerNo === 'demandBuilding' ? this.graphic[0].attributes.reLayerNo : this.graphic[0].layerNo,
        };
        if (param.buildingType !== '3' && param.imFloorList.length === 0) {
          fish.toast('info', this.$t('OSP_MAP_FUNCTION_BUILDING_SET_STRUCTURE'));
          return;
        }
        addBuildingStructure(newResDTO).then(data => {
          fish.success(this.$t('OSP_MAP_FUNCTION_BUILDING_STRUCTURE_SUCCESS_MSG'));
          this.$emit('close');

          this.$root.$emit('changeAttributes', {
            resId: data.resInfo.buildingId,
            resName: this.row.name,
            resNo: this.row.fullName,
            userQty: Number(this.row.userQty),
            buildingPurpose: this.row.buildingPurpose,
            buildingType: this.row.buildingType,
            // layerNo用于刷新图层,刷新之后不需要了，最好是删掉
            layerNo: this.graphic[0].layerNo,
            needDelLayerNo: true,
          });
          // let res = this.graphic[0].toJSON();
          // res.attributes.resId = data.buildingId;
          // res.attributes.resName = data.name;
          // res.attributes.resNo = data.fullName;
          // res.attributes.userQty = data.userQty;
          // res.attributes.buildingPurpose = data.buildingPurpose;
          // res.attributes.buildingType = data.buildingType;
          // // 接入点的resId就是建筑物的资源Id
          // this.$map.editAttributeById(res.layerNo, res).then(() => {

          // });
        });
      }
    },

    addrChange(val) {
      if (val && val.name && val.value) {
        this.row.areaId = val.value;
        this.row.areaName = val.name;
      }
    },
  },

  watch: {
    'row.buildingType': {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.selectedNodeList = [];
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import './setBuilding.scss';
</style>
