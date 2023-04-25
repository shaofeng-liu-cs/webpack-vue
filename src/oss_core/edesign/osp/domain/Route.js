/*
 * @Author: HongAnDing
 * @Date: 2022-08-11 18:15:11
 * @LastEditors: HongAnDing
 * @LastEditTime: 2022-08-11 18:18:04
 * @Description: file content
 */
import AbstractResource from './AbstractResource';
// import { mergeLine } from './ResEventHandler.js';
// import i18n from '../../../base/locale/locale.js';

const multList = [{}];
export default class Route extends AbstractResource {
  constructor() {
    super();
    this.multList = this.multList.concat(multList);
  }
}
Route.type = 'ROUTE';
