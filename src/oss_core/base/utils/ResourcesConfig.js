/*
 * @Author: your name
 * @Date: 2020-07-16 17:00:38
 * @LastEditTime: 2022-08-09 16:06:28
 * @LastEditors: HongAnDing
 * @Description:
 * @FilePath: \online-design-v9\code\design-web\src\oss_core\edesign\topo\TopoContainer.js
 */
import { GeometryType } from 'map';

/**
 * @description: 根据资源类型进行归类
 * @param {String}: 资源类型
 * @return: 所属类型
 */
export function getTopoTypeByResType(resType) {
  if (
    resType === 'ODF' ||
    resType === 'OCC' ||
    resType === 'ODB' ||
    resType === 'F_CLOSURE' ||
    resType === 'SPLITTER' ||
    resType === 'OLT' ||
    resType === 'ONU' ||
    resType === 'MDF' ||
    resType === 'DB' ||
    resType === 'CC'
  ) {
    return 'Device';
  }
  if (resType === 'F_CABLE' || resType === 'C_CABLE') {
    return 'Cable';
  }
  if (resType === 'PIPELINE_G') {
    return 'Trench';
  }
  if (resType === 'PIPELINE_B') {
    return 'Pipeline';
  }
  if (resType === 'PIPELINE_JOINT') {
    return 'PipeLineJoint';
  }
  if (resType === 'POLE') {
    return 'Pole';
  }
  if (resType === 'AIR_WIRE') {
    return 'Air_Wire';
  }
  if (resType === 'MANHOLE') {
    return 'Manhole';
  }
  if (resType === 'SITE' || resType === 'DC_SITE' || resType === 'CO' || resType === 'SITE_WA' || resType === 'CP_SITE') {
    return 'Site';
  }
  if (resType === 'ROOM' || resType === 'DR' || resType === 'MDF_ROOM' || resType === 'IR') {
    return 'Room';
  }
  if (resType === 'DITCH') {
    return 'Ditch';
  }
  if (resType === 'BUILDING') {
    return 'Building';
  }
  return '';
}

export function getTopoResIdByResType(resType) {
  if (
    resType === 'ODF' ||
    resType === 'OCC' ||
    resType === 'ODB' ||
    resType === 'F_CLOSURE' ||
    resType === 'SPLITTER' ||
    resType === 'OLT' ||
    resType === 'ONU' ||
    resType === 'MDF' ||
    resType === 'DB' ||
    resType === 'CC'
  ) {
    return 'deviceId';
  }
  if (resType === 'SHELF' || resType === 'PANEL' || resType === 'MOD_SPLT') {
    return 'hardwareId';
  }
  if (resType === 'O_CONNECT' || resType === 'PORT') {
    return 'portId';
  }
  if (resType === 'TUBE' || resType === 'FIBER_CORE' || resType === 'COPPER_PAIR' || resType === 'CM_COAX_CORE') {
    return 'unitId';
  }
  if (resType === 'F_CABLE' || resType === 'C_CABLE' || resType === 'CM_COAX') {
    return 'cableId';
  }
  return '';
}

