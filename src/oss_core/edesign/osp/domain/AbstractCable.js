/*
 * @Author: HongAnDing
 * @Date: 2022-07-04 10:45:08
 * @LastEditors: HongAnDing
 * @LastEditTime: 2022-08-10 16:18:51
 * @Description: file content
 */
import AbstractResource from './AbstractResource';
import { showProperty, EditNode, selectMode, bindAz, unBind, breakLine, loadFormatPoint } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractCable extends AbstractResource {
  constructor() {
    super();
    this.menu = [
      {
        seq: 2,
        name: i18n.t('OSP_DOMAIN_SELECTION'),
        code: 'selectModel',
        icon: 'icon_osp icon_ospxuanxing1',
        functionType: 'RES_EDIT',
        event: selectMode,
      },
      {
        seq: 4,
        name: i18n.t('OSP_DOMAIN_EDIT_POINT'),
        code: 'editPoint',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospbianjijiedian',
        event: EditNode,
      },
      {
        seq: 6,
        name: i18n.t('OSP_DOMAIN_BIND_AZ'),
        code: 'bindAZ',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospbangding',
        event: bindAz,
      },
      {
        seq: 7,
        name: i18n.t('OSP_DOMAIN_CANCEL_BIND_AZ'),
        code: 'cancelBindAZ',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospquxiaobangding',
        event: unBind,
      },
      {
        seq: 8,
        name: i18n.t('OSP_DOMAIN_LOAD_FORMAT_POINT'),
        code: 'loadFormatPoint',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospceliang',
        event: loadFormatPoint,
      },
      {
        seq: 11,
        name: i18n.t('OSP_DOMAIN_BREAK_LINE'),
        code: 'breakLine',
        icon: 'icon_osp icon_ospdaduanjiedian',
        functionType: 'RES_EDIT',
        event: breakLine,
      },
      {
        seq: 13,
        name: i18n.t('OSP_DOMAIN_ROUTE'),
        code: 'routeMgr',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospCopyMove-1',
        // hasSubMenu 表示是否有二级菜单
        // initSubMenuContentFunctionName 表示初始化二级菜单内容的函数名
        // functionRunMode 表示初始化函数运行模式。graphic-change为选中对象一变化就运行，right-click为右键之后才运行，
        hasSubMenu: true,
        initSubMenuContentFunctionName: 'initRoute',
        functionRunMode: 'graphic-change',
        event: () => {},
      },
    ];
    this.mult = [
      {
        seq: 29,
        name: i18n.t('OSP_DOMAIN_BIND_AZ'),
        code: 'bindAZ',
        icon: 'icon_osp icon_ospbangding',
        functionType: 'RES_EDIT',
        event: bindAz,
      },
      {
        seq: 22,
        name: i18n.t('OSP_DOMAIN_SELECTION'),
        code: 'selectModel',
        icon: 'icon_osp icon_ospxuanxing1',
        functionType: 'RES_EDIT',
        event: showProperty,
      },
      {
        seq: 30,
        name: i18n.t('OSP_DOMAIN_CANCEL_BIND_AZ'),
        code: 'cancelBindAZ',
        icon: 'icon_osp icon_ospquxiaobangding',
        functionType: 'RES_EDIT',
        event: unBind,
      },
      {
        seq: 31,
        name: i18n.t('OSP_DOMAIN_BREAK_LINE'),
        code: 'breakLine',
        icon: 'icon_osp icon_ospdaduanjiedian',
        functionType: 'RES_EDIT',
        event: breakLine,
      },
      {
        seq: 32,
        name: i18n.t('OSP_DOMAIN_ROUTE'),
        code: 'routeMgr',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospCopyMove-1',
        // hasSubMenu 表示是否有二级菜单
        // initSubMenuContentFunctionName 表示初始化二级菜单内容的函数名
        // functionRunMode 表示初始化函数运行模式。graphic-change为选中对象一变化就运行，right-click为右键之后才运行，
        hasSubMenu: true,
        initSubMenuContentFunctionName: 'initRoute',
        functionRunMode: 'graphic-change',
        event: () => {},
      },
    ];
    this.menuList = this.menuList.concat(this.menu);
    this.multList = this.multList.concat(this.mult);
  }
}
