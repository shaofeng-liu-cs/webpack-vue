/**
 * Title: ObjMgr.js
 * Description: ObjMgr View
 * Author: dai.yuxiang
 * Created Date: 15-8-26 9:26 AM
 * Copyright: Copyright 2015,+INF ZTESOFT, Inc.
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/featureAttrMgr/templates/featureAttrMgr.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/featureAttrMgr/i18n/featureattrmgr',
  'oss_core/edesign/featureAttrMgr/actions/featureAttrMgrAction',
], (template, i18nOpb, i18nObject, FeatureAttrAction) => {
  const { fish, $, portal } = window;
  return portal.BaseView.extend({
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    template: fish.compile(template),
    objType: '',
    events: {
      'click #btnRefreshObjEDNRes': 'refreshCache',
    },
    initialize: opts => {
      this.option = fish.extend({}, this.option, opts);
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      return this;
    },
    afterRender: () => {
      this.initTree();
      FeatureAttrAction.qryPlanResType({}, data => {
        const dataList = data || [];
        const parent = [];
        dataList.forEach(item => {
          let flag = true;
          parent.forEach(itParent => {
            if (itParent.name === item.resGroup) {
              flag = false;
            }
          });
          if (flag) {
            parent.push({
              name: item.resGroup,
              isParent: true,
              children: [],
              open: true,
            });
          }
        });
        parent.forEach(itParent => {
          const children = [];
          dataList.forEach(item => {
            if (itParent.name === item.resGroup) {
              children.push({
                name: item.resTypeDesc,
                resTypeId: item.resTypeId,
              });
            }
          });
          itParent.children = children;
        });
        // 自定义图标
        $.each(parent, (index, val) => {
          // alert(val.OBJ_TYPE+"----"+val.PARENT_OBJ_TYPE);
          if (!fish.isEmpty(val.ICON)) {
            parent[index].icon = val.ICON;
          } else {
            parent[index].iconSkin = 'cs-tree';
          }

          if (fish.isEmpty(val.resGroup)) {
            parent[index].isParent = true;
            parent[index].open = true;
          }
        });
        this.$objTree.tree('reloadData', parent);
        this.objTab = this.$('#tabFeatureEdn').tabs({
          activate: (event, ui) => this.tabActivate(event, ui),
        });
      });
    },

    initTree: () => {
      const options = {
        data: {
          key: {
            // name: "resTypeDesc"
          },
          simpleData: {
            enable: true,
            // idKey: "resTypeId",
            // pIdKey: "resGroup",
            // rootPId: null
          },
        },
        view: {
          showIcon: false,
          fontCss: this.wrap(this.getFontCss),
        },
        callback: {
          beforeClick: this.wrap(this.clickControl),
          onClick: this.wrap(this.initAttrInfo),
        },
        fNodes: [],
      };
      this.$objTree = this.$('#treeFeatureAttrEdn').tree(options);
    },
    tabActivate: (event, ui) => {
      const id = ui.newPanel.attr('id');
      switch (id) {
        case 'tabFeatureAttrEdn':
          if (!this.ObjAttr) {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            require(['oss_core/edesign/featureAttrMgr/views/featureAttr'], ObjAttr => {
              const view = new ObjAttr({ OBJ_TYPE: this.objType, TREE_HEIGHT: this.getHeight() });
              this.$('#tabFeatureAttrEdn').html(view.$el);
              view.render();
              view.afterRender();
              this.ObjAttr = view;
            });
          }
          break;
        default:
          break;
      }
    },

    resize: () => {
      const tabs = $('.ui-tabs');
      const hbase = tabs.outerHeight() - 60 - tabs.children(':first-child').outerHeight() - 1;
      // let searchBarHeight = this.$('.search-bar').eq(0).outerHeight();

      this.$objTree.height(hbase - 5);
      // let gridheight = $(window).outerHeight() - 100 - $("#edesignFeatureResTree").height();

      return this;
    },
    getHeight: () => {
      const tabs = $('.tabs_nav');
      const hbase = tabs.outerHeight() - 60 - tabs.children(':first-child').outerHeight() - 1;
      // let searchBarHeight = this.$('.search-bar').eq(0).outerHeight();
      return hbase;
    },
    searchFilter: () => true,
    getFontCss: treeNode => (treeNode.highlight ? { color: '#2d8ae8', 'font-weight': 'bold' } : { color: '', 'font-weight': 'normal' }),
    clickControl: () => {
      // 反复点新增还未保存的节点不做任何操作
      //   if (treeNode.OBJ_TYPE === 'NW') {
      //     return false;
      //   }
      //   if (this.ObjBasic.actFlag) {
      //     fish.confirm(this.i18nData.GIVE_UP_EDIT).result.then(function() {
      //       if (_self.ObjBasic.newNodeFlag) {
      //         let tempNode = _self.$objTree.tree('getNodeByParam', 'OBJ_TYPE', 'NW');
      //         _self.$objTree.tree('removeNode', tempNode);
      //       }
      //       _self.$objTree.tree('selectNode', treeNode);
      //       _self.initBasic(event, treeNode);
      //     });
      //     return false;
      //   }
    },

    initAttrInfo: (event, treeNode) => {
      if (!fish.isEmpty(treeNode.parentTId)) {
        if (this.objType !== treeNode.resTypeId) {
          this.objType = treeNode.resTypeId;
          this.objTypeName = treeNode.name;
          this.objTab.tabs('option', 'active', 0);
          this.ObjAttr.option.OBJ_TYPE = this.objType;
          this.ObjAttr.option.ATTR_GROUP = treeNode.getParentNode().name;
          this.ObjAttr.option.LAYER_NAME = treeNode.name;
          this.ObjAttr.afterRender();
        }
        this.ObjAttr.show();
        // this.ObjBasic.actFlag = false;
      } else {
        this.objType = treeNode.resTypeId;
        this.ObjAttr.setBtn(false);
      }
    },

    refreshCache: () => {
      const option = {
        url: 'edesign/meta/cache/clearCache/v1',
        data: '',
        async: true,
        success: () => {
          fish.toast('success', 'Refresh Successfully!');
        },
      };
      fish.post(option);
    },
  });
});
