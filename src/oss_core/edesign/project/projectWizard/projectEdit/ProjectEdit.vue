<template>
  <div class=" handleEditProjectBox">
    <div class="project-edit-loading">
      <div class="blockUI ui-widget-overlay " tabindex="0" style="position: fixed; z-index: 100100"></div>
      <div class="blockUI  blockPage" style="position: fixed; z-index: 100110; margin-left: -60.5px;">
        <span class="loading"></span>
        <span class="blockUI-content ">
          {{ $t('LOADING') }}
        </span>
      </div>
    </div>
    <div class="edit-content-body">
      <div class="editProjectFromBox">
        <el-scrollbar>
          <el-form ref="editForm" class="form-content-box" label-position="top" :model="formValue" :rules="rules">
            <div class="box-head-title">
              <span class="left-title">
                {{ $t('PROJECT_BASIC_INFROMATION') }}
              </span>
            </div>
            <div class="form-it-list">
              <span class="form-it-span">
                <el-form-item prop="projectName" :label="$t('E_PROJECTDETAIL_NAME')">
                  <el-input size="mini" v-model="formValue.projectName" data-csname="projectName" :disabled="isDisabled"></el-input>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="interOrderId" :label="$t('PROJECT_INTER_ORDER_ID')">
                  <span class="disable-label" v-if="isDisabled">{{ formValue.interOrderId || '-' }}</span>
                  <el-input size="mini" v-else v-model="formValue.interOrderId" data-csname="interOrderId"></el-input>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="operationType" :label="$t('E_PROJECTDETAIL_TYPE')">
                  <el-select data-csname="operationType" v-model="formValue.operationType" :placeholder="$t('PLEASE_SELECT')" :disabled="isDisabled">
                    <el-option v-for="item in proTypeSettingData" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                  </el-select>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="regionId" :label="$t('REGION')">
                  <el-select
                    filterable
                    data-csname="regionId"
                    v-model="formValue.regionId"
                    :placeholder="$t('PLEASE_SELECT')"
                    :disabled="isDisabled || !!projectInfo.projectId"
                    @change="changeArea"
                  >
                    <el-option v-for="item in citySettingData" :key="item.AREA_ID" :label="item.AREA_NAME" :value="item.AREA_ID"> </el-option>
                  </el-select>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="projectDesc" :label="$t('OSP_TASK_DESCRIPTION')">
                  <span class="disable-label" v-if="isDisabled">{{ formValue.projectDesc || '-' }}</span>
                  <el-input size="mini" v-model="formValue.projectDesc" data-csname="projectDesc" v-else></el-input>
                </el-form-item>
              </span>
            </div>

            <div class="box-head-title">
              <span class="left-title">
                {{ $t('PROJECT_TARGET') }}
              </span>
            </div>
            <div class="form-it-list">
              <span class="form-it-span">
                <el-form-item prop="extHpType" :label="$t('PROJECT_HP_TYPE')">
                  <el-select data-csname="extHpType" v-model="formValue.extHpType" :placeholder="$t('PLEASE_SELECT')" :disabled="isDisabled">
                    <el-option v-for="item in hpTypeSettingData" :key="item.code" :label="item.name" :value="item.code"> </el-option>
                  </el-select>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="extHpRedundancyRatio" :label="$t('PROJECT_HP_REDUNDANCY_RATIO')" class="is-required">
                  <el-input
                    size="mini"
                    type="number"
                    v-model="formValue.extHpRedundancyRatio"
                    data-csname="extHpRedundancyRatio"
                    :disabled="isDisabled"
                  ></el-input>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="extCoverHps" :label="$t('PROJECT_COVER_HPS')" class="is-required">
                  <el-input
                    size="mini"
                    type="number"
                    v-model="formValue.extCoverHps"
                    data-csname="extCoverHps"
                    @change="hpsChange"
                    :disabled="isDisabled"
                  ></el-input>
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="extUserDensity" :label="$t('PROJECT_USER_DENSITY')">
                  <span class="disable-label">{{ formValue.extUserDensity || '-' }}</span>
                  <!-- <el-input size="mini" v-model="formValue.extUserDensity" data-csname="extUserDensity" :disabled="true"></el-input> -->
                </el-form-item>
              </span>
              <span class="form-it-span">
                <el-form-item prop="extCoverageArea" :label="`${$t('PROJECT_COVERAGE_AREA')}(KM²)`">
                  <span class="disable-label">{{ formValue.extCoverageArea || '-' }}</span>
                  <!-- <el-input size="mini" v-model="formValue.extCoverageArea" data-csname="extCoverageArea" :disabled="true"></el-input> -->
                </el-form-item>
              </span>
              <span class="form-it-span" v-if="projectInfo.projectId">
                <el-form-item prop="extNumberOfMdu" :label="$t('PROJECT_NUMBER_OF_MDU')">
                  <span class="disable-label">{{ formValue.extNumberOfMdu || '-' }}</span>
                  <!-- <el-input size="mini" v-model="formValue.extNumberOfMdu" data-csname="extNumberOfMdu" :disabled="true"></el-input> -->
                </el-form-item>
              </span>
              <span class="form-it-span" v-if="projectInfo.projectId">
                <el-form-item prop="extNumberOfSdu" :label="$t('PROJECT_NUMBER_OF_SDU')">
                  <span class="disable-label">{{ formValue.extNumberOfSdu || '-' }}</span>
                  <!-- <el-input size="mini" v-model="formValue.extNumberOfSdu" data-csname="extNumberOfSdu" :disabled="true"></el-input> -->
                </el-form-item>
              </span>
              <span class="form-it-span" v-if="projectInfo.projectId">
                <el-form-item prop="extNumberOfBuilding" :label="$t('PROJECT_NUMBER_OF_BUILDING')">
                  <span class="disable-label">{{ formValue.extNumberOfBuilding || '-' }}</span>
                  <!-- <el-input size="mini" v-model="formValue.extNumberOfBuilding" data-csname="extNumberOfBuilding" :disabled="true"></el-input> -->
                </el-form-item>
              </span>
            </div>

            <div class="box-head-title">
              <span class="left-title">
                {{ $t('PROJECT_ATTACHMENT') }}
              </span>
              <span class="right-btn" v-if="!isDisabled">
                <el-button type="primary" size="mini2" @click="uploadFile" data-csname="uploadFiles">{{ $t('UPLOAD') }}</el-button>
                <input type="file" name="upfile" id="uploadFileInput" style="display:none;" @change="chooseFile" :disabled="isDisabled" />
              </span>
            </div>
            <div class="upload-files">
              <span class="fileItem" v-for="(file, i) in projectInfo.projectDocList" :key="i">
                <span class="fileContent">
                  <span class="fileName">{{ file.docName }}</span>
                  <i v-if="!isDisabled" class="icon_osp icon_ospclose closeIcon" :data-csname="`uploadFiles_${i}`" @click="removeFile(i)"></i>
                </span>
              </span>
              <el-empty
                v-if="!projectInfo.projectDocList || !projectInfo.projectDocList.length"
                style="padding:0;"
                image="oss_core/edesign/assets/image/no_data.png"
                :image-size="40"
                :description="$t('NO_DATA')"
              ></el-empty>
            </div>
          </el-form>
        </el-scrollbar>
      </div>
      <div class="planProjectBox">
        <div class="fromItemCard flex">
          <div class="cardContent planMapContentBox" :class="{ ospdisable: projectInfo.projectId }">
            <div style="width:100%;height:100%;" class="plan-container" ref="plan-container">
              <div id="osp"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="editProBtns">
      <el-button type="primary" size="mini" @click="saveFunc" v-if="!isDisabled" data-csname="projectEditSubmit"> {{ $t('NEXT') }}</el-button>
      <el-button type="primary" size="mini" @click="toNext" v-else data-csname="projectEditSubmit"> {{ $t('NEXT') }}</el-button>
    </div>
  </div>
