/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-04-06 15:31:35
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-04-06 17:54:07
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\domain\AbstractMarker.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { deleteGraphic } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractMarker {
  constructor() {
    // 标记层右键
    this.menuList = [
      {
        seq: 100,
        name: i18n.t('OSP_DOMAIN_DELETE'),
        code: 'delete',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospshanchu1',
        fastKey: 'Delete',
        event: deleteGraphic,
      },
      {
        seq: 94,
        name: i18n.t('OSP_DOMAIN_EDIT_POINT'),
        code: 'editMarker',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospbianjijiedian',
        // event: EditMarker,
      },
    ];
    this.multList = [
      {
        seq: 100,
        name: i18n.t('OSP_DOMAIN_DELETE'),
        code: 'delete',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospshanchu1',
        fastKey: 'Delete',
        event: deleteGraphic,
      },
    ];
  }

  getContextMenu() {
    return this.menuList;
  }

  getContextTempMenu() {
    return this.tempMenuList;
  }

  getMultContextMenu() {
    return this.multList;
  }

  getMultContextTempMenu() {
    return this.tempMultList;
  }
}
