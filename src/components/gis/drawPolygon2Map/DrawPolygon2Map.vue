<template>
    <div class="v9-draw-polygon">
        <el-radio-group v-model="btnActiveName" size="mini" @change="laberChange" :disabled="disabled" class="label-grow">
            <el-radio-button label="startDrawPolygon" :title="$t('COPY_GEO_DRAW_POLYGON')">
                <span class="icon_osp icon_ospPolygon btn_icon"></span>
            </el-radio-button>
            <el-radio-button label="startDrawCircle" :title="$t('COPY_GEO_DRAW_CIRCLE')">
                <span class="icon_osp icon_ospCircle btn_icon"></span>
            </el-radio-button>
            <el-radio-button label="startDrawRectangle" :title="$t('COPY_GEO_DRAE_RECTANGLE')">
                <span class="icon_osp icon_ospRectangle btn_icon"></span>
            </el-radio-button>
        </el-radio-group>
    </div>
</template>

<script>
export default {
  name: 'DrawPolygon2Map',
  componentName: 'DrawPolygon2Map',
  inject: ['getMapBox', 'getControlData'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    controlData() {
      return this.getControlData();
    },
  },
  props: {
    // 是否置灰
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  watch: {},
  data() {
    return {
      // 当前绘画模式的名称：startDrawPolygon，startDrawCircle，startDrawRectangle
      btnActiveName: '',
      controlObj: {
        startDrawPolygon: this.startDrawPolygon,
        startDrawCircle: this.startDrawCircle,
        startDrawRectangle: this.startDrawRectangle,
      },
      currGraId: '',
    };
  },
  created() {},
  mounted() {},
  methods: {
    // 提供给外部调用，重启绘画动作，
    restartDrawAction() {
      if (this.btnActiveName) {
        this.controlObj[this.btnActiveName]();
      }
    },
    laberChange(laberName) {
      this.controlData.btnActiveName = 'DrawPolygon2Map';
      switch (laberName) {
        case 'startDrawPolygon':
          this.startDrawPolygon();
          break;
        case 'startDrawCircle':
          this.startDrawCircle();
          break;
        case 'startDrawRectangle':
          this.startDrawRectangle();
          break;
        default:
          break;
      }
    },
    startDrawPolygon() {
      if (this.mapBox) {
        this.mapBox.clear(false);
        this.mapBox.drawPolygon(graphic => {
          this.currGraId = graphic.id;
          let geometry = graphic.geometry;
          if (!geometry.isRealPolygon()) {
            fish.toast('warn', this.$t('RESOURCE_DEL_DRAWING_POLYGON_NOT_POLYGON'));
            this.startDrawPolygon();
            return;
          }
          let newGeo = this.mapBox.createPolygonGeometry(geometry.getRings());
          this.$emit('afterDrawPolygon', newGeo);
          this.startDrawPolygon(true);
        });
      }
    },
    startDrawCircle() {
      if (this.mapBox) {
        this.mapBox.clear(false);
        this.mapBox.drawCircle(graphic => {
          this.currGraId = graphic.id;
          let geometry = graphic.geometry;
          let newGeo = this.mapBox.createPolygonGeometry([geometry.getRings()]);
          this.$emit('afterDrawPolygon', newGeo);
          this.startDrawCircle(true);
        });
      }
    },
    startDrawRectangle() {
      if (this.mapBox) {
        this.mapBox.clear(false);
        this.mapBox.drawRectangle(graphic => {
          this.currGraId = graphic.id;
          let geometry = graphic.geometry;
          let newGeo = this.mapBox.createPolygonGeometry(geometry.getRings());
          this.$emit('afterDrawPolygon', newGeo);
          this.startDrawRectangle(true);
        });
      }
    },
    cancelDrawAction() {
      this.btnActiveName = '';
      this.mapBox.clear(false);
      this.$emit('afterDrawPolygon', null);
    },
    clearCurrGraphic() {
      if (this.currGraId) {
        try {
          this.mapBox.deleteById(this.currGraId);
        } catch (e) {
          console.log('no id found');
        } finally {
          this.currGraId = '';
        }
      }
    },
  },
  deactivated() {
    this.btnActiveName = '';
  },
  activated() {
    this.restartDrawAction();
  },
  watch: {
    'controlData.btnActiveName'(val) {
      if (val !== 'DrawPolygon2Map') {
        this.btnActiveName = '';
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import './drawPolygon2Map.scss';
</style>