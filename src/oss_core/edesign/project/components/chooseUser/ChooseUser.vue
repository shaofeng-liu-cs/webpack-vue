<template>
  <Popup :popupObj="popup" @popupOk="popupOk" class="selection-content">
    <template v-slot:popupBody>
      <div class="grid-container">
        <Grid :data="userList">
          <grid-column label="userName" prop="userName"></grid-column>
          <grid-column label="userCode" prop="userCode"></grid-column>
          <grid-column label="phone" prop="phone"></grid-column>
        </Grid>
      </div>
    </template>
  </Popup>
</template>
<script>
import { queryUsers } from '@/oss_core/edesign/api/query/project.js';

export default {
  computed: {},
  data() {
    return {
      popup: {
        title: this.$t('OSP_RIGHT_CLICK_SELECTION_TITLE'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CANCEL'), // 取消按钮
        width: '850', // 宽
        height: '440', // 高
        maxHeight: '80%', //
        maxWidth: '80%', //
        modal: true, //是否遮罩
        el: 'body', // 插入节点
        show: false, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
      userList: [], //用户数组
    };
  },
  created() {},
  mounted() {},
  //方法集合
  methods: {
    init() {
      this.popup.show = true;
      let param = {
        pageIndex: 1,
        pageLen: 20,
      };
      if (this.serchUserName) {
        param.userName = this.serchUserName;
      }
      queryUsers(param).then(data => {
        this.userList = data.list;
        console.log(data);
      });
    },
    popupOk() {},
  },
};
</script>
<style lang="scss" scoped>
@import './chooseUser.scss';
</style>
