<template>
    <Popup :popupObj="CompPopuTopo" @popupClose="popupClose" @popupOk="popupOk" class="selection-content" v-if="show">
        <template v-slot:popupBody>
            <div class="selection-body-cont">
                <div class="selection-body">
                    <form class="form-group" ref="formCutCable" id="formCutCable">
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('CUT_DEVICE')}}</label>
                            </div>
                            <div class="col-md-8">
                                <Combobox class="form-control" v-model="cutDevice" :setting="cmbCutDeviceSetting" name="cmbCutDevice" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('CUT_CABLE')}}</label>
                            </div>
                            <div class="col-md-8">
                                <Combobox class="form-control" v-model="cutCablePhysic" :setting="cmbCutCablePhysicSetting" name="cmbCutCablePhysic" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="col-md-12" style="display:none">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('CUT_CABLE')}}</label>
                            </div>
                            <div class="col-md-8">
                                <Combobox class="form-control" v-model="cutCable" :setting="cmbCutCableSetting" name="cmbCutCable" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('START_DEVICE')}}</label>
                            </div>
                            <div class="col-md-8">
                                <Combobox class="form-control" v-model="startDevice" :setting="cmbStartDeviceSetting" name="cmbStartDevice" :disabled="deviceDisable===false" data-rule="required" @change="startDeviceChange"></Combobox>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('END_DEVICE')}}</label>
                            </div>
                            <div class="col-md-8">
                                <Combobox class="form-control" v-model="endDevice" :setting="cmbEndDeviceSetting" name="cmbEndDevice" disabled data-rule="required"></Combobox>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('START_UNIT')}}</label>
                            </div>
                            <div class="col-md-8">
                                <input type="text" class="form-control" name="START_UNIT" v-model="startUnit" ref="optStartUnit" id="inputStartCut" data-rule="required;integer;range[1~];" />
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-4">
                                <label class="label-control required-label">{{$t('END_UNIT')}}</label>
                            </div>
                            <div class="col-md-8">
                                <input type="text" class="form-control" name="END_UNIT" v-model="endUnit" ref="optEndUnit" id="inputEndCut" data-rule="required;integer;match[gte, Start Unit];range[1~];" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </template>
    </Popup>
