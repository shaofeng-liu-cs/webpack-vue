<template>
  <span class="count-rule-compent-box">
    <span class="count-rule-item">
      <span v-if="!ruleData[mapKey].ruleType">
        <el-dropdown @command="chooseFormula">
          <span class="el-dropdown-link"> {{ ruleData[mapKey].ruleType }}<i class="el-icon-more"></i> </span>
          <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
            <el-dropdown-item v-if="mapKey !== 'root'" command="delete">{{ $t('DELETE') }}</el-dropdown-item>
            <el-dropdown-item
              v-for="(item, i) in formulaList"
              :divided="i === 0 && mapKey !== 'root'"
              :key="item.code"
              :command="item.code"
              >{{ item.name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </span>

      <span v-else-if="['variable', 'input'].includes(ruleData[mapKey].ruleType)" class="chooseVar">
        <el-dropdown @command="chooseVariable">
          <span v-if="ruleData[mapKey].ruleType === 'input'" class="el-dropdown-link">
            <span style="display:flex;align-items: center;">
              <el-input
                @blur="inputBlur"
                type="number"
                v-model="ruleData[mapKey].variableCode"
                size="mini"
                style="width:60px;"
              ></el-input>
            </span>
          </span>
          <span v-else class="el-dropdown-link">
            {{ ruleData[mapKey].variableName || $t('RULE_COMPENT_SELECT_VAL') }}
          </span>
          <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
            <el-dropdown-item command="input">{{ $t('RULE_COMPENT_CUSTOM_VALUE') }}</el-dropdown-item>
            <el-dropdown-item command="reset">{{ $t('RESET') }}</el-dropdown-item>
            <el-dropdown-item v-if="mapKey !== 'root'" command="delete">{{ $t('DELETE') }}</el-dropdown-item>
            <el-dropdown-item
              :divided="i === 0"
              v-for="(varItem, i) in attrList"
              :key="varItem.variableCode"
              :command="varItem.variableCode"
              :valueName="varItem.variableName"
              >{{ varItem.variableName }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </span>
      <span v-else-if="ruleData[mapKey].ruleType === 'brackets'" class="chooseBrackets">
        <el-dropdown @command="includeDownChange">
          <span class="el-dropdown-link">
            {{ `(` }}
          </span>
          <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
            <el-dropdown-item command="reset">{{ $t('RESET') }}</el-dropdown-item>
            <el-dropdown-item v-if="mapKey !== 'root'" command="delete">{{ $t('DELETE') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <CountRuleCompent
          v-if="ruleData[mapKey].containKey"
          :ruleData="ruleData"
          :mapKey="ruleData[mapKey].containKey"
        ></CountRuleCompent>
        <span class="brackets-after">{{ `)` }}</span>
      </span>
      <span v-else-if="ruleData[mapKey].ruleType === 'function'" class="chooseBrackets choose-function">
        <el-dropdown @command="includeDownChange">
          <span class="el-dropdown-link">
            {{
              ruleData[mapKey].functionName
                ? `${ruleData[mapKey].functionName}(`
                : `${$t('RULE_COMPENT_COUNT_FUNCTION_SELECT')}(`
            }}
          </span>
          <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
            <el-dropdown-item command="reset">{{ $t('RESET') }}</el-dropdown-item>
            <el-dropdown-item v-if="mapKey !== 'root'" command="delete">{{ $t('DELETE') }}</el-dropdown-item>
            <el-dropdown-item
              v-for="(item, i) in functionList"
              :divided="i === 0"
              :key="item.code"
              :command="item.code"
              :valueObj="item"
              >{{ item.name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <CountRuleCompent
          v-if="ruleData[mapKey].containKey"
          :ruleData="ruleData"
          :mapKey="ruleData[mapKey].containKey"
        ></CountRuleCompent>
        <span class="brackets-after">{{ `)` }}</span>
      </span>
      <span class="choose-operator">
        <el-dropdown @command="chooseOperator">
          <span class="el-dropdown-link">
            <span v-if="ruleData[mapKey].operator">{{ ruleData[mapKey].operator }}</span>
            <i v-else class="el-icon-d-caret"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
            <el-dropdown-item v-for="item in operatorList" :key="item" :command="item">{{ item }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </span>
    <CountRuleCompent
      v-if="ruleData[mapKey].operator && ruleData[mapKey].nextKey"
      :ruleData="ruleData"
      :mapKey="ruleData[mapKey].nextKey"
    ></CountRuleCompent>
  </span>
</template>
<script>
import FunctionConfig from './functionConfig.js';

export default {
  name: 'CountRuleCompent',
  props: {
    ruleData: {},
    mapKey: '',
    attrList: [],
  },
  inject: ['changeRuleData', 'deleteData', 'deleteIncludeData', 'getAttrList'],
  computed: {
    attrList() {
      return this.getAttrList();
    },
  },
  components: {},
  data() {
    const formulaType = {
      variable: {
        name: this.$t('RULE_COMPENT_SELECT_VAL'),
        code: 'variable', // 选择变量
      },
      input: {
        name: this.$t('RULE_COMPENT_CUSTOM_VALUE'),
        code: 'input', // 输入值
      },
      brackets: {
        name: this.$t('RULE_COMPENT_COUNT_BRACKETS'),
        code: 'brackets', // 括号
      },
      function: {
        name: this.$t('RULE_COMPENT_COUNT_FUNCTION'),
        code: 'function', // 函数
      },
    };
    const operator = ['+', '-', '*', '/', '%'];
    return {
      formulaTypeMap: formulaType,
      formulaList: Object.values(formulaType),
      operatorList: operator,
      functionList: FunctionConfig,
    };
  },

  create() {},

  mounted() {},

  // wwwwwwww
  methods: {
    inputBlur() {
      this.changeRuleData(this.mapKey, {});
    },
    chooseFormula(val) {
      // 根据不同的类型初始化数据
      if (val === 'delete') {
        // 删除
        this.deleteData(this.mapKey);
      } else if (val === 'variable' || val === 'input') {
        this.changeRuleData(this.mapKey, {
          ruleType: val,
          variableName: '',
          variableCode: '',
        });
      } else if (val === 'brackets') {
        const key = `rule_${Math.ceil(Math.random() * 100000)}_${Math.ceil(Math.random() * 100000)}`;
        this.changeRuleData(this.mapKey, {
          ruleType: val,
          containKey: key,
        });
        this.changeRuleData(key, {
          prevKey: this.mapKey,
          ruleType: '',
          variableName: '',
          variableCode: '',
          operator: '',
        });
      } else {
        this.changeRuleData(this.mapKey, {
          ruleType: val,
        });
      }
    },
    includeDownChange(val, obj) {
      if (val === 'delete') {
        // 删除
        this.deleteData(this.mapKey);
      } else if (val === 'reset') {
        // 重置
        if (this.ruleData[this.mapKey].containKey) {
          this.deleteIncludeData(this.ruleData[this.mapKey].containKey);
        }
        this.changeRuleData(this.mapKey, {
          ruleType: '',
          variableName: '',
          variableCode: '',
          containKey: '',
          functionCode: '',
          functionName: '',
          functionContent: '',
        });
      } else {
        // 函数选择
        const functionData = obj.$attrs.valueObj;
        const ykey = this.ruleData[this.mapKey].containKey;
        const key = `rule_${Math.ceil(Math.random() * 100000)}_${Math.ceil(Math.random() * 100000)}`;
        this.changeRuleData(this.mapKey, {
          variableName: '',
          variableCode: '',
          functionCode: val,
          functionName: functionData.name,
          functionContent: functionData.content,
          containKey: ykey || key,
        });
        if (!ykey) {
          this.changeRuleData(key, {
            prevKey: this.mapKey,
            ruleType: '',
            variableName: '',
            variableCode: '',
            operator: '',
          });
        }
      }
    },

    chooseVariable(val, obj) {
      if (val === 'delete') {
        // 删除
        this.deleteData(this.mapKey);
      } else if (val === 'reset') {
        if (this.ruleData[this.mapKey].containKey) {
          this.deleteIncludeData(this.ruleData[this.mapKey].containKey);
        }
        // 重置
        this.changeRuleData(this.mapKey, {
          ruleType: '',
          variableName: '',
          variableCode: '',
          containKey: '',
        });
      } else {
        // 选择变量
        const name = obj.$attrs.valueName;
        this.changeRuleData(this.mapKey, {
          ruleType: val === 'input' ? val : 'variable',
          variableName: val === 'input' ? '' : name,
          variableCode: val === 'input' ? '' : val,
        });
      }
    },
    chooseOperator(val) {
      if (this.ruleData[this.mapKey].nextKey) {
        //
        this.changeRuleData(this.mapKey, {
          operator: val,
        });
      } else {
        const key = `rule_${Math.ceil(Math.random() * 100000)}_${Math.ceil(Math.random() * 100000)}`;
        this.changeRuleData(this.mapKey, {
          nextKey: key,
          operator: val,
        });
        this.changeRuleData(key, {
          prevKey: this.mapKey,
          ruleType: '',
          variableName: '',
          variableCode: '',
          operator: '',
        });
      }
    },
  },
};
</script>
