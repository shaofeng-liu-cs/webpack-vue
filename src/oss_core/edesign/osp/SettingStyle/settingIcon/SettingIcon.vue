<template>
  <div class="setting-icon-box">
    <span class="left-icons-box">
      <div class="box-head-title">
        <span class="left-title">{{ $t('HLD_SETTING_STYLE_AVAILABLE_SYMBOLS') }}</span>
        <el-upload class="upload-box" action="opb/file/upload?moduleName=edn/markicon" :on-success="uploadSucc" :show-file-list="false">
          <span class="upload-icon cursor-hover">{{ $t('HLD_SETTING_STYLE_UPLOAD_ICON') }}</span>
        </el-upload>
      </div>
      <div class="icon-list-box">
        <el-scrollbar>
          <span class="icon-item-box" v-for="(item, i) in imglist" :key="i" @click="selectImg(item)" :class="{ active: selectedImg === item }">
            <img :src="item" />
          </span>
        </el-scrollbar>
      </div>
    </span>
    <span class="img-preview-box">
      <div class="box-head-title">
        <span class="left-title">{{ $t('HLD_SETTING_STYLE_PREVIEW') }}</span>
      </div>
      <div class="preview-contnet">
        <img :src="selectedImg" />
      </div>
      <div v-if="settingData.geometryType === 'geometryPoint'" class="set-img-size-box">
        <div class="img-size-label">{{ $t('HLD_SETTING_STYLE_OPTIONS') }}</div>
        <div class="img-size-item-box">
          <span class="input-label-box">{{ $t('HLD_SETTING_STYLE_SYMBOL_SIZE') }}</span>
          <el-input class="item-input" type="number" @change="changeSize" v-model="size"></el-input>
        </div>
      </div>
    </span>
  </div>
</template>
<script>
import { queryMarkstyleIcons } from '@/oss_core/edesign/api/query/mark.js';
export default {
  name: 'SettingIcon',
  props: {},
  inject: ['getSettingData', 'changeSettingData'],
  computed: {
    settingData() {
      return this.getSettingData();
    },
  },
  components: {},

  data() {
    return {
      imglist: [],
      size: 22,
      selectedImg: '',
    };
  },

  create() {},

  mounted() {
    queryMarkstyleIcons().then(res => {
      const imgs = (res.data || []).map(it => `opb/file/download?fileName=${it}`);
      let imgUrl = `oss_core/edesign/assets/image/mark/`; //http://10.45.51.61/oss/
      let imglist = [];
      for (let i = 0; i < 5; i++) {
        imglist.push(`${imgUrl}mark_icon_${i}.png`);
      }
      this.imglist = [...imglist, ...imgs];
      this.selectImg(this.settingData.iconUrl || imglist[0]);
    });
    this.size = this.settingData.size || 22;
  },

  methods: {
    changeSize() {
      this.changeSettingData({
        size: this.size,
      });
    },
    selectImg(val) {
      if (val) {
        this.selectedImg = val;
        this.changeSettingData({
          iconUrl: val,
        });
        const image = new Image();
        image.src = val;
        image.onload = () => {
          this.changeSettingData({
            imgSize: image.width,
          });
        };
      }
    },
    uploadSucc(response) {
      this.imglist.push(`opb/file/download?fileName=${response.moduleName}/${response.fileName}`);
      this.selectImg(this.imglist[this.imglist.length - 1]);
    },
  },
  watch: {
    settingData() {
      console.log('收到：', this.settingData);
      this.selectedImg = this.settingData.iconUrl;
      this.size = this.settingData.size || 22;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './settingIcon.scss';
</style>
