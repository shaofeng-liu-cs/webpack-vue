<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <div class="selection-body-cont">
                <div class="conn-model"><span>{{$t('NATURE_CONNECTION')}}:</span>
                    <div class="model-switch">
                        <div ref="switchValue" class="switch_value_on" @click="clickSwitch">{{switchFlagValue}}<div ref="switchBtn" class="switch_btn_on"></div>
                        </div>
                    </div>
                </div>
                <div class="selection-body" v-if="createType=='DD'">
                    <form class="form-group" ref="addFormJump">
                        <div class="form-huhuan">
                            <div class="form-group">
                                <div class="form_row">
                                    <div class="form_name">
                                        <label class="label-control required-label">{{jumpPage.aResLable}}</label>
                                    </div>
                                    <div class="form_value">
                                        <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                                    </div>
                                </div>
                                <div class="form_row">
                                    <div class="form_name">
                                        <label class="label-control required-label">{{jumpPage.zResLable}}</label>
                                    </div>
                                    <div class="form_value">
                                        <Combobox class="form-control" v-model="cmbZResource" :setting="cmbZResourceSetting" name="cmbZResource" disabled data-rule="required"></Combobox>
                                    </div>
                                </div>
                            </div>
                            <div class="form-huhuan-btn el-icon-sort" @click="exchangeAZ"></div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{jumpPage.aResStart}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForJ" v-model="aEnd" ref="optAEndRefForJ" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{jumpPage.aResStart}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForJSmart" v-model="aEndSmart" ref="optAEndRefForJSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false && zResourceShow">
                            <div class="form_name">
                                <label class="label-control required-label">{{jumpPage.zResLable}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbZResource" :setting="cmbZResourceSetting" name="cmbZResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{jumpPage.zResStart}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForJ" v-model="zEnd" ref="optZEndRefForJ" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{jumpPage.zResStart}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForJSmart" v-model="zEndSmart" ref="optZEndRefForJSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForJ" v-model="connCount" ref="optConnCountRefForJ" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="selection-body" v-if="createType=='PC'">
                    <form class="form-group" ref="addFormTeminate">
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('DEVICE_NAME')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForT" v-model="aEnd" ref="optAEndRefForT" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForTSmart" v-model="aEndSmart" ref="optAEndRefForTSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CABLE_NAME')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbZResource" :setting="cmbZResourceSetting" name="cmbZResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForT" v-model="zEnd" ref="optZEndRefForT" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForTSmart" v-model="zEndSmart" ref="optZEndRefForTSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForT" v-model="connCount" ref="optConnCountRefForT" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('DiIRECTION')}}</label>
                            </div>
                            <div class="form_value">
                                <el-radio-group v-model="directionStr" size="mini">
                                    <el-radio-button label="In" :buttonObj="buttonObj" :disabled="buttonFlags"></el-radio-button>
                                    <el-radio-button label="Out" :buttonObj="buttonObj"></el-radio-button>
                                    <el-radio-button label="N/A" :buttonObj="buttonObj" :disabled="buttonFlags"></el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="selection-body" v-if="createType=='CC'">
                    <form class="form-group" ref="addFormSplice">
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('A_CABLE')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForS" v-model="aEnd" ref="optAEndRefForS" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForSSmart" v-model="aEndSmart" ref="optAEndRefForSSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('Z_CABLE')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbZResource" :setting="cmbZResourceSetting" name="cmbZResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForS" v-model="zEnd" ref="optZEndRefForS" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===true">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForSSmart" v-model="zEndSmart" ref="optZEndRefForSSmart" data-rule="required;" />
                            </div>
                        </div>
                        <div class="form_row" v-if="switchFlag===false">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForS" v-model="connCount" ref="optConnCountRefForS" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                    </form>
                </div>
                <div>&nbsp;</div>
                <div class="selection-body tips" v-if="switchFlag===true">{{$t('SMART_TIPS')}}</div>
            </div>
        </template>
    </Popup>
</template>
<script>
import { loadPanelPortByDevice, loadCableTopoInfo } from '../../../topo/TopoHandleAction.js';

export default {
    components: {},
    data() {
        return {
            buttonFlags: false, //决定In和N/A按钮是否禁用
            switchFlag: true,
            switchFlagValue: 'ON',
            resData: null,
            createType: 'DD',
            cmbAResource: '',
            cmbZResource: '',
            aEnd: '',
            zEnd: '',
            aEndSmart: '', //Smart 模式
            zEndSmart: '', //Smart 模式
            connCount: '',
            zResourceShow: true,
            directionStr: 'N/A',
            jumpPage: {
                aResLable: this.$t('A_DEVICE'),
                zResLable: this.$t('Z_DEVICE'),
                aResStart: this.$t('JUMP_A_START'),
                zResStart: this.$t('JUMP_Z_START'),
            },
            cmbAResourceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            cmbZResourceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            resourceList: [],
            CompPopuTopo: {
                title: 'create connection', // 标题
                ok: this.$t('OK'), // 确认按钮
                close: this.$t('CLOSE'), // 取消按钮
                width: '650', // 宽
                height: '390', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
            },
            buttonObj: {
                height: '26px', // 高
            },
        };
    },
    mounted() {},
    created() {},
    //方法集合
    methods: {
        clickSwitch() {
            this.switchFlag = !this.switchFlag;
            if (this.switchFlag) {
                this.aEnd = '1';
                this.zEnd = '1';
                this.connCount = '1';
                this.switchFlagValue = 'ON';
                this.$refs.switchValue.className = 'switch_value_on';
                this.$refs.switchBtn.className = 'switch_btn_on';
            } else {
                this.aEnd = '';
                this.zEnd = '';
                this.connCount = '';
                this.switchFlagValue = 'OFF';
                this.$refs.switchValue.className = 'switch_value_off';
                this.$refs.switchBtn.className = 'switch_btn_off';
            }
        },

        setPageInfo() {
            this.switchFlag = true;
            this.switchFlagValue = 'ON';
            this.zResourceShow = false;
            this.jumpPage.aResLable = this.$t('JUMP_A_DEVICE');
            this.jumpPage.zResLable = this.$t('JUMP_Z_DEVICE');
            this.jumpPage.aResStart = this.$t('JUMP_A_START');
            this.jumpPage.zResStart = this.$t('JUMP_Z_START');
        },
        setResData(dataInfo) {
            this.resData = {};
            this.aEnd = '1';
            this.zEnd = '1';
            this.aEndSmart = '';
            this.zEndSmart = '';
            this.connCount = '1';
            this.cmbAResource = '';
            this.cmbZResource = '';
            this.resourceList = [];
            this.createType = dataInfo.createType; //PP:跳接，PC:成端，CC:熔接
            this.resData = dataInfo;
            if (this.createType === 'DD') {
                this.CompPopuTopo.title = this.$t('JUMP');
            } else if (this.createType === 'PC') {
                this.CompPopuTopo.title = this.$t('TERMINATE');
            } else if (this.createType === 'CC') {
                this.CompPopuTopo.title = this.$t('SPLICE');
            }
            let promises = [];
            this.setPageInfo();
            let param = {
                schemaId: this.resData.schemaId,
                deviceId: this.resData.deviceId || this.resData.aDeviceId,
            };
            if (this.createType === 'DD') {
                promises.push(loadPanelPortByDevice(param));
                if (this.resData.aDeviceId !== this.resData.zDeviceId) {
                    param.deviceId = this.resData.zDeviceId;
                    promises.push(loadPanelPortByDevice(param));
                }
            } else if (this.createType === 'PC') {
                promises.push(loadPanelPortByDevice(param));
                promises.push(loadCableTopoInfo(param, this.resData.cableId));
            } else if (this.createType === 'CC') {
                promises.push(loadCableTopoInfo(param, this.resData.aCableId));
                promises.push(loadCableTopoInfo(param, this.resData.zCableId));
            }
            Promise.all(promises).then(datas => {
                let aRes = datas[0];
                let zRes = datas[1] || datas[0];

                if (this.createType === 'DD') {
                    let aDataInfo = aRes[0].deviceData;
                    let zDataInfo = zRes[0].deviceData;
                    aDataInfo.deviceMaxUnitNumber = aRes[0].portList.length;
                    zDataInfo.deviceMaxUnitNumber = zRes[0].portList.length;
                    this.resourceList.push(aDataInfo);
                    this.resourceList.push(zDataInfo);
                } else if (this.createType === 'PC') {
                    let cableInfo = zRes.cable;
                    cableInfo.cutUnitRecord = zRes.cutUnitRecord;

                    // 2021-05-11 lp-丰富设备和光缆最大端口数，用于termination时输入框限制
                    let cableMaxUnitNumber = 0;
                    let deviceMaxUnitNumber = 0;
                    if (zRes.cableUnits) {
                        let maxList = zRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE');
                        if (maxList) {
                            cableMaxUnitNumber = maxList.length;
                        }
                    }
                    cableInfo.cableMaxUnitNumber = cableMaxUnitNumber;
                    aRes.forEach(res => (deviceMaxUnitNumber += res.portList.length));
                    aRes[0].deviceData.deviceMaxUnitNumber = deviceMaxUnitNumber;
                    // End

                    this.resourceList.push(aRes[0].deviceData);
                    this.resourceList.push(cableInfo);
                } else if (this.createType === 'CC') {
                    let aCableInfo = aRes.cable;
                    aCableInfo.cutUnitRecord = aRes.cutUnitRecord;
                    let zCableInfo = zRes.cable;
                    zCableInfo.cutUnitRecord = zRes.cutUnitRecord;

                    // 2021-05-11 lp-丰富光缆和光缆最大端口数，用于Splice时输入框限制
                    let aCableMaxUnitNumber = 0;
                    let zCableMaxUnitNumber = 0;
                    if (aRes.cableUnits) {
                        let maxList = aRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE');
                        if (maxList) {
                            aCableMaxUnitNumber = maxList.length;
                        }
                    }
                    if (zRes.cableUnits) {
                        let maxList = zRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE');
                        if (maxList) {
                            zCableMaxUnitNumber = maxList.length;
                        }
                    }
                    aCableInfo.cableMaxUnitNumber = aCableMaxUnitNumber;
                    zCableInfo.cableMaxUnitNumber = zCableMaxUnitNumber;
                    // End

                    if (aCableInfo.cableId === this.resData.aCableId) {
                        this.resourceList.push(aCableInfo);
                        this.resourceList.push(zCableInfo);
                    } else {
                        this.resourceList.push(zCableInfo);
                        this.resourceList.push(aCableInfo);
                    }
                }

                if (this.resourceList.length > 0) {
                    let aDataSource = [];
                    let zDataSource = [];
                    this.resourceList.forEach(resource => {
                        if (this.createType === 'DD') {
                            this.cmbAResource = this.resData.aDeviceId;
                            this.cmbZResource = this.resData.zDeviceId;
                            if (this.resData.aDeviceId === this.resData.zDeviceId) {
                                let aData = {};
                                aData.name = resource.name || resource.fullName;
                                aData.value = resource.deviceId;
                                aDataSource.push(aData);
                                zDataSource = aDataSource;
                            } else {
                                let dData = {};
                                dData.name = resource.name || resource.fullName;
                                dData.value = resource.deviceId;
                                if (resource.deviceId === this.resData.aDeviceId) {
                                    this.cmbAResource = this.resData.aDeviceId;
                                    aDataSource.push(dData);
                                }
                                if (resource.deviceId === this.resData.zDeviceId) {
                                    this.zmbAResource = this.resData.zDeviceId;
                                    zDataSource.push(dData);
                                }
                            }
                        } else if (this.createType === 'PC') {
                            this.cmbAResource = this.resData.deviceId;
                            this.cmbZResource = this.resData.cableId;
                            if (resource.deviceId && resource.deviceId === this.resData.deviceId) {
                                let dData = {};
                                dData.name = resource.name || resource.fullName;
                                dData.value = resource.deviceId;

                                aDataSource.push(dData);
                            } else if (resource.cableId && resource.cableId === this.resData.cableId) {
                                let dData = {};
                                dData.name = resource.name || resource.fullName;
                                dData.value = resource.cableId;
                                zDataSource.push(dData);
                            }
                        } else if (this.createType === 'CC') {
                            this.cmbAResource = this.resData.aCableId;
                            this.cmbZResource = this.resData.zCableId;
                            let dData = {};
                            dData.name = resource.name || resource.fullName;
                            dData.value = resource.cableId;
                            if (resource.cableId === this.resData.aCableId) {
                                aDataSource.push(dData);
                            } else if (resource.cableId === this.resData.zCableId) {
                                zDataSource.push(dData);
                            }
                        }
                    });
                    this.cmbAResourceSetting.dataSource = aDataSource;
                    this.cmbZResourceSetting.dataSource = zDataSource;
                    // 如果成端有一个设备是OLT，直接设为Out，另外两个按钮禁用
                    const findRes = this.cmbAResourceSetting.dataSource.find(item => item.value === this.cmbAResource);
                    if (findRes.name.indexOf('OLT') > -1) {
                        this.buttonFlags = true;
                        this.directionStr = 'Out';
                    } else {
                        this.buttonFlags = false;
                    }
                }
            });
        },
        changeParam() {},

        resetForm() {
            if (this.createType === 'DD') {
                this.$refs['addFormJump'].reset();
            } else if (this.createType === 'PC') {
                this.$refs['addFormTeminate'].reset();
            } else if (this.createType === 'CC') {
                this.$refs['addFormSplice'].reset();
            }
            this.aEnd = '';
            this.zEnd = '';
            this.aEndSmart = '';
            this.zEndSmart = '';
            this.connCount = '';
        },

        isConnectFlag(aEnd, zEnd, connCount) {
            let isConnFlag = true;

            if (this.createType === 'PC') {
                let cutUnitRecord = this.resourceList[1].cutUnitRecord;
                if (cutUnitRecord) {
                    isConnFlag = this.isRange(zEnd, connCount, cutUnitRecord);
                }
            } else if (this.createType === 'CC') {
                let aCutUnitRecord = this.resourceList[0].cutUnitRecord;
                let zCutUnitRecord = this.resourceList[1].cutUnitRecord;
                let aIsConnFlag = true;
                let zIsConnFlag = true;
                if (aCutUnitRecord) {
                    aIsConnFlag = this.isRange(aEnd, connCount, aCutUnitRecord);
                }
                if (zCutUnitRecord) {
                    zIsConnFlag = this.isRange(zEnd, connCount, zCutUnitRecord);
                }
                if (!aIsConnFlag || !zIsConnFlag) {
                    isConnFlag = false;
                }
            }
            return isConnFlag;
        },

        isRange(seq, connCount, cutUnitRecord) {
            let isRangFlag = false;
            if (cutUnitRecord) {
                for (let iSeq = seq; iSeq < seq + connCount; iSeq++) {
                    let arrUnitList = cutUnitRecord.split(',');
                    for (let j = 0; j < arrUnitList.length; j++) {
                        let arrUnit = arrUnitList[j].split('-');
                        let startUnit = Number(arrUnit[0]);
                        let endUnit = Number(arrUnit[1]);
                        if (Number(iSeq) >= startUnit && Number(iSeq) <= endUnit) {
                            isRangFlag = true;
                            break;
                        }
                    }
                    if (!isRangFlag) {
                        break;
                    }
                }
            }

            return isRangFlag;
        },

        isValidForMaxFlag(aEnd, zEnd, connCount) {
            let validFlag = true;
            if (this.createType === 'PC') {
                let deviceMaxNumber = this.resourceList[0].deviceMaxUnitNumber;
                let cableMaxNumber = this.resourceList[1].cableMaxUnitNumber;
                if (aEnd + connCount - 1 > deviceMaxNumber || zEnd + connCount - 1 > cableMaxNumber) {
                    validFlag = false;
                }
            } else if (this.createType === 'CC') {
                let aCableMaxUnitNumber = this.resourceList[0].cableMaxUnitNumber;
                let zCableMaxUnitNumber = this.resourceList[1].cableMaxUnitNumber;
                if (aEnd + connCount - 1 > aCableMaxUnitNumber || zEnd + connCount - 1 > zCableMaxUnitNumber) {
                    validFlag = false;
                }
            }
            return validFlag;
        },

        /**
         * 连接数据结构和数量要一直；使用“-”选择范围，使用“,”分隔每个部分。
         * this.aEndSmart: 1-5,13-14
         * this.zEndSmart: 25-29,34-35
         */
        // isEqualFormat(aEndSmart, zEndSmart) {
        //     let isEqual = 0;
        //     let arrAEndSmart = aEndSmart.split(',');
        //     let arrZEndSmart = zEndSmart.split(',');
        //     if (arrAEndSmart.length !== arrZEndSmart.length) {
        //         isEqual = -1; //格式不对
        //     } else {
        //         let maxAEnd = 0;
        //         let maxZend = 0;
        //         for (let i = 0; i < arrAEndSmart.length; i++) {
        //             let itemAEndSmart = arrAEndSmart[i];
        //             let arrAEndSmartRange = itemAEndSmart.split('-');
        //             let itemZEndSmart = arrZEndSmart[i];
        //             let arrZEndSmartRange = itemZEndSmart.split('-');

        //             if (arrAEndSmartRange.length === 2 && arrZEndSmartRange.length === 2) {
        //                 let minAEndSmart = parseInt(arrAEndSmartRange[0]);
        //                 let maxAEndSmart = parseInt(arrAEndSmartRange[1]);

        //                 let minZEndSmart = parseInt(arrZEndSmartRange[0]);
        //                 let maxZEndSmart = parseInt(arrZEndSmartRange[1]);

        //                 if (maxAEndSmart > maxAEnd) {
        //                     maxAEnd = maxAEndSmart;
        //                 }

        //                 if (maxZEndSmart > maxZend) {
        //                     maxZend = maxZEndSmart;
        //                 }

        //                 if (maxAEndSmart && minAEndSmart && minZEndSmart && maxZEndSmart) {
        //                     if (maxAEndSmart - minAEndSmart !== maxZEndSmart - minZEndSmart) {
        //                         isEqual = -4; //数量不对
        //                         break;
        //                     }
        //                 } else {
        //                     isEqual = -3; //格式不对
        //                     break;
        //                 }
        //             } else if (arrAEndSmartRange.length === 1 && arrZEndSmartRange.length === 1) {
        //                 let maxAEndSmart = parseInt(arrAEndSmartRange[0]);
        //                 let maxZEndSmart = parseInt(arrZEndSmartRange[0]);

        //                 if (maxAEndSmart > maxAEnd) {
        //                     maxAEnd = maxAEndSmart;
        //                 }

        //                 if (maxZEndSmart > maxZend) {
        //                     maxZend = maxZEndSmart;
        //                 }
        //             } else {
        //                 isEqual = -2; //格式不对
        //                 break;
        //             }
        //         }
        //         if (isEqual > -1) {
        //             let isValidForMaxFlag = this.isValidForMaxFlagSmart(maxAEnd, maxZend);
        //             if (!isValidForMaxFlag) {
        //                 isEqual = -5; //超过最大端口号
        //             }
        //         }
        //     }
        //     return isEqual;
        // },

        // isValidForMaxFlagSmart(aEnd, zEnd) {
        //     let validFlag = true;
        //     if (this.createType === 'DD') {
        //         let adeviceMaxNumber = this.resourceList[0].deviceMaxUnitNumber;
        //         let zdeviceMaxNumber = this.resourceList[1].deviceMaxUnitNumber;
        //         if (aEnd > adeviceMaxNumber || zEnd > zdeviceMaxNumber) {
        //             validFlag = false;
        //         }
        //     } else if (this.createType === 'PC') {
        //         let deviceMaxNumber = this.resourceList[0].deviceMaxUnitNumber;
        //         let cableMaxNumber = this.resourceList[1].cableMaxUnitNumber;
        //         if (aEnd > deviceMaxNumber || zEnd > cableMaxNumber) {
        //             validFlag = false;
        //         }
        //     } else if (this.createType === 'CC') {
        //         let aCableMaxUnitNumber = this.resourceList[0].cableMaxUnitNumber;
        //         let zCableMaxUnitNumber = this.resourceList[1].cableMaxUnitNumber;
        //         if (aEnd > aCableMaxUnitNumber || zEnd > zCableMaxUnitNumber) {
        //             validFlag = false;
        //         }
        //     }
        //     return validFlag;
        // },
        // 交换AZ
        exchangeAZ() {},
        popupClose() {
            this.CompPopuTopo.show = false;
        },
        popupOk() {
            this.$createLinkForm = null;

            if (this.switchFlag) {
                this.aEnd = '1';
                this.zEnd = '1';
                this.connCount = '1';
            } else {
                this.aEndSmart = '1';
                this.zEndSmart = '1';
            }

            if (this.createType === 'DD') {
                this.$createLinkForm = $(this.$refs.addFormJump).form();
            } else if (this.createType === 'PC') {
                this.$createLinkForm = $(this.$refs.addFormTeminate).form();
            } else if (this.createType === 'CC') {
                this.$createLinkForm = $(this.$refs.addFormSplice).form();
            }

            if (!this.$createLinkForm.isValid()) {
                return;
            }

            if (this.switchFlag) {
                this.submitSmart();
            } else {
                this.submitStand();
            }
        },

        getSeqList(seqString) {
            let seqList = [];
            let _seqList = [];
            let partList = seqString.split(',');
            partList.forEach(singlePart => {
                let rangs = singlePart.split('-');
                if (rangs.length === 1) {
                    _seqList.push(parseInt(rangs[0]));
                } else if (rangs.length === 2) {
                    for (let i = parseInt(rangs[0]); i <= parseInt(rangs[1]); i++) {
                        _seqList.push(parseInt(i));
                    }
                }
            });
            let validFlag = true;
            _seqList.forEach(seq => {
                if (seqList.indexOf(seq) === -1) {
                    seqList.push(seq);
                } else {
                    validFlag = false;
                }
            });
            return validFlag ? seqList : [];
        },

        getParamSmart(aEndSmart, zEndSmart) {
            let param = {};
            let aSeqList = this.getSeqList(aEndSmart);
            let zSeqList = this.getSeqList(zEndSmart);
            if (aSeqList.length === 0 || zSeqList.length === 0 || aSeqList.length !== zSeqList.length) {
                fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
                return -1;
            }
            let validFlag = true;
            aSeqList.forEach((res, index) => {
                let isValidForMaxFlag = this.isValidForMaxFlag(aSeqList[index], zSeqList[index], 1);
                if (!isValidForMaxFlag) {
                    validFlag = false;
                }
            });
            if (!validFlag) {
                fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
                return -1;
            }
            param.schemaId = this.resData.schemaId;
            let imPortCblunitDTOList = [];
            let imCblunitCblunitDTOList = [];
            let imPortPortDTOList = [];
            let msgType = '';
            aSeqList.forEach((aSeq, index) => {
                if (this.createType === 'DD') {
                    let imPortPortDTO = {
                        projectId: this.resData.projectId,
                        aDeviceId: this.resData.aDeviceId,
                        aDeviceType: this.resData.aDeviceType,
                        aPortId: aSeqList[index], //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        zDeviceId: this.resData.zDeviceId,
                        zDeviceType: this.resData.zDeviceType,
                        zPortId: zSeqList[index], //此处portId 前台传入为seq，后台服务转化出unitId
                    };
                    imPortPortDTOList.push(imPortPortDTO);
                } else if (this.createType === 'PC') {
                    let direction = '';
                    if (this.directionStr === 'In') {
                        direction = 'IN';
                    } else if (this.directionStr === 'Out') {
                        direction = 'OUT';
                    } else if (this.directionStr === 'N/A') {
                        direction = 'NA';
                    }
                    let imPortCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        portId: aSeqList[index], //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        cableId: this.resData.cableId,
                        unitId: zSeqList[index], //此处portId 前台传入为seq，后台服务转化出unitId
                        inOutFlag: direction,
                    };
                    imPortCblunitDTOList.push(imPortCblunitDTO);
                } else if (this.createType === 'CC') {
                    let imCblunitCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        aCableId: this.resData.aCableId,
                        aUnitId: aSeqList[index], //此处aUnitId 前台传入为seq，后台服务转化出unitId
                        zCableId: this.resData.zCableId,
                        zUnitId: zSeqList[index], //此处zUnitId 前台传入为seq，后台服务转化出unitId
                    };
                    imCblunitCblunitDTOList.push(imCblunitCblunitDTO);
                }
            });

            if (this.createType === 'DD') {
                param.linkType = 'DD';
                param.imPortPortDTOS = imPortPortDTOList;
                msgType = this.$t('MSG_JUMP_CONNECT');
            } else if (this.createType === 'PC') {
                param.linkType = 'PC';
                param.imPortCblunitDTOS = imPortCblunitDTOList;
                msgType = this.$t('MSG_TERMINATION_CONNECT');
            } else if (this.createType === 'CC') {
                param.linkType = 'CC';
                param.imCblunitCblunitDTOS = imCblunitCblunitDTOList;
                msgType = this.$t('MSG_SPLICE_CONNECT');
            }
            param.msgType = msgType;
            return param;
        },

        submitSmart() {
            let param = this.getParamSmart(this.aEndSmart, this.zEndSmart);
            if (param === -1) {
                return;
            }
            let url = 'edesign/rivt/link/option/v1';
            fish.post({
                url: url,
                data: param,
                success: data => {
                    fish.toast('info', param.msgType);
                    this.resetForm();
                    this.CompPopuTopo.show = false;
                    this.$emit('refreshEvent', data);
                },
                error: e => {
                    fish.warn(e.responseJSON.message);
                },
            });
        },

        submitStand() {
            let param = {};
            param.schemaId = this.resData.schemaId;
            let imPortCblunitDTOList = [];
            let imCblunitCblunitDTOList = [];
            let imPortPortDTOList = [];
            let aEnd = parseInt(this.aEnd);
            let zEnd = parseInt(this.zEnd);
            let connCount = parseInt(this.connCount);
            let isConnFlag = this.isConnectFlag(aEnd, zEnd, connCount);

            if (!isConnFlag) {
                fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
                return;
            }

            // 2021-05-11 lp-校验起始端口值加上连接数是否超过最大端口数
            let isValidForMaxFlag = this.isValidForMaxFlag(aEnd, zEnd, connCount);
            if (!isValidForMaxFlag) {
                fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
                return;
            }
            // End

            let msgType = '';

            if (this.createType === 'DD') {
                for (let i = 0; i < connCount; i++) {
                    let imPortPortDTO = {
                        projectId: this.resData.projectId,
                        aDeviceId: this.resData.aDeviceId,
                        aDeviceType: this.resData.aDeviceType,
                        aPortId: aEnd + i, //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        zDeviceId: this.resData.zDeviceId,
                        zDeviceType: this.resData.zDeviceType,
                        zPortId: zEnd + i, //此处portId 前台传入为seq，后台服务转化出unitId
                    };
                    imPortPortDTOList.push(imPortPortDTO);
                }
                param.linkType = 'DD';
                param.imPortPortDTOS = imPortPortDTOList;
                msgType = this.$t('MSG_JUMP_CONNECT');
            } else if (this.createType === 'PC') {
                let direction = '';
                if (this.directionStr === 'In') {
                    direction = 'IN';
                } else if (this.directionStr === 'Out') {
                    direction = 'OUT';
                } else if (this.directionStr === 'N/A') {
                    direction = 'NA';
                }
                for (let i = 0; i < connCount; i++) {
                    let imPortCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        portId: aEnd + i, //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        cableId: this.resData.cableId,
                        unitId: zEnd + i, //此处portId 前台传入为seq，后台服务转化出unitId
                        inOutFlag: direction,
                    };
                    imPortCblunitDTOList.push(imPortCblunitDTO);
                }
                param.linkType = 'PC';
                param.imPortCblunitDTOS = imPortCblunitDTOList;
                msgType = this.$t('MSG_TERMINATION_CONNECT');
            } else if (this.createType === 'CC') {
                for (let i = 0; i < connCount; i++) {
                    let imCblunitCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        aCableId: this.resData.aCableId,
                        aUnitId: aEnd + i, //此处aUnitId 前台传入为seq，后台服务转化出unitId
                        zCableId: this.resData.zCableId,
                        zUnitId: zEnd + i, //此处zUnitId 前台传入为seq，后台服务转化出unitId
                    };
                    imCblunitCblunitDTOList.push(imCblunitCblunitDTO);
                }

                param.linkType = 'CC';
                param.imCblunitCblunitDTOS = imCblunitCblunitDTOList;
                msgType = this.$t('MSG_SPLICE_CONNECT');
            }

            let url = 'edesign/rivt/link/option/v1';

            fish.post({
                url: url,
                data: param,
                success: data => {
                    fish.toast('info', msgType);
                    this.resetForm();
                    this.CompPopuTopo.show = false;
                    this.$emit('refreshEvent', data);
                },
                error: e => {
                    fish.warn(e.responseJSON.message);
                },
            });
        },
    },
    watch: {},
};
</script>
<style lang="scss" scoped>
@import './createlink.scss';
</style>
