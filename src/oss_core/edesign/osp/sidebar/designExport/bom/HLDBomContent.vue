<template>
  <div class="modal-content-box">
    <JustTab :options="tasOptions" v-model="tapName"></JustTab>
    <div class="table-box">
      <el-table :data="dataList" border style="width: 100%" class="single-table" height="100%" :summary-method="getSummaries" show-summary>
        <el-table-column prop="designElement" :label="$t('DESIGN_EXPORT_BOM_TEMPLATE2')" min-width="130"></el-table-column>
        <el-table-column
          v-if="tapName === 'Material'"
          prop="resTemplateName"
          :label="$t('DESIGN_EXPORT_BOM_MODEL_NAME')"
          min-width="60"
        ></el-table-column>

        <el-table-column prop="unit" :label="$t('DESIGN_EXPORT_BOM_UNIT')" min-width="60"></el-table-column>

        <el-table-column prop="quantity" :label="$t('DESIGN_EXPORT_BOM_QUANTITY')" min-width="60">
          <template slot-scope="scope">
            {{ scope.row[schemaId] && scope.row[schemaId].quantity }}
          </template>
        </el-table-column>

        <el-table-column prop="price" :label="$t('DESIGN_EXPORT_BOM_PRICE_1')" min-width="60">
          <template slot-scope="scope">
            {{ scope.row[schemaId] && scope.row[schemaId].price }}
          </template>
        </el-table-column>
        <div slot="empty">
          <el-empty class="nodata-box" image="oss_core/edesign/assets/image/no_data.png" :image-size="50" :description="$t('NO_DATA')"></el-empty>
        </div>
      </el-table>
    </div>
  </div>
</template>

<script>
import { qrySuppliecBom, queryHldBomInfoBySchemaId } from '@/oss_core/edesign/api/query/schema.js'; // 后台接口
import { qrySystemParamInfo } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'HLDBomContent',
  inject: {
    getProjectInfo: {
      default: () => () => null, // 工程详情
    },
    getHldEl: {
      default: () => () => null,
    },
    getResourceList: {
      default: () => () => null,
    },
  },
  props: {},
  data() {
    return {
      tasOptions: [{ code: 'Material', name: this.$t('E_OSP_DESIGN_MATERIAL') }],
      dataList: [],
      tapName: 'Material',
      selecetResType: '',
      schemaId: '',
      constructionFlag: false, // 是否展示耗材等
      totalObj: {},
    };
  },
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
    // resourceList() {
    //   return this.getResourceList();
    // },
    hldEl() {
      return this.getHldEl();
    },
  },
  watch: {
    tapName: {
      deep: true,
      // immediate: true,
      handler(val) {
        this.initDataList();
      },
    },
  },
  created() {},

  mounted() {
    this.$emit('mountedInit');
  },

  methods: {
    getDataList(list) {
      const lastObj = list[list.length - 1] || {};
      if (lastObj.designElement === 'total') {
        this.totalObj = list.splice(list.length - 1, 1)[0];
      } else {
        this.totalObj = {};
      }
      return list;
    },
    initDataList() {
      const val = this.tapName;
      if (val === 'Material') {
        queryHldBomInfoBySchemaId([this.schemaId]).then(data => {
          const list = (data || []).map(it => {
            return {
              ...it,
              [this.schemaId]: {
                quantity: it.quantity,
                price: it.price,
              },
            };
          });
          this.dataList = this.getDataList(list);
        });
      } else {
        const keyMap = {
          Construction: 'C',
          ManHours: 'M',
          Tools: 'T',
        };
        const SuppliecBomParam = {
          suppType: keyMap[val],
          taskIdList: [this.schemaId],
        };
        qrySuppliecBom(SuppliecBomParam).then(data => {
          this.dataList = this.getDataList((data && data.data) || []);
        });
      }
    },
    initData(projectInfo) {
      this.schemaId = projectInfo.schemaId;
      if (!this.queryParam) {
        qrySystemParamInfo('CONSTRUCTION.SHOW').then(res => {
          this.queryParam = true;
          this.constructionFlag = res.SYSTEM_PARAM.DEFAULT_VAL === 'Y';
          if (this.constructionFlag && this.tasOptions.length === 1) {
            this.tasOptions = [
              ...this.tasOptions,
              { code: 'Construction', name: this.$t('E_OSP_DESIGN_CONSUMABLE_MATERIALS') },
              { code: 'ManHours', name: this.$t('E_OSP_DESIGN_MAN_HOURS') },
              { code: 'Tools', name: this.$t('E_OSP_DESIGN_TOOLS') },
            ];
          }
          this.initDataList();
        });
      } else {
        this.initDataList();
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = this.$t('COMPLETE_TRAJ_TABLE_AMOUNT');
        } else {
          sums[index] = (this.totalObj[this.schemaId] && this.totalObj[this.schemaId][column.property]) || '';
        }
      });

      return sums;
    },
    popupClose() {
      this.popupBom.show = false;
      this.$emit('popupClose');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './Bom.scss';
</style>
