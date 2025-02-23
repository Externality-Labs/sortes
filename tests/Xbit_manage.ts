import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
let parseUnits = ethers.parseUnits;

import { tags, setupEnvironment, getEventArgs } from "./Prerequisites_NXbitChainlinkV2";
import { Xexp, NXbit } from "../typechain-types";

const FIRST_SWAP_ID = 1; // first swap

describe("Xbit_manage", function () {
  let owner: any, maintainer: any, addr1: any, addr2: any;
  let weth: Contract, wbtc: Contract, usdt: Contract, usdc: Contract, xexp: Xexp, xbit: NXbit, xabi: Contract;
  let wbtc_decimals: bigint, usdt_decimals: bigint, usdc_decimals: bigint, xexp_decimals: bigint, xbit_decimals: bigint;
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
    xexp_decimals = environment.xexp_decimals;
    xbit_decimals = environment.xbit_decimals;
  });

  describe("manageSwap", function () {
    it("registerSwap() and getSwap() should work", async function () {
      const ticket_usdt_amount = parseUnits("10", usdt_decimals);
      const pool_amount = await xabi.getPrizePoolSizeInUSD();
      let swap = {
        relatives: [true, false, false, false, false, false, false, false, false, false],
        expectations: [(ticket_usdt_amount * 4n) / 10n, (ticket_usdt_amount * 4n) / 10n, 0, 0, 0, 0, 0, 0, 0, 0],
        rewards: [1e5, pool_amount / 10n, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4],
        millionth_ratio: 8e4,
        owner: owner.address,
        name: "test-swap",
        id: 0,
      };

      // register swap
      let tx = await xbit.registerSwap(swap, tags);
      let receipt = await tx.wait();
      console.log(receipt!.logs);
      console.log(xbit.interface.parseLog(receipt!.logs[0]));
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      expect(args_register.swapId).to.be.equal(FIRST_SWAP_ID);

      // get swap
      let swap_info = await xbit.getSwap(FIRST_SWAP_ID);
      expect(swap_info.relatives).to.be.deep.equal(swap.relatives);
      expect(swap_info.expectations).to.be.deep.equal(swap.expectations);
      expect(swap_info.rewards).to.be.deep.equal(swap.rewards);
      expect(swap_info.millionth_ratio).to.be.equal(swap.millionth_ratio);
      expect(swap_info.owner).to.be.equal(owner.address);
      expect(swap_info.name).to.be.equal("test-swap");
      expect(swap_info.id).to.be.equal(FIRST_SWAP_ID);
    });

    it("listSwapIds() and listSwaps() should work", async function () {
      let swap = {
        relatives: [false],
        expectations: [1e5],
        rewards: [1e5],
        millionth_ratio: 8e4,
        owner: owner.address,
        name: "test-swap",
        id: 0,
      };

      await (await xbit.registerSwap(swap, tags)).wait();
      await (await xbit.registerSwap(swap, tags)).wait();

      // list swap ids
      let swap_ids = await xbit.listSwapIds(owner.address);
      expect(swap_ids).to.be.deep.equal([1, 2]);

      // list swaps
      let swaps = await xbit.listSwaps(owner.address);
      expect(swaps.length).to.be.equal(2);
      expect(swaps[0].id).to.be.equal(1);
      expect(swaps[1].id).to.be.equal(2);
    });
  });

  describe("verifySwap", function () {
    it("create a valid swap on the boundary", async function () {
      const ticket_usdt_amount = parseUnits("10", usdt_decimals);
      const pool_amount = await xabi.getPrizePoolSizeInUSD();
      let swap = {
        relatives: [true, false, false, false, false, false, false, false, false, false],
        expectations: [(ticket_usdt_amount * 4n) / 10n, (ticket_usdt_amount * 4n) / 10n, 0, 0, 0, 0, 0, 0, 0, 0],
        rewards: [1e5, pool_amount / 10n, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4],
        millionth_ratio: 8e4,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await xbit.registerSwap(swap, tags);
      let args_register = await getEventArgs(xbit, "SwapRegistered");
      expect(args_register.swapId).to.be.equal(FIRST_SWAP_ID);
    });

    it("swap must have at least one branch", async function () {
      let swap = {
        relatives: [],
        expectations: [],
        rewards: [],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("must have at least one branch");
    });
    it("swap cannot have too many branches (> 10)", async function () {
      let swap = {
        relatives: [false, false, false, false, false, false, false, false, false, false, false],
        expectations: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        rewards: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("too many branches (> 10)");
    });
    it("relatives, expectations, rewards must have equal lengths", async function () {
      let swap = {
        relatives: [false, false, false],
        expectations: [10, 10],
        rewards: [1000, 1000, 1000],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith(
        "relatives, expectations, rewards must have equal lengths"
      );
      swap["expectations"] = [10, 10, 10];
      swap["rewards"] = [1000, 1000];
      await expect(xabi.registerSwap(swap)).to.be.revertedWith(
        "relatives, expectations, rewards must have equal lengths"
      );
    });
    it("expectation should not be too large", async function () {
      const ticket_usdt_amount = parseUnits("10", usdt_decimals);
      let swap = {
        relatives: [false, false],
        expectations: [ticket_usdt_amount, 1],
        rewards: [ticket_usdt_amount * 2n, 1000],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("expectation too large");
    });
    it("relative reward must be less than 1e5 (10% of pool)", async function () {
      const usdt_amount = parseUnits("8", usdt_decimals);
      let swap = {
        relatives: [true],
        expectations: [usdt_amount],
        rewards: [1e5 + 1],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("relative reward must be less than 1e5 (10% of pool)");
    });
    it("relative reward must be more than 0", async function () {
      const usdt_amount = parseUnits("8", usdt_decimals);
      let swap = {
        relatives: [true],
        expectations: [usdt_amount],
        rewards: [0],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("relative reward must be more than 0");
    });
    it("absolute reward must be less than 10% of pool", async function () {
      const usdt_amount = parseUnits("8", usdt_decimals);
      const pool_amount = await xabi.getPrizePoolSizeInUSD();
      let swap = {
        relatives: [false],
        expectations: [usdt_amount],
        rewards: [pool_amount / 10n + 1n],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("absolute reward must be less than 10% of pool");
    });
    it("absolute reward must be more than 0.01 USDT", async function () {
      const usdt_amount = parseUnits("8", usdt_decimals);
      const pool_amount = await xabi.getPrizePoolSizeInUSD();
      let swap = {
        relatives: [false],
        expectations: [usdt_amount],
        rewards: [parseUnits("0.0099", usdt_decimals)],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("absolute reward must be more than 0.01 USDT");
    });
    it("probability sum should not be too large", async function () {
      let swap = {
        relatives: [false, false],
        expectations: [10000, 10000],
        rewards: [10000, 20000],
        millionth_ratio: 0,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("probability sum too large");
    });
    it("swap millionth_ratio must <= 8e4 (8%)", async function () {
      let swap = {
        relatives: [false],
        expectations: [1000],
        rewards: [10000],
        millionth_ratio: 8e4 + 1,
        owner: owner.address,
        name: "",
        id: 0,
      };
      await expect(xabi.registerSwap(swap)).to.be.revertedWith("millionth ratio must <= 8e4 (8%)");
    });
  });
});
