<template>
    <div style="display: flex;">
        <div ref="popover" class="popover-wrap">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
  name: 'Popover',
  data() {
    return {
      contents: '',
      popover: undefined,
    };
  },
  provide() {
    return {
      insertHtml: this.insertHtml,
    };
  },
  props: {
    placement: {
      //top、left、bottom、right
      type: String,
    },
    content: {
      //弹出内容
      type: [String, Function, Element],
    },
    delay: {
      //延迟显示毫秒数
      type: Number,
    },
    html: {
      //内容是否以html字符串插入
      type: Boolean,
      default: true,
    },
    title: {
      //提示内容
      type: String,
    },
    trigger: {
      //触发事件 hover click focus
      type: String,
    },
    popClass: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      default:
        "<div class='popover' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>",
    },
    container: {
      type: String | Element | jQuery,
      default: 'body', //提示内容追加位置，默认是追加到body上 . body全屏会有问题 默认追究地图所在节点上
    },
  },
  computed: {
    option() {
      let option = {
        placement: this.placement,
        content: this.content,
        delay: this.delay,
        html: this.html,
        title: this.title,
        trigger: this.trigger,
        container: this.container,
        //template: this.templat,
        hide: option => {},
        show: e => {},
      };
      if (this.popClass) {
        option.template = `<div class='popover ${this.popClass}' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>`;
      } else {
        option.template = this.template;
      }
      return option;
    },
  },
  mounted() {
    let [vnode, wrapper, option] = [];
    if (this.$slots.content) {
      vnode = this.$slots.content[0];
      this.__patch__(undefined, vnode);
      wrapper = vnode.elm;
      option = Object.assign({}, this.option, {
        content: wrapper,
      });
    } else {
      option = Object.assign({}, this.option);
    }
    this.popover = $(this.$refs.popover).popover(option);
  },
  methods: {
    insertHtml(col) {
      this.contents = col;
    },
    close() {
      this.popover.popover('hide');
    },
  },
  watch: {
    content(newVal, oldVal) {
      $(this.$refs.popover).popover('option', 'content', newVal);
    },
  },
};
</script>

<style lang="scss" scoped>
.popover-wrap {
  box-sizing: content-box;
  display: inline-block;
}
</style>
<style lang="scss">
//全局样式 popover
.v9-popover-ul {
  margin: 0;
  padding: 0;
  list-style-type: none;

  .popover-content & {
    padding: 0;
  }

  li {
    cursor: pointer;

    &:hover {
      color: $theme-color;
    }
  }
}
</style>
