import { loadPanelPortByDevice } from '@/oss_core/edesign/topo/TopoHandleAction.js';

const { fish, ht } = window;
const PORT_GAP = 4;
const PANE_GAP = 8;
const PORT_SIZE = 24;
const DEF_COL_PORT_COUNT = 12;

const LABEL_POSITION_BOTTOM = 31;
const LABEL_POSITION_CENTER = 17;
const LABEL_POSITION_LEFT = 14;
const LABEL_FONT_SMALL = '10px Tahoma';
const LABEL_FONT = '12px Tahoma';
const PORT_FILL_COLOR = '#e8f3ff';
const PORT_BORDER_COLOR = '#5675C1';

const CABLE_BORDER_WIDTH = 8;
const CABLE_FILL_COLOR = '#FAFAFA';
const CABLE_OUTLINE_COLOR = '#8B8989';
const CABLE_DASH_COLOR = '#FFD306';
const CABLE_LABEL_FONT = '12px Tahoma';

const TUBE_BORDER_WIDTH = 2;
const TUBE_FILL_COLOR = '#F5F5F5';
// const TUBE_OUTLINE_COLOR = '#EE00EE';
const TUBE_LABEL_FONT = '12px Tahoma';
const TUBE_LABEL_POSITION = 17;

const CORE_BORDER_WIDTH = 2;
const CORE_FILL_COLOR = '#e8f3ff';
const CORE_FILL_COLOR_CONNECTED = '#aeafc1';
const CORE_FILL_COLOR_CUTED = '#FFFFFF';
// const CORE_OUTLINE_COLOR = '#FFFFFF';
const CORE_LABEL_FONT = '12px Tahoma';
const CORE_LABEL_POSITION = 17;

function getColumnOrRowSize(hwMaxSizeMap, parentId, index, colOrRow) {
  const key = parentId + colOrRow + index;
  const keys = Object.keys(hwMaxSizeMap);
  const haveKey = keys.some(item => item === key);
  if (haveKey) {
    return hwMaxSizeMap[key];
  }
  const findKey = keys.find(item => item.startsWith(parentId + colOrRow));
  if (findKey) {
    return hwMaxSizeMap[findKey];
  }
  return colOrRow === 'C' ? DEF_COL_PORT_COUNT * (PORT_SIZE + PORT_GAP) + PORT_GAP : PORT_SIZE + PORT_GAP + PORT_GAP;
}

function calculatePanelSize(portCount, columns) {
  const rows = Math.floor(portCount % columns === 0 ? portCount / columns : portCount / columns + 1);
  return {
    width: columns * (PORT_SIZE + PORT_GAP) + PORT_GAP,
    height: rows * (PORT_SIZE + PORT_GAP) + PORT_GAP,
  };
}

function analysisData(hwList, hwMaxSizeMap) {
  // 这里入参的硬件列表已经按上级排序
  const hwCount = hwList.length;

  // 从下级开始计算每个硬件的大小
  for (let i = hwCount - 1; i >= 0; i -= 1) {
    const hw = hwList[i];
    const { hardwareId } = hw;

    // 判断是否有下级硬件
    for (let j = i + 1; j < hwCount; j += 1) {
      const subHw = hwList[j];
      if (subHw.parentId === hardwareId) {
        hw.hasSubHardware = true;
        break;
      }
    }

    // 如果硬件上没有子硬件，直接根据行列数计算硬件的大小。
    if (!hw.hasSubHardware) {
      const rowQty = parseInt(hw.rowQty || 1, 10);
      const colQty = parseInt(hw.colQty || hw.members || DEF_COL_PORT_COUNT, 10);

      const size = calculatePanelSize(rowQty * colQty, colQty);
      hw.width = size.width;
      hw.height = size.height;
    } else {
      let rowQty = parseInt(hw.rowQty || 1, 10);
      let colQty = parseInt(hw.colQty || 1, 10);
      if (hw.resSpecId === 'CHASSIS' && !hw.rowQty) {
        rowQty = hw.members;
        colQty = 1;
      }

      // 计算高度
      let height = PANE_GAP;
      for (let y = 1; y <= rowQty; y += 1) {
        height += getColumnOrRowSize(hwMaxSizeMap, hardwareId, y, 'R') + PANE_GAP;
        // if (hwMaxSizeMap[hardwareId + 'R' + i]) {
        //     height += hwMaxSizeMap[hardwareId + 'R' + i] + PANE_GAP;
        // } else {
        //     height += PORT_SIZE + 2 * PORT_GAP + PANE_GAP;
        // }
      }

      let width = PANE_GAP;
      // 计算宽度
      for (let x = 1; x <= colQty; x += 1) {
        width += getColumnOrRowSize(hwMaxSizeMap, hardwareId, x, 'C') + PANE_GAP;
        // if (hwMaxSizeMap[hardwareId + 'C' + i]) {
        //     width += hwMaxSizeMap[hardwareId + 'C' + i] + PANE_GAP;
        // } else {
        //     width += DEF_COL_PORT_COUNT * (PORT_SIZE + PORT_GAP) + PORT_GAP + PANE_GAP;
        // }
      }
      hw.width = width;
      hw.height = height;
    }

    // 记录上级硬件每行最大高度，每列最大宽度。用于计算上级硬件的大小
    const rowNo = hw.resSpecId === 'SLOT' ? hw.seq : parseInt(hw.rowNo || 1, 10);
    const colNo = parseInt(hw.colNo || 1, 10);
    const parentId = !hw.parentId || hw.parentId === '0' ? hw.deviceId : hw.parentId;
    if (parentId) {
      const curMaxHeight = hwMaxSizeMap[`${parentId}R${rowNo}`] || -1;
      if (hw.height > curMaxHeight) {
        hwMaxSizeMap[`${parentId}R${rowNo}`] = hw.height;
      }

      const curMaxWidth = hwMaxSizeMap[`${parentId}C${colNo}`] || -1;
      if (hw.width > curMaxWidth) {
        hwMaxSizeMap[`${parentId}C${colNo}`] = hw.width;
      }
    }
  }

  // 空硬件重新算下大小
  // for (let i = hwCount - 1; i >= 0; i--) {}
}

