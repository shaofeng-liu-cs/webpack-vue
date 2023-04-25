/*
 * @Author: HongAnDing
 * @Date: 2022-07-04 10:45:08
 * @LastEditors: 夏嫱 xia.qiang3@iwhalecloud.com
 * @LastEditTime: 2023-04-06 15:46:18
 * @Description: file content
 */
import AirWire from './AirWire';
import Cabinet from './Cabinet';
import CopperCable from './CopperCable';
import DistributionPoint from './DistributionPoint';
import FiberCable from './FiberCable';
import FiberClosure from './FiberClosure';
import Manhole from './Manhole';
import MDF from './MDF';
import ODF from './ODF';
import OLT from './OLT';
import ONU from './ONU';
import OpticalDistributionPoint from './OpticalDistributionPoint';
import Pole from './Pole';
import Site from './Site';
import Splitter from './Splitter';
import OpticalCabinet from './OpticalCabinet';
import OLTGrid from './OLTGrid.js';
import OCCGrid from './OCCGrid.js';
import ODBGrid from './ODBGrid.js';
import Pipeline from './Pipeline.js';
import DemandPoint from './DemandPoint.js';
import Closure from './Closure';
import Route from './Route';
import DemandBuilding from './DemandBuilding.js';
import DemandRoad from './DemandRoad.js';
import PLANGrid from './PLANGrid.js';
import TASKGrid from './TASKGrid.js';
import DemandPole from './DemandPole.js';
import DemandManHole from './DemandManHole.js';
import DemandAirWire from './DemandAirWire.js';
import DemandDuct from './DemandDuct.js';
import Duct from './Duct.js';
import PipeLineJoint from './PipeLineJoint.js';
import MarkerPoint from './MarkerPoint.js';
import MarkerLine from './MarkerLine.js';
import MarkerGrid from './MarkerGrid.js';

const typeHandles = {};
typeHandles[AirWire.type] = AirWire;
typeHandles[Cabinet.type] = Cabinet;
typeHandles[CopperCable.type] = CopperCable;
typeHandles[DistributionPoint.type] = DistributionPoint;
typeHandles[FiberCable.type] = FiberCable;
typeHandles[FiberClosure.type] = FiberClosure;
typeHandles[Manhole.type] = Manhole;
typeHandles[MDF.type] = MDF;
typeHandles[ODF.type] = ODF;
typeHandles[OLT.type] = OLT;
typeHandles[ONU.type] = ONU;
typeHandles[OpticalDistributionPoint.type] = OpticalDistributionPoint;
typeHandles[Pole.type] = Pole;
typeHandles[Site.type] = Site;
typeHandles[Splitter.type] = Splitter;
typeHandles[OpticalCabinet.type] = OpticalCabinet;
typeHandles[OLTGrid.type] = OLTGrid;
typeHandles[OCCGrid.type] = OCCGrid;
typeHandles[ODBGrid.type] = ODBGrid;
typeHandles[Pipeline.type] = Pipeline;
typeHandles[DemandPoint.type] = DemandPoint;
typeHandles[Closure.type] = Closure;
typeHandles[Route.type] = Route;
typeHandles[DemandBuilding.type] = DemandBuilding;
typeHandles[DemandRoad.type] = DemandRoad;
typeHandles[PLANGrid.type] = PLANGrid;
typeHandles[TASKGrid.type] = TASKGrid;
typeHandles[DemandPole.type] = DemandPole;
typeHandles[DemandManHole.type] = DemandManHole;
typeHandles[DemandAirWire.type] = DemandAirWire;
typeHandles[DemandDuct.type] = DemandDuct;
typeHandles[Duct.type] = Duct;
typeHandles[PipeLineJoint.type] = PipeLineJoint;
typeHandles[MarkerPoint.type] = MarkerPoint;
typeHandles[MarkerLine.type] = MarkerLine;
typeHandles[MarkerGrid.type] = MarkerGrid;

const DEFAULT_HANDLER_CACHE = {};

function getHandler(resType) {
  let handler = DEFAULT_HANDLER_CACHE[resType];
  if (!handler) {
    handler = new typeHandles[resType]();
    DEFAULT_HANDLER_CACHE[resType] = handler;
  }
  return handler;
}

export function getContextMenu(resType) {
  const handler = getHandler(resType);
  return handler.getContextMenu();
}
export function getContextTempMenu(resType) {
  const handler = getHandler(resType);
  return handler.getContextTempMenu();
}
export function getMultContextMenu(resTypes) {
  let menus = [];
  resTypes.forEach(layer => {
    const handler = getHandler(layer).getMultContextMenu();
    if (menus.length === 0) {
      menus = handler;
    } else {
      menus = menus.filter(x => handler.some(y => y.seq === x.seq));
    }
  });
  return menus;
}
export function getMultContextTempMenu(resTypes) {
  let menus = [];
  resTypes.forEach(layer => {
    const handler = getHandler(layer).getMultContextTempMenu();
    if (menus.length === 0) {
      menus = handler;
    } else {
      menus = menus.filter(x => handler.some(y => y.seq === x.seq));
    }
  });
  return menus;
}
