/**
 * interact.ts — BlockVote Sepolia interaction script.
 *
 * IMPORTANT: The contract deployed at 0xcfb2e6fb3b53bad6bde74c10a4d171dfe4776e18
 * is an OLDER version of BlockVote whose Election struct does NOT have an
 * `isPaused` field and whose `exists` field is encoded as uint256 (not bool).
 *
 * Struct on-chain (decoded from raw eth_call):
 *   struct Election {
 *     uint256 id;
 *     string  title;
 *     string  description;
 *     uint256 startTime;
 *     uint256 endTime;
 *     uint256 exists;   // 0 = does not exist, 1 = exists  (uint256, NOT bool)
 *   }
 *
 * The local blockvote.sol has the NEWER struct with isPaused + bool exists.
 * Using the new ABI to decode the old contract causes viem to throw:
 *   "Bytes value '23' is not a valid boolean"
 * because the uint256 `exists` field contains 0x01 at a position where
 * the new ABI expects two packed bools, but the 32-byte slot is 0x01 (not 0x00/0x01).
 *
 * This script uses an INLINE ABI that matches the deployed bytecode exactly.
 * Do NOT replace it with the generated Hardhat artifact ABI.
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (walk up from blockchain/blockchain/scripts/)
// __dirname is reconstructed via import.meta.url (ESM-compatible)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });   // BLOCKCHAIN/blockchain/.env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") }); // BLOCKCHAIN/.env (fallback)

// ── Constants ────────────────────────────────────────────────────────────────

const CONTRACT_ADDRESS =
  "0xcfb2e6fb3b53bad6bde74c10a4d171dfe4776e18" as const;

const VOTER_ADDRESS =
  "0xd6acfa4c30ec1053e36ddaa58ddd18f5d012f51d" as const;

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY as `0x${string}` | undefined;

// ── ABI — matches the DEPLOYED contract exactly (old struct, no isPaused) ────
//
// Key difference from blockvote.sol:
//   - elections() returns exists as uint256 (not bool)
//   - NO isPaused field
//   - NO pauseElection / resumeElection / endElection functions
//
const DEPLOYED_ABI = [
  // ── View / pure ─────────────────────────────────────────────────────────
  {
    name: "elections",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id",          type: "uint256" },
      { name: "title",       type: "string"  },
      { name: "description", type: "string"  },
      { name: "startTime",   type: "uint256" },
      { name: "endTime",     type: "uint256" },
      { name: "exists",      type: "uint256" }, // uint256 on-chain, NOT bool
    ],
  },
  {
    name: "getCandidates",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_electionId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id",          type: "uint256" },
          { name: "name",        type: "string"  },
          { name: "description", type: "string"  },
          { name: "voteCount",   type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getCandidateCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_electionId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasVoted",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isEligible",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  // ── State-changing ───────────────────────────────────────────────────────
  {
    name: "createElection",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_title",       type: "string"  },
      { name: "_description", type: "string"  },
      { name: "_startTime",   type: "uint256" },
      { name: "_endTime",     type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "addCandidate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_electionId",  type: "uint256" },
      { name: "_name",        type: "string"  },
      { name: "_description", type: "string"  },
    ],
    outputs: [],
  },
  {
    name: "registerVoter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_electionId", type: "uint256" },
      { name: "_voter",      type: "address" },
    ],
    outputs: [],
  },
  {
    name: "castVote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_electionId",  type: "uint256" },
      { name: "_candidateId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function separator(label: string) {
  console.log("\n" + "=".repeat(60));
  console.log(label);
  console.log("=".repeat(60));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!PRIVATE_KEY) {
    throw new Error(
      "SEPOLIA_PRIVATE_KEY is not set. Add it to your root .env file."
    );
  }

  // Clients
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC),
  });

  const account = privateKeyToAccount(PRIVATE_KEY);

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC),
    account,
  });

  // ── 1. Read: verify owner ───────────────────────────────────────────────
  separator("1. Read contract owner");
  const owner = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "owner",
  });
  console.log("Owner:", owner);
  console.log("Signer:", account.address);
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    console.warn(
      "⚠️  WARNING: Signer is not the contract owner. Write transactions will revert."
    );
  }

  // ── 2. Read: find the next available election ID ────────────────────────
  separator("2. Scanning existing elections");
  let nextId = 0n;

  while (true) {
    const rawElection = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: DEPLOYED_ABI,
      functionName: "elections",
      args: [nextId],
    })) as any;

    const election = {
      id: (rawElection?.id ?? rawElection?.[0]) as bigint,
      title: (rawElection?.title ?? rawElection?.[1]) as string,
      description: (rawElection?.description ?? rawElection?.[2]) as string,
      startTime: (rawElection?.startTime ?? rawElection?.[3]) as bigint,
      endTime: (rawElection?.endTime ?? rawElection?.[4]) as bigint,
      exists: (rawElection?.exists ?? rawElection?.[5]) as bigint,
    };

    // exists is uint256: 0 = does not exist, 1 = exists
    if (election.exists === 0n) {
      break;
    }

    console.log(`  Election ${nextId}: "${election.title}"`);
    console.log(`    startTime : ${election.startTime}`);
    console.log(`    endTime   : ${election.endTime}`);

    // ── 2a. Read candidates for this election
    const candidates = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: DEPLOYED_ABI,
      functionName: "getCandidates",
      args: [nextId],
    });
    if (candidates.length > 0) {
      candidates.forEach((c) =>
        console.log(
          `    Candidate ${c.id}: ${c.name} (votes: ${c.voteCount})`
        )
      );
    } else {
      console.log("    No candidates yet.");
    }

    nextId++;
  }

  console.log(`\n  Next available election ID: ${nextId}`);

  // ── 3. Write: create a new election ────────────────────────────────────
  separator("3. Creating new election on Sepolia");
  console.log("  New election ID will be:", nextId.toString());

  // Starts 60 seconds ago (so voting is open immediately), lasts 24 hours
  const now = BigInt(Math.floor(Date.now() / 1000));
  const startTime = now - 60n;
  const endTime = now + 86400n;

  console.log("  startTime:", startTime.toString());
  console.log("  endTime  :", endTime.toString());

  const createTx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "createElection",
    args: [
      "BlockVote Sepolia Demo",
      "Blockchain voting demo election",
      startTime,
      endTime,
    ],
  });
  console.log("  createElection tx:", createTx);

  // Wait for the tx to be mined before proceeding
  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log("  createElection mined in block:", createReceipt.blockNumber.toString());

  // Verify the election was created
  const newElectionRaw = (await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "elections",
    args: [nextId],
  })) as any;
  const newElection = {
    id: (newElectionRaw?.id ?? newElectionRaw?.[0]) as bigint,
    title: (newElectionRaw?.title ?? newElectionRaw?.[1]) as string,
    description: (newElectionRaw?.description ?? newElectionRaw?.[2]) as string,
    startTime: (newElectionRaw?.startTime ?? newElectionRaw?.[3]) as bigint,
    endTime: (newElectionRaw?.endTime ?? newElectionRaw?.[4]) as bigint,
    exists: (newElectionRaw?.exists ?? newElectionRaw?.[5]) as bigint,
  };
  console.log("  Created election title:", newElection.title);
  if (newElection.exists === 0n) {
    throw new Error("Election was not created — exists is 0 after createElection.");
  }

  // ── 4. Write: add candidates ────────────────────────────────────────────
  separator("4. Adding candidates");

  const aliceTx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "addCandidate",
    args: [nextId, "Alice", "Candidate Alice"],
  });
  console.log("  addCandidate(Alice) tx:", aliceTx);
  await publicClient.waitForTransactionReceipt({ hash: aliceTx });
  console.log("  Alice mined.");

  const bobTx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "addCandidate",
    args: [nextId, "Bob", "Candidate Bob"],
  });
  console.log("  addCandidate(Bob) tx:", bobTx);
  await publicClient.waitForTransactionReceipt({ hash: bobTx });
  console.log("  Bob mined.");

  // Verify candidates
  const candidatesAfter = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "getCandidates",
    args: [nextId],
  });
  console.log("  Candidates now:", candidatesAfter.map((c) => c.name));

  // ── 5. Write: register voter ────────────────────────────────────────────
  separator("5. Registering voter");
  console.log("  Voter address:", VOTER_ADDRESS);

  const alreadyEligible = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "isEligible",
    args: [nextId, VOTER_ADDRESS],
  });

  if (alreadyEligible) {
    console.log("  Voter is already registered for this election. Skipping.");
  } else {
    const voterTx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: DEPLOYED_ABI,
      functionName: "registerVoter",
      args: [nextId, VOTER_ADDRESS],
    });
    console.log("  registerVoter tx:", voterTx);
    await publicClient.waitForTransactionReceipt({ hash: voterTx });
    console.log("  Voter registered and mined.");
  }

  // Final verify
  const eligible = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: DEPLOYED_ABI,
    functionName: "isEligible",
    args: [nextId, VOTER_ADDRESS],
  });
  console.log("  isEligible:", eligible);

  // ── 6. Summary ──────────────────────────────────────────────────────────
  separator("ELECTION SETUP COMPLETE");
  console.log("  Contract    :", CONTRACT_ADDRESS);
  console.log("  Election ID :", nextId.toString());
  console.log("  Title       : BlockVote Sepolia Demo");
  console.log("  Voter       :", VOTER_ADDRESS);
  console.log("  isEligible  :", eligible);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});