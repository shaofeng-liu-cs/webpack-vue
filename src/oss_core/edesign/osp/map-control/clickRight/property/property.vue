<template>
  <Popup :popupObj="popupObj" :sureFlag="sureFlag" @popupClose="popupClose" @popupSure="popupSure" @resize="resize">
    <template v-slot:popupBody>
      <div class="bodyy">
        <form ref="updateForm" class="form-horizontal form-group">
          <div class="row form-inline action-div">
            <div class="edit-content">
              <button type="button" :disabled="isEditDisabled || projectInfo.viewType === 'view'" :class="clickFlag ? 'btn-primary' : 'btn-default'" class="btn icon_osp icon_ospbianji" @click="editRow"></button>
              <button type="button" :disabled="!clickFlag" class="btn btn-default icon_osp icon_ospbaocun no-shrink" @click="saveGrid"></button>
              <button type="button" :disabled="!clickFlag" class="btn btn-default no-shrink" @click="cancelRow">{{ $t('CANCEL') }}</button>
              <button type="button" class="btn btn-default icon_osp icon_ospswitch no-shrink" @click="gridChange"></button>
              <div v-for="(items, indexs) in gridDataList" v-show=" indexs === tapIndex && clickFlag && isHorizontal" :key="indexs" class="update-div no-shrink">
                <div class="propertyTop">
                  <Combobox v-model="items.updateTypeValue" :setting="items.updateListSetting" dataRule="required" @change="updateChange"></Combobox>
                  <label class="topLabel">=</label>
                </div>
                <div v-show="items.attrObj.controlType === '3'">
                  <Combobox v-model="items.updateValue" :setting="{ dataTextField: 'valueDesc', dataValueField: 'attrValue', dataSource: items.attrObj.attrValuesDTOS}"></Combobox>
                </div>
                <input v-show="items.attrObj.controlType !== '3'" v-model="items.updateValue" :type="items.attrObj.dataType === 'N' ? 'number' : 'text'" class="form-control " />
                <button type="button" class="btn btn-default update-all no-shrink" @click="updateGrid('all')">{{ $t('UPDATE_ALL') }}</button>
                <button type="button" class="btn btn-default update-sel no-shrink" :disabled="!selection.length" @click="updateGrid('select')">{{ $t('UPDATE_SEL') }}</button>
              </div>
            </div>
            <div class="map-control-div">
              <div v-show="isHorizontal" class="select-mode">
                <DrawPolygon2Map ref="DrawPolygon2Map" @afterDrawPolygon="afterDrawPolygon"></DrawPolygon2Map>
              </div>
              <button v-show="isHorizontal" :disabled="!filterGeo" type="button" class="btn btn-default cancelGeo-btn" @click="clearGeo">{{ $t('CLEAR') }}</button>
            </div>
          </div>
        </form>
        <div class="form-inline tab-class">
          <div class="label-list">
            <label v-for="(item, index) in gridDataList" :key="index" :class="{tabActive: tapIndex === index}" class="tabClass" @click="tabChange(index)">
              <div v-if="isHorizontal"><span v-if="tapIndex===index">{{ item.name }} ({{ selection.length }}/{{ item.hGridDataList.length }})</span>
                <span v-else>{{ item.name }} (0/{{ item.hGridDataList.length}})</span>
              </div>
              <div v-else>{{ item.name }} ({{ item.vGridDataList.length }})
              </div>
            </label>
          </div>
          <div class="btn-list">
            <button v-show="isHorizontal" type="button" class="btn btn-primary icon_osp icon_ospfanxuan inverse" :title="$t('INVER_SEL')" @click="inverseGrid"></button>
            <button type="button" class="btn btn-primary icon_osp icon_ospdingwei center-sel" :title="$t('CENTER_SEL')" @click="centerSelection"></button>
          </div>
        </div>
        <div v-if="isHorizontal" class="grid-class">
          <template v-for="(items, indexs) in gridDataList">
            <Grid v-if="indexs === tapIndex" :key="items.name" ref="horizontalGridPropertyRef" :data="items.hGridDataList" :option="horizontalGridOption" :edits="editList" :selection.sync="selection" @onSelectRow="rowSelect">
              <grid-column v-for="(item, index) in items.attrInfo" :key="index" :attrInfo="item" :label="item.attrDesc" :prop="item.attrName" :editable="item.controlFlag === '1'" :editrules="item.dataType === 'N' ? rulesNumber : ''"></grid-column>
            </Grid>
          </template>
        </div>
        <div v-else class="grid-class">
          <template v-for="(items, indexs) in gridDataList">
            <div v-if="indexs === tapIndex" :key="items.name" class="grid-class ">
              <Grid ref="verticalGridPropertyRef" :data="items.vGridDataList[items.vGridDataIndex]" :option="verticalGridOption" :edits="editList" @onSelectRow="rowSelect">
                <grid-column label="Name" prop="name"></grid-column>
                <grid-column label="Value" prop="value" type="Complex" :editable="true"></grid-column>
              </Grid>
              <Pagination :pageSize="1" :total="items.vGridDataList.length" :pgTotal="false" :pgInput="false" :pageSizes="[]" :pgRecText="false" :pageNo="items.vGridDataIndex + 1" @page-change="onPageClick"></Pagination>
            </div>
          </template>
        </div>
        <div v-show="isHorizontal" class="footer">
          <form ref="filterForm" class="form-horizontal form-group filter-form">
            <div class="form-inline filter-div">
              <button type="button" class="btn btn-default icon_osp icon_osploudou" @click="filterClick"></button>
              <div v-for="(items, indexs) in gridDataList" v-show="filterFlag && indexs === tapIndex" :key="indexs" class="filter-flag">
                <div class="form-inline propertyBottom">
                  <Combobox v-model="items.searchTypeValue" :setting="items.searchListSetting" dataRule="required" @change="searchChange"></Combobox>
                  <Combobox ref="modelRef" v-model="items.searchModel" :setting="items.searchModelSetting" dataRule="required"></Combobox>
                </div>
                <div v-show="items.searchAttrObj.controlType === '3'">
                  <Combobox v-model="items.searchValue" :setting="{ dataTextField: 'valueDesc', dataValueField: 'attrValue', dataSource: items.searchAttrObj.attrValuesDTOS}"></Combobox>
                </div>
                <input v-show="items.searchAttrObj.controlType !== '3'" v-model="items.searchValue" :type="items.searchAttrObj.dataType === 'N' ? 'number' : 'text'" class="form-control " @keyup.enter="search" />
                <button type="button" class="btn btn-primary filter-btn" @click="search">{{ $t('APPLY') }}</button>
                <button type="button" class="btn btn-default cancelFilter-btn" @click="clearFilter">{{ $t('CLEAR') }}</button>
              </div>
            </div>
          </form>
          <button type="button" class="btn btn-primary no-shrink" @click="exportXlsx">{{ $t('EXPORT') }}</button>
        </div>
      </div>
    </template>
  </Popup>