function drawPort(box, data, parent, posX, posY, startIndex) {
  const node = new ht.Node();
  const showSeq = startIndex + data.seq;
  data.showSeq = showSeq;
  node.setName(startIndex + data.seq);
  node.setToolTip(data.fullName);
  node.setSize(PORT_SIZE, PORT_SIZE);
  const x = parent ? parent.getPosition().x - parent.getSize().width / 2 + PORT_SIZE / 2 + posX : posX;
  const y = parent ? parent.getPosition().y - parent.getSize().height / 2 + PORT_SIZE / 2 + posY : posY;
  node.setPosition(x, y);
  node.setStyle('shape', 'circle');
  node.setStyle('shape.background', PORT_FILL_COLOR);
  node.setStyle('shape.border.color', PORT_BORDER_COLOR);
  node.setStyle('shape.border.width', 2);
  node.setStyle('label.font', LABEL_FONT);
  node.setStyle('label.position', LABEL_POSITION_CENTER);
  // node.setStyle('select.type', 'circle');
  node.setStyle('select.color', 'red');
  // node.setStyle('select.width', 2);
  node.setStyle('select.type', 'shadow');
  node.setStyle('shadow.offset.x', 0);
  node.setStyle('shadow.offset.y', 0);
  node.setStyle('shadow.blur', 5);
  node.setStyle('shadow.color', 'red');
  node.setTag(data.portId);
  node.setParent(parent);
  node.setHost(parent);
  node.movable = false;
  data.baseSpecId = 'PORT';
  node.setAttrObject(data);
  box.add(node);
  return node;
}

function calculateRelativePosition(row, col, index, colQty) {
  let postionObj;
  if (row && col) {
    postionObj = {
      x: (col - 1) * (PORT_SIZE + PORT_GAP) + PORT_GAP,
      y: (row - 1) * (PORT_SIZE + PORT_GAP) + PORT_GAP,
    };
  } else {
    postionObj = {
      x: (index % colQty) * (PORT_SIZE + PORT_GAP) + PORT_GAP,
      y: Math.floor(index / colQty) * (PORT_SIZE + PORT_GAP) + PORT_GAP,
    };
  }
  return postionObj;
}

function drawRect(box, data, parent, width, height, posX, posY, bgColor = 'lightgray', borderColor = 'LightSkyBlue') {
  const node = new ht.Node();
  const name = parent == null ? data.name || data.fullName : '';
  const toolTip = data.fullName || data.name;

  const x = parent ? parent.getPosition().x - parent.getSize().width / 2 + width / 2 + posX : posX;
  const y = parent ? parent.getPosition().y - parent.getSize().height / 2 + height / 2 + posY : posY;
  node.setPosition(x, y);
  node.setName(name);
  node.setToolTip(toolTip);
  node.setSize(width, height);
  node.setStyle('label.scale', 1.5);

  node.setStyle('shape', 'rect'); // 矩形
  node.setStyle('shape.background', bgColor);
  node.setStyle('shape.border.width', 2);
  node.setStyle('shape.border.color', borderColor);
  node.setStyle('label.font', LABEL_FONT);
  node.setStyle('label.position', LABEL_POSITION_BOTTOM);
  // node.setStyle('select.type', 'rect');
  // node.setStyle('select.color', 'LightSkyBlue');
  // node.setStyle('select.width', 2);
  node.setStyle('select.type', 'shadow');
  node.setStyle('shadow.offset.x', 0);
  node.setStyle('shadow.offset.y', 0);
  node.setStyle('shadow.blur', 5);
  node.setParent(parent);
  node.setHost(parent);
  node.movable = false;
  data.baseSpecId = parent == null ? 'DEVICE' : 'HARDWARE';
  node.setAttrObject(data);
  box.add(node);
  return node;
}

function findParentNode(box, parentId) {
  const nodes = box.getDatas();
  let parent = null;
  nodes.each(node => {
    const data = node.getAttrObject();
    // 硬件/设备
    if (data) {
      const { baseSpecId } = data;
      if ((baseSpecId === 'DEVICE' && data.deviceId === parentId) || (baseSpecId === 'HARDWARE' && data.hardwareId === parentId)) {
        parent = node;
        return true;
      }
    }
    return false;
  });
  return parent;
}

