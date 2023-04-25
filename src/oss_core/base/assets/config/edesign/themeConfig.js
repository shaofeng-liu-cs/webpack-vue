/*
 * @Author: Peng Yang
 * @Date: 2020-09-14 08:31:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-21 10:44:09
 * @Description: file content
 */
// eslint-disable-next-line import/no-amd, no-undef
define([], () => ({
  themeList: [
    {
      loadType: 'wfs_hot',
      themeName: 'POI Heatmap',
      themeDesc: 'Display the heatmap of most valueable district base on UPRN value of buildings',
      themeIcon: 'oss_core/edesign/assets/image/map-tool-bar/hot-map.png',
      definition: {
        // 每个不同，单独根据代码定义，目前热力图的如下：
        // 可选项 "wfs" | "datalist"
        dataType: 'wfs',
        // ---针对wfs，下面定义有效
        serviceUrl: 'geoserver/v9/ows',
        layers: [
          {
            layerDetailName: 'osm:cs_building_point',
          },
        ],
        // ---单独wfs定义结束
        weightFieldName: 'uprnx',
        geoFieldName: 'geom',
        blur: 10,
        radius: 10,
      },
    },
  ],
}));
