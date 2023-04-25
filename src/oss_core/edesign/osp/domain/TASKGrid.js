/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-01-17 19:09:39
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-01-19 16:52:59
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\domain\TASKGrid.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import AbstractGrid from './AbstractGrid';
import { splitPolygon, combineArea } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

const menus = [
  {
    seq: 35,
    name: i18n.t('OSP_DOMAIN_MERGE_TO_SIBLING_GRID'),
    code: 'mergeSiblingGrid',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospRectangle',
    event: combineArea,
  },
  {
    seq: 9,
    name: i18n.t('OSP_DOMAIN_SPLIT_GRID'),
    code: 'splitGird',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospchaifenbenjiyemian',
    event: splitPolygon,
  },
  {
    seq: 88,
    name: i18n.t('OSP_DOMAIN_COPY_TO'),
    code: 'copy',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospcopy',
    hasSubMenu: true,
    initSubMenuContentFunctionName: 'initCopyTo',
    functionRunMode: 'right-click',
    event: () => {},
  },
];
export default class TASKGrid extends AbstractGrid {
  constructor() {
    super();
    // this.menuList = this.menuList.concat(menus);
    this.menuList = menus;
  }
}
TASKGrid.type = 'TASK_GRID';
