<template>
    <div>
        <Popup :popupObj="resourcesPop" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
            <template v-slot:popupBody>
                <div class="resources-grid grid-height-auto">
                    <Grid :data="showGridData" @onDblClickRow="onDblClickRow">
                        <grid-column label="Sync Status" prop="SyncStatus" width="100px">
                            <template slot-scope="{ row }">
                                <div v-if="row.syncStatue === 'Y'" class="icon_osp icon_ospcheck-circle1" :title="$t('SUCCESS')"></div>
                                <div v-else-if="row.syncStatue === 'N'" class="icon_osp icon_ospreloadtime" :title="$t('AWAIT')"></div>
                            </template>
                        </grid-column>
                        <grid-column label="Resource Type" prop="resSpecDesc" width="140px"></grid-column>
                        <grid-column label="Name" prop="name" width="280px"></grid-column>
                        <grid-column label="Full Name" prop="fullName" width="280px"></grid-column>
                    </Grid>
                </div>
            </template>
        </Popup>
        <ResInfo ref="resInfo"></ResInfo>
    </div>
</template>

<script>
import { queryTaskRes } from '@/oss_core/edesign/api/query/taskId.js';
import ResInfo from './resInfo/ResInfo.vue';

export default {
  name: 'Resources',
  components: {
    ResInfo,
  },
  data() {
    return {
      resourcesPop: {
        title: this.$t('RESOURCES_LIST'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CLOSE'), // 取消按钮
        width: '800', // 宽
        height: '600', // 高
        modal: false, //是否遮罩
        show: false, //是否展示
        el: '.map-example',
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
      showGridData: [],
    };
  },
  created() {},
  mounted() {},
  methods: {
    init(orderId) {
      queryTaskRes(orderId).then(data => {
        console.log(data);
        this.showGridData = data || [];
        this.resourcesPop.show = true;
      });
    },
    popupClose() {
      this.resourcesPop.show = false;
    },
    popupOk() {
      this.resourcesPop.show = false;
    },
    //表格双击事件
    onDblClickRow(row) {
      console.log(row);
      this.$refs.resInfo.initShow(row);
    },
  },
  destroyed() {
    console.log(2222);
    // this.resourcesPop.show = false;
  },
};
</script>

<style lang="scss" scoped>
@import './Resources.scss';
</style>