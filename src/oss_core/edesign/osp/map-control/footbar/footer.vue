<template>
  <div class="footer">
    <div class="footer-left">
      <div class="map-icon-content">
        <div class="map-icon" v-if="projectInfo.markFlag !== 'sprint'">{{$t('OSP_MAP_FOOTER_NAME')}}: {{projectInfo.projectName}}</div>
        <div class="map-icon" v-if="projectInfo.markFlag !== 'sprint'">{{$t('OSP_MAP_FOOTER_TASK')}}: {{projectInfo.taskName}}</div>
        <div class="map-icon width" :title="select" v-if="projectInfo.markFlag !== 'sprint'">
          <div>{{$t('OSP_MAP_FOOTER_SELECT')}}: {{select}}</div>
        </div>
        <Popover placement="top" ref="popoverCoor">
          <div class="footer-jwd" ref="lat" @click="getcond"></div>
          <div slot="content" @keyup.enter="sendCord">
            <input type="text" v-model="lng" ref='x'>
            <input type="text" v-model="lat" ref='y'>
          </div>
        </Popover>
        <Popover placement="top" ref="popoverScale">
          <div class="footer-scale" ref="scale" @click="getScale"></div>
          <div slot="content" @keyup.enter="sendScale">
            <input type="text" v-model="scaleX" ref='scaleX'>
            <input type="text" v-model="scaleY" ref='scaleY'>
          </div>
        </Popover>
        <div class="map-icon width" ref="newPolyline" v-if="currentLength && totalLength">
          <div>{{currentLength}}</div>
          <div>{{totalLength}}</div>
        </div>
        <div class="map-icon width" ref="newPolygon" v-if="totalArea">
          <div>{{totalArea}}</div>
        </div>
      </div>
    </div>
    <div ref="scaleHide" class="scaleHide"></div>
  </div>
</template>

<script>
import { ScaleLineControl, MousePositionControl, SupportSpatialReferences } from 'map';
export default {
  name: 'Footer',
  props: {
    // getProjectInfo: {
    // 	type: Object
    // },
    select: {
      type: String,
    },
  },
  inject: ['getMapBox', 'getProjectInfo', 'getAppConfig'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    appConfig() {
      return this.getAppConfig() || {};
    },
    projectInfo() {
      return this.getProjectInfo() || {};
    },
  },
  data() {
    return {
      lng: 1,
      lat: 2,
      sitting: {
        x: 1,
        y: 2,
      },
      scaleX: 1,
      scaleY: 1,
      scaleValue: '',
      // activeFlag: true,
      accuracy: 6,
      currentLength: '', // 新建资源时传的长度或面积
      totalLength: '',
      totalArea: '',
    };
  },
  created() {
    if (this.appConfig.ACCURACY_OF_LONGITUDE_AND_LATITUDE) {
      this.accuracy = Number(this.appConfig.ACCURACY_OF_LONGITUDE_AND_LATITUDE);
    }
  },
  mounted() {
    this.$root.$on('lengthAndArea', this.lengthAndArea);
    this.initControl();
  },
  methods: {
    initControl() {
      this.mousePositionControl = new MousePositionControl({
        className: 'map-position',
        projection: SupportSpatialReferences.WGS84.getProjectionString(),
        target: this.$refs.lat,
        undefinedHTML: false,
        // coordinateFormat: '<input readonly value="{x}"/>,<input readonly value="{y}"/>',
      });
      this.mapBox.map.addControl(this.mousePositionControl);
      let scaleLine = new ScaleLineControl({
        units: 'metric',
        target: this.$refs.scaleHide,
        minWidth: 120,
        bar: true,
        text: true,
        steps: 2,
      });
      this.mapBox.map.addControl(scaleLine);
      this.mapBox.map.addEventListener('moveend', () => {
        // setTimeout(() => {
        // let scaleDiv = document.getElementsByClassName('ol-scale-text');
        // if (scaleDiv && scaleDiv.length > 0) {
        //   this.scaleValue = scaleDiv[0].innerHTML.replace(/\,/g, '');
        //   this.$refs.scale.innerHTML = this.scaleValue.replace(/\,/g, '');
        //   let a = this.mapBox.map.getScale();
        //   console.log(a);
        // }
        let scale = this.mapBox.map.getScale();
        this.scaleValue = '1 ' + ':' + ' ' + Math.round(scale);
        this.$refs.scale.innerHTML = this.scaleValue;
        // }, 0);
      });
    },

    getScale() {
      if (this.scaleValue) {
        // 1 : 74542,662
        let newValue = this.scaleValue.toString().replace(/\s*/g, '');
        let list = newValue.split(':');
        if (list && list.length > 1) {
          this.scaleX = list[0];
          this.scaleY = list[1];
          this.$refs.scaleX.value = this.scaleX;
          this.$refs.scaleY.value = this.scaleY;
        }
      }
    },
    sendScale() {
      if (this.scaleX && this.scaleY) {
        let yValue = (Number(this.scaleY) / Number(this.scaleX)).toFixed(0);
        this.scaleValue = '1 ' + ':' + ' ' + yValue;
        this.$refs.scale.innerHTML = this.scaleValue;
        let a = this.mapBox.map.getExtent();
        let newExtent = this.mapBox.map.getExtentForScale(Number(yValue));
        this.mapBox.map.setExtent(newExtent);
        // this.activeFlag = false;
      }
      this.$refs.popoverScale.close();
    },
    sendCord() {
      if (this.lng && this.lat) {
        const coords = this.mapBox.map.toProjection(this.lng, this.lat);
        let center = {
          x: coords[0],
          y: coords[1],
        };
        this.mapBox.map.centerAt(center);
        this.$refs.lat.children[0].innerHTML = Number(this.lng).toFixed(this.accuracy) + ' ' + Number(this.lat).toFixed(this.accuracy);
      }
      this.$refs.popoverCoor.close();
    },
    getcond() {
      const cordinate = this.$refs.lat.children[0].innerText;
      let [x, y] = cordinate.split(' ');
      this.lng = Number(x).toFixed(this.accuracy);
      this.lat = Number(y).toFixed(this.accuracy);
      this.$refs.x.value = this.lng;
      this.$refs.y.value = this.lat;
      return [Number(x), Number(y), Number(this.lng), Number(this.lat)];
    },
    lengthAndArea(lengthAndArea) {
      this.currentLength = lengthAndArea.currentLength;
      this.totalLength = lengthAndArea.totalLength;
      this.totalArea = lengthAndArea.totalArea;
    },
  },
  destroyed() {
    this.$root.$off('lengthAndArea', this.lengthAndArea);
  },
};
</script>
<style lang="scss" scoped="scoped">
@import './footer.scss';
</style>
