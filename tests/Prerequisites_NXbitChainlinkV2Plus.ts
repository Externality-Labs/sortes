import { ethers } from "hardhat";
import { Contract } from "ethers";
import { erc20Abi, xbitAbi } from "../utils/constants";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import {
  parseUnits,
  parseEther,
  getEventArgs,
  ZERO_ADDRESS,
  WETH_ADDRESS,
  WBTC_ADDRESS,
  USDT_ADDRESS,
  USDC_ADDRESS,
  LINK_ADDRESS,
  UNISWAP_SWAPROUTER_ADDRESS,
  UNISWAP_SWAPROUTER02_ADDRESS,
  CHAINLINK_AGGREGATOR_ADDRESS,
  tags,
} from "./Prerequisites";

export { getEventArgs, parseUnits, parseEther, tags };

export const CHAINLINK_KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"; // 500 Gwei
export const CALLBACK_GAS_LIMIT = 2000000;
export const LINK_THRESHOLD = parseUnits("0.1", 18);

export async function setupEnvironment(preparePool = false) {
  let [owner, maintainer, addr1, addr2] = await ethers.getSigners();

  let vrf = await ethers.deployContract("VRFCoordinatorV2_5Mock", [
    parseUnits("0.1", 18),
    1000000000n,
    4225348216128512n,
  ]);
  await vrf.waitForDeployment();
  await vrf.setLINKAndLINKNativeFeed(LINK_ADDRESS, ZERO_ADDRESS);

  let tx = await vrf.createSubscription();
  let args = await getEventArgs(vrf, "SubscriptionCreated");
  let subId = args.subId;
  await vrf.fundSubscription(subId, parseUnits("99", 18));

  let weth = new Contract(WETH_ADDRESS, erc20Abi, owner);
  let wbtc = new Contract(WBTC_ADDRESS, erc20Abi, owner);
  let usdt = new Contract(USDT_ADDRESS, erc20Abi, owner);
  let usdc = new Contract(USDC_ADDRESS, erc20Abi, owner);
  let link = new Contract(LINK_ADDRESS, erc20Abi, owner);
  let xexp = await ethers.deployContract("Xexp");
  let token_addresses = {
    jkpt: WBTC_ADDRESS,
    weth: WETH_ADDRESS,
    usdt: USDT_ADDRESS,
    usdc: USDC_ADDRESS,
    link: LINK_ADDRESS,
    xexp: await xexp.getAddress(),
  };

  let xbit = await ethers.deployContract("NXbitChainlinkV2Plus", [
    token_addresses,
    UNISWAP_SWAPROUTER02_ADDRESS,
    CHAINLINK_AGGREGATOR_ADDRESS,
    await vrf.getAddress(),
  ]);
  await xbit.waitForDeployment();
  await xbit.setMaintainer(maintainer.address);
  await xbit.setChainlinkSubscription(subId, CHAINLINK_KEY_HASH, CALLBACK_GAS_LIMIT, LINK_THRESHOLD);
  await vrf.addConsumer(subId, await xbit.getAddress());

  let xabi = new ethers.Contract(await xbit.getAddress(), xbitAbi, owner);
  let simpleSwap = await ethers.deployContract("SimpleSwap", [UNISWAP_SWAPROUTER_ADDRESS]);

  // initialize account
  await setBalance(owner.address, parseEther("10000"));
  const initialEther = parseEther("100");
  await (await weth.deposit({ value: initialEther * 10n })).wait();
  await weth.approve(await simpleSwap.getAddress(), initialEther);
  await (await simpleSwap.swapWETHForUSDT(initialEther, tags)).wait();
  await weth.approve(await simpleSwap.getAddress(), initialEther);
  await (await simpleSwap.swapWETHForUSDC(initialEther, tags)).wait();
  await weth.approve(await simpleSwap.getAddress(), initialEther);
  await (await simpleSwap.swapWETHForWBTC(initialEther, tags)).wait();
  await weth.approve(await simpleSwap.getAddress(), initialEther);
  await (await simpleSwap.swapWETHForLINK(initialEther, tags)).wait();

  let [wbtc_decimals, usdt_decimals, usdc_decimals, link_decimals, xbit_decimals, xexp_decimals] = await Promise.all([
    wbtc.decimals(),
    usdt.decimals(),
    usdc.decimals(),
    link.decimals(),
    xbit.decimals(),
    xexp.decimals(),
  ]);

  await xexp.mint(await xbit.getAddress(), parseUnits("10000000000", xexp_decimals));

  if (preparePool) {
    // prepare WBTC pool
    let amount_wbtc = parseUnits("1", wbtc_decimals);
    await wbtc.approve(await xbit.getAddress(), amount_wbtc);
    await (await xbit.save(amount_wbtc)).wait();
  }

  return {
    owner,
    maintainer,
    addr1,
    addr2,
    vrf,
    weth,
    wbtc,
    usdt,
    usdc,
    link,
    xexp,
    xbit,
    xabi,
    wbtc_decimals,
    usdt_decimals,
    usdc_decimals,
    link_decimals,
    xexp_decimals,
    xbit_decimals,
  };
}
