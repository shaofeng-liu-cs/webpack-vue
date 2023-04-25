import { Color, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, Font, TextSymbol } from 'map';

const COLORS = {
  NOCOLOR: new Color(255, 255, 255, 0),
  RED: new Color(255, 0, 0, 1),
  RED_OP_6: new Color(255, 0, 0, 0.6),
  PURPLE: new Color(255, 0, 255, 0.8),
  WHITE_OP_2: new Color(255, 255, 255, 0.2),
  WHITE_OP_5: new Color(255, 255, 255, 0.5),
  WHITE: new Color(255, 255, 255, 1),
  BLACK_OP_2: new Color(0, 0, 0, 0.2),
  BLUE_OP_2: new Color(0, 0, 255, 0.2),
  COVER_LINE: new Color(203, 88, 141, 1),
  // 红色
  PINK: new Color(238, 99, 99, 0.6),
  BLACK: new Color(0, 0, 0, 1),
  TRANSPARENT: new Color(255, 0, 0, 0),
  GREEN: new Color(50, 177, 108, 1),
  GREEN_5: new Color(50, 177, 108, 0.5),
  RED_OP_2: new Color(255, 0, 0, 0.2),
  RED_OP_3: new Color(255, 0, 0, 0.3),
  ROUTINE: new Color(0, 255, 0, 0.8),
  // 蓝色
  CABLE_LAYING: new Color(68, 119, 238, 0.8),
  CABLE_COVER: new Color(68, 119, 238, 0.8),

  CABLE_COVER_RED: new Color(255, 0, 0, 0.8),

  GREEN_6: new Color(0, 137, 255, 0.6),
  GREEN_2: new Color(0, 137, 255, 0.2),
  GREEN_1: new Color(0, 137, 255, 0.1),
};

export const LINE = {
  RED: new SimpleLineSymbol('solid', COLORS.RED, 1),
  RED4: new SimpleLineSymbol('solid', COLORS.RED, 4),
  RED5: new SimpleLineSymbol('solid', COLORS.RED_OP_6, 5),
  RED6: new SimpleLineSymbol('solid', COLORS.RED_OP_6, 6),
  PURPLE: new SimpleLineSymbol('solid', COLORS.PURPLE, 1),
  BLACK: new SimpleLineSymbol('solid', COLORS.BLACK_OP_2, 1),
  BLUE: new SimpleLineSymbol('solid', COLORS.BLUE_OP_2, 1),
  COVER_LINE: new SimpleLineSymbol('solid', COLORS.COVER_LINE, 6),
  PINK: new SimpleLineSymbol('solid', COLORS.PINK, 2),
  PINK_6: new SimpleLineSymbol('solid', COLORS.PINK, 6),
  PINK4: new SimpleLineSymbol('solid', COLORS.CABLE_LAYING, 4),
  PINK5: new SimpleLineSymbol('solid', COLORS.CABLE_LAYING, 5),
  CABLE_COVER: new SimpleLineSymbol('solid', COLORS.CABLE_COVER, 5),
  CABLE_COVER_RED: new SimpleLineSymbol('solid', COLORS.CABLE_COVER_RED, 5),
  DOT: new SimpleLineSymbol('dot', COLORS.RED, 3),
  GREEN_SOLID_LINE: new SimpleLineSymbol('solid', COLORS.GREEN, 4),
  HIGH_LIGHT_ROUTINE: new SimpleLineSymbol('solid', COLORS.ROUTINE, 3),
  GREEN_LINE_1: new SimpleLineSymbol('solid', COLORS.GREEN_6, 1),
  YELLOW_LINE_1: new SimpleLineSymbol('solid', COLORS.GREEN_6, 1),
  PINK_LINE_1: new SimpleLineSymbol('solid', COLORS.GREEN_6, 1),
  NOCOLOR: new SimpleLineSymbol('solid', COLORS.NOCOLOR, 1),
};

export const MARKER = {
  RED: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 2, LINE.RED, COLORS.RED_OP_6),
  BLACK: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 1, LINE.BLACK, COLORS.BLACK_OP_2),
  CIRCLE: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 6, LINE.RED, COLORS.WHITE),
  CIRCLE_RED: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 6, LINE.RED, COLORS.RED),
  CIRCLE_RED_2: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 4, LINE.RED, COLORS.RED),
  CROSS: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 15, LINE.RED, COLORS.RED_OP_6),
  CROSS_8: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 8, LINE.RED, COLORS.WHITE),
};

export const FILL = {
  WHITE: new SimpleFillSymbol(LINE.RED, COLORS.WHITE_OP_2),
  BLUE: new SimpleFillSymbol(LINE.BLUE, COLORS.BLUE_OP_2),
  PINK_LINE: new SimpleFillSymbol(LINE.PINK, COLORS.WHITE_OP_5),
  RED_SOLID_LINE: new SimpleFillSymbol(LINE.RED6, COLORS.TRANSPARENT),
  RED_DOT_LINE: new SimpleFillSymbol(LINE.DOT, COLORS.TRANSPARENT),
  RED_OP_2: new SimpleFillSymbol(LINE.RED, COLORS.RED_OP_2),
  GREEN_1: new SimpleFillSymbol(LINE.GREEN_LINE_1, COLORS.GREEN_6),
  YELLOW_1: new SimpleFillSymbol(LINE.YELLOW_LINE_1, COLORS.GREEN_2),
  PINK_1: new SimpleFillSymbol(LINE.PINK_LINE_1, COLORS.GREEN_1),
  RED_OP_3: new SimpleFillSymbol(LINE.RED, COLORS.RED_OP_3),
  NOCOLOR: new SimpleFillSymbol(LINE.NOCOLOR, COLORS.NOCOLOR),
};

export const PICTURE = {
  LOCATE: new PictureMarkerSymbol('map-service/map/assets/image/marker-locate-red.png', 18, 27, 0, 0, 10),
  NEW_RES_POSITION_ICON: new PictureMarkerSymbol('map-service/map/assets/image/new_res_position_icon.png', 24, 24, 0, 0, 0),
  FAULT: new PictureMarkerSymbol('map-service/map/assets/image/Fault-2.png', 60, 60, 0, 0, 23),
  MEASURE_BORDER: new PictureMarkerSymbol('map-service/map/assets/image/fenduanchangdubiankuang.png', 110, 25, 0, 60, 10),
  LENGTH_BORDER: new PictureMarkerSymbol('map-service/map/assets/image/zongchangdubiankuang.png', 120, 25, 0, 60, 10),
  CLEAR: new PictureMarkerSymbol('map-service/map/assets/image/qingchuceju.png', 20, 20, 0, -20, 0),
  CONFIRM: new PictureMarkerSymbol('map-service/map/assets/image/confirm.png', 20, 20, 0, 20, 0),
};

const FONT = {
  NORMAL: new Font('12px', Font.STYLE_NORMAL, Font.WEIGHT_NORMAL, 'Microsoft Yahei'),
};

export const TEXT = {
  CENTER: () => new TextSymbol('', FONT.NORMAL, COLORS.RED, TextSymbol.CENTER, TextSymbol.MIDDLE, 0, 0),
  MEASURE: () => new TextSymbol('', FONT.NORMAL, COLORS.BLACK, TextSymbol.CENTER, TextSymbol.MIDDLE, 60, 10),
};
