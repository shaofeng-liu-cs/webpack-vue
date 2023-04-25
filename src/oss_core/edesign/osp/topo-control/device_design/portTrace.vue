<template>
    <Popup :popupObj="CompPopuTopo" class="selection-content" @popupOk="popupOk" @popupClose="popupClose">
        <template v-slot:popupBody>
            <div class="port-setting" v-if="actionType == 'SET'">
                <div class="col-md-12">
                    <div class="titel-class">
                        <h3>Optical Parameter</h3>
                    </div>
                    <form class="form-group form-class form-one" ref="paramterInputForm">
                        <div class="col-md-12 row-class">
                            <div class="col-md-4">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">{{ $t('MAP_PON_TYPE') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox :setting="pontypeSetting" v-model="ponType" @change="temChange"></Combobox>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">{{ $t('MAP_OLT_SFU') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox :setting="optModuleSettingOLT" v-model="optModuleOLT"></Combobox>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">{{ $t('MAP_ONU_SFU') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox :setting="optModuleSettingONU" v-model="optModuleONU"></Combobox>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div class="titel-class">
                        <h3>Connect Point For Determine Route</h3>
                    </div>
                    <form class="form-group form-class form-one">
                        <div class="col-md-12 row-class">
                            <div class="col-md-6">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">Uplink Connection Point</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox
                                        :setting="uplinkConSetting"
                                        v-model="uplinkCon"
                                        @change="upPointChange"
                                        :disabled="uplinkDisabled"
                                    ></Combobox>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">Downlink Connection Point</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox :setting="downlinkConSetting" v-model="downlinkCon" @change="downPointChange"></Combobox>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div v-if="showDown">
                        <div class="titel-class">
                            <h3>Estimate Connection Information to PON Port</h3>
                        </div>
                        <form class="form-group form-class form-two" ref="downParamForm">
                            <div class="col-md-12 row-class">
                                <div class="col-md-6">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Fusion Splice</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="fusionSplicePON"
                                            name="fusionSplicePON"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Mechanical Splice</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="mechanicalSplicePON"
                                            name="mechanicalSplicePON"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-6 connect-class">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Connector</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input type="text" class="form-control" v-model="connectorPON" name="connectorPON" data-rule="integer[+0];" />
                                    </div>
                                </div>
                                <div class="col-md-6 connect-class">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Other Margin(db)</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="otherMarginPON"
                                            name="otherMarginPON"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div v-if="showUp">
                        <div class="titel-class">
                            <h3>Estimate Connection Information to ONT Port</h3>
                        </div>
                        <form class="form-group form-class form-two" ref="upParamForm">
                            <div class="col-md-12 row-class">
                                <div class="col-md-6">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Fusion Splice</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="fusionSpliceONT"
                                            name="fusionSpliceONT"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Mechanical Splice</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="mechanicalSpliceONT"
                                            name="mechanicalSpliceONT"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-6 connect-class">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Connector</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input type="text" class="form-control" v-model="connectorONT" name="connectorONT" data-rule="integer[+0];" />
                                    </div>
                                </div>
                                <div class="col-md-6 connect-class">
                                    <div class="col-md-5 content-label">
                                        <label class="control-label">Other Margin(db)</label>
                                    </div>
                                    <div class="col-md-7">
                                        <input
                                            type="text"
                                            class="form-control"
                                            v-model="otherMarginONT"
                                            name="otherMarginONT"
                                            data-rule="integer[+0];"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="titel-class">
                        <h3>Calculate Type</h3>
                    </div>
                    <form class="form-group form-class form-one">
                        <div class="col-md-12 row-class">
                            <div class="col-md-6">
                                <div class="col-md-5 content-label">
                                    <label class="control-label">Calculate Type</label>
                                </div>
                                <div class="col-md-7">
                                    <Combobox :setting="calculateTypeSetting" v-model="calculateType"></Combobox>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </template>
    </Popup>
</template>

<script>

const ATTENUATE_TYPE = 'EDN.ATTENUATE_TYPE';
const ACTIVE_CONNECTOR = '1';
const SPLICE_POINT = '2';
const PON_PORT_COST = '3';
const MECHANICAL_SPLICE = '4';
const UP_PERCENT = '1';
const DOWN_PERCENT = '2';
const LINK_TYPE_652D = '1';
const LINK_TYPE_657A = '2';
const RES_TYPE_OPT_SECT = 'F_CABLE';
const RES_TYPE_OLT = 'OLT';
const RES_TYPE_ONU = 'ONU';
const RES_TYPE_SPLITTER = 'SPLITTER';
const LINK_TYPE_TERM = 'PC'; //成端 1
const LINK_TYPE_SPLICE = 'CC'; //熔接 2
const LINK_TYPE_JUMP = 'PP'; //跳接 4
const SPLITTER_IN_PORT = '1'; // 上行
const SPLITTER_OUT_PORT = '0'; // 下行

export default {
    components: {
    },
    name: 'portTrace',

    props: {
        resData: Object,
    },
    
    data() {
        return {
            portId: '',
            schemaId:'',
            linkDatas: [],
            addedList: [],
            attenuationConfigData: [],
            showBudget: false,
            showUp: false,
            showDown: true,
            actionType: 'SET',
            hidden: true,
            splicePer: 0,
            mechanicalSplicePer: 0,
            activePer: 0,
            ponCost: 0,
            linkCost652: 0,
            linkCost657: 0,
            linkCost652Up: 0,
            linkCost657Up: 0,
            downMaxCost: 0,
            upMaxCost: 0,
            otherCost: 0,
            lineCost: 0, //链路损耗
            otherCost: 0, //工程余量
            spliceCost: 0, //熔接损耗
            mechanicalSpliceCost: 0, //熔接损耗
            activeCost: 0, //活动连接损耗
            firstCost: 0, //一级分光损耗
            secondCost: 0, //二级分光损耗
            linkCost: 0,
            linkLength: 0,
            spliceNum: 0,
            activeNum: 0,
            mechanicalNum: 0,
            curSpliceNum: 0,
            curActiveNum: 0,
            curMechanicalSpliceNum: 0,
            lastLinkType: '',
            splitterConnectType: '',
            firstSplitInfo: '',
            secondSplitInfo: '',
            recordMaps: [],

            modulePowerList: [],
            calculateTypeList: [],
            gridData: [],
            gridOption: {
                height: '200px',
                treeGrid: true,
                expandColumn: 'linkName',
                treeIcons: {
                    leaf: '',
                    folderOpen: '',
                    folderClosed: '',
                },
            },

            CompPopuTopo: {
                title: 'Setting', // 标题
                ok: 'Calculate', // 确认按钮
                close: 'Close', // 取消按钮
                width: '1100', // 宽
                height: '660', // 高
                modal: false, //是否遮罩
                body: false, // 是否插入body
                show: false, //是否展示
                drag: true, //是否拖拽
                zIndex: 999, //层级
                left: 'calc(50% - 550px)',
                top: 'calc(50% - 330px)',
            },

            ponType: '',
            pontypeSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [
                    { name: 'GPON', value: 'GPON' },
                    { name: 'EPON', value: 'EPON' },
                ],
                value: 'GPON',
            },
            optModuleONU: '',
            optModuleSettingONU: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            optModuleOLT: '',
            optModuleSettingOLT: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            uplinkCon: '',
            uplinkConSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            uplinkDisabled: false,

            downlinkCon: '',
            downlinkConSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            calculateType: '',
            calculateTypeSetting: {
                placeholder: this.$t('SHORT_SELECT'),
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },

            fusionSplicePON: '',
            mechanicalSplicePON: '',
            connectorPON: '',
            otherMarginPON: '',

            fusionSpliceONT: '',
            mechanicalSpliceONT: '',
            connectorONT: '',
            otherMarginONT: '',
            costInfo: {},
        };
    },

    mounted() {
        this.loadGrid(this.portId);
        //$(this.$refs.treeGrid.$refs.grid).grid("expandAll");
    },
    methods: {
        loadGrid(portId, linkData) {
            this.portId = portId;
            this.setCostToZero();

            this.showUp = false;
            this.showDown = true;
            this.uplinkCon = '';
            this.downlinkCon = '';
            this.fusionSplicePON = '';
            this.mechanicalSplicePON = '';
            this.connectorPON = '';
            this.otherMarginPON = '';
            this.fusionSpliceONT = '';
            this.mechanicalSpliceONT = '';
            this.connectorONT = '';
            this.otherMarginONT = '';
            this.calculateType = '';
            this.showBudget = false;
            this.uplinkConSetting.dataSource = [];
            this.downlinkConSetting.dataSource = [];
            // this.getLinks();
            this.queryCalculateType();
            this.queryModulePower();
            this.getLinks();
        },

        upPointChange(obj) {
            if (!fish.isEmpty(obj)) {
                let linkData = this.getLinkDataByResId(obj.value);
                let resType = linkData.resType;
                this.showDown = resType != RES_TYPE_OLT;
            }
        },

        downPointChange(obj) {
            this.showUp = false;
            if (!fish.isEmpty(obj)) {
                let linkData = this.getLinkDataByResId(obj.value);
                let resType = linkData.resType;
                this.showUp = resType != RES_TYPE_ONU;
            }
        },

        queryModulePower() {
            fish.ajax({
                url: 'edesign/optical/attenuation/config/list/v1',
                type: 'GET',
                success: data => {
                    if (data && data.resultList) {
                        this.attenuationConfigData = data.resultList;
                        // 保存原始数据
                        this.modulePowerList = data.resultList.modulePowerDTOS;
                        // 加载olt sfu下拉框
                        let optModuleData = this.modulePowerList
                            .filter(data => {
                                let seq = Number(data.opticalModule);
                                return seq > 4;
                            })
                            .map(module => {
                                return {
                                    name: module.name,
                                    value: module.opticalModule,
                                };
                            });

                        this.optModuleSettingOLT.dataSource = optModuleData;
                        this.optModuleSettingONU.dataSource = optModuleData;
                        if (optModuleData.length > 1) {
                            this.optModuleSettingOLT.value = optModuleData[2].value;
                            this.optModuleSettingONU.value = optModuleData[2].value;
                            this.optModuleOLT = optModuleData[2].value;
                            this.optModuleONU = optModuleData[2].value;
                        }
                    }
                },
            });
        },

        queryCalculateType() {
            fish.ajax({
                url: `edesign/link/qryDictValueList/v1?dictId=${ATTENUATE_TYPE}`,
                type: 'GET',
                success: data => {
                    if (data && data.resultList) {
                        // 保存原始数据
                        this.calculateTypeList = data.resultList;
                        // 加载olt sfu下拉框
                        let calculateTypeData = this.calculateTypeList.map(module => {
                            return {
                                name: module.name,
                                value: module.code,
                            };
                        });

                        this.calculateTypeSetting.dataSource = calculateTypeData;
                        if (!fish.isEmpty(calculateTypeData)) {
                            this.calculateTypeSetting.value = calculateTypeData[0].value;
                            this.calculateType = calculateTypeData[0].value;
                        }
                    }
                },
            });
        },

        temChange(obj) {
            if (!fish.isEmpty(obj) && !fish.isEmpty(this.modulePowerList)) {
                // 加载olt sfu下拉框
                let newOptModuleData = this.modulePowerList
                    .filter(data => {
                        let seq = Number(data.opticalModule);
                        if (obj.value == 'GPON') {
                            return seq > 4;
                        } else {
                            return seq < 5;
                        }
                    })
                    .map(module => {
                        return {
                            name: module.name,
                            value: module.opticalModule,
                        };
                    });
                this.optModuleSettingOLT.dataSource = newOptModuleData;
                this.optModuleSettingONU.dataSource = newOptModuleData;

                if (!fish.isEmpty(newOptModuleData)) {
                    this.optModuleSettingOLT.value = newOptModuleData[0].value;
                    this.optModuleSettingONU.value = newOptModuleData[0].value;
                    this.optModuleOLT = newOptModuleData[0].value;
                    this.optModuleONU = newOptModuleData[0].value;
                }
            }
        },

        setCostToZero() {
            this.spliceCost = 0;
            this.lineCost = 0;
            this.firstCost = 0;
            this.secondCost = 0;
            this.otherCost = 0;
            this.activeCost = 0;
            this.mechanicalSpliceCost = 0;
            this.linkLength = 0;
            this.splicePer = 0;
            this.mechanicalSplicePer = 0;
            this.activePer = 0;
            this.ponCost = 0;
            this.linkCost = 0;
            this.spliceNum = 0;
            this.activeNum = 0;
            this.mechanicalNum = 0;
            this.curSpliceNum = 0;
            this.curActiveNum = 0;
            this.curMechanicalSpliceNum = 0;
            this.firstSplitInfo = '';
            this.secondSplitInfo = '';
            this.recordMaps = [];
        },

        popupClose() {
            this.setCostToZero();
        },

        popupOk() {
            this.showBudget = true;
            // this.downlinkConSetting.value = '3';
            // this.CompPopuTopo.width = '1300';
            // this.CompPopuTopo.height = '550';
            this.$upParamForm = $(this.$refs.upParamForm).form();
            if (this.showUp && !this.$upParamForm.isValid()) {
                return;
            }
            this.$downParamForm = $(this.$refs.downParamForm).form();
            if (this.showDown && !this.$downParamForm.isValid()) {
                return;
            }
            this.getBudgetInfo();
        },

        // 根据port id获取link
        getLinks() {
            if (this.resData.portId && this.resData.schemaId) {
                fish.ajax({
                    url: `edesign/link/trace/v1?portId=${this.resData.portId}&schemaId=${this.resData.schemaId}`,
                    type: 'GET',
                    success: data => {
                        if (data && data.resultList) {
                            // 保存link数据
                            this.linkDatas = data.resultList;
                            if (this.linkDatas) {
                                if (fish.isEmpty(this.uplinkConSetting.dataSource)) {
                                    let upDatas = this.linkDatas
                                        .filter(data => {
                                            return data.upLink && data.upLink == 'Y';
                                        })
                                        .map(module => {
                                            return {
                                                name: module.resName + '/' + module.seq,
                                                value: module.resId + '-' + module.endId,
                                            };
                                        });
                                    this.uplinkConSetting.dataSource = upDatas;
                                }
                                if (this.uplinkConSetting.dataSource.length > 0) {
                                    this.uplinkCon = this.uplinkConSetting.dataSource[0].value;
                                    this.uplinkConSetting.value = this.uplinkCon;
                                }
                                if (this.uplinkCon) {
                                let linkData = this.getLinkDataByResId(this.uplinkCon);
                                    if(linkData) {
                                        this.showDown = linkData.resType != RES_TYPE_OLT;
                                        if (this.uplinkConSetting.dataSource.length == 1 && linkData.resType == RES_TYPE_OLT) {
                                            this.uplinkDisabled = true;
                                        }
                                    }
                                }

                                if (fish.isEmpty(this.downlinkConSetting.dataSource)) {
                                    let downDatas = this.linkDatas
                                        .filter(data => {
                                            return data.downLink && data.downLink == 'Y';
                                        })
                                        .map(module => {
                                            return {
                                                name: module.resName + '/' + module.seq,
                                                // name: module.resId + '-' + module.endId,
                                                value: module.resId + '-' + module.endId,
                                            };
                                        });
                                    this.downlinkConSetting.dataSource = downDatas;
                                }
                            }
                        }
                    },
                });
            }
        },

        initParam() {
            this.splicePer = this.getContextExtAttr(this.attenuationConfigData.connectAttenuationDTOS, SPLICE_POINT, '');
            this.mechanicalSplicePer = this.getContextExtAttr(this.attenuationConfigData.connectAttenuationDTOS, MECHANICAL_SPLICE, '');
            this.activePer = this.getContextExtAttr(this.attenuationConfigData.connectAttenuationDTOS, ACTIVE_CONNECTOR, '');
            this.ponCost = this.getContextExtAttr(this.attenuationConfigData.connectAttenuationDTOS, PON_PORT_COST, '');
            this.linkCost652 = this.getContextExtAttr(this.attenuationConfigData.cableBudgetDTOS, DOWN_PERCENT, LINK_TYPE_652D);
            this.linkCost657 = this.getContextExtAttr(this.attenuationConfigData.cableBudgetDTOS, DOWN_PERCENT, LINK_TYPE_657A);
            this.linkCost652Up = this.getContextExtAttr(this.attenuationConfigData.cableBudgetDTOS, UP_PERCENT, LINK_TYPE_652D);
            this.linkCost657Up = this.getContextExtAttr(this.attenuationConfigData.cableBudgetDTOS, UP_PERCENT, LINK_TYPE_657A);
            this.calcateDownLink();
            // 如果选择了下行点，计算上行光衰
            if (this.downlinkCon) {
                this.calcateUpLink();
            }
            this.costInfo.ponCost = this.ponCost;
            this.costInfo.downMaxCost = this.downMaxCost;
            this.costInfo.upMaxCost = this.upMaxCost;

            this.$emit('closePortTraceSetting', this.linkDatas, this.costInfo);
            this.CompPopuTopo.show = false;
        },

        // 计算下行光衰
        calcateDownLink() {
            this.addedList = [];
            let resIds = this.uplinkCon;
            let linkData = this.getLinkDataByResId(resIds);
            let resType = linkData.resType;
            let resId = linkData.resId;
            let splitterRadio = '';
            let nextResType = '';
            let isPatchCord = '';
            let nextResId = '';

            let inCost = 0; // 进损耗
            let outCost = 0; // 出损耗
            let parent = linkData.parentEndId;
            let linkType = linkData.linkType;
            let spliceType = linkData.spliceType ? linkData.spliceType : 'F';
            let flag = false; // true 代表正向获取下一个
            let nodeId = linkData.endId;
            let findNode = '';
            if (fish.isEmpty(parent)) {
                flag = true;
            }

            if (flag) {
                //正向查找数据，当前的endId、resType是下一个的父
                findNode = nodeId;
            } else {
                //反向查找数据，当前的parent是上一个的endId、resType
                findNode = parent;
            }
            if (resType != 'OLT') {
                this.otherCost += this.ponCost ? this.ponCost : 0;
                this.spliceNum = this.fusionSplicePON ? Number(this.fusionSplicePON) : 0;
                this.mechanicalNum = this.mechanicalSplicePON ? Number(this.mechanicalSplicePON) : 0;
                this.activeNum = this.connectorPON ? Number(this.connectorPON) : 0;
                this.lineCost = this.otherMarginPON ? Number(this.otherMarginPON) : 0;
            }
            this.setCost(resType);
            inCost = this.downMaxCost - this.spliceCost - this.activeCost - this.lineCost - this.otherCost - this.mechanicalSpliceCost;
            let nextLinks = this.getNextLinks(findNode, flag);
            if (!fish.isEmpty(nextLinks)) {
                nextResType = nextLinks[0].resType;
                nextResId = nextLinks[0].resId;
                if (RES_TYPE_OPT_SECT == nextResType) {
                    isPatchCord = nextLinks[0].isPatchCord ? nextLinks[0].isPatchCord : 'N';
                }
                if (nextResType == RES_TYPE_SPLITTER) {
                    this.splitterConnectType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                }
                if (!linkType) {
                    linkType = nextLinks[0].linkType;
                }
            }

            this.setOltorOnuNum(linkType, resType, isPatchCord, spliceType, nextResType);
            if (resType == RES_TYPE_SPLITTER) {
                splitterRadio = linkData.splitterRadio;
            }

            if (RES_TYPE_OPT_SECT == resType) {
                let fiberType = linkData.fiberType ? linkData.fiberType : LINK_TYPE_652D;
                isPatchCord = linkData.isPatchCord ? linkData.isPatchCord : 'N';
                let curLineLen = linkData.length;
                if (LINK_TYPE_652D == fiberType) {
                    this.linkCost = this.linkCost652;
                } else {
                    this.linkCost = this.linkCost657;
                }
                let curLineCost = (curLineLen * this.linkCost) / 1000;
                // curLineCost = curLineCost.toFixed(3);
                this.lineCost += curLineCost;
                this.linkLength += curLineLen;
                this.setCableCostInfo(linkData, 0, 0, curLineLen, curLineCost, 0, 0);
            }
            this.setCost(resType);
            if (resType == RES_TYPE_OLT) {
                this.otherCost += this.ponCost;
            }

            //出去的损耗
            outCost =
                this.downMaxCost -
                this.firstCost -
                this.secondCost -
                this.spliceCost -
                this.activeCost -
                this.lineCost -
                this.otherCost -
                this.mechanicalSpliceCost;

            linkData.inCost = inCost;
            linkData.outCost = outCost;
            linkData.spliceNum = this.curSpliceNum;
            linkData.spliceCost = this.curSpliceNum * this.splicePer;
            linkData.mechanicalSpliceNum = this.curMechanicalSpliceNum;
            linkData.mechanicalSpliceCost = this.curMechanicalSpliceNum * this.mechanicalSplicePer;
            linkData.activeNum = this.curActiveNum;
            linkData.activeCost = this.curActiveNum * this.activePer;
            if (splitterRadio) {
                linkData.splitterCost = this.getContextExtAttr(this.attenuationConfigData.splitterBudgetDTOS, splitterRadio, '');
            }

            if (resType == RES_TYPE_OLT) {
                linkData.ponCostOlt = this.ponCost;
            }
            this.setResOtherInfo(linkType, resType, resId);
            this.addedList.push(linkData.endId);
            nextLinks.forEach(tempNextLink => {
                    tempNextLink.preResInfo = resType + resId;
                    tempNextLink.preResType = resType;
            });
            if (!fish.isEmpty(nextLinks)) {
                this.updateLinkCostInfo(nextLinks, flag, isPatchCord);
            }
        },

        updateLinkCostInfo(nextLinks, flag, isPatchCord) {
            let inCost = 0;
            let outCost = 0;

            let linkType = '';
            let nextLinkType = '';
            let splitterRadio = '';
            let portUse = '';
            let resId = '';
            let parent = '';
            let resType = '';
            let nextResType = '';
            let nextResId = '';
           
            let nodeId = '';
            let findNode = '';
            let spliceType = 'F';
            for (let nextLink of nextLinks) {
                let rt = nextLink.resType;
                portUse = nextLink.portUse;
                let preResType = nextLink.preResType;
                if (RES_TYPE_OPT_SECT != preResType) {
                    isPatchCord = '';
                }
                if (RES_TYPE_SPLITTER == preResType && RES_TYPE_SPLITTER == rt && SPLITTER_IN_PORT == portUse) {
                    continue;
                }
                while (nextLink) {
                    parent = nextLink.parentEndId;
                    resType = nextLink.resType;
                    resId = nextLink.resId;
                    linkType = nextLink.linkType;
                    spliceType = nextLink.spliceType ? nextLink.spliceType : 'F';
                    if (fish.isEmpty(parent)) {
                        flag = true;
                        linkType = this.lastLinkType;
                    }
                    nodeId = nextLink.endId;
                    if (flag) {
                        findNode = nodeId;
                    } else {
                        findNode = parent;
                    }
                    nextLinks = this.getNextLinks(findNode, flag);
                    if (RES_TYPE_OPT_SECT == resType) {
                        let fiberType = nextLink.fiberType ? nextLink.fiberType : LINK_TYPE_652D;
                        isPatchCord = nextLink.isPatchCord ? nextLink.isPatchCord : 'N';
                        let curLineLen = nextLink.length;
                        if (LINK_TYPE_652D == fiberType) {
                            this.linkCost = this.linkCost652;
                        } else {
                            this.linkCost = this.linkCost657;
                        }
                        let curLineCost = (curLineLen * this.linkCost) / 1000;
                        // curLineCost = curLineCost.toFixed(3);
                        this.lineCost += curLineCost;
                        this.linkLength += curLineLen;
                        let spliceNumTemp = 0;
                        let mechanicalSpliceNumTemp = 0;

                        if (RES_TYPE_OPT_SECT == preResType) {
                            let tempLink = linkType;
                            if (!flag) {
                                tempLink = this.lastLinkType;
                            }
                            //两根光缆直融的情况
                            if (LINK_TYPE_SPLICE == tempLink) {
                                if ('F' == spliceType) {
                                    this.spliceNum++;
                                    spliceNumTemp++;
                                } else {
                                    this.mechanicalNum++;
                                    mechanicalSpliceNumTemp++;
                                }
                            }
                        }
                        this.setCableCostInfo(
                            nextLink,
                            spliceNumTemp,
                            spliceNumTemp * this.splicePer,
                            curLineLen,
                            curLineCost,
                            mechanicalSpliceNumTemp,
                            mechanicalSpliceNumTemp * this.mechanicalSplicePer
                        );
                        this.lastLinkType = linkType;
                        this.addedList.push(nextLink.endId);
                    } else {
                        let tempNextLink = this.getNextLinkData(nextLinks, nextLink, resType, SPLITTER_IN_PORT);
                        if (tempNextLink) {
                            nextResType = tempNextLink.resType;
                            nextResId = tempNextLink.resId;
                        }

                        if (RES_TYPE_SPLITTER == resType) {
                            portUse = nextLink.portUse;
                            splitterRadio = nextLink.splitterRadio;
                            if (SPLITTER_OUT_PORT == portUse) {
                                splitterRadio = this.getSplitterRadio(resType, resId, nextLink, splitterRadio);
                            }
                        }
                        this.setCost(resType);

                        inCost =
                            this.downMaxCost -
                            this.firstCost -
                            this.secondCost -
                            this.otherCost -
                            this.spliceCost -
                            this.activeCost -
                            this.lineCost -
                            this.mechanicalSpliceCost;

                        if (RES_TYPE_SPLITTER == resType) {
                            this.splitterConnectType = nextLink.connectorType;
                        }
                        if (flag) {
                            if (!linkType) {
                                linkType = this.lastLinkType;
                            }
                            this.setNum(
                                linkType,
                                resType,
                                preResType,
                                this.splitterConnectType,
                                nextLinks,
                                isPatchCord,
                                spliceType,
                                portUse,
                                SPLITTER_IN_PORT
                            );

                            if (tempNextLink) {
                                nextLinkType = tempNextLink.linkType;
                                if (RES_TYPE_OPT_SECT == nextResType) {
                                    isPatchCord = tempNextLink.isPatchCord ? tempNextLink.isPatchCord : 'N';
                                }
                                let connType = '';
                                if (RES_TYPE_SPLITTER == nextResType && RES_TYPE_SPLITTER != resType) {
                                    connType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                                }
                                this.setNum(
                                    nextLinkType,
                                    resType,
                                    nextResType,
                                    connType,
                                    nextLinks,
                                    isPatchCord,
                                    spliceType,
                                    portUse,
                                    SPLITTER_IN_PORT
                                );
                            }
                        } else {
                            this.setNum(
                                this.lastLinkType,
                                resType,
                                preResType,
                                this.splitterConnectType,
                                nextLinks,
                                isPatchCord,
                                spliceType,
                                portUse,
                                SPLITTER_IN_PORT
                            );
                            if (tempNextLink) {
                                if (RES_TYPE_OPT_SECT == nextResType) {
                                    isPatchCord = tempNextLink.isPatchCord ? tempNextLink.isPatchCord : 'N';
                                }
                            }
                            let connType = '';
                            if (RES_TYPE_SPLITTER == nextResType && RES_TYPE_SPLITTER != resType) {
                                connType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                            }
                            this.setNum(linkType, resType, nextResType, connType, nextLinks, isPatchCord, spliceType, portUse, SPLITTER_IN_PORT);
                        }
                        this.setCost(resType);
                        if (resType == RES_TYPE_ONU) {
                            this.otherCost += this.ponCost;
                        }
                        outCost =
                            this.downMaxCost -
                            this.firstCost -
                            this.secondCost -
                            this.otherCost -
                            this.spliceCost -
                            this.activeCost -
                            this.lineCost -
                            this.mechanicalSpliceCost;
                        nextLink.inCost = inCost;
                        nextLink.outCost = outCost;
                        nextLink.spliceNum = this.curSpliceNum;
                        nextLink.spliceCost = this.curSpliceNum * this.splicePer;
                        nextLink.mechanicalSpliceNum = this.curMechanicalSpliceNum;
                        nextLink.mechanicalSpliceCost = this.curMechanicalSpliceNum * this.mechanicalSplicePer;
                        nextLink.activeNum = this.curActiveNum;
                        nextLink.activeCost = this.curActiveNum * this.activePer;
                        if (RES_TYPE_SPLITTER == resType && splitterRadio) {
                            nextLink.splitterCost = this.getContextExtAttr(this.attenuationConfigData.splitterBudgetDTOS, splitterRadio, '');
                        } else {
                            nextLink.splitterRadio = '';
                        }
                        this.curActiveNum = 0;
                        this.curSpliceNum = 0;
                        this.curMechanicalSpliceNum = 0;

                        this.addedList.push(nextLink.endId);
                        this.lastLinkType = linkType;
                        isPatchCord = '';
                    }
                    nextLinks.forEach(tempNextLink => {
                        tempNextLink.preResInfo = resType + resId;
                        tempNextLink.preResType = resType;
                    });
                    if (!fish.isEmpty(nextLinks) && nextLinks.length > 1) {
                        this.updateLinkCostInfo(nextLinks, flag, isPatchCord);
                        break;
                    } else if (!fish.isEmpty(nextLinks) && nextLinks.length == 1) {
                        nextLink = nextLinks[0];
                    } else {
                        break;
                    }
                }
            }
        },

        // 计算上行光衰
        calcateUpLink() {
            this.addedList = [];
            this.recordMaps = [];
            this.spliceNum = 0;
            this.activeNum = 0;
            this.mechanicalNum = 0;
            this.curMechanicalSpliceNum = 0;
            this.curSpliceNum = 0;
            this.curActiveNum = 0;
            this.firstSplitInfo = '';
            this.secondSplitInfo = '';
            this.lastLinkType = '';
            this.splitterConnectType = '';
            this.firstCost = 0;
            this.secondCost = 0;
            this.otherCost = 0;
            this.lineCost = 0;
            let splitterRadio = '';
            let nextResType = '';
            let isPatchCord = '';
            let nextResId = '';

            let flag = false; // true 代表正向获取下一个

            let inCost = 0; // 进损耗
            let outCost = 0; // 出损耗

            let resIds = this.downlinkCon;
            let linkData = this.getLinkDataByResId(resIds);
            let parent = linkData.parentEndId;
            let linkType = linkData.linkType;
            let spliceType = linkData.spliceType ? linkData.spliceType : 'F';
            let resType = linkData.resType;
            let resId = linkData.resId;

            //从父节点为空的端口开始计算光衰，代表是此点与端子追踪起始点相同，找链路时都记为正向
            if (fish.isEmpty(parent)) {
                flag = true;
                linkType = this.lastLinkType;
            }

            let nodeId = linkData.endId;
            let findNode = '';
            if (flag) {
                //正向查找数据，当前的endId、resType、partType是下一个的父
                findNode = nodeId;
            } else {
                //反向查找数据，当前的parent是上一个的endId、resType、partType
                findNode = parent;
            }
            if (RES_TYPE_ONU != resType) {
                this.otherCost += this.ponCost ? this.ponCost : 0;
                this.spliceNum = this.fusionSpliceONT ? Number(this.fusionSpliceONT) : 0;
                this.mechanicalNum = this.mechanicalSpliceONT ? Number(this.mechanicalSpliceONT) : 0;
                this.activeNum = this.connectorONT ? Number(this.connectorONT) : 0;
                this.lineCost = this.otherMarginONT ? Number(this.otherMarginONT) : 0;
            }
            this.setCost(resType);
            inCost = this.downMaxCost - this.spliceCost - this.activeCost - this.lineCost - this.otherCost - this.mechanicalSpliceCost;
            let nextLinks = this.getNextLinks(findNode, flag);
            if (!fish.isEmpty(nextLinks)) {
                nextResType = nextLinks[0].resType;
                nextResId = nextLinks[0].resId;
                if (RES_TYPE_OPT_SECT == nextResType) {
                    isPatchCord = nextLinks[0].isPatchCord ? nextLinks[0].isPatchCord : 'N';
                }
                if (nextResType == RES_TYPE_SPLITTER) {
                    this.splitterConnectType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                }
                if (!linkType) {
                    linkType = nextLinks[0].linkType;
                }
            }
            this.setOltorOnuNum(linkType, resType, isPatchCord, spliceType, nextResType);

            if (resType == RES_TYPE_SPLITTER) {
                splitterRadio = linkData.splitterRadio;
            }

            if (RES_TYPE_OPT_SECT == resType) {
                let fiberType = linkData.fiberType ? linkData.fiberType : LINK_TYPE_652D;
                isPatchCord = linkData.isPatchCord ? linkData.isPatchCord : 'N';
                let curLineLen = linkData.length;
                if (LINK_TYPE_652D == fiberType) {
                    this.linkCost = this.linkCost652Up;
                } else {
                    this.linkCost = this.linkCost657Up;
                }
                let curLineCost = (curLineLen * this.linkCost) / 1000;
                // curLineCost = curLineCost.toFixed(3);
                this.lineCost += curLineCost;
                this.linkLength += curLineLen;
                this.setCableCostUpInfo(linkData, 0, 0, curLineLen, curLineCost, 0, 0);
            }
            this.setCost(resType);
            if (resType == RES_TYPE_ONU) {
                this.otherCost += this.ponCost;
            }
            outCost =
                this.upMaxCost -
                this.firstCost -
                this.secondCost -
                this.spliceCost -
                this.activeCost -
                this.lineCost -
                this.otherCost -
                this.mechanicalSpliceCost;
            linkData.inCostUp = inCost;
            linkData.outCostUp = outCost;
            linkData.spliceNumUp = this.curSpliceNum;
            linkData.spliceCostUp = this.curSpliceNum * this.splicePer;
            linkData.mechanicalSpliceNumUp = this.curMechanicalSpliceNum;
            linkData.mechanicalSpliceCostUp = this.curMechanicalSpliceNum * this.mechanicalSplicePer;
            linkData.activeNumUp = this.curActiveNum;
            linkData.activeCostUp = this.curActiveNum * this.activePer;
            if (resType == RES_TYPE_ONU) {
                linkData.ponCostOnt = this.ponCost;
            }
            this.setResOtherInfo(linkType, resType, resId);

            this.addedList.push(linkData.endId);
            nextLinks.forEach(tempNextLink => {
                tempNextLink.preResInfo = resType + resId;
                tempNextLink.preResType = resType;
            });
            if (!fish.isEmpty(nextLinks)) {
                this.updateUpLinkCostInfo(nextLinks, flag, isPatchCord);
            }
        },

        updateUpLinkCostInfo(nextLinks, flag, isPatchCord) {
            let inCost = 0;
            let outCost = 0;

            let linkType = '';
            let nextLinkType = '';
            let splitterRadio = '';
            let portUse = '';
            let resId = '';
            let parent = '';
            let resType = '';
            let nextResType = '';
            let nextResId = '';
            
            let nodeId = '';
            let findNode = '';
            let spliceType = 'F';
            for (let nextLink of nextLinks) {
                let rt = nextLink.resType;
                portUse = nextLink.portUse;
                let preResType = nextLink.nextLink;
                if (RES_TYPE_OPT_SECT != preResType) {
                    isPatchCord = '';
                }
                if (RES_TYPE_SPLITTER == preResType && RES_TYPE_SPLITTER == rt && SPLITTER_OUT_PORT == portUse) {
                    continue;
                }
                while (nextLink) {
                    parent = nextLink.parentEndId;
                    resType = nextLink.resType;
                    resId = nextLink.resId;
                    linkType = nextLink.linkType;
                    spliceType = nextLink.spliceType ? nextLink.spliceType : 'F';
                    if (fish.isEmpty(parent)) {
                        flag = true;
                        linkType = this.lastLinkType;
                    }
                    nodeId = nextLink.endId;
                    if (flag) {
                        findNode = nodeId;
                    } else {
                        findNode = parent;
                    }
                    nextLinks = this.getNextLinks(findNode, flag);
                    if (RES_TYPE_OPT_SECT == resType) {
                        let fiberType = nextLink.fiberType ? nextLink.fiberType : LINK_TYPE_652D;
                        isPatchCord = nextLink.isPatchCord ? nextLink.isPatchCord : 'N';
                        let curLineLen = nextLink.length;
                        if (LINK_TYPE_652D == fiberType) {
                            this.linkCost = this.linkCost652Up;
                        } else {
                            this.linkCost = this.linkCost657Up;
                        }
                        let curLineCost = (curLineLen * this.linkCost) / 1000;
                        // curLineCost = curLineCost.toFixed(3);
                        this.lineCost += curLineCost;
                        this.linkLength += curLineLen;

                        let spliceNumTemp = 0;
                        let mechanicalSpliceNumTemp = 0;

                        if (RES_TYPE_OPT_SECT == preResType) {
                            let tempLink = linkType;
                            if (!flag) {
                                tempLink = this.lastLinkType;
                            }
                            //两根光缆直融的情况
                            if (LINK_TYPE_SPLICE == tempLink) {
                                if ('F' == spliceType) {
                                    this.spliceNum++;
                                    spliceNumTemp++;
                                } else {
                                    this.mechanicalNum++;
                                    mechanicalSpliceNumTemp++;
                                }
                            }
                        }

                        this.setCableCostUpInfo(
                            nextLink,
                            spliceNumTemp,
                            spliceNumTemp * this.splicePer,
                            curLineLen,
                            curLineCost,
                            mechanicalSpliceNumTemp,
                            mechanicalSpliceNumTemp * this.mechanicalSplicePer
                        );
                        this.lastLinkType = linkType;
                        this.addedList.push(nextLink.endId);
                    } else {
                        let tempNextLink = this.getNextLinkData(nextLinks, nextLink, resType, SPLITTER_OUT_PORT);
                        if (tempNextLink) {
                            nextResType = tempNextLink.resType;
                            nextResId = tempNextLink.resId;
                        }

                        if (RES_TYPE_SPLITTER == resType) {
                            portUse = nextLink.portUse;
                            splitterRadio = nextLink.splitterRadio;
                            if (SPLITTER_IN_PORT == portUse) {
                                splitterRadio = this.getSplitterRadio(resType, resId, nextLink, splitterRadio);
                            }
                        }
                        this.setCost(resType);

                        inCost =
                            this.upMaxCost -
                            this.firstCost -
                            this.secondCost -
                            this.otherCost -
                            this.spliceCost -
                            this.activeCost -
                            this.lineCost -
                            this.mechanicalSpliceCost;

                        if (RES_TYPE_SPLITTER == resType) {
                            this.splitterConnectType = nextLink.connectorType;
                        }
                        if (flag) {
                            if (!linkType) {
                                linkType = this.lastLinkType;
                            }
                            this.setNum(
                                linkType,
                                resType,
                                preResType,
                                this.splitterConnectType,
                                nextLinks,
                                isPatchCord,
                                spliceType,
                                portUse,
                                SPLITTER_OUT_PORT
                            );
                            if (tempNextLink) {
                                nextLinkType = tempNextLink.linkType;
                                if (RES_TYPE_OPT_SECT == nextResType) {
                                    isPatchCord = tempNextLink.isPatchCord ? tempNextLink.isPatchCord : 'N';
                                }
                                let connType = '';
                                if (RES_TYPE_SPLITTER == nextResType && RES_TYPE_SPLITTER != resType) {
                                    connType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                                }
                                this.setNum(
                                    nextLinkType,
                                    resType,
                                    nextResType,
                                    connType,
                                    nextLinks,
                                    isPatchCord,
                                    spliceType,
                                    portUse,
                                    SPLITTER_OUT_PORT
                                );
                            }
                        } else {
                            this.setNum(
                                this.lastLinkType,
                                resType,
                                preResType,
                                this.splitterConnectType,
                                nextLinks,
                                isPatchCord,
                                spliceType,
                                portUse,
                                SPLITTER_OUT_PORT
                            );
                            if (tempNextLink) {
                                if (RES_TYPE_OPT_SECT == nextResType) {
                                    isPatchCord = tempNextLink.isPatchCord ? tempNextLink.isPatchCord : 'N';
                                }
                            }
                            let connType = '';
                            if (RES_TYPE_SPLITTER == nextResType && RES_TYPE_SPLITTER != resType) {
                                connType = this.findSplitterInfoByLinks(nextResId, 'CONN_TYPE');
                            }
                            this.setNum(linkType, resType, nextResType, connType, nextLinks, isPatchCord, spliceType, portUse, SPLITTER_OUT_PORT);
                        }
                        this.setCost(resType);
                        if (resType == RES_TYPE_OLT) {
                            this.otherCost += this.ponCost;
                        }
                        outCost =
                            this.upMaxCost -
                            this.firstCost -
                            this.secondCost -
                            this.otherCost -
                            this.spliceCost -
                            this.activeCost -
                            this.lineCost -
                            this.mechanicalSpliceCost;
                        nextLink.inCostUp = inCost;
                        nextLink.outCostUp = outCost;
                        nextLink.spliceNumUp = this.curSpliceNum;
                        nextLink.spliceCostUp = this.curSpliceNum * this.splicePer;
                        nextLink.mechanicalSpliceNumUp = this.curMechanicalSpliceNum;
                        nextLink.mechanicalSpliceCostUp = this.curMechanicalSpliceNum * this.mechanicalSplicePer;
                        nextLink.activeNumUp = this.curActiveNum;
                        nextLink.activeCostUp = this.curActiveNum * this.activePer;
                        if (RES_TYPE_OPT_SECT == resType && splitterRadio) {
                            nextLink.splitterCost = this.getContextExtAttr(this.attenuationConfigData.splitterBudgetDTOS, splitterRadio, '');
                        } else {
                            nextLink.splitterRadio = '';
                        }
                        this.curActiveNum = 0;
                        this.curSpliceNum = 0;
                        this.curMechanicalSpliceNum = 0;

                        this.addedList.push(nextLink.endId);
                        this.lastLinkType = linkType;
                        isPatchCord = '';
                    }
                    
                    nextLinks.forEach(tempNextLink => {
                        tempNextLink.preResInfo = resType + resId;
                        tempNextLink.preResType = resType;
                    });
                    if (!fish.isEmpty(nextLinks) && nextLinks.length > 1) {
                        this.updateUpLinkCostInfo(nextLinks, flag, isPatchCord);
                        break;
                    } else if (!fish.isEmpty(nextLinks) && nextLinks.length == 1) {
                        nextLink = nextLinks[0];
                    } else {
                        break;
                    }
                }
            }
        },

        getSplitterRadio(resType, resId, linkData, splitterRadio) {
            let resTypeId = resType + resId;
            if (fish.isEmpty(this.firstSplitInfo)) {
                this.firstSplitInfo = resTypeId;
            } else if (fish.isEmpty(this.secondSplitInfo) && resTypeId != this.firstSplitInfo) {
                this.secondSplitInfo = resTypeId;
            }
            if (resTypeId == this.firstSplitInfo) {
                //同是一级分光器不同下行端口的情况
                this.firstCost = 0;
                this.secondCost = 0;
            }

            if (resTypeId == this.secondSplitInfo) {
                //同是一级分光器不同下行端口的情况
                this.secondCost = 0;
            }
            let recordMap = this.getNodeRecord(resTypeId);
            if (!fish.isEmpty(recordMap)) {
                this.activeNum = recordMap.activeNum;
                this.spliceNum = recordMap.spliceNum;
                this.mechanicalNum = recordMap.mechanicalNum;
                this.lineCost = recordMap.lineCost;
                this.otherCost = recordMap.otherCost;
            }
            if (fish.isEmpty(splitterRadio)) {
                splitterRadio = this.findSplitterInfoByLinks(resId, 'RADIO');
            }
            if (this.firstCost != 0 && this.secondCost == 0 && resTypeId != this.firstSplitInfo) {
                this.secondCost += this.getContextExtAttr(this.attenuationConfigData.splitterBudgetDTOS, splitterRadio, '');
                linkData.secondCost = this.secondCost;
            }
            if (this.firstCost == 0) {
                this.firstCost = this.getContextExtAttr(this.attenuationConfigData.splitterBudgetDTOS, splitterRadio, '');
                linkData.firstCost = this.firstCost;
            }
            return splitterRadio;
        },

        setResOtherInfo(linkType, resType, resId) {
            this.lastLinkType = linkType;
            this.curSpliceNum = 0;
            this.curActiveNum = 0;
            this.curMechanicalSpliceNum = 0;
        },

        setOltorOnuNum(linkType, resType, isPatchCord, spliceType, nextResType) {
            if (RES_TYPE_OPT_SECT != resType) {
                if (LINK_TYPE_TERM == linkType) {
                    if ('Y' != isPatchCord) {
                        this.spliceNum++;
                        this.curSpliceNum++;
                    }
                } else if (LINK_TYPE_SPLICE == linkType) {
                    if ('F' == spliceType) {
                        this.spliceNum++;
                        this.curSpliceNum++;
                    } else {
                        this.mechanicalNum++;
                        this.curMechanicalSpliceNum++;
                    }
                } else if (LINK_TYPE_JUMP == linkType) {
                    if (nextResType == RES_TYPE_SPLITTER && resType != RES_TYPE_SPLITTER) {
                        if ('SPLICE' == this.splitterConnectType) {
                            this.spliceNum++;
                            this.curSpliceNum++;
                        }
                    }
                }
            }
        },

        setCost(resType) {
            this.spliceCost = this.splicePer * this.spliceNum;
            this.activeCost = this.activePer * this.activeNum;
            this.mechanicalSpliceCost = this.mechanicalSplicePer * this.mechanicalNum;
            // if (RES_TYPE_ONU == resType || resType == RES_TYPE_OLT) {
            //     this.otherCost += this.ponCost;
            // }
        },

        setNum(linkType, resType, otherResType, connType, nextLinks, isPatchCord, spliceType, portUse, calPortUse) {
            if (linkType == LINK_TYPE_TERM) {
                if (RES_TYPE_SPLITTER == resType) {
                    this.spliceNum++;
                    this.curSpliceNum++;
                } else {
                    if ('Y' != isPatchCord) {
                        this.spliceNum++;
                        this.curSpliceNum++;
                    }
                    if (!fish.isEmpty(nextLinks)) {
                        this.curActiveNum += 0.5;
                        this.activeNum += 0.5;
                    }
                }
            } else if (linkType == LINK_TYPE_SPLICE) {
                if ('F' == spliceType) {
                    this.spliceNum++;
                    this.curSpliceNum++;
                } else {
                    this.mechanicalNum++;
                    this.curMechanicalSpliceNum++;
                }
            } else if (linkType == LINK_TYPE_JUMP) {
                if (RES_TYPE_SPLITTER == otherResType && RES_TYPE_SPLITTER != resType) {
                    if ('SPLICE' == connType) {
                        this.spliceNum++;
                        this.curSpliceNum++;
                    }
                    if (!fish.isEmpty(nextLinks)) {
                        this.curActiveNum += 0.5;
                        this.activeNum += 0.5;
                    }
                } else if (RES_TYPE_SPLITTER == otherResType && RES_TYPE_SPLITTER == resType && calPortUse == portUse) {
                    this.spliceNum++;
                    this.curSpliceNum++;
                } else if (RES_TYPE_SPLITTER != resType && !fish.isEmpty(nextLinks)) {
                    this.activeNum += 0.5;
                    this.curActiveNum += 0.5;
                }
            }
        },

        getNextLinkData(nextLinks, curLink, resType, calPortUse) {
            if (!fish.isEmpty(nextLinks)) {
                let link = nextLinks[0];
                if (RES_TYPE_SPLITTER == resType && calPortUse == curLink.portUse) {
                    return link;
                } else {
                    for (let i = 0; i < nextLinks.length; i++) {
                        let tempNextLink = nextLinks[i];
                        if (tempNextLink.resType + tempNextLink.resId != curLink.preResInfo) {
                            return tempNextLink;
                        }
                    }
                }
            }
        },

        getNodeRecord(resTypeId) {
            for (let i = 0; i < this.recordMaps.length; i++) {
                let map = this.recordMaps[i];
                let mapResTypeId = map.resTypeId;
                if (mapResTypeId === resTypeId) {
                    return map;
                }
            }

            let recordMap = {};
            recordMap.resTypeId = resTypeId;
            recordMap.activeNum = this.activeNum;
            recordMap.spliceNum = this.spliceNum;
            recordMap.mechanicalNum = this.mechanicalNum;
            recordMap.lineCost = this.lineCost;
            recordMap.otherCost = this.otherCost;
            this.recordMaps.push(recordMap);
            return recordMap;
        },

        setCableCostInfo(linkData, spliceNum, spliceCost, lineLength, lineCost, mechanicalSpliceNum, mechanicalSpliceCost) {
            linkData.spliceNum = spliceNum;
            linkData.spliceCost = spliceCost;
            linkData.lineCost = lineCost;
            linkData.lineLength = lineLength;
            linkData.mechanicalSpliceNum = mechanicalSpliceNum;
            linkData.mechanicalSpliceCost = mechanicalSpliceCost;
        },

        setCableCostUpInfo(linkData, spliceNum, spliceCost, lineLength, lineCost, mechanicalSpliceNum, mechanicalSpliceCost) {
            linkData.spliceNumUp = spliceNum;
            linkData.spliceCostUp = spliceCost;
            linkData.lineCostUp = lineCost;
            linkData.lineLength = lineLength;
            linkData.mechanicalSpliceNumUp = mechanicalSpliceNum;
            linkData.mechanicalSpliceCostUp = mechanicalSpliceCost;
        },

        findSplitterInfoByLinks(resId, type) {
            for (let i = 0; i < this.linkDatas.length; i++) {
                let linkData = this.linkDatas[i];
                if (resId == linkData.resId && RES_TYPE_SPLITTER == linkData.resType) {
                    if (type == 'RADIO' && linkData.splitterRadio) {
                        return linkData.splitterRadio;
                    } else {
                        return linkData.connectorType ? linkData.connectorType : 'PORT';
                    }
                }
            }
            return '';
        },

        // 获取下一个link节点
        getNextLinks(findNode, flag) {
            let nextLinks = [];
            if (flag) {
                for (let i = 0; i < this.linkDatas.length; i++) {
                    let linkData = this.linkDatas[i];
                    if (this.hasAdded(linkData.endId)) {
                        continue;
                    }
                    if (findNode == linkData.parentEndId) {
                        nextLinks.push(linkData);
                    }
                }
            } else {
                for (let i = 0; i < this.linkDatas.length; i++) {
                    let linkData = this.linkDatas[i];
                    if (this.hasAdded(linkData.endId)) {
                        continue;
                    }
                    if (findNode == linkData.endId) {
                        nextLinks.push(linkData);
                    }
                }
            }
            return nextLinks;
        },

        // 获取下一个link节点
        getNextLinks2(findNode, flag) {
            let nextLinks = [];
            if (flag) {
                for (let i = 0; i < this.linkDatas.length; i++) {
                    let linkData = this.linkDatas[i];
                    if (findNode == linkData.parentEndId) {
                        nextLinks.push(linkData);
                    }
                }
            } else {
                for (let i = 0; i < this.linkDatas.length; i++) {
                    let linkData = this.linkDatas[i];
                    if (findNode == linkData.endId) {
                        nextLinks.push(linkData);
                    }
                }
            }
            return nextLinks;
        },

        hasAdded(curNodeId) {
            for (let i = 0; i < this.addedList.length; i++) {
                if (this.addedList[i] == curNodeId) {
                    return true;
                }
            }
            return false;
        },

        // 根据res获取link节点数据
        getLinkDataByResId(resIds) {
            for (let i = 0; i < this.linkDatas.length; i++) {
                let linkData = this.linkDatas[i];
                if (linkData.resId + '-' + linkData.endId == resIds) {
                    return linkData;
                }
            }
        },

        // 获取光衰配置数据
        getContextExtAttr(datas, value, specId) {
            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];
                if (data.paramType == value) {
                    if (specId) {
                        if (data.specId == specId) {
                            return Number(data.userVal);
                        }
                    } else {
                        return Number(data.userVal);
                    }
                }
            }
        },

        // 获取最大上下行光功率
        getBudgetInfo() {
            this.costInfo = {};
            fish.ajax({
                url: `edesign/optical/module/budget/optBudget/v1?oltType=${this.optModuleOLT}&&onuType=${this.optModuleONU}&&attenuateType=${this.calculateType}`,
                type: 'GET',
                success: data => {
                    if (data && data.resultList) {
                        // 保存原始数据
                        this.downMaxCost = data.resultList[0].downMaxCost;
                        this.upMaxCost = data.resultList[0].upMaxCost;
                        this.initParam();
                    }
                },
            });
        },

        selectTopo(rowData, index) {
            // this.showTopo(rowData);
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
    font-weight: 100 !important;
    color: gray;
    padding-top: 5px;
}

/deep/ .port-setting div .panel-body {
    padding-top: 5px;
}

.port-setting {
    height: 100%;
    display: flex;
    flex-flow: column;
    .titel-class {
        border: 1px solid #e0e0e0;
        // border-left: 5px solid #4747ee;
        background: #f4f6f9;
        color: #4477ee;
        height: 40px;
        & > h3 {
            font-size: 12px;
            padding-left: 4px;
            margin: 9px 0;
        }
    }
    .form-class {
        padding-top: 10px;
        background: white;
        & > div {
            margin-bottom: 5px;
            & > div {
                & > div:first-child {
                    text-align: right;
                }
            }
        }
    }

    .form-one {
        height: 51px;
        border: 1px solid #e0e0e0;
        border-top: none;
    }

    .form-two {
        height: 84px;
        border: 1px solid #e0e0e0;
        border-top: none;
    }
}
</style>
