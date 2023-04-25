<template>
  <div class="rule-setting-box">
    <span class="left-img-icon">
      <img src="oss_core/edesign/assets/image/rule-setting-icon.png" />
      <div class="img-desc">
        {{ $t('RULE_COMPENT_CONDITION') }}
      </div>
    </span>
    <span class="right-rule-content">
      <RuleCompent v-if="attrList.length" :data="ruleData" :itemIndex="-1"></RuleCompent>
    </span>
  </div>
</template>
<style>
.rule-dropdown-box {
  max-height: 300px;
  overflow: auto;
}
</style>
<script>
import emitter from '@/components/el/mixins/emitter.js';
import RuleCompent from './RuleCompent.vue';

export default {
  name: 'RuleSetting',
  mixins: [emitter],
  props: {
    value: {
      type: Object,
    },
    varList: [],
  },
  model: {
    prop: 'value',
    event: 'changeRule',
  },
  components: {
    RuleCompent,
  },
  provide() {
    return {
      changeRuleData: this.changeValue,
      getAttrList: () => this.attrList,
      getAttrMap: () => this.attrMap,
    };
  },
  data() {
    return {
      // variableList:[],//提交的变量列表
      // formatMap:{},//用于计算变量是否重复
      statId: '',
      attrList: [],
      attrMap: {},
      ruleData: {
        optType: 'add',
        type: 'logic', //logic:逻辑条件表达式，count：计算表达式
        child: [], //存放子链接条件列表
        conditions: [], //存放条件列表
      },
    };
  },

  create() {},

  mounted() {
    this.initValue();
    this.formatVarList();
    this.changeValue();
  },

  methods: {
    initValue() {
      if (this.value) {
        this.statId = this.value.statId;
        if (this.value.statJson) {
          this.ruleData = this.value.statJson;
        }
      }
    },
    formatVarList() {
      const list = this.varList;
      let attrList = [];
      let attrMap = {};
      (list || []).map(it => {
        attrMap[it.attrName] = it;
        attrList.push({
          variableCode: it.attrName,
          variableName: it.attrDesc,
          dataType: it.dataType,
        });
      });
      this.attrList = attrList;
      this.attrMap = attrMap;
    },
    checkDataIsTrue() {
      //检验数据是否合格
      const str = JSON.stringify(this.ruleData);
      const checkList = ['"variableCode1":""', '"variableCode2":""', '"operator":""', '"conditions":[]'];
      const isFalse = checkList.find(it => str.indexOf(it) > -1);

      return {
        isNull: !this.ruleData.child.length && !this.ruleData.conditions.length,
        isTrue: !isFalse,
      };
    },
    formatVal(list, type) {
      //将值格式化，字符串需要加''
      return list.map(it => {
        if (type === 'N' && Number(it)) {
          return Number(it);
        }
        return `'${it}'`;
      });
    },
    formatFormula(list, pLink) {
      let newList = list.map(data => {
        let link = '||';
        if (data.optType === 'add') {
          link = '&&';
        }
        const conditionList = data.conditions.map(it => {
          if (!this.formatMap[it.variableCode1]) {
            this.formatMap[it.variableCode1] = true;
            this.variableList.push({
              varCode: it.variableCode1,
              varName: it.variableName1,
            });
          }

          if (it.variable2Type !== 'input' && it.variable2Type !== 'selectAttr' && !this.formatMap[it.variableCode2]) {
            this.formatMap[it.variableCode2] = true;
            this.variableList.push({
              varCode: it.variableCode2,
              varName: it.variableName2,
            });
          }
          if (it.operator === 'in') {
            //include(seq.list(1,2,3),c)
            return `include(seq.list(${this.formatVal(it.variableCode2.replaceAll('，', ',').split(','), it.variableDataType1)}),${
              it.variableCode1
            })`;
          } else {
            return `(${it.variableCode1}${it.operator}${
              it.variable2Type !== 'variable' ? `${this.formatVal([it.variableCode2], it.variableDataType1)}` : it.variableCode2
            })`;
          }
        });
        const conditionStr = conditionList.join(link);
        if (data.child.length) {
          return `(${conditionStr}${link}${this.formatFormula(data.child, link)})`;
        } else {
          return `(${conditionStr})`;
        }
      });
      return `${newList.join(pLink || '')}`;
    },
    formatFormulaText(list, pLink) {
      let newList = list.map(data => {
        let link = ' || ';
        if (data.optType === 'add') {
          link = ' && ';
        }
        const conditionList = data.conditions.map(it => {
          if (it.operator === 'in') {
            //include(seq.list(1,2,3),c)
            return `include(seq.list(${this.formatVal(it.variableCode2.replaceAll('，', ',').split(','), it.variableDataType1)}),${
              it.variableName1
            })`;
          } else if (it.variable2Type === 'selectAttr') {
            return `(${it.variableName1} ${it.operator} ${it.variableName2})`;
          } else {
            return `(${it.variableName1} ${it.operator} ${
              it.variable2Type === 'input' ? `${this.formatVal([it.variableCode2], it.variableDataType1)}` : it.variableName2
            })`;
          }
        });
        const conditionStr = conditionList.join(link);
        if (data.child.length) {
          return `(${conditionStr}${link}${this.formatFormulaText(data.child, link)})`;
        } else {
          return `(${conditionStr})`;
        }
      });
      return `${newList.join(pLink || '')}`;
    },
    // removeKh(str) {
    //   if (str.startsWith('(') && str.lastIndexOf(')') === str.length - 1) {
    //     str = str.substr(1, str.length - 2);
    //     return this.removeKh(str);
    //   } else {
    //     return str;
    //   }
    // },
    changeValue() {
      const { isTrue, isNull } = this.checkDataIsTrue();
      let val = {
        errorMsg: this.$t('RULE_COMPENT_CHECK_ERROR'),
        statement: '', //用于计算的公式
        displayStat: '', //用于显示用的公式
        statJson: '',
        pubStatVarList: [],
      };
      this.formatMap = {};
      this.attrValKeyMap = {};
      this.variableList = [];
      if (this.statId) {
        val.statId = this.statId;
      }
      if (isNull) {
        val.nullMsg = this.$t('RULE_COMPENT_CHECK_NO_NULL');
      } else if (isTrue) {
        val.errorMsg = '';
        val.statement = this.formatFormula([this.ruleData]);
        val.displayStat = this.formatFormulaText([this.ruleData]);
        val.statJson = this.ruleData;
        val.pubStatVarList = this.variableList;
      }
      this.$emit('changeRule', val);
      this.dispatch('ElFormItem', 'el.form.change', val);
    },
  },
  watch: {
    value() {
      this.initValue();
    },
    varList() {
      this.formatVarList();
    },
    ruleData(val) {
      this.changeValue();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './ruleSetting.scss';
</style>
