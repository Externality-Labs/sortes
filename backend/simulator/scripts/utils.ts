import { network, ethers } from 'hardhat';
import { join } from 'path';
import { readFileSync } from 'fs';
import { erc20Abi, xbitAbi } from '../utils/constants';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export async function getTags() {
  const [owner] = await ethers.getSigners();
  const gasPrice = ((await owner.getGasPrice()).toBigInt() * 12n) / 10n;
  console.log('gasPrice =', gasPrice);
  return { gasLimit: 10000000, gasPrice: gasPrice };
}

export async function readContracts() {
  const [owner] = await ethers.getSigners();
  const eth = ethers.utils.formatEther(await ethers.provider.getBalance(owner.address));
  console.log(`Owner address: ${owner.address}`);
  console.log(`ETH: ${eth}`);
  console.log(`Network name: ${network.name}; chainId: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Block number: ${await ethers.provider.getBlockNumber()}`);

  // get addresses from cache
  const address_path = `../addresses/${network.name}.json`;
  const file = join(__dirname, address_path);
  const addresses = JSON.parse(readFileSync(file).toString());

  const wbtc = new ethers.Contract(addresses['wbtc'], erc20Abi, owner);
  const usdt = new ethers.Contract(addresses['usdt'], erc20Abi, owner);
  const xexp = new ethers.Contract(addresses['xexp'], erc20Abi, owner);
  const xbit = new ethers.Contract(addresses['xbit'], xbitAbi, owner);

  const [wbtc_decimals, usdt_decimals, xexp_decimals, xbit_decimals] = await Promise.all([
    wbtc.decimals(),
    usdt.decimals(),
    xexp.decimals(),
    xbit.decimals(),
  ]);

  const [wbtc_balance, usdt_balance, xexp_balance, xbit_balance] = await Promise.all([
    wbtc.balanceOf(owner.address),
    usdt.balanceOf(owner.address),
    xexp.balanceOf(owner.address),
    xbit.balanceOf(owner.address),
  ]);

  console.log('Tokens:');
  console.log('WBTC:', addresses['wbtc'], wbtc_balance / 10 ** wbtc_decimals);
  console.log('USDT:', addresses['usdt'], usdt_balance / 10 ** usdt_decimals);
  console.log('XEXP:', addresses['xexp'], xexp_balance / 10 ** xexp_decimals);
  console.log('XBIT:', addresses['xbit'], xbit_balance / 10 ** xbit_decimals);

  return { owner, wbtc, usdt, xexp, xbit, wbtc_decimals, usdt_decimals, xexp_decimals, xbit_decimals };
}
