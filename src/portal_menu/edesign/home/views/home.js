/*
 * @Author: your name
 * @Date: 2021-02-22 09:19:44
 * @LastEditTime: 2022-11-07 11:18:21
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\portal_menu\edesign\home\home.js
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'hbs!oss_core/edesign/home/templates/home.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/home/i18n/home',
  'oss_core/edesign/home/views/echarts.min.js',
  'css!oss_core/edesign/home/css/home.css',
], (template, i18nOpb, i18nObject, echarts) => {
  const { fish, $ } = window;
  // const { fish, portal, $ } = window;
  return fish.View.extend({
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    template,
    events: {
      'click  .js-open': 'open',
      'click  .js-open-guan': 'openGuan',
    },
    initialize: opts => {
      this.options = opts;
      this.pieData = [];
      this.barData = [];
      this.lineData = [
        [this.i18nData.JAN, 0, 0],
        [this.i18nData.FEB, 0, 0],
        [this.i18nData.MAR, 0, 0],
        [this.i18nData.APR, 0, 0],
        [this.i18nData.MAY, 0, 0],
        [this.i18nData.JUN, 0, 0],
        [this.i18nData.JUL, 0, 0],
        [this.i18nData.AUG, 0, 0],
        [this.i18nData.SEP, 0, 0],
        [this.i18nData.OCT, 0, 0],
        [this.i18nData.NOV, 0, 0],
        [this.i18nData.DEC, 0, 0],
      ];
      this.charts1 = null;
      this.charts2 = null;
      this.charts3 = null;
      this.managementId = new Date().getTime();
      this.guanId = this.managementId + 1;
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      return this;
    },
    afterRender: () => {
      // console.log('我加载了');
      $(`#${this.options.domId}`)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .addClass('edesign-v9-home-content');
      this.charts1 = echarts.init(this.$('.js-chart1')[0]);
      this.charts2 = echarts.init(this.$('.js-chart2')[0]);
      this.charts3 = echarts.init(this.$('.js-chart3')[0]);
      this.charts1.showLoading();
      this.charts2.showLoading();
      this.charts3.showLoading();
      this.queryMonthCount().then(data => {
        this.charts2.hideLoading();
        if (data && data.resultList) {
          data.resultList.forEach(month => {
            switch (month.MON) {
              case 'Jan':
                this.lineData[0][1] = month.DEPLYEDNUM;
                this.lineData[0][2] = month.COMPLETEDNUM;
                break;
              case 'Feb':
                this.lineData[1][1] = month.DEPLYEDNUM;
                this.lineData[1][2] = month.COMPLETEDNUM;
                break;
              case 'Mar':
                this.lineData[2][1] = month.DEPLYEDNUM;
                this.lineData[2][2] = month.COMPLETEDNUM;
                break;
              case 'Apr':
                this.lineData[3][1] = month.DEPLYEDNUM;
                this.lineData[3][2] = month.COMPLETEDNUM;
                break;
              case 'May':
                this.lineData[4][1] = month.DEPLYEDNUM;
                this.lineData[4][2] = month.COMPLETEDNUM;
                break;
              case 'Jun':
                this.lineData[5][1] = month.DEPLYEDNUM;
                this.lineData[5][2] = month.COMPLETEDNUM;
                break;
              case 'Jul':
                this.lineData[6][1] = month.DEPLYEDNUM;
                this.lineData[6][2] = month.COMPLETEDNUM;
                break;
              case 'Aug':
                this.lineData[7][1] = month.DEPLYEDNUM;
                this.lineData[7][2] = month.COMPLETEDNUM;
                break;

              case 'Sep':
                this.lineData[8][1] = month.DEPLYEDNUM;
                this.lineData[8][2] = month.COMPLETEDNUM;
                break;
              case 'Oct':
                this.lineData[9][1] = month.DEPLYEDNUM;
                this.lineData[9][2] = month.COMPLETEDNUM;
                break;
              case 'Nov':
                this.lineData[10][1] = month.DEPLYEDNUM;
                this.lineData[10][2] = month.COMPLETEDNUM;
                break;
              case 'Dec':
                this.lineData[11][1] = month.DEPLYEDNUM;
                this.lineData[11][2] = month.COMPLETEDNUM;
                break;
              default:
                break;
            }
          });
        }
        this.drawLine();
      });
      this.loadSprintList().then(result => {
        this.charts1.hideLoading();
        this.charts3.hideLoading();
        // 避免数据污染
        let countNormal = 0;
        let countDelay = 0;
        let countAbort = 0;
        let countHLD = 0;
        let countRol = 0;
        let countCom = 0;
        if (result && result.resultData) {
          result.resultData.forEach(res => {
            switch (res.taskState) {
              case 'ABOUT':
                countAbort = res.taskNum;
                break;
              case 'DELAY':
                countDelay = res.taskNum;
                break;
              case 'NORMAL':
                countNormal = res.taskNum;
                break;
              case 'I':
                countHLD = res.taskNum;
                break;
              case 'H':
                countRol = res.taskNum;
                break;
              case 'C':
                countCom = res.taskNum;
                break;
              default:
                break;
            }
          });
          // this.soltClose();
          // $(this.$refs.gridRef.$refs.grid).grid('groupingCollapseSwitch', true)
        }
        const cloneData = JSON.stringify(result.resultData);
        this._gridData = JSON.parse(cloneData);
        this.gridData = result.resultData;
        this.multiData = result.resultData;
        this.pieData = [
          { value: countNormal, name: this.i18nData.NORMAL },
          { value: countDelay, name: this.i18nData.DELAYED },
          { value: countAbort, name: this.i18nData.TO_BE_DELAYED },
        ];
        this.barData = [countHLD, countRol, countCom];
        this.gridSelectedData = {};
        this.gridSelectedFlag = false;
        this.drawPie();
        this.drawBar();
      });
    },
    loadSprintList: () =>
      new Promise((resolve, reject) => {
        fish.ajax({
          url: 'edesign/project/taskstate/list/v1',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({}),
          success: data => {
            resolve(data);
          },
          error: er => {
            reject(er);
          },
        });
      }),
    queryMonthCount: () => fish.get({ url: 'edesign/sprint/schemaMonthCount/v1' }),
    drawPie: () => {
      this.charts1.setOption({
        grid: {
          top: 20,
          bottom: 50,
        },
        // 鼠标移入提示
        tooltip: {
          trigger: 'item',
          formatter: '{b}:{c} ({d}%)',
        },
        // 标签展示
        legend: {
          orient: 'horizontal', // 水平或者垂直 "vertical"
          icon: 'circle', // 默认为方形
          x: 'center',
          y: 'bottom', // 位置
          data: [this.i18nData.NORMAL, this.i18nData.DELAYED, this.i18nData.TO_BE_DELAYED],
          // top:200,
          // itemGap: 6 ,//两个属性的距离
          // itemWidth : 8,//图标的宽度，对应有itemHeight为高度,圆形只有半径
          // align: 'left',//图标与属性名的相对位置，默认为right，即属性名在左，图标在右
          // textStyle:{//属性名的字体样式设置
          //     fontSize:10,
          //     color: '#666'
          // }
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['50%', '70%'], // 内径与外径大小
            center: ['50%', '44%'],
            avoidLabelOverlap: false,
            // 设置饼状图圆心属性
            // normal,emphasis分别对应正常情况下与悬停效果
            label: {
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'blod',
                },
              },
              formatter: '{b}:{d}%',
            },

            labelLine: {
              normal: {
                show: true,
                length: 10,
                lineStyle: {
                  color: '#2496f5',
                },
              },
            },

            itemStyle: {
              normal: {
                // 返回颜色
                color(params) {
                  const colorList = ['#2496f5', '#f42221', '#fec100'];
                  return colorList[params.dataIndex];
                },
              },
            },

            data: this.pieData,
          },
        ],
      });
    },
    drawLine: () => {
      this.charts2.setOption({
        grid: {
          top: 20,
          bottom: 50,
        },
        tooltip: {
          trigger: 'axis',
          textStyle: { align: 'left' },
        }, // 鼠标移入提示

        dataset: {
          source: this.lineData,
        },
        xAxis: {
          type: 'category',
          // boundaryGap: false,//设置为false后，x轴的起始点01和y轴的起始点0是同一个位置
        },

        yAxis: {
          // 去掉轴刻度线
          axisTick: {
            show: false,
          },
          // 去除网格线
          splitLine: {
            lineStyle: {
              type: 'dotted',
              color: '#d6d3d3',
            },
          },
          axisLine: {
            show: false,
          },

          min: 0,
          max: value => (value.max > 10 ? value.max : 10),
          // splitNumber:1,
        },

        legend: {
          // orient: 'horizontal',
          // icon:'circle',
          x: 'center',
          y: 'bottom', // 位置
          data: [this.i18nData.DELAYED, this.i18nData.COMPLETE_ON_TIME],
        },
        series: [
          {
            name: this.i18nData.DELAYED,
            type: 'line',
            smooth: true, // 平滑的曲线，不再是折线
            symbol: 'none', // 去掉点
            itemStyle: {
              normal: {
                color: '#f42221',
              },
            },
          },
          {
            name: this.i18nData.COMPLETE_ON_TIME,
            type: 'line',
            smooth: true,
            symbol: 'none', // 去掉点
            itemStyle: {
              normal: {
                color: '#2496f5',
              },
            },
          },
        ],
      });
    },
    drawBar: () => {
      this.charts3.setOption({
        grid: {
          top: 20,
          bottom: 50,
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}:{c}',
        },
        legend: {},
        xAxis: {
          axisLabel: {
            interval: 0,
          },
          data: [this.i18nData.INITIALIZING, this.i18nData.HANDLING, this.i18nData.COMPLETED],
        },
        yAxis: {
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: 'dotted',
              color: '#d6d3d3',
            },
          },
          // 去除网格线
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            type: 'bar',
            data: this.barData,
            itemStyle: {
              normal: {
                color: params => {
                  const colorList = [
                    'rgb(208, 228, 254)',
                    'rgba(175, 185, 247, 0.9098039215686274)',
                    'rgb(72, 131, 228)',
                    // 'rgb(14, 24, 220)',
                    // 'rgb(14, 24, 180)'
                  ];
                  // 返回颜色
                  return colorList[params.dataIndex];
                },
              },
            },
          },
        ],
      });
    },
    open: () => {
      // portal.openMenu(this.managementId.toString(), 'oss_core/edesign/osp-design', 'S', 'Design Task Management(Manager)', { privCode: 'MANAGER' });
    },
    openGuan: () => {
      // portal.openMenu(this.guanId.toString(), 'oss_core/edesign/osp-design', 'S', 'Optical Attenuation Configuration', { privCode: 'ATTENUATION' });
    },
    cleanup: () => {},
  });
});
