const { fish, ht } = window;

const CABLE_BORDER_WIDTH = 2;
const CABLE_FILL_COLOR = '#F4F4F4';
const CABLE_OUTLINE_COLOR = '#8B8989';
const CABLE_DASH_COLOR = '#FFD306';
const CABLE_LABEL_FONT = '12px Tahoma';

const TUBE_BORDER_WIDTH = 1;
const TUBE_FILL_COLOR = '#F5F5F5';
const TUBE_LABEL_FONT = '12px Tahoma';
const TUBE_LABEL_POSITION = 17;

const CORE_BORDER_WIDTH = 1;
const CORE_FILL_COLOR_CONNECTED = '#aeafc1';
const CORE_FILL_COLOR_CUTED = '#FFFFFF';
const CORE_LABEL_FONT = '12px Tahoma';
const CORE_LABEL_POSITION = 17;

const MAP_COLOR_SIZE = 10;

function isConnectFlagFn(seq, cutUnitRecord) {
  let isConnectFlag = false;
  if (cutUnitRecord) {
    const arrUnitList = cutUnitRecord.split(',');
    for (let j = 0; j < arrUnitList.length; j += 1) {
      const arrUnit = arrUnitList[j].split('-');
      const startUnit = Number(arrUnit[0]);
      const endUnit = Number(arrUnit[1]);
      if (Number(seq) >= startUnit && Number(seq) <= endUnit) {
        isConnectFlag = true;
        break;
      }
    }
  }

  return isConnectFlag;
}

function drawCoreColor(box, colorPanelNode, tubes, cores, posX, posY) {
  if (tubes.length > 0) {
    const tube = tubes[0];
    const coreList = cores.filter(core => core.parentId === tube.unitId);
    const panelHeight = coreList.length * 20;
    const panelWidth = colorPanelNode.getSize().width;
    colorPanelNode.setPosition(posX + panelWidth / 2 + 200, posY + panelHeight / 2);
    colorPanelNode.setSize(200, panelHeight);
    const colorX = colorPanelNode.getPosition().x + 20 - panelWidth / 2;
    const colorY = colorPanelNode.getPosition().y - panelHeight / 2;

    for (let i = 0; i < coreList.length; i += 1) {
      const core = coreList[i];
      const coreColor = {
        name: core.colourId,
        color: core.colourId,
        baseSpecId: 'COLOR_PANEL',
      };
      const newPosY = colorY + i * (MAP_COLOR_SIZE + 10) + 10;
      const coreNode = new ht.Node();
      coreNode.setAttrObject(coreColor);
      coreNode.setName(coreColor.name);
      coreNode.setLayer('Layer3');
      coreNode.setPosition(colorX, newPosY);
      coreNode.setSize(MAP_COLOR_SIZE, MAP_COLOR_SIZE);
      coreNode.setStyle('shape', 'circle');
      coreNode.setStyle('vector.shape', 'circle');
      coreNode.setStyle('shape.border.width', 1);
      coreNode.setStyle('shape.background', coreColor.color);
      coreNode.setStyle('shape.border.color', coreColor.color);
      coreNode.setStyle('label.font', CORE_LABEL_FONT);
      coreNode.setStyle('select.color', 'red');
      coreNode.setStyle('select.type', 'shadow');
      coreNode.setStyle('shadow.offset.x', 0);
      coreNode.setStyle('shadow.offset.y', 0);
      coreNode.setStyle('shadow.color', 'red');
      coreNode.setStyle('label.position', 20);
      coreNode.setStyle('label.offset.x', 10);
      coreNode.setParent(colorPanelNode);
      coreNode.setHost(colorPanelNode);
      box.add(coreNode);
    }
  }
}