export function getTopoResAttrListByResType(resType) {
  let attrCode = [];
  let attrName = [];
  const attr = {};
  if (
    resType === 'ODF' ||
    resType === 'OCC' ||
    resType === 'ODB' ||
    resType === 'F_CLOSURE' ||
    resType === 'SPLITTER' ||
    resType === 'OLT' ||
    resType === 'ONU' ||
    resType === 'MDF' ||
    resType === 'DB' ||
    resType === 'CC'
  ) {
    attrCode = ['deviceId', 'name', 'fullName', 'resSpecId', 'templateId'];
    attrName = ['Device', 'Name', 'Full Name', 'Res Type', 'Template'];
  } else if (resType === 'SHELF' || resType === 'PANEL' || resType === 'MOD_SPLT') {
    attrCode = ['hardwareId', 'name', 'fullName', 'resSpecId', 'templateId'];
    attrName = ['Hardware', 'Name', 'Full Name', 'Res Type', 'Template'];
  } else if (resType === 'O_CONNECT' || resType === 'PORT' || resType === 'SPL_PORT') {
    attrCode = ['portId', 'name', 'fullName', 'resSpecId', 'nameSeq'];
    attrName = ['Port', 'Port Name', 'Full Name', 'Res Type', 'Name Seq'];
  } else if (resType === 'TUBE' || resType === 'FIBER_CORE' || resType === 'COPPER_PAIR' || resType === 'CM_COAX_CORE') {
    attrCode = ['unitId', 'name', 'fullName', 'resSpecId', 'nameSeq'];
    attrName = ['Tube/Core', 'Tube/Core Name', 'Full Name', 'Res Type', 'Name Seq'];
  } else if (resType === 'F_CABLE' || resType === 'C_CABLE' || resType === 'CM_COAX') {
    attrCode = ['unitId', 'name', 'fullName', 'resSpecId'];
    attrName = ['Tube/Core', 'Tube/Core Name', 'Full Name', 'Res Type'];
  } else if (resType === 'LINK_PORT_PORT') {
    attrCode = ['aDeviceId', 'aDeviceName', 'aPortName', 'zDeviceId', 'zDeviceName', 'zPortName'];
    attrName = ['A Device ID', 'A Device', 'A Port', 'Z Device ID', 'A Device', 'Z Port'];
  } else if (resType === 'LINK_PORT_CORE') {
    attrCode = ['deviceId', 'deviceFullName', 'portName', 'cableId', 'cableFullName', 'unitName'];
    attrName = ['Device ID', 'Device Name', 'Port', 'Cable Id', 'Cable Name', 'Tube/Core'];
  } else if (resType === 'LINK_CORE_CORE') {
    attrCode = ['aCableId', 'aCableName', 'zUnitName', 'zCableId', 'zCableName', 'zUnitName'];
    attrName = ['A Cable ID', 'A Cable', 'A Tube/Core', 'Z Cable ID', 'A Cable', 'Z Tube/Core'];
  }

  attr.attrCode = attrCode;
  attr.attrName = attrName;
  return attr;
}

export function getFastLayingResByType(resType) {
  let attrCode = [];
  let attrName = [];
  const attr = {};
  if (resType === 'F_CABLE') {
    attrCode = ['cableId', 'name', 'resSpecId', 'diameter'];
    attrName = ['Cable Id', 'Cable Name', 'Res Type', 'diameter'];
  } else if (resType === 'PIPELINE_G') {
    attrCode = ['pipelineId', 'name', 'resSpecId'];
    attrName = ['ID', 'Pipeline Group', 'Res Type'];
  } else if (resType === 'PIPELINE_B') {
    attrCode = ['pipeChannelId', 'name', 'resSpecId', 'pipelineId'];
    attrName = ['ID', 'Pipeline Block', 'Res Type', 'Pipeline Group ID'];
  } else if (resType === 'PIPELINE') {
    attrCode = [
      'pipeChannelId',
      'name',
      'resSpecId',
      'parentId',
      'pipelineId',
      'diameter',
      'width',
      'height',
      'pipeHoleArea',
      'maxCableQty',
      'curOccupyRateShow',
    ];
    attrName = [
      'ID',
      'Pipeline Hole',
      'Res Type',
      'Pipeline Block ID',
      'Pipeline Group ID',
      'Diameter',
      'Width',
      'Height',
      'Pipe Hole Area',
      'Max Cable',
      'Occupy Rate',
    ];
  } else if (resType === 'MANHOLE') {
    attrCode = ['facilityId', 'name', 'resSpecId'];
    attrName = ['ID', 'Manhole', 'Res Type'];
  } else if (resType === 'POLE') {
    attrCode = ['facilityId', 'name', 'resSpecId'];
    attrName = ['ID', 'Pole', 'Res Type'];
  } else if (resType === 'AIR_WIRE') {
    attrCode = ['facilityId', 'name', 'resSpecId'];
    attrName = ['ID', 'Air Wire', 'Res Type'];
  } else if (resType === 'MARKSTONE') {
    attrCode = ['facilityId', 'name', 'resSpecId'];
    attrName = ['ID', 'Mark Stone', 'Res Type'];
  } else if (resType === 'BURIED_PIPE') {
    attrCode = ['facilityId', 'name', 'resSpecId'];
    attrName = ['ID', 'Building', 'Res Type'];
  }

  attr.attrCode = attrCode;
  attr.attrName = attrName;
  return attr;
}

export function getPortThemeList() {}

