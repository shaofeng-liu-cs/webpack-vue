/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2022-10-26 17:27:26
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-02-17 10:14:43
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\domain\PLANGrid.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import AbstractGrid from './AbstractGrid';
// import { AutoIdentifyBuilding, AutoIdentifyRoad } from './ResEventHandler.js';
// import i18n from '../../../base/locale/locale.js';

// 网格的右键菜单不参与权限控制，均可以操作
const menus = [
  // {
  //   seq: 86,
  //   name: i18n.t('OSP_DOMAIN_AUTO_IDENTIFY_BUILDINGS'),
  //   code: 'AutoIdentifyBuilding',
  //   functionType: 'RES_EDIT',
  //   icon: 'icon_osp icon_ospjianzhu1',
  //   event: AutoIdentifyBuilding,
  // },
  // {
  //   seq: 87,
  //   name: i18n.t('OSP_DOMAIN_AUTO_IDENTIFY_ROADS'),
  //   code: 'AutoIdentifyRoad',
  //   functionType: 'RES_EDIT',
  //   icon: 'icon_osp icon_osplu',
  //   event: AutoIdentifyRoad,
  // },
];
export default class PLANGrid extends AbstractGrid {
  constructor() {
    super();
    // this.menuList = this.menuList.concat(menus);
    this.menuList = menus;
  }
}
PLANGrid.type = 'PLAN_GRID';
