<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-08-08 14:34:32
 * @LastEditors: HongAnDing
 * @Description: 入口页
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\index.vue
-->
<template>
  <div class="box" id="osp-container">
    <!-- <keep-alive>
      <component :is="soltName" :ref="soltName" :projectInfo="projectInfo" :taskInfo="taskInfo" @submit="submit"></component>
    </keep-alive> -->
    <keep-alive>
      <SchemeConfiguration v-if="soltName === 'SchemeConfiguration'"></SchemeConfiguration>
      <DesignPreparation v-if="soltName === 'DesignPreparation'" :projectInfo="projectInfo" @submit="submit"></DesignPreparation>
      <Design v-if="soltName === 'Design'" :projectInfo="projectInfo" @submit="submit"></Design>
      <Design v-if="soltName === 'Design1'" :hideBuild="true" :projectInfo="projectInfo" @submit="submit"></Design>
      <Design v-if="soltName === 'Design2'" :hideOther="true" :projectInfo="projectInfo" @submit="submit"></Design>
      <HldDesign v-if="soltName === 'HldDesign'" :projectInfo="projectInfo"></HldDesign>
      <LldDesign
        v-if="soltName == 'DeviceTopo'"
        :projectInfo="projectInfo"
        :lldParams="lldParams"
        @openMenuInLldDesign="openMenu"
        @openMenuInDevicePortTrace="openMenu"
      ></LldDesign>
      <FastLayingDesign v-if="soltName == 'FastLayingDesign'" :rowData="cableDesignParam"></FastLayingDesign>
      <FiberRouteTopo v-if="soltName == 'FiberRouteTopo'" :params="lldParams"></FiberRouteTopo>
      <SchemaResourceRouteTopo v-if="soltName == 'SchemaResourceRouteTopo'" :params="lldParams"></SchemaResourceRouteTopo>
      <PortTraceCalculate v-if="soltName == 'PortTraceTopo'" :portParams="portParams"></PortTraceCalculate>
      <AutoHLDGeneration v-if="soltName === 'AutoHLDGeneration'" :projectInfo="projectInfo"></AutoHLDGeneration>
      <ConstructionScheme v-if="soltName === 'ConstructionScheme'"></ConstructionScheme>
      <MarkingStyle v-if="soltName === 'MarkingStyle'"></MarkingStyle>
      <NewTaskList v-if="soltName === 'NewTaskList'"></NewTaskList>
      <ConstructionProgress v-if="soltName === 'ConstructionProgress'" :projectInfo="projectInfo"></ConstructionProgress>
      <ProcessComplete v-if="soltName === 'ProcessComplete'" :projectInfo="projectInfo"></ProcessComplete>
      <ProcessComplete v-if="soltName === 'ProcessComplete1'" :hideTab="true" :projectInfo="projectInfo"></ProcessComplete>
      <TaskTrajectory v-if="soltName === 'TaskTrajectory'"></TaskTrajectory>
      <TaskWorkItem v-if="soltName === 'TaskWorkItem'"></TaskWorkItem>
      <HldTemplate v-if="soltName === 'HldTemplate'"></HldTemplate>
    </keep-alive>
  </div>
</template>
<script>
import SchemeConfiguration from './schemeConfiguration/SchemeConfiguration.vue'; // portal入口页面，设计准备参数配置页面
import DesignPreparation from './designPreparation/DesignPreparation.vue'; // 第二步设计准备页面
import Design from './design/Design.vue'; // 第三步设计页面
import HldDesign from './design/hldDesign/HldDesign.vue'; // 新开菜单栏展示，HLD设计页面
import LldDesign from './design/lldDesign/lldDesign.vue';
import FiberRouteTopo from '../topo/design/FiberRouteTopo1.vue';
import SchemaResourceRouteTopo from '../topo/design/SchemaResourceRouteTopo.vue';
import PortTraceCalculate from './topo-control/device_design/portTraceCalculate.vue';
import AutoHLDGeneration from './design/autoHLDGeneration/AutoHLDGeneration.vue'; // 新开菜单栏展示，自动HLD设计页面
import ConstructionScheme from './constructionScheme/ConstructionScheme.vue'; // 新开菜单栏展示，自动HLD设计页面
import FastLayingDesign from './topo-control/fastlaying/fastlayingDesign.vue';
import MarkingStyle from './markingStyle/MarkingStyle.vue';
import NewTaskList from './task/newTaskList/NewTaskList.vue';
import ConstructionProgress from './constructionProgress/ConstructionProgress.vue';
import ProcessComplete from './processComplete/ProcessComplete.vue';
import TaskTrajectory from './processComplete/taskTrajectory/taskTrajectory.vue';
import TaskWorkItem from './taskWorkItem/TaskWorkItem.vue';
import HldTemplate from './hldTemplate/HldTemplate.vue';

