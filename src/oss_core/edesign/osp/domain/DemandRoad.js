/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2022-10-20 15:04:10
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-06 14:52:47
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\domain\DemandRoad.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import AbstractResource from './AbstractResource';
import { copySurface } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

const menus = [
  {
    seq: 96,
    name: i18n.t('OSP_DOMAIN_COPY_SURFACE'),
    code: 'copySurface',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospcopy',
    event: copySurface,
  },
];
export default class DemandRoad extends AbstractResource {
  constructor() {
    super();
    this.tempMenuList = this.tempMenuList.concat(menus);
  }
}
DemandRoad.type = 'A0';