function drawSubHw(box, schemaId, parentId, newHwList, hwList, rowQty, colQty, hwMaxSizeMap) {
  let maxWidth = 0; // 整体宽度
  let maxHeight = PANE_GAP; // 整体高度
  let posY = PANE_GAP; // 记录下次画框的位置
  for (let i = 1; i <= rowQty; i += 1) {
    let rowWidth = 0; // 每一行的宽度
    let rowHeight = 0; // 每一行的高度
    let posX = PANE_GAP; // 记录下次画框的位置
    for (let j = 1; j <= colQty; j += 1) {
      const parent = findParentNode(box, parentId);
      let refType = '';
      let designOrdId = '';
      if (parent) {
        refType = parent.getAttrObject().refType || '';
        designOrdId = parent.getAttrObject().designOrdId || '';
      }
      let hwNode;
      let find = false;
      let hwResSpecId = '';
      for (let index = 0; index < newHwList.length; index += 1) {
        const hw = newHwList[index];
        const rowNo = hw.resSpecId === 'SLOT' ? hw.seq : parseInt(hw.rowNo || 1, 10);
        const colNo = parseInt(hw.colNo || 1, 10);
        hwResSpecId = hw.resSpecId;
        if (i === rowNo && j === colNo) {
          // if (hw.hasSubHardware) {
          //     hwNode = drawRect(box, hw, parent, hw.width, hw.height, posX, posY, '#EFF2EF', '#BDC0BF');
          // } else {
          //     let widthNoChild = getColumnOrRowSize(hwMaxSizeMap, parentId, j, 'C');
          //     let heightNoChild = getColumnOrRowSize(hwMaxSizeMap, parentId, i, 'R');
          //     hwNode = drawRect(box, hw, parent, widthNoChild, heightNoChild, posX, posY, '#EFF2EF', '#BDC0BF');
          // }
          hwNode = drawRect(box, hw, parent, hw.width, hw.height, posX, posY, '#EFF2EF', '#BDC0BF');
          let subRowQty = parseInt(hw.rowQty || 1, 10);
          let subColQty = parseInt(hw.colQty || 1, 10);
          if (hw.resSpecId === 'CHASSIS' && !hw.rowQty) {
            subRowQty = hw.members;
            subColQty = 1;
          }
          if (hw.hasSubHardware) {
            const tNewHwList = hwList.filter(item => item.parentId === hw.hardwareId); // 如果有字模块则直接获取子模块数据
            drawSubHw(box, schemaId, hw.hardwareId, tNewHwList, hwList, subRowQty, subColQty, hwMaxSizeMap);
          }
          find = true;
          break;
        }
      }
      if (!find) {
        const data = {
          parentId,
          designOrdId,
          refType,
          rowNo: i.toString(),
          colNo: j.toString(),
          resSpecId: hwResSpecId,
          hardwareId: '',
        };
        const width = getColumnOrRowSize(hwMaxSizeMap, parentId, j, 'C');
        // hwMaxSizeMap[parentId + 'C' + j] || DEF_COL_PORT_COUNT * (PORT_SIZE + PORT_GAP) + PORT_GAP;
        const height = getColumnOrRowSize(hwMaxSizeMap, parentId, i, 'R');
        // hwMaxSizeMap[parentId + 'R' + i] || (PORT_SIZE + PORT_GAP) + PORT_GAP;
        hwNode = drawRect(box, data, parent, width, height, posX, posY, '#EFF2EF', '#BDC0BF');
        hwNode.setStyle('shape.dash', true);
        hwNode.setStyle('shape.dash.pattern', [3]);
      }

      // hwNode.setStyle('label.position', LABEL_POSITION_CENTER);
      hwNode.setStyle('label.position', LABEL_POSITION_LEFT);
      hwNode.setStyle('label.offset.x', -20);
      posX += hwNode.getSize().width + PANE_GAP; // 记录下次画框的位置
      rowWidth += hwNode.getSize().width + PANE_GAP; // 每一行的宽度等于所有列的宽度总和
      if (rowHeight < hwNode.getSize().height) {
        rowHeight = hwNode.getSize().height; // 每一行的高度等于高度最高的那一列的高度
      }
    }
    if (maxWidth < rowWidth) {
      maxWidth = rowWidth + PANE_GAP; // 整体的宽度等于宽度最宽的那一行的宽度
    }
    maxHeight += rowHeight + PANE_GAP; // 整体高度等于所有行的高度总和
    posY = maxHeight; // 记录下次画框的位置
  }
  return {
    width: maxWidth,
    height: maxHeight,
  };
}

function drawPortOnHw(box, portList, startIndex) {
  portList.forEach(port => {
    const { hardwareId } = port;
    if (hardwareId) {
      // ROW COL NO 有问题，用seq 去算 row no, col no
      // let rowNo = port.get('ROW_NO');
      // let colNo = port.get('COL_NO');

      const parent = findParentNode(box, hardwareId);
      if (parent) {
        const index = parent.getChildren().size();
        const colQty = parseInt(parent.getAttrObject().colQty || parent.getAttrObject().members || DEF_COL_PORT_COUNT, 10);
        const relativePos = calculateRelativePosition(port.rowNo, port.colNo, index, colQty);
        drawPort(box, port, parent, relativePos.x, relativePos.y, startIndex);
      }
    }
  });
}

function setPortStyle(box) {
  const nodes = box.getDatas();
  nodes.each(node => {
    const data = node.getAttrObject();
    if (data) {
      const { resSpecId, portUse } = data;
      if (resSpecId === 'SPL_PORT') {
        if (portUse === '1') {
          // 上行
          node.setStyle('shape.border.color', 'Gold');
        } else {
          // 下行
          node.setStyle('shape.border.color', 'LightSeaGreen');
        }
      }
    }
  });
}

function drawDevice(box, schemaId, deviceInfo, hwList, portList, posX, posY, portIndex = 0) {
  const { deviceId } = deviceInfo;

  // 设备面板
  const deviceNode = drawRect(box, deviceInfo, null, 0, 0, posX, posY, '#D4D4D4', '#969698');
  deviceNode.setTag(deviceInfo.deviceId);
  let deviceSize;
  if (hwList.length === 0 && portList.length !== 0) {
    // portList.sort((a, b) => parseInt(a.nameSeq) - parseInt(b.nameSeq));
    portList.forEach((port, index) => {
      const relativePos = calculateRelativePosition(port.rowNo, port.colNo, index, DEF_COL_PORT_COUNT);
      drawPort(box, port, deviceNode, relativePos.x, relativePos.y, portIndex);
    });

    // 设置设备的大小
    deviceSize = calculatePanelSize(portList.length, DEF_COL_PORT_COUNT);
  } else {
    // 记录每块硬件每行，每列的最大width, height
    const hwMaxSizeMap = {};
    analysisData(hwList, hwMaxSizeMap);

    const rowQty = parseInt(deviceInfo.rowsQty || 1, 10);
    const colQty = parseInt(deviceInfo.colsQty || 1, 10);
    const newHwList = hwList.filter(item => item.parentId === deviceId || !item.parentId || item.parentId === '0'); // 直接画设备的子模块
    deviceSize = drawSubHw(box, schemaId, deviceId, newHwList, hwList, rowQty, colQty, hwMaxSizeMap);
    drawPortOnHw(box, portList, portIndex);
    setPortStyle(box);
  }
  deviceNode.setStyle('label.position', 3);
  deviceNode.setStyle('label.offset.y', 0);
  deviceNode.setName(deviceInfo.name);
  // 不好先算出设备size, 只能后面再算
  deviceNode.setSize(deviceSize.width, deviceSize.height);
  deviceNode
    .getChildren()
    .each(child => child.setPosition(child.getPosition().x - deviceSize.width / 2, child.getPosition().y - deviceSize.height / 2));
  deviceNode.setPosition(posX + deviceNode.getSize().width / 2, posY + deviceNode.getSize().height / 2);

  return deviceNode;
}

