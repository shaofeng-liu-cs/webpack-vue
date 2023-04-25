<template>
  <Popup :popupObj="popupBook" @popupOther='popupOther' @popupOk="popupOk" @popupClose="popupClose">
    <template v-slot:popupBody>
      <Grid :data='bookData' :option="gridOpt" ref="gridBook" id="gridBoodID" @onDblClickRow="dbClick">
        <grid-column label="" prop="bookmarkId" :hidden="hide"></grid-column>
        <grid-column label="" prop="yMin" :hidden="hide"></grid-column>
        <grid-column label="" prop="yMax" :hidden="hide"></grid-column>
        <grid-column label="" prop="xMin" :hidden="hide"></grid-column>
        <grid-column label="" prop="xMax" :hidden="hide"></grid-column>
        <grid-column :label="$t('OSP_MAP_SEARCHBAR_COLOUMN_NAME')" prop="bookmarkName" :editable="hide"></grid-column>
        <grid-column :label="$t('OSP_MAP_SEARCHBAR_CREATE_TIME')" prop="createDate"></grid-column>
        <grid-column label="">
          <template slot-scope="{ row }">
            <div class="col-md-12">
              <div class="col-md-5"></div>
              <button type="button" class="btn-link glyphicon glyphicon-map-marker" @click="locate(row)"></button>
              <button type="button" class="btn-link icon_osp icon_ospshanchu" :title="$t('DELETE')" @click="deleteBookMark(row)"></button>
            </div>
          </template>
        </grid-column>
      </Grid>
    </template>
  </Popup>
</template>

<script>
export default {
  name: 'BookMark',
  inject: ['getMapBox'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
  },
  data() {
    return {
      hide: true,
      popupBook: {
        title: this.$t('OSP_MAP_TOOLS_BOOKMARK_TITLE'), // 弹框标题
        other: this.$t('OSP_MAP_TOOLS_BOOKMARK_ADD_VIEW'),
        ok: this.$t('SAVE'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: false, // 是否蒙层
        width: '400px', // 宽
        height: 'auto', // 高
        left: '50%',
        top: '37px',
        show: false,
        drag: false,
        zIndex: 3,
      },
      gridOpt: {
        height: 'calc(100vh - 430px)',
        columnMenu: false,
        cached: true,
        pager: false,
        cellEdit: true,
        sortname: 'createDate',
      },
      bookData: [],
    };
  },
  mounted() {},
  created() {},
  methods: {
    loadBookGrid(param) {
      let url = 'edesign/bookmark/list/v1';
      if (this.getProjectInfo().sprintId === this.getProjectInfo().schemaId) {
        // 表示为sprint单
        url = url + `?sprintId=${this.getProjectInfo().sprintId}`;
      } else {
        url = url + `?schemaId=${this.getProjectInfo().schemaId}`;
      }
      fish.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: data => {
          if (data && data.resultList && data.resultList.length !== 0) {
            this.bookData = data.resultList;
          } else {
            this.bookData = [];
          }
        },
      });
    },

    bookAction(param) {
      if (this.getProjectInfo().sprintId === this.getProjectInfo().schemaId) {
        // 表示为sprint单
        param.sprintId = this.getProjectInfo().sprintId;
      } else {
        param.schemaId = this.getProjectInfo().schemaId;
      }
      fish.ajax({
        url: 'edesign/bookmark/list/v1',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(param),
        async: false,
        success: data => {
          fish.success(this.$t('OSP_MAP_TOOLS_BOOKMARK_SUCCESS'));
          this.loadBookGrid();
        },
      });
    },
    locate(row) {
      let minExtend = this.mapBox.createPoint(Number(row.xMin), Number(row.yMin));
      let maxExtend = this.mapBox.createPoint(Number(row.xMax), Number(row.yMax));
      this.mapBox.setExtend(minExtend, maxExtend);
    },

    dbClick(row, index) {
      if (row) {
        this.locate(row);
      }
    },
    deleteBookMark(row) {
      fish.confirm(this.$t('OSP_MAP_TOOLS_BOOKMARK_SURE_DELETE'), () => {
        let param = {};
        param.bookmarkList = $('#gridBoodID').grid('getRowData');
        param.bookmarkList = param.bookmarkList.filter(book => {
          return !(book.bookmarkId === row.bookmarkId);
        });
        param.bookmarkList.forEach(list => {
          delete list.bookmarkId;
        });

        this.bookAction(param);
      });
    },
    popupOther() {
      let myDate = new Date();
      let extend = this.mapBox.getCurrentExtend();
      console.log(extend);
      this.bookData.push({
        bookmarkId: fish.getUUID(),
        bookmarkName: this.$t('OSP_MAP_SEARCHBAR_BOOKMARK_NAME'),
        createDate:
          myDate.getFullYear().toString() +
          '-' +
          (myDate.getMonth() + 1).toString() +
          '-' +
          myDate.getDate().toString() +
          ' ' +
          myDate.getHours().toString() +
          ':' +
          myDate.getMinutes().toString() +
          ':' +
          myDate.getSeconds().toString(),
        xMin: extend.xmin,
        xMax: extend.xmax,
        yMin: extend.ymin,
        yMax: extend.ymax,
        //mapNo:this.getProjectInfo().mapNo,
        isValid: 'Y',
      });
    },

    popupOk() {
      let param = {};

      param.bookmarkList = $('#gridBoodID').grid('getRowData'); // $(this.$refs.gridBook).grid("getRowData")会报错
      param.bookmarkList.forEach(list => {
        if (this.getProjectInfo().sprintId === this.getProjectInfo().schemaId) {
          // 表示为sprint单
          list.sprintId = this.getProjectInfo().sprintId;
        } else {
          list.schemaId = this.getProjectInfo().schemaId;
          list.sprintId = this.getProjectInfo().sprintId;
        }
        delete list.bookmarkId;
      });
      this.bookAction(param);
    },

    popupClose() {
      this.bookData = [];
    },
  },
  watch: {
    'popupBook.show': {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.$emit('showChange', val);
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.glyphicon {
  display: contents !important;
}
</style>