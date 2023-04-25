<!--
 * @Author: your name
 * @Date: 2020-04-09 16:25:55
 * @LastEditTime: 2021-05-12 11:42:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\components\splitter\Splitter.vue
-->
<template>
  <div ref="splitter" class="splitter-content" :class="{vertical: orientation === 'vertical'}">
    <div class="splitter-one" :style="styleObj">
      <slot name="one"></slot>
    </div>
    <div class="line-base"></div>
    <div class="line" v-drag="dragOptions" :style="lineStyle"></div>
    <div class="splitter-two" :style="twoStyle">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Splitter',
  componentName: 'Splitter',
  props: {
    // options: Array,
    orientation: {
      type: String,
      default: 'horizontal', //横向还是竖向
    },
    size: {
      type: Number,
      default: 0, //第一个模块大小
    },
  },
  watch: {},
  computed: {},
  data() {
    return {
      dragOptions: {
        orientation: this.orientation,
        contentSize: 0, //整个区域大小
        size: this.size,
      },
      styleObj: {
        width: '100%',
        height: `${this.size}px`,
      },
      lineStyle: {
        width: '100%',
        height: '3px',
        left: '0px',
        top: `${this.size}px`,
      },
      twoStyle: {
        width: '100%',
      },
    };
  },
  created() {
    if (this.orientation === 'vertical') {
      this.styleObj = {
        width: `${this.size}px`,
        height: '100%',
      };
      this.lineStyle = {
        width: `3px`,
        height: '100%',
        top: '0px',
        left: `${this.size}px`,
      };
      this.twoStyle = {
        height: '100%',
      };
    }
  },
  mounted() {
    this.dragOptions.contentSize = this.orientation === 'vertical' ? this.$refs.splitter.offsetWidth : this.$refs.splitter.offsetHeight;
    this.dragOptions.size = this.size;
  },
  directives: {
    drag: {
      inserted: (el, binding, vnode) => {
        let options = binding.value;
        vnode = vnode.elm;
        el.onmousedown = event => {
          event.preventDefault();
          // 获取鼠标在弹窗中的位置
          let mouseX = event.clientX - vnode.offsetLeft;
          let mouseY = event.clientY - vnode.offsetTop;
          // 绑定移动和停止函数
          document.onmousemove = event => {
            let left;
            let top;
            // 获取新的鼠标位置(event.clientX, event.clientY)
            // 弹窗应该在的位置(left, top)
            left = event.clientX - mouseX;
            top = event.clientY - mouseY;
            // offsetWidth、offsetHeight 当前元素的宽度
            // innerWidth、innerHeight 浏览器可视区的宽度和高度

            // 获取弹窗在页面中距Y轴的最小、最大 位置
            let minY = 0;
            let maxY = options.height - vnode.offsetHeight;
            if (top <= minY) {
              top = minY;
            } else if (top >= maxY) {
              top = maxY;
            }
            // 赋值移动
            if (options.orientation === 'vertical') {
              vnode.style.left = left + 'px';
              options.size = left;
            } else {
              vnode.style.top = top + 'px';
              options.size = top;
            }
          };
          document.onmouseup = () => {
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
        // window.onresize = () => {
        //     vnode.style.left = this.popupObj.left;
        //     vnode.style.top = this.popupObj.top;
        // };
      },
    },
  },
  methods: {},
  watch: {
    'dragOptions.size': {
      deep: true,
      handler(newVal, oldVal) {
        if (this.orientation === 'vertical') {
          this.styleObj = {
            width: `${newVal}px`,
            height: '100%',
          };
        } else {
          this.styleObj = {
            width: '100%',
            height: `${newVal}px`,
          };
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
// 默认竖排样式
.splitter-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  > .splitter-one {
    flex-grow: 0;
  }
  > .line {
    width: 100%;
    height: 10px;
    position: absolute;
    background: #000000;
    cursor: move;
    z-index: 1000;
  }
  > .splitter-two {
    flex-grow: 1;
  }
}
</style>