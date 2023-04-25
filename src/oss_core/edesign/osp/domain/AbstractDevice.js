import AbstractResource from './AbstractResource';
import { move, selectMode, showProperty } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

export default class AbstractDevice extends AbstractResource {
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
      //   {
      //     // seq: 7,
      //     // name: 'access',
      //     // icon: 'icon_osp icon_ospyidong',
      //     // event: access,
      //   },
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
