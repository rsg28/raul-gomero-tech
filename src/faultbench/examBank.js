import { APLUS } from './bankAplus.js';
import { GENERAL } from './bankGeneral.js';
import { NETSEC } from './bankNetSec.js';
import { stampCase } from './tracks.js';

export const EXAM_CASES = [...APLUS, ...NETSEC, ...GENERAL].map((c) => stampCase(c, c.track));
