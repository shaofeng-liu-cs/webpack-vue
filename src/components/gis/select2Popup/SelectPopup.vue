<template>
  <div class="selectMain">
    <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
      <template v-slot:popupBody>
        <form class="form-group selectForm" ref="selectForm">
          <div>
            <div class="col-md-12 form-group">
              <div class="col-md-4 label-class">
                <label class="required-label">{{label}}:</label>
              </div>
              <div class="col-md-7">
                <Combobox class="form-control" v-model="comboboxValue" :setting="selectSetting" dataRule="required"></Combobox>
              </div>
            </div>
          </div>
        </form>
      </template>
    </Popup>
  </div>
</template>

<script>
export default {
  name: 'SelectPopup',

  componentName: 'SelectPopup',

  // inject:['getSelectValue'],

  computed: {
    // selectValue() {
    //     return this.getSelectValue();
    // }
  },

  props: {
    label: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
    },
    el: undefined,
  },
  data() {
    return {
      popupObj: {
        title: this.$t('SELECT'), // 弹框标题
        ok: this.$t('OK'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: false, // 是否蒙层
        width: '450px', // 宽
        height: '170px', // 高
        left: '35%',
        top: '35%',
        show: false,
        zIndex: 10,
        drag: true,
        el: this.el,
      },
      comboboxValue: '',
      selectSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'selectName',
        dataValueField: 'selectValue',
        dataSource: [],
        value: '',
      },

      labelValue: '',
    };
  },

  mounted() {},
  methods: {
    popupClose() {
      this.comboboxValue = '';
    },
    popupOk() {
      this.$initForm = $(this.$refs.selectForm).form();
      if (!this.$initForm.isValid()) {
        return;
      }
      this.$emit('returnSelectValue', this.comboboxValue);
      this.popupObj.show = false;
      this.comboboxValue = '';
    },
  },

  watch: {
    'popupObj.show': {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val) {
          this.selectSetting.dataSource = this.list;
          if (this.list && this.list.length > 0) {
            this.comboboxValue = this.list[0].selectValue;
            this.selectSetting.value = this.list[0].selectValue;
          }
          this.labelValue = this.label;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.required-label:before {
  content: '*';
  color: #fb6e52;
  vertical-align: middle;
  margin-right: 3px;
  line-height: 1;
}
.label-class {
  text-align: right;
  margin-top: 4px;
}

.selectMain /deep/ .modal-body {
  height: 100%;
  // padding-top:30px;
}

.selectMain /deep/ .btn-primary {
  width: 54px;
}

.selectForm {
  margin-top: 20px;
}
</style>
