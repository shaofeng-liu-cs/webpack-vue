<template>
    <div class="">
        <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk" :className="'setting'">
            <template v-slot:popupBody>
                <div class="body-class">
                    <div class="left">
                        <div class="singleItem" :class="curItem === 'In-Site' ? 'activeClass' : ''" @click="changeItem('In-Site')">{{$t('AUTO_LLD_IN_CONNECTION')}}</div>
                        <div class="singleItem" :class="curItem === 'Feeder' ? 'activeClass' : ''" @click="changeItem('Feeder')">{{$t('AUTO_LLD_FEEDER_CONNECTION')}}</div>
                        <div class="singleItem" :class="curItem === 'Distribution' ? 'activeClass' : ''" @click="changeItem('Distribution')">{{$t('AUTO_LLD_DISTR_CONNECTION')}}</div>
                        <div class="singleItem" :class="curItem === 'Drop' ? 'activeClass' : ''" @click="changeItem('Drop')">{{$t('AUTO_LLD_DROP_CONNECTION')}}</div>
                        <div class="singleItem" :class="curItem === 'In-Building' ? 'activeClass' : ''" @click="changeItem('In-Building')">{{$t('AUTO_LLD_IN_BUILDING_CONNECTION')}}</div>
                    </div>
                    <div class="right">
                        <div v-show="curItem === 'In-Site'" class="right-div">
                            <div class="olt">
                                <div class="title">{{$t('AUTO_LLD_OUT_SIDE_OLT')}}</div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_PERCENTAGE')}}</div>
                                    <el-slider v-model="allObj.inSiteObj.olt.percentage" show-input class="content-value content-value-slider" :min="0" :max="100" :step="1"></el-slider>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_CARRIER')}}</div>
                                    <div class="content-value">
                                        <button type="button" :title="$t('AUTO_LLD_DEVICE')" class="btn btn-default device" @click="changeCarrier('Device')">{{$t('AUTO_LLD_DEVICE')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CHASIS')" class="btn btn-default chasis" @click="changeCarrier('Chasis')">{{$t('AUTO_LLD_CHASIS')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CARD')" class="btn btn-default card" @click="changeCarrier('Card')">{{$t('AUTO_LLD_CARD')}}</button>
                                    </div>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_SEPARATE_CHASIS')}}</div>
                                    <div class="content-value">
                                        <input type="checkbox" class="switch-btn" id="switchOLT" v-model="allObj.inSiteObj.olt.isSeparate">
                                    </div>
                                </div>
                            </div>
                            <div class="odf">
                                <div class="title">{{$t('AUTO_LLD_OUT_SIDE_ODF')}}</div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_PERCENTAGE')}}</div>
                                    <el-slider v-model="allObj.inSiteObj.odf.percentage" show-input class="content-value content-value-slider" :min="0" :max="100" :step="1"></el-slider>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_CARRIER')}}</div>
                                    <div class="content-value">
                                        <button type="button" :title="$t('AUTO_LLD_DEVICE')" class="btn btn-default device" @click="changeCarrier('Device')">{{$t('AUTO_LLD_DEVICE')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CHASIS')" class="btn btn-default chasis" @click="changeCarrier('Chasis')">{{$t('AUTO_LLD_CHASIS')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CARD')" class="btn btn-default card" @click="changeCarrier('Card')">{{$t('AUTO_LLD_CARD')}}</button>
                                    </div>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_OUT_ODF_JUMP')}}</div>
                                    <div class="content-value">
                                        <input type="checkbox" class="switch-btn" data-size="lg" id="switchODF">
                                    </div>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_JUMP_BETWEEN')}}</div>
                                    <div class="content-value">
                                        <button type="button" :title="$t('AUTO_LLD_SHELF')" class="btn btn-default shelf" @click="changeCarrier('Device')">{{$t('AUTO_LLD_SHELF')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_PANEL')" class="btn btn-default apanel" @click="changeCarrier('Chasis')">{{$t('AUTO_LLD_PANEL')}}</button>
                                    </div>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_JUMP_METHOD')}}</div>
                                    <div class="content-value">
                                        <button type="button" :title="$t('SETTING_SEQ')" class="btn btn-default seq" @click="changeCarrier('Device')">{{$t('SETTING_SEQ')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_TO_MIDDLEE')" class="btn btn-default toMiddle" @click="changeCarrier('Chasis')">{{$t('AUTO_LLD_TO_MIDDLEE')}}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-show="['Feeder', 'Distribution', 'Drop', 'In-Building'].indexOf(curItem) > -1" class="right-div">
                            <div class="olt">
                                <div class="title">{{curItem}} {{$t('AUTO_LLD_CABLE')}}</div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_PERCENTAGE')}}</div>
                                    <el-slider show-input class="content-value content-value-slider" :min="0" :max="100" :step="1"></el-slider>
                                </div>
                                <div class="content-div">
                                    <div class="content-label">{{$t('AUTO_LLD_CARRIER')}}</div>
                                    <div class="content-value">
                                        <button type="button" :title="$t('AUTO_LLD_DEVICE')" class="btn btn-default device" @click="changeCarrier('Device')">{{$t('AUTO_LLD_DEVICE')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CHASIS')" class="btn btn-default chasis" @click="changeCarrier('Chasis')">{{$t('AUTO_LLD_CHASIS')}}</button>
                                        <button type="button" :title="$t('AUTO_LLD_CARD')" class="btn btn-default card" @click="changeCarrier('Card')">{{$t('AUTO_LLD_CARD')}}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Popup>
    </div>
</template>
<script>
export default {
    name: 'Setting',
    inject: {
        getDeviceDesignEl: {
            default: () => {},
        },
        getHldEl: {
            default: () => {},
        },
    },
    computed: {
        el() {
            return typeof this.getDeviceDesignEl === 'function' ? this.getDeviceDesignEl() : this.getHldEl();
        },
    },
    data() {
        return {
            popupObj: {
                title: this.$t('AUTO_LLD_CONNECTION'), // 弹框标题
                ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CANCEL'), // 取消按钮内容
                modal: true, // 是否蒙层
                width: '840px', // 宽
                height: '520px', // 高
                left: '30%',
                top: '20%',
                show: false,
                zIndex: 10,
                drag: true,
                //body:false,
                resize: 'both',
                el: typeof this.getDeviceDesignEl === 'function' ? this.getDeviceDesignEl() : this.getHldEl(),
            },

            curItem: 'In-Site',
            allObj: {
                inSiteObj: {
                    olt: {
                        percentage: 0,
                        isSeparate: true,
                    },
                    odf: {
                        percentage: 0,
                    },
                },
            },
            switchODF: null,
            switchOLT: null,
        };
    },

    mounted() {},
    methods: {
        changeItem(item) {
            this.curItem = item;
        },

        changeCarrier(type) {
            this.allObj.inSiteObj.olt.carrier = type;
        },

        popupClose(val) {},

        popupOk() {
            this.$emit('settingOK');
            this.popupObj.show = false;
        },
    },

    watch: {
        'popupObj.show': {
            handler(val, old) {
                if (val) {
                    this.$nextTick(() => {
                        let opt = {};
                        this.switchOLT = $('#switchOLT').switchbutton();
                        this.switchODF = $('#switchODF').switchbutton();
                    });
                }
            },
        },
    },
};
</script>

<style lang="scss">
.setting {
    .modal-body {
        padding: 0 !important;
    }
    .modal-footer {
        margin-top: 10px;
    }
}
</style>

<style lang="scss" scoped>
@import './autoLLDsetting.scss';
</style>

