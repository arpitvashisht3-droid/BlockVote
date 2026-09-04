-- ==============================================================================
-- BLOCKVOTE SUPABASE DATABASE SCHEMA (PostgreSQL)
-- Pseudonymous Blockchain Voting with Database-Level Privacy Separation
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==============================================================================
-- 1. USERS PROFILE TABLE (Linked to auth.users)
-- Stores off-chain user profiles, roles, voter IDs, and EVM wallet addresses.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    email TEXT UNIQUE NOT NULL,

    full_name TEXT NOT NULL,

    voter_id TEXT UNIQUE NOT NULL,

    wallet_address TEXT UNIQUE,

    role TEXT NOT NULL DEFAULT 'voter'
        CHECK (role IN ('voter', 'admin')),

    status TEXT NOT NULL DEFAULT 'Eligible to vote',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 2. ELECTIONS TABLE
-- Central table for all election events, scheduling, and statuses.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug TEXT UNIQUE NOT NULL,

    election_code TEXT UNIQUE NOT NULL,

    title TEXT NOT NULL,

    description TEXT NOT NULL,

    details_description TEXT,

    organization TEXT,

    election_type TEXT
        CHECK (
            election_type IN (
                'General Election',
                'Student Election',
                'Organization Election',
                'Committee Election'
            )
        ),

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'live', 'ended')),

    start_date TIMESTAMPTZ NOT NULL,

    end_date TIMESTAMPTZ NOT NULL,

    published BOOLEAN NOT NULL DEFAULT false,

    paused BOOLEAN NOT NULL DEFAULT false,

    archived BOOLEAN NOT NULL DEFAULT false,

    thumbnail_icon TEXT DEFAULT 'landmark',

    thumbnail_tone TEXT DEFAULT 'navy',

    onchain_id BIGINT UNIQUE,

    created_by UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 3. CANDIDATES TABLE
-- Stores candidates competing in each election.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    election_id UUID NOT NULL
        REFERENCES public.elections(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    department TEXT NOT NULL,

    position TEXT,

    about TEXT,

    achievements TEXT[] DEFAULT '{}',

    party TEXT,

    removed BOOLEAN NOT NULL DEFAULT false,

    onchain_id BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_candidate_name_per_election
        UNIQUE (election_id, name)
);


-- ==============================================================================
-- 4. ELECTION SETTINGS TABLE
-- Fine-grained voting rules and display parameters for an election.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.election_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    election_id UUID UNIQUE NOT NULL
        REFERENCES public.elections(id)
        ON DELETE CASCADE,

    method TEXT NOT NULL DEFAULT 'Single Choice',

    votes_per_voter INTEGER NOT NULL DEFAULT 1,

    anonymous_voting BOOLEAN NOT NULL DEFAULT true,

    require_wallet BOOLEAN NOT NULL DEFAULT false,

    allow_vote_changes BOOLEAN NOT NULL DEFAULT false,

    show_live_results BOOLEAN NOT NULL DEFAULT false,

    visibility TEXT NOT NULL DEFAULT 'Public'
        CHECK (visibility IN ('Public', 'Private')),

    require_voter_verification BOOLEAN NOT NULL DEFAULT true,

    enable_blockchain_verification BOOLEAN NOT NULL DEFAULT true,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 5. VOTER ELIGIBILITY TABLE (Merkle Commitments Only)
-- Stores one-way cryptographic commitments for voter registration in Merkle trees.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.voter_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    election_id UUID NOT NULL
        REFERENCES public.elections(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    identity_commitment TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One voter can be registered only once per election.
    CONSTRAINT unique_user_election_eligibility
        UNIQUE (election_id, user_id),

    -- The same identity commitment cannot be registered twice
    -- within the same election.
    CONSTRAINT unique_identity_commitment_per_election
        UNIQUE (election_id, identity_commitment)
);


