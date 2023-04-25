/*
 * @Author: Peng Yang
 * @Date: 2020-09-14 08:31:49
 * @LastEditors: Peng Yang
 * @LastEditTime: 2020-10-20 20:56:51
 * @Description: file content
 */
const themeList = [
  {
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
          layerDetailName: 'osm:london_building_point_cliped',
        },
      ],
      // ---单独wfs定义结束
      weightFieldName: 'uprnx',
      geoFieldName: 'geom',
      blur: 10,
      radius: 10,
    },
  },
];

export default themeList;
