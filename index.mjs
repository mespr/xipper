/**
 * there must be a more straightforward way to export a bundle of classes
 * to be imported like `import {Xipper} from '<src>/xipper'
 */

import XipperClass from './Xipper.mjs';
import XipperMonitorClass from './XipperMonitor.mjs';

export class Xipper extends XipperClass {}
export class XipperMonitor extends XipperMonitorClass {}