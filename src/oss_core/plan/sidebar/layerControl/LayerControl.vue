<template>
  <div class="layer-control-container">
    <div class="layer-grid-search">
      <Search v-model="searchValue"></Search>
    </div>
    <div class="layer-control-restap">
      <div class="btn right-radius" :class="resTap !== 'surface' ? 'btn-primary' : 'btn-default'" @click="checkTap(filterCode)">{{ filterName }} </div>
      <Popover placement="bottom" trigger="click" ref="popoverF" popClass="layer-control-popover">
        <button type="button" class="btn dropdown-btn" :class="resTap !== 'surface' ? 'btn-primary blue-border' : 'btn-default gray-border'">
          <span class="caret"></span>
        </button>
        <ul slot="content" class="v9-popover-ul">
          <li @click="checkTap('resource', $t('LAYER_CONTROL_RESOURCE'))" class="btn btn-default filter-li">{{$t('LAYER_CONTROL_RESOURCE')}}</li>
          <li @click="checkTap('inService', $t('LAYER_CONTROL_RESOURCE_SERVICE'))" class="btn btn-default filter-li"> {{$t('LAYER_CONTROL_RESOURCE_SERVICE')}} </li>
        </ul>
      </Popover>
      <div class="btn left-radius" :class="resTap === 'surface' ? 'btn-primary' : 'btn-default'" @click="checkTap('surface')">{{$t('LAYER_CONTROL_SURFACE')}} </div>
    </div>
    <div class="layer-grid-container">
      <div class="layer-grid-header">
        <div>{{$t('LAYER_CONTROL_LAYER_NAME')}}</div>
        <div></div>
        <div></div>
        <div :title="$t('LAYER_CONTROL_IS_VISIBLE')" class="icon_osp icon_ospkejian control-all" @click="layerControlAll('isVisible')"></div>
        <div :title="$t('LAYER_CONTROL_NAME')" class="icon_osp icon_ospbiaoqian control-all" @click="layerControlAll('isLabelVisible')"></div>
        <div :title="$t('LAYER_CONTROL_SELECTABLE')" class="icon_osp icon_ospxuanze control-all" @click="layerControlAll('isSelectable')"></div>
        <div :title="$t('LAYER_CONTROL_IS_SNAP')" class="icon_osp icon_ospLayingCable control-all" @click="layerControlAll('isSnap')"></div>
      </div>
      <div class="layer-grid-body">
        <el-scrollbar>
          <!-- && (!moreFilterFlag || (moreFilterFlag && items.name !== 'Grid')) -->
          <div v-for="(items, indexs) in gridData" :key="indexs" v-show="items.dataLength !== 0 && items.tapType === resTap">
            <div class="layer-grid-tap-tit">
              <div class="tap icon_osp icon_ospdown" @click="gridToggle(`tree-${indexs}`, $event)"></div>
              <div>{{ items.name }}</div>
              <div></div>
              <div></div>
              <div>
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="items.isVisibleAll" @click="checkboxAll('isVisible', items, false, true)">
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!items.isVisibleAll" @click="checkboxAll('isVisible', items, true, true)">
              </div>
              <div>
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="items.isLabelVisibleAll" @click="checkboxAll('isLabelVisible', items, false, true)">
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!items.isLabelVisibleAll" @click="checkboxAll('isLabelVisible', items, true, true)">
              </div>
              <div>
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="items.isSelectableAll" @click="checkboxAll('isSelectable', items, false, true)">
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!items.isSelectableAll" @click="checkboxAll('isSelectable', items, true, true)">
              </div>
              <div>
                <!-- <input type="checkbox" v-if="items.canSnap" v-model="items.isSnapAll" @change="checkboxAll('isSnap', items, $event)"> -->
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="items.isSnapAll" @click="checkboxAll('isSnap', items, false, true)">
                <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!items.isSnapAll" @click="checkboxAll('isSnap', items, true, true)">
              </div>
            </div>
            <!-- <transition v-on:enter="enter" v-on:leave="leave"> -->
            <div class="layer-grid-body-content" :ref="`tree-${indexs}`">
              <div v-for="(item, index) in items.childData" :key="index">
                <div class="layer-grid-tap-tit layer-grid-tap-content" v-show="item.isShow">
                  <div>
                    <div></div>
                    <div class="tap icon_osp icon_ospdown" @click="gridToggle(`tree-${indexs}-${index}`, $event)"></div>
                    <div :title="item.layerName" v-if="searchValue">
                      <span v-for="(text, i) in item.layerNameArr" :key="i" :class="{red: text.toUpperCase() === searchValue.toUpperCase()}">{{ text }}</span>
                    </div>
                    <div :title="item.layerName" v-else>{{ item.layerName }}</div>
                    <div>
                      <img alt="" v-if="resTap === 'resource' && item.style" :src="item.style.iconUrl">
                      <img v-else-if="resTap === 'inService'" :src="`oss_core/edesign/assets/image/map/res-a/${item.resType}.svg`" alt="">
                    </div>
                    <div class="search-btn">
                      <!-- <div :class="{icon_ospattribute: (item.resStatus === 'C' && items.tapType === 'resource') || item.resType == 'A5'}" class="icon_osp" @click="searchRes(item)"></div> -->
                    </div>
                    <div>
                      <!-- <input type="checkbox" v-model="item.isVisible"  @change="checkboxOne('isVisible', items, $event, item)"> -->
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="item.isVisible" @click="checkboxOne('isVisible', items, false, item, true)">
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!item.isVisible" @click="checkboxOne('isVisible', items, true, item, true)">
                    </div>
                    <div>
                      <!-- <input type="checkbox" v-model="item.isLabelVisible" @change="checkboxOne('isLabelVisible', items, $event, item)"> -->
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="item.isLabelVisible" @click="checkboxOne('isLabelVisible', items, false, item, true)">
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!item.isLabelVisible" @click="checkboxOne('isLabelVisible', items, true, item, true)">
                    </div>
                    <div>
                      <!-- <input type="checkbox" v-model="item.isSelectable" @change="checkboxOne('isSelectable', items, $event, item)"> -->
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="item.isSelectable" @click="checkboxOne('isSelectable', items, false, item, true)">
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!item.isSelectable" @click="checkboxOne('isSelectable', items, true, item, true)">
                    </div>
                    <div>
                      <!-- <input type="checkbox" v-if="item.canSnap" v-model="item.isSnap" @change="checkboxOne('isSnap', items, $event, item)"> -->
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="item.isSnap && item.canSnap" @click="checkboxOne('isSnap', items, false, item, true)">
                      <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="!item.isSnap && item.canSnap" @click="checkboxOne('isSnap', items, true, item, true)">
                    </div>
                  </div>
                  <div :ref="`tree-${indexs}-${index}`">
                    <div class="layer-grid-theme-tap-tit" v-for="(attr, attrIndex) in item.gisLayerThemeList" :key="attrIndex">
                      <div>
                        <div class="tap icon_osp icon_ospdown" @click="gridToggle(`tree-${indexs}-${index}-${attrIndex}`,$event)"></div>
                        <div class="title" :title="attr.themeName">{{ attr.themeName }}</div>
                        <div class="check">
                          <!-- <input type="checkbox" v-model="item.isVisible"  @change="checkboxOne('isVisible', items, $event, item)"> -->
                          <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="attr.isVisible === 'Y'" @click="checkboxTheme('isVisible', item, 'N', items, attrIndex, true)">
                          <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="attr.isVisible === 'N'" @click="checkboxTheme('isVisible', item, 'Y', items, attrIndex, true)">
                        </div>
                      </div>
                      <div :ref="`tree-${indexs}-${index}-${attrIndex}`">
                        <div v-for="(themeChild, themeChildIndex) in attr.gisLayerThemeItemList" :key="themeChildIndex">
                          <div class="tap icon_osp"></div>
                          <div class="title" :title="themeChild.themeItemName">{{ themeChild.themeItemName }}</div>
                          <img class="theme-img" :src="themeChild.iconUrl" alt="" v-if="themeChild.iconUrl">
                          <div class="theme-img" v-else></div>
                          <div class="theme-img"></div>
                          <div class="check">
                            <!-- <input type="checkbox" v-model="item.isVisible"  @change="checkboxOne('isVisible', items, $event, item)"> -->
                            <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-blue.svg" alt="" v-show="themeChild.isVisible === 'Y'" @click="checkboxThemeOne( attr, 'N', themeChildIndex, items, item, attrIndex, true)">
                            <img class="image-btn" src="oss_core/edesign/assets/image/map-tool-bar/layer-control/check-gray.svg" alt="" v-show="themeChild.isVisible === 'N'" @click="checkboxThemeOne( attr, 'Y', themeChildIndex, items, item, attrIndex, true)">
                          </div>
                          <div class="theme-color" :style="{ backgroundColor: themeChild.lineColor}" v-if="item.style.geometryType !== 'geometryPoint'"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- </transition> -->
          </div>
        </el-scrollbar>
      </div>
      <!-- <div class="layer-grid-footer">
        <button type="button" class="btn row-btn btn-primary" @click="save">{{$t('OK')}}</button>
      </div> -->
    </div>
    <!-- <OnlineBaseMap></OnlineBaseMap> -->
  </div>
