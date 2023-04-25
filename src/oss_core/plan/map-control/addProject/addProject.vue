<template>
  <Popup :popupObj="popupNew" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <div class="schemaInfo">
        <form ref="newForm" class="form-horizontal panel-form-style" style="justify-content: left;">
          <div class="gird-div">
            <label class="required-label">{{ $t('E_PROJECTDETAIL_CODE') }}</label>
            <div>
              <input v-model="projectInfo.PROJECT_CODE" class="form-control" name="PROJECT_CODE" data-rule="required" :disabled="true" />
            </div>
          </div>
          <div class="gird-div">
            <label class="required-label">{{ $t('E_PROJECTDETAIL_NAME') }}</label>
            <div>
              <input v-model="projectInfo.PROJECT_NAME" class="form-control" name="PROJECT_NAME" data-rule="required" />
            </div>
          </div>
          <div class="gird-div">
            <label class="required-label">{{ $t('E_PROJECTDETAIL_TYPE') }}</label>
            <Combobox v-model="projectInfo.PROJECT_TYPE" class="form-control" name="PROJECT_TYPE" :setting="typeSetting" data-rule="required"></Combobox>
          </div>
          <div class="gird-div">
            <label class="required-label">{{ $t('TASK_LIST_REGION') }}</label>
            <Combobox v-model="projectInfo.REGION_ID" class="form-control" name="REGION_ID" :setting="citySetting" data-rule="required"></Combobox>
          </div>
          <div class="gird-div">
            <label class="required-label">{{ $t('E_PROJECTDETAIL_PRO_MANAGER') }}</label>
            <div style="display: inline-table">
              <Popedit id="projectManager" class="form-control" :value="projManagerSetting" dataRule="required" name="projHandleUser" url="oss_core/edesign/chooseUser/views/chooseUser" @popeditOk="projChooseUser"></Popedit>
            </div>
          </div>
          <div class="gird-div">
            <label class="required-label">{{ $t('E_PROJECTDETAIL_DESIGN_MANAGER') }}</label>
            <div style="display: inline-table">
              <Popedit id="designManager" class="form-control" :value="dsManagerSetting" dataRule="required" name="dsHandleUser" url="oss_core/edesign/chooseUser/views/chooseUser" @popeditOk="dsChooseUser"></Popedit>
            </div>
          </div>
          <div class="gird-div browsw">
            <label class="">{{ $t('E_PROJECTDETAIL_ATTACHMENTS') }}</label>
            <div style="display: inline-table">
              <div class="col-md-12 input-group">
                <input v-model="projectInfo.DOC_NAME" type="text" class="form-control" name="DOC_NAME" data-rule="length[1~255];" placeholder="Please Select" />
                <span class="input-group-addon fileinput-button">
                  <label class="fa fa-cloud-upload">{{ $t('E_PROJECTDETAIL_BROWS') }}</label>
                </span>
                <input type="file" name="file" class="form-control file-input" @change="chooseFile" />
              </div>
            </div>
          </div>
          <div class="gird-div comment">
            <label>{{ $t('OSP_TASK_DESCRIPTION') }}</label>
            <div>
              <textarea v-model="projectInfo.PROJECT_DESC" rows="4" class="form-control"></textarea>
            </div>
          </div>
        </form>
      </div>
    </template>
  </Popup>
</template>

<script>
// import { addSubProject, editSubProject } from '../../../task/api/taskAction';
import { qryProjectType, qryProjectRegion } from '@/oss_core/edesign/api/query/project.js';
import { insertProjectManagementData } from '@/oss_core/edesign/api/add/project.js';

