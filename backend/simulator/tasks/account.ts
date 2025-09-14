import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { utils } from 'ethers';
import { erc20Abi, xbitAbi } from '../utils/constants';
import { get_balance, get_addresses } from '../utils/methods';

task('account', 'Get account info or create accounts')
  .addOptionalParam('address', 'address of the target account')
  .addOptionalParam('random', 'create one or more random accounts', '0')
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    console.log(args);
    const ethers = hre.ethers;
    const network = hre.network;
    const [owner] = await ethers.getSigners();
    console.log('network:', network.name);

    if (Number(args.random) > 0) {
      console.log(`create ${args.random} random accounts`);
      for (let i = 0; i < Number(args.random); i++) {
        const wallet = ethers.Wallet.createRandom();
        console.log(`${wallet.address} ${wallet.privateKey}`);
      }
      return;
    }

    const addresses = await get_addresses(network);
    const usdt = new ethers.Contract(addresses.usdt, erc20Abi, owner);
    const wbtc = new ethers.Contract(addresses.wbtc, erc20Abi, owner);
    const xbit = new ethers.Contract(addresses.xbit, xbitAbi, owner);
    const xexp = new ethers.Contract(addresses.xexp, erc20Abi, owner);

    console.log('eth:', utils.formatEther(await ethers.provider.getBalance(owner.address)));
    console.log('usdt:', await get_balance(usdt, args.address));
    console.log('wbtc:', await get_balance(wbtc, args.address));
    console.log('xbit:', await get_balance(xbit, args.address));
    console.log('xexp:', await get_balance(xexp, args.address));
  });
