<template>
  <!-- 有蒙层需要在弹窗外层套一个div，需要优化，暂时进行判断后运行不同模板！ 此为有蒙层模板 -->
  <transition v-if="popupObj.modal">
    <div class="dialog-container" v-if="popupObj.show" @click.stop>
      <div
        ref="dialog"
        class="ui-dialog"
        :style="setStyle"
        @click.stop
        v-drag="popupObj.drag"
        :class="[popupObj.drag ? 'drag-style' : '', className]"
      >
        <div class="modal-header" v-if="popupObj.title">
          <h4 class="modal-title">{{ popupObj.title }}</h4>
          <el-button class="close" @click="popupHeadClose">
            <span class="icon_osp icon_ospclose"></span>
          </el-button>
        </div>
        <div class="modal-body">
          <slot name="popupBody"></slot>
        </div>
        <div class="modal-footer">
          <el-button type="primary" v-if="popupObj.other" @click="popupOther">{{ popupObj.other }}</el-button>
          <download-excel v-if="popupObj.ok && popupObj.isDownload" class="export-excel-wrapper" :data="downData" :fields="downCol" :name="fileName">
            <!-- 上面可以自定义自己的样式，还可以引用其他组件button -->
            <el-button type="primary" v-if="popupObj.ok && popupObj.isDownload" @click="popupOk">{{ popupObj.ok }}</el-button>
          </download-excel>
          <el-button type="primary" v-if="popupObj.ok && !popupObj.isDownload" @click="popupOk">{{ popupObj.ok }}</el-button>
          <el-button v-if="popupObj.close" @click="popupClose">{{ popupObj.close }}</el-button>
        </div>
      </div>
    </div>
  </transition>

  <!-- 此为没有蒙层模板 -->
  <transition v-else>
    <div class="transparent-container" v-if="popupObj.show">
      <div
        ref="dialog"
        class="ui-dialog"
        :style="setStyle"
        @click.stop
        v-drag="popupObj.drag"
        :class="[popupObj.drag ? 'drag-style' : '', className]"
      >
        <div class="modal-header" v-if="popupObj.title">
          <h4 class="modal-title">{{ popupObj.title }}</h4>
          <el-button class="close" @click="popupHeadClose">
            <span class="icon_osp icon_ospclose"></span>
          </el-button>
        </div>
        <div class="modal-body">
          <slot name="popupBody"></slot>
        </div>
        <div class="modal-footer">
          <el-button v-if="popupObj.other" @click="popupOther">{{ popupObj.other }}</el-button>
          <download-excel v-if="popupObj.ok && popupObj.isDownload" class="export-excel-wrapper" :data="downData" :fields="downCol" :name="fileName">
            <!-- 上面可以自定义自己的样式，还可以引用其他组件button -->
            <el-button type="primary" v-if="popupObj.ok && popupObj.isDownload" @click="popupOk">{{ popupObj.ok }}</el-button>
          </download-excel>
          <el-button type="primary" v-if="popupObj.ok && !popupObj.isDownload" @click="popupOk">{{ popupObj.ok }}</el-button>
          <el-button v-if="popupObj.close" @click="popupClose">{{ popupObj.close }}</el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Popup',
  componentName: 'Popup',
  props: {
    popupObj: {
      type: Object,
      default: {
        title: '', // 标题
        other: '', //弹窗其他按钮
        ok: '', // 确认按钮
        close: '', // 取消按钮
        left: 'auto', // 左定位
        top: 'auto', // 上定位
        right: 'auto', // 右定位
        bottom: 'auto', //下定位
        width: '300px', // 宽
        height: '150px', // 高
        maxHeight: '', // 最大高度
        maxWidth: '', // 最大宽度
        modal: true, //是否遮罩
        el: '', //指定插入节点
        show: false, //是否展示
        drag: false, //是否拖拽
        resize: 'none', //none：用户无法调整元素的尺寸。both：用户可调整元素的高度和宽度。horizontal：用户可调整元素的宽度。vertical：用户可调整元素的高度。
        zIndex: 4, //层级
        isDownload: false, //是否下载模式
      },
    },
    sureFlag: {
      type: Boolean,
      default: false,
    },
    downData: {
      type: Array,
    },
    downCol: {
      type: Object,
    },
    fileName: {
      type: String,
    },
    className: {
      type: String,
    },
  },
  data() {
    return {
      isCenter: false,
      resizeObserver: null, //监听resize事件
      oldT: null, //老的延时触发事件
      showChange: false, //是否是show触发
    };
  },
  created() {},
  mounted() {
    this.appendEl();
    this.resizeObserver = new ResizeObserver(this.resize);
    // const resizeObserver = new ResizeObserver(this.resize);
    // resizeObserver.observe(this.$refs.dialog);
  },
  methods: {
    //节点插入指定位置
    appendEl() {
      if (this.popupObj.el) {
        if (typeof this.popupObj.el === 'string') {
          const el = document.querySelector(this.popupObj.el);
          el.append(this.$el);
        } else {
          this.popupObj.el.append(this.$el);
        }
      }
    },
    // 弹窗关闭事件
    popupClose() {
      this.$emit('popupClose');
      this.popupObj.show = false;
    },

    // 弹窗通过头部或者外部点击关闭事件，用于popup的cancel按钮需要单独处理其他逻辑时区分。
    popupHeadClose() {
      //this.$emit("beforeClose");

      if (this.sureFlag) {
        this.$emit('popupSure');
      } else {
        this.popupObj.show = false;
        this.$emit('popupClose', 'head');
      }
    },

    // 弹窗点击OK按钮事件
    popupOk() {
      this.$emit('popupOk');
      //this.popupObj.show = false;
    },

    // 弹窗点击其他按钮事件
    popupOther() {
      this.$emit('popupOther');
      //this.popupObj.show = false;
    },
    resize(e) {
      if (this.showChange) {
        this.showChange = false;
        return;
      }
      console.log(e);
      if (this.oldT) {
        clearTimeout(this.oldT);
      }
      this.oldT = setTimeout(() => {
        this.$emit('resize', e);
      }, 500);
    },
  },
  computed: {
    // 根据不同情况设置弹窗样式，支持传入纯数字、百分比、其他CSS长度单位可用值
    setStyle: function() {
      // 纯数字将自动转为px值
      Object.keys(this.popupObj).forEach(item => {
        if (
          item === 'width' ||
          item === 'height' ||
          item === 'maxWidth' ||
          item === 'maxHeight' ||
          item === 'left' ||
          item === 'top' ||
          item === 'right' ||
          item === 'bottom'
        ) {
          this.popupObj[item] = isNaN(this.popupObj[item]) ? this.popupObj[item] : this.popupObj[item] + 'px';
        }
      });

      // 没有传入值则设置默认值
      this.popupObj.width = this.popupObj.width || 'auto';
      this.popupObj.height = this.popupObj.height || 'auto';
      this.popupObj.maxWidth = this.popupObj.maxWidth || 'none';
      this.popupObj.maxHeight = this.popupObj.maxHeight || 'none';
      this.popupObj.zIndex = this.popupObj.zIndex || 9;
      this.popupObj.resize = this.popupObj.resize || 'none';

      // 传入任意一个定位值，则根据传入定位值进行弹窗定位
      if (this.popupObj.left || this.popupObj.top || this.popupObj.right || this.popupObj.bottom) {
        return {
          left: this.popupObj.left || 'auto', // 左定位
          top: this.popupObj.top || 'auto', // 上定位
          right: this.popupObj.right || 'auto', // 右定位
          bottom: this.popupObj.bottom || 'auto', // 下定位
          width: this.popupObj.width, // 宽
          height: this.popupObj.height, // 高
          maxWidth: this.popupObj.maxWidth, // 宽
          maxHeight: this.popupObj.maxHeight, // 高
          'z-index': this.popupObj.zIndex, //层级
          resize: this.popupObj.resize, //可变大小
        };
      } else {
        //  没有传入定位值，则计算弹窗宽高进行居中定位

        return {
          width: this.popupObj.width || '300px', // 宽
          height: this.popupObj.height || '150px', // 高
          // left: this.popupObj.width ? `calc(50% - ${this.getVal(this.popupObj.width)})` : 'auto', // 左定位
          // top: this.popupObj.height ? `calc(50% - ${this.getVal(this.popupObj.height)})` : 'auto', // 上定位
          maxWidth: this.popupObj.maxWidth, // 宽
          maxHeight: this.popupObj.maxHeight, // 高
          left: 'auto', // 左定位
          top: 'auto', // 上定位
          'z-index': this.popupObj.zIndex, // 层级
          resize: this.popupObj.resize, //可变大小
        };
      }
    },
  },
  directives: {
    drag: {
      inserted: (el, binding, vnode) => {
        if (!binding.value) {
          return;
        }
        vnode = vnode.elm;
        el.onmousedown = event => {
          if (event.target.className !== 'modal-header') {
            return;
          }
          event.preventDefault();
          // (clientX, clientY)点击位置距离当前可视区域的坐标(x，y)
          // offsetLeft, offsetTop 距离上层或父级的左边距和上边距

          // 获取鼠标在弹窗中的位置
          let mouseX = event.clientX - vnode.offsetLeft;
          let mouseY = event.clientY - vnode.offsetTop;
          console.log(mouseX);
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
            // 获取弹窗在页面中距X轴的最小、最大 位置
            let minX = 0;
            let maxX = window.innerWidth - vnode.offsetWidth;
            if (left <= minX) {
              left = minX;
            } else if (left >= maxX) {
              left = maxX;
            }
            let minY = 0;
            let maxY = window.innerHeight - vnode.offsetHeight - 71;
            if (top <= minY) {
              top = minY;
            } else if (top >= maxY) {
              top = maxY;
            }
            // 赋值移动
            vnode.style.left = left + 'px';
            if (top < 0) {
              top = 0;
            }
            vnode.style.top = top + 'px';
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
  beforeDestroy() {
    this.$refs.dialog && this.resizeObserver.unobserve(this.$refs.dialog);
    this.popupObj.show = false;
  },
  destroyed() {
    console.log('11');
    console.log(this.$el);
    this.$el.parentNode && this.$el.parentNode.removeChild(this.$el); //节点不在当前组件下需要手动删除
  },
  watch: {
    //监听节点数据变化，随时更新dom位置
    'popupObj.el'(newVal, oldVal) {
      this.appendEl();
    },
    'popupObj.show'(newVal, oldVal) {
      this.showChange = true;
      if (newVal) {
        this.$nextTick(() => {
          this.resizeObserver.observe(this.$refs.dialog);
        });
      }
      console.log(newVal);
    },
  },
};
</script>

<style scoped lang="scss">
/* 蒙层样式 */
.dialog-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.transparent-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* 上层加上这句样式可以实现点击穿透 */
  position: absolute;
  top: 0;
  left: 0;
}

/* 弹窗头部关闭图标样式 */
.modal-header > button.close {
  font-size: 16px;
  color: var(--theme-text-main-color);
}

/* 弹窗整体布局样式 */
.ui-dialog {
  display: flex;
  justify-content: space-between;
  pointer-events: auto;
  flex-flow: column;
  z-index: 1000;
  overflow: auto;
  background-color: var(--theme-card-main-color);
}

/* 弹窗整体布局样式 */
.ui-dialog .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  // box-shadow: var(--theme-bg-box-shadow);
  background-color: var(--theme-card-main-color);
  color: var(--theme-text-main-color);
  padding: 24px;
  &::before,
  &::after {
    content: none;
  }
}

//头部拖拽样式
.drag-style > div.modal-header {
  cursor: move;
  .modal-title {
    pointer-events: none;
    font-size: 16px;
  }
}
// modal-body自动撑满
.ui-dialog .modal-body {
  flex-grow: 1;
  overflow: auto;
  padding: 4px 35px 20px;
}
.ui-dialog .modal-footer {
  display: flex;
  justify-content: flex-end;
  button {
    margin-left: 15px;
  }
}
.ui-dialog .export-excel-wrapper {
  margin-right: 10px;
}
</style>
