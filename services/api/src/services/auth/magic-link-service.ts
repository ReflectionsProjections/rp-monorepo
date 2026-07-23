import { createHash, randomBytes } from "crypto";
import { Config } from "../../config";
import { SupabaseDB, supabase } from "../../database";
import { sendHTMLEmail } from "../ses/ses-utils";
import { Role } from "./auth-models";
import { generateJWT, generateSetupJWT, normalizeEmail } from "./auth-utils";
import { renderMagicLinkEmail } from "./magic-link-email";
import {
    MagicLinkClient,
    MagicLinkIntent,
    MagicLinkIssueRequest,
} from "./magic-link-schema";

type Account = {
    userId: string;
    email: string;
    displayName: string | null;
};

function digestToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function callbackFor(client: MagicLinkClient, intent: MagicLinkIntent): string {
    if (intent === "registration") {
        return Config.MAGIC_LINK_REGISTRATION_CALLBACK;
    }
    if (intent === "resume-book") {
        return Config.MAGIC_LINK_RESUME_BOOK_CALLBACK;
    }
    return client === "mobile"
        ? Config.MAGIC_LINK_MOBILE_LOGIN_CALLBACK
        : Config.MAGIC_LINK_WEB_LOGIN_CALLBACK;
}

async function findAccount(email: string): Promise<Account | null> {
    const { data } = await SupabaseDB.AUTH_INFO.select(
        "userId,email,displayName"
    )
        .eq("email", normalizeEmail(email))
        .maybeSingle()
        .throwOnError();
    return data;
}

async function rolesFor(userId: string): Promise<Role[]> {
    const { data } = await SupabaseDB.AUTH_ROLES.select("role")
        .eq("userId", userId)
        .throwOnError();
    return data.map((row) => row.role);
}

async function isEligible(request: MagicLinkIssueRequest): Promise<boolean> {
    if (
        request.client === "web" &&
        (request.intent === "registration" || request.intent === "login")
    ) {
        return true;
    }

    const account = await findAccount(request.email);
    if (!account) {
        return false;
    }
    const roles = await rolesFor(account.userId);
    if (request.client === "mobile" && request.intent === "login") {
        return roles.includes(Role.Enum.USER);
    }
    return (
        request.client === "web" &&
        request.intent === "resume-book" &&
        roles.includes(Role.Enum.CORPORATE)
    );
}

export async function issueMagicLink(
    request: MagicLinkIssueRequest
): Promise<void> {
    const normalizedRequest = {
        ...request,
        email: normalizeEmail(request.email),
    };
    if (!(await isEligible(normalizedRequest))) {
        return;
    }

    const token = randomBytes(32).toString("base64url");
    const tokenDigest = digestToken(token);
    await SupabaseDB.MAGIC_LINK_TOKENS.insert({
        tokenDigest,
        subjectEmail: normalizedRequest.email,
        client: normalizedRequest.client,
        intent: normalizedRequest.intent,
        expiresAt: new Date(
            Date.now() + Config.VERIFY_EXP_TIME_MS
        ).toISOString(),
    }).throwOnError();

    const callback = callbackFor(
        normalizedRequest.client,
        normalizedRequest.intent
    );
    const link = `${callback}?token=${encodeURIComponent(token)}`;
    try {
        await sendHTMLEmail(
            normalizedRequest.email,
            "Your Reflections | Projections sign-in link",
            renderMagicLinkEmail(link, normalizedRequest.intent)
        );
    } catch (error) {
        await SupabaseDB.MAGIC_LINK_TOKENS.delete()
            .eq("tokenDigest", tokenDigest)
            .throwOnError();
        throw error;
    }
}

async function getOrCreateAccount(email: string): Promise<Account> {
    const { data, error } = await supabase.rpc(
        "get_or_create_magic_link_account",
        { p_email: email }
    );
    if (error) {
        throw error;
    }
    const account = data.at(0);
    if (!account) {
        throw new Error("NoUserFound");
    }
    return account;
}

async function consumeToken(token: string, client: MagicLinkClient) {
    const { data, error } = await supabase.rpc("consume_magic_link_token", {
        p_token_digest: digestToken(token),
        p_client: client,
    });
    if (error) {
        throw error;
    }
    return data.at(0) ?? null;
}

export async function verifyMagicLink(
    token: string,
    client: MagicLinkClient
): Promise<string | null> {
    const consumed = await consumeToken(token, client);
    if (!consumed) {
        return null;
    }

    const email = normalizeEmail(consumed.subjectEmail);
    let account: Account | null;
    if (
        consumed.intent === "registration" ||
        (consumed.intent === "login" && client === "web")
    ) {
        account = await getOrCreateAccount(email);
    } else {
        account = await findAccount(email);
    }
    if (!account) {
        return null;
    }

    const roles = await rolesFor(account.userId);
    if (
        consumed.intent === "login" &&
        client === "mobile" &&
        !roles.includes(Role.Enum.USER)
    ) {
        return null;
    }
    if (
        consumed.intent === "resume-book" &&
        !roles.includes(Role.Enum.CORPORATE)
    ) {
        return null;
    }

    if (roles.length === 0) {
        return generateSetupJWT(account.userId);
    }
    return generateJWT(
        account.userId,
        client === "mobile"
            ? Config.MOBILE_JWT_EXPIRATION_TIME
            : Config.JWT_EXPIRATION_TIME
    );
}

export const magicLinkTokenDigestForTest = digestToken;
