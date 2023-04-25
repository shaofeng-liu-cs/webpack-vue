<template>
  <Popup :popupObj="popupBom" @popupClose="popupClose" @popupOk="popupOk">
    <template v-slot:popupBody>
      <div class="wizard-modal-content-box">
        <div class="headFilter">
          <div class="headTitle">
            <span class="headTitText">{{$t('HLD_WIZARD_PLAN_GRID')}}</span>
            <span class="fg"></span>
          </div>
          <div class="baseSelectList">
            <span class="selectItem">
              <span class="itemLabel">{{$t('HLD_WIZARD_CHOOSEHLD')}}</span>
              <span class="itemInput">
                <input>
              </span>
            </span>
            <span class="selectItem">
              <span class="itemLabel">{{$t('HLD_WIZARD_CREATE_FROM')}}</span>
              <span class="itemInput">
                <Multiselect :dataOption="multiOpt" :options="multiData" :displayMode="'single'"></Multiselect>
              </span>
            </span>
            <span class="selectItem" style="width:200px;">

              <span class="itemInput">
                <input>
              </span>
              <span class="itemAfter">
                <button class="btn btn-primary">{{$t('HLD_WIZARD_ADD')}}</button>
              </span>
            </span>
            <span class="selectItem">
              <span class="itemLabel">{{$t('HLD_WIZARD_FILTER')}}</span>
              <span class="itemInput">
                <Multiselect :dataOption="multiOpt" :options="multiData" :displayMode="'single'" v-model="filterVal" @change="filterChange"></Multiselect>
              </span>
            </span>
          </div>
          <div v-if="filterVal.length>0" class="baseSelectList" style="margin-top:10px;">
            <span v-for="(item,index) in filterVal" :key="index" class="selectItem" style="width:200px;">
              <span class="itemLabel">{{item}}</span>
              <span class="itemInput">
                <input>
              </span>
            </span>
          </div>
          <div class="filterBtnList">
            <button class="btn btn-default" @click="resetForm">{{$t('HLD_WIZARD_Reset')}}</button>
            <button class="btn btn-default">{{$t('HLD_WIZARD_Save')}}</button>
            <button class="btn btn-default">{{$t('HLD_WIZARD_Query')}}</button>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script>
// import { queryHldBomInfoBySchemaId, saveHldBom } from '../../../../api/query/schema';
export default {
    name: 'HLDBom',
    inject: ['getProjectInfo', 'getHldEl', 'getResourceList'],
    computed: {
        projectInfo() {
            return this.getProjectInfo();
        },
        resourceList() {
            return this.getResourceList();
        },
        hldEl() {
            return this.getHldEl();
        },
    },
    props: {},
    data() {
        return {
            popupBom: {
                title: this.$t('HLD_WIZARD_TITLE'), // 弹框标题
                ok: this.$t('HLD_WIZARD_CREATE'), // 确认按钮内容
                close: this.$t('HLD_WIZARD_TRAIL_RUN'), // 取消按钮内容
                other: this.$t('HLD_WIZARD_JOINT_CLOSURE'), // 其他按钮内容
                modal: true, // 是否蒙层
                width: '75%', // 宽
                height: '540px', // 高
                show: false,
                drag: true,
                resize: 'both',
                zIndex: 3,
            },
            multiOpt: {
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: [],
            },
            multiData: [
                {
                    name: '筛选1',
                    value: 'ID_PNP',
                },
                {
                    name: '筛选2',
                    value: 'ID_POP',
                },
                {
                    name: '筛选3',
                    value: 'ID_PDP',
                },
                {
                    name: '筛选4',
                    value: 'ID_PSP',
                },
                {
                    name: '筛选5',
                    value: 'ID_PIP',
                },
            ],
            filterVal: [],
        };
    },
    created() {
        if (this.hldEl) {
            this.popupBom.el = this.hldEl;
        }
    },
    mounted() {},
    methods: {
        popupClose() {},
        popupOk() {},
        handleShow() {
            this.popupBom.show = !this.popupBom.show;
        },
        filterChange(a, b, c) {
            // this.filterVal = c;
        },
        resetForm() {
            console.log('filterVal:', this.filterVal);
        },
    },
    watch: {},
};
</script>

<style lang="scss" scoped>
@import './wizardModal.scss';
</style>