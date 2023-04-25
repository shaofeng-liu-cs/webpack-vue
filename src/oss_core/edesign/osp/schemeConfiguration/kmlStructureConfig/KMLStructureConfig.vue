<template>
  <div class="param-set-child-container">
    <div class="head-setting-box">
      <el-radio-group v-model="kmlStructure" @input="radioChange" :disabled="disabled">
        <el-radio-button label="U">{{ $t('OSP_TASK_SET_UNIFIED_ORG') }}</el-radio-button>
        <el-radio-button label="F">{{ $t('OSP_TASK_SET_FOLDER_ORG') }}</el-radio-button>
      </el-radio-group>
      <span v-if="kmlStructure === 'U'" class="name-input-form">
        <span class="name-input">{{ disabled ? `${$t('OSP_TASK_SET_TYPE_NAME')} : ` : $t('OSP_TASK_SET_TYPE_NAME') }}</span>
        <span v-if="disabled" class="theme-text-val">{{ name || '-' }}</span>
        <el-input v-else size="mini" v-model="name"></el-input>
      </span>
    </div>

    <div class="bott-content-box">
      <span class="left-tree-box" :class="{ disabled: kmlStructure === 'U' }">
        <EdnTree :data="fNodes" v-model="resType" @changeSelect="changeSelect" :hideSearch="true"></EdnTree>
      </span>
      <div class="kml-main-box" :class="{ disabled: kmlStructure === 'U' }">
        <div class="kml-tree-select-pro">
          <div class="kml-select-head">{{ $t('OSP_TASK_SET_PROPERTIES') }}</div>
          <div class="kml-select-content">
            <el-scrollbar>
              <el-checkbox-group v-model="valueList" :disabled="disabled">
                <el-checkbox v-for="item in divProperty" :key="item.attrId" :label="item.attrId">{{ item.attrDesc }}</el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </div>
        </div>
        <div class="mid-button">
          <div class="mid-top" @click="toLeft">
            <div class="icon_osp icon_ospleft"></div>
          </div>
          <div class="mid-bottom" @click="toRight" ref="bottonBottom">
            <div class="icon_osp icon_ospright"></div>
          </div>
          <div class="disable-box" v-if="disabled"></div>
        </div>
        <div class="kml-tree-select-pro">
          <div class="kml-select-head">{{ $t('OSP_TASK_SET_STRU_VIEW') }}</div>
          <div class="kml-select-content">
            <el-scrollbar>
              <Tree :fNodes="rightFNodes" :view="view" @onClick="rightClick" :nodeChange="nodeChange" @afterAdd="afterAdd"></Tree>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <div class="param-set-footer" v-if="!disabled">
      <el-button type="primary" size="mini" @click="apply">{{ $t('OSP_TASK_SET_APPLY') }}</el-button>
      <el-button type="primary" size="mini" @click="loadDefault">{{ $t('OSP_TASK_SET_LOAD_DEFAULT') }}</el-button>
    </div>
  </div>
</template>

<script>
import { getRestypelistBySchema, getStructurelistBySchema, getAllexportattrs, getDefaultStructure } from '@/oss_core/edesign/api/query/schema.js';
import { addKMLStructure } from '@/oss_core/edesign/api/add/schema.js';

