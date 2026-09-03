-- ==============================================================================
-- BLOCKVOTE DATABASE SEED DATA
-- Supabase Portable Seed
-- Synchronized with Frontend & Backend Test Data Structures
-- ==============================================================================


-- ==============================================================================
-- 1. SAFE AUTH USERS INSERTION
-- auth.users -> public.users
--
-- Deterministic UUIDs are used so the seed can be reproduced in local
-- Supabase / CLI environments.
--
-- The handle_new_user() trigger defined in schema.sql automatically creates
-- the corresponding public.users profile.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- Test Admin Account
-- ------------------------------------------------------------------------------

INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001',

    '00000000-0000-0000-0000-000000000000',

    'authenticated',

    'authenticated',

    'admin@blockvote.io',

    '$2a$10$wT8z7jO6u2Z4d0aE7v6n.O.GgX4iJ5.g9/zR5.X1y0.K8aE1e4g.',

    NOW(),

    '{"provider":"email","providers":["email"]}',

    '{
        "full_name":"Admin User",
        "role":"admin",
        "voter_id":"VTR-00001"
    }',

    false,

    NOW(),

    NOW()
)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- Test Voter Account
-- ------------------------------------------------------------------------------

INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000002',

    '00000000-0000-0000-0000-000000000000',

    'authenticated',

    'authenticated',

    'voter@blockvote.io',

    '$2a$10$wT8z7jO6u2Z4d0aE7v6n.O.GgX4iJ5.g9/zR5.X1y0.K8aE1e4g.',

    NOW(),

    '{"provider":"email","providers":["email"]}',

    '{
        "full_name":"Parth Sharma",
        "role":"voter",
        "voter_id":"VTR-84291"
    }',

    false,

    NOW(),

    NOW()
)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 2. ELECTIONS SEED DATA
-- ==============================================================================

INSERT INTO public.elections (
    id,
    slug,
    election_code,
    title,
    description,
    details_description,
    organization,
    election_type,
    status,
    start_date,
    end_date,
    published,
    paused,
    archived,
    thumbnail_icon,
    thumbnail_tone,
    onchain_id,
    created_by
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',

    'student-council-2024',

    'BLC-2024-001',

    'Student Council Election 2024',

    'Vote for your student council representatives.',

    'Choose your representatives for the student council who will shape your campus experience.',

    'ABC University',

    'Student Election',

    'live',

    '2024-05-20 09:00:00+00',

    '2024-05-25 21:00:00+00',

    true,

    false,

    false,

    'landmark',

    'navy',

    0,

    '00000000-0000-0000-0000-000000000001'
),

(
    '22222222-2222-2222-2222-222222222222',

    'tech-club-president',

    'BLC-2024-002',

    'Tech Club President Election',

    'Choose the next president of the Tech Club.',

    'Select the next Tech Club president to lead workshops, hackathons, and campus tech initiatives.',

    'Campus Tech Club',

    'Organization Election',

    'upcoming',

    '2026-09-14 09:00:00+00',

    '2026-09-16 21:00:00+00',

    true,

    false,

    false,

    'cpu',

    'teal',

    1,

    '00000000-0000-0000-0000-000000000001'
),

(
    '33333333-3333-3333-3333-333333333333',

    'cultural-fest-committee',

    'BLC-2024-003',

    'Cultural Fest Committee',

    'Elect representatives for the Cultural Fest Committee.',

    'Elect the committee that will plan performances, stalls, and guest events for this year’s cultural fest.',

    'Cultural Committee',

    'Committee Election',

    'ended',

    '2024-05-06 09:00:00+00',

    '2024-05-10 21:00:00+00',

    true,

    false,

    false,

    'music',

    'indigo',

    2,

    '00000000-0000-0000-0000-000000000001'
),

