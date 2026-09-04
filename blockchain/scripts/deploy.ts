import { network } from "hardhat";

const { viem } = await network.create();

const blockVote = await viem.deployContract("BlockVote");

console.log("BlockVote deployed successfully!");
console.log("Contract address:", blockVote.address);