<template>
  <div class="newTaskList">
    <!-- <span class="taskTypeInfo">
      <div class="typeInfoItem">
        <span class="itemLabel">Pending</span>
        <span class="itemNum">30</span>
      </div>
      <div class="typeInfoItem">
        <span class="itemLabel">Processed</span>
        <span class="itemNum">30</span>
      </div>
    </span> -->
    <span v-if="!seelctTaskInfo" class="taskListBox">
      <div class="taskFilterBox">
        <span class="rigthSearch">
          <span class="searchBox" style="width:250px">
            <span class="searchLabel">{{$t('TASK_LIST_TASK_ID')}}</span>
            <span class="searchInput">
              <input v-model="searchParams.taskId" class="ptInput">
            </span>
          </span>
          <span class="radioSelect">
            <span class="radioItem" @click="searchParams.states='P'" :class="{active:searchParams.states==='P'}">
              {{$t('TASK_DESIGN_PENDING')}}({{proingNum}})
            </span>
            <span class="radioItem" @click="searchParams.states='C,F,X'" :class="{active:searchParams.states==='C,F,X'}">
              {{$t('TASK_DESIGN_PROCESSED')}}({{proedNum}})
            </span>
          </span>
          <button type="button" class="btn btn-default" style="margin-right:10px" @click="handleAdvFilter">
            {{$t('MAP_TOOLBAR_CONFIG_ADVANCED_SEARCH')}}
            <i :class="`icon_osp ${advFilter?'icon_ospup':'icon_ospdown'}`"></i>
          </button>
          <button type="button" class="btn btn-default" style="margin-right:10px" @click="resetSearch">
            {{$t('RESET')}}
          </button>
          <button type="button" class="btn btn-primary m-l" @click="loadTaskList">
            {{$t('SEARCH')}}
          </button>
        </span>
        <div class="advancedSearchContent" v-if="advFilter">
          <span class="searchBox" style="width:400px">
            <span class="searchLabel">{{$t('TASK_DESIGN_CREATION_DATE')}}</span>
            <span class="searchInput">
              <span style="position: relative;flex:1;">
                <DatetimePicker ref="startDate" v-model="searchParams.createDateStart" :options="opts" @changeDate="startDateChange" @clearDate="clearStartDate"></DatetimePicker>
              </span>
              <span style="margin:0 5px">-</span>
              <span style="position: relative;flex:1;">
                <DatetimePicker ref="endDate" v-model="searchParams.createDateEnd" :options="opts" @changeDate="endDateChange" @clearDate="clearEndDate"></DatetimePicker>
              </span>
            </span>
          </span>
          <span class="searchBox" style="width:140px">
            <span class="searchLabel">{{$t('TITLE')}}</span>
            <span class="searchInput">
              <input v-model="searchParams.taskTitle" class="ptInput">
            </span>
          </span>
          <span class="searchBox" style="width:200px">
            <span class="searchLabel">{{$t('E_MAINPAGEDESIGNER_TASK_TYPE')}}</span>
            <span class="searchInput">
              <Combobox class="form-control" name="PROJECT_TYPE" v-model="searchParams.taskType" :setting="taskTypeSetting"></Combobox>
            </span>
          </span>
        </div>
      </div>
      <div class="taskListTable" ref="taskListTable">
        <Grid :data="taskList" :option="gridOption" @onSelectRow="selectTaskRow" @create="gridcreate" id="gridIDDesigner" ref="gridTable">
          <grid-column :label="$t('TASK_LIST_TASK_ID')" prop="taskId" :keyFlag="true"></grid-column>
          <grid-column :label="$t('TITLE')" prop="title"></grid-column>
          <grid-column :label="$t('E_MAINPAGEDESIGNER_TASK_TYPE')" prop="taskTypeName"></grid-column>
          <grid-column :label="$t('E_MAINPAGEDESIGNER_ASSIGNEE')" prop="assignee"></grid-column>
          <grid-column :label="$t('E_MAINPAGEDESIGNER_BUE_DATE')" prop="dueDate"></grid-column>
          <grid-column :label="$t('PROJECT_STATE')" prop="stateDesc"></grid-column>
        </Grid>

      </div>
      <div class="paginationBox">
        <Pagination :pageSize="pageSize" :total="totalCount" :pgTotal="false" :pageSizes="[]" :pgRecText="false" :pageNo="currentPage" @page-change="onPageClick"></Pagination>
      </div>
    </span>
    <span v-else class="detailBox">
      <TaskDetail :taskInfo="seelctTaskInfo" @closeDetail="seelctTaskInfo=null"></TaskDetail>
    </span>
  </div>
