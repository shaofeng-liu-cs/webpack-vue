<!--
 * @Author: your name
 * @Date: 2020-12-11 14:48:59
 * @LastEditTime: 2022-08-08 15:52:32
 * @LastEditors: HongAnDing
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\lldDesign\lldDesign.vue
-->
<template>
  <div class="lld-design-content">
    <div class="v9-transition" :class="{ routeShow }" ref="route">
      <h3>{{ $t('ROUTE_TOPO') }}</h3>
      <!-- <h3> {{ $t('ROUTE_TOPO') }} <span class="icon_osp icon_ospup v9-transition" @click="routeShowSwitch"></span></h3> -->
      <div class="content">
        <ResourceRouteTopo :params="lldParams" @nodeClick="routeNodeClick" ref="routeTopo"></ResourceRouteTopo>
      </div>
    </div>
    <div>
      <h3>
        {{ title }}
        <div class="icon-flag">
          <div
            class="icon_osp"
            :class="routeShow ? 'left-sprint  icon_ospdoubleleft' : 'right-sprint icon_ospdoubleright'"
            @click="routeShowSwitch"
          ></div>
        </div>
      </h3>
      <div class="content">
        <div>
          <LldResTree :resInfo="lldParams" @connection="connection" @move="move" ref="lldResTree"></LldResTree>
        </div>
        <div>
          <component
            :is="componentId"
            :ref="componentId"
            :params="lldParams"
            :topoResInfo="topoResInfo"
            @resEvent="resEvent"
            @openDeviceInnerDesign="openDeviceInnerDesign"
            @cutChange="cutChange"
            @openPortTrace="openPortTrace"
          ></component>
          <!-- <DeviceDesignTopo ref="designTopo" :topoResInfo="topoResInfo"></DeviceDesignTopo> -->
        </div>
      </div>
    </div>
    <!-- <div class="">
			<h3>{{ $t('CONNECT_DETAIL') }}</h3>
			<div>
				<ConnectDetail :deviceId.sync="projectInfo.dataInfo.resId"></ConnectDetail>
			</div>
		</div> -->
  </div>
</template>
<script>
import ResourceRouteTopo from '../../../topo/design/ResourceRouteTopo.vue';
import DeviceDesignTopo from '../../../topo/design/DeviceDesignTopo.vue';
import BuildingDesignTopo from '../../../topo/design/BuildingDesignTopo.vue';
import SiteDesignTopo from '../../../topo/design/SiteDesignTopo.vue';
import FacilityDesignTopo from '../../../topo/design/FacilityDesignTopo.vue';
import CutCableDesignTopo from '../../../topo/design/CutCableDesignTopo.vue';
import BranchPipeLineTopo from '../../../topo/design/BranchPipeline.vue';
import ManholeDesignTopo from '../../../topo/design/ManholeDesignTopo.vue';
import ConnectDetail from '../../../topo/instance/device/ConnectDetail.vue';
import LldResTree from './lldResTree/LldResTree.vue';
import PortTraceCalculate from '../../../osp/topo-control/device_design/portTraceCalculate.vue';
import { getTopoTypeByResType } from '@/oss_core/base/utils/ResourcesConfig.js';
import PipelineDesignTopo from '../../../topo/design/PipelineDesignTopo.vue';
import { innerName } from '@/oss_core/base/utils/GlobalConst.js';
import { loadSiteRoom } from '../../../topo/TopoHandleAction.js';

