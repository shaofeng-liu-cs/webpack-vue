<template>
  <div class="menu-right-container">
    <transition name="ts-menu-right-content">
      <div id="menu-right-content-v9" :class="`menu-right-content v9-transition ${soltName}`" v-show="menuContent">
        <h1>{{ menuContentTitle }}<span class="icon_osp icon_ospclose" @click="menuContentClose"></span></h1>
        <keep-alive :exclude="exclude">
          <component :is="soltName" :ref="soltName" v-on="$listeners" :returnValue="returnValue" @showContent="showContent"></component>
        </keep-alive>
      </div>
    </transition>
    <div class="menu-right-button">
      <div class="icon_osp icon_ospoutdent menu-right-btn" @click="clearCache"></div>
      <div class="menu-scrool v9-transition icon_osp icon_ospup rotate-one" v-if="menuScrool" @click="menuUpRun"></div>
      <div class="menu-div" ref="menuDiv" :style="{ marginBottom: margin }">
        <ul ref="menuUl" class="v9-transition" :style="{ height: menuUlHeight }">
          <li v-for="(item, index) in menuShowList" :key="'a' + index" class="map-icon" :class="[item.icon, soltName === item.code ? 'active' : '', item.code === 'StreetView' ? 'notClick' : '']" @click="menuTap(item)" :title="item.name" :style="{ order: item.seq }"></li>
          <!-- <li
                        class="map-icon icon_osp icon_ospxinjian"
                        @click="showUrlContent()"
                        style="order:100;"
                    ></li> -->
        </ul>
      </div>
      <div class="menu-scrool v9-transition icon_osp icon_ospup rotate-two" v-if="menuScrool" @click="menuDownRun"></div>
      <div class="line" v-if="menuScrool"></div>
      <div class="menu-right-bottom v9-transition icon_osp icon_ospdoubleright" :class="smallMap ? 'rotate-one active' : 'rotate-two'" @click="smallMapShow"></div>
    </div>
    <div v-for="(item, index) in themeList" :title="item.themeDesc" :key="index" class="heat-map-container v9-transition" :class="[smallMap ? '' : 'width-hide left-hide border-hide', hotMapShowName === item.themeName && smallMap ? 'hop-map-show' : '']" @click="hotMap(item)">
      <div>
        <img :src="item.themeIcon" alt="" />
        <div>{{ item.themeName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Toolbar',
  // props:{
  //     getProjectInfo:{
  //         type:Object,
  //         default:{},
  //     }
  // },
  inject: ['getProjectInfo', 'getMapBox', 'getMenuList', 'themeList'],
  props: {
    returnValue: {
      type: String,
      default: '',
    },
    resTypePrivList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      menuList: [], // 菜单列表
      soltName: '', // 动态组件
      exclude: [], // 不需要缓存的组件数组
      smallMap: false, // 是否展示小地图
      menuContent: false, // 是否展示右边菜单栏内容区域
      menuContentTitle: '', // 右边菜单栏内容标题
      menuScrool: false, // 菜单栏是否能滑动
      menuUlHeight: '', // 菜单高度
      margin: '0px',
      menuIndex: 1, // 当前页
      hotMapShow: false, // 热地图是否启用
      hotMapShowName: '',
      uprnHeatmapLayer: undefined,
      normalWfsMapService: undefined,
      menuShowList: [], // 展示的菜单列表
      menuListArr: [], // 菜单列表分组数组
      pageSum: '',
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
  },
  watch: {
    menuContent(newVal) {
      this.$emit('toolbarShowChange', newVal);
    },
    menuShowList: {
      deep: true,
      immediate: false,
      handler(val) {
        this.menuShowList = val;
      },
    },
  },
  mounted() {
    const projectInfo = this.getProjectInfo();
    this.menuList = this.getMenuList(
      projectInfo.flowState,
      projectInfo.markFlag,
      projectInfo.sourceFlag,
      projectInfo.constrRequired,
      projectInfo.viewType,
      projectInfo.networkLevel,
    );
    const menuDivHeight = parseInt(window.getComputedStyle(this.$refs.menuDiv).height, 10);
    const menuUlHeight = parseInt(window.getComputedStyle(this.$refs.menuUl).height, 10);
    const diffHeight = menuUlHeight - menuDivHeight;
    if (diffHeight > 2) {
      const margin = (menuDivHeight - 25) % 40;
      this.margin = `${margin}px`;
      this.menuScrool = true;
      this.menuUlHeight = `${menuDivHeight * 2 - 50 - margin * 2}px`;
    }

    if (this.resTypePrivList && this.resTypePrivList.length > 0) {
      const findRes = this.resTypePrivList.find(res => res.RES_TYPE === 'F_CABLE');
      if (findRes) {
        const privList = findRes.PRIV_LIST;
        const editPriv = privList.find(res => res === 'RES_EDT') || '';
        if (!editPriv) {
          this.menuList = this.menuList.filter(res => res.code !== 'CableLaying');
        }
      }
    }
    this.menuShowList = this.menuList;
    this.menuUlHeight = this.menuList.length * 40;
    this.exclude = this.menuList.filter(menu => menu.keepAlive && menu.keepAlive === 'N').map(menu => menu.code);
    this.menuResize();
    window.addEventListener('resize', this.menuResize, false);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.menuResize);
  },
  methods: {
    showUrlContent() {
      this.soltName = '';
      this.menuContentTitle = 'Url';
      this.menuContent = !this.menuContent;
      fish.require(['oss_public/opb/widget/area_search_pub/views/AreaSearchPub'], aDialog => {
        const options = {
          id: '1111',
        };
        // eslint-disable-next-line new-cap
        this.dialogView = new aDialog(options);
        document.getElementById('menu-right-content-v9').appendChild(this.dialogView.el);
      });
    },
    smallMapShow() {
      this.smallMap = !this.smallMap;
    },
    clearCache() {
      this.$emit('clearCache');
    },
    menuTap(item, show) {
      // this.activeName = item.code;
      // 判断是否进行了组件切换
      if (this.soltName !== item.code) {
        this.soltName = item.code; // 清除名字中的空格就是对应的组件名称
        this.menuContentTitle = item.name;
        this.menuContent = true;
        this.keepAlive = item.keepAlive || true; // 是否缓存
      } else if (show) {
        this.menuContent = true;
      } else {
        this.menuContent = !this.menuContent;
        this.soltName = this.menuContent ? this.soltName : '';
      }
    },
    showContent() {
      this.menuContent = true;
    },
    menuContentClose() {
      this.menuContent = false;
      // this.activeName = '';
      this.soltName = '';
      this.$emit('setSelect');
    },
    rightClose() {
      this.menuContent = false;
      // this.activeName = '';
      this.soltName = '';
    },
    menuUpRun() {
      if (this.menuIndex > 1) {
        // eslint-disable-next-line no-plusplus
        this.menuIndex--;
        this.menuShowList = this.menuListArr[this.menuIndex - 1];
      }
    },
    menuDownRun() {
      if (this.menuIndex < this.pageSum) {
        // eslint-disable-next-line no-plusplus
        this.menuIndex++;
        this.menuShowList = this.menuListArr[this.menuIndex - 1];
      }
    },
    hotMap(data) {
      // this.hotMapShow = !this.hotMapShow;
      if (data.themeName === this.hotMapShowName) {
        this.hotMapShowName = '';
      } else {
        this.hotMapShowName = data.themeName;
      }
      if (data.loadType === 'wfs_hot') {
        this.setHotMap(data, data.themeName === this.hotMapShowName);
      } else if (data.loadType === 'wfs_normal') {
        this.setWfsMap(data, data.themeName === this.hotMapShowName);
      } else if (data.loadType === 'wms_normal') {
        this.setWmsMap(data, data.themeName === this.hotMapShowName);
      }
    },
    setHotMap(theme, show) {
      const data = theme.definition;
      if (show) {
        if (this.uprnHeatmapLayer) {
          this.uprnHeatmapLayer.visible = false;
        }
        if (this.normalWfsMapService) {
          this.normalWfsMapService.layers[0].visible = false;
        }
        const url = data.serviceUrl;
        const typename = data.layers[0].layerDetailName;
        this.uprnHeatmapLayer = new this.$map.WfsHeatmapLayer({
          url,
          typenames: [typename],
          radius: data.radius,
          blur: data.blur,
          geokey: data.geoFieldName,
          weightkey: data.weightFieldName,
        });
        this.mapBox.addHeatMap(this.uprnHeatmapLayer);
      } else {
        this.uprnHeatmapLayer.visible = false;
      }
    },
    setWfsMap(theme, show) {
      if (this.uprnHeatmapLayer) {
        this.uprnHeatmapLayer.visible = false;
      }
      if (!this.normalWfsMapService) {
        this.mapBox.addCustomMapService(theme.service_no).then(mapService => {
          this.normalWfsMapService = mapService;
          const style = new this.$map.PictureMarkerSymbol(
            theme.styleConfig.iconUrl,
            theme.styleConfig.imgSize,
            theme.styleConfig.imgSize,
            0,
            theme.styleConfig.xOff,
            theme.styleConfig.yOff,
            false,
            null,
            24,
          );
          this.normalWfsMapService.layers[0].symbol = style;
          // this.normalWfsMapService.layers[0].visible = show;
          // eslint-disable-next-line no-unused-vars
          const a = 1;
        });
      } else {
        this.normalWfsMapService.layers[0].visible = show;
      }
    },
    setWmsMap(theme, show) {
      if (this.uprnHeatmapLayer) {
        this.uprnHeatmapLayer.visible = false;
      }
      const layers = this.mapBox.getLayers();
      const layer = layers.find(l => l.id === theme.layerNo);
      if (layer) {
        layer.visible = show;
        this.mapBox.refreshLayer(theme.layerNo);
      }
    },
    addOnlineMap(data) {
      this.$parent.addOnlineMap(data);
    },
    menuResize() {
      this.menuListArr = [];
      if (window.innerHeight - 90 >= this.menuUlHeight) {
        // 区域高度 >= 内容高度 正常显示
        this.menuScrool = false;
        this.menuShowList = this.menuList;
      } else {
        // 区域高度 < 内容高度 分页显示
        this.menuScrool = true;
        let pageNum = parseInt((window.innerHeight - 210) / 40, 10); // 一页展示个数
        pageNum = pageNum < 1 ? 1 : pageNum;
        const pageAll = this.menuUlHeight / 40; // 总个数
        this.pageSum = Math.ceil(pageAll / pageNum); // 总页数
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < this.pageSum; i++) {
          this.menuListArr.push(this.menuList.slice(0 + pageNum * i, pageNum + pageNum * i));
        }
        if (!this.menuListArr[this.menuIndex - 1]) {
          this.menuIndex = this.pageSum;
        }
        this.menuShowList = this.menuListArr[this.menuIndex - 1];
      }
    },
    newTask(graphic, overlay) {
      this.soltName = 'TaskList';
      const menuInfo = this.menuList.find(menu => menu.code === this.soltName);
      this.menuContentTitle = menuInfo.name;
      this.$nextTick(() => {
        this.$refs.TaskList.newTask(graphic, overlay);
      });
      // this.$refs.TaskList.newTask(graphic, overlay);
    },
  },
};
</script>

<style lang="scss" scoped>
@import './toolbar.scss';
</style>
