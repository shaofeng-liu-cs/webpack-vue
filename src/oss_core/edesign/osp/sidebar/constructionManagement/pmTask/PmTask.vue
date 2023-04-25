<template>
  <div class="sidebar-body">
    <div v-if="pmInfo" class="pm-content">
      <div class="row-btn btn btn-primary" @click="initTask">{{$t('REFRESH')}}</div>
      <div class="pm-info">
        <div>
          <div>{{$t('CONSTR_MANAGE_NAME')}}</div>
          <el-tooltip class="item" effect="light" :content="pmInfo.title" placement="bottom-start">
            <div>{{pmInfo.title}}</div>
          </el-tooltip>
        </div>
        <div>
          <div>{{$t('CONSTR_MANAGE_TASK_STATUS')}}</div>
          <el-tooltip class="item" effect="light" :content="pmInfo.dispState" placement="bottom-start">
            <div>{{pmInfo.dispState}}</div>
          </el-tooltip>
        </div>
        <div>
          <div>{{$t('CONSTR_MANAGE_FIELD_ENGINEER')}}</div>
          <el-tooltip class="item" effect="light" :content="pmInfo.fieldEngineerName" placement="bottom-start">
            <div>{{pmInfo.fieldEngineerName}}</div>
          </el-tooltip>
        </div>
        <!-- <div>
                    <div>CompleteTypeName：</div>
                    <div :title="pmInfo.completeTypeName">{{pmInfo.completeTypeName}}</div>
                </div> -->
      </div>
    </div>
    <div class="row-btn btn btn-primary" @click="newPm" v-else>{{$t('LAUNCH')}}</div>
  </div>
</template>

<script>
import { addPmTask } from '@/oss_core/edesign/api/add/schema.js';
import { queryPmTask } from '@/oss_core/edesign/api/query/schema.js';

export default {
  name: 'PmTask',
  inject: ['getProjectInfo'],
  data() {
    return {
      schemaId: this.getProjectInfo().schemaId,
      pmInfo: null,
    };
  },
  created() {},
  mounted() {
    this.initTask();
  },
  activated() {
    this.initTask();
  },
  methods: {
    initTask() {
      queryPmTask(this.schemaId).then(data => {
        console.log(data);
        if (Object.keys(data).length > 0) {
          this.pmInfo = data;
        }
      });
    },
    newPm() {
      let schemaId = this.schemaId;
      addPmTask({ schemaId }).then(data => {
        console.log(data);
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        this.initTask();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './PmTask.scss';
</style>