export default {
  name: 'AddProject',
  inject: ['getMapBox'],
  data() {
    return {
      popupNew: {
        title: this.$t('E_PROJECTDETAIL_NEW_PROJECT'), // 弹框标题
        ok: this.$t('OK'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: true, // 是否蒙层
        width: '800px', // 宽
        height: 'auto', // 高
        show: false,
        drag: true,
        zIndex: 3,
      },

      typeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'label',
        dataValueField: 'value',
        dataSource: [],
      },
      citySetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'AREA_NAME',
        dataValueField: 'AREA_ID',
        dataSource: [],
      },
      projectInfo: {},
      projManagerSetting: {
        name: '',
        code: '',
      }, // 选择用户需要的绑定数据
      dsManagerSetting: {
        name: '',
        code: '',
      }, // 选择用户需要的绑定数据
      uploader: null, // 上传组件
    };
  },
  computed: {
    mapBox() {
      return this.getMapBox();
    },
  },

  created() {},
  mounted() {
    qryProjectType('').then(data => {
      const typeSettingArray = [];
      if (data) {
        data.forEach(item => {
          if (item.PARENT_TYPE === 'OPT' || item.PROJECT_TYPE === 'OPT') {
            const type = {};
            type.label = item.NAME;
            type.value = item.PROJECT_TYPE;
            typeSettingArray.push(type);
          }
        });
      }
      this.typeSetting.dataSource = typeSettingArray;
    });
    this.initCitySetting();
    this.initWebUploader();
  },

  methods: {
    init(graphic, overlay) {
      this.popupNew.show = true;
      this.graphic = graphic;
      this.overlay = overlay;
      this.projManagerSetting = {}; // 选择用户需要的绑定数据
      this.dsManagerSetting = {}; // 选择用户需要的绑定数据
      this.projectInfo = {
        PROJECT_CODE: String(Math.random() * 100000000000000000000),
      };
    },
    projChooseUser(user) {
      if (user && user.name && user.value) {
        this.projectInfo.PROJ_MANAGER_ID = user.value;
        this.projManagerSetting.code = user.value;
        this.projManagerSetting.name = user.name;
      }
    },
    dsChooseUser(user) {
      if (user && user.name && user.value) {
        this.projectInfo.DS_MANAGER_ID = user.value;
        this.dsManagerSetting.code = user.value;
        this.dsManagerSetting.name = user.name;
      }
    },

    initCitySetting() {
      qryProjectRegion().then(data => {
        this.citySetting.dataSource = data.resultData || [];
      });
    },

    popupClose() {
      this.popupNew.show = false;
    },

    popupOk() {
      this.$initForm1 = $(this.$refs.newForm).form();
      if (!$(this.$refs.newForm).form().isValid()) {
        return;
      }
      this.newSubproject();
    },

    newSubproject() {
      this.projectInfo.PROJECT_STATE = 'O'; // 新建的工程状态为Open
      this.projectInfo.DESIGN_STATE = 'I'; // 新建的设计状态为未开始
      this.projectInfo.REGION_ID += '';
      this.projectInfo.PARTITION_ID = this.projectInfo.REGION_ID;
      this.projectInfo.PROJ_MANAGER_ID += '';
      this.projectInfo.DS_MANAGER_ID += '';
      // delete this.projectInfo.DS_MANAGER_ID;
      insertProjectManagementData(this.projectInfo).then(data => {
        if (data.success) {
          this.popupClose();
          this.graphic.attributes = Object.assign(this.graphic.attributes, {
            projectId: data.projectId,
            sprintId: data.projectId,
            resName: data.PROJECT_NAME,
          });
          const { layerNo } = this.graphic;
          this.$map.updateGeometryById(layerNo, this.graphic).then(() => {
            fish.toast('success', this.$t('SAVE_SUCCESS'));
          });
          this.mapBox.removeOverLay(this.overlay);
          this.mapBox.refresh();
        } else {
          fish.toast('error', data.errorMessage);
        }
      });
    },
    chooseFile(e) {
      // 上传附件
      const { files } = e.target;
      this.uploader.addFiles(files); // 添加到上传文件队列中
      e.target.value = '';
    },
    initWebUploader() {
      const webuploader = require('webuploader');
      this.uploader = webuploader.create({
        swf: 'frm/fish-desktop/third-party/webupload/Uploader.swf',
        // server: portal.appGlobal.attributes.webroot + '/im/webgis/file/upload?moduleName=im&date=true&temporary=true', //上传接口地址
        server: `${portal.appGlobal.attributes.webroot}/opb/file/upload?moduleName=im&date=true&temporary=true`, // 上传接口地址
      });

      // 文件加入队列前的回调函数
      // this.uploader.on('beforeFileQueued', file => {});
      // 当文件被加入队列以后触发。
      this.uploader.on('fileQueued', () => {
        this.uploader.upload();
      });
      this.uploader.on('filesQueued', () => {
        this.uploader.upload();
      });
      // 文件上传过程中
      this.uploader.on('uploadProgress', () => {
        $.blockUI({ message: 'loading' }); // loading
      });
      // 文件上传成功
      this.uploader.on('uploadSuccess', (file, response) => {
        this.postFile(response);
        $.unblockUI(); //  loading
        fish.toast('success', 'File Upload Successfully!');
      });
      // 文件上传错误
      this.uploader.on('uploadError', (file, reason) => {
        $.unblockUI(); //  loading
        fish.error(reason);
      });
      // 文件上传完成
      this.uploader.on('uploadComplete', file => {
        this.uploader.removeFile(file, true);
      });
    },
    postFile(reason) {
      const typest = reason.fileName.split('.');
      const path = encodeURIComponent(`${reason.filePath.slice(1)}/${reason.fileName}`);
      this.$set(this.projectInfo, 'DOC_NAME', reason.fileName);
      this.projectInfo.DOC_PATH = `${portal.appGlobal.get('webroot')}/opb/file/download?fileName=${path}&delete=true`;
      this.projectInfo.DOC_TYPE = typest[typest.length - 1];
    },
  },
};
</script>
<style lang="scss" scoped>
@import './addProject.scss';
</style>
