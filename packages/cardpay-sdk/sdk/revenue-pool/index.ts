import { ContractMeta } from '../version-resolver';

import v0_8_7 from './v0.8.7';

// add more versions as we go, but also please do drop version that we don't
// want to maintain simultaneously
export type RevenuePool = v0_8_7;

export const revenuePoolMeta = {
  apiVersions: { v0_8_7 },
  contractName: 'revenuePool',
} as ContractMeta;
