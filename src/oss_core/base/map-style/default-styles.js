/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2020-07-21 16:59:47
 * @LastEditors: Please set LastEditors
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

export const defalutColor = new map.Color(255, 120, 234, 0);

export const defalutLine = new map.SimpleLineSymbol('solid', new map.Color(255, 0, 234, 1), 1);

export const mouseStyle = new map.SimpleMarkerSymbol('circle', 5, defalutLine, defalutColor);

export const polygonLine = new map.SimpleLineSymbol('solid', new map.Color(210, 105, 30, 1), 1);

export const chooseLine = new map.SimpleLineSymbol('solid', new map.Color(210, 105, 30, 1), 4);

export const showIndex = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker.png', 24, 35, 0, -2, 7);

export const blueIndex = new map.PictureMarkerSymbol('oss_core/edesign/assets/image/bgimg/marker-b.png', 24, 35, 0, -2, 7);

export const FONT_NORMAL = new map.Font(12, 'normal', 5, 'Microsoft Yahei');

export const RED = new map.Color(255, 0, 0, 1);

export const WHITE = new map.Color(255, 255, 255, 1);

export const BLACK = new map.Color(0, 0, 0, 1);

export const BLUE = new map.Color(65, 105, 225, 1);

export const OPAQUE = new map.Color(0, 0, 0, 0);

export const WHITE_NONE = new map.Color(255, 255, 255, 0);

export const indexText = new map.TextSymbol('', FONT_NORMAL, WHITE, 'center', 'middle', 0, -14, RED);

export const blueText = new map.TextSymbol('', FONT_NORMAL, WHITE, 'center', 'middle', -1, -12);

export const blackText = new map.TextSymbol('', FONT_NORMAL, BLACK, 'center', 'bottom', 0, 27, WHITE_NONE);

export const fillColor = new map.SimpleFillSymbol(polygonLine, BLACK, true, blackText);

export const seletColor = new map.SimpleFillSymbol(polygonLine, BLUE, true, blueText);
