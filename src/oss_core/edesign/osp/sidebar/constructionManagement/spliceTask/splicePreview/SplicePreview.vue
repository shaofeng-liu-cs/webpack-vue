<template>
    <Popup :popupObj="popup" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <el-scrollbar>
                <Tree :fNodes="fNodes" :view="view" :check="check" ref="tree" :level='2'></Tree>
            </el-scrollbar>
        </template>
    </Popup>
</template>
<script>
import { querySplicePointList } from '@/oss_core/edesign/api/query/resId.js';
import { addSpliceTask } from '@/oss_core/edesign/api/add/resId.js';

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
                title: 'Selection', // 标题
                ok: 'OK', // 确认按钮
                close: 'Cancel', // 取消按钮
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
            resType: '', //node类型
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
            let param = {
                schemaId: this.schemaId,
                taskList: [],
            };
            let checkNodes = this.$refs.tree.getNodes();
            checkNodes.forEach(node => {
                if (node.checked) {
                    let taskObj = {
                        title: node.title,
                        description: node.description,
                        resId: node.resId,
                        resType: this.resType,
                        splicePointList: [],
                    };
                    param.taskList.push(taskObj);
                    node.children.forEach(childNode => {
                        if (childNode.checked) {
                            let splicePointObj = {
                                name: childNode.name,
                                fullName: childNode.fullName,
                                fromResSpec: childNode.fromResSpec,
                                fromResId: childNode.fromResId,
                                toResSpec: childNode.toResSpec,
                                toResId: childNode.toResId,
                                resList: childNode.resList,
                                nameSeq: childNode.nameSeq,
                            };
                            taskObj.splicePointList.push(splicePointObj);
                        }
                    });
                }
            });
            addSpliceTask(param).then(data => {
                if (data.resultCode === '0') {
                    fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
                    this.popup.show = false;
                    this.$emit('launchSuccess');
                }
            });
        },

        // 初始化树
        initSpliceList(option) {
            this.resType = option.resType;
            querySplicePointList(option.param).then(data => {
                console.log(data);
                this.popup.show = true;
                let fNodes = JSON.parse(JSON.stringify(data)) || [];
                fNodes.forEach(node => {
                    node.name = node.description;
                    node.open = true; //默认展开
                    node.children = node.splicePointList;
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
@import './SplicePreview.scss';
</style>
