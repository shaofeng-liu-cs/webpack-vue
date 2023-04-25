import AbstractGrid from './AbstractGrid';
import { splitLowGrid, combineArea, splitPolygon } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

// 网格的右键菜单不参与权限控制，均可以操作
const menus = [
  {
    seq: 10,
    name: i18n.t('OSP_DOMAIN_SPLIT_TO_LOWER_GRID'),
    code: 'splitLoweGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospchaifenxiajiyemian',
    event: splitLowGrid,
  },
];

const multList = [
  {
    seq: 24,
    name: i18n.t('OSP_DOMAIN_MERGE_TO_SIBLING_GRID'),
    code: 'mergeSiblingGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospRectangle',
    event: combineArea,
  },
  {
    seq: 26,
    name: i18n.t('OSP_DOMAIN_BATCH_SPLIT_TO_LOWER_GRID'),
    code: 'batchSplitLowerGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospchaifenxiajiyemian',
    event: splitLowGrid,
  },
  {
    seq: 27,
    name: i18n.t('OSP_DOMAIN_BATCH_SPLIT_GRID'),
    code: 'batchSplitGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospchaifenbenjiyemian',
    event: splitPolygon,
  },
];
export default class OLTGrid extends AbstractGrid {
  constructor() {
    super();
    this.menuList = this.menuList.concat(menus);
    this.multList = this.multList.concat(multList);
  }
}
OLTGrid.type = 'OLT_GRID';
