/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2023-03-28 16:03:22
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: 全局组件注册
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\sidebar\siderBarComponents.js
 */
import NewResource from './newResource/NewResource.vue';
import LayerControl from './layerControl/LayerControl.vue';
import InitialSurvey from './InitialSurvey/InitialSurvey.vue';
import BatchSelectModel from './BatchSelectModel/BatchSelectModel.vue';
import Resource from './resource/Resource.vue';
import DesignCheck from './designCheck/DesignCheck.vue';
import DesignExport from './designExport/DesignExport.vue';
import StreetView from './streetView/StreetView.vue';
import ResourceTree from './resourceTree/ResourceTree.vue';
import SchemaTopo from './schemaTopoControl/schemaTopoControl.vue';
import OnlineBaseMap from './onlineBaseMap/OnlineBaseMap.vue';
import DemandPoint from './demandPoint/DemandPoint.vue';
import OpticalAttenuation from './opticalAttenuation/OpticalAttenuation.vue';
import CableLaying from './cable-laying/CableLaying.vue';
import DesignImport from '@/oss_core/edesign/osp/sidebar/designImport/DesignImport.vue';
import BatchReference from '@/oss_core/edesign/osp/sidebar/batchReference/BatchReference.vue';
import DesignSettings from '@/oss_core/edesign/osp/sidebar/designSettings/DesignSettings.vue';
import SurroundSearch from '@/oss_core/edesign/osp/sidebar/surroundSearch/SurroundSearch.vue';
import CopyGeo from '@/oss_core/edesign/osp/sidebar/copyGeo/CopyGeo.vue';
import AutoLLD from '@/oss_core/edesign/osp/sidebar/autoLLD/AutoLLD.vue';
import ConstructionManagement from '@/oss_core/edesign/osp/sidebar/constructionManagement/ConstructionManagement.vue';
import ConstructionTask from '@/oss_core/edesign/osp/sidebar/constructionManagement/constructionTask/ConstructionTask.vue';
import PmTask from '@/oss_core/edesign/osp/sidebar/constructionManagement/pmTask/PmTask.vue';
import SpliceTask from '@/oss_core/edesign/osp/sidebar/constructionManagement/spliceTask/SpliceTask.vue';
import PublishTask from '@/oss_core/edesign/osp/sidebar/publishTask/PublishTask.vue';
import NodeNetwork from '@/oss_core/edesign/osp/sidebar/nodeNetwork/NodeNetwork.vue';
// import PublishTaskNoConstr from '@/oss_core/edesign/osp/sidebar/publishTaskNoConstr/PublishTaskNoConstr.vue'; //废弃的组件

const components = [
  NewResource,
  LayerControl,
  InitialSurvey,
  BatchSelectModel,
  Resource,
  DesignCheck,
  DesignExport,
  DesignImport,
  StreetView,
  ResourceTree,
  SchemaTopo,
  OnlineBaseMap,
  DemandPoint,
  OpticalAttenuation,
  CableLaying,
  BatchReference,
  DesignSettings,
  SurroundSearch,
  CopyGeo,
  AutoLLD,
  ConstructionManagement,
  ConstructionTask,
  PmTask,
  SpliceTask,
  PublishTask,
  NodeNetwork,
  // PublishTaskNoConstr,
];

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
};

export default {
  install,
};
