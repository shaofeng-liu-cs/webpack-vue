import { GeometryType } from 'map';

export default {
  inject: ['getResourceList', 'getMapBox'],
  computed: {
    resList() {
      const resTypeList = this.getResourceList();
      return resTypeList.filter(res => res.layerType === 'C');
    },
    mapBox() {
      return this.getMapBox();
    },
  },
  mounted() {
    this.initData();
  },
  data() {
    return {
      facilityLine: [], // ['AIR_WIRE', 'PIPELINE_G']
      spaceResGroup: [], // ['SITE'];
      cableResGroup: ['C_CABLE', 'F_CABLE'],
      facilityPoint: [], // ['MANHOLE', 'POLE'];
      fiberDeviceGroup: [], // ['OCC', 'ODB', 'F_CLOSURE', 'ODF', 'OLT', 'ONU', 'SPLITTER'];
      copperDeviceGroup: [], // ['CC', 'DB', 'MDF'];//电设备(铜设备)
    };
  },
  methods: {
    initData() {
      this.facilityLine = this.resList
        .filter(res => {
          if (res.resGroup === 'Pipeline Network') {
            const obj = this.mapBox.findLayer(res.layerNo);
            if (obj.geometryType === GeometryType.POLYLINE) {
              return true;
            }
          }
          return false;
        })
        .map(layer => layer.resType);

      this.spaceResGroup = this.resList.filter(res => res.resGroup === 'Location').map(layer => layer.resType);

      this.facilityPoint = this.resList
        .filter(res => {
          if (res.resGroup === 'Pipeline Network') {
            const obj = this.mapBox.findLayer(res.layerNo);
            if (obj.geometryType === GeometryType.POINT) {
              return true;
            }
          }
          return false;
        })
        .map(layer => layer.resType);

      this.fiberDeviceGroup = this.resList
        .filter(res => {
          if (res.resGroup === 'PON Network' || res.resGroup === 'Fiber Network') {
            const obj = this.mapBox.findLayer(res.layerNo);
            if (obj.geometryType === GeometryType.POINT) {
              return true;
            }
          }
          return false;
        })
        .map(layer => layer.resType);

      this.copperDeviceGroup = this.resList
        .filter(res => {
          if (res.resGroup === 'Copper Network') {
            const obj = this.mapBox.findLayer(res.layerNo);
            if (obj.geometryType === GeometryType.POINT) {
              return true;
            }
          }
          return false;
        })
        .map(layer => layer.resType);
    },

    isFacilityLine(resType) {
      return this.facilityLine.indexOf(resType) >= 0;
    },
    isCable(resType) {
      return this.cableResGroup.indexOf(resType) >= 0;
    },
    isFacilityPoint(resType) {
      return this.facilityPoint.indexOf(resType) >= 0;
    },
    isDevice(resType) {
      return this.isFiberDevice(resType) || this.isCopperDevice(resType);
    },
    isFiberDevice(resType) {
      return this.fiberDeviceGroup.indexOf(resType) >= 0;
    },
    isCopperDevice(resType) {
      return this.copperDeviceGroup.indexOf(resType) >= 0;
    },
    isSite(resType) {
      return this.spaceResGroup.indexOf(resType) >= 0;
    },
    getFacilityLine() {
      return this.facilityLine;
    },
    getFacilityGroup() {
      return this.facilityPoint;
    },
    getPutSectionGroup() {
      return [...this.spaceResGroup, ...this.facilityPoint, ...this.fiberDeviceGroup, ...this.copperDeviceGroup];
    },
    getNormalDeviceGroup() {
      return [...this.fiberDeviceGroup, ...this.copperDeviceGroup];
    },
    getFiberDeviceGroup() {
      return this.fiberDeviceGroup;
    },
    getcopperDeviceGroup() {
      return this.copperDeviceGroup;
    },
    getResTypeIdByLayerNo(layerNo) {
      const type = this.resList.find(res => res.layerNo === layerNo);
      return type && type.resType ? type.resType : '';
    },
    getLayerNameByLayerNo(layerNo) {
      const type = this.resList.find(res => res.layerNo === layerNo);
      return type && type.layerName ? type.layerName : '';
    },
    getLayerNoByResTypeId(resType) {
      const type = this.resList.find(res => res.resType === resType);
      return type && type.layerNo ? type.layerNo : '';
    },
    transferGraphics(graphics) {
      return graphics.map(graphic => {
        const { attributes } = graphic;
        return {
          resId: attributes.resId,
          resName: attributes.resName,
          resNo: attributes.resNo,
          geometry: graphic.geometry,
          gisKey: attributes.gisKey,
          layerNo: graphic.layerNo,
          resType: this.getResTypeIdByLayerNo(graphic.layerNo),
        };
      });
    },
  },
};
