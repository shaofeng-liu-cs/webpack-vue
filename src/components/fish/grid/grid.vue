<template>
  <div ref="grid" class="grid-width-auto grid-height-auto" :class="{'no-data-grid': data.length === 0}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Grid',

  componentName: 'Grid',

  provide() {
    return {
      insertColumn: this.insertColumn,
    };
  },

  props: {
    data: {
      type: Array,
    },
    option: {
      type: Object,
      default: () => ({
        height: '100%',
        shrinkToFit: false, // 表格列宽是否按比例缩放
        columnResizable: false, // 是否支持列头拖拽调整大小，默认是支持; 如果设置为false，则所有列都不支持拖拽 ...
        slimscrollOptions: {
          alwaysVisible: false, // 滚动轴是否一直显示
          axis: 'both', // 滚动轴类型。x:只有横向滚动轴，y:只有纵向滚动轴，both:两者都有 ...
        }, // 表格滚动条的选项参数
      }),
    },
    edits: {
      type: Array,
      default: () => [],
    },
    selection: {
      type: Array,
      default: () => [],
    },
    gridKey: {
      type: String,
      default: 'id',
    },
    gridData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    editsCopy() {
      return JSON.parse(JSON.stringify(this.edits));
    },
    callback() {
      let _this = this;
      return {
        create: () => {
          //控件初始化完成触发的事件
          this.$emit('create');
        },
        gridComplete: e => {
          //数据加载完成触发的事件
          this.$emit('gridComplete', e);
        },
        afterInsertRow: (e, rowid, data) => {
          //数据每加载一行触发的事件,需要设置gridview参数false,一般在自定义行格式或者单元格的时候使用
          this.$emit('afterInsertRow', data);
        },
        onSelectRow: (e, rowid, state, checked) => {
          if (this.isCheck) {
            this.isCheck = false;
            return;
          }
          //选中行事件
          let index = this.grid.grid('getInd', rowid);
          let row = this.grid.grid('getRowData', rowid);
          _this.$emit('onSelectRow', row, index, rowid);
        },
        onChangeRow: (e, rowid, oldrowid) => {
          //选中行改变事件
          let oldRow = this.grid.grid('getRowData', oldrowid);
          let row = this.grid.grid('getRowData', rowid);
          this.$emit('onChangeRow', row, oldRow);
        },
        beforeSelectRow: (e, rowid) => {
          let row = this.grid.grid('getRowData', rowid);
          //选中行之前事件,返回false则不会选中记录
          this.$emit('beforeSelectRow', row);
        },
        beforeEditRow: (e, rowid, rowData) => {
          let row = this.grid.grid('getRowData', rowid);
          //编辑行之前事件,返回false则不会编辑
          this.$emit('beforeEditRow', row, rowid);
        },
        onDblClickRow: (e, rowid, iRow, iCol) => {
          let index = this.grid.grid('getInd', rowid);
          let row = this.grid.grid('getRowData', rowid);
          //双击行事件
          this.$emit('onDblClickRow', row, index);
        },
        onRightClickRow: (e, rowid, iRow, iCol) => {
          //右击行事件
          let index = this.grid.grid('getInd', rowid);
          let row = this.grid.grid('getRowData', rowid);
          this.$emit('onRightClickRow', row, index);
        },
        onSelectAll: (e, status) => {
          //点击头部的checkbox时触发的事件
          this.toggleAllSelection(status);
        },
        onCheckRow: (e, rowid, checked) => {
          let rowData = this.grid.grid('getRowData', rowid);
          this.toggleRowSelection(rowData, checked);
          this.isCheck = true;
        },
        onPaging: (e, onpaging) => {
          //点击分页按钮触发的事件.参数对应first,prev,next,last,user(直接输入页码的情况); 返回false中断排序
          this.$emit('onPaging', e, onpaging);
        },
        afterSaveCell: (e, rowid, colName, cellcontext, iRow, iCol) => {
          let index = this.grid.grid('getInd', rowid);
          let row = this.grid.grid('getRowData', rowid);
          let allData = this.grid.grid('getRowData');
          _this.$emit('afterSave', row, index, allData, colName, rowid);
        },
        afterSaveRow: (e, rowid, rowData) => {
          let row = this.grid.grid('getRowData', rowid);
          let allData = this.grid.grid('getRowData');
          this.$emit('afterSaveRow', row, rowid, allData);
        },
        //allRowData为包含所有编辑行行数据的一个数组
        afterSaveAllRow: (e, allRowData) => {
          this.$emit('afterSaveAllRow', allRowData);
        },
      };
    },
  },
  data() {
    return {
      row: {},
      cols: [],
      isCheck: false,
    };
  },
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let opt = Object.assign(
        {},
        {
          data: this.data,
          colModel: this.cols,
        },
        this.callback,
        this.option
      );
      this.grid = $(this.$refs.grid).grid(opt);
      this.selection.length = 0;
      $(this.$el).on('mouseenter', '.jqgrow', e => {
        let rowid = e.currentTarget.attributes.id.value;
        let row = this.grid.grid('getRowData', rowid);
        this.$emit('mouseEnterGrid', row);
      });
      $(this.$el).on('mouseleave', '.jqgrow', e => {
        let rowid = e.currentTarget.attributes.id.value;
        let row = this.grid.grid('getRowData', rowid);
        this.$emit('mouseLeaveGrid', row);
      });
      let ts = $(this.$refs.grid).grid('instance');
      //超出1000个全选反应很慢，所以重新定义了下
      $(this.$el).off('click', '#cb_' + ts.p.id);
      $(this.$el).on('click', '#cb_' + ts.p.id, e => {
        let checked = e.target.checked;
        this.myCheckAllHandle(checked);
      });
    },
    myCheckAllHandle: function (checked) {
      // 重写grid全选方法
      let ts = $(this.$refs.grid).grid('instance');
      if (!ts.p.preserveSelection) {
        ts.p.selarrrow = [];
      }
      var froz = ts.p.frozenColumns === true ? ts.p.id + '_frozen' : '';
      // $(this.$el).find('#cb_ui-id-1');
      $(this.$el)
        .find('#cb_' + ts.p.id)
        .prop('checked', checked);
      // this.$('.batchDel-check-all').prop('checked', e.target.checked);
      if (checked) {
        $(ts.rows).each(function (i) {
          if (i > 0) {
            //第一行是jqfirstrow
            $('#jqg_' + ts.p.id + '_' + this.id, ts.grid.fbDiv).prop('checked', true);
            var $cbox = $(document.getElementById('jqg_' + ts.p.id + '_' + this.id));
            if (!$cbox.prop('disabled')) {
              $cbox.prop('checked', true);
              ts.p.selarrrow.push(this.id);
              //ts._addSelection(this.id);//数据很多的时候会卡(内部会检查校验数据，此处不需要)
              if (froz) {
                $('#jqg_' + ts.p.id + '_' + this.id, ts.grid.fbDiv).prop('checked', true);
              }
            } else {
              //$cbox.is(':checked') && ts.p.selarrrow.push(this.id);
              $cbox.is(':checked') && ts._addSelection(this.id);
            }
          }
        });
      } else {
        $(ts.rows).each(function (i) {
          if (i > 0) {
            var $cbox = $(document.getElementById('jqg_' + ts.p.id + '_' + this.id));
            if (!$cbox.prop('disabled')) {
              $cbox.prop('checked', false);
              if (ts.p.preserveSelection) ts._removeSelection(this.id);
              if (froz) {
                $('#jqg_' + ts.p.id + '_' + this.id, ts.grid.fbDiv).prop('checked', false);
              }
            } else {
              // $cbox.is(':checked') && ts.p.selarrrow.push(this.id);
              $cbox.is(':checked') && ts._addSelection(this.id);
            }
          }
        });
      }
      ts._trigger('onSelectAll', null, checked);
    },
    setData(data) {
      let rowIds = this.selection.map(row => row._id_);
      this.grid.grid('reloadData', data);
      if (rowIds.length > 0) {
        this.setCheckRows(rowIds, true);
      }
    },
    onClickRow() {},
    insertColumn(col) {
      this.cols.push(col);
    },
    handleEdits(edits, oldEdits) {
      let delList = oldEdits.filter(row => !edits.some(item => item._id_ === row._id_));
      let addList = edits.filter(row => !oldEdits.some(item => item._id_ === row._id_));
      delList.forEach(row => {
        this.grid.grid('restoreRow', row._id_);
      });
      addList.forEach(row => {
        if (row.rowid) {
          this.grid.grid('editRow', row.rowid, true);
        } else if (row._id_) {
          this.grid.grid('editRow', row._id_, true);
        }
      });
    },
    // setEdits(rowIds, type) {
    //   if (type === 'add') {
    //     rowIds.forEach(rowId => {
    //       this.grid.grid('editRow', rowId, true);
    //     });
    //   } else {
    //     rowIds.forEach(rowId => {
    //       this.grid.grid('restoreRow', rowId);
    //     });
    //   }
    // },
    saveAll(save) {
      this.grid.grid('setAllCheckRows', save);
    },
    saveAllRow() {
      this.grid.grid('saveAllRow');
    },
    getData() {
      return this.grid.grid('getRowData');
    },
    toggleRowStatus(statusArr, row, newVal) {
      // 当父节点的parent=null，将其去掉防止子节点渲染失败
      row.parent === null && delete row.parent;
      let changed = false;
      const index = statusArr.indexOf(row);
      const included = index !== -1;

      const addRow = () => {
        statusArr.push(row);
        changed = true;
      };
      const removeRow = () => {
        statusArr.splice(index, 1);
        changed = true;
      };

      if (typeof newVal === 'boolean') {
        if (newVal && !included) {
          addRow();
        } else if (!newVal && included) {
          removeRow();
        }
      } else {
        if (included) {
          removeRow();
        } else {
          addRow();
        }
      }
      return changed;
    },
    clearSelection() {
      this.isAllSelected = false;
      const oldSelection = this.selection;
      if (oldSelection.length) {
        this.$emit('update:selection', []);
        // this.$emit('selection-change', []);
      }
    },

    cleanSelection() {
      let data = this.grid.grid('getRowData');
      let deleted = this.selection.filter(item => data.indexOf(item) === -1);
      if (deleted.length) {
        const newSelection = this.selection.filter(item => deleted.indexOf(item) === -1);
        this.$emit('update:selection', newSelection);
        // this.$emit('selection-change', newSelection.slice());
      }
    },

    toggleRowSelection(row, selected, emitChange = true) {
      const changed = this.toggleRowStatus(this.selection, row, selected);
      if (changed) {
        const newSelection = (this.selection || []).slice();
        // 调用 API 修改选中值，不触发 select 事件
        if (emitChange) {
          this.$emit('select', newSelection, row, selected);
        }
        this.$emit('selection-change', newSelection);
      }
    },

    toggleAllSelection(value) {
      let data = this.grid.grid('getRowData');
      let selectionChanged = false;
      data.forEach((row, index) => {
        if (this.toggleRowStatus(this.selection, row, value)) {
          selectionChanged = true;
        }
      });

      if (selectionChanged) {
        this.$emit('selection-change', this.selection ? this.selection.slice() : []);
      }
      this.$emit('select-all', this.selection, value);
    },
    setCheckRows(rowIds, flag) {
      this.grid.grid('setCheckRows', rowIds, flag);
    },
    // 提供外部使用反选API
    toggleAllSelectionDom() {
      let data = this.grid.grid('getRowData');
      let isSelect = data.filter(row => !this.selection.some(item => item._id_ === row._id_));
      let selRowIdList = isSelect.map(sel => sel._id_);
      let noSelRowIdList = this.selection.map(sel => sel._id_);
      this.setCheckRows(selRowIdList, true);
      this.setCheckRows(noSelRowIdList, false);
      this.toggleAllSelection();
    },
    setOption(key, value) {
      this.grid.grid('option', key, value);
    },
    resize() {
      this.grid.grid('resize');
    },
  },
  watch: {
    data: {
      deep: true,
      handler(newVal, oldVal) {
        this.setData(newVal);
      },
    },
    editsCopy: {
      deep: true,
      handler(val, old) {
        this.handleEdits(val, old);
      },
    },
    // selection: {
    //   deep: true,
    //   handler(val, old) {
    //     console.log(val);
    //   },
    // },
  },
  destroyed() {
    this.grid.grid('destroy');
  },
};
</script>

<style lang="scss" scoped>
//v9表格高度自适应
.grid-height-auto {
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  /deep/ .ui-jqgrid-view {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    > .slimScrollDiv {
      display: flex;
      flex-flow: column;
      flex-grow: 1;
      > .ui-jqgrid-bdiv {
        display: flex;
        flex-flow: column;
        flex-grow: 1;
      }
    }
  }
}

//v9表格宽度自适应
.grid-width-auto {
  display: flex;
  width: 100%;
  /deep/ .ui-jqgrid-hbox {
    display: flex;
    > .ui-jqgrid-htable {
      flex-grow: 1;
    }
  }
  /deep/ .ui-jqgrid-bdiv > div {
    display: flex;
    // flex-flow: column;
    // justify-content: center;
    // align-items: center;
    > .ui-jqgrid-btable {
      flex-grow: 1;
      // width: 100%;
    }
  }
}
.no-data-grid {
  /deep/ .ui-jqgrid-bdiv > div {
    flex-flow: column;
    > .ui-jqgrid-tip {
      width: 100% !important;
    }
  }
}
// .no-data-grid /deep/ .ui-jqgrid-bdiv > div {
//   flex-flow: column;
// }
</style>