</template>

<script>
import { queryDictList, qryProjectRegion, queryProjectDetail, queryMapNoByProjectId } from '@/oss_core/edesign/api/query/project.js';
import { insertProjectManagementData, addProjectImg } from '@/oss_core/edesign/api/add/project.js';
import { modifyProjectManagementData } from '@/oss_core/edesign/api/edit/project.js';
import { getAreaById } from '@/oss_core/edesign/api/query/address.js';
import html2canvas from 'html2canvas';

export default {
  name: 'ProjectEdit',
  components: {},
  inject: ['getControlData', 'getProjectInfo', 'getStepMaxNum'],
  data() {
    return {
      controlData: this.getControlData(),
      saveLoading: false,
      selecetResType: '',
      planGridParams: {},
      citySettingData: [],
      proTypeSettingData: [],
      hpTypeSettingData: [
        { name: 'P2P', code: 'P2P' },
        { name: 'P2MP', code: 'P2MP' },
      ],
      projManagerSetting: {
        name: '',
        code: '',
      }, //选择用户需要的绑定数据
      dsManagerSetting: {
        name: '',
        code: '',
      }, //选择用户需要的绑定数据
      projectInfo: this.getProjectInfo() || {},
      isDisabled: this.getStepMaxNum() > 2,
      // imgurl2: '',缩略图
      // imgurl: '',大图
      isCoverImgUpload: '', //上传图片判断用
      formValue: {},
      rules: {
        projectName: [{ required: true, message: this.$t('PLEASE_ENTER') }],
        regionId: [{ required: true, message: this.$t('PLEASE_SELECT') }],
        extHpRedundancyRatio: [{ validator: this.validateRatio }],
        extCoverHps: [{ validator: this.validateHps }],
        extHpType: [{ required: true, message: this.$t('PLEASE_SELECT') }],
      },
    };
  },
  created() {},
  mounted() {
    queryDictList('EDN.OPERATION.TYPE').then(res => {
      this.proTypeSettingData = res.resultList || [];
      qryProjectRegion().then(data => {
        this.citySettingData = data.resultData || [];
        this.initData();

        fish.require(
          [
            'oss_core/edesign/view/plan.js',
            'oss_core/edesign/assets/config/edesign/themeConfig.js',
            'oss_core/edesign/assets/config/plan/menuConfig.js',
            'oss_core/edesign/assets/config/edesign/styleConfig.js',
          ],
          (plan, theme, menu, style) => {
            let options = Object.assign(theme, menu, style, {
              modalConfig: {
                initFunc: this.planInitFunc,
                selectGrid: this.selectGrid,
                sprintId: this.projectInfo && this.projectInfo.projectId,
                isModal: true,
              },
            });
            this.planView = plan.main(options);
          },
        );
      });
    });
    window.saveCoverImg = this.saveCoverImg;
    this.initWebUploader();
  },
  methods: {
    initData() {
      this.projectInfo = {
        projManagerId: portal.appGlobal.attributes.userId || '1',
        dsManagerId: portal.appGlobal.attributes.userId || '1',
        projectCode: Math.random() * 100000000000000000000 + '',
        extHpType: 'P2P',
        operationType: 'GreenField',
        projectDesc: this.projectInfo.notes,
        ...this.projectInfo,
      };
      (this.projectInfo.projectExtInfoList || []).map(item => {
        this.projectInfo[item.attrCode] = item.attrValue;
      });
      this.projectInfo = JSON.parse(JSON.stringify(this.projectInfo));
      this.formValue = {
        ...this.projectInfo,
        regionId: this.projectInfo.regionId ? `${this.projectInfo.regionId}` : '',
      };
    },
    validateRatio(rule, value, callback) {
      if (!Number(value)) {
        callback(new Error(this.$t('PROJECT_HP_REDUNDANCY_RATIO_ERROR_MSG')));
      } else if (Number(value) < 0 || Number(value) > 100) {
        callback(new Error(this.$t('PROJECT_HP_REDUNDANCY_RATIO_ERROR_MSG')));
      } else {
        callback();
      }
    },
    validateHps(rule, value, callback) {
      if (!Number(value) || !Number.isInteger(Number(value))) {
        callback(new Error(this.$t('PROJECT_COVER_HPS_ERROR_MSG')));
      } else if (Number(value) < 1 || Number(value) > 100000) {
        callback(new Error(this.$t('PROJECT_COVER_HPS_ERROR_MSG')));
      } else {
        callback();
      }
    },
    hpsChange(val) {
      let value = this.formValue;
      if (value.extCoverageArea) {
        let midu = value.extCoverageArea ? parseFloat(parseFloat(val || 0) / parseFloat(value.extCoverageArea)) : '';
        this.formValue = {
          ...this.formValue,
          extUserDensity: midu ? midu.toFixed(3) : '',
        };
      }
    },
    planInitFunc(plan) {
      this.$planRef = plan;
    },

    selectGrid(graphic, params) {
      this.selectGraphic = graphic;
      this.planGridParams = params;
      if (!params) {
        return;
      }
      let value = this.formValue;
      if (value.extCoverHps) {
        let midu = params.extCoverageArea ? parseFloat(parseFloat(value.extCoverHps || 0) / parseFloat(params.extCoverageArea)) : '';
        this.formValue = {
          ...this.formValue,
          ...params,
          extUserDensity: midu ? midu.toFixed(3) : '',
        };
      } else {
        this.formValue = {
          ...this.formValue,
          ...params,
        };
      }
    },
    saveFunc() {
      console.log('提交...');
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.saveLoading = true;
          if (this.projectInfo && this.projectInfo.imgPath) {
            this.submitFunc();
          } else {
            console.log('截图开始...');
            this.saveCoverImg();
          }
        }
      });
    },
    submitFunc() {
      let value = this.formValue;
      value = {
        ...this.projectInfo,
        ...value,
      };
      delete value.upfile;
      let submitParams = { ...value };
      submitParams.projManagerId += '';
      submitParams.dsManagerId += '';
      submitParams.projectType = 'OPT';
      submitParams.prjDocList = (submitParams.projectDocList || []).map(item => {
        let newIt = {
          docPath: item.docPath,
          docType: item.docType,
          docName: item.docName,
        };
        if (item.docId) {
          newIt.docId = item.docId;
        }
        return newIt;
      });
      delete submitParams.projectDocList;
      let prjExtList = [];
      let extKeyList = ['extHpType', 'extHpRedundancyRatio', 'extCoverHps', 'extUserDensity', 'extCoverageArea'];
      for (let key in submitParams) {
        if (extKeyList.includes(key)) {
          prjExtList.push({
            attrCode: key,
            attrValue: submitParams[key],
          });
        }
      }
      prjExtList.forEach(it => {
        delete submitParams[it.attrCode];
      });
      submitParams.prjExtList = prjExtList;
      if (this.projectInfo && this.projectInfo.projectId) {
        //编辑模式

        submitParams = {
          ...this.projectInfo,
          ...submitParams,
        };
        modifyProjectManagementData(submitParams).then(data => {
          this.saveLoading = false;
          if (data.projectId) {
            this.$message({
              message: this.$t('SAVE_SUCCESS'),
              type: 'success',
            });
            this.controlData.soltName = 'DesignPreparation';
          } else {
            this.$message({
              message: data.errorMessage,
              type: 'warning',
            });
          }
        });
      } else {
        if (!this.selectGraphic) {
          this.$message({
            message: this.$t('PROJECT_SELECT_PROJECT_MSG'),
            type: 'warning',
          });
          this.projectInfo.imgPath = null;
          this.saveLoading = false;
          return;
        }
        submitParams.projectState = 'O'; //新建的工程状态为Open
        submitParams.designState = 'I'; //新建的设计状态为未开始
        submitParams.regionId += '';
        submitParams.partitionId = submitParams.regionId;
        submitParams.flowId = this.projectInfo.flowId;
        submitParams.gisKey = this.selectGraphic.attributes.gisKey;
        insertProjectManagementData(submitParams).then(data => {
          this.saveLoading = false;
          if (data.projectId) {
            this.projectInfo = {
              ...this.projectInfo,
              ...submitParams,
              projectId: data.projectId,
              hldPreTaskId: data.hldPreTaskId,
              projectExtInfoList: submitParams.prjExtList,
              notes: submitParams.projectDesc,
              projectDocList: submitParams.prjDocList,
            };
            this.selectGraphic.attributes = Object.assign(this.selectGraphic.attributes, {
              projectId: data.projectId,
              sprintId: data.projectId,
              resName: data.projectName,
            });

            this.$planRef.updateGridGeometry(this.selectGraphic); //更新gis元素的属性
            this.$root.$emit('updateOption', 'projectId', data.projectId);
            this.$emit('changeProjectInfo', this.projectInfo);
            this.$message({
              message: this.$t('SAVE_SUCCESS') + '!',
              type: 'success',
            });
            this.controlData.soltName = 'DesignPreparation';
          } else {
            this.$message({
              message: data.errorMessage,
              type: 'warning',
            });
            this.$planRef.clearTaskNoId && this.$planRef.clearTaskNoId();
          }
        });
      }
    },
    toNext() {
      this.controlData.soltName = 'DesignPreparation';
    },
    projChooseUser(user) {
      if (user && user.name && user.value) {
        this.projectInfo.projManagerId = user.value;
        this.projManagerSetting.code = user.value;
        this.projManagerSetting.name = user.name;
      }
    },
    dsChooseUser(user) {
      if (user && user.name && user.value) {
        this.projectInfo.dsManagerId = user.value;
        this.dsManagerSetting.code = user.value;
        this.dsManagerSetting.name = user.name;
      }
    },
    uploadFile() {
      if (this.isDisabled) {
        return;
      }
      $('#uploadFileInput').click();
    },
    saveCoverImg() {
      const mapContent = document.querySelector('.planProjectBox .map-container .ol-unselectable');
      console.log('截图参数：', mapContent);
      html2canvas(mapContent, {
        width: mapContent.clientWidth, //画布的宽
        height: mapContent.clientHeight, //画布的高
        scale: 1, //处理模糊问题
        useCORS: true, //开启跨域，这个是必须的
      })
        .then(canvas => {
          this.imgurl = canvas.toDataURL('image/png');
          const img = new Image();
          img.src = this.imgurl;
          img.onload = () => {
            const yscavas = document.createElement('canvas');
            yscavas.width = img.width / 2;
            yscavas.height = img.height / 2;
            const ctx = yscavas.getContext('2d');
            ctx.drawImage(img, 0, 0, yscavas.width, yscavas.height);
            this.imgurl2 = yscavas.toDataURL('image/jpeg');
            this.uploadFiles(this.imgurl);
          };
          img.onerror = () => {
            console.log('image加载失败...');
            this.submitFunc();
            this.saveLoading = false;
          };
        })
        .catch(() => {
          console.log('截图失败...');
          this.submitFunc();
          this.saveLoading = false;
        });
    },
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    uploadFiles(src) {
      this.isCoverImgUpload = this.isCoverImgUpload || 1;
      let file = this.dataURLtoBlob(src);
      this.uploader.addFiles([file]);
    },
    chooseFile(e) {
      // 上传附件
      let files = e.target.files;
      this.uploader.addFiles(files); //添加到上传文件队列中
      e.target.value = '';
    },
    initWebUploader() {
      let webuploader = require('webuploader');
      this.uploader = webuploader.create({
        swf: 'frm/fish-desktop/third-party/webupload/Uploader.swf',
        // server: portal.appGlobal.attributes.webroot + '/im/webgis/file/upload?moduleName=im&date=true&temporary=true', //上传接口地址
        server: portal.appGlobal.attributes.webroot + '/opb/file/upload?moduleName=im&date=true&temporary=true', //上传接口地址
      });

      //文件加入队列前的回调函数
      this.uploader.on('beforeFileQueued', file => {});
      //当文件被加入队列以后触发。
      this.uploader.on('fileQueued', file => {
        this.uploader.upload();
      });
      this.uploader.on('filesQueued', files => {
        this.uploader.upload();
      });
      // 文件上传过程中
      this.uploader.on('uploadProgress', (file, percentage) => {
        $.blockUI({ message: 'loading' }); // loading
      });
      // 文件上传成功
      this.uploader.on('uploadSuccess', (file, response) => {
        if (this.isCoverImgUpload) {
          this.coverPostFile(response);
        } else {
          this.postFile(response);
          $.unblockUI(); //  loading
          this.$message({
            message: this.$t('UPLOAD_SUCCESS'),
            type: 'success',
          });
        }
      });
      //文件上传错误
      this.uploader.on('uploadError', (file, reason) => {
        $.unblockUI(); //  loading
        this.saveLoading = false;
        this.$message({
          message: (reason && reason.message) || this.$t('AJAX_ERROR'),
          type: 'error',
        });
      });
      //文件上传完成
      this.uploader.on('uploadComplete', (file, response) => {
        this.uploader.removeFile(file, true);
      });
    },
    coverPostFile(reason) {
      const img_path = `${reason.filePath.substr(1)}/${reason.fileName}`;
      if (this.isCoverImgUpload === 1) {
        this.isCoverImgUpload = 2;
        this.projectInfo.imgPath = img_path;
        this.uploadFiles(this.imgurl2);
      } else if (this.isCoverImgUpload === 2) {
        this.isCoverImgUpload = 0;
        this.projectInfo.thumbnailPath = img_path;
        $.unblockUI(); //  loading
        this.submitFunc();
      }
    },
    postFile(reason) {
      let typest = reason.fileName.split('.');
      let path = encodeURIComponent(reason.filePath.slice(1) + '/' + reason.fileName);
      this.projectInfo.projectDocList = this.projectInfo.projectDocList || [];
      this.projectInfo.projectDocList.push({
        docPath: `${portal.appGlobal.get('webroot')}/opb/file/download?fileName=${path}&delete=true`,
        docType: typest[typest.length - 1],
        docName: reason.fileName,
      });
      this.projectInfo = JSON.parse(JSON.stringify(this.projectInfo));
    },
    removeFile(index) {
      if (this.isDisabled) {
        return;
      }
      this.projectInfo.projectDocList.splice(index, 1);
    },
    changeArea(val) {
      if (!val) {
        return;
      }
      getAreaById(val).then(res => {
        let objs = {
          x: res.longitude,
          y: res.latitude,
        };
        this.$planRef.centerAt(objs);
      });
    },
  },
  // watch: {
  //     show: {
  //         deep: true,
  //         immediate: true,
  //         handler(val, old) {
  //             if (val) {
  //                 this.initStep();
  //             }
  //         },
  //     },
  // },
  destroyed() {
    if (this.planView) {
      this.planView.$destroy();
    }
  },
};
</script>

<style lang="scss" scoped>
@import './projectEdit.scss';
</style>
