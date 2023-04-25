<template>
  <div class="addMain">
    <Popup :popupObj="popupObj" @popupClose="popupClose" @popupOk="popupOk" @popupOther="popupOther">
      <template v-slot:popupBody>
        <form class="form-group" ref="addForm">
          <div>
            <div class="col-md-12 form-group form-div">
              <div class="col-md-4 label-class">
                <label class="required-label">{{$t('RIGHT_MENU_ADD_POINT_RESCOURCE_TYPE')}}</label>
              </div>
              <div class="col-md-7">
                <Combobox class="form-control" v-model="resType" :setting="typeSetting" dataRule="required"></Combobox>
              </div>
            </div>

            <div class="col-md-12 form-group form-div">
              <div class="col-md-4 label-class">
                <label class="required-label">{{$t('RIGHT_MENU_ADD_POINT_LENGTH')}}</label>
              </div>
              <div class="col-md-7">
                <input type="text" class="form-control" data-rule="required" name="length" v-model="length" />
              </div>
            </div>

            <div class="col-md-12 form-group form-div">
              <div class="col-md-4 label-class">
                <label class="required-label">{{$t('RIGHT_MENU_ADD_POINT_CORNER_MODEL')}}</label>
              </div>
              <div class="col-md-7">
                <Combobox class="form-control" v-model="cornerMode" :setting="cornerModeSetting" dataRule="required"></Combobox>
              </div>
            </div>

            <div class="col-md-12 form-group form-div">
              <div class="col-md-4 label-class">
                <label class="required-label">{{$t('RIGHT_MENU_ADD_POINT_DISTANCE_LIMITS')}}</label>
              </div>
              <div class="col-md-7">
                <Combobox class="form-control" v-model="distanceLimits" :setting="distanceLimitsSetting" dataRule="required"></Combobox>
              </div>
            </div>
          </div>
        </form>
      </template>
    </Popup>
  </div>
</template>