</template>
<script>
import moment from 'moment';
import { queryTaskTypeList, queryTaskCounts, queryTaskList, getTaskDetail, queryTaskOrderInfo, queryTaskProjectInfo } from '../api/taskAction';
import TaskDetail from './TaskDetail.vue';
export default {
  name: 'newTaskList',
  props: {
    params: Object,
  },
  components: {
    TaskDetail,
  },
  data() {
    return {
      advFilter: false,
      opts: {
        format: 'yyyy-mm-dd',
        startDate: '1999-01-01',
        viewType: 'date',
      },
      searchParams: {
        states: 'P', //任务数量类型
        createDateStart: '',
        createDateEnd: '',
        taskId: '',
        taskTitle: '', //名称筛选
        taskType: '', //任务类型筛选
      },
      gridOption: {},
      totalCount: 0,
      pageSize: 20,
      currentPage: 1,
      taskList: [],
      seelctTaskInfo: null,
      proedNum: 0,
      proingNum: 0,
      taskTypeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'taskType',
        dataValueField: 'taskTypeName',
        dataSource: [],
      },
    };
  },

  create() {},

  mounted() {
    queryTaskTypeList().then(res => {
      this.taskTypeSetting.dataSource = res.resultList || [];
    });
    queryTaskCounts({
      states: 'P,C,F,H',
    }).then(res => {
      const resultData = res.resultData || {};
      this.proedNum = parseInt((resultData.countC || 0) + (resultData.countF || 0) + (resultData.countH || 0), 10);
      this.proingNum = resultData.countP || 0;
    });
  },

  methods: {
    clearStartDate() {
      // this.$refs.startDate.datePicker('setEndDate', '');
      this.searchParams.createDateStart = '';
      this.$refs.endDate.datePicker('setStartDate', '1999-01-01');
    },
    clearEndDate() {
      this.searchParams.createDateEnd = '';
      this.$refs.startDate.datePicker('setEndDate', '');
      // this.$refs.endDate.datePicker('setStartDate', '1999-01-01');
    },
    initDateSetting() {
      this.$refs.startDate && this.$refs.startDate.datePicker('setEndDate', '');
      this.$refs.endDate && this.$refs.endDate.datePicker('setStartDate', '1999-01-01');
    },
    endDateChange(e, val) {
      if (val && val.date) {
        const endDate = val.date.getTime();
        this.$refs.startDate.datePicker('setEndDate', moment(endDate).format('YYYY-MM-DD'));
      }
    },
    startDateChange(e, val) {
      console.log('startDateChange:', val, this.searchParams.createDateStart);
      if (val && val.date) {
        const startDate = val.date.getTime();
        this.$refs.endDate.datePicker('setStartDate', moment(startDate).format('YYYY-MM-DD'));
      }
    },
    handleAdvFilter() {
      this.advFilter = !this.advFilter;

      this.$nextTick(() => {
        const taskListTable = $(this.$refs.taskListTable);
        if (taskListTable[0]) {
          const dom = taskListTable[0];
          $(this.$refs.gridTable.$refs.grid).grid('setGridHeight', dom.clientHeight);
        }
      });
    },
    resetSearch() {
      this.searchParams = {
        states: 'P', //任务数量类型
        createDateStart: '',
        createDateEnd: '',
        taskId: '',
        taskTitle: '', //名称筛选
        taskType: '', //任务类型筛选
      };
      this.initDateSetting();
      this.$refs.startDate && this.$refs.startDate.datePicker('value', '');
      this.$refs.endDate && this.$refs.endDate.datePicker('value', '');

      this.loadTaskList();
    },
    gridcreate() {
      const allHeight = document.querySelector('#gridIDDesigner').clientHeight - 36;
      // let allHeight = this.$refs.gridRefDesigner.$el.querySelector('.slimScrollDiv').offsetHeight;
      let pageSize = parseInt(allHeight / 29, 10);
      this.pageSize = pageSize;
      this.loadTaskList();
    },
    selectTaskRow(data) {
      if (this.searchParams.states !== 'P') {
        return;
      }
      const toDetail = detailData => {
        if (data.taskType === 'HLD_PRE') {
          // let newDetailData = { ...detailData };
          // newDetailData.sprintId = newDetailData.schemaId;
          this.seelctTaskInfo = detailData;
        } else {
          let menuId = 'HldDesign';
          let mentTitle = (detailData.taskInfo || {}).title;
          let params = {
            choose: 'HldDesign',
            projectInfo: detailData.projectInfoData,
            isSingleMenu: true,
          };
          console.log('project数据:', JSON.stringify(detailData.projectInfoData));

          this.$root.$emit('openMenu', menuId, mentTitle, params);
        }
      };
      this.selectMap = this.selectMap || {};
      if (this.selectMap[data.taskId]) {
        toDetail(this.selectMap[data.taskId]);
      } else {
        queryTaskOrderInfo(data.orderId).then(order => {
          const orderresultData = order.resultData || {};
          queryTaskProjectInfo(data.projectId).then(proInfo => {
            orderresultData.projectInfo = proInfo.resultData || {};
            getTaskDetail(data.taskId).then(res => {
              const resultData = res.resultData || {};
              let project = resultData.projectInfo || {};
              let projectInfoData = {
                ...resultData.taskInfo,
                reqFinishDate: data.dueDate,
                schemaId: data.taskId,
                sprintId: project.projectId,
                createDate: project.createDate,
                projectName: project.projectName,
                orderInfo: orderresultData,
              };
              this.selectMap[data.taskId] = {
                ...resultData,
                projectInfoData,
              };
              toDetail(this.selectMap[data.taskId]);
            });
          });
        });
      }

      console.log('选择工单：', data);
    },
    formatDate(val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss');
    },

    loadTaskList() {
      $.blockUI({ message: 'loading' });
      let newSearch = { ...this.searchParams };
      if (newSearch.createDateStart) {
        newSearch.createDateStart = newSearch.createDateStart + ' 00:00:00';
      }
      if (newSearch.createDateEnd) {
        newSearch.createDateEnd = newSearch.createDateEnd + ' 23:59:59';
      }
      queryTaskList({
        pageIndex: this.currentPage - 1,
        pageSize: this.pageSize,
        userId: portal.appGlobal.attributes.userId || 1,
        ...newSearch,
      }).then(data => {
        $.unblockUI(); //  loading
        // 展示的数据
        this.taskList = data.resultList || [];
        this.totalCount = data.total || 0;
      });
    },
    onPageClick(page) {
      this.currentPage = page;
      this.loadTaskList();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './NewTaskList.scss';
</style>