<template>
  <div class="design-container sys-card-box">
    <el-scrollbar>
      <div v-if="!hideOther" class="HLD-container">
        <div class="box-head-title">
          <span class="left-title"> HLD {{ $t('INFORMATION') }} </span>
          <span class="right-options">
            <el-select
              style="width:200px;"
              v-model="designType"
              v-if="(taskInfo.state === 'I' || taskInfo.state === 'P') && !mode"
              :placeholder="$t('E_OSP_DESIGN_HLD_HANDLING')"
              size="mini"
              @change="changeDesignType"
            >
              <el-option label="Auto HLD Generation" value="Auto"></el-option>
              <el-option label="Manually HLD Generation" value="Manual"></el-option>
            </el-select>
            <el-button
              v-if="(taskInfo.state === 'I' || taskInfo.state === 'P') && mode === 'Auto'"
              type="primary"
              class="btns-item"
              @click="autoHld"
              >{{ $t('E_OSP_DESIGN_HLD_DESIGN') }}</el-button
            >
            <el-button v-if="mode === 'Manual' && taskInfo.state !== 'C'" type="primary" class="btns-item" @click="manuallyAdjust(null, 'edit')">{{
              $t('E_OSP_DESIGN_MANUALLY_DESIGN')
            }}</el-button>
            <el-button v-if="mode === 'Manual' && taskInfo.state !== 'C'" type="primary" class="btns-item" @click="confirm"
              >{{ $t('CONFIRM') }} HLD</el-button
            >
            <el-button v-if="taskInfo.state === 'S' && mode === 'Auto'" type="primary" class="btns-item" @click="manuallyAdjust(null, 'edit')">{{
              $t('E_OSP_DESIGN_MANUALLY_DESIGN')
            }}</el-button>
            <el-button v-if="taskInfo.state === 'S' && mode === 'Auto'" type="primary" class="btns-item" @click="confirm"
              >{{ $t('CONFIRM') }} HLD</el-button
            >
            <el-button v-if="taskInfo.state === 'C'" type="primary" class="btns-item" @click="manuallyAdjust(null, 'view')">{{
              $t('E_OSP_DESIGN_HLD_VIEW')
            }}</el-button>
            <el-button v-if="taskInfo.state === 'C'" type="primary" class="btns-item" @click="hldBom">{{ $t('E_OSP_DESIGN_HLD_BOM') }}</el-button>
          </span>
        </div>
        <div class="content-body-box">
          <div class="info-list-box">
            <span class="info-item">
              <div class="info-it-title">{{ $t('NAME') }}</div>
              <div class="info-it-val m-t">{{ taskInfo.title || '-' }}</div>
            </span>
            <span class="info-item">
              <div class="info-it-title">{{ $t('HANDLER') }}</div>
              <div class="info-it-val m-t">{{ taskInfo.hdUserName || '-' }}</div>
            </span>
            <span class="info-item">
              <div class="info-it-title">{{ $t('E_OSP_DESIGN_ORDER_ID') }}</div>
              <div class="info-it-val m-t">{{ projectInfo.interOrderId || '-' }}</div>
            </span>
            <span class="info-item">
              <div class="info-it-title">{{ $t('STATUS') }}</div>
              <div class="info-it-val m-t">{{ taskInfo.stateDesc || '-' }}</div>
            </span>
          </div>
        </div>
      </div>
      <div class="m-t-lg" v-if="taskInfo.state === 'C' && !hideOther">
        <div class="box-head-title">
          <span class="left-title">{{ $t('E_OSP_DESIGN_WORK_PACKAGES') }} </span>
        </div>
        <div class="content-body-box">
          <el-table :data="lldList" border style="width: 100%" :row-class-name="tableRowClassName" @row-click="showConstructionAndBom">
            <el-table-column :label="$t('NAME')" prop="title" min-width="150"></el-table-column>
            <el-table-column :label="$t('E_OSP_DESIGN_NETWORK_LEVEL')" prop="networkLevel" min-width="110"></el-table-column>
            <el-table-column :label="$t('HANDLER')" prop="hdUserName" min-width="110"></el-table-column>
            <el-table-column :label="$t('E_OSP_DESIGN_DUE_DATE')" prop="reqFinishDate" min-width="150"></el-table-column>
            <el-table-column :label="$t('STATUS')" prop="stateDesc" min-width="90"></el-table-column>
            <el-table-column :label="$t('OPERATIONS')" min-width="200">
              <template slot-scope="scope">
                <el-button @click="manuallyAdjust(scope.row)" type="text">{{ $t('E_OSP_DESIGN_DESIGN') }}</el-button>
                <el-button @click="manuallyAdjust(scope.row)" type="text">{{ $t('E_OSP_DESIGN_SURVEY_TASK') }}</el-button>
                <el-button @click="reAssign(scope.row)" type="text">{{ $t('E_OSP_DESIGN_RE_ASSIGN') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="m-t-mlg" v-show="selectedTaskId" v-if="taskInfo.state === 'C' && !hideBuild">
        <div class="box-head-title">
          <span class="left-title">{{ $t('E_OSP_DESIGN_CONSTRUCTION_LIST') }}</span>
        </div>
        <div class="content-body-box">
          <ConstructionList ref="constructionList"></ConstructionList>
        </div>
      </div>
      <div class="m-t-mlg" v-show="selectedTaskId" v-if="taskInfo.state === 'C' && !hideBuild">
        <div class="box-head-title">
          <span class="left-title">{{ $t('E_OSP_DESIGN_HLD_BOM') }}</span>
        </div>
        <div class="content-body-box">
          <HLDBomContent ref="lldBom"></HLDBomContent>
        </div>
      </div>
      <div class="m-t-mlg" v-else-if="taskInfo.state === 'H' && !hideOther">
        <div class="box-head-title">
          <span class="left-title">LLD {{ $t('INFORMATION') }}</span>
        </div>
        <div class="content-body-box">
          <div class="progress-container">
            <div class="upload-his-list">
              <div class="his-card" v-for="(item, i) in progressList" :key="i">
                <div class="his-card-head">
                  <!-- <span class="head-name">{{item.fileName}}</span> -->
                  <span class="head-time">{{ $moment(item.createDate).format('YYYY-MM-DD') }}</span>
                </div>
                <div class="opertat-list">
                  <div class="ope-item" v-for="(opr, index) in item.operationTraceEntityList" :key="index">
                    <span>{{ opr.traceStep }}</span>
                    <span>
                      <span>{{ $moment(opr.modifyDate).format('HH:mm:ss') }}</span>
                      <i :class="`opr-icon icon_osp ${stateMap[opr.traceStatus].icon}`" :style="`color:${stateMap[opr.traceStatus].color}`"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <ChooseUser ref="user"></ChooseUser>
    <HLDBom ref="HLDBom"></HLDBom>
  </div>
</template>

<script>
import ChooseUser from '../../project/components/chooseUser/ChooseUser.vue';
import HLDBom from '@/oss_core/edesign/osp/sidebar/designExport/bom/HLDBom.vue';
import HLDBomContent from '@/oss_core/edesign/osp/sidebar/designExport/bom/HLDBomContent.vue';
import ConstructionList from './constructionList/ConstructionList.vue';
import { getSchemaInfo, getBuildTaskList } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
import { queryMapNoByProjectId, queryOrderMode } from '@/oss_core/edesign/api/query/project.js'; // 后台接口
import { queryTaskProgress } from '@/oss_core/edesign/api/query/taskId.js'; // 后台接口
import { addLldTask, addOrderMode } from '@/oss_core/edesign/api/add/project.js'; // 后台接口

export default {
  name: 'Design',
  props: {
    hideBuild: false,
    hideOther: false,
  },
  components: {
    ChooseUser,
    HLDBom,
    HLDBomContent,
    ConstructionList,
  },
  inject: ['getTaskInfo', 'getInitData'],
  computed: {
    taskInfo() {
      return this.getTaskInfo();
    },
  },
  data() {
    return {
      projectInfo: this.getInitData().projectInfo || {}, // 工程详情
      stateMap: {
        0: {
          icon: 'icon_ospreloadtime',
          color: 'rgb(255, 193, 0)',
        },
        1: {
          icon: 'icon_ospbujinji',
          color: 'blue',
        },
        2: {
          icon: 'icon_ospcheck-circle1',
          color: 'rgb(38, 178, 81)',
        },
        '-1': {
          icon: 'icon_ospreloadtime1',
          color: 'rgb(244, 20, 20)',
        },
      },
      lldList: [], // LLD任务单列表
      buildList: [], // build任务单列表
      progressList: [], // 进度列表
      currentPage: 1,
      total: 10,
      designType: '', // 选择的设计模式的值
      mode: '', // 设计模式
      selectedTaskId: '',
    };
  },
  created() {},

  mounted() {
    if (!this.projectInfo.mapNo) {
      queryMapNoByProjectId(this.projectInfo.projectId).then(result => {
        this.projectInfo.mapNo = result.resultData;
      });
    }
    if (Object.keys(this.taskInfo).length === 0) {
      this.init();
    }
    fish.once('versionConfire', this.init, this);
  },
  methods: {
    async init(stop) {
      const param = {
        projectId: this.projectInfo.sprintId,
        taskType: 'HLD',
        currentFlag: true,
      };
      const hldResult = await getSchemaInfo(param);
      if (hldResult && hldResult.resultList && hldResult.resultList.length > 0) {
        const taskInfo = hldResult.resultList[0];
        this.orderId = hldResult.resultList[0].orderId;
        this.$set(this.taskInfo, 'title', taskInfo.title);
        this.$set(this.taskInfo, 'hdUserName', taskInfo.hdUserName);
        this.$set(this.taskInfo, 'stateDesc', taskInfo.stateDesc);
        this.taskInfo.projectId = taskInfo.projectId;
        this.taskInfo.taskId = taskInfo.taskId;
        this.taskInfo.state = taskInfo.state;
        // this.taskInfo = data.resultList[0];
        if (taskInfo.state === 'C') {
          const lldParam = {
            projectId: this.projectInfo.sprintId,
            taskType: 'LLD',
          };
          this.currentPage = 1;
          this.getBuild();
          const lldResult = await getSchemaInfo(lldParam);
          if (lldResult && lldResult.resultList && lldResult.resultList.length > 0) {
            this.lldList = lldResult.resultList;
          }
        } else if (taskInfo.state === 'H' && !stop) {
          this.searchProgressList();
        }
        this.getOrderMode();
      }
    },
    autoHld() {
      const menuParams = {
        choose: 'AutoHLDGeneration',
        projectInfo: {
          projectId: this.taskInfo.projectId,
          sprintId: this.taskInfo.projectId,
          schemaId: this.taskInfo.taskId,
          mapNo: this.projectInfo.mapNo,
          projectName: this.projectInfo.projectName,
          taskName: this.taskInfo.title,
          regionId: this.projectInfo.regionId, // resForm需要用到的参数
          regionName: this.projectInfo.regionName, // resForm需要用到的参数
        },
      };
      this.$root.$emit('openMenu', `autoHLDGeneration${this.taskInfo.taskId}`, 'Auto_HLD_Generation', menuParams);
    },
    manuallyAdjust(row, type) {
      console.log(row);
      let menuName;
      if (type === 'edit') {
        menuName = this.$t('E_OSP_DESIGN_MANUALLY_DESIGN');
      } else if (type === 'view') {
        menuName = this.$t('E_OSP_DESIGN_HLD_VIEW');
      }
      const menuParams = {
        choose: 'HldDesign',
        projectInfo: {
          projectId: this.taskInfo.projectId,
          sprintId: this.taskInfo.projectId,
          schemaId: this.taskInfo.taskId,
          mapNo: this.projectInfo.mapNo,
          projectName: this.projectInfo.projectName,
          taskName: this.taskInfo.title,
          regionId: this.projectInfo.regionId, // resForm需要用到的参数
          regionName: this.projectInfo.regionName, // resForm需要用到的参数
          viewType: type,
        },
      };
      if (row) {
        menuParams.projectInfo.schemaId = row.taskId;
        menuParams.projectInfo.taskName = row.title;
        menuParams.projectInfo.networkLevel = row.networkLevel;
        menuName = row.title;
      }
      this.$root.$emit('openMenu', `design${menuParams.projectInfo.schemaId}`, menuName, menuParams);
    },
    dsChooseUser() {},
    reAssign() {
      this.$refs.user.init();
    },
    confirm() {
      const param = {
        projectId: this.taskInfo.projectId,
        taskId: this.taskInfo.taskId,
      };
      addLldTask(param).then(() => {
        this.init();
      });
    },
    searchProgressList() {
      queryTaskProgress(this.taskInfo.taskId, 'LLD decompose').then(data => {
        let notComplete = false;
        (data.resultData || []).forEach(it => {
          if (it.operationTraceEntityList && it.operationTraceEntityList.length) {
            notComplete = it.operationTraceEntityList.some(item => item.traceStatus !== '2' && item.traceStatus !== '-1');
          } else {
            notComplete = false;
          }
        });
        this.progressList = data.resultData || [];
        if (notComplete) {
          setTimeout(() => {
            this.searchProgressList();
          }, 10000);
        } else {
          this.init(true);
        }
      });
    },

    hldBom() {
      const projectInfo = {
        sprintId: this.taskInfo.projectId,
        schemaId: this.taskInfo.taskId,
      };
      this.$refs.HLDBom.initData(projectInfo);
    },

    currentChange(currentPage) {
      this.currentPage = currentPage;
      this.getBuild();
    },
    getBuild() {
      const pageSize = this.hideOther && !this.hideBuild ? 20 : 10;
      const buildParam = {
        projectId: this.projectInfo.sprintId,
        pageFlag: 'Y',
        pageIndex: this.currentPage,
        pageSize,
      };
      getBuildTaskList(buildParam).then(buildResult => {
        if (buildResult && buildResult.resultList && buildResult.resultList.length > 0) {
          this.total = buildResult.total;
          this.buildList = buildResult.resultList;
        }
      });
    },
    getOrderMode() {
      queryOrderMode(this.orderId).then(res => {
        if (res.length > 0) {
          this.mode = res[0].attrValue;
        }
      });
    },
    // 选择设计类型：手动或者自动
    changeDesignType(val) {
      this.$confirm(this.$t('E_OSP_DESIGN_SELECT_MODE_TIP'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      })
        .then(() => {
          console.log(val);
          const ordExtList = [
            {
              attrCode: 'HLD_MODE',
              attrValue: val,
            },
          ];
          getSchemaInfo({
            projectId: this.projectInfo.sprintId,
            taskType: 'HLD',
            currentFlag: true,
          }).then(res => {
            const orderId = res.resultList[0] && res.resultList[0].orderId;
            const param = {
              orderId,
              ordExtList,
            };
            addOrderMode(param).then(res2 => {
              if (res2.success) {
                this.mode = val;
              }
            });
          });
        })
        .catch(() => {
          this.designType = '';
        });
    },
    // 展示对应的lld设计的施工单和Bom
    showConstructionAndBom(row) {
      this.selectedTaskId = row.taskId;
      const projectInfo = {
        projectId: row.projectId,
        taskId: row.taskId,
      };
      this.$refs.lldBom.initData({ schemaId: row.taskId });
      this.$refs.constructionList.initData(projectInfo);
    },
    tableRowClassName({ row }) {
      if (this.selectedTaskId === row.taskId) {
        return 'selected-row';
      }
      return '';
    },
  },
  watch: {
    hideOther(val) {
      if (val && !this.hideBuild) {
        this.getBuild();
      }
    },
  },
  destroyed() {
    fish.off('versionConfire', this.init, this);
  },
};
</script>
<style lang="scss" scoped>
@import './design.scss';
</style>
