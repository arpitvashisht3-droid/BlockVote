import { network } from "hardhat";

const CONTRACT_ADDRESS =
  "0xcfb2e6fb3b53bad6bde74c10a4d171dfe4776e18";

async function main() {
  const { viem } = await network.connect();

  const blockVote = await viem.getContractAt(
    "BlockVote",
    CONTRACT_ADDRESS
  );

  console.log("Reading election results...");

  const candidates = await blockVote.read.getCandidates([0n]);

  console.log("\n===== ELECTION RESULTS =====");

  for (const candidate of candidates) {
    console.log(`Candidate ID: ${candidate.id}`);
    console.log(`Name: ${candidate.name}`);
    console.log(`Description: ${candidate.description}`);
    console.log(`Votes: ${candidate.voteCount}`);
    console.log("----------------------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});