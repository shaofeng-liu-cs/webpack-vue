<template>
  <div class="projectManageBox">
    <div class="headFilter">
      <span class="searchItem ">
        <span class="itemContent">
          <span class="searchLabel">{{ $t('E_PROJECTDETAIL_NAME') }}</span>
          <span class="searchInput">
            <Search v-model="searchParams.projectName"></Search>
          </span>
        </span>
      </span>
      <el-button class="m-l" @click="handleAdvFilter">
        {{ $t('MAP_TOOLBAR_CONFIG_ADVANCED_SEARCH') }}
        <i :class="`icon_osp ${advFilterShow ? 'icon_ospup' : 'icon_ospdown'}`"></i>
      </el-button>
      <el-button type="primary" class="m-l" @click="refreshList">
        {{ $t('SEARCH') }}
      </el-button>
      <el-button type="primary" class="m-l" @click="handleSelectModal">
        {{ $t('E_PROJECTDETAIL_NEW_PROJECT') }}
      </el-button>
    </div>
    <div class="advancedSearchContent" v-if="advFilterShow">
      <div class="searchContent">
        <span class="searchItem">
          <span class="itemContent">
            <span class="searchLabel">{{ $t('E_PROJECTDETAIL_TYPE') }}</span>
            <span class="searchInput2">
              <el-select v-model="searchParams.operationType" :placeholder="$t('PLEASE_SELECT')" clearable>
                <el-option v-for="item in proTypeSettingData" :key="item.code" :label="item.name" :value="item.code"> </el-option>
              </el-select>
            </span>
          </span>
        </span>
        <span class="searchItem">
          <span class="itemContent">
            <span class="searchLabel">{{ $t('PROJECT_STATE') }}</span>
            <span class="searchInput2">
              <el-select v-model="searchParams.projectState" :placeholder="$t('PLEASE_SELECT')" clearable>
                <el-option v-for="item in stateSettingData" :key="item.code" :label="item.name" :value="item.code"> </el-option>
              </el-select>
            </span>
          </span>
        </span>
        <span class="searchItem m-l">
          <span class="itemContent">
            <span class="searchLabel">{{ $t('PROJECT_DESIGN_STATE') }}</span>
            <span class="searchInput2">
              <el-select v-model="searchParams.designState" :placeholder="$t('PLEASE_SELECT')" clearable>
                <el-option v-for="item in prostateSettingData" :key="item.code" :label="item.name" :value="item.code"> </el-option>
              </el-select>
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="projectList" v-infinite-scroll="loadProject" ref="projectListBox" :infinite-scroll-distance="50">
      <span class="projectItem" v-for="(item, index) in projectList" :key="index" :class="{ isHide: item.hide }" @click="handleEditModal(item)">
        <span class="project-item-img">
          <img
            class="backimg"
            :src="item.thumbnailPath ? `opb/file/download?fileName=${item.thumbnailPath}` : 'oss_core/edesign/assets/image/project_def_img.png'"
            onerror="javascript:this.src='oss_core/edesign/assets/image/project_def_img.png';"
          />
          <span class="projectItemContent">
            <div class="itContentTitle">
              <span class="leftTitle">
                <img :src="item.icon" style="width:20px;margin-right:5px;" />

                <el-tooltip class="item" effect="light" :content="item.projectName" placement="bottom-start">
                  <span class="proTitle">
                    {{ item.projectName }}
                  </span>
                </el-tooltip>
              </span>
              <span class="itConentOptions">
                <i class="el-icon-data-line" style="font-size: 16px;margin-right:5px;" @click.stop="openBoard(item)"></i>
                <i class="icon_osp icon_ospshanchu1" @click.stop="deleteProject(item)"></i>
              </span>
            </div>
            <div class="footer-desc">
              <span class="desc-label">
                <span>{{ $t('PROJECT_COVER_HPS') }}：{{ item.extCoverHps }}</span>
                <span>({{ item.extHpRedundancyRatio }})</span>
              </span>
              <span class="region"> <i class="icon_osp icon_osplocate"></i> {{ item.regionName }}</span>
            </div>
          </span>
        </span>
      </span>
    </div>
    <!-- <div class="paginationBox">
      <Pagination :pageSize="pageSize" :total="totalCount" :pgTotal="false" :pageSizes="[]" :pgRecText="false" :pageNo="currentPage" @page-change="onPageClick"></Pagination>
    </div> -->
    <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="handleEditModal">
      <template v-slot:popupBody>
        <div class="selectProcessTemplateBox">
          <span
            v-for="item in flowList"
            :key="item.flowId"
            class="templateItem"
            :class="{ active: selectTemplate === item.flowId, disabled: item.flowId === 'F0000001' }"
            @click="selectProTem(item.flowId)"
          >
            <div class="templateTitle">{{ item.flowName }}</div>
            <div class="templateDesc">{{ flowConfig[item.flowId] }}</div>
            <div class="templateImg">
              <img :src="item.iconPath" />
            </div>
          </span>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryProjectList, queryDictList, queryFlowList } from '@/oss_core/edesign/api/query/project.js';
