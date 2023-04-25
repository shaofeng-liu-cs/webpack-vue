<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-12-26 14:22:46
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 右侧点击菜单栏组件
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\map-control\clickRight\clickRight.vue
-->
<template>
  <div class="clickRightOverlay" :style="`height:${menuList.length * 32}px`">
    <ul class="menu-right mainMenu">
      <popover v-for="item in menuList" :key="item.seq" trigger="hover" placement="left" popClass="opacityRight">
        <li class="menu-item" @click="menuClick(item)">
          <i :class="item.icon"></i>
        </li>
        <div slot="content">
          <div class="fastKey-col">
            <div class="">{{ item.name }}</div>
            <div class="fastKey-row" v-if="item.fastKey">
              <div class="fastKey-title">{{ $t('OSP_RIGHT_CLICK_SELECTION_SHORTCUT') }}</div>
              <div class="fastKey-label">{{ item.fastKey }}</div>
            </div>
          </div>
        </div>
      </popover>
    </ul>
  </div>
</template>

<script>
import { getBaseResAttr } from '@/oss_core/base/utils/ResourcesConfig.js';
import * as Color from '@/oss_core/edesign/osp/design/drawStyle.js'; // 画图样式
import { graphic } from 'echarts/lib/export';

export default {
  name: 'ClickRight',
  inject: ['getMapBox'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
  },
  data() {
    return {
      menuList: [], //右键菜单栏数组
      overlay: null, //右键菜单栏图层
      prevent: false, //右键菜单显示隐藏控制
      preventAll: false, // 屏蔽全部右键菜单
    };
  },
  mounted() {
    this.addControl();
  },
  methods: {
    addControl() {
      //加载控制器
      //创建菜单overlay
      this.overlay = new this.$map.Overlay({
        element: this.$el,
        positioning: 'center-left',
        offset: [15, 0],
      });
      this.mapBox.addOverLay(this.overlay);
      this.mapBox.addEventListener('clear', () => {
        this.overlay.hide();
      });
    },
    rightClick(event) {
      this.graphics = this.mapBox.getSelected();
      let haveSprint = false;
      this.graphics.forEach((item) => {
        if (item.attributes.sprintId && !haveSprint) {
          haveSprint = true;
        }
      });
      if (this.graphics.length > 0) {
        event.preventDefault();
        this.overlay.position = this.mapBox.getEventScreenPoint(event);
        this.setMenuList(haveSprint);
      }
    },
    setMenuList(haveSprint) {
      let finnalMenuList = [];
      if (haveSprint) {
        this.menuList = [
          {
            seq: 1,
            name: this.$t('OSP_DOMAIN_PROPERTY'),
            code: 'property',
            functionType: 'RES_QRY',
            icon: 'icon_osp icon_ospshuxing',
            // event: showProperty,
          },
        ];
      } else {
        this.menuList = [
          {
            seq: 1,
            name: this.$t('OSP_DOMAIN_PROPERTY'),
            code: 'property',
            functionType: 'RES_QRY',
            icon: 'icon_osp icon_ospshuxing',
            // event: showProperty,
          },
          {
            seq: 100,
            name: this.$t('OSP_DOMAIN_DELETE'),
            code: 'delete',
            fastKey: 'Delete',
            functionType: 'RES_EDIT',
            icon: 'icon_osp icon_ospshanchu1',
            // event: deleteGraphic,
          },
        ];
        if (this.graphics.length === 1) {
          finnalMenuList = [
            {
              seq: 4,
              name: this.$t('OSP_DOMAIN_EDIT_POINT'),
              code: 'editPoint',
              functionType: 'RES_EDIT',
              icon: 'icon_osp icon_ospbianjijiedian',
              // event: EditNode,
            },
            {
              seq: 9,
              name: this.$t('OSP_DOMAIN_SPLIT_GRID'),
              code: 'splitGird',
              functionType: 'RES_EDIT',
              icon: 'icon_osp icon_ospchaifenbenjiyemian',
              // event: splitPolygon,
            },
          ];
        } else if (this.graphics.length > 1) {
          finnalMenuList = [
            {
              seq: 35,
              name: this.$t('OSP_DOMAIN_MERGE_TO_SIBLING_GRID'),
              code: 'mergeSiblingGrid',
              functionType: 'RES_EDIT',
              icon: 'icon_osp icon_ospRectangle',
              // event: combineArea,
            },
          ];
        }
        this.menuList = finnalMenuList.concat(this.menuList).sort((a, b) => {
          return a.seq - b.seq;
        });
      }
    },
    menuClick(item) {
      this.overlay.hide();
      switch (item.code) {
        case 'property':
          this.$root.$emit('setResult', this.graphics);
          break;
        case 'editPoint':
          this.editNodeFunction(this.graphics[0]);
          break;
        case 'splitGird':
          this.splitPolygon();
          break;
        case 'mergeSiblingGrid':
          this.combineArea();
          break;
        case 'delete':
          this.$map.batchDeleteGeometry(this.graphics).then(() => {
            fish.toast('success', this.$t('DELETE_SUCCESS'));
            this.mapBox.refresh();
            this.$emit('delete');
          });
          break;

        default:
          break;
      }
    },
    editNodeFunction(oldGra) {
      this.mapBox.editGraphicVertices(oldGra, (event) => {
        let newGra = event[0];
        this.$map.updateGeometryById(newGra.layerNo, newGra.toJSON()).then((res) => {
          this.editNodeFunction(newGra);
        });
      });
    },
    splitPolygon() {
      let graph = this.graphics[0];
      this.mapBox.deactiveSelect();
      this.mapBox.getDrawTool().lineSymbol = new this.$map.CompositeSymbol(
        [
          {
            style: Color.mouseStyle,
            geometry: (geo) => {
              if (geo.geometry.geometryType === this.$map.GeometryType.POINT) {
                return geo.geometry;
              }
              return null;
            },
          },
          {
            style: Color.defalutLine,
          },
        ],
        3857,
      );
      this.mapBox.drawLine((evt) => {
        this.$map.areaSplit(graph.geometry, evt.geometry).then((data) => {
          let promisesList = [];
          let splitArea = data;
          console.log(splitArea);
          if (splitArea.length === 1) {
            fish.toast('info', this.$t('RIGHT_MENU_SPLIT_AREA_NOT_INTERSECT'));
            return;
          }
          let geos = splitArea.map((item) => {
            return {
              geometry: item,
              attributes: {
                gisArea: this.mapBox.calculateArea(item.rings[0]),
                resStatus: 'C',
              },
              layerNo: graph.layerNo,
            };
          });
          promisesList.push(this.$map.batchAddGeometry(geos));
          promisesList.push(this.$map.deleteGeometry(graph.layerNo, graph.attributes.gisKey));
          Promise.all(promisesList).then((results) => {
            this.setAttr(results[0]);
            this.$emit('delete');
            console.log(results);
          });
        });
      });
    },

    combineArea() {
      let newArea;
      let promiseList = [];
      this.graphics.some((graphic, index) => {
        if (index === 0) {
          newArea = graphic.geometry;
        } else {
          newArea = this.$map.GeometryUtils.combineArea(newArea, graphic.geometry);
        }
        return !newArea;
      });
      if (!newArea) {
        fish.toast('info', this.$t('RIGHT_MENU_COMBINE_AREA_NONE_INTERSECT'));
        return;
      }
      let geo = {
        geometry: newArea,
        attributes: {
          gisArea: this.mapBox.calculateArea(newArea.getRings()[0]),
          resStatus: 'C',
        },
        layerNo: this.graphics[0].layerNo,
        resTypeName: this.graphics[0].resTypeName,
      };
      promiseList.push(this.$map.addGeometry(geo.layerNo, geo));
      promiseList.push(this.$map.batchDeleteGeometry(this.graphics));
      Promise.all(promiseList).then((results) => {
        this.setAttr([results[0]]);
        this.$emit('delete');
        console.log(results);
      });
    },
    setAttr(graphics) {
      let promiseList = [];
      graphics.forEach((res) => {
        let graphic = res.toJSON();
        graphic.attributes.resName = 'Plan Grid' + '-' + graphic.attributes.objectid;
        graphic.attributes.resNo = '';
        promiseList.push(this.$map.editAttributeById(res.layerNo, graphic));
        this.$emit('showTips', graphic);
      });
      Promise.all(promiseList).then((results) => {
        console.log(results);
        fish.toast('info', this.$t('SAVE_SUCCESS'));
        this.mapBox.refresh();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './clickRight.scss';
</style>

<style lang="scss">
.popover.opacityRight {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
