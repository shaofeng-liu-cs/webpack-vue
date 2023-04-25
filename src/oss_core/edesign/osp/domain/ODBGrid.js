import AbstractGrid from './AbstractGrid';
import { combineArea, splitPolygon, combineParentArea } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

// 网格的右键菜单不参与权限控制，均可以操作
const multList = [
  {
    seq: 34,
    name: i18n.t('OSP_DOMAIN_MERGE_TO_PARENT_GRID'),
    code: 'mergeParentGird',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_osphebingshangjiyemian',
    event: combineParentArea,
  },
  {
    seq: 35,
    name: i18n.t('OSP_DOMAIN_MERGE_TO_SIBLING_GRID'),
    code: 'mergeSiblingGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospRectangle',
    event: combineArea,
  },
  {
    seq: 37,
    name: i18n.t('OSP_DOMAIN_BATCH_SPLIT_GRID'),
    code: 'batchSplitGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospchaifenbenjiyemian',
    event: splitPolygon,
  },
];
export default class ODBGrid extends AbstractGrid {
  constructor() {
    super();
    this.multList = this.multList.concat(multList);
  }
}
ODBGrid.type = 'ODB_GRID';
