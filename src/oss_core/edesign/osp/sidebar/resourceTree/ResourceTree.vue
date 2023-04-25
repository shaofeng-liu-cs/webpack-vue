<template>
    <div class="row">
        <div class="res-tree-search">
            <Search v-model="searchValue" ref="search"></Search>
        </div>
        <div class="tree">
            <el-scrollbar>
                <Tree :fNodes="fNodes" :data="dataIcon" @onDblClick="centerSelection" :view="view" :allData="getAllData" :check="check" ref="tree" :queryData="searchValue" :level='3' @onCheck="onCheck"></Tree>
            </el-scrollbar>
        </div>
        <button type="button" class="btn btn-primary centerBtn" @click="centerSelection(checkNodes)" :disabled="!(checkNodes && checkNodes.length > 0)">{{$t('CENTER_SEL')}}</button>
    </div>

</template>
<script>
import * as Color from '../../design/drawStyle.js';
import * as ResTypeHandler from '../../domain/ResTypeHandler.js';
import { Graphic } from 'map';

export default {
  name: 'ResourceTree', // resourceTree
  inject: ['getResourceList', 'getProjectInfo', 'getMapBox', 'getResLabelField'],
  computed: {
    groupList() {
      return this.getResourceList();
    },

    mapBox() {
      return this.getMapBox();
    },

    resLabelField() {
      return this.getResLabelField();
    },
  },
  data() {
    return {
      check: {
        enable: true,
        chkStyle: 'checkbox',
        // chkboxType:  { "Y" : "ps", "N" : "ps" } // Y 属性定义 checkbox 被勾选后的情况； N 属性定义 checkbox 取消勾选后的情况； "p" 表示操作会影响父级节点； "s" 表示操作会影响子级节点。
      },
      fNodes: [],
      dataIcon: {
        key: {
          iconFontEnable: false,
        },
        simpleData: {
          enable: true,
        },
      },
      gisData: [],
      view: {
        showIcon: this.showIconForTree,
        showLine: true,
      },
      allData: [],
      searchValue: '',
      checkNodes: [],
    };
  },
  created() {},
  mounted() {
    this.queryChildren();
  },
  methods: {
    getAllData(val) {
      this.allData = val;
    },
    showIconForTree(treeNode) {
      return !treeNode.isParent;
    },
    async queryChildren() {
      // this.checkNodes = [];
      this.$refs.search.value = '';
      this.gisData = [];
      let featureLikeList = [];
      let Filter = this.$map.Filter;
      let filter = Filter.and(
        Filter.equalTo({
          propertyName: 'schemaId',
          expression: this.getProjectInfo().schemaId,
        }),
        Filter.equalTo({
          propertyName: 'resStatus',
          expression: 'C',
        })
      );
      let _fNode = [];
      this.groupList.forEach(like => {
        if (like.resStatus === 'C') {
          let object = {
            layerNo: like.layerNo,
            filter: filter,
          };
          featureLikeList.push(object);
        }
      });
      if (featureLikeList.length > 0) {
        let gisData = await this.$map.getByFeatureLayers(featureLikeList);
        console.log(gisData);
        this.gisData = this.gisData.concat(gisData);
      }
      let parent = [];
      this.gisData.forEach(dataOne => {
        if (parent.indexOf(dataOne.layerNo) === -1) {
          parent.push(dataOne.layerNo);
        }
      });
      parent.forEach(parent => {
        let selectionChild = [];
        let noSelectionChild = [];

        let ids = [];
        this.gisData.forEach(ch => {
          let single = {
            name: this.resLabelField === 'resName' ? ch.attributes.resName : ch.attributes.resNo,
            icon: `oss_core/edesign/assets/image/map/layer/${ch.layerNo.substr(0, ch.layerNo.length - 2)}.png`,
            id: ch.id,
          };
          if (ch.layerNo === parent && ids.indexOf(ch.id) === -1) {
            ids.push(ch.id);
            if (ch.attributes.resId) {
              selectionChild.push(single);
            } else {
              noSelectionChild.push(single);
            }
          }
        });
        let children = [
          {
            name: `Model Selected(${selectionChild.length})`,
            open: true,
            children: selectionChild,
            isParent: true,
            nocheck: false,
          },
          {
            name: `GIS Only(${noSelectionChild.length})`,
            open: true,
            children: noSelectionChild,
            isParent: true,
            nocheck: false,
          },
        ];
        let resName = this.groupList.find(no => no.layerNo === parent);
        if (resName && resName.layerName) {
          let allCount = selectionChild.length + noSelectionChild.length;
          _fNode.push({
            name: resName.layerName + '(' + allCount + ')',
            nameforFilter: parent.substr(0, parent.length - 2),
            open: true,
            icon: `oss_core/edesign/assets/image/map/layer/${parent.substr(0, parent.length - 2)}.png`,
            children: children,
            nocheck: false,
          });
        }
      });
      _fNode = _fNode.filter(fnode => {
        return fnode.children.length === 0 ? false : true;
      });
      let superParentName = [];
      this.groupList.forEach(groupA => {
        if (superParentName.indexOf(groupA.resGroupI18n) === -1) {
          superParentName.push(groupA.resGroupI18n);
        }
      });
      let superParent = [];
      superParentName.forEach(name => {
        let superChild = [];
        this.groupList.forEach(gro => {
          if (gro.resGroupI18n === name) {
            superChild.push(gro.layerNo.substr(0, gro.layerNo.length - 2));
          }
        });
        superParent.push({
          name: name,
          child: superChild,
          nocheck: false,
        });
      });
      let finnalList = [];
      superParent.forEach(su => {
        let chil = [];
        _fNode.forEach(fn => {
          if (su.child.indexOf(fn.nameforFilter) > -1) {
            chil.push(fn);
          }
        });
        finnalList.push({
          name: su.name,
          children: chil,
          icon: '',
          isParent: true,
          open: true,
          nocheck: false,
        });
      });
      finnalList = finnalList.filter(finn => {
        return finn.children.length === 0 ? false : true;
      });
      this.fNodes = finnalList;
      console.log('啥米：', this.fNodes);
      this.$nextTick(() => {
        if (this.checkNodes.length > 0) {
          let curNodes =
            $(this.$refs.tree.$refs.tree).tree('getNodesByFilter', node => {
              return this.checkNodes.find(res => res.id === node.id);
            }) || [];
          if (curNodes.length > 0) {
            this.$refs.tree.setCheckNode(curNodes);
          }
        }
      });
    },

    centerSelection(nodes) {
      this.mapBox.clear();
      this.isOnece = false;
      let gisList = [];
      let geometris = [];
      let setSelGis = [];
      nodes.forEach(node => {
        let gisInfo = this.gisData.find(gis => gis.id === node.id);
        let resName = this.groupList.find(no => no.layerNo === gisInfo.layerNo);
        gisInfo.resTypeName = resName.resTypeName ? resName.resTypeName : '';
        gisInfo.resType = resName.resType;
        gisInfo._resType = resName.resType;
        gisInfo.attributes.layerNo = gisInfo.layerNo;
        gisList.push(gisInfo);
        geometris.push(gisInfo.geometry);
        let layerInfo = this.mapBox.getLayers().find(layer => layer.id === gisInfo.layerNo);
        if (layerInfo.source && layerInfo.visible) {
          let features = layerInfo.source.getFeatures();
          let feature = features.find(feature => feature.values_.gisKey === gisInfo.__.values_.gisKey);
          let geo = Graphic.from(feature, this.mapBox.spatialReference);
          setSelGis.push(geo);
          console.log(features);
        }
      });
      this.mapBox.centerGeometries(geometris);
      setSelGis.length > 0 && this.mapBox.setSelected(setSelGis);
      this.$emit('afterCenter', gisList, gisList.length > 1);
    },
    onCheck(checkNodes) {
      this.checkNodes = checkNodes.filter(node => !node.isParent);
    },
  },
};
</script>
<style lang="scss" scoped>
@import './resourceTree';
</style>
