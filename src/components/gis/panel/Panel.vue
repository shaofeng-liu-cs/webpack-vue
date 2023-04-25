<template>
  <div ref="panel" class="panel panel-default">
    <div v-if="panelHead" class="panel-heading">
      <h3 class="panel-title">
        <slot name="title"></slot>
      </h3>
    </div>
    <div :class="[body, panelBodyFlex ? bodyFlex : '']">
      <slot name="body"></slot>
    </div>
    <div v-if="panelFooter" class="panel-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Panel',

  componentName: 'Panel',

  provide() {
    return {};
  },

  props: {
      panelHead:{
        type:Boolean,
        default:true,
      },
      panelFooter:{
        type:Boolean,
        default:true
      },
      panelBodyFlex:{
        type:Boolean,
        default:false,
      }
  },
  watch: {},
  computed: {},
  data() {
    return {
        body: 'panel-body',
        bodyFlex: 'panel-body-flex'
    };
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>
<style scoped lang="scss">
  .panel-body-flex{
    flex-grow:1;
    display:flex;
    flex-flow:column
  }
</style>