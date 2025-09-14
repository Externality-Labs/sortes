import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Signer, Wallet } from 'ethers';

task('aloha', 'Aloha!')
  .addOptionalParam('greeting', 'The greeting to print', 'Hello, World!')
  .addOptionalParam('privateKey', 'privateKey', '0x2f9c961cc300760c4cd281a0103bdd661208482f7995c9aa1e7cd91138b1a2e3')
  .setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
    console.log(args);
    const ethers = hre.ethers;
    const network = hre.network;
    console.log('network:', network.name);

    const provider = hre.ethers.provider;
    const wallet: Wallet = new Wallet(args.privateKey);
    const signer: Signer = await wallet.connect(provider);
    console.log('signer:', await signer.getAddress());

    const accounts = await ethers.getSigners();
    for (const account of accounts) {
      console.log(account.address);
    }
  });