export function drawDeviceGraphics(schemaId, deviceId, databox, startX, startY, portStartIndex) {
  return new Promise(resolve => {
    const param = {
      deviceId,
      schemaId,
    };
    loadPanelPortByDevice(param).then(deviceList => {
      // console.log(deviceList);
      const space = 25;
      const nodes = [];
      let portIndex = 0;
      if (portStartIndex) {
        portIndex = portStartIndex;
      }
      let newStartY = startY;
      deviceList.forEach(device => {
        const deviceInfo = device.deviceData;
        const hwList = device.hardwareList || [];
        const portList = device.portList || [];
        if (nodes.length !== 0) {
          newStartY += nodes[nodes.length - 1].getSize().height + space;
        }
        // nodes.push(drawDevice.call(this, databox, deviceInfo, hwList, portList, startX, startY, portIndex));
        const deviceNode = drawDevice(databox, schemaId, deviceInfo, hwList, portList, startX, newStartY, portIndex);
        deviceNode.portLength = portList.length;
        deviceNode.portIndex = portIndex;
        deviceNode.movable = true;
        nodes.push(deviceNode);
        portIndex += portList.length;
      });
      resolve(nodes);
    });
  });
}

export function drawDeviceTemplateGraphics(deviceList, databox, startX, startY) {
  const space = 25;
  const nodes = [];
  const portIndex = 0;
  let newStartY = startY;
  deviceList.forEach(device => {
    const deviceInfo = device.deviceData;
    const hwList = device.hardwareList || [];
    const portList = device.portList || [];

    if (nodes.length !== 0) {
      newStartY += nodes[nodes.length - 1].getSize().height + space;
    }
    nodes.push(drawDevice(databox, '', deviceInfo, hwList, portList, startX, newStartY, portIndex));
  });
}

function calculateSubRadius(subCount, radius) {
  let subRadius = radius;
  if (subCount === 1) {
    subRadius = radius;
  } else {
    const a = Math.PI / subCount;
    subRadius = (radius * Math.sin(a)) / (1 + Math.sin(a));
  }
  return subRadius;
}

