import { Argv } from 'yargs';
import { getWeb3, NETWORK_OPTION_ANY } from '../utils';
import { Arguments, CommandModule } from 'yargs';
import Web3 from 'web3';
import { getSDK } from '@cardstack/cardpay-sdk';
const { toWei } = Web3.utils;

export default {
  command: 'usd <token> [amount]',
  describe: 'Get the USD value for the specified token in the specified amount',
  builder(yargs: Argv) {
    return yargs
      .positional('token', {
        type: 'string',
        description: 'The token symbol (without the .CPXD suffix)',
      })
      .positional('amount', {
        type: 'string',
        default: '1',
        description: 'The amount of the specified token (*not* in units of wei, but in eth)',
      })
      .options({
        network: NETWORK_OPTION_ANY,
      });
  },
  async handler(args: Arguments) {
    let { network, mnemonic, token, amount } = args as unknown as {
      network: string;
      token: string;
      amount: string;
      mnemonic?: string;
    };
    if (token.toUpperCase() === 'ETH') {
      await ethToUsdPrice(network, amount, mnemonic);
    } else {
      await usdPrice(network, token, amount, mnemonic);
    }
  },
} as CommandModule;

async function ethToUsdPrice(network: string, ethAmount: string, mnemonic?: string): Promise<void> {
  let web3 = await getWeb3(network, mnemonic);
  let ethAmountInWei = toWei(ethAmount);
  let layerOneOracle = await getSDK('LayerOneOracle', web3);
  let usdPrice = await layerOneOracle.ethToUsd(ethAmountInWei);
  console.log(`USD value: $${usdPrice.toFixed(2)} USD`);
}

async function usdPrice(network: string, token: string, amount: string, mnemonic?: string): Promise<void> {
  let web3 = await getWeb3(network, mnemonic);
  let amountInWei = toWei(amount);
  let layerTwoOracle = await getSDK('LayerTwoOracle', web3);
  let usdPrice = await layerTwoOracle.getUSDPrice(token, amountInWei);
  console.log(`USD value: $${usdPrice.toFixed(2)} USD`);
}
