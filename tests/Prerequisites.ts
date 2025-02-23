import { Contract } from "ethers";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { erc20Abi, xbitAbi } from "../utils/constants";

export { Contract, ethers, setBalance, erc20Abi, xbitAbi };

export const parseUnits = ethers.parseUnits;
export const parseEther = ethers.parseEther;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"; // mainnet
export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet
export const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // mainnet
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // mainnet
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // mainnet
export const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA"; // mainnet
export const UNISWAP_SWAPROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // mainnet
export const UNISWAP_SWAPROUTER02_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"; // mainnet
export const CHAINLINK_AGGREGATOR_ADDRESS = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; // mainnet
export const tags = { gasLimit: 1000000 };

export async function getEventArgs(contract: any, filter: string, index: number = 0) {
  let events = await contract.queryFilter(contract.filters[filter], -1);
  return events[index].args;
}
