import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlockVoteModule = buildModule("BlockVoteModule", (m) => {
  const blockVote = m.contract("BlockVote");

  return { blockVote };
});

export default BlockVoteModule;
