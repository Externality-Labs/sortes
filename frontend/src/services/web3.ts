import { BigNumber, ethers } from 'ethers';
import { erc20Abi, lockerAbi, sortesAbi, voucherAbi, xbitAbi } from '../abi';
import { WalletState } from '@web3-onboard/core';
import { Token, Tokens } from '../utils/address';
import { getDefaultStore } from 'jotai';
import { web3ServiceInitedAtom } from '../atoms/web3';
import {
  loadInvalidPlayIds,
  loadValidPlayIds,
  saveInvalidPlayIds,
  saveValidPlayIds,
} from './persist';
import { chainInfoMap, currentChainInfo } from '../utils/env';
import { ChainId } from '../atoms/chain';
import {
  Relatives,
  PlayParams,
  PlayWithVoucherParams,
  PlayStatus,
  CreateSwapParams,
  DonationPlayParams,
} from './type';
import TokenClass from '../utils/token';
import { coordinatorAbi, charityAbi } from '../abi';
import { sleep } from '../utils/helper';

const { formatUnits, parseUnits } = ethers.utils;
const store = getDefaultStore();

export const tags = { gasLimit: currentChainInfo().gasLimit };

type TokenMap = { [key in ChainId]?: Tokens };
type ContractMap = {
  [key in ChainId]?: {
    [key in Token]?: ethers.Contract;
  } & { coordinator?: ethers.Contract };
};

export class Web3Service {
  ethersProvider: ethers.providers.Web3Provider;
  address: string;
  wallet: WalletState;
  // contracts: Record<Token, ethers.Contract> = {};
  // tokens?: Tokens;
  tokenMap: TokenMap = Object.values(chainInfoMap).reduce((acc, info) => {
    acc[info.chainId as ChainId] = info.tokens;
    return acc;
  }, {} as TokenMap);

  contractMap: ContractMap = Object.values(chainInfoMap).reduce((acc, info) => {
    acc[info.chainId] = {};
    return acc;
  }, {} as ContractMap);

  static _instance: Web3Service;

  static get service() {
    if (!Web3Service._instance) {
      throw new Error('Web3Service not initialized');
    }
    return Web3Service._instance;
  }

  static init(wallet: WalletState) {
    if (Web3Service._instance && Web3Service._instance.wallet === wallet)
      return;
    return new Web3Service(wallet);
  }

  get signer() {
    return this.ethersProvider.getSigner(this.address);
  }

  get tokens() {
    return this.tokenMap[currentChainInfo().chainId];
  }

  get contracts() {
    return this.contractMap[currentChainInfo().chainId];
  }

  constructor(wallet: WalletState) {
    // if using ethers v6 this is:
    // ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
    this.ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      'any'
    );
    this.address = wallet.accounts[0].address;
    this.wallet = wallet;

    this.initializeContracts();

