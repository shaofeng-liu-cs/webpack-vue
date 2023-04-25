<template>
  <div class="auto-container">
    <span class="sys-card-box left-content">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('E_OSP_DESIGN_HLD_VERSION_LIST') }}
        </span>
        <span class="right-options">
          <el-dropdown trigger="click" placement="bottom" @command="addVersionFn">
            <span class="el-dropdown-link cursor-hover">
              <div class="icon_osp icon_ospfangda"></div>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="auto">{{ $t('E_OSP_DESIGN_ONLINE') }}</el-dropdown-item>
              <el-dropdown-item command="zip">{{ $t('E_OSP_DESIGN_OFFLINE') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <i class="icon_osp icon_ospshuchuwuguanli m-l-small cursor-hover" @click="stateClick({ importStatus: 'D' })"></i>
          <!-- <i class="icon_osp icon_ospshanchu1 m-l-small cursor-hover"></i> -->
        </span>
      </div>
      <div class="panel-content">
        <Search v-model="searchValue"></Search>
        <div class="content-table">
          <el-table :data="versionList" highlight-current-row border style="width: 100%" height="100%" @current-change="stateClick">
            <el-table-column prop="version" :label="$t('E_OSP_DESIGN_VERSION')" width="90"></el-table-column>
            <el-table-column prop="stateDate" :label="$t('E_OSP_DESIGN_STATE_DATE')"></el-table-column>
            <el-table-column :label="$t('PROJECT_STATE')" width="90">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="stateClick(scope.row)">{{ scope.row.importStatusName }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </span>

    <span class="sys-card-box right-content">
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('E_OSP_DESIGN_INPUT_PARAMETERS') }}
        </span>
      </div>
      <div v-show="rightCode === 'zip'" class="box-content">
        <el-scrollbar>
          <div class="import-container">
            <GeoJsonImport ref="geoImport" @stateChange="stateChange"></GeoJsonImport>
          </div>
          <div>
            <el-image v-if="!!selVersion.imgPath" class="map-ver" :src="selVersion.imgPath"></el-image>
            <div v-else ref="verMap" class="map-ver"></div>
          </div>
          <div v-if="selVersion.importStatus === 'S'" class="import-footer">
            <button type="button" class="btn btn-primary" @click="manuallyAdjust">{{ $t('E_OSP_DESIGN_HLD_VIEW') }}</button>
          </div>
        </el-scrollbar>
      </div>
      <div v-show="rightCode === 'detail'" class="box-content">
        <el-scrollbar>
          <VersionList ref="verList"> </VersionList>
        </el-scrollbar>
      </div>
      <div v-show="rightCode === 'auto'" class="box-content"></div>
    </span>
  </div>
</template>

<script>
// import HldDesign from '@/oss_core/edesign/osp/design/hldDesign/HldDesign.vue';

import { queryVersion, getResTypeConfig } from '@/oss_core/edesign/api/query/schema.js'; // 后台接口
import { addVersion } from '@/oss_core/edesign/api/add/schema.js'; // 后台接口
import { editVersionImg } from '@/oss_core/edesign/api/edit/schema.js'; // 后台接口
import { getStyleConfig } from '@/oss_core/edesign/api/query/sprint.js'; // 后台接口
import { uploadFileEdn } from '@/oss_core/edesign/api/add/project.js'; // 后台接口

import { mapToPng } from '@/oss_core/base/utils/mapUtil.js'; // 加载地图方法
import GeoJsonImport from '@/oss_core/edesign/osp/sidebar/designImport/geoJsonImport/GeoJsonImport.vue'; // 组件
import VersionList from './versionList/VersionList.vue'; // 组件

export default {
  name: 'AutoHLDGeneration',
  components: {
    // HldDesign,
    GeoJsonImport,
    VersionList,
  },
  inject: ['defaultStyle'],
  provide() {
    return {
      getProjectInfo: () => this.versionInfo, // 设计任务详情
      getOldSchemaId: () => this.projectInfo.schemaId, // 设计任务详情
      // getResourceList: () => this.resourceList, // 获取资源列表
      // getStyleConfigObj: () => this.styleConfigObj, // 获取样式配置
    };
  },
  props: {
    projectInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      searchValue: '',
      // importTypeCode: 'zip', //zip包导入  auto走Xcity自动导入
      rightCode: '', // zip包导入  auto走Xcity自动导入
      versionList: [], // 版本列表
      versionInfo: {}, // 版本信息
      selVersion: {}, // 当前展示版本
    };
  },
  created() {
    // this.row = JSON.parse(JSON.stringify(this.rowData));
  },

  mounted() {
    this.versionInfo = JSON.parse(JSON.stringify(this.projectInfo)); // 版本信息
    this.resourceList = [];
    this.styleConfigObj = {}; // 深度拷贝防止影响defaultStyle原始数据
    this.init();
  },
  methods: {
    init() {
      this.initDetail = false;
      const param = {
        parentTaskId: this.projectInfo.schemaId,
        currentFlag: false,
      };
      queryVersion(param).then(data => {
        this.versionList = data.resultList || [];
        if (this.versionList.length > 0) {
          this.versionList.forEach((item, index) => {
            item.version = `Version${index + 1}`;
          });
        }
        // console.log(data);
      });
    },
    addVersionFn(type) {
      const versionInfo = this.versionList.find(item => item.importStatus === 'I' || item.importStatus === 'P');
      if (versionInfo) {
        this.$message({
          message: `${versionInfo.version} status is ${versionInfo.importStatusName}`,
          type: 'warning',
        });
        return;
      }
      const param = {
        parentTaskId: this.projectInfo.schemaId,
        createMode: type === 'auto' ? 1 : 2,
      };
      addVersion(param).then(() => {
        this.init();
        // console.log(data);
      });
    },
    async stateClick(row) {
      if (row.taskId) {
        this.versionInfo.schemaId = row.taskId;
        this.selVersion = row;
        this.$refs.geoImport.init();
      }
      let noImg;
      switch (row.importStatus) {
        case 'I':
        case 'P':
        case 'S':
        case 'E':
          this.rightCode = 'zip';
          if (row.importStatus === 'S' && !row.imgPath) {
            this.mapToPngFn();
          }
          break;
        case 'D':
          this.rightCode = 'detail';
          noImg = this.versionList.some(ver => !ver.imgPath);
          noImg && (await this.getConfig()); // 没用图片提前获取配置信息

          !this.initDetail && this.$refs.verList.init(this.versionList, this.resourceList, this.styleConfigObj); // 不用重复初始化
          this.initDetail = true;
          break;
        default:
          break;
      }
    },
    stateChange(importStatus, importStatusName) {
      // const versionInfo = this.versionList.find(item => item.taskId === schemaId);
      // versionInfo.state = state;
      // versionInfo.importStatusName = importStatusName;
      this.selVersion.importStatus = importStatus;
      this.selVersion.importStatusName = importStatusName;
      if (importStatus === 'S' && !this.selVersion.imgPath) {
        this.mapToPngFn();
      }
      if (importStatus === 'S' && this.rightCode === 'detail') {
        this.$refs.verList.init(this.versionList, this.resourceList, this.styleConfigObj); // 不用重复初始化
      } else {
        this.initDetail = false;
      }
    },
    manuallyAdjust() {
      const menuName = this.$t('E_OSP_DESIGN_MANUALLY_DESIGN');
      const projectInfo = this.versionInfo;
      projectInfo.viewType = 'view';
      const menuParams = {
        choose: 'HldDesign',
        projectInfo,
      };
      this.$root.$emit('openMenu', `design${menuParams.projectInfo.schemaId}`, menuName, menuParams);
    },

    // 获取配置文件
    async getConfig() {
      if (this.resourceList.length === 0 || Object.keys(this.styleConfigObj).length === 0) {
        let resourceList = [];
        const styleConfigObj = JSON.parse(JSON.stringify(this.defaultStyle)); // 深度拷贝防止影响defaultStyle原始数据
        const resResult = getResTypeConfig(this.projectInfo.sprintId);
        const styleResult = getStyleConfig({ sprintId: this.projectInfo.sprintId });
        const resTypeConfig = (await resResult).resultList || []; // 任务单所有资源类型列表 包括：A在网 C当前设计 R非当前设计
        const getStyleList = (await styleResult) || [];
        resourceList = resTypeConfig.filter(
          res => res.layerType === 'C' && this.defaultStyle[res.resType].geometryType !== this.$map.GeometryType.POINT,
        );
        resourceList.forEach(res => {
          const queryStyle = getStyleList.find(style => style.layerNo === res.layerNo);
          if (queryStyle && queryStyle.styleJson) {
            const style = JSON.parse(queryStyle.styleJson);
            if (style.gisLayerThemeList && style.gisLayerThemeList.length > 0) {
              style.gisLayerThemeList.forEach(gisLayerTheme => {
                gisLayerTheme.gisLayerThemeItemList.forEach(element => {
                  element.themeItemDef = JSON.stringify(element.themeItemDef);
                });
              });
            }
            styleConfigObj[res.resType] = style; // 有配置就读配置
          }
        });
        this.resourceList = resourceList;
        this.styleConfigObj = styleConfigObj;
      }
    },
    async mapToPngFn() {
      await this.getConfig();
      const child = this.selVersion;
      const projectInfo = JSON.parse(JSON.stringify(this.projectInfo));
      const el = this.$refs.verMap;
      const elLoad = this.$loading({
        target: el,
        background: 'rgba(0,0,0,0.7)',
      });
      projectInfo.schemaId = child.taskId;
      mapToPng(projectInfo, this.resourceList, this.styleConfigObj, el, child.version).then(file => {
        // console.log(file);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFileEdn(uploadFormData).then(data => {
          const url = `edesign/file/download?fileName=${data.filePath.substr(1)}/${data.fileName}`;
          const param = {
            taskId: child.taskId,
            imgPath: url,
          };
          editVersionImg(param).then(() => {
            elLoad.close();
            child.imgPath = url;
          });
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import './autoHLDGeneration.scss';
</style>
