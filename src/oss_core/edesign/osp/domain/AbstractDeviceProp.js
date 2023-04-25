import AbstractDevice from './AbstractDevice';
// import { move, selectMode } from './ResEventHandler.js';
// import i18n from '../../../base/locale/locale.js';

export default class AbstractDeviceProp extends AbstractDevice {
  constructor() {
    super();
    // this.menu = [
    //   {
    //     seq: 2,
    //     name: 'Select Model',
    //     code: 'selectModel',
    //     icon: 'icon_osp icon_ospxuanxing1',
    //     event: selectMode,
    //   },
    //   {
    //     seq: 5,
    //     name: 'Move',
    //     icon: 'icon_osp icon_ospyidong',
    //     event: move,
    //   },
    // ];
    this.menu = [];
    this.menuList = this.menuList.concat(this.menu);
  }
}
