<template>
    <div class="form-group">
        <div class="input-group popedit">
            <input id="addr_osp" ref="addr_osp">
        </div>
    </div>

</template>
<script>
export default {
    name: 'AddrPub',
    data() {
        return {};
    },

    props: {
        disabled: {
            type: Boolean,
            //default:true
        },

        value: {
            type: [String, Number],
        },

        required: {
            type: Boolean,
            default: false,
        },

        cityId: {
            type: String,
            default: '',
        },

        cityName: {
            type: String,
            default: '',
        },
    },
    mounted() {
        let addrPubImport = require('addrPub');
        let rendered = new addrPubImport({ id: 'addr_osp' }).render();
        if (this.required) {
            $('#addr_osp').attr('data-rule', 'required');
        }

        // let url = 'oss_public/opb/widget/area_search_pub/views/AreaSearchPub.js';
        // fish.require([url], (Page)=>{
        // 	  console.log(Page);
        // 	  let rend = new Page({id:"addr_osp"});
        // });

        if (this.disabled) {
            $('#addr_osp').popedit('disable');
        } else {
            $('#addr_osp').popedit('enable');
        }

        $('#btnSubmitAreaSearchPubOPB').click(data => {
            setTimeout(() => {
                let popeditValue = $('#addr_osp').popedit('getValue');
                console.log(popeditValue);
                this.$emit('select', popeditValue);
            }, 100);
        });
    },
    created() {},
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler(val, old) {
                if (val) {
                    setTimeout(() => {
                        $('#addr_osp').popedit('setValue', { name: val, value: 0 });
                    }, 100);
                }
            },
        },
        disabled: {
            deep: true,
            immediate: true,
            handler(val, old) {
                if (val) {
                    $('#addr_osp').popedit('disable');
                } else {
                    $('#addr_osp').popedit('enable');
                }
            },
        },
        cityId: {
            deep: true,
            immediate: true,
            handler(val, old) {
                if (val !== undefined) {
                    setTimeout(() => {
                        let opt = $('#addr_osp').popedit('option', 'dialogOption'); //←这个是必须的
                        if (opt) {
                            opt.initValue.id = val;
                            opt.initValue.name = val ? this.cityName : '';
                            opt.initValue.areaId = val;
                            opt.initValue.areaName = val ? this.cityName : '';
                            $('#addr_osp').popedit('option', 'dialogOption', opt);
                        }
                    }, 100);
                }
            },
        },
    },
    methods: {},
};
</script>
<style lang="scss" scoped>
</style>