<script>
import * as Color from '@/oss_core/base/map-style/default-styles.js'; // 画图样式
import { GeometryType } from 'map';
export default {
  name: 'property',
  inject: ['getMapBox', 'getResourceList', 'getProjectInfo', 'getControlData', 'getSchemaConfigs'],
  computed: {
    mapBox() {
      return this.getMapBox();
    },
    resourceList() {
      return this.getResourceList();
    },
    projectInfo() {
      return this.getProjectInfo();
    },
    controlData() {
      return this.getControlData();
    },
    schemaConfigs() {
      return this.getSchemaConfigs() || {};
    },
  },
  data() {
    return {
      popupObj: {
        title: this.$t('RIGHT_MENU_ADD_POINT_ADD_FORMAT_POINT'), // 弹框标题
        ok: this.$t('OK'), // 确认按钮内容
        close: this.$t('CANCEL'), // 取消按钮内容
        other: this.$t('PREVIEW'),
        modal: false, // 是否蒙层
        width: '650px', // 宽
        height: '260px', // 高
        left: '35%',
        top: '35%',
        show: false,
        zIndex: 10,
        drag: true,
      },
      AZresType: '',
      resType: '',
      typeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [],
      },
      length: '',
      lineGraphic: undefined,
      count: 0,

      cornerMode: 'always',
      cornerModeSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Always Place', value: 'always' },
          { name: 'Ignore', value: 'ignore' },
        ],
      },

      distanceLimits: 'average',
      distanceLimitsSetting: {
        placeholder: this.$t('PLEASE_SELECT'),
        dataTextField: 'name',
        dataValueField: 'value',
        dataSource: [
          { name: 'Average', value: 'average' },
          { name: 'Last Part Shorter', value: 'shorter' },
        ],
      },

      previewFlag: false,

      redoGras: [],
    };
  },

  mounted() {},
  methods: {
    initData(graphic) {
      if (graphic.length !== 1) return;
      this.lineGraphic = graphic[0];
      this.popupObj.show = true;

      let newResource = this.resourceList || [];
      newResource = newResource.filter(item => item.layerType === 'C' && item.resType !== 'SPLITTER');
      let layers = newResource.map(res => {
        let obj = {
          name: res.resTypeName,
          value: res.resType,
          type: this.mapBox.findLayer(res.layerNo).geometryType,
        };
        return obj;
      });
      this.typeSetting.dataSource = layers.filter(lay => lay.type === GeometryType.POINT);
    },
    popupClose() {
      if (this.previewFlag) {
        this.mapBox.clear();
      }
      this.controlData.initSelectedStatus.componentName = 'addFormatPoint';
      this.controlData.initSelectedStatus.rightCloseFlag = false;

      this.resType = '';
      this.AZresType = '';
      this.length = '';
    },

    popupOther() {
      this.$initForm = $(this.$refs.addForm).form();
      if (!this.$initForm.isValid() || !this.length) {
        return;
      }
      if (this.length) {
        let format = Number(this.length.toString());
        if (!(typeof format === 'number' && !isNaN(format))) {
          fish.toast('warn', this.$t('PLEASE_ENTER_VALID'));
          return;
        }
      }
      this.mapBox.clear();
      let points = this.getFormatPoints();
      points.forEach((point, index) => {
        let geometry = this.mapBox.createPoint(Number(point[0]), Number(point[1]));
        let symbol = Color.showIndex;
        this.mapBox.addGeometry(`pic${index}`, geometry, symbol);
      });
      this.previewFlag = true;
    },

    popupOk() {
      this.$initForm = $(this.$refs.addForm).form();
      if (!this.$initForm.isValid() || !this.length) {
        return;
      }
      if (this.length) {
        let format = Number(this.length.toString());
        if (!(typeof format === 'number' && !isNaN(format))) {
          fish.toast('warn', this.$t('PLEASE_ENTER_VALID'));
          return;
        }
      }
      let points = this.getFormatPoints();

      this.mapBox.clear();
      this.mapBox.deactiveSelect();
      let drawTool = this.mapBox.getDrawTool();
      this.count = 0;
      this.redoGras = [];
      points.forEach(point => {
        let url;
        let item;
        url = `oss_core/edesign/assets/image/map/res/${this.resType}.svg`;
        item = this.resourceList.filter(list => list.resStatus === 'C' && list.resType === this.resType)[0];
        let pic = new this.$map.PictureMarkerSymbol(url, 24, 24, 0, 0, 0);
        this.createGeo(item, pic, point, points.length);
      });
      this.popupObj.show = false;
      this.resType = '';
      this.AZresType = '';
      this.length = '';
    },

    getFormatPoints() {
      let returnPoints = [];
      let [paths] = this.lineGraphic.geometry.getPaths();
      let countLength = Number(this.length);
      if (this.cornerMode === 'ignore' || (paths && paths.length === 2)) {
        if (this.distanceLimits === 'average') {
          // 向上取整
          let countAddOne = Math.ceil(Number(this.lineGraphic.attributes.gisLen) / countLength);
          countLength = Number(this.lineGraphic.attributes.gisLen) / countAddOne;
          // 将数值类型的数据改变成了字符串类型
          countLength = Number(countLength.toFixed(2));
          returnPoints = this.$map.GeometryUtils.breakLineWithFixedLength(this.lineGraphic.geometry, countLength);
        } else if (this.distanceLimits === 'shorter') {
          returnPoints = this.$map.GeometryUtils.breakLineWithFixedLength(this.lineGraphic.geometry, countLength);
        }
      } else if (this.cornerMode === 'always' && paths && paths.length > 2) {
        let startCoor = paths[0];
        let endCoor = paths[paths.length - 1];
        paths.pop();
        paths.shift();
        returnPoints = returnPoints.concat(paths);
        if (this.distanceLimits === 'average') {
          // 向上取整
          let countAddOne = Math.ceil(Number(this.lineGraphic.attributes.gisLen) / countLength);
          countLength = Number(this.lineGraphic.attributes.gisLen) / countAddOne;
          // 将数值类型的数据改变成了字符串类型
          countLength = Number(countLength.toFixed(2));
        }
        paths.forEach((betweenPath, index) => {
          let singleLine;
          if (index === 0) {
            singleLine = this.mapBox.createLineGeometry([[startCoor, betweenPath]]);
          } else if (index < paths.length - 1) {
            singleLine = this.mapBox.createLineGeometry([[paths[index - 1], betweenPath]]);
          } else if (index === paths.length - 1) {
            singleLine = this.mapBox.createLineGeometry([[betweenPath, endCoor]]);
          }
          let singleLinePoints = this.$map.GeometryUtils.breakLineWithFixedLength(singleLine, countLength);
          returnPoints = returnPoints.concat(singleLinePoints);
        });
        if (paths.length === 1) {
          // 如果线拐点数等于1，foreach就会丢失第二根单线（最后一根）
          let lastLine = this.mapBox.createLineGeometry([[paths[0], endCoor]]);
          returnPoints = returnPoints.concat(this.$map.GeometryUtils.breakLineWithFixedLength(lastLine, countLength));
        } else if (paths.length > 1) {
          // 如果线拐点数大于1，foreach就会丢失倒数第二根单线
          let lastSecondLine = this.mapBox.createLineGeometry([[paths[paths.length - 2], paths[paths.length - 1]]]);
          returnPoints = returnPoints.concat(this.$map.GeometryUtils.breakLineWithFixedLength(lastSecondLine, countLength));
        }
      }

      return returnPoints;
    },

    filterFloatPoints(fixedPoints, floatPoints, countLength) {
      let allPoints = [];
      fixedPoints.forEach(fix => {
        let geo = this.mapBox.createPoint(Number(fix[0]), Number(fix[1]));
        let length = this.$map.GeometryUtils.getPointToLineStartPointLength(geo, this.lineGraphic.geometry);
        allPoints.push({
          fixFlag: true,
          geometry: geo,
          length: length,
        });
      });
      floatPoints.forEach(float => {
        let geo = this.mapBox.createPoint(Number(float[0]), Number(float[1]));
        let length = this.$map.GeometryUtils.getPointToLineStartPointLength(geo, this.lineGraphic.geometry);
        allPoints.push({
          fixFlag: false,
          geometry: geo,
          length: length,
        });
      });
      allPoints = allPoints.sort((x, y) => x.length - y.length);
      let validPoints = [];
      allPoints.forEach((currentPoint, index) => {
        if (currentPoint.fixFlag) {
          validPoints.push(currentPoint);
        } else {
          let forwardPoint = allPoints[index - 1];
          if (forwardPoint && forwardPoint.fixFlag && currentPoint.length - forwardPoint.length < countLength) {
            // 只有这种情况currentPoint才不满足条件
          } else {
            validPoints.push(currentPoint);
          }
        }
      });
      return validPoints.map(res => [res.geometry.x, res.geometry.y]);
    },

    createGeo(item, symbol, point, lengths) {
      let geometry = this.mapBox.createPoint(Number(point[0]), Number(point[1]));
      let graphic = {
        attributes: {},
        geometry: geometry,
        id: fish.getUUID(),
        layerNo: item.layerNo,
        symbol: symbol,
      };
      let [Longtiude, Latitude] = this.mapBox.map.toCoordinate([point[0], point[1]]);
      graphic.attributes.longitude = Longtiude;
      graphic.attributes.latitude = Latitude;
      this.addGraphic(item.layerNo, item.resTypeName, graphic, lengths);
    },

    addGraphic(layerNo, resTypeName, graphic, lengths) {
      Object.assign(graphic.attributes, {
        resStatus: 'C',
        projectId: this.projectInfo.projectId,
        schemaId: this.projectInfo.schemaId,
        sprintId: this.projectInfo.sprintId,
      });
      this.$map
        .addGeometry(layerNo, graphic)
        .then(res => {
          graphic = res.toJSON();
          graphic.attributes.resName = resTypeName + '-' + graphic.attributes.objectid;
          graphic.attributes.resNo = resTypeName + '-' + graphic.attributes.objectid;
          this.$map.editAttributeById(layerNo, graphic).then(res => {
            this.redoGras.push(graphic);
            this.mapBox.refreshLayer(layerNo);
            this.controlData.initSelectedStatus.componentName = 'addFormatPoint';
            this.controlData.initSelectedStatus.rightCloseFlag = false;

            this.count++;
            if (this.count === lengths) {
              fish.success(this.$t('ADD_SUCCESS'));
              let stackDepth = this.schemaConfigs.stackDepth;
              this.mapBox.addUndo(this.deleteGraphicPromise(), stackDepth);
              this.$root.$emit('changeUnDoCount', 'undo');
            }
          });
        })
        .catch(res => {
          console.log(res);
        });
    },

    deleteGraphicPromise() {
      return () => {
        return new Promise(resolve => {
          this.$map.batchDeleteGeometry(this.redoGras).then(result => {
            this.mapBox.refreshLayer(this.redoGras[0].layerNo);
            resolve(this.addGraphicPromise());
          });
        });
      };
    },

    addGraphicPromise() {
      return () => {
        return new Promise(resolve => {
          this.redoGras.forEach(res => {
            delete res.attributes.gisKey;
            delete res.attributes.objectid;
          });
          this.$map.batchAddGeometry(this.redoGras).then(result => {
            this.redoGras = result;
            this.mapBox.refreshLayer(this.redoGras[0].layerNo);
            resolve(this.deleteGraphicPromise());
          });
        });
      };
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.required-label:before {
  content: '*';
  color: #fb6e52;
  vertical-align: middle;
  margin-right: 3px;
  line-height: 1;
}
.label-class {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.addMain /deep/ .modal-body {
  height: 100%;
  padding-top: 30px;
}

.form-div {
  display: flex;
}
</style>
