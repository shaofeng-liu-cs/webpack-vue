/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-25 15:52:45
 * @LastEditors: Please set LastEditors
 * @Description: 网格
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\domain\AbstractGrid.js
 */

import AbstractResource from './AbstractResource';
import { EditNode, splitPolygon, centerGeometry, count } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractGrid extends AbstractResource {
  constructor() {
    super();
    // 网格的右键菜单不参与权限控制，均可以操作
    this.menu = [
      {
        seq: 4,
        name: i18n.t('OSP_DOMAIN_EDIT_POINT'),
        code: 'editPoint',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospbianjijiedian',
        event: EditNode,
      },
      {
        seq: 12,
        name: i18n.t('OSP_DOMAIN_CENTER_RESOURCE'),
        code: 'centerResource',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospEditMode',
        event: centerGeometry,
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
        seq: 8,
        name: i18n.t('OSP_DOMAIN_COUNT'),
        code: 'count',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospjishu',
        event: count,
      },
    ];
    this.mult = [
      // {
      //     seq: 22,
      //     name: i18n.t('OSP_DOMAIN_SELECTION'),
      //     code: 'selectModel',
      //     icon: 'icon_osp icon_ospxuanxing1',
      //     event: showProperty
      // }
      {
        seq: 8,
        name: i18n.t('OSP_DOMAIN_COUNT'),
        code: 'count',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospjishu',
        event: count,
      },
    ];
    this.menuList = this.menuList.concat(this.menu);
    this.multList = this.multList.concat(this.mult);
  }
}
