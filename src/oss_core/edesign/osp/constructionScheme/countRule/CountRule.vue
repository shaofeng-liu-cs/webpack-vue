<template>
  <div class="count-rule-setting-box">
    <CountRuleCompent v-if="attrList.length" :ruleData="allData" mapKey="root"></CountRuleCompent>
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
import CountRuleCompent from './CountRuleCompent.vue';
export default {
  name: 'CountRule',
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
    CountRuleCompent,
  },
  provide() {
    return {
      changeRuleData: this.changeData,
      deleteData: this.deleteData,
      deleteIncludeData: this.deleteIncludeData,
      getAttrList: () => this.attrList,
    };
  },
  data() {
    return {
      attrList: [],
      statId: '',
      allData: {
        root: {
          ruleType: '',
          variableName: '',
          variableCode: '',
          operator: '',
          nextKey: '',
        },
      },
    };
  },

  create() {},

  mounted() {
    this.initValue();
    this.formatVarList();
    this.changeValue();
  },
  //wwwwwwwwwww
  methods: {
    initValue() {
      if (this.value) {
        this.statId = this.value.statId;
        if (this.value.statJson) {
          this.allData = this.value.statJson;
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
        });
      });
      this.attrList = attrList;
      this.attrMap = attrMap;
    },
    //验证公式是否正确可运行
    checkFormula() {
      const list = Object.values(this.allData);
      if (list.length === 1 && !list[0].ruleType) {
        return {
          isTrue: false,
          isNull: !list[0].ruleType,
        };
      }
      let isTrue = true;
      for (let index = 0; index < list.length; index++) {
        const item = list[index];
        if (!item.ruleType) {
          isTrue = false;
          break;
        }
        if (item.ruleType !== 'brackets' && item.ruleType !== 'function') {
          if (!item.variableCode) {
            isTrue = false;
            break;
          }
        } else if (item.ruleType === 'function') {
          if (!item.functionCode) {
            isTrue = false;
            break;
          }
        }
      }
      return {
        isTrue,
        isNull: false,
      };
    },
    formatFormula(key) {
      let str = '';
      const obj = this.allData[key] || {};
      if (obj.containKey) {
        //有内联
        if (obj.ruleType === 'brackets') {
          str += `(${this.formatFormula(obj.containKey || obj.nextKey)})`;
        } else if (obj.ruleType === 'function') {
          str += `${obj.functionContent}(${this.formatFormula(obj.containKey || obj.nextKey)})`;
        }
      } else {
        str += obj.variableCode;
      }
      if (obj.nextKey) {
        str += `${obj.operator || ''}${this.formatFormula(obj.nextKey)}`;
      }
      return str;
    },

    deleteIncludeData(key) {
      //删除包含的数据，保持数据干净
      const obj = this.allData[key];
      if (obj.containKey) {
        this.deleteIncludeData(obj.containKey);
      } else if (obj.nextKey) {
        this.deleteIncludeData(obj.nextKey);
      }
      delete this.allData[key];
    },
    deleteData(key) {
      const prevKey = this.allData[key].prevKey;
      const nextKey = this.allData[key].nextKey;
      if (nextKey) {
        if (this.allData[prevKey].containKey === key) {
          //有包含节点,且删除的是该包含节点下的第一个节点
          this.allData[prevKey].containKey = nextKey;
          this.allData[nextKey].prevKey = prevKey;
        } else {
          //有存在下一个节点，将前后节点关联起来
          this.allData[prevKey].nextKey = nextKey;
          this.allData[nextKey].prevKey = prevKey;
        }
      } else {
        if (this.allData[prevKey].containKey === key) {
          if (prevKey !== 'root') {
            //包含节点下的唯一一个节点，删除整个节点
            this.deleteData(prevKey);
          } else {
            //root节点需要一直存在
            this.allData[prevKey] = {
              ...this.allData[prevKey],
              ruleType: '',
              variableName: '',
              variableCode: '',
              functionCode: '',
              functionName: '',
              functionContent: '',
              containKey: '',
            };
          }
        } else {
          //没有下一个节点说明是末尾节点，清除操作符和下节点key
          this.allData[prevKey].operator = '';
          this.allData[prevKey].nextKey = '';
        }
      }
      delete this.allData[key];
      this.changeValue();
    },
    changeData(key, data) {
      this.allData[key] = {
        ...this.allData[key],
        ...data,
      };
      this.changeValue();
    },
    changeValue() {
      this.allData = JSON.parse(JSON.stringify(this.allData));
      const { isTrue, isNull } = this.checkFormula();
      let val = {
        errorMsg: this.$t('RULE_COMPENT_CHECK_ERROR'),
        statement: '',
        displayStat: '', //用于显示用的公式
        statJson: '',
        pubStatVarList: [],
      };
      if (this.statId) {
        val.statId = this.statId;
      }
      if (isNull) {
        val.nullMsg = this.$t('RULE_COMPENT_CHECK_NO_NULL');
      } else if (isTrue) {
        val.statement = this.formatFormula('root');
        val.displayStat = val.statement;
        const list = Object.values(this.allData);
        let varList = [];
        let varIsHaveMap = {};
        list.map(item => {
          if (item.ruleType === 'variable' && !varIsHaveMap[item.variableCode]) {
            varIsHaveMap[item.variableCode] = true;
            val.displayStat = val.displayStat.replaceAll(item.variableCode, item.variableName);
            varList.push({
              varCode: item.variableCode,
              varName: item.variableName,
            });
          }
        });
        val.errorMsg = '';
        val.pubStatVarList = varList;
        val.statJson = this.allData;
      }
      this.$emit('changeRule', val);
      this.dispatch('ElFormItem', 'el.form.change', val);
    },
  },
  watch: {
    value(val) {
      console.log('什么东西：', val);
      this.initValue();
    },
    varList() {
      this.formatVarList();
    },
  },
};
</script>

<style lang="scss" scoped>
@import './countRule.scss';
</style>
