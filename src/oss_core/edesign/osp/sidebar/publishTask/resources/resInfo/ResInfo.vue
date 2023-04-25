<template>
    <Popup :popupObj="popup" class="summary-content" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div class="js-popup" ref="js-popup"></div>
        </template>
    </Popup>
</template>

<script>
export default {
  name: 'ResInfo',
  data() {
    return {
      popup: {
        title: this.$t('RESOURCES_INFO'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CLOSE'), // 取消按钮
        width: '90%', // 宽
        height: '80%', // 高
        modal: true, //是否遮罩
        show: false, //是否展示
        el: '.map-example',
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
    };
  },
  created() {},
  mounted() {},
  methods: {
    initShow(resInfo) {
      this.popup.show = true;
      fish.require(['oss_core/im/rivt/device/views/DeviceMaint.js'], aDialog => {
        let obj = {
          RES_SPEC_ID: resInfo.resSpecId,
          RES_ID: resInfo.resId,
        };
        let view = new aDialog(obj);
        console.log(view.$el);
        view.render();
        this.$refs['js-popup'].append(view.el);
        view.resize();
      });
    },
    popupOk() {
      this.popup.show = false;
    },
  },
};
</script>

<style>
</style>