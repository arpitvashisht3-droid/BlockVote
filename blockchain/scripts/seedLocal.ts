import { createPublicClient, createWalletClient, http, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

const CONTRACT_ADDRESS = getAddress('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512');

// Standard Hardhat Account #0 (Contract Owner)
const OWNER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const BLOCKVOTE_ABI = [
  {
    type: 'function',
    name: 'createElection',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_startTime', type: 'uint256' },
      { name: '_endTime', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'addCandidate',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_electionId', type: 'uint256' },
      { name: '_name', type: 'string' },
      { name: '_description', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'registerVoter',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_electionId', type: 'uint256' },
      { name: '_voter', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'elections',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'isPaused', type: 'bool' },
      { name: 'exists', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'isEligible',
    stateMutability: 'view',
    inputs: [
      { name: '_electionId', type: 'uint256' },
      { name: '_voter', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getCandidates',
    stateMutability: 'view',
    inputs: [{ name: '_electionId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'voteCount', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

async function main() {
  const account = privateKeyToAccount(OWNER_PRIVATE_KEY);

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http('http://127.0.0.1:8545'),
  });

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http('http://127.0.0.1:8545'),
  });

  console.log(`\n==================================================`);
  console.log(`Seeding BlockVote Contract at ${CONTRACT_ADDRESS}`);
  console.log(`Owner Account: ${account.address}`);
  console.log(`==================================================\n`);

  const now = Math.floor(Date.now() / 1000);

  // Define the 4 elections matching Supabase database seed order & onchain_id:
  const electionsData = [
    {
      expectedId: 0,
      title: 'Student Council Election 2024',
      description: 'Vote for your student council representatives.',
      startTime: BigInt(now - 3600), // Live (started 1 hr ago)
      endTime: BigInt(now + 86400 * 30), // Ends in 30 days
      candidates: [
        { name: 'Rahul Sharma', description: 'Progressive Student Alliance - President' },
        { name: 'Aman Verma', description: 'Innovators Unity - President' },
        { name: 'Priya Singh', description: 'Independent - President' },
      ],
    },
    {
      expectedId: 1,
      title: 'Tech Club President Election',
      description: 'Choose the next president of the Tech Club.',
      startTime: BigInt(now + 86400 * 7), // Upcoming (starts in 7 days)
      endTime: BigInt(now + 86400 * 14),
      candidates: [
        { name: 'Neha Kapoor', description: 'Tech Forum - President' },
        { name: 'Arjun Mehta', description: 'Open Source Alliance - Vice President' },
      ],
    },
    {
      expectedId: 2,
      title: 'Cultural Fest Committee',
      description: 'Elect representatives for the Cultural Fest Committee.',
      startTime: BigInt(now + 86400 * 30),
      endTime: BigInt(now + 86400 * 60),
      candidates: [],
    },
    {
      expectedId: 3,
      title: 'Academic Council Election',
      description: 'Select faculty and student voices for the Academic Council.',
      startTime: BigInt(now + 86400 * 60),
      endTime: BigInt(now + 86400 * 90),
      candidates: [],
    },
  ];

  for (const electionData of electionsData) {
    const existing = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BLOCKVOTE_ABI,
      functionName: 'elections',
      args: [BigInt(electionData.expectedId)],
    });

    if (!existing[6]) {
      console.log(`Creating Election [${electionData.expectedId}]: "${electionData.title}"...`);

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: BLOCKVOTE_ABI,
        functionName: 'createElection',
        args: [
          electionData.title,
          electionData.description,
          electionData.startTime,
          electionData.endTime,
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`  └ TxHash: ${txHash} (Block ${receipt.blockNumber})`);

      // Add candidates
      for (const cand of electionData.candidates) {
        console.log(`  Adding Candidate: "${cand.name}" to Election ${electionData.expectedId}...`);
        const candTxHash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: BLOCKVOTE_ABI,
          functionName: 'addCandidate',
          args: [BigInt(electionData.expectedId), cand.name, cand.description],
        });
        const candReceipt = await publicClient.waitForTransactionReceipt({ hash: candTxHash });
        console.log(`    └ TxHash: ${candTxHash} (Block ${candReceipt.blockNumber})`);
      }
    } else {
      console.log(`Election [${electionData.expectedId}] "${electionData.title}" already exists on-chain.`);
    }
  }

  // Register eligible voters for Election 0 (if not already eligible)
  const testVoterAddresses: `0x${string}`[] = [
    account.address,
    getAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'), // Hardhat Account #1
    getAddress('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'), // Hardhat Account #2
    getAddress('0x90F79bf6EB2c4f809663852283088B21d0a93956'), // Hardhat Account #3
  ];

  for (const voterAddr of testVoterAddresses) {
    const isEligible = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BLOCKVOTE_ABI,
      functionName: 'isEligible',
      args: [0n, voterAddr],
    });

    if (!isEligible) {
      const regTxHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: BLOCKVOTE_ABI,
        functionName: 'registerVoter',
        args: [0n, voterAddr],
      });
      const regReceipt = await publicClient.waitForTransactionReceipt({ hash: regTxHash });
      console.log(`  Registered Eligible Voter: ${voterAddr} for Election 0 (Tx: ${regTxHash}, Block ${regReceipt.blockNumber})`);
    } else {
      console.log(`  Voter ${voterAddr} is already registered for Election 0.`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`VERIFYING ON-CHAIN DATA AFTER SEEDING`);
  console.log(`==================================================\n`);

  for (let id = 0; id < 4; id++) {
    const election = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BLOCKVOTE_ABI,
      functionName: 'elections',
      args: [BigInt(id)],
    });

    if (election[6]) {
      const candidates = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: BLOCKVOTE_ABI,
        functionName: 'getCandidates',
        args: [BigInt(id)],
      });

      console.log(`On-Chain Election ID ${id}:`);
      console.log(`  Title:       ${election[1]}`);
      console.log(`  Exists:      ${election[6]}`);
      console.log(`  IsPaused:    ${election[5]}`);
      console.log(`  Start Time:  ${new Date(Number(election[3]) * 1000).toISOString()}`);
      console.log(`  End Time:    ${new Date(Number(election[4]) * 1000).toISOString()}`);
      console.log(`  Candidates (${candidates.length}):`);
      candidates.forEach((c) => {
        console.log(`    - [Candidate ID ${c.id}] Name: ${c.name} (${c.description})`);
      });
      console.log(``);
    } else {
      console.log(`On-Chain Election ID ${id}: Does NOT exist on-chain.`);
    }
  }
}

main().catch((err) => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
