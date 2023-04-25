<template>
  <div class="info-panel" ref="draggable" v-if="controlData.popupName === 'infoPanel'">
    <div class="search-info">
      <div class="info-head">
        <div>
          <div :class="{ active: contentType === 'RESOURCE', disabled: !resShow }" data-name="RESOURCE" @click="contentTap">{{ $t('RESOURCE') }}
          </div>
          <div :class="{ active: contentType === 'GIS', disabled: !gisShow }" data-name="GIS" @click="contentTap">{{ $t('OSP_MAP_SEARCHBAR_ITEM_GIS') }}
          </div>
          <div :class="{ active: contentType === 'BUILDING'}" v-if="isDPModel" data-name="BUILDING" @click="contentTap">{{ $t('OSP_MAP_SEARCHBAR_ITEM_BUILDING') }}
          </div>
          <!-- <div :class="{ active: contentType === 'OTHER'}" data-name="OTHER" @click="showUrlContent()">Url </div> -->
        </div>
        <div class="icon_osp icon_ospleft" @click="backFn" v-if="back">{{ $t('BACK') }}</div>
        <span class="icon_osp icon_ospclose" @click="close" v-else></span>
      </div>
      <div class="info-content" v-if="gisShow && contentType === 'GIS'">
        <div>
          <div class="info-number" style="backgroundImage: url('oss_core/edesign/assets/image/bgimg/marker.png')">{{ number }}
          </div>
          <div class="info-type" :title="dataInfo.CloudGraphic.resType">
            {{ dataInfo.CloudGraphic.resTypeName }}
          </div>
          <div class="info-name" :title="this.resLabelField === 'resName' ? dataInfo.CloudGraphic.attributes.resName: dataInfo.CloudGraphic.attributes.resNo">
            <div class="name-div">{{ this.resLabelField === 'resName' ? dataInfo.CloudGraphic.attributes.resName : dataInfo.CloudGraphic.attributes.resNo }}</div>
            <div class="status-div" v-if="statusLabel" :title="statusLabel">{{statusLabel}}</div>
          </div>
          <div class="info-save" @click="save(dataInfo.CloudGraphic)">{{ $t('SAVE') }}
          </div>
        </div>
        <!--图片展示-->
        <div class="info-form esurvey-img-popup" v-if="isShowSurveyPhoto">
          <div class="filter-title">
            <h5>{{ $t('OSP_MAP_SEARCHBAR_ITEM_SYUVEY_PHOTOS') }}</h5>
            <div class="glyphicon glyphicon-new-window new-window" @click="previewImg('0')"></div>
          </div>
          <div class="img-popup-cons" v-if="surveyImgList.length>0">
            <div class="img-popup-imgcons">
              <img class="imgs-survey" v-for="(item, index) in surveyImgList" @click="previewImg(index)" :key="index" :src='`opb/file/download?fileName=${item.docPath}`' />
            </div>
          </div>
          <div class="img-null" v-else>
            <div class="null-desc">{{ $t('NULL_IMAGE') }}</div>
          </div>
        </div>
        <div class="info-form">
          <div class="filter-title">
            <h5>{{ $t('PROPERTIES') }}</h5>
            <div class="glyphicon glyphicon-new-window new-window" @click="moreInfo"></div>
          </div>
          <form class="form-horizontal" ref="saveForm">
            <div v-for="(attr, index) in attrInfoListEnd" :key="index + attr.attrName" :style="{ order: attr.dispSeq }">
              <label :title="attr.attrDesc">{{ attr.attrDesc }}</label>
              <input class="form-control" :name="attr.attrName" v-model="attributes[attr.attrName]" :placeholder="attr.controlFlag === '2'||isDisable ? '' : 'Please input content'" v-if="attr.controlType === '1'" :disabled="isDisable ? isDisable : attr.disabled" :type="attr.dataType === 'N' ? 'number' : 'text'" />
              <input class="form-control" :name="attr.attrName" v-model="attributes[attr.attrName]" :placeholder="attr.controlFlag === '2' ? '' : 'date'" v-else-if="attr.controlType === '2'" :disabled="isDisable ? isDisable : attr.disabled" :type="attr.dataType === 'N' ? 'number' : 'text'" />
              <Combobox :name="attr.attrName" v-model="attributes[attr.attrName]" :setting="{ dataTextField: 'valueDesc', dataValueField: 'attrValue', dataSource: attr.attrValuesDTOS, value: attr.initValue}" v-else-if="attr.controlType === '3'" :disabled="isDisable ? isDisable :attr.disabled"></Combobox>
            </div>
          </form>
        </div>
      </div>
      <div class="info-content" v-if="contentType === 'BUILDING'">
        <div>
          <div class="info-number" style="backgroundImage: url('oss_core/edesign/assets/image/bgimg/marker.png')">{{ number }}
          </div>
          <div class="info-type" :title="buildingDataInfo.CloudGraphic.resType">
            {{ buildingDataInfo.CloudGraphic.resTypeName }}
          </div>
          <div class="info-name" :title="this.resLabelField === 'resName' ? buildingDataInfo.CloudGraphic.attributes.resName : buildingDataInfo.CloudGraphic.attributes.resNo">
            {{ this.resLabelField === 'resName' ? buildingDataInfo.CloudGraphic.attributes.resName : buildingDataInfo.CloudGraphic.attributes.resNo }}
          </div>
          <div class="info-save" @click="save(dataInfo.CloudGraphic)" :class="projectInfo.markFlag === 'sprint' ? 'notClick' : ''">{{ $t('SAVE') }}
          </div>
        </div>
        <div class="info-form">
          <div class="filter-title">
            <h5>{{ $t('PROPERTIES') }}</h5>
            <div class="glyphicon glyphicon-new-window new-window" @click="moreInfo"></div>
          </div>
          <form class="form-horizontal" ref="saveForm">
            <div v-for="(attr, index) in buildingAttrInfoList" :key="index + attr.attrName" :style="{ order: attr.dispSeq }">
              <label :title="attr.attrDesc">{{ attr.attrDesc }}</label>
              <input class="form-control" :name="attr.attrName" v-model="buildingAttributes[attr.attrName]" :placeholder="attr.controlFlag === '2' ? '' : 'Please input content'" v-if="attr.controlType === '1'" :disabled="attr.disabled" :type="attr.dataType === 'N' ? 'number' : 'text'" />
              <input class="form-control" :name="attr.attrName" v-model="buildingAttributes[attr.attrName]" :placeholder="attr.controlFlag === '2' ? '' : 'date'" v-else-if="attr.controlType === '2'" :disabled="attr.disabled" :type="attr.dataType === 'N' ? 'number' : 'text'" />
              <Combobox :name="attr.attrName" v-model="buildingAttributes[attr.attrName]" :setting="{ dataTextField: 'valueDesc', dataValueField: 'attrValue', dataSource: attr.attrValuesDTOS, value: attr.initValue }" v-else-if="attr.controlType === '3'" :disabled="attr.disabled"></Combobox>
            </div>
          </form>
        </div>
      </div>
      <div class="info-content" v-if="resShow && contentType === 'RESOURCE'">
        <div>
          <div class="info-number">{{ number }}</div>
          <div class="info-type" :title="dataInfo.CloudGraphic.resType">
            {{ dataInfo.CloudGraphic.resTypeName }}
          </div>
          <div class="info-name" :title="this.resLabelField === 'resName' ? dataInfo.CloudGraphic.attributes.resName: dataInfo.CloudGraphic.attributes.resNo">
            <div class="name-div">{{ this.resLabelField === 'resName' ? dataInfo.CloudGraphic.attributes.resName : dataInfo.CloudGraphic.attributes.resNo }}</div>
            <div class="status-div" v-if="statusLabel" :title="statusLabel">{{statusLabel}}</div>
          </div>
          <!-- <div class="info-name" :title="dataInfo.resName">{{ dataInfo.name }}</div> -->
        </div>
        <div class="info-list" v-if="dataInfo.resType === 'F_CABLE' || dataInfo.resType === 'C_CABLE'">
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_CORES') }} :</div>
            <div>{{ dataInfo.coreCount }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_TEMPLATE') }} :</div>
            <div>{{ dataInfo.templateIdDesc }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_MODEL') }} :</div>
            <div>{{ dataInfo.modelIdDesc }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_VENDOR') }} :</div>
            <div>{{ dataInfo.vendorCode }}</div>
          </div>
        </div>
        <div class="info-list" v-else-if="dataInfo.resType === 'MANHOLE' || dataInfo.resType === 'POLE' || dataInfo.resType === 'AIR_WIRE'">
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_TEMPLATE') }} :</div>
            <div>{{ dataInfo.templateIdDesc }}</div>
          </div>
        </div>
        <div class="info-list" v-else-if="dataInfo.resType === 'PIPELINE_G'">
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_HOLES') }} :</div>
            <div>{{ dataInfo.pipeBlockCount }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_SUBHOLES') }} :</div>
            <div>{{ dataInfo.pipeHoleCount }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_TEMPLATE') }} :</div>
            <div>{{ dataInfo.templateIdDesc }}</div>
          </div>
        </div>
        <div class="info-list" v-else>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_CAPACITY') }} :</div>
            <div>{{ dataInfo.capacity }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_TEMPLATE') }} :</div>
            <div>{{ dataInfo.templateIdDesc }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_MODEL') }} :</div>
            <div>{{ dataInfo.modelIdDesc }}</div>
          </div>
          <div>
            <div>{{ $t('OSP_MAP_SEARCHBAR_INFO_VENDOR') }} :</div>
            <div>{{ dataInfo.vendorCode }}</div>
          </div>
        </div>
        <!--图片展示-->
        <div class="img-popup">
          <div class="img-popup-con">
            <div class="img-popup-img">
              <div class="img-popup-imgcon" v-for="(item, index) in dataInfo.imgList" :key="index">
                <img :src="item.url" />
                <div class="img-del icon_osp icon_ospclose" @click="fileDel(item.docId, 'SUMMARY_PIC', index)"></div>
              </div>
              <div class="img-popup-imgcon" v-if="dataInfo.imgList.length === 0">
                <img :src="`oss_core/edesign/assets/image/map/search/res/${dataInfo.resType}.jpg`" onerror="this.src='oss_core/edesign/assets/image/map/search/res/GRID.jpg';this.onerror=null" />
              </div>
              <div class="img-add">
                <div class="icon_osp icon_ospfangda"></div>
                <div>{{ $t('ADD_IMAGE') }}</div>
                <input type="file" accept="image/bmp, image/jpeg, image/png, image/jpg" @change="chooseImage" />
              </div>
            </div>
          </div>
        </div>
        <!-- 上传附件 -->
        <div class="general">
          <div>
            <div class="btn btn-primary general-upload">
              <div class="icon_osp icon_osptijiao"></div>
              <div>{{ $t('UPLOAD') }}</div>
              <input type="file" @change="chooseGeneral" />
            </div>
            <div>{{ $t('FILE_TYPE') }}: {{ allFile.join(', ') }};</div>
          </div>
          <div class="general-list">
            <ul>
              <li v-for="(item, index) in dataInfo.generalList" :key="index">
                <div>{{ item.docAlias }}</div>
                <a :href="item.url" download="" class="icon_osp icon_ospxiazai"></a>
                <div class="icon_osp icon_ospclose" @click="fileDel(item.docId, 'GENERAL', index)"></div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <Function :params="functionParams" :isDisable="isDisable" ref="funcitonView" @changeAttributes="changeAttributes" v-on="$listeners" v-if="['GIS', 'RESOURCE', 'BUILDING'].indexOf(contentType) > -1 && projectInfo.viewType !== 'view'"></Function>
  </div>
</template>

<script>
import PhotoViewer from 'photoviewer';
import Function from '../../function/Function.vue';
import ResHandler from '@/oss_core/edesign/osp/domain/ResHandler';
import { queryAttrDtosInfo } from '@/oss_core/edesign/api/query/resType.js';
import { querySurveyPhotos } from '@/oss_core/edesign/api/query/gisKey.js';

export default {
  components: {
    Function,
  },
  mixins: [ResHandler],
  inject: ['getMapBox', 'getResTypeAttrDtos', 'getProjectInfo', 'getControlData', 'getResLabelField', 'getSurfaceLayerList'],
  computed: {
    projectInfo() {
      return this.getProjectInfo();
    },
    mapBox() {
      return this.getMapBox();
    },
    resTypeAttrDtos() {
      return this.getResTypeAttrDtos();
    },
    controlData() {
      return this.getControlData();
    },
    resLabelField() {
      return this.getResLabelField();
    },
    surfaceList() {
      return this.getSurfaceLayerList();
    },
  },
  data() {
    return {
      attributes: {
        resId: '',
      }, //gis的节点信息
      gisShow: true, //是否展示gis面板信息
      resShow: true, //是否展示资源面板信息
      // isSingleChoose: false,
      back: false, // 是否能返回列表页
      number: 1, // 列表中的第几个,
      clickType: '', //入口类型
      // text: '',
      dataInfo: {}, //所有数据
      attrInfoList: [], //每个属性的详细信息
      contentType: 'GIS', //当前展示哪个面板信息
      uploader: {}, //文件上传
      fileType: [], //文件类型
      uploaderType: '', //上传类型 CATEGORY 附件类型取值如下，GENERAL: 通用附件，默认值;SUMMARY_PIC: 资源的展示面板图片，SURVEY: 工勘附件，ROLL-OUT: 施工附件
      isDPModel: false, //是否是建筑物资源
      buildingDataInfo: {}, //建筑物信息
      buildingAttrInfoList: [],
      buildingAttributes: {},
      imageFile: ['jpg', 'png', 'bmp'],
      allFile: ['jpg', 'png', 'bmp', 'pdf', 'zip', 'dwg', 'doc', 'docx', 'xls', 'xlsx'],
      functionParams: {}, //入参function组件入参,
      statusLabel: '',
      surveyImgList: [], // 工勘照片列表
      attrInfoListEnd: [], // 属性列表
      isShowSurveyPhoto: false, // 是否展示工勘照片
      isDisable: '', // 属性展示是否可编辑
    };
  },
  created() {},
  mounted() {
    this.initWebUploader(); // 初始上传插件
    this.$root.$on('afterSelection', this.changeAttributesByList); //更新面板属性值
    this.$root.$on('changeAttributes', this.changeAttributes); //更新面板属性值
  },
  methods: {
    // 初始化函数
    queryAttrInfo(item, back, number, clickType, isDisable) {
      this.isDisable = isDisable;
      this.isDPModel = false;
      if (item.CloudGraphic.resType === 'A5') {
        this.isDPModel = true;
        let filter = this.$map.Filter.equalTo({
          propertyName: 'gisKey',
          expression: item.CloudGraphic.attributes.buildingGisId,
        });
        let feature = {
          layerNo: item.CloudGraphic.attributes.buildingLayerNo,
          filter: filter,
        };
        this.$map.getByFeatureLayer(feature).then(result => {
          if (result && result.length === 1) {
            let findRes = this.surfaceList.find(res => res.layerNo === item.CloudGraphic.attributes.buildingLayerNo);
            if (findRes) {
              result[0].resType = findRes.resType;
              result[0].resTypeName = findRes.resTypeName;
              result[0].relaResType = findRes.relaResType;
            }
            this.buildingDataInfo = {
              CloudGraphic: result[0],
            };
            let keys = Object.keys(result[0].attributes);
            let attrs = keys.map(key => {
              return {
                attrDesc: key,
                attrName: key,
                attrId: key,
                controlFlag: '2',
                disabled: true,
                controlType: '1',
                dataLen: 128,
                dataType: 'S',
                resType: result[0].layerNo,
                state: 'A',
              };
            });
            this.buildingAttrInfoList = JSON.parse(JSON.stringify(attrs));
            this.initBuildingAttributes();
          }
        });
      }
      this.controlData.popupName = 'infoPanel';
      this.contentType = 'RESOURCE';
      this.attributes = {};
      this.back = back;
      this.number = number;
      this.initStatusLabel(item.CloudGraphic.attributes);
      this.dataInfo = item;
      let isSurface = this.surfaceList.filter(item => item.resType === this.dataInfo.CloudGraphic.resType);
      if (isSurface.length > 0) {
        this.isShowSurveyPhoto = true;
      } else {
        this.isShowSurveyPhoto = false;
      }
      this.clickType = clickType;
      this.gisShow = !!item.CloudGraphic;
      this.resShow = !!item.resType;
      // this.functionList = [];
      // this.$refs.funcitonView.getFunctionList();
      let queryLayerNo = '';
      if (this.gisShow) {
        if (clickType === 'search') {
          this.$emit('centerGeometries', item.CloudGraphic);
        }
        queryLayerNo = this.dataInfo.CloudGraphic.layerNo;
      } else {
        queryLayerNo = item.layerNo;
      }
      if (this.surfaceList.map(res => res.layerNo).indexOf(queryLayerNo) > -1) {
        queryLayerNo = this.dataInfo.CloudGraphic.resType;
      }
      this.functionParams = {
        layerNo: queryLayerNo,
        dataInfo: this.dataInfo,
        projectInfo: this.projectInfo,
      };
      if (this.dataInfo.CloudGraphic) {
        this.contentType = 'GIS';
        let keys = Object.keys(this.dataInfo.CloudGraphic.attributes);
        if (this.dataInfo.CloudGraphic.surfaceFlag === 'otherSurfaceLayer') {
          let attrs = keys.map(key => {
            return {
              attrDesc: key,
              attrName: key,
              attrId: key,
              controlFlag: '2',
              disabled: true,
              controlType: '1',
              dataLen: 128,
              dataType: 'S',
              resType: this.dataInfo.CloudGraphic.layerNo,
              state: 'A',
            };
          });
          this.attrInfoList = JSON.parse(JSON.stringify(attrs));
          this.initAttributes();
        } else {
          let data = this.resTypeAttrDtos[this.dataInfo.CloudGraphic.resType];
          if (!data) {
            queryAttrDtosInfo(this.dataInfo.CloudGraphic.resType).then(data => {
              if (data && data.attrDTOS) {
                // 没有配的gis属性也展示，只是不可编辑
                // keys.forEach(singleGis => {
                //     let findRes = data.attrDTOS.find(res => res.attrName === singleGis);
                //     if (!findRes) {
                //         data.attrDTOS.push({
                //             attrDesc: singleGis,
                //             attrName: singleGis,
                //             attrId: singleGis,
                //             controlFlag: '2',
                //             disabled: true,
                //             controlType: '1',
                //             dataLen: 128,
                //             dataType: 'S',
                //             resType: this.dataInfo.CloudGraphic.layerNo,
                //             state: 'A',
                //         })
                //     }
                // })
                this.resTypeAttrDtos[this.dataInfo.CloudGraphic.resType] = data.attrDTOS;
                this.attrInfoList = data.attrDTOS.filter(item => item.controlFlag !== '3');
                this.updatePropertiesStatus();
                this.initAttributes();
              }
            });
          } else {
            this.attrInfoList = data.filter(item => item.controlFlag !== '3');
            this.updatePropertiesStatus();
            this.initAttributes();
          }
        }
      } else {
        this.contentType = 'RESOURCE';
      }
      this.initSurveyPhotos(item.CloudGraphic.attributes.gisKey);
      // 信息面板可拖拽
      this.$nextTick(() => {
        $(this.$refs.draggable).draggable({
          // containment: '.map-container',
          cursor: 'move',
          handle: '.info-head',
        });
      });
    },
    initSurveyPhotos(data) {
      querySurveyPhotos(data).then(res => {
        console.log(res);
        if (res.length > 0) {
          this.surveyImgList = res.map(item => {
            return { docPath: item.docPath, docName: item.docName };
          });
        }
      });
    },
    previewImg(tIndex) {
      let newList = [];
      this.surveyImgList.forEach((item, index) => {
        let obj = {
          src: `opb/file/download?fileName=${item.docPath}`,
          title: `第${index + 1}张${item.docName}`,
        };
        newList.push(obj);
      });
      var options = {
        index: tIndex, // this option means you will start at first image
      };
      var viewer = new PhotoViewer(newList, options);
    },
    initValueFunction(attr) {
      let value = this.dataInfo.CloudGraphic.attributes[attr.attrName] || '';
      if (attr.attrName === 'longitude' || attr.attrName === 'latitude') {
        if (value && attr.precision) {
          // 数值精度调整
          let oldStr = value.toString();
          let filterCount = oldStr.indexOf('.') > -1 ? parseInt(attr.precision) + 1 : parseInt(attr.precision);
          if (oldStr.indexOf('-') > -1) {
            filterCount += 1;
          }
          value = Number(oldStr.substring(0, filterCount));
        }
      }

      return value;
    },

    initAttributes() {
      let attributes = {};
      this.attrInfoListEnd = [];
      this.attrInfoList.forEach((attr, index) => {
        attributes[attr.attrName] = this.initValueFunction(attr);
        // 如果该属性不可编辑且为空则不显示
        if (attr.controlFlag === '1' || attributes[attr.attrName] !== '') {
          this.attrInfoListEnd.push(attr);
        }
      });
      // 如果userQty和userQty两个属性值为空，则默认不传
      if (!attributes.gisKey) {
        delete attributes.gisKey;
      }
      if (!attributes.userQty) {
        // 建筑物如果类型设置为独栋，则用户数默认1
        if (this.dataInfo.CloudGraphic.resType === 'A1') {
          attributes.userQty = attributes.userQty ? attributes.userQty : '1';
        } else {
          delete attributes.userQty;
        }
      }
      this.attributes = Object.assign({}, this.attributes, attributes);
    },

    initBuildingAttributes() {
      let attributes = {};
      this.buildingAttrInfoList.forEach(attr => {
        attributes[attr.attrName] = this.buildingDataInfo.CloudGraphic.attributes[attr.attrName] || '';
      });
      this.buildingAttributes = Object.assign({}, this.buildingAttributes, attributes);
    },

    changeAttributes(obj) {
      if (obj.gisKey === this.attributes.gisKey) {
        if (obj && obj.layerNo) {
          this.mapBox.refreshLayer(obj.layerNo);
          if (obj.needDelLayerNo) {
            delete obj.layerNo;
            delete obj.needDelLayerNo;
          }
        }
        this.attributes = Object.assign({}, this.attributes, obj);
      }
    },

    changeAttributesByList(resultlist) {
      if (resultlist && resultlist.length > 0) {
        let infoPanelObj = resultlist.find(res => res.gisKey === this.attributes.gisKey);
        if (infoPanelObj && infoPanelObj.gisInfo) {
          this.attributes = Object.assign({}, infoPanelObj.gisInfo.graphicsAttrs);
          this.dataInfo.resType = infoPanelObj.resType;
          this.dataInfo.imgList = [];
          this.dataInfo.generalList = [];
          this.resShow = true;
          Object.assign(this.dataInfo, infoPanelObj.resInfo);
        }
      }
    },

    updatePropertiesStatus() {
      this.attrInfoList.forEach(attr => {
        if (attr.controlFlag === '2' || (!!this.dataInfo.CloudGraphic.attributes.resId && !!attr.resAttrCode && attr.resAttrCode !== null)) {
          attr.disabled = true;
        } else {
          attr.disabled = false;
        }
      });
    },

    showUrlContent() {
      this.contentType = 'OTHER';
      // this.$refs.funcitonView.functionList = [];
      fish.require(['oss_public/opb/widget/area_search_pub/views/AreaSearchPub'], aDialog => {
        let options = {
          id: '11112',
          mapcontainer: this.mapBox,
        };
        this.dialogView = new aDialog(options);
        document.getElementById('info-content-v9').appendChild(this.dialogView.el);
      });
    },

    contentTap(e) {
      let name = e.target.dataset.name;
      if (name !== this.contentType) {
        this.contentType = name;
      }
    },

    initStatusLabel(attributes) {
      let finalLabel = '';
      if (attributes.beRefFlag === 'Y') {
        finalLabel = '[Be-Referenced]';
      } else if (attributes.sourceFlag === 'R') {
        // let schemaObj = this.allSchemaList.find(schema => schema.schemaId === attributes.refSchemaId);
        // finalLabel = schemaObj ? `[Reference From ${schemaObj.name}]` : '[Reference]';
      } else if (attributes.sourceFlag === 'U') {
        finalLabel = '[Reuse]';
      }

      if (attributes.resStatus === 'A') {
        finalLabel = '[In-Service]';
      }
      this.statusLabel = finalLabel;
    },
    backFn() {
      this.controlData.popupName = 'resultPanel';
    },
    close() {
      this.controlData.popupName = '';
    },
    chooseImage(e) {
      // 上传图片
      this.uploaderType = 'SUMMARY_PIC';
      this.fileType = this.imageFile;
      let files = e.target.files;
      this.uploader.addFiles(files); //添加到上传文件队列中
      e.target.value = '';
    },
    chooseGeneral(e) {
      // 上传附件
      this.uploaderType = 'GENERAL';
      this.fileType = this.allFile;
      let files = e.target.files;
      this.uploader.addFiles(files); //添加到上传文件队列中
      e.target.value = '';
    },
    fileDel(id, type, index) {
      fish.remove({
        url: `edesign/rivt/attachment/${id}/attach/v1`,
        success: data => {
          if (type === 'SUMMARY_PIC') {
            this.dataInfo.imgList.splice(index, 1);
          } else {
            this.dataInfo.generalList.splice(index, 1);
          }
        },
      });
    },
    initWebUploader() {
      let webuploader = require('webuploader');
      this.uploader = webuploader.create({
        swf: 'frm/fish-desktop/third-party/fileupload/fish.fileupload',
        server: portal.appGlobal.attributes.webroot + '/edesign/file/upload?moduleName=edn&date=true&temporary=true', //上传接口地址
      });

      //文件加入队列前的回调函数
      this.uploader.on('beforeFileQueued', file => {
        if (!this.checkFileValid(file.ext)) {
          fish.info(file.name + ': ' + this.$t('OSP_MAP_SEARCHBAR_INFO_MSG_WRONG_FILE'));
          return false; // 文件后缀校验
        } else {
          return true;
        }
      });
      //当文件被加入队列以后触发。
      this.uploader.on('fileQueued', file => {
        this.uploader.upload();
      });
      this.uploader.on('filesQueued', files => {
        this.uploader.upload();
      });
      // 文件上传过程中
      this.uploader.on('uploadProgress', (file, percentage) => {
        $.blockUI({
          message: this.$t('LOADING'),
        }); // loading
      });
      // 文件上传成功
      this.uploader.on('uploadSuccess', (file, response) => {
        this.postFile(response);
        $.unblockUI(); //  loading
        fish.toast('success', this.$t('UPLOAD_SUCCESS'));
      });
      //文件上传错误
      this.uploader.on('uploadError', (file, reason) => {
        $.unblockUI(); //  loading
        fish.error(reason);
      });
      //文件上传完成
      this.uploader.on('uploadComplete', (file, response) => {
        this.uploader.removeFile(file, true);
      });
    },
    //校验文件类型
    checkFileValid(fileExt) {
      var flag = false;
      this.FILE_EXT_LIST = this.fileType;
      for (var i = 0; i < this.fileType.length; i++) {
        if (this.fileType[i] === fileExt.toLowerCase()) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    postFile(reason) {
      fish.post({
        url: 'edesign/rivt/attachment/singleattach/v1',
        data: {
          category: this.uploaderType,
          objType: this.dataInfo.resType,
          objId: this.dataInfo.resId,
          docAlias: reason.fileName,
          localName: reason.fileName,
          fullPath: reason.filePath,
          fileSize: reason.fileSize,
          docId: reason.fileId,
        },
        success: data => {
          data.url = 'edesign/file/download?fileName=' + encodeURIComponent(data.fullPath + '/' + data.docAlias);
          if (data.category === 'SUMMARY_PIC') {
            this.dataInfo.imgList.push(data);
          } else {
            this.dataInfo.generalList.push(data);
          }
        },
      });
    },
    save(CloudGraphic) {
      let layerNo = CloudGraphic.layerNo;
      // 如果是临时图层，要取到其对应的建筑物或者道路图层进行更新
      if (CloudGraphic.layerNo === 'demandBuilding') {
        layerNo = CloudGraphic.attributes.reLayerNo;
        CloudGraphic = new this.$map.Graphic(CloudGraphic.id, layerNo, CloudGraphic.geometry.clone(), null, CloudGraphic.attributes);
      }
      if (CloudGraphic.attributes.gisKey) {
        this.$map.updateGeometryById(layerNo, CloudGraphic).then(data => {
          this.dataInfo.CloudGraphic.attributes = this.attributes;
          this.mapBox.refreshLayer(layerNo);
          // this.$emit("initSelectEvent", false);
          fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
        });
      } else {
        fish.toast('success', this.$t('SAVE_SUCCESS') + '!');
      }
    },

    filterLineBySortedPoints(lines, points) {
      let newLines = [];
      lines.forEach(res => {
        let aGisKey = res.attributes.aGisKey;
        let zGisKey = res.attributes.zGisKey;
        let validLineFlag = false;
        points.forEach((point, index) => {
          if (index !== points.length - 1) {
            let startPointId = point.attributes.gisKey;
            let endPointId = points[index + 1].attributes.gisKey;
            if ((startPointId === aGisKey && endPointId === zGisKey) || (startPointId === zGisKey && endPointId === aGisKey)) {
              validLineFlag = true;
            }
          }
        });
        if (validLineFlag) {
          newLines.push(res);
        }
      });
      return newLines;
    },
    moreInfo() {
      this.$root.$emit('property', [this.dataInfo.CloudGraphic]);
    },
    centerResult() {
      document.getElementsByClassName('form-horizontal')[0].scrollTop = 1000;
    },
  },
  watch: {
    attributes: {
      deep: true,
      immediate: false,
      handler(val, old) {
        this.dataInfo.CloudGraphic.attributes = val;
        this.$refs.funcitonView && this.$refs.funcitonView.updateFunctionStatus();
        this.updatePropertiesStatus();
      },
    },
  },
  destroyed() {
    this.$root.$off('afterSelection', this.changeAttributesByList); //更新面板属性值
    this.$root.$off('changeAttributes', this.changeAttributes); //更新面板属性值
  },
};
</script>

<style lang="scss" scoped>
@import './infoPanel.scss';
</style>
