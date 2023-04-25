/*
 * @Author: HongAnDing
 * @Date: 2022-07-16 23:10:17
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2022-08-22 09:10:50
 * @Description: file content
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/attributionAction/templates/layerActionPop.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/attributionAction/i18n/attraction',
  'oss_core/edesign/attributionAction/actions/attrActionAction',
], (template, i18nOpb, i18nObject, AttrActionAction) => {
  const { fish, portal } = window;
  return portal.BaseView.extend({
    className: 'ui-dialog dialog',
    template: fish.compile(template),
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    events: {
      'click #btnLayActOk': 'ok',
      'click #btnLayActCancel': 'cancel',
    },
    initialize: opts => {
      const titleObj = { POP_TITLE: opts.POP_TITLE };
      // if(!fish.isEmpty(opts.params)){
      //     this.params=opts.params;
      // }
      this.i18nData = fish.extend({}, titleObj, this.i18nData);
      this.option = fish.extend({}, this.option, opts);
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      this.$el.appendTo('body');
      return this;
    },
    afterRender: () => {
      this.$('.modal-body').css('height', '610');
      this.qryRestype();
      this.createCombo();
      this.$el.dialog({
        resizable: false,
        modal: true,
        width: '800',
        close: () => {
          this.remove();
          this.trigger('close');
        },
      });
      if (this.option.operState === 'M') {
        this.$('#addAttr').hide();
        this.$('#modAttr').show();
        const { params } = this.option;
        this.$('#inputActName').val(params.actionName);
        this.$comboActType.combobox('value', params.actionType);
        this.$comboSrcType.combobox('value', params.srcType);
        this.$comboToType.combobox('value', params.dstType);
      } else {
        this.$('#addAttr').show();
        this.$('#modAttr').hide();
      }
    },
    // 初始化展示restype和totype类型
    qryRestype: () => {
      const resTypes = this.getAllManagedRestypesWithGeometryType();
      const newArr = resTypes.map(item => ({ name: item.RES_TYPE_NAME, value: item.RES_TYPE }));
      this.toTypes = newArr;
      AttrActionAction.qryAllSurfaceLayers(data => {
        const newArr1 = data.map(item => ({ name: item.catName, value: item.catDesc }));
        this.resTypes = newArr.concat(newArr1);
      });
      // this.toTypes = this.resTypes;
    },
    // resType类型
    getAllManagedRestypesWithGeometryType: () => {
      const resTypes = [
        {
          RES_TYPE: 'SITE',
          RES_TYPE_NAME: 'Site',
        },
        {
          RES_TYPE: 'OLT',
          RES_TYPE_NAME: 'OLT',
        },
        {
          RES_TYPE: 'ODF',
          RES_TYPE_NAME: 'ODF',
        },
        {
          RES_TYPE: 'OCC',
          RES_TYPE_NAME: 'Optical Cabinet',
        },
        {
          RES_TYPE: 'F_CLOSURE',
          RES_TYPE_NAME: 'Fiber Closure',
        },
        {
          RES_TYPE: 'SPLITTER',
          RES_TYPE_NAME: 'Splitter',
        },
        {
          RES_TYPE: 'ODB',
          RES_TYPE_NAME: 'Optical Distribution Point',
        },
        {
          RES_TYPE: 'ONU',
          RES_TYPE_NAME: 'RAN Site',
        },
        {
          RES_TYPE: 'MDF',
          RES_TYPE_NAME: 'MDF',
        },
        {
          RES_TYPE: 'CC',
          RES_TYPE_NAME: 'Cabinet',
        },
        {
          RES_TYPE: 'DB',
          RES_TYPE_NAME: 'Distribution Point',
        },
        {
          RES_TYPE: 'CLOSURE',
          RES_TYPE_NAME: 'Closure',
        },
        {
          RES_TYPE: 'MANHOLE',
          RES_TYPE_NAME: 'Manhole',
        },
        {
          RES_TYPE: 'POLE',
          RES_TYPE_NAME: 'Pole',
        },
        {
          RES_TYPE: 'F_CABLE',
          RES_TYPE_NAME: 'Fiber Cable',
        },
        {
          RES_TYPE: 'C_CABLE',
          RES_TYPE_NAME: 'Copper Cable',
        },
        {
          RES_TYPE: 'AIR_WIRE',
          RES_TYPE_NAME: 'Air Wire',
        },
        {
          RES_TYPE: 'PIPELINE_G',
          RES_TYPE_NAME: 'Duct',
        },
        {
          RES_TYPE: 'OLT_GRID',
          RES_TYPE_NAME: 'OLT Grid',
        },
        {
          RES_TYPE: 'OCC_GRID',
          RES_TYPE_NAME: 'ODC-P Grid',
        },
        {
          RES_TYPE: 'ODB_GRID',
          RES_TYPE_NAME: 'ODP Grid',
        },
      ];
      return resTypes;
    },
    ok: () => {
      const params = {
        actionName: this.$('#inputActName').val(),
        actionType: this.$('#comboActType').val(),
        srcType: this.$('#comboSrcType').val(),
        dstType: this.$('#comboToType').val(),
      };
      if (
        (params.actionType === 'C' && params.actionName && params.actionType && params.srcType && params.dstType) ||
        (params.actionType === 'M' && params.actionName && params.actionType && params.srcType)
      ) {
        const sameName = this.option.showDataList.find(item => item.actionName === params.actionName);
        if (this.option.operState === 'M') {
          // 编辑情况下如果存在相同的名字而且不等于他之前的名字提示名字重复
          if (!fish.isEmpty(sameName) && params.actionName !== this.option.params.actionName) {
            fish.warn(this.i18nData.EDN_ATTR_SAMENAME);
          } else {
            params.actionId = this.option.params.actionId;
            AttrActionAction.editLayerAction(params, data => {
              this.trigger('okCompleted', data);
            });
            this.$el.dialog('close');
          }
        } else if (!fish.isEmpty(sameName)) {
          fish.warn(this.i18nData.EDN_ATTR_SAMENAME);
        } else {
          AttrActionAction.addLayerAction(params, data => {
            this.trigger('okCompleted', data);
          });
          this.$el.dialog('close');
        }
      } else {
        fish.warn(this.i18nData.EDN_ATTR_INCOMPLETE);
      }
    },
    cancel: () => {
      this.$el.dialog('close');
    },
    createCombo: () => {
      this.$comboActType = this.$('#comboActType').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Copy', value: 'C' },
          { name: 'Merge', value: 'M' },
        ],
        value: 'C',
        change: this.wrap(this.changeActType),
      });
      this.$comboSrcType = this.$('#comboSrcType').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: this.resTypes,
        change: this.wrap(this.changeSrcType),
      });
      this.$comboToType = this.$('#comboToType').combobox({
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: this.toTypes,
      });
    },

    changeActType: () => {
      const actType = this.$('#comboActType').val();
      if (actType === 'C') {
        this.$('#divToType').show();
      } else {
        this.$('#divToType').hide();
      }
    },
    changeSrcType: () => {
      this.$comboToType.combobox({ dataSource: this.toTypes.filter(item => item.value !== this.$('#comboSrcType').val()) });
    },
  });
});
