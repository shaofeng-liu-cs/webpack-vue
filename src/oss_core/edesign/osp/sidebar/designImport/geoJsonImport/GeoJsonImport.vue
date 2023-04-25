<template>
  <div class="uk-content-box">
    <div class="file-upload-container">
      <div class="child-head-title">
        <span class="head-title">{{ $t('FILE_UPLOAD') }}</span>
      </div>
      <!-- <div class="file-upload-container-title sidebar-tab-title">{{ $t('FILE_UPLOAD') }}</div> -->
      <div class="file-loaction-body">
        <div class="file-loaction">{{ $t('FILE_LOCATION') }}:</div>
        <el-input v-model="fileName" class="file-loaction-name hasClss" ref="fileLoactionName" disabled="disabled"></el-input>
        <el-button :disabled="progressList.length > 0" type="primary" class="upload-zip-btn" size="mini" @click="uploadBtnClickZip">
          <i class="icon_osp icon_ospshengcheng"></i>{{ $t('UPLOAD') }}
        </el-button>
        <input type="file" @change="uploadZip" accept=".zip" class="upload-zip-input" ref="uploadZip" />
      </div>
    </div>
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
</template>

<script>
import { queryTaskProgress } from '@/oss_core/edesign/api/query/taskId.js';
import { addZip } from '@/oss_core/edesign/api/add/schema.js';

export default {
  name: 'GeoJsonImport',
  inject: ['getProjectInfo'],
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
  },
  data() {
    return {
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
      progressList: [],
      fileName: '', // 文件名
    };
  },
  mounted() {},
  methods: {
    init() {
      this.fileName = '';
      this.searchProgressList();
    },
    uploadBtnClickZip() {
      this.$refs.uploadZip.click();
    },
    uploadZip() {
      console.log(this.projectInfo);
      let uploadFormData = new FormData();
      let file = this.$refs.uploadZip.files[0];
      this.$refs.uploadZip.value = '';
      this.fileName = file.name;
      // this.$refs.fileLoactionName.value = file.name;
      uploadFormData.append('file', file);
      uploadFormData.append('projectId', this.projectInfo.sprintId);
      uploadFormData.append('taskId', this.projectInfo.schemaId);
      console.log(uploadFormData);
      addZip(uploadFormData).then(res => {
        console.log(res);
        this.searchProgressList();
      });
    },
    searchProgressList() {
      queryTaskProgress(this.projectInfo.schemaId, 'Design Import').then(res => {
        let isjixu = false;
        (res.resultData || []).map(it => {
          if (it.operationTraceEntityList && it.operationTraceEntityList.length) {
            let isEnd = it.operationTraceEntityList.some(item => item.traceStatus !== '2' && item.traceStatus !== '-1');
            if (isEnd) {
              //找到没处理完成的，需要继续查询
              isjixu = true;
              this.$emit('stateChange', 'P', 'Processing', this.projectInfo.schemaId);
            } else {
              let isErr = it.operationTraceEntityList.some(item => item.traceStatus === '-1');
              if (isErr) {
                this.$emit('stateChange', 'E', 'Error', this.projectInfo.schemaId);
              } else {
                this.$emit('stateChange', 'S', 'Successful', this.projectInfo.schemaId);
                this.$root.$emit('refreshMap');
              }
            }
          } else {
            isjixu = true;
          }
        });
        this.progressList = res.resultData || [];
        if (isjixu) {
          setTimeout(() => {
            this.searchProgressList();
          }, 10000);
        }
      });
    },
  },
  // watch: {
  //   'projectInfo.schemaId'(val, oldVal) {
  //     this.searchProgressList();
  //   },
  // },
};
</script>

<style lang="scss" scoped>
@import './geoJsonImport.scss';
</style>
