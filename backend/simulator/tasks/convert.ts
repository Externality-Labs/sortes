import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { erc20Abi, xbitAbi } from '../utils/constants';
import { get_balance, get_addresses } from '../utils/methods';
import { Signer, Wallet, Event, ContractTransaction, ContractReceipt, utils } from 'ethers';

const tags = { gasLimit: 1000000 };

task('convert', 'Convert USDT to WBTC')
  .addOptionalParam('dollar', 'dollar to be converted', '500')
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    console.log(args);
    const ethers = hre.ethers;
    const network = hre.network;
    console.log('network:', network.name);
    const [owner, maintainer] = await ethers.getSigners();
    console.log('owner:', owner.address);
    console.log('maintainer:', maintainer.address);
    const dollar = Number(args.dollar);

    const addresses = await get_addresses(network);
    const usdt = new ethers.Contract(addresses.usdt, erc20Abi, maintainer);
    const wbtc = new ethers.Contract(addresses.wbtc, erc20Abi, maintainer);
    const xbit = new ethers.Contract(addresses.xbit, xbitAbi, maintainer);
    console.log('usdt:', usdt.address);
    console.log('xbit:', xbit.address);
    const usdt_decimals = await usdt.decimals();
    const wbtc_decimals = await wbtc.decimals();

    let tx: ContractTransaction, receipt: ContractReceipt;

    console.log('=== check ===');
    let usdt_total = await usdt.balanceOf(xbit.address);
    let usdt_quantity = Number(utils.formatUnits(usdt_total, usdt_decimals));
    console.log('usdt pool:', usdt_quantity);
    if (usdt_quantity < dollar) {
      console.log(`usdt pool (${usdt_quantity}) is not full (${dollar}), no need to convert`);
      return;
    }

    console.log('=== convert ===');
    tx = await xbit.transport(utils.parseUnits(args.dollar, usdt_decimals), tags);
    receipt = await tx.wait();
    let args_swap = receipt.events!.filter((x: Event) => x.event === 'TransportUSDT2WBTC')[0].args;
    let usdt_value = utils.formatUnits(args_swap!.amount_usdt, usdt_decimals);
    let wbtc_value = utils.formatUnits(args_swap!.amount_wbtc, wbtc_decimals);
    let price = Number(usdt_value) / Number(wbtc_value);
    console.log(`${usdt_value} USDT -> ${wbtc_value} WBTC, price = ${price}`);
  });
