<template>
    <div ref="tree" class="tree">
        <ul class="res-tree-right-menu tree-right-menu" ref="menu">
            <li class="js-right-menu" v-for="item in menuArr" :key="item.id" @menuClick="menuClick(item)">
                <a href="#">{{ item.name }}</a>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Tree',

    componentName: 'Tree',

    provide() {
        return {};
    },

    props: {
        menuArr: {
            type: Array, // 右键菜单栏参数[{ name: '', id: ''}]
        },
        fNodes: {
            type: Array,
        },
        view: {
            type: Object,
        },
        callback: {
            type: Object,
        },
        data: {
            type: Object,
        },
        check: {
            type: Object,
        },
        edit: {
            type: Object,
        },
        allCheck: {
            type: Boolean,
        },
        queryData: {
            type: String,
        },
        level: {},

        nodeChange: {},
    },
    watch: {},
    computed: {
        option() {
            return {
                view: this.view,
                check: this.check,
                edit: this.edit,
                data: this.data,
                callback: {
                    beforeClick: (e, treeNode, clickFlag) => {
                        this.$emit('beforeClick', e, treeNode, clickFlag);
                    },
                    onClick: (e, treeNode, clickFlag) => {
                        let nodes = $(this.$refs.tree).tree('getSelectedNodes');
                        this.$emit('onClick', nodes, e, treeNode);
                    },

                    beforeDblClick: (e, treeNode) => {
                        this.$emit('beforeDblClick', e, treeNode);
                    },
                    onDblClick: (e, treeNode) => {
                        let nodes = $(this.$refs.tree).tree('getSelectedNodes');
                        this.$emit('onDblClick', nodes, e, treeNode);
                    },
                    beforeMouseDown: (e, treeNode) => {
                        this.$emit('beforeMouseDown', e, treeNode);
                    },
                    onMouseDown: (e, treeNode) => {
                        this.$emit('onMouseDown', e, treeNode);
                    },
                    beforeMouseUp: (e, treeNode) => {
                        this.$emit('beforeMouseUp', e, treeNode);
                    },
                    onMouseUp: (e, treeNode) => {
                        this.$emit('onMouseUp', e, treeNode);
                    },
                    beforeRightClick: (e, treeNode) => {
                        this.$emit('beforeRightClick', e, treeNode);
                    },
                    onRightClick: (e, treeNode) => {
                        e.preventDefault(); //阻止默认事件
                        this.$emit('onRightClick', e, treeNode);
                        if (treeNode.rightClick && this.menuArr && this.menuArr.length > 0) {
                            $(this.$refs.menu).css({
                                left: e.clientX + 'px',
                                top: e.clientY + 'px',
                                display: 'block',
                            });
                            $('body').on('mousedown', this.hideRightMenu);
                        }
                    },
                    beforeCollapse: (e, treeNode) => {
                        this.$emit('beforeCollapse', e, treeNode);
                    },
                    beforeExpand: (e, treeNode) => {
                        this.$emit('beforeExpand', e, treeNode);
                    },
                    beforeSelect: (e, treeNode, addFlag) => {
                        this.$emit('beforeSelect', e, treeNode, addFlag);
                    },
                    onSelect: (e, treeNode, addFlag) => {
                        this.$emit('onSelect', e, treeNode, addFlag);
                        var checkCount = $(this.$refs.tree).tree('getCheckedNodes', true);
                    },

                    onRemove: (e, treeNode) => {
                        this.$emit('afterRemove', $(this.$refs.tree).tree('getNodes'));
                    },
                    onNodeCreated: (e, treeNode) => {
                        this.$emit('onNodeCreated', e, treeNode);
                        // this.$emit('afterAdd', $(this.$refs.tree).tree('getNodes'));
                    },

                    onCheck: (e, treeNode, addFlag) => {
                        let checkNodes = $(this.$refs.tree).tree('getCheckedNodes', true);
                        this.$emit('onCheck', checkNodes);
                    },
                },
            };
        },
    },
    data() {
        return {
            //options:{}
            fData: [],
            dataSource: [],
        };
    },
    created() {},
    mounted() {
        if (this.menuArr && this.menuArr.length > 0) {
            $(this.$refs.menu).appendTo('body');
        }
        let options = Object.assign({}, this.option, {
            fNodes: this.fNodes,
        });

        $(this.$refs.tree).on('tree:onnodecreated', (e, treeNode) => {
            let id = e.target.id;
            this.$emit('onnodecreated', e, treeNode);
        });

        //加载树插件配置
        this.tree = $(this.$refs.tree).tree(options);
    },
    methods: {
        showIconForTree(treeNode) {
            return !treeNode.isParent;
        },
        reGroup(nodes) {
            let finnaList = [];
            nodes = nodes.filter(one => {
                return one.children ? false : true;
            });
            if (nodes) {
                let parentsOne = [];
                nodes.forEach(two => {
                    if (parentsOne.indexOf(two.getParentNode()) === -1) {
                        if (two.getParentNode()) {
                            parentsOne.push(two.getParentNode());
                        } else {
                            parentsOne.push(two);
                        }
                    }
                });
                parentsOne.forEach(three => {
                    three.children = [];
                    nodes.forEach(node => {
                        if (node.parentTId === three.tId) {
                            three.children.push(node);
                        }
                    });
                });
                if (this.level === 2) {
                    finnaList = parentsOne;
                } else if (this.level === 3) {
                    let superParent = [];
                    parentsOne.forEach(four => {
                        if (superParent.indexOf(four.getParentNode()) === -1) {
                            superParent.push(four.getParentNode());
                        }
                    });

                    superParent.forEach(five => {
                        five.children = [];
                        parentsOne.forEach(node => {
                            if (node.parentTId === five.tId) {
                                five.children.push(node);
                            }
                        });
                    });

                    finnaList = superParent;
                }
            }

            $(this.$refs.tree).tree('reloadData', finnaList);
        },
        menuClick(item) {
            this.$emit('menuClick', item);
        },
        hideRightMenu() {
            $(this.$refs.menu).css({
                display: 'none',
            });
            $('body').off('mousedown', this.hideRightMenu);
        },

        setCheckNode(nodes) {
            if (nodes && nodes.length > 0) {
                nodes.forEach(node => {
                    $(this.$refs.tree).tree('checkNode', node, true, true, false);
                });
            }
        },
        getCheckedNodes() {
            let checkNodes = $(this.$refs.tree).tree('getCheckedNodes', true);
            return checkNodes;
        },
        getNodes() {
            let nodes = $(this.$refs.tree).tree('getNodes', true);
            return nodes;
        },
    },
    watch: {
        fNodes: {
            deep: true,
            immediate: false,
            handler(val, old) {
                if (val) {
                    // let initNodesList = [];
                    // val.forEach(res => initNodesList.push());
                    this.tree.tree('reloadData', val);
                    this.fData = val;
                    this.$emit('allData', $(this.$refs.tree).tree('getNodes'));
                }
            },
        },

        allCheck: {
            deep: true,
            immediate: false,
            handler(val, old) {
                if (val) {
                    $(this.$refs.tree).tree('checkAllNodes', true);
                } else {
                    $(this.$refs.tree).tree('checkAllNodes', false);
                }
            },
        },
        queryData: {
            deep: true,
            immediate: false,
            handler(val, old) {
                if (val) {
                    $(this.$refs.tree).tree('reloadData', this.fData);
                    let filterData = $(this.$refs.tree).tree('getNodesByParamFuzzy', 'name', val);
                    this.reGroup(filterData);
                } else {
                    $(this.$refs.tree).tree('reloadData', this.fData);
                }
            },
        },

        nodeChange: {
            deep: false,
            immediate: false,
            handler(val, old) {
                if (val) {
                    if (val.flag === 'add') {
                        if (val.parent.children.length > 0) {
                            return;
                        }
                        let node = {
                            name: val.node.attrDesc,
                            resType: val.node.resType,
                            children: [],
                        };
                        let newData = $(this.$refs.tree).tree('addNodes', val.parent, node);
                        this.$emit('afterAdd');
                    } else if (val.flag === 'remove') {
                        if (val.node.children.length === 0) {
                            $(this.$refs.tree).tree('removeNode', val.node, false);
                            let data = $(this.$refs.tree).tree('transformToArray', $(this.$refs.tree).tree('getNodes'));
                            let createdChild = [];

                            if (data.length > 2) {
                                let child = [];

                                child[data.length - 3] = [{ name: data[data.length - 1].name, open: true, children: [] }];

                                for (let i = data.length - 3; i > 0; i--) {
                                    child[i - 1] = [{ name: data[i + 1].name, open: true, children: child[i] }];
                                }

                                createdChild = child;
                            }

                            let newData = [
                                {
                                    name: data[0].name,
                                    disabled: true,
                                    open: true,
                                    children: [
                                        {
                                            name: data[1].name,
                                            disabled: true,
                                            open: true,
                                            children: createdChild.length > 0 ? createdChild[0] : createdChild,
                                        },
                                    ],
                                },
                            ];

                            this.$emit('afterAdd', newData);
                        } else {
                            let filterData = $(this.$refs.tree).tree('getNodeByParam', 'name', val.node.name);

                            let parent = filterData.getParentNode();

                            $(this.$refs.tree).tree('removeNode', filterData, false);
                            $(this.$refs.tree).tree('addNodes', parent, filterData.children[0]);

                            let data = $(this.$refs.tree).tree('transformToArray', $(this.$refs.tree).tree('getNodes'));
                            let createdChild = [];

                            if (data.length > 2) {
                                let child = [];

                                child[data.length - 3] = [{ name: data[data.length - 1].name, open: true, children: [] }];

                                for (let i = data.length - 3; i > 0; i--) {
                                    child[i - 1] = [{ name: data[i + 1].name, open: true, children: child[i] }];
                                }

                                createdChild = child;
                            }

                            let newData = [
                                {
                                    name: data[0].name,
                                    disabled: true,
                                    open: true,
                                    children: [
                                        {
                                            name: data[1].name,
                                            disabled: true,
                                            open: true,
                                            children: createdChild.length > 0 ? createdChild[0] : createdChild,
                                        },
                                    ],
                                },
                            ];

                            this.$emit('afterAdd', newData);
                        }
                    }
                }
            },
        },
    },
};
</script>

<style lang="scss" scoped>
/deep/ .glyphicon {
    display: inline-block !important;
}
.tree-right-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    float: left;
    min-width: 160px;
    padding: 5px 0;
    margin: 2px 0 0;
    list-style: none;
    font-size: 13px;
    text-align: left;
    background-color: #fff;
    border: 1px solid #ccc;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    background-clip: padding-box;
}
.tree /deep/ .ztree li ul {
    padding-left: 18px;
}
</style>