export default {
  name: 'Osp',
  provide() {
    return {
      getTaskInfo: () => this.taskInfo, // 设计任务详情
    };
  },
  inject: ['getInitData'],
  components: {
    SchemeConfiguration,
    DesignPreparation,
    Design,
    HldDesign,
    LldDesign,
    FiberRouteTopo,
    SchemaResourceRouteTopo,
    PortTraceCalculate,
    AutoHLDGeneration,
    ConstructionScheme,
    FastLayingDesign,
    MarkingStyle,
    NewTaskList,
    ConstructionProgress,
    ProcessComplete,
    TaskTrajectory,
    TaskWorkItem,
    HldTemplate,
  },
  data() {
    return {
      soltName: this.getInitData().choose || 'SchemeConfiguration',
      taskInfo: {}, // 设计任务详情
      projectInfo: this.getInitData().projectInfo || {}, // 工程详情
      controlData: this.getInitData().controlData || {}, // 跨模块入参
      lldParams: this.getInitData().lldParams ? this.getInitData().lldParams : {}, // 内部设计入参
      portParams: this.getInitData().portParams ? this.getInitData().portParams : {},
      cableDesignParam: this.getInitData().cableDesignParam ? this.getInitData().cableDesignParam : {},
    };
  },

  create() {},
  mounted() {
    this.$root.$on('openMenu', this.openMenu); // 在portal上新开页签
    this.$root.$on('closeMenu', this.closeMenu); // 在portal上关闭页签
    this.$root.$on('btnToCoverCurrentPage', this.btnToCoverCurrentPage); // 重新进另外的界面
    this.init();
  },
  methods: {
    async init() {
      this.projectInfo.sprintId = this.projectInfo.projectId;
      const initData = this.getInitData();
      if (initData.controlData && initData.controlData.soltName) {
        this.soltName = initData.controlData.soltName;
      }
      console.log(initData);
    },
    // menuId 菜单ID,如果页签需要限制打开数量为1,menuId需要传相同值;
    // menuTitle 菜单标题
    // menuParams 菜单参数,包括choose(页面组件Code,必填)、projectInfo(当前sprint信息或者schema信息), isSingleMenu(是否限制同时只能打开一个相同页签);

    openMenu(menuId, menuTitle, menuParams) {
      // if (this.$refs.hldDesign && this.$refs.hldDesign.fullscreen) {
      //   this.$refs.hldDesign.fullscreen = false;
      //   document.exitFullscreen();
      // }
      // if (menuParams.projectInfo) {
      //   this.detail = menuParams.projectInfo;
      // } else {
      //   menuParams.projectInfo = this.detail; //如果有工程信息就带进新界面
      // }
      // if (menuParams.portParams) {
      //   this.portParams = menuParams.portParams;
      // }
      if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
        // this.choose = menuParams.choose;
        // this.initDevOpenParam(menuParams);
        localStorage.setItem(menuParams.choose, JSON.stringify(menuParams));
        const url = `${window.location.href.split('?')[0]}?choose=${menuParams.choose}`;
        window.open(url);
      } else {
        // 表示是业务菜单内部新开页签
        menuParams.openMenuMode = 'inner';
        // stringKey = true表示最终menuId使用用户自定义的ID而不会去修改
        menuParams.stringKey = true;
        if (menuParams.isSingleMenu) {
          // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
          portal.closeMenu(menuId, 'oss_core/edesign/new-osp-design');
        }
        portal.openMenu(menuId, 'oss_core/edesign/new-osp-design', 'S', menuTitle, menuParams);
      }
    },
    closeMenu(menuId) {
      if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
        window.close();
      } else {
        portal.closeMenu(menuId, 'oss_core/edesign/new-osp-design');
      }
    },
    stepChange(controlData) {
      if (!controlData || !Object.keys(controlData).length) {
        return;
      }
      this.soltName = controlData.parentName === 'osp' ? controlData.soltName : '';
    },
    submit(soltName) {
      this.controlData.soltName = soltName;
    },
    btnToCoverCurrentPage(choose, param) {
      this.soltName = choose;
      if (param) {
        this.initCoverParam(choose, param);
        // this.detail = finnalParam;
      }
    },
    initCoverParam(choose, param) {
      if (choose === 'SPRING_CODE') {
        param.schemaId = param.sprintId;
        param.flowState = param.sprintState;
        param.markFlag = 'sprint';
        this.springCodeParam = param;
      } else if (choose === 'FastLayingDesign') {
        this.cableDesignParam = param;
      }
    },
  },
  watch: {
    soltName() {},
    controlData: {
      deep: true,
      handler(newVal) {
        this.stepChange(newVal);
      },
    },
  },
  destroyed() {
    this.$root.$off('openMenu', this.openMenu); // 解除监听
    this.$root.$off('closeMenu', this.closeMenu); // 在portal上关闭页签
  },
};
</script>

<style lang="scss" scoped>
@import '@/oss_core/base/css/main.scss';
@import './osp.scss';
</style>
