BEGIN;

ALTER TABLE public."authInfo"
    ALTER COLUMN "authId" DROP NOT NULL,
    ALTER COLUMN "displayName" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "authInfo_email_normalized_key"
    ON public."authInfo" (lower(btrim("email")));

CREATE TABLE IF NOT EXISTS public."magicLinkTokens" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "tokenDigest" text NOT NULL,
    "subjectEmail" text NOT NULL,
    "client" text NOT NULL,
    "intent" text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "usedAt" timestamp with time zone,
    CONSTRAINT "magicLinkTokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "magicLinkTokens_tokenDigest_key" UNIQUE ("tokenDigest"),
    CONSTRAINT "magicLinkTokens_client_check" CHECK ("client" IN ('web', 'mobile')),
    CONSTRAINT "magicLinkTokens_intent_check" CHECK ("intent" IN ('registration', 'login', 'resume-book'))
);

CREATE INDEX IF NOT EXISTS "magicLinkTokens_subjectEmail_idx"
    ON public."magicLinkTokens" (lower(btrim("subjectEmail")));
CREATE INDEX IF NOT EXISTS "magicLinkTokens_expiresAt_idx"
    ON public."magicLinkTokens" ("expiresAt");

ALTER TABLE public."authInfo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."authRoles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."authCodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."magicLinkTokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."corporate" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."authInfo" FROM anon, authenticated;
REVOKE ALL ON TABLE public."authRoles" FROM anon, authenticated;
REVOKE ALL ON TABLE public."authCodes" FROM anon, authenticated;
REVOKE ALL ON TABLE public."magicLinkTokens" FROM anon, authenticated;
REVOKE ALL ON TABLE public."corporate" FROM anon, authenticated;

GRANT ALL ON TABLE public."authInfo" TO service_role;
GRANT ALL ON TABLE public."authRoles" TO service_role;
GRANT ALL ON TABLE public."authCodes" TO service_role;
GRANT ALL ON TABLE public."magicLinkTokens" TO service_role;
GRANT ALL ON TABLE public."corporate" TO service_role;

CREATE OR REPLACE FUNCTION public.consume_magic_link_token(
    p_token_digest text,
    p_client text
)
RETURNS TABLE (
    "subjectEmail" text,
    "client" text,
    "intent" text
) AS $$
BEGIN
    RETURN QUERY
    UPDATE public."magicLinkTokens" AS token
    SET "usedAt" = now()
    WHERE token."tokenDigest" = p_token_digest
      AND token."client" = p_client
      AND token."usedAt" IS NULL
      AND token."expiresAt" > now()
    RETURNING token."subjectEmail", token."client", token."intent";
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_or_create_magic_link_account(
    p_email text
)
RETURNS TABLE (
    "userId" character varying,
    "email" text,
    "displayName" text
) AS $$
DECLARE
    normalized_email text := lower(btrim(p_email));
BEGIN
    RETURN QUERY
    SELECT info."userId", info."email", info."displayName"
    FROM public."authInfo" AS info
    WHERE lower(btrim(info."email")) = normalized_email;

    IF FOUND THEN
        RETURN;
    END IF;

    BEGIN
        RETURN QUERY
        INSERT INTO public."authInfo" ("userId", "authId", "email", "displayName")
        VALUES (gen_random_uuid()::text, NULL, normalized_email, NULL)
        RETURNING "authInfo"."userId", "authInfo"."email", "authInfo"."displayName";
    EXCEPTION WHEN unique_violation THEN
        RETURN QUERY
        SELECT info."userId", info."email", info."displayName"
        FROM public."authInfo" AS info
        WHERE lower(btrim(info."email")) = normalized_email;
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.complete_magic_link_registration(
    p_user_id character varying,
    p_email text,
    p_registration jsonb,
    p_mailing_list text
)
RETURNS character varying AS $$
DECLARE
    normalized_email text := lower(btrim(p_email));
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public."authInfo"
        WHERE "userId" = p_user_id
          AND lower(btrim("email")) = normalized_email
    ) THEN
        RAISE EXCEPTION 'InvalidRegistrationIdentity';
    END IF;

    UPDATE public."authInfo"
    SET "displayName" = p_registration->>'name',
        "email" = normalized_email
    WHERE "userId" = p_user_id;

    INSERT INTO public."registrations" (
        "allergies",
        "dietaryRestrictions",
        "educationLevel",
        "email",
        "ethnicity",
        "gender",
        "graduationYear",
        "howDidYouHear",
        "majors",
        "minors",
        "name",
        "opportunities",
        "personalLinks",
        "school",
        "isInterestedMechMania",
        "isInterestedPuzzleBang",
        "tags",
        "hasResume",
        "userId"
    )
    VALUES (
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'allergies')),
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'dietaryRestrictions')),
        p_registration->>'educationLevel',
        normalized_email,
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'ethnicity')),
        p_registration->>'gender',
        p_registration->>'graduationYear',
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'howDidYouHear')),
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'majors')),
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'minors')),
        p_registration->>'name',
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'opportunities')),
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'personalLinks')),
        p_registration->>'school',
        (p_registration->>'isInterestedMechMania')::boolean,
        (p_registration->>'isInterestedPuzzleBang')::boolean,
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'tags')),
        (p_registration->>'hasResume')::boolean,
        p_user_id
    )
    ON CONFLICT ("userId") DO UPDATE SET
        "allergies" = EXCLUDED."allergies",
        "dietaryRestrictions" = EXCLUDED."dietaryRestrictions",
        "educationLevel" = EXCLUDED."educationLevel",
        "email" = EXCLUDED."email",
        "ethnicity" = EXCLUDED."ethnicity",
        "gender" = EXCLUDED."gender",
        "graduationYear" = EXCLUDED."graduationYear",
        "howDidYouHear" = EXCLUDED."howDidYouHear",
        "majors" = EXCLUDED."majors",
        "minors" = EXCLUDED."minors",
        "name" = EXCLUDED."name",
        "opportunities" = EXCLUDED."opportunities",
        "personalLinks" = EXCLUDED."personalLinks",
        "school" = EXCLUDED."school",
        "isInterestedMechMania" = EXCLUDED."isInterestedMechMania",
        "isInterestedPuzzleBang" = EXCLUDED."isInterestedPuzzleBang",
        "tags" = EXCLUDED."tags",
        "hasResume" = EXCLUDED."hasResume";

    INSERT INTO public."attendees" ("userId", "tags")
    VALUES (
        p_user_id,
        ARRAY(SELECT jsonb_array_elements_text(p_registration->'tags'))
    )
    ON CONFLICT ("userId") DO UPDATE SET "tags" = EXCLUDED."tags";

    INSERT INTO public."authRoles" ("userId", "role")
    VALUES (p_user_id, 'USER')
    ON CONFLICT ("userId", "role") DO NOTHING;

    INSERT INTO public."mailingLists" ("listName", "email")
    VALUES (p_mailing_list, normalized_email)
    ON CONFLICT ("listName", "email") DO NOTHING;

    DELETE FROM public."draftRegistrations"
    WHERE "userId" = p_user_id;

    RETURN p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.consume_auth_code(
    p_email text,
    p_stored_hash text
)
RETURNS boolean AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public."authCodes"
    WHERE lower(btrim("email")) = lower(btrim(p_email))
      AND "hashedVerificationCode" = p_stored_hash
      AND "expTime" > now();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count = 1;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.consume_magic_link_token(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_magic_link_account(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_magic_link_registration(character varying, text, jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_auth_code(text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_magic_link_token(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_magic_link_account(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_magic_link_registration(character varying, text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_auth_code(text, text) TO service_role;

COMMIT;