export default {
  name: 'KMLStructureConfig',
  data() {
    return {
      name: '',
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
    disabled: false,
  },
  mounted() {
    // this.rightFNodes[0].name = this.row.name;
    this.defaultRightFNodes[0].name = this.projectInfo.projectName;

    this.queryStru();
    //this.test1();

    //this.test3();
  },

  methods: {
    loadAllProperties() {
      // 查询左边节点的properties；
      getAllexportattrs().then(data => {
        this.propertiesList = data.resultList;
        this.loadTree();
      });
    },

    // 查询KML的任务单结构,用于KML结构配置的呈现
    queryStru() {
      getStructurelistBySchema(this.projectInfo.projectSchemaId).then(res => {
        this.hasValueList = res.data;
        if (res.data) {
          if (res.data.paramVal === 'U' && res.data.resultSetting && res.data.resultSetting.extVal) {
            this.name = res.data.resultSetting.extVal;
            this.kmlStructure = 'U';
          }
          if (res.data.paramVal === 'F') {
            this.kmlStructure = 'F';
          }
        }
        this.kmlStructure = this.kmlStructure || 'F';
        this.loadAllProperties();
      });
    },

    apply() {
      let param = {
        kmlStructure: this.kmlStructure,
        projectSchemaId: this.projectInfo.projectSchemaId,
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
          projectSchemaId: this.projectInfo.projectSchemaId,
        };
      } else if (this.kmlStructure === 'F') {
        this.localChangeList.forEach(local => {
          let str = '';
          let child = local.rightFNodes[0].children[0];
          this.findChild(child, str);
          let nstr = this.structure;
          this.transfer(nstr, local.resType, 'name2code');
          let cstr = this.structure;
          let a = this.hasValueList;
          param.kmlStructureDTOList.push({
            resType: local.resType,
            projectSchemaId: this.projectInfo.projectSchemaId,
            structure: cstr,
          });
        });
        if (this.hasValueList && this.hasValueList.kmlStructureList && this.hasValueList.kmlStructureList.length > 0) {
          let newResTypes = param.kmlStructureDTOList.map(res => res.resType);
          let otherValueList = this.hasValueList.kmlStructureList.filter(res => newResTypes.indexOf(res.resType) === -1);
          let otherDTOList = [];
          if (otherValueList) {
            otherDTOList = otherValueList.map(res => {
              return {
                resType: res.resType,
                projectSchemaId: this.projectInfo.projectSchemaId,
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
      // 保存任务单的KML的结构配置, 先删再插
      addKMLStructure(param).then(data => {
        fish.toast('success', this.$t('OSP_TASK_SET_APPLY_SUCCESS'));
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
        nameList.forEach(name => {
          let property = this.propertiesList.find(pro => pro.resType === resType);

          property.attrDTOS.forEach(attr => {
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
        codeList.forEach(code => {
          let property = this.propertiesList.find(pro => pro.resType === resType);
          property.attrDTOS.forEach(attr => {
            if (attr.attrName === code) {
              this.nameListByCode.push(attr.attrDesc);
            }
          });
        });
      }
    },

    loadDefault() {
      // 查询KML的任务单默认配置
      getDefaultStructure().then(data => {
        if (data && data.paramVal && data.paramVal === 'U') {
          this.kmlStructure = 'U';
          this.name = data.extVal;
        }
      });
    },

    loadTree() {
      let projectSchemaId = this.projectInfo.projectSchemaId;
      getRestypelistBySchema(projectSchemaId).then(data => {
        let allData = data.resultList || [];
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

    changeSelect(resType, data) {
      this.divProperty = [];
      this.valueList = [];
      this.nameListByCode = [];
      this.resType = resType;
      if (resType) {
        this.defaultRightFNodes[0].children[0].name = data.name;
        let resList = this.localChangeList.map(local => local.resType);
        if (resList.indexOf(this.resType) === -1) {
          this.loadProperties(data);
        } else {
          this.localChangeList.forEach(loc => {
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
        let filter = this.hasValueList.kmlStructureList.filter(have => {
          return have.resType === node.code;
        });
        if (filter && filter.length > 0) {
          this.transfer(filter[0].structure, filter[0].resType, 'code2name');
          let aa = this.nameListByCode;
          this.index = 0;
          this.batchAdd(this.rightFNodes[0].children);
        }
      }

      let property = this.propertiesList.find(pro => pro.resType === node.code);
      if (property) {
        this.divProperty = property.attrDTOS.filter(fi => {
          return this.nameListByCode.indexOf(fi.attrDesc) === -1;
        });
      }
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
      const values = this.divProperty.filter(it => this.valueList.includes(it.attrId));
      let descList = values.map(val => val.attrDesc);

      this.divProperty = this.divProperty.filter(div => {
        return descList.indexOf(div.attrDesc) === -1;
      });

      this.nameListByCode = values.map(vaa => vaa.attrDesc);

      this.index = 0;
      this.batchAdd(this.rightFNodes[0].children);

      this.afterAdd(this.rightFNodes);

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

    afterAdd(nodes) {
      let resList = this.localChangeList.map(local => local.resType);
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
        this.localChangeList.forEach(loc => {
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
@import './kmlStructureConfig.scss';
</style>
