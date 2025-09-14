import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { utils } from 'ethers';
import { erc20Abi } from '../utils/constants';
import { get_balance, get_addresses } from '../utils/methods';

const tags = { gasLimit: 1000000 };

task('faucet', 'transfer ERC20 token from supplier to receiver')
  .addOptionalParam('receiver', 'receiver address')
  .addOptionalParam('token', 'token name in lowercase, e.g. eth, usdt, wbtc, etc.')
  .addOptionalParam('quantity', 'quantity of token to transfer')
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    console.log(args);
    const ethers = hre.ethers;
    const network = hre.network;
    const [owner] = await ethers.getSigners();
    console.log('network:', network.name);
    console.log('supplier:', owner.address);

    if (args.token === 'eth') {
      console.log('supplier before:', utils.formatEther(await ethers.provider.getBalance(owner.address)));
      console.log('receiver before:', utils.formatEther(await ethers.provider.getBalance(args.receiver)));
      console.log('transferring', args.quantity, 'ETH to', args.receiver, '...');
      await owner.sendTransaction({
        to: args.receiver,
        value: ethers.utils.parseEther(args.quantity),
      });
      console.log('supplier after:', utils.formatEther(await ethers.provider.getBalance(owner.address)));
      console.log('receiver after:', utils.formatEther(await ethers.provider.getBalance(args.receiver)));
      return;
    }

    const addresses = await get_addresses(network);
    const token_address = addresses[args.token];
    const token = new ethers.Contract(token_address, erc20Abi, owner);
    const amount = ethers.utils.parseUnits(args.quantity, await token.decimals());

    console.log('token address:', token_address);
    console.log('supplier before:', await get_balance(token, owner.address));
    console.log('receiver before:', await get_balance(token, args.receiver));
    console.log('transferring', args.quantity, `${args.token} to`, args.receiver, '...');
    await (await token.transfer(args.receiver, amount, tags)).wait();
    console.log('supplier after:', await get_balance(token, owner.address));
    console.log('receiver after:', await get_balance(token, args.receiver));
  });
