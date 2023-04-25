<template>
  <div class="param-set-child-container">
    <!-- <div class="export-setting-title">{{$t('PARAMETER_SETTING_MAPPING')}}</div> -->
    <div class="param-set-body" @mousewheel.stop>
      <div class="left-tree">
        <Tree :fNodes="fNodes" :view="view" @onClick="click"></Tree>
      </div>
      <!-- <div class="mid"></div> -->
      <div class="right">
        <form class="form-group type">
          <div class="table-name">
            <label class="required-label">&nbsp;{{ $t('OSP_TASK_SET_TYPE_MAPPING') }}</label>
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="resMappingName" />
          </div>
        </form>
        <div class="table-name">
          <label class="">&nbsp;{{ $t('OSP_TASK_SET_ATTR_MAPPING') }}</label>
        </div>
        <div style="display:flex;flex-grow:1;flex-flow:column;" ref="gridRefBox">
          <el-table ref="gridRef" :data="gridData.filter(res => res.expFlag !== '4')" height="100%" style="width: 100%" @afterSave="afterOutSave" @cell-click="cellClick" size="mini">
            <el-table-column label="" prop="dispSeq" :hidden="true">
            </el-table-column>
            <el-table-column :label="$t('OSP_TASK_SET_ATTRIBUTES_NAME')" prop="attrName" min-width="100">
            </el-table-column>
            <el-table-column :label="$t('OSP_TASK_SET_ATTRIBUTES_DESC')" prop="attrDesc" min-width="120">
            </el-table-column>
            <el-table-column :label="$t('OSP_TASK_SET_MAPPING_NAME')" prop="mappingName" min-width="120">
              <template slot-scope="scope">
                <el-input v-if="editFlag" v-model="scope.row.mappingName" :placeholder="$t('PLEASE_ENTER')" size="mini">
                </el-input>
                <span v-else>{{scope.row.mappingName}}</span>
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
      </div>
      <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
          <div>
            <el-table ref="gridRef1" :data="valueData" height="220px" style="width: 100%" @afterSave="afterInSave" size="mini">
              <el-table-column :label="$t('OSP_TASK_SET_VALUE')" prop="attrValue" min-width="100">
              </el-table-column>
              <el-table-column :label="$t('DESCRIPTION')" prop="valueDesc" min-width="100">
              </el-table-column>
              <el-table-column :label="$t('OSP_TASK_SET_CUSTOMER_MAPPING')" prop="mappingName" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.mappingName" :placeholder="$t('PLEASE_ENTER')" size="mini">
                  </el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </Popup>
    </div>
    <div class="param-set-footer">
      <el-button type="primary" size="mini" @click="apply">{{$t('OSP_TASK_SET_APPLY')}}</el-button>
      <el-button type="primary" size="mini" @click="loadDefault">{{$t('OSP_TASK_SET_LOAD_DEFAULT')}}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportSettings',
  props: {
    sprintShowFlag: {
      type: Boolean,
    },
  },
  data() {
    return {
      view: {
        showIcon: false,
        showLine: false,
      },

      fNodes: [],
      gridData: [
        // {name:"aa", desc:"aa1", mapping:"mapping1", map:"link1"},
        // {name:"ab", desc:"ab1", mapping:"mapping2", map:"link2"}
      ],
      valueData: [],
      // gridOption: {
      //   cellEdit: true,
      //   // height:'100%',
      //   sortname: 'dispSeq',
      //   columnMenu: false,
      //   cached: true,
      //   pager: false,
      // },
      // valueOption: {
      //   cellEdit: true,
      //   height: '260px',
      //   columnMenu: false,
      //   cached: true,
      //   pager: false,
      // },
      resType: '',
      resName: '',
      resMappingName: '',
      popupObj: {
        title: this.$t('OSP_TASK_SET_ATTR_VAL_MAPPING'),
        ok: this.$t('OK'),
        close: this.$t('CANCEL'),
        modal: true,
        width: '55%',
        height: '400px',
        left: '25%',
        top: '50px',
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
  props: {
    projectInfo: {
      type: Object,
    },
  },
  mounted() {
    this.loadTree();
    console.log(this.$i18n);
    // this.loadDefault(); // 默认的暂时未空，resType===shcemaid,  defalut
  },
  methods: {
    loadTree() {
      // let schemaType = this.$parent.sprintObj.sprintType;
      // let mapNo = this.$parent.sprintObj.mapNo;
      let sprintId = this.projectInfo.sprintId;
      fish.ajax({
        // url: `edesign/schema/restyperela/${schemaType}/${mapNo}/defaultrestypelist/v1`,
        url: `edesign/schema/restyperela/${sprintId}/restypelist/v1`,
        type: 'GET',

        success: (data) => {
          let allData = data.resultList || [];
          allData = allData.filter((lis) => lis.layerType === 'C');
          this.allRes = allData;
          let superParentName = [];
          let groupKey = 'resGroup';
          if (fish.language === 'zh') {
            groupKey = 'localName';
          }
          allData.forEach((groupA) => {
            if (superParentName.indexOf(groupA[groupKey]) === -1) {
              superParentName.push(groupA[groupKey]);
            }
          });
          let parent = [];
          superParentName.forEach((name) => {
            let child = [];
            allData.forEach((left) => {
              if (name === left[groupKey]) {
                child.push({
                  name: left.layerName,
                  resType: left.resType,
                });
              }
            });
            parent.push({
              name: name,
              children: child,
              open: true,
            });
          });

          this.fNodes = parent.filter((lef) => {
            return lef.children.length > 0;
          });
        },
      });
    },
    loadMapping(resType, pushFlag) {
      let defaultResMapping = '';
      let defaultGrid = [];
      fish.ajax({
        url: `edesign/gis/config/restype/${resType}/attrinfo/v1`, // 没有值的 resType
        type: 'GET',

        success: (normalData) => {
          if (normalData && normalData.attrDTOS) {
            if (pushFlag && pushFlag === 'defaultPushLocal') {
              normalData.attrDTOS.forEach((att) => {
                att.mappingName = '';
                att.attrValuesDTOS.forEach((va) => {
                  va.mappingName = '';
                });
              });
              defaultGrid = normalData.attrDTOS;
            } else {
              this.clickFlag = true;
              normalData.attrDTOS.forEach((att) => {
                att.mappingName = '';
                att.attrValuesDTOS.forEach((va) => {
                  va.mappingName = '';
                });
              });
              this.gridData = normalData.attrDTOS;
            }

            let schemaId = this.projectInfo.schemaId;
            fish.ajax({
              url: `edesign/schema/attrmapping/${schemaId}/allattrmappinglist/v1`, // 有值的
              type: 'GET',

              success: (data) => {
                if (data && data.resultList) {
                  console.log('hasvalue');
                  console.log(data.resultList);
                  let aa = data.resultList.filter((list) => {
                    return list.attrMappingDTOList ? true : false;
                  });

                  if (resType === 'OCC') {
                    let a = 1;
                  }

                  if (pushFlag && pushFlag === 'defaultPushLocal') {
                    let resTypeDefaultMappingDTO = this.resTypeDefaultMappingDTOList.filter((fi) => fi.resType === resType);
                    if (resTypeDefaultMappingDTO && resTypeDefaultMappingDTO.length > 0) {
                      defaultResMapping = resTypeDefaultMappingDTO[0].mappingName;
                    } else {
                      let filterData = data.resultList.filter((res) => res.resType === this.resType);
                      if (filterData.length > 0) {
                        let findRes = this.allRes.find((res) => res.resType === filterData[0].resType);
                        defaultResMapping = filterData[0].mappingName ? filterData[0].mappingName : findRes.resTypeName;
                      } else {
                        defaultResMapping = 'NullType';
                      }
                    }

                    defaultGrid.forEach((grid) => {
                      this.attrDefaultMappingDTOList.forEach((attr) => {
                        if (attr.resType === resType && attr.attrName === grid.attrName) {
                          grid.mappingName = attr.mappingName;
                        }
                      });

                      if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                        grid.attrValuesDTOS.forEach((gridValue) => {
                          this.attrValueDefaultMappingDTOList.forEach((value) => {
                            if (value.resType === resType && value.attrValue === gridValue.attrValue && value.attrName === grid.attrName) {
                              gridValue.mappingName = value.mappingName;
                            }
                          });
                        });
                      }
                    });
                  } else {
                    let filterData = data.resultList.filter((res) => res.resType === this.resType);
                    if (filterData.length > 0) {
                      let findRes = this.allRes.find((res) => res.resType === filterData[0].resType);
                      this.resMappingName = filterData[0].mappingName ? filterData[0].mappingName : findRes.resTypeName;
                    } else {
                      this.resMappingName = 'NullType';
                    }

                    let _gridData = this.gridData;

                    _gridData.forEach((grid) => {
                      data.resultList.forEach((hasValue) => {
                        if (grid.resType === hasValue.resType) {
                          if (hasValue.attrMappingDTOList) {
                            hasValue.attrMappingDTOList.forEach((attr) => {
                              if (grid.attrName === attr.attrName) {
                                grid.mappingName = attr.mappingName;
                                grid.attrValuesDTOS.forEach((gridValue) => {
                                  attr.attrValueMappingDTOList.forEach((value) => {
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
                    let filterDataRes = this.resTypeDefaultMappingDTOList.filter((res) => res.resType === this.resType);
                    if (filterDataRes.length > 0 && filterDataRes[0].mappingName) {
                      this.resMappingName = filterDataRes[0].mappingName;
                    }

                    let defGrid = this.gridData;

                    defGrid.forEach((grid) => {
                      this.attrDefaultMappingDTOList.forEach((attr) => {
                        if (attr.resType === this.resType && attr.attrName === grid.attrName) {
                          grid.mappingName = attr.mappingName;
                        }
                      });

                      if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                        grid.attrValuesDTOS.forEach((gridValue) => {
                          this.attrValueDefaultMappingDTOList.forEach((value) => {
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
              },
            });

            this.$nextTick(() => {
              this.clickFlag = false;
            });
          }
        },
      });
    },
    loadDefault() {
      fish.confirm(this.$t('OSP_TASK_SET_LOAD_DEFAULT_CONFIRM'), () => {
        fish.ajax({
          url: 'edesign/gis/config/restype/alldefaultattrmappings/v1', // load Default
          type: 'GET',
          success: (data) => {
            if (data) {
              //this.localMappingData = [];
              this.defaultFlag = true;
              this.clickFlag = true;
              this.resTypeDefaultMappingDTOList = data.resTypeDefaultMappingDTOList;
              this.attrDefaultMappingDTOList = data.attrDefaultMappingDTOList;
              this.attrValueDefaultMappingDTOList = data.attrValueDefaultMappingDTOList;

              //目前默认的只配了restype的映射，里面attr和value的暂时还没有数据，所以点了loaddefault之后，只处理了type的更新！！！！
              let filterDataRes = this.resTypeDefaultMappingDTOList.filter((res) => res.resType === this.resType);
              if (filterDataRes.length > 0 && filterDataRes[0].mappingName) {
                this.resMappingName = filterDataRes[0].mappingName;
              }

              let _gridData = this.gridData;

              _gridData.forEach((grid) => {
                this.attrDefaultMappingDTOList.forEach((attr) => {
                  if (attr.resType === this.resType && attr.attrName === grid.attrName) {
                    grid.mappingName = attr.mappingName;
                  }
                });

                if (grid.attrValuesDTOS && grid.attrValuesDTOS.length > 0) {
                  grid.attrValuesDTOS.forEach((gridValue) => {
                    this.attrValueDefaultMappingDTOList.forEach((value) => {
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

              fish.toast('success', this.$t('OSP_TASK_SET_LOAD_DEFAULT_SUCCESS'));
            }
          },
        });
      });
    },

    pushLocal(val, resType, defaultResMapping, defaultGrid) {
      if (val === 'default') {
        let resList = [];
        resList = this.resTypeDefaultMappingDTOList.map((local) => local.resType);
        this.attrDefaultMappingDTOList.forEach((att) => {
          if (resList.indexOf(att.resType) === -1) {
            resList.push(att.resType);
          }
        });

        this.attrValueDefaultMappingDTOList.forEach((valu) => {
          if (resList.indexOf(valu.resType) === -1) {
            resList.push(valu.resType);
          }
        });
        resList = resList.filter((re) => {
          return re !== 'string';
        });

        resList.forEach((def) => {
          this.loadMapping(def, 'defaultPushLocal');
        });
      } else {
        let _resType = resType ? resType : this.resType;
        let resList = this.localMappingData.map((local) => local.resType);
        if (resList.indexOf(_resType) === -1) {
          this.localMappingData.push({
            resType: _resType,
            resName: 'testName', //这个只是用于最后提交时的提示
            resMappingName: defaultResMapping ? defaultResMapping : this.resMappingName,
            gridData: defaultGrid ? defaultGrid : this.gridData,
          });
        } else {
          this.localMappingData.forEach((data) => {
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
    click(node) {
      if (node[0].children) {
        return;
      } else {
        this.clickFlag = true;
        this.resType = node[0].resType;
        this.resName = node[0].name;
        let resList = this.localMappingData.map((local) => local.resType);
        if (resList.indexOf(this.resType) > -1) {
          this.localMappingData.forEach((local) => {
            if (local.resType === this.resType) {
              this.resMappingName = local.resMappingName;
              this.gridData = local.gridData;
              this.$nextTick(() => {
                this.clickFlag = false;
              });
            }
          });
        } else {
          let nodeData = node[0];
          this.loadMapping(this.resType, this.resName);
        }
      }
    },
    afterInSave(sprintObj, index, gridData) {
      this.gridData.forEach((data) => {
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
      fish.confirm(this.$t('OSP_TASK_SET_SAVE_CONFIRM'), () => {
        let param = [];
        let errorList = [];
        this.localMappingData.forEach((local) => {
          let obj = {};
          obj.schemaId = this.projectInfo.schemaId;
          obj.resType = local.resType;
          obj.mappingName = local.resMappingName;
          if (!local.resMappingName) {
            errorList.push(local.resName);
          }
          obj.isValid = 'Y';
          obj.partitionId = ''; // !!!!暂时没有
          obj.attrMappingDTOList = [];

          local.gridData.forEach((grid) => {
            let gridObj = {};
            gridObj.schemaId = obj.schemaId;
            gridObj.resType = local.resType;
            gridObj.attrName = grid.attrName;
            gridObj.mappingName = grid.mappingName;
            gridObj.isValid = 'Y';
            gridObj.partitionId = ''; // !!!!暂时没有
            gridObj.attrValueMappingDTOList = [];

            grid.attrValuesDTOS.forEach((value) => {
              let valueObj = {};
              valueObj.schemaId = obj.schemaId;
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
          fish.warn(this.$t('OSP_TASK_SET_CAN_NOT_NULL')); // in ${errorList} !
          return;
        }

        fish.ajax({
          url: 'edesign/schema/attrmapping/attrmappinglist/v1',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(param),
          success: (data) => {
            fish.toast('success', this.$t('OSP_TASK_SET_APPLY_SUCCESS'));
          },
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
      if (column.property === 'mappingName') {
        this.editFlag = true;
      } else {
        this.editFlag = false;
      }
    },
    // cellLeave(row, column) {
    //   if (column.property === 'mappingName') this.editFlag = false;
    // },
  },
  watch: {
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
@import './exportSettings.scss';
</style>
