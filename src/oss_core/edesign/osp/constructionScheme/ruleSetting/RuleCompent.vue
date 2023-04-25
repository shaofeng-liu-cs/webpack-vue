<template>
  <div class="rule-compent-box">
    <span class="rule-opt-span">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link down-opt-type-span"> {{ optMap[data.optType] }} <i class="icon_ospxiala icon_osp"></i> </span>
        <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
          <el-dropdown-item v-for="item in optList" :key="item" :command="item">{{ optMap[item] }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </span>
    <div class="compent-content">
      <span class="rule-condition-list">
        <div class="rule-choose-condition" v-for="(item, i) in data.conditions" :key="i">
          <span class="choose-var">
            <el-dropdown @command="(a, b) => chooseVariable(item, a, b)">
              <span class="el-dropdown-link">
                {{ item.variableName1 || $t('RULE_COMPENT_SELECT_VAL') }}
                <i class="icon_ospxiala icon_osp"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
                <el-dropdown-item
                  v-for="varItem in attrList"
                  :key="varItem.variableCode"
                  :command="varItem.variableCode"
                  :valueName="varItem.variableName"
                  :valDataType="varItem.dataType"
                  >{{ varItem.variableName }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="choose-operator m-l-mlg m-r-mlg" v-if="item.variableCode1">
            <el-dropdown @command="val => chooseOperator(item, val)">
              <span class="el-dropdown-link down-opt-type-span">
                {{ operMap[item.operator] || $t('RULE_COMPENT_SELECT_CONDITIONS') }}
                <i class="icon_ospxiala icon_osp"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
                <el-dropdown-item v-for="opeItem in operatorList" :key="opeItem" :command="opeItem">{{ operMap[opeItem] }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="choose-var el-dropdown-link-input" v-if="item.operator">
            <span v-if="item.operator === 'in'" style="display:flex;align-items: center;" class="drop-input-box drop-input-box-in">
              <el-input @blur="changeRuleData" v-model="item.variableCode2" size="mini" :placeholder="$t('RULE_COMPENT_OPR_IN_MSG')"></el-input>
            </span>

            <el-dropdown v-else-if="item.variable2Type === 'selectAttr'" @command="(a, b) => chooseAttrVal(item, a, b)">
              <span class="el-dropdown-link">
                {{ item.variableName2 || $t('RULE_COMPENT_SELECT_PROPERTIES') }}
                <i class="icon_ospxiala icon_osp"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
                <el-dropdown-item command="reset">{{ $t('RESET') }}</el-dropdown-item>
                <el-dropdown-item
                  v-for="(varItem, varIndex) in (attrMap[item.variableCode1] && attrMap[item.variableCode1].attrValues) || []"
                  :divided="varIndex === 0"
                  :key="varItem.attrValue"
                  :command="varItem.attrValue"
                  :valueName="varItem.valueDesc"
                  >{{ varItem.valueDesc }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>

            <el-dropdown v-else @command="(a, b) => chooseVariable2(item, a, b)">
              <span v-if="item.variable2Type === 'input'" class="el-dropdown-link el-dropdown-link-input">
                <span style="display:flex;align-items: center;" class="drop-input-box">
                  <el-input
                    @blur="changeRuleData"
                    v-model="item.variableCode2"
                    size="mini"
                    :type="item.variableDataType1 === 'N' ? 'number' : 'text'"
                    :placeholder="$t('PLEASE_ENTER')"
                  ></el-input>
                  <i class="icon_ospxiala icon_osp"></i>
                </span>
              </span>
              <span v-else class="el-dropdown-link">
                {{ item.variableName2 || $t('RULE_COMPENT_SELECT_VAL') }}
                <i class="icon_ospxiala icon_osp"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="rule-dropdown-box">
                <el-dropdown-item command="input">{{ $t('RULE_COMPENT_CUSTOM_VALUE') }}</el-dropdown-item>
                <el-dropdown-item
                  v-if="attrMap[item.variableCode1] && attrMap[item.variableCode1].attrValues && attrMap[item.variableCode1].attrValues.length"
                  command="selectAttr"
                  >{{ $t('RULE_COMPENT_SELECT_PROPERTIES') }}</el-dropdown-item
                >
                <el-dropdown-item
                  v-for="(varItem, varindex) in attrList"
                  :divided="varindex === 0"
                  :key="varItem.variableCode"
                  :command="varItem.variableCode"
                  :valueName="varItem.variableName"
                  >{{ varItem.variableName }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="removeItem" @click="removeConditions(data.conditions, i)">
            <i class="el-icon-delete"></i>
          </span>
        </div>
        <span
          style="margin-top:5px;"
          class="removeItem"
          v-if="!data.child.length && !data.conditions.length && itemIndex !== -1"
          @click="removeRuleItem"
        >
          <i class="el-icon-delete"></i>
        </span>
      </span>
      <div class="rule-child-span">
        <RuleCompent v-for="(child, index) in data.child" :key="index" :data="child" :itemIndex="index" @removeRule="removeRule"></RuleCompent>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'RuleCompent',
  props: {
    data: {},
    itemIndex: -1,
  },
  components: {},
  inject: ['changeRuleData', 'getAttrList', 'getAttrMap'],
  computed: {
    attrList() {
      return this.getAttrList();
    },
    attrMap() {
      return this.getAttrMap();
    },
  },
  data() {
    const optMap = {
      add: this.$t('RULE_COMPENT_OPR_ADD'),
      or: this.$t('RULE_COMPENT_OPR_OR'),
      addCondition: this.$t('RULE_COMPENT_ADD_CONDITION'),
      addJoinCondition: this.$t('RULE_COMPENT_ADD_JOIN_CONDITION'),
    };
    const operMap = {
      '==': this.$t('RULE_COMPENT_OPR_DY'),
      '!=': this.$t('RULE_COMPENT_OPR_NDY'),
      '>': this.$t('RULE_COMPENT_OPR_DAYU'),
      '<': this.$t('RULE_COMPENT_OPR_XIAOYU'),
      '>=': this.$t('RULE_COMPENT_OPR_DYDY'),
      '<=': this.$t('RULE_COMPENT_OPR_XYDY'),
      in: this.$t('RULE_COMPENT_OPR_IN'),
    };
    return {
      optMap,
      optList: Object.keys(optMap),
      operMap,
      operatorList: Object.keys(operMap),
    };
  },

  create() {},

  mounted() {},

  methods: {
    handleCommand(command) {
      if (command === 'addCondition') {
        // 添加条件
        this.data.conditions.push({
          type: 'condition', // 类型为条件
          variableName1: '', // 变量1名称
          variableCode1: '', // 变量1值
          variableDataType1: '', // 变量1类型
          operator: '', // 运算符
          variableName2: '', // 变量2名称
          variableCode2: '', // 变量2值
          variable2Type: '', // 变量2值的类型
        });
      } else if (command === 'addJoinCondition') {
        // 添加链接条件
        this.data.child.push({
          optType: 'add',
          type: 'logic', // logic:逻辑条件表达式，count：计算表达式
          child: [],
          conditions: [],
        });
      } else {
        this.data.optType = command;
      }
      this.changeRuleData();
    },
    chooseVariable(item, val, obj) {
      const name = obj.$attrs.valueName;
      const valDataType = obj.$attrs.valDataType;
      item.variableName1 = name;
      item.variableCode1 = val;
      if (valDataType !== item.variableDataType1 && item.variable2Type === 'input') {
        item.variableName2 = '';
        item.variableCode2 = '';
      }
      item.variableDataType1 = valDataType;
      this.changeRuleData();
    },
    chooseVariable2(item, val, obj) {
      if (val === 'selectAttr') {
        item.variable2Type = 'selectAttr';
        item.variableName2 = '';
        item.variableCode2 = '';
      } else if (val === 'input') {
        item.variable2Type = 'input';
        item.variableName2 = '';
        item.variableCode2 = '';
      } else {
        item.variable2Type = 'variable';
        const name = obj.$attrs.valueName;
        item.variableName2 = name;
        item.variableCode2 = val;
      }
      this.changeRuleData();
    },
    chooseAttrVal(item, val, obj) {
      if (val === 'reset') {
        item.variable2Type = '';
        item.variableName2 = '';
        item.variableCode2 = '';
      } else {
        item.variable2Type = 'selectAttr';
        const name = obj.$attrs.valueName;
        item.variableName2 = name;
        item.variableCode2 = val;
      }
      this.changeRuleData();
    },
    chooseOperator(item, val) {
      item.operator = val;
      if (val === 'in') {
        item.variable2Type = 'input';
        item.variableName2 = '';
        item.variableCode2 = '';
      }
      this.changeRuleData();
    },
    removeConditions(list, index) {
      list.splice(index, 1);
      this.changeRuleData();
    },
    removeRule(index) {
      this.data.child.splice(index, 1);
      this.changeRuleData();
    },
    removeRuleItem() {
      this.$emit('removeRule', this.itemIndex);
    },
  },
};
</script>
