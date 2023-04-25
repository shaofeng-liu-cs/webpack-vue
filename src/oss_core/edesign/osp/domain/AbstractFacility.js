/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-21 10:46:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\domain\AbstractFacility.js
 */

import AbstractResource from './AbstractResource';
import { move, selectMode, showProperty } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractFacility extends AbstractResource {
  constructor() {
    super();
    this.menu = [
      {
        seq: 2,
        name: i18n.t('OSP_DOMAIN_SELECTION'),
        code: 'selectModel',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospxuanxing1',
        event: selectMode,
      },
      {
        seq: 5,
        name: i18n.t('OSP_DOMAIN_MOVE'),
        code: 'move',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospyidong',
        event: move,
      },
    ];
    this.mult = [
      {
        seq: 22,
        name: i18n.t('OSP_DOMAIN_SELECTION'),
        code: 'selectModel',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospxuanxing1',
        event: showProperty,
      },
    ];
    this.menuList = this.menuList.concat(this.menu);
    this.multList = this.multList.concat(this.mult);
  }
}
