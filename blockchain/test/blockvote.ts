import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("BlockVote", async function () {

  it("should deploy successfully", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    assert.ok(blockVote.address);
  });

  it("should create an election", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const startTime = BigInt(Math.floor(Date.now() / 1000) + 60);
    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    const election = await blockVote.read.elections([0n]);

    assert.equal(election[0], 0n);
    assert.equal(election[1], "College Election 2026");
    assert.equal(
      election[2],
      "Blockchain based student election"
    );
    assert.equal(election[5], false);
    assert.equal(election[6], true);
  });
  it("should add a candidate to an election", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const startTime = BigInt(Math.floor(Date.now() / 1000) + 60);
    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate for Student Council",
    ]);

    const candidates = await blockVote.read.getCandidates([0n]);

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Rahul");
    assert.equal(
      candidates[0].description,
      "Candidate for Student Council"
    );
    assert.equal(candidates[0].voteCount, 0n);
  });
    it("should register a voter", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    const eligible =
      await blockVote.read.isEligible([
        0n,
        voter1.account.address,
      ]);

    assert.equal(eligible, true);
  });
    it("should allow an eligible voter to cast a vote", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    // Create election
    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    // Add candidate
    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate for Student Council",
    ], {
      account: owner.account,
    });

    // Register voter
    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    // Move blockchain time to election start
    await viem.getPublicClient().then(async (client) => {
      await client.request({
        method: "evm_increaseTime",
        params: [61],
      });

      await client.request({
        method: "evm_mine",
        params: [],
      });
    });

    // Cast vote
    await blockVote.write.castVote(
      [0n, 0n],
      {
        account: voter1.account,
      }
    );

    // Check candidate votes
    const candidates =
      await blockVote.read.getCandidates([0n]);

    assert.equal(candidates[0].voteCount, 1n);

    // Check voter status
    const voted =
      await blockVote.read.hasVoted([
        0n,
        voter1.account.address,
      ]);

    assert.equal(voted, true);
  });
    it("should prevent double voting", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    // Create election
    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    // Add candidate
    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate for Student Council",
    ], {
      account: owner.account,
    });

    // Register voter
    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    // Start election
    const client = await viem.getPublicClient();

    await client.request({
      method: "evm_increaseTime",
      params: [61],
    });

    await client.request({
      method: "evm_mine",
      params: [],
    });

    // First vote
    await blockVote.write.castVote(
      [0n, 0n],
      {
        account: voter1.account,
      }
    );

    // Second vote should fail
    await assert.rejects(
      async () => {
        await blockVote.write.castVote(
          [0n, 0n],
          {
            account: voter1.account,
          }
        );
      },
      /Voter has already voted/
    );
  });
    it("should prevent non-owner from creating an election", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    await assert.rejects(
      async () => {
        await blockVote.write.createElection(
          [
            "Unauthorized Election",
            "This should fail",
            startTime,
            endTime,
          ],
          {
            account: voter1.account,
          }
        );
      }
    );
  });
    it("should prevent an unregistered voter from voting", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    // Create election
    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    // Add candidate
    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate for Student Council",
    ], {
      account: owner.account,
    });

    // Start election
    const client = await viem.getPublicClient();

    await client.request({
      method: "evm_increaseTime",
      params: [61],
    });

    await client.request({
      method: "evm_mine",
      params: [],
    });

    // voter1 is NOT registered
    await assert.rejects(
      async () => {
        await blockVote.write.castVote(
          [0n, 0n],
          {
            account: voter1.account,
          }
        );
      }
    );
  });
    it("should prevent voting for an invalid candidate", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 3600n;

    // Create election
    await blockVote.write.createElection([
      "College Election 2026",
      "Blockchain based student election",
      startTime,
      endTime,
    ]);

    // Add only candidate #0
    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate for Student Council",
    ], {
      account: owner.account,
    });

    // Register voter
    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    // Start election
    const client = await viem.getPublicClient();

    await client.request({
      method: "evm_increaseTime",
      params: [61],
    });

    await client.request({
      method: "evm_mine",
      params: [],
    });

    // Candidate #999 does not exist
    await assert.rejects(
      async () => {
        await blockVote.write.castVote(
          [0n, 999n],
          {
            account: voter1.account,
          }
        );
      }
    );
  });
    it("should prevent voting before the election starts", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 3600
    );

    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "Future Election",
      "Voting has not started yet",
      startTime,
      endTime,
    ]);

    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate",
    ], {
      account: owner.account,
    });

    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    // We deliberately DON'T move blockchain time forward.

    await assert.rejects(
      async () => {
        await blockVote.write.castVote(
          [0n, 0n],
          {
            account: voter1.account,
          }
        );
      }
    );
  });
    it("should prevent voting after the election ends", async function () {
    const { viem } = await network.connect();

    const blockVote = await viem.deployContract("BlockVote");

    const [owner, voter1] =
      await viem.getWalletClients();

    const startTime = BigInt(
      Math.floor(Date.now() / 1000) + 60
    );

    const endTime = startTime + 120n;

    await blockVote.write.createElection([
      "Expired Election",
      "This election has ended",
      startTime,
      endTime,
    ]);

    await blockVote.write.addCandidate([
      0n,
      "Rahul",
      "Candidate",
    ], {
      account: owner.account,
    });

    await blockVote.write.registerVoter([
      0n,
      voter1.account.address,
    ], {
      account: owner.account,
    });

    // Move time beyond the election end time
    const client = await viem.getPublicClient();

    await client.request({
      method: "evm_increaseTime",
      params: [200],
    });

    await client.request({
      method: "evm_mine",
      params: [],
    });

    // Voting should now fail
    await assert.rejects(
      async () => {
        await blockVote.write.castVote(
          [0n, 0n],
          {
            account: voter1.account,
          }
        );
      }
    );
  });

  it("should handle pause and resume election by owner and block votes while paused", async function () {
    const { viem } = await network.connect();
    const blockVote = await viem.deployContract("BlockVote");
    const [owner, voter1] = await viem.getWalletClients();

    const startTime = BigInt(Math.floor(Date.now() / 1000) + 60);
    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "Pausable Election",
      "Testing pause/resume",
      startTime,
      endTime,
    ]);

    await blockVote.write.addCandidate([0n, "Alice", "Candidate"], { account: owner.account });
    await blockVote.write.registerVoter([0n, voter1.account.address], { account: owner.account });

    // Non-owner cannot pause
    await assert.rejects(async () => {
      await blockVote.write.pauseElection([0n], { account: voter1.account });
    });

    // Owner pauses election
    await blockVote.write.pauseElection([0n], { account: owner.account });
    const electionAfterPause = await blockVote.read.elections([0n]);
    assert.equal(electionAfterPause[5], true); // isPaused == true

    // Advance time into voting window
    const client = await viem.getPublicClient();
    await client.request({ method: "evm_increaseTime", params: [61] });
    await client.request({ method: "evm_mine", params: [] });

    // castVote while paused must fail
    await assert.rejects(async () => {
      await blockVote.write.castVote([0n, 0n], { account: voter1.account });
    }, /Election is paused/);

    // Owner resumes election
    await blockVote.write.resumeElection([0n], { account: owner.account });
    const electionAfterResume = await blockVote.read.elections([0n]);
    assert.equal(electionAfterResume[5], false); // isPaused == false

    // Voting after resume should succeed
    await blockVote.write.castVote([0n, 0n], { account: voter1.account });
    const voted = await blockVote.read.hasVoted([0n, voter1.account.address]);
    assert.equal(voted, true);
  });

  it("should handle manual endElection by owner and block further votes", async function () {
    const { viem } = await network.connect();
    const blockVote = await viem.deployContract("BlockVote");
    const [owner, voter1] = await viem.getWalletClients();

    const startTime = BigInt(Math.floor(Date.now() / 1000) + 60);
    const endTime = startTime + 3600n;

    await blockVote.write.createElection([
      "Early End Election",
      "Testing manual end",
      startTime,
      endTime,
    ]);

    await blockVote.write.addCandidate([0n, "Bob", "Candidate"], { account: owner.account });
    await blockVote.write.registerVoter([0n, voter1.account.address], { account: owner.account });

    // Move into voting window
    const client = await viem.getPublicClient();
    await client.request({ method: "evm_increaseTime", params: [61] });
    await client.request({ method: "evm_mine", params: [] });

    // Non-owner cannot end election
    await assert.rejects(async () => {
      await blockVote.write.endElection([0n], { account: voter1.account });
    });

    // Owner manually ends election
    await blockVote.write.endElection([0n], { account: owner.account });

    // castVote after manual end must fail
    await assert.rejects(async () => {
      await blockVote.write.castVote([0n, 0n], { account: voter1.account });
    }, /Voting has ended/);
  });
});