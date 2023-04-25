<template>
  <div class="param-set-child-container">
    <!-- <div class="kml-title">{{$t('PARAMETER_SETTING_KML')}}</div> -->
    <div class="kml-set-body" @mousewheel.stop>
      <div class="main">
        <form class="form-kml" style="height:100%;">
          <div class="col-md-12 top">
            <div class="col-md-3">
              <label><input type="radio" name="rad" class="radi" value="U" ref="top" @click="topClick" />{{
                                    $t('OSP_TASK_SET_UNIFIED_ORG')
                                }}</label>
            </div>
            <div class="col-md-9">
              <div class="col-md-2" style="margin-top: 4px;text-align: center;">
                <label class="required-label">{{ $t('OSP_TASK_SET_TYPE_NAME') }}</label>
              </div>
              <div class="col-md-7">
                <input type="text" class="form-control" v-model="name" :disabled="disable" />
              </div>
            </div>
          </div>
          <div class="col-md-12 bottom">
            <label><input type="radio" name="rad" class="radi" value="F" ref="bottom" @click="bottomClick" />{{
                                $t('OSP_TASK_SET_FOLDER_ORG')
                            }}</label>
          </div>
          <div style="height: calc(100% - 80px);">
            <div class="col-md-3 left-tree" style="height:100%;">
              <Tree :fNodes="fNodes" :view="view" @onClick="click"></Tree>
            </div>
            <div class="col-md-1 mid"></div>
            <div class="col-md-8 right" style="height:100%;">
              <div class="col-md-5 left-pro">
                <div class="left-head"> {{ $t('OSP_TASK_SET_PROPERTIES') }} </div>
                <div class="left-content">
                  <div class="col-md-12 content" v-for="(item, index) in divProperty" :key="index">
                    <div class="col-md-1"></div>
                    <div class="col-md-1">
                      <input type="checkbox" v-model="valueList" :value="item" />
                    </div>
                    <div class="col-md-5">
                      <label class="control-label">{{ item.attrDesc }}</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-2 mid-button">
                <div class="mid-top" @click="toLeft">
                  <div class="icon_osp icon_ospleft"></div>
                </div>
                <div class="mid-bottom" @click="toRight" ref="bottonBottom">
                  <div class="icon_osp icon_ospright"></div>
                </div>
              </div>
              <div class="col-md-5 right-pre">
                <div class="right-head"> {{ $t('OSP_TASK_SET_STRU_VIEW') }} </div>
                <div class="right-content">
                  <Tree :fNodes="rightFNodes" :view="view" @onClick="rightClick" :nodeChange="nodeChange" @afterAdd="afterAdd"></Tree>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div class="filter" ref="modal"></div>
      </div>
    </div>
    <div class="param-set-footer">
      <el-button type="primary" size="mini" @click="apply">{{$t('OSP_TASK_SET_APPLY')}}</el-button>
      <el-button type="primary" size="mini" @click="loadDefault">{{$t('OSP_TASK_SET_LOAD_DEFAULT')}}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KMLStructure',
  data() {
    return {
      name: '',
      disable: true,
      fNodes: [],
      view: {
        showIcon: false,
        showLine: false,
      },
      divProperty: [],
      propertiesList: [],
      valueList: [],
      row: {},
      rightFNodes: [],

      defaultRightFNodes: [
        {
          name: '',
          disabled: true,
          open: true,
          children: [
            {
              name: '',
              disabled: true,
              open: true,
              children: [],
            },
          ],
        },
      ],
      rightNode: {},
      resType: '',
      nodeChange: {},
      localChangeList: [],
      kmlStructure: '',
      structure: '',
      hasValueList: {},
      nameListByCode: [],
      index: 0,
    };
  },
  props: {
    projectInfo: {
      type: Object,
    },
  },
  mounted() {
    // this.rightFNodes[0].name = this.row.name;
    this.defaultRightFNodes[0].name = this.projectInfo.projectName;

    this.loadTree();
    this.loadAllProperties();
    this.queryStru();
    //this.test1();

    //this.test3();
  },

  methods: {
    loadAllProperties() {
      fish.ajax({
        url: 'edesign/gis/config/restype/allexportattrs/v1', // 查询左边节点的properties；
        type: 'GET',
        success: (data) => {
          this.propertiesList = data.resultList;
        },
      });
    },

    queryStru() {
      fish.ajax({
        url: `edesign/schema/kml/${this.projectInfo.schemaId}/structurelist/v1`, // 查询KML的任务单结构,用于KML结构配置的呈现
        type: 'GET',
        success: (data) => {
          console.log(data.resultList);
          this.hasValueList = data.resultList;
          // if (data.resultList.resultSetting && data.resultList.resultSetting.extVal) {
          //     this.name = data.resultList.resultSetting.extVal;
          //     this.topClick();
          // }
          if (data.resultList) {
            if (data.resultList.paramVal === 'U' && data.resultList.resultSetting && data.resultList.resultSetting.extVal) {
              this.name = data.resultList.resultSetting.extVal;
              this.topClick();
            }
            if (data.resultList.paramVal === 'F') {
              this.bottomClick();
            }
          }
        },
      });
    },

    apply() {
      let param = {
        kmlStructure: this.kmlStructure,
        schemaId: this.projectInfo.schemaId,
        kmlStructureDTOList: [],
        settringDTO: {},
      };

      if (this.kmlStructure === 'U') {
        if (!this.name) {
          fish.toast('warn', this.$t('PLEASE_ENTER'));
          return;
        }
        param.settringDTO = {
          extVal: this.name,
          paramNo: 'KML_STRUCTURE',
          paramVal: 'U',
          schemaId: this.projectInfo.schemaId,
        };
      } else if (this.kmlStructure === 'F') {
        this.localChangeList.forEach((local) => {
          let str = '';
          let child = local.rightFNodes[0].children[0];
          this.findChild(child, str);
          let nstr = this.structure;
          this.transfer(nstr, local.resType, 'name2code');
          let cstr = this.structure;
          let a = this.hasValueList;
          param.kmlStructureDTOList.push({
            resType: local.resType,
            schemaId: this.projectInfo.schemaId,
            structure: cstr,
          });
        });
        if (this.hasValueList && this.hasValueList.kmlStructureList && this.hasValueList.kmlStructureList.length > 0) {
          let newResTypes = param.kmlStructureDTOList.map((res) => res.resType);
          let otherValueList = this.hasValueList.kmlStructureList.filter((res) => newResTypes.indexOf(res.resType) === -1);
          let otherDTOList = [];
          if (otherValueList) {
            otherDTOList = otherValueList.map((res) => {
              return {
                resType: res.resType,
                schemaId: this.projectInfo.schemaId,
                structure: res.structure,
              };
            });
          }
          param.kmlStructureDTOList = param.kmlStructureDTOList.concat(otherDTOList);
        }
      } else {
        fish.toast('warn', this.$t('OSP_TASK_SET_MUST_SELECT'));
        return;
      }

      fish.ajax({
        url: 'edesign/schema/kml/structure/v1', // 保存任务单的KML的结构配置, 先删再插
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(param),
        success: (data) => {
          fish.toast('success', this.$t('OSP_TASK_SET_APPLY_SUCCESS'));
        },
      });
    },

    findChild(child, str) {
      if (child.children && child.children.length > 0) {
        str += `|${child.children[0].name}`;
        this.findChild(child.children[0], str);
      } else {
        this.structure = str.substr(1);
      }
    },
    transfer(str, resType, flag) {
      if (flag === 'name2code') {
        let nameList = str.split('|');
        let codeStr = '';
        nameList.forEach((name) => {
          let property = this.propertiesList.find((pro) => pro.resType === resType);

          property.attrDTOS.forEach((attr) => {
            if (attr.attrDesc === name) {
              codeStr += `|${attr.attrName}`;
            }
          });
        });
        this.structure = codeStr.substr(1);
      }
      if (flag === 'code2name') {
        let codeList = str.split('|');
        this.nameListByCode = [];
        codeList.forEach((code) => {
          let property = this.propertiesList.find((pro) => pro.resType === resType);
          property.attrDTOS.forEach((attr) => {
            if (attr.attrName === code) {
              this.nameListByCode.push(attr.attrDesc);
            }
          });
        });
      }
    },

    loadDefault() {
      fish.ajax({
        url: 'edesign/schema/kml/default/structure/v1', // 查询KML的任务单默认配置
        type: 'GET',
        success: (data) => {
          if (data && data.paramVal && data.paramVal === 'U') {
            // $("input[name='rad'][value='U']").attr("checked",true);
            // $("input[name='rad'][value='F']").attr("checked",false);
            this.$refs.top.checked = true;
            this.topClick();
            this.name = data.extVal;
          }
        },
      });
    },

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
          let superParentName = [];

          allData.forEach((groupA) => {
            if (superParentName.indexOf(groupA.resGroup) === -1) {
              superParentName.push(groupA.resGroup);
            }
          });
          let parent = [];
          superParentName.forEach((name) => {
            let child = [];
            allData.forEach((left) => {
              if (name === left.resGroup) {
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
    topClick() {
      this.$refs.top.checked = true;
      this.$refs.modal.style.display = 'block';
      this.$refs.bottonBottom.style.backgroundColor = '#ffff';
      this.disable = false;
      this.kmlStructure = 'U';
    },
    bottomClick() {
      this.$refs.bottom.checked = true;
      this.$refs.modal.style.display = 'none';
      this.$refs.bottonBottom.style.backgroundColor = '#4477ee';
      this.disable = true;
      this.kmlStructure = 'F';
    },
    click(node) {
      //this.queryStru();
      this.divProperty = [];
      this.valueList = [];
      this.nameListByCode = [];
      if (node[0].children) {
        return;
      } else {
        this.resType = node[0].resType;

        this.defaultRightFNodes[0].children[0].name = node[0].name;

        let resList = this.localChangeList.map((local) => local.resType);
        if (resList.indexOf(this.resType) === -1) {
          this.loadProperties(node[0]);
        } else {
          this.localChangeList.forEach((loc) => {
            if (loc.resType === this.resType) {
              this.divProperty = loc.properties;
              this.rightFNodes = loc.rightFNodes;
            }
          });
        }
      }
    },

    rightClick(node) {
      this.rightNode = node;
    },

    loadProperties(node) {
      this.rightFNodes = [
        {
          name: this.projectInfo.projectName,
          disabled: true,
          open: true,
          children: [
            {
              name: this.resType,
              disabled: true,
              open: true,
              children: [],
            },
          ],
        },
      ];

      if (this.hasValueList.kmlStructureList) {
        let filter = this.hasValueList.kmlStructureList.filter((have) => {
          return have.resType === node.resType;
        });
        if (filter && filter.length > 0) {
          this.transfer(filter[0].structure, filter[0].resType, 'code2name');
          let aa = this.nameListByCode;
          this.index = 0;
          this.batchAdd(this.rightFNodes[0].children);
        }
      }

      let property = this.propertiesList.find((pro) => pro.resType === node.resType);
      this.divProperty = property.attrDTOS.filter((fi) => {
        return this.nameListByCode.indexOf(fi.attrDesc) === -1;
      });
    },

    batchAdd(treeList) {
      if (this.nameListByCode.length !== this.index) {
        if (treeList.length !== 0) {
          this.batchAdd(treeList[0].children);
        } else {
          let obj = {};
          obj.name = this.nameListByCode[this.index];
          this.index++;
          obj.children = [];
          obj.open = true;
          treeList.push(obj);
          this.batchAdd(treeList[0].children);
        }
      }
    },

    toLeft() {
      if (this.rightNode.length !== 1) {
        fish.toast('warn', this.$t('OSP_TASK_SET_MUST_SELECT_RIGHT'));
        return;
      }
      this.divProperty.push({
        resType: this.rightNode[0].resType,
        attrDesc: this.rightNode[0].name,
      });

      this.nodeChange = Object.assign(
        {},
        {
          node: this.rightNode[0],
          flag: 'remove',
        },
      );

      this.rightNode = [];
      this.valueList = [];
    },
    toRight() {
      // if (this.valueList.length !== 1) {
      //     fish.toast("warn", "Please select one property on each time!");
      //     return;
      // }

      let descList = this.valueList.map((val) => val.attrDesc);

      this.divProperty = this.divProperty.filter((div) => {
        return descList.indexOf(div.attrDesc) === -1;
      });
      this.nameListByCode = this.valueList.map((vaa) => vaa.attrDesc);

      this.index = 0;
      this.batchAdd(this.rightFNodes[0].children);

      this.afterAdd(this.rightFNodes);
      // this.valueList.forEach((value) => {
      //     this.findLast(this.rightFNodes, value);

      // });

      this.valueList = [];
    },
    findLast(fNodes, value) {
      let child = fNodes[0].children;
      if (child.length === 1) {
        this.findLast(child, value);
      } else if (child.length === 0) {
        this.nodeChange = Object.assign(
          {},
          {
            parent: fNodes[0],
            node: value,
            flag: 'add',
          },
        );
      }
    },

    // reCreate(treeNode) {
    //     if (treeNode[0].children > 0) {
    //         def
    //     }
    // },

    afterAdd(nodes) {
      // let def = [{
      //     name:this.row.schemaId, disabled:true,open:true,
      //     children:[
      //         {
      //             name:this.resType, disabled:true,open:true,
      //             children:[]
      //         }
      //     ]
      // }];
      // let treeNode = def[0].children;
      let resList = this.localChangeList.map((local) => local.resType);
      if (nodes) {
        this.rightFNodes = nodes;
      }
      if (resList.indexOf(this.resType) === -1) {
        this.localChangeList.push({
          resType: this.resType,
          properties: this.divProperty,
          rightFNodes: nodes ? nodes : this.rightFNodes,
        });
      } else {
        this.localChangeList.forEach((loc) => {
          if (loc.resType === this.resType) {
            loc.properties = this.divProperty;
            loc.rightFNodes = nodes ? nodes : this.rightFNodes;
          }
        });
      }
    },
  },
  watch: {
    valueList: {
      deep: true,
      immediate: true,
      handler(val, old) {
        let aa = val;
      },
    },
    rightFNodes: {
      deep: true,
      immediate: true,
      handler(val, old) {
        let aa = val;
      },
    },
  },
};
</script>
<style lang="scss" scoped>
@import './kmlStructure.scss';
</style>
