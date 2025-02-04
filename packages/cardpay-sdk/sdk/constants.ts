import Web3 from 'web3';
import invert from 'lodash/invert';
import mapValues from 'lodash/mapValues';
import { networkName } from './utils/general-utils';

const INFURA_PROJECT_ID = 'dfb8cbe2e916420a9dbcc1d1f5828406';
const KOVAN_INFURA_URL = 'https://kovan.infura.io/v3';
const KOVAN_WSS_INFURA_URL = 'wss://kovan.infura.io/ws/v3';
const MAINNET_INFURA_URL = 'https://mainnet.infura.io/v3';
const MAINNET_WSS_INFURA_URL = 'wss://mainnet.infura.io/ws/v3';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const MERCHANT_PAYMENT_UNIVERSAL_LINK_HOSTNAME = 'wallet.cardstack.com';
export const MERCHANT_PAYMENT_UNIVERSAL_LINK_STAGING_HOSTNAME = 'wallet-staging.stack.cards';
export const CARDWALLET_SCHEME = 'cardwallet';

const SOKOL = {
  apiBaseUrl: 'https://blockscout.com/poa/sokol/api/eth-rpc',
  /** deployed instance of this contract: https://github.com/wbobeirne/eth-balance-checker */
  balanceCheckerContractAddress: '0xaeDFe60b0732924249866E3FeC71835EFb1fc9fF',
  blockExplorer: 'https://blockscout.com/poa/sokol',
  bridgeExplorer: 'https://alm-test-amb.herokuapp.com/77',
  faucetUrl: 'https://faucet.poa.network',
  nativeTokenAddress: 'spoa',
  nativeTokenCoingeckoId: 'ethereum',
  nativeTokenSymbol: 'SPOA',
  nativeTokenName: 'SPOA',
  bridgedDaiTokenSymbol: 'DAI',
  bridgedCardTokenSymbol: 'CARD',
  name: 'Sokol',
  rpcNode: 'https://sokol.poa.network',
  rpcArchiveNode: 'https://sokol-archive.blockscout.com',
  rpcWssNode: 'wss://sokol.poa.network/wss',
  relayServiceURL: 'https://relay-staging.stack.cards/api',
  subgraphURL: 'https://graph-staging.stack.cards/subgraphs/name/habdelra/cardpay-sokol',
  tallyServiceURL: 'https://tally-service-staging.stack.cards/api/v1',
  merchantUniLinkDomain: MERCHANT_PAYMENT_UNIVERSAL_LINK_STAGING_HOSTNAME,
};
const KOVAN = {
  apiBaseUrl: 'https://api-kovan.etherscan.io/api',
  /** deployed instance of this contract: https://github.com/wbobeirne/eth-balance-checker */
  balanceCheckerContractAddress: '0xf3352813b612a2d198e437691557069316b84ebe',
  blockExplorer: 'https://kovan.etherscan.io',
  bridgeExplorer: 'https://alm-test-amb.herokuapp.com/42',
  faucetUrl: 'https://faucet.kovan.network/',
  nativeTokenAddress: 'eth',
  nativeTokenCoingeckoId: 'ethereum',
  nativeTokenSymbol: 'ETH',
  nativeTokenName: 'Ethereum',
  name: 'Kovan',
  rpcNode: `${KOVAN_INFURA_URL}/${INFURA_PROJECT_ID}`,
  rpcWssNode: `${KOVAN_WSS_INFURA_URL}/${INFURA_PROJECT_ID}`,
  // https://docs.tokenbridge.net/kovan-sokol-amb-bridge/about-the-kovan-sokol-amb shows 1 for finalization rate
  // but making this the same as mainnet so that the dev experience matches prod
  ambFinalizationRate: '20',
};
const MAINNET = {
  apiBaseUrl: 'https://api.etherscan.io/api',
  /** deployed instance of this contract: https://github.com/wbobeirne/eth-balance-checker */
  balanceCheckerContractAddress: '0x4dcf4562268dd384fe814c00fad239f06c2a0c2b',
  blockExplorer: 'https://etherscan.io',
  bridgeExplorer: 'https://alm-xdai.herokuapp.com/1',
  nativeTokenAddress: 'eth',
  nativeTokenCoingeckoId: 'ethereum',
  nativeTokenSymbol: 'ETH',
  nativeTokenName: 'Ethereum',
  name: 'Ethereum Mainnet',
  rpcNode: `${MAINNET_INFURA_URL}/${INFURA_PROJECT_ID}`,
  rpcWssNode: `${MAINNET_WSS_INFURA_URL}/${INFURA_PROJECT_ID}`,
  // check https://docs.tokenbridge.net/eth-xdai-amb-bridge/about-the-eth-xdai-amb for the finalization rate
  ambFinalizationRate: '20',
};
const XDAI = {
  apiBaseUrl: 'https://blockscout.com/xdai/mainnet/api',
  /** deployed instance of this contract: https://github.com/wbobeirne/eth-balance-checker */
  balanceCheckerContractAddress: '0x6B78C121bBd10D8ef0dd3623CC1abB077b186F65',
  blockExplorer: 'https://blockscout.com/xdai/mainnet',
  bridgeExplorer: 'https://alm-xdai.herokuapp.com/100',
  nativeTokenAddress: 'xdai',
  nativeTokenCoingeckoId: 'xdai',
  nativeTokenSymbol: 'XDAI',
  nativeTokenName: 'xDai',
  bridgedDaiTokenSymbol: 'DAI.CPXD',
  bridgedCardTokenSymbol: 'CARD.CPXD',
  name: 'Gnosis Chain',
  rpcNode: 'https://polished-still-thunder.xdai.quiknode.pro/474f8faa313d36e0dc2604c1373655f7e26fdfb6/',
  rpcArchiveNode: 'https://xdai-archive.blockscout.com',
  rpcWssNode: 'wss://polished-still-thunder.xdai.quiknode.pro/474f8faa313d36e0dc2604c1373655f7e26fdfb6/',
  rpcWssNodeNext: 'wss://polished-still-thunder.xdai.quiknode.pro/474f8faa313d36e0dc2604c1373655f7e26fdfb6/',
  relayServiceURL: 'https://relay.cardstack.com/api',
  subgraphURL: 'https://graph.cardstack.com/subgraphs/name/habdelra/cardpay-xdai',
  merchantUniLinkDomain: MERCHANT_PAYMENT_UNIVERSAL_LINK_HOSTNAME,
};

