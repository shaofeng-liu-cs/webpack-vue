<template>
  <div class="">
    <Popup :popupObj="popupObj" @popupClose="popupClose">
      <template v-slot:popupBody>
        <div class="col-md-12">
          <div class="col-md-9 left-content">
            <form class="form-group" ref="inputForm">
              <Panel :panelFooter='false'>
                <template v-slot:title>{{$t('MAP_PARAM_INPUT')}}</template>
                <template v-slot:body>
                  <div class="col-md-12 row-class">
                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_PON_TYPE')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="pontypeSetting" v-model="ponType"></Combobox>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_OLT_SFU')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="optModuleSettingOLT" v-model="optModuleOLT"></Combobox>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_ONU_SFU')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="optModuleSettingONU" v-model="optModuleONU"></Combobox>
                      </div>
                    </div>

                  </div>

                  <div class="col-md-12 row-class">
                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_FIRST_RATIO')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="ratioSettingFir" v-model="ratioFirst"></Combobox>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_SEC_RATIO')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="ratioSettingSec" v-model="ratioSecond"></Combobox>
                      </div>
                    </div>

                    <div class="col-md-4 ver_center">
                      <div class="col-md-5 content-label too-width">
                        <label class="control-label">{{$t('MAP_SYS_DB')}}</label>
                      </div>
                      <div class="col-md-7">
                        <input type="text" class="form-control" name="sys_db" v-model="systemMargin" data-rule="digits">
                      </div>
                    </div>
                  </div>

                  <div class="col-md-12 row-class">
                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_FUSION_SPLI')}}</label>
                      </div>
                      <div class="col-md-7">
                        <input type="text" class="form-control" v-model="fusionConnection" name="fusion" data-rule="integer[+0];">
                      </div>
                    </div>

                    <div class="col-md-4 ver_center">
                      <div class="col-md-5 content-label too-width">
                        <label class="control-label">{{$t('MAP_MECHANCIAL_SPLI')}}</label>
                      </div>
                      <div class="col-md-7">
                        <input type="text" class="form-control" v-model="mechancialConnection" name="mechancial" data-rule="integer[+0];">
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_ADAPTER')}}</label>
                      </div>
                      <div class="col-md-7">
                        <input type="text" class="form-control" v-model="adapter" name="adapter" data-rule="integer[+0];">
                      </div>
                    </div>
                  </div>

                  <div class="col-md-12 row-class">
                    <div class="col-md-4">
                      <div class="col-md-5 content-label">
                        <label class="control-label">{{$t('MAP_LINK_TYPE')}}</label>
                      </div>
                      <div class="col-md-7">
                        <Combobox :setting="linkTypeSetting" v-model="linkType"></Combobox>
                      </div>
                    </div>
                  </div>

                  <div class="btn-class">
                    <button type="button" class="btn btn-primary" @click="calculate">{{$t('MAP_CALCULATE')}}</button>
                  </div>
                </template>
              </Panel>
            </form>

            <form class="form-group cal-Result">
              <Panel :panelFooter='false'>
                <template v-slot:title>{{$t('MAP_CAL_RESULT')}}</template>
                <template v-slot:body>
                  <div class="col-md-12 result-class">
                    <div class="col-md-6">
                      <label class="control-label">{{$t('MAP_SUGGEST_ONU')}}</label>
                    </div>

                    <div class="col-md-5">
                      <label class="control-label" id="olt2onu">{{$t('MAP_NONE_KM')}}</label>
                    </div>
                  </div>

                  <div class="col-md-12 result-class">
                    <div class="col-md-6 ">
                      <label class="control-label">{{$t('MAP_SUGGEST_OLT')}}</label>
                    </div>

                    <div class="col-md-5">
                      <label class="control-label" id="onu2olt">{{$t('MAP_NONE_KM')}}</label>
                    </div>
                  </div>

                  <div class="col-md-12 result-class">
                    <div class="col-md-6 range-class">
                      <label class="control-label">{{$t('MAP_MAX_RANGE')}}</label>
                    </div>

                    <div class="col-md-5 range-class">
                      <label class="control-label" id="finnal">{{$t('MAP_NONE_KM')}}</label>
                    </div>
                  </div>

                </template>
              </Panel>
            </form>
          </div>
          <div class="col-md-3">
            <Panel :panelFooter='false'>
              <template v-slot:title>{{$t('MAP_DESC')}}</template>
              <template v-slot:body>
                <div class="">
                  <label class="control-label desc">
                    {{$t('MAP_FIRST_DESC')}}
                  </label>

                  <label class="control-label desc">
                    {{$t('MAP_SECOND_DESC')}}
                  </label>

                  <label class="control-label desc">
                    {{$t('MAP_THIRD_DESC')}}
                  </label>

                  <label class="control-label desc">
                    {{$t('MAP_FOURTH_DESC')}}
                  </label>

                  <label class="control-label desc">
                    {{$t('MAP_FIFTH_DESC')}}
                  </label>

                  <label class="control-label desc">
                    {{$t('MAP_SIXTH_DESC')}}
                  </label>
                </div>

              </template>
            </Panel>
          </div>
        </div>
      </template>
    </Popup>

  </div>

