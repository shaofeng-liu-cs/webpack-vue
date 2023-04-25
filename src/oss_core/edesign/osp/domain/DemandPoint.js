import AbstractResource from './AbstractResource';
import { move } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

const menu = [
  {
    seq: 5,
    name: i18n.t('OSP_DOMAIN_MOVE'),
    code: 'move',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_ospyidong',
    event: move,
  },

  // {
  //     seq:2,
  //     name: i18n.t('OSP_DOMAIN_SELECTION'),
  //     code: 'selectModel',
  //     icon: 'icon_osp icon_ospxuanxing1',
  //     event:selectMode
  // },
];

export default class DemandPoint extends AbstractResource {
  constructor() {
    super();
    this.menuList = this.menuList.concat(menu);
  }
}
DemandPoint.type = 'A5';
