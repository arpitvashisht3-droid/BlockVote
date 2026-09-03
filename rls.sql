-- ==============================================================================
-- BLOCKVOTE ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Access Control & Privacy Protection
-- ==============================================================================


-- ==============================================================================
-- 0. HELPER FUNCTION
-- Checks whether the currently authenticated user is an administrator.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()

RETURNS BOOLEAN AS $$

BEGIN

    RETURN EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'admin'
    );

END;

$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;


-- ==============================================================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.election_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.voter_eligibility ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.voter_participation ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 1. POLICIES FOR public.users
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SELECT
-- A user can see only their own profile.
-- Admins can see all profiles.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile or admins view all"
ON public.users;

CREATE POLICY "Users can view own profile or admins view all"

ON public.users

FOR SELECT

USING (
    auth.uid() = id
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
--
-- IMPORTANT:
-- Voters are NOT allowed to modify their role, voter_id, status, etc.
-- Therefore ordinary voters do not receive a general UPDATE policy.
--
-- Admins can update user profiles.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update own profile"
ON public.users;

DROP POLICY IF EXISTS "Admins can update user profiles"
ON public.users;

CREATE POLICY "Admins can update user profiles"

ON public.users

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
--
-- public.users rows are normally created automatically by the
-- auth.users -> public.users trigger.
--
-- No normal client INSERT policy is provided.
-- ------------------------------------------------------------------------------


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete profiles.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete user profiles"
ON public.users;

CREATE POLICY "Admins can delete user profiles"

ON public.users

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 2. POLICIES FOR public.elections
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- Public/authenticated users can view published, non-archived elections.
-- Admins can view all elections.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view published elections"
ON public.elections;

CREATE POLICY "Public can view published elections"

ON public.elections

FOR SELECT

USING (
    (
        published = true
        AND archived = false
    )
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
-- Only admins can create elections.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can insert elections"
ON public.elections;

CREATE POLICY "Admins can insert elections"

ON public.elections

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Only admins can modify elections.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can update elections"
ON public.elections;

CREATE POLICY "Admins can update elections"

ON public.elections

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete elections.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete elections"
ON public.elections;

CREATE POLICY "Admins can delete elections"

ON public.elections

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 3. POLICIES FOR public.candidates
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- Public/authenticated users can view candidates belonging to published
-- and non-archived elections.
-- Admins can view all candidates.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view candidates for published elections"
ON public.candidates;

CREATE POLICY "Public can view candidates for published elections"

ON public.candidates

FOR SELECT

USING (
    EXISTS (
        SELECT 1
        FROM public.elections
        WHERE id = candidates.election_id
          AND published = true
          AND archived = false
    )
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
-- Only admins can create candidates.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can insert candidates"
ON public.candidates;

CREATE POLICY "Admins can insert candidates"

ON public.candidates

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Only admins can modify candidates.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can update candidates"
ON public.candidates;

CREATE POLICY "Admins can update candidates"

ON public.candidates

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete candidates.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete candidates"
ON public.candidates;

CREATE POLICY "Admins can delete candidates"

ON public.candidates

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 4. POLICIES FOR public.election_settings
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- Public/authenticated users can view settings for published elections.
-- Admins can view all settings.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view settings for published elections"
ON public.election_settings;

CREATE POLICY "Public can view settings for published elections"

ON public.election_settings

FOR SELECT

USING (
    EXISTS (
        SELECT 1
        FROM public.elections
        WHERE id = election_settings.election_id
          AND published = true
          AND archived = false
    )
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
-- Only admins can create election settings.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can insert election settings"
ON public.election_settings;

CREATE POLICY "Admins can insert election settings"

ON public.election_settings

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Only admins can update election settings.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can update election settings"
ON public.election_settings;

CREATE POLICY "Admins can update election settings"

ON public.election_settings

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete election settings.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete election settings"
ON public.election_settings;

CREATE POLICY "Admins can delete election settings"

ON public.election_settings

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 5. POLICIES FOR public.voter_eligibility
--
-- PRIVACY RULE:
-- A voter can see only their own identity commitment.
--
-- Other voters' identity commitments are protected.
--
-- Admins can manage eligibility records for Merkle-tree registration.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Voters view own commitment or admin views all"
ON public.voter_eligibility;

CREATE POLICY "Voters view own commitment or admin views all"

ON public.voter_eligibility

FOR SELECT

USING (
    user_id = auth.uid()
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
-- Only admins can register identity commitments.
--
-- The voter/browser should generate the commitment locally.
-- The database should never receive IdentitySecret or NullifierSecret.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins insert voter eligibility"
ON public.voter_eligibility;

CREATE POLICY "Admins insert voter eligibility"

ON public.voter_eligibility

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Only admins can modify eligibility records.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins update voter eligibility"
ON public.voter_eligibility;

CREATE POLICY "Admins update voter eligibility"

ON public.voter_eligibility

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete eligibility records.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins delete voter eligibility"
ON public.voter_eligibility;

CREATE POLICY "Admins delete voter eligibility"

ON public.voter_eligibility

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 6. POLICIES FOR public.voter_participation
--
-- PRIVACY RULE:
--
-- This table contains:
--     election_id
--     voter_id
--     has_voted
--
-- It deliberately contains NO:
--     candidate_id
--     transaction_hash
--     nullifier_hash
--     voted_at
--
-- Voters can see only their own participation status.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Voters view own participation or admin views turnout"
ON public.voter_participation;

CREATE POLICY "Voters view own participation or admin views turnout"

ON public.voter_participation

FOR SELECT

USING (
    voter_id = auth.uid()
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
--
-- IMPORTANT:
-- We do NOT allow arbitrary voters to insert participation records.
--
-- The future backend/relayer flow should create the participation record
-- after a valid vote has been verified.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Voters insert own participation record"
ON public.voter_participation;

DROP POLICY IF EXISTS "Admins insert participation records"
ON public.voter_participation;

CREATE POLICY "Admins insert participation records"

ON public.voter_participation

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Participation state should be controlled by trusted backend/admin logic.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins update participation records"
ON public.voter_participation;

CREATE POLICY "Admins update participation records"

ON public.voter_participation

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
-- Only admins can delete participation records.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins delete participation records"
ON public.voter_participation;

CREATE POLICY "Admins delete participation records"

ON public.voter_participation

FOR DELETE

USING (
    public.is_admin()
);


-- ==============================================================================
-- 7. POLICIES FOR public.blockchain_transactions
--
-- PRIVACY RULE:
--
-- This table contains:
--     election_id
--     candidate_id
--     nullifier_hash
--     transaction_hash
--     block_number
--     status
--     confirmations
--
-- It deliberately contains NO:
--     voter_id
--     user_id
--     wallet_address
--
-- Public verification is allowed for published elections.
-- Transaction insertion is restricted to trusted admin/relayer logic.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- SELECT
-- Public/authenticated users can view blockchain verification records
-- belonging to published elections.
-- Admins can view all records.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public view transactions for published elections"
ON public.blockchain_transactions;

CREATE POLICY "Public view transactions for published elections"

ON public.blockchain_transactions

FOR SELECT

USING (
    EXISTS (
        SELECT 1
        FROM public.elections
        WHERE id = blockchain_transactions.election_id
          AND published = true
          AND archived = false
    )
    OR public.is_admin()
);


-- ------------------------------------------------------------------------------
-- INSERT
--
-- IMPORTANT:
-- Do NOT allow every authenticated user to insert blockchain transactions.
--
-- Otherwise a voter could fabricate:
--     candidate_id
--     nullifier_hash
--     transaction_hash
--
-- Transaction records should be inserted by trusted backend/relayer/service
-- credentials or admin-controlled server-side code.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users or relayers insert transaction records"
ON public.blockchain_transactions;

DROP POLICY IF EXISTS "Admins insert transaction records"
ON public.blockchain_transactions;

CREATE POLICY "Admins insert transaction records"

ON public.blockchain_transactions

FOR INSERT

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- UPDATE
-- Only admins can update blockchain transaction records.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins update transaction status"
ON public.blockchain_transactions;

CREATE POLICY "Admins update transaction status"

ON public.blockchain_transactions

FOR UPDATE

USING (
    public.is_admin()
)

WITH CHECK (
    public.is_admin()
);


-- ------------------------------------------------------------------------------
-- DELETE
--
-- Blockchain transaction records are audit/verification records.
-- Only admins can delete them.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins delete transaction records"
ON public.blockchain_transactions;

CREATE POLICY "Admins delete transaction records"

ON public.blockchain_transactions

FOR DELETE

USING (
    public.is_admin()
);
