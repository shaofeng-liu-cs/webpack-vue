/*
 * @Author: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Date: 2023-03-17 09:46:56
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-03-17 09:47:31
 * @FilePath: \code\design-web\src\oss_core\edesign\osp\domain\Duct.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
export default class Duct extends AbstractSupportSection {
  constructor() {
    super();
    this.multList = this.multList.concat(multList);
  }
}
Duct.type = 'PIPELINE_B';
