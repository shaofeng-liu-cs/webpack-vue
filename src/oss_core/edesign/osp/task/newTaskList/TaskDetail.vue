<template>
  <div class="taskDetailBox">
    <div class="headBtnlist">
      <button type="button" class="btn btn-default" @click="goback">
        {{$t('DESIGN_CHECK_BACK')}}
      </button>
      <button type="button" class="btn btn-default m-l" @click="toMenuPage('designPreparation')">
        {{$t('TASK_DESIGN_PREPARATION')}}
      </button>
      <button type="button" class="btn btn-default m-l" @click="toMenuPage('splitTask')">
        {{$t('TASK_LIST_SPLIT_DESIGN_TASK')}}
      </button>
      <button type="button" class="btn btn-default m-l" @click="closeModal=true">
        {{$t('TASK_LIST_CLOSE_TASK')}}
      </button>
    </div>
    <div class="cardListBox">
      <div class="fromItemCard">
        <div class="cardHead">
          <span class="headTitle">{{$t('TASK_LIST_TASK_INFO')}}</span>
        </div>
        <div class="cardContent">
          <span class="formItem">
            <div class="itemlabel">
              {{$t('TASK_LIST_TASK_CODE')}}
            </div>
            <div class="itemInput">
              {{detail.taskId||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_MAINPAGEDESIGNER_TASK_TYPE')}}
            </div>
            <div class="itemInput">
              {{detail.taskTypeName||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('TITLE')}}
            </div>
            <div class="itemInput">
              {{detail.title||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('OSP_TASK_DESCRIPTION')}}
            </div>
            <div class="itemInput">
              {{detail.description||'-'}}
            </div>
          </span>
        </div>
      </div>
      <div class="fromItemCard">
        <div class="cardHead">
          <span class="headTitle">{{$t('E_MAINPAGEDESIGNER_PROJECT_INFO')}}</span>
        </div>
        <div class="cardContent">
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_PROJECTDETAIL_CODE')}}
            </div>
            <div class="itemInput">
              {{projectInfo.projectId}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_PROJECTDETAIL_NAME')}}
            </div>
            <div class="itemInput">
              {{projectInfo.projectName}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_PROJECTDETAIL_TYPE')}}
            </div>
            <div class="itemInput">
              {{projectInfo.projectTypeName||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('REGION')}}
            </div>
            <div class="itemInput">
              {{projectInfo.regionName||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_PROJECTDETAIL_PRO_MANAGER')}}
            </div>
            <div class="itemInput" style="display: inline-table">
              {{projectInfo.projManagerName||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('E_PROJECTDETAIL_DESIGN_MANAGER')}}
            </div>
            <div class="itemInput" style="display: inline-table">
              {{projectInfo.designManagerName||'-'}}
            </div>
          </span>
          <span class="formItem" style="margin-right:0;">
            <div class="itemlabel">
              {{$t('OSP_TASK_DESCRIPTION')}}
            </div>
            <div class="itemInput">
              {{projectInfo.notes||'-'}}
            </div>
          </span>
        </div>
      </div>
      <!-- <div class="fromItemCard">
        <div class="cardHead">
          <span class="headTitle">{{$t('PROJECT_REQUIREMENT')}}</span>
        </div>
        <div class="cardContent">
          <span class="formItem">
            <div class="itemlabel">
              {{$t('PROJECT_TOTAL_USERS')}}
            </div>
            <div class="itemInput">
              {{detail.TOTAL_USERS||'-'}}
            </div>
          </span>
          <span class="formItem">
            <div class="itemlabel">
              {{$t('PROJECT_COVERAGE_RATIO')}}
            </div>
            <div class="itemInput">
              {{detail.COVERAGE_RATIO||'-'}}
            </div>
          </span>
        </div>
      </div> -->
      <div class="fromItemCard">
        <div class="cardHead">
          <span class="headTitle">{{$t('PROJECT_ATTACHMENT')}}</span>
        </div>
        <div class="cardContent">
          <span class="fileItem" v-for="(file,i) in projectInfo.projectDocList" :key="i">
            <span class="fileContent">
              <span class="fileName">{{file.docName}}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <task2Next v-if="closeModal" @popupClose="closeModal=false" :gridSelectedData="projectInfo"></task2Next>
  </div>
</template>
<script>
import moment from 'moment';
import task2Next from '@/oss_core/edesign/osp/task/task2Next/task2Next.vue';
import { getTaskDetail } from '../api/taskAction';

export default {
  name: 'taskDetail',
  props: {
    taskInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: {
    task2Next,
  },
  data() {
    return {
      closeModal: false,
      searchParams: {
        queryKey: '',
        queryType: '',
      },
      gridOption: {},
      totalCount: 0,
      pageSize: 20,
      currentPage: 1,
      taskList: [],
      detail: this.taskInfo.taskInfo || {},
      projectInfo: this.taskInfo.projectInfo || {},
    };
  },

  create() {},

  mounted() {},

  methods: {
    toMenuPage(val) {
      let menuId = val;
      let mentTitle = this.projectInfo.projectName;
      let params = {
        choose: val,
        projectInfo: this.taskInfo.projectInfoData,
        isSingleMenu: true,
      };
      console.log('跳转前project数据:', JSON.stringify(this.taskInfo.projectInfoData));
      this.$root.$emit('openMenu', menuId, mentTitle, params);
    },
    goback() {
      this.$emit('closeDetail');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './NewTaskList.scss';
</style>