(
    '44444444-4444-4444-4444-444444444444',

    'academic-council',

    'BLC-2024-004',

    'Academic Council Election',

    'Select faculty and student voices for the Academic Council.',

    'Choose student representatives who will sit on the Academic Council and speak for coursework, calendars, and campus policy.',

    'Academic Council',

    'General Election',

    'ended',

    '2024-03-28 09:00:00+00',

    '2024-04-02 21:00:00+00',

    true,

    false,

    false,

    'graduation',

    'slate',

    3,

    '00000000-0000-0000-0000-000000000001'
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 3. ELECTION SETTINGS SEED DATA
-- ==============================================================================

INSERT INTO public.election_settings (
    election_id,
    method,
    votes_per_voter,
    anonymous_voting,
    require_wallet,
    allow_vote_changes,
    show_live_results,
    visibility,
    require_voter_verification,
    enable_blockchain_verification
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',
    'Single Choice',
    1,
    true,
    true,
    false,
    true,
    'Public',
    true,
    true
),

(
    '22222222-2222-2222-2222-222222222222',
    'Single Choice',
    1,
    true,
    false,
    false,
    false,
    'Public',
    true,
    true
),

(
    '33333333-3333-3333-3333-333333333333',
    'Single Choice',
    1,
    true,
    true,
    false,
    true,
    'Public',
    true,
    true
),

(
    '44444444-4444-4444-4444-444444444444',
    'Single Choice',
    1,
    true,
    true,
    false,
    true,
    'Public',
    true,
    true
)

ON CONFLICT (election_id) DO NOTHING;


-- ==============================================================================
-- 4. CANDIDATES SEED DATA
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- Student Council Candidates
-- ------------------------------------------------------------------------------

INSERT INTO public.candidates (
    id,
    election_id,
    name,
    department,
    position,
    about,
    achievements,
    party,
    removed,
    onchain_id
)
VALUES

(
    'c1111111-1111-1111-1111-111111111111',

    '11111111-1111-1111-1111-111111111111',

    'Rahul Sharma',

    'Computer Science',

    'President',

    'A passionate leader with a vision to improve student life and academic environment.',

    ARRAY[
        'College Coding Champion 2023',
        'Organized Tech-Fest 2022',
        'IEEE Volunteer'
    ],

    'Progressive Student Alliance',

    false,

    0
),

(
    'c1111111-1111-1111-1111-111111111112',

    '11111111-1111-1111-1111-111111111111',

    'Aman Verma',

    'Electronics',

    'President',

    'Focused on better campus facilities, open labs, and practical learning.',

    ARRAY[
        'Robotics Club Lead 2023',
        'IoT Hackathon Winner',
        'Department Representative'
    ],

    'Innovators Unity',

    false,

    1
),

(
    'c1111111-1111-1111-1111-111111111113',

    '11111111-1111-1111-1111-111111111111',

    'Priya Singh',

    'Information Technology',

    'President',

    'Advocates for inclusive campus events, mental-health support, and fair grievance process.',

    ARRAY[
        'Student Outreach Coordinator',
        'Women in Tech mentor',
        'Cultural Fest volunteer lead'
    ],

    'Independent',

    false,

    2
)

ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- Tech Club Candidates
-- ------------------------------------------------------------------------------

INSERT INTO public.candidates (
    id,
    election_id,
    name,
    department,
    position,
    about,
    achievements,
    party,
    removed,
    onchain_id
)
VALUES

(
    'c2222222-2222-2222-2222-222222222221',

    '22222222-2222-2222-2222-222222222222',

    'Neha Kapoor',

    'Computer Science',

    'President',

    'Plans weekly build nights, beginner-friendly workshops, and industry mentorship.',

    ARRAY[
        'Club Workshop Lead',
        'Open-source contributor',
        'Smart India Hackathon finalist'
    ],

    'Tech Forum',

    false,

    0
),

(
    'c2222222-2222-2222-2222-222222222222',

    '22222222-2222-2222-2222-222222222222',

    'Arjun Mehta',

    'Information Technology',

    'Vice President',

    'Wants Tech Club to publish every decision and budget transparently on-chain.',

    ARRAY[
        'Campus Blockchain Group founder',
        'CTF team captain'
    ],

    'Open Source Alliance',

    false,

    1
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 5. VOTER ELIGIBILITY SEED DATA
-- Merkle Identity Commitments
--
-- IMPORTANT:
-- These are demonstration commitments only.
-- They are NOT real production voter secrets or production commitments.
-- ==============================================================================

INSERT INTO public.voter_eligibility (
    election_id,
    user_id,
    identity_commitment
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',

    '00000000-0000-0000-0000-000000000002',

    '0x7bc4e91a2d8f61c34e09b5a17c2d84f0a821f90d1a92e84c7f31d2b94c08a17e'
),

(
    '22222222-2222-2222-2222-222222222222',

    '00000000-0000-0000-0000-000000000002',

    '0x6a18f4c29d07e5b3c91a20d8f4e73b12c90d81a42e84b91c0d57a3f8e12c64b9'
)

ON CONFLICT (election_id, user_id) DO NOTHING;


-- ==============================================================================
-- 6. VOTER PARTICIPATION SEED DATA
--
-- NO:
--     candidate_id
--     transaction_hash
--     nullifier_hash
--     voted_at
--
-- This only demonstrates that the test voter has participated.
-- ==============================================================================

INSERT INTO public.voter_participation (
    election_id,
    voter_id,
    has_voted
)
VALUES (
    '11111111-1111-1111-1111-111111111111',

    '00000000-0000-0000-0000-000000000002',

    true
)

ON CONFLICT (election_id, voter_id) DO NOTHING;


-- ==============================================================================
-- 7. BLOCKCHAIN TRANSACTION SEED DATA
-- Anonymous / Decoupled Transaction Index
--
-- IMPORTANT:
-- These are demonstration blockchain records only.
-- They are not real blockchain transactions.
--
-- There is intentionally NO:
--     voter_id
--     user_id
--     wallet_address
-- ==============================================================================

INSERT INTO public.blockchain_transactions (
    election_id,
    candidate_id,
    tx_type,
    nullifier_hash,
    transaction_hash,
    block_number,
    status,
    confirmations
)
VALUES

(
    '11111111-1111-1111-1111-111111111111',

    'c1111111-1111-1111-1111-111111111111',

    'vote_cast',

    '0x9d21c8e04a77b19e771e7a9c4e21b8d03f91c4b8f31fe90ab62c17d4482ac123',

    '0x7a9c4e21b8d03f91c4b8f31fe90ab62c17d4482ac9d21c8e04a77b19e771e11a',

    18492731,

    'confirmed',

    214
),

(
    '11111111-1111-1111-1111-111111111111',

    'c1111111-1111-1111-1111-111111111112',

    'vote_cast',

    '0xb481a2f09c33d71cc90f5e20b91a4c33d80f19abc17d84e09a2b5f31d04e456',

    '0x31fe90ab62c17d4482ac9d21c8e04a77b19e771eb481a2f09c33d71cc90f789',

    18492731,

    'confirmed',

    214
)

ON CONFLICT (transaction_hash) DO NOTHING;
