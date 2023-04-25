<template>
    <Popup :popupObj="popup" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <el-scrollbar>
                <Tree :fNodes="fNodes" :view="view" :check="check" ref="tree" :level='2' v-if="fNodes.length > 0"></Tree>
                <Empty v-else></Empty>
            </el-scrollbar>
        </template>
    </Popup>
</template>
<script>
import { querySyncTask } from '@/oss_core/edesign/api/query/schema.js';

export default {
  name: 'SplicePreview',
  props: {},
  inject: {
    getHldEl: {
      default: () => {},
    },
    getProjectInfo: {
      default: () => {},
    },
  },
  computed: {
    hldEl() {
      return this.getHldEl();
    },
  },
  data() {
    return {
      popup: {
        title: this.$t('E_PUBLISH_TASK_SELECT_TASK_LIST'), // 标题
        ok: this.$t('OK'), // 确认按钮
        close: this.$t('CANCEL'), // 取消按钮
        width: '500', // 宽
        height: '700', // 高
        maxHeight: '80%', //
        maxWidth: '80%', //
        modal: true, //是否遮罩
        body: false, // 是否插入body
        el: this.getHldEl(), // 指定插入节点
        show: false, //是否展示
        drag: true, //是否拖拽
        zIndex: 4, //层级
      },
      check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: { Y: 'ps', N: 'ps' }, // Y 属性定义 checkbox 被勾选后的情况； N 属性定义 checkbox 取消勾选后的情况； "p" 表示操作会影响父级节点； "s" 表示操作会影响子级节点。
      },
      fNodes: [], //树的数据
      view: {
        showLine: true, //展示连接线
      },
      schemaId: this.getProjectInfo().schemaId, //任务单ID
    };
  },
  created() {
    console.log(this.projectInfo);
  },
  mounted() {},
  //方法集合
  methods: {
    //弹窗关闭
    popupClose() {
      this.popup.show = false;
    },

    // 获取勾选树节点信息然后发单
    popupOk() {
      if (this.fNodes.length > 0) {
        let checkNodes = this.$refs.tree.getCheckedNodes();
        if (checkNodes.length > 0) {
          let orderIdList = [];
          checkNodes.forEach(node => {
            if (node.orderId) {
              orderIdList.push(node.orderId);
            }
          });
          console.log(checkNodes);
          this.$emit('launch', orderIdList);
        }
      }
      this.popup.show = false;
    },

    // 初始化树
    initSpliceList() {
      let param = {
        schemaId: this.schemaId,
      };
      querySyncTask(param).then(data => {
        console.log(data);
        this.popup.show = true;
        let fNodes = JSON.parse(JSON.stringify(data.resultData)) || [];
        fNodes.forEach(node => {
          node.open = true; //默认展开
          node.taskList.forEach(task => {
            task.name = task.description;
          });
          node.children = node.taskList;
        });
        this.fNodes = fNodes;
      });
    },
  },
  watch: {
    hldEl(newVal, oldVal) {
      this.popup.el = newVal;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './SelectSplice.scss';
</style>
