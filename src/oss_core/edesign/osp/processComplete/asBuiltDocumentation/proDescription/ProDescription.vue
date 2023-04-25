<template>
  <div class="pro-desc-box">
    <el-scrollbar>
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('PRO_ENGINEERING_OBJ') }}
        </span>
      </div>
      <div class="desc-item-content">
        <span class="left-pro-img">
          <el-image
            style="width: 100%;"
            :src="`opb/file/download?fileName=${dataInfo.thumbnailPath}`"
            :preview-src-list="[`opb/file/download?fileName=${dataInfo.imgPath}`]"
          >
          </el-image>
        </span>
        <span class="right-pro-it">
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_HP_TYPE') }}</div>
            <div class="info-it-val">{{ dataInfo.extHpType || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_HP_REDUNDANCY_RATIO') }}</div>
            <div class="info-it-val">{{ dataInfo.extHpRedundancyRatio || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_COVER_HPS') }}</div>
            <div class="info-it-val">{{ dataInfo.extCoverHps || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_USER_DENSITY') }}</div>
            <div class="info-it-val">{{ dataInfo.extUserDensity || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ `${$t('PROJECT_COVERAGE_AREA')}(KM²)` }}</div>
            <div class="info-it-val">{{ dataInfo.extCoverageArea || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_NUMBER_OF_MDU') }}</div>
            <div class="info-it-val">{{ dataInfo.extNumberOfMdu || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_NUMBER_OF_SDU') }}</div>
            <div class="info-it-val">{{ dataInfo.extNumberOfSdu || '- -' }}</div>
          </span>
          <span class="item-info">
            <div class="info-it-title">{{ $t('PROJECT_NUMBER_OF_BUILDING') }}</div>
            <div class="info-it-val">{{ dataInfo.extNumberOfBuilding || '- -' }}</div>
          </span>
        </span>
      </div>
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('PRO_CONSTRUCTION_SCHEDULE') }}
        </span>
        <span class="color-desc">
          <span class="color-it" style="background-color: #4499EE;"></span>
          <span class="color-text">{{ $t('PROJECT_DOING') }}</span>
          <span class="color-it" style="background-color: #0ccf08;"></span>
          <span class="color-text">{{ $t('PROJECT_COMLETION') }}</span>
        </span>
      </div>
      <div class="jindu-table">
        <el-table :data="dataList" border width="100%">
          <el-table-column prop="name" width="120"></el-table-column>

          <el-table-column v-for="(date, index) in dateList" :label="$moment(date).format('YYYY-MM-DD')" :key="index" min-width="100">
            <template slot-scope="scope">
              <div
                style="height:20px;"
                :style="{ backgroundColor: scope.row.state === 'C' ? '#0ccf08' : '#4499EE' }"
                v-if="scope.row.startDate <= date && date <= scope.row.finishDate"
                class="fill-div"
              ></div>
              <!-- <div
                style="height:20px;background-color: #4499EE;"
                v-else-if="scope.row.startDate === date"
                class="fill-div"
              ></div>
              <div
                style="height:20px;background-color: #0ccf08;"
                v-else-if="scope.row.finishDate === date"
                class="fill-div"
              ></div> -->
              <div style="height:20px;" v-else></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="box-head-title">
        <span class="left-title">
          {{ $t('PRO_CONSTRUCTION_COMPLETION') }}
        </span>
      </div>
      <el-empty
        v-if="!cardDataList.length"
        image="oss_core/edesign/assets/image/no_data.png"
        :image-size="50"
        :description="$t('NO_DATA')"
      ></el-empty>

      <div class="pro-des-card-box" v-for="(item, i) in cardDataList" :key="i">
        <div class="child-head-title" v-if="item.childList && item.childList.length">
          <span class="head-title">{{ item.networkLevel }}</span>
        </div>
        <div class="card-body-box">
          <span class="info-item" v-for="(chid, j) in item.childList" :key="j">
            <div class="info-it-title">{{ chid.childName }}</div>
            <div class="info-it-val">{{ chid.childVal }}</div>
          </span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { queryProjectTablePro, queryPrjNetworklevel } from '@/oss_core/edesign/api/query/project.js';

export default {
  name: 'ProDescription',
  props: {
    projectInfo: {},
  },
  components: {},

  data() {
    return {
      dataInfo: this.projectInfo || {},
      dateList: [],
      dataList: [],
      cardDataList: [],
    };
  },

  create() {},

  mounted() {
    (this.dataInfo.projectExtInfoList || []).forEach(item => {
      this.dataInfo[item.attrCode] = item.attrValue;
    });
    this.dataInfo = JSON.parse(JSON.stringify(this.dataInfo));
    this.init();
  },

  methods: {
    init() {
      if (!this.dataList.length && !this.cardDataList.length) {
        queryProjectTablePro(this.projectInfo.projectId).then(res => {
          let dateList = [];
          const data = (res.data || []).map(it => {
            if (it.startDate) {
              const date = this.$moment(`${this.$moment(it.startDate).format('YYYY-MM-DD')} 00:00:00`).valueOf();
              it.startDate = date;
              if (!dateList.includes(date)) {
                // 如果不存在加入进去
                dateList.push(date);
              }
            }
            if (it.finishDate) {
              const date = this.$moment(`${this.$moment(it.finishDate).format('YYYY-MM-DD')} 00:00:00`).valueOf();
              it.finishDate = date;
              if (!dateList.includes(date)) {
                // 如果不存在加入进去
                dateList.push(date);
              }
            }
            return it;
          });
          dateList = dateList.sort((a, b) => this.$moment(a).valueOf() - this.$moment(b).valueOf());
          this.dateList = dateList;
          this.dataList = data;
        });
        queryPrjNetworklevel(this.projectInfo.projectId).then(res => {
          this.cardDataList = res.data || [];
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './proDescription.scss';
</style>
