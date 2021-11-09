import { ContractMeta } from '../version-resolver';

import v0_8_4 from './v0.8.4';
import v0_8_5 from './v0.8.5';

// add more versions as we go, but also please do drop version that we don't
// want to maintain simultaneously
export type RevenuePool = v0_8_5;

export const revenuePoolMeta = {
  apiVersions: { v0_8_4, v0_8_5 },
  contractName: 'revenuePool',
} as ContractMeta;