import moment from 'moment';
import { deleteProject } from '@/oss_core/edesign/api/del/project.js';
export default {
  name: 'projectManage',
  components: {},
  data() {
    return {
      flowConfig: {
        F0000001: this.$t('PROJECT_SELECT_FLOW_001_DESC'),
        F0000002: this.$t('PROJECT_SELECT_FLOW_002_DESC'),
        F0000003: this.$t('PROJECT_SELECT_FLOW_003_DESC'),
      },
      searchParams: {
        projectName: '',
        operationType: '',
      },
      popupObj: {
        title: this.$t('PROJECT_SELECT_PROCESS_TEMPLATE'), // 弹框标题
        ok: this.$t('OK'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: false, // 是否蒙层
        width: '80%', // 宽
        height: '556px', // 高
        modal: true, // 是否蒙层
        show: false,
        drag: true, //是否拖拽
        zIndex: 10,
        body: true,
      },
      projectList: [],
      flowList: [],
      totalCount: 0,
      pageSize: 20,
      currentPage: 0,
      advFilterShow: false,
      proTypeSettingData: [],
      stateSettingData: [
        { code: 'O', name: this.$t('OPEN') },
        { code: 'C', name: this.$t('CLOSED') },
      ],
      prostateSettingData: [
        { code: 'N', name: this.$t('PROJECT_NOT_STARTED') },
        { code: 'I', name: this.$t('PROJECT_DESIGNING') },
        { code: 'C', name: this.$t('PROJECT_COMLETION') },
      ],

      selectTemplate: '',
      // loading: false,
      noMore: false,
    };
  },

  create() {},

  mounted() {
    // const allHeight = document.querySelector('.projectList').clientHeight - 36;
    // let pageSize = Math.ceil(allHeight / 127);
    // this.pageSize = pageSize * 5;
    queryDictList('EDN.OPERATION.TYPE').then(res => {
      this.proTypeSettingData = res.resultList || [];
    });

    queryFlowList('OPT').then(res => {
      let flowList = res.resultList || [];
      let flow3 = this.flowList.findIndex(it => it.flowId === 'F0000003');
      let dh = (flowList.splice(flow3, 1) || [])[0];
      if (dh) {
        flowList.unshift(dh);
      }
      this.flowList = flowList;
      this.selectTemplate = (this.flowList[0] || {}).flowId;
    });
    // this.loadProjectList();
  },

  methods: {
    popupClose() {},
    handleSelectModal() {
      this.popupObj.show = true;
    },
    popupOk() {
      this.handleEditModal({
        flowId: this.selectTemplate,
      });
    },
    formatDate(val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss');
    },
    selectProTem(val) {
      if (val === 'F0000001') {
        return;
      }
      this.selectTemplate = val;
    },
    resetSearch() {
      this.searchParams.projectName = '';
    },
    handleEditModal(data) {
      let menuId = 'ProjectWizard';
      let mentTitle = data ? data.projectName : this.$t('PROJECT_WIZARD');
      let projectId = data ? data.projectId : '';
      let params = {
        choose: menuId,
        data: {
          projectId,
          flowId: this.selectTemplate || '',
        },
        isSingleMenu: true,
      };
      this.$root.$emit('openMenu', menuId, mentTitle, params);
    },
    openBoard(data) {
      let menuId = 'ProjectBulletinBoard';
      let mentTitle = data ? data.projectName : this.$t('PROJECT_WIZARD');
      let projectId = data ? data.projectId : '';
      let params = {
        choose: menuId,
        data: {
          projectId,
        },
        isSingleMenu: true,
      };
      this.$root.$emit('openMenu', menuId, mentTitle, params);
    },
    handleAdvFilter() {
      this.advFilterShow = !this.advFilterShow;
    },
    deleteProject(val) {
      this.$confirm(this.$t('PROJECT_DEL_PROJECT_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      })
        .then(() => {
          deleteProject({
            PROJECT_ID: val.projectId,
          }).then(res => {
            if (res.success) {
              this.$message({
                message: this.$t('DELETE_SUCCESS'),
                type: 'success',
              });
              this.refreshList();
            } else {
              this.$message({
                message: this.$t('AJAX_ERROR'),
                type: 'error',
              });
            }
          });
        })
        .catch(() => {
          console.log('关闭');
        });
    },

    loadProject() {
      if (this.loading) {
        return;
      }
      this.currentPage = this.currentPage + 1;
      this.loadProjectList();
    },
    refreshList() {
      const scrollDom = this.$refs.projectListBox;
      scrollDom.scrollTop = 0;
      this.currentPage = 1;
      this.loadProjectList();
    },
    loadProjectList() {
      this.loading = true;
      queryProjectList({ ...this.searchParams, pageIndex: this.currentPage, pageSize: this.pageSize }).then(data => {
        this.loading = false;
        let proList = (data.resultList || []).map(it => {
          const projectExtInfoList = it.projectExtInfoList || [];
          const extHpRedundancyRatio = projectExtInfoList.find(item => item.attrCode === 'extHpRedundancyRatio') || {};
          const extCoverHps = projectExtInfoList.find(item => item.attrCode === 'extCoverHps') || {};
          return {
            ...it,
            extHpRedundancyRatio: extHpRedundancyRatio.attrValue ? `${extHpRedundancyRatio.attrValue}%` : '-',
            extCoverHps: extCoverHps.attrValue || '-',
          };
        });

        this.projectList = this.currentPage === 1 ? proList : [...this.projectList, ...proList];
        this.totalCount = data.total || 0;
        this.noMore = this.projectList.length >= parseInt(this.totalCount, 10);
        const length = 5 - (this.projectList.length % 5);
        if (length > 0 && length < 5) {
          for (let i = 0; i < length; i++) {
            this.projectList.push({
              hide: true,
            });
          }
        }
      });
    },
    onPageClick(page) {
      this.currentPage = page;
      this.loadProjectList();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './projectManage.scss';
</style>
