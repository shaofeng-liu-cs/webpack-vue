/**
 * Title: ObjAttr.js
 * Description: ObjAttr View
 * Author: dai.yuxiang
 * Created Date: 15-8-26 9:26 AM
 * Copyright: Copyright 2015,+INF ZTESOFT, Inc.
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/featureAttrMgr/templates/featureAttr.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/featureAttrMgr/i18n/featureattrmgr',
  'oss_core/edesign/featureAttrMgr/actions/featureAttrMgrAction',
], (template, i18nOpb, i18nObject, FeatureAttrAction) => {
  const { fish, $, portal } = window;
  return portal.BaseView.extend({
    className: 'cs-block',
    template: fish.compile(template),
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    events: {
      'click #btnAddAttrEdnRes': 'addAttr',
      'click #btnModAttrEdnRes': 'modAttr',
      'click #btnDelAttrEdnRes': 'delAttr',
      'click #btnUpAttrListEdn': 'upAttr',
      'click #btnDownAttrListEdn': 'downAttr',
    },
    initialize: opts => {
      this.option = fish.extend({}, this.option, opts);
      this.colModel = [
        {
          name: 'attrId',
          label: '',
          key: true,
          hidden: true,
        },
        {
          name: 'columnName',
          label: this.i18nData.EDN_FEATURE_ATTR_NAME,
          width: 150,
          sorttype: 'text',
        },
        {
          name: 'attrDesc',
          label: this.i18nData.EDN_FEATURE_ATTR_DESC,
          width: 180,
          sorttype: 'text',
        },
        {
          name: 'dataType',
          label: this.i18nData.EDN_FEATURE_DATA_TYPE,
          width: 120,
          formatter: 'select',
          formatoptions: {
            value: {
              N: this.i18nData.EDN_FEATURE_DATA_TYPE_NUMBER,
              S: this.i18nData.EDN_FEATURE_DATA_TYPE_STRING,
              D: this.i18nData.EDN_FEATURE_DATA_TYPE_DATE,
            },
          },
          sortable: false,
        },
        {
          name: 'dataLen',
          label: this.i18nData.EDN_FEATURE_DATA_LENGTH,
          width: 120,
          sortable: false,
        },
        {
          name: 'controlType',
          label: this.i18nData.EDN_FEATURE_CONTROL_TYPE,
          width: 120,
          formatter: 'select',
          formatoptions: {
            value: {
              1: this.i18nData.EDN_FEATURE_CONTROL_TYPE_TEXT,
              2: this.i18nData.EDN_FEATURE_CONTROL_TYPE_DATE,
              3: this.i18nData.EDN_FEATURE_CONTROL_TYPE_COMBOBOX,
            },
          },
          sortable: false,
        },
        {
          name: 'precision',
          label: this.i18nData.EDN_FEATURE_PRECISION,
          width: 100,
          sortable: false,
        },
        {
          name: 'scale',
          label: this.i18nData.EDN_FEATURE_SCALE,
          width: 100,
          sortable: false,
        },
        {
          name: 'controlFlag',
          label: this.i18nData.EDN_FEATURE_CONTROL_FLAG,
          width: 120,
          formatter: 'select',
          formatoptions: {
            value: {
              1: this.i18nData.EDN_FEATURE_CONTROL_FLAG_NORMAL,
              2: this.i18nData.EDN_FEATURE_CONTROL_FLAG_HIDDEN,
              3: this.i18nData.EDN_FEATURE_CONTROL_FLAG_DISABLED,
            },
          },
          sortable: false,
        },
        {
          name: 'expFlagDesc',
          label: this.i18nData.EDN_FEATURE_EXP_FLAG_DESC,
          width: 180,
          sortable: false,
        },
        {
          name: 'isNull',
          label: this.i18nData.EDN_FEATURE_IS_NULL,
          width: 100,
          sortable: false,
        },
        {
          name: 'initValue',
          label: this.i18nData.EDN_FEATURE_INIT_VALUE,
          width: 100,
          sortable: false,
        },
      ];

      // pager: true,
      // datatype: 'json',
      // pageData: function() {this.pageData(false);}.bind(this),
      this.colModel.sortable = true;

      // 全局变量
      // ObjAttrViewIM = this;
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      // this.setBtn(false);
      return this;
    },
    afterRender: () => {
      this.$featureAttrGrid = this.$('#gridFeatureAttrEdn').jqGrid({
        shrinkToFit: true,
        colModel: this.colModel,
        datatype: 'local',
        // pageData: this.wrap(this.qryAttribute()),
        // onSelectRow: this.wrap(this.selectRow),
        sortname: 'SEQ',
        // curPageSort:true
        // rownumbers:true
      });
      // this.qryAttribute();
      this.loadGrid();
      this.resize();
    },
    loadGrid: () => {
      if (!fish.isEmpty(this.option.OBJ_TYPE)) {
        FeatureAttrAction.qryAttribute({ resType: this.option.OBJ_TYPE }, data => {
          const attrList = data || [];
          this.$featureAttrGrid.grid('reloadData', attrList);
          this.featureAttrList = attrList;
          // this.show();
          this.$featureAttrGrid.grid('setSelection', this.$featureAttrGrid.grid('getRowData')[0]);
        });
      }
    },
    addAttr: () => {
      if (!this.option.OBJ_TYPE) {
        fish.error(this.i18nData.EDN_FEATURE_SELECT_RESOURCE);
        return;
      }
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/featureAttrMgr/views/attributePop'], AttributePop => {
        const opts = {
          operState: 'A',
          state: 'A',
          POP_TITLE: this.i18nData.EDN_FEATURE_TITLE_ADD_ATTR,
          resType: this.option.OBJ_TYPE,
          attrGroup: this.option.ATTR_GROUP,
          LAYER_NAME: this.option.LAYER_NAME,
          attrCount: this.$featureAttrGrid.grid('getRowData').length,
        };
        const attrPopView = new AttributePop(opts);
        attrPopView.render();
        // attrPopView.afterRender();
        this.listenTo(attrPopView, 'okCompleted', () => {
          const attList = this.$featureAttrGrid.grid('getRowData');
          this.loadGrid();
          this.$featureAttrGrid.grid('setSelection', attList[attList.length - 1]);
          fish.success(this.i18nData.OPB_SUCCEED_ADD.replace('{0}', this.i18nData.EDN_FEATURE_ATTR));
        });
      });
    },
    modAttr: () => {
      if (!this.option.OBJ_TYPE) {
        fish.error(this.i18nData.EDN_FEATURE_SELECT_RESOURCE);
        return;
      }
      const selrow = this.$featureAttrGrid.grid('getSelection');
      if (fish.isEmpty(selrow)) {
        fish.warn(this.i18nData.EDN_FEATURE_SELECT_RECORD_CONTENT);
      } else {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        require(['oss_core/edesign/featureAttrMgr/views/attributePop'], AttributePop => {
          const opts = {
            operState: 'M',
            state: 'A',
            POP_TITLE: this.i18nData.EDN_FEATURE_TITLE_MOD_ATTR,
            resType: this.option.OBJ_TYPE,
            attrGroup: this.option.ATTR_GROUP,
            LAYER_NAME: this.option.LAYER_NAME,
            attrCount: this.$featureAttrGrid.grid('getRowData').length,
            selrow,
          };
          const attrPopView = new AttributePop(opts);
          attrPopView.render();
          this.listenTo(attrPopView, 'okCompleted', () => {
            const attList = this.$featureAttrGrid.grid('getRowData');
            this.loadGrid();
            this.$featureAttrGrid.grid('setSelection', attList[attList.length - 1]);
            fish.success(this.i18nData.OPB_SUCCEED_MODIFY.replace('{0}', this.i18nData.EDN_FEATURE_ATTR));
          });
        });
      }
    },

    delAttr: () => {
      if (!this.option.OBJ_TYPE) {
        fish.error(this.i18nData.EDN_FEATURE_SELECT_RESOURCE);
        return;
      }
      const selrow = this.$featureAttrGrid.grid('getSelection');
      fish.confirm(this.i18nData.EDN_FEATURE_ATTR_DELETE_TIPS, () => {
        FeatureAttrAction.delAttribute({ attrId: selrow.attrId }, () => {
          this.loadGrid();
          fish.success(this.i18nData.OPB_SUCCEED_DEL.replace('{0}', this.i18nData.EDN_FEATURE_ATTR));
        });
      });
    },

    resize: () => {
      const tabs = $('.ui-tabs');
      const hbase = tabs.outerHeight() - 60 - tabs.children(':first-child').outerHeight() - 1;
      this.$featureAttrGrid.jqGrid('setGridHeight', hbase - 56);
    },
    upAttr: () => {
      const selrowid = this.$featureAttrGrid.grid('getGridParam', 'selrow');
      const selrow = this.$featureAttrGrid.grid('getGridRowById', selrowid);
      const $selrow = $(selrow);
      const $prevrow = $(selrow).prev();

      if ($prevrow.attr('class') === 'jqgfirstrow') {
        return;
      }

      const selrowData = this.$featureAttrGrid.grid('getRowData', selrowid);
      const prevrowid = $prevrow.find('td')[0].title;
      const prevrowData = this.$featureAttrGrid.grid('getRowData', prevrowid);

      const tempSeq = selrowData.SEQ;
      selrowData.SEQ = prevrowData.SEQ;
      prevrowData.SEQ = tempSeq;

      this.$featureAttrGrid.grid('setRowData', selrowData);
      this.$featureAttrGrid.grid('setRowData', prevrowData);

      const attr = {};
      attr.ATTR_ID1 = selrowData.ATTR_ID;
      attr.ATTR_ID2 = prevrowData.ATTR_ID;
      // $prevrow.detach();
      // $selrow.after($prevrow);

      FeatureAttrAction.setSeq(attr, () => {
        $prevrow.detach();
        $selrow.after($prevrow);
      });
    },
    downAttr: () => {
      const selrowid = this.$featureAttrGrid.grid('getGridParam', 'selrow'); // 获取选中的行标识
      const selrow = this.$featureAttrGrid.grid('getGridRowById', selrowid);
      const $selrow = $(selrow);
      const $nextrow = $(selrow).next();

      if ($nextrow.length === 0) {
        return;
      }

      const selrowData = this.$featureAttrGrid.grid('getRowData', selrowid);
      const nextrowid = $nextrow.find('td')[0].title;
      const nextrowData = this.$featureAttrGrid.grid('getRowData', nextrowid);

      const tempSeq = selrowData.SEQ;
      selrowData.SEQ = nextrowData.SEQ;
      nextrowData.SEQ = tempSeq;
      this.$featureAttrGrid.grid('getSelection');

      this.$featureAttrGrid.grid('setRowData', selrowData);
      this.$featureAttrGrid.grid('setRowData', nextrowData);
      const attr = {};
      attr.ATTR_ID1 = selrowData.ATTR_ID;
      attr.ATTR_ID2 = nextrowData.ATTR_ID;

      // $nextrow.detach();
      // $selrow.before($nextrow);

      FeatureAttrAction.setSeq(attr, () => {
        $nextrow.detach();
        $selrow.before($nextrow);
      });
    },

    // selectRow: function(e, rowid) {
    //   //规格为RES的属性不可编辑
    //   var selrow = this.$featureAttrGrid.grid('getSelection');
    //   if (selrow.DEFINITION_FLAG === 'U') {
    //     this.$('#btnModAttrEdnRes').attr('disabled', false);
    //     this.$('#btnDelAttrEdnRes').attr('disabled', false);
    //   } else {
    //     this.$('#btnModAttrEdnRes').attr('disabled', true);
    //     this.$('#btnDelAttrEdnRes').attr('disabled', true);
    //   }
    // },

    setBtn: flag => {
      this.$('#btnAddAttrEdnRes').attr('disabled', !flag);
      this.$('#btnModAttrEdnRes').attr('disabled', !flag);
      this.$('#btnDelAttrEdnRes').attr('disabled', !flag);
      this.$('#btnUpAttrIMRes').attr('disabled', !flag);
      this.$('#btnDownAttrIMRes').attr('disabled', !flag);
      this.$('#gridFeatureAttrEdn').grid('reloadData', []);
    },
    show: () => {
      this.$('#btnAddAttrEdnRes').attr('disabled', false);
      this.$('#btnModAttrEdnRes').attr('disabled', false);
      // this.$('#btnDelAttrEdnRes').attr('disabled',false);
      this.$('#btnUpAttrIMRes').attr('disabled', true);
      this.$('#btnDownAttrIMRes').attr('disabled', false);
    },
    qryAttrByName: () => {
      let searchTxt = $.trim($('#txtAttrSearchIMRes').val());
      if (fish.isEmpty(searchTxt)) {
        this.$featureAttrGrid.grid('reloadData', { rows: this.objAttrList });
      } else {
        searchTxt = searchTxt.toLowerCase();
        const arr = $.map(this.objAttrList, item => {
          if (item.ATTR_NAME.toLowerCase().indexOf(searchTxt) >= 0) {
            return item;
          }
          return false;
        });
        this.$featureAttrGrid.grid('reloadData', { rows: arr });
      }
    },
  });
});
