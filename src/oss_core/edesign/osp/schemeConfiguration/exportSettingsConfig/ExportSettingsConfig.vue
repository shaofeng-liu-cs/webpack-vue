<template>
  <div class="param-set-child-container">
    <span class="left-tree-box">
      <EdnTree :data="fNodes" v-model="resType" @changeSelect="changeSelect" :hideSearch="true"></EdnTree>
    </span>

    <!-- <div class="export-setting-title">{{$t('PARAMETER_SETTING_MAPPING')}}</div> -->
    <div class="param-set-body">
      <el-form ref="configForm" label-position="top">
        <el-form-item prop="resMappingName" class="is-required" :label="$t('OSP_TASK_SET_TYPE_MAPPING')">
          <el-input size="mini" v-model="resMappingName" style="width:258px;" :disabled="disabled"></el-input>
        </el-form-item>
      </el-form>

      <div class="table-title-box">{{ $t('OSP_TASK_SET_ATTR_MAPPING') }}</div>

      <div class="table-box">
        <el-table
          ref="gridRef"
          :data="gridData.filter(res => res.expFlag !== '4')"
          height="100%"
          width="100%"
          border
          @afterSave="afterOutSave"
          @cell-click="cellClick"
          size="mini"
        >
          <el-table-column label="" prop="dispSeq" :hidden="true"> </el-table-column>
          <el-table-column :label="$t('OSP_TASK_SET_ATTRIBUTES_NAME')" prop="attrName" min-width="100"> </el-table-column>
          <el-table-column :label="$t('OSP_TASK_SET_ATTRIBUTES_DESC')" prop="attrDesc" min-width="120"> </el-table-column>
          <el-table-column :label="$t('OSP_TASK_SET_MAPPING_NAME')" prop="mappingName" min-width="120">
            <template slot-scope="scope">
              <el-input v-if="editFlag" v-model="scope.row.mappingName" :placeholder="$t('PLEASE_ENTER')" size="mini"> </el-input>
              <span v-else>{{ scope.row.mappingName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('OSP_TASK_SET_ATTRIBUTES_NEW_NAME')" min-width="120">
            <template slot-scope="{ row }">
              <div v-if="row.attrValuesDTOS && row.attrValuesDTOS.length > 0">
                <button type="button" class="btn-link" @click="valueMapping(row)">
                  {{ $t('OSP_TASK_SET_VALUE_MAPPING') }}
                </button>
              </div>
              <div v-else></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="param-set-footer" v-if="!disabled">
        <el-button type="primary" size="mini" @click="apply">{{ $t('OSP_TASK_SET_APPLY') }}</el-button>
        <el-button type="primary" size="mini" @click="loadDefault">{{ $t('OSP_TASK_SET_LOAD_DEFAULT') }}</el-button>
      </div>
    </div>

    <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
      <template v-slot:popupBody>
        <el-table ref="gridRef1" border :data="valueData" height="100%" style="width: 100%" @afterSave="afterInSave" size="mini">
          <el-table-column :label="$t('OSP_TASK_SET_VALUE')" prop="attrValue" min-width="100"> </el-table-column>
          <el-table-column :label="$t('DESCRIPTION')" prop="valueDesc" min-width="100"> </el-table-column>
          <el-table-column :label="$t('OSP_TASK_SET_CUSTOMER_MAPPING')" prop="mappingName" min-width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.mappingName" :placeholder="$t('PLEASE_ENTER')" size="mini" :disabled="disabled"> </el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </Popup>
  </div>
</template>

<script>
import { getRestypelistBySchema, getAttrmappinglist, getAllDefaultAttrmappings } from '@/oss_core/edesign/api/query/schema.js';
import { queryAttrDtosInfo } from '@/oss_core/edesign/api/query/resType.js';
import { addAttrmappinglist } from '@/oss_core/edesign/api/add/schema.js';

export default {
  name: 'ExportSettingsConfig',
  props: {
    sprintShowFlag: {
      type: Boolean,
    },
    projectInfo: {
      type: Object,
    },
    disabled: false,
  },
  data() {
    return {
      fNodes: [],
      resMappingName: '',
      gridData: [],
      valueData: [],

      resType: '',
      resName: '',
      popupObj: {
        title: this.$t('OSP_TASK_SET_ATTR_VAL_MAPPING'),
        ok: this.$t('OK'),
        close: this.$t('CANCEL'),
        modal: true,
        width: '55%',
        height: '400px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      allRes: [],
      localMappingData: [],
      outRow: {},
      clickFlag: true, // 判断修改resMappingname的时候是否是点击资源类型触发的
      defaultFlag: false, //判断用户是否点击过load default按钮，点击过的话，每个资源节点加载的数据就会在有值的基础上被默认的值覆盖
      resTypeDefaultMappingDTOList: [],
      attrDefaultMappingDTOList: [],
      attrValueDefaultMappingDTOList: [],
      editFlag: false, //是否可编辑
    };
  },

  mounted() {
    this.loadTree();
    // this.loadDefault(); // 默认的暂时未空，resType===shcemaid,  defalut
  },
  methods: {
    loadTree() {
      let projectSchemaId = this.projectInfo.projectSchemaId;
      getRestypelistBySchema(projectSchemaId).then(data => {
        let allData = data.resultList || [];
        this.allRes = allData;
        let superParentName = [];
        allData.forEach(groupA => {
          if (superParentName.indexOf(groupA.resGroup) === -1) {
            superParentName.push(groupA.resGroup);
          }
        });
        let parent = [];
        superParentName.forEach(name => {
          let child = [];
          allData.forEach(left => {
            if (name === left.resGroup) {
              child.push({
                name: left.resTypeName,
                code: left.resType,
              });
            }
          });
          parent.push({
            name: name,
            code: name,
            children: child,
            open: true,
          });
        });

        this.fNodes = parent.filter(lef => {
          return lef.children.length > 0;
        });
      });
    },
    loadMapping(resType, pushFlag) {
      let defaultResMapping = '';
      let defaultGrid = [];
      queryAttrDtosInfo(resType).then(normalData => {
        if (normalData && normalData.attrDTOS) {
          if (pushFlag && pushFlag === 'defaultPushLocal') {
            normalData.attrDTOS.forEach(att => {
              att.mappingName = '';
              att.attrValuesDTOS.forEach(va => {
                va.mappingName = '';
              });
            });
            defaultGrid = normalData.attrDTOS;
          } else {
            this.clickFlag = true;
            normalData.attrDTOS.forEach(att => {
              att.mappingName = '';
              att.attrValuesDTOS.forEach(va => {
                va.mappingName = '';
              });
            });
            this.gridData = normalData.attrDTOS;
          }

          let projectSchemaId = this.projectInfo.projectSchemaId;
          getAttrmappinglist(projectSchemaId).then(data => {
            if (data && data.data) {
              console.log('hasvalue');
              console.log(data.data);
              let aa = data.data.filter(list => {
                return list.attrMappingDTOList ? true : false;
              });

              if (resType === 'OCC') {
                let a = 1;
              }

              if (pushFlag && pushFlag === 'defaultPushLocal') {
                let resTypeDefaultMappingDTO = this.resTypeDefaultMappingDTOList.filter(fi => fi.resType === resType);
                if (resTypeDefaultMappingDTO && resTypeDefaultMappingDTO.length > 0) {
                  defaultResMapping = resTypeDefaultMappingDTO[0].mappingName;
                } else {
                  let filterData = data.data.filter(res => res.resType === this.resType);
                  if (filterData.length > 0) {
                    let findRes = this.allRes.find(res => res.resType === filterData[0].resType);
                    defaultResMapping = filterData[0].mappingName ? filterData[0].mappingName : findRes.resTypeName;
                  } else {
                    defaultResMapping = pushFlag;
                  }
                }

                defaultGrid.forEach(grid => {
                  this.attrDefaultMappingDTOList.forEach(attr => {
                    if (attr.resType === resType && attr.attrName === grid.attrName) {
                      grid.mappingName = attr.mappingName;
                    }
                  });

                  if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                    grid.attrValuesDTOS.forEach(gridValue => {
                      this.attrValueDefaultMappingDTOList.forEach(value => {
                        if (value.resType === resType && value.attrValue === gridValue.attrValue && value.attrName === grid.attrName) {
                          gridValue.mappingName = value.mappingName;
                        }
                      });
                    });
                  }
                });
              } else {
                let filterData = data.data.filter(res => res.resType === this.resType);
                if (filterData.length > 0) {
                  let findRes = this.allRes.find(res => res.resType === filterData[0].resType);
                  this.resMappingName = filterData[0].mappingName ? filterData[0].mappingName : findRes.resTypeName;
                } else {
                  this.resMappingName = pushFlag;
                }

                let _gridData = this.gridData;

                _gridData.forEach(grid => {
                  data.data.forEach(hasValue => {
                    if (grid.resType === hasValue.resType) {
                      if (hasValue.attrMappingDTOList) {
                        hasValue.attrMappingDTOList.forEach(attr => {
                          if (grid.attrName === attr.attrName) {
                            grid.mappingName = attr.mappingName;
                            grid.attrValuesDTOS.forEach(gridValue => {
                              attr.attrValueMappingDTOList &&
                                attr.attrValueMappingDTOList.forEach(value => {
                                  if (gridValue.attrValue === value.attrValue) {
                                    gridValue.mappingName = value.mappingName;
                                  }
                                });
                            });
                          }
                        });
                      }
                    }
                  });
                });

                this.gridData = _gridData;
              }

              if (this.defaultFlag) {
                //目前默认的只配了restype的映射，里面attr和value的暂时还没有数据，所以点了loaddefault之后，只处理了type的更新！！！！
                let filterDataRes = this.resTypeDefaultMappingDTOList.filter(res => res.resType === this.resType);
                if (filterDataRes.length > 0 && filterDataRes[0].mappingName) {
                  this.resMappingName = filterDataRes[0].mappingName;
                }

                let defGrid = this.gridData;

                defGrid.forEach(grid => {
                  this.attrDefaultMappingDTOList.forEach(attr => {
                    if (attr.resType === this.resType && attr.attrName === grid.attrName) {
                      grid.mappingName = attr.mappingName;
                    }
                  });

                  if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                    grid.attrValuesDTOS.forEach(gridValue => {
                      this.attrValueDefaultMappingDTOList.forEach(value => {
                        if (value.resType === this.resType && value.attrValue === gridValue.attrValue && value.attrName === grid.attrName) {
                          gridValue.mappingName = value.mappingName;
                        }
                      });
                    });
                  }
                });

                this.gridData = defGrid;
              }

              if (pushFlag && pushFlag === 'defaultPushLocal') {
                this.pushLocal('', resType, defaultResMapping, defaultGrid);
              }
            }
          });

          this.$nextTick(() => {
            this.clickFlag = false;
          });
        }
      });
    },
    loadDefault() {
      this.$confirm(this.$t('OSP_TASK_SET_LOAD_DEFAULT_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        getAllDefaultAttrmappings().then(data => {
          if (data) {
            //this.localMappingData = [];
            this.defaultFlag = true;
            this.clickFlag = true;
            this.resTypeDefaultMappingDTOList = data.resTypeDefaultMappingDTOList;
            this.attrDefaultMappingDTOList = data.attrDefaultMappingDTOList;
            this.attrValueDefaultMappingDTOList = data.attrValueDefaultMappingDTOList;

            //目前默认的只配了restype的映射，里面attr和value的暂时还没有数据，所以点了loaddefault之后，只处理了type的更新！！！！
            let filterDataRes = this.resTypeDefaultMappingDTOList.filter(res => res.resType === this.resType);
            if (filterDataRes.length > 0 && filterDataRes[0].mappingName) {
              this.resMappingName = filterDataRes[0].mappingName;
            }

            let _gridData = this.gridData;

            _gridData.forEach(grid => {
              this.attrDefaultMappingDTOList.forEach(attr => {
                if (attr.resType === this.resType && attr.attrName === grid.attrName) {
                  grid.mappingName = attr.mappingName;
                }
              });

              if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                grid.attrValuesDTOS.forEach(gridValue => {
                  this.attrValueDefaultMappingDTOList.forEach(value => {
                    if (value.resType === this.resType && value.attrValue === gridValue.attrValue && value.attrName === grid.attrName) {
                      gridValue.mappingName = value.mappingName;
                    }
                  });
                });
              }
            });

            this.gridData = _gridData;

            // loaddefault之后，需要将有默认值的restype对应的mapping数据push进本地缓存，目前只处理了type。！！！！！！
            this.pushLocal('default');

            this.$nextTick(() => {
              this.clickFlag = false;
            });
            this.$message({
              type: 'success',
              message: this.$t('OSP_TASK_SET_LOAD_DEFAULT_SUCCESS'),
            });
          }
        });
      });
    },

    pushLocal(val, resType, defaultResMapping, defaultGrid) {
      if (val === 'default') {
        let resList = [];
        resList = this.resTypeDefaultMappingDTOList.map(local => local.resType);
        this.attrDefaultMappingDTOList.forEach(att => {
          if (resList.indexOf(att.resType) === -1) {
            resList.push(att.resType);
          }
        });

        this.attrValueDefaultMappingDTOList.forEach(valu => {
          if (resList.indexOf(valu.resType) === -1) {
            resList.push(valu.resType);
          }
        });
        resList = resList.filter(re => {
          return re !== 'string';
        });

        resList.forEach(def => {
          this.loadMapping(def, 'defaultPushLocal');
        });
      } else {
        let _resType = resType ? resType : this.resType;
        let resList = this.localMappingData.map(local => local.resType);
        if (resList.indexOf(_resType) === -1) {
          this.localMappingData.push({
            resType: _resType,
            resName: 'testName', //这个只是用于最后提交时的提示
            resMappingName: defaultResMapping ? defaultResMapping : this.resMappingName,
            gridData: defaultGrid ? defaultGrid : this.gridData,
          });
        } else {
          this.localMappingData.forEach(data => {
            if (data.resType === _resType) {
              data.gridData = defaultGrid ? defaultGrid : this.gridData;
              data.resMappingName = defaultResMapping ? defaultResMapping : this.resMappingName;
            }
          });
        }
      }
    },
    valueMapping(sprintObj) {
      this.popupObj.show = true;
      this.outRow = sprintObj; //判断是外面哪一行的value映射被修改了，
      this.valueData = sprintObj.attrValuesDTOS; // 表格data
    },
    changeSelect(resType, data) {
      if (resType) {
        this.resType = resType;
        this.resName = data.name;
        let resList = this.localMappingData.map(local => local.resType);
        if (resList.indexOf(this.resType) > -1) {
          this.localMappingData.forEach(local => {
            if (local.resType === this.resType) {
              this.resMappingName = local.resMappingName;
              this.gridData = local.gridData;
              this.$nextTick(() => {
                this.clickFlag = false;
              });
            }
          });
        } else {
          this.loadMapping(this.resType, this.resName);
        }
      }
    },

    afterInSave(sprintObj, index, gridData) {
      this.gridData.forEach(data => {
        if (data.resType === this.resType && data.attrId === this.outRow.attrId) {
          data.attrValuesDTOS = gridData;
        }
      });
      this.pushLocal();
    },

    afterOutSave(sprintObj, index, gridData) {
      this.gridData = gridData;
      this.pushLocal();
    },

    apply() {
      this.$confirm(this.$t('OSP_TASK_SET_SAVE_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        let param = [];
        let errorList = [];
        this.localMappingData.forEach(local => {
          let obj = {};
          obj.projectSchemaId = this.projectInfo.projectSchemaId;
          obj.resType = local.resType;
          obj.mappingName = local.resMappingName;
          if (!local.resMappingName) {
            errorList.push(local.resName);
          }
          obj.isValid = 'Y';
          obj.partitionId = ''; // !!!!暂时没有
          obj.attrMappingDTOList = [];

          local.gridData.forEach(grid => {
            let gridObj = {};
            gridObj.projectSchemaId = obj.projectSchemaId;
            gridObj.resType = local.resType;
            gridObj.attrName = grid.attrName;
            gridObj.mappingName = grid.mappingName;
            gridObj.isValid = 'Y';
            gridObj.partitionId = ''; // !!!!暂时没有
            gridObj.attrValueMappingDTOList = [];

            grid.attrValuesDTOS.forEach(value => {
              let valueObj = {};
              valueObj.projectSchemaId = obj.projectSchemaId;
              valueObj.resType = local.resType;
              valueObj.attrName = grid.attrName;
              valueObj.attrValue = value.attrValue;
              valueObj.mappingName = value.mappingName;
              valueObj.isValid = 'Y';
              valueObj.partitionId = ''; // !!!!暂时没有
              gridObj.attrValueMappingDTOList.push(valueObj);
            });
            obj.attrMappingDTOList.push(gridObj);
          });
          param.push(obj);
        });

        if (errorList.length > 0) {
          this.$message({
            type: 'error',
            message: this.$t('OSP_TASK_SET_CAN_NOT_NULL'),
          });
          return;
        }
        addAttrmappinglist(param, this.projectInfo.projectSchemaId).then(data => {
          this.$message({
            type: 'success',
            message: this.$t('OSP_TASK_SET_APPLY_SUCCESS'),
          });
        });
      });
    },

    popupClose() {
      console.log('popupClose');
    },

    popupOk() {
      console.log('popupClose');
      this.popupObj.show = false;
    },
    resetTableWidthHeight() {
      const gridRefBox = $(this.$refs.gridRefBox);
      if (gridRefBox[0]) {
        const dom = gridRefBox[0];
        $(this.$refs.gridRef.$refs.grid).grid('setGridHeight', 0);
        $(this.$refs.gridRef.$refs.grid).grid('setGridWidth', 0);
        setTimeout(() => {
          $(this.$refs.gridRef.$refs.grid).grid('setGridHeight', dom.clientHeight);
          $(this.$refs.gridRef.$refs.grid).grid('setGridWidth', dom.clientWidth);
        }, 500);
      }
    },
    cellClick(row, column) {
      if (!this.disabled) {
        if (column.property === 'mappingName') {
          this.editFlag = true;
        } else {
          this.editFlag = false;
        }
      }
    },
    // cellLeave(row, column) {
    //   if (column.property === 'mappingName') this.editFlag = false;
    // },
  },
  watch: {
    projectInfo: {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.loadTree();
      },
    },
    gridData: {
      deep: true,
      immediate: false,
      handler(val, old) {
        console.log(val);
      },
    },
    sprintShowFlag: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.resetTableWidthHeight();
      },
    },
    resMappingName: {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (this.clickFlag) {
          return;
        } else {
          this.pushLocal();
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import './exportSettingsConfig.scss';
</style>
