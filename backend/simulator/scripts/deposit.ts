import { network, ethers } from 'hardhat';
import { readContracts, getTags } from './utils';

import dotenv from 'dotenv';
import path from 'path';
import { Event } from 'ethers';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const parseUnits = ethers.utils.parseUnits;

async function main() {
  if (network.name === 'hardhat') {
    console.warn(
      'You are trying to interact with the Hardhat Network, which gets automatically created and destroyed every ' +
        "time. Use the Hardhat option '--network localhost'",
    );
  }

  const { wbtc, xbit, wbtc_decimals } = await readContracts();

  console.log('=== deposit ===');
  const value = process.env.VALUE ?? '0.1';
  const amount = parseUnits(String(value), wbtc_decimals);
  await wbtc.approve(xbit.address, 0);
  await wbtc.approve(xbit.address, amount);
  const tx = await xbit.save(amount, await getTags());
  const receipt = await tx.wait();
  const args_SaveWBTC = receipt.events?.filter((x: Event) => x.event === 'SaveWBTC')[0].args;
  console.log(args_SaveWBTC);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
