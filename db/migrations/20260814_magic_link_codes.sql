BEGIN;

ALTER TABLE public."magicLinkTokens"
    ADD COLUMN IF NOT EXISTS "codeDigest" text,
    ADD COLUMN IF NOT EXISTS "attemptCount" integer DEFAULT 0 NOT NULL;

-- Consume a sign-in code for the newest live token of an email address. A
-- wrong code burns one attempt; a token with p_max_attempts failed attempts
-- can no longer be consumed by code (the magic link stays usable).
CREATE OR REPLACE FUNCTION public.consume_magic_link_code(
    p_email text,
    p_code_digest text,
    p_client text,
    p_max_attempts integer
)
RETURNS TABLE (
    "subjectEmail" text,
    "client" text,
    "intent" text
) AS $$
DECLARE
    live_id uuid;
    code_matches boolean;
BEGIN
    SELECT token."id",
           token."codeDigest" IS NOT NULL
               AND token."codeDigest" = p_code_digest
               AND token."client" = p_client
    INTO live_id, code_matches
    FROM public."magicLinkTokens" AS token
    WHERE lower(btrim(token."subjectEmail")) = lower(btrim(p_email))
      AND token."usedAt" IS NULL
      AND token."expiresAt" > now()
      AND token."attemptCount" < p_max_attempts
    ORDER BY token."createdAt" DESC
    LIMIT 1
    FOR UPDATE;

    IF live_id IS NULL THEN
        RETURN;
    END IF;

    IF code_matches THEN
        RETURN QUERY
        UPDATE public."magicLinkTokens" AS token
        SET "usedAt" = now()
        WHERE token."id" = live_id
        RETURNING token."subjectEmail", token."client", token."intent";
    ELSE
        UPDATE public."magicLinkTokens" AS token
        SET "attemptCount" = token."attemptCount" + 1
        WHERE token."id" = live_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.consume_magic_link_code(text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_magic_link_code(text, text, text, integer) TO service_role;

COMMIT;
