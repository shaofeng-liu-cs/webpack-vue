<template>
  <div class="task-collapse-con">
    <TaskCollapse v-for="task in taskList" :key="task.constCatId" :taskInfo="task" :openKey="openKey" @changeOpenKey="changeOpenKey" />
  </div>
</template>
<script>
import TaskCollapse from '@/oss_core/edesign/osp/constructionProgress/taskPanel/TaskCollapse.vue';
import { queryConsSuppliecBomByProjectId } from '@/oss_core/edesign/api/query/project.js';
export default {
  name: 'TaskPanel',
  props: {
    projectId: {
      type: String,
    },
  },
  inject: ['getInitData'],
  components: {
    TaskCollapse,
  },

  data() {
    return {
      openKey: '',
      taskList: [],
    };
  },

  created() {},

  mounted() {
    queryConsSuppliecBomByProjectId(this.projectId).then(res => {
      let { data } = res;
      if (data && Array.isArray(data)) {
        this.taskList = data;
        this.openKey = (data[0] || {}).constCatId;
        this.openKey && this.changeOpenKey(this.openKey);
      }
    });
  },

  methods: {
    changeOpenKey(key) {
      if (key === this.openKey) {
        this.openKey = '';
      } else {
        this.openKey = key;

        if (key === '1001' || key === '1002') {
          this.$emit('changeMapType', '2');
        } else if (key === '1003') {
          this.$emit('changeMapType', '1');
        } else if (key === '1005') {
          this.$emit('changeMapType', '3');
        }
      }
    },
    handleChange(val) {
      console.log(val);
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>