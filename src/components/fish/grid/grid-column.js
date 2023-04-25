/*
 * @Author: your name
 * @Date: 2020-04-22 09:03:30
 * @LastEditTime: 2021-06-03 15:31:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\components\grid\grid-column.js
 */
export default {
  name: 'grid-column',
  props: {
    prop: String,
    label: String,
    keys: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '150',
    },
    editrules: {
      type: String || Object,
      default: '',
    },
    keyFlag: {
      type: Boolean,
      default: false,
    },
    headertitle: {
      type: String,
      default: '',
    },
    attrInfo: {
      type: Object,
    },
    type: {
      type: String,
      default: 'simple', // Complex 复杂的  ， simple 简单的
    },
  },
  inject: ['insertColumn'],
  created() {
    this.column = {
      name: this.prop,
      label: this.label ? this.label : this.name,
      hidden: this.hidden,
      editable: this.editable,
      width: this.width,
      editrules: this.editrules,
      key: this.keyFlag,
      headertitle: this.headertitle ? this.headertitle : this.label,
    };
    this.initCol();
  },
  mounted() {
    if (this.$scopedSlots.default) {
      const _this = this;
      this.column.formatter = (cellval, opts, rwdat) => {
        const index = this.p._index[opts.rowId];
        const vnode = _this.$scopedSlots.default({ row: rwdat, index })[0]; // 插槽入参
        _this.__patch__(undefined, vnode);
        const id = window.fish.getUUID();
        const wrapper = `<div id="${id}"></div>`;
        setTimeout(() => {
          if (document.getElementById(id)) {
            document.getElementById(id).appendChild(vnode.elm);
          }
        }, 0);
        return wrapper;
      };
    }
    this.insertColumn(this.column);
  },
  methods: {
    initCol() {
      if (this.type === 'simple') {
        if (this.attrInfo && this.attrInfo.controlType === '3' && this.attrInfo.attrValuesDTOS && this.attrInfo.attrValuesDTOS.length > 0) {
          this.column.formatter = 'select';
          this.column.edittype = 'select';
          const options = { value: {} };
          this.attrInfo.attrValuesDTOS.forEach(value => {
            options.value[value.attrValue] = value.valueDesc;
          });
          this.column.editoptions = options;
        }
      } else {
        this.column.formatter = (cellval, opts, rwdata) => {
          if (cellval) {
            if (rwdata.attrInfo.controlType === '3') {
              const value = rwdata.attrInfo.attrValuesDTOS.find(attr => attr.attrValue === cellval).valueDesc;
              return value;
            }
            return cellval;
          }
          return '';
        };
        this.column.edittype = (cellval, opts, rwdata) => {
          let tpl;
          if (rwdata.attrInfo.controlType === '3') {
            tpl = `<input  type="text" name="combobox" id=${rwdata._id_}${rwdata.attrInfo.resAttrCode} class="form-control" >`;
          } else {
            tpl = `<input type="${rwdata.attrInfo.dataType === 'N' ? 'number' : 'text'}" id=${rwdata._id_}${
              rwdata.attrInfo.resAttrCode
            } class="form-control " >`;
          }
          return tpl;
        };
        this.column.editinit = (tpl, cellval, opts, rwdata) => {
          if (rwdata.attrInfo.controlType === '3') {
            const $combobox = window.$(this.$parent.$el.querySelector(`#${rwdata._id_}${rwdata.attrInfo.resAttrCode}`)).combobox({
              dataTextField: 'valueDesc',
              dataValueField: 'attrValue',
              dataSource: rwdata.attrInfo.attrValuesDTOS,
            });
            $combobox.combobox('value', rwdata[opts.name]);
            // $combobox.on('combobox:change', e => {
            //   gridData[attrCode] = e.target.value;
            //   gridData[attrCode + '_DESC'] = this.$('#' + controlId).combobox('text');
            //   this.$('#' + controlId).blur(); //手动设置失去焦点
            //   this.rowInputChange(gridData, attrCode, newRowid);
            // });
          } else {
            window.$(this.$parent.$el.querySelector(`#${rwdata._id_}${rwdata.attrInfo.resAttrCode}`)).val(cellval);
          }
        };
        this.column.editvalue = (opts, rwdata) => {
          if (rwdata.attrInfo.controlType === '3') {
            return window.$(this.$parent.$el.querySelector(`#${rwdata._id_}${rwdata.attrInfo.resAttrCode}`)).combobox('value');
          }
          return window.$(this.$parent.$el.querySelector(`#${rwdata._id_}${rwdata.attrInfo.resAttrCode}`)).val();
        };
      }
    },
  },
  watch: {},
  render() {
    return '';
  },
};
