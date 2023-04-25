/*
 * @Author: HongAnDing
 * @Date: 2022-07-04 10:45:08
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-02-09 10:06:05
 * @Description: file contentE
 */
import { EditNode, showProperty, deleteGraphic, deleteTempGraphic } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractResource {
  constructor() {
    this.menuList = [
      {
        seq: 1,
        name: i18n.t('OSP_DOMAIN_PROPERTY'),
        code: 'property',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospshuxing',
        event: showProperty,
      },
      {
        seq: 98,
        name: i18n.t('OSP_DOMAIN_SELECT_OTHER'),
        code: 'selectOther',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospfanxuan',
        // hasSubMenu 表示是否有二级菜单
        // initSubMenuContentFunctionName 表示初始化二级菜单内容的函数名
        // functionRunMode 表示初始化函数运行模式。graphic-change为选中对象一变化就运行，right-click为右键之后才运行，
        hasSubMenu: true,
        initSubMenuContentFunctionName: 'initOtherResource',
        functionRunMode: 'right-click',
        event: () => {},
      },
      {
        seq: 99,
        name: i18n.t('OSP_DOMAIN_CHANGE_DESIGN_ELEMENT'),
        code: 'changeDesignElement',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_osp04zhuanhuan',
        hasSubMenu: true,
        initSubMenuContentFunctionName: 'initDesignElement',
        functionRunMode: 'right-click',
        event: () => {},
      },
      // {
      //   seq: 99,
      //   name: i18n.t('OSP_DOMAIN_COPY'),
      //   code: 'copy2OtherLayer',
      //   functionType: 'RES_EDIT',
      //   icon: 'icon_osp icon_ospCopyMove-1',
      //   hasSubMenu: true,
      //   initSubMenuContentFunctionName: 'initCopyLayer',
      //   functionRunMode: 'graphic-change',
      //   event: () => {},
      // },
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
    this.multList = [
      {
        seq: 21,
        name: i18n.t('OSP_DOMAIN_PROPERTY'),
        code: 'property',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospshuxing',
        event: showProperty,
      },
      {
        seq: 91,
        name: i18n.t('OSP_DOMAIN_CHANGE_DESIGN_ELEMENT'),
        code: 'changeDesignElement',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_osp04zhuanhuan',
        hasSubMenu: true,
        initSubMenuContentFunctionName: 'initDesignElement',
        functionRunMode: 'right-click',
        event: () => {},
      },
      // {
      //   seq: 99,
      //   name: i18n.t('OSP_DOMAIN_COPY'),
      //   code: 'copy2OtherLayer',
      //   functionType: 'RES_EDIT',
      //   icon: 'icon_osp icon_ospCopyMove-1',
      //   hasSubMenu: true,
      //   initSubMenuContentFunctionName: 'initCopyLayer',
      //   functionRunMode: 'graphic-change',
      //   event: () => {},
      // },
      {
        seq: 100,
        name: i18n.t('OSP_DOMAIN_DELETE'),
        code: 'delete',
        fastKey: 'Delete',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospshanchu1',
        event: deleteGraphic,
      },
    ];
    this.tempMenuList = [
      {
        seq: 1,
        name: i18n.t('OSP_DOMAIN_PROPERTY'),
        code: 'property',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospshuxing',
        event: showProperty,
      },
      {
        seq: 94,
        name: i18n.t('OSP_DOMAIN_EDIT_POINT'),
        code: 'editPoint',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospbianjijiedian',
        event: EditNode,
      },
      {
        seq: 95,
        name: i18n.t('OSP_DOMAIN_DELETE'),
        code: 'delete',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospshanchu1',
        fastKey: 'Delete',
        event: deleteTempGraphic,
      },
    ];
    this.tempMultList = [
      {
        seq: 1,
        name: i18n.t('OSP_DOMAIN_PROPERTY'),
        code: 'property',
        functionType: 'RES_QRY',
        icon: 'icon_osp icon_ospshuxing',
        event: showProperty,
      },
      {
        seq: 95,
        name: i18n.t('OSP_DOMAIN_DELETE'),
        code: 'delete',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospshanchu1',
        fastKey: 'Delete',
        event: deleteTempGraphic,
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
