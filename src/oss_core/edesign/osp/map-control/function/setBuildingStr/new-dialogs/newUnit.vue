<template>
    <Popup :popupObj="popupNew" @popupClose="popupClose" @popupOk="popupOk">
        <template v-slot:popupBody>
            <div>
                <div>
                    <h5>{{ $t('MAP_CON_FUNC_UNIT_INFO') }}</h5>
                    <form class="contentForm" ref="unitInfo">
                        <div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('NAME') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="text" class="form-control" v-model="row.unitName" name="prefix" data-rule="required" />
                                </div>
                            </div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_START_FLOOR') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="number" class="form-control" v-model="row.startFloor" name="start" data-rule="required" disabled />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_END_FLOOR') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="number" class="form-control" v-model="row.endFloor" name="end" data-rule="required;" disabled />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <h5>{{ $t('MAP_CON_FUNC_ROOM_INFO') }}</h5>
                    <form class="contentForm" ref="roomInfo">
                        <div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_ROOM_TYPE') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <combobox type="text" class="form-control" v-model="row.roomType" :setting="roomTypeSetting" name="roomType" data-rule="required"></combobox>
                                </div>
                            </div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_ROOM_PREFIX') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="text" class="form-control" v-model="row.roomPrefix" name="roomPrefix" data-rule="required" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="content col-md-6">
                                <div class="col-md-5 inputLabel required-label">
                                    <label class="control-label">{{ $t('MAP_CON_FUNC_ROOM_QUANTITY') }}</label>
                                </div>
                                <div class="col-md-7">
                                    <input type="number" class="form-control" v-model="row.roomCount" name="roomCount" data-rule="required;" />
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
import { queryEnumValue } from '../../../map-control-api';
export default {
    name: 'New',
    inject: ['getHldEl'],
    computed: {
        hldEl() {
            return this.getHldEl();
        },
    },
    props: {
        graphic: {},
    },
    data() {
        return {
            popupNew: {
                title: this.$t('OSP_MAP_FUNCTION_NEW_UNIT_TITLE'), // 弹框标题
                ok: this.$t('OK'), // 确认按钮内容
                close: this.$t('CANCEL'), // 取消按钮内容
                modal: true, // 是否蒙层
                width: '650px', // 宽
                height: 'auto', // 高
                //left: '30%',
                //top:'20%',
                show: false,
                el: this.getHldEl(),
                drag: true,
                zIndex: 3,
            },

            roomTypeSetting: {
                placeholder: this.$t('PLEASE_SELECT'),
                dataTextField: 'name',
                dataValueField: 'code',
                dataSource: [],
            },
            row: {},
        };
    },

    mounted() {
        this.initValue();
    },

    methods: {
        initValue() {
            let attrIdForType = this.graphic.relaResType + '_ROOM.ROOM_TYPE';
            queryEnumValue(attrIdForType).then(data => {
                if (data && data.resultList) {
                    this.roomTypeSetting.dataSource = data.resultList;
                }
            });
        },
        popupClose() {
            this.popupNew.show = false;
            this.row = {};
        },

        popupOk() {
            this.$initForm = $(this.$refs.unitInfo).form();
            if (!this.$initForm.isValid()) {
                return;
            }
            this.$initForm1 = $(this.$refs.roomInfo).form();
            if (!this.$initForm1.isValid()) {
                return;
            }
            this.$emit('addUnit', this.row);
            this.popupNew.show = false;
            this.row = {};
        },
    },
};
</script>

<style lang="scss" scoped>
h5 {
    margin-top: 5px;
    color: #4477ee;
    border-bottom: 1px solid #d7d7d7;
    font-size: 14px;
    margin-bottom: 10px;
}

.required-label:before {
    content: '*';
    color: #fb6e52;
    vertical-align: middle;
    margin-right: 3px;
    line-height: 1;
}

.content {
    margin-top: 4px;
    height: 35px;
}

.inputLabel {
    text-align: right;
    padding-top: 4px;
}

.contentForm {
    height: 75px;
}
</style>
