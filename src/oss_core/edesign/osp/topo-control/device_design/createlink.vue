<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content">
        <template v-slot:popupBody>
            <div class="selection-body-cont">
                <div class="conn-model"><span>{{$t('NATURE_CONNECTION')}}:</span>
                    <el-switch v-model="switchFlag" active-text="on" inactive-text="off" @change="clickSwitch"></el-switch>
                </div>
                <div class="selection-body" v-if="createType=='DD'">
                    <form class="form-group" ref="addForm">
                        <div :class="{'form-huhuan': cmbZResource !== cmbAResource}">
                            <div class="form-group">
                                <div class="form_row">
                                    <div class="form_name">
                                        <label class="label-control required-label">{{$t('JUMP_A_DEVICE')}}</label>
                                    </div>
                                    <div class="form_value">
                                        <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                                    </div>
                                </div>
                                <div class="form_row">
                                    <div class="form_name">
                                        <label class="label-control required-label">{{$t('JUMP_Z_DEVICE')}}</label>
                                    </div>
                                    <div class="form_value">
                                        <Combobox class="form-control" v-model="cmbZResource" :setting="cmbZResourceSetting" name="cmbZResource" disabled data-rule="required"></Combobox>
                                    </div>
                                </div>
                            </div>
                            <div class="form-huhuan-btn el-icon-sort" @click="exchangeAZ" v-if="cmbZResource !== cmbAResource"></div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('JUMP_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForJ" v-model="aEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('JUMP_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForJ" v-model="zEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                        <div class="form_row" v-if="!switchFlag">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForJ" v-model="connCount" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="selection-body" v-else-if="createType=='PC'">
                    <form class="form-group" ref="addForm">
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('DEVICE_NAME')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForT" v-model="aEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
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
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('TEMI_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForT" v-model="zEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                        <div class="form_row" v-if="!switchFlag">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForT" v-model="connCount" ref="optConnCountRefForT" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('DiIRECTION')}}</label>
                            </div>
                            <div class="form_value">
                                <el-radio-group v-model="directionStr" size="mini" @change="directionChange">
                                    <el-radio-button label="In" :buttonObj="buttonObj" :disabled="buttonFlags"></el-radio-button>
                                    <el-radio-button label="Out" :buttonObj="buttonObj"></el-radio-button>
                                    <el-radio-button label="N/A" :buttonObj="buttonObj" :disabled="buttonFlags"></el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="selection-body" v-else-if="createType=='CC'">
                    <form class="form-group" ref="addForm">
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('A_CABLE')}}</label>
                            </div>
                            <div class="form_value">
                                <Combobox class="form-control" v-model="cmbAResource" :setting="cmbAResourceSetting" name="cmbAResource" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_A_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optAEndRefForS" v-model="aEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
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
                        <div class="form_row">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('SPLICE_Z_START')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optZEndRefForS" v-model="zEnd" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
                            </div>
                        </div>
                        <div class="form_row" v-if="!switchFlag">
                            <div class="form_name">
                                <label class="label-control required-label">{{$t('CONNECT_COUNT')}}</label>
                            </div>
                            <div class="form_value">
                                <input type="text" class="form-control" name="optConnCountRefForS" v-model="connCount" ref="optConnCountRefForS" :data-rule="switchFlag ?'required' : 'required;integer;range[1~];'" />
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
            dataRule: 'required;integer;range[1~];',
            resData: null, //父组件传递过来的连接的资源信息
            createType: 'DD', //连接类型
            cmbAResource: '', //A端资源id
            cmbZResource: '', //Z端资源id
            aEnd: '', //A端需要做连接的端口输入内容
            zEnd: '', //Z端需要做连接的端口输入内容
            connCount: '', //需要连接的端口的数量
            directionStr: 'N/A', //连接的方向描述
            direction: 'NA', //连接的方向值
            cmbAResourceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            }, //A端可选资源列表
            cmbZResourceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            }, //Z端可选资源列表
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
            this.aEnd = '';
            this.zEnd = '';
            this.connCount = '';
        },
        setResData(dataInfo) {
            this.createType = dataInfo.createType; //PP:跳接，PC:成端，CC:熔接
            this.resData = dataInfo;
            this.switchFlag = true;
            this.aEnd = '';
            this.zEnd = '';
            this.connCount = '';
            this.buttonFlags = false;
            this.directionStr = 'N/A';
            if (this.createType === 'DD') {
                this.CompPopuTopo.title = this.$t('JUMP');
            } else if (this.createType === 'PC') {
                if (dataInfo.deviceType === 'OLT') {
                    this.buttonFlags = true;
                    this.directionStr = 'Out'; // 如果成端有一个设备是OLT，直接设为Out，另外两个按钮禁用
                }
                this.CompPopuTopo.title = this.$t('TERMINATE');
            } else if (this.createType === 'CC') {
                this.CompPopuTopo.title = this.$t('SPLICE');
            }
            let promises = [];
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
                    let adeviceMaxUnitNumber = 0;
                    let zdeviceMaxUnitNumber = 0;
                    aRes.forEach(res => {
                        adeviceMaxUnitNumber += res.portList.length;
                    });
                    zRes.forEach(res => {
                        zdeviceMaxUnitNumber += res.portList.length;
                    });
                    let dataSource = [
                        {
                            name: aDataInfo.name || aDataInfo.fullName,
                            value: aDataInfo.deviceId,
                            deviceMaxUnitNumber: adeviceMaxUnitNumber,
                        },
                        {
                            name: zDataInfo.name || zDataInfo.fullName,
                            value: zDataInfo.deviceId,
                            deviceMaxUnitNumber: zdeviceMaxUnitNumber,
                        },
                    ];
                    this.cmbAResourceSetting.dataSource = dataSource;
                    this.cmbZResourceSetting.dataSource = dataSource;
                    this.cmbAResource = this.resData.aDeviceId;
                    this.cmbZResource = this.resData.zDeviceId;
                } else if (this.createType === 'PC') {
                    let aDataInfo = aRes[0].deviceData;
                    let zCableInfo = zRes.cable;
                    // 2021-05-11 lp-丰富设备和光缆最大端口数，用于termination时输入框限制
                    let deviceMaxUnitNumber = 0;
                    let cableMaxUnitNumber = 0;
                    if (zRes.cableUnits && zRes.cableUnits.length > 0) {
                        cableMaxUnitNumber = zRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE').length;
                    }
                    aRes.forEach(res => {
                        deviceMaxUnitNumber += res.portList.length;
                    });
                    this.cmbAResourceSetting.dataSource = [
                        {
                            name: aDataInfo.name || aDataInfo.fullName,
                            value: aDataInfo.deviceId,
                            deviceMaxUnitNumber,
                        },
                    ];
                    this.cmbZResourceSetting.dataSource = [
                        {
                            name: zCableInfo.name || zCableInfo.fullName,
                            value: zCableInfo.cableId,
                            cutUnitRecord: zRes.cutUnitRecord,
                            cableMaxUnitNumber,
                        },
                    ];
                    this.cmbAResource = this.resData.deviceId;
                    this.cmbZResource = this.resData.cableId;
                } else if (this.createType === 'CC') {
                    let aCableInfo = aRes.cable;
                    let zCableInfo = zRes.cable;

                    // 2021-05-11 lp-丰富光缆和光缆最大端口数，用于Splice时输入框限制
                    let aCableMaxUnitNumber = 0;
                    let zCableMaxUnitNumber = 0;
                    if (aRes.cableUnits && aRes.cableUnits.length > 0) {
                        aCableMaxUnitNumber = aRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE').length;
                    }
                    if (zRes.cableUnits && zRes.cableUnits.length > 0) {
                        zCableMaxUnitNumber = zRes.cableUnits.filter(res => res.resSpecId === 'FIBER_CORE').length;
                    }
                    this.cmbAResourceSetting.dataSource = [
                        {
                            name: aCableInfo.name || aCableInfo.fullName,
                            value: aCableInfo.cableId,
                            cableMaxUnitNumber: aCableMaxUnitNumber,
                            cutUnitRecord: aRes.cutUnitRecord,
                        },
                    ];
                    this.cmbZResourceSetting.dataSource = [
                        {
                            name: zCableInfo.name || zCableInfo.fullName,
                            value: zCableInfo.cableId,
                            cableMaxUnitNumber: zCableMaxUnitNumber,
                            cutUnitRecord: zRes.cutUnitRecord,
                        },
                    ];
                    this.cmbAResource = this.resData.aCableId;
                    this.cmbZResource = this.resData.zCableId;
                }
                this.CompPopuTopo.show = true;
            });
        },
        directionChange() {
            if (this.directionStr === 'In') {
                this.direction = 'IN';
            } else if (this.directionStr === 'Out') {
                this.direction = 'OUT';
            } else if (this.directionStr === 'N/A') {
                this.direction = 'NA';
            }
        },
        isConnectFlag(aEnd, zEnd, connCount) {
            let isConnFlag = true;
            if (this.createType === 'PC') {
                let cutUnitRecord = this.cmbZResourceSetting.dataSource[0].cutUnitRecord;
                if (cutUnitRecord) {
                    isConnFlag = this.isRange(zEnd, connCount, cutUnitRecord);
                }
            } else if (this.createType === 'CC') {
                let aCutUnitRecord = this.cmbAResourceSetting.dataSource[0].cutUnitRecord;
                let zCutUnitRecord = this.cmbZResourceSetting.dataSource[0].cutUnitRecord;
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
						if(!endUnit && Number(iSeq) == startUnit){
							isRangFlag = true;
							break;
						}
                        else if (Number(iSeq) >= startUnit && Number(iSeq) <= endUnit) {
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
                let deviceMaxNumber = this.cmbAResourceSetting.dataSource[0].deviceMaxUnitNumber;
                let cableMaxNumber = this.cmbZResourceSetting.dataSource[0].cableMaxUnitNumber;
                if (aEnd + connCount - 1 > deviceMaxNumber || zEnd + connCount - 1 > cableMaxNumber) {
                    validFlag = false;
                }
            } else if (this.createType === 'CC') {
                let aCableMaxUnitNumber = this.cmbAResourceSetting.dataSource[0].cableMaxUnitNumber;
                let zCableMaxUnitNumber = this.cmbZResourceSetting.dataSource[0].cableMaxUnitNumber;
                if (aEnd + connCount - 1 > aCableMaxUnitNumber || zEnd + connCount - 1 > zCableMaxUnitNumber) {
                    validFlag = false;
                }
            }
            return validFlag;
        },
        // 交换AZ
        exchangeAZ() {
            let idA = this.resData.aDeviceId;
            let idZ = this.resData.zDeviceId;
            let typeA = this.resData.aDeviceType;
            let typeZ = this.resData.zDeviceType;
            this.cmbAResource = idZ;
            this.cmbZResource = idA;
            this.resData.aDeviceId = idZ;
            this.resData.zDeviceId = idA;
            this.resData.aDeviceType = typeZ;
            this.resData.zDeviceType = typeA;
        },
        popupClose() {
            this.CompPopuTopo.show = false;
        },
        popupOk() {
            this.$createLinkForm = $(this.$refs.addForm).form();
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

        getParamSmart(aEnd, zEnd) {
            let param = {};
            let aSeqList = this.getSeqList(aEnd);
            let zSeqList = this.getSeqList(zEnd);
            if (aSeqList.length === 0 || zSeqList.length === 0 || aSeqList.length !== zSeqList.length) {
                fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
                return -1;
            }
			let isConnFlag =true;
			for(let index=0;index<aSeqList.length;index++){
				isConnFlag = this.isConnectFlag(aSeqList[index], zSeqList[index], 1);
				if (!isConnFlag) {
					break;
				}
			}
			if (!isConnFlag) {
				fish.warn(this.$t('WARN_UNIT_IS_CONNECTON'));
				return;
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
			param.projectId = this.resData.projectId;
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
                    let imPortCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        portId: aSeqList[index], //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        cableId: this.resData.cableId,
                        unitId: zSeqList[index], //此处portId 前台传入为seq，后台服务转化出unitId
                        inOutFlag: this.direction,
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
            let param = this.getParamSmart(this.aEnd, this.zEnd);
            if (param === -1) {
                return;
            }
            let url = 'edesign/rivt/link/option/v1';
            fish.post({
                url: url,
                data: param,
                success: data => {
                    fish.toast('info', param.msgType);
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
            let aEnd = parseInt(this.aEnd, 10);
            let zEnd = parseInt(this.zEnd, 10);
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
                for (let i = 0; i < connCount; i++) {
                    let imPortCblunitDTO = {
                        projectId: this.resData.projectId,
                        deviceId: this.resData.deviceId,
                        deviceType: this.resData.deviceType,
                        portId: aEnd + i, //此处portId 前台传入为seq，后台服务转化出portId hardwareId
                        cableId: this.resData.cableId,
                        unitId: zEnd + i, //此处portId 前台传入为seq，后台服务转化出unitId
                        inOutFlag: this.direction,
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
