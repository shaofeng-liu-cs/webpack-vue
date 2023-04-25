<template>
  <div class="project-bulletin-box">
    <div class="bulletin-item" v-for="(item,i) in dataList" :key="i">
      <div class="bulletin-header">
        <span :class="`header-item-box ${item.className}`">
          <span class="bl-item-name">{{item.name}}</span>
          <img class="bl-item-img" src="oss_core/edesign/assets/image/project/BulletinItemIcon.png" />
        </span>
      </div>
      <span class="header-item-jiantou" v-if="i!==dataList.length-1">→</span>
      <div class="bulletin-content">
        <el-scrollbar>
          <div class="content-res-li " v-for="(child,index) in item.list" :key="index" @click="itemClick(child)">
            <div class="res-li-icon">
              <img :src="child.img_url" />
            </div>
            <div class="res-li-name">{{child.name}}</div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <Popup :popupObj="popupObj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <ProjectReport :params="viewParams"></ProjectReport>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryProjectTask, queryProjectDocData } from '@/oss_core/edesign/api/query/project.js';
import PhotoViewer from 'photoviewer';
import ProjectReport from '../projectReport/ProjectReport.vue';
export default {
  name: 'ProjectBulletinBoard',
  components: {
    ProjectReport,
  },
  props: {
    param: Object,
  },
  data() {
    return {
      popupObj: {
        title: '', // 弹框标题
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: false, // 是否蒙层
        width: '90%', // 宽
        height: '90%', // 高
        modal: true, // 是否蒙层
        show: false,
        drag: true, //是否拖拽
        zIndex: 10,
        body: true,
      },
      dataList: [
        {
          name: this.$t('BULLETIN_BOARD_PLAN'),
          className: 'itbox1',
          list: [
            { code: 'NETWORD_COVRAGE', name: this.$t('NETWORD_COVRAGE'), img_url: 'oss_core/edesign/assets/image/project/NetworkCoverage.png' },
            { code: 'USER_DENSITY', name: this.$t('USER_DENSITY'), img_url: 'oss_core/edesign/assets/image/project/UserDensity.png' },
            { code: 'USER_REQUEST', name: this.$t('USER_REQUEST'), img_url: 'oss_core/edesign/assets/image/project/UserRequirement.png' },
          ],
        },
        {
          name: this.$t('BULLETIN_BOARD_SURVEY'),
          className: 'item_survey',
          list: [
            {
              code: 'SURVEY_THEME',
              compoentType: 'SurveyReport',
              name: this.$t('SURVEY_THEME'),
              img_url: 'oss_core/edesign/assets/image/project/SurveyReport.png',
            },
          ],
        },
        {
          name: this.$t('BULLETIN_BOARD_DESIGN'),
          className: 'item_design',
          list: [
            { code: 'ROUTE_DIAGRAM', name: this.$t('ROUTE_DIAGRAM'), img_url: 'oss_core/edesign/assets/image/project/RouteDIagram.png' },
            { code: 'TOPOLOGY_DIAGRAM', name: this.$t('TOPOLOGY_DIAGRAM'), img_url: 'oss_core/edesign/assets/image/project/TopologyDIagram.png' },
            { code: 'CORE_ASSIGNMENT', name: this.$t('CORE_ASSIGNMENT'), img_url: 'oss_core/edesign/assets/image/project/CoreAssignment.png' },
            { code: 'BOM', name: 'BOM', compoentType: 'BOMView', img_url: 'oss_core/edesign/assets/image/project/BOM.png' },
          ],
        },
        {
          name: this.$t('BULLETIN_BOARD_CONSTRUCT'),
          className: 'item_construct',
          list: [
            {
              code: 'CONSTRUCTION_THEME',
              compoentType: 'ConstructionProgress',
              name: this.$t('CONSTRUCTION_THEME'),
              img_url: 'oss_core/edesign/assets/image/project/ConstructionReport.png',
            },
          ],
        },
        {
          name: this.$t('BULLETIN_BOARD_COMMISIONING'),
          className: 'item_commisioning',
          list: [
            {
              code: 'COMISSION_REPORT',
              compoentType: 'CompletionReport',
              name: this.$t('COMISSION_REPORT'),
              img_url: 'oss_core/edesign/assets/image/project/ComissionReport.png',
            },
            {
              code: 'FTTH_TOPOLOGY',
              compoentType: 'ProjectTopology',
              name: this.$t('FTTH_TOPOLOGY'),
              img_url: 'oss_core/edesign/assets/image/project/Topology.png',
            },
          ],
        },
      ],
    };
  },

  create() {},

  mounted() {
    if (this.param && this.param.projectId) {
      console.log('项目ID：', this.param.projectId);

      queryProjectTask(this.param.projectId).then(res => {
        //itbox1:已完成 itbox2:进行中 itbox3:nostart
        const list = res.DATA || [];
        const survyHas = list.find(it => it.TASK_TYPE.indexOf('SURVEY') > -1);
        const designHas = list.find(it => it.TASK_TYPE === 'HLD');
        const constructHas = list.find(it => ['BUILD', 'SPLICE', 'OTDR', 'PM', 'BLOW'].includes(it.TASK_TYPE));
        const commisioningHas = list.find(it => it.TASK_TYPE.indexOf('PUBLISH') > -1);
        this.dataList[1].className += `${survyHas ? ' itbox2' : ' itbox3'}`;
        this.dataList[2].className += `${designHas ? ' itbox2' : ' itbox3'}`;
        this.dataList[3].className += `${constructHas ? ' itbox2' : ' itbox3'}`;
        this.dataList[4].className += `${commisioningHas ? ' itbox2' : ' itbox3'}`;
      });
      queryProjectDocData({ PROJECT_ID: this.param.projectId }).then(res => {
        let list = (res.DOC_LIST || []).filter(it => it.LABELS === 'Route');
        let imgshowList = [];
        let reg = /_(\w+)_/g;
        list.map(item => {
          if (['png', 'jpg', 'jpeg'].includes(item.DOC_TYPE)) {
            let indexSeq = ((item.DOC_NAME.match(reg) || [])[0] || '').replaceAll('_', '');
            imgshowList.push({
              src: item.DOC_PATH,
              title: item.DOC_NAME,
              index: indexSeq === 'all' ? 0 : parseInt(indexSeq || '1'),
            });
          }
        });
        imgshowList = imgshowList.sort((it, ait) => it.index - ait.index);
        imgshowList = imgshowList.map(it => it.src);
        this.dataList[2].list[0].imgList = imgshowList;
      });
    }
  },

  methods: {
    popupClose() {},
    itemClick(item) {
      if (item.imgList) {
        if (item.imgList.length) {
          this.previewImg(item.imgList);
        } else {
          this.$message({
            message: this.$t('NO_IMAGE_VIEW'),
            type: 'warning',
          });
        }
      } else if (item.compoentType) {
        this.popupObj.title = item.name;
        this.popupObj.show = true;
        this.viewParams = {
          sprintId: this.param.projectId,
          schemaId: this.param.projectId,
          compoentType: item.compoentType,
        };
      } else {
        this.$message({
          message: this.$t('ZANSHI_NOT_VIEW'),
          type: 'warning',
        });
      }
    },
    previewImg(list) {
      let options = {
        index: 0, // this option means you will start at first image
      };
      let viewer = new PhotoViewer(list, options);
    },
  },
  destroyed: function () {},
};
</script>

<style lang="scss" scoped>
@import './projectBulletinBoard.scss';
</style>