export function getDeviceDefault() {
  const defalutColor = {
    itemName: 'Default Device',
    devBorderColor: '#969698',
    devFillColor: '#D4D4D4',
    panelBorderColor: '#BDC0BF',
    panelFillColor: '#EFF2EF',
    labelFont: '12px Tahoma',
  };
  return defalutColor;
}

export function getPortDefault() {
  const defalutColor = {
    itemName: 'Default Port',
    borderColor: '#BDC0BF',
    fillColor: '#FFFFFF', // 允许删除颜色；
    unDelFillColor: '#CCCCCC',
  };
  return defalutColor;
}

export function getFiberCableColor() {
  const defalutColor = {
    itemName: 'Fiber Cable',
    tubeBorderColor: '#B8741A',
    tubeFillColor: '#FFFFFF', // 允许删除颜色；
    tubeUnDelFillColor: '#CCCCCC', // 不允许删除时的填充颜色；
    coreBorderColor: '#B8741A',
    coreFillColor: '#FFFFFF', // 允许删除颜色；
    coreUnDelFillColor: '#CCCCCC', // 不允许删除时的填充颜色；
  };
  return defalutColor;
}

export function getCopperColor() {
  const defalutColor = {
    itemName: 'Copper Cable',
    borderColor: '#B8741A',
    fillColor: '#FFFFFF', // 允许删除颜色；
    unDelFillColor: '#CCCCCC',
  };
  return defalutColor;
}

export function getStateColor(stateVal) {
  let color = '';
  switch (stateVal) {
    case '0':
      color = 'yellow';
      break;
    case '1':
      color = '#ff9900';
      break;
    case '2':
      color = '#f1c232';
      break;
    case '3':
      color = '#980000';
      break;
    case '4':
      color = '#ff0000';
      break;
    case '6':
      color = 'white';
      break;
    default:
      color = '#FFFFFF';
  }
  return color;
}
// resType类型并区分点线面
export function getAllManagedRestypesWithGeometryType() {
  const resTypes = [
    {
      RES_TYPE: 'SITE',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'OLT',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'ODF',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'OCC',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'F_CLOSURE',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'SPLITTER',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'ODB',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'ONU',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'MDF',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'CC',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'DB',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'CLOSURE',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'MANHOLE',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'POLE',
      GEOMETRY_TYPE: GeometryType.POINT,
    },
    {
      RES_TYPE: 'F_CABLE',
      GEOMETRY_TYPE: GeometryType.POLYLINE,
    },
    {
      RES_TYPE: 'C_CABLE',
      GEOMETRY_TYPE: GeometryType.POLYLINE,
    },
    {
      RES_TYPE: 'AIR_WIRE',
      GEOMETRY_TYPE: GeometryType.POLYLINE,
    },
    {
      RES_TYPE: 'PIPELINE_G',
      GEOMETRY_TYPE: GeometryType.POLYLINE,
    },
    {
      RES_TYPE: 'OLT_GRID',
      GEOMETRY_TYPE: GeometryType.POLYGON,
    },
    {
      RES_TYPE: 'OCC_GRID',
      GEOMETRY_TYPE: GeometryType.POLYGON,
    },
    {
      RES_TYPE: 'ODB_GRID',
      GEOMETRY_TYPE: GeometryType.POLYGON,
    },
    {
      RES_TYPE: 'PLAN_GRID',
      GEOMETRY_TYPE: GeometryType.POLYGON,
    },
    {
      RES_TYPE: 'TASK_GRID',
      GEOMETRY_TYPE: GeometryType.POLYGON,
    },
  ];
  return resTypes;
}
// 点线面 不同资源的需要前台传的基础类型
export function getBaseResAttr(geometry, projectinfo) {
  const baseResAttr = {
    projectId: projectinfo.projectId,
    schemaId: projectinfo.schemaId,
    sprintId: projectinfo.sprintId,
    resStatus: 'C',
  };
  if (geometry.geometryType === GeometryType.POINT) {
    baseResAttr.latitude = geometry.y;
    baseResAttr.longitude = geometry.x;
  } else if (geometry.geometryType === GeometryType.POLYLINE) {
    baseResAttr.gisLen = geometry.getTheLength();
  } else if (geometry.geometryType === GeometryType.POLYGON) {
    baseResAttr.gisArea = geometry.getTheArea();
    baseResAttr.isSprintGrid = 'N';
  }
  return baseResAttr;
}
