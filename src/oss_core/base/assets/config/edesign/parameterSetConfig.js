/* eslint-disable no-undef */
((root, factory) => {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(['i18n!oss_core/edesign/assets/config/edesign/i18n/parameterSet'], factory);
  } else {
    root.ol = factory();
  }
})(this, i18n => [
  {
    PARAM_CAT_CODE: 'CHECKING_RULES', // 大类code
    PARAM_CATA_NAME_CN: '设计约束', // 大类中文名
    PARAM_CATA_NAME_EN: 'Design Rules', // 大类英文名
    SEQ: '1', // 大类排序s
    GROUPS: [
      // 大类下的分组
      {
        PARAM_GROUP_CODE: 'SPL_RULES', // 分组code
        PARAM_GROUP_NAME_CN: '分光定义', // 分组中文名
        PARAM_GROUP_NAME_EN: 'Splitter Rules', // 分组英文名
        SEQ: '1', // 分组顺序（在大类下）
        PARAMS: [
          {
            PARAM_CODE: 'SPL_LEVEL', // 参数Code
            PARAM_NAME_CN: 'Splitter Level', // 参数中文名
            PARAM_NAME_EN: 'Splitter Level', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_SPL_LEVEL_0, code: 'L0' },
              { name: i18n.PARAMETER_SETTING_SPL_LEVEL_1, code: 'L1' },
              { name: i18n.PARAMETER_SETTING_SPL_LEVEL_2, code: 'L2' },
            ], //
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '1', // 顺序（在分组下）
          },
          {
            PARAM_CODE: '1ST_LEVEL_SPLIT_RATIO', // 参数Code
            PARAM_NAME_CN: '1st level Split Ratio', // 参数中文名
            PARAM_NAME_EN: '1st level Split Ratio', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_2, code: '1:2' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_4, code: '1:4' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_6, code: '1:6' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_8, code: '1:8' },
            ], // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'LEVEL_SPLIT_RATIO', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '2', // 顺序（在分组下）
          },
          {
            PARAM_CODE: '2ND_LEVEL_SPLIT_RATIO', // 参数Code
            PARAM_NAME_CN: '2nd level Split Ratio', // 参数中文名
            PARAM_NAME_EN: '2nd level Split Ratio', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_2, code: '1:2' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_4, code: '1:4' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_6, code: '1:6' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_8, code: '1:8' },
              { name: i18n.PARAMETER_SETTING_SPLIT_RATIO_1_1_16, code: '1:16' },
            ], // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'LEVEL_SPLIT_RATIO', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '3', // 顺序（在分组下）
          },
        ],
      },
      {
        PARAM_GROUP_CODE: 'TOLERANCE_CONSTRAINT', // 分组code
        PARAM_GROUP_NAME_CN: '容限约束', // 分组中文名
        PARAM_GROUP_NAME_EN: 'Tolerance Constraint', // 分组英文名
        SEQ: '2', // 分组顺序（在大类下）
        PARAMS: [
          {
            PARAM_CODE: 'DUCT_SIZE_FDP', // 参数Code
            PARAM_NAME_CN: 'Duct Size FDP', // 参数中文名
            PARAM_NAME_EN: 'Duct Size FDP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '1', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'DUCT_SIZE_FCP', // 参数Code
            PARAM_NAME_CN: 'Duct Size FCP', // 参数中文名
            PARAM_NAME_EN: 'Duct Size FCP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '2', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CABLE_CAPACITY_DROP', // 参数Code
            PARAM_NAME_CN: 'Cable Capacity Drop', // 参数中文名
            PARAM_NAME_EN: 'Cable Capacity Drop', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '3', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CABLE_CAPACITY_AGG', // 参数Code
            PARAM_NAME_CN: 'Cable Capacity AGG', // 参数中文名
            PARAM_NAME_EN: 'Cable Capacity AGG', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '4', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CABLE_CAPACITY_POP', // 参数Code
            PARAM_NAME_CN: 'Cable Capacity POP', // 参数中文名
            PARAM_NAME_EN: 'Cable Capacity POP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '5', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'SPARE_CAPACITIES_FCP', // 参数Code
            PARAM_NAME_CN: 'Spare Capacities per FCP', // 参数中文名
            PARAM_NAME_EN: 'Spare Capacities per FCP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '6', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'SPARE_CAPACITIES_PER_FDP', // 参数Code
            PARAM_NAME_CN: 'Spare Capacities per FDP', // 参数中文名
            PARAM_NAME_EN: 'Spare Capacities per FDP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '7', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'SPARE_CAP_PER_CABLE_BETN_FDP_TO_AGG', // 参数Code
            PARAM_NAME_CN: 'Spare Capacities per cable between FDP to AGG', // 参数中文名
            PARAM_NAME_EN: 'Spare Capacities per cable between FDP to AGG', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '8', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'DUCT_SIZE_DROP', // 参数Code
            PARAM_NAME_CN: 'Duct Size Drop', // 参数中文名
            PARAM_NAME_EN: 'Duct Size Drop', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '9', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'DUCT_SIZE_AGG', // 参数Code
            PARAM_NAME_CN: 'Duct Size AGG', // 参数中文名
            PARAM_NAME_EN: 'Duct Size AGG', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '10', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'DUCT_SIZE_POP', // 参数Code
            PARAM_NAME_CN: 'Duct Size POP', // 参数中文名
            PARAM_NAME_EN: 'Duct Size POP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '11', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CABLE_CAPACITY_FDP', // 参数Code
            PARAM_NAME_CN: 'Cable Capacity FDP', // 参数中文名
            PARAM_NAME_EN: 'Cable Capacity FDP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '12', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CABLE_CAPACITY_FCP', // 参数Code
            PARAM_NAME_CN: 'Cable Capacity FCP', // 参数中文名
            PARAM_NAME_EN: 'Cable Capacity FCP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '13', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'AVAILABLE_TRENCH_SIZES', // 参数Code
            PARAM_NAME_CN: 'Available Trench Sizes', // 参数中文名
            PARAM_NAME_EN: 'Available Trench Sizes', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '14', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'SPARE_CAPACITIES_PER_AGG', // 参数Code
            PARAM_NAME_CN: 'Spare Capacities per AGG', // 参数中文名
            PARAM_NAME_EN: 'Spare Capacities per AGG', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '15', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'SPARE_CAP_PER_CABLE_BETN_FCP_TO_AGG', // 参数Code
            PARAM_NAME_CN: 'Spare Capacities per cable between FCP to AGG', // 参数中文名
            PARAM_NAME_EN: 'Spare Capacities per cable between FCP to AGG', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '16', // 顺序（在分组下）
          },
        ],
      },
      {
        PARAM_GROUP_CODE: 'DISTANCE_CONSTRAINT', // 分组code
        PARAM_GROUP_NAME_CN: '距离约束', // 分组中文名
        PARAM_GROUP_NAME_EN: 'Distance Constraint', // 分组英文名
        SEQ: '3', // 分组顺序（在大类下）
        PARAMS: [
          {
            PARAM_CODE: 'HOW_MANY_RINGS_FOR_CONN_FCPS_TO_POP', // 参数Code
            PARAM_NAME_CN: 'how many rings for connecting FCPs to PoP', // 参数中文名
            PARAM_NAME_EN: 'how many rings for connecting FCPs to PoP', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '1', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'MAX_DISTANCE_OF_AERIAL', // 参数Code
            PARAM_NAME_CN: 'max. distance of Aerial, or UG to FDP(m)', // 参数中文名
            PARAM_NAME_EN: 'max. distance of Aerial, or UG to FDP(m)', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '2', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'MAX_DISTANCE_AGG_TO_FCP', // 参数Code
            PARAM_NAME_CN: 'max. distance AGG to FCP(m)', // 参数中文名
            PARAM_NAME_EN: 'max. distance AGG to FCP(m)', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '3', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'MAX_DISTANCE_AGG_TO_FDP', // 参数Code
            PARAM_NAME_CN: 'max. distance AGG to FDP(m)', // 参数中文名
            PARAM_NAME_EN: 'max. distance AGG to FDP(m)', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', // 1 textfield 2 // dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '4', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'MAX_DISTANCE_FCP_TO_POP', // 参数Code
            PARAM_NAME_CN: 'max distance FCP to PoP / CO(m)', // 参数中文名
            PARAM_NAME_EN: 'max distance FCP to PoP / CO(m)', // 参数英文名
            DATA_TYPE: 'N', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '1', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: '', // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            SEQ: '5', // 顺序（在分组下）
          },
        ],
      },
      {
        PARAM_GROUP_CODE: 'CONSTRUCTION_RELATED', // 分组code
        PARAM_GROUP_NAME_CN: '施工相关', // 分组中文名
        PARAM_GROUP_NAME_EN: 'Construction Related', // 分组英文名
        SEQ: '4', // 分组顺序（在大类下）
        PARAMS: [
          {
            PARAM_CODE: 'CABLE_LAYING', // 参数Code
            PARAM_NAME_CN: '光缆铺设方式', // 参数中文名
            PARAM_NAME_EN: 'Cable Laying', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_ALL, code: 'all' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_2, code: 'buried' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_1, code: 'aerial' },
            ], // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '1', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'OVERHEAD_UNDERGROUND_RESTRAINT', // 参数Code
            PARAM_NAME_CN: '架空，埋地约束', // 参数中文名
            PARAM_NAME_EN: 'Overhead&Underground Restraint', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_NETWORK_LEVEL, code: 'networkLevel' },
              { name: i18n.PARAMETER_SETTING_PARALEL, code: 'paralel' },
            ], // ；分隔
            PARENT_PARAM_CODE: '', // 上级
            DISP_VAL: '', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '2', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'CO_1FCP', // 参数Code
            PARAM_NAME_CN: 'CO-1FCP', // 参数中文名
            PARAM_NAME_EN: 'CO-1FCP', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_ALL, code: 'all' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_2, code: 'buried' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_1, code: 'aerial' },
            ], // ；分隔
            PARENT_PARAM_CODE: 'OVERHEAD_UNDERGROUND_RESTRAINT', // 上级
            DISP_VAL: 'networkLevel', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '1', // 顺序（在分组下）
          },
          {
            PARAM_CODE: '1FCP_AGG', // 参数Code
            PARAM_NAME_CN: '1FCP-AGG', // 参数中文名
            PARAM_NAME_EN: '1FCP-AGG', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_ALL, code: 'all' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_2, code: 'buried' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_1, code: 'aerial' },
            ], // ；分隔
            PARENT_PARAM_CODE: 'OVERHEAD_UNDERGROUND_RESTRAINT', // 上级
            DISP_VAL: 'networkLevel', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '2', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'AGG_FDP', // 参数Code
            PARAM_NAME_CN: 'AGG-FDP', // 参数中文名
            PARAM_NAME_EN: 'AGG-FDP', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_ALL, code: 'all' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_2, code: 'buried' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_1, code: 'aerial' },
            ], // ；分隔
            PARENT_PARAM_CODE: 'OVERHEAD_UNDERGROUND_RESTRAINT', // 上级
            DISP_VAL: 'networkLevel', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '3', // 顺序（在分组下）
          },
          {
            PARAM_CODE: 'FDP_HP', // 参数Code
            PARAM_NAME_CN: 'FDP-HP', // 参数中文名
            PARAM_NAME_EN: 'FDP-HP', // 参数英文名
            DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
            DATA_LENGTH: '', // 数据类型是S时的长度
            PRESION: '', // 数据类型是N时，数据长度
            SCALE: '', // 数据类型是N时，小数点位数
            CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
            IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
            DATA_SOURCE: [
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_ALL, code: 'all' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_2, code: 'buried' },
              { name: i18n.PARAMETER_SETTING_CABLE_LAYING_1, code: 'aerial' },
            ], // ；分隔
            PARENT_PARAM_CODE: 'OVERHEAD_UNDERGROUND_RESTRAINT', // 上级
            DISP_VAL: 'networkLevel', // 上级参数为xx时，此选项才可见
            COMBOX_CATE: 'CABLE_LAYING', // 下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
            SEQ: '4', // 顺序（在分组下）
          },
        ],
      },
    ],
  },
  {
    PARAM_CAT_CODE: 'Design_Draw', // 大类code
    PARAM_CATA_NAME_CN: '设计绘图', // 大类中文名
    PARAM_CATA_NAME_EN: 'Design Draw', // 大类英文名
    SEQ: '2', // 大类排序
    GROUPS: [],
  },
  {
    PARAM_CAT_CODE: 'BOM_BOQ', // 大类code
    PARAM_CATA_NAME_CN: 'BOM&BOQ', // 大类中文名
    PARAM_CATA_NAME_EN: 'BOM&BOQ', // 大类英文名
    SEQ: '3', // 大类排序
    GROUPS: [
      // {
      //   PARAM_GROUP_CODE: 'BOM_CALCULATION', // 分组code
      //   PARAM_GROUP_NAME_CN: 'BOM计算', // 分组中文名
      //   PARAM_GROUP_NAME_EN: 'BOM Calculation', // 分组英文名
      //   SEQ: '1', // 分组顺序（在大类下）
      //   PARAMS: [
      //     {
      //       PARAM_CODE: 'EXPORT_AUXILIARY', // 参数Code
      //       PARAM_NAME_CN: 'Need to export auxiliary', // 参数中文名
      //       PARAM_NAME_EN: 'Need to export auxiliary', // 参数英文名
      //       DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
      //       DATA_LENGTH: '', // 数据类型是S时的长度
      //       PRESION: '', // 数据类型是N时，数据长度
      //       SCALE: '', // 数据类型是N时，小数点位数
      //       CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
      //       IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
      //       DATA_SOURCE: [
      //         { name: 'Yes', code: 'Yes' },
      //         { name: 'No', code: 'No' },
      //       ], //
      //       PARENT_PARAM_CODE: '', // 上级
      //       DISP_VAL: '', // 上级参数为xx时，此选项才可见
      //       SEQ: '1', // 顺序（在分组下）
      //     },
      //     {
      //       PARAM_CODE: 'AUXILIARY_CALCULATION', // 参数Code
      //       PARAM_NAME_CN: 'Auxiliary calculation by', // 参数中文名
      //       PARAM_NAME_EN: 'Auxiliary calculation by', // 参数英文名
      //       DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
      //       DATA_LENGTH: '', // 数据类型是S时的长度
      //       PRESION: '', // 数据类型是N时，数据长度
      //       SCALE: '', // 数据类型是N时，小数点位数
      //       CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
      //       IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
      //       DATA_SOURCE: [
      //         { name: 'Ratio', code: 'Ratio' },
      //         { name: 'Statistics', code: 'Statistics' },
      //       ], // ；分隔
      //       PARENT_PARAM_CODE: '', // 上级
      //       DISP_VAL: '', // 上级参数为xx时，此选项才可见
      //       COMBOX_CATE: 'LEVEL_SPLIT_RATIO', //下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
      //       SEQ: '2', // 顺序（在分组下）
      //     },
      //     {
      //       PARAM_CODE: 'RESERVE_CABLE', // 参数Code
      //       PARAM_NAME_CN: 'Reserve cable length calculation by', // 参数中文名
      //       PARAM_NAME_EN: 'Reserve cable length calculation by', // 参数英文名
      //       DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
      //       DATA_LENGTH: '', // 数据类型是S时的长度
      //       PRESION: '', // 数据类型是N时，数据长度
      //       SCALE: '', // 数据类型是N时，小数点位数
      //       CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
      //       IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
      //       DATA_SOURCE: [
      //         { name: 'Ratio', code: 'Ratio' },
      //         { name: 'Statistics', code: 'Statistics' },
      //       ], // ；分隔
      //       PARENT_PARAM_CODE: '', // 上级
      //       DISP_VAL: '', // 上级参数为xx时，此选项才可见
      //       COMBOX_CATE: 'LEVEL_SPLIT_RATIO', //下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
      //       SEQ: '3', // 顺序（在分组下）
      //     },
      //     {
      //       PARAM_CODE: 'SLACK_CABLE', // 参数Code
      //       PARAM_NAME_CN: 'Slack cable length calculation by', // 参数中文名
      //       PARAM_NAME_EN: 'Slack cable length calculation by', // 参数英文名
      //       DATA_TYPE: 'S', // 数据类型，N- 数字 S- String
      //       DATA_LENGTH: '', // 数据类型是S时的长度
      //       PRESION: '', // 数据类型是N时，数据长度
      //       SCALE: '', // 数据类型是N时，小数点位数
      //       CONTROL_TYPE: '2', //  1:textfield 2:dropdownlist
      //       IF_NULL: 'Y', // Y 可以为空 // N 不可以为空
      //       DATA_SOURCE: [
      //         { name: 'Ratio', code: 'Ratio' },
      //         { name: 'Statistics', code: 'Statistics' },
      //       ], // ；分隔
      //       PARENT_PARAM_CODE: '', // 上级
      //       DISP_VAL: '', // 上级参数为xx时，此选项才可见
      //       COMBOX_CATE: 'LEVEL_SPLIT_RATIO', //下拉框数据源的分类名称，在多个地方使用同一个数据源时加上此参数
      //       SEQ: '3', // 顺序（在分组下）
      //     },
      //   ],
      // },
      // {
      //   PARAM_GROUP_CODE: 'BOQ_CALCULATION', // 分组code
      //   PARAM_GROUP_NAME_CN: 'BOQ计算', // 分组中文名
      //   PARAM_GROUP_NAME_EN: 'BOQ Calculation', // 分组英文名
      //   SEQ: '2', // 分组顺序（在大类下）
      // },
    ],
  },
  {
    PARAM_CAT_CODE: 'CONSTRUCTION_SETTING', // 大类code
    PARAM_CATA_NAME_CN: '施工方案', // 大类中文名
    PARAM_CATA_NAME_EN: 'Construction Scheme', // 大类英文名
    SEQ: '7', // 大类排序
    GROUPS: [],
  },
  {
    PARAM_CAT_CODE: 'EXPORT_FORMAT', // 大类code
    PARAM_CATA_NAME_CN: '导出格式', // 大类中文名
    PARAM_CATA_NAME_EN: 'Export Format', // 大类英文名
    SEQ: '4', // 大类排序
    GROUPS: [
      // {
      //   PARAM_GROUP_CODE: 'CAD', // 分组code
      //   PARAM_GROUP_NAME_CN: 'CAD', // 分组中文名
      //   PARAM_GROUP_NAME_EN: 'CAD', // 分组英文名
      //   SEQ: '1', // 分组顺序（在大类下）
      // },
      // {
      //   PARAM_GROUP_CODE: 'OTHER_ELECTRONIC_FORMATS', // 分组code
      //   PARAM_GROUP_NAME_CN: '其余电子格式', // 分组中文名
      //   PARAM_GROUP_NAME_EN: 'Other Electronic Formats', // 分组英文名
      //   SEQ: '2', // 分组顺序（在大类下）
      // },
      {
        PARAM_GROUP_CODE: 'Export_Settings', // 分组code
        PARAM_GROUP_NAME_CN: '导入/导出映射', // 分组中文名
        PARAM_GROUP_NAME_EN: 'Export/Import Mapping', // 分组英文名
        SEQ: '3', // 分组顺序（在大类下）
      },
      {
        PARAM_GROUP_CODE: 'KML_Structure', // 分组code
        PARAM_GROUP_NAME_CN: 'KML结构', // 分组中文名
        PARAM_GROUP_NAME_EN: 'KML Structure', // 分组英文名
        SEQ: '4', // 分组顺序（在大类下）
      },
    ],
  },
  // {
  //   PARAM_CAT_CODE: 'KML_Structure', // 大类code
  //   PARAM_CATA_NAME_CN: 'KML结构', // 大类中文名
  //   PARAM_CATA_NAME_EN: 'KML Structure', // 大类英文名
  //   SEQ: '2', // 大类排序
  //   GROUPS: [],
  // },
  // {
  //   PARAM_CAT_CODE: 'Export_Settings', // 大类code
  //   PARAM_CATA_NAME_CN: '导入/导出映射', // 大类中文名
  //   PARAM_CATA_NAME_EN: 'Export/Import Mapping', // 大类英文名
  //   SEQ: '6', // 大类排序
  //   GROUPS: [],
  // },
]);
