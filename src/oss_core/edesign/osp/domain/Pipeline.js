import AbstractSupportSection from './AbstractSupportSection';
import { mergeLine } from './ResEventHandler.js';
import i18n from '../../../base/locale/locale.js';

const multList = [
  {
    seq: 48,
    name: i18n.t('OSP_DOMAIN_MERGE_LINE'),
    code: 'mergeLine',
    functionType: 'RES_EDIT',
    icon: 'icon_osp icon_osphebingxian',
    event: mergeLine,
  },
];
export default class Pipeline extends AbstractSupportSection {
  constructor() {
    super();
    this.multList = this.multList.concat(multList);
  }
}
Pipeline.type = 'PIPELINE_G';
