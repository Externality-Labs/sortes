import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { erc20Abi, xbitAbi } from "../utils/constants";
let parseUnits = ethers.parseUnits;
let parseEther = ethers.parseEther;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"; // mainnet
export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet
export const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // mainnet
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // mainnet
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // mainnet
export const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA"; // mainnet
export const ROUTER_V2_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // mainnet
export const UNISWAP_SWAPROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // mainnet
export const UNISWAP_SWAPROUTER02_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"; // mainnet
export const CHAINLINK_AGGREGATOR_ADDRESS = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; // mainnet
export const tags = { gasLimit: 2000000 };

export async function setupEnvironment(preparePool = false) {
  let [owner, maintainer, addr1, addr2] = await ethers.getSigners();

  let weth = new ethers.Contract(WETH_ADDRESS, erc20Abi, owner);
  let wbtc = new ethers.Contract(WBTC_ADDRESS, erc20Abi, owner);
  let usdt = new ethers.Contract(USDT_ADDRESS, erc20Abi, owner);
  let usdc = new ethers.Contract(USDC_ADDRESS, erc20Abi, owner);
  let link = new ethers.Contract(LINK_ADDRESS, erc20Abi, owner);
  let xexp = await ethers.deployContract("Xexp");
  let token_addresses = {
    jkpt: WBTC_ADDRESS,
    weth: WETH_ADDRESS,
    usdt: USDT_ADDRESS,
    usdc: USDC_ADDRESS,
    link: LINK_ADDRESS,
    xexp: await xexp.getAddress(),
  };
  let xbit = await ethers.deployContract("NXbitSimple", [token_addresses, ROUTER_V2_ADDRESS]);
  await xbit.waitForDeployment();
  await xbit.setMaintainer(maintainer.address);
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

export async function getEventArgs(contract: any, filter: string, index: number = 0) {
  let events = await contract.queryFilter(contract.filters[filter], -1);
  return events[index].args;
}
