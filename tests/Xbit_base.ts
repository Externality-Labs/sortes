import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { tags, setupEnvironment } from "./Prerequisites_NXbitChainlinkV2";
import { Xexp, NXbit } from "../typechain-types";
let parseUnits = ethers.parseUnits;

const INIT_XBIT = "0.25";

describe("Xbit_base", function () {
  let owner: any, maintainer: any, addr1: any, addr2: any;
  let weth: Contract,
    wbtc: Contract,
    usdt: Contract,
    usdc: Contract,
    link: Contract,
    xexp: Xexp,
    xbit: NXbit,
    xabi: Contract;
  let wbtc_decimals: bigint, usdt_decimals: bigint, usdc_decimals: bigint, link_decimals: bigint, xbit_decimals: bigint;
  let xbitAddress: string;

  beforeEach(async () => {
    let environment = await setupEnvironment();
    owner = environment.owner;
    maintainer = environment.maintainer;
    addr1 = environment.addr1;
    addr2 = environment.addr2;
    weth = environment.weth;
    wbtc = environment.wbtc;
    usdt = environment.usdt;
    usdc = environment.usdc;
    link = environment.link;
    xexp = environment.xexp;
    xbit = environment.xbit;
    xabi = environment.xabi;
    wbtc_decimals = environment.wbtc_decimals;
    usdt_decimals = environment.usdt_decimals;
    usdc_decimals = environment.usdc_decimals;
    link_decimals = environment.link_decimals;
    xbit_decimals = environment.xbit_decimals;
    xbitAddress = await xbit.getAddress();
  });

  describe("deployment", function () {
    it("deployment should set the right owner", async function () {
      xexp.owner();
      expect(await xbit.owner()).to.equal(owner.address);
    });

    // it("xbit should be able to mint in dev mode", async function () {
    //   await xbit.mint(owner.address, 1234567);

    //   expect(await xbit.balanceOf(owner.address)).to.equal(1234567);
    //   expect(await xbit.totalSupply()).to.equal(1234567);
    // });

    it("owner should have some USDT, USDC, WBTC, LINK", async function () {
      expect(await usdt.balanceOf(owner.address)).to.above(parseUnits("100", usdt_decimals));
      expect(await usdc.balanceOf(owner.address)).to.above(parseUnits("100", usdc_decimals));
      expect(await wbtc.balanceOf(owner.address)).to.above(parseUnits("1", wbtc_decimals));
      expect(await link.balanceOf(owner.address)).to.above(parseUnits("1", wbtc_decimals));
    });
  });

  describe("save", function () {
    it("save() should initialize", async function () {
      // check initial balances
      const wbtc_balance_sender_0 = await wbtc.balanceOf(owner.address);
      const wbtc_balance_contract_0 = await wbtc.balanceOf(xbitAddress);
      const xbit_balance_sender_0 = await xbit.balanceOf(owner.address);
      expect(wbtc_balance_sender_0).to.above(parseUnits("1", wbtc_decimals));
      expect(wbtc_balance_contract_0).to.equal(0);
      expect(xbit_balance_sender_0).to.equal(0);

      // initialize pool
      let amount_wbtc = parseUnits(INIT_XBIT, wbtc_decimals);
      let wanted_xbit = parseUnits(INIT_XBIT, xbit_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();

      // check final balances
      const wbtc_balance_sender_1 = await wbtc.balanceOf(owner.address);
      const wbtc_balance_contract_1 = await wbtc.balanceOf(xbitAddress);
      const xbit_balance_sender_1 = await xbit.balanceOf(owner.address);
      expect(wbtc_balance_sender_0 - wbtc_balance_sender_1).to.equal(amount_wbtc);
      expect(wbtc_balance_contract_1).to.equal(amount_wbtc);
      expect(xbit_balance_sender_1).to.equal(wanted_xbit);
    });

    it("save() should work", async function () {
      // initialize pool
      let amount_wbtc = parseUnits(INIT_XBIT, wbtc_decimals);
      let amount_xbit = parseUnits(INIT_XBIT, xbit_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();

      // transfer double amount of wbtc to pool
      await wbtc.approve(xbitAddress, amount_wbtc * 2n);
      await (await wbtc.transfer(xbitAddress, amount_wbtc * 2n)).wait();
      expect(await wbtc.balanceOf(xbitAddress)).to.equal(amount_wbtc * 3n);

      const wbtc_balance_sender_1 = await wbtc.balanceOf(owner.address);
      const xbit_balance_sender_1 = await xbit.balanceOf(owner.address);

      // standard save
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();

      // check final balances
      const wbtc_balance_sender_2 = await wbtc.balanceOf(owner.address);
      const wbtc_balance_contract_2 = await wbtc.balanceOf(xbitAddress);
      const xbit_balance_sender_2 = await xbit.balanceOf(owner.address);
      expect(wbtc_balance_sender_1 - wbtc_balance_sender_2).to.equal(amount_wbtc);
      expect(wbtc_balance_contract_2).to.equal(amount_wbtc * 4n);
      expect(xbit_balance_sender_2 - xbit_balance_sender_1).to.equal(amount_xbit / 3n);
    });
  });

  describe("cap", function () {
    // it("should have a total cap of 50 xbit", async function () {
    //   await wbtc.approve(xbitAddress, parseUnits("0.491", wbtc_decimals));
    //   await (await wbtc.transfer(xbitAddress, parseUnits("0.491", wbtc_decimals))).wait();
    //   await xbit.mint(addr1.address, parseUnits("49.1", xbit_decimals));
    //   await wbtc.approve(xbitAddress, parseUnits("0.01", wbtc_decimals));
    //   await expect(xbit.save(parseUnits("0.01", wbtc_decimals))).to.be.revertedWith("amount exceeds total cap");
    //   await (await xbit.save(parseUnits("0.009", wbtc_decimals))).wait();
    //   expect(await xbit.balanceOf(owner.address)).to.equal(parseUnits("0.9", xbit_decimals));
    // });
    // it("should have a user cap of 1 xbit", async function () {
    //   await wbtc.approve(xbitAddress, parseUnits("1.1", wbtc_decimals));
    //   await expect(xbit.save(parseUnits("1.1", wbtc_decimals))).to.be.revertedWith("amount exceeds user cap");
    //   await (await xbit.save(parseUnits("1", wbtc_decimals))).wait();
    //   expect(await xbit.balanceOf(owner.address)).to.equal(parseUnits("1", xbit_decimals));
    // });
  });

  describe("withdraw", function () {
    it("withdraw() should work", async function () {
      // initialize pool
      let amount_wbtc = parseUnits(INIT_XBIT, wbtc_decimals);
      let amount_xbit = parseUnits(INIT_XBIT, xbit_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc, tags)).wait();

      // transfer amount of wbtc to pool
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await wbtc.transfer(xbitAddress, amount_wbtc)).wait();
      expect(await wbtc.balanceOf(xbitAddress)).to.equal(amount_wbtc * 2n);
      const wbtc_balance_sender_1 = await wbtc.balanceOf(owner.address);

      // standard withdraw
      await mine(3);
      await xbit.approve(owner.address, amount_xbit / 2n);
      await (await xbit.withdraw(amount_xbit / 2n, tags)).wait();

      // check final balances
      const wbtc_balance_sender_2 = await wbtc.balanceOf(owner.address);
      const xbit_balance_sender_2 = await xbit.balanceOf(owner.address);
      // 0.1% withdraw fee
      const received_wbtc = amount_wbtc - (amount_wbtc * 1000n) / 1000000n;
      expect(wbtc_balance_sender_2 - wbtc_balance_sender_1).to.equal(received_wbtc);
      expect(xbit_balance_sender_2).to.equal(amount_xbit / 2n);
    });
  });

  describe("maintenance", function () {
    it("only owner can update maintainer", async function () {
      await expect(xbit.connect(addr1).setMaintainer(addr1.address)).to.be.revertedWith("Only callable by owner");
      await (await xbit.setMaintainer(addr1.address)).wait();
    });
  });

  describe("utils", function () {
    it("estimateUSD2JKPT() should work", async function () {
      let amount_usdt = parseUnits("10", usdt_decimals);
      let amount_wbtc = await xbit.estimateUSD2JKPT(amount_usdt);
      expect(amount_wbtc).to.be.above(0);
    });

    it("getPrizePoolSizeInJKPT() should work", async function () {
      // initialize pool
      let amount_wbtc = parseUnits(INIT_XBIT, wbtc_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();
      let get_pool_size_btc = await xbit.getPrizePoolSizeInJKPT();

      expect(get_pool_size_btc).to.be.equal(amount_wbtc);
    });

    it("getPrizePoolSizeInUSD() should work", async function () {
      // initialize pool
      let amount_wbtc = parseUnits(INIT_XBIT, wbtc_decimals);
      await wbtc.approve(xbitAddress, amount_wbtc);
      await (await xbit.save(amount_wbtc)).wait();
      let get_pool_size_usdt = await xbit.getPrizePoolSizeInUSD();

      let usdt_ticket = parseUnits("10", usdt_decimals);
      let wbtc_ticket = await xbit.estimateUSD2JKPT(usdt_ticket);
      let usdt_amount_pool = (amount_wbtc * usdt_ticket) / wbtc_ticket;

      expect(get_pool_size_usdt).to.be.equal(usdt_amount_pool);
    });
  });
});
