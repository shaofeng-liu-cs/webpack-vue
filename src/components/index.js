/*
 * @Author: your name
 * @Date: 2020-04-09 16:25:55
 * @LastEditTime: 2022-08-10 15:10:51
 * @LastEditors: HongAnDing
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\components\index.js
 */
import Panel from './gis/panel/Panel.vue';
import Loading from './gis/loading';
import Popup from './gis/popup/popup.vue';
import Search from './gis/search/search.vue';
import Empty from './gis/empty/empty.vue';
import SelectPopup from './gis/select2Popup/SelectPopup.vue';
import DrawPolygon2Map from './gis/drawPolygon2Map/DrawPolygon2Map.vue';
import Splitter from './gis/splitter/Splitter.vue';

import Combobox from './fish/combobox/Combobox.vue';
import Tree from './fish/tree/Tree.vue';
import Popedit from './fish/popedit/Popedit.vue';
import DatetimePicker from './fish/datetimePicker/DatetimePicker.vue';
import Currencybox from './fish/currencybox/Currencybox.vue';
import Combotree from './fish/combotree/Combotree.vue';
import Grid from './fish/grid/grid.vue';
import GridColumn from './fish/grid/grid-column';
import Multiselect from './fish/multiselect/multiselect.vue';
import Spinner from './fish/spinner/spinner.vue';
import Progressbar from './fish/progressbar/progressbar.vue';
import Popover from './fish/popover/popover.vue';
import Pagination from './fish/pagination/pagination.vue';
import Autocomplete from './fish/autocomplete/autocomplete.vue';
import Upload from './fish/fileupload/upload.vue';
import AddrPub from './fish/addrPub/AddrPub.vue';
import Step from './fish/step/Step.vue';

import EdnTabs from './osp/ednTabs/EdnTabs.vue';
import JustTab from './osp/justTab/JustTab.vue';
import EdnTree from './osp/ednTree/EdnTree.vue';
import EdnStep from './osp/ednStep/EdnStep.vue';

const components = [
  Panel,
  Popup,
  Search,
  Empty,
  SelectPopup,
  DrawPolygon2Map,
  Splitter,
  Combobox,
  Tree,
  Popedit,
  DatetimePicker,
  Currencybox,
  Combotree,
  Grid,
  GridColumn,
  Multiselect,
  Spinner,
  Progressbar,
  Popover,
  Pagination,
  Autocomplete,
  Upload,
  AddrPub,
  Step,
  EdnTabs,
  JustTab,
  EdnTree,
  EdnStep,
];

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component);
  });

  Vue.use(Loading.Directive);
  Vue.prototype.$block = Loading.Service.block;
  Vue.prototype.$unBlock = Loading.Service.unBlock;
};

export default {
  install,
};
