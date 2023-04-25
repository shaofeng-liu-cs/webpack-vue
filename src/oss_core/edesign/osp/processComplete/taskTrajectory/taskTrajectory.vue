<template>
  <!-- new-thme-box -->
  <div class="task-trajectory-box edn-page-box hasOptions">
    <div class="bottom-options">
      <span class="left-box">
        <el-button type="default2" size="small" @click="acceptanceModalObj.show = true" v-if="isAccet">{{
          $t('COMPLETE_TRAJECTORRY_ONLINE_ACCEPTANCE')
        }}</el-button>
      </span>
      <span class="right-box">
        <el-button type="default2" size="small" @click="changePageDetail('P')">{{ $t('COMPLETE_TRAJECTORRY_PREV') }}</el-button>
        <el-button size="small" @click="changePageDetail('N')" type="primary" style="margin-left:15px;">{{
          $t('COMPLETE_TRAJECTORRY_NEXT')
        }}</el-button>
      </span>
    </div>
    <div class="sys-card-box">
      <div class="box-head-title">
        <span class="left-title">{{ $t('COMPLETE_TRAJECTORRY_ACCEPTANCE_OBJECT') }}</span>
        <span class="flex-align-center">
          <el-button
            v-if="connectionObjDetail.relObjectList && connectionObjDetail.relObjectList.length"
            type="default"
            size="mini2"
            @click="table1Obj.show = true"
          >
            <i class="icon_osp24gl-table icon_osp"></i>
            <span>
              {{ $t('COMPLETE_TRAJ_TABLE_CONN_DETAIL') }}
            </span>
          </el-button>
          <el-button
            v-if="connectionObjDetail.groupOtherTaskList && connectionObjDetail.groupOtherTaskList.length"
            type="default"
            size="mini2"
            @click="table2Obj.show = true"
            class="m-l-lg"
          >
            <i class="icon_osp24gl-table icon_osp"></i>
            <span>
              {{ $t('COMPLETE_TRAJ_TABLE_ASSOCIATED_RES') }}
            </span>
          </el-button>
        </span>
      </div>
      <div class="box-content trajectory-content">
        <div class="top-content-box">
          <span class="info-item" v-if="connectionObjDetail.resName">
            <div class="info-it-title">{{ $t('AUTO_LLD_RESOURCE_NAME') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.resName }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.modelName">
            <div class="info-it-title">{{ $t('MODEL') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.modelName }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.vendorCode">
            <div class="info-it-title">{{ $t('OSP_TASK_VENDOR') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.vendorCode }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.fromResSpec">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJ_FORM_RES') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.fromResSpec }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.toResSpec">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJ_TO_RES') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.toResSpec }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.constCatName">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_TECHNOLOGY_CATEGORY') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.constCatName }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.fixTypeName">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_CONSTRUCTION_TECHNOLOGY') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.fixTypeName }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.accepResultName">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_ACCEPTANCE_STATE') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.accepResultName }}</div>
          </span>
          <span class="info-item" v-if="connectionObjDetail.description">
            <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_COMMENT') }}</div>
            <div class="info-it-val m-t">{{ connectionObjDetail.description }}</div>
          </span>
        </div>
        <div class="traj-bottom-content">
          <span class="left-trajectory-tree">
            <el-scrollbar ref="leftScrollBody">
              <div class="traj-item" v-for="item in cardDataList" :key="item.id">
                <span class="traj-icon" :class="{ active: selectLabel === item.id }"><i class="icon_ospwenjian icon_osp"></i></span>
                <span class="traj-mark"><i v-if="selectLabel === item.id" class="icon_osp icon_ospbuzhou"></i></span>
                <span class="traj-label" @click="toItemCard(item)">{{ item.taskTypeName }}</span>
              </div>
            </el-scrollbar>
          </span>
          <span class="trajectory-right-content">
            <el-scrollbar ref="scrollBody">
              <div class="bt-tar-card-box" v-for="(item, i) in cardDataList" :key="item.id" :id="`itemCard_${item.id}`">
                <div class="card-head-box child-head-title" :class="{ 'm-t-mlg': i > 0 }">
                  <span class="head-title">{{ item.taskTypeName }}</span>
                </div>
                <div class="card-body-box">
                  <div class="info-list">
                    <span class="info-item">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_TASK_NAME') }}</div>
                      <div class="info-it-val m-t">{{ item.title }}</div>
                    </span>
                    <span class="info-item">
                      <div class="info-it-title">{{ $t('E_OSP_DESIGN_TASK_TYPE') }}</div>
                      <div class="info-it-val m-t">{{ item.taskTypeName }}</div>
                    </span>
                    <span class="info-item">
                      <div class="info-it-title">{{ $t('TASK_DESIGN_CREATION_DATE') }}</div>
                      <div class="info-it-val m-t">{{ $moment(item.createDate).format('YYYY-MM-DD HH:mm:ss') }}</div>
                    </span>
                    <span class="info-item" v-if="item.taskStateName">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_TASK_STATE') }}</div>
                      <div class="info-it-val m-t">{{ item.taskStateName }}</div>
                    </span>
                    <span class="info-item" v-if="item.resultName">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_RESULT') }}</div>
                      <div class="info-it-val m-t">{{ item.resultName }}</div>
                    </span>
                    <span class="info-item" v-if="item.completeDate">
                      <div class="info-it-title">{{ $t('TASK_DESIGN_FINISH_DATE') }}</div>
                      <div class="info-it-val m-t">{{ $moment(item.completeDate).format('YYYY-MM-DD HH:mm:ss') }}</div>
                    </span>
                    <span class="info-item" v-if="item.operTypeName && !item.isConstruction">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_RESULT') }}</div>
                      <div class="info-it-val m-t">{{ item.operTypeName }}</div>
                    </span>
                    <span class="info-item" v-if="item.operDesc && !item.isConstruction">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_RESULT_DESC') }}</div>
                      <div class="info-it-val m-t">{{ item.operDesc }}</div>
                    </span>
                  </div>
                  <!-- <div class="info-list">
                  
                </div> -->
                  <div class="info-list" v-if="(item.taskDocList && item.taskDocList.length) || (item.attachmentList && item.attachmentList.length)">
                    <span class="info-item photos-box" v-if="item.taskDocList && item.taskDocList.length">
                      <div class="info-it-title">{{ $t('COMPLETE_TRAJECTORRY_PHOTOS') }}</div>
                      <div class="info-it-val photos-list">
                        <div class="img-cate-list" v-for="(imgIt, imgIndex) in item.taskDocList" :key="imgIndex">
                          <span class="cate-icon">
                            <i class="icon_ospa-WorkItem icon_osp"></i>
                            <span class="icon-tit">{{ imgIt.resName }}</span>
                          </span>
                          <div class="cate-img-list">
                            <span class="img-content-item" v-for="(img, i) in imgIt.imageList" :key="i">
                              <el-tooltip effect="light" :content="img.imgCatName" placement="bottom-start">
                                <el-image :src="img.docPath" :preview-src-list="imgIt.showImgList"> </el-image>
                              </el-tooltip>
                              <div class="img-name">{{ img.imgCatName }}</div>
                            </span>
                          </div>
                        </div>
                      </div>
                    </span>
                    <span class="info-item attachment-box" v-if="item.attachmentList && item.attachmentList.length">
                      <div class="info-it-title">{{ $t('PROJECT_ATTACHMENT') }}</div>
                      <div class="info-it-val attachment-list"></div>
                    </span>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </span>
        </div>
      </div>
    </div>

    <Popup :popupObj="acceptanceModalObj" @popupClose="popupClose" @popupOk="acceptanceSubmit">
      <template v-slot:popupBody>
        <el-form :model="accptanceFormVal" ref="accptanceForm" label-width="auto" :rules="accptanceFormRule">
          <el-form-item :label="$t('COMPLETE_TRAJECTORRY_RESULT')" prop="accepResult">
            <el-select v-model="accptanceFormVal.accepResult" :placeholder="$t('PLEASE_SELECT')">
              <el-option :label="$t('COMPLETE_TRAJECTORRY_ACCEPTANCE_PASS')" value="P"></el-option>
              <el-option v-if="lastTskType !== 'RECTIFICATION'" :label="$t('COMPLETE_TRAJECTORRY_ACCEPTANCE_NO_PASS')" value="N"></el-option>
              <el-option v-if="lastTskType === 'ONLINE_INSP'" :label="$t('COMPLETE_TRAJECTORRY_ACCEPTANCE_FIELD_INSPECTION')" value="F"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="descObj[accptanceFormVal.accepResult]" prop="description">
            <el-input type="textarea" :rows="5" :placeholder="$t('PLEASE_ENTER')" v-model="accptanceFormVal.description"> </el-input>
          </el-form-item>
        </el-form>
      </template>
    </Popup>
    <Popup :popupObj="table1Obj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <el-table :data="connectionObjDetail.relObjectList" height="100%" border width="100%" size="mini">
          <el-table-column prop="connectionTypeName" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_CONNECTION_TYPE')" width="120"> </el-table-column>
          <el-table-column prop="aDevice" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_A_RESOURCE')"> </el-table-column>
          <el-table-column prop="aResSpecName" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_A_RESOURCE_TYPE')" width="120"> </el-table-column>
          <el-table-column prop="aUnit" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_A_UNIT')" width="120"> </el-table-column>
          <el-table-column prop="zDevice" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_Z_RESOURCE')"> </el-table-column>
          <el-table-column prop="zResSpecName" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_Z_RESOURCE_TYPE')" width="120"> </el-table-column>
          <el-table-column prop="zUnit" :label="$t('COMPLETE_TRAJECTORRY_DETAIL_Z_UNIT')" width="120"> </el-table-column>
        </el-table>
      </template>
    </Popup>
    <Popup :popupObj="table2Obj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <el-table :data="connectionObjDetail.groupOtherTaskList" height="100%" border width="100%" size="mini">
          <el-table-column prop="resName" :label="$t('COMPLETE_TRAJ_TABLE_ASSOCIATED_RES')"> </el-table-column>
          <el-table-column prop="resSpecName" :label="$t('RESOURCE_TYPE')" min-width="120"> </el-table-column>
          <el-table-column prop="accepResultName" :label="$t('COMPLETE_TRAJECTORRY_ACCEPTANCE_STATE')" width="min-120"> </el-table-column>
          <el-table-column align="right" width="70" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="toTaskDetail(scope.row)">{{ $t('DETAIL') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </Popup>
  </div>
</template>
<script>
import { queryAcceptanceTaskDetail } from '@/oss_core/edesign/api/query/project.js';
import { acceptask } from '@/oss_core/edesign/api/edit/project.js';

export default {
  name: 'TaskTrajectory',
  props: {},
  components: {},
  inject: ['getInitData'],
  data() {
    return {
      selectLabel: '',
      taskBase: this.getInitData().taskBase || {},
      topList: [],
      accptanceFormVal: {
        accepResult: 'P',
      },
      accptanceFormRule: {
        accepResult: [{ required: true }],
        description: [{ required: true, message: this.$t('PLEASE_ENTER') }],
      },
      acceptanceModalObj: {
        title: this.$t('COMPLETE_TRAJECTORRY_ONLINE_ACCEPTANCE'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '750px',
        height: '350px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      table1Obj: {
        title: this.$t('COMPLETE_TRAJ_TABLE_CONN_DETAIL'),
        // close: this.$t('CLOSE'),
        modal: true,
        width: '80%',
        height: '80%',
        show: false,
        drag: true,
        zIndex: 3,
      },
      table2Obj: {
        title: this.$t('COMPLETE_TRAJ_TABLE_ASSOCIATED_RES'),
        // close: this.$t('CLOSE'),
        modal: true,
        width: '700px',
        height: '300px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      descObj: {
        P: this.$t('COMPLETE_TRAJECTORRY_ACCEPTANCE_DESCRIPTION'),
        N: this.$t('COMPLETE_TRAJECTORRY_RECTIFICATION_REQUIREMENTS'),
        F: this.$t('COMPLETE_TRAJECTORRY_INSPECTION_REQUIREMENTS'),
      },

      connectionObjDetail: {},
      cardDataList: [],
      isAccet: false,
      lastTskType: '',
    };
  },

  create() {},

  mounted() {
    this.loadDetail();
    this.$refs.scrollBody && this.$refs.scrollBody.wrap.addEventListener('scroll', this.scrollListener);
  },
  updated() {
    if (!this.cardDataList.length) {
      return;
    }
    if (!this.topList.length) {
      const topList = [];
      this.cardDataList.forEach(it => {
        const dom = document.querySelector(`#itemCard_${it.id}`);
        dom && topList.push(dom.offsetTop);
      });
      this.topList = topList;
    }
  },
  beforeDestroy() {
    this.$refs.scrollBody && this.$refs.scrollBody.wrap && this.$refs.scrollBody.wrap.removeEventListener('scroll', this.scrollListener);
  },

  methods: {
    changePageDetail(type) {
      // if (this.isPage) {
      //   return;
      // }
      // this.isPage = true;

      queryAcceptanceTaskDetail({
        projectId: this.connectionObjDetail.projectId,
        taskId: this.connectionObjDetail.taskId,
        constCatId: this.connectionObjDetail.constCatId,
        pageTurning: type,
      }).then(res => {
        if (this.$refs.scrollBody) {
          this.$refs.scrollBody.wrap.scrollTop = 0;
        }
        if (this.$refs.leftScrollBody) {
          this.$refs.leftScrollBody.wrap.scrollTop = 0;
        }
        // this.isPage = false;
        this.formatData(res.data || {});
      });
    },
    loadDetail() {
      queryAcceptanceTaskDetail(this.taskBase).then(res => {
        this.formatData(res.data || {});
      });
    },
    formatData(resData) {
      this.topList = [];
      this.connectionObjDetail = resData.noConnectionObjDetail || resData.connectionObjDetail || {};
      this.connectionObjDetail.projectId = this.connectionObjDetail.projectId || resData.projectId;
      this.connectionObjDetail.taskId = this.connectionObjDetail.taskId || resData.taskId;
      const taskAccepList = resData.taskAccepList || [];
      const constructionDetailList = (resData.constructionDetailList || []).map(it => {
        return {
          ...it,
          isConstruction: true,
        };
      });
      this.cardDataList = [...taskAccepList, ...constructionDetailList].map(item => {
        const list = (item.taskDocList || []).map(it => {
          const showImgList = [];
          it.imageList = it.imageList.map(img => {
            img.docPath = `${portal.appGlobal.get('webroot')}/opb/file/download?fileName=${img.docPath}`;
            showImgList.push(img.docPath);
            return img;
          });
          it.showImgList = showImgList;
          return it;
        });
        item.taskDocList = list;
        item.id = `${item.id}_${item.taskId}`;
        return item;
      });
      this.selectLabel = (this.cardDataList[0] || {}).id;
      if (this.cardDataList.length) {
        const lastTast = taskAccepList[0];
        this.lastTskType = lastTast.taskType;
        this.isAccet = lastTast.taskState === 'P';
      }
    },
    popupClose() {},
    acceptanceSubmit() {
      acceptask({
        ...this.accptanceFormVal,
        projectId: this.connectionObjDetail.projectId,
        taskId: this.connectionObjDetail.taskId,
        constCatId: this.connectionObjDetail.constCatId,
        resId: this.connectionObjDetail.resId,
      }).then(res => {
        if (res.success) {
          this.acceptanceModalObj.show = false;
          this.$message({
            message: this.$t('SAVE_SUCCESS'),
            type: 'success',
          });
          this.loadDetail();
        } else {
          this.$message({
            message: res.message || this.$t('AJAX_ERROR'),
            type: 'error',
          });
        }
      });
    },
    scrollListener() {
      if (!this.topList.length) {
        return;
      }
      const scrollTop = this.$refs.scrollBody && this.$refs.scrollBody.wrap.scrollTop;
      const index = this.topList.findIndex(it => it >= scrollTop);
      if (index > -1) {
        const code = this.cardDataList[index].id;
        this.selectLabel = code;
      }
    },
    toItemCard(data) {
      const id = `itemCard_${data.id}`;
      const dom = document.querySelector(`#${id}`);
      const top = dom.offsetTop;
      this.$refs.scrollBody.wrap.scrollTop = top;
      this.selectLabel = data.id;
    },
    toTaskDetail(obj) {
      // TaskTrajectory
      const menuId = 'TaskTrajectoryDetail';
      const mentTitle = obj.resName;
      const params = {
        choose: 'TaskTrajectory',
        taskBase: {
          projectId: this.connectionObjDetail.projectId,
          taskId: obj.taskId,
          constCatId: obj.constCatId,
        },
        isSingleMenu: true,
      };
      this.$root.$emit('openMenu', menuId, mentTitle, params);
    },
  },
};
</script>
<style lang="scss" scoped>
@import './taskTrajectory.scss';
</style>
