import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { erc20Abi, xbitAbi } from '../utils/constants';
import { get_balance, get_addresses } from '../utils/methods';
import { Signer, Wallet, Event, ContractTransaction, ContractReceipt } from 'ethers';

const tags = { gasLimit: 1000000 };

task('play', 'Play the game!')
  .addOptionalParam('player', 'private key of player')
  .addOptionalParam('swap', 'swap id')
  .addOptionalParam('dollar', 'dollar used for tickets')
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    console.log(args);
    const ethers = hre.ethers;
    const network = hre.network;
    console.log('network:', network.name);
    const provider = hre.ethers.provider;
    const wallet: Wallet = new Wallet(args.player);
    const player: Signer = await wallet.connect(provider);
    const player_address = await player.getAddress();
    console.log('player:', player_address);

    const addresses = await get_addresses(network);
    const usdt = new ethers.Contract(addresses.usdt, erc20Abi, player);
    const wbtc = new ethers.Contract(addresses.wbtc, erc20Abi, player);
    const xbit = new ethers.Contract(addresses.xbit, xbitAbi, player);
    const xexp = new ethers.Contract(addresses.xexp, erc20Abi, player);
    console.log('usdt:', usdt.address);
    console.log('wbtc:', wbtc.address);
    console.log('xbit:', xbit.address);
    console.log('xexp:', xexp.address);

    let tx: ContractTransaction, receipt: ContractReceipt;

    console.log('=== lottery ===');
    console.log('usdt before:', await get_balance(usdt, await player.getAddress()));
    console.log('wbtc before:', await get_balance(wbtc, await player.getAddress()));
    console.log('xexp before:', await get_balance(xexp, await player.getAddress()));
    const usdt_amount = ethers.utils.parseUnits(args.dollar, await usdt.decimals());
    const swap_id = Number(args.swap);
    console.log(`dollar: ${args.dollar}, swap_id: ${swap_id}`);

    await usdt.approve(xbit.address, usdt_amount);
    tx = await xbit.safeSwap(usdt_amount, swap_id, tags);
    console.log('tx:', tx.hash);
    receipt = await tx.wait();
    const requestId = receipt.events?.filter((x: Event) => x.event === 'RequestedRandomness')[0].args?.reqId;
    const blockNumber = receipt.blockNumber;

    console.log('=== reveal ===');
    let delta = 0;
    for (let i = 0; i < 100; i++) {
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      if (currentBlockNumber - blockNumber > delta) {
        process.stdout.write('current block = ' + currentBlockNumber.toString() + '\r');
        delta = currentBlockNumber - blockNumber;
      }

      if (delta > 3) {
        console.log(`reveal triggered! ${delta} blocks passed.`);
        tx = await xbit.reveal(requestId, tags);
        console.log('tx:', tx.hash);
        receipt = await tx.wait();
        const status = receipt.events?.filter((x: Event) => x.event === 'LotteryOutcome')[0].args?.status;
        console.log('wbtcOut:', status.wbtcOut.toString());
        break;
      }

      // wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('usdt after:', await get_balance(usdt, await player.getAddress()));
    console.log('wbtc after:', await get_balance(wbtc, await player.getAddress()));
    console.log('xexp after:', await get_balance(xexp, await player.getAddress()));
  });
