<template>
  <el-scrollbar>
    <div class="panel-body">
      <div class="select-v">
        <div class="select-list-container">
          <!-- <el-radio-group v-model="selectV">
          <el-radio v-for="(item,index) in versionList" :key="index" :label="item.taskId">{{item.version}}</el-radio>
        </el-radio-group> -->
          <div v-for="(item, index) in versionList" :key="index">
            <el-image v-if="!!item.imgPath" class="map-ver" :src="item.imgPath"></el-image>
            <!-- <div data-v-900f56e8="" class="el-image map-ver" v-if="!!item.imgPath">
              <img :src="item.imgPath" class="el-image__inner">
            </div> -->
            <div v-else :ref="item.version" class="map-ver"></div>
            <el-radio v-model="selectV" :label="item.taskId">{{ item.version }}</el-radio>
            <div class="version-cost">
              <span class="cost-desc">{{ $t('E_OSP_DESIGN_COST') }} {{ item.price }}</span>
            </div>
          </div>
          <div class="flex-empty-div"></div>
          <div class="flex-empty-div"></div>
          <div class="flex-empty-div"></div>
          <div class="flex-empty-div"></div>
          <div class="flex-empty-div"></div>
        </div>
        <div class="sel-btn">
          <el-button type="primary" size="medium" :disabled="!selectV" @click="submit">{{ $t('E_OSP_DESIGN_SELECT_VERSION') }}</el-button>
        </div>
      </div>
      <div class="bom">
        <JustTab :options="tasOptions" v-model="tapName"></JustTab>
        <div class="m-t-lg" key="Material" v-if="tapName === 'Material'">
          <el-table :data="materialList" border style="width: 100%">
            <el-table-column prop="designElement" label="Design Element" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="Unit" min-width="60"></el-table-column>
            <el-table-column
              v-for="item in versionList"
              :key="item.taskId"
              :prop="item.taskId"
              :label="item.version"
              min-width="60"
            ></el-table-column>
          </el-table>
        </div>
        <div class="m-t-lg" key="Construction" v-if="tapName === 'Construction'">
          <el-table :data="constructionList" border style="width: 100%">
            <el-table-column prop="designElement" label="Material" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="Unit" min-width="60"></el-table-column>
            <el-table-column
              v-for="item in versionList"
              :key="item.taskId"
              :prop="item.taskId"
              :label="item.version"
              min-width="60"
            ></el-table-column>
          </el-table>
        </div>
        <div class="m-t-lg" key="ManHours" v-if="tapName === 'ManHours'">
          <el-table :data="manHoursList" border style="width: 100%">
            <el-table-column prop="designElement" label="Material" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="Unit" min-width="60"></el-table-column>
            <el-table-column
              v-for="item in versionList"
              :key="item.taskId"
              :prop="item.taskId"
              :label="item.version"
              min-width="60"
            ></el-table-column>
          </el-table>
        </div>
        <div class="m-t-lg" key="Tools" v-if="tapName === 'Tools'">
          <el-table :data="toolsList" border style="width: 100%">
            <el-table-column prop="designElement" label="Material" min-width="130"></el-table-column>
            <el-table-column prop="unit" label="Unit" min-width="60"></el-table-column>
            <el-table-column
              v-for="item in versionList"
              :key="item.taskId"
              :prop="item.taskId"
              :label="item.version"
              min-width="60"
            ></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>
<script>
import { queryBomList, qrySuppliecBom, queryVersion } from '@/oss_core/edesign/api/query/schema.js'; // 后台接口
import { editVersionImg, versionConfirm } from '@/oss_core/edesign/api/edit/schema.js'; // 后台接口
import { uploadFileEdn } from '@/oss_core/edesign/api/add/project.js'; // 后台接口

import { mapToPng } from '@/oss_core/base/utils/mapUtil.js'; // 加载地图方法

