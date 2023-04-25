<template>
  <Popup :popupObj="popupBom" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <HLDBomContent ref="hldBomContent" @mountedInit="mountedInit"></HLDBomContent>
    </template>
  </Popup>
</template>

<script>
import HLDBomContent from './HLDBomContent.vue';

export default {
  name: 'HLDBom',
  props: {},
  components: {
    HLDBomContent,
  },
  data() {
    return {
      selecetResType: '',
      popupBom: {
        title: 'HLD BOM', // 弹框标题
        ok: this.$t('EXPORT'), // 确认按钮内容
        close: this.$t('CLOSE'), // 取消按钮内容
        modal: true, // 是否蒙层
        width: '75%', // 宽
        height: '500px', // 高
        show: false,
        drag: true,
        el: document.body,
        resize: 'both',
        zIndex: 3,
      },
    };
  },
  created() {},
  mounted() {},
  methods: {
    initData(projectInfo) {
      this.popupBom.show = true;
      this.schemaId = projectInfo.schemaId;
      this.projectInfo = projectInfo;
      this.mountedInit();
    },
    mountedInit() {
      this.$refs.hldBomContent && this.$refs.hldBomContent.initData(this.projectInfo);
    },
    popupOk() {
      const path = window.location.host.indexOf('localhost') > -1 ? '' : '/oss';

      const hurl = `${path}/edesign/bom/export/${this.schemaId}/v1?resTypes=${this.selecetResType}&time=${new Date().getTime()}`;
      const fileName = 'HLD_BOM.xls';
      const xhr = new XMLHttpRequest();
      xhr.open('get', hurl, true);
      $.blockUI({ message: 'loading' });
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (this.status === 200) {
          const res = this.response;
          const blob = new Blob([res], {
            type: 'application/vnd.ms-excel',
          });
          const a = document.createElement('a');
          a.download = fileName;
          a.href = URL.createObjectURL(blob);
          a.click();
          $(a).remove();
        } else {
          this.response.text().then(res => {
            const text = JSON.parse(res);
            fish.error(text.message);
          });
        }
        $.unblockUI();
      };
      xhr.send();
    },
    popupClose() {
      this.popupBom.show = false;
      this.$emit('popupClose');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './Bom.scss';
</style>
