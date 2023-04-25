<template>
  <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <form class="form-horizontal" ref="hldForm">
        <!-- <div class="row form-group">
                    <div class="col-md-3" style="text-align:right">
                        <label class="control-label required-label">{{$t('OSP_TASK_NEXT_STEP')}}</label>
                    </div>
                    <div class="col-md-8">
                        <input class="form-control" v-model="nextStep" data-rule="required" disabled> 
                    </div> 
                </div>
                <div class="form-group">
                    <div class="col-md-3" style="text-align:right">
                        <label class="control-label  required-label">{{$t('OSP_TASK_ASSIGN_TO')}}</label>
                    </div>
                    <div class="col-md-8">
                        <Combobox  :setting="userListSetting"  v-model="userList" dataRule="required" :disabled="isDisableUser"></Combobox>
                    </div> 
                </div> -->
        <div class="row form-group">
          <div class="col-md-3" style="text-align:right">
            <label class="control-label form-group">{{$t('OSP_TASK_DESCRIPTION')}}</label>
          </div>
          <div class="col-md-8">
            <textarea rows="4" class="form-control" v-model="description"></textarea>
          </div>
        </div>
      </form>
    </template>
  </Popup>
</template>

<script>
export default {
  name: 'task2Next',
  props: {
    gridSelectedData: {
      type: Object,
    },
    appendEl: {},
    isDisableUser: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nextStep: '',
      userListSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'userName',
        dataValueField: 'userId',
        dataSource: [],
      },
      userList: '',
      description: '',
      popupObj: {
        title: this.$t('OSP_TASK_TASK_ASSIGN'), // 弹框标题
        ok: this.$t('OK'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        modal: true, // 是否蒙层
        width: '35%', // 宽
        height: 'auto', // 高
        //left: '35%',
        //top:'20%',
        show: false,
        zIndex: 3,
        drag: true,
      },
      attach: [],
      length: 0,
      attachFlag: true,
    };
  },
  created() {
    if (this.appendEl) {
      this.popupObj.el = this.appendEl;
    }
  },
  mounted() {
    this.query2UserList(this.gridSelectedData.flowState);
    this.nextStep = this.gridSelectedData.nextFlowStateName;
    this.popupObj.show = true;
  },
  methods: {
    queryAttachment(rowD) {
      fish.ajax({
        url: 'edesign/flow/flowattaches/v1',
        type: 'GET',
        //contentType:"application/json",
        data: {
          flowId: rowD.flowId,
          schemaId: rowD.schemaId,
        },
        success: data => {
          console.log(data);
          if (data && data.resultList) {
            this.attachFlag = true;
            this.attach = data.resultList;
            this.length = data.resultList.length;
          } else {
            this.attachFlag = false;
            this.length = 0;
          }
        },
      });
    },

    uploadFileAction(file, row, response) {
      fish.ajax({
        url: 'edesign/flowattach/flowattach/v1',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          fileId: file.source.source.lastModified + '' + `${Math.floor(Math.random() * 10000)}` + '',
          flowId: row.flowId,
          isValid: 'Y',
          localName: file.name,
          schemaId: row.schemaId,
          fullPath: response.filePath,
          alias: file.name,
        }),
        success: data => {
          console.log(data);
          if (data && data.resultList) {
          }
          fish.success(this.$t('OSP_TASK_UPLOAD_SUCCESS'));
          this.queryAttachment(row);
        },
      });
    },

    deleteAttach(file) {
      let row = this.gridSelectedData;
      fish.ajax({
        url: 'edesign/flowattach/flowattach/v1',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({
          alias: file.alias,
          fileId: file.fileId,
          flowId: file.flowId,
          fullPath: file.fullPath,
          isValid: 'Y',
          localName: file.localName,
          schemaId: row.schemaId,
        }),
        success: data => {
          console.log(data);
          if (data && data.resultList) {
          }
          fish.success(this.$t('OSP_TASK_DELETE_SUCCESS'));
          this.queryAttachment(row);
        },
        error: err => {},
      });
    },

    downloadAttach(file) {
      let url = portal.appGlobal.attributes.webroot + '/edesign/file/download?fileName=' + encodeURIComponent(file.fullPath + '/' + file.localName);
      // portal.appGlobal.attributes.webroot + "/download?filePath=" + filePath.replace(/\\/g,"/") + "&delete=true";
      // portal.appGlobal.attributes.webroot + '/edesign/file/download?moduleName=edn&date=true&temporary=true'
      console.log(url);
      let down = $('<a href="undefine.htm" download = "undefine.htm"></a>');
      down.attr('href', url);
      down[0].click();
    },

    query2UserList(flowState) {
      fish.ajax({
        url: `edesign/flow/${flowState}/nextflowstatusandusers/v1`,
        type: 'GET',
        //async: false,
        success: data => {
          if (data && data.userList) {
            this.userListSetting.dataSource = data.userList;
            if (this.isDisableUser) {
              this.userList = this.gridSelectedData.handleUser;
            }
          }
        },
      });
    },

    flowToNext(row, comments) {
      let initI18n = this.$i18n;
      fish.ajax({
        url: 'edesign/project/task/close/v1',
        type: 'POST',
        contentType: 'application/json',
        showError: false,
        data: JSON.stringify({
          // attachs: [],
          // currentState: row.flowState,
          // schemaId: row.schemaId,
          // comments: comments,
          orderId: row.orderId,
        }),
        success: data => {
          fish.success(this.$t('OPERATION_SUCCESS'));
          this.$emit('popupOK');
          this.popupObj.show = false;
          this.userList = '';
          this.description = '';
        },
        error: data => {
          if (data && data.responseJSON && data.responseJSON.message) {
            fish.warn(data.responseJSON.message);
          } else {
            fish.warn(this.$t('AJAX_ERROR'));
          }
        },
      });
    },

    popupClose(val) {
      this.popupObj.show = false;
      // 正常情况是先更新数据（soltName = '',销毁动态组件，视图和数据的联系已经失效），再去更新视图（v-if控制视图是否展示，但是数据的联系没了，控制失效），
      // 这里用nextTick的原因是先更新视图，再去更新数据，
      // 如果不用这个的话，弹窗视图关不了。
      // this.$nextTick(() => {
      //     this.$emit("popupClose");
      //     this.userList = "";
      //     this.description = "";
      // })
      this.$emit('popupClose');
      this.userList = '';
      this.description = '';
    },
    popupOk() {
      this.$initForm = $(this.$refs.hldForm).form();
      if (!this.$initForm.isValid()) {
        return;
      }

      // this.flowToNext(this.gridSelectedData, this.userList, this.description);
      this.flowToNext(this.gridSelectedData, this.description);
    },
  },

  watch: {
    // 'popupObj.show':{
    //     deep:true,
    //     immediate:true,
    //     handler(val, old) {
    //         // this.nextStep = this.$parent.menuIdToName[this.menuId];
    //         this.queryAttachment(this.$parent.row);
    //         if (val) {
    //             setTimeout(()=>{
    //                 this.$parent.initWebUploader();
    //             },200)
    //         }
    //     }
    // }
  },
};
</script>

<style scoped lang="scss">
.required-label:before {
  content: '*';
  color: #fb6e52;
  vertical-align: middle;
  margin-right: 3px;
  line-height: 1;
}

/deep/ .ui-dialog .modal-footer {
  border-top: none;
  height: auto;
}
</style>