</template>
<script>
import { addCutCable, loadCutCable, loadCableUnits } from '../../../topo/TopoHandleAction.js';
export default {
    components: {},
    data() {
        return {
            schemaId: '', //任务单ID
            show: false, // 需要在获取到节点后才加载
            cutDevice: '',
            startDevice: '', //开始节点
            endDevice: '', //结束节点
            cutCable: '',
            cutCablePhysic: '',
            deviceInfoList: [],
            deviceDisable: false,
            deviceInfo: null, //掏接的设备
            logicCableList: [], //逻辑光缆
            physicCableInfo: null, //物理光缆
            cableInfo: null,
            cableMinUnit: null,
            cableMaxUnit: null,
            parentTopoData: null,
            cmbCutDeviceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            cmbStartDeviceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            cmbEndDeviceSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            cmbCutCablePhysicSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            cmbCutCableSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            startUnit: '',
            endUnit: '',
            CompPopuTopo: {
                title: this.$t('CUT_SPLICE'), // 标题
                ok: this.$t('OK'), // 确认按钮
                close: this.$t('CLOSE'), // 取消按钮
                width: '650', // 宽
                height: '350', // 高
                modal: true, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                //left: 'calc(50% - 500px)',
                //top: 'calc(50% - 330px)'
            },
        };
    },
    mounted() {},
    created() {},
    //方法集合
    methods: {
        setData(deviceInfoList, cableInfo, logicCableList, physicCable, params) {
            this.logicCableList = logicCableList;
            this.physicCableInfo = physicCable;
            this.schemaId = params.schemaId;
            if (deviceInfoList.length > 1) {
                this.deviceDisable = true;
            } else {
                this.deviceDisable = false;
            }
            this.deviceInfoList = deviceInfoList;
            this.deviceInfo = deviceInfoList[0];
            this.cableInfo = cableInfo;
            let dDataSource = [];
            let cDataSource = [];
            deviceInfoList.forEach(deviceInfo => {
                let dData = {
                    name: deviceInfo.name || deviceInfo.fullName,
                    value: deviceInfo.resId,
                };
                dDataSource.push(dData);
            });

            this.cmbCutDeviceSetting.dataSource = dDataSource;
            this.cutDevice = deviceInfoList[0].resId;
            let cData = {
                name: cableInfo.name || cableInfo.fullName,
                value: cableInfo.cableId,
            };
            cDataSource.push(cData);
            this.cmbCutCableSetting.dataSource = cDataSource;
            this.cutCable = cableInfo.cableId;
			this.cutCableId = this.cutCable;

            if (this.deviceInfo.cutUnitRecord) {
                //多次掏接时
                let aData = {
                    name: physicCable.aDeviceIdDesc,
                    value: physicCable.aDeviceId,
                };
                let aDataSource = [];
                aDataSource.push(aData);
                this.cmbStartDeviceSetting.dataSource = aDataSource;
                this.startDevice = physicCable.aDeviceId;
				this.cutCableId = physicCable.cableId;

                let zData = {
                    name: physicCable.zDeviceIdDesc,
                    value: physicCable.zDeviceId,
                };
                let zDataSource = [];
                zDataSource.push(zData);
                this.cmbEndDeviceSetting.dataSource = zDataSource;
                this.endDevice = physicCable.zDeviceId;
                this.deviceDisable = false;
            } else {
                //没有掏接过时
                let aDataSource = [];
                let zDataSource = [];
                if (logicCableList.length > 0) {
                    logicCableList.forEach(cable => {
                        let aData = {
                            id: cable.resId,
                            name: cable.aResName,
                            value: cable.aResId,
                        };
                        let zData = {
                            id: cable.resId,
                            name: cable.zResName,
                            value: cable.zResId,
                        };

                        aDataSource.push(aData);
                        zDataSource.push(zData);
                    });
                    this.cmbStartDeviceSetting.dataSource = aDataSource;
                    this.cmbEndDeviceSetting.dataSource = zDataSource;
                    this.startDevice = logicCableList[0].aResId;
                    this.endDevice = logicCableList[0].zResId;
					this.cutCableId = logicCableList[0].resId;
                    this.deviceDisable = true;
                } else {
                    let aData = {
                        name: physicCable.aDeviceIdDesc,
                        value: physicCable.aDeviceId,
                    };
                    let aDataSource = [];
                    aDataSource.push(aData);
                    this.cmbStartDeviceSetting.dataSource = aDataSource;
                    this.startDevice = physicCable.aDeviceId;
					this.cutCableId = physicCable.cableId;

                    let zData = {
                        name: physicCable.zDeviceIdDesc,
                        value: physicCable.zDeviceId,
                    };
                    let zDataSource = [];
                    zDataSource.push(zData);
                    this.cmbEndDeviceSetting.dataSource = zDataSource;
                    this.endDevice = physicCable.zDeviceId;
                    this.deviceDisable = false;
                }
            }

            let param = {
                resId: params.resId,
                resType: params.resType,
            };
            let p1 = loadCableUnits(param);
            Promise.all([p1]).then(datas => {
                this.cableMinUnit = datas[0].START_UNIT_NO;
                this.cableMaxUnit = datas[0].END_UNIT_NO;
                let dataSource = [];
                let cData = {
                    name: this.physicCableInfo.name,
                    value: this.physicCableInfo.cableId,
                };
                dataSource.push(cData);
                this.cmbCutCablePhysicSetting.dataSource = dataSource;
                this.cutCablePhysic = this.physicCableInfo.cableId;

                var dataRuleEnd =
                    this.$t('END_UNIT') +
                    ':match[gte, START_UNIT, digits];required;digits;range[' +
                    this.cableMinUnit +
                    '~' +
                    this.cableMaxUnit +
                    ']';
                var dataRule = 'required;digits;range[' + this.cableMinUnit + '~' + this.cableMaxUnit + ']';

                $('#inputStartCut').attr('data-rule', dataRule);
                $('#inputEndCut').attr('data-rule', dataRuleEnd);
            });
        },

        startDeviceChange(obj) {
            if (!fish.isEmpty(obj)) {
                console.info(obj);
                let cableId = obj.id;
                let logicCable = this.logicCableList.filter(item => item.resId === cableId);
                if (logicCable.length > 0) {
					this.cutCableId = logicCable[0].resId;
                    this.endDevice = logicCable[0].zResId;
                }
            }
        },

        popupClose() {
            this.CompPopuTopo.show = false;
            this.clearSelectData();
            this.show = false;
            this.$emit('refreshClose');
        },
        popupOk() {
            this.$cutCableForm = $(this.$refs.formCutCable).form();
            if (!this.$cutCableForm.isValid()) {
                return;
            }

            let isCuted = false;
            if (this.deviceInfo.cutUnitRecord) {
                isCuted = true;
            }

            //let logicCableList = this.parentTopoData.logicCableList || [];

            let param = {};
            if (isCuted) {
                //再次掏
                let repeatFlag = this.isAllowCut(this.deviceInfo);
                if (!repeatFlag) {
                    fish.warn(this.$t('WARN_SAME_UNIT_REPEAT'));
                    return;
                }
                let cableList = [];
                this.logicCableList.forEach(logicCable => {
                    if (logicCable.aResId === this.deviceInfo.resId || logicCable.zResId === this.deviceInfo.resId) {
                        let cable = {
                            CABLE_ID: logicCable.resId,
                        };
                        cableList.push(cable);
                    }
                });
                param.DEVICE_ID = this.cutDevice;
                param.CABLE_ID = this.cutCableId?this.cutCableId:this.cutCable;
                param.RES_SPEC_ID = this.physicCableInfo.resSpecId;
                param.CABLE_LIST = cableList;
                param.UNIT_LIST = [
                    {
                        START_UNIT: this.startUnit,
                        END_UNIT: this.endUnit,
                    },
                ];
                param.SAME_CABLE = 'Y';
            } else {
                //第一次掏
                param.DEVICE_ID = this.cutDevice;
                param.CABLE_ID = this.cutCableId?this.cutCableId:this.cutCable;
                param.RES_SPEC_ID = this.physicCableInfo.resSpecId;
                param.SCHEMA_ID = this.schemaId;
                param.UNIT_LIST = [
                    {
                        START_UNIT: this.startUnit,
                        END_UNIT: this.endUnit,
                    },
                ];
                let cableName = this.physicCableInfo.name;
                param.CABLE_LIST = [
                    {
                        name: cableName + '.1',
                    },
                    {
                        name: cableName + '.2',
                    },
                ];
            }
            addCutCable(param).then(data => {
                console.info(data);
                this.clearSelectData();
                this.$emit('refreshEvent', data);
                this.show = false;
            });
        },

        isAllowCut(res) {
            let repeatFlag = true;
            if (res.cutUnitRecord) {
                let cutUnitRecord = res.cutUnitRecord;
                let arrUnitList = cutUnitRecord.split(',');
                for (let j = 0; j < arrUnitList.length; j++) {
                    let arrUnit = arrUnitList[j].split('-');
                    let startUnit = Number(arrUnit[0]);
                    let endUnit = Number(arrUnit[1]);
                    if (Number(this.startUnit) >= startUnit && Number(this.startUnit) <= endUnit) {
                        repeatFlag = false;
                        break;
                    }
                    if (Number(this.endUnit) >= startUnit && Number(this.endUnit) <= endUnit) {
                        repeatFlag = false;
                        break;
                    }
                }
            }
            return repeatFlag;
        },

        isAllowCut_bak(res) {
            let repeatFlag = false;
            if (res.cutUnitRecord) {
                let cutUnitRecord = res.cutUnitRecord;
                let arrUnitList = cutUnitRecord.split(',');
                for (let j = 0; j < arrUnitList.length; j++) {
                    let arrUnit = arrUnitList[j].split('-');
                    let startUnit = Number(arrUnit[0]);
                    let endUnit = Number(arrUnit[1]);
                    if (Number(this.startUnit) >= startUnit && Number(this.startUnit) <= endUnit) {
                        repeatFlag = true;
                        break;
                    }
                    if (Number(this.endUnit) >= startUnit && Number(this.endUnit) <= endUnit) {
                        repeatFlag = true;
                        break;
                    }
                }
            }
            return repeatFlag;
        },
        clearSelectData() {
            this.startUnit = '';
            this.endUnit = '';
            this.cutDevice = '';
            this.cutCable = '';
            this.cableInfo = null;
            this.deviceInfo = null;
            this.deviceDisable = false;
        },
    },
};
</script>

<style lang="scss" scoped>
/deep/ .form-group div {
    padding-top: 5px;
}
.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}
.label-control {
    font-weight: normal;
    vertical-align: middle;
}
</style>