</template>

<script>
export default {
  name: 'LayerControlPlan',
  inject: ['getResourceList', 'getLayerCheckData', 'getSurfaceLayerList', 'getMapBox'],
  computed: {
    resourceList() {
      let resourceList = this.getResourceList(); // 资源图层
      let surfaceLayerList = this.getSurfaceLayerList(); // 地貌图层
      return resourceList.concat(surfaceLayerList);
    },

    layerCheckData() {
      return this.getLayerCheckData(); //
    },
    mapBox() {
      return this.getMapBox();
    },
  },
  data() {
    return {
      gridData: [], // 所有数据
      searchValue: '', // 搜索输入框
      resStatus: 'all', // 资源图层过滤条件
      resTap: 'resource', // 页签判断
      filterName: this.$t('LAYER_CONTROL_RESOURCE'),
      filterCode: 'resource',
    };
  },
  created() {},
  mounted() {
    this.getGridData();
  },
  methods: {
    layerControlAll(flag) {
      let grayFlag = true;
      this.gridData.forEach(items => {
        // if (items.isVisibleAll)
        if (!items[flag + 'All'] && items.tapType === this.resTap) {
          grayFlag = false;
        }
      });
      this.gridData.forEach(items => {
        if (items.tapType === this.resTap) {
          this.checkboxAll(flag, items, !grayFlag, false);
        }
      });
      this.save();
    },
    getGridData() {
      let newResData = this.resourceList;
      let newCheckData = this.layerCheckData;
      let gridData = [];

      //根据配置设置对应的勾选数据
      newCheckData.forEach(check => {
        let layerInfo = newResData.find(res => check.layerNo === res.layerNo);
        if (layerInfo) {
          if (check.themeId && check.themeItemId && layerInfo.gisLayerThemeList) {
            layerInfo.gisLayerThemeList.forEach(gisLayerTheme => {
              if (gisLayerTheme.themeId === check.themeId) {
                let themeInfo = gisLayerTheme.gisLayerThemeItemList.find(themeItem => themeItem.themeItemId === check.themeItemId);
                if (themeInfo) {
                  themeInfo.isSet = true;
                  this.$set(themeInfo, 'isVisible', check.isVisible);
                  themeInfo.isLabelVisible = check.isLabelVisible;
                  themeInfo.isSelectable = check.isSelectable;
                  themeInfo.isSnap = check.isSnap;
                }
              }
            });
          } else {
            layerInfo.isSet = true;
            this.$set(layerInfo, 'isVisible', check.isVisible === 'Y');
            this.$set(layerInfo, 'isLabelVisible', check.isLabelVisible === 'Y');
            this.$set(layerInfo, 'isSelectable', check.isSelectable === 'Y');
            this.$set(layerInfo, 'isSnap', check.isSnap === 'Y');
          }
        }
      });

      // 没有配置的数据默认设置为勾选
      newResData.forEach(res => {
        if (!res.isSet) {
          this.$set(res, 'isVisible', true);
          this.$set(res, 'isLabelVisible', true);
          this.$set(res, 'isSelectable', true);
          this.$set(res, 'isSnap', true);
        }
        if (res.gisLayerThemeList && res.gisLayerThemeList.length > 0) {
          res.gisLayerThemeList.forEach(themeList => {
            let allTrue = 'Y'; //是否全选
            themeList.gisLayerThemeItemList.forEach(theme => {
              if (!theme.isSet) {
                this.$set(theme, 'isVisible', 'Y');
                theme.isLabelVisible = 'Y';
                theme.isSelectable = 'Y';
                theme.isSnap = 'Y';
              }
              if (theme.isVisible !== 'Y') {
                allTrue = 'N';
              }
            });
            this.$set(themeList, 'isVisible', allTrue);
            themeList.isLabelVisible = allTrue;
            themeList.isSelectable = allTrue;
            themeList.isSnap = allTrue;
          });
        }
        gridData.push(res);
      });
      gridData.forEach(res => {
        let featureLayer = this.mapBox.findLayer(res.layerNo);
        if (featureLayer) {
          res.canSnap = featureLayer.canSnap ? true : false;
        }
      });
      this.getResource(gridData);

      // 此处添加edn库没有配置但是gis库地图存在的图层
      let allMapLayers = this.mapBox.getLayers();
      let otherSurfaces = allMapLayers.filter(all => !this.resourceList.some(res => res.layerNo === all.id));
      if (otherSurfaces && otherSurfaces.length > 0) {
        let child = [];
        otherSurfaces.forEach(other => {
          // 读取任务单中edn_gis_layer_config配置了但是ednc_surface_layer_rela没有配置的other地貌图层配置数据
          // 用于解决地貌图层的other级别没有读取后台的显隐藏配置。
          // 2021-07-20-lp(后台为txf："sourceFlag" = "OTHERSORT",)
          let findRes = newCheckData.find(res => res.sourceFlag === 'OTHERSORT' && res.layerNo === other.id);

          // 过滤other中的资源图层，只保留地貌类型
          // let curServiceNo = other._mapService.serviceNo;
          // if (realResourceServiceNoList.indexOf(curServiceNo) > -1) {
          //     return;
          // }

          let obj = {
            canSnap: other.canSnap,
            // catDesc: "Demand Point",
            // catName: "Demand Point"
            isLabelVisible: findRes ? findRes.isLabelVisible === 'Y' : other.showLabel,
            isSelectable: findRes ? findRes.isSelectable === 'Y' : other.selectable,
            isShow: true, // 是否在列表中展示
            isSnap: findRes ? findRes.isSnap === 'Y' : other.canSnap,
            isVisible: findRes ? findRes.isVisible === 'Y' : other.visible,
            layerName: other.layerName,
            layerNo: other.id,
            // localDesc: "建筑物接入点",
            // mapNo: "edesign-london"
            // relaResType: "BUILDING"
            // resGroup: "Demand Point"
            // resType: "A5"
            // resTypeName: "Demand Point"
            state: 'A',
            // surfaceCat: "A5"
            // surfaceDesc: "Demand Point"
          };
          child.push(obj);
        });

        let otherGroup = {
          name: 'Other',
          tapType: 'surface',
          dataLength: child.length,
          show: true,
          canSnap: !child.find(res => !res.canSnap),
          isLabelVisibleAll: !child.find(res => !res.isLabelVisible),
          isLabelVisibleNum: child.filter(res => res.isLabelVisible).length || 0,
          isSelectableAll: !child.find(res => !res.isSelectable),
          isSelectableNum: child.filter(res => res.isSelectable).length || 0,
          isSnapAll: !child.find(res => !res.isSnap),
          isSnapNum: child.filter(res => res.isSnap).length || 0,
          isVisibleAll: !child.find(res => !res.isVisible),
          isVisibleNum: child.filter(res => res.isVisible).length || 0,
          childData: child,
        };
        this.gridData.push(otherGroup);
      }
    },
    gridToggle(ref, e) {
      let el = this.$refs[ref][0];
      // 'icon_ospdown' : 'icon_ospright'
      $(e.target).toggleClass('icon_ospright');
      $(el).slideToggle(300);
    },
    getResource(resData) {
      //数据分组处理
      if (resData.length > 0) {
        let name = resData[0].resGroup;
        let layerType = resData[0].layerType;
        let childData = [];
        let newResData = [];
        resData.filter(item => {
          if (item.resGroup === name && item.layerType === layerType) {
            childData.push(item);
          } else {
            newResData.push(item);
          }
        });
        let tapType;
        if (resData[0].layerType === 'C') {
          tapType = 'resource';
        } else if (!resData[0].resStatus) {
          tapType = 'surface';
        } else if (resData[0].layerType === 'A') {
          tapType = 'inService';
        }
        let gridDataChild = {
          name: resData[0].resGroupI18n, // 组名
          tapType, // 组类型（对应tap切换）
          childData, // 组成员
        };
        this.setGridDataCheck(gridDataChild);
        this.gridData.push(gridDataChild);
        this.getResource(newResData);
      }
    },
    setGridDataCheck(gridDataChild, setAllTrue) {
      // 设置选中状态相关数据，后期好进行选中的联动
      let childData = [];
      gridDataChild.childData.forEach(item => {
        //根据过滤状态和搜索条件对数据进行处理
        if (setAllTrue) {
          item.isVisible = true;
          item.isLabelVisible = true;
          item.isSelectable = true;
          item.isSnap = true;
        }

        if (this.resStatus === 'all') {
          // 全部状态的
          if (this.searchValue) {
            //判断搜索条件
            if (item.layerName.toUpperCase().indexOf(this.searchValue.toUpperCase()) > -1) {
              item.isShow = true;
              item.layerNameArr = [];
              this.splitStr(item.layerName, this.searchValue, item.layerNameArr);
              childData.push(item);
            } else {
              item.isShow = false;
            }
          } else {
            item.isShow = true;
            childData.push(item);
          }
        } else {
          if (item.resStatus === this.resStatus || !item.resStatus) {
            // 符合状态，地貌没有resStatus字段且地貌不需要进行状态过滤所以只要是地貌就放出来（|| !item.resStatus）
            if (this.searchValue) {
              if (item.layerName.toUpperCase().indexOf(this.searchValue.toUpperCase()) > -1) {
                item.isShow = true;
                item.layerNameArr = [];
                this.splitStr(item.layerName, this.searchValue, item.layerNameArr);
                childData.push(item);
              } else {
                item.isShow = false;
              }
            } else {
              item.isShow = true;
              childData.push(item);
            }
          } else {
            item.isShow = false;
          }
        }
      });
      gridDataChild.show = true;
      gridDataChild.isVisibleAll = false;
      gridDataChild.isLabelVisibleAll = false;
      gridDataChild.isSelectableAll = false;
      gridDataChild.isSnapAll = false;
      gridDataChild.isVisibleNum = 0;
      gridDataChild.isLabelVisibleNum = 0;
      gridDataChild.isSelectableNum = 0;
      gridDataChild.isSnapNum = 0;
      gridDataChild.dataLength = childData.length;
      childData.forEach(item => {
        if (item.isVisible === true) {
          gridDataChild.isVisibleNum++;
        }
        if (item.isLabelVisible === true) {
          gridDataChild.isLabelVisibleNum++;
        }
        if (item.isSelectable === true) {
          gridDataChild.isSelectableNum++;
        }
        if (item.isSnap === true) {
          gridDataChild.isSnapNum++;
        }
      });
      if (gridDataChild.isVisibleNum === gridDataChild.dataLength) {
        gridDataChild.isVisibleAll = true;
      }
      if (gridDataChild.isLabelVisibleNum === gridDataChild.dataLength) {
        gridDataChild.isLabelVisibleAll = true;
      }
      if (gridDataChild.isSelectableNum === gridDataChild.dataLength) {
        gridDataChild.isSelectableAll = true;
      }
      if (gridDataChild.isSnapNum === gridDataChild.dataLength) {
        gridDataChild.isSnapAll = true;
      }
    },
    splitStr(longStr, shortStr, arr) {
      //字符串截取
      let index = longStr.toUpperCase().indexOf(shortStr.toUpperCase());
      if (index > -1) {
        if (longStr.substring(0, index)) {
          arr.push(longStr.substring(0, index));
        }
        arr.push(longStr.substring(index, index + shortStr.length));
        if (longStr.substring(index + shortStr.length)) {
          this.splitStr(longStr.substring(index + shortStr.length), shortStr, arr);
        }
      } else {
        arr.push(longStr);
      }
    },
    checkboxAll(name, items, checked, isClick) {
      let refreshLayers = [];
      //全选的联动操作
      items[name + 'All'] = checked;
      let childData = [];
      // if (this.resStatus === 'all') {
      //     childData = items.childData;
      // } else if (this.resStatus === 'A') {
      //     childData = items.childData.filter(item => item.resStatus === 'A');
      // } else if (this.resStatus === 'C') {
      //     childData = items.childData.filter(item => item.resStatus === 'C');
      // }
      items.childData.forEach(item => {
        refreshLayers.push(item.layerNo);
        //根据过滤状态和搜索条件对数据进行处理
        if (this.resStatus === 'all') {
          // 全部状态的
          if (this.searchValue) {
            //判断搜索条件
            if (item.layerName.toUpperCase().indexOf(this.searchValue.toUpperCase()) > -1) {
              childData.push(item);
            }
          } else {
            childData.push(item);
          }
        } else {
          if (item.resStatus === this.resStatus || !item.resStatus) {
            // 符合状态
            if (this.searchValue) {
              if (item.layerName.toUpperCase().indexOf(this.searchValue.toUpperCase()) > -1) {
                childData.push(item);
              }
            } else {
              childData.push(item);
            }
          }
        }
      });
      if (name === 'isVisible') {
        items.isVisibleNum = 0;
        childData.forEach(item => {
          item[name] = checked;
          this.checkboxOne('isVisible', items, checked, item, false);
        });
        if (checked) {
          items.isVisibleNum = items.dataLength;
          items.isSelectableNum = items.dataLength;
          items.isLabelVisibleNum = items.dataLength;
          items.isSnapNum = items.dataLength;
          items.isSelectableAll = true;
          items.isLabelVisibleAll = true;
          items.isSnapAll = true;
        } else {
          items.isVisibleNum = 0;
          items.isSelectableNum = 0;
          items.isLabelVisibleNum = 0;
          items.isSnapNum = 0;
          items.isSelectableAll = false;
          items.isLabelVisibleAll = false;
          items.isSnapAll = false;
        }
      } else {
        if (checked) {
          childData.forEach(item => {
            item[name] = true;
            item.isVisible = true;
          });
          items[name + 'Num'] = items.dataLength;
          items.isVisibleNum = items.dataLength;
          items.isVisibleAll = true;
        } else {
          childData.forEach(item => {
            item[name] = false;
          });
          items[name + 'Num'] = 0;
          items.isVisibleAll = true;
        }
      }
      isClick && this.save(refreshLayers); //自动保存
    },

    checkboxOne(name, items, checked, item, isClick) {
      // 单选的联动操作
      let check = checked;
      item[name] = check;
      if (name === 'isVisible') {
        if (item.isSelectable !== check) {
          item.isSelectable = check;
          if (check) {
            items.isSelectableNum++;
          } else {
            items.isSelectableNum--;
          }
          items.isSelectableAll = items.dataLength === items.isSelectableNum ? true : false;
        }
        if (item.isLabelVisible !== check) {
          item.isLabelVisible = check;
          if (check) {
            items.isLabelVisibleNum++;
          } else {
            items.isLabelVisibleNum--;
          }
          items.isLabelVisibleAll = items.dataLength === items.isLabelVisibleNum ? true : false;
        }

        if (item.isSnap !== check) {
          item.isSnap = check;
          if (check) {
            items.isSnapNum++;
          } else {
            items.isSnapNum--;
          }
          items.isSnapAll = items.dataLength === items.isSnapNum ? true : false;
        }
        if (!check) {
          this.delCheckboxThemeAll(item);
        }
      } else {
        if (check && !item.isVisible) {
          item.isVisible = true;
          items.isVisibleNum++;
          items.isVisibleAll = items.dataLength === items.isVisibleNum ? true : false;
        }
      }

      if (check) {
        items[name + 'Num']++;
      } else {
        items[name + 'Num']--;
      }

      if (items.dataLength === items[name + 'Num']) {
        items[name + 'All'] = true;
      } else {
        items[name + 'All'] = false;
      }
      isClick && this.save([item.layerNo]);
    },
    layerFilter(name) {
      // 资源图层设置过滤条件后重新组装数据,需要重新组装数据都可以调用此方法比如搜索
      this.resStatus = name;
      this.gridData.forEach(child => this.setGridDataCheck(child));
      if (this.$refs.popover) {
        this.$refs.popover.close();
      }
    },

    checkTap(name, buttonName) {
      if (this.$refs.popoverF) {
        this.$refs.popoverF.close();
      }
      if (buttonName) {
        this.filterName = buttonName;
        this.filterCode = name;
      }
      this.resTap = name;
    },

    // 单个主题全选 type是否需要全选下一级主题  界面点击事件触发需要其他情况不需要传true
    checkboxTheme(name, item, isCheck, items, attrIndex, type, isClick) {
      if (isCheck === 'Y' && !item.isVisible) {
        this.checkboxOne(name, items, true, item, false);
      }
      item.gisLayerThemeList.forEach((attr, idx) => {
        if (idx === attrIndex) {
          attr[name] = isCheck;
          if (!type) {
            attr.gisLayerThemeItemList.forEach(themeChild => {
              themeChild[name] = isCheck;
            });
          }
        } else if (isCheck === 'Y') {
          attr[name] = 'N';
          attr.gisLayerThemeItemList.forEach(themeChild => {
            themeChild[name] = 'N';
          });
        }
      });
      isClick && this.save([item.layerNo]);
    },
    // 主题全部取消
    delCheckboxThemeAll(item) {
      if (item.gisLayerThemeList) {
        item.gisLayerThemeList.forEach(attr => {
          attr.isVisible = 'N';
          attr.gisLayerThemeItemList.forEach(themeChild => {
            themeChild.isVisible = 'N';
          });
        });
      }
    },
    // 主题单选
    checkboxThemeOne(attr, isCheck, themeChildIndex, items, item, attrIndex, isClick) {
      attr.gisLayerThemeItemList[themeChildIndex].isVisible = isCheck;

      if (isCheck === 'N') {
        if (attr.isVisible === 'Y') {
          this.checkboxTheme('isVisible', item, 'N', items, attrIndex, true, false);
        }
      } else {
        let someN = attr.gisLayerThemeItemList.some(themeChild => themeChild.isVisible === 'N');
        !item.isVisible && this.checkboxOne('isVisible', items, true, item, false);
        if (!someN) {
          attr.isVisible = 'Y';
        }
      }
      isClick && this.save([item.layerNo]);
    },
    save(refreshLayers) {
      let layerCheckData = [];
      this.gridData.forEach(network => {
        network.childData.forEach(check => {
          layerCheckData.push({
            isVisible: check.isVisible ? 'Y' : 'N',
            isSelectable: check.isSelectable ? 'Y' : 'N',
            isLabelVisible: check.isLabelVisible ? 'Y' : 'N',
            isSnap: check.isSnap ? 'Y' : 'N',
            isValid: 'Y',
            layerNo: check.layerNo,
            themeId: null,
            themeItemId: null,
          });
          if (check.gisLayerThemeList && check.gisLayerThemeList.length > 0) {
            check.gisLayerThemeList.forEach(theme => {
              theme.gisLayerThemeItemList.forEach(themeItem => {
                layerCheckData.push({
                  isVisible: themeItem.isVisible,
                  isSelectable: themeItem.isSelectable,
                  isLabelVisible: themeItem.isLabelVisible,
                  isSnap: themeItem.isSnap,
                  isValid: 'Y',
                  layerNo: check.layerNo,
                  themeId: theme.themeId,
                  themeItemId: themeItem.themeItemId,
                });
              });
            });
          }
        });
      });
      let param = {
        gisLayerConfigList: layerCheckData,
      };
      //   let url;
      //   if (this.getProjectInfo().schemaId === this.getProjectInfo().sprintId) {
      //     // 表明是sprint单
      //     param.sprintId = this.getProjectInfo().sprintId;
      //     url = 'edesign/sprint/restyperela/sprintlayer/v1';
      //   } else {
      //     param.sprintId = this.getProjectInfo().sprintId;
      //     param.schemaId = this.getProjectInfo().schemaId;
      //     url = 'edesign/schema/restyperela/schemalayer/v1';
      //   }
      // this.$emit('refreshLayers', param.gisLayerConfigList);
      this.$emit('refreshLayers', layerCheckData, refreshLayers);
      //   fish.post({
      //     url: url,
      //     data: param,
      //     success: data => {
      //       fish.toast('success', this.$t('SAVE_SUCCESS'));
      //     },
      //   });
    },
  },
  watch: {
    searchValue() {
      // 搜索
      this.layerFilter(this.resStatus);
    },
  },
};
</script>
<style lang="scss">
.layer-control-popover {
  .popover-content {
    padding: 2px 4px;
  }
}
</style>
<style lang="scss" scoped>
@import './layerControl';
</style>