function calculatePosX(posX, parentRadius, parentRealRadius, subCount, index, subRadius) {
  return posX + parentRadius + Math.sin(((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
}

function calculatePosY(posY, parentRadius, parentRealRadius, subCount, index, subRadius) {
  return posY + parentRadius + Math.cos(Math.PI + ((2 * Math.PI) / subCount) * index) * (parentRealRadius - subRadius) - subRadius;
}

function isConnectFlagFn(seq, cutUnitRecord) {
  let isConnectFlag = false;
  if (cutUnitRecord) {
    const arrUnitList = cutUnitRecord.split(',');
    for (let j = 0; j < arrUnitList.length; j += 1) {
      const arrUnit = arrUnitList[j].split('-');
      const startUnit = Number(arrUnit[0]);
      const endUnit = Number(arrUnit[1]);
      if (!endUnit && Number(seq) === startUnit) {
        isConnectFlag = true;
        break;
      } else if (Number(seq) >= startUnit && Number(seq) <= endUnit) {
        isConnectFlag = true;
        break;
      }
    }
  }

  return isConnectFlag;
}

function drawCore(box, parent, core, index, coreRadius, coreCount, cutUnitRecord, isSHowName) {
  const colorId = core.colourId;
  const posX = parent.getPosition().x;
  const posY = parent.getPosition().y;
  let isConnFlag = false;
  if (cutUnitRecord) {
    isConnFlag = isConnectFlagFn(core.seq, cutUnitRecord);
  } else {
    isConnFlag = true;
  }

  // console.info('core seq: ' + core.seq + ' is ' + isConnFlag);
  const subRadius = parent.getSize().width / 2;
  const x = calculatePosX(posX, subRadius, subRadius - 2, coreCount, index, coreRadius) - parent.getSize().width / 2 + coreRadius;
  const y = calculatePosY(posY, subRadius, subRadius - 2, coreCount, index, coreRadius) - parent.getSize().height / 2 + coreRadius;
  const coreNode = new ht.Node();
  core.baseSpecId = 'CABLE_UNIT';
  core.showSeq = core.seq;
  coreNode.setAttrObject(core);
  if (isSHowName) {
    coreNode.setName(core.seq);
  }
  // coreNode.setToolTip(j + 1);
  coreNode.setPosition(x, y);
  coreNode.setSize(coreRadius * 2 - 2, coreRadius * 2 - 2);
  coreNode.setStyle('shape', 'circle');
  // coreNode.setStyle('shape.background', CORE_FILL_COLOR);
  coreNode.setStyle('shape.border.color', colorId);
  coreNode.setStyle('shape.border.width', CORE_BORDER_WIDTH);
  coreNode.setStyle('label.font', CORE_LABEL_FONT);
  coreNode.setStyle('label.position', CORE_LABEL_POSITION);
  // coreNode.setStyle('select.type', 'circle');
  // coreNode.setStyle('select.color', colorId);
  // coreNode.setStyle('select.width', 4);
  coreNode.setStyle('select.color', 'red');
  coreNode.setStyle('select.type', 'shadow');
  coreNode.setStyle('shadow.offset.x', 0);
  coreNode.setStyle('shadow.offset.y', 0);
  coreNode.setStyle('shadow.blur', 5);
  coreNode.setStyle('shadow.color', 'red');
  if (isConnFlag) {
    coreNode.setStyle('shape.background', CORE_FILL_COLOR_CUTED);
  } else {
    coreNode.setStyle('shape.background', CORE_FILL_COLOR_CONNECTED);
  }
  coreNode.setTag(core.unitId);
  coreNode.setHost(parent);
  coreNode.setParent(parent);
  coreNode.movable = false;
  box.add(coreNode);
}

function drawTube(box, parent, tubes, cores) {
  const posX = parent.getPosition().x;
  const posY = parent.getPosition().y;
  const size = parent.getSize().width;
  const radius = size / 2 - CABLE_BORDER_WIDTH;
  const subCount = tubes.length;
  const subRadius = calculateSubRadius(subCount, radius);
  const { cutUnitRecord } = parent.getAttrObject();
  for (let i = 0; i < subCount; i += 1) {
    const tube = tubes[i];
    const { unitId } = tube;
    const colorId = tube.colourId; // 怀疑有问题

    const x = calculatePosX(posX, size / 2, radius, subCount, i, subRadius) - parent.getSize().width / 2 + subRadius;
    const y = calculatePosY(posY, size / 2, radius, subCount, i, subRadius) - parent.getSize().height / 2 + subRadius;
    const subNode = new ht.Node();
    tube.baseSpecId = 'TUBE';
    subNode.setAttrObject(tube);
    subNode.setName((i + 1).toString());
    subNode.setPosition(x, y);
    subNode.setSize(subRadius * 2 - 2, subRadius * 2 - 2);
    subNode.setStyle('shape', 'circle');
    subNode.setStyle('shape.background', TUBE_FILL_COLOR);
    subNode.setStyle('shape.border.color', colorId);
    subNode.setStyle('shape.border.width', TUBE_BORDER_WIDTH);
    // subNode.setStyle('select.type', 'shadow');
    // subNode.setStyle('shadow.offset.x', 0);
    // subNode.setStyle('shadow.offset.y', 0);
    // subNode.setStyle('shadow.blur', 10);

    subNode.setStyle('select.color', 'red');
    subNode.setStyle('select.type', 'shadow');
    subNode.setStyle('shadow.offset.x', 0);
    subNode.setStyle('shadow.offset.y', 0);
    subNode.setStyle('shadow.blur', 5);
    subNode.setStyle('shadow.color', 'red');

    subNode.setStyle('label.position', TUBE_LABEL_POSITION);
    subNode.setStyle('label.font', TUBE_LABEL_FONT);
    subNode.movable = true;
    subNode.setHost(parent);
    subNode.setParent(parent);
    box.add(subNode);
    parent.setHost(subNode);

    const tubeCores = cores.filter(core => core.parentId === unitId);
    const coreCount = tubeCores.length;
    const coreRadius = calculateSubRadius(coreCount, subRadius - 2 * TUBE_BORDER_WIDTH);
    for (let j = 0; j < coreCount; j += 1) {
      drawCore(box, subNode, tubeCores[j], j, coreRadius, coreCount, cutUnitRecord, !(cores.length > 96));
    }
  }
}

function drawCable(box, cableInfo, cableUnits, posX, posY, size) {
  // 光缆
  const node = new ht.Node();
  node.setName(cableInfo.name);
  node.setPosition(posX + size / 2, posY + size / 2);
  node.setSize(size, size);
  node.setStyle('shape', 'circle');
  node.setStyle('shape.background', CABLE_FILL_COLOR);
  node.setStyle('shape.border.color', CABLE_OUTLINE_COLOR);
  node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
  node.setStyle('shape.dash', true);
  node.setStyle('shape.dash.pattern', [2000]);
  node.setStyle('shape.dash.color', CABLE_DASH_COLOR);
  node.setStyle('shape.dash.width', 1);
  node.setStyle('label.position', 3);
  node.setStyle('label.offset.y', -10);

  // node.setStyle('select.type', 'shadow');
  // node.setStyle('shadow.offset.x', 0);
  // node.setStyle('shadow.offset.y', 0);
  // node.setStyle('shadow.blur', 10);
  node.setStyle('select.color', 'red');
  node.setStyle('select.type', 'shadow');
  node.setStyle('shadow.offset.x', 0);
  node.setStyle('shadow.offset.y', 0);
  node.setStyle('shadow.blur', 5);
  node.setStyle('shadow.color', 'red');

  node.setStyle('label.font', CABLE_LABEL_FONT);
  node.setStyle('label.scale', 1.5);
  node.movable = true;
  cableInfo.baseSpecId = 'CABLE';
  node.setAttrObject(cableInfo);
  box.add(node);

  const tubes = cableUnits.filter(unit => unit.resSpecId === 'TUBE');
  const cores = cableUnits.filter(unit => unit.resSpecId === 'FIBER_CORE');
  drawTube(box, node, tubes, cores);
  return node;
}

export function drawCableGraphics(schemaId, cableId, deviceId, databox, startX, startY, size) {
  return new Promise((resolve, reject) => {
    const param = {
      deviceId,
      schemaId,
    };
    fish.get({
      url: `edesign/cable/query/${cableId}/topo/v1`,
      data: param,
      success: result => {
        const cableInfo = result.cable;
        const { cutUnitRecord } = result;
        cableInfo.cutUnitRecord = cutUnitRecord;
        const { cableUnits } = result || { cableUnits: [] };
        const node = drawCable.call(this, databox, cableInfo, cableUnits, startX, startY, size);
        resolve([node]);
      },
      error: reject,
    });
  });
}

// export function drawCirclePipe(box, size, subCount, startX, startY) {
//   return drawCirclePipe.call(this, size, startX, startY, box);
// }

// export function drawPortNodeLegend(view) {
//   drawPortNodeLegend.call(view);
// }

/**
 * 绘制方形格子
 * subCount: 子格子数
 * size: 大小
 * @return
 */
function drawCirclePipe(subCount, size, xPos, yPos, box, parent, data) {
  const pane = new ht.Node();
  let newSubCount = subCount;
  pane.setToolTip(data.name || data.fullName);
  pane.setName('');
  pane.setSize(size, size);
  pane.setPosition(xPos, yPos);
  pane.setStyle('shape', 'circle');
  pane.setStyle('shape.background', '#ffffff');
  pane.setStyle('shape.border.width', 1);
  pane.setStyle('shape.border.color', 'gray');

  pane.setStyle('select.type', 'shadow');
  pane.setStyle('shadow.offset.x', 0);
  pane.setStyle('shadow.offset.y', 0);
  pane.setStyle('shadow.blur', 5);
  pane.setParent(parent);
  pane.setTag(data.pipeChannelId);
  pane.setAttrObject(data);
  pane.movable = false;
  box.add(pane);

  let isCenter = false;
  if (subCount > 4) {
    isCenter = true;
    newSubCount = subCount - 1;
  }

  const space = newSubCount === 1 ? 6 : 1;
  let coreRadius = calculateSubRadius(newSubCount, size / 2) - space;
  if (isCenter) {
    if (newSubCount === 4) {
      coreRadius = size / 6 - 1;
    } else if (newSubCount === 5) {
      coreRadius = size / 2 - coreRadius * 2;
    }
  }

  for (let i = 0; i < newSubCount; i += 1) {
    const subData = data.holeList[i];
    const radius = size / 2;
    const x = calculatePosX(xPos, radius, radius - space, newSubCount, i, coreRadius) - size / 2 + coreRadius;
    const y = calculatePosY(yPos, radius, radius - space, newSubCount, i, coreRadius) - size / 2 + coreRadius;

    const node = new ht.Node();
    node.movable = false;
    node.setName((i + 1).toString());
    node.setSize(coreRadius * 2, coreRadius * 2);
    node.setPosition(x, y);
    node.setStyle('shape', 'circle'); // 矩形
    node.setStyle('shape.background', '#ffffff');
    node.setStyle('shape.border.width', 1);
    node.setStyle('shape.border.color', '#08daff');
    node.setStyle('label.position', 17);
    node.setStyle('label.font', LABEL_FONT_SMALL);
    node.setStyle('select.type', 'shadow');
    node.setStyle('shadow.offset.x', 0);
    node.setStyle('shadow.offset.y', 0);
    node.setStyle('shadow.blur', 5);
    node.setParent(pane);
    node.setHost(pane);
    node.setTag(subData.pipeChannelId);
    node.setAttrObject(subData);
    box.add(node);
  }

  if (isCenter) {
    const subData = data.holeList[newSubCount];
    const node = new ht.Node();
    node.movable = false;
    node.setName((newSubCount + 1).toString());
    node.setSize(coreRadius * 2, coreRadius * 2);
    node.setPosition(xPos, yPos);
    node.setStyle('shape', 'circle'); // 矩形
    node.setStyle('shape.background', '#ffffff');
    node.setStyle('shape.border.width', 1);
    node.setStyle('shape.border.color', '#08daff');
    node.setStyle('label.position', 17);
    node.setStyle('label.font', LABEL_FONT_SMALL);
    node.setStyle('select.type', 'shadow');
    node.setStyle('shadow.offset.x', 0);
    node.setStyle('shadow.offset.y', 0);
    node.setStyle('shadow.blur', 5);
    node.setParent(pane);
    node.setHost(pane);
    node.setTag(subData.pipeChannelId);
    node.setAttrObject(subData);
    box.add(node);
  }
  return pane;
}

/**
 * 绘制方形格子
 * subCount: 子格子数
 * size: 大小
 * @return
 */
function drawRectPipe(subCount, size, xPos, yPos, box, parent, data) {
  const space = 4;
  // 方形
  const col = Math.ceil(Math.sqrt(subCount));
  let row = col;
  while ((row - 1) * col >= subCount) {
    row = col - 1;
  }

  const pane = new ht.Node();
  pane.setName('');
  pane.setSize(size, size);
  pane.setPosition(xPos, yPos);
  pane.setStyle('shape', 'rect'); // 矩形
  pane.setStyle('shape.background', '#ffffff');
  pane.setStyle('shape.border.width', 1);
  pane.setStyle('shape.border.color', 'gray');
  pane.setStyle('select.type', 'shadow');
  pane.setStyle('shadow.offset.x', 0);
  pane.setStyle('shadow.offset.y', 0);
  pane.setStyle('shadow.blur', 5);
  pane.setParent(parent);
  pane.setTag(data.pipeChannelId);
  pane.setAttrObject(data);
  box.add(pane);

  const subWidth = (size - space * (col + 1)) / col;
  const subHeight = (size - space * (row + 1)) / row;
  let index = 0;
  for (let i = row; i > 0; i -= 1) {
    for (let j = 1; j <= col; j += 1) {
      const subData = data.holeList[index];
      const x = xPos - size / 2 + (subWidth + space) * (j - 1) + space + subWidth / 2;
      const y = yPos - size / 2 + (i - 1) * (subHeight + space) + space + subHeight / 2;

      const node = new ht.Node();
      node.setName((index += 1).toString());
      node.setSize(subWidth, subHeight);
      node.setPosition(x, y);
      node.setStyle('shape', 'rect'); // 矩形
      node.setStyle('shape.background', '#ffffff');
      node.setStyle('shape.border.width', 1);
      node.setStyle('shape.border.color', '#08daff');
      node.setStyle('label.position', 17);
      node.setStyle('label.font', LABEL_FONT_SMALL);
      node.setStyle('select.type', 'shadow');
      node.setStyle('shadow.offset.x', 0);
      node.setStyle('shadow.offset.y', 0);
      node.setStyle('shadow.blur', 5);
      node.setHost(pane);
      node.setTag(subData.pipeChannelId);
      node.setAttrObject(subData);
      box.add(node);
      if (index >= subCount) {
        break;
      }
    }
  }
  return pane;
}

/**
 * 7孔梅花管
 * oSize: 大小
 * @return
 */
function drawHexagonPipe(size, xPos, yPos, box, parent, data) {
  const pane = new ht.Node();
  pane.setName('');
  pane.setSize(size, size);
  pane.setPosition(xPos, yPos);
  pane.setStyle('shape', 'polygon');
  pane.setStyle('shape.polygon.side', 6);
  pane.setStyle('shape.border.width', 1);
  pane.setStyle('select.type', 'shadow');
  pane.setStyle('shadow.offset.x', 0);
  pane.setStyle('shadow.offset.y', 0);
  pane.setStyle('shadow.blur', 5);
  pane.setStyle('shape.border.color', 'gray');
  pane.setStyle('shape.background', '#ffffff');
  pane.setParent(parent);
  pane.setTag(data.pipeChannelId);
  pane.setAttrObject(data);
  box.add(pane);

  const subSize = (size * Math.sin(Math.PI / 3)) / 3 - 3;
  for (let i = 0; i < 7; i += 1) {
    const subData = data.holeList[i];
    let x;
    let y;
    if (i === 0) {
      x = xPos - subSize;
      y = yPos - subSize / 2;
    } else if (i === 1) {
      x = xPos - subSize;
      y = yPos + subSize / 2;
    } else if (i === 2) {
      x = xPos;
      y = yPos - subSize;
    } else if (i === 3) {
      x = xPos;
      y = yPos;
    } else if (i === 4) {
      x = xPos;
      y = yPos + subSize;
    } else if (i === 5) {
      x = xPos + subSize;
      y = yPos - subSize / 2;
    } else if (i === 6) {
      x = xPos + subSize;
      y = yPos + subSize / 2;
    }

    const node = new ht.Node();
    node.setName((i + 1).toString());
    node.setSize(subSize, subSize);
    node.setPosition(x, y);
    node.setStyle('shape', 'polygon');
    node.setStyle('shape.polygon.side', 6);
    node.setStyle('shape.border.width', 1);
    node.setStyle('label.position', 17); // 中间
    node.setStyle('label.font', LABEL_FONT_SMALL);
    node.setStyle('shape.border.color', '#08daff');
    node.setStyle('shape.background', '#ffffff');
    node.setParent(pane);
    node.setTag(subData.pipeChannelId);
    node.setAttrObject(subData);
    box.add(node);
  }
  return parent;
}

function drawCableInHole(cable, parent, box, cableWidth, cableHeight, cableX, cableY) {
  const node = new ht.Node();
  node.setToolTip(cable.name);
  // node.setName(cable.name);
  // let x;
  // let y;
  // let size = 16;
  // let index = parent.getAttr('subIndex') || 0;
  // if (index === 0) {
  //     x = parent.getPosition().x;
  //     y = parent.getPosition().y;
  // }
  // else if (index % 4 === 0) {
  //     x = parent.getPosition().x;
  //     y = parent.getPosition().y - index / 4 * size + size;
  // }
  // else if (index % 4 === 1) {
  //     x = parent.getPosition().x + index / 4 * size + size;
  //     y = parent.getPosition().y;
  // }
  // else if (index % 4 === 2) {
  //     x = parent.getPosition().x;
  //     y = parent.getPosition().y + index / 4 * size + size;
  // }
  // else if (index % 4 === 3) {
  //     x = parent.getPosition().x - index / 4 * size + size;
  //     y = parent.getPosition().y;
  // }
  node.movable = false;
  node.setPosition(cableX, cableY);
  node.setSize(cableWidth, cableHeight);
  node.setStyle('shape', 'circle');
  node.setStyle('shape.background', '#c1911c');
  node.setStyle('shape.border.width', 0);
  node.setStyle('select.color', 'red');
  node.setStyle('select.type', 'shadow');
  node.setStyle('shadow.offset.x', 0);
  node.setStyle('shadow.offset.y', 0);
  node.setStyle('shadow.blur', 5);
  node.setStyle('shadow.color', 'red');
  node.setParent(parent);
  node.setHost(parent);

  node.setAttrObject(cable);
  box.add(node);
}

// 这个方法，startX, startY 为中心点
export function drawDuctGraphics(ductData, box, size, startX, startY, labelPostion) {
  const ductPane = new ht.Node();
  ductPane.setPosition(startX, startY);
  ductPane.setName(ductData.name);
  ductPane.setSize(size, size);
  ductPane.setStyle('label.scale', 1);
  ductPane.setStyle('shape', 'rect'); // 矩形
  ductPane.setStyle('shape.background', '#FFFFFF');
  ductPane.setStyle('shape.border.width', 1);
  ductPane.setStyle('shape.border.color', 'blue');
  ductPane.setStyle('label.font', LABEL_FONT);
  ductPane.setStyle('label.position', labelPostion);
  ductPane.setStyle('select.type', 'shadow');
  ductPane.setStyle('shadow.offset.x', 0);
  ductPane.setStyle('shadow.offset.y', 0);
  ductPane.setStyle('shadow.blur', 5);
  ductPane.setTag(ductData.pipelineId);
  ductPane.setAttrObject(ductData);
  box.add(ductPane);

  const rowQty = ductData.rowQty || 6;
  const colQty = ductData.colQty || 6;
  const blockList = ductData.pipeLineList || [];
  const sideQty = rowQty > colQty ? rowQty : colQty; // 几X几方块
  const space = 4;
  const subSize = (size - sideQty * space - space) / sideQty;

  // 管道块
  blockList.forEach((block, index) => {
    const shape = block.sectionalShape;
    let rowNo = block.rowNo || 1;
    let colNo = block.colNo || 1;
    if (!block.rowNo) {
      rowNo = Math.floor(index / rowQty) + 1;
      colNo = (index % colQty) + 1;
    }
    const holeList = block.holeList || [];
    const subCount = holeList.length;
    const x = startX - size / 2 + (colNo - 1) * (subSize + space) + space + subSize / 2;
    const y = startY + size / 2 - rowNo * (subSize + space) + subSize / 2;
    if (shape === 'C') {
      drawCirclePipe.call(this, subCount, subSize, x, y, box, ductPane, block);
    } else if (shape === 'S') {
      drawRectPipe.call(this, subCount, subSize, x, y, box, ductPane, block);
    } else if (shape === 'H') {
      drawHexagonPipe.call(this, subSize, x, y, box, ductPane, block);
    }

    holeList.forEach(hole => {
      const parent = box.getDataByTag(hole.pipeChannelId);
      const cableList = hole.cableList || [];
      if (cableList.length > 0) {
        const posX = parent.getPosition().x; // parent.getLocation().x;
        const posY = parent.getPosition().y;
        const diameter = parent.getSize().width;
        const newSize = diameter;
        const radius = diameter / 2 - CABLE_BORDER_WIDTH;
        const newSubCount = cableList.length;
        const subRadius = calculateSubRadius(newSubCount, radius);
        const postWidth = calculatePosX(0, newSize / 4, radius, newSubCount, 0, subRadius);

        cableList.forEach((cable, ind) => {
          const newX = calculatePosX(posX, newSize / 4, radius, newSubCount, ind, subRadius);
          const newY = calculatePosY(posY, newSize / 4, radius, newSubCount, ind, subRadius);

          const cableX = newX - postWidth;
          const cableY = newY - postWidth;
          let cableWidth = subRadius * 2;
          let cableHeight = subRadius * 2;
          if (newSubCount === 1) {
            cableWidth = diameter / 2;
            cableHeight = diameter / 2;
          }
          drawCableInHole.call(this, cable, parent, box, cableWidth, cableHeight, cableX, cableY);
        });
      }
    });
  });
}

export function drawPipeLineGraphics(pipeLineData, box, size, startX, startY) {
  const block = pipeLineData;
  const shape = block.sectionalShape;
  const holeList = block.holeList || [];
  const subCount = holeList.length;
  const x = startX;
  const y = startY;
  let ductPane;
  if (shape === 'C') {
    drawCirclePipe.call(this, subCount, size, x, y, box, ductPane, block);
  } else if (shape === 'S') {
    drawRectPipe.call(this, subCount, size, x, y, box, ductPane, block);
  } else if (shape === 'H') {
    drawHexagonPipe.call(this, size, x, y, box, ductPane, block);
  }

  holeList.forEach((hole, cableI) => {
    const parent = box.getDataByTag(hole.pipeChannelId);
    const cableList = hole.cableList || [];
    if (cableList.length > 0) {
      const posX = parent.getPosition().x; // parent.getLocation().x;
      const posY = parent.getPosition().y;
      const diameter = parent.getSize().width;
      const newSize = diameter;
      const radius = diameter / 2 - CABLE_BORDER_WIDTH;
      const newSubCount = cableList.length;
      const subRadius = calculateSubRadius(newSubCount, radius);
      const postWidth = calculatePosX(0, newSize / 4, radius, newSubCount, 0, subRadius);

      cableList.forEach(cable => {
        const newX = calculatePosX(posX, newSize / 4, radius, newSubCount, cableI, subRadius);
        const newY = calculatePosY(posY, newSize / 4, radius, newSubCount, cableI, subRadius);

        const cableX = newX - postWidth;
        const cableY = newY - postWidth;
        let cableWidth = subRadius * 2;
        let cableHeight = subRadius * 2;
        if (newSubCount === 1) {
          cableWidth = diameter / 2;
          cableHeight = diameter / 2;
        }
        drawCableInHole.call(this, cable, parent, box, cableWidth, cableHeight, cableX, cableY);
      });
    }
  });
}

export function getDefaultCoreFillColor() {
  return CORE_FILL_COLOR;
}

export function getConnectedCoreFillColor() {
  return CORE_FILL_COLOR_CONNECTED;
}

function redrawPortOnHw(box, parent, portList, startIndex) {
  portList.forEach(port => {
    const { hardwareId } = port;
    if (hardwareId) {
      // ROW COL NO 有问题，用seq 去算 row no, col no
      // let rowNo = port.get('ROW_NO');
      // let colNo = port.get('COL_NO');

      // let parent = findParentNode(box, hardwareId);
      if (parent) {
        const index = parent.getChildren().size();
        const colQty = parseInt(parent.getAttrObject().colQty || parent.getAttrObject().members || DEF_COL_PORT_COUNT, 10);
        const relativePos = calculateRelativePosition(port.rowNo, port.colNo, index, colQty);
        drawPort(box, port, parent, relativePos.x, relativePos.y, startIndex);
      }
    }
  });
}

export function drawPortOnHwGraphics(box, parentNode, portList, portIndex) {
  redrawPortOnHw.call(this, box, parentNode, portList, portIndex);
}

function drawLegendCircle(box, name, parent, posX, posY, bgColor, borderColor) {
  const node = new ht.Node();
  node.setPosition(posX, posY);
  node.setSize(PORT_SIZE, PORT_SIZE);
  node.setName(name);
  node.setStyle('shape', 'circle');
  node.setStyle('shape.background', bgColor);
  node.setStyle('shape.border.color', borderColor);
  node.setStyle('shape.border.width', 2);
  node.setStyle('select.color', borderColor);
  node.setStyle('select.type', 'circle');
  node.setStyle('label.position', 'right.right');
  node.setStyle('label.font', LABEL_FONT);
  node.setStyle('label.offset.x', 5);
  node.setParent(parent);
  node.movable = false;
  box.add(node);
}

// 端口图例
export function drawPortNodeLegend(view) {
  const width = 160;
  const height = 160;
  let posX = view.offsetWidth - width - 30;
  let posY = view.offsetHeight - height - 30;
  const gap = 2 * PORT_GAP;
  const box = view.getDataModel();
  const parent = drawRect(box, {}, null, width, height, posX, posY, '#EFF2EF', '#BDC0BF');
  parent.movable = true;

  posX += PORT_GAP;
  posY += PORT_GAP;
  [
    {
      label: 'Normal Port',
      bgColor: 'white',
      borderColor: '#5675C1',
    },
    {
      label: 'Uplink Port',
      bgColor: 'white',
      borderColor: 'Gold',
    },
    {
      label: 'Downlink Port',
      bgColor: 'white',
      borderColor: 'LightSeaGreen',
    },
    {
      label: 'Connected Port',
      bgColor: 'Wheat',
      borderColor: '#5675C1',
    },
    {
      label: 'UnConnected Port',
      bgColor: 'white',
      borderColor: '#5675C1',
    },
  ].forEach(legend => {
    drawLegendCircle(box, legend.label, parent, posX, posY, legend.bgColor, legend.borderColor);
    posY += PORT_SIZE + gap;
  });

  return parent;
}