    store.set(web3ServiceInitedAtom, true);
    Web3Service._instance = this;
  }

  initializeContracts() {
    Object.values(chainInfoMap).forEach((info) => {
      const tokens = info.tokens;
      this.tokenMap[info.chainId] = tokens;

      if (info.coordinatorAddress) {
        this.contractMap[info.chainId]!.coordinator = new ethers.Contract(
          info.coordinatorAddress,
          coordinatorAbi,
          this.signer
        );
      }

      (Object.keys(tokens) as Token[]).forEach((token: Token) => {
        this.contractMap[info.chainId]![token] = new ethers.Contract(
          tokens[token]!.address,
          (() => {
            if (token === 'xbit') return xbitAbi;
            if (token === 'voucher') return voucherAbi;
            if (token === 'sortes') return sortesAbi;
            if (token === 'charity') return charityAbi;
            if (token === 'locker') return lockerAbi;
            return erc20Abi;
          })(),
          this.signer
        );
      });
    });
  }

  async getRandomWordsFulfilledTrxHash(
    requestId: BigNumber,
    initBlock: number
  ) {
    const coordinator = this.contracts!.coordinator;
    if (!coordinator) return null;
    const events = await coordinator!.queryFilter(
      'RandomWordsFulfilled',
      initBlock,
      'latest'
    );
    for (const event of events) {
      const log = coordinator!.interface.parseLog(event);
      const args = log.args;
      if (args.requestId.eq(requestId)) {
        return event.transactionHash;
      }
    }
  }

  async getChainId() {
    const network = await this.ethersProvider.getNetwork();
    return network.chainId;
  }

  async getBalance(token: Token, address: string) {
    const contract = this.contracts![token];
    if (!contract) return null;
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);
    return formatUnits(balance, decimals);
  }

  async getSupply(token: Token) {
    const contract = this.contracts![token];
    if (!contract) return null;
    const [supply, decimals] = await Promise.all([
      contract.totalSupply(),
      contract.decimals(),
    ]);
    return formatUnits(supply, decimals);
  }

  async getVoucherId(
    inputToken: TokenClass,
    inputAmount: BigNumber,
    repeats: BigNumber
  ): Promise<BigNumber> {
    return await this.contracts!.voucher!.getId(
      inputToken.address,
      inputAmount,
      repeats
    );
  }

  async getVoucherQuantity(voucherId: BigNumber): Promise<BigNumber> {
    return await this.contracts!.voucher!.get(this.address, voucherId);
  }

  async transferVoucher(
    voucherIds: BigNumber[],
    quantities: BigNumber[],
    newOwner: string
  ) {
    return await this.contracts!.voucher!.transfer(
      voucherIds,
      quantities,
      newOwner
    );
  }

  // wbtc => xWbtc
  // weth => xWeth
  async deposit(value: string, jkptName: keyof Tokens) {
    const tokenMap = TokenClass.tokenMap;
    console.log('deposit', tokenMap);
    const transferNum = parseUnits(value, tokenMap[jkptName].decimals);
    await this.contracts![jkptName]!.approve(
      this.tokens?.xbit.address,
      transferNum
    );
    const trx = await this.contracts!.xbit!.deposit(
      tokenMap[jkptName].address,
      transferNum,
      tags
    );
    await trx.wait();
  }

  // xWbtc => wbtc
  // xWeth => weth
  async withdraw(value: string, jkptName: keyof Tokens) {
    const tokenMap = TokenClass.tokenMap;
    const lpToken =
      tokenMap[TokenClass.getTokenByName(jkptName).getPairsToken()!.name];
    const xbitContract = this.contracts!.xbit!;

    const transferNum = parseUnits(value, lpToken.decimals);
    const trx = await xbitContract.requestWithdraw(
      lpToken.getPairsToken()!.address,
      transferNum,
      tags
    );
    const receipt = await trx.wait();
    const txBlockNumber = receipt.blockNumber;
    let latest = await this.getCurrentBlockNumber();

    while (latest <= txBlockNumber) {
      await sleep(1000);
      latest = await this.getCurrentBlockNumber();
    }

    await xbitContract.executeWithdraw();
  }

  async play(params: PlayParams) {
    const { inputToken, inputAmount, repeats, outputToken, table } = params;
    console.log('play', params);

    const result = await this.contracts!.xbit!.play(
      this.address,
      inputToken,
      inputAmount,
      repeats,
      outputToken,
      table,
      tags
    );
    return result;
  }

  async donationPlay(params: DonationPlayParams) {
    const { inputToken, inputAmount, repeats, outputToken, table, donationId } =
      params;
    console.log('donationPlay', params);
    const result = await this.contracts!.charity!.playWithToken(
      inputToken,
      inputAmount,
      repeats,
      outputToken,
      table,
      donationId,
      tags
    );
    console.log('donationPlay result', result);
    return result;
  }

  async playWithVoucher(params: PlayWithVoucherParams) {
    console.log('playWithVoucher', params);
    const result = await this.contracts!.voucher!.play(
      this.address,
      params.voucherId,
      params.outputToken,
      params.table,
      tags
    );
    return result;
  }

  async donationPlayWithVoucher(
    params: PlayWithVoucherParams & { donationId: BigNumber }
  ) {
    console.log('donationPlayWithVoucher', params);
    const result = await this.contracts!.charity!.playWithVoucher(
      params.voucherId,
      params.outputToken,
      params.table,
      params.donationId,
      tags
    );
    return result;
  }

  async getPlayStatusById(playId: BigNumber): Promise<PlayStatus> {
    return await this.contracts!.xbit!.getPlayStatusById(playId);
  }

  async isRequestValidNow(requestId: BigNumber) {
    const status = await this.getPlayStatusById(requestId);
    return {
      // filter fulfilled ids
      isValidNow: !status.fulfilled,
      status,
    };
  }

  async getValidPlays(): Promise<{ id: BigNumber; status: any }[]> {
    const xbit = this.contracts?.xbit;
    const idsFromChain = await xbit!.listPlayIds(this.address);

    const invalidIdsFromLS = loadInvalidPlayIds() ?? [];
    const validIdsFromLS = loadValidPlayIds() ?? [];
    const invalidIds: string[] = [];
    let validIds: { id: string; time: number }[] = validIdsFromLS.filter(
      (item) =>
        idsFromChain.map((i: BigNumber) => i.toString()).includes(item.id)
    );
    const validRequests = [];

    for (const id of idsFromChain) {
      // filter invalid ids from local storage
      if (invalidIdsFromLS.includes(id.toString())) {
        invalidIds.push(id.toString());
        continue;
      }

      const { isValidNow, status } = await this.isRequestValidNow(id);
      if (!isValidNow) {
        invalidIds.push(id.toString());
        validIds = validIds.filter((x) => x.id !== id.toString());
      } else {
        // update LS valid request ids
        const validItem = validIds.find((x) => x.id === id.toString());

        // first time get valid request, save
        if (!validItem) {
          validIds.push({ id: id.toString(), time: Date.now() });
          validRequests.push({
            id,
            status,
          });
          // time out, remove
        } else if (Date.now() - validItem.time > 1000 * 60 * 5) {
          invalidIds.push(id.toString());
          validIds = validIds.filter((x) => x.id !== id.toString());
          // do not need to update local valid request ids
        } else {
          validRequests.push({
            id,
            status,
          });
        }
      }
    }

    saveInvalidPlayIds(invalidIds);
    saveValidPlayIds(validIds);
    return validRequests;
  }

  async getCurrentBlockNumber() {
    return await this.ethersProvider.getBlockNumber();
  }

  async registerTable({
    relatives,
    expectations,
    rewards,
    millionthRatio,
    name,
  }: CreateSwapParams) {
    // console.log('registerTable:');
    // console.log('relatives', relatives);
    // console.log('expectations', expectations);
    // console.log('rewards', rewards);
    // console.log('millionthRatio', millionthRatio);
    const params = {
      relatives: relatives.map((r) => Number(r)),
      mExpectations: expectations.map((exp) => exp * 1e4), // convert to usdt amount
      mRewards: rewards.map((reward, idx) =>
        relatives[idx] === Relatives.Input ? reward * 1e4 : reward * 1e4
      ), // for relative rewards, user input is percentage value
      mFeeRatio: millionthRatio * 1e4,
      owner: this.address,
      name: name,
      id: 0,
    };
    console.log('create table, pass to contract:', params);
    const tx = await this.contracts!.xbit!.registerTable(params, tags);
    const receipt = await tx.wait();
    console.log('receipt', receipt.events);
    const args = receipt.events!.filter(
      (x: { event: string }) => x.event === 'TableRegistered'
    )[0].args;
    return args;
  }

  async usdtAllowance(targetContractAddress: string) {
    return await this.contracts!.usdt!.allowance(
      this.address,
      targetContractAddress
    );
  }

  async usdcAllowance(targetContractAddress: string) {
    return await this.contracts!.usdc!.allowance(
      this.address,
      targetContractAddress
    );
  }

  async claimReward() {
    return await this.contracts!.xbit!.claimRemainingRewardFee(tags);
  }

  async getPoolSize(tokenAddress: string) {
    const token = TokenClass.getTokenByAddress(tokenAddress);
    const name = token.name as keyof Tokens;
    const size = await this.contracts![name]!.balanceOf(
      this.tokens?.xbit.address
    );
    return formatUnits(size, token.decimals);
  }

  async getSortesUserBalances() {
    const balances = await this.contracts!.sortes!.getUserBalances(
      this.address
    );
    return balances;
  }
}
