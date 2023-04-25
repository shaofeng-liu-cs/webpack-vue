<template>
  <div class="marking-style-box sys-card-box">
    <div class="box-head-title">
      <span class="left-title">
        {{ $t('SETTING_STYLE_MARKERS_LIST') }}
      </span>
    </div>
    <div class="box-content flex-column">
      <div class="flex-align-center m-b">
        <el-radio-group v-model="type" size="mini">
          <el-radio-button label="POINT">{{ $t('SETTING_STYLE_MARKERS_POINT') }}</el-radio-button>
          <el-radio-button label="LINE">{{ $t('SETTING_STYLE_MARKERS_LINE') }}</el-radio-button>
          <el-radio-button label="GRID">{{ $t('SETTING_STYLE_MARKERS_COVERAGE') }}</el-radio-button>
        </el-radio-group>
        <el-button type="primary" class="m-l" size="mini" icon="el-icon-folder-add" @click="newMark">{{ $t('NEW') }}</el-button>
      </div>
      <div class="overflow-hidden flex1">
        <el-table :data="markList" border style="width: 100%" height="100%" size="mini">
          <el-table-column prop="markName" :label="$t('SETTING_STYLE_MARKERS_NAME')" width="180"> </el-table-column>
          <el-table-column prop="markDesc" :label="$t('SETTING_STYLE_MARKERS_DESCRIPTION')"> </el-table-column>
          <el-table-column :label="$t('OPERATIONS')" width="150">
            <template slot-scope="scope">
              <!-- <el-button type="text" size="small">{{$t('SEE')}}</el-button> -->
              <el-button type="text" size="mini" @click="editMark(scope.row)">{{ $t('EDIT') }}</el-button>
              <el-button type="text" size="mini" class="text-red" @click="deleteMark(scope.row)">{{ $t('DELETE') }}</el-button>
            </template>
          </el-table-column>
          <div slot="empty">
            <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
          </div>
        </el-table>
      </div>
    </div>

    <Popup :popupObj="settingModalObj" @popupClose="popupClose" @popupOk="settingSubmit">
      <template v-slot:popupBody>
        <div class="overflow-hidden flex-column all100">
          <JustTab :options="options" v-model="activeName"></JustTab>
          <div class="m-t-lg flex1 overflow-hidden">
            <div v-show="activeName === 'baseInfo'">
              <el-form label-position="top" :model="baseFormVal" :rules="baseFormRules" ref="baseForm" label-width="auto">
                <el-form-item :label="$t('SETTING_STYLE_MARKERS_NAME')" prop="markName">
                  <el-input v-model="baseFormVal.markName" @change="changeMarkName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item :label="$t('SETTING_STYLE_MARKERS_DESCRIPTION')" prop="markDesc">
                  <el-input v-model="baseFormVal.markDesc" autocomplete="off" type="textarea" :rows="5"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <SettingIcon v-show="activeName === 'icon'"></SettingIcon>
            <SettingCss v-show="activeName === 'style'"></SettingCss>
          </div>
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
import SettingIcon from '@/oss_core/edesign/osp/SettingStyle/settingIcon/SettingIcon.vue';
import SettingCss from '@/oss_core/edesign/osp/SettingStyle/settingCss/SettingCss.vue';
import { queryMarkstyleList } from '@/oss_core/edesign/api/query/mark.js';
import { addMarkstyle } from '@/oss_core/edesign/api/add/mark.js';
import { deleteMarkstyle } from '@/oss_core/edesign/api/del/mark.js';
import { updateMarkstyle } from '@/oss_core/edesign/api/edit/mark.js';
export default {
  name: 'MarkingStyle',
  props: {},
  components: {
    SettingIcon,
    SettingCss,
  },
  provide() {
    return {
      getSettingData: () => this.settingData,
      changeSettingData: obj => {
        this.settingData = {
          ...this.settingData,
          ...obj,
        };
      },
    };
  },
  data() {
    return {
      options: [
        { name: this.$t('CONSTRUCTION_SCHEME_BASIC'), code: 'baseInfo' },
        { name: this.$t('HLD_SETTING_STYLE_ICON'), code: 'icon' },
        { name: this.$t('HLD_SETTING_STYLE_PRIMARY_LABEL'), code: 'style' },
      ],
      activeName: 'baseInfo',
      baseFormVal: {},
      baseFormRules: {
        markName: [{ required: true, message: this.$t('SETTING_STYLE_MARKERS_NAME_NO_NULL') }],
      },
      defaultSettingData: {
        iconUrl: 'oss_core/edesign/assets/image/mark/mark_icon_0.png',
        fontWeight: 'normal',
        fontStyle: 'normal',
        size: 22,
        fontColor: '#FF0000',
        fontSize: 12,
        fontFamily: 'Microsoft Yahei',
      },
      lineDefaultSettingData: {
        //线的默认属性
        lineWidth: 2,
        lineColor: '#FF0000',
        lineStyle: 'solid',
      },
      gridDefaultSettingData: {
        //面默认属性
        fillColor: '#FF00001a',
      },
      settingData: {},
      settingModalObj: {
        title: this.$t('NEW'),
        ok: this.$t('OK'),
        close: this.$t('CLOSE'),
        modal: true,
        width: '850px',
        height: '600px',
        show: false,
        drag: true,
        zIndex: 3,
      },
      type: 'POINT',
      markList: [],
    };
  },

  create() {
    console.log('我加载了');
  },

  mounted() {
    this.loadMarkList();
  },

  methods: {
    popupClose() {},
    deleteMark(data) {
      this.$confirm(this.$t('DELETE_CONFIRM'), this.$t('TIP'), {
        confirmButtonText: this.$t('OK'),
        cancelButtonText: this.$t('CANCEL'),
        type: 'warning',
      }).then(() => {
        deleteMarkstyle(data.markId).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.$t('DELETE_SUCCESS'),
            });
            this.loadMarkList();
          } else {
            this.$message({
              type: 'error',
              message: this.$t('DELETE_FAIL'),
            });
          }
        });
      });
    },
    loadMarkList() {
      queryMarkstyleList(this.type).then(res => {
        this.markList = res.data || [];
      });
    },
    settingSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          console.log('this.settingData:', this.settingData);
          let newdata = { ...this.settingData };
          newdata.labelField = 'label';

          let params = { ...this.baseFormVal, applyType: this.type, markStyle: JSON.stringify(newdata), markDesc: this.baseFormVal.markDesc || '' };
          const func = this.baseFormVal.markId ? updateMarkstyle : addMarkstyle;
          func(params).then(res => {
            if (res.success) {
              this.$message({
                message: this.$t('SAVE_SUCCESS'),
                type: 'success',
              });
              this.loadMarkList();
              this.settingModalObj.show = false;
            } else {
              this.$message({
                message: res.message || this.$t('AJAX_ERROR'),
                type: 'error',
              });
            }
          });
        } else {
          this.activeName = 'baseInfo';
        }
      });
    },
    changeMarkName() {
      this.settingData = {
        ...this.settingData,
        labelField: this.baseFormVal.markName,
      };
    },
    newMark() {
      this.baseFormVal = {};
      let setdata = { ...this.defaultSettingData };
      let geometryType = 'geometryPoint';
      if (this.type === 'LINE' || this.type === 'GRID') {
        geometryType = 'geometryMultipolyline';
        setdata = {
          ...setdata,
          ...this.lineDefaultSettingData,
        };
      }
      if (this.type === 'GRID') {
        geometryType = 'geometryMultipolygon';
        setdata = {
          ...setdata,
          ...this.gridDefaultSettingData,
        };
      }
      this.settingData = {
        ...setdata,
        geometryType,
      };
      this.activeName = 'baseInfo';
      this.settingModalObj.title = this.$t('NEW');
      this.settingModalObj.show = true;
    },
    editMark(item) {
      let obj = JSON.parse(item.markStyle || '{}');

      this.baseFormVal = { ...item };
      this.settingData = { ...obj, labelField: item.markName };
      this.activeName = 'baseInfo';
      this.settingModalObj.title = this.$t('EDIT');
      this.settingModalObj.show = true;
    },
  },
  watch: {
    type() {
      this.loadMarkList();
    },
  },
};
</script>