type ConstantKeys = keyof typeof SOKOL | keyof typeof KOVAN | keyof typeof MAINNET | keyof typeof XDAI;

const constants: {
  [network: string]: {
    [prop: string]: string;
  };
} = Object.freeze({
  sokol: SOKOL,
  kovan: KOVAN,
  mainnet: MAINNET,
  xdai: XDAI,
});

export const networks: { [networkId: number]: string } = Object.freeze({
  1: 'mainnet',
  42: 'kovan',
  77: 'sokol',
  100: 'xdai',
});

// invert the networks object, so { '1': 'mainnet', ... } becomes { mainnet: '1', ... }
// then map over the values, so that { mainnet: '1', ... } has its values casted as numbers: { mainnet: 1, ... }
export const networkIds = Object.freeze(
  mapValues(invert({ ...networks }), (networkIdString: string) => Number(networkIdString))
) as unknown as {
  [networkName: string]: number;
};

export function getConstantByNetwork(name: ConstantKeys, network: string): string {
  let value = constants[network][name];
  if (!value) {
    throw new Error(`Don't know about the constant '${name}' for network ${network}`);
  }
  return value;
}

export async function getConstant(name: ConstantKeys, network: string): Promise<string>;
export async function getConstant(name: ConstantKeys, web3: Web3): Promise<string>;
export async function getConstant(name: ConstantKeys, web3OrNetwork: Web3 | string): Promise<string> {
  let network: string;
  if (typeof web3OrNetwork === 'string') {
    network = web3OrNetwork;
  } else {
    network = await networkName(web3OrNetwork);
  }

  let value = constants[network][name];
  if (!value) {
    throw new Error(`Don't know about the constant '${name}' for network ${network}`);
  }
  return value;
}

export default constants;
