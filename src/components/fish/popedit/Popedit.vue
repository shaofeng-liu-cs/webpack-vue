<!--
 * @Author: your name
 * @Date: 2020-04-10 20:00:12
 * @LastEditTime: 2022-07-22 22:48:11
 * @LastEditors: HongAnDing
 * @Description:popedit组件
 * @FilePath: \online-design-v9\code\design-web\src\components\popedit\Popedit.vue
--> 
<template>
    <input :data-rule="dataRule" ref='popedit' type="text" :id="popId" :readonly='false'>
</template>
<script>
export default {
  name: 'Popedit',
  data() {
    return {
      dialogView: null, //弹窗视图对象
      popId: '',
    };
  },

  props: {
    id: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dataRule: {
      // 校验规则
      type: String,
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: Object,
    },
    buttonIcon: {
      // 默认图标;remove表示清除按钮,弹出层可以使用任意的glyphicon图标
      type: String,
      default: 'remove new-window',
    },
    dataTextField: {
      // dialog返回数据对象的属性,用于文本框显示
      type: String,
      default: 'name',
    },
    dataValueField: {
      // dialog返回数据对象的属性,用于提交到后台
      type: String,
      default: 'code',
    },
    dialogInstance: {
      // popedit弹出层实例
      type: Object,
    },
    dialogOption: {
      // popedit弹出层的参数,popedit采用了dialog控件展示弹出层,可配置dialog的所有参数
      type: Object,
    },
    initialData: {
      // popedit初始化参数
      type: Object,
    },
    showClearIcon: {
      // 聚焦时是否显示x图标,默认显示
      type: Boolean,
      default: true,
    },
    url: {
      // popedit弹出层的内容,可以是远程页面内容;如果以#开头,则表示的是当前dom的id,会取这个元素的内容
      type: String,
      default: '',
    },
  },
  created() {
    this.popId = this.id ? this.id : fish.getUUID(); //通过唯一ID绑定弹窗和popdeit输入框
  },
  mounted() {
    fish.require([this.url], aDialog => {
      let options = {
        id: this.popId,
      };
      if (this.initialData && !fish.isEmpty(this.initialData)) {
        //如果有初始化参数则传进去
        Object.assign(options, this.initialData);
      }
      this.dialogView = new aDialog(options);
      fish.listenTo(this.dialogView, 'OKEvent', result => {
        this.$emit('popeditOk', result);
      });
    });
    $(this.$refs.popedit).popedit({
      dataTextField: this.dataTextField,
      dataValueField: this.dataValueField,
    });
    $(this.$refs.popedit).on('popedit:change', (e, data) => {
      this.$emit('popeditChange', { data, name: this.name });
    });
    if (this.disabled) {
      $(this.$refs.popedit).popedit('disable');
    }
    if (this.value) {
      $(this.$refs.popedit).popedit('setValue', this.value);
    }
  },
  watch: {
    initialData: {
      deep: true,
      handler(newVal, oldVal) {
        let oldOption = $(this.$refs.popedit).popedit('option', 'dialogOption') || {};
        if (!fish.isEmpty(oldOption) && oldOption.initValue) {
          oldOption.initValue = Object.assign(oldOption.initValue, newVal);
          $(this.$refs.popedit).popedit('option', 'dialogOption', oldOption);
        }
      },
    },
    value: {
      deep: true,
      handler(newVal, oldVal) {
        $(this.$refs.popedit).popedit('setValue', this.value);
      },
    },
    disabled: {
      deep: true,
      immediate: false,
      handler(val, old) {
        if (this.disabled) {
          $(this.$refs.popedit).popedit('disable');
        } else {
          $(this.$refs.popedit).popedit('enable');
        }
      },
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
// .popedit {
//     width: calc(100% - 26px);
//     float: left;
// }
.form-control[readonly] {
  color: #000;
}
.form-control.ui-popedit-disabled[readonly] {
  color: #a0a0a0;
}
</style>