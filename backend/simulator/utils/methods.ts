import { join } from 'path';
import { readFileSync } from 'fs';
import { utils } from 'ethers';

export async function get_balance(contract: any, address: string) {
  const [balance, decimals] = await Promise.all([contract.balanceOf(address), contract.decimals()]);
  return utils.formatUnits(balance, decimals);
}

export async function get_addresses(network: any) {
  const address_path = `../addresses/${network.name}.json`;
  const file = join(__dirname, address_path);
  return JSON.parse(readFileSync(file).toString());
}
