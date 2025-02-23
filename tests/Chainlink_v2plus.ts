import { Contract } from "ethers";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { erc20Abi, xbitAbi } from "../utils/constants";
let parseUnits = ethers.parseUnits;
let parseEther = ethers.parseEther;

const KEYHASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

export async function getEventArgs(contract: any, filter: string, index: number = 0) {
  let events = await contract.queryFilter(contract.filters[filter], -1);
  return events[index].args;
}

describe("Chainlink_v2plus", function () {
  it("Chainlink_v2plus", async function () {
    let [owner, maintainer, addr1, addr2] = await ethers.getSigners();

    let vrf = await ethers.deployContract("VRFCoordinatorV2_5Mock", [
      parseUnits("0.1", 18),
      1000000000n,
      4225348216128512n,
    ]);
    await vrf.waitForDeployment();
    let vrfAddress = await vrf.getAddress();

    let tx = await vrf.createSubscription();
    let args = await getEventArgs(vrf, "SubscriptionCreated");
    let subId = args.subId;
    await vrf.fundSubscription(subId, parseUnits("999", 18));

    let consumer = await ethers.deployContract("RandomNumberConsumerV2Plus", [subId, vrfAddress, KEYHASH]);
    let consumerAddress = await consumer.getAddress();
    await vrf.addConsumer(subId, consumerAddress);

    await consumer.requestRandomWords();
    let requestId = await consumer.s_requestId();

    await vrf.fulfillRandomWords(requestId, consumerAddress);
    let ans = await consumer.s_randomWords(0);

    console.log("subId:", subId);
    console.log("requestId:", requestId);
    console.log("ans:", ans);
  });
});
