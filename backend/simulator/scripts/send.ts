import { network, ethers } from 'hardhat';
import { readContracts } from './utils';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const parseUnits = ethers.utils.parseUnits;

async function main() {
  if (network.name === 'hardhat') {
    console.warn(
      'You are trying to interact with the Hardhat Network, which gets automatically created and destroyed every ' +
        "time. Use the Hardhat option '--network localhost'",
    );
  }

  const { wbtc, usdt, wbtc_decimals, usdt_decimals } = await readContracts();

  async function get_balance(contract: any, address: string) {
    const [balance, decimals] = await Promise.all([contract.balanceOf(address), contract.decimals()]);
    return ethers.utils.formatUnits(balance, decimals);
  }

  async function print_balances(address: string) {
    const [wbtc_b, usdt_b] = await Promise.all([get_balance(wbtc, address), get_balance(usdt, address)]);
    console.log(`balances: wbtc ${wbtc_b};\tusdt ${usdt_b}`);
  }

  console.log('=== faucet ===');
  const usdt_amount = parseUnits('10000', usdt_decimals);
  const wbtc_amount = parseUnits('1', wbtc_decimals);
  const target_account = process.env.TARGET_ACCOUNT ?? 'unknown';
  console.log('Address:', target_account);

  await print_balances(target_account);
  console.log('Sending 1 WBTC & 10000 USDT...');
  await (await usdt.transfer(target_account, usdt_amount)).wait();
  await (await wbtc.transfer(target_account, wbtc_amount)).wait();
  await print_balances(target_account);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
