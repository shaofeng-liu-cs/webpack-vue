import AbstractResource from './AbstractResource';
import { showProperty, EditNode, selectMode, bindAz, unBind, breakLine, loadFormatPoint } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractSupportSection extends AbstractResource {
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
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospdaduanjiedian',
        event: breakLine,
      },
    ];
    this.mult = [
      {
        seq: 29,
        name: i18n.t('OSP_DOMAIN_BIND_AZ'),
        code: 'bindAZ',
        icon: 'icon_osp icon_ospbangding',
        event: bindAz,
      },
      {
        seq: 22,
        name: i18n.t('OSP_DOMAIN_SELECTION'),
        code: 'selectModel',
        icon: 'icon_osp icon_ospxuanxing1',
        event: showProperty,
      },
      {
        seq: 30,
        name: i18n.t('OSP_DOMAIN_CANCEL_BIND_AZ'),
        code: 'cancelBindAZ',
        icon: 'icon_osp icon_ospquxiaobangding',
        event: unBind,
      },
      {
        seq: 31,
        name: i18n.t('OSP_DOMAIN_BREAK_LINE'),
        code: 'breakLine',
        functionType: 'RES_EDIT',
        icon: 'icon_osp icon_ospdaduanjiedian',
        event: breakLine,
      },
    ];
    this.menuList = this.menuList.concat(this.menu);
    this.multList = this.multList.concat(this.mult);
  }
}
