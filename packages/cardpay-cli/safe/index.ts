import type { Argv } from 'yargs';
export const command = 'safe <command>';
export const desc = 'Commands to interact with the safes';
import list from './list';
import view from './view';
import transferTokens from './transfer-tokens';
import transferTokensGasEstimate from './transfer-tokens-gas-estimate';

export const builder = function (yargs: Argv) {
  return yargs.command([list, transferTokens, transferTokensGasEstimate, view] as any);
};

export function handler(/* argv: Argv */) {
  throw new Error('You must specify a valid subcommand');
}