</template>

<script>
import { removeRepeatDataForList } from '@/oss_core/base/utils/util.js';
export default {
  name: 'linkCalculation',
  props: {},

  data() {
    return {
      popupObj: {
        title: this.$t('MAP_LINK_MAX'),
        ok: '',
        close: '',
        modal: true,
        width: '1300px',
        height: 'auto',
        //left: '35%',
        //top:'25%',
        show: false,
        //zIndex: 3
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
      ratioFirst: '',
      ratioSettingFir: {
        placeholder: this.$t('SHORT_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [],
      },

      ratioSecond: '',
      ratioSettingSec: {
        placeholder: this.$t('SHORT_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [],
      },

      linkType: '',
      linkTypeSetting: {
        placeholder: this.$t('SHORT_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [],
      },

      systemMargin: '',
      fusionConnection: '',
      mechancialConnection: '',
      adapter: '',

      allInitData: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    queryconfigData() {
      fish.ajax({
        type: 'GET',
        url: 'edesign/optical/attenuation/config/list/v1',
        success: data => {
          if (data && data.resultList) {
            this.allInitData = JSON.parse(JSON.stringify(data.resultList));

            let optModuleData = data.resultList.modulePowerDTOS
              .filter(opt => {
                let seq = Number(opt.opticalModule);
                return seq > 4;
              })
              .map(module => {
                return {
                  name: module.name.toString(),
                  value: module.opticalModule.toString(),
                };
              });
            optModuleData = removeRepeatDataForList(optModuleData, 'value');
            this.optModuleSettingONU.dataSource = optModuleData;
            this.optModuleSettingOLT.dataSource = optModuleData;
            if (optModuleData.length > 0) {
              this.optModuleSettingONU.value = optModuleData[0].value;
              this.optModuleSettingOLT.value = optModuleData[0].value;

              this.optModuleONU = optModuleData[0].value;
              this.optModuleOLT = optModuleData[0].value;
            }

            let spliter = data.resultList.splitterBudgetDTOS.map(spli => {
              return {
                name: spli.name.toString(),
                value: spli.userVal.toString(),
              };
            });

            this.ratioSettingFir.dataSource = spliter;
            this.ratioSettingSec.dataSource = spliter;
            // if (spliter.length > 0) {
            //     this.ratioSettingFir.value = spliter[0].value;
            //     this.ratioSettingSec.value = spliter[0].value;
            // }

            let dataSource = [];
            data.resultList.cableBudgetDTOS.forEach(cable => {
              let obj = {
                name: cable.fiberType,
                value: cable.specId,
              };
              dataSource.push(obj);
            });
            dataSource = removeRepeatDataForList(dataSource, 'value');
            this.linkTypeSetting.dataSource = dataSource;
            if (dataSource.length > 0) {
              this.linkTypeSetting.value = dataSource[0].value;
              this.linkType = dataSource[0].value;
            }
          }
        },
      });
    },

    /**
     * 计算公式 --EDNC_MODULE_POWER
     * (上行/下行光功率预算 - 一级分光衰减 - 二级分光衰减 - 系统连接衰减 - 热熔接头消耗 * 个数 - 机械熔接头消耗 * 个数 - 适配器消耗)/(上行/下行损耗取值)
     *
     * (OLT_SEND_MIN - ONU_SENSITIVE-DOWN_COST) AS DOWN_MAX_COST
     * (ONU_SEND_MIN-OLT_SENSITIVE - UP_COST) AS UP_MAX_COST
     */
    calculate() {
      this.$initForm = $(this.$refs.inputForm).form();
      if (!this.$initForm.isValid()) {
        let errorkm = '- km';
        document.getElementById('olt2onu').innerHTML = errorkm;
        document.getElementById('onu2olt').innerHTML = errorkm;
        document.getElementById('finnal').innerHTML = errorkm;
        return;
      }
      let moduleDataOLT = this.allInitData.modulePowerDTOS.filter(dto => dto.opticalModule === this.optModuleOLT);
      let moduleDataONU = this.allInitData.modulePowerDTOS.filter(dto => dto.opticalModule === this.optModuleONU);

      // 下行光功率预算
      let downMaxCost = 0;
      // 上行光功率预算
      let upMaxCost = 0;
      if (moduleDataOLT && moduleDataONU && moduleDataOLT.length > 0 && moduleDataONU.length > 0) {
        downMaxCost = moduleDataOLT[0].oltSendMin - moduleDataONU[0].onuSensitive - moduleDataOLT[0].downCost;
        upMaxCost = moduleDataONU[0].onuSendMin - moduleDataOLT[0].oltSensitive - moduleDataONU[0].upCost;
      }

      // 一级分光衰减
      let firstCost = 0;
      if (this.ratioFirst) {
        firstCost = Number(this.ratioFirst) ? Number(this.ratioFirst) : 0;
      }

      // 二级分光衰减
      let secondCost = 0;
      if (this.ratioSecond) {
        secondCost = Number(this.ratioSecond) ? Number(this.ratioSecond) : 0;
      }

      // 系统连接衰减
      let linkCost = 0;
      if (this.systemMargin) {
        linkCost = Number(this.systemMargin) ? Number(this.systemMargin) : 0;
      }

      // 热熔消耗
      let fusionSpliceCost = 0;
      if (this.fusionConnection) {
        let fusionCount = Number(this.fusionConnection) ? Number(this.fusionConnection) : 0;
        let fusionValue = this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '2' && dto.name === 'Splice Point')
          ? this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '2' && dto.name === 'Splice Point')[0].userVal
          : 0;
        fusionSpliceCost = fusionCount * fusionValue;
      }

      // 机械熔消耗
      let mechancialSpliceCost = 0;
      if (this.mechancialConnection) {
        let mechancialCount = Number(this.mechancialConnection) ? Number(this.mechancialConnection) : 0;
        let mechancialValue = this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '4' && dto.name === 'Mechanical Splice')
          ? this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '4' && dto.name === 'Mechanical Splice')[0].userVal
          : 0;
        mechancialSpliceCost = mechancialCount * mechancialValue;
      }

      // 适配器消耗
      let activeCost = 0;
      if (this.adapter) {
        let adapterCount = Number(this.adapter) ? Number(this.adapter) : 0;
        let adapterlValue = this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '1' && dto.name === 'Active Connector')
          ? this.allInitData.connectAttenuationDTOS.filter(dto => dto.id === '1' && dto.name === 'Active Connector')[0].userVal
          : 0;
        activeCost = adapterCount * adapterlValue;
      }

      // 上行损耗取值
      let upPercent = 1;
      if (this.linkType) {
        upPercent = this.allInitData.cableBudgetDTOS.filter(dto => dto.specId === this.linkType && dto.name === '1310nm')
          ? this.allInitData.cableBudgetDTOS.filter(dto => dto.specId === this.linkType && dto.name === '1310nm')[0].userVal
          : 1;
      }

      // 下行损耗取值
      let downPercent = 1;
      if (this.linkType) {
        downPercent = this.allInitData.cableBudgetDTOS.filter(dto => dto.specId === this.linkType && dto.name === '1490nm')
          ? this.allInitData.cableBudgetDTOS.filter(dto => dto.specId === this.linkType && dto.name === '1490nm')[0].userVal
          : 1;
      }

      let downCost = (downMaxCost - firstCost - secondCost - linkCost - fusionSpliceCost - mechancialSpliceCost - activeCost) / downPercent;
      let upCost = (upMaxCost - firstCost - secondCost - linkCost - fusionSpliceCost - mechancialSpliceCost - activeCost) / upPercent;
      let finnalCost = downCost > upCost ? upCost : downCost;

      let suggestLenOltToOnu = downCost.toFixed(0) + ' km';
      let suggestLenOnuToOlt = upCost.toFixed(0) + ' km';
      let finalLen = finnalCost.toFixed(0) + ' km';

      document.getElementById('olt2onu').innerHTML = suggestLenOltToOnu;
      document.getElementById('onu2olt').innerHTML = suggestLenOnuToOlt;
      document.getElementById('finnal').innerHTML = finalLen;
    },

    popupClose() {
      this.ponType = '';
      this.optModuleONU = '';
      this.optModuleOLT = '';
      this.ratioFirst = '';
      this.ratioSecond = '';
      this.systemMargin = '';
      this.fusionConnection = '';
      this.mechancialConnection = '';
      this.adapter = '';
      this.linkType = '';
    },
  },

  watch: {
    ponType: {
      deep: true,
      immediate: true,
      handler(val, old) {
        if (val === 'EPON') {
          let newDataSrc = this.allInitData.modulePowerDTOS
            .filter(opt => {
              let seq = Number(opt.opticalModule);
              return seq < 5;
            })
            .map(module => {
              return {
                name: module.name.toString(),
                value: module.opticalModule.toString(),
              };
            });
          this.optModuleSettingONU.dataSource = newDataSrc;
          this.optModuleSettingONU.value = newDataSrc[0].value;
          this.optModuleSettingOLT.dataSource = newDataSrc;
          this.optModuleSettingOLT.value = newDataSrc[0].value;
        } else if (val === 'GPON') {
          let newDataSrc = this.allInitData.modulePowerDTOS
            .filter(opt => {
              let seq = Number(opt.opticalModule);
              return seq > 4;
            })
            .map(module => {
              return {
                name: module.name.toString(),
                value: module.opticalModule.toString(),
              };
            });
          this.optModuleSettingONU.dataSource = newDataSrc;
          this.optModuleSettingONU.value = newDataSrc[0].value;
          this.optModuleSettingOLT.dataSource = newDataSrc;
          this.optModuleSettingOLT.value = newDataSrc[0].value;
        }
      },
    },
  },
};
</script>

<style scoped lang="scss">
.left-content {
  height: 459px;
  display: flex;
  flex-flow: column;
}
.cal-Result {
  flex-grow: 1;
  /deep/ .panel-default {
    height: 100%;
    .panel-body {
      height: calc(100% - 28px);
      display: flex;
      flex-flow: column;
      justify-content: center;
    }
  }
}
.content-label {
  text-align: right;
  padding-top: 4px;
}
.row-class {
  height: 40px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.btn-class {
  text-align: right;
}

.result-class {
  text-align: center;
  margin-bottom: 13px;
  &:last-child {
    margin-top: 10px;
    font-weight: bold;
  }
}

.range-class {
  font-size: 16px;
  //padding-left: 60px;
}

.desc {
  line-height: 25px;
}

.too-width {
  padding-top: 0;
}

.ver_center {
  display: flex;
  align-items: center;
}
</style>
