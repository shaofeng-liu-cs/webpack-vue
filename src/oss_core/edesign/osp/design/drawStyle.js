/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2023-02-22 11:34:15
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @Description: In User Settings Edit
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\osp\design\drawStyle.js
 */

/**
 * 定义地图图形、字体、标记样式
 * */
import * as map from 'map';

export const airWire = new map.SimpleLineSymbol('dash', new map.Color(199, 21, 133, 1), 2);

export const copper = new map.SimpleLineSymbol('solid', new map.Color(0, 0, 128, 1), 2);

export const pipeline = new map.SimpleLineSymbol('solid', new map.Color(220, 20, 60, 0.8), 2);

export const fiber = new map.SimpleLineSymbol('solid', new map.Color(139, 0, 0, 0.8), 2);

export const defalutColor = new map.Color(255, 120, 234, 1);

export const WHITE = new map.Color(255, 255, 255, 1);

export const GRAY_1 = new map.Color(220, 220, 220, 0.5);

export const defalutLine = new map.SimpleLineSymbol('solid', new map.Color(255, 0, 234, 1), 1);

export const demandLine = new map.SimpleLineSymbol('solid', new map.Color(0, 0, 0, 1), 1);

export const demandRoadLine = new map.SimpleLineSymbol('solid', new map.Color(0, 0, 0, 1), 2.5);

export const mouseStyle = new map.SimpleMarkerSymbol('circle', 8, defalutLine, defalutColor);

export const mouseStyleDeleted = new map.SimpleMarkerSymbol('circle', 8, demandLine, GRAY_1);

export const polygonLine = new map.SimpleLineSymbol('solid', new map.Color(210, 105, 30, 1), 1);

export const chooseLine = new map.SimpleLineSymbol('solid', new map.Color(210, 105, 30, 1), 4);

export const showIndex = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker.png', 24, 35, 0, 0, 15);
export const showIndexD = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker-d.png', 24, 35, 0, 0, 15);

export const showIndexOffset = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker.png', 24, 35, 0, -2, 11);

export const blueIndexOffset = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker-b.png', 24, 35, 0, -3, 13);

export const blueIndex = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker-b.png', 24, 35, 0, 0, 15);

export const blueIndexForResTreePoint = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker-b.png', 24, 35, 0, -2, 10);

export const streetPicture = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/map-tool-bar/streetview.png', 32, 32, 0, 0, 15);

export const FONT_NORMAL = new map.Font(12, 'normal', 5, 'Microsoft Yahei');

export const RED = new map.Color(255, 0, 0, 1);

export const PINK_OP_5 = new map.Color(238, 99, 99, 0.1);

export const BLACK = new map.Color(0, 0, 0, 1);

export const BLUE = new map.Color(65, 105, 225, 1);

export const OPAQUE = new map.Color(0, 0, 0, 0);

export const WHITE_NONE = new map.Color(255, 255, 255, 0);

export const WHITE_5 = new map.Color(255, 255, 255, 0.5);

export const indexText = new map.TextSymbol('', FONT_NORMAL, WHITE, 'center', 'middle', 0, -14, RED);

export const blueText = new map.TextSymbol('', FONT_NORMAL, WHITE, 'center', 'middle', -3, -20);

export const blackText = new map.TextSymbol('', FONT_NORMAL, BLACK, 'center', 'bottom', 0, 27, WHITE_NONE);

export const fillColor = new map.SimpleFillSymbol(polygonLine, BLACK, true, blackText);

export const fillPolygonColor = new map.SimpleFillSymbol(polygonLine, WHITE_5, true, blackText);

export const fillPolygonColorDeleted = new map.SimpleFillSymbol(polygonLine, GRAY_1, true, blackText);

export const seletColor = new map.SimpleFillSymbol(polygonLine, BLUE, true, blueText);

export const selectedLine = new map.SimpleLineSymbol('solid', new map.Color(0, 153, 255, 1), 3);

export const selectedBorderLine = new map.SimpleLineSymbol('solid', new map.Color(255, 255, 255, 1), 5);
