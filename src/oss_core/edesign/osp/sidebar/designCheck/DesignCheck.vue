<!--
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2021-06-08 15:26:48
 * @LastEditors: Please set LastEditors
 * @Description: 
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\designCheck\DesignCheck.vue
--> 
<template>
    <div class="design-chenk-container">
        <div class="design-chenk-header">
            <div>{{$t('NAME')}}</div>
            <div :title="$t('STATUS_ERROR')" class="icon_osp icon_ospreloadtime1"></div>
            <div :title="$t('STATUS_WARN')" class="icon_osp icon_ospkuaichaoshi"></div>
            <div :title="$t('STATUS_IGNORE')" class="icon_osp icon_ospbujinji"></div>
        </div>
        <div class="design-chenk-body">
            <div v-for="(items, indexs) in designList" :key="indexs">
                <div class="design-chenk-tap-tit">
                    <div class="tap icon_osp" :class="items.show ? 'icon_ospsuoxiao' : 'icon_ospfangda'" @click="gridToggle(indexs)"></div>
                    <div>{{items.policyTypeName}}</div>
                    <div v-if="modeType === 'prepare'">
                        <input type="radio" :name="items.policyTypeName" :checked="items.checkENum === items.child.length" @click="changeTypeAll(items, 'E')" :disabled="editableFalg === 'N'">
                        <input type="radio" :name="items.policyTypeName" :checked="items.checkWNum === items.child.length" @click="changeTypeAll(items, 'W')" :disabled="editableFalg === 'N'">
                        <input type="radio" :name="items.policyTypeName" :checked="items.checkINum === items.child.length" @click="changeTypeAll(items, 'I')" :disabled="editableFalg === 'N'">
                    </div>
                </div>
                <transition v-on:enter="enter" v-on:leave="leave">
                    <div class="design-chenk-body-content v9-transition" v-show="items.show" :ref="items.policyTypeName">
                        <div v-for="(item, index) in items.child" :key="index">
                            <div class="design-chenk-tap-tit design-chenk-tap-content">
                                <div></div>
                                <div :title="item.policyName">{{item.policyName}}</div>
                                <div>
                                    <div class="policy-params icon_osp icon_ospattribute" :class="{notClick: modeType !== 'prepare' || editableFalg === 'N'}" v-if="item.paramList && item.paramList.length > 0" @click="changeParam(items, item)" :title="$t('DESIGN_CHECK_POLICY_PARAMS')"></div>
                                </div>
                                <div v-if="modeType === 'prepare'">
                                    <input type="radio" :name="item.policyName" :checked="item.checkLevel === 'E'" @click="changeType(items, item, 'E')" :disabled="editableFalg === 'N'">
                                    <input type="radio" :name="item.policyName" :checked="item.checkLevel === 'W'" @click="changeType(items, item, 'W')" :disabled="editableFalg === 'N'">
                                    <input type="radio" :name="item.policyName" :checked="item.checkLevel === 'I'" @click="changeType(items, item, 'I')" :disabled="editableFalg === 'N'">
                                </div>
                                <div class="progress" v-if="modeType === 'checking' && item.percent < 100">
                                    <Progressbar :min="1" :max="100" v-model="item.percent"></Progressbar>
                                </div>
                                <div class="viewList" v-if="item.percent >= 100 && (!item.errorMessage || !(Number(item.percent) === 500))">
                                    <button type="button" class="btn-link resultView" @click="viewResult(item.resultList, item, 'success')" :disabled="!(item.resultList && item.resultList.length > 0)">{{$t('DESIGN_CHECK_VIEW_RESULT')}}<sup>({{item.resultList.length}})</sup></button>
                                </div>
                                <div class="viewList" v-if="item.percent >= 100 && (item.errorMessage && Number(item.percent === 500))">
                                    <button type="button" class="btn-link resultView" @click="viewResult(item.errorMessage, item, 'error')">{{$t('STATUS_ERROR')}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <div class="design-chenk-footer">
            <button type="button" class="btn btn-primary" @click="checkSave" :disabled="modeType === 'checking'">{{checkLabel}}</button>
        </div>
        <ParamForm :appendEl="hldEl" ref="paramForm"></ParamForm>
        <ViewResult :appendEl="hldEl" :errorMessage="errorMessage" v-on="$listeners" :checkResult="checkResult" ref="viewResult"></ViewResult>
    </div>
</template>

<script>
import ParamForm from './paramForm.vue';
import ViewResult from './viewResult.vue';
import { queryPolicyData, savePolicyData, checkPolicyData, getCommonConfigData } from '../../map-control/map-control-api';

export default {
    name: 'DesignCheck',
    inject: ['getProjectInfo', 'getMapBox', 'getControlData', 'getHldEl', 'getPropertyConfigObj'],
    computed: {
        mapBox() {
            return this.getMapBox();
        },
        controlData() {
            return this.getControlData();
        },
        schemaInfo() {
            return this.getProjectInfo();
        },
        hldEl() {
            return this.getHldEl();
        },
        propertyConfigObj() {
            return this.getPropertyConfigObj();
        },
    },
    components: {
        ParamForm,
        ViewResult,
    },
    data() {
        return {
            designList: [],
            modeType: 'prepare',
            socket: undefined,
            socketId: '',
            initQueryData: {},
            checkLabel: this.$t('DESIGN_CHECK_CHECK'),
            errorMessage: '',
            checkResult: [],
            editableFalg: 'Y',
        };
    },
    created() {},
    mounted() {
        let date = fish.getUUID() + 'v';
        this.socketId = date;
        this.initSocket();
        this.getCheckData();
    },
    methods: {
        initSocket() {
            let url = `${this.propertyConfigObj.websocketType}://${this.propertyConfigObj.websocketUrl}${this.propertyConfigObj.websocketPath}`;
            this.socket = new WebSocket(`${url}${this.socketId}`);
            this.socket.onopen = this.socketOpen;
            this.socket.onmessage = this.socketMessage;
            this.socket.onclose = this.socketClose;
        },
        getCheckData() {
            $.blockUI({ message: 'loading' }); // loading
            getCommonConfigData(this.schemaInfo.sprintId, 'DESIGNER_CHECK_LEVEL').then(config => {
                if (config && config.paramVal) {
                    this.editableFalg = config.paramVal;
                }
                let param = {
                    sprintId: this.schemaInfo.sprintId,
                };
                this.editableFalg === 'N' ? '' : (param.schemaId = this.schemaInfo.schemaId);
                queryPolicyData(param).then(result => {
                    result.schemaId = this.schemaInfo.schemaId;
                    this.initQueryData = result;
                    this.createPolicyList(JSON.parse(JSON.stringify(result)));
                    $.unblockUI(); //  loading
                });
            });
        },

        createPolicyList(result) {
            if (result && result.policyDTOList && result.policyDTOList.length > 0) {
                let _designList = [];
                let resultList = result.policyDTOList;
                let parentTypeList = [];
                let parentList = [];
                resultList.forEach(res => {
                    if (parentTypeList.indexOf(res.policyType) === -1) {
                        parentTypeList.push(res.policyType);
                        parentList.push({
                            policyTypeName: res.policyTypeName,
                            policyType: res.policyType,
                        });
                    }
                });
                parentList.forEach(parent => {
                    let childList = resultList.filter(res => res.policyType === parent.policyType);
                    let child = [];
                    let checkENum = 0;
                    let checkWNum = 0;
                    let checkINum = 0;
                    childList.forEach(res => {
                        child.push({
                            policyName: res.policyName,
                            policyCode: res.policyCode,
                            checkLevel: res.checkLevel,
                            paramList: res.paramList,
                            percent: 0,
                            resultList: [],
                        });
                        switch (res.checkLevel) {
                            case 'E':
                                checkENum++;
                                break;
                            case 'W':
                                checkWNum++;
                                break;
                            case 'I':
                                checkINum++;
                                break;
                            default:
                                break;
                        }
                    });
                    _designList.push({
                        policyTypeName: parent.policyTypeName,
                        policyType: parent.policyType,
                        show: true,
                        child,
                        checkENum,
                        checkWNum,
                        checkINum,
                    });
                });
                this.designList = _designList;
                this.modeType = 'prepare';
                this.checkLabel = this.$t('DESIGN_CHECK_CHECK');
                this.$nextTick(this.getHeight);
            }
        },

        socketOpen(evt) {
            // fish.toast('success', 'WebSocket Connectioning Successfully!');
        },
        socketMessage(evt) {
            let data = evt && evt.data;
            let resultObj = JSON.parse(data);
            console.log(resultObj);
            this.initPercent(resultObj);
        },
        socketClose(evt) {
            // fish.toast('info', 'WebSocket Connectioning Closed');
        },

        initPercent(resultObj) {
            this.designList.forEach(singleParam => {
                singleParam.child.forEach(singleChild => {
                    if (resultObj.code === singleChild.policyCode) {
                        singleChild.percent = resultObj.percent;
                        singleChild.resultList = resultObj.value || [];
                        singleChild.errorMessage = '';
                        if (Number(resultObj.percent) === 500) {
                            singleChild.errorMessage = resultObj.value;
                        }
                    }
                });
            });
            let checked = true;
            this.designList.forEach(singleParam => {
                singleParam.child.forEach(singleChild => {
                    if (Number(singleChild.percent) < 100) {
                        checked = false;
                    }
                });
            });
            if (checked) {
                this.modeType = 'checked';
                this.checkLabel = this.$t('DESIGN_CHECK_BACK');
            }
        },
        checkSave() {
            if (this.modeType === 'checked') {
                this.createPolicyList(this.initQueryData);
                return;
            }
            $.blockUI({ message: 'loading' }); // loading
            let initParam = this.createInitParamList();
            this.saveAction(initParam).then(result => {
                this.designList.forEach(singleParam => {
                    singleParam.child.forEach(singleChild => {
                        if (singleChild.checkLevel === 'I') {
                            singleChild.percent = 100;
                            singleChild.resultList = [];
                            singleChild.errorMessage = '';
                        }
                    });
                });
                checkPolicyData(initParam).then(present => {
                    $.unblockUI(); //  loading
                    fish.toast('success', this.$t('DESIGN_CHECK_CHECKING_TIPS'));
                    this.modeType = 'checking';
                    this.checkLabel = this.$t('DESIGN_CHECK_CHECKING');

                    let checked = true;
                    this.designList.forEach(singleParam => {
                        singleParam.child.forEach(singleChild => {
                            if (Number(singleChild.percent) < 100) {
                                checked = false;
                            }
                        });
                    });
                    if (checked) {
                        this.modeType = 'checked';
                        this.checkLabel = this.$t('DESIGN_CHECK_BACK');
                    }
                });
            });
        },

        saveAction(param) {
            return new Promise((resolve, reject) => {
                if (this.editableFalg === 'N') {
                    resolve();
                } else {
                    savePolicyData(param).then(result => {
                        resolve(result);
                    });
                }
            });
        },

        createInitParamList() {
            let allChildList = [];
            this.designList.forEach(desingObj => {
                allChildList = allChildList.concat(desingObj.child);
            });
            this.initQueryData.policyDTOList.forEach(singleParam => {
                let findRes = allChildList.find(res => res.policyCode === singleParam.policyCode);
                if (findRes) {
                    singleParam.checkLevel = findRes.checkLevel;
                    if (findRes.paramList && findRes.paramList.length > 0) {
                        singleParam.paramList.forEach(paramObj => {
                            findRes.paramList.forEach(res => {
                                if (res.paramCode === paramObj.paramCode) {
                                    paramObj.defValue = res.defValue;
                                }
                            });
                        });
                    }
                }
                singleParam.websocketId = this.socketId;
            });
            this.initQueryData.websocketId = this.socketId;
            return this.initQueryData;
        },

        viewResult(result, item, flag) {
            this.$refs.viewResult.popupResult.show = false;
            this.$nextTick(() => {
                if (flag === 'success') {
                    if (result && result.length > 0) {
                        this.errorMessage = '';
                        this.checkResult = result;
                        this.$refs.viewResult.initGridData(result, item);
                        this.$refs.viewResult.popupResult.show = true;
                        this.$refs.viewResult.popupResult.ok = item.policyCode === 'C-CS2-000-0103' ? 'Repair Data' : '';
                    } else {
                        fish.toast('info', this.$t('DESIGN_CHECK_RESULT_NULL'));
                    }
                } else if (flag === 'error') {
                    this.errorMessage = result;
                    this.$refs.viewResult.popupResult.show = true;
                }
            });
        },

        changeParam(items, item) {
            this.$refs.paramForm.initParmData(items, item);
            this.$refs.paramForm.popupParam.show = true;
        },

        // 单个勾选
        changeType(items, item, type) {
            if (item.checkLevel === type) {
                return;
            }
            switch (item.checkLevel) {
                case 'E':
                    items.checkENum--;
                    break;
                case 'W':
                    items.checkWNum--;
                    break;
                case 'I':
                    items.checkINum--;
                    break;
                default:
                    break;
            }
            switch (type) {
                case 'E':
                    items.checkENum++;
                    break;
                case 'W':
                    items.checkWNum++;
                    break;
                case 'I':
                    items.checkINum++;
                    break;
                default:
                    break;
            }
            item.checkLevel = type;
        },

        // 每列的全部勾选
        changeTypeAll(items, type) {
            if (
                (items.checkENum === items.child.length && type === 'E') || //无效点击
                (items.checkWNum === items.child.length && type === 'W') ||
                (items.checkINum === items.child.length && type === 'I')
            ) {
                return;
            }
            items.child.forEach(item => this.changeType(items, item, type));
        },
        getHeight() {
            this.designList.forEach(item => {
                if (this.$refs[item.policyTypeName]) {
                    let el = this.$refs[item.policyTypeName][0];
                    this.enter(el);
                }
            });
        },
        // 收放
        gridToggle(index) {
            this.designList[index].show = !this.designList[index].show;
        },
        // 进入中
        enter(el, done) {
            el.style.height = 'auto';
            let endHeight = window.getComputedStyle(el).height;
            el.style.height = '0px';
            el.offsetHeight; // force repaint
            el.style.height = endHeight;
        },

        // 离开时
        leave(el) {
            el.style.height = '0px';
        },
    },
};
</script>
  
<style lang="scss" scoped>
@import 'designCheck';
</style>