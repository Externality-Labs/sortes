import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
let parseUnits = ethers.parseUnits;

import { tags, setupEnvironment, getEventArgs } from "./Prerequisites_NXbitSimple";
import { Xexp, NXbit } from "../typechain-types";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

const FIRST_SWAP_ID = 1; // first swap

describe("Xbit_simple", function () {
  let owner: any, maintainer: any, addr1: any, addr2: any;
  let weth: Contract, wbtc: Contract, usdt: Contract, usdc: Contract, xexp: Xexp, xbit: NXbit, xabi: Contract;
  let wbtc_decimals: bigint, usdt_decimals: bigint, usdc_decimals: bigint, link_decimals: bigint, xbit_decimals: bigint;
  let xbitAddress: string;

  beforeEach(async () => {
    let environment = await setupEnvironment(true);
    owner = environment.owner;
    maintainer = environment.maintainer;
    addr1 = environment.addr1;
    addr2 = environment.addr2;
    weth = environment.weth;
    wbtc = environment.wbtc;
    usdt = environment.usdt;
    usdc = environment.usdc;
    xexp = environment.xexp;
    xbit = environment.xbit;
    xabi = environment.xabi;
    wbtc_decimals = environment.wbtc_decimals;
    usdt_decimals = environment.usdt_decimals;
    usdc_decimals = environment.usdc_decimals;
    link_decimals = environment.link_decimals;
    xbit_decimals = environment.xbit_decimals;
    xbitAddress = await xbit.getAddress();

    // register a swap
    const swap = {
      relatives: [false, false],
      expectations: [5000, 10000],
      rewards: [10000, 40000],
      millionth_ratio: 0,
      owner: owner.address,
      name: "test-swap-1",
      id: 0,
    };
    let tx = await xbit.registerSwap(swap, tags);
    let args_register = await getEventArgs(xbit, "SwapRegistered");
    expect(args_register!.swapId).to.be.equal(FIRST_SWAP_ID);
    mine(1);
  });

  describe("playSwap", function () {
    it("playSwap() should emit a RequestedRandomness event", async function () {
      let amount_usdt = parseUnits("20", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      await expect(xbit.playSwap(amount_usdt, 0, 1, tags)).to.emit(xbit, "RequestedRandomness");
    });

    it("amount must be at least 10 USD", async function () {
      let amount_usdt = parseUnits("9.99", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      await expect(xbit.playSwap(amount_usdt, 0, 1, tags)).to.be.revertedWith("amount must be at least 10 USD");
    });

    it("usdType must be 0 or 1", async function () {
      let amount_usdt = parseUnits("10", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      await expect(xbit.playSwap(amount_usdt, 2, 1, tags)).to.be.revertedWith("usdType must be 0 (USDT) or 1 (USDC)");
    });

    it("some USD should transfer to claimer and donation", async function () {
      let usdt_maintainer_before = await usdt.balanceOf(maintainer.address);
      let usdt_contract_before = await usdt.balanceOf(xbitAddress);
      let usdt_claimable_before = (await xbit.getRemainingRewardFee())[0];

      let reward_usd = 50000n;
      const swap = {
        relatives: [false],
        expectations: [reward_usd],
        rewards: [reward_usd],
        millionth_ratio: 8e4, // 8%
        owner: owner.address,
        name: "test reward with fee and claim",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;

      let amount_usdt = parseUnits("100", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      await xbit.playSwap(amount_usdt, 0, swap_id, tags);

      let usdt_maintainer_after = await usdt.balanceOf(maintainer.address);
      let usdt_contract_after = await usdt.balanceOf(xbitAddress);
      let usdt_claimable_after = (await xbit.getRemainingRewardFee())[0];

      expect(usdt_maintainer_after - usdt_maintainer_before).to.be.equal((amount_usdt * 2n) / 100n);
      expect(usdt_contract_after - usdt_contract_before).to.be.equal((amount_usdt * 8n) / 100n);
      expect(usdt_claimable_after - usdt_claimable_before).to.be.equal((amount_usdt * 8n) / 100n);
    });

    it("playSwap() should work with USDT / USDC", async function () {
      async function check(usd: Contract, usd_type: bigint, usd_decimals: bigint) {
        let amount_usd = parseUnits("20", usd_decimals);
        await usd.approve(xbitAddress, amount_usd);

        await xbit.playSwap(amount_usd, usd_type, 1, tags);
        let args = await getEventArgs(xbit, "RequestedRandomness");
        let requestId = args.reqId;

        // automatically trigger callback
        args = await getEventArgs(xbit, "LotteryOutcome");
        let status = args.status;

        // verify final status meets expectation
        expect(status.exists).to.true;
        expect(status.fulfilled).to.true;
        expect(status.requestId).to.be.equal(requestId);
        expect(status.player).to.be.equal(owner.address);
        expect(status.swapId).to.be.equal(1);
        expect(status.usdIn).to.be.equal(amount_usd);
        expect(status.usdType).to.be.equal(usd_type);
        expect(status.jkptTicket).to.be.equal(await xbit.estimateUSD2JKPT(parseUnits("10", usdt_decimals)));
        expect(status.quantity).to.be.equal(2);
      }

      await check(usdt, 0n, usdt_decimals);
      await check(usdc, 1n, usdc_decimals);
    });
  });

  describe("get requests", function () {
    it("getRequestIdsByAddress() should work", async function () {
      let amount_usdt = parseUnits("20", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      await (await xbit.playSwap(amount_usdt, 0, 1, tags)).wait();
      await usdt.approve(xbitAddress, amount_usdt);
      await (await xbit.playSwap(amount_usdt, 0, 1, tags)).wait();
      let requestIds = await xbit.getRequestIdsByAddress(owner.address);
      expect(requestIds.length).to.be.equal(2);
    });

    it("getRequestStatusById() should work", async function () {
      let amount_usdt = parseUnits("20", usdt_decimals);
      await usdt.approve(xbitAddress, amount_usdt);
      let tx_swap = await await xbit.playSwap(amount_usdt, 0, 1, tags);
      let args_swap = await getEventArgs(xbit, "RequestedRandomness");
      let requestId = args_swap.reqId;

      // verify status meets expectation
      let args_outcome = await getEventArgs(xbit, "LotteryOutcome");
      let status = args_outcome.status;
      expect(status.exists).to.true;
      expect(status.fulfilled).to.true;
      expect(status.requestId).to.be.equal(requestId);
      expect(status.player).to.be.equal(owner.address);
      expect(status.swapId).to.be.equal(1);
      expect(status.usdIn).to.be.equal(amount_usdt);
      expect(status.usdType).to.be.equal(0);
      expect(status.jkptTicket).to.be.equal(await xbit.estimateUSD2JKPT(parseUnits("10", usdt_decimals)));
      expect(status.quantity).to.be.equal(2);
    });
  });

  describe("reward check", function () {
    it("absolute reward", async function () {
      // register a swap
      let reward_usdt = 50000n;
      let reward_wbtc = await xbit.estimateUSD2JKPT(reward_usdt);
      const swap = {
        relatives: [false],
        expectations: [reward_usdt],
        rewards: [reward_usdt],
        millionth_ratio: 0,
        owner: owner.address,
        name: "absolute reward",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;

      // play the swap
      let amount_usdt = parseUnits("10", usdt_decimals);
      await usdt.approve(xbitAddress, 0);
      await usdt.approve(xbitAddress, amount_usdt);
      await xbit.playSwap(amount_usdt, 0, swap_id, tags);

      let args_outcome = await getEventArgs(xbit, "LotteryOutcome");
      let status = args_outcome.status;
      reward_wbtc = (reward_usdt * status.jkptTicket) / (10n * 10n ** usdt_decimals);
      expect(status.jkptOut).to.be.equal(reward_wbtc);
    });

    it("relative reward", async function () {
      const pool_amount = await xbit.getPrizePoolSizeInUSD();
      const usdt_amount = parseUnits("8", usdt_decimals);
      let relative_reward = (usdt_amount * 10n ** 6n) / pool_amount;
      const swap = {
        relatives: [true],
        expectations: [(relative_reward * pool_amount) / 10n ** 6n],
        rewards: [relative_reward],
        millionth_ratio: 0,
        owner: owner.address,
        name: "relative-reward",
        id: 0,
      };

      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;

      // play the swap
      let amount_usdt = parseUnits("10", usdt_decimals);
      await usdt.approve(xbitAddress, 0);
      await usdt.approve(xbitAddress, amount_usdt);
      let tx_swap = await xbit.playSwap(amount_usdt, 0, swap_id, tags);
      let args_swap = await getEventArgs(xbit, "RequestedRandomness");
      let requestId = args_swap.reqId;

      let args_outcome = await getEventArgs(xbit, "LotteryOutcome");
      let status = args_outcome.status;
      let reward_usdt = (relative_reward * pool_amount) / 10n ** 6n;
      let reward_wbtc = (reward_usdt * status.jkptTicket) / BigInt(10n * 10n ** usdt_decimals);
      expect(status.jkptOut / 10000n).to.be.equal(reward_wbtc / 10000n);
    });

    it("typical reward", async function () {
      // register a swap
      const swap = {
        relatives: [false, false, true],
        expectations: [parseUnits("3", usdt_decimals), parseUnits("3", usdt_decimals), parseUnits("2", usdt_decimals)],
        rewards: [
          parseUnits("10", usdt_decimals),
          parseUnits("20", usdt_decimals),
          100000n, // 100000 / 1e6 = 10%
        ],
        millionth_ratio: 0,
        owner: owner.address,
        name: "typical-reward",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;

      // play the swap
      let amount_usdt = parseUnits("10", usdt_decimals);
      await usdt.approve(xbitAddress, 0);
      await usdt.approve(xbitAddress, amount_usdt);
      let tx_swap = await xbit.playSwap(amount_usdt, 0, swap_id, tags);
      let args_swap = await getEventArgs(xbit, "RequestedRandomness");
      let requestId = args_swap.reqId;

      let args_outcome = await getEventArgs(xbit, "LotteryOutcome");
      let status = args_outcome.status;
    });

    it("denver reward", async function () {
      // save more WBTC
      let amount_wbtc = parseUnits("0.2", wbtc_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();

      // register a swap
      const swap = {
        relatives: [false, false, false, false, true],
        expectations: [
          parseUnits("3", usdt_decimals),
          parseUnits("2", usdt_decimals),
          parseUnits("1", usdt_decimals),
          parseUnits("1", usdt_decimals),
          parseUnits("1", usdt_decimals),
        ],
        rewards: [
          parseUnits("20", usdt_decimals),
          parseUnits("40", usdt_decimals),
          parseUnits("100", usdt_decimals),
          parseUnits("200", usdt_decimals),
          100000n, // 100000 / 1e6 = 10%
        ],
        millionth_ratio: 0,
        owner: owner.address,
        name: "ETH-Denver-2024",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;

      // play the swap
      let amount_usdt = parseUnits("10", usdt_decimals);
      await usdt.approve(xbitAddress, 0);
      await usdt.approve(xbitAddress, amount_usdt);
      let tx_swap = await xbit.playSwap(amount_usdt, 0, swap_id, tags);
      let args_swap = await getEventArgs(xbit, "RequestedRandomness");
      let requestId = args_swap.reqId;

      let args_outcome = await getEventArgs(xbit, "LotteryOutcome");
      let status = args_outcome.status;
    });

    it("claimRemainingRewardFee() should work", async function () {
      // register a swap
      let reward_usd = 50000n;
      const swap = {
        relatives: [false],
        expectations: [reward_usd],
        rewards: [reward_usd],
        millionth_ratio: 8e4, // 8%
        owner: owner.address,
        name: "test reward with fee and claim",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      let swap_id = args_register!.swapId;
      expect(await xbit.getRemainingRewardFee()).to.deep.equal([0, 0]);
      expect(await xbit.getTotalRewardFee()).to.deep.equal([0, 0]);

      // play the swap
      let amount_usdt = parseUnits("200", usdt_decimals);
      await usdt.approve(xbitAddress, 0);
      await usdt.approve(xbitAddress, amount_usdt);
      await xbit.playSwap(amount_usdt, 0, swap_id, tags);
      let amount_usdc = parseUnits("300", usdc_decimals);
      await usdc.approve(xbitAddress, 0);
      await usdc.approve(xbitAddress, amount_usdc);
      await xbit.playSwap(amount_usdc, 1, swap_id, tags);
      // callback is automatically triggered

      let expected_fees = [(amount_usdt * 8n) / 100n, (amount_usdc * 8n) / 100n];
      expect(await xbit.getRemainingRewardFee()).to.deep.equal(expected_fees);
      expect(await usdt.balanceOf(xbitAddress)).to.be.equal(expected_fees[0]);
      expect(await usdc.balanceOf(xbitAddress)).to.be.equal(expected_fees[1]);
      expect(await xbit.getTotalRewardFee()).to.deep.equal([0, 0]);

      await xbit.claimRemainingRewardFee();
      let args_claim = await getEventArgs(xbit, "RewardFeeClaimed");

      expect([args_claim.usdtFee, args_claim.usdcFee]).to.deep.equal(expected_fees);
      expect(args_claim.distributor).to.be.equal(owner.address);
      expect(await xbit.getRemainingRewardFee()).to.deep.equal([0, 0]);
      expect(await xbit.getTotalRewardFee()).to.deep.equal(expected_fees);
    });

    it("claimRemainingRewardFee() should fail if nothing claimable", async function () {
      expect(await xbit.getRemainingRewardFee()).to.deep.equal([0, 0]);
      await expect(xbit.claimRemainingRewardFee()).to.be.revertedWith("no remaining reward fees");
    });
  });
});
