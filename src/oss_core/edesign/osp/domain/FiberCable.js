import AbstractCable from './AbstractCable';
import { mergeLine } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

const multList = [
  {
    seq: 28,
    name: i18n.t('OSP_DOMAIN_MERGE_LINE'),
    code: 'mergeLine',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_osphebingxian',
    event: mergeLine,
  },
];
export default class FiberCable extends AbstractCable {
  constructor() {
    super();
    this.multList = this.multList.concat(multList);
  }
}
FiberCable.type = 'F_CABLE';
