<template>
  <Popup :popupObj="popupBom" @popupClose="popupClose" @popupOk="popupOk" :downData="downData" :downCol="downCol" :fileName="fileName">
    <template v-slot:popupBody>
      <div class="bom">
        <div class="left">
          <Tree :fNodes="fNodes" :data="dataIcon" :view="view" ref="tree" @onClick="onClick"></Tree>
        </div>
        <div class="right">
          <div class="new-title title">
            <label class="col-md-9 control-label title-content">{{$t('NEW')}}</label>
            <label class="col-md-3 control-label title-price">{{$t('DESIGN_EXPORT_BOM_TOTAL_PRICE')}}({{priceUnit}}): <i class="total" ref="total">{{newTotalPrice}}</i></label>
            <!-- <div class="col-md-1 btn btn-link icon_osp showFlag-class" :class="newGridShowFlag ? 'icon_ospdown' : 'icon_ospup'" @click="showNewGrid"></div> -->
          </div>
          <div class="new-grid">
            <Grid :data="newGridData" :option="newGridOption" ref="gridRefNew" id="newGrid">
              <grid-column :label="$t('DESIGN_EXPORT_BOM_RESOURCE_SPE')" prop="resSpecName" width="240px"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_TEMPLATE')" prop="templateName"></grid-column>
              <grid-column :label="$t('MODEL')" prop="modelName"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_QUANTITY')" prop="cn"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_LENGTH')" prop="gridLength"></grid-column>
              <grid-column :label="priceUnitLabel" prop="totalPrice"></grid-column>
            </Grid>
          </div>
          <div class="old-title title">
            <label class="col-md-9 control-label title-content">{{$t('DESIGN_EXPORT_BOM_OLD')}}</label>
            <label class="col-md-2 control-label title-price">{{$t('DESIGN_EXPORT_BOM_TOTAL_PRICE')}}({{priceUnit}}): <i class="total" ref="total">{{oldTotalPrice}}</i></label>
            <div class="col-md-1 btn btn-link icon_osp showFlag-class" :class="oldGridShowFlag ? 'icon_ospdown' : 'icon_ospup'" @click="showOldGrid"></div>
          </div>
          <div class="old-grid" v-if="oldGridShowFlag">
            <Grid :data="oldGridData" :option="oldGridOption" ref="gridRefNew" id="oldGrid">
              <grid-column :label="$t('DESIGN_EXPORT_BOM_RESOURCE_SPE')" prop="resSpecName" width="240px"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_TEMPLATE')" prop="templateName"></grid-column>
              <grid-column :label="$t('MODEL')" prop="modelName"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_QUANTITY')" prop="cn"></grid-column>
              <grid-column :label="$t('DESIGN_EXPORT_BOM_LENGTH')" prop="gridLength"></grid-column>
              <grid-column :label="priceUnitLabel" prop="totalPrice"></grid-column>
            </Grid>
          </div>

          <!-- <div class="allPrice">
                        <label class="control-label">Total Price: <i class="total" ref="total">{{oldTotalPrice}}</i>￥</label>
                    </div> -->
        </div>
      </div>
    </template>
  </Popup>
</template>

<script>
import { getConfigExtend, queryBomInfoBySchemaId, queryBomTypeBySchemaId } from '../../../../api/query/schema';
// import Blob from '../export-config/Blob';
// import Export2Excel from '../export-config/Export2Excel';

