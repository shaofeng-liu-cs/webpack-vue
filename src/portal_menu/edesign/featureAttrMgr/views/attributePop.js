/**
 * Title: AttrPop.js
 * Description: AttrPop View
 * Author: dai.yuxiang
 * Created Date: 15-8-27 9:26 AM
 * Copyright: Copyright 2015,+INF ZTESOFT, Inc.
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/featureAttrMgr/templates/attributePop.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/featureAttrMgr/i18n/featureattrmgr',
  'oss_core/edesign/featureAttrMgr/actions/featureAttrMgrAction',
  'css!oss_core/edesign/featureAttrMgr/css/attributePop.css',
], (template, i18nOpb, i18nObject, FeatureAttrAction) => {
  const { fish, $, portal } = window;
  // let surfaceCatTypeGroup = [];
  return portal.BaseView.extend({
    className: 'ui-dialog dialog',
    template: fish.compile(template),
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    events: {
      'click #btnAttrValueOkEdn': 'ok',
      'click #btnAttrValueCancelEdn': 'cancel',
      'click #btnAddAttrValueEdn': 'addAttrValue',
      'click #btnDelAttrValueEdn': 'delAttrValue',
      'click #btnUpAttrValueEdn': 'upAttrValue',
      'click #btnDownAttrValueEdn': 'downAttrValue',
    },
    initialize: opts => {
      const titleObj = { POP_TITLE: opts.POP_TITLE };
      this.i18nData = fish.extend({}, titleObj, this.i18nData);
      this.option = fish.extend({}, this.option, opts);
      this.colModel = [
        {
          name: 'attrValue',
          label: this.i18nData.EDN_FEATURE_ATTRIBUTE_VALUE,
          editable: true,
          editrules: 'required;length[~80]',
          sortable: false,
        },
        {
          name: 'valueDesc',
          label: this.i18nData.EDN_FEATURE_ATTR_VALUE_DESC,
          editable: true,
          editrules: 'length[~160]',
          sortable: false,
        },
      ];
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      this.$el.appendTo('body');
      return this;
    },
    afterRender: () => {
      // surfaceCatTypeGroup = this.qrySurfaceCatGroup();
      this.$('.modal-body')
        .css('height', '610')
        .css('overflow-y', 'scroll');

      this.createCombo();
      this.initCombo();
      this.hideSourceTypeRel();
      this.$enumGrid = this.$('#gridEnumEdnRes').jqGrid({
        data: [],
        colModel: this.colModel,
        datatype: 'json',
        width: 750,
        height: 200,
      });

      this.$attrForm = this.$('#formAttrEdnRes').form();

      this.disabled = false;
      if (this.option.operState === 'M') {
        // 修改属性
        if (this.option.selrow.isNull === 'N') {
          this.$('#checkIsNullableAttrEndRes').attr('checked', false);
        }
        if (this.option.selrow.ifBatch === 'N') {
          this.$('#checkIfBatchAttrEndRes').attr('checked', false);
        }
        if (this.option.selrow.supportHldTemplate === 'Y') {
          this.$('#checkIfHLDTemplate').attr('checked', true);
        }
        if (this.option.selrow.resAttrCode === 'NAME' || this.option.selrow.resAttrCode === 'FULL_NAME' || this.option.selrow.comment === 'sys') {
          this.$('#checkQuickInput')
            .parent()
            .parent()
            .hide();
        } else if (this.option.selrow.quickInputFlag === 'Y') {
          this.$('#checkQuickInput').attr('checked', true);
        }

        this.$('#comboFeatureAttrNameEdn').combobox('disable');
        this.$('#inputFeatureAttrDescEdn').val(this.option.selrow.attrDesc);
        this.$comboDataType.combobox('value', this.option.selrow.dataType);
        this.$('#inputAttrLengthEdn').val(this.option.selrow.dataLen);
        this.$('#inputPrecisionAttrEdn').val(this.option.selrow.precision);
        this.$('#inputScaleAttrEdn').val(this.option.selrow.scale);
        this.$comboExpFlag.combobox('value', this.option.selrow.expFlag);
        this.$('#inputInitValueAttrEdn').val(this.option.selrow.initValue);
        this.$('#inputResAttrCodeEdn').val(this.option.selrow.resAttrCode);
        this.$comboControlType.combobox('value', this.option.selrow.controlType);
        this.$comboControlFlag.combobox('value', this.option.selrow.controlFlag);
        if (this.option.selrow.controlType === '3') {
          this.option.selrow.attrValues.forEach(item => {
            this.$enumGrid.grid('addRowData', item);
          });
        }
      } else if (this.option.operState === 'A') {
        // 新增属性
      }
      this.$attrFormFlag = true;
      this.$el.dialog({
        resizable: false,
        modal: true,
        width: '800',
        height: '610',
        close: () => {
          this.remove();
          this.trigger('close');
        },
      });
      return this;
    },

    ok: () => {
      if (!this.$('#formAttrEdnRes').isValid()) {
        return;
      }
      this.$enumGrid.grid('saveAllRow');
      this.attrData = this.$enumGrid.grid('getRowData');
      for (let i = 0; i < this.attrData.length; i += 1) {
        this.attrData[i].dispSeq = i + 1;
      }
      const attrValueShow = $('#comboControlTypeAttrEdn').val();
      const params = {
        attrName: this.$('#comboFeatureAttrNameEdn').val(),
        attrDesc: this.$('#inputFeatureAttrDescEdn').val(),
        dataType: this.$('#comboDataTypeAttrEdn').val(),
        dataTypeDesc: '',
        dataLen: this.$('#inputAttrLengthEdn').val(),
        precision: this.$('#inputPrecisionAttrEdn').val(),
        scale: this.$('#inputScaleAttrEdn').val(),
        expFlag: this.$('#comboExpFlagAttrEdn').val(),
        expFlagDesc: '',
        initValue: this.$('#inputInitValueAttrEdn').val(),
        resAttrCode: this.$('#inputResAttrCodeEdn').val(),
        isNull: this.$('#checkIsNullableAttrEndRes').is(':checked') ? 'Y' : 'N',
        ifBatch: this.$('#checkIfBatchAttrEndRes').is(':checked') ? 'Y' : 'N',
        supportHldTemplate: $('#checkIfHLDTemplate').is(':checked') ? 'Y' : 'N',
        quickInputFlag: this.$('#checkQuickInput').is(':checked') ? 'Y' : 'N',
        controlType: attrValueShow,
        controlTypeDesc: '',
        controlFlag: this.$('#comboControlFlagAttrEdn').val(),
        controlFlagDesc: '',
        columnName: this.$('#comboFeatureAttrNameEdn').val(),
        attrId: '',
        resType: this.option.resType,
        attrGroup: this.option.attrGroup,
        state: this.option.state,
        createUser: '',
        createDate: '',
        modifyUser: '',
        modifyDate: '',
        dispSeq: this.option.attrCount + 1,
        attrValues: attrValueShow === '3' ? this.attrData : [],
      };
      if (this.option.operState === 'M') {
        // 修改属性
        params.attrId = this.option.selrow.attrId;
        params.createUser = this.option.selrow.createUser;
        params.createDate = this.option.selrow.createDate;
        if (params.attrValues !== []) {
          params.attrValues.forEach(item => {
            item.attrId = this.option.selrow.attrId;
            item.createUser = this.option.selrow.createUser;
            item.createDate = this.option.selrow.createDate;
          });
        }
        FeatureAttrAction.modAttribute(params, data => {
          this.trigger('okCompleted', data);
          this.$el.dialog('close');
        });
      } else if (this.option.operState === 'A') {
        // 新增属性
        FeatureAttrAction.addAttribute(params, data => {
          this.trigger('okCompleted', data);
          this.$el.dialog('close');
        });
      }
    },

    cancel: () => {
      this.$el.dialog('close');
    },
    createCombo: () => {
      this.$comboFeatureAttrName = this.$('#comboFeatureAttrNameEdn').combobox({
        dataTextField: 'name',
        dataValueField: 'name',
        dataSource: [],
      });
      this.$comboControlFlag = this.$('#comboControlFlagAttrEdn').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Normal', value: '1' },
          { name: 'Hidden', value: '2' },
          { name: 'Disabled', value: '3' },
        ],
        value: '1',
        change: this.changeControlFlag,
      });
      this.$comboControlType = this.$('#comboControlTypeAttrEdn').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Text', value: '1' },
          { name: 'Date', value: '2' },
          { name: 'ComboBox', value: '3' },
        ],
        value: '1',
        change: this.changeControlType,
      });
      this.$comboDataType = this.$('#comboDataTypeAttrEdn').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Date', value: 'D' },
          { name: 'Number', value: 'N' },
          { name: 'String', value: 'S' },
        ],
        value: 'D',
        change: this.changeDataType,
      });
      this.$comboExpFlag = this.$('#comboExpFlagAttrEdn').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Import and Export', value: '1' },
          { name: 'Only Export', value: '2' },
          { name: 'Only Import', value: '3' },
          { name: 'Disabled Import and Export', value: '4' },
        ],
        value: '1',
      });
    },

    initCombo: () => {
      FeatureAttrAction.qryStructure({ resType: this.option.resType }, data => {
        const attrIdList = [];
        data[0].attrIds.forEach(item => {
          attrIdList.push({ name: item });
        });
        this.$comboFeatureAttrName.combobox({ dataSource: attrIdList });
        if (this.option.operState === 'M') {
          this.$comboFeatureAttrName.combobox('value', this.option.selrow.columnName);
        } else {
          this.$comboFeatureAttrName.combobox('value', attrIdList[0].name);
        }
      });
    },

    hideSourceTypeRel: () => {
      this.$('#divAttrValueListEdn').hide();
    },

    changeDataType: e => {
      const dataTypeValue = e.target.value;
      this.$('#divAttrLengthEdn').removeClass('required');
      this.$('#divPrecisionAttrEdn').removeClass('required');
      if (dataTypeValue === 'S') {
        this.$('#divAttrLengthEdn').addClass('required');
      } else if (dataTypeValue === 'N') {
        this.$('#divPrecisionAttrEdn').addClass('required');
      }
    },

    // 选到combobox时显示
    changeControlType: e => {
      const controlTypeValue = e.target.value;
      if (controlTypeValue === '3') {
        this.$('#divAttrValueListEdn').show();
      } else {
        this.attrData = [];
        this.$('#divAttrValueListEdn').hide();
      }
    },

    changeControlFlag: e => {
      const { value } = e.target;
      if (value === '1') {
        this.$('#checkQuickInput').attr('disabled', false);
      } else {
        this.$('#checkQuickInput').attr('checked', false);
        this.$('#checkQuickInput').attr('disabled', true);
      }
    },
    addAttrValue: () => {
      const newData = {
        attrId: '',
        attrValue: '',
        createDate: '',
        createUser: '',
        dispSeq: '',
        id: '',
        modifyDate: '',
        modifyUser: '',
        state: this.option.state,
        valueDesc: '',
      };
      // 新增记录,并选中行
      this.$enumGrid.grid('addRowData', newData);
      this.$enumGrid.grid('setSelection', newData);
      // 打开编辑功能
      const rowid = this.$enumGrid.grid('getGridParam', 'selrow');
      this.$enumGrid.grid('editRow', rowid, true);
    },

    delAttrValue: () => {
      const selrow = this.$enumGrid.grid('getSelection');
      this.$enumGrid.grid('setPrevSelection', selrow);
      this.$enumGrid.grid('delRowData', selrow);
    },

    upAttrValue: () => {
      const selrowid = this.$enumGrid.grid('getGridParam', 'selrow');
      const selrow = this.$enumGrid.grid('getGridRowById', selrowid);
      const $selrow = $(selrow);
      const $prevrow = $(selrow).prev();
      $prevrow.detach();
      $selrow.after($prevrow);
    },

    downAttrValue: () => {
      const selrowid = this.$enumGrid.grid('getGridParam', 'selrow'); // 获取选中的行标识
      const selrow = this.$enumGrid.grid('getGridRowById', selrowid);
      const $selrow = $(selrow);
      const $nextrow = $(selrow).next();
      $nextrow.detach();
      $selrow.before($nextrow);
    },
  });
});
