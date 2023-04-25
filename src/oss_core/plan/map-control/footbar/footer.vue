<template>
    <div class="footer">
        <div class="footer-left">
            <div class="map-icon-content">
                <div class="map-icon width" :title="select">
                    <div>{{$t('OSP_MAP_FOOTER_SELECT')}}: {{select}}</div>
                </div>
                <!-- <div class="footer-jwd" ref="lat"></div> -->
                <Popover placement="top-left" ref="popoverCoor">
                    <div class="footer-jwd" ref="lat" @click="getcond"></div>
                    <div slot="content" @keyup.enter="sendCord">
                        <input type="text" v-model="lngLat" ref='lngLat'>
                    </div>
                </Popover>
                <!-- <div class="footer-scale" ref="scale"></div> -->
                <Popover placement="top-left" ref="popoverScale">
                    <div class="footer-scale" ref="scale" @click="getScale">{{scaleValue}}</div>
                    <div slot="content" @keyup.enter="sendScale">
                        <input type="text" v-model="scaleValue" ref='scaleXY'>
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
  inject: ['getMapBox'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
  },
  props: {
    select: {
      type: String,
    },
  },
  data() {
    return {
      lngLat: '',
      sitting: {
        x: 1,
        y: 2,
      },
      scaleValue: '',
      // activeFlag: true,
      accuracy: 6,
      currentLength: '', // 新建资源时传的长度或面积
      totalLength: '',
      totalArea: '',
    };
  },
  created() {},
  mounted() {
    this.$root.$on('lengthAndArea', this.lengthAndArea);
    this.initControl();
  },
  methods: {
    initControl() {
      let mousePositionControl = new MousePositionControl({
        className: 'map-position',
        projection: SupportSpatialReferences.WGS84.getProjectionString(),
        target: this.$refs.lat,
        undefinedHTML: false,
        // coordinateFormat: '<input readonly value="{x}"/>,<input readonly value="{y}"/>',
      });
      this.mapBox.map.addControl(mousePositionControl);
      let scaleLine = new ScaleLineControl({
        units: 'metric',
        target: this.$refs.scaleHide,
        minWidth: 120,
        bar: true,
        text: true,
        steps: 2,
      });
      this.mapBox.map.addControl(scaleLine);
      console.log(scaleLine);

      this.mapBox.map.addEventListener('moveend', () => {
        let scaleDiv = document.getElementsByClassName('ol-scale-text');
        if (scaleDiv && scaleDiv.length > 0) {
          this.scaleValue = scaleDiv[0].innerHTML.replace(/\,/g, '');
          this.$refs.scale.innerHTML = this.scaleValue;
        }
      });
    },
    getcond() {
      const cordinate = this.$refs.lat.children[0].innerText;
      this.lngLat = cordinate.replace(' ', ',');
      this.$refs.lngLat.value = this.lngLat;
    },

    sendCord() {
      if (this.lngLat) {
        let [lng, lat] = this.lngLat.split(',');
        const coords = this.mapBox.map.toProjection(lng, lat);
        let center = {
          x: coords[0],
          y: coords[1],
        };
        this.mapBox.map.centerAt(center);
      }
      this.$refs.popoverCoor.close();
    },

    getScale() {
      this.$refs.scaleXY.value = this.scaleValue;
    },

    sendScale() {
      let newValue = this.scaleValue.toString().replace(/\s*/g, '');
      let [scaleX, scaleY] = newValue.split(':');
      if (scaleX && scaleY) {
        let yValue = (Number(scaleY) / Number(scaleX)).toFixed(0);
        this.$refs.scale.innerHTML = this.scaleValue;
        let newExtent = this.mapBox.map.getExtentForScale(yValue);
        this.mapBox.map.setExtent(newExtent);
      }
      this.$refs.popoverScale.close();
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
