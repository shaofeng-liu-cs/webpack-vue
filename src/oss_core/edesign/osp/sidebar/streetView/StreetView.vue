<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-17 15:36:20
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\streetView\StreetView.vue
--> 
<template>
    <div>
        <iframe :src="`${url}?key=${key}&location=${location}&heading=210&pitch=10&fov=35`" v-if="location"></iframe>
        <!-- <div class="btn btn-primary" @click="setLocation">StreetView</div> -->
    </div>
</template>

<script>
export default {
  name: 'StreetView',
  inject: ['getLocation', 'getMapBox'],
  data() {
    return {
      url: this.getMapBox()._gisConfig.googleStreet.url,
      key: this.getMapBox()._gisConfig.googleStreet.key,
    };
  },
  computed: {
    location() {
      return this.getLocation();
    },
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
@import './streetView.scss';
</style>