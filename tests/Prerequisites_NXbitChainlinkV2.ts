import { Contract } from "ethers";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { erc20Abi, xbitAbi } from "../utils/constants";
import { getEventArgs, parseUnits, parseEther } from "./Prerequisites";

export { getEventArgs, parseUnits, parseEther };

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"; // mainnet
export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet
export const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // mainnet
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // mainnet
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // mainnet
export const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA"; // mainnet
export const UNISWAP_SWAPROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // mainnet
export const UNISWAP_SWAPROUTER02_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"; // mainnet
export const CHAINLINK_AGGREGATOR_ADDRESS = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; // mainnet
export const CHAINLINK_KEY_HASH = "0xff8dedfbfa60af186cf3c830acbc32c05aae823045ae5ea7da1e45fbfaba4f92"; // 500 Gwei
export const CALLBACK_GAS_LIMIT = 1000000;
export const LINK_THRESHOLD = parseUnits("0.1", 18);
export const SUB_ID = 1;
export const tags = { gasLimit: 1000000 };

export async function setupEnvironment(preparePool = false) {
  let [owner, maintainer, addr1, addr2] = await ethers.getSigners();

  let vrf = await ethers.deployContract("VRFCoordinatorV2ERC677ReceiverMock", [parseUnits("0.1", 18), 1e9]);
  await vrf.waitForDeployment();
  await vrf.createSubscription();
  await vrf.fundSubscription(SUB_ID, parseUnits("999", 18));

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
  let xbit = await ethers.deployContract("NXbitChainlinkV2", [
    token_addresses,
    UNISWAP_SWAPROUTER02_ADDRESS,
    CHAINLINK_AGGREGATOR_ADDRESS,
    await vrf.getAddress(),
  ]);
  await xbit.waitForDeployment();
  await xbit.setMaintainer(maintainer.address);
  await xbit.setChainlinkSubscription(SUB_ID, CHAINLINK_KEY_HASH, CALLBACK_GAS_LIMIT, LINK_THRESHOLD);
  await vrf.addConsumer(SUB_ID, await xbit.getAddress());
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
