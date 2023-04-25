<template>
  <div class="setting-css-box">
    <span class="setting-css-form">
      <el-scrollbar>
        <el-form label-width="auto" label-position="top" :model="settingData">
          <div v-if="settingData.geometryType === 'geometryMultipolygon'" class="m-b-lg">
            <div class="child-head-title">
              <span class="head-title">{{ $t('HLD_SETTING_STYLE_MIAN_FILL_STYLE') }}</span>
            </div>
            <div class="form-item-div">
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_MIAN_FILL_COLOR')">
                  <el-color-picker show-alpha v-model="settingData.fillColor" @change="changeDomCss"></el-color-picker>
                </el-form-item>
              </span>
              <span class="form-span-item"> </span>
            </div>
          </div>
          <div v-if="settingData.geometryType !== 'geometryPoint'" class="m-b-lg">
            <div class="child-head-title ">
              <span class="head-title">{{ $t('HLD_SETTING_STYLE_LINE_STYLE') }}</span>
            </div>
            <div class="form-item-div">
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_LINE_STYLE_COLOR')">
                  <el-color-picker v-model="settingData.lineColor" @change="changeDomCss"></el-color-picker>
                </el-form-item>
              </span>
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_LINE_STYLE_WIDTH')">
                  <el-input v-model="settingData.lineWidth" type="number" @change="changeDomCss"></el-input>
                </el-form-item>
              </span>
            </div>
            <div class="form-item-div">
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_LINE_STYLE_TYPE')">
                  <el-select v-model="settingData.lineStyle" @change="changeDomCss">
                    <el-option v-for="item in lineTypeList" :key="item" :label="item" :value="item"> </el-option>
                  </el-select>
                </el-form-item>
              </span>
              <span class="form-span-item"> </span>
            </div>
          </div>
          <div class="m-b-lg">
            <div class="child-head-title">
              <span class="head-title">{{ $t('HLD_SETTING_STYLE_TEXT_OFFSET') }}</span>
            </div>

            <div class="form-item-div">
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_OFFSET_X')">
                  <el-input v-model="settingData.fontXOff" type="number" @change="changeDomCss"></el-input>
                </el-form-item>
              </span>
              <span class="form-span-item">
                <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_OFFSET_Y')">
                  <el-input v-model="settingData.fontYOff" type="number" @change="changeDomCss"></el-input>
                </el-form-item>
              </span>
            </div>
          </div>
          <div class="child-head-title">
            <span class="head-title">{{ $t('HLD_SETTING_STYLE_TEXT_STYLE') }}</span>
          </div>

          <div class="form-item-div">
            <span class="form-span-item">
              <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_FONT_FAMILY')">
                <el-select v-model="settingData.fontFamily" @change="changeDomCss">
                  <el-option v-for="item in familiyList" :key="item" :label="item" :value="item"> </el-option>
                </el-select>
              </el-form-item>
            </span>
            <span class="form-span-item">
              <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_FONT_Size')">
                <el-input v-model="settingData.fontSize" type="number" @change="changeDomCss"></el-input>
              </el-form-item>
            </span>
          </div>
          <div class="form-item-div">
            <span class="form-span-item">
              <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_FONT_COLOR')">
                <el-color-picker v-model="settingData.fontColor" @change="changeDomCss"></el-color-picker>
              </el-form-item>
            </span>
            <span class="form-span-item">
              <el-form-item :label="$t('HLD_SETTING_STYLE_TEXT_FONT_STYLE')">
                <el-checkbox-group v-model="textStyle" @change="textStyleChange">
                  <el-checkbox label="bold">{{ $t('HLD_SETTING_STYLE_BOLD') }}</el-checkbox>
                  <el-checkbox label="italic">{{ $t('HLD_SETTING_STYLE_ITALIC') }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </span>
          </div>
        </el-form>
      </el-scrollbar>
    </span>

    <span class="right-view-map-box" style="background-image: url('oss_core/edesign/assets/image/setStyleShowBoxBack.png')">
      <div class="show-box-title">{{ $t('HLD_SETTING_STYLE_PREVIEW') }}</div>
      <span class="show-box-border" :style="showDomGridCss">
        <img v-if="settingData.geometryType === 'geometryPoint'" class="show-box-img-content" :src="settingData.iconUrl" :style="showImgCss" />
        <span class="show-box-line" :style="showDomLineCss"></span>
        <span class="show-box-text" :style="showDomCss">{{ settingData.labelField || 'Default Text' }}</span>
      </span>
    </span>
  </div>
</template>
<script>
export default {
  name: 'SettingCss',
  props: {},
  inject: ['getSettingData'],
  computed: {
    settingData() {
      return this.getSettingData();
    },
  },
  components: {},
  data() {
    return {
      lineTypeList: ['solid', 'dash', 'dot'],
      familiyList: ['Microsoft Yahei', 'Helvetica Neue', 'Helvetica', 'Arial', 'Hiragino Sans GB', 'Heiti SC', 'WenQuanYi Micro Hei'],
      showDomCss: {},
      showDomLineCss: {},
      showDomGridCss: {},
      showImgCss: {},
      textStyle: [],
    };
  },

  create() {},

  mounted() {
    this.changeDomCss();
  },

  methods: {
    initTextStyle() {
      let textStyle = [];
      if (this.settingData.fontWeight === 'bold') {
        textStyle.push('bold');
      }
      if (this.settingData.fontStyle === 'italic') {
        textStyle.push('italic');
      }
      this.textStyle = textStyle;
    },
    textStyleChange() {
      this.settingData.fontWeight = this.textStyle.includes('bold') ? 'bold' : 'normal';
      this.settingData.fontStyle = this.textStyle.includes('italic') ? 'italic' : 'normal';
      this.changeDomCss();
    },
    changeDomCss() {
      if (this.settingData) {
        this.showDomCss = {
          fontFamily: this.settingData.fontFamily,
          fontSize: this.settingData.fontSize ? `${this.settingData.fontSize}px` : '',
          color: this.settingData.fontColor,
          fontWeight: this.textStyle && this.textStyle.includes('bold') ? 'bold' : 'normal',
          fontStyle: this.textStyle && this.textStyle.includes('italic') ? 'italic' : 'normal',
          top: `${parseFloat(this.settingData.fontYOff || 0) / 6}px`,
          left: `${parseFloat(this.settingData.fontXOff || 0) / 6}px`,
        };
        const lineStyleMap = {
          solid: 'solid',
          dash: 'dashed',
          dot: 'dotted',
        };
        if (this.settingData.geometryType !== 'geometryPoint') {
          this.showDomLineCss = {
            borderTopStyle: lineStyleMap[this.settingData.lineStyle] || 'solid',
            borderTopWidth: `${this.settingData.lineWidth || 1}px`,
            borderTopColor: this.settingData.lineColor,
          };
        }
        if (this.settingData.geometryType === 'geometryMultipolygon') {
          this.showDomGridCss = {
            borderStyle: lineStyleMap[this.settingData.lineStyle] || 'solid',
            borderWidth: `${this.settingData.lineWidth || 1}px`,
            borderColor: this.settingData.lineColor,
            backgroundColor: this.settingData.fillColor,
          };
        }
        if (this.settingData.size) {
          this.showImgCss = {
            width: `${this.settingData.size || 22}px`,
          };
        }
      }
    },
  },
  watch: {
    settingData() {
      this.initTextStyle();
      this.changeDomCss();
    },
  },
};
</script>
<style lang="scss" scoped>
@import './settingCss.scss';
</style>