function drawCableColorPanel(box, cableInfo, cableUnits, posX, posY) {
  // 颜色面板
  const colorPanel = {
    name: this.$t('OSP_MAP_FUNCTION_COLOR_TITLE'),
    baseSpecId: 'COLOR_PANEL',
  };
  const node = new ht.Node();
  node.setName(colorPanel.name);
  node.setPosition(posX, posY);
  node.setSize(200, 200);
  node.setStyle('shape', 'rect');
  node.setStyle('shape.background', CABLE_FILL_COLOR);
  node.setStyle('shape.border.color', CABLE_OUTLINE_COLOR);
  node.setStyle('shape.border.width', CABLE_BORDER_WIDTH);
  node.setStyle('shape.dash', true);
  node.setStyle('shape.dash.pattern', [2000]);
  node.setStyle('shape.dash.color', CABLE_DASH_COLOR);
  node.setStyle('shape.dash.width', 1);
  node.setStyle('label.position', 3);
  node.setStyle('label.offset.y', -10);

  node.setStyle('label.font', CABLE_LABEL_FONT);
  node.setStyle('label.scale', 1.5);
  node.movable = false;
  node.setAttrObject(colorPanel);
  box.add(node);

  const tubes = cableUnits.filter(unit => unit.resSpecId === 'TUBE');
  const cores = cableUnits.filter(unit => unit.resSpecId === 'FIBER_CORE');
  drawCoreColor(box, node, tubes, cores, posX, posY);
  return node;
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

function drawCore(box, parent, core, index, coreRadius, coreCount, cutUnitRecord) {
  const colorId = core.colourId;
  const posX = parent.getPosition().x;
  const posY = parent.getPosition().y;
  let isConnFlag = false;
  if (cutUnitRecord) {
    isConnFlag = isConnectFlagFn(core.seq, cutUnitRecord);
  } else {
    isConnFlag = true;
  }

  const subRadius = parent.getSize().width / 2;
  const x = calculatePosX(posX, subRadius, subRadius - 2, coreCount, index, coreRadius) - parent.getSize().width / 2 + coreRadius;
  const y = calculatePosY(posY, subRadius, subRadius - 2, coreCount, index, coreRadius) - parent.getSize().height / 2 + coreRadius;
  const coreNode = new ht.Node();
  core.baseSpecId = 'CABLE_UNIT';
  core.showSeq = core.seq;
  coreNode.setAttrObject(core);
  coreNode.setName(core.seq);
  coreNode.setPosition(x, y);
  coreNode.setSize(coreRadius * 2 - 2, coreRadius * 2 - 2);
  coreNode.setStyle('shape', 'circle');
  coreNode.setStyle('shape.border.color', colorId);
  coreNode.setStyle('shape.border.width', CORE_BORDER_WIDTH);
  coreNode.setStyle('label.font', CORE_LABEL_FONT);
  coreNode.setStyle('label.position', CORE_LABEL_POSITION);
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
    const colorId = tube.colourId;

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

    subNode.setStyle('select.color', 'red');
    subNode.setStyle('select.type', 'shadow');
    subNode.setStyle('shadow.offset.x', 0);
    subNode.setStyle('shadow.offset.y', 0);
    subNode.setStyle('shadow.blur', 5);
    subNode.setStyle('shadow.color', 'red');

    subNode.setStyle('label.position', TUBE_LABEL_POSITION);
    subNode.setStyle('label.font', TUBE_LABEL_FONT);
    subNode.movable = false;
    subNode.setHost(parent);
    subNode.setParent(parent);
    box.add(subNode);

    const tubeCores = cores.filter(core => core.parentId === unitId);
    const coreCount = tubeCores.length;
    const coreRadius = calculateSubRadius(coreCount, subRadius - 2 * TUBE_BORDER_WIDTH);
    for (let j = 0; j < coreCount; j += 1) {
      drawCore(box, subNode, tubeCores[j], j, coreRadius, coreCount, cutUnitRecord);
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

  node.setStyle('select.color', 'red');
  node.setStyle('select.type', 'shadow');
  node.setStyle('shadow.offset.x', 0);
  node.setStyle('shadow.offset.y', 0);
  node.setStyle('shadow.blur', 5);
  node.setStyle('shadow.color', 'red');

  node.setStyle('label.font', CABLE_LABEL_FONT);
  node.setStyle('label.scale', 1.5);
  node.movable = false;
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
      schemaId,
    };
    fish.get({
      // url: `edesign/cable/query/${cableId}/topo/v1?deviceId=${deviceId}`,
      url: `edesign/cable/query/${cableId}/topo/v1`,
      data: param,
      success: result => {
        const cableInfo = result.cable;
        const { cutUnitRecord } = result;
        cableInfo.cutUnitRecord = cutUnitRecord;
        const cableUnits = result.cableUnits || [];
        const node = drawCable.call(this, databox, cableInfo, cableUnits, startX, startY, size);

        const nodeColor = drawCableColorPanel.call(this, databox, cableInfo, cableUnits, startX + 200, startY, size);

        resolve([node, nodeColor]);
      },
      error: reject,
    });
  });
}
