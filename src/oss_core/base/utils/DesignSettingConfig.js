/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-08-15 09:21:29
 * @LastEditors: HongAnDing
 * @Description:
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\topo\TopoContainer.js
 */
export function getDefaultDesignSetConfig() {
  return {
    // autoBind: null, // 绘制完线段自动绑定 默认N
    // autoBindMultiLayer: null, // 多个相同图点层自动绑定 默认N
    // autoBindSameLayer: null, // 不同图层点自动绑定 默认N
    bindTolerance: 10, // 绑定容限 默认10m
    // multiLayerExtVal: null,
    selectModel: 'I', // 选择类型 Intersection
    stackDepth: 15, // 堆栈大小 默认15
    tolerance: 5, // 选择容限 默认5px
  };
}
