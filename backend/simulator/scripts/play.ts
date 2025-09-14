import { network, ethers } from 'hardhat';
import { readContracts, getTags } from './utils';
import dotenv from 'dotenv';
import path from 'path';
import { ContractTransaction, ContractReceipt, Event } from 'ethers';
import { mine } from '@nomicfoundation/hardhat-network-helpers';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const parseUnits = ethers.utils.parseUnits;

async function main() {
  if (network.name === 'hardhat') {
    console.warn(
      'You are trying to interact with the Hardhat Network, which gets automatically created and destroyed every ' +
        "time. Use the Hardhat option '--network localhost'",
    );
  }

  const { owner, usdt, xbit, usdt_decimals } = await readContracts();

  console.log('=== play ===');
  let tx: ContractTransaction;
  let receipt: ContractReceipt;

  const quantity = Number(process.env.QUANTITY ?? '1');
  console.log('Quantity:', quantity);
  const cost = parseUnits(String(quantity * 10), usdt_decimals);
  await usdt.approve(xbit.address, 0);
  await usdt.approve(xbit.address, cost);
  tx = await xbit.safeLottery(cost, owner.address, await getTags());
  receipt = await tx.wait();
  // console.log(receipt);

  const requestId = receipt.events?.filter((x: Event) => x.event === 'RequestedRandomness')[0].args?.reqId;
  const initBlockNumber = receipt.blockNumber;

  console.log('requestId =', requestId);
  console.log('blockNumber =', initBlockNumber);
  let revealTriggered = false;
  let currentBlockNumber = initBlockNumber;

  for (let i = 0; i < 100; i++) {
    if (network.name === 'localhost') {
      await mine(1);
    }

    const nextBlockNumber = await ethers.provider.getBlockNumber();
    if (nextBlockNumber > currentBlockNumber) {
      currentBlockNumber = nextBlockNumber;
      console.log('currentBlockNumber = %d', currentBlockNumber);
    }

    if (currentBlockNumber > initBlockNumber + 3 && !revealTriggered) {
      tx = await xbit.reveal(requestId, await getTags());
      receipt = await tx.wait();
      revealTriggered = true;
      console.log('reveal triggered!');
      const args_LotteryOutcome = receipt.events?.filter((x: Event) => x.event === 'LotteryOutcome')[0].args;
      console.log(args_LotteryOutcome?.status);
      break;
    }

    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