</template>
<script>
import XLSX from 'xlsx'; // 导出表格第三方库
import { queryAttrDtosInfo } from '@/oss_core/edesign/api/query/resType.js';
import { setExportGridData, sheet2blob, openDownloadDialog } from '@/oss_core/base/utils/xlsx.js'; // 导出表格公用方法

export default {
  name: 'PropertyView',
  inject: ['getMapBox', 'getProjectInfo', 'getControlData', 'getHldEl', 'getResTypeAttrDtos', 'getSurfaceLayerList'],
  data() {
    return {
      gridDataList: [], // 所有数据合集
      tapIndex: 0, // 当前数据下标
      clickFlag: false, // 是否开启批量编辑
      selection: [], // 选中的数据
      filterGeo: null, // 是否带有区域过滤
      filterFlag: false, // 是否开启底部过滤
      editList: [], // 编辑的行数据
      sureFlag: false, // 是否编辑过表格内容
      popupObj: {
        title: this.$t('PROPERTIES'), // 弹框标题
        ok: '', // 确认按钮内容
        close: '', // 取消按钮内容
        modal: false, // 是否蒙层
        width: '1200px',
        height: 'auto',
        el: this.getHldEl(), // 指定插入节点
        show: false, // 是否展示
        drag: true, // 是否拖拽
        zIndex: 4, // 层级
        resize: 'both',
      },
      initGraphics: [], // 所有资源的graphics对象数组
      isHorizontal: true, // 初始化表格，默认为横向表格
      horizontalGridOption: {
        height: '184px',
        columnMenu: false,
        shrinkToFit: false, // 表格列宽是否按比例缩放
        pager: false,
        multiselect: true,
        multiselectWidth: '40px',
        columnResizable: false,
        slimscrollOptions: {
          alwaysVisible: false,
          axis: 'both',
        },
      }, // 横向表格参数
      verticalGridOption: {
        height: '184px',
        columnMenu: false,
        shrinkToFit: false, // 表格列宽是否按比例缩放
        pager: false,
        columnResizable: false,
        slimscrollOptions: {
          alwaysVisible: false,
          axis: 'both',
        },
      }, // 纵向表格参数
      qtyRules: 'integer[+0];',
      rulesNumber: 'digits;',
      isEditDisabled: false, // 是否开启编辑按钮
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    controlData() {
      return this.getControlData();
    },
    hldEl() {
      return this.getHldEl();
    },
    resTypeAttrDtos() {
      return this.getResTypeAttrDtos();
    },
    surfaceLayerList() {
      return this.getSurfaceLayerList();
    },
  },
  watch: {
    isHorizontal: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.popupObj.width = '1200px';
          this.popupObj.height = '400px';
        } else {
          this.popupObj.width = '550px';
          this.popupObj.height = '550px';
        }
      },
    },
  },
  mounted() {
    this.$root.$on('property', this.init);
  },
  destroyed() {
    this.$root.$off('property', this.init);
  },
  methods: {
    // 初始化数据
    init(graphics) {
      const gridDataList = [];
      this.initData();
      graphics.forEach(gra => {
        const gridData = gridDataList.find(item => item.resType === gra.resType);
        if (gridData) {
          gridData.graphics.push(gra);
        } else {
          gridDataList.push({
            attrInfo: [], // 属性详情
            resType: gra.resType,
            name: gra.resTypeName,
            attrObj: null, // 当前选择修改条件的所有属性
            searchAttrObj: null, // 当前搜索的条件所有属性
            updateValue: '', // 当前修改后的值
            graphics: [gra],
            updateList: [], // 初始化可编辑的属性列表\
            searchList: [], // 搜索属性列表
            searchTypeValue: '', // 当前搜索类型
            searchValue: '', // 当前搜索值
            hGridDataList: [], // 横向展示数据
            vGridDataList: [], // 纵向展示数据
            vGridDataIndex: 0, // 当前纵向数据下表
            updateTypeValue: '', // 当前选中的编辑属性
            updateListSetting: {
              placeholder: this.$t('SELECT'),
              dataTextField: 'name',
              dataValueField: 'value',
              dataSource: [],
            }, // 可编辑属性的下拉框
            searchListSetting: {
              placeholder: this.$t('SELECT'),
              dataTextField: 'name',
              dataValueField: 'value',
              dataSource: [],
            }, // 可编辑属性的下拉框
            searchModel: '', // 搜索模式
            searchModelSetting: {
              placeholder: this.$t('SELECT'),
              dataTextField: 'name',
              dataValueField: 'value',
              dataSource: [],
            },
          });
        }
      });
      this.initGraphics = graphics;
      this.queryAttrInfo(gridDataList);
      this.isEdit();
    },
    initData() {
      this.gridDataList = [];
      this.isHorizontal = true; // 初始化表格，默认为横向表格
      this.sureFlag = false; // 是否编辑过表格内容
      this.tapIndex = 0; // 当前数据下标
      this.clickFlag = false; // 是否开启批量编辑
      this.isEditDisabled = false; // 是否禁用批量编辑按钮
      this.editList = []; // 编辑的行数据
      this.selection = []; // 选中的数据
      this.filterGeo = null; // 是否带有区域过滤
    },
    // 根据资源类型查询每个类型下需要展示的信息
    queryAttrInfo(gridDataList) {
      const promiseList = [];
      gridDataList.forEach(item => {
        const normalData = this.resTypeAttrDtos[item.resType];
        if (normalData) {
          this.setAttrInfo(item, normalData);
        } else {
          promiseList.push(queryAttrDtosInfo(item.resType));
        }
      });
      if (promiseList.length > 0) {
        Promise.all(promiseList).then(resultList => {
          resultList.forEach(result => {
            gridDataList.some(item => {
              if (item.resType === result.resType) {
                this.setAttrInfo(item, result.attrDTOS);
                this.resTypeAttrDtos[item.resType] = result.attrDTOS;
                return true;
              }
              return false;
            });
          });
          this.gridDataList = gridDataList;
          this.popupObj.show = true;
        });
      } else {
        this.gridDataList = gridDataList;
        this.popupObj.show = true;
      }
    },

    // 对需要展示的信息进行处理，组装可编辑熟悉
    setAttrInfo(gridData, normalData) {
      gridData.attrInfo = normalData.sort((x, y) => x.dispSeq - y.dispSeq).filter(attrin => attrin.controlFlag !== '3');
      gridData.attrInfo.forEach(attrItem => {
        const attrObj = {
          name: attrItem.attrDesc,
          value: attrItem.attrName,
          attrObj: attrItem,
          controlType: attrItem.controlType,
          attrValuesDTOS: attrItem.attrValuesDTOS,
        };
        if (attrItem.controlFlag === '1') {
          gridData.updateList.push(attrObj);
        }
        gridData.searchList.push(attrObj);
      }); // 组装可编辑属性下拉框
      gridData.updateListSetting.dataSource = gridData.updateList;
      if (gridData.updateList.length > 0) {
        gridData.updateListSetting.value = gridData.updateList[0].value; // 设置默认值
        gridData.updateTypeValue = gridData.updateList[0].value; // 设置绑定数据
        gridData.attrObj = gridData.updateList[0].attrObj;
      }
      gridData.searchListSetting.dataSource = gridData.searchList;
      gridData.searchListSetting.value = gridData.searchList[0].value; // 设置默认值
      gridData.searchTypeValue = gridData.searchList[0].value; // 设置绑定数据
      gridData.searchAttrObj = gridData.searchList[0].attrObj; //
      this.searchChange(gridData.updateList[0], 'init', gridData);
      // 初始化表格数据 包括横向表格和纵向表格
      this.initAllGridData(gridData);
    },
    // 初始化表格数据 包括横向表格和纵向表格
    initAllGridData(gridData) {
      gridData.hGridDataList = [];
      gridData.vGridDataList = [];
      gridData.graphics.forEach((graphic, index) => {
        const { attributes } = graphic;
        attributes._id_ = `jqg${index}`;
        const resData = [];
        gridData.attrInfo.forEach(key => {
          if (key.attrName === 'longitude' || key.attrName === 'latitude') {
            if (attributes[key.attrName] && key.precision) {
              const filterCount = parseInt(key.precision, 10) + 1;
              attributes[key.attrName] = attributes[key.attrName].toString().substring(0, filterCount);
            }
          }
          resData.push({
            name: key.attrDesc,
            value: attributes[key.attrName],
            attrInfo: key,
          });
        });
        gridData.hGridDataList.push(attributes);
        gridData.vGridDataList.push(resData);
      });
    },
    // 是否可编辑
    isEdit() {
      if (this.projectInfo.sourceFlag === 'designer-map') {
        this.isEditDisabled = true;
      } else if (this.projectInfo.markFlag === 'sprint') {
        this.isEditDisabled = this.initGraphics.some(item => {
          const haveResType = !this.surfaceLayerList.some(surfaceLayer => surfaceLayer.resType === item.resType);
          return haveResType;
        });
      }
    },
    // 编辑模式切换
    editRow() {
      this.clickFlag = !this.clickFlag;
      if (!this.clickFlag) {
        this.cancelRow();
      }
    },
    // 编辑条件改变
    updateChange(item) {
      this.gridDataList[this.tapIndex].attrObj = item.attrObj;
    },
    // 搜索条件改变
    searchChange(item, type, oldGridData) {
      const gridData = oldGridData || this.gridDataList[this.tapIndex];
      gridData.searchAttrObj = item.attrObj;
      if (item.attrObj.dataType === 'N') {
        const filterNumber = [
          {
            name: '=',
            value: 'equals',
          },
          {
            name: '>',
            value: 'more',
          },
          {
            name: '<',
            value: 'less',
          },
        ];
        gridData.searchModelSetting.dataSource = filterNumber;
        gridData.searchModel = filterNumber[0].value;
        gridData.searchModelSetting.value = filterNumber[0].value;
      }
      if (item.attrObj.dataType === 'S') {
        const filterString = [
          {
            name: '=',
            value: 'equals',
          },
          {
            name: 'like',
            value: 'like',
          },
        ];
        gridData.searchModelSetting.dataSource = filterString;
        gridData.searchModel = filterString[0].value;
        gridData.searchModelSetting.value = filterString[0].value;
      }
    },
    // 关闭弹窗
    popupClose() {},
    // 底部条件过滤显示隐藏
    filterClick() {
      this.filterFlag = !this.filterFlag;
    },
    // 底部条件过滤
    search() {
      const gridData = this.gridDataList[this.tapIndex];
      this.initAllGridData(gridData);
      // 点击筛选后应该选中归0
      this.selection = [];
      if (gridData.searchModel && gridData.searchValue) {
        switch (gridData.searchModel) {
          case 'equals':
            gridData.hGridDataList = gridData.hGridDataList.filter(item => item[gridData.searchTypeValue] === gridData.searchValue);
            break;
          case 'like':
            gridData.hGridDataList = gridData.hGridDataList.filter(
              item => item[gridData.searchTypeValue].toString().toLowerCase().indexOf(gridData.searchValue.toLowerCase()) > -1,
            );
            break;
          case 'more':
            gridData.hGridDataList = gridData.hGridDataList.filter(item => Number(item[gridData.searchTypeValue]) - Number(gridData.searchValue) > 0);
            break;
          case 'less':
            gridData.hGridDataList = gridData.hGridDataList.filter(item => Number(item[gridData.searchTypeValue]) - Number(gridData.searchValue) < 0);
            break;
          default:
            break;
        }
      }
    },
    // 地图选取区域过滤
    afterDrawPolygon(geo) {
      this.init(this.initGraphics);
      this.filterGeo = geo || this.filterGeo;
      if (this.filterGeo) {
        this.selection = [];
        this.gridDataList.forEach(gridInfo => {
          gridInfo.graphics = gridInfo.graphics.filter(graphic => !this.$map.GeometryUtils.disJoint(this.filterGeo, graphic.geometry));
          gridInfo.hGridDataList = gridInfo.hGridDataList.filter(item =>
            gridInfo.graphics.some(graphic => graphic.attributes.gisKey === item.gisKey),
          );
        });
      }
    },
    // 清除区域过滤
    clearGeo() {
      this.filterGeo = null;
      this.init(this.initGraphics);
      this.$refs.DrawPolygon2Map.cancelDrawAction();
    },
    // 导出表格XLSX
    exportXlsx() {
      const workbook = {
        SheetNames: [],
        Sheets: {},
      };
      this.gridDataList.forEach(item => {
        workbook.SheetNames.push(item.name);
        workbook.Sheets[item.name] = XLSX.utils.json_to_sheet(setExportGridData(item.hGridDataList, item.attrInfo));
      });
      const fileName = 'properties';
      openDownloadDialog(sheet2blob(workbook), `${fileName}.xlsx`);
    },
    // 关闭确认
    popupSure() {
      fish.confirm(this.$t('HAS_DATA_SAVED'), () => {
        this.popupObj.show = false;
        this.popupClose();
      });
    },
    // 切换页签
    tabChange(index) {
      if (this.sureFlag) {
        fish.confirm(this.$t('HAS_DATA_SAVED'), () => {
          this.cancelRow();
          this.tapIndex = index;
          this.editList = [];
          this.selection = [];
        });
      } else {
        this.tapIndex = index;
        this.editList = [];
        this.selection = [];
      }
    },
    // 表格行选择事件
    rowSelect(row) {
      if (!this.isHorizontal && row.attrInfo.controlFlag !== '1') {
        return;
      }
      if (this.clickFlag) {
        const have = this.editList.some(item => item._id_ === row._id_);
        !have && this.editList.push(row);
        this.sureFlag = true;
      }
    },
    // 横向表格反选
    inverseGrid() {
      this.$refs.horizontalGridPropertyRef[0].toggleAllSelectionDom();
    },
    // 地图选择资源并居中
    centerSelection() {
      if (this.selection.length > 0) {
        this.mapBox.clear();
        const gridData = this.gridDataList[this.tapIndex];
        const graphics = gridData.graphics.filter(graphic => this.selection.some(sel => sel.gisKey === graphic.attributes.gisKey));
        this.mapBox.setSelected(graphics, true);
        this.$emit('map-selection', graphics);
      }
    },
    // 更新全部资源 和 更新选中资源
    updateGrid(type) {
      const gridInfo = this.gridDataList[this.tapIndex];
      if (gridInfo.updateTypeValue && gridInfo.updateValue) {
        const gridData = gridInfo.hGridDataList;
        gridData.forEach(row => {
          if (type === 'all') {
            row[gridInfo.updateTypeValue] = gridInfo.updateValue;
          } else if (this.selection.some(selRow => selRow._id_ === row._id_)) {
            row[gridInfo.updateTypeValue] = gridInfo.updateValue;
          }
        });
        this.sureFlag = true;
      }
    },
    // 保存
    saveGrid() {
      if (this.isHorizontal) {
        this.saveHorizontal();
      } else {
        this.saveVertical();
      }
    },
    // 保存横向表格
    saveHorizontal() {
      this.$refs.horizontalGridPropertyRef[0].saveAllRow();
      this.editList = [];
      const gridData = this.gridDataList[this.tapIndex];
      gridData.hGridDataList = this.$refs.horizontalGridPropertyRef[0].getData();
      gridData.graphics.forEach(graphic => {
        const hGridDataList = gridData.hGridDataList.find(item => item.gisKey === graphic.attributes.gisKey);
        const attr = {};
        gridData.updateList.forEach(item => {
          attr[item.value] = hGridDataList[item.value];
        }); // 组装可编辑属性下拉框
        graphic.attributes = Object.assign(graphic.attributes, attr);
        this.$root.$emit('changeAttributes', graphic.attributes); // 更新面板属性值
      });
      this.saveGraphics(gridData.graphics);
    },
    // 保存纵向表格
    saveVertical() {
      this.$refs.verticalGridPropertyRef[0].saveAllRow();
      this.editList = [];
      const gridData = this.gridDataList[this.tapIndex];
      gridData.vGridDataList[gridData.vGridDataIndex] = this.$refs.verticalGridPropertyRef[0].getData();
      const gisKey = gridData.vGridDataList[gridData.vGridDataIndex].find(attr => attr.name === 'GIS ID').value;
      const graphic = gridData.graphics.find(item => item.attributes.gisKey === gisKey);
      this.saveGraphics([graphic]);
    },
    saveGraphics(graphics) {
      this.$map.batchUpdateGeometryById(graphics).then(() => {
        fish.toast('success', `${this.$t('SAVE_SUCCESS')}!`);
        this.$emit('afterSaveProperty');
        this.sureFlag = false;
        this.clickFlag = false;
      });
    },
    // 退出编辑模式
    cancelRow() {
      this.clickFlag = false;
      this.editList = [];
      if (this.sureFlag) {
        this.sureFlag = false; // 取消保存，恢复数据
        const gridData = this.gridDataList[this.tapIndex];
        this.initAllGridData(gridData);
      }
    },
    // 清除底部搜索条件
    clearFilter() {
      const gridData = this.gridDataList[this.tapIndex];
      this.initAllGridData(gridData);
    },
    // 横向表格与纵向表格转换
    gridChange() {
      if (this.sureFlag) {
        fish.confirm(this.$t('HAS_DATA_SAVED'), () => {
          this.isHorizontal = !this.isHorizontal;
          this.cancelRow();
        });
      } else {
        this.isHorizontal = !this.isHorizontal;
        this.editList = [];
      }
    },
    // 纵向翻页
    onPageClick(page) {
      const gridData = this.gridDataList[this.tapIndex];
      if (this.sureFlag) {
        fish.confirm(this.$t('HAS_DATA_SAVED'), () => {
          this.clickFlag = false;
          this.sureFlag = false; // 取消保存，恢复数据
          gridData.vGridDataIndex = page - 1;
          this.editList = [];
        });
      } else {
        gridData.vGridDataIndex = page - 1;
        this.editList = [];
      }
    },
    // 监听弹窗resize事件
    resize() {
      if (this.isHorizontal) {
        this.$refs.horizontalGridPropertyRef[0].resize();
      } else {
        this.$refs.verticalGridPropertyRef[0].resize();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './property.scss';
</style>
