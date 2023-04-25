// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/hldTemplate/templates/SettingStyle.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/hldTemplate/i18n/hldtemplate',
  'oss_core/edesign/hldTemplate/actions/hldTemplateAction',
  'oss_core/edesign/assets/config/edesign/styleConfig.js',
  'css!oss_core/edesign/hldTemplate/css/hldTemplate.css',
], (template, i18nPublic, i18nHldTemplate, HLDTemplateAction, styles) => {
  const { fish, $, portal } = window;
  return portal.BaseView.extend({
    className: 'ui-dialog dialog',
    template: fish.compile(template),
    i18nData: fish.extend({}, i18nHldTemplate, i18nPublic),
    events: {
      'click #settingStyleModalOk': 'okFunc',
      'click #settingStyleModalCancel': 'dialogClose',
      'click .tab-item-0': 'changeTab0',
      'click .tab-item-1': 'changeTab1',
      'click .tab-item-2': 'changeTab2',
    },
    initialize: opts => {
      this.colors = ['#80c833', '#5293f7', '#00c5c6', '#f59451', '#6e65f0', '#d7b30a', '#c629b6', '#b3b147', '#f25151'];
      this.imgUrl = 'oss_core/edesign/assets/image/map/res-png/'; // http://10.45.51.61/oss/
      this.defualtStyle = styles.style[opts.resType] || {
        fontFamiliy: 'Microsoft Yahei',
        fontSize: 12,
        fontWeight: 5,
        fontStyle: 'normal',
        fontColor: '#80c833',
        fontXOff: 0,
        fontYOff: 27,
        labelField: '',
        size: 10,
        visibleRange: '',
        maxVisibleScale: null,
        minVisibleScale: null,
        lineWidth: 2,
        lineColor: '#80c833',
        lineStyle: 'solid',
        fillColor: '#80c8331a',
      };
      delete this.defualtStyle.gisLayerThemeList;
      if (opts.resType !== 'A5') {
        this.defualtStyle.labelField = this.defualtStyle.labelField || 'resName';
      }
      // if(this.defualtStyle.fillColor){
      //     const color = this.defualtStyle.substr(0, 7);
      //     const tran = this.defualtStyle.substr(7)||'0';
      //     const transparency = parseInt((1-(parseInt(tran,16)/246))*100)
      //     this.defualtStyle.fillColor = color;
      //     this.defualtStyle.transparency = transparency;
      // }

      this.initData = opts.styleJson || {};
      if (!this.defualtStyle.geometryType) {
        this.defualtStyle.geometryType = this.initData.geometryType || 'geometryMultipolyline';
      }
      const iconUrl = this.initData.iconUrl || opts.iconUrl || `${this.imgUrl}hld_icon_1.png`;
      this.defualtStyle.iconUrl = iconUrl;
      // this.GISDATA = [];
      // (opts.GISDATA || []).map(it => {
      //     if (!attrNameMap[it.attrName] && it.attrName) {
      //         attrNameMap[it.attrName] = true;
      //         this.GISDATA.push(it);
      //     }
      // });
      this.option = fish.extend({}, this.option, opts);

      const option = {
        url: 'edesign/feature/manager/resFeatureAttr/v1',
        data: {
          resType: opts.resType,
        },
        success: data => {
          const attrNameMap = {};
          this.GISDATA = [];
          (data.resultList || []).forEach(it => {
            if (!attrNameMap[it.attrName] && it.attrName) {
              attrNameMap[it.attrName] = true;
              this.GISDATA.push(it);
            }
          });
          this.addOption();
        },
      };
      fish.get(option);

      this.iconUrl = iconUrl;
      return this;
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      this.$el.appendTo('body');

      this.contentReady();
      return this;
    },
    addOption: () => {
      const selectAttrBox = this.$('#selectAttrToText');
      const GISDATA = this.GISDATA || [];
      GISDATA.forEach(it => {
        $(`<option value="${it.attrName}" >${it.attrDesc}</option>`).appendTo(selectAttrBox);
      });
      const labelField = this.initData.labelField || this.defualtStyle.labelField;
      this.$('#formSettingStyle').form('value', {
        labelField: this.initData.labelField || this.defualtStyle.labelField,
      });
      const dom = this.$('.show_box_text')[0];
      dom.innerText = `${this.option.resType}${labelField ? `_${labelField}` : ''}_1`;
    },
    afterRender: () => {
      this.$('.setting-style-panel').addClass('hidden');

      this.$('#style_icon').removeClass('hidden');
      this.$('#style_icon').addClass('show');
      this.$('.tab-item-0').addClass('active');

      const listBox = this.$('.symbol_list_box');
      // const selectAttrBox = this.$('#selectAttrToText');
      const selectStyleFontFamiliy = this.$('#selectStyleFontFamiliy');
      const that = this;
      let imglist = [
        'A5',
        'AIR_WIRE',
        'CC',
        'CELL',
        'CLOSURE-1',
        'CLOSURE',
        'DB',
        'F_CLOSURE',
        'MANHOLE',
        'marker-locate-red',
        'MDF',
        'OCC',
        'ODB',
        'ODF',
        'OLT',
        'ONU',
        'PIPELINE',
        'POLE',
        'SITE',
        'splice',
        'SPLITTER',
      ];
      imglist = [];
      for (let i = 0; i < 135; i += 1) {
        imglist.push(`hld_icon_${i + 1}`);
      }

      $.each(imglist, (index, val) => {
        $(
          `<span class='selectIconSpan' data-imgUrl="${that.imgUrl}${val}.png" ><img  class="selectIconImg"  src="${that.imgUrl}${val}.png" /></span>`,
        )
          .appendTo(listBox)
          .click(() => {
            const color = that.colors[index % 9];
            const formValue = that.$('#formSettingStyle').form('value');
            that.$('#formSettingStyle').form('value', {
              ...formValue,
              lineColor: color,
              fillColor: color,
              fontColor: color,
            });
            that.$('.show_box_text')[0].style.color = color;
            that.setBackColor();
            that.changeLineColor(color);
            that.showImgContent(`${that.imgUrl}${val}.png`);
          });
      });
      this.showImgContent(this.iconUrl);
      // const GISDATA = this.GISDATA || [];
      // GISDATA.map(it => {
      //     $(`<option value="${it.attrName}" >${it.attrName}</option>`).appendTo(selectAttrBox);
      // });
      const fontFamiliy = ['Microsoft Yahei', 'Helvetica Neue', 'Helvetica', 'Arial', 'Hiragino Sans GB', 'Heiti SC', 'WenQuanYi Micro Hei'];
      fontFamiliy.forEach(it => {
        $(`<option value="${it}" >${it}</option>`).appendTo(selectStyleFontFamiliy);
      });
      selectStyleFontFamiliy.change(() => {
        that.$('.show_box_text')[0].style.fontFamily = selectStyleFontFamiliy.val();
      });

      if (this.defualtStyle.geometryType === 'geometryPoint') {
        this.$('.show_box_line').addClass('hidden');
        this.$('#style_setting_line').addClass('hidden');
        this.$('#style_setting_gon').addClass('hidden');
        this.$('.style_label_show_box')[0].style.height = '180px';
      }
      if (this.defualtStyle.geometryType === 'geometryMultipolygon') {
        this.$('.show_box_line').addClass('hidden');
        this.$('#setting_style_img_size').addClass('hidden');
        this.$('.show_box_img_content').addClass('hidden');
      }
      if (this.defualtStyle.geometryType === 'geometryMultipolyline') {
        this.$('.show_box_img_content').addClass('hidden');
        this.$('#setting_style_img_size').addClass('hidden');
        this.$('#style_setting_gon').addClass('hidden');
        this.$('.style_label_show_box')[0].style.height = '180px';
      }

      this.initFormVal();
      this.initTextShowStyle();
      this.initLineShowStyle();
      this.initGonShowStyle();
      this.initOtherInputState();
    },
    showImgContent: val => {
      this.iconUrl = val;
      this.$('.selectIconSpan').removeClass('active');
      this.$(`.selectIconSpan[data-imgUrl='${val}']`).addClass('active');
      this.$('.symbol_view_box').html($(`<img class="select_preview_img" src="${val}" />`));
      this.$('.show_box_img_content').attr('src', val);
      this.$('.select_preview_img')[0].onload = () => {
        this.imgSize = this.$('.select_preview_img')[0].naturalWidth;
      };
    },
    changeTab0: () => {
      this.$('.tab-item').removeClass('active');
      this.$('.setting-style-panel').addClass('hidden');
      this.$('#style_icon').removeClass('hidden');
      this.$('#style_icon').addClass('show');
      this.$('.tab-item-0').addClass('active');
    },
    changeTab1: () => {
      this.$('.tab-item').removeClass('active');
      this.$('.setting-style-panel').addClass('hidden');
      this.$('#style_label').removeClass('hidden');
      this.$('#style_label').addClass('show');
      this.$('.tab-item-1').addClass('active');
    },
    changeTab2: () => {
      this.$('.tab-item').removeClass('active');
      this.$('.setting-style-panel').addClass('hidden');
      this.$('#style_others').removeClass('hidden');
      this.$('#style_others').addClass('show');
      this.$('.tab-item-2').addClass('active');
    },
    initFormVal: () => {
      const valData = {};
      const defaultData = { ...this.defualtStyle };
      const keys = Object.keys(defaultData);
      keys.forEach(key => {
        valData[key] = this.initData[key] || defaultData[key];
      });
      // for (let key in defaultData) {
      //   valData[key] = this.initData[key] || defaultData[key];
      // }
      if (valData.fillColor) {
        const color = valData.fillColor.substr(0, 7);
        const tran = valData.fillColor.substr(7) || '0';
        const transparency = parseInt((1 - parseInt(tran, 16) / 246) * 100, 10);
        valData.fillColor = color;
        valData.transparency = transparency;
      }
      if (valData.minVisibleScale || valData.minVisibleScale) {
        valData.visibleRange = 'zoom';
      } else {
        valData.visibleRange = '';
      }
      this.$('#formSettingStyle').form('value', {
        ...valData,
        fontWeight: valData.fontWeight === 5 ? undefined : 'on',
        fontStyle: valData.fontStyle === 'normal' ? undefined : 'on',
      });
    },
    setBackColor: () => {
      const dom = this.$('.show_box_border')[0];
      const { fillColor, transparency } = this.$('#formSettingStyle').form('value');
      const tran = parseInt(246 * (1 - parseFloat(transparency || 0) / 100), 10).toString(16);
      const tranFormat = `${tran}`.length === 1 ? `0${tran}` : tran;
      const color = `${fillColor}${tranFormat}`;
      dom.style.backgroundColor = color;
    },

    // 初始化面的配置
    initGonShowStyle: () => {
      if (this.defualtStyle.geometryType !== 'geometryMultipolygon') {
        return;
      }
      const that = this;
      that.setBackColor();
      this.$('input[name="fillColor"]').change(() => {
        that.setBackColor();
      });
      this.$('input[name="transparency"]').change(e => {
        e.target.value = e.target.value || 0;
        if (parseFloat(e.target.value) < 0) {
          e.target.value = 0;
        } else if (parseFloat(e.target.value) > 100) {
          e.target.value = 100;
        }
        that.setBackColor();
      });
    },

    // 初始化线的配置
    initLineShowStyle: () => {
      if (this.defualtStyle.geometryType === 'geometryPoint') {
        return;
      }
      const that = this;
      const isGon = this.defualtStyle.geometryType === 'geometryMultipolygon';
      const dom = this.$(isGon ? '.show_box_border' : '.show_box_line')[0];
      const formValue = this.$('#formSettingStyle').form('value');
      const lineStyleMap = {
        solid: 'solid',
        dash: 'dashed',
        dot: 'dotted',
      };
      dom.style[isGon ? 'borderStyle' : 'borderTopStyle'] = lineStyleMap[formValue.lineStyle] || 'solid';
      dom.style[isGon ? 'borderWidth' : 'borderTopWidth'] = `${formValue.lineWidth}px`;
      dom.style[isGon ? 'borderColor' : 'borderTopColor'] = formValue.lineColor;

      this.$('select[name="lineStyle"]').change(e => {
        dom.style[isGon ? 'borderStyle' : 'borderTopStyle'] = lineStyleMap[e.target.value] || 'solid';
      });
      this.$('input[name="lineWidth"]').change(e => {
        e.target.value = parseInt(e.target.value, 10) || 0;
        if (parseInt(e.target.value, 10) < 1) {
          e.target.value = 1;
        } else if (parseInt(e.target.value, 10) > 10) {
          e.target.value = 10;
        }
        dom.style[isGon ? 'borderWidth' : 'borderTopWidth'] = `${e.target.value}px`;
      });
      this.$('input[name="lineColor"]').change(e => {
        that.changeLineColor(e.target.value);
        // dom.style[isGon ? 'borderColor' : 'borderTopColor'] = e.target.value;
      });
    },
    changeLineColor: color => {
      const isGon = this.defualtStyle.geometryType === 'geometryMultipolygon';
      const dom = this.$(isGon ? '.show_box_border' : '.show_box_line')[0];
      dom.style[isGon ? 'borderColor' : 'borderTopColor'] = color;
    },

    // 初始化文字配置以及监听
    initTextShowStyle: () => {
      const formValue = this.$('#formSettingStyle').form('value');
      const that = this;
      const dom = this.$('.show_box_text')[0];
      dom.style.fontFamily = formValue.fontFamiliy;
      dom.style.fontSize = `${formValue.fontSize}px`;
      dom.style.fontWeight = formValue.fontWeight === 'on' ? 'bold' : '5';
      dom.style.fontStyle = formValue.fontStyle === 'on' ? 'italic' : 'normal';
      dom.style.color = formValue.fontColor;
      dom.style.left = `${parseFloat(formValue.fontXOff || 0) / 6}px`;
      dom.style.top = `${parseFloat(formValue.fontYOff || 0) / 6}px`;
      that.$('.show_box_img_content')[0].style.width = `${formValue.size || 10}px`;
      dom.innerText = `${this.option.resType}${formValue.labelField ? `_${formValue.labelField}` : ''}_1`;
      this.$('#styleLabelTextBold').change(e => {
        dom.style.fontWeight = e.target.checked ? 'bold' : that.defualtStyle.fontWeight;
      });

      this.$('#styleLabelTextItaltc').change(e => {
        dom.style.fontStyle = e.target.checked ? 'italic' : that.defualtStyle.fontStyle;
      });

      this.$('input[name="fontSize"]').change(e => {
        e.target.value = parseInt(e.target.value, 10) || that.defualtStyle.fontSize;
        if (parseInt(e.target.value, 10) < 12) {
          e.target.value = 12;
        } else if (parseInt(e.target.value, 10) > 30) {
          e.target.value = 30;
        }
        dom.style.fontSize = `${e.target.value}px`;
      });

      this.$('input[name="fontColor"]').change(() => {
        dom.style.color = that.$('#formSettingStyle').form('value').fontColor;
      });

      this.$('input[name="visibleRange"]').change(() => {
        this.initOtherInputState();
      });

      this.$('input[name="fontXOff"]').change(e => {
        e.target.value = e.target.value || 0;
        if (parseInt(e.target.value, 10) < -30) {
          e.target.value = -30;
        } else if (parseInt(e.target.value, 10) > 30) {
          e.target.value = 30;
        }
        dom.style.left = `${parseFloat(e.target.value || 0) / 6}px`;
      });
      this.$('input[name="fontYOff"]').change(e => {
        e.target.value = e.target.value || 0;
        if (parseInt(e.target.value, 10) < -30) {
          e.target.value = -30;
        } else if (parseInt(e.target.value, 10) > 30) {
          e.target.value = 30;
        }
        dom.style.top = `${parseFloat(e.target.value || 0) / 6}px`;
      });
      this.$('select[name="labelField"]').change(e => {
        dom.innerText = `${that.option.resType}${e.target.value ? `_${e.target.value}` : ''}_1`;
      });
      this.$('#iconImgSizeInput').change(e => {
        e.target.value = e.target.value || 10;
        that.$('.show_box_img_content')[0].style.width = `${e.target.value}px`;
      });
    },

    initOtherInputState: () => {
      const formValue = this.$('#formSettingStyle').form('value');
      const minDom = this.$('input[name="minVisibleScale"]');
      const maxDom = this.$('input[name="maxVisibleScale"]');
      if (formValue.visibleRange === 'zoom') {
        minDom.removeClass('inputDisabled');
        maxDom.removeClass('inputDisabled');
        minDom.attr('disabled', false);
        maxDom.attr('disabled', false);
      } else {
        minDom.addClass('inputDisabled');
        maxDom.addClass('inputDisabled');
        minDom.val(null);
        maxDom.val(null);
        minDom.attr('disabled', true);
        maxDom.attr('disabled', true);
      }
    },
    contentReady: () => {
      this.$el.dialog({
        resizable: false,
        modal: true,
        width: '850',
        height: '520',
        close: () => {
          this.remove();
          this.trigger('close');
        },
      });
      return this;
    },
    dialogClose: () => {
      this.$el.dialog('close');
    },
    okFunc: () => {
      if (
        this.$('#formSettingStyle')
          .form()
          .isValid()
      ) {
        const formValue = this.$('#formSettingStyle').form('value');
        const newFormValue = { ...formValue };
        if (this.defualtStyle.geometryType === 'geometryMultipolygon') {
          const { fillColor, transparency } = newFormValue;
          const tran = parseInt(246 * (1 - parseFloat(transparency || 0) / 100), 10).toString(16);
          const tranFormat = `${tran}`.length === 1 ? `0${tran}` : tran;
          const color = `${fillColor}${tranFormat}`;
          newFormValue.fillColor = color;
          delete newFormValue.transparency;
        }
        const params = {
          geometryType: this.defualtStyle.geometryType,
          ...newFormValue,
          iconUrl: this.iconUrl,
          xOff: 0,
          yOff: 0,
          fontWeight: newFormValue.fontWeight ? 'bold' : 5,
          fontStyle: newFormValue.fontStyle ? 'italic' : 'normal',
          size: parseFloat(newFormValue.size || 10),
          fontSize: parseFloat(newFormValue.fontSize || 0),
          fontXOff: parseFloat(newFormValue.fontXOff || 0),
          fontYOff: parseFloat(newFormValue.fontYOff || 0),
          imgSize: this.imgSize,
          minVisibleScale: newFormValue.minVisibleScale ? parseFloat(newFormValue.minVisibleScale) : null,
          maxVisibleScale: newFormValue.maxVisibleScale ? parseFloat(newFormValue.maxVisibleScale) : null,
          labelField: newFormValue.labelField || '',
        };
        delete params.visibleRange;
        if (this.defualtStyle.geometryType === 'geometryMultipolyline') {
          // 线，没有填充色
          delete params.fillColor;
        }
        if (this.defualtStyle.geometryType === 'geometryPoint') {
          // 点，没有填充色和线的样式
          delete params.fillColor;
          delete params.lineColor;
          delete params.lineStyle;
          delete params.lineWidth;
        }
        this.trigger('OKEvent', params);
        this.$el.dialog('close');
      }
    },
  });
});
