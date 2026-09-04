// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockVote is Ownable {

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isPaused;
        bool exists;
    }

    uint256 private nextElectionId;
    uint256 private nextCandidateId;

    mapping(uint256 => Election) public elections;

    mapping(uint256 => Candidate[]) private electionCandidates;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    mapping(uint256 => mapping(address => bool)) public isEligible;

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name
    );

    event VoterRegistered(
        uint256 indexed electionId,
        address indexed voter
    );

    event VoteCast(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        address indexed voter
    );

    event ElectionPaused(
        uint256 indexed electionId
    );

    event ElectionResumed(
        uint256 indexed electionId
    );

    event ElectionEnded(
        uint256 indexed electionId,
        uint256 endTime
    );

    constructor() Ownable(msg.sender) {}

    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (uint256) {

        require(bytes(_title).length > 0, "Title required");
        require(_startTime < _endTime, "Invalid time");
        require(_endTime > block.timestamp, "End time must be in future");

        uint256 electionId = nextElectionId;

        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isPaused: false,
            exists: true
        });

        nextElectionId++;

        emit ElectionCreated(
            electionId,
            _title,
            _startTime,
            _endTime
        );

        return electionId;
    }

    function pauseElection(uint256 _electionId) external onlyOwner {
        require(elections[_electionId].exists, "Election not found");
        require(block.timestamp <= elections[_electionId].endTime, "Voting has ended");
        require(!elections[_electionId].isPaused, "Election is already paused");

        elections[_electionId].isPaused = true;
        emit ElectionPaused(_electionId);
    }

    function resumeElection(uint256 _electionId) external onlyOwner {
        require(elections[_electionId].exists, "Election not found");
        require(elections[_electionId].isPaused, "Election is not paused");
        require(block.timestamp <= elections[_electionId].endTime, "Voting has ended");

        elections[_electionId].isPaused = false;
        emit ElectionResumed(_electionId);
    }

    function endElection(uint256 _electionId) external onlyOwner {
        require(elections[_electionId].exists, "Election not found");
        require(block.timestamp <= elections[_electionId].endTime, "Voting has ended");

        elections[_electionId].endTime = block.timestamp;
        emit ElectionEnded(_electionId, block.timestamp);
    }

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _description
    ) external onlyOwner {

        require(
            elections[_electionId].exists,
            "Election not found"
        );

        require(
            bytes(_name).length > 0,
            "Candidate name required"
        );

        uint256 candidateId = nextCandidateId;

        electionCandidates[_electionId].push(
            Candidate({
                id: candidateId,
                name: _name,
                description: _description,
                voteCount: 0
            })
        );

        nextCandidateId++;

        emit CandidateAdded(
            _electionId,
            candidateId,
            _name
        );
    }

    function registerVoter(
        uint256 _electionId,
        address _voter
    ) external onlyOwner {

        require(
            elections[_electionId].exists,
            "Election not found"
        );

        require(
            _voter != address(0),
            "Invalid voter address"
        );

        require(
            !isEligible[_electionId][_voter],
            "Voter already registered"
        );

        isEligible[_electionId][_voter] = true;

        emit VoterRegistered(
            _electionId,
            _voter
        );
    }

    function castVote(
        uint256 _electionId,
        uint256 _candidateId
    ) external {

        Election memory election = elections[_electionId];

        require(
            election.exists,
            "Election not found"
        );

        require(
            !election.isPaused,
            "Election is paused"
        );

        require(
            block.timestamp >= election.startTime,
            "Voting has not started"
        );

        require(
            block.timestamp <= election.endTime,
            "Voting has ended"
        );

    require(
        isEligible[_electionId][msg.sender],
        "Voter is not eligible"
    );

    require(
        !hasVoted[_electionId][msg.sender],
        "Voter has already voted"
    );

    bool candidateExists = false;

    for (
        uint256 i = 0;
        i < electionCandidates[_electionId].length;
        i++
    ) {
        if (
            electionCandidates[_electionId][i].id
            == _candidateId
        ) {
            electionCandidates[_electionId][i].voteCount++;

            candidateExists = true;

            break;
        }
    }

    require(
        candidateExists,
        "Candidate not found"
    );

    hasVoted[_electionId][msg.sender] = true;

    emit VoteCast(
        _electionId,
        _candidateId,
        msg.sender
    );
}
function getCandidates(
    uint256 _electionId
) external view returns (Candidate[] memory) {
    
    require(
        elections[_electionId].exists,
        "Election not found"
    );

    return electionCandidates[_electionId];
}
function getCandidateCount(
    uint256 _electionId
) external view returns (uint256) {
    
    require(
        elections[_electionId].exists,
        "Election not found"
    );

    return electionCandidates[_electionId].length;
}
}
