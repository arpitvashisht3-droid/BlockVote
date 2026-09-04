# BlockVote Database Architecture (Supabase / PostgreSQL)

This directory contains the complete database schema, Row Level Security
(RLS) policies, portable seed data, and documentation for **BlockVote** —
a blockchain-based voting platform with privacy-preserving separation
between voter identity data and vote records.

---

## 1. Architectural Overview

BlockVote separates application and election data between:

- **Supabase / PostgreSQL** — off-chain relational database
- **Ethereum-compatible EVM smart contracts** — on-chain voting and
  verification layer

The database is responsible for user profiles, election metadata,
candidate information, eligibility registration, participation status,
and an index of blockchain transaction receipts.

The blockchain layer is responsible for the authoritative vote tally
and, in the future ZK architecture, anonymous vote verification.

### Core Privacy & Separation Design

#### 1. No Direct Voter-to-Candidate Vote Relationship

The database intentionally does not create a direct relational mapping
between:

- `voter_participation.voter_id`
- `blockchain_transactions.candidate_id`
- `blockchain_transactions.transaction_hash`
- `blockchain_transactions.nullifier_hash`

The participation table records whether a voter has participated,
while the blockchain transaction table records the vote receipt and
candidate information.

Therefore, the database schema does not provide a direct relational
mapping from a voter identity to a selected candidate.

This database-level separation alone does **not** make the current
blockchain implementation anonymous. The current smart contract still
exposes the voter's blockchain address. True anonymous blockchain
voting requires the future ZK-proof, nullifier, and relayer architecture
described later in this document.

---

#### 2. No Voting Timestamp in Participation

The `voter_participation` table intentionally contains:

- `election_id`
- `voter_id`
- `has_voted`

It does **not** contain:

- `voted_at`
- `created_at`
- `candidate_id`
- `transaction_hash`
- `nullifier_hash`

This avoids storing a precise database-side voting timestamp that could
otherwise be used for correlation with blockchain transaction timing.

---

#### 3. Client-Side Secrets

Future anonymous voting will use private voter secrets such as:

- `IdentitySecret`
- `NullifierSecret`

These secrets must remain under the control of the voter.

They must:

- remain in the client/browser
- never be stored in Supabase
- never be stored in the Backend database
- never be stored in `public.users`
- never be stored in `voter_eligibility`
- never be stored in `blockchain_transactions`

The database stores only the resulting public cryptographic commitment
required by the future ZK/Merkle registration system.

---

#### 4. Future On-Chain Double-Vote Protection

The planned ZK architecture will use an on-chain nullifier mechanism
to prevent the same eligible voter from voting more than once in a
single election.

The future smart contract is expected to:

1. Verify the ZK proof.
2. Verify membership in the eligible-voter Merkle tree.
3. Check that the nullifier has not already been used.
4. Record the nullifier.
5. Count the selected candidate's vote.

The exact ZK proof system and cryptographic commitment construction
will be defined and implemented in the future Blockchain branch.

---

# 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram

    auth_users ||--|| users : "extends profile"

    users ||--o{ elections : "creates admin"

    users ||--o{ voter_eligibility : "registered commitment"

    users ||--o{ voter_participation : "participates"

    elections ||--|{ candidates : "contains"

    elections ||--|| election_settings : "configured by"

    elections ||--o{ voter_eligibility : "eligible voters"

    elections ||--o{ voter_participation : "participation"

    elections ||--o{ blockchain_transactions : "indexes EVM transactions"

    candidates ||--o{ blockchain_transactions : "indexed vote records"