-- ==============================================================================
-- 6. VOTER PARTICIPATION TABLE
-- NO TIMESTAMPS OR CANDIDATE CHOICE
--
-- Tracks whether a voter has submitted a ballot.
-- It deliberately does NOT contain:
--   - candidate_id
--   - transaction_hash
--   - nullifier_hash
--   - voted_at
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.voter_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    election_id UUID NOT NULL
        REFERENCES public.elections(id)
        ON DELETE CASCADE,

    voter_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    has_voted BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT unique_voter_election_participation
        UNIQUE (election_id, voter_id)
);


-- ==============================================================================
-- 7. BLOCKCHAIN TRANSACTIONS INDEX
--
-- Decoupled anonymous index of EVM transactions for tallying
-- and receipt verification.
--
-- IMPORTANT:
-- This table deliberately contains NO:
--   - voter_id
--   - user_id
--   - wallet_address
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    election_id UUID NOT NULL
        REFERENCES public.elections(id)
        ON DELETE CASCADE,

    -- SET NULL preserves the blockchain transaction record if a candidate
    -- is later removed from the database.
    candidate_id UUID
        REFERENCES public.candidates(id)
        ON DELETE SET NULL,

    tx_type TEXT NOT NULL
        CHECK (
            tx_type IN (
                'vote_cast',
                'election_created',
                'candidate_added',
                'voter_registered'
            )
        ),

    nullifier_hash TEXT UNIQUE,

    transaction_hash TEXT UNIQUE NOT NULL,

    block_number BIGINT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'failed')),

    confirmations INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_wallet_address
    ON public.users(wallet_address);

CREATE INDEX IF NOT EXISTS idx_users_voter_id
    ON public.users(voter_id);

CREATE INDEX IF NOT EXISTS idx_elections_status
    ON public.elections(status);

CREATE INDEX IF NOT EXISTS idx_elections_slug
    ON public.elections(slug);

CREATE INDEX IF NOT EXISTS idx_elections_code
    ON public.elections(election_code);

CREATE INDEX IF NOT EXISTS idx_candidates_election_id
    ON public.candidates(election_id);

CREATE INDEX IF NOT EXISTS idx_election_settings_election_id
    ON public.election_settings(election_id);

CREATE INDEX IF NOT EXISTS idx_voter_eligibility_election
    ON public.voter_eligibility(election_id);

CREATE INDEX IF NOT EXISTS idx_voter_part_election_voter
    ON public.voter_participation(election_id, voter_id);

CREATE INDEX IF NOT EXISTS idx_bc_tx_election_id
    ON public.blockchain_transactions(election_id);

CREATE INDEX IF NOT EXISTS idx_bc_tx_candidate_id
    ON public.blockchain_transactions(candidate_id);

CREATE INDEX IF NOT EXISTS idx_bc_tx_hash
    ON public.blockchain_transactions(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_bc_tx_nullifier
    ON public.blockchain_transactions(nullifier_hash);


-- ==============================================================================
-- AUTOMATIC USER REGISTRATION TRIGGER
-- auth.users -> public.users
--
-- Whenever a new Supabase Auth user is created, a corresponding
-- public.users profile is automatically created.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()

RETURNS TRIGGER AS $$

BEGIN

    INSERT INTO public.users (
        id,
        email,
        full_name,
        voter_id,
        role,
        status
    )

    VALUES (
        NEW.id,

        NEW.email,

        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),

        COALESCE(
            NEW.raw_user_meta_data->>'voter_id',
            'VTR-' || floor(10000 + random() * 90000)::text
        ),

        COALESCE(
            NEW.raw_user_meta_data->>'role',
            'voter'
        ),

        'Eligible to vote'
    )

    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    RETURN NEW;

END;

$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;


-- ==============================================================================
-- AUTH USER CREATION TRIGGER
-- ==============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created

    AFTER INSERT ON auth.users

    FOR EACH ROW

    EXECUTE FUNCTION public.handle_new_user();
