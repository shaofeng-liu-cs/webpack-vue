<!--
 * @Author: your name
 * @Date: 2020-04-09 16:26:20
 * @LastEditTime: 2021-04-09 17:40:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\components\combobox\Combobox.vue
-->
<template>
  <input :value="combobox" type="text" name="combobox" ref="combobox" class="form-control" :disabled="disabled" :data-rule="dataRule">
</template>

<script>
export default {
  name: 'Combobox',
  componentName: 'Combobox',
  model: {
    prop: 'combobox',
    event: 'input',
  },
  props: {
    setting: {
      type: Object,
      default: () => {
        return {};
      },
    },
    disabled: {
      type: Boolean,
      //default:true
    },
    dataRule: {
      type: String,
      default: '',
    },
    combobox: {},
  },
  data() {
    return {
      $combobox: undefined,
      childrenCombobox: this.combobox, // 避免直接修改父组件传过来的值，会报错。
    };
  },
  mounted() {
    //let options = Object.assign({}, this.setting);
    this.setting.dataSource = this.setting.dataSource || [];
    this.setting.dataTextField = this.setting.dataTextField || 'name';
    this.setting.dataValueField = this.setting.dataValueField || 'code';
    this.setting.value = this.setting.value || '';

    this.$combobox = $(this.$refs.combobox).combobox(this.setting);
    if (this.disabled) {
      this.$combobox.combobox('disable');
    } else {
      this.$combobox.combobox('enable');
    }
    //change事件
    this.$combobox.on('combobox:change', e => {
      this.childrenCombobox = e.target.value;
    });

    //close事件
    this.$combobox.on('combobox:close', e => {
      this.$emit('close', this.$combobox.combobox('getSelectedItem'));
    });

    //open事件
    this.$combobox.on('combobox:open', e => {
      this.$emit('open', this.$combobox.combobox('getSelectedItem'));
    });

    //select事件
    this.$combobox.on('combobox:select', (e, item) => {
      this.$emit('select', this.$combobox.combobox('getSelectedItem'));
    });
  },
  destroyed() {
    this.$combobox.combobox('destroy');
  },
  watch: {
    'setting.dataSource': {
      deep: true,
      immediate: false,
      handler(val, old) {
        // 需要setting的datasource变化且与之前数据不一样才进行下拉框重载，
        if (JSON.stringify(val) !== JSON.stringify(old)) {
          console.log(this.combobox);

          // fish设置dataSource值的时候会默认清除原来的value并且触发change函数
          $(this.$refs.combobox).combobox({
            dataSource: val,
            value: this.combobox,
          });
        }
      },
    },
    childrenCombobox(newVal, oldVal) {
      this.$emit('input', newVal);
      this.$emit('change', this.$combobox.combobox('getSelectedItem') || {}, this.$combobox[0].name);
    },
    combobox(newVal, oldVal) {
      this.$combobox.combobox('value', newVal);
    },
    disabled: {
      deep: true,
      immediate: false,
      handler(val, old) {
        if (this.disabled) {
          this.$combobox.combobox('disable');
        } else {
          this.$combobox.combobox('enable');
        }
      },
    },
  },
};
</script>
