<template>
    <div style="padding-top:10px;">
        <div class="col-md-10 res-tree-search" style="padding-left:10px;">
            <Search v-model="searchValue" ref="search"></Search>
        </div>
        <div class="tree col-md-12">
            <div class="col-md-12" style="padding-top:10px;">
                <Tree :fNodes="fNodes" :data="dataIcon" :check="check" @onDblClick="dbClick" @onCheck="dbCheck" :view="view" :allData="getAllData" ref="oltTree" :queryData="searchValue" :level='2'></Tree>
            </div>
        </div>
    </div>
</template>

<script>
import {loadSchemaOlt} from '../../../topo/TopoHandleAction.js';
export default {
    components: {
        name:'OltTree',
    },
    props: {
        paramInfo: {
            type: Object,
            default: () => {
                return {
                    schemaId: '',
                };
            },
        },
    },
    data() {
        return {
            schemaId:'',
            fNodes: [], // 树数据容器
            dataIcon: {
                key: {
                    iconFontEnable: false
                },
                simpleData: {
                    enable: true
                }, 
            }, 
            view:{
                showIcon: this.showIconForTree,
                showLine: true
            },
            check:{
                enable:true,
                chkStyle: "checkbox",
                chkboxType:  { "Y" : "ps", "N" : "ps" },
            },
            allData:[],
            searchValue:'',
        }
    },
    created() {
    },
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
        console.info("olt tree param:");
        console.info(this.paramInfo);
        this.initTree();
    },
    //方法集合
    methods: {
        initTree() {
            this.treeList = [];
            this.queryChildren();
        },
        getAllData(val) {
            this.allData = val;
        },
        queryChildren() {
            this.$refs.search.value = '';
            this.schemaId = this.paramInfo.schemaId;
            console.info("queryChildren param:");
            console.info(this.paramInfo);
            if (this.schemaId) {
                let param = {
                    schemaId: this.schemaId
                }
                loadSchemaOlt(param).then(data=>{
                    let resultList = data || [];
                    let treeList = [];
                    resultList.forEach(res => {
                        let node = {};
                        node.id = res.deviceId;
                        node.name = res.fullName;
                        node.nodeType = 'DEVICE';
                        node.isParent = true;
                        node.icon = `oss_core/edesign/assets/image/map/new-layer/OLT.png`;
                        let portList = res.portList || [];
                        let childList = [];
                        portList.forEach(port => {
                            port.id = port.portId;
                            port.portName = port.name;
                            port.name = port.seq+"";
                            port.nodeType = 'PORT';
                            port.icon = `oss_core/edesign/assets/image/map/new-layer/PORT.png`;
                        });
                        node.children = portList;
                        treeList.push(node);
                    });
                    this.fNodes = treeList;
                });
            }
        },
        dbClick(nodes) {
        
        },
        dbCheck(nodes){
            console.log("[onCheck ]:");
            console.log(nodes);
            this.$emit('treeCheck', nodes);
        }

    },
    watch: {
        paramInfo: {
            deep: true,
            immediate: false,
            handler(val, oldVal) {
                this.initTree();
            },
        },
    },
}
</script>