export default {
  name: 'Bom',
  inject: {
    getProjectInfo: {
      default: () => {}, // 工程详情
    },
    getHldEl: {
      default: () => {},
    },
  },
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },

    hldEl() {
      return this.getHldEl();
    },
  },
  props: {
    // gridSelectedData:{
    //     type: Object,
    // },
    // gridFlag:{
    //     type: String,
    // },
    // appendEl: {},
  },
  data() {
    return {
      oldGridShowFlag: false,
      priceUnit: '$', //￥
      priceUnitLabel: this.$t('DESIGN_EXPORT_BOM_PRICE'),
      popupBom: {
        title: 'BOM', // 弹框标题
        ok: this.$t('EXPORT'), // 确认按钮内容
        close: this.$t('CLOSE'), // 取消按钮内容
        modal: true, // 是否蒙层
        width: '75%', // 宽
        height: '540px', // 高
        //left: '30%',
        //top:'20%',
        show: false,
        drag: true,
        resize: 'both',
        zIndex: 3,
        isDownload: true,
      },

      fNodes: [],
      dataIcon: {
        key: {
          iconFontEnable: false,
        },
        simpleData: {
          enable: true,
        },
      },
      view: {
        showIcon: this.showIconForTree,
        showLine: true,
      },
      newGridData: [],
      _newGridData: [],
      oldGridData: [],
      newGridOption: {
        height: '170px',
      },
      oldGridOption: {
        height: '120px',
      },

      oldTotalPrice: 0,
      newTotalPrice: 0,
      seq: 0,
      fileName: 'BOM_',
      downCol: {
        'Resource Specification': 'resSpecName',
        Template: 'templateName',
        Model: 'modelName',
        Quantity: 'cn',
        'Length(m)': 'gridLength',
      },
      downData: [],
    };
  },
  created() {
    this.oldTotalPrice = this.oldTotalPrice.toFixed(2);
    getConfigExtend().then(result => {
      if (result && result.priceUnit) {
        this.priceUnit = result.priceUnit;
        this.priceUnitLabel = this.$t('DESIGN_EXPORT_BOM_PRICE_1') + `(${result.priceUnit})`;
      }
    });
    if (this.hldEl) {
      this.popupBom.el = this.hldEl;
    }
  },
  mounted() {
    this.downCol[this.priceUnitLabel] = this.$t('DESIGN_EXPORT_BOM_TOTALPRICE');
    this.fileName = 'BOM_' + this.projectInfo.taskName + '.xls';
  },

  methods: {
    initData() {
      this.popupBom.show = true;
      this.oldGridShowFlag = false;
      queryBomTypeBySchemaId({ schemaId: this.projectInfo.schemaId }, bomTypes => {
        if (bomTypes && bomTypes.resultList) {
          this.groupData(bomTypes.resultList);
        }
      });
      queryBomInfoBySchemaId({ schemaId: this.projectInfo.schemaId }, bomInfo => {
        if (bomInfo && bomInfo.resultList && bomInfo.resultList.length > 0) {
          let newData = bomInfo.resultList.filter(res => res.usedFlag === 'NEW');
          if (newData && newData.length > 0) {
            newData.forEach(res => {
              res.gridLength = res.length;
              if (res.price && res.cn) {
                res.totalPrice = (Number(res.price) * Number(res.cn)).toFixed(2);
              }
            });
            this._newGridData = JSON.parse(JSON.stringify(newData));
            this.newGridData = JSON.parse(JSON.stringify(newData));
            this.caculateTotal();
            this.downData = JSON.parse(JSON.stringify(newData));
          }
        }
      });
    },

    groupData(typeList) {
      if (typeList && typeList.length > 0) {
        let parentList = [];
        let parentCodes = [];
        typeList.forEach(all => {
          if (parentCodes.indexOf(all.parentCatCode) === -1) {
            parentCodes.push(all.parentCatCode);
            parentList.push({
              name: all.parentCatName,
              code: all.parentCatCode,
              seq: all.parentSeq,
              isParent: true,
              open: true,
              children: [],
            });
          }
        });
        parentList.forEach(parent => {
          typeList.forEach(all => {
            if (parent.code === all.parentCatCode) {
              parent.children.push({
                name: all.name,
                code: all.resType,
                isParent: false,
                icon: `oss_core/edesign/assets/image/map/layer/${all.resType}.png`,
              });
            }
          });
        });
        parentList = parentList.filter(res => res.children.length > 0).sort((x, y) => x.seq - y.seq);
        this.fNodes = [{ name: 'BOM', code: 'BOM', isParent: true, children: parentList, open: true }];
      }
    },

    showOldGrid() {
      this.oldGridShowFlag = !this.oldGridShowFlag;
    },

    onClick(node) {
      let nodeCode = node[0].code;
      if (nodeCode === 'BOM') {
        this.newGridData = JSON.parse(JSON.stringify(this._newGridData));
      } else if (node[0].children) {
        let codes = node[0].children.map(res => res.code);
        this.newGridData = this._newGridData.filter(res => codes.indexOf(res.resSpecId) > -1) || [];
      } else {
        this.newGridData = this._newGridData.filter(res => res.resSpecId === nodeCode) || [];
      }
      this.caculateTotal();
    },

    caculateTotal() {
      let total = 0;
      if (this.newGridData && this.newGridData.length > 0) {
        this.newGridData.forEach(res => {
          let price = res.totalPrice ? res.totalPrice : 0;
          total += Number(price);
        });
      }
      this.newTotalPrice = total.toFixed(2);
    },

    showIconForTree(treeNode) {
      return !treeNode.isParent;
    },

    popupClose() {
      this.popupBom.show = false;
      this.$emit('popupClose');
    },

    popupOk() {
      // const data = JSON.parse(JSON.stringify(this._newGridData)); // res为表格内容数据源
      // const a = document.createElement("a");
      // const blob = new Blob([data]);
      // const blobUrl = window.URL.createObjectURL(blob);
      // a.style.display = 'none';
      // a.download = '下载文件名称';
      // a.href = blobUrl;
      // a.click();
      // require.ensure([], () => {
      //     const { export_json_to_excel } = require('../export-config/Export2Excel.js');
      //     const tHeader = ['Resource Specification', 'Template', 'Model', 'Quantity', 'Length(m)', this.priceUnitLabel];
      //     // 上面设置Excel的表格第一行的标题
      //     const filterVal = ['resSpecId', 'templateName', 'modelName', 'cn', 'gridLength', 'totalPrice'];
      //     const list = JSON.parse(JSON.stringify(this._newGridData));  //把data里的tableData存到list
      //     const data = this.formatJson(filterVal, list);
      //     export_json_to_excel(tHeader, data, 'BOM_' + this.projectInfo.name);
      // })
      // this.popupBom.show = false;
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
    },
    exportA(fileName, grid) {
      let newData = JSON.parse(JSON.stringify(this._newGridData));
      let time = new Date();
      let y = time.getFullYear();
      let m = time.getMonth() + 1;
      let d = time.getDate();
      let h = time.getHours();
      let mm = time.getMinutes();
      let date = y + this.add0(m) + this.add0(d) + this.add0(h) + this.add0(mm);

      fileName = '' + this.projectInfo.taskName + '_' + '_BOM_' + date + '_' + this.add0(this.seq, 'S');

      this.downloadExl(newData, 'New', fileName + '.xlsx', '');
      this.seq++;
    },

    add0(m, flag) {
      if (flag) {
        if (m < 10) {
          return '00' + m;
        } else {
          return m < 100 ? '0' + m : m;
        }
      }
      return m < 10 ? '0' + m : m;
    },
    /**
     * 导出列表方法
     * @param {*} data  需要导出的数据  数组形式  [[表头]，[数据1]，[数据2]...]
     * @param {*} fileName 下载的文件名称
     * @param {*} titleName 表格标题
     * @param {*} type
     */
    downloadExl(datas, fileName, titleName, type) {
      let exportDatas = [];
      datas.forEach(data => {
        let exportData = {};

        this.colModel.forEach(col => {
          exportData[col.label] = data[col.name];
        });

        exportDatas.push(exportData);
      });

      let sheetName = fileName;
      let sheet = Xlsx.utils.json_to_sheet(exportDatas);
      let workbook = {
        SheetNames: [sheetName],
        Sheets: {
          [sheetName]: sheet,
        },
      };
      XlsxExport.openDownloadDialog(XlsxExport.sheet2blob(workbook), titleName);
    },

    /**
     * 导出列表方法   数据转换
     * @param {*} s
     */
    s2ab(s) {
      if (typeof ArrayBuffer !== 'undefined') {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      } else {
        let buf = new Array(s.length);
        for (let i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff;
        return buf;
      }
    },

    /**
     * 导出列表方法，下载文件
     */
    saveAs(obj, fileName) {
      let tmpa = document.createElement('a');
      tmpa.download = fileName || '下载';
      tmpa.href = URL.createObjectURL(obj); //绑定a标签
      tmpa.click(); //模拟点击实现下载
      setTimeout(function () {
        //延时释放
        URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
      }, 100);
    },
  },
};
</script>

<style lang="scss" scoped>
@import './Bom.scss';
</style>