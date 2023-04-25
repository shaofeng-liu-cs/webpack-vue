<template>
  <div class="topo-content">
    <TopoView ref="deviceTempTopo" :toolButtons="toolButtons" :show-toolbar="true" :graphView="graphView" :menu-source="initMenus" @click-toolbar="toolbarClick"></TopoView>
  </div>
</template>
<script>
import TopoView from '../topo-template/TopoView.vue';
import * as GlobalConst from '../../../base/utils/GlobalConst';
import { getDefaultCoreFillColor, getConnectedCoreFillColor, drawDeviceTemplateGraphics } from '../design/DrawTools';
import { loadTemplateInfo } from '../TopoHandleAction.js';

const LAYER0 = 0;
const LAYER1 = 1;
const LAYER2 = 1;
const LAYERS = [LAYER0, LAYER1, LAYER2];

export default {
  name: 'DeviceTemplateTopo',
  components: {
    TopoView,
  },
  props: {
    //paramTopo:Object,
    templateId: {
      type: String,
      default: '',
    },
  },
  model: {
    prop: 'templateId',
    event: 'input',
  },

  data() {
    return {
      dataModel: null,
      graphView: this.graphView,
      toolButtons: [],
    };
  },
  created() {
    this.dataModel = new ht.DataModel();
    this.graphView = new ht.graph.GraphView(this.dataModel);
    this.graphView.setLayers(LAYERS);
    this.graphView.enableToolTip();
    this.graphView.setMovableFunc((elem) => elem.movable);

    this.graphView.addInteractorListener((e) => {});
  },
  mounted() {
    if (this.templateId) {
      this.loadDeviceTopoList(this.templateId);
    }
  },
  methods: {
    loadDeviceTopoList(templateId) {
      if (this.dataModel) {
        this.dataModel.clear();
      }
      if (templateId) {
        loadTemplateInfo('DEVICE', templateId).then((data) => {
          if (data) {
            console.info(data);
            let topoData = this.rebuildDeviceData(data);
            this.loadTopo(topoData);
          }
        });
      }
    },

    loadTopo(topoData) {
      console.info(topoData);
      this.graphView.setZoom(1);
      this.graphView.setTranslateX(0);
      this.graphView.setTranslateY(0);
      let startX = 50; //定位
      let startY = 50; //定位
      drawDeviceTemplateGraphics(topoData, this.dataModel, startX, startY, 0);
    },

    rebuildDeviceData(tempData) {
      let deviceTemplateList = [];
      // let resSpecId = tempData.resSpecId;
      // if (resSpecId === 'F_CLOSURE') {
      //     let deviceTemplate = {};
      //     let deviceInfo = this.setDeviceData(tempData);
      //     let hardwareList = [];
      //     let portList = [];
      //     deviceTemplate.deviceData = deviceInfo;
      //     deviceTemplate.hardwareList = hardwareList;
      //     deviceTemplate.portList = portList;
      //     deviceTemplateList.push(deviceTemplate);

      //     let splitterTemplate = {};
      //     let splitterInfo = this.setDeviceData(tempData);
      //     let hardwareList1 = this.setHardwareData(tempData);
      //     let portList1 = this.setPortListData(tempData);
      //     splitterTemplate.deviceData = splitterInfo;
      //     splitterTemplate.hardwareList = hardwareList1;
      //     splitterTemplate.portList = portList1;

      //     deviceTemplateList.push(splitterTemplate);
      // } else {
      let deviceTemplate = {};
      let deviceInfo = this.setDeviceData(tempData);
      let hardwareList = this.setHardwareData(tempData);
      let portList = this.setPortListData(tempData);
      deviceTemplate.deviceData = deviceInfo;
      deviceTemplate.hardwareList = hardwareList;
      deviceTemplate.portList = portList;
      deviceTemplateList.push(deviceTemplate);
      // }

      return deviceTemplateList;
    },

    setDeviceData(tempData) {
      let deviceInfo = {};
      let confDevTemplate = tempData.confDevTemplate;

      deviceInfo.deviceId = tempData.templateId;
      deviceInfo.resSpecId = tempData.resSpecId;
      deviceInfo.name = tempData.templateName;
      deviceInfo.fullName = tempData.templateName;
      deviceInfo.colsQty = tempData.colsQty;
      deviceInfo.rowsQty = tempData.rowsQty;
      deviceInfo.colNo = tempData.colNo;
      deviceInfo.rowNo = tempData.rowNo;
      deviceInfo.members = tempData.members;
      deviceInfo.templateId = tempData.templateId;
      deviceInfo.tmplSpecId = tempData.tmplSpecId;
      if (confDevTemplate) {
        deviceInfo.name = confDevTemplate.templateName;
        deviceInfo.fullName = confDevTemplate.templateName;
      }

      return deviceInfo;
    },

    setHardwareData(tempData) {
      let hardwareList = [];
      let portList = [];
      let wareTempList = tempData.wareTemplateList || [];

      wareTempList.forEach((ware) => {
        let wareResSpecId = ware.resSpecId;
        let hardWare = {};
        hardWare.deviceId = tempData.templateId;
        hardWare.hardwareId = ware.memberId;
        hardWare.parentId = ware.parentMember;
        hardWare.name = ware.templateName;
        hardWare.seq = ware.seqInParent;
        hardWare.nameSeq = ware.seqInParent;
        hardWare.fullName = ware.templateName;
        hardWare.resSpecId = ware.resSpecId;
        hardWare.colQty = ware.colsQty;
        hardWare.rowQty = ware.rowsQty;
        hardWare.colNo = ware.colNo;
        hardWare.rowNo = ware.rowNo;
        hardWare.width = ware.width;
        hardWare.height = ware.height;
        hardWare.tmplSpecId = ware.tmplSpecId;
        let childMemberList = ware.childMemberList || [];
        hardWare.members = childMemberList.length;
        hardwareList.push(hardWare);
        if (wareResSpecId === 'CHASSIS') {
          let subWareList = this.subWareData(tempData.templateId, ware.memberId, childMemberList);
          hardwareList.concat(subWareList);
        }
      });

      return hardwareList;
    },

    subWareData(deviceId, parentId, childMemberList) {
      let hardwareList = [];
      let index = 1;
      childMemberList.forEach((ware) => {
        let hardWare = {};
        hardWare.deviceId = deviceId;
        hardWare.hardwareId = ware.memberId;
        hardWare.parentId = parentId;
        hardWare.name = ware.resSpecId + '_' + index;
        hardWare.seq = ware.seqInParent;
        hardWare.nameSeq = ware.seqInParent;
        hardWare.fullName = ware.resSpecId + '_' + index;
        hardWare.resSpecId = ware.resSpecId;
        hardWare.colQty = ware.colsQty;
        hardWare.rowQty = ware.rowsQty;
        hardWare.colNo = ware.colNo;
        hardWare.rowNo = ware.rowNo;
        hardWare.width = ware.width;
        hardWare.height = ware.height;
        hardWare.tmplSpecId = ware.tmplSpecId;
        hardWare.members = ware.members;
        hardwareList.push(hardWare);
        index++;
      });
      return hardwareList;
    },

    setPortListData(tempData) {
      let hardwareList = [];
      let portList = [];
      let wareTempList = tempData.wareTemplateList || [];
      let portTempList = tempData.portTemplateList || [];
      let wIndex = 0;
      if (wareTempList.length > 0) {
        wareTempList.forEach((ware) => {
          let childMemberList = ware.childMemberList || [];
          let pIndex = 1;
          let members = childMemberList.length;
          if (members > 0) {
            childMemberList.forEach((childMember) => {
              let childResSpecId = childMember.resSpecId;
              if (
                childResSpecId.indexOf('port') > 0 ||
                childResSpecId.indexOf('PORT') > 0 ||
                childResSpecId.indexOf('CONNECT') > 0 ||
                childResSpecId.indexOf('SPL_PORT') > 0
              ) {
                let index = wIndex * members + pIndex;
                let port = {};
                port.deviceId = tempData.templateId;
                port.portId = childMember.memberId + '_' + index;
                port.resSpecId = childMember.resSpecId;
                port.hardwareId = ware.memberId;
                port.hardwareSpecId = ware.resSpecId;
                port.name = ware.templateName + '/' + childMember.seqInTmpl.toString();
                port.fullName = ware.templateName + '/' + childMember.seqInTmpl.toString();
                port.seq = childMember.seqInTmpl;
                port.nameSeq = childMember.seqInTmpl;
                port.colNo = childMember.colNo;
                port.rowNo = childMember.rowNo;
                port.parentId = '0';
                port.tmplSpecId = childMember.tmplSpecId;
                port.portUse = this.getPortUse(childMember);
                portList.push(port);
                pIndex++;
              }
            });
            wIndex++;
          }
        });
      } else {
        portTempList.forEach((portTemp) => {
          let port = {};
          port.deviceId = tempData.templateId;
          port.portId = portTemp.memberId;
          port.resSpecId = portTemp.resSpecId;
          port.hardwareId = null;
          port.hardwareSpecId = null;
          port.name = portTemp.seqInTmpl.toString();
          port.fullName = portTemp.seqInTmpl.toString();
          port.seq = portTemp.seqInTmpl;
          port.nameSeq = portTemp.seqInTmpl;
          port.colNo = portTemp.colNo;
          port.rowNo = portTemp.rowNo;
          port.parentId = '0';
          port.tmplSpecId = portTemp.tmplSpecId;
          port.portUse = this.getPortUse(portTemp);
          portList.push(port);
        });
      }

      return portList;
    },

    getPortUse(portTemp) {
      let portUse = -1;
      let attrValueDTOList = portTemp.attrValueDTOList || [];
      let attrValue = attrValueDTOList.filter((item) => item.attrCode === 'PORT_USE');
      if (attrValue.length > 0) {
        portUse = attrValue[0].attrValue;
      }
      return portUse;
    },

    refreshTopo() {
      this.graphView.fitContent();
      this.graphView.zoomReset();
    },

    initMenus(selectedDatas) {
      let menus = [];
      return menus;
    },
    toolbarClick(eventName) {},
  },
  watch: {
    templateId: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.loadDeviceTopoList(val);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../topo-template/scss/topoTemplate.scss';
</style>
