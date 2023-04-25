<!--
 * @Author: your name
 * @Date: 2020-07-22 16:30:05
 * @LastEditTime: 2022-10-18 14:46:20
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 地图切换组件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\onlineBaseMap\OnlineBaseMap.vue
--> 
<template>
  <div>
    <div class="design-export-title">{{$t('MAP_BASE_MAP')}}</div>
    <div class="menu-right-panel slickDiv-container">
      <div ref="slick" class="slickDiv notCommonDiv">
        <div v-for="(item, index) in baseMapServices" :key="index" class="singleSlickDiv" :class="{'slick-current': mapIndex===index}" @click="afterChange(index)">
          <div :title="item.serviceName || item.serviceNo" class="labelDiv">{{ item.serviceName || item.serviceNo }}</div>
          <img class="imgDiv" :src="`oss_core/edesign/assets/image/map-tool-bar/${item.serviceName || item.serviceNo}.png`" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapDefSetting } from '@/oss_core/edesign/api/query/schema.js';

export default {
  //import引入的组件
  name: 'OnlineBaseMap',
  inject: ['getMapBox', 'getProjectInfo', 'getBaseMapServices'],
  computed: {
    baseMapServices() {
      return this.getBaseMapServices();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  data() {
    return {
      mapIndex: 'none',
      activeServiceNo: '',
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.initScrollDiv();
  },
  //方法集合
  methods: {
    initScrollDiv() {
      this.baseMapServices.forEach((map, index) => {
        if (map.layer.visible) {
          this.mapIndex = index;
        }
      });
      // $(this.$refs.slick).slick({
      //   infinite: true,
      //   centerMode: false,
      //   slidesToShow: 2, //设置一屏展示的幻灯片数
      //   slidesToScroll: 1, //一屏滚动过的幻灯片数
      //   focusOnSelect: true,
      //   draggable: false,
      //   afterChange: this.afterChange,
      //   initialSlide, //设置初始化展示的幻灯片
      // });

      // if (initialSlide === 1 && this.baseMapServices.length === 2) {
      //   let slickContent = this.$refs.slick.querySelector('.slick-track');
      //   slickContent.style.left = '0px';
      // }
    },
    afterChange(currentIndex) {
      if (currentIndex === this.mapIndex) {
        this.mapIndex = 'none';
      } else {
        this.mapIndex = currentIndex;
      }
      let currentMap = 'none';
      this.baseMapServices.forEach((map, index) => {
        if (index === this.mapIndex) {
          map.layer.visible = true;
          currentMap = map.serviceNo;
        } else {
          map.layer.visible = false;
        }
      });
      mapDefSetting({
        sprintId: this.projectInfo.sprintId,
        paramVal: currentMap,
        paramNo: 'BASE_MAP',
      });
    },
  },
};
</script>
<style lang="scss"  scoped>
@import './onlineBaseMap';
</style>