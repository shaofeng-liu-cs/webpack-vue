<template>

  <input :value="value" type="text" ref="datetimePicker" class=" input-group form-control" :data-rule="rule">

</template>

<script>
export default {
  name: 'DatetimePicker',

  componentName: 'DatetimePicker',

  provide() {
    return {};
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    options: {
      type: Object,
    },
    value: {
      type: String,
    },
    disabled: {
      type: Boolean,
    },
    dataRule: {},
  },
  computed: {
    option() {
      return {
        changeMinute: (e, value) => {
          this.$emit('changeMinute', e, value);
        },
        changeHour: (e, value) => {
          this.$emit('changeHour', e, value);
        },
        changeDay: (e, value) => {
          this.$emit('changeDay', e, value);
        },
        changeMonth: (e, value) => {
          this.$emit('changeMonth', e, value);
        },
        changeYear: (e, value) => {
          this.$emit('changeYear', e, value);
        },
        changeDate: (e, value) => {
          this.$emit('changeDate', e, value);
        },
        clearDate: (e, value) => {
          this.$emit('clearDate', e, value);
        },
        // outOfRange: (e, value) => {
        // 	this.$emit('outOfRange',e,value)
        // },
        // beforeChangeDate: (newDate, date) => {
        //     return true
        // },
        hide: (e, value) => {
          this.$emit('input', $(this.$refs.datetimePicker).datetimepicker('value'));
          this.$emit('hide', e, value);
        },
        show: (e, value) => {
          this.$emit('show', e, value);
        },
      };
    },
  },
  data() {
    return {
      rule: '',
    };
    // return {
    // 	dateValue:''
    // };
  },
  created() {},
  mounted() {
    if (this.dataRule) {
      this.rule = 'required';
    }
    window.datePicker = $(this.$refs.datetimePicker);
    $(this.$refs.datetimePicker).parent()[0].style.display = 'table';
    let options = Object.assign({}, this.option, this.options);
    $(this.$refs.datetimePicker).datetimepicker(options);
    $(this.$refs.datetimePicker).datetimepicker('value', this.value);
    if (this.disabled) {
      $(this.$refs.datetimePicker).datetimepicker('disable');
    } else {
      $(this.$refs.datetimePicker).datetimepicker('enable');
    }
  },
  methods: {
    datePicker(key, val) {
      $(this.$refs.datetimePicker).datetimepicker(key, val);
    },
  },
};
</script>
