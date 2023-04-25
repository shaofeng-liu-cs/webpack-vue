<template>
  <div id="app" class="box">
    <ProjectManage v-if="choose === 'ProjectManage'"></ProjectManage>
    <ProjectWizard v-if="choose === 'ProjectWizard'" :param="wizardParam"></ProjectWizard>
    <ProjectBulletinBoard v-if="choose === 'ProjectBulletinBoard'" :param="wizardParam"></ProjectBulletinBoard>
  </div>
</template>
<script>
import ProjectManage from './projectManage/ProjectManage.vue';
import ProjectWizard from './projectWizard/ProjectWizard.vue';
import ProjectBulletinBoard from './projectBulletinBoard/ProjectBulletinBoard.vue';

export default {
  name: 'ProjectHome',
  inject: ['initData'],
  components: {
    ProjectManage,
    ProjectWizard,
    ProjectBulletinBoard,
  },
  data() {
    return {
      choose: this.initData.choose ? this.initData.choose : 'ProjectManage',
      params: this.initData.data ? this.initData.data : {},
      wizardParam: {
        projectId: (this.initData.data && this.initData.data.projectId) || '',
        flowId: (this.initData.data && this.initData.data.flowId) || '',
      },
    };
  },

  create() {},

  mounted() {
    this.$root.$on('openMenu', this.openMenu); //在portal上新开页签
    this.$root.$on('updateOption', this.updateOption); //更新入参
  },

  methods: {
    // menuId 菜单ID,如果页签需要限制打开数量为1,menuId需要传相同值;
    // menuTitle 菜单标题
    // menuParams 菜单参数,包括choose(页面组件Code,必填)、projectInfo(当前sprint信息或者schema信息), isSingleMenu(是否限制同时只能打开一个相同页签);
    openMenu(menuId, menuTitle, menuParams) {
      if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
        localStorage.setItem(menuParams.choose, JSON.stringify(menuParams));
        let url = `${window.location.href.split('?')[0]}?choose=${menuParams.choose}`;
        window.open(url);
      } else {
        // 表示是业务菜单内部新开页签
        menuParams.openMenuMode = 'inner';
        // stringKey = true表示最终menuId使用用户自定义的ID而不会去修改
        menuParams.stringKey = true;
        if (menuParams.isSingleMenu) {
          // 如果页签需要限制打开数量为1(即isSingleMenu=true),menuId需要传相同值
          portal.closeMenu(menuId, 'oss_core/edesign/project');
        }
        portal.openMenu(menuId, 'oss_core/edesign/project', 'S', menuTitle, menuParams);
      }
    },
    updateOption(key, value) {
      if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
        const menuParams = JSON.parse(localStorage.getItem(this.choose));
        if (menuParams.data) {
          menuParams.data[key] = value;
          localStorage.setItem(menuParams.choose, JSON.stringify(menuParams));
        }
      } else {
        fish.trigger('projcetUpdateOption', key, value);
      }
    },
  },
  destroyed: function () {
    this.$root.$off('openMenu', this.openMenu); //在portal上新开页签
    this.$root.$off('updateOption', this.updateOption); //更新入参
  },
};
</script>

<style lang="scss" scoped>
@import '@/oss_core/base/css/main.scss';
@import './projectHome.scss';
</style>