export default {
  name: 'VersionList',
  components: {
    // HldDesign,
    // GeoJsonImport,
  },
  inject: ['defaultStyle', 'getProjectInfo', 'getOldSchemaId'],
  data() {
    return {
      tasOptions: [
        { code: 'Material', name: this.$t('E_OSP_DESIGN_MATERIAL') },
        { code: 'Construction', name: this.$t('E_OSP_DESIGN_CONSUMABLE_MATERIALS') },
        { code: 'ManHours', name: this.$t('E_OSP_DESIGN_MAN_HOURS') },
        { code: 'Tools', name: this.$t('E_OSP_DESIGN_TOOLS') },
      ],
      selectV: '', // 选中的版本
      materialList: [], // bom信息对比列表
      constructionList: [], // bom信息对比列表
      manHoursList: [], // bom信息对比列表
      toolsList: [], // bom信息对比列表
      versionList: [], // 主要导入成功的版本信息
      tapName: 'Material',
    };
  },
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
  },

  watch: {
    tapName: {
      immediate: true,
      handler(val) {
        if (val === 'Construction' && !this.qryC) {
          const SuppliecBomParam = {
            suppType: 'C',
            taskIdList: this.taskIdList,
          };
          qrySuppliecBom(SuppliecBomParam).then(data => {
            this.qryC = true;
            this.constructionList = data.data;
            if (this.versionList[0].price === '0') {
              const param = {
                parentTaskId: this.projectInfo.schemaId,
                currentFlag: false,
              };
              queryVersion(param).then(res => {
                this.versionList = res.resultList || [];
                if (this.versionList.length > 0) {
                  this.versionList.forEach((item, index) => {
                    item.version = `Version${index + 1}`;
                  });
                }
              });
            }
          });
        } else if (val === 'ManHours' && !this.qryM) {
          const SuppliecBomParam = {
            suppType: 'M',
            taskIdList: this.taskIdList,
          };
          qrySuppliecBom(SuppliecBomParam).then(data => {
            this.qryM = true;
            this.manHoursList = data.data;
          });
        } else if (val === 'Tools' && !this.qryT) {
          const SuppliecBomParam = {
            suppType: 'T',
            taskIdList: this.taskIdList,
          };
          qrySuppliecBom(SuppliecBomParam).then(data => {
            this.qryT = true;
            this.toolsList = data.data;
          });
        }
      },
    },
  },
  created() {},

  mounted() {
    this.taskIdList = [];
  },

  methods: {
    init(versionList, resourceList, styleConfigObj) {
      this.selectV = '';
      this.materialList = [];
      this.versionList = [];
      const noImg = [];
      versionList.forEach(ver => {
        if (ver.importStatus === 'S') {
          this.taskIdList.push(ver.taskId);
          this.versionList.push(ver);
          !ver.imgPath && noImg.push(ver);
        }
      });
      this.$nextTick(() => {
        if (noImg.length > 0) {
          noImg.forEach(item => {
            const versionEl = this.$refs[item.version][0];
            item.elLoad = this.$loading({
              target: versionEl,
              background: 'rgba(0, 0, 0, 0.7)',
            });
          });
          const index = 0;
          this.mapToPngFn(noImg, index, resourceList, styleConfigObj);
        }
      });
      queryBomList(this.taskIdList).then(data => {
        this.materialList = data;
      });
      // this.versionList.forEach(item => {
      //   const projectInfo = JSON.parse(JSON.stringify(this.projectInfo));
      //   const el = this.$refs[item.version][0];
      //   this.$loading({
      //     target: el,
      //     spinner: 'osp',
      //     background: 'rgba(0,0,0,0)',
      //   });
      //   projectInfo.schemaId = item.taskId;
      //   mapToPng(projectInfo, resourceList, styleConfigObj, el, item.version);
      // });
    },
    mapToPngFn(noImg, index, resourceList, styleConfigObj) {
      const child = noImg[index];
      const projectInfo = JSON.parse(JSON.stringify(this.projectInfo));
      const el = this.$refs[child.version][0];
      // const elLoad = this.$loading({
      //   target: versionEl,
      // });
      projectInfo.schemaId = child.taskId;
      mapToPng(projectInfo, resourceList, styleConfigObj, el, child.version).then(file => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFileEdn(uploadFormData).then(data => {
          // const url = 'edesign/file/download?fileName=' + encodeURIComponent(data.filePath + '/' + data.fileName);
          const url = `edesign/file/download?fileName=${data.filePath.substr(1)}/${data.fileName}`;
          const param = {
            taskId: child.taskId,
            imgPath: url,
          };
          editVersionImg(param).then(() => {
            child.elLoad.close();
            child.imgPath = url;
            // eslint-disable-next-line no-plusplus, no-param-reassign
            index++;
            if (noImg.length > index) {
              this.mapToPngFn(noImg, index, resourceList, styleConfigObj);
            }
          });
        });
      });
    },
    submit() {
      const param = {
        taskId: this.selectV,
      };
      versionConfirm(param).then(() => {
        this.$root.$emit('closeMenu', `autoHLDGeneration${this.getOldSchemaId()}`);
        fish.trigger('versionConfire');
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import './versionList.scss';
</style>