export default {
  //import引入的组件
  components: {
    // SchemaRoute,
    ResourceRouteTopo,
    ConnectDetail,
    LldResTree,
    DeviceDesignTopo,
    BuildingDesignTopo,
    SiteDesignTopo,
    FacilityDesignTopo,
    CutCableDesignTopo,
    BranchPipeLineTopo,
    ManholeDesignTopo,
    PortTraceCalculate,
    PipelineDesignTopo,
  },
  provide() {
    return {
      getProjectInfo: () => this.projectInfo, // 任务单工程数据
      getSiteInfo: () => this.siteInfo, //当前站点的信息
    };
  },
  props: {
    lldParams: {
      type: Object,
      default: () => {
        return {
          projectId: '',
          schemaId: '',
          resType: '',
          resId: '',
          resName: '',
          mapNo: '',
        };
      },
    },
    projectInfo: {
      type: Object,
    },
  },
  data() {
    return {
      routeShow: true,
      topoResInfo: {
        mode: 'D',
        projectId: '',
        schemaId: '',
        deviceList: [
          {
            resId: '',
            resSpecId: '',
            resName: '',
          },
        ],
        cableList: [],
        mapNo: '',
      }, //资源信息
      componentId: 'DeviceDesignTopo', //组件
      title: '', //标题
      siteInfo: {}, //站点信息
      sprintShowFlag: true,
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.connection({
      mode: 'D',
      throughCableList: [],
      connectedCableList: [],
      jumpDeviceList: [],
    });
    this.setComponent(this.lldParams.resType, this.lldParams.resName);
  },
  //方法集合
  methods: {
    setComponent(resType, resName) {
      this.title = `${this.$t('DESIGN')}(${resName})`;
      switch (resType) {
        case 'MANHOLE':
          this.componentId = 'ManholeDesignTopo';
          if (this.$refs.ManholeDesignTopo) {
            this.$refs.ManholeDesignTopo.$refs.manholeDesignTopo.portDrawer = false;
            this.$refs.ManholeDesignTopo.$refs.manholeDesignTopo.pipeDrawer = false;
            this.$refs.ManholeDesignTopo.$refs.manholeDesignTopo.roomDrawer = false;
            this.$refs.ManholeDesignTopo.$refs.manholeDesignTopo.facilityDrawer = false;
          }
          break;
        case 'POLE':
          this.componentId = 'FacilityDesignTopo';
          if (this.$refs.FacilityDesignTopo) {
            this.$refs.FacilityDesignTopo.$refs.facilityDesignTopo.portDrawer = false;
            this.$refs.FacilityDesignTopo.$refs.facilityDesignTopo.pipeDrawer = false;
            this.$refs.FacilityDesignTopo.$refs.facilityDesignTopo.roomDrawer = false;
            this.$refs.FacilityDesignTopo.$refs.facilityDesignTopo.facilityDrawer = false;
          }
          break;
        case 'SITE':
          let sitePram = {
            siteId: this.lldParams.resId,
            schemaId: this.lldParams.schemaId,
          };
          loadSiteRoom(sitePram).then(data => {
            this.siteInfo = data || {};
            this.componentId = 'SiteDesignTopo';
            if (this.$refs.SiteDesignTopo) {
              this.$refs.SiteDesignTopo.$refs.siteDesignTopo.portDrawer = false;
              this.$refs.SiteDesignTopo.$refs.siteDesignTopo.pipeDrawer = false;
              this.$refs.SiteDesignTopo.$refs.siteDesignTopo.roomDrawer = false;
              this.$refs.SiteDesignTopo.$refs.siteDesignTopo.facilityDrawer = false;
            }
          }); //查询站点信息及站点下机房

          break;
        case 'BUILDING':
          this.componentId = 'BuildingDesignTopo';
          if (this.$refs.BuildingDesignTopo) {
            this.$refs.BuildingDesignTopo.$refs.buildingDesignTopo.portDrawer = false;
            this.$refs.BuildingDesignTopo.$refs.buildingDesignTopo.pipeDrawer = false;
            this.$refs.BuildingDesignTopo.$refs.buildingDesignTopo.roomDrawer = false;
            this.$refs.BuildingDesignTopo.$refs.buildingDesignTopo.facilityDrawer = false;
          }
          break;
        case 'F_CABLE':
          this.componentId = 'CutCableDesignTopo';
          break;
        case 'PIPELINE_JOINT':
          this.componentId = 'BranchPipeLineTopo';
          break;
        case 'PIPELINE_G':
          this.componentId = 'PipelineDesignTopo';
          if (this.$refs.PipelineDesignTopo) {
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.portDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.pipeDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.roomDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.facilityDrawer = false;
          }
          break;
        case 'PIPELINE_B':
          this.componentId = 'PipelineDesignTopo';
          if (this.$refs.PipelineDesignTopo) {
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.portDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.pipeDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.roomDrawer = false;
            this.$refs.PipelineDesignTopo.$refs.pipelineDesignTopo.facilityDrawer = false;
          }
          break;
        default:
          this.componentId = 'DeviceDesignTopo';
          if (this.$refs.DeviceDesignTopo) {
            this.$refs.DeviceDesignTopo.$refs.deviceDesignTopo.portDrawer = false;
            this.$refs.DeviceDesignTopo.$refs.deviceDesignTopo.pipeDrawer = false;
            this.$refs.DeviceDesignTopo.$refs.deviceDesignTopo.roomDrawer = false;
            this.$refs.DeviceDesignTopo.$refs.deviceDesignTopo.facilityDrawer = false;
          }
          break;
      }
    },

    reloadTopoSize() {
      if (this.$refs.SiteDesignTopo) {
        this.$refs.SiteDesignTopo.refreshSize();
      } else if (this.$refs.ManholeDesignTopo) {
        this.$refs.ManholeDesignTopo.refreshSize();
      } else if (this.$refs.FacilityDesignTopo) {
        this.$refs.FacilityDesignTopo.refreshSize();
      } else if (this.$refs.PipelineDesignTopo) {
        this.$refs.PipelineDesignTopo.refreshSize();
      } else if (this.$refs.BuildingDesignTopo) {
        this.$refs.BuildingDesignTopo.refreshSize();
      } else if (this.$refs.DeviceDesignTopo) {
        this.$refs.DeviceDesignTopo.refreshSize();
      }
    },

    routeNodeClick(attrObject) {
      this.lldParams.resId = attrObject.resId;
      this.lldParams.resType = attrObject.resType;
      // this.lldParams.schemaId = this.lldParams.schemaId;
      this.lldParams.resName = attrObject.name;
      this.lldParams.isReferenced = attrObject.isReferenced;
      this.connection({
        mode: 'D',
        throughCableList: [],
        connectedCableList: [],
        jumpDeviceList: [],
      });

      this.setComponent(attrObject.resType, this.lldParams.resName);
    },

    //设备和线资源的连接处理（熔接、成端、跳接、掏接）
    connection(topoResInfo) {
      if (topoResInfo.mode === 'CUT') {
        this.componentId = 'CutCableDesignTopo';
      } else if (topoResInfo.mode === 'BRANCH') {
        this.componentId = 'CutCableDesignTopo';
      } else if (topoResInfo.mode === 'D' || topoResInfo.mode === 'PC' || topoResInfo.mode === 'CC' || topoResInfo.mode === 'DD') {
        this.componentId = 'DeviceDesignTopo';
      }

      this.topoResInfo.mode = topoResInfo.mode;
      if (topoResInfo.mode === 'DD') {
        this.topoResInfo.deviceList = [
          {
            resId: this.lldParams.resId,
            resSpecId: this.lldParams.resType,
            resName: this.lldParams.resName,
            isReferenced: false,
          },
          {
            resId: topoResInfo.jumpDeviceList[0].resId,
            resSpecId: topoResInfo.jumpDeviceList[0].resType,
            resName: topoResInfo.jumpDeviceList[0].resName,
            isReferenced: false,
          },
        ];
      } else {
        this.topoResInfo.deviceList = [
          {
            resId: this.lldParams.resId,
            resSpecId: this.lldParams.resType,
            resName: this.lldParams.resName,
            isReferenced: this.lldParams.isReferenced,
          },
        ];
      }

      this.topoResInfo.cableList = topoResInfo.throughCableList.concat(topoResInfo.connectedCableList);
      this.topoResInfo.schemaId = this.lldParams.schemaId;
      this.topoResInfo.projectId = this.lldParams.sprintId;
      this.topoResInfo.mapNo = this.lldParams.mapNo;
      // console.log(this.topoResInfo);
    },

    //设备移入移出处理
    move(deviceList, type) {
      //this.$refs.ManholeDesignTopo.loadTopo();
      if (this.$refs.ManholeDesignTopo) {
        this.$refs.ManholeDesignTopo.moveResFromManhole(deviceList, type);
      } else if (this.$refs.FacilityDesignTopo) {
        this.$refs.FacilityDesignTopo.moveResFromManhole(deviceList, type);
      } else if (this.$refs.PipelineDesignTopo) {
        this.$refs.PipelineDesignTopo.loadTopo();
      } else if (this.$refs.BuildingDesignTopo) {
        this.$refs.BuildingDesignTopo.loadTopo();
      } else if (this.$refs.SiteDesignTopo) {
        this.$refs.SiteDesignTopo.loadTopo();
      }
    },

    //设备的增删操作
    resEvent(resList, type) {
      let innerResList = [];
      resList.forEach(res => {
        if (getTopoTypeByResType(res.resType) === 'Device') {
          innerResList.push({
            resType: res.resType,
            resId: res.resId,
            resName: res.resInfo ? res.resInfo.name : '',
          });
        }
      });
      if (type === 'add') {
        this.$refs.lldResTree.addRes(innerResList, innerName);
      } else if (type === 'del') {
        this.$refs.lldResTree.delRes(innerResList, innerName);
      }
    },

    //掏接回调
    cutChange() {
      this.$refs.lldResTree.initTree(); //刷新树
      this.$refs.routeTopo.loadGraph(); //刷新路由topo
    },

    //在内部设计打开设备的内部设计
    openDeviceInnerDesign(param) {
      let menuId = 'LLD-RightDesignClickToOpenLLD' + param.resId;
      let menuTitle = 'LLD Design-' + param.resName;
      let openParams = {
        choose: 'DeviceTopo',
        lldParams: param,
      };
      this.$emit('openMenuInLldDesign', menuId, menuTitle, openParams);
    },

    openPortTrace(param) {
      let menuId = 'Device-LLD-Port-Trace' + param.portId;
      let menuTitle = 'Port Trace';
      let openParams = {
        choose: 'PortTraceTopo',
        portParams: param,
      };
      this.$emit('openMenuInDevicePortTrace', menuId, menuTitle, openParams);
    },

    // 显示隐藏路由topo区域
    routeShowSwitch() {
      this.routeShow = !this.routeShow;
      this.$refs.route.style.height = this.routeShow ? '342px' : '40px';
      if (!this.routeShow) {
        this.reloadTopoSize();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import './lldDesign.scss';
</style>
