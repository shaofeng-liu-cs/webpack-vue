<template>
  <Popup :popupObj="popupInfo" @popupClose="popClose">
    <template v-slot:popupBody>
      <div class="img-show-list-modal" v-if="catList.length">
        <div class="img-cate-list" v-for="(item, index) in catList" :key="index">
          <span class="cate-icon">
            <i class="icon_ospa-WorkItem icon_osp"></i>
            <span class="icon-tit">{{ item.resName }}</span>
          </span>
          <div class="cate-img-list">
            <span class="img-content-item" v-for="(img, i) in item.imageList" :key="i">
              <el-tooltip effect="light" :content="img.imgCatName" placement="bottom-start">
                <el-image :src="img.docPath" :preview-src-list="item.showImgList"> </el-image>
              </el-tooltip>
              <div class="img-name">{{ img.imgCatName }}</div>
            </span>
          </div>
        </div>
      </div>
      <el-empty v-else :description="$t('NO_DATA')"></el-empty>
    </template>
  </Popup>
</template>

<script>
import { queryPhotoList } from '@/oss_core/edesign/api/query/schema.js';

export default {
  name: 'ShowImgModal',
  props: {},
  data() {
    return {
      imgData: {},
      catList: [],
      selectCode: '',
      taskId: '',
      popupInfo: {
        title: this.$t('CONSTR_MANAGE_IMAGE'), // 弹框标题
        close: this.$t('CLOSE'),
        width: '80%', // 宽
        height: '80%', // 高
        show: false,
        modal: true, // 是否蒙层
        drag: true,
        body: true,
        zIndex: 10,
      },
    };
  },
  created() {
    this.popupInfo.el = document.body;
  },
  mounted() {
    // this.handleShow('230323101413608235');
  },
  methods: {
    handleShow(taskId) {
      if (this.popupInfo.show) {
        this.popupInfo.show = false;
      } else {
        if (taskId !== this.taskId) {
          this.taskId = taskId;
          this.loadImg();
        }
        this.popupInfo.show = true;
      }
    },
    loadImg() {
      this.catList = [];
      this.selectCode = '';
      if (this.taskId) {
        queryPhotoList(this.taskId).then(res => {
          let list = res.data || [];

          list = list.map(it => {
            const showImgList = [];
            it.imageList = it.imageList.map(img => {
              img.docPath = `${portal.appGlobal.get('webroot')}/opb/file/download?fileName=${img.docPath}`;
              showImgList.push(img.docPath);
              return img;
            });
            it.showImgList = showImgList;
            return it;
          });
          this.catList = list;
        });
      }
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
@import './showImgModal.scss';
</style>
