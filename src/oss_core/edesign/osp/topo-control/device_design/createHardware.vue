<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content" v-if="show">
        <template v-slot:popupBody>
            <div class="create-hardware">
                <div class="template-div">
                    <label class="required-label">Template Name</label>
                    <div>
                        <Combobox
                            :setting="templateSetting"
                            v-model="template"
                            @change="templateChange"
                            :disabled="inParam.actionType != 'ADD'"
                        ></Combobox>
                    </div>
                </div>
                <div v-if="templateResType" class="basicAttr">
                    <HardwareForm
                        :num="1"
                        :resType="templateResType"
                        :selectedTemplateId="selectedTemplateId"
                        :row="2"
                        ref="createHardwareResForm"
                        :addObject="addObject"
                        :schemaId="inParam.schemaId"
                        :action="action"
                        :templateList="templateList"
                    ></HardwareForm>
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import HardwareForm from '../../../osp/topo-control/device_design/hardwareForm.vue';
import { addHardware } from '@/oss_core/edesign/api/add/resources.js';
import { editHardware } from '@/oss_core/edesign/api/edit/resId.js';
import { isCard, isPanel } from '@/oss_core/base/utils/util.js';
import {loadPanelPortByDevice} from '@/oss_core/edesign/topo/TopoHandleAction.js';
// import ResForm from '../../map-control/clickRight/selection/resForm/ResForm.vue';
export default {
    components: {
        //  ResForm,
        HardwareForm,
    },
    data() {
        return {
            show: false,
            inParam: null,
            title: '',
            CompPopuTopo: {
                title: 'create Hardware', // 标题
                ok: this.$t('OK'), // 确认按钮
                close: this.$t('CLOSE'), // 取消按钮
                width: '600', // 宽
                height: '500', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                left: 'calc(50% - 300px)',
                top: 'calc(50% - 250px)',
                el: this.deviceDesignEl,
            },
            row: {},
            addObject: null,
            template: '',
            templateResType: '',
            selectedTemplateId: '',
            templateSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            action: '',
            templateList: [],
            selectedNodeIsOperate: false,
            deviceInstanceList: [],
        };
    },
    inject: ['getDeviceDesignEl'], // 加载的组件位置
    computed: {
        deviceDesignEl() {
            return this.getDeviceDesignEl();
        },
    },
    mounted() {},
    created() {},
    methods: {
        setParams(params) {
            this.inParam = params;
            this.addObject = this.inParam.addObject;
            this.CompPopuTopo.ok = this.$t('OK'); // 确认按钮
            if (params.actionType === 'ADD') {
                this.title = 'Add Hardware';
                this.action = 'add';
                this.setTemaplteList();
                this.getDeviceInstanceData();
            } else if (params.actionType === 'VIEW') {
                this.title = 'View Hardware';
                this.action = 'view';
                this.CompPopuTopo.ok = '';
                this.getTemplateInfo();
            } else if (params.actionType === 'EDIT') {
                this.title = 'Edit Hardware';
                this.action = 'edit';
                this.getTemplateInfo();
            }

            
        },

        popupClose() {
            this.$emit('refreshClose');
            this.templateSetting.dataSource = [];
            this.templateResType = '';
            this.selectedTemplateId = '';
            this.template = '';
            this.show = false;
        },

        popupOk() {
            let formObj = this.$refs.createHardwareResForm.formValue;
            if (!$(this.$refs.createHardwareResForm.$el).isValid()) {
                return;
            }
            let params = {};
            let actionType = 'A';
            let resType = '';
            let resId = '';
            if (this.inParam.actionType === 'ADD') {
                resType = this.inParam.addObject.parentResType;
                resId = this.inParam.addObject.parentResId;
                formObj.templateId = this.selectedTemplateId;

                let isAllowAddFlag = this.getAllowAddFlag();
                if (!isAllowAddFlag) {
                    fish.toast('warn', this.$t('ADD_MAX_NUM'));
                    return;
                }

            } else if (this.inParam.actionType === 'EDIT') {
                actionType = 'M';
                resType = formObj.resSpecId;
                resId = formObj.hardwareId;
            }
           
            if (this.selectedNodeIsOperate && !formObj.colNo) {
                formObj.colNo = this.inParam.addObject.colNo;
            }

            if (this.selectedNodeIsOperate && !formObj.rowNo) {
                formObj.rowNo = this.inParam.addObject.rowNo;
            }
            formObj.deviceId = this.inParam.deviceId;

            params.actionType = actionType;
            params.resInfo = formObj;
            params.resId = resId;
            params.resType = resType;

            if (this.inParam.actionType === 'ADD') {
                addHardware(params).then(resultList => {
                    fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
                    this.setResultList(resultList.resInfo);
                });
            } else if (this.inParam.actionType === 'EDIT') {
                editHardware(params).then(resultList => {
                    fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
                    this.setResultList(resultList.resInfo);
                });
            }
        },

        setResultList(resultList) {
            this.$emit('refreshEvent', resultList, this.inParam);
            this.templateSetting.dataSource = [];
            this.templateResType = '';
            this.selectedTemplateId = '';
            this.template = '';
            this.show = false;
        },
        
        getAllowAddFlag() {
            let addFlag = false;
            let maxNumTemp = 0;
            let temp = this.templateList.filter(item => item.resSpecId === this.templateResType);
            if (temp.length>0) {
                maxNumTemp = temp[0].maxQty;
            }
            let resInstList = [];
            if (this.deviceInstanceList.length > 0) {
                resInstList = this.deviceInstanceList[0].hardwareList.filter(item => item.resSpecId===this.templateResType);
            }
            
            let maxNum = resInstList.length;
            if (maxNum < maxNumTemp) {
                addFlag = true;
            }
            
            return addFlag;
        },

        async getDeviceInstanceData(){
            this.deviceInstanceList = [];
            let panelParam = {
                resId:this.inParam.deviceId,
                deviceId:this.inParam.deviceId,
                schemaId:this.inParam.schemaId,
            }
            let resPanel = loadPanelPortByDevice(panelParam);
            Promise.all([resPanel]).then(datas => {
                let resList = datas[0];
                this.deviceInstanceList = resList.filter(res => res.deviceData.deviceId === this.inParam.deviceId);
            });
        },

        async setTemaplteList() {
            let parentTemplateId = this.addObject.parentTemplateId;

            let p1 = this.getTemplateList(parentTemplateId);
            Promise.all([p1]).then(result => {
                this.templateList = result[0].resultList;
                if (this.templateList) {
                    let tempList = this.templateList.map(module => {
                        return {
                            name: module.templateName,
                            value: module.resSpecId + '-' + module.templateId,
                        };
                    });
                    this.templateSetting.dataSource = tempList;
                    if (this.inParam.actionType === 'ADD') {
                        this.template = this.templateList[0].resSpecId + '-' + this.templateList[0].templateId;
                    } else {
                        let templateId = this.addObject.attrObject.templateId;
                        let templateInfo = this.templateList.find(temChild => temChild.templateId === templateId) || {};
                        if (templateInfo) {
                            this.template = templateInfo.resSpecId + '-' + templateInfo.templateId;
                        }
                    }
                    this.templateSetting.value = this.template;
                    this.templateChange();
                }
                // console.log(this.templateList);
            });
        },

        async getTemplateInfo() {
            let templateId = this.addObject.attrObject.templateId;
            let templateResType = this.addObject.attrObject.resSpecId;

            let p1 = this.getTemplateAndModel(templateId);
            Promise.all([p1]).then(result => {
                let templateInfo = result[0].resultList;

                if (templateInfo) {
                    let tempList = [];
                    tempList.push(templateInfo);
                    this.templateList = tempList;
                    this.template = templateResType + '-' + templateInfo.templateId;
                    let tempDatas = [{ name: templateInfo.templateName, value: this.template }];
                    this.templateSetting.dataSource = tempDatas;
                    this.templateSetting.value = this.template;
                    this.templateChange();
                }
                // console.log(this.templateList);
            });
        },

        templateChange() {
            let resType = this.template.split('-')[0];
            this.templateResType = resType;
            this.selectedTemplateId = this.template.split('-')[1];
            this.setTitle();
        },

        getTemplateList(templateId) {
            return new Promise((resolve, reject) => {
                fish.get({
                    url: `edesign/hardware/info/hardwaretemplatelist/v1`,
                    data: {
                        templateId: templateId, // 要添加硬件的 父级模板id
                    },
                    success: result => {
                        resolve(result);
                    },
                    error: reject,
                });
            });
        },

        getTemplateAndModel(templateId) {
            return new Promise((resolve, reject) => {
                fish.get({
                    url: `edesign/hardware/info/hardwaretemplateinfo/v1`,
                    data: {
                        templateId: templateId,
                    },
                    success: result => {
                        resolve(result);
                    },
                    error: reject,
                });
            });
        },

        setTitle() {
            if (this.title.indexOf('-') != -1) {
                return;
            }
            if (this.templateResType == 'SHELF') {
                this.title += ' - Shelf';
            } else if (isCard(this.templateResType)) {
                this.title += ' - Card';
            } else if (this.templateResType == 'CHASSIS') {
                this.title += ' - Chassis';
            } else if (this.templateResType == 'PANEL') {
                this.title += ' - Panel';
            } else if (this.templateResType == 'MOD_SPLT') {
                this.title += ' - Splitter Module';
            } else if (this.templateResType == 'MOD_SPLICE') {
                this.title += ' - Splice Tray Module';
            }
            this.CompPopuTopo.title = this.title;

            if (
                (isPanel(this.templateResType) && isPanel(this.addObject.resSpecId)) ||
                (isCard(this.templateResType) && isCard(this.addObject.resSpecId))
            ) {
                this.selectedNodeIsOperate = true;
            }
        },
    },
    watch: {},
};
</script>
<style lang="scss" scoped>
.connect-class {
    margin-top: 10px;
}

.content-label {
    text-align: right;
}

/deep/ .create-hardware div .panel-body {
    padding-top: 5px;
}

.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}

.create-hardware {
    height: 100%;
    display: flex;
    flex-flow: column;
    border: 1px solid #ebebeb;
    padding: 10px;
    .template-div {
        display: flex;
        flex-flow: column;
        width: 50%;
        padding-bottom: 10px;
    }
    .basicAttr {
        overflow: auto;
    }
}
</style>
