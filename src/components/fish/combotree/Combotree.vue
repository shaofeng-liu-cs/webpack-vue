<template>

  <input :value="currentValue" name="combotree" ref="combotree" class="form-control" @input="inputload">

</template>

<script>
export default {
  name: 'Combotree',

  componentName: 'Combotree',

  provide() {
    return {};
  },

  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    options: {
      type: Object,
    },
    currentValue: {
      type: String,
    },
  },
  model: {
    prop: 'currentValue',
    event: 'input',
  },
  computed: {
    callback() {
      return {
        callback: {
          onClick: (e, treeNode) => {
            console.log(treeNode);
            this.theValue = treeNode[this.options.dataValueField];
          },
        },
      };
    },
  },
  data() {
    return {
      //currentValue: '',
      theValue: this.currentValue,
      isShow: false,
    };
  },
  created() {},
  mounted() {
    this.init();
  },
  destroyed() {
    $(this.$refs.combotree).combotree('destroy');
  },
  watch: {
    'options.fNodes': {
      deep: true,
      immediate: false,
      handler(val, old) {
        // 需要options的datasource变化且与之前数据不一样才进行下拉框重载，
        if (JSON.stringify(val) !== JSON.stringify(old)) {
          // fish设置dataSource值的时候会默认清除原来的value并且触发change函数
          $(this.$refs.combotree).combotree({
            fNodes: val,
            value: this.currentValue,
          });
        }
      },
    },
    theValue(newVal, oldVal) {
      this.$emit('input', newVal);
    },
    currentValue(newVal, oldVal) {
      $(this.$refs.combotree).combotree('value', newVal);
    },
  },
  methods: {
    init(val) {
      let options = Object.assign({}, this.options, val, this.callback);
      $(this.$refs.combotree).combotree(options);
      console.log('设置值：', this.theValue);
      $(this.$refs.combotree).combotree('value', this.theValue);

      $(this.$refs.combotree).on('combotree:change', e => {
        this.$emit('change', e);
      });
    },
    setvalue(val) {
      if (this.theValue === val) return;
      this.$nextTick(() => {
        $(this.$refs.combotree).combotree('value', val);
      });

      this.theValue = val;
    },
    inputload(event) {
      let value = event.target.value;
      this.$emit('input', value);
    },
  },
